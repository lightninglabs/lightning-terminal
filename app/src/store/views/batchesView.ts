import { makeAutoObservable } from 'mobx';
import { toPercent } from 'util/bigmath';
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

  /** the fee used for the last batch */
  get currentFee() {
    return this.batches.length ? this.batches[0].feeLabel : 0;
  }

  /** that amount earned from sold leases */
  get earnedSats() {
    return this._store.orderStore.earnedSats;
  }

  /** the amount paid from purchased leases */
  get paidSats() {
    return this._store.orderStore.paidSats;
  }

  //
  // Actions
  //

  setViewMode(mode: BatchesView['viewMode']) {
    this.viewMode = mode;
  }
}
