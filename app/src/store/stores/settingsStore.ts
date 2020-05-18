import { action, observable, toJS } from 'mobx';
import { Unit } from 'util/constants';
import { Store } from 'store';

export default class SettingsStore {
  private _store: Store;

  /** determines if the sidebar nav is visible */
  @observable sidebarVisible = true;

  /** specifies which denomination to show units in */
  @observable unit: Unit = Unit.sats;

  /** the chosen language */
  @observable lang = 'en-US';

  constructor(store: Store) {
    this._store = store;
  }

  /**
   * toggle the sidebar to be collapsed or expanded
   */
  @action.bound toggleSidebar() {
    this._store.log.info('toggling sidebar');
    this.sidebarVisible = !this.sidebarVisible;
    this._store.log.info('updated SettingsStore.showSidebar', toJS(this.sidebarVisible));
  }

  /**
   * sets the unit to display throughout the app
   * @param unit the new unit to use
   */
  @action.bound setUnit(unit: Unit) {
    this.unit = unit;
  }
}
