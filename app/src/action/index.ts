import GrpcClient from 'api/grpc';
import { Store } from 'store';

export interface StoreActions {}

/**
 * Creates actions that modify the state of the given mobx store
 * @param store the Store instance that the actions will modify
 * @param grpcClient optionally provide an alternate grpc client if necessary
 */
export const createActions = (store: Store, grpcClient?: GrpcClient) => {
  return {};
};
