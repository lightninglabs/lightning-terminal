import * as AUCT from 'types/generated/auctioneer_pb';
import * as POOL from 'types/generated/trader_pb';
import { Trader } from 'types/generated/trader_pb_service';
import { b64 } from 'util/strings';
import { OrderType } from 'store/models/order';
import BaseApi from './base';
import GrpcClient from './grpc';

// The granularity of the fixed rate used to compute the per-block interest rate.
// This needs to be large enough to ensure the the smallest possible order (100K sats),
// for the smallest possible premium (or smallest acceptable) is expressible over
// our current max lease period (6 months)
export const FEE_RATE_TOTAL_PARTS = 1e9;

// The amount of satoshis in one unit
export const ONE_UNIT = 100000;

// The duration of each order. This value is temporarily constant in the initial
// release of Pool
export const DURATION = 2016;

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
    const res = await this._grpc.request(Trader.InitAccount, req, this._meta);
    return res.toObject();
  }

  /**
   * call the pool `CloseAccount` RPC and return the response
   */
  async closeAccount(
    traderKey: string,
    feeRateSatPerKw = 253,
  ): Promise<POOL.CloseAccountResponse.AsObject> {
    const req = new POOL.CloseAccountRequest();
    req.setTraderKey(b64(traderKey));

    const output = new POOL.OutputWithFee();
    output.setFeeRateSatPerKw(feeRateSatPerKw);
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
    ratePct: number,
    duration: number,
    minUnitsMatch: number,
    feeRateSatPerKw: number,
  ): Promise<POOL.SubmitOrderResponse.AsObject> {
    const req = new POOL.SubmitOrderRequest();

    const order = new POOL.Order();
    order.setTraderKey(b64(traderKey));
    order.setAmt(amount);
    order.setRateFixed(this._pctRateToFixed(ratePct, duration));
    order.setMinUnitsMatch(minUnitsMatch);
    order.setMaxBatchFeeRateSatPerKw(feeRateSatPerKw);

    switch (type) {
      case OrderType.Bid:
        const bid = new POOL.Bid();
        bid.setLeaseDurationBlocks(duration);
        bid.setDetails(order);
        req.setBid(bid);
        break;
      case OrderType.Ask:
        const ask = new POOL.Ask();
        ask.setLeaseDurationBlocks(duration);
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
   * call the pool `BatchSnapshot` RPC and return the response
   */
  async batchSnapshot(batchId?: string): Promise<AUCT.BatchSnapshotResponse.AsObject> {
    const req = new AUCT.BatchSnapshotRequest();
    if (batchId) req.setBatchId(batchId);
    const res = await this._grpc.request(Trader.BatchSnapshot, req, this._meta);
    return res.toObject();
  }

  /**
   * convert the percentage interest rate to the per block "rate_fixed" unit
   * @param ratePct the rate between 0 and 100
   * @param duration the number of blocks
   */
  private _pctRateToFixed(ratePct: number, duration: number) {
    // rate = % / 100
    // rate = rateFixed / totalParts
    // rateFixed = rate * totalParts
    const interestRate = ratePct / 100;
    const rateFixedFloat = interestRate * FEE_RATE_TOTAL_PARTS;
    // We then take this rate fixed, and divide it by the number of blocks
    // as the user wants this rate to be the final lump sum they pay.
    const rateFixed = Math.floor(rateFixedFloat / duration);

    if (rateFixed < 1) {
      throw new Error(`The rate is too low. it must equate to at least 1 sat per block`);
    }

    return rateFixed;
  }
}

export default PoolApi;
