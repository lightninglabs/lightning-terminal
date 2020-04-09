import { GetInfoResponse, ListChannelsRequest } from 'types/generated/lnd_pb';
import { Lightning } from 'types/generated/lnd_pb_service';
import { Channel, NodeInfo } from 'types/state';
import { DEV_MACAROON } from 'config';
import { grpcRequest } from './grpc';

/**
 * An API wrapper to communicate with the LND node via GRPC
 */
class LndApi {
  private _meta = {
    'X-Grpc-Backend': 'lnd',
    macaroon: DEV_MACAROON,
  };

  /**
   * call the LND `GetInfo` RPC and return the response
   */
  async getInfo(): Promise<NodeInfo> {
    const res = await grpcRequest(Lightning.GetInfo, new GetInfoResponse(), this._meta);
    return res.toObject();
  }

  /**
   * call the LND `ListChannels` RPC and return the response
   */
  async listChannels(): Promise<Channel[]> {
    const res = await grpcRequest(
      Lightning.ListChannels,
      new ListChannelsRequest(),
      this._meta,
    );
    return res.toObject().channelsList.map(c => ({
      chanId: c.chanId,
      remotePubkey: c.remotePubkey,
      capacity: c.capacity,
      localBalance: c.localBalance,
      remoteBalance: c.remoteBalance,
      uptime: c.uptime,
      active: c.active,
    }));
  }
}

export default LndApi;
