import { makeAutoObservable, observable, ObservableMap, runInAction, toJS } from 'mobx';
import debounce from 'lodash/debounce';
import { Store } from 'store';
import { Batch } from 'store/models';

export const BATCH_QUERY_LIMIT = 20;

export default class BatchStore {
  private _store: Store;

  /** the collection of batches */
  batches: ObservableMap<string, Batch> = observable.map();

  /**
   * store the order of batches so that new batches can be inserted at the front
   * and old batches appended at the end
   */
  orderedIds: string[] = [];

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
    return this.orderedIds.map(id => this.batches.get(id)).filter(b => !!b) as Batch[];
  }

  /**
   * the oldest batch that we have queried from the API
   */
  get oldestBatch() {
    let batch: Batch | undefined;
    const oldestId = this.orderedIds[this.orderedIds.length - 1];
    if (oldestId) {
      batch = this.batches.get(oldestId);
    }
    return batch;
  }

  /**
   * determines if there are more batches that can be fetched from the backend
   */
  get hasMoreBatches() {
    // we don't have any batches fetched, so there should be more
    if (!this.oldestBatch) return true;
    // the oldest batch has a prevBatchId defined, so there should be more
    if (this.oldestBatch.prevBatchId) return true;
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
    const newBatches: Batch[] = [];
    for (let i = 0; i < BATCH_QUERY_LIMIT; i++) {
      try {
        const poolBatch = await this._store.api.pool.batchSnapshot(prevId);
        const batch = new Batch(this._store, poolBatch);
        newBatches.push(batch);
        prevId = batch.prevBatchId;
        if (!prevId) break;
      } catch (error) {
        if (error.message !== 'batch snapshot not found') {
          this._store.appView.handleError(
            error,
            `Unable to fetch batch with id ${prevId}`,
          );
        }
        break;
      }
    }
    runInAction(() => {
      newBatches.forEach(batch => {
        this.batches.set(batch.batchId, batch);
        this.orderedIds = [...this.orderedIds, batch.batchId];
      });
      this._store.log.info('updated batchStore.batches', toJS(this.batches));
      this.loading = false;
    });
  }

  /**
   * fetches the latest batch from the API
   */
  async fetchLatestBatch() {
    this._store.log.info('fetching latest batch');
    try {
      const poolBatch = await this._store.api.pool.batchSnapshot();
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
      this._store.appView.handleError(error, 'Unable to fetch the latest batch');
    }
  }

  /** fetch the latest at most once every 2 seconds when using this func  */
  fetchLatestBatchThrottled = debounce(this.fetchLatestBatch, 2000);
}
