import { observable } from 'mobx';
import { NodeBalances, NodeInfo, Terms } from 'types/state';
import { IS_DEV } from 'config';
import { actionLog, Logger } from 'util/log';
import { GrpcClient, LndApi, LoopApi } from 'api';
import BuildSwapStore from './buildSwapStore';
import ChannelStore from './channelStore';
import SwapStore from './swapStore';

/**
 * The store used to manage global app state
 */
export class Store {
  //
  // Child Stores
  //
  @observable buildSwapStore = new BuildSwapStore(this);
  @observable channelStore = new ChannelStore(this);
  @observable swapStore = new SwapStore(this);

  /** the backend api services to be used by child stores */
  api: {
    lnd: LndApi;
    loop: LoopApi;
  };

  /** the logger for actions to use when modifying state */
  log: Logger;

  constructor(lnd: LndApi, loop: LoopApi, log: Logger) {
    this.api = { lnd, loop };
    this.log = log;

    // initialize the store immediately
    this.init();
  }
  //
  // App state
  //
  @observable sidebarCollapsed = false;

  //
  // API data
  //
  @observable info?: NodeInfo = undefined;
  @observable balances?: NodeBalances = undefined;
  @observable terms: Terms = {
    in: { min: 0, max: 0 },
    out: { min: 0, max: 0 },
  };

  /**
   * load initial data to populate the store
   */
  async init() {
    await this.channelStore.fetchChannels();
    await this.swapStore.fetchSwaps();
  }
}

/**
 * Creates an initialized Store instance with the dependencies injected
 * @param grpcClient an alternate GrpcClient to use instead of the default
 */
export const createStore = (grpcClient?: GrpcClient) => {
  const grpc = grpcClient || new GrpcClient();
  const lndApi = new LndApi(grpc);
  const loopApi = new LoopApi(grpc);

  const store = new Store(lndApi, loopApi, actionLog);

  // in dev env, make the store accessible via the browser DevTools console
  if (IS_DEV) (global as any).store = store;

  return store;
};

// re-export from provider
export { StoreProvider, useStore, useActions } from './provider';
