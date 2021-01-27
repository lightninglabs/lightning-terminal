import { makeAutoObservable, runInAction, toJS } from 'mobx';
import { Transaction } from 'types/generated/lnd_pb';
import Big from 'big.js';
import copyToClipboard from 'copy-to-clipboard';
import debounce from 'lodash/debounce';
import { ellipseInside } from 'util/strings';
import { Store } from 'store';
import { Wallet } from '../models';

type NodeChain = 'bitcoin' | 'litecoin';
type NodeNetwork = 'mainnet' | 'testnet' | 'regtest';

export default class NodeStore {
  private _store: Store;
  /**
   * an internal list of txn ids used to prevent updating the balance
   * multiple times for the same transaction.
   */
  private _knownTxns: string[] = [];

  /** the pubkey of the LND node */
  pubkey = '';
  /** the alias of the LND node */
  alias = '';
  /** the url of the LND node */
  url = '';
  /** the chain that the LND node is connected to */
  chain: NodeChain = 'bitcoin';
  /** the network that the LND node is connected to */
  network: NodeNetwork = 'mainnet';
  /** the channel and wallet balances */
  wallet: Wallet = new Wallet();
  /** the current block height */
  blockHeight = 0;

  constructor(store: Store) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this._store = store;
  }

  /** the pubkey shortened to 12 chars with ellipses inside */
  get pubkeyLabel() {
    return ellipseInside(this.pubkey);
  }

  /** the url with the pubkey shortened to 12 chars with ellipses inside */
  get urlLabel() {
    if (!this.url) return '';

    const [pubkey, host] = this.url.split('@');
    if (!host) return '';

    return `${ellipseInside(pubkey)}@${host}`;
  }

  /**
   * Copies the value specified by the key to the user's clipboard
   */
  copy(key: 'pubkey' | 'alias' | 'url') {
    copyToClipboard(this[key]);
    const msg = `Copied ${key} to clipboard`;
    this._store.appView.notify(msg, '', 'success');
  }

  /**
   * fetch wallet balances from the LND RPC
   */
  async fetchInfo() {
    this._store.log.info('fetching node info');
    try {
      const info = await this._store.api.lnd.getInfo();
      runInAction(() => {
        this.pubkey = info.identityPubkey;
        this.alias = info.alias;
        this.blockHeight = info.blockHeight;
        if (info.chainsList && info.chainsList[0]) {
          this.chain = info.chainsList[0].chain as NodeChain;
          this.network = info.chainsList[0].network as NodeNetwork;
        }
        if (info.urisList && info.urisList.length > 0) {
          this.url = info.urisList[0];
        }
        this._store.log.info('updated nodeStore info', toJS(this));
      });
    } catch (error) {
      this._store.appView.handleError(error, 'Unable to fetch node info');
    }
  }

  /**
   * fetch wallet balances from the LND RPC
   */
  async fetchBalances() {
    this._store.log.info('fetching node balances');
    try {
      const offChain = await this._store.api.lnd.channelBalance();
      const onChain = await this._store.api.lnd.walletBalance();
      runInAction(() => {
        this.wallet.channelBalance = Big(offChain.balance);
        this.wallet.walletBalance = Big(onChain.totalBalance);
        this.wallet.confirmedBalance = Big(onChain.confirmedBalance);
        this._store.log.info('updated nodeStore.wallet', toJS(this.wallet));
      });
    } catch (error) {
      this._store.appView.handleError(error, 'Unable to fetch balances');
    }
  }

  /** fetch balances at most once every 2 seconds when using this func  */
  fetchBalancesThrottled = debounce(this.fetchBalances, 2000);

  /**
   * updates the wallet balance from the transaction provided
   */
  onTransaction(transaction: Transaction.AsObject) {
    this._store.log.info('handle incoming transaction', transaction);
    if (!this._knownTxns.includes(transaction.txHash)) {
      this._knownTxns.push(transaction.txHash);
      this.wallet.walletBalance = this.wallet.walletBalance.plus(transaction.amount);
      this._store.log.info('updated nodeStore.wallet', toJS(this.wallet));
    }

    // fetch Pool accounts whenever there is an onchain txn
    this._store.accountStore.fetchAccountsThrottled();
  }
}
