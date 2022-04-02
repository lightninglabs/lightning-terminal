import { values } from 'mobx';
import * as AUCT from 'types/generated/auctioneerrpc/auctioneer_pb';
import * as POOL from 'types/generated/trader_pb';
import { grpc } from '@improbable-eng/grpc-web';
import { waitFor } from '@testing-library/react';
import Big from 'big.js';
import { hex } from 'util/strings';
import { sampleGrpcResponse } from 'util/tests';
import { poolInvalidOrder, poolListOrders, poolSubmitOrder } from 'util/tests/sampleData';
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
    expect(rootStore.appView.alerts.size).toBe(0);
    await store.fetchOrders();
    await waitFor(() => {
      expect(rootStore.appView.alerts.size).toBe(1);
      expect(values(rootStore.appView.alerts)[0].message).toBe('test-err');
    });
  });

  it.each<[number, string]>([
    [AUCT.OrderState.ORDER_SUBMITTED, 'Submitted'],
    [AUCT.OrderState.ORDER_CLEARED, 'Cleared'],
    [AUCT.OrderState.ORDER_PARTIALLY_FILLED, 'Partially Filled'],
    [AUCT.OrderState.ORDER_EXECUTED, 'Filled'],
    [AUCT.OrderState.ORDER_CANCELED, 'Cancelled'],
    [AUCT.OrderState.ORDER_EXPIRED, 'Expired'],
    [AUCT.OrderState.ORDER_FAILED, 'Failed'],
    [-1, 'Unknown'],
  ])('should return the correct order state label', (state: number, label: string) => {
    const poolOrder = {
      ...(poolListOrders.asksList[0].details as POOL.Order.AsObject),
      state: state as any,
    };
    const order = new Order(rootStore);
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

  it('should submit an ask order', async () => {
    await rootStore.accountStore.fetchAccounts();
    const nonce = await store.submitOrder(
      OrderType.Ask,
      Big(100000),
      2000,
      2016,
      100000,
      253,
    );
    expect(nonce).toBe(hex(poolSubmitOrder.acceptedOrderNonce));
  });

  it('should submit a bid order', async () => {
    await rootStore.accountStore.fetchAccounts();
    const nonce = await store.submitOrder(
      OrderType.Bid,
      Big(100000),
      2000,
      2016,
      100000,
      253,
    );
    expect(nonce).toBe(hex(poolSubmitOrder.acceptedOrderNonce));
  });

  it('should handle invalid orders', async () => {
    await rootStore.accountStore.fetchAccounts();
    // handle the GetInfo call
    grpcMock.unary.mockImplementationOnce((desc, opts) => {
      opts.onEnd(sampleGrpcResponse(desc));
      return undefined as any;
    });
    // mock the SubmitOrder response
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
    await store.submitOrder(OrderType.Bid, Big(100000), 2000, 2016, 100000, 253);
    expect(rootStore.appView.alerts.size).toBe(1);
    expect(values(rootStore.appView.alerts)[0].message).toBe(poolInvalidOrder.failString);
  });

  it('should throw if the fixed rate rate is too low', async () => {
    await rootStore.accountStore.fetchAccounts();
    await store.submitOrder(OrderType.Bid, Big(100000), 0.9, 20000, 100000, 253);
    expect(rootStore.appView.alerts.size).toBe(1);
    expect(values(rootStore.appView.alerts)[0].message).toMatch(/The rate is too low.*/);
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
    expect(rootStore.appView.alerts.size).toBe(0);
    await store.cancelOrder(values(store.orders)[0].nonce);
    await waitFor(() => {
      expect(rootStore.appView.alerts.size).toBe(1);
      expect(values(rootStore.appView.alerts)[0].message).toBe('test-err');
    });
  });
});
