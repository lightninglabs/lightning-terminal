import { values } from 'mobx';
import * as AUCT from 'types/generated/auctioneer_pb';
import * as POOL from 'types/generated/trader_pb';
import { grpc } from '@improbable-eng/grpc-web';
import { waitFor } from '@testing-library/react';
import Big from 'big.js';
import { poolListOrders } from 'util/tests/sampleData';
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
});
