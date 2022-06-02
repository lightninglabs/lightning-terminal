import { makeAutoObservable, runInAction } from 'mobx';
import Big from 'big.js';
import { BLOCKS_PER_DAY } from 'util/constants';
import { prefixTranslation } from 'util/translate';
import { Store } from 'store';

const { l } = prefixTranslation('views.fundNewAccountView');

export const DEFAULT_EXPIRE_BLOCKS = 12960;
export const DEFAULT_CONF_TARGET = 6;

export default class FundNewAccountView {
  private _store: Store;

  // editable form fields
  amount = Big(0);
  confTarget = DEFAULT_CONF_TARGET;
  expireBlocks = DEFAULT_EXPIRE_BLOCKS;
  // response from quote
  minerFee = Big(0);

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
    if (this.amount.eq(0)) return '';
    const accountMinimum = 100000;
    if (this.amount.lt(accountMinimum)) {
      return l('amountTooLow', { accountMinimum });
    }
    if (this.walletBalance.lt(this.amount)) {
      return l('amountTooHigh');
    }
    return '';
  }

  /** the error message if the expireBlocks is invalid */
  get expireBlocksError() {
    if (!this.expireBlocks) return '';
    if (this.expireBlocks < BLOCKS_PER_DAY) {
      return l('lowExpireBlocks', { blocks: BLOCKS_PER_DAY });
    }
    if (this.expireBlocks > BLOCKS_PER_DAY * 365) {
      return l('highExpireBlocks', { blocks: BLOCKS_PER_DAY * 365 });
    }
    return '';
  }

  /** the error message if the confTarget is invalid */
  get confTargetError() {
    if (!this.confTarget) return '';
    if (this.confTarget <= 1) {
      return l('lowConfTarget');
    }
    return '';
  }

  /** determines if the current values are all valid */
  get isValid() {
    return (
      ![this.amount, this.confTarget, this.expireBlocks].includes(0) && !this.amountError
    );
  }

  //
  // Form field setters
  //

  setAmount(amount: number) {
    this.amount = Big(amount);
  }

  setConfTarget(confTarget: number) {
    this.confTarget = confTarget;
  }

  setExpireBlocks(expireBlocks: number) {
    this.expireBlocks = expireBlocks;
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  //
  // Actions
  //

  /** shows the summary view */
  cancel() {
    this.amount = Big(0);
    this.confTarget = DEFAULT_CONF_TARGET;
    this.expireBlocks = DEFAULT_EXPIRE_BLOCKS;
    this._store.accountSectionView.showSummary();
  }

  /** shows the confirmation view */
  async confirm() {
    try {
      // query for the miner fee before showing the confirm view
      const { minerFeeTotal } = await this._store.api.pool.quoteAccount(
        this.amount,
        this.confTarget,
      );

      runInAction(() => {
        this.minerFee = Big(minerFeeTotal);
      });

      this._store.accountSectionView.showFundNewConfirm();
    } catch (error) {
      this._store.appView.handleError(error as Error, 'Unable to estimate miner fee');
    }
  }

  /** submits the order to the API and resets the form values if successful */
  async fundAccount() {
    this.setLoading(true);
    // if there is an error, it will be displayed by createAccount
    const traderKey = await this._store.accountStore.createAccount(
      this.amount,
      this.expireBlocks,
      this.confTarget,
    );

    if (traderKey) {
      this.cancel();
    }
    this.setLoading(false);
  }
}
