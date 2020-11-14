import { makeAutoObservable } from 'mobx';
import { SortParams } from 'types/state';
import { annualPercentYield, toPercent } from 'util/bigmath';
import { formatSats } from 'util/formatters';
import { ellipseInside } from 'util/strings';
import { Channel, Lease } from 'store/models';

export default class LeaseView {
  private lease: Lease;
  private currHeight: number;
  private channel?: Channel;

  constructor(lease: Lease, currHeight: number, channel?: Channel) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

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

  /** the APY of this lease */
  get apy() {
    const { channelAmtSat, premiumSat, channelDurationBlocks } = this.lease;
    return annualPercentYield(+channelAmtSat, +premiumSat, channelDurationBlocks);
  }

  /** the APY of lease as a percentage */
  get apyLabel() {
    return `${toPercent(this.apy)}%`;
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

  /** the duration of this lease as "blocks_so_far / total_duration" */
  get duration() {
    return `${this.blocksSoFar} / ${this.lease.channelDurationBlocks}`;
  }

  /** the lease's channel's peer alias, or ellipsed pubkey */
  get alias() {
    if (!this.channel) return ellipseInside(this.lease.channelRemoteNodeKey, 3);
    return this.channel.aliasLabel;
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
      case 'apy':
        return a.apy - b.apy;
      case 'premium':
        return +a.lease.premiumSat.minus(b.lease.premiumSat);
      case 'status':
        return a.status > b.status ? 1 : -1;
      case 'alias':
        return a.alias > b.alias ? 1 : -1;
      case 'duration':
      default:
        return a.blocksSoFar - b.blocksSoFar;
    }
  }
}
