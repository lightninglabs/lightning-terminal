import GrpcClient from 'api/grpc';
import LndApi from 'api/lnd';
import { Store } from 'store';
import AppAction from './app';
import NodeAction from './node';

export interface StoreActions {
  app: AppAction;
  node: NodeAction;
}

/**
 * Creates actions that modify the state of the given mobx store
 * @param store the Store instance that the actions will modify
 * @param grpcClient optionally provide an alternate grpc client if necessary
 */
export const createActions = (store: Store, grpcClient?: GrpcClient): StoreActions => {
  // low level dependencies
  const grpc = grpcClient || new GrpcClient();
  const lndApi = new LndApi(grpc);

  // actions exposed to UI components
  const app = new AppAction(store);
  const node = new NodeAction(store, lndApi);

  return {
    app,
    node,
  };
};
