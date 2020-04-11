import * as LOOP from 'types/generated/loop_pb';
import { SwapClient } from 'types/generated/loop_pb_service';
import { grpcRequest } from './grpc';

/**
 * An API wrapper to communicate with the Loop daemon via GRPC
 */
class LoopApi {
  _meta = {
    'X-Grpc-Backend': 'loop',
  };

  /**
   * call the LND `ListSwaps` RPC and return the response
   */
  async listSwaps(): Promise<LOOP.ListSwapsResponse.AsObject> {
    const req = new LOOP.ListSwapsRequest();
    const res = await grpcRequest(SwapClient.ListSwaps, req, this._meta);
    return res.toObject();
  }
}

export default LoopApi;
