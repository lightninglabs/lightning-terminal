import { makeAutoObservable, observable, values } from 'mobx';
import { Store } from 'store';
import { Channel } from 'store/models';
import { LeaseView } from './';

export default class OrderListView {
  private _store: Store;

  // the currently selected order
  selectedNonce = '';

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

  /** the list of leases for the selected order */
  get selectedLeases() {
    if (!this.selectedNonce) return [];

    const { field, descending } = this._store.settingsStore.leaseSort;
    const leases = values(this._store.orderStore.leases)
      .filter(lease => lease.orderNonce === this.selectedNonce)
      .map(lease => {
        const currHeight = this._store.nodeStore.blockHeight;
        const channel = this.channelsByPoint.get(lease.channelPoint);
        return new LeaseView(lease, currHeight, channel);
      })
      .sort((a, b) => LeaseView.compare(a, b, field));

    return descending ? leases.reverse() : leases;
  }

  //
  // Actions
  //

  setSelectedNonce(nonce: string) {
    this.selectedNonce = nonce;
  }
}
