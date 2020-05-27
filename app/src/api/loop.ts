import * as LOOP from 'types/generated/loop_pb';
import { SwapClient } from 'types/generated/loop_pb_service';
import { Quote } from 'types/state';
import { IS_PROD } from 'config';
import GrpcClient from './grpc';

/**
 * An API wrapper to communicate with the Loop daemon via GRPC
 */
class LoopApi {
  _meta = {
    'X-Grpc-Backend': 'loop',
  };

  private _grpc: GrpcClient;

  constructor(grpc: GrpcClient) {
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
  async getLoopInQuote(amount: number): Promise<LOOP.QuoteResponse.AsObject> {
    const req = new LOOP.QuoteRequest();
    req.setAmt(amount);
    const res = await this._grpc.request(SwapClient.GetLoopInQuote, req, this._meta);
    return res.toObject();
  }

  /**
   * call the Loop `LoopOutQuote` RPC and return the response
   */
  async getLoopOutQuote(amount: number): Promise<LOOP.QuoteResponse.AsObject> {
    const req = new LOOP.QuoteRequest();
    req.setAmt(amount);
    const res = await this._grpc.request(SwapClient.LoopOutQuote, req, this._meta);
    return res.toObject();
  }

  /**
   * call the Loop `LoopIn` RPC and return the response
   */
  async loopIn(amount: number, quote: Quote): Promise<LOOP.SwapResponse.AsObject> {
    const req = new LOOP.LoopInRequest();
    req.setAmt(amount);
    req.setMaxSwapFee(quote.swapFee);
    req.setMaxMinerFee(quote.minerFee);
    const res = await this._grpc.request(SwapClient.LoopIn, req, this._meta);
    return res.toObject();
  }

  /**
   * call the Loop `LoopOut` RPC and return the response
   */
  async loopOut(
    amount: number,
    quote: Quote,
    chanIds: number[],
  ): Promise<LOOP.SwapResponse.AsObject> {
    const req = new LOOP.LoopOutRequest();
    req.setAmt(amount);
    req.setMaxSwapFee(quote.swapFee);
    req.setMaxMinerFee(quote.minerFee);
    req.setMaxPrepayAmt(quote.prepayAmount);
    req.setMaxSwapRoutingFee(this._calcRoutingFee(quote.swapFee));
    req.setMaxPrepayRoutingFee(this._calcRoutingFee(quote.prepayAmount));
    req.setOutgoingChanSetList(chanIds);

    if (IS_PROD) {
      // in prod env, push the deadline out for 30 mins for lower fees
      const thirtyMins = 30 * 60 * 1000;
      req.setSwapPublicationDeadline(Date.now() + thirtyMins);
    } else {
      // use the --fast option in dev env
      req.setSwapPublicationDeadline(0);
    }

    const res = await this._grpc.request(SwapClient.LoopOut, req, this._meta);
    return res.toObject();
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
