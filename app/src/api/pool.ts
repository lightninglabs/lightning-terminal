import * as AUCT from 'types/generated/auctioneerrpc/auctioneer_pb';
import * as POOL from 'types/generated/trader_pb';
import { Trader } from 'types/generated/trader_pb_service';
import { b64 } from 'util/strings';
import { OrderType, Tier } from 'store/models/order';
import BaseApi from './base';
import GrpcClient from './grpc';

// The granularity of the fixed rate used to compute the per-block interest rate.
// This needs to be large enough to ensure the the smallest possible order (100K sats),
// for the smallest possible premium (or smallest acceptable) is expressible over
// our current max lease period (6 months)
export const FEE_RATE_TOTAL_PARTS = 1e9;

// The amount of satoshis in one unit
export const ONE_UNIT = 100000;

// The minimum batch fee rate in sats/kw
export const MIN_FEE_RATE_KW = 253;

// The latest order version. This should be updated along with pool CLI
// see: https://github.com/lightninglabs/pool/blob/master/order/interface.go#L35
export const ORDER_VERSION = 2;

const POOL_INITIATOR = 'lit-ui';

/** the names and argument types for the subscription events */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface PoolEvents {}

/**
 * An API wrapper to communicate with the pool node via GRPC
 */
class PoolApi extends BaseApi<PoolEvents> {
  private _grpc: GrpcClient;

  constructor(grpc: GrpcClient) {
    super();
    this._grpc = grpc;
  }

  /**
   * call the pool `QuoteAccount` RPC and return the response
   */
  async quoteAccount(
    amount: number,
    confTarget: number,
  ): Promise<POOL.QuoteAccountResponse.AsObject> {
    const req = new POOL.QuoteAccountRequest();
    req.setAccountValue(amount);
    req.setConfTarget(confTarget);
    const res = await this._grpc.request(Trader.QuoteAccount, req, this._meta);
    return res.toObject();
  }

  /**
   * call the pool `InitAccount` RPC and return the response
   */
  async initAccount(
    amount: number,
    expiryBlocks: number,
    confTarget = 6,
  ): Promise<POOL.Account.AsObject> {
    const req = new POOL.InitAccountRequest();
    req.setAccountValue(amount);
    req.setRelativeHeight(expiryBlocks);
    req.setConfTarget(confTarget);
    req.setInitiator(POOL_INITIATOR);
    const res = await this._grpc.request(Trader.InitAccount, req, this._meta);
    return res.toObject();
  }

  /**
   * call the pool `RenewAccount` RPC and return the response
   */
  async renewAccount(
    traderKey: string,
    expiryBlocks: number,
    feeRateSatPerKw: number,
  ): Promise<POOL.RenewAccountResponse.AsObject> {
    const req = new POOL.RenewAccountRequest();
    req.setAccountKey(b64(traderKey));
    req.setRelativeExpiry(expiryBlocks);
    req.setFeeRateSatPerKw(feeRateSatPerKw);

    const res = await this._grpc.request(Trader.RenewAccount, req, this._meta);
    return res.toObject();
  }

  /**
   * call the pool `CloseAccount` RPC and return the response
   */
  async closeAccount(
    traderKey: string,
    feeRateSatPerKw = 253,
    destinationAddr?: string,
  ): Promise<POOL.CloseAccountResponse.AsObject> {
    const req = new POOL.CloseAccountRequest();
    req.setTraderKey(b64(traderKey));

    const output = new POOL.OutputWithFee();
    output.setFeeRateSatPerKw(feeRateSatPerKw);
    if (destinationAddr) {
      output.setAddress(destinationAddr);
    }
    req.setOutputWithFee(output);

    const res = await this._grpc.request(Trader.CloseAccount, req, this._meta);
    return res.toObject();
  }

  /**
   * call the pool `ListAccounts` RPC and return the response
   */
  async listAccounts(): Promise<POOL.ListAccountsResponse.AsObject> {
    const req = new POOL.ListAccountsRequest();
    const res = await this._grpc.request(Trader.ListAccounts, req, this._meta);
    return res.toObject();
  }

  /**
   * call the pool `DepositAccount` RPC and return the response
   */
  async deposit(
    traderKey: string,
    amount: number,
    feeRateSatPerKw = 253,
  ): Promise<POOL.DepositAccountResponse.AsObject> {
    const req = new POOL.DepositAccountRequest();
    req.setTraderKey(Buffer.from(traderKey, 'hex').toString('base64'));
    req.setAmountSat(amount);
    req.setFeeRateSatPerKw(feeRateSatPerKw);
    const res = await this._grpc.request(Trader.DepositAccount, req, this._meta);
    return res.toObject();
  }

  /**
   * call the pool `WithdrawAccount` RPC and return the response
   */
  async withdraw(
    traderKey: string,
    amount: number,
    feeRateSatPerKw = 253,
  ): Promise<POOL.WithdrawAccountResponse.AsObject> {
    const req = new POOL.WithdrawAccountRequest();
    req.setTraderKey(Buffer.from(traderKey, 'hex').toString('base64'));
    req.setFeeRateSatPerKw(feeRateSatPerKw);
    const output = new POOL.Output();
    output.setValueSat(amount);
    req.setOutputsList([output]);
    const res = await this._grpc.request(Trader.WithdrawAccount, req, this._meta);
    return res.toObject();
  }

  /**
   * call the pool `ListOrders` RPC and return the response
   */
  async listOrders(): Promise<POOL.ListOrdersResponse.AsObject> {
    const req = new POOL.ListOrdersRequest();
    const res = await this._grpc.request(Trader.ListOrders, req, this._meta);
    return res.toObject();
  }

  /**
   * call the pool `SubmitOrder` RPC and return the response
   */
  async submitOrder(
    traderKey: string,
    type: OrderType,
    amount: number,
    rateFixed: number,
    duration: number,
    minUnitsMatch: number,
    feeRateSatPerKw: number,
    minNodeTier?: Tier,
  ): Promise<POOL.SubmitOrderResponse.AsObject> {
    if (rateFixed < 1) {
      throw new Error(`The rate is too low. it must equate to at least 1 sat per block`);
    }

    const req = new POOL.SubmitOrderRequest();
    req.setInitiator(POOL_INITIATOR);

    const order = new POOL.Order();
    order.setTraderKey(b64(traderKey));
    order.setAmt(amount);
    order.setRateFixed(rateFixed);
    order.setMinUnitsMatch(minUnitsMatch);
    order.setMaxBatchFeeRateSatPerKw(feeRateSatPerKw);

    switch (type) {
      case OrderType.Bid:
        const bid = new POOL.Bid();
        bid.setLeaseDurationBlocks(duration);
        bid.setVersion(ORDER_VERSION);
        if (minNodeTier !== undefined) bid.setMinNodeTier(minNodeTier);
        bid.setDetails(order);
        req.setBid(bid);
        break;
      case OrderType.Ask:
        const ask = new POOL.Ask();
        ask.setLeaseDurationBlocks(duration);
        ask.setVersion(ORDER_VERSION);
        ask.setDetails(order);
        req.setAsk(ask);
        break;
    }

    const res = await this._grpc.request(Trader.SubmitOrder, req, this._meta);
    return res.toObject();
  }

  /**
   * call the pool `CancelOrder` RPC and return the response
   */
  async cancelOrder(orderNonce: string): Promise<POOL.CancelOrderResponse.AsObject> {
    const req = new POOL.CancelOrderRequest();
    req.setOrderNonce(b64(orderNonce));
    const res = await this._grpc.request(Trader.CancelOrder, req, this._meta);
    return res.toObject();
  }

  /**
   * call the pool `Leases` RPC and return the response
   */
  async listLeases(): Promise<POOL.LeasesResponse.AsObject> {
    const req = new POOL.LeasesRequest();
    const res = await this._grpc.request(Trader.Leases, req, this._meta);
    return res.toObject();
  }

  /**
   * call the pool `BatchSnapshots` RPC and return the response
   */
  async batchSnapshots(
    numBatches: number,
    batchId?: string,
  ): Promise<AUCT.BatchSnapshotsResponse.AsObject> {
    const req = new AUCT.BatchSnapshotsRequest();
    req.setNumBatchesBack(numBatches);
    if (batchId) req.setStartBatchId(b64(batchId));
    const res = await this._grpc.request(Trader.BatchSnapshots, req, this._meta);
    return res.toObject();
  }

  /**
   * call the pool `NextBatchInfo` RPC and return the response
   */
  async nextBatchInfo(): Promise<POOL.NextBatchInfoResponse.AsObject> {
    const req = new POOL.NextBatchInfoRequest();
    const res = await this._grpc.request(Trader.NextBatchInfo, req, this._meta);
    return res.toObject();
  }

  /**
   * call the pool `NodeRatings` RPC and return the response
   */
  async nodeRatings(pubkey: string): Promise<POOL.NodeRatingResponse.AsObject> {
    const req = new POOL.NodeRatingRequest();
    req.addNodePubkeys(b64(pubkey));
    const res = await this._grpc.request(Trader.NodeRatings, req, this._meta);
    return res.toObject();
  }

  /**
   * call the pool `LeaseDurations` RPC and return the response
   */
  async leaseDurations(): Promise<POOL.LeaseDurationResponse.AsObject> {
    const req = new POOL.LeaseDurationRequest();
    const res = await this._grpc.request(Trader.LeaseDurations, req, this._meta);
    return res.toObject();
  }

  //
  // Utility functions to convert user-facing units to API units
  //

  /**
   * Converts from sats per vByte to sats per kilo-weight
   * @param satsPerVByte the number of sats per vByte
   */
  satsPerVByteToKWeight(satsPerVByte: number) {
    // convert to sats per kilo-vbyte
    const satsPerKVByte = satsPerVByte * 1000;
    // convert to sats per kilo-weight
    const satsPerKWeight = satsPerKVByte / 4;
    // ensure the kw value is above the fee rate floor
    return Math.max(satsPerKWeight, MIN_FEE_RATE_KW);
  }

  /**
   * Converts from sats per kilo-weight to sats per vByte
   * @param satsPerVByte the number of sats per kilo-weight
   */
  satsPerKWeightToVByte(satsPerKWeight: number) {
    // convert to kilo-vbyte
    const satsPerKVByte = satsPerKWeight * 4;
    // convert to vbyte
    return satsPerKVByte / 1000;
  }

  /**
   * Calculates the per block fixed rate given an amount and premium
   * @param amount the amount of the order
   * @param premium the premium being paid
   */
  calcFixedRate(amount: number, premium: number, duration: number) {
    const ratePct = (premium * 100) / amount;
    // rate = % / 100
    // rate = rateFixed / totalParts
    // rateFixed = rate * totalParts
    const interestRate = ratePct / 100;
    const rateFixedFloat = interestRate * FEE_RATE_TOTAL_PARTS;
    // We then take this rate fixed, and divide it by the number of blocks
    // as the user wants this rate to be the final lump sum they pay.
    return Math.floor(rateFixedFloat / duration);
  }

  /**
   * Calculates the percentage interest rate for a given fixed rate
   * @param fixedRate the per block fixed rate
   */
  calcPctRate(fixedRate: number, duration: number) {
    return (fixedRate * duration) / FEE_RATE_TOTAL_PARTS;
  }
}

export default PoolApi;
