import * as LOOP from 'types/generated/loop_pb';
import { SwapClient } from 'types/generated/loop_pb_service';
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
   * call the LND `ListSwaps` RPC and return the response
   */
  async listSwaps(): Promise<LOOP.ListSwapsResponse.AsObject> {
    const req = new LOOP.ListSwapsRequest();
    const res = await this._grpc.request(SwapClient.ListSwaps, req, this._meta);
    return res.toObject();
  }
}

export default LoopApi;
