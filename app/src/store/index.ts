import { IS_DEV } from 'config';
import { actionLog } from 'util/log';
import { GrpcClient, LndApi, LoopApi } from 'api';
import { Store } from './store';

/**
 * Creates an initialized Store instance with the dependencies injected
 * @param grpcClient an alternate GrpcClient to use instead of the default
 */
export const createStore = (grpcClient?: GrpcClient) => {
  const grpc = grpcClient || new GrpcClient();
  const lndApi = new LndApi(grpc);
  const loopApi = new LoopApi(grpc);

  const store = new Store(lndApi, loopApi, actionLog);
  // initialize the store immediately to fetch API data
  store.init();

  // in dev env, make the store accessible via the browser DevTools console
  if (IS_DEV) (global as any).store = store;

  return store;
};

// re-export from provider
export { StoreProvider, useStore } from './provider';
// re-export all of the child stores
export * from './stores';
// export the root store
export { Store };
