import { action, observable, toJS } from 'mobx';
import { Alert } from 'types/state';
import { Store } from 'store';

type PageName = 'loop' | 'history' | 'settings';

type SettingName = 'general' | 'unit' | 'balance';

export default class UiStore {
  private _store: Store;

  /** the current page being displayed */
  @observable page: PageName = 'loop';
  /** indicates if the Processing Loops section is displayed on the Loop page */
  @observable processingSwapsVisible = false;
  /** the selected setting on the Settings page */
  @observable selectedSetting: SettingName = 'general';
  /** a collection of alerts to display as toasts */
  @observable alerts = observable.map<number, Alert>();

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
    this.selectedSetting = 'general';
    this._store.log.info('Go to the Settings page');
  }

  /** Toggle displaying of the Processing Loops section */
  @action.bound
  toggleProcessingSwaps() {
    this.processingSwapsVisible = !this.processingSwapsVisible;
  }

  /** sets the selected setting to display */
  @action.bound
  showSettings(name: SettingName) {
    this.selectedSetting = name;
    this._store.log.info('Switch to Setting screen', name);
  }

  /** adds a alert to the store */
  @action.bound
  notify(message: string, title?: string) {
    const alert: Alert = { id: Date.now(), type: 'error', message, title };
    this.alerts.set(alert.id, alert);
    this._store.log.info('Added alert', message, toJS(this.alerts));
  }

  /** removes an existing alert */
  @action.bound
  clearAlert(id: number) {
    this.alerts.delete(id);
    this._store.log.info('Cleared alert', id, toJS(this.alerts));
  }
}
