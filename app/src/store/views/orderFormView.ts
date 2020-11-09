import { makeAutoObservable, runInAction } from 'mobx';
import { annualPercentYield, toPercent } from 'util/bigmath';
import { prefixTranslation } from 'util/translate';
import { DURATION, ONE_UNIT } from 'api/pool';
import { Store } from 'store';
import { OrderType } from 'store/models/order';

const { l } = prefixTranslation('stores.orderFormView');

export default class OrderFormView {
  private _store: Store;

  /** the currently selected type of the order */
  orderType: OrderType = OrderType.Bid;
  amount = 0;
  premium = 0;
  minChanSize = 0;
  maxBatchFeeRate = 0;

  constructor(store: Store) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this._store = store;
  }

  get orderOptions() {
    return [
      { label: l('buy'), value: OrderType.Bid },
      { label: l('sell'), value: OrderType.Ask },
    ];
  }

  /** the error message if the amount is invalid */
  get amountError() {
    if (!this.amount) return '';
    if (this.amount % ONE_UNIT !== 0) {
      return l('errorMultiple');
    }
    return '';
  }

  /** the error message if the premium is invalid */
  get premiumError() {
    if (!this.premium || !this.amount) return '';
    if (this.perBlockFixedRate < 1) {
      return l('premiumLowError');
    }
    return '';
  }

  /** the error message if the min chan size is invalid */
  get minChanSizeError() {
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
  get feeRateError() {
    if (!this.maxBatchFeeRate) return '';
    if (this.maxBatchFeeRate < 1) {
      return l('feeRateErrorMin', { min: 1 });
    }
    return '';
  }

  /** the per block fixed rate */
  get perBlockFixedRate() {
    if ([this.amount, this.premium].includes(0)) return 0;

    return this._store.api.pool.calcFixedRate(this.amount, this.premium);
  }

  /** the APY given the amount and premium */
  get apy() {
    if ([this.amount, this.premium].includes(0)) return 0;
    const blocksPerDay = 144;
    const termInDays = DURATION / blocksPerDay;
    const apy = annualPercentYield(this.amount, this.premium, termInDays);
    return toPercent(apy);
  }

  /** the label for the place order button */
  get placeOrderLabel() {
    const action = this.orderType === OrderType.Bid ? l('buy') : l('sell');
    return l('placeOrderLabel', { action });
  }

  /** determines if the current values are all valid */
  get isValid() {
    return (
      ![this.amount, this.premium, this.minChanSize, this.maxBatchFeeRate].includes(0) &&
      !this.amountError &&
      !this.minChanSizeError &&
      !this.feeRateError
    );
  }

  setOrderType(orderType: string) {
    this.orderType = orderType as OrderType;
  }

  setAmount(amount: number) {
    this.amount = amount;
  }

  setPremium(premium: number) {
    this.premium = premium;
  }

  setMinChanSize(minChanSize: number) {
    this.minChanSize = minChanSize;
  }

  setMaxBatchFeeRate(feeRate: number) {
    this.maxBatchFeeRate = feeRate;
  }

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
