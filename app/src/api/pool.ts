import * as POOL from 'types/generated/trader_pb';
import { Trader } from 'types/generated/trader_pb_service';
import BaseApi from './base';
import GrpcClient from './grpc';

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
}

export default PoolApi;
