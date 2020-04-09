import { action } from 'mobx';
import LndApi from 'api/lnd';
import { Store } from 'store';

/**
 * Action used to update node info state in the store with responses from
 * the GRPC APIs
 */
class NodeAction {
  private _store: Store;
  private _lnd: LndApi;

  constructor(store: Store, lnd: LndApi) {
    this._store = store;
    this._lnd = lnd;
  }

  /**
   * fetch node info from the LND RPC
   */
  @action.bound async getInfo() {
    this._store.info = await this._lnd.getInfo();
  }
}

export default NodeAction;
