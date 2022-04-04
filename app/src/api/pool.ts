import * as AUCT from 'types/generated/auctioneerrpc/auctioneer_pb';
import * as POOL from 'types/generated/trader_pb';
import { Trader } from 'types/generated/trader_pb_service';
import Big from 'big.js';
import { Buffer } from 'buffer';
import { coerce, satisfies } from 'semver';
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

// The default order version to use if the Pool version cannot be detected
export const DEFAULT_ORDER_VERSION = 2;

// maps from the Pool version semver condition to a compatible order version
// see: https://github.com/lightninglabs/pool/blob/master/order/interfaces.go#L42
export const ORDER_VERSION_COMPAT: Record<string, number> = {
  '>=0.5.2-alpha': 5,
  '>=0.5.0-alpha': 4,
  '>=0.4.0-alpha': 2,
  '>=0.2.7-alpha': 1,
};

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
   * call the pool `GetInfo` RPC and return the response
   */
  async getInfo(): Promise<POOL.GetInfoResponse.AsObject> {
    const req = new POOL.GetInfoRequest();
    const res = await this._grpc.request(Trader.GetInfo, req, this._meta);
    return res.toObject();
  }

  /**
   * call the pool `QuoteAccount` RPC and return the response
   */
  async quoteAccount(
    amount: Big,
    confTarget: number,
  ): Promise<POOL.QuoteAccountResponse.AsObject> {
    const req = new POOL.QuoteAccountRequest();
    req.setAccountValue(amount.toString());
    req.setConfTarget(confTarget);
    const res = await this._grpc.request(Trader.QuoteAccount, req, this._meta);
    return res.toObject();
  }

  /**
   * call the pool `InitAccount` RPC and return the response
   */
  async initAccount(
    amount: Big,
    expiryBlocks: number,
    confTarget = 6,
  ): Promise<POOL.Account.AsObject> {
    const req = new POOL.InitAccountRequest();
    req.setAccountValue(amount.toString());
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
    feeRateSatPerKw: Big,
  ): Promise<POOL.RenewAccountResponse.AsObject> {
    const req = new POOL.RenewAccountRequest();
    req.setAccountKey(b64(traderKey));
    req.setRelativeExpiry(expiryBlocks);
    req.setFeeRateSatPerKw(feeRateSatPerKw.toString());

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
    output.setFeeRateSatPerKw(feeRateSatPerKw.toString());
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
    amount: Big,
    feeRateSatPerKw = 253,
  ): Promise<POOL.DepositAccountResponse.AsObject> {
    const req = new POOL.DepositAccountRequest();
    req.setTraderKey(Buffer.from(traderKey, 'hex').toString('base64'));
    req.setAmountSat(amount.toString());
    req.setFeeRateSatPerKw(feeRateSatPerKw.toString());
    const res = await this._grpc.request(Trader.DepositAccount, req, this._meta);
    return res.toObject();
  }

  /**
   * call the pool `WithdrawAccount` RPC and return the response
   */
  async withdraw(
    traderKey: string,
    amount: Big,
    feeRateSatPerKw = 253,
  ): Promise<POOL.WithdrawAccountResponse.AsObject> {
    const req = new POOL.WithdrawAccountRequest();
    req.setTraderKey(Buffer.from(traderKey, 'hex').toString('base64'));
    req.setFeeRateSatPerKw(feeRateSatPerKw.toString());
    const output = new POOL.Output();
    output.setValueSat(amount.toString());
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
   * call the pool `QuoteOrder` RPC and return the response
   */
  async quoteOrder(
    amount: Big,
    rateFixed: number,
    duration: number,
    minUnitsMatch: number,
    feeRateSatPerKw = 253,
  ): Promise<POOL.QuoteOrderResponse.AsObject> {
    const req = new POOL.QuoteOrderRequest();
    req.setAmt(amount.toString());
    req.setRateFixed(rateFixed);
    req.setLeaseDurationBlocks(duration);
    req.setMinUnitsMatch(minUnitsMatch);
    req.setMaxBatchFeeRateSatPerKw(feeRateSatPerKw.toString());

    const res = await this._grpc.request(Trader.QuoteOrder, req, this._meta);
    return res.toObject();
  }

  /**
   * call the pool `SubmitOrder` RPC and return the response
   */
  async submitOrder(
    traderKey: string,
    type: OrderType,
    amount: Big,
    rateFixed: number,
    duration: number,
    minUnitsMatch: number,
    feeRateSatPerKw = 253,
    minNodeTier?: Tier,
  ): Promise<POOL.SubmitOrderResponse.AsObject> {
    if (rateFixed < 1) {
      throw new Error(`The rate is too low. it must equate to at least 1 sat per block`);
    }

    const info = await this.getInfo();
    const orderVersion = this.getOrderVersion(info.version);

    const req = new POOL.SubmitOrderRequest();
    req.setInitiator(POOL_INITIATOR);

    const order = new POOL.Order();
    order.setTraderKey(b64(traderKey));
    order.setAmt(amount.toString());
    order.setRateFixed(rateFixed);
    order.setMinUnitsMatch(minUnitsMatch);
    order.setMaxBatchFeeRateSatPerKw(feeRateSatPerKw.toString());

    switch (type) {
      case OrderType.Bid:
        const bid = new POOL.Bid();
        bid.setLeaseDurationBlocks(duration);
        bid.setVersion(orderVersion);
        if (minNodeTier !== undefined) bid.setMinNodeTier(minNodeTier);
        bid.setDetails(order);
        req.setBid(bid);
        break;
      case OrderType.Ask:
        const ask = new POOL.Ask();
        ask.setLeaseDurationBlocks(duration);
        ask.setVersion(orderVersion);
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

  /**
   * call the pool `RegisterSidecar` RPC and return the response
   */
  async registerSidecar(ticket: string): Promise<POOL.SidecarTicket.AsObject> {
    const req = new POOL.RegisterSidecarRequest();
    req.setTicket(ticket);
    req.setAutoNegotiate(true);
    const res = await this._grpc.request(Trader.RegisterSidecar, req, this._meta);
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
  satsPerKWeightToVByte(satsPerKWeight: Big) {
    // convert to kilo-vbyte
    const satsPerKVByte = satsPerKWeight.mul(4);
    // convert to vbyte
    return satsPerKVByte.div(1000);
  }

  /**
   * Calculates the per block fixed rate given an amount and premium
   * @param amount the amount of the order
   * @param premium the premium being paid
   * @param duration the lease duration in blocks
   */
  calcFixedRate(amount: Big, premium: Big, duration: number) {
    const ratePct = premium.mul(100).div(amount);
    // rate = % / 100
    // rate = rateFixed / totalParts
    // rateFixed = rate * totalParts
    const interestRate = ratePct.div(100);
    const rateFixedFloat = interestRate.mul(FEE_RATE_TOTAL_PARTS);
    // We then take this rate fixed, and divide it by the number of blocks
    // as the user wants this rate to be the final lump sum they pay.
    return +rateFixedFloat.div(duration).round(0, Big.roundDown);
  }

  /**
   * Calculates the percentage interest rate for a given fixed rate
   * @param fixedRate the per block fixed rate
   */
  calcPctRate(fixedRate: Big, duration: Big) {
    return +fixedRate.mul(duration).div(FEE_RATE_TOTAL_PARTS);
  }

  /**
   * Determines which order version to use based on the provided version string
   * @param version the version of pool
   *    (ex: 0.5.4-alpha commit=v0.5.4-alpha.0.20220114202858-525fe156d240)
   */
  getOrderVersion(version: string): number {
    // try to convert the pool version string to a SemVer object (ex: 0.5.4)
    const verNum = coerce(version);
    if (!verNum) return DEFAULT_ORDER_VERSION;

    // find the first key which the pool version satisfies
    const matchedKey = Object.keys(ORDER_VERSION_COMPAT).find(condition =>
      satisfies(verNum, condition),
    );
    if (!matchedKey) return DEFAULT_ORDER_VERSION;

    // return the order version that was matched
    return ORDER_VERSION_COMPAT[matchedKey];
  }
}

export default PoolApi;
