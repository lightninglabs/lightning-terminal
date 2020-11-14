import { makeAutoObservable, observable } from 'mobx';
import { Store } from 'store';
import { Channel } from 'store/models';
import { LeaseView } from './';

export default class OrderListView {
  private _store: Store;

  // the currently selected order
  chosenNonce = '';

  constructor(store: Store) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this._store = store;
  }

  //
  // Computed properties
  //

  /** the list of orders for the active account */
  get orders() {
    return this._store.orderStore.accountOrders;
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
        return new LeaseView(lease, currHeight, channel);
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
}
