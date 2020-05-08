import { computed, observable } from 'mobx';
import { Channel, NodeBalances, NodeInfo, Swap, Terms } from 'types/state';
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
  @observable channels: Channel[] = [];
  @observable swaps: Swap[] = [];
  @observable terms: Terms = {
    in: { min: 0, max: 0 },
    out: { min: 0, max: 0 },
  };

  //
  // computed data
  //

  /**
   * the sum of remote balance of all channels
   */
  @computed get totalInbound() {
    return this.channels.reduce((sum, chan) => sum + chan.remoteBalance, 0);
  }

  /**
   * the sum of local balance of all channels
   */
  @computed get totalOutbound() {
    return this.channels.reduce((sum, chan) => sum + chan.localBalance, 0);
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
