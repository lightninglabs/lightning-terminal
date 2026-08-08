import * as LND from 'types/generated/lnd_pb';
import { Lightning } from 'types/generated/lnd_pb_service';
import BaseApi from './base';
import GrpcClient from './grpc';

/** the names and argument types for the subscription events */
interface LndEvents {
  transaction: LND.Transaction.AsObject;
  channel: LND.ChannelEventUpdate.AsObject;
  invoice: LND.Invoice.AsObject;
}

/**
 * An API wrapper to communicate with the LND node via GRPC
 */
class LndApi extends BaseApi<LndEvents> {
  _grpc: GrpcClient;

  constructor(grpc: GrpcClient) {
    super();
    this._grpc = grpc;
  }

  /**
   * call the LND `GetInfo` RPC and return the response
   */
  async getInfo(): Promise<LND.GetInfoResponse.AsObject> {
    const req = new LND.GetInfoRequest();
    const res = await this._grpc.request(Lightning.GetInfo, req, this._meta);
    return res.toObject();
  }

  /**
   * call the LND `ChannelBalance` RPC and return the response
   */
  async channelBalance(): Promise<LND.ChannelBalanceResponse.AsObject> {
    const req = new LND.ChannelBalanceRequest();
    const res = await this._grpc.request(Lightning.ChannelBalance, req, this._meta);
    return res.toObject();
  }

  /**
   * call the LND `WalletBalance` RPC and return the response
   */
  async walletBalance(): Promise<LND.WalletBalanceResponse.AsObject> {
    const req = new LND.WalletBalanceRequest();
    const res = await this._grpc.request(Lightning.WalletBalance, req, this._meta);
    return res.toObject();
  }

  /**
   * call the LND `ListChannels` RPC and return the response
   */
  async listChannels(): Promise<LND.ListChannelsResponse.AsObject> {
    const req = new LND.ListChannelsRequest();
    const res = await this._grpc.request(Lightning.ListChannels, req, this._meta);
    return res.toObject();
  }

  /**
   * call the LND `PendingChannels` RPC and return the response
   */
  async pendingChannels(): Promise<LND.PendingChannelsResponse.AsObject> {
    const req = new LND.PendingChannelsRequest();
    const res = await this._grpc.request(Lightning.PendingChannels, req, this._meta);
    return res.toObject();
  }

  /**
   * call the LND `GetNodeInfo` RPC and return the response
   */
  async getNodeInfo(pubkey: string): Promise<LND.NodeInfo.AsObject> {
    const req = new LND.NodeInfoRequest();
    req.setPubKey(pubkey);
    req.setIncludeChannels(true);
    const res = await this._grpc.request(Lightning.GetNodeInfo, req, this._meta);
    return res.toObject();
  }

  /**
   * call the LND `DescribeGraph` RPC and return the full network topology
   */
  async describeGraph(): Promise<LND.ChannelGraph.AsObject> {
    const req = new LND.ChannelGraphRequest();
    const res = await this._grpc.request(Lightning.DescribeGraph, req, this._meta);
    return res.toObject();
  }

  /**
   * call the LND `GetNetworkInfo` RPC and return aggregate stats
   */
  async getNetworkInfo(): Promise<LND.NetworkInfo.AsObject> {
    const req = new LND.NetworkInfoRequest();
    const res = await this._grpc.request(Lightning.GetNetworkInfo, req, this._meta);
    return res.toObject();
  }

  /**
   * call the LND `GetChanInfo` RPC and return the response
   */
  async getChannelInfo(id: string): Promise<LND.ChannelEdge.AsObject> {
    const req = new LND.ChanInfoRequest();
    req.setChanId(id);
    const res = await this._grpc.request(Lightning.GetChanInfo, req, this._meta);
    return res.toObject();
  }

  /**
   * call the LND `ListPayments` RPC and return the response
   */
  async listPayments(): Promise<LND.ListPaymentsResponse.AsObject> {
    const req = new LND.ListPaymentsRequest();
    req.setIncludeIncomplete(true);
    req.setMaxPayments('100');
    const res = await this._grpc.request(Lightning.ListPayments, req, this._meta);
    return res.toObject();
  }

  /**
   * call the LND `ListInvoices` RPC and return the response
   */
  async listInvoices(): Promise<LND.ListInvoiceResponse.AsObject> {
    const req = new LND.ListInvoiceRequest();
    req.setNumMaxInvoices('100');
    req.setReversed(true);
    const res = await this._grpc.request(Lightning.ListInvoices, req, this._meta);
    return res.toObject();
  }

  async addInvoice(
    amount: string,
    memo: string,
  ): Promise<LND.AddInvoiceResponse.AsObject> {
    const req = new LND.Invoice();
    req.setValue(amount);
    req.setMemo(memo);
    const res = await this._grpc.request(Lightning.AddInvoice, req, this._meta);
    return res.toObject();
  }

  async decodePayReq(payReq: string): Promise<LND.PayReq.AsObject> {
    const req = new LND.PayReqString();
    req.setPayReq(payReq);
    const res = await this._grpc.request(Lightning.DecodePayReq, req, this._meta);
    return res.toObject();
  }

  async sendPaymentSync(payReq: string): Promise<LND.SendResponse.AsObject> {
    const req = new LND.SendRequest();
    req.setPaymentRequest(payReq);
    const res = await this._grpc.request(Lightning.SendPaymentSync, req, this._meta);
    return res.toObject();
  }

  async newAddress(): Promise<LND.NewAddressResponse.AsObject> {
    const req = new LND.NewAddressRequest();
    req.setType(0); // WITNESS_PUBKEY_HASH (native segwit)
    const res = await this._grpc.request(Lightning.NewAddress, req, this._meta);
    return res.toObject();
  }

  async sendCoins(addr: string, amount: string): Promise<LND.SendCoinsResponse.AsObject> {
    const req = new LND.SendCoinsRequest();
    req.setAddr(addr);
    req.setAmount(amount);
    const res = await this._grpc.request(Lightning.SendCoins, req, this._meta);
    return res.toObject();
  }

  async openChannelSync(
    nodePubkey: string,
    localFundingAmount: string,
  ): Promise<LND.ChannelPoint.AsObject> {
    const req = new LND.OpenChannelRequest();
    req.setNodePubkeyString(nodePubkey);
    req.setLocalFundingAmount(localFundingAmount);
    const res = await this._grpc.request(Lightning.OpenChannelSync, req, this._meta);
    return res.toObject();
  }

  /**
   * Connect to the LND streaming endpoints
   */
  connectStreams() {
    this._grpc.subscribe(
      Lightning.SubscribeTransactions,
      new LND.GetTransactionsRequest(),
      transaction => this.emit('transaction', transaction.toObject()),
      this._meta,
    );
    this._grpc.subscribe(
      Lightning.SubscribeChannelEvents,
      new LND.ChannelEventSubscription(),
      channelEvent => this.emit('channel', channelEvent.toObject()),
      this._meta,
    );
    this._grpc.subscribe(
      Lightning.SubscribeInvoices,
      new LND.InvoiceSubscription(),
      invoice => this.emit('invoice', invoice.toObject()),
      this._meta,
    );
  }
}

export default LndApi;
