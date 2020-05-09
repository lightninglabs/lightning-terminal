import { observable } from 'mobx';
import { Logger } from 'util/log';
import { LndApi, LoopApi } from 'api';
import {
  BuildSwapStore,
  ChannelStore,
  NodeStore,
  SettingsStore,
  SwapStore,
} from './stores';

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
  @observable nodeStore = new NodeStore(this);
  @observable settingsStore = new SettingsStore(this);

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
  }

  /**
   * load initial data to populate the store
   */
  async init() {
    await this.channelStore.fetchChannels();
    await this.swapStore.fetchSwaps();
    await this.nodeStore.fetchBalances();
  }
}
