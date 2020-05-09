import { action, observable, toJS } from 'mobx';
import { Store } from 'store';

export default class SettingsStore {
  private _store: Store;

  @observable sidebarVisible = true;

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
}
