import { makeAutoObservable } from 'mobx';
import Big from 'big.js';
import { prefixTranslation } from 'util/translate';
import { Store } from 'store';

const { l } = prefixTranslation('views.FundAccountView');

export default class FundAccountView {
  private _store: Store;

  // editable form fields
  amount = 0;
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

  get walletBalance() {
    return this._store.nodeStore.wallet.confirmedBalance;
  }

  get accountBalance() {
    return this.hasActiveAccount
      ? this._store.accountStore.activeAccount.availableBalance
      : Big(0);
  }

  get newBalance() {
    return this.accountBalance.plus(this.amount);
  }

  /** the error message if the amount is invalid */
  get amountError() {
    if (!this.amount) return '';
    if (this.walletBalance.lt(this.amount)) {
      return l('amountTooHigh');
    }
    return '';
  }

  /** determines if the current values are all valid */
  get isValid() {
    return ![this.amount, this.satsPerVbyte].includes(0) && !this.amountError;
  }

  //
  // Form field setters
  //

  setAmount(amount: number) {
    this.amount = amount;
  }

  setSatsPerVbyte(satPerVbyte: number) {
    this.satsPerVbyte = satPerVbyte;
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  //
  // Actions
  //

  /** shows the account summary view */
  cancel() {
    this.amount = 0;
    this.satsPerVbyte = 0;
    this._store.accountSectionView.showSummary();
  }

  /** shows the confirmation view */
  confirm() {
    this._store.accountSectionView.showFundConfirm();
  }

  /** submits the deposit to the API and resets the form values if successful */
  async fundAccount() {
    this.setLoading(true);
    const satsPerKWeight = this._store.api.pool.satsPerVByteToKWeight(this.satsPerVbyte);

    // if there is an error, it will be displayed by deposit
    const txid = await this._store.accountStore.deposit(this.amount, satsPerKWeight);

    if (txid) {
      this.cancel();
    }
    this.setLoading(false);
  }
}
