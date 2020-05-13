import * as LND from 'types/generated/lnd_pb';
import { Lightning } from 'types/generated/lnd_pb_service';
import { DEV_MACAROON } from 'config';
import GrpcClient from './grpc';

/**
 * An API wrapper to communicate with the LND node via GRPC
 */
class LndApi {
  _meta = {
    'X-Grpc-Backend': 'lnd',
    macaroon: DEV_MACAROON,
  };

  private _grpc: GrpcClient;

  constructor(grpc: GrpcClient) {
    this._grpc = grpc;
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
}

export default LndApi;
