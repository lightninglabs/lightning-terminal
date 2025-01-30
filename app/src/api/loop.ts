import * as LOOP from 'types/generated/loop_pb';
import { SwapClient } from 'types/generated/loop_pb_service';
import { Quote } from 'types/state';
import Big from 'big.js';
import { b64 } from 'util/strings';
import BaseApi from './base';
import GrpcClient from './grpc';

const LOOP_INITIATOR = 'lit-ui';

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
  async getLoopInTerms(): Promise<LOOP.InTermsResponse.AsObject> {
    const req = new LOOP.TermsRequest();
    const res = await this._grpc.request(SwapClient.GetLoopInTerms, req, this._meta);
    return res.toObject();
  }

  /**
   * call the Loop `LoopOutTerms` RPC and return the response
   */
  async getLoopOutTerms(): Promise<LOOP.OutTermsResponse.AsObject> {
    const req = new LOOP.TermsRequest();
    const res = await this._grpc.request(SwapClient.LoopOutTerms, req, this._meta);
    return res.toObject();
  }

  /**
   * call the Loop `GetLoopInQuote` RPC and return the response
   */
  async getLoopInQuote(
    amount: Big,
    confTarget?: number,
    lastHop?: string,
  ): Promise<LOOP.InQuoteResponse.AsObject> {
    const req = new LOOP.QuoteRequest();
    req.setAmt(amount.toString());
    if (confTarget) req.setConfTarget(confTarget);
    if (lastHop) req.setLoopInLastHop(b64(lastHop));
    const res = await this._grpc.request(SwapClient.GetLoopInQuote, req, this._meta);
    return res.toObject();
  }

  /**
   * call the Loop `LoopOutQuote` RPC and return the response
   */
  async getLoopOutQuote(
    amount: Big,
    confTarget?: number,
  ): Promise<LOOP.OutQuoteResponse.AsObject> {
    const req = new LOOP.QuoteRequest();
    req.setAmt(amount.toString());
    if (confTarget) req.setConfTarget(confTarget);
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
    confTarget?: number,
  ): Promise<LOOP.SwapResponse.AsObject> {
    const req = new LOOP.LoopInRequest();
    req.setAmt(amount.toString());
    req.setMaxSwapFee(quote.swapFee.toString());
    // mimic the behavior of loop CLI to avoid swap failures due to rising chain fees
    req.setMaxMinerFee(quote.minerFee.mul(250).toString());
    req.setInitiator(LOOP_INITIATOR);
    if (lastHop) req.setLastHop(b64(lastHop));
    if (confTarget) req.setHtlcConfTarget(confTarget);
    const res = await this._grpc.request(SwapClient.LoopIn, req, this._meta);
    return res.toObject();
  }

  /**
   * call the Loop `LoopOut` RPC and return the response
   */
  async loopOut(
    amount: Big,
    quote: Quote,
    chanIds: string[],
    deadline: number,
    confTarget?: number,
    destAddress?: string,
  ): Promise<LOOP.SwapResponse.AsObject> {
    const req = new LOOP.LoopOutRequest();
    req.setAmt(amount.toString());
    req.setMaxSwapFee(quote.swapFee.toString());
    // mimic the behavior of loop CLI to avoid swap failures due to rising chain fees
    req.setMaxMinerFee(quote.minerFee.mul(250).toString());
    req.setMaxPrepayAmt(quote.prepayAmount.toString());
    req.setMaxSwapRoutingFee(this._calcRoutingFee(amount).toString());
    req.setMaxPrepayRoutingFee(this._calcRoutingFee(quote.prepayAmount).toString());
    req.setOutgoingChanSetList(chanIds.map(id => id.toString()));
    req.setSwapPublicationDeadline(deadline.toString());
    req.setInitiator(LOOP_INITIATOR);
    if (confTarget) req.setSweepConfTarget(confTarget);
    if (destAddress) req.setDest(destAddress);

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
  private _calcRoutingFee(amount: Big): Big {
    const routingFeeFactor = 0.02;
    // round up to avoid decimals
    return amount.mul(routingFeeFactor).round(0, Big.roundUp);
  }
}

export default LoopApi;
