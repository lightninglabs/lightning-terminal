import { makeAutoObservable } from 'mobx';
import { ellipseInside } from 'util/strings';
import { Store } from 'store';

export default class CloseAccountView {
  private _store: Store;

  // editable form fields
  destination = '';
  satsPerVbyte = 0;

  constructor(store: Store) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this._store = store;
  }

  //
  // Computed properties
  //

  get hasActiveAccount() {
    return !!this._store.accountStore.activeTraderKey;
  }

  get walletBalance() {
    return this._store.nodeStore.wallet.confirmedBalance;
  }

  get accountBalance() {
    return this.hasActiveAccount
      ? this._store.accountStore.activeAccount.availableBalance
      : Big(0);
  }

  get destinationEllipsed() {
    return ellipseInside(this.destination);
  }

  /** determines if the current values are all valid */
  get isValid() {
    return ![this.satsPerVbyte].includes(0);
  }

  //
  // Form field setters
  //

  setDestination(destination: string) {
    this.destination = destination;
  }

  setSatsPerVbyte(satPerVbyte: number) {
    this.satsPerVbyte = satPerVbyte;
  }

  //
  // Actions
  //

  /** shows the account summary view */
  cancel() {
    this.destination = '';
    this.satsPerVbyte = 0;
    this._store.accountSectionView.showSummary();
  }

  /** shows the confirmation view */
  confirm() {
    this._store.accountSectionView.showCloseConfirm();
  }

  /** submits the closeAccount request to the API and resets the form values if successful */
  async closeAccount() {
    if (!this.isValid) return;

    try {
      await this._store.orderStore.cancelAllOrders();
    } catch (error) {
      this._store.appView.handleError(error, 'Unable to cancel all open orders');
      return;
    }

    const satsPerKWeight = this._store.api.pool.satsPerVByteToKWeight(this.satsPerVbyte);
    // if there is an error, it will be displayed by closeAccount
    const txid = await this._store.accountStore.closeAccount(
      satsPerKWeight,
      this.destination,
    );

    if (txid) {
      this.cancel();
    }
  }
}
