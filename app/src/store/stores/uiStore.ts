import { action, computed, observable, toJS } from 'mobx';
import { SwapState } from 'types/generated/loop_pb';
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
  /** indicates if the tour is visible */
  @observable tourVisible = false;
  @observable tourActiveStep = 0;
  /** a collection of alerts to display as toasts */
  @observable alerts = observable.map<number, Alert>();

  constructor(store: Store) {
    this._store = store;
  }

  @computed
  get fullWidth() {
    return this._store.router.location.pathname === '/pool';
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
    if (!this._store.settingsStore.tourAutoShown) {
      this.showTour();
      this._store.settingsStore.tourAutoShown = true;
    }
    this._store.log.info('Go to the Loop page');
  }

  /** Change to the History page */
  @action.bound
  goToHistory() {
    this.goTo('/history');
    this._store.settingsStore.autoCollapseSidebar();
    this._store.log.info('Go to the History page');
  }

  /** Change to the Pool page */
  @action.bound
  goToPool() {
    this.goTo('/pool');
    // always collapse the sidebar to make room for the Pool sidebar
    this._store.settingsStore.sidebarVisible = false;
    this._store.log.info('Go to the Pool page');
  }

  /** Change to the Settings page */
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
    if (!this.processingSwapsVisible) {
      this.tourGoToNext();
    }
  }

  /** Display the tour */
  @action.bound
  showTour() {
    this.tourVisible = true;
    this.tourActiveStep = 0;
    this._store.buildSwapStore.cancel();
  }

  /** Close the tour and switch back to using real data */
  @action.bound
  closeTour() {
    this.tourVisible = false;
    if (this._store.api.lnd._grpc.useSampleData) {
      // when the tour is closed, clear the sample data and load the real data
      this._store.api.lnd._grpc.useSampleData = false;
      // clear the sample data
      this._store.channelStore.channels.clear();
      this._store.swapStore.swaps.clear();
      // fetch all the real data from the backend
      this._store.fetchAllData();
      // connect and subscribe to the server-side streams
      this._store.connectToStreams();
      this._store.subscribeToStreams();
    }
  }

  /** set the current step in the tour */
  @action.bound
  setTourActiveStep(step: number) {
    this.tourActiveStep = step;

    if (step === 2) {
      // #1 is the node-status step
      // show the sidebar if autoCollapse is enabled
      if (!this._store.settingsStore.sidebarVisible) {
        this._store.settingsStore.sidebarVisible = true;
      }
      // clear the real data from the UI and load sample data
      this._store.api.lnd._grpc.useSampleData = true;
      // clear the real data
      this._store.channelStore.channels.clear();
      this._store.swapStore.swaps.clear();
      // unsubscribe from streams since we are no longer authenticated
      this._store.unsubscribeFromStreams();
      // fetch all the sample data from the backend
      this._store.fetchAllData();
    } else if (step === 3) {
      // #3 is the export icon
      // hide the sidebar if autoCollapse is enabled
      if (this._store.settingsStore.autoCollapse) {
        this._store.settingsStore.sidebarVisible = false;
      }
    } else if (step === 4) {
      // #4 is the history step
      // change the most recent swap to be pending
      this._store.swapStore.sortedSwaps[0].state = SwapState.INITIATED;
      // set the timestamp far in the future so it doesn't automatically disappear
      // from the Processing Loops list after 5 mins
      const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
      this._store.swapStore.sortedSwaps[0].lastUpdateTime = tomorrow * 1000 * 1000;
    } else if (step === 22 /* swap-progress */) {
      // #22 is the swap-progress step
      // force the swap to be 100% complete
      this._store.swapStore.sortedSwaps[0].state = SwapState.SUCCESS;
    } else if (step === 23 /* congrats */) {
      // #23 is the congrats step
      // hide the processing swaps section
      this.processingSwapsVisible = false;
    }
  }

  /** Go to the next step in the tour */
  @action.bound
  tourGoToNext() {
    if (this.tourVisible) {
      this.tourActiveStep = this.tourActiveStep + 1;
    }
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
  notify(message: string, title?: string, type: Alert['type'] = 'error') {
    const alert: Alert = { id: Date.now(), type, message, title };
    if (type === 'success') alert.ms = 3000;
    this.alerts.set(alert.id, alert);
    this._store.log.info('Added alert', toJS(this.alerts));
    if (type === 'error') {
      this._store.log.error(`[${title}] ${message}`);
    } else {
      this._store.log.info(`[${title}] ${message}`);
    }
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
