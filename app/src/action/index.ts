import GrpcClient from 'api/grpc';
import LndApi from 'api/lnd';
import LoopApi from 'api/loop';
import { Store } from 'store';
import AppAction from './app';
import NodeAction from './node';
import SwapAction from './swap';

export interface StoreActions {
  app: AppAction;
  node: NodeAction;
  swap: SwapAction;
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
  const loopApi = new LoopApi(grpc);

  // actions exposed to UI components
  const app = new AppAction(store);
  const node = new NodeAction(store, lndApi);
  const swap = new SwapAction(store, loopApi);

  return {
    app,
    node,
    swap,
  };
};
