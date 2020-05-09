import { action, observable, toJS } from 'mobx';
import { Store } from 'store';
import { Wallet } from '../models';

export default class NodeStore {
  private _store: Store;

  /** the channel and wallet balances */
  @observable wallet: Wallet = new Wallet();

  constructor(store: Store) {
    this._store = store;
  }

  /**
   * fetch wallet balances from the LND RPC
   */
  @action.bound
  async fetchBalances() {
    this._store.log.info('fetching node balances');
    const offChain = await this._store.api.lnd.channelBalance();
    const onChain = await this._store.api.lnd.walletBalance();
    this.wallet.channelBalance = offChain.balance;
    this.wallet.walletBalance = onChain.totalBalance;
    this._store.log.info('updated nodeStore.info', toJS(this.wallet));
  }
}
