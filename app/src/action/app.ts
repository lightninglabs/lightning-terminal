import { action, toJS } from 'mobx';
import { log } from 'util/log';
import { Store } from 'store';

/**
 * Action used to update app level state
 */
class AppAction {
  private _store: Store;

  constructor(store: Store) {
    this._store = store;
  }

  /**
   * toggle the sidebar to be collapsed or expanded
   */
  @action.bound toggleSidebar() {
    log.info('toggling sidebar');
    this._store.sidebarCollapsed = !this._store.sidebarCollapsed;
    log.info('updated store.sidebarCollapsed', toJS(this._store.sidebarCollapsed));
  }
}

export default AppAction;
