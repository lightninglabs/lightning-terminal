import {
  keys,
  makeAutoObservable,
  observable,
  ObservableMap,
  runInAction,
  toJS,
  values,
} from 'mobx';
import * as POOL from 'types/generated/trader_pb';
import Big from 'big.js';
import debounce from 'lodash/debounce';
import { hex } from 'util/strings';
import { Store } from 'store';
import { Lease, Order } from 'store/models';
import { OrderType, Tier } from 'store/models/order';

export default class OrderStore {
  private _store: Store;

  /** the collection of orders */
  orders: ObservableMap<string, Order> = observable.map();
  /** the collection of leases */
  leases: ObservableMap<string, Lease> = observable.map();
  /** that amount earned from sold leases */
  earnedSats = Big(0);
  /** the amount paid from purchased leases */
  paidSats = Big(0);

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

  /** the number of pending orders for the active account */
  get pendingOrdersCount() {
    return this.sortedOrders.filter(o => o.isPending).length;
  }

  /** the leases grouped by orderNonce */
  get leasesByNonce() {
    const leases: Record<string, Lease[]> = {};
    values(this.leases)
      .slice()
      .forEach(lease => {
        if (!leases[lease.orderNonce]) {
          // create a new array with the lease
          leases[lease.orderNonce] = [lease];
        } else {
          // append the lease to the existing array
          leases[lease.orderNonce] = [...leases[lease.orderNonce], lease];
        }
      });
    return leases;
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
          const order = this.orders.get(nonce) || new Order(this._store);
          order.update(poolOrder, OrderType.Ask, leaseDurationBlocks);
          this.orders.set(nonce, order);
          serverIds.push(nonce);
        });

        bidsList.forEach(({ details, leaseDurationBlocks, minNodeTier }) => {
          const poolOrder = details as POOL.Order.AsObject;
          // update existing orders or create new ones in state. using this
          // approach instead of overwriting the array will cause fewer state
          // mutations, resulting in better react rendering performance
          const nonce = hex(poolOrder.orderNonce);
          const order = this.orders.get(nonce) || new Order(this._store);
          order.update(poolOrder, OrderType.Bid, leaseDurationBlocks, minNodeTier);
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

      // fetch leases whenever orders are fetched
      await this.fetchLeases();
    } catch (error) {
      this._store.appView.handleError(error, 'Unable to fetch orders');
    }
  }

  /** fetch orders at most once every 2 seconds when using this func  */
  fetchOrdersThrottled = debounce(this.fetchOrders, 2000);

  /**
   * queries the POOL api to fetch the list of leases and stores them
   * in the state
   */
  async fetchLeases() {
    this._store.log.info('fetching leases');

    try {
      const {
        leasesList,
        totalAmtEarnedSat,
        totalAmtPaidSat,
      } = await this._store.api.pool.listLeases();

      runInAction(() => {
        this.earnedSats = Big(totalAmtEarnedSat);
        this.paidSats = Big(totalAmtPaidSat);
        leasesList.forEach(poolLease => {
          // update existing leases or create new ones in state. using this
          // approach instead of overwriting the array will cause fewer state
          // mutations, resulting in better react rendering performance
          const channelPoint = Lease.channelPointToString(poolLease.channelPoint);
          const existing = this.leases.get(channelPoint);
          if (existing) {
            existing.update(poolLease);
          } else {
            this.leases.set(channelPoint, new Lease(poolLease));
          }
        });
        // remove any leases in state that are not in the API response
        const serverIds = leasesList.map(a => Lease.channelPointToString(a.channelPoint));
        const localIds = keys(this.leases).map(key => String(key));
        localIds
          .filter(id => !serverIds.includes(id))
          .forEach(id => this.leases.delete(id));
        this._store.log.info('updated orderStore.leases', toJS(this.leases));
      });
    } catch (error) {
      this._store.appView.handleError(error, 'Unable to fetch leases');
    }
  }

  /** fetch leases at most once every 2 seconds when using this func  */
  fetchLeasesThrottled = debounce(this.fetchLeases, 2000);

  /**
   * Requests a fee quote for an order
   * @param amount the amount of the order
   * @param rateFixed the per block fixed rate
   * @param duration the number of blocks to keep the channel open for
   * @param minUnitsMatch the minimum number of units required to match this order
   * @param maxBatchFeeRate the maximum batch fee rate to allowed as sats per vByte
   */
  async quoteOrder(
    amount: Big,
    rateFixed: number,
    duration: number,
    minUnitsMatch: number,
    maxBatchFeeRate: number,
  ): Promise<POOL.QuoteOrderResponse.AsObject> {
    try {
      this._store.log.info(`quoting an order for ${amount}sats`, {
        rateFixed,
        duration,
        minUnitsMatch,
        maxBatchFeeRate,
      });

      const res = await this._store.api.pool.quoteOrder(
        amount,
        rateFixed,
        duration,
        minUnitsMatch,
        maxBatchFeeRate,
      );

      return res;
    } catch (error) {
      this._store.appView.handleError(error, 'Unable to estimate order fees');
      return {
        ratePerBlock: rateFixed,
        ratePercent: 0,
        totalExecutionFeeSat: '0',
        totalPremiumSat: '0',
        worstCaseChainFeeSat: '0',
      };
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
   * @param minNodeTier the minimum node tier (only for Bid orders)
   */
  async submitOrder(
    type: OrderType,
    amount: Big,
    rateFixed: number,
    duration: number,
    minUnitsMatch: number,
    maxBatchFeeRate: number,
    minNodeTier?: Tier,
  ) {
    try {
      const traderKey = this._store.accountStore.activeAccount.traderKey;
      this._store.log.info(`submitting ${type} order for ${amount}sats`, {
        rateFixed,
        duration,
        minUnitsMatch,
        maxBatchFeeRate,
        minNodeTier,
      });

      const { acceptedOrderNonce, invalidOrder } = await this._store.api.pool.submitOrder(
        traderKey,
        type,
        amount,
        rateFixed,
        duration,
        minUnitsMatch,
        maxBatchFeeRate,
        minNodeTier,
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
    const orders = this.sortedOrders.filter(o => o.isPending);
    for (const order of orders) {
      this._store.log.info(`cancelling order with nonce ${order.nonce} for ${traderKey}`);
      await this._store.api.pool.cancelOrder(order.nonce);
    }
    // fetch all orders to update the store's state
    await this.fetchOrders();
    // also update account balances in the store
    await this._store.accountStore.fetchAccounts();
  }

  /** exports the list of leases to CSV file */
  exportLeases() {
    this._store.log.info('exporting Leases to a CSV file');
    const leases = values(this.leases).slice();
    this._store.csv.export('leases', Lease.csvColumns, toJS(leases));
  }
}
