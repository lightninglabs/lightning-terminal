import { action, computed, observable, runInAction } from 'mobx';
import Big from 'big.js';
import { formatSats } from 'util/formatters';
import { prefixTranslation } from 'util/translate';
import { Store } from 'store';
import { OrderType } from 'store/models/order';

const FEE_RATE_MINIMUM = 253;

const { l } = prefixTranslation('stores.orderFormStore');

export default class OrderFormStore {
  private _store: Store;

  /** the currently selected type of the order */
  @observable orderType: OrderType = OrderType.Bid;
  @observable amount = 0;
  @observable duration = 0;
  @observable interestRate = 0;
  @observable feeRate = 0;

  constructor(store: Store) {
    this._store = store;
  }

  @computed get options() {
    return [
      { label: l('buy'), value: OrderType.Bid },
      { label: l('sell'), value: OrderType.Ask },
    ];
  }

  /** the formatted amount in the chosen unit */
  @computed get amountInfo() {
    return formatSats(Big(this.amount), { unit: this._store.settingsStore.unit });
  }

  /** the error message if the amount is invalid */
  @computed get amountError() {
    if (!this.amount) return '';
    if (this.amount % 100000 !== 0) {
      return l('amountErrorMultiple');
    }
    return '';
  }

  /** the label for the duration field */
  @computed get durationLabel() {
    return this.orderType === OrderType.Bid ? l('durationMin') : l('durationMax');
  }

  /** the duration expressed in weeks or months */
  @computed get durationInfo() {
    if (!this.duration) return '';
    const weeks = Math.floor(this.duration / 144 / 7);
    if (weeks < 8) {
      return l('durationWeeks', { count: weeks });
    }
    const months = weeks / 4.3;
    return l('durationMonths', { count: months.toFixed(1) });
  }

  /** the total and per-block premium for the order */
  @computed get interestRateInfo() {
    if ([this.amount, this.interestRate, this.duration].includes(0)) return '';

    const premium = Big(this.amount).mul(this.interestRate / 100);
    const perBlock = premium.div(this.duration);
    if (+perBlock < 1) return '';

    const premiumSats = formatSats(premium);
    const perBlockSats = formatSats(perBlock, { withSuffix: false });
    const action =
      this.orderType === OrderType.Bid
        ? l('interestRateActionPay')
        : l('interestRateActionEarn');
    return l('interestRateInfo', { action, premiumSats, perBlockSats });
  }

  /** the error message if the rate is invalid */
  @computed get interestRateError() {
    if ([this.amount, this.duration, this.interestRate].includes(0)) return '';

    const earned = Big(this.amount).mul(this.interestRate / 100);
    const perBlock = earned.div(this.duration);
    if (+perBlock < 1) {
      return l('interestRateErrorPerBlock', { rate: perBlock.toFixed(2) });
    }
    return '';
  }

  /** the error message if the fee rate is invalid */
  @computed get feeRateError() {
    if (!this.feeRate) return '';
    if (this.feeRate < FEE_RATE_MINIMUM) {
      return l('feeRateErrorMin', { min: FEE_RATE_MINIMUM });
    }
    return '';
  }

  /** the label for the place order button */
  @computed get placeOrderLabel() {
    const action = this.orderType === OrderType.Bid ? l('buy') : l('sell');
    return l('placeOrderLabel', { action });
  }

  /** determines if the current values are all valid */
  @computed get isValid() {
    return (
      ![this.amount, this.duration, this.interestRate, this.feeRate].includes(0) &&
      !this.amountError &&
      !this.interestRateError &&
      !this.feeRateError
    );
  }

  @action.bound
  setOrderType(orderType: string) {
    this.orderType = orderType as OrderType;
  }

  @action.bound
  setAmount(amount: number) {
    this.amount = amount;
  }

  @action.bound
  setDuration(duration: number) {
    this.duration = duration;
  }

  @action.bound
  setInterestRate(interestRate: number) {
    this.interestRate = interestRate;
  }

  @action.bound
  setFeeRate(feeRate: number) {
    this.feeRate = feeRate;
  }

  /** submits the order to the API and resets the form values if successful */
  @action.bound
  async placeOrder() {
    const nonce = await this._store.orderStore.submitOrder(
      this.orderType,
      this.amount,
      this.interestRate,
      this.duration,
      this.feeRate,
    );
    runInAction('placeOrderContinuation', () => {
      if (nonce) {
        this.amount = 0;
        this.duration = 0;
        this.interestRate = 0;
      }
    });

    return nonce;
  }
}
