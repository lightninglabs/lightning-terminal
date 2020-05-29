import { autorun, observable } from 'mobx';
import { IS_DEV, IS_TEST } from 'config';
import AppStorage from 'util/appStorage';
import CsvExporter from 'util/csv';
import { actionLog, Logger } from 'util/log';
import { GrpcClient, LndApi, LoopApi } from 'api';
import {
  BuildSwapStore,
  ChannelStore,
  NodeStore,
  SettingsStore,
  SwapStore,
  UiStore,
} from './stores';
import AuthStore from './stores/authStore';
import { PersistentSettings } from './stores/settingsStore';

/**
 * The store used to manage global app state
 */
export class Store {
  //
  // Child Stores
  //
  authStore = new AuthStore(this);
  buildSwapStore = new BuildSwapStore(this);
  channelStore = new ChannelStore(this);
  swapStore = new SwapStore(this);
  nodeStore = new NodeStore(this);
  settingsStore = new SettingsStore(this);
  uiStore = new UiStore(this);

  /** the backend api services to be used by child stores */
  api: {
    lnd: LndApi;
    loop: LoopApi;
  };

  /** the logger for actions to use when modifying state */
  log: Logger;

  /** the wrapper class around persistent storage */
  storage: AppStorage<PersistentSettings>;

  /** the class to use for exporting lists of models to CSV */
  csv: CsvExporter;

  // a flag to indicate when the store has completed all of its
  // API requests requested during initialization
  @observable initialized = false;

  constructor(
    lnd: LndApi,
    loop: LoopApi,
    storage: AppStorage<PersistentSettings>,
    csv: CsvExporter,
    log: Logger,
  ) {
    this.api = { lnd, loop };
    this.storage = storage;
    this.csv = csv;
    this.log = log;
  }

  /**
   * load initial data to populate the store
   */
  async init() {
    this.settingsStore.init();
    await this.authStore.init();
    this.initialized = true;

    // this function will automatically run whenever the authenticated
    // flag is changed
    autorun(async () => {
      if (this.authStore.authenticated) {
        // go to the Loop page when the user is authenticated. it can be from
        // entering a password or from loading the credentials from storage
        this.uiStore.goToLoop();
        // also fetch all the data we need
        await this.nodeStore.fetchInfo();
        await this.channelStore.fetchChannels();
        await this.swapStore.fetchSwaps();
        await this.nodeStore.fetchBalances();
      } else {
        // go to auth page if we are not authenticated
        this.uiStore.gotoAuth();
      }
    });
  }
}

/**
 * Creates an initialized Store instance with the dependencies injected
 * @param grpcClient an alternate GrpcClient to use instead of the default
 * @param appStorage an alternate AppStorage to use instead of the default
 */
export const createStore = (
  grpcClient?: GrpcClient,
  appStorage?: AppStorage<PersistentSettings>,
) => {
  const grpc = grpcClient || new GrpcClient();
  const storage = appStorage || new AppStorage();
  const lndApi = new LndApi(grpc);
  const loopApi = new LoopApi(grpc);
  const csv = new CsvExporter();

  const store = new Store(lndApi, loopApi, storage, csv, actionLog);
  // initialize the store immediately to fetch API data, except when running unit tests
  if (!IS_TEST) store.init();

  // in dev env, make the store accessible via the browser DevTools console
  if (IS_DEV) (global as any).store = store;

  return store;
};
