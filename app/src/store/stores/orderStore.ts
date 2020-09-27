import {
  action,
  computed,
  observable,
  ObservableMap,
  runInAction,
  toJS,
  values,
} from 'mobx';
import Big from 'big.js';
import { hex } from 'util/strings';
import { FEE_RATE_TOTAL_PARTS } from 'api/pool';
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

  /** the list of orders for the currently active account */
  @computed
  get accountOrders() {
    return values(this.orders)
      .slice()
      .filter(o => o.traderKey === this._store.accountStore.activeTraderKey);
  }

  /** the number of pending orders for the active account */
  @computed
  get pendingOrdersCount() {
    return this.accountOrders.filter(o => o.isPending).length;
  }

  /** the amount of funds currently allocated to pending orders for the active account */
  @computed
  get pendingOrdersAmount() {
    return this.accountOrders
      .filter(o => o.isPending)
      .reduce((sum, o) => {
        if (o.type === OrderType.Ask) {
          return sum.add(o.amount);
        } else {
          // to calculate the cost of a pending bid, we need to reverse calc
          // the APY from the fixed rate per block.
          const totalParts = Big(FEE_RATE_TOTAL_PARTS);
          const ratePct = Big(o.rateFixed).div(totalParts).mul(o.duration);
          // then multiply the APY by the order amount
          const premium = ratePct.mul(o.amount);
          // also add on the amount reserved for onchain fees
          return sum.add(premium).add(o.reserved);
        }
      }, Big(0));
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
      this._store.uiStore.handleError(error, 'Unable to fetch orders');
    }
  }

  /**
   * Submits an order to the market
   * @param type the type of order (bid or ask)
   * @param amount the amount of the order
   * @param ratePct the interest rate as a percent of the total amount (from 0 to 100)
   * @param duration the number of blocks to keep the channel open for
   */
  @action.bound
  async submitOrder(
    type: OrderType,
    amount: number,
    ratePct: number,
    duration: number,
    feeRateSatPerKw: number,
  ) {
    try {
      const traderKey = this._store.accountStore.activeAccount.traderKey;
      this._store.log.info(
        `submitting ${type} order for ${amount}sats at ${ratePct}% for ${duration} blocks`,
      );

      const { acceptedOrderNonce, invalidOrder } = await this._store.api.pool.submitOrder(
        traderKey,
        type,
        amount,
        ratePct,
        duration,
        feeRateSatPerKw,
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
      this._store.uiStore.handleError(error, 'Unable to submit the order');
    }
  }

  /**
   * Cancels a pending order
   * @param nonce the order's nonce value
   */
  @action.bound
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
      this._store.uiStore.handleError(error, 'Unable to cancel the order');
    }
  }
}
