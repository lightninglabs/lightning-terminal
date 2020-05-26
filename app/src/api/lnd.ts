import * as LND from 'types/generated/lnd_pb';
import { Lightning } from 'types/generated/lnd_pb_service';
import GrpcClient from './grpc';

/**
 * An API wrapper to communicate with the LND node via GRPC
 */
class LndApi {

  private _grpc: GrpcClient;

  constructor(grpc: GrpcClient) {
    this._grpc = grpc;
  }

  /**
   * call the LND `GetInfo` RPC and return the response
   */
  async getInfo(): Promise<LND.GetInfoResponse.AsObject> {
    const req = new LND.GetInfoRequest();
    const res = await this._grpc.request(Lightning.GetInfo, req);
    return res.toObject();
  }

  /**
   * call the LND `ChannelBalance` RPC and return the response
   */
  async channelBalance(): Promise<LND.ChannelBalanceResponse.AsObject> {
    const req = new LND.ChannelBalanceRequest();
    const res = await this._grpc.request(Lightning.ChannelBalance, req);
    return res.toObject();
  }

  /**
   * call the LND `WalletBalance` RPC and return the response
   */
  async walletBalance(): Promise<LND.WalletBalanceResponse.AsObject> {
    const req = new LND.WalletBalanceRequest();
    const res = await this._grpc.request(Lightning.WalletBalance, req);
    return res.toObject();
  }

  /**
   * call the LND `ListChannels` RPC and return the response
   */
  async listChannels(): Promise<LND.ListChannelsResponse.AsObject> {
    const req = new LND.ListChannelsRequest();
    const res = await this._grpc.request(Lightning.ListChannels, req);
    return res.toObject();
  }
}

export default LndApi;
