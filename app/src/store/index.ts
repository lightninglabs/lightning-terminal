import { observable } from 'mobx';
import { Channel, NodeInfo, Swap } from 'types/state';

/**
 * The store used to manage global app state
 */
export class Store {
  @observable info?: NodeInfo = undefined;
  @observable channels: Channel[] = [];
  @observable swaps: Swap[] = [];
}

// re-export from provider
export { StoreProvider, useStore, useActions } from './provider';
