import { action, computed, observable, runInAction } from 'mobx';
import { prefixTranslation } from 'util/translate';
import { DURATION, ONE_UNIT } from 'api/pool';
import { Store } from 'store';
import { OrderType } from 'store/models/order';

const FEE_RATE_MINIMUM = 253;

const { l } = prefixTranslation('stores.orderFormStore');

export default class OrderFormStore {
  private _store: Store;

  /** the currently selected type of the order */
  @observable orderType: OrderType = OrderType.Bid;
  @observable amount = 0;
  @observable premium = 0;
  @observable minChanSize = 0;
  @observable maxBatchFeeRate = 0;

  constructor(store: Store) {
    this._store = store;
  }

  @computed get orderOptions() {
    return [
      { label: l('buy'), value: OrderType.Bid },
      { label: l('sell'), value: OrderType.Ask },
    ];
  }

  /** the error message if the amount is invalid */
  @computed get amountError() {
    if (!this.amount) return '';
    if (this.amount % ONE_UNIT !== 0) {
      return l('errorMultiple');
    }
    return '';
  }

  /** the error message if the min chan size is invalid */
  @computed get minChanSizeError() {
    if (!this.minChanSize) return '';
    if (this.minChanSize % ONE_UNIT !== 0) {
      return l('errorMultiple');
    }
    if (this.amount && this.minChanSize > this.amount) {
      return l('errorLiquidity');
    }
    return '';
  }

  /** the error message if the fee rate is invalid */
  @computed get feeRateError() {
    if (!this.maxBatchFeeRate) return '';
    if (this.maxBatchFeeRate < FEE_RATE_MINIMUM) {
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
      ![this.amount, this.premium, this.minChanSize, this.maxBatchFeeRate].includes(0) &&
      !this.amountError &&
      !this.minChanSizeError &&
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
  setPremium(premium: number) {
    this.premium = premium;
  }

  @action.bound
  setMinChanSize(minChanSize: number) {
    this.minChanSize = minChanSize;
  }

  @action.bound
  setMaxBatchFeeRate(feeRate: number) {
    this.maxBatchFeeRate = feeRate;
  }

  /** submits the order to the API and resets the form values if successful */
  @action.bound
  async placeOrder() {
    const ratePct = Math.floor((this.premium * 100) / this.amount);
    const minUnitsMatch = Math.floor(this.minChanSize / ONE_UNIT);
    const nonce = await this._store.orderStore.submitOrder(
      this.orderType,
      this.amount,
      ratePct,
      DURATION,
      minUnitsMatch,
      this.maxBatchFeeRate,
    );
    runInAction('placeOrderContinuation', () => {
      if (nonce) {
        this.amount = 0;
        this.premium = 0;
        this.minChanSize = 0;
        this.maxBatchFeeRate = 0;
      }
    });

    return nonce;
  }
}
