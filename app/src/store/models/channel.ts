import { makeAutoObservable } from 'mobx';
import * as LND from 'types/generated/lnd_pb';
import * as LOOP from 'types/generated/loop_pb';
import { ChannelStatus, SortParams } from 'types/state';
import Big from 'big.js';
import { getBalanceStatus } from 'util/balances';
import { percentage } from 'util/bigmath';
import { BalanceMode, BalanceModes } from 'util/constants';
import { CsvColumns } from 'util/csv';
import { ellipseInside } from 'util/strings';
import { Store } from 'store/store';
import { Swap } from './';

export type ProcessingSwapsDirection = 'in' | 'out' | 'both' | 'none';

export default class Channel {
  private _store: Store;

  status = ChannelStatus.UNKNOWN;
  chanId = '';
  remotePubkey = '';
  alias: string | undefined;
  channelPoint = '';
  capacity = Big(0);
  localBalance = Big(0);
  remoteBalance = Big(0);
  remoteFeeRate = 0;
  active = false;
  uptime = Big(0);
  lifetime = Big(0);

  constructor(store: Store) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this._store = store;
  }

  /**
   * The alias or remotePubkey shortened to 12 chars with ellipses inside
   */
  get aliasLabel() {
    // if the node does not specify an alias, it is set to a substring of
    // the pubkey, we want to the display the ellipsed pubkey in this case
    // instead of the substring.
    return this.alias && !this.remotePubkey.includes(this.alias as string)
      ? this.alias
      : ellipseInside(this.remotePubkey);
  }

  /**
   * The remotePubkey and alias if one is defined
   */
  get aliasDetail() {
    // if the node does not specify an alias, it is set to a substring of
    // the pubkey, we want to the display just the pubkey. Otherwise,
    // display both
    return this.alias && !this.remotePubkey.includes(this.alias as string)
      ? `${this.alias}\n${this.remotePubkey}`
      : this.remotePubkey;
  }

  /** the graph explorer url for the channel's remote node */
  get remoteNodeUrl() {
    return this._store.settingsStore.getLightningNodeUrl(this.remotePubkey);
  }

  /**
   * The uptime of the channel as a percentage of lifetime
   */
  get uptimePercent(): number {
    return percentage(this.uptime, this.lifetime);
  }

  /**
   * Determines the local balance percentage of a channel based on the local and
   * remote balances
   */
  get localPercent(): number {
    return percentage(this.localBalance, this.capacity);
  }

  /**
   * The remote peer's fee as a percentage
   */
  get remoteFeePct(): string {
    // the fee returned from the RPC is a number representing the amount of
    // msats charged as a fee per one million msats to forward. To convert to
    // a percentage, the value must be divided by 1M
    return Big(this.remoteFeeRate).div(1000000).mul(100).round(2).toFixed(2);
  }

  /**
   * The order to sort this channel based on the current mode
   */
  get balanceModeOrder() {
    const mode = this._store.settingsStore.balanceMode;
    switch (mode) {
      case BalanceMode.routing:
        const pct = +this.localPercent;
        // disregard direction. the highest local percentage first
        // 99 is the highest since we use Math.floor()
        return Math.max(pct, 99 - pct);
      case BalanceMode.send:
        // the lowest local percentage first
        return 100 - this.localPercent;
      case BalanceMode.receive:
      default:
        // the highest local percentage first
        return this.localPercent;
    }
  }

  /**
   * The balance status of this channel (ok, warn, or danger)
   */
  get balanceStatus() {
    const mode = this._store.settingsStore.balanceMode;
    return getBalanceStatus(this.localBalance, this.capacity, BalanceModes[mode]);
  }

  /**
   * An array of currently processing swaps that use this channel
   */
  get processingSwaps(): Swap[] {
    const swapIds = this._store.swapStore.swappedChannels.get(this.chanId);
    if (!swapIds || swapIds.length === 0) return [];

    return this._store.swapStore.processingSwaps.filter(s => swapIds.includes(s.id));
  }

  /**
   * The direction of the currently processing swaps
   */
  get processingSwapsDirection(): ProcessingSwapsDirection {
    const directions = this.processingSwaps
      .map(s => s.type)
      .filter((d, i, a) => a.indexOf(d) === i); // filter out duplicates

    if (directions.length === 0) {
      return 'none';
    } else if (directions.length > 1) {
      return 'both';
    } else {
      return directions[0] === LOOP.SwapType.LOOP_IN ? 'in' : 'out';
    }
  }

  /**
   * Updates this channel model using data provided from the LND GRPC api
   * @param lndChannel the channel data
   */
  update(lndChannel: LND.Channel.AsObject) {
    this.chanId = lndChannel.chanId;
    this.remotePubkey = lndChannel.remotePubkey;
    this.channelPoint = lndChannel.channelPoint;
    this.capacity = Big(lndChannel.capacity);
    this.localBalance = Big(lndChannel.localBalance);
    this.remoteBalance = Big(lndChannel.remoteBalance);
    this.active = lndChannel.active;
    this.uptime = Big(lndChannel.uptime);
    this.lifetime = Big(lndChannel.lifetime);
  }

  /**
   * Updates this channel model using pending channel data provided from the LND GRPC api
   */
  updatePending(
    status: ChannelStatus,
    pendingChannel: LND.PendingChannelsResponse.PendingChannel.AsObject,
  ) {
    this.status = status;
    this.chanId = pendingChannel.channelPoint;
    this.remotePubkey = pendingChannel.remoteNodePub;
    this.channelPoint = pendingChannel.channelPoint;
    this.capacity = Big(pendingChannel.capacity);
    this.localBalance = Big(pendingChannel.localBalance);
    this.remoteBalance = Big(pendingChannel.remoteBalance);
    this.active = false;
    this.uptime = Big(0);
    this.lifetime = Big(0);
  }

  /**
   * Creates a channel model with the Open status using data provided from the LND GRPC api
   */
  static create(store: Store, lndChannel: LND.Channel.AsObject) {
    const channel = new Channel(store);
    channel.update(lndChannel);
    channel.status = ChannelStatus.OPEN;
    return channel;
  }

  /**
   * Creates a channel model with a pending using data provided from the LND GRPC api
   */
  static createPending(
    store: Store,
    status: ChannelStatus,
    pendingChannel: LND.PendingChannelsResponse.PendingChannel.AsObject,
  ) {
    const channel = new Channel(store);
    channel.updatePending(status, pendingChannel);
    return channel;
  }

  /**
   * Compares a specific field of two channels for sorting
   * @param a the first channel to compare
   * @param b the second channel to compare
   * @param sortBy the field and direction to sort the two channels by
   * @returns a positive number if `a`'s field is greater than `b`'s,
   * a negative number if `a`'s field is less than `b`'s, or zero otherwise
   */
  static compare(a: Channel, b: Channel, field: SortParams<Channel>['field']): number {
    let order = 0;
    switch (field) {
      case 'remoteBalance':
        order = +a.remoteBalance.sub(b.remoteBalance);
        break;
      case 'localBalance':
        order = +a.localBalance.sub(b.localBalance);
        break;
      case 'remoteFeeRate':
        order = a.remoteFeeRate - b.remoteFeeRate;
        break;
      case 'uptimePercent':
        order = a.uptimePercent - b.uptimePercent;
        break;
      case 'aliasLabel':
        order = a.aliasLabel.toLowerCase() > b.aliasLabel.toLowerCase() ? 1 : -1;
        break;
      case 'capacity':
        order = +a.capacity.sub(b.capacity);
        break;
      case 'balanceModeOrder':
      default:
        order = a.balanceModeOrder - b.balanceModeOrder;
        break;
    }

    return order;
  }

  /**
   * Specifies which properties of this class should be exported to CSV
   * @param key must match the name of a property on this class
   * @param value the user-friendly name displayed in the CSV header
   */
  static csvColumns: CsvColumns = {
    chanId: 'Channel ID',
    remotePubkey: 'Remote Pubkey',
    capacity: 'Capacity',
    localBalance: 'Local Balance',
    remoteBalance: 'Remote Balance',
    active: 'Active',
    uptimePercent: 'Uptime Percent',
  };
}
