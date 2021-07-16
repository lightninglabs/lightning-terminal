import { makeAutoObservable } from 'mobx';
import { SortParams } from 'types/state';
import Big from 'big.js';
import { annualPercentRate, toPercent } from 'util/bigmath';
import { BLOCKS_PER_DAY } from 'util/constants';
import { formatSats } from 'util/formatters';
import { ellipseInside } from 'util/strings';
import { Channel, Lease } from 'store/models';
import { Store } from 'store/store';

export default class LeaseView {
  private _store: Store;
  lease: Lease;
  currHeight: number;
  channel?: Channel;

  constructor(store: Store, lease: Lease, currHeight: number, channel?: Channel) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this._store = store;
    this.lease = lease;
    this.currHeight = currHeight;
    this.channel = channel;
  }

  /** the lease's channelPoint */
  get channelPoint() {
    return this.lease.channelPoint;
  }

  /** the lease's channel's balance as "local / capacity" */
  get balances() {
    if (!this.channel) return formatSats(this.lease.channelAmtSat, { withSuffix: false });

    const local = formatSats(this.channel.localBalance, { withSuffix: false });
    const capacity = formatSats(this.channel.capacity, { withSuffix: false });
    return `${local} / ${capacity}`;
  }

  /** the annual percentage rate of this lease */
  get apr() {
    const { channelAmtSat, premiumSat, channelDurationBlocks } = this.lease;
    const termInDays = channelDurationBlocks / BLOCKS_PER_DAY;
    return annualPercentRate(channelAmtSat, premiumSat, termInDays);
  }

  /** the annual percentage rate of this lease as a percentage */
  get aprLabel() {
    return `${toPercent(this.apr)}%`;
  }

  /** the formatted premium of this lease */
  get premium() {
    return formatSats(this.lease.premiumSat, { withSuffix: false });
  }

  /** the status of this lease's channel */
  get status() {
    if (!this.channel) return 'Closed';
    return this.channel.status;
  }

  /** the number of blocks since this lease was created */
  get blocksSoFar() {
    const {
      channelLeaseExpiry: expireHeight,
      channelDurationBlocks: duration,
    } = this.lease;

    // lease expiry may not be set if the channel opening txn isn't confirmed
    if (expireHeight === 0) return 0;

    return Math.max(duration - (expireHeight - this.currHeight), 0);
  }

  /** indicates if the sold channel has exceeded the duration */
  get exceededDuration() {
    return !this.lease.purchased && this.blocksSoFar > this.lease.channelDurationBlocks;
  }

  /** the lease's channel's peer alias, or ellipsed pubkey */
  get alias() {
    if (!this.channel) return ellipseInside(this.lease.channelRemoteNodeKey, 3);
    return this.channel.aliasLabel;
  }

  /** the graph explorer url for the channel's remote node */
  get remoteNodeUrl() {
    return this._store.settingsStore.getLightningNodeUrl(this.lease.channelRemoteNodeKey);
  }

  /**
   * Compares a specific field of two leases for sorting
   * @param a the first lease to compare
   * @param b the second lease to compare
   * @param sortBy the field and direction to sort the two leases by
   * @returns a positive number if `a`'s field is greater than `b`'s,
   * a negative number if `a`'s field is less than `b`'s, or zero otherwise
   */
  static compare(
    a: LeaseView,
    b: LeaseView,
    field: SortParams<LeaseView>['field'],
  ): number {
    switch (field) {
      case 'balances':
        const aBalance = a.channel?.localBalance || Big(0);
        const bBalance = b.channel?.localBalance || Big(0);
        return +aBalance.minus(bBalance);
      case 'apr':
        return a.apr - b.apr;
      case 'premium':
        return +a.lease.premiumSat.minus(b.lease.premiumSat);
      case 'status':
        return a.status > b.status ? 1 : -1;
      case 'alias':
        return a.alias > b.alias ? 1 : -1;
      case 'blocksSoFar':
      default:
        return a.blocksSoFar - b.blocksSoFar;
    }
  }
}
