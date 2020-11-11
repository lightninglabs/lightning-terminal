import { autorun, makeAutoObservable, toJS } from 'mobx';
import { SortParams } from 'types/state';
import { BalanceMode, Unit } from 'util/constants';
import { Store } from 'store';
import { Channel, Order, Swap } from 'store/models';

export interface PersistentSettings {
  sidebarVisible: boolean;
  unit: Unit;
  balanceMode: BalanceMode;
  tourAutoShown: boolean;
  channelSort: SortParams<Channel>;
  historySort: SortParams<Swap>;
  orderSort: SortParams<Order>;
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
          channelSort: toJS(this.channelSort),
          historySort: toJS(this.historySort),
          orderSort: toJS(this.orderSort),
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
      if (settings.channelSort) this.channelSort = settings.channelSort;
      if (settings.historySort) this.historySort = settings.historySort;
      if (settings.orderSort) this.orderSort = settings.orderSort;
      this._store.log.info('loaded settings', settings);
    }

    // enable automatic sidebar collapsing for smaller screens
    if (window.innerWidth && window.innerWidth <= 1200) {
      this.autoCollapse = true;
      this.sidebarVisible = false;
    }
  }
}
