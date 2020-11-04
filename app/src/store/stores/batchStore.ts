import {
  keys,
  makeAutoObservable,
  observable,
  ObservableMap,
  runInAction,
  toJS,
} from 'mobx';
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

  /** the id of the active batch */
  selectedBatchId?: string;

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
    // loops over the map in insertion order to get the last batch
    this.batches.forEach(b => (batch = b));
    return batch;
  }

  /**
   * fetches the next set of past batches from the API
   */
  async fetchBatches() {
    this._store.log.info('fetching batches');
    let prevId = '';
    if (this.oldestBatch) prevId = this.oldestBatch.prevBatchId;
    const newBatches: Batch[] = [];
    for (let i = 0; i < BATCH_QUERY_LIMIT; i++) {
      try {
        const poolBatch = await this._store.api.pool.batchSnapshot(prevId);
        const batch = new Batch(poolBatch);
        newBatches.push(batch);
        prevId = batch.prevBatchId;
        if (!prevId) break;
      } catch (error) {
        if (error.message !== 'batch snapshot not found') {
          this._store.uiStore.handleError(
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
        this.orderedIds.push(batch.batchId);
      });
      // set the selected batch to the latest one if it is not already set
      if (!this.selectedBatchId && this.batches.size > 0) {
        this.selectedBatchId = keys(this.batches)[0];
      }
      this._store.log.info('updated batchStore.batches', toJS(this.batches));
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
        const batch = new Batch(poolBatch);
        // add the latest one if it's not already stored in state
        if (!this.batches.get(batch.batchId)) {
          this.batches.set(batch.batchId, batch);
          // add this batch's id to the front of the orderedIds array
          this.orderedIds.unshift(batch.batchId);
        }
        this._store.log.info('updated batchStore.batches', toJS(this.batches));
      });
    } catch (error) {
      this._store.uiStore.handleError(error, 'Unable to fetch the latest batch');
    }
  }
}
