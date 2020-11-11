import {
  makeAutoObservable,
  observable,
  ObservableMap,
  runInAction,
  toJS,
  values,
} from 'mobx';
import * as POOL from 'types/generated/trader_pb';
import { hex } from 'util/strings';
import { Store } from 'store';
import { Order } from 'store/models';
import { OrderType } from 'store/models/order';

export default class OrderStore {
  private _store: Store;

  /** the collection of orders */
  orders: ObservableMap<string, Order> = observable.map();

  constructor(store: Store) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this._store = store;
  }

  /** all orders sorted by created date descending */
  get sortedOrders() {
    const { field, descending } = this._store.settingsStore.orderSort;
    const orders = values(this.orders)
      .slice()
      .sort((a, b) => Order.compare(a, b, field));

    return descending ? orders.reverse() : orders;
  }

  /** the list of orders for the currently active account */
  get accountOrders() {
    return this.sortedOrders.filter(
      o => o.traderKey === this._store.accountStore.activeTraderKey,
    );
  }

  /** the number of pending orders for the active account */
  get pendingOrdersCount() {
    return this.accountOrders.filter(o => o.isPending).length;
  }

  /**
   * queries the POOL api to fetch the list of orders and stores them
   * in the state
   */
  async fetchOrders() {
    this._store.log.info('fetching orders');

    try {
      const { asksList, bidsList } = await this._store.api.pool.listOrders();
      runInAction(() => {
        const serverIds: string[] = [];

        asksList.forEach(({ details, leaseDurationBlocks }) => {
          const poolOrder = details as POOL.Order.AsObject;
          // update existing orders or create new ones in state. using this
          // approach instead of overwriting the array will cause fewer state
          // mutations, resulting in better react rendering performance
          const nonce = hex(poolOrder.orderNonce);
          const order = this.orders.get(nonce) || new Order();
          order.update(poolOrder, OrderType.Ask, leaseDurationBlocks);
          this.orders.set(nonce, order);
          serverIds.push(nonce);
        });

        bidsList.forEach(({ details, leaseDurationBlocks }) => {
          const poolOrder = details as POOL.Order.AsObject;
          // update existing orders or create new ones in state. using this
          // approach instead of overwriting the array will cause fewer state
          // mutations, resulting in better react rendering performance
          const nonce = hex(poolOrder.orderNonce);
          const order = this.orders.get(nonce) || new Order();
          order.update(poolOrder, OrderType.Bid, leaseDurationBlocks);
          this.orders.set(nonce, order);
          serverIds.push(nonce);
        });

        // remove any orders in state that are not in the API response
        const localIds = Object.keys(this.orders);
        localIds
          .filter(id => !serverIds.includes(id))
          .forEach(id => this.orders.delete(id));

        this._store.log.info('updated orderStore.orders', toJS(this.orders));
      });
    } catch (error) {
      this._store.appView.handleError(error, 'Unable to fetch orders');
    }
  }

  /**
   * Submits an order to the market
   * @param type the type of order (bid or ask)
   * @param amount the amount of the order
   * @param rateFixed the per block fixed rate
   * @param duration the number of blocks to keep the channel open for
   * @param minUnitsMatch the minimum number of units required to match this order
   * @param maxBatchFeeRate the maximum batch fee rate to allowed as sats per vByte
   */
  async submitOrder(
    type: OrderType,
    amount: number,
    rateFixed: number,
    duration: number,
    minUnitsMatch: number,
    maxBatchFeeRate: number,
  ) {
    try {
      const traderKey = this._store.accountStore.activeAccount.traderKey;
      this._store.log.info(`submitting ${type} order for ${amount}sats`, {
        rateFixed,
        duration,
        minUnitsMatch,
        maxBatchFeeRate,
      });

      const { acceptedOrderNonce, invalidOrder } = await this._store.api.pool.submitOrder(
        traderKey,
        type,
        amount,
        rateFixed,
        duration,
        minUnitsMatch,
        maxBatchFeeRate,
      );

      // fetch all orders to update the store's state
      await this.fetchOrders();
      // also update account balances in the store
      await this._store.accountStore.fetchAccounts();

      if (invalidOrder) {
        this._store.log.error('invalid order', invalidOrder);
        throw new Error(invalidOrder.failString);
      }

      return hex(acceptedOrderNonce);
    } catch (error) {
      this._store.appView.handleError(error, 'Unable to submit the order');
    }
  }

  /**
   * Cancels a pending order
   * @param nonce the order's nonce value
   */
  async cancelOrder(nonce: string) {
    try {
      const traderKey = this._store.accountStore.activeAccount.traderKey;
      this._store.log.info(`cancelling order with nonce ${nonce} for ${traderKey}`);

      await this._store.api.pool.cancelOrder(nonce);

      // fetch all orders to update the store's state
      await this.fetchOrders();
      // also update account balances in the store
      await this._store.accountStore.fetchAccounts();
    } catch (error) {
      this._store.appView.handleError(error, 'Unable to cancel the order');
    }
  }

  /**
   * Cancels all open orders for the active account
   */
  async cancelAllOrders() {
    const traderKey = this._store.accountStore.activeAccount.traderKey;
    this._store.log.info(`cancelling all pending orders for ${traderKey}`);
    const orders = this.accountOrders.filter(o => o.isPending);
    for (const order of orders) {
      this._store.log.info(`cancelling order with nonce ${order.nonce} for ${traderKey}`);
      await this._store.api.pool.cancelOrder(order.nonce);
    }
    // fetch all orders to update the store's state
    await this.fetchOrders();
    // also update account balances in the store
    await this._store.accountStore.fetchAccounts();
  }
}
