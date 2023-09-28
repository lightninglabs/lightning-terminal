import {
  entries,
  makeAutoObservable,
  observable,
  ObservableMap,
  runInAction,
  toJS,
  values,
  when,
} from 'mobx';
import { NodeTier } from 'types/generated/auctioneerrpc/auctioneer_pb';
import { LeaseDuration } from 'types/state';
import Big from 'big.js';
import { IS_DEV, IS_TEST } from 'config';
import debounce from 'lodash/debounce';
import { hex } from 'util/strings';
import { Store } from 'store';
import { Market } from 'store/models';
import { Tier } from 'store/models/order';

export const BATCH_QUERY_LIMIT = 20;
const ZERO_BATCH_ID =
  '000000000000000000000000000000000000000000000000000000000000000000';

export default class BatchStore {
  private _store: Store;
  private _pollingInterval?: NodeJS.Timeout;
  private _nextBatchTimer?: NodeJS.Timeout;

  /** the selected lease duration */
  selectedLeaseDuration: LeaseDuration = 0;

  /** the collection of lease durations as a mapping from duration (blocks) to DurationBucketState */
  leaseDurations: ObservableMap<LeaseDuration, number> = observable.map();

  /** the collection of markets (batches grouped by lease duration) */
  markets: ObservableMap<LeaseDuration, Market> = observable.map();

  /** the timestamp of the next batch in seconds */
  nextBatchTimestamp = Big(0);

  /** the fee rate (sats/vbyte) estimated by the auctioneer to use for the next batch */
  nextFeeRate = 0;

  /** the tier of the current LND node */
  nodeTier?: Tier;

  /**
   * indicates when batches are being fetched from the backend, default to true to
   * prevent UI flicker on initial load
   */
  loading = true;

  constructor(store: Store) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this._store = store;
  }

  /**
   * the currently active market based on the selected lease duration
   */
  get activeMarket() {
    return (
      this.markets.get(this.selectedLeaseDuration) ||
      // return the first market if one hasn't been selected yet
      values(this.markets)[0] ||
      // return an empty market if none have been fetched yet
      new Market(this._store, 0)
    );
  }

  /** the collection of lease durations sorted by number of blocks */
  get sortedDurations() {
    return entries(this.leaseDurations)
      .map(([duration, state]) => ({ duration, state }))
      .sort((a, b) => a.duration - b.duration);
  }

  /**
   * the collection of batches for the active market
   */
  get batches() {
    return this.activeMarket.batches;
  }

  /**
   * an array of batches for the active market sorted by newest first
   */
  get sortedBatches() {
    return this.activeMarket.sortedBatches;
  }

  /**
   * the oldest batch  for the active market that we have fetched from the API
   */
  get oldestBatch() {
    return this.activeMarket.oldestBatch;
  }

  /**
   * determines if there are more batches that can be fetched from the backend
   */
  get hasMoreBatches() {
    // we don't have any batches fetched, so there should be more
    if (!this.oldestBatch) return true;
    // the oldest batch has a prevBatchId defined, so there should be more
    if (this.oldestBatch.prevBatchId && this.oldestBatch.prevBatchId !== ZERO_BATCH_ID)
      return true;
    // the oldest batch has an empty prevBatchId, so there is no more
    return false;
  }

  /** checks the subserver status to ensure pool is running */
  get canFetchData() {
    if (
      this._store.subServerStore.subServers.pool.running &&
      !this._store.subServerStore.subServers.pool.error
    ) {
      return true;
    }

    return false;
  }

  /**
   * fetches the next set of past batches from the API
   */
  async fetchBatches() {
    this._store.log.info('fetching batches');
    if (!this.hasMoreBatches) {
      this._store.log.info('no more batches to fetch');
      return;
    }
    let prevId = '';
    if (this.oldestBatch) prevId = this.oldestBatch.prevBatchId;

    this.loading = true;

    try {
      await this.fetchLeaseDurations();
      const poolBatches = await this._store.api.pool.batchSnapshots(
        BATCH_QUERY_LIMIT,
        prevId,
      );
      runInAction(() => {
        // update the batches in all markets
        this.markets.forEach(m => m.update(poolBatches.batchesList, false));
        this._store.log.info('updated batchStore.markets', toJS(this.markets));
        this.loading = false;
      });
    } catch (error) {
      if (error.message !== 'batch snapshot not found') {
        this._store.appView.handleError(error, `Unable to fetch batch with id ${prevId}`);
      }
    }
  }

  /**
   * fetches the latest batch from the API
   */
  async fetchLatestBatch() {
    this._store.log.info('fetching latest batch');
    try {
      const poolBatches = await this._store.api.pool.batchSnapshots(1);
      // update the timestamp of the next batch when fetching the latest batch
      await this.fetchNextBatchInfo();
      runInAction(() => {
        // update the batches in all markets
        this.markets.forEach(m => m.update(poolBatches.batchesList, true));
        this._store.log.info('updated batchStore.markets', toJS(this.markets));
      });
    } catch (error) {
      if (error.message === 'batch snapshot not found') return;
      this._store.appView.handleError(error, 'Unable to fetch the latest batch');
    }
  }

  /** fetch the latest at most once every 2 seconds when using this func  */
  fetchLatestBatchThrottled = debounce(this.fetchLatestBatch, 2000);

  /**
   * fetches the next batch info from the API and updates the next timestamp and fee rate
   */
  async fetchNextBatchInfo() {
    this._store.log.info('fetching next batch info');
    try {
      const res = await this._store.api.pool.nextBatchInfo();
      runInAction(() => {
        this.setNextBatchTimestamp(Big(res.clearTimestamp));
        this._store.log.info(
          'updated batchStore.nextBatchTimestamp',
          this.nextBatchTimestamp,
        );
        this.setNextFeeRate(Big(res.feeRateSatPerKw));
        this._store.log.info('updated batchStore.nextFeeRate', this.nextFeeRate);
      });
    } catch (error) {
      this._store.appView.handleError(error, 'Unable to fetch the next batch info');
    }
  }

  /**
   * fetches the current lnd node's tier from the API
   */
  async fetchNodeTier() {
    this._store.log.info('fetching node tier');
    try {
      const pubkey = this._store.nodeStore.pubkey;
      const { nodeRatingsList } = await this._store.api.pool.nodeRatings(pubkey);
      runInAction(() => {
        const rating = nodeRatingsList.find(r => hex(r.nodePubkey) === pubkey);
        if (rating) {
          this.nodeTier = rating.nodeTier;
        } else {
          this.nodeTier = NodeTier.TIER_0;
        }
        this._store.log.info('updated batchStore.nodeTier', this.nodeTier);
      });
    } catch (error) {
      this._store.appView.handleError(error, 'Unable to fetch the node tier');
    }
  }

  /**
   * fetches the list of lease durations from the API
   */
  async fetchLeaseDurations() {
    this._store.log.info('fetching lease durations');
    try {
      const res = await this._store.api.pool.leaseDurations();
      runInAction(() => {
        res.leaseDurationBucketsMap.forEach(([duration, state]) => {
          this.leaseDurations.set(duration, state);

          // set the selected lease duration to the first one if it is not set
          if (!this.selectedLeaseDuration) this.selectedLeaseDuration = duration;

          // create a market for the lease duration if it hasn't
          // already been created. initialize it with no batches. The
          // batches for each market will be added by `fetchBatches()`
          if (!this.markets.get(duration)) {
            const list = new Market(this._store, duration);
            this.markets.set(duration, list);
          }
        });
        this._store.log.info(
          'updated batchStore.leaseDurations',
          toJS(this.leaseDurations),
        );
      });
    } catch (error) {
      this._store.appView.handleError(error, 'Unable to fetch lease durations');
    }
  }

  /**
   * Updates the active market using a specific lease duration
   */
  setActiveMarket(duration: LeaseDuration) {
    if (!this.leaseDurations.get(duration)) {
      this._store.appView.handleError(
        new Error(`${duration} is not a valid lease duration`),
        'Unable to switch markets',
      );
      return;
    }

    this.selectedLeaseDuration = duration;
  }

  /**
   * sets the nextBatchTimestamp and creates a timer to fetch the latest batch, which
   * will trigger 3 seconds after the next batch timestamp to allow some time for the
   * batched to be processed
   * @param timestamp the next batch timestamp in seconds since epoch
   */
  setNextBatchTimestamp(timestamp: Big) {
    // if the value is the same, then just return immediately
    if (this.nextBatchTimestamp.eq(timestamp)) return;

    this.nextBatchTimestamp = timestamp;

    if (this._nextBatchTimer) clearTimeout(this._nextBatchTimer);
    // calc the number of ms between now and the next batch timestamp
    let ms = timestamp.mul(1000).sub(Date.now()).toNumber();
    // if the timestamp is somehow in the past, use 10 mins as a default
    if (ms < 0) ms = 10 * 60 * 1000;
    this._nextBatchTimer = setTimeout(this.fetchLatestBatch, ms + 3000);
  }

  /**
   * sets the nextFeeRate by converting the provided sats/kw to sats/vbyte
   */
  setNextFeeRate(satsPerKWeight: Big) {
    const satsPerVbyte = this._store.api.pool.satsPerKWeightToVByte(satsPerKWeight);
    this.nextFeeRate = satsPerVbyte.round(0, Big.roundUp).toNumber();
  }

  startPolling() {
    if (IS_TEST) return;
    if (this._pollingInterval) this.stopPolling();
    this._store.log.info('start polling for Pool data');
    // create timer to poll for new Pool data every minute
    this._pollingInterval = setInterval(async () => {
      this._store.log.info('polling for latest Pool data');
      await this.fetchLatestBatch();
      await this._store.accountStore.fetchAccounts();
      await this._store.orderStore.fetchOrders();
    }, (IS_DEV ? 15 : 60) * 1000);
  }

  stopPolling() {
    this._store.log.info('stop polling for Pool data');
    if (this._pollingInterval) {
      clearInterval(this._pollingInterval);
      this._pollingInterval = undefined;
      this._store.log.info('polling stopped');
    } else {
      this._store.log.info('polling was already stopped');
    }
  }

  /**
   * initialize the batch store
   */
  init() {
    // make sure the pool subserver is running before initializing
    if (this.canFetchData) {
      // when the pubkey is fetched from the API and set in the nodeStore, fetch
      // the node's tier
      when(
        () => !!this._store.nodeStore.pubkey && !this.nodeTier,
        () => this.fetchNodeTier(),
      );
    }
  }
}
