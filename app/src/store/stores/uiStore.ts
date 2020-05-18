import { action, observable } from 'mobx';
import { Store } from 'store';

type PageName = 'loop' | 'history' | 'settings';

export default class UiStore {
  private _store: Store;

  /** the current page being displayed */
  @observable page: PageName = 'loop';
  /** indicates if the Processing Loops section is displayed on the Loop page */
  @observable processingSwapsVisible = false;

  constructor(store: Store) {
    this._store = store;
  }

  /** Change to the Loop page */
  @action.bound
  goToLoop() {
    this.page = 'loop';
    this._store.log.info('Go to the Loop page');
  }

  /** Change to the History page */
  @action.bound
  goToHistory() {
    this.page = 'history';
    this._store.log.info('Go to the History page');
  }

  /** Change to the History page */
  @action.bound
  goToSettings() {
    this.page = 'settings';
    this._store.log.info('Go to the Settings page');
  }

  /**
   * Toggle displaying of the Processing Loops section
   */
  @action.bound
  toggleProcessingSwaps() {
    this.processingSwapsVisible = !this.processingSwapsVisible;
  }
}
