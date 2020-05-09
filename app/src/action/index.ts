import GrpcClient from 'api/grpc';
import { Store } from 'store';
import AppAction from './app';

export interface StoreActions {
  app: AppAction;
}

/**
 * Creates actions that modify the state of the given mobx store
 * @param store the Store instance that the actions will modify
 * @param grpcClient optionally provide an alternate grpc client if necessary
 */
export const createActions = (store: Store, grpcClient?: GrpcClient): StoreActions => {
  // actions exposed to UI components
  const app = new AppAction(store);

  return {
    app,
  };
};
