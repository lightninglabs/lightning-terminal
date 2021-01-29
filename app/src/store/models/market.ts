import { makeAutoObservable, observable, ObservableMap } from 'mobx';
import * as AUCT from 'types/generated/auctioneerrpc/auctioneer_pb';
import { hex } from 'util/strings';
import { Store } from 'store';
import { Batch } from './';

/**
 * Represents a list of batches for a specific lease duration.
 */
export default class Market {
  private _store: Store;

  /** the lease duration of this market */
  leaseDuration: number;

  /** the collection of batches in this market */
  batches: ObservableMap<string, Batch> = observable.map();

  /**
   * store the order of batches so that new batches can be inserted at the front
   * and old batches appended at the end
   */
  orderedIds: string[] = [];

  constructor(store: Store, duration: number) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this._store = store;
    this.leaseDuration = duration;
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
   * Updates the collection of batches given an array of batches from the pool API.
   * In each batch, only the matched orders for this market will be included. Orders
   * for other markets will be filtered out.
   */
  update(poolBatches: AUCT.BatchSnapshotResponse.AsObject[], appendToFront: boolean) {
    poolBatches.forEach(poolBatch => {
      const batchId = hex(poolBatch.batchId);
      const existing = this.batches.get(batchId);
      // add the batch if it's not already stored in state
      if (!existing) {
        const batch = new Batch(this._store, this.leaseDuration, poolBatch);
        this.batches.set(batch.batchId, batch);
        // add this batch's id to the orderedIds array
        this.orderedIds = appendToFront
          ? [batch.batchId, ...this.orderedIds]
          : [...this.orderedIds, batch.batchId];
      } else {
        existing.update(poolBatch);
      }
    });
  }
}
