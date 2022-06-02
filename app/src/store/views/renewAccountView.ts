import { makeAutoObservable } from 'mobx';
import Big from 'big.js';
import { Store } from 'store';

// default expiration to ~90 days
export const DEFAULT_EXPIRE_BLOCKS = 12960;

export default class RenewAccountView {
  private _store: Store;

  // editable form fields
  expiryBlocks = DEFAULT_EXPIRE_BLOCKS;
  satsPerVbyte = 0;

  loading = false;

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

  get currentExpiry() {
    return this.hasActiveAccount
      ? this._store.accountStore.activeAccount.expiresInBlocks
      : 0;
  }

  get accountBalance() {
    return this.hasActiveAccount
      ? this._store.accountStore.activeAccount.availableBalance
      : Big(0);
  }

  /** determines if the current values are all valid */
  get isValid() {
    return ![this.expiryBlocks, this.satsPerVbyte].includes(0);
  }

  //
  // Form field setters
  //

  setExpiryBlocks(expiryBlocks: number) {
    this.expiryBlocks = expiryBlocks;
  }

  setSatsPerVbyte(satsPerVbyte: number) {
    this.satsPerVbyte = satsPerVbyte;
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  //
  // Actions
  //

  /** shows the account summary view */
  cancel() {
    this.expiryBlocks = DEFAULT_EXPIRE_BLOCKS;
    this.satsPerVbyte = 0;
    this._store.accountSectionView.showSummary();
  }

  /** shows the confirmation view */
  confirm() {
    this._store.accountSectionView.showRenewConfirm();
  }

  /** submits the renewAccount request to the API and resets the form values if successful */
  async renewAccount() {
    if (!this.isValid) return;

    this.setLoading(true);
    const satsPerKWeight = this._store.api.pool.satsPerVByteToKWeight(this.satsPerVbyte);
    // if there is an error, it will be displayed by renewAccount
    const txid = await this._store.accountStore.renewAccount(
      this.expiryBlocks,
      satsPerKWeight,
    );

    if (txid) {
      this.cancel();
    }
    this.setLoading(false);
  }
}
