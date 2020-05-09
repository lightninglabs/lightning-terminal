import { observable } from 'mobx';
import { NodeBalances, NodeInfo, Swap, Terms } from 'types/state';
import { actionLog, Logger } from 'util/log';
import { GrpcClient, LndApi, LoopApi } from 'api';
import BuildSwapStore from './buildSwapStore';
import ChannelStore from './channelStore';

/**
 * The store used to manage global app state
 */
export class Store {
  //
  // Child Stores
  //
  @observable buildSwapStore = new BuildSwapStore(this);
  @observable channelStore = new ChannelStore(this);

  /** the backend api services to be used by child stores */
  api: {
    lnd: LndApi;
    loop: LoopApi;
  };

  log: Logger;

  constructor(lnd: LndApi, loop: LoopApi, log: Logger) {
    this.api = { lnd, loop };
    this.log = log;

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
  @observable swaps: Swap[] = [];
  @observable terms: Terms = {
    in: { min: 0, max: 0 },
    out: { min: 0, max: 0 },
  };

  /**
   * load initial data to populate the store
   */
  async init() {
    await this.channelStore.fetchChannels();
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

  return new Store(lndApi, loopApi, actionLog);
};

// re-export from provider
export { StoreProvider, useStore, useActions } from './provider';
