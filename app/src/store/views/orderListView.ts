import { makeAutoObservable, observable } from 'mobx';
import { OrderState } from 'types/generated/auctioneerrpc/auctioneer_pb';
import { Store } from 'store';
import { Channel } from 'store/models';
import { LeaseView } from './';

type OrdersFilter = '' | 'open' | 'filled';

export default class OrderListView {
  private _store: Store;

  // the currently selected order
  chosenNonce = '';
  // the filter to apply to the orders list
  filter: OrdersFilter = 'open';

  constructor(store: Store) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this._store = store;
  }

  //
  // Computed properties
  //

  /** the list of orders for the active account */
  get orders() {
    const orders = this._store.orderStore.sortedOrders;
    switch (this.filter) {
      case '':
        return orders;
      case 'open':
        return orders.filter(o => o.isPending);
      case 'filled':
        return orders.filter(o => o.state === OrderState.ORDER_EXECUTED);
    }
  }

  /** the channels in the store indexed by channelPoint */
  get channelsByPoint() {
    const channels = observable.map<string, Channel>();
    this._store.channelStore.sortedChannels.forEach(channel =>
      channels.set(channel.channelPoint, channel),
    );
    this._store.channelStore.sortedPendingChannels.forEach(channel =>
      channels.set(channel.channelPoint, channel),
    );
    return channels;
  }

  /** the manually chosen order nonce, or the nonce of the first order */
  get selectedNonce() {
    return this.chosenNonce || (this.orders.length ? this.orders[0].nonce : '');
  }

  /** the list of leases for the selected order */
  get selectedLeases() {
    const { field, descending } = this._store.settingsStore.leaseSort;
    const leases = this._store.orderStore.leasesByNonce[this.selectedNonce] || [];
    const leaseViews = leases
      .map(lease => {
        const currHeight = this._store.nodeStore.blockHeight;
        const channel = this.channelsByPoint.get(lease.channelPoint);
        return new LeaseView(this._store, lease, currHeight, channel);
      })
      .sort((a, b) => LeaseView.compare(a, b, field));

    return descending ? leaseViews.reverse() : leaseViews;
  }

  //
  // Actions
  //

  setChosenNonce(nonce: string) {
    this.chosenNonce = nonce;
  }

  setFilter(filter: OrdersFilter) {
    this.filter = filter;
    this.chosenNonce = '';
  }

  filterByOpen() {
    this.setFilter('open');
  }

  filterByFilled() {
    this.setFilter('filled');
  }

  clearFilter() {
    this.setFilter('');
  }
}
