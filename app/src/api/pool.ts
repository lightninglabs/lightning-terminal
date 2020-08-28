import * as POOL from 'types/generated/trader_pb';
import { Trader } from 'types/generated/trader_pb_service';
import { b64 } from 'util/strings';
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
}

export default PoolApi;
