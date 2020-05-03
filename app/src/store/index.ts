import { computed, observable } from 'mobx';
import { Channel, NodeBalances, NodeInfo, Swap } from 'types/state';
import BuildSwapStore from './buildSwapStore';

/**
 * The store used to manage global app state
 */
export class Store {
  //
  // Child Stores
  //
  @observable buildSwapStore = new BuildSwapStore(this);

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

// re-export from provider
export { StoreProvider, useStore, useActions } from './provider';
