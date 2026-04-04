import LNC from '@lightninglabs/lnc-web';
import BaseApi from './base';

interface LndEvents {
  transaction: any;
  channel: any;
  invoice: any;
}

const LNC_STORAGE_KEY = 'lnc-paired';

class LncApi extends BaseApi<LndEvents> {
  private _lnc: LNC;

  constructor(lnc: LNC) {
    super();
    this._lnc = lnc;
  }

  get lnc() {
    return this._lnc;
  }

  async getInfo() {
    return this._lnc.lnd.lightning.getInfo();
  }

  async channelBalance() {
    return this._lnc.lnd.lightning.channelBalance();
  }

  async walletBalance() {
    return this._lnc.lnd.lightning.walletBalance();
  }

  async listChannels() {
    return this._lnc.lnd.lightning.listChannels();
  }

  async pendingChannels() {
    return this._lnc.lnd.lightning.pendingChannels();
  }

  async getNodeInfo(pubkey: string) {
    return this._lnc.lnd.lightning.getNodeInfo({
      pubKey: pubkey,
      includeChannels: true,
    });
  }

  async describeGraph() {
    return this._lnc.lnd.lightning.describeGraph({
      includeUnannounced: false,
    });
  }

  async getNetworkInfo() {
    return this._lnc.lnd.lightning.getNetworkInfo();
  }

  async getChannelInfo(id: string) {
    return this._lnc.lnd.lightning.getChanInfo({
      chanId: id,
    });
  }

  async listPayments() {
    return this._lnc.lnd.lightning.listPayments({
      includeIncomplete: true,
      maxPayments: '100',
    });
  }

  async listInvoices() {
    return this._lnc.lnd.lightning.listInvoices({
      numMaxInvoices: '100',
      reversed: true,
    });
  }

  async addInvoice(amount: string, memo: string) {
    return this._lnc.lnd.lightning.addInvoice({
      value: amount,
      memo,
    });
  }

  async decodePayReq(payReq: string) {
    return this._lnc.lnd.lightning.decodePayReq({
      payReq,
    });
  }

  async sendPaymentSync(payReq: string) {
    return this._lnc.lnd.lightning.sendPaymentSync({
      paymentRequest: payReq,
    });
  }

  async newAddress() {
    return this._lnc.lnd.lightning.newAddress({
      type: 0 as any,
    });
  }

  async sendCoins(addr: string, amount: string) {
    return this._lnc.lnd.lightning.sendCoins({
      addr,
      amount,
    });
  }

  async openChannelSync(nodePubkey: string, localFundingAmount: string) {
    return this._lnc.lnd.lightning.openChannelSync({
      nodePubkeyString: nodePubkey,
      localFundingAmount,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private static _noop() {}

  connectStreams() {
    try {
      this._lnc.lnd.lightning.subscribeTransactions(
        {},
        (tx: any) => this.emit('transaction', tx),
        LncApi._noop,
      );
    } catch {
      // subscription may fail if not supported
    }
    try {
      this._lnc.lnd.lightning.subscribeChannelEvents(
        {},
        (ev: any) => this.emit('channel', ev),
        LncApi._noop,
      );
    } catch {
      // subscription may fail if not supported
    }
    try {
      this._lnc.lnd.lightning.subscribeInvoices(
        {},
        (inv: any) => this.emit('invoice', inv),
        LncApi._noop,
      );
    } catch {
      // subscription may fail if not supported
    }
  }

  static get isPaired(): boolean {
    return localStorage.getItem(LNC_STORAGE_KEY) === 'true';
  }

  static markPaired() {
    localStorage.setItem(LNC_STORAGE_KEY, 'true');
  }

  static clearPaired() {
    localStorage.removeItem(LNC_STORAGE_KEY);
  }

  static isPairedFor(namespace: string): boolean {
    return localStorage.getItem(`${LNC_STORAGE_KEY}-${namespace}`) === 'true';
  }

  static markPairedFor(namespace: string) {
    localStorage.setItem(`${LNC_STORAGE_KEY}-${namespace}`, 'true');
  }

  static clearPairedFor(namespace: string) {
    localStorage.removeItem(`${LNC_STORAGE_KEY}-${namespace}`);
  }
}

export default LncApi;
