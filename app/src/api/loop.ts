import { ListSwapsRequest, ListSwapsResponse } from 'types/generated/loop_pb';
import { SwapClient } from 'types/generated/loop_pb_service';
import { grpcRequest } from './grpc';

/**
 * An API wrapper to communicate with the Loop daemon via GRPC
 */
class LoopApi {
  private _meta = {
    'X-Grpc-Backend': 'loop',
  };

  /**
   * call the LND `ListSwaps` RPC and return the response
   */
  async listSwaps(): Promise<ListSwapsResponse.AsObject> {
    const res = await grpcRequest(
      SwapClient.ListSwaps,
      new ListSwapsRequest(),
      this._meta,
    );
    return res.toObject();
  }
}

export default LoopApi;
