import * as LOOP from 'types/generated/loop_pb';
import { SwapClient } from 'types/generated/loop_pb_service';
import { Quote } from 'types/state';
import Big from 'big.js';
import BaseApi from './base';
import GrpcClient from './grpc';

/** the names and argument types for the subscription events */
interface LoopEvents {
  monitor: LOOP.SwapStatus.AsObject;
}

/**
 * An API wrapper to communicate with the Loop daemon via GRPC
 */
class LoopApi extends BaseApi<LoopEvents> {
  _grpc: GrpcClient;

  constructor(grpc: GrpcClient) {
    super();
    this._grpc = grpc;
  }

  /**
   * call the Loop `ListSwaps` RPC and return the response
   */
  async listSwaps(): Promise<LOOP.ListSwapsResponse.AsObject> {
    const req = new LOOP.ListSwapsRequest();
    const res = await this._grpc.request(SwapClient.ListSwaps, req, this._meta);
    return res.toObject();
  }

  /**
   * call the Loop `GetLoopInTerms` RPC and return the response
   */
  async getLoopInTerms(): Promise<LOOP.TermsResponse.AsObject> {
    const req = new LOOP.TermsRequest();
    const res = await this._grpc.request(SwapClient.GetLoopInTerms, req, this._meta);
    return res.toObject();
  }

  /**
   * call the Loop `LoopOutTerms` RPC and return the response
   */
  async getLoopOutTerms(): Promise<LOOP.TermsResponse.AsObject> {
    const req = new LOOP.TermsRequest();
    const res = await this._grpc.request(SwapClient.LoopOutTerms, req, this._meta);
    return res.toObject();
  }

  /**
   * call the Loop `GetLoopInQuote` RPC and return the response
   */
  async getLoopInQuote(amount: Big): Promise<LOOP.QuoteResponse.AsObject> {
    const req = new LOOP.QuoteRequest();
    req.setAmt(+amount);
    const res = await this._grpc.request(SwapClient.GetLoopInQuote, req, this._meta);
    return res.toObject();
  }

  /**
   * call the Loop `LoopOutQuote` RPC and return the response
   */
  async getLoopOutQuote(amount: Big): Promise<LOOP.QuoteResponse.AsObject> {
    const req = new LOOP.QuoteRequest();
    req.setAmt(+amount);
    const res = await this._grpc.request(SwapClient.LoopOutQuote, req, this._meta);
    return res.toObject();
  }

  /**
   * call the Loop `LoopIn` RPC and return the response
   */
  async loopIn(
    amount: Big,
    quote: Quote,
    lastHop?: string,
  ): Promise<LOOP.SwapResponse.AsObject> {
    const req = new LOOP.LoopInRequest();
    req.setAmt(+amount);
    req.setMaxSwapFee(+quote.swapFee);
    req.setMaxMinerFee(+quote.minerFee);
    if (lastHop) req.setLastHop(Buffer.from(lastHop, 'hex').toString('base64'));
    const res = await this._grpc.request(SwapClient.LoopIn, req, this._meta);
    return res.toObject();
  }

  /**
   * call the Loop `LoopOut` RPC and return the response
   */
  async loopOut(
    amount: Big,
    quote: Quote,
    chanIds: number[],
    deadline: number,
  ): Promise<LOOP.SwapResponse.AsObject> {
    const req = new LOOP.LoopOutRequest();
    req.setAmt(+amount);
    req.setMaxSwapFee(+quote.swapFee);
    req.setMaxMinerFee(+quote.minerFee);
    req.setMaxPrepayAmt(+quote.prepayAmount);
    req.setMaxSwapRoutingFee(this._calcRoutingFee(+amount));
    req.setMaxPrepayRoutingFee(this._calcRoutingFee(+quote.prepayAmount));
    req.setOutgoingChanSetList(chanIds);
    req.setSwapPublicationDeadline(deadline);

    const res = await this._grpc.request(SwapClient.LoopOut, req, this._meta);
    return res.toObject();
  }

  /**
   * Connect to the Loop streaming endpoint
   */
  connectStreams() {
    this._grpc.subscribe(
      SwapClient.Monitor,
      new LOOP.MonitorRequest(),
      swapStatus => this.emit('monitor', swapStatus.toObject()),
      this._meta,
    );
  }
  /**
   * Calculates the max routing fee params for loop out. this mimics the loop cli
   * behavior of using 2% of the amount
   * @param amount the amount of the payment
   */
  private _calcRoutingFee(amount: number) {
    const routingFeePct = 2;
    // round up to avoid decimals
    return Math.ceil(amount * (routingFeePct / 100));
  }
}

export default LoopApi;
