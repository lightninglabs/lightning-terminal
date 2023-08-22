import { autorun, makeAutoObservable, runInAction } from 'mobx';
import { IS_DEV, IS_TEST, USE_SAMPLE_DATA } from 'config';
import { createBrowserHistory, History } from 'history';
import AppStorage from 'util/appStorage';
import CsvExporter from 'util/csv';
import { actionLog, Logger } from 'util/log';
import { GrpcClient, LitApi, LndApi, LoopApi, PoolApi } from 'api';
import { PUBLIC_URL } from '../config';
import {
  AccountStore,
  AuthStore,
  BatchStore,
  ChannelStore,
  NodeStore,
  OrderStore,
  RouterStore,
  SessionStore,
  SettingsStore,
  SubServerStore,
  SwapStore,
} from './stores';
import {
  AccountSectionView,
  AddSessionView,
  AppView,
  BatchesView,
  BuildSwapView,
  CloseAccountView,
  FundAccountView,
  FundNewAccountView,
  OrderFormView,
  OrderListView,
  RegisterSidecarView,
  RenewAccountView,
} from './views';

/**
 * The store used to manage global app state
 */
export class Store {
  //
  // Child Stores
  //
  accountStore = new AccountStore(this);
  authStore = new AuthStore(this);
  batchStore = new BatchStore(this);
  channelStore = new ChannelStore(this);
  swapStore = new SwapStore(this);
  nodeStore = new NodeStore(this);
  orderStore = new OrderStore(this);
  settingsStore = new SettingsStore(this);
  sessionStore = new SessionStore(this);
  subServerStore = new SubServerStore(this);

  /** the store which synchronizes with the browser history */
  router: RouterStore;

  //
  // UI Views state
  //
  appView = new AppView(this);
  buildSwapView = new BuildSwapView(this);
  accountSectionView = new AccountSectionView(this);
  fundNewAccountView = new FundNewAccountView(this);
  fundAccountView = new FundAccountView(this);
  closeAccountView = new CloseAccountView(this);
  renewAccountView = new RenewAccountView(this);
  orderFormView = new OrderFormView(this);
  orderListView = new OrderListView(this);
  batchesView = new BatchesView(this);
  registerSidecarView = new RegisterSidecarView(this);
  addSessionView = new AddSessionView(this);

  /** the backend api services to be used by child stores */
  api: {
    lnd: LndApi;
    loop: LoopApi;
    pool: PoolApi;
    lit: LitApi;
  };

  /** the logger for actions to use when modifying state */
  log: Logger;

  /** the wrapper class around persistent storage */
  storage: AppStorage;

  /** the class to use for exporting lists of models to CSV */
  csv: CsvExporter;

  // a flag to indicate when the store has completed all of its
  // API requests requested during initialization
  initialized = false;
  // a flag to indicate when the websocket streams are connected
  streamsConnected = false;

  constructor(
    lnd: LndApi,
    loop: LoopApi,
    pool: PoolApi,
    lit: LitApi,
    storage: AppStorage,
    history: History,
    csv: CsvExporter,
    log: Logger,
  ) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this.api = { lnd, loop, pool, lit };
    this.storage = storage;
    this.router = new RouterStore(history);
    this.csv = csv;
    this.log = log;
  }

  /**
   * load initial data to populate the store
   */
  async init() {
    this.settingsStore.init();
    this.swapStore.init();
    this.batchStore.init();
    await this.authStore.init();
    runInAction(() => {
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
          if (document.location.pathname === `${PUBLIC_URL}/`) {
            runInAction(() => {
              this.appView.goToHome();
            });
          }
          // also fetch all the data we need
          this.fetchAllData();
          // connect and subscribe to the server-side streams
          this.connectToStreams();
          this.subscribeToStreams();
        } else {
          // go to auth page if we are not authenticated
          this.appView.gotoAuth();
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
  async fetchAllData() {
    await this.subServerStore.fetchStatus();
    await this.nodeStore.fetchInfo();
    await this.channelStore.fetchChannels();
    await this.nodeStore.fetchBalances();
    await this.sessionStore.fetchSessions();

    if (this.swapStore.canFetchData) {
      await this.swapStore.fetchSwaps();
    }
  }

  /** connects to the LND and Loop websocket streams if not already connected */
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
  subscribeToStreams() {
    const { lnd, loop } = this.api;
    lnd.on('transaction', this.nodeStore.onTransaction);
    lnd.on('channel', this.channelStore.onChannelEvent);
    loop.on('monitor', this.swapStore.onSwapUpdate);
  }

  /**
   * unsubscribes from the LND and Loop streaming endpoints
   */
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
  // Resolve api requests with sample data when running client in develop mode.
  grpc.useSampleData = USE_SAMPLE_DATA;

  const storage = appStorage || new AppStorage();
  const lndApi = new LndApi(grpc);
  const loopApi = new LoopApi(grpc);
  const poolApi = new PoolApi(grpc);
  const litApi = new LitApi(grpc);
  const csv = new CsvExporter();
  const history = createBrowserHistory();

  const store = new Store(
    lndApi,
    loopApi,
    poolApi,
    litApi,
    storage,
    history,
    csv,
    actionLog,
  );

  // initialize the store immediately to fetch API data, except when running unit tests
  if (!IS_TEST) store.init();

  // in dev env, make the store accessible via the browser DevTools console
  if (IS_DEV) (global as any).store = store;

  return store;
};
