import * as LND from 'types/generated/lnd_pb';
import { Lightning } from 'types/generated/lnd_pb_service';
import { DEV_MACAROON } from 'config';
import { grpcRequest } from './grpc';

/**
 * An API wrapper to communicate with the LND node via GRPC
 */
class LndApi {
  _meta = {
    'X-Grpc-Backend': 'lnd',
    macaroon: DEV_MACAROON,
  };

  /**
   * call the LND `GetInfo` RPC and return the response
   */
  async getInfo(): Promise<LND.GetInfoResponse.AsObject> {
    const req = new LND.GetInfoResponse();
    const res = await grpcRequest(Lightning.GetInfo, req, this._meta);
    return res.toObject();
  }

  /**
   * call the LND `ListChannels` RPC and return the response
   */
  async listChannels(): Promise<LND.ListChannelsResponse.AsObject> {
    const req = new LND.ListChannelsRequest();
    const res = await grpcRequest(Lightning.ListChannels, req, this._meta);
    return res.toObject();
  }
}

export default LndApi;
