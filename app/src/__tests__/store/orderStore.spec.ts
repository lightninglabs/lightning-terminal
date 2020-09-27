import { values } from 'mobx';
import * as AUCT from 'types/generated/auctioneer_pb';
import * as POOL from 'types/generated/trader_pb';
import { grpc } from '@improbable-eng/grpc-web';
import { waitFor } from '@testing-library/react';
import Big from 'big.js';
import { hex } from 'util/strings';
import { injectIntoGrpcUnary } from 'util/tests';
import {
  poolInvalidOrder,
  poolListAccounts,
  poolListOrders,
  poolSubmitOrder,
} from 'util/tests/sampleData';
import { createStore, OrderStore, Store } from 'store';
import { Order } from 'store/models';
import { OrderType } from 'store/models/order';

const grpcMock = grpc as jest.Mocked<typeof grpc>;

describe('OrderStore', () => {
  let rootStore: Store;
  let store: OrderStore;

  beforeEach(() => {
    rootStore = createStore();
    store = rootStore.orderStore;
  });

  it('should list orders', async () => {
    expect(store.orders.size).toBe(0);
    await store.fetchOrders();
    const count = poolListOrders.asksList.length + poolListOrders.bidsList.length;
    expect(store.orders.size).toBe(count);
  });

  it('should handle errors fetching orders', async () => {
    grpcMock.unary.mockImplementationOnce(() => {
      throw new Error('test-err');
    });
    expect(rootStore.uiStore.alerts.size).toBe(0);
    await store.fetchOrders();
    await waitFor(() => {
      expect(rootStore.uiStore.alerts.size).toBe(1);
      expect(values(rootStore.uiStore.alerts)[0].message).toBe('test-err');
    });
  });

  it.each<[number, string]>([
    [AUCT.OrderState.ORDER_SUBMITTED, 'Submitted'],
    [AUCT.OrderState.ORDER_CLEARED, 'Cleared'],
    [AUCT.OrderState.ORDER_PARTIALLY_FILLED, 'Partially Filled'],
    [AUCT.OrderState.ORDER_EXECUTED, 'Executed'],
    [AUCT.OrderState.ORDER_CANCELED, 'Cancelled'],
    [AUCT.OrderState.ORDER_EXPIRED, 'Expired'],
    [AUCT.OrderState.ORDER_FAILED, 'Failed'],
    [-1, 'Unknown'],
  ])('should return the correct order state label', (state: number, label: string) => {
    const poolOrder = {
      ...(poolListOrders.asksList[0].details as POOL.Order.AsObject),
      state: state as any,
    };
    const order = new Order();
    order.update(poolOrder, OrderType.Ask, 2016);
    expect(order.stateLabel).toBe(label);
  });

  it('should update existing orders with the same nonce', async () => {
    expect(store.orders.size).toEqual(0);
    await store.fetchOrders();
    expect(store.orders.size).toBeGreaterThan(0);
    const prevOrder = values(store.orders).slice()[0];
    const prevAmount = +prevOrder.amount;
    prevOrder.amount = Big(123);
    await store.fetchOrders();
    const updatedOrder = values(store.orders).slice()[0];
    // the existing order should be updated
    expect(prevOrder).toBe(updatedOrder);
    expect(+updatedOrder.amount).toEqual(prevAmount);
  });

  it('should return a list of orders for the active account', async () => {
    await rootStore.accountStore.fetchAccounts();
    const account3 = hex(poolListAccounts.accountsList[2].traderKey);
    rootStore.accountStore.setActiveTraderKey(account3);

    await store.fetchOrders();
    expect(store.accountOrders.length).toBeLessThan(store.orders.size);
  });

  it('should submit an ask order', async () => {
    await rootStore.accountStore.fetchAccounts();
    const nonce = await store.submitOrder(OrderType.Ask, 100000, 2, 2016, 253);
    expect(nonce).toBe(hex(poolSubmitOrder.acceptedOrderNonce));
  });

  it('should submit a bid order', async () => {
    await rootStore.accountStore.fetchAccounts();
    const nonce = await store.submitOrder(OrderType.Bid, 100000, 2, 2016, 253);
    expect(nonce).toBe(hex(poolSubmitOrder.acceptedOrderNonce));
  });

  it('should handle invalid orders', async () => {
    await rootStore.accountStore.fetchAccounts();
    grpcMock.unary.mockImplementationOnce((desc, opts) => {
      if (desc.methodName === 'SubmitOrder') {
        const res = {
          ...poolSubmitOrder,
          invalidOrder: poolInvalidOrder,
        };
        opts.onEnd({
          status: grpc.Code.OK,
          message: { toObject: () => res },
        } as any);
      }
      return undefined as any;
    });
    await store.submitOrder(OrderType.Bid, 100000, 2, 2016, 253);
    expect(rootStore.uiStore.alerts.size).toBe(1);
    expect(values(rootStore.uiStore.alerts)[0].message).toBe(poolInvalidOrder.failString);
  });

  it.each<[number, number, number]>([
    [2, 2016, 9920],
    [1, 2016, 4960],
    [1, 4000, 2500],
  ])(
    'should convert from interest percent to per block fixed rate correctly',
    async (ratePct: number, duration: number, expectedRateFixed: number) => {
      await rootStore.accountStore.fetchAccounts();

      let actualRate;
      // capture the rate that is sent to the API
      injectIntoGrpcUnary((_, props) => {
        actualRate = (props.request.toObject() as any).bid.details.rateFixed;
      });

      await store.submitOrder(OrderType.Bid, 10000000, ratePct, duration, 253);
      expect(actualRate).toBe(expectedRateFixed);
    },
  );

  it('should throw if the interest rate percent is too low', async () => {
    await rootStore.accountStore.fetchAccounts();
    await store.submitOrder(OrderType.Bid, 100000, 0.001, 20000, 253);
    expect(rootStore.uiStore.alerts.size).toBe(1);
    expect(values(rootStore.uiStore.alerts)[0].message).toMatch(/The rate is too low.*/);
  });

  it('should cancel an order', async () => {
    await rootStore.accountStore.fetchAccounts();
    await store.fetchOrders();
    await store.cancelOrder(values(store.orders)[0].nonce);
    expect(grpcMock.unary).toBeCalledWith(
      expect.objectContaining({ methodName: 'CancelOrder' }),
      expect.anything(),
    );
  });

  it('should handle errors cancelling an order', async () => {
    await rootStore.accountStore.fetchAccounts();
    await store.fetchOrders();
    grpcMock.unary.mockImplementationOnce(() => {
      throw new Error('test-err');
    });
    expect(rootStore.uiStore.alerts.size).toBe(0);
    await store.cancelOrder(values(store.orders)[0].nonce);
    await waitFor(() => {
      expect(rootStore.uiStore.alerts.size).toBe(1);
      expect(values(rootStore.uiStore.alerts)[0].message).toBe('test-err');
    });
  });
});
