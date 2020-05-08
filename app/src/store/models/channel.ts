import { action, observable } from 'mobx';
import * as LND from 'types/generated/lnd_pb';
import { BalanceLevel } from 'types/state';

export default class Channel {
  @observable chanId = '';
  @observable remotePubkey = '';
  @observable capacity = 0;
  @observable localBalance = 0;
  @observable remoteBalance = 0;
  @observable active = false;
  @observable uptimePercent = 0;

  constructor(lndChannel: LND.Channel.AsObject) {
    this.update(lndChannel);
  }

  /**
   * Determines the local balance percentage of a channel based on the local and
   * remote balances
   */
  @observable get localPercent() {
    return Math.round(
      (this.localBalance * 100) / (this.localBalance + this.remoteBalance),
    );
  }

  /**
   * The imbalance percentage irregardless of direction
   */
  @observable get balancePercent() {
    const pct = this.localPercent;
    return pct >= 50 ? pct : 100 - pct;
  }

  /**
   * Determines the balance level of a channel based on the percentage on each side
   */
  @observable get balanceLevel() {
    const pct = this.balancePercent;

    if (pct > 85) return BalanceLevel.bad;
    if (pct > 65) return BalanceLevel.warn;
    return BalanceLevel.good;
  }

  /**
   * Updates this channel model using data provided from the LND GRPC api
   * @param lndChannel the channel data
   */
  @action.bound
  update(lndChannel: LND.Channel.AsObject) {
    this.chanId = lndChannel.chanId;
    this.remotePubkey = lndChannel.remotePubkey;
    this.capacity = lndChannel.capacity;
    this.localBalance = lndChannel.localBalance;
    this.remoteBalance = lndChannel.remoteBalance;
    this.active = lndChannel.active;
    this.uptimePercent = Math.floor((lndChannel.uptime * 100) / lndChannel.lifetime);
  }
}
