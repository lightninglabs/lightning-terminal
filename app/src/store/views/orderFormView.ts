import { makeAutoObservable, runInAction } from 'mobx';
import {
  DurationBucketState,
  NodeTier,
} from 'types/generated/auctioneerrpc/auctioneer_pb';
import { LeaseDuration } from 'types/state';
import Big from 'big.js';
import debounce from 'lodash/debounce';
import { annualPercentRate, toBasisPoints, toPercent } from 'util/bigmath';
import { BLOCKS_PER_DAY } from 'util/constants';
import { blocksToTime } from 'util/formatters';
import { prefixTranslation } from 'util/translate';
import { ONE_UNIT } from 'api/pool';
import { Store } from 'store';
import { NODE_TIERS, OrderType, Tier } from 'store/models/order';

const { l } = prefixTranslation('stores.orderFormView');

export const DEFAULT_MIN_CHAN_SIZE = 100000;
export const DEFAULT_MAX_BATCH_FEE = 100;

export default class OrderFormView {
  private _store: Store;

  /** the currently selected type of the order */
  orderType: OrderType = OrderType.Bid;
  amount = Big(0);
  premium = Big(0);
  duration = 0;
  minChanSize = DEFAULT_MIN_CHAN_SIZE;
  maxBatchFeeRate = DEFAULT_MAX_BATCH_FEE;
  minNodeTier: Tier = NodeTier.TIER_DEFAULT;

  /** toggle to show or hide the additional options */
  addlOptionsVisible = false;

  /** quoted fees */
  executionFee = Big(0);
  worstChainFee = Big(0);
  quoteLoading = false;

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
    if (this.amount.eq(0)) return '';
    if (!this.amount.mod(ONE_UNIT).eq(0)) {
      return l('errorMultiple');
    }
    return '';
  }

  /** the error message if the premium is invalid */
  get premiumError() {
    if (this.premium.eq(0) || this.amount.eq(0)) return '';
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
    if (!this.amount.eq(0) && this.amount.lt(this.minChanSize)) {
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

  /** the markets currently open or accepting orders */
  get marketsAcceptingOrders() {
    const { MARKET_OPEN, ACCEPTING_ORDERS } = DurationBucketState;
    return this._store.batchStore.sortedDurations.filter(
      ({ state }) => state === MARKET_OPEN || state === ACCEPTING_ORDERS,
    );
  }

  /** the mapping of market states to user-friendly labels */
  get marketStateLabels(): Record<number, string> {
    return {
      [DurationBucketState.MARKET_OPEN]: l('marketOpen'),
      [DurationBucketState.ACCEPTING_ORDERS]: l('marketAccepting'),
      [DurationBucketState.MARKET_CLOSED]: l('marketClosed'),
      [DurationBucketState.NO_MARKET]: l('noMarket'),
    };
  }

  /** the available options for the lease duration field */
  get durationOptions() {
    const labels = this.marketStateLabels;
    const durations = this.marketsAcceptingOrders.map(({ duration, state }) => ({
      label: `${blocksToTime(duration)} (${labels[state]})`,
      value: `${duration}`,
    }));

    const selectedDuration = this._store.batchStore.selectedLeaseDuration;
    const selectedState = this._store.batchStore.leaseDurations.get(selectedDuration);
    if (selectedState) {
      // add a default option with a value of zero to signify that the duration
      // currently being displayed should be used
      durations.unshift({
        label: `${l('inView')} (${blocksToTime(selectedDuration)}, ${
          labels[selectedState]
        })`,
        value: '0',
      });
    }
    return durations;
  }

  /** determines if the lease duration field should be visible */
  get durationVisible() {
    return this.marketsAcceptingOrders.length > 1;
  }

  /** the chosen duration or the value selected in the batch store */
  get derivedDuration() {
    return this.duration || this._store.batchStore.selectedLeaseDuration;
  }

  /** the available options for the minNodeTier field */
  get nodeTierOptions() {
    return Object.entries(NODE_TIERS).map(([value, label]) => ({ label, value }));
  }

  /** the per block fixed rate */
  get perBlockFixedRate() {
    if (this.amount.eq(0) || this.premium.eq(0)) return 0;

    return this._store.api.pool.calcFixedRate(
      this.amount,
      this.premium,
      this.derivedDuration,
    );
  }

  /** the premium interest of the amount in basis points */
  get interestBps() {
    if (this.amount.eq(0) || this.premium.eq(0)) return 0;
    return toBasisPoints(this.premium.div(this.amount).toNumber());
  }

  /** the APR given the amount and premium */
  get apr() {
    if (this.amount.eq(0) || this.premium.eq(0)) return 0;
    const termInDays = this.derivedDuration / BLOCKS_PER_DAY;
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
      !this.amount.eq(0) &&
      !this.premium.eq(0) &&
      ![this.minChanSize, this.maxBatchFeeRate].includes(0) &&
      !this.amountError &&
      !this.minChanSizeError &&
      !this.feeRateError
    );
  }

  setOrderType(orderType: string) {
    this.orderType = orderType as OrderType;
  }

  setAmount(amount: number) {
    this.amount = Big(amount);
    this.fetchQuote();
  }

  setPremium(premium: number) {
    this.premium = Big(premium);
    this.fetchQuote();
  }

  setDuration(duration: LeaseDuration) {
    this.duration = duration;
    this.fetchQuote();
  }

  setMinChanSize(minChanSize: number) {
    this.minChanSize = minChanSize;
    this.fetchQuote();
  }

  setMaxBatchFeeRate(feeRate: number) {
    this.maxBatchFeeRate = feeRate;
    this.fetchQuote();
  }

  setMinNodeTier(minNodeTier: Tier) {
    this.minNodeTier = minNodeTier;
  }

  setSuggestedPremium() {
    try {
      if (this.amount.eq(0)) throw new Error('Must specify amount first');
      const prevBatch = this._store.batchStore.sortedBatches[0];
      if (!prevBatch) throw new Error('Previous batch not found');
      const prevFixedRate = prevBatch.clearingPriceRate;
      // get the percentage rate of the previous batch and apply to the current amount
      const prevPctRate = this._store.api.pool.calcPctRate(
        Big(prevFixedRate),
        Big(this.derivedDuration),
      );
      const suggested = this.amount.mul(prevPctRate);
      // round to the nearest 10 to offset lose of precision in calculating percentages
      this.premium = suggested.div(10).round().mul(10);
      this.fetchQuote();
    } catch (error) {
      this._store.appView.handleError(error, 'Unable to suggest premium');
    }
  }

  toggleAddlOptions() {
    this.addlOptionsVisible = !this.addlOptionsVisible;
  }

  /** requests a quote for an order to obtain accurate fees */
  async quoteOrder() {
    const minUnitsMatch = +Big(this.minChanSize).div(ONE_UNIT).round(0, Big.roundDown);
    const satsPerKWeight = this._store.api.pool.satsPerVByteToKWeight(
      this.maxBatchFeeRate,
    );

    const {
      totalExecutionFeeSat,
      worstCaseChainFeeSat,
    } = await this._store.orderStore.quoteOrder(
      this.amount,
      this.perBlockFixedRate,
      this.derivedDuration,
      minUnitsMatch,
      satsPerKWeight,
    );

    runInAction(() => {
      this.executionFee = Big(totalExecutionFeeSat);
      this.worstChainFee = Big(worstCaseChainFeeSat);
      this.quoteLoading = false;
    });
  }

  /** quote order at most once every second when using this func  */
  quoteOrderThrottled = debounce(this.quoteOrder, 1000);

  /**
   * sets the quoteLoading flag before while waiting for the throttled quote
   * request to complete
   */
  fetchQuote() {
    if (!this.isValid) {
      runInAction(() => {
        this.executionFee = Big(0);
        this.worstChainFee = Big(0);
        this.quoteLoading = false;
      });
      return;
    }
    this.quoteLoading = true;
    this.quoteOrderThrottled();
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
      this.derivedDuration,
      minUnitsMatch,
      satsPerKWeight,
      this.minNodeTier,
    );
    runInAction(() => {
      if (nonce) {
        this.amount = Big(0);
        this.premium = Big(0);
        this.duration = 0;
        this.executionFee = Big(0);
        this.worstChainFee = Big(0);
        // persist the additional options so they can be used for future orders
        this._store.settingsStore.setOrderSettings(
          this.minChanSize,
          this.maxBatchFeeRate,
          this.minNodeTier,
        );
      }
    });

    return nonce;
  }
}
