import { action, computed, observable, runInAction } from 'mobx';
import { annualPercentYield, toPercent } from 'util/bigmath';
import { prefixTranslation } from 'util/translate';
import { DURATION, ONE_UNIT } from 'api/pool';
import { Store } from 'store';
import { OrderType } from 'store/models/order';

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

  /** the error message if the premium is invalid */
  @computed get premiumError() {
    if (!this.premium || !this.amount) return '';
    if (this.perBlockFixedRate < 1) {
      return l('premiumLowError');
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
    if (this.maxBatchFeeRate < 1) {
      return l('feeRateErrorMin', { min: 1 });
    }
    return '';
  }

  /** the per block fixed rate */
  @computed get perBlockFixedRate() {
    if ([this.amount, this.premium].includes(0)) return 0;

    return this._store.api.pool.calcFixedRate(this.amount, this.premium);
  }

  /** the APY given the amount and premium */
  @computed get apy() {
    if ([this.amount, this.premium].includes(0)) return 0;
    const blocksPerDay = 144;
    const termInDays = DURATION / blocksPerDay;
    const apy = annualPercentYield(this.amount, this.premium, termInDays);
    return toPercent(apy);
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

  @action.bound
  setSuggestedPremium() {
    try {
      if (!this.amount) throw new Error('Must specify amount first');
      const prevBatch = this._store.batchStore.sortedBatches[0];
      if (!prevBatch) throw new Error('Previous batch not found');
      const prevFixedRate = prevBatch.clearingPriceRate;
      // get the percentage rate of the previous batch and apply to the current amount
      const prevPctRate = this._store.api.pool.calcPctRate(prevFixedRate);
      const suggested = this.amount * prevPctRate;
      // round to the nearest 100 to offset lose of precision in calculating percentages
      this.premium = Math.round(suggested / 100) * 100;
    } catch (error) {
      this._store.uiStore.handleError(error, 'Unable to suggest premium');
    }
  }

  /** submits the order to the API and resets the form values if successful */
  @action.bound
  async placeOrder() {
    const minUnitsMatch = Math.floor(this.minChanSize / ONE_UNIT);
    const satsPerKWeight = this._store.api.pool.satsPerVByteToKWeight(
      this.maxBatchFeeRate,
    );
    const nonce = await this._store.orderStore.submitOrder(
      this.orderType,
      this.amount,
      this.perBlockFixedRate,
      DURATION,
      minUnitsMatch,
      satsPerKWeight,
    );
    runInAction(() => {
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
