import { action, autorun, observable, runInAction } from 'mobx';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { IS_DEV, IS_TEST } from 'config';
import { createBrowserHistory } from 'history';
import AppStorage from 'util/appStorage';
import CsvExporter from 'util/csv';
import { actionLog, Logger } from 'util/log';
import { GrpcClient, PoolApi, LndApi, LoopApi } from 'api';
import {
  AccountStore,
  AuthStore,
  BuildSwapStore,
  ChannelStore,
  NodeStore,
  OrderStore,
  SettingsStore,
  SwapStore,
  UiStore,
} from './stores';

/**
 * The store used to manage global app state
 */
export class Store {
  //
  // Child Stores
  //
  accountStore = new AccountStore(this);
  authStore = new AuthStore(this);
  buildSwapStore = new BuildSwapStore(this);
  channelStore = new ChannelStore(this);
  swapStore = new SwapStore(this);
  nodeStore = new NodeStore(this);
  orderStore = new OrderStore(this);
  settingsStore = new SettingsStore(this);
  uiStore = new UiStore(this);

  /** the store which synchronizes with the browser history */
  router = new RouterStore();

  /** the backend api services to be used by child stores */
  api: {
    lnd: LndApi;
    loop: LoopApi;
    pool: PoolApi;
  };

  /** the logger for actions to use when modifying state */
  log: Logger;

  /** the wrapper class around persistent storage */
  storage: AppStorage;

  /** the class to use for exporting lists of models to CSV */
  csv: CsvExporter;

  // a flag to indicate when the store has completed all of its
  // API requests requested during initialization
  @observable initialized = false;
  // a flag to indicate when the websocket streams are connected
  @observable streamsConnected = false;

  constructor(
    lnd: LndApi,
    loop: LoopApi,
    pool: PoolApi,
    storage: AppStorage,
    csv: CsvExporter,
    log: Logger,
  ) {
    this.api = { lnd, loop, pool };
    this.storage = storage;
    this.csv = csv;
    this.log = log;
  }

  /**
   * load initial data to populate the store
   */
  @action.bound
  async init() {
    this.settingsStore.init();
    this.swapStore.init();
    await this.authStore.init();
    runInAction('init', () => {
      this.initialized = true;
    });

    // this function will automatically run whenever the authenticated
    // flag is changed
    autorun(
      async () => {
        if (this.authStore.authenticated) {
          // go to the Loop page when the user is authenticated. it can be from
          // entering a password or from loading the credentials from storage.
          // only do this if the auth page is currently being viewed, otherwise
          // stay on the current page (ex: history, settings)
          if (document.location.pathname === '/') {
            this.uiStore.goToLoop();
          }
          // also fetch all the data we need
          this.fetchAllData();
          // connect and subscribe to the server-side streams
          this.connectToStreams();
          this.subscribeToStreams();
        } else {
          // go to auth page if we are not authenticated
          this.uiStore.gotoAuth();
          // unsubscribe from streams since we are no longer authenticated
          this.unsubscribeFromStreams();
        }
      },
      { name: 'authenticatedAutorun' },
    );
  }

  /**
   * makes the initial API calls to fetch the data we need to display in the app
   */
  @action.bound
  async fetchAllData() {
    await this.nodeStore.fetchInfo();
    await this.channelStore.fetchChannels();
    await this.swapStore.fetchSwaps();
    await this.nodeStore.fetchBalances();
  }

  /** connects to the LND and Loop websocket streams if not already connected */
  @action.bound
  connectToStreams() {
    if (this.streamsConnected) return;

    const { lnd, loop } = this.api;
    lnd.connectStreams();
    loop.connectStreams();
    this.streamsConnected = true;
  }

  /**
   * subscribes to the LND and Loop streaming endpoints
   */
  @action.bound
  subscribeToStreams() {
    const { lnd, loop } = this.api;
    lnd.on('transaction', this.nodeStore.onTransaction);
    lnd.on('channel', this.channelStore.onChannelEvent);
    loop.on('monitor', this.swapStore.onSwapUpdate);
  }

  /**
   * unsubscribes from the LND and Loop streaming endpoints
   */
  @action.bound
  unsubscribeFromStreams() {
    const { lnd, loop } = this.api;
    lnd.off('transaction', this.nodeStore.onTransaction);
    lnd.off('channel', this.channelStore.onChannelEvent);
    loop.off('monitor', this.swapStore.onSwapUpdate);
  }
}

/**
 * Creates an initialized Store instance with the dependencies injected
 * @param grpcClient an alternate GrpcClient to use instead of the default
 * @param appStorage an alternate AppStorage to use instead of the default
 */
export const createStore = (grpcClient?: GrpcClient, appStorage?: AppStorage) => {
  const grpc = grpcClient || new GrpcClient();
  const storage = appStorage || new AppStorage();
  const lndApi = new LndApi(grpc);
  const loopApi = new LoopApi(grpc);
  const poolApi = new PoolApi(grpc);
  const csv = new CsvExporter();

  const store = new Store(lndApi, loopApi, poolApi, storage, csv, actionLog);

  // connect router store to browser history
  syncHistoryWithStore(createBrowserHistory(), store.router);

  // initialize the store immediately to fetch API data, except when running unit tests
  if (!IS_TEST) store.init();

  // in dev env, make the store accessible via the browser DevTools console
  if (IS_DEV) (global as any).store = store;

  return store;
};
