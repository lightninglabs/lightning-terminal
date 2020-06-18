import { action, observable, toJS } from 'mobx';
import { Alert } from 'types/state';
import { AuthenticationError } from 'util/errors';
import { prefixTranslation } from 'util/translate';
import { Store } from 'store';

const { l } = prefixTranslation('stores.uiStore');

type SettingName = '' | 'unit' | 'balance';

export default class UiStore {
  private _store: Store;

  /** indicates if the Processing Loops section is displayed on the Loop page */
  @observable processingSwapsVisible = false;
  /** a collection of alerts to display as toasts */
  @observable alerts = observable.map<number, Alert>();

  constructor(store: Store) {
    this._store = store;
  }

  /** navigate to the specified route */
  goTo(route: string) {
    if (this._store.router.location.pathname !== route) {
      this._store.router.push(route);
    }
  }

  /** Change to the Auth page */
  @action.bound
  gotoAuth() {
    this.goTo('/');
    this._store.log.info('Go to the Auth page');
  }

  /** Change to the Loop page */
  @action.bound
  goToLoop() {
    this.goTo('/loop');
    this._store.settingsStore.autoCollapseSidebar();
    this._store.log.info('Go to the Loop page');
  }

  /** Change to the History page */
  @action.bound
  goToHistory() {
    this.goTo('/history');
    this._store.settingsStore.autoCollapseSidebar();
    this._store.log.info('Go to the History page');
  }

  /** Change to the History page */
  @action.bound
  goToSettings() {
    this.goTo('/settings');
    this._store.settingsStore.autoCollapseSidebar();
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
    const path = name === '' ? '' : `/${name}`;
    this.goTo(`/settings${path}`);
    this._store.log.info('Switch to Setting screen', name);
  }

  /** adds a alert to the store */
  @action.bound
  notify(message: string, title?: string) {
    const alert: Alert = { id: Date.now(), type: 'error', message, title };
    this.alerts.set(alert.id, alert);
    this._store.log.info('Added alert', toJS(this.alerts));
    this._store.log.error(`[${title}] ${message}`);
  }

  /** removes an existing alert */
  @action.bound
  clearAlert(id: number) {
    this.alerts.delete(id);
    this._store.log.info('Cleared alert', id, toJS(this.alerts));
  }

  /** handle errors by showing a notification and/or the auth screen */
  @action.bound
  handleError(error: Error, title?: string) {
    if (error instanceof AuthenticationError) {
      // this will automatically redirect to the auth page
      this._store.authStore.authenticated = false;
      this.notify(l('authErrorMsg'), l('authErrorTitle'));
    } else {
      this.notify(error.message, title);
    }
  }
}
