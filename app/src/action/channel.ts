import { Store } from 'store';
import { action } from 'mobx';
import LndApi from 'api/lnd';

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
    this._store.channels = await this._lnd.listChannels();
  }
}

export default ChannelAction;
