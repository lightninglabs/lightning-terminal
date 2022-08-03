import { makeAutoObservable, observable, toJS } from 'mobx';
import { SwapState } from 'types/generated/loop_pb';
import { Alert } from 'types/state';
import Big from 'big.js';
import { AuthenticationError } from 'util/errors';
import { prefixTranslation } from 'util/translate';
import { Store } from 'store';
import { PUBLIC_URL } from '../../config';

const { l } = prefixTranslation('stores.appView');

type SettingName = '' | 'unit' | 'balance' | 'explorers';

export default class AppView {
  private _store: Store;

  /** indicates if the Processing Loops section is displayed on the Loop page */
  processingSwapsVisible = false;
  /** indicates if the tour is visible */
  tourVisible = false;
  tourActiveStep = 0;
  /** a collection of alerts to display as toasts */
  alerts = observable.map<number, Alert>();

  constructor(store: Store) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this._store = store;
  }

  get fullWidth() {
    return this._store.router.location.pathname === `${PUBLIC_URL}/pool`;
  }

  /** navigate to the specified route */
  goTo(route: string) {
    if (this._store.router.location.pathname !== route) {
      this._store.router.push(route);
    }
  }

  /** Change to the Auth page */
  gotoAuth() {
    this.goTo(`${PUBLIC_URL}/`);
    this._store.log.info('Go to the Auth page');
  }

  /** Change to the Home page */
  goToHome() {
    this.goTo(`${PUBLIC_URL}/home`);
    this._store.settingsStore.autoCollapseSidebar();
    this._store.log.info('Go to the Home page');
  }

  /** Change to the Loop page */
  goToLoop() {
    this.goTo(`${PUBLIC_URL}/loop`);
    this._store.settingsStore.autoCollapseSidebar();
    if (!this._store.settingsStore.tourAutoShown) {
      this.showTour();
      this._store.settingsStore.tourAutoShown = true;
    }
    this._store.log.info('Go to the Loop page');
  }

  /** Change to the History page */
  goToHistory() {
    this.goTo(`${PUBLIC_URL}/history`);
    this._store.settingsStore.autoCollapseSidebar();
    this._store.log.info('Go to the History page');
  }

  /** Change to the Pool page */
  goToPool() {
    this.goTo(`${PUBLIC_URL}/pool`);
    // always collapse the sidebar to make room for the Pool sidebar
    this._store.settingsStore.sidebarVisible = false;
    this._store.log.info('Go to the Pool page');
  }

  /** Change to the Settings page */
  goToSettings() {
    this.goTo(`${PUBLIC_URL}/settings`);
    this._store.settingsStore.autoCollapseSidebar();
    this._store.log.info('Go to the Settings page');
  }

  /** Change to the Connect page */
  goToConnect() {
    this.goTo(`${PUBLIC_URL}/connect`);
    this._store.settingsStore.autoCollapseSidebar();
    this._store.log.info('Go to the Connect page');
  }

  /** Toggle displaying of the Processing Loops section */
  toggleProcessingSwaps() {
    this.processingSwapsVisible = !this.processingSwapsVisible;
    if (!this.processingSwapsVisible) {
      this.tourGoToNext();
    }
  }

  /** Display the tour */
  showTour() {
    this.tourVisible = true;
    this.tourActiveStep = 0;
    this._store.buildSwapView.cancel();
  }

  /** Close the tour and switch back to using real data */
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
      this._store.swapStore.sortedSwaps[0].lastUpdateTime = Big(tomorrow * 1000 * 1000);
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
  tourGoToNext() {
    if (this.tourVisible) {
      this.tourActiveStep = this.tourActiveStep + 1;
    }
  }

  /** sets the selected setting to display */
  showSettings(name: SettingName) {
    const path = name === '' ? '' : `/${name}`;
    this.goTo(`${PUBLIC_URL}/settings${path}`);
    this._store.log.info('Switch to Setting screen', name);
  }

  /** adds a alert to the store */
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
  clearAlert(id: number) {
    this.alerts.delete(id);
    this._store.log.info('Cleared alert', id, toJS(this.alerts));
  }

  /** handle errors by showing a notification and/or the auth screen */
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
