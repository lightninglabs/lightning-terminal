import { autorun, makeAutoObservable, toJS } from 'mobx';
import { SortParams } from 'types/state';
import {
  BalanceMode,
  BitcoinExplorerPresets,
  LightningExplorerPresets,
  Unit,
} from 'util/constants';
import { prefixTranslation } from 'util/translate';
import { Store } from 'store';
import { Channel, Order, Swap } from 'store/models';
import { LeaseView } from 'store/views';

const { l } = prefixTranslation('stores.settingsStore');

export interface PersistentSettings {
  sidebarVisible: boolean;
  unit: Unit;
  balanceMode: BalanceMode;
  tourAutoShown: boolean;
  bitcoinTxUrl: string;
  lnNodeUrl: string;
  channelSort: SortParams<Channel>;
  historySort: SortParams<Swap>;
  orderSort: SortParams<Order>;
  leaseSort: SortParams<LeaseView>;
}

export default class SettingsStore {
  private _store: Store;

  /** determines if the sidebar nav is visible */
  sidebarVisible = true;

  /** determines if the sidebar should collapse automatically for smaller screen widths */
  autoCollapse = false;

  /** determines if the tour was automatically displayed on the first visit */
  tourAutoShown = false;

  /** specifies which denomination to show units in */
  unit: Unit = Unit.sats;

  /** specifies the mode to use to determine channel balance status */
  balanceMode: BalanceMode = BalanceMode.receive;

  /** url to a block explorer for onchain transactions */
  bitcoinTxUrl = BitcoinExplorerPresets['mempool.space'];

  /** url to a graph explorer for Lightning nodes */
  lnNodeUrl = LightningExplorerPresets['1ml.com'];

  /** specifies the sorting field and direction for the channel list */
  channelSort: SortParams<Channel> = {
    field: undefined,
    descending: true,
  };

  /** specifies the sorting field and direction for the channel list */
  historySort: SortParams<Swap> = {
    field: 'lastUpdateTime',
    descending: true,
  };

  /** specifies the sorting field and direction for the Pool orders list */
  orderSort: SortParams<Order> = {
    field: 'creationTimestamp',
    descending: true,
  };

  /** specifies the sorting field and direction for the Pool leases list */
  leaseSort: SortParams<LeaseView> = {
    field: 'blocksSoFar',
    descending: true,
  };

  /** the chosen language */
  lang = 'en-US';

  constructor(store: Store) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this._store = store;
  }

  /**
   * toggle the sidebar to be collapsed or expanded
   */
  toggleSidebar() {
    this._store.log.info('toggling sidebar');
    this.sidebarVisible = !this.sidebarVisible;
    this._store.log.info('updated SettingsStore.showSidebar', toJS(this.sidebarVisible));
  }

  /**
   * collapses the sidebar if `autoCollapse` is enabled
   */
  autoCollapseSidebar() {
    if (this.autoCollapse && this.sidebarVisible) {
      this.sidebarVisible = false;
    }
  }

  /**
   * sets the unit to display throughout the app
   */
  setUnit(unit: Unit) {
    this.unit = unit;
  }

  /**
   * sets the balance mode
   */
  setBalanceMode(mode: BalanceMode) {
    this.balanceMode = mode;
  }

  /**
   * sets the bitcoin and lightning explorer urls
   */
  setExplorerUrls(bitcoinTx: string, lnNode: string) {
    this.bitcoinTxUrl = bitcoinTx;
    this.lnNodeUrl = lnNode;
    this._store.appView.showSettings('');
  }

  /**
   * validates the specified network explorer url
   * @param url the url to validate
   * @param keyword a specific keyword that must be in the url
   */
  validateExplorerUrl(url: string, keyword: string) {
    if (!url) return l('required');
    if (!url.toLocaleLowerCase().startsWith('http')) return l('httpError');
    if (!url.includes(keyword)) return l('keyword', { keyword });
    return '';
  }

  /**
   * returns the full url for a bitcoin transaction on the block explorer
   * @param txid the id of the transaction
   */
  getBitcoinTxUrl(txid: string) {
    return this.bitcoinTxUrl.replace('{txid}', txid);
  }

  /**
   * returns the full url for a Lightning node on the graph explorer
   * @param pubkey the pubkey of the node
   */
  getLightningNodeUrl(pubkey: string) {
    return this.lnNodeUrl.replace('{pubkey}', pubkey);
  }

  /**
   * Sets the sort field and direction that the channel list should use
   * @param field the channel field to sort by
   * @param descending true of the order should be descending, otherwise false
   */
  setChannelSort(field: SortParams<Channel>['field'], descending: boolean) {
    this.channelSort = { field, descending };
    this._store.log.info('updated channel list sort order', toJS(this.channelSort));
  }

  /**
   * Resets the channel list sort order
   */
  resetChannelSort() {
    this.channelSort = {
      field: undefined,
      descending: true,
    };
    this._store.log.info('reset channel list sort order', toJS(this.channelSort));
  }

  /**
   * Sets the sort field and direction that the swap history list should use
   * @param field the swap field to sort by
   * @param descending true of the order should be descending, otherwise false
   */
  setHistorySort(field: SortParams<Swap>['field'], descending: boolean) {
    this.historySort = { field, descending };
    this._store.log.info('updated history list sort order', toJS(this.historySort));
  }

  /**
   * Sets the sort field and direction that the orders list should use
   * @param field the order field to sort by
   * @param descending true of the order should be descending, otherwise false
   */
  setOrderSort(field: SortParams<Order>['field'], descending: boolean) {
    this.orderSort = { field, descending };
    this._store.log.info('updated orders list sort order', toJS(this.orderSort));
  }

  /**
   * Sets the sort field and direction that the leases list should use
   * @param field the lease field to sort by
   * @param descending true of the lease should be descending, otherwise false
   */
  setLeaseSort(field: SortParams<LeaseView>['field'], descending: boolean) {
    this.leaseSort = { field, descending };
    this._store.log.info('updated leases list sort lease', toJS(this.leaseSort));
  }

  /**
   * initialized the settings and auto-save when a setting is changed
   */
  init() {
    this.load();
    autorun(
      () => {
        const settings: PersistentSettings = {
          sidebarVisible: this.sidebarVisible,
          unit: this.unit,
          balanceMode: this.balanceMode,
          tourAutoShown: this.tourAutoShown,
          bitcoinTxUrl: this.bitcoinTxUrl,
          lnNodeUrl: this.lnNodeUrl,
          channelSort: toJS(this.channelSort),
          historySort: toJS(this.historySort),
          orderSort: toJS(this.orderSort),
          leaseSort: toJS(this.leaseSort),
        };
        this._store.storage.set('settings', settings);
        this._store.log.info('saved settings to localStorage', settings);
      },
      { name: 'settingsAutorun' },
    );
  }

  /**
   * load settings from the browser's local storage
   */
  load() {
    this._store.log.info('loading settings from localStorage');
    const settings = this._store.storage.get<PersistentSettings>('settings');
    if (settings) {
      this.sidebarVisible = settings.sidebarVisible;
      this.unit = settings.unit;
      this.balanceMode = settings.balanceMode;
      this.tourAutoShown = settings.tourAutoShown;
      if (settings.bitcoinTxUrl) this.bitcoinTxUrl = settings.bitcoinTxUrl;
      if (settings.lnNodeUrl) this.lnNodeUrl = settings.lnNodeUrl;
      if (settings.channelSort) this.channelSort = settings.channelSort;
      if (settings.historySort) this.historySort = settings.historySort;
      if (settings.orderSort) this.orderSort = settings.orderSort;
      if (settings.leaseSort) this.leaseSort = settings.leaseSort;
      this._store.log.info('loaded settings', settings);
    }

    // enable automatic sidebar collapsing for smaller screens
    if (window.innerWidth && window.innerWidth <= 1200) {
      this.autoCollapse = true;
      this.sidebarVisible = false;
    }
  }
}
