import {
  makeAutoObservable,
  observable,
  ObservableMap,
  runInAction,
  toJS,
  when,
} from 'mobx';
import { NodeTier } from 'types/generated/auctioneer_pb';
import { IS_DEV, IS_TEST } from 'config';
import debounce from 'lodash/debounce';
import { hex } from 'util/strings';
import { Store } from 'store';
import { Batch } from 'store/models';
import { Tier } from 'store/models/order';

export const BATCH_QUERY_LIMIT = 20;
const ZERO_BATCH_ID =
  '000000000000000000000000000000000000000000000000000000000000000000';

export default class BatchStore {
  private _store: Store;
  private _pollingInterval?: NodeJS.Timeout;
  private _nextBatchTimer?: NodeJS.Timeout;

  /** the collection of batches */
  batches: ObservableMap<string, Batch> = observable.map();

  /**
   * store the order of batches so that new batches can be inserted at the front
   * and old batches appended at the end
   */
  orderedIds: string[] = [];

  /** the timestamp of the next batch in seconds */
  nextBatchTimestamp = 0;

  /** the tier of the current LND node */
  nodeTier?: Tier;

  /** indicates when batches are being fetched from the backend */
  loading = false;

  constructor(store: Store) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this._store = store;
  }

  /**
   * all batches sorted by newest first
   */
  get sortedBatches() {
    return (
      this.orderedIds
        .map(id => this.batches.get(id))
        // filter out empty batches
        .filter(b => !!b && b.clearingPriceRate > 0) as Batch[]
    );
  }

  /**
   * the oldest batch that we have queried from the API
   */
  get oldestBatch() {
    return this.sortedBatches[this.sortedBatches.length - 1];
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
      const poolBatches = await this._store.api.pool.batchSnapshots(
        BATCH_QUERY_LIMIT,
        prevId,
      );
      runInAction(() => {
        poolBatches.batchesList.forEach(poolBatch => {
          const batch = new Batch(this._store, poolBatch);
          this.batches.set(batch.batchId, batch);
          this.orderedIds = [...this.orderedIds, batch.batchId];
        });
        this._store.log.info('updated batchStore.batches', toJS(this.batches));
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
      const [poolBatch] = (await this._store.api.pool.batchSnapshots(1)).batchesList;
      // handle edge case that should only be possible on regtest with no batches
      if (!poolBatch) return;
      // update the timestamp of the next batch when fetching the latest batch
      await this.fetchNextBatchTimestamp();
      runInAction(() => {
        const batch = new Batch(this._store, poolBatch);
        // add the latest one if it's not already stored in state
        if (!this.batches.get(batch.batchId)) {
          this.batches.set(batch.batchId, batch);
          // add this batch's id to the front of the orderedIds array
          this.orderedIds = [batch.batchId, ...this.orderedIds];
        }
        this._store.log.info('updated batchStore.batches', toJS(this.batches));
      });
    } catch (error) {
      if (error.message === 'batch snapshot not found') return;
      this._store.appView.handleError(error, 'Unable to fetch the latest batch');
    }
  }

  /** fetch the latest at most once every 2 seconds when using this func  */
  fetchLatestBatchThrottled = debounce(this.fetchLatestBatch, 2000);

  /**
   * fetches the next batch timestamp from the API
   */
  async fetchNextBatchTimestamp() {
    this._store.log.info('fetching next batch info');
    try {
      const { clearTimestamp } = await this._store.api.pool.nextBatchInfo();
      runInAction(() => {
        this.setNextBatchTimestamp(clearTimestamp);
        this._store.log.info(
          'updated batchStore.nextBatchTimestamp',
          this.nextBatchTimestamp,
        );
      });
    } catch (error) {
      this._store.appView.handleError(error, 'Unable to fetch the next batch timestamp');
    }
  }

  /**
   * fetches the next batch timestamp from the API
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
   * sets the nextBatchTimestamp and creates a timer to fetch the latest batch, which
   * will trigger 3 seconds after the next batch timestamp to allow some time for the
   * batched to be processed
   * @param timestamp the next batch timestamp in seconds since epoch
   */
  setNextBatchTimestamp(timestamp: number) {
    // if the value is the same, then just return immediately
    if (this.nextBatchTimestamp === timestamp) return;

    this.nextBatchTimestamp = timestamp;

    if (this._nextBatchTimer) clearTimeout(this._nextBatchTimer);
    // calc the number of ms between now and the next batch timestamp
    let ms = timestamp * 1000 - Date.now();
    // if the timestamp is somehow in the past, use 10 mins as a default
    if (ms < 0) ms = 10 * 60 * 1000;
    this._nextBatchTimer = setTimeout(this.fetchLatestBatch, ms + 3000);
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
    // when the pubkey is fetched from the API and set in the nodeStore, fetch
    // the node's tier
    when(
      () => !!this._store.nodeStore.pubkey && !this.nodeTier,
      () => this.fetchNodeTier(),
    );
  }
}
