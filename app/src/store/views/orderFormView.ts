import { makeAutoObservable, runInAction } from 'mobx';
import { NodeTier } from 'types/generated/auctioneer_pb';
import { annualPercentRate, toPercent } from 'util/bigmath';
import { BLOCKS_PER_DAY } from 'util/constants';
import { prefixTranslation } from 'util/translate';
import { DURATION, ONE_UNIT } from 'api/pool';
import { Store } from 'store';
import { NODE_TIERS, OrderType, Tier } from 'store/models/order';

const { l } = prefixTranslation('stores.orderFormView');

export const DEFAULT_MIN_CHAN_SIZE = 100000;
export const DEFAULT_MAX_BATCH_FEE = 100;

export default class OrderFormView {
  private _store: Store;

  /** the currently selected type of the order */
  orderType: OrderType = OrderType.Bid;
  amount = 0;
  premium = 0;
  minChanSize = DEFAULT_MIN_CHAN_SIZE;
  maxBatchFeeRate = DEFAULT_MAX_BATCH_FEE;
  minNodeTier: Tier = NodeTier.TIER_DEFAULT;

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

  /** the available options for the minNodeTier field */
  get nodeTierOptions() {
    return Object.entries(NODE_TIERS).map(([value, label]) => ({ label, value }));
  }

  /** the per block fixed rate */
  get perBlockFixedRate() {
    if ([this.amount, this.premium].includes(0)) return 0;

    return this._store.api.pool.calcFixedRate(this.amount, this.premium);
  }

  /** the premium interest percent ot the amount */
  get interestPercent() {
    if ([this.amount, this.premium].includes(0)) return 0;
    return toPercent(this.premium / this.amount);
  }

  /** the APR given the amount and premium */
  get apr() {
    if ([this.amount, this.premium].includes(0)) return 0;
    const termInDays = DURATION / BLOCKS_PER_DAY;
    const apr = annualPercentRate(this.amount, this.premium, termInDays);
    return toPercent(apr);
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

  setMinNodeTier(minNodeTier: Tier) {
    this.minNodeTier = minNodeTier;
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
      // round to the nearest 10 to offset lose of precision in calculating percentages
      this.premium = Math.round(suggested / 10) * 10;
    } catch (error) {
      this._store.appView.handleError(error, 'Unable to suggest premium');
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
      this.minNodeTier,
    );
    runInAction(() => {
      if (nonce) {
        this.amount = 0;
        this.premium = 0;
        this.minChanSize = DEFAULT_MIN_CHAN_SIZE;
        this.maxBatchFeeRate = DEFAULT_MAX_BATCH_FEE;
        this.minNodeTier = NodeTier.TIER_DEFAULT;
      }
    });

    return nonce;
  }
}
