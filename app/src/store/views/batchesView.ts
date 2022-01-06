import { makeAutoObservable } from 'mobx';
import {
  DurationBucketState,
  NodeTier,
} from 'types/generated/auctioneerrpc/auctioneer_pb';
import { toPercent } from 'util/bigmath';
import { blocksToTime } from 'util/formatters';
import { Store } from 'store';

export default class BatchesView {
  private _store: Store;

  viewMode: 'chart' | 'list' = 'chart';

  constructor(store: Store) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this._store = store;
  }

  //
  // Computed properties
  //

  /** all batches sorted by newest first */
  get batches() {
    return this._store.batchStore.sortedBatches;
  }

  /** the timestamp of the next batch in seconds */
  get nextBatchTimestamp() {
    return this._store.batchStore.nextBatchTimestamp;
  }

  /** the cleared rate, in basis points, on the last batch */
  get currentRate() {
    return this.batches.length ? this.batches[0].basisPoints : 0;
  }

  /** the cleared fixed rate on the last batch */
  get currentFixedRate() {
    return this.batches.length ? this.batches[0].clearingPriceRate : 0;
  }

  /** the percentage change between the last batch and the prior one */
  get currentRateChange() {
    if (this.batches.length < 2) return 0;
    const currentRate = this.batches[0].clearingPriceRate;
    const priorRate = this.batches[1].clearingPriceRate;

    return toPercent((currentRate - priorRate) / priorRate);
  }

  /** the fee rate (sats/vbyte) estimated by the auctioneer to use for the next batch */
  get nextFeeRate() {
    return this._store.batchStore.nextFeeRate;
  }

  /** the tier of the current LND node as a user-friendly string */
  get tier() {
    switch (this._store.batchStore.nodeTier) {
      case NodeTier.TIER_1:
        return 'T1';
      case NodeTier.TIER_0:
      case NodeTier.TIER_DEFAULT:
        return 'T0';
      default:
        return '';
    }
  }

  /** that amount earned from sold leases */
  get earnedSats() {
    return this._store.orderStore.earnedSats;
  }

  /** the amount paid from purchased leases */
  get paidSats() {
    return this._store.orderStore.paidSats;
  }

  /** the currently selected market */
  get selectedMarket() {
    return `${this._store.batchStore.selectedLeaseDuration}`;
  }

  /** the markets that are currently open (accepting & matching orders) */
  get openMarkets() {
    return this._store.batchStore.sortedDurations.filter(
      ({ state }) => state === DurationBucketState.MARKET_OPEN,
    );
  }

  /** the list of markets to display as badges */
  get marketOptions() {
    return this.openMarkets.map(({ duration }) => ({
      label: blocksToTime(duration),
      value: `${duration}`,
      tip: `${duration} blocks`,
    }));
  }

  /** determines if there are no batches in the current market */
  get isEmpty() {
    return this.batches.length === 0 && !this._store.batchStore.loading;
  }

  /** determines if the market badges should be visible above the chart */
  get showMarketBadges() {
    return this.openMarkets.length > 1;
  }

  //
  // Actions
  //

  setViewMode(mode: BatchesView['viewMode']) {
    this.viewMode = mode;
  }

  changeMarket(value: string) {
    const duration = parseInt(value);
    this._store.batchStore.setActiveMarket(duration);
  }
}
