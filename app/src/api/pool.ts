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
}

export default PoolApi;
