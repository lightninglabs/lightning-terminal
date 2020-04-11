import { action } from 'mobx';
import LndApi from 'api/lnd';
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
    const channels = await this._lnd.listChannels();
    this._store.channels = channels.channelsList.map(c => ({
      chanId: c.chanId,
      remotePubkey: c.remotePubkey,
      capacity: c.capacity,
      localBalance: c.localBalance,
      remoteBalance: c.remoteBalance,
      uptime: c.uptime,
      active: c.active,
    }));
  }
}

export default ChannelAction;
