import { action, toJS } from 'mobx';
import { BalanceLevel } from 'types/state';
import { actionLog as log } from 'util/log';
import { LndApi } from 'api';
import { Store } from 'store';

/**
 * Action used to update the channel state in the store with responses from
 * the GRPC APIs
 */
class ChannelAction {
  private _store: Store;
  private _lnd: LndApi;

  constructor(store: Store, lnd: LndApi) {
    this._store = store;
    this._lnd = lnd;
  }

  /**
   * fetch channels from the LND RPC
   */
  @action.bound async getChannels() {
    log.info('fetching channels');
    const channels = await this._lnd.listChannels();
    this._store.channels = channels.channelsList.map(c => ({
      chanId: c.chanId,
      remotePubkey: c.remotePubkey,
      capacity: c.capacity,
      localBalance: c.localBalance,
      remoteBalance: c.remoteBalance,
      uptime: Math.floor((c.uptime * 100) / c.lifetime),
      active: c.active,
      localPercent: this._calcLocalPercent(c.localBalance, c.remoteBalance),
      balancePercent: this._calcBalancePercent(c.localBalance, c.remoteBalance),
      balanceLevel: this._calcBalanceLevel(c.localBalance, c.remoteBalance),
    }));
    log.info('updated store.channels', toJS(this._store.channels));
  }

  /**
   * Determines the local balance percentage of a channel based on the local and
   * remote balances
   * @param local the local balance of the channel
   * @param remote the remote balance of the channel
   */
  private _calcLocalPercent(local: number, remote: number): number {
    return Math.round((local * 100) / (local + remote));
  }

  private _calcBalancePercent(local: number, remote: number): number {
    const pct = this._calcLocalPercent(local, remote);
    return pct >= 50 ? pct : 100 - pct;
  }

  /**
   * Determines the balance level of a channel based on the percentage on each side
   * @param local the local balance of the channel
   * @param remote the remote balance of the channel
   */
  private _calcBalanceLevel(local: number, remote: number): BalanceLevel {
    const pct = this._calcBalancePercent(local, remote);

    if (pct > 85) return BalanceLevel.bad;
    if (pct > 65) return BalanceLevel.warn;
    return BalanceLevel.good;
  }
}

export default ChannelAction;
