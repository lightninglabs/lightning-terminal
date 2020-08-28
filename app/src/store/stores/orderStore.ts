import { action, observable, ObservableMap, runInAction, toJS } from 'mobx';
import { hex } from 'util/strings';
import { Store } from 'store';
import { Order } from 'store/models';
import { OrderType } from 'store/models/order';

export default class OrderStore {
  private _store: Store;

  /** the collection of orders */
  @observable orders: ObservableMap<string, Order> = observable.map();

  constructor(store: Store) {
    this._store = store;
  }

  /**
   * queries the POOL api to fetch the list of orders and stores them
   * in the state
   */
  @action.bound
  async fetchOrders() {
    this._store.log.info('fetching orders');

    try {
      const { asksList, bidsList } = await this._store.api.pool.listOrders();
      runInAction('fetchOrdersContinuation', () => {
        const serverIds: string[] = [];

        asksList.forEach(({ details: poolOrder, maxDurationBlocks }) => {
          if (!poolOrder) return;
          // update existing orders or create new ones in state. using this
          // approach instead of overwriting the array will cause fewer state
          // mutations, resulting in better react rendering performance
          const nonce = hex(poolOrder.orderNonce);
          const order = this.orders.get(nonce) || new Order();
          order.update(poolOrder, OrderType.Ask, maxDurationBlocks);
          this.orders.set(nonce, order);
          serverIds.push(nonce);
        });

        bidsList.forEach(({ details: poolOrder, minDurationBlocks }) => {
          if (!poolOrder) return;
          // update existing orders or create new ones in state. using this
          // approach instead of overwriting the array will cause fewer state
          // mutations, resulting in better react rendering performance
          const nonce = hex(poolOrder.orderNonce);
          const order = this.orders.get(nonce) || new Order();
          order.update(poolOrder, OrderType.Bid, minDurationBlocks);
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
      this._store.uiStore.handleError(error, 'Unable to fetch Orders');
    }
  }
}
