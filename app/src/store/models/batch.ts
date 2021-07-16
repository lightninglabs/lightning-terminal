import { makeAutoObservable, observable } from 'mobx';
import * as AUCT from 'types/generated/auctioneerrpc/auctioneer_pb';
import { LeaseDuration } from 'types/state';
import Big from 'big.js';
import { toPercent } from 'util/bigmath';
import { ellipseInside, hex } from 'util/strings';
import { Store } from 'store/store';

export type BatchDelta = 'neutral' | 'positive' | 'negative';

class MatchedOrder {
  matchingRate = 0;
  unitsMatched = 0;
  totalSatsCleared = Big(0);
  ask = {
    leaseDurationBlocks: 0,
    rateFixed: 0,
  };
  bid = {
    leaseDurationBlocks: 0,
    rateFixed: 0,
  };

  constructor(llmMatch: Required<AUCT.MatchedOrderSnapshot.AsObject>) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this.matchingRate = llmMatch.matchingRate;
    this.unitsMatched = llmMatch.unitsMatched;
    this.totalSatsCleared = Big(llmMatch.totalSatsCleared);
    this.ask = {
      leaseDurationBlocks: llmMatch.ask.leaseDurationBlocks,
      rateFixed: llmMatch.ask.rateFixed,
    };
    this.bid = {
      leaseDurationBlocks: llmMatch.bid.leaseDurationBlocks,
      rateFixed: llmMatch.bid.rateFixed,
    };
  }
}

/**
 * Represents a batch with only orders for a specific lease duration
 */
export default class Batch {
  private _store: Store;
  // native values from the POOL api
  batchId = '';
  prevBatchId = '';
  clearingPriceRate = 0;
  batchTxId = '';
  batchTxFeeRateSatPerKw = Big(0);
  matchedOrders: MatchedOrder[] = [];

  // the provided lease duration to filter orders by
  leaseDuration: LeaseDuration;

  constructor(
    store: Store,
    duration: LeaseDuration,
    llmBatch: AUCT.BatchSnapshotResponse.AsObject,
  ) {
    makeAutoObservable(
      this,
      { matchedOrders: observable },
      { deep: false, autoBind: true },
    );

    this._store = store;
    this.leaseDuration = duration;
    this.update(llmBatch);
  }

  /** the first and last 6 chars of the batch id */
  get batchIdEllipsed() {
    return ellipseInside(this.batchId, 4);
  }

  /** the first and last 6 chars of the batch tx id */
  get batchTxIdEllipsed() {
    return ellipseInside(this.batchTxId, 4);
  }

  /** the block explorer url for the batch tx */
  get batchTxUrl() {
    return this._store.settingsStore.getBitcoinTxUrl(this.batchTxId);
  }

  /** the sum of the cleared amounts for all orders */
  get volume() {
    return this.matchedOrders.reduce(
      (sum, order) => sum.add(order.totalSatsCleared),
      Big(0),
    );
  }

  /** the number of matched orders in this batch */
  get ordersCount() {
    return this.matchedOrders.length;
  }

  /** the total amount of sats earned in this batch */
  get earnedSats() {
    const pctRate = this._store.api.pool.calcPctRate(
      Big(this.clearingPriceRate),
      Big(this.leaseDuration),
    );
    return this.volume.mul(pctRate);
  }

  /** the fee in sats/vbyte rounded to the nearest whole number */
  get feeLabel() {
    return this.feeInVBytes.round().toString();
  }

  /** a label containing the batch fee in both sats/kw and sats/vbyte */
  get feeDescription() {
    // round the fee to 2 decimal places
    const fee = this.feeInVBytes.mul(100).round().div(100);
    return `${this.batchTxFeeRateSatPerKw} sats/kw - ${fee} sats/vbyte`;
  }

  /** the batch fee in sats/vbyte */
  get feeInVBytes() {
    const satsPerVByte = this._store.api.pool.satsPerKWeightToVByte(
      this.batchTxFeeRateSatPerKw,
    );
    return satsPerVByte;
  }

  /** the directionality of this batch's rate compared to the previous batch */
  get delta() {
    let delta: BatchDelta = 'neutral';
    const index = this._store.batchStore.sortedBatches.indexOf(this);
    const prevBatch = this._store.batchStore.sortedBatches[index + 1];
    if (prevBatch) {
      if (this.basisPoints > prevBatch.basisPoints) {
        delta = 'positive';
      } else if (this.basisPoints < prevBatch.basisPoints) {
        delta = 'negative';
      }
    }
    return delta;
  }

  /** the batch clearing rate expressed as basis points */
  get basisPoints() {
    const pct = this._store.api.pool.calcPctRate(
      Big(this.clearingPriceRate),
      Big(this.leaseDuration),
    );
    // convert the percentage to basis points. round up to prevent 0 bps
    // which is the case for the first batch on testnet which has a
    // clearingPriceRate of 6
    return Math.ceil(pct * 100 * 100);
  }

  /** the percentage change of this batch's rate compared to the previous batch */
  get pctChange() {
    let priorBps = this.basisPoints;
    const index = this._store.batchStore.sortedBatches.indexOf(this);
    const prevBatch = this._store.batchStore.sortedBatches[index + 1];
    if (prevBatch) {
      priorBps = prevBatch.basisPoints;
    }
    return toPercent((this.basisPoints - priorBps) / priorBps);
  }

  /**
   * Updates this batch model using data provided from the POOL GRPC api
   * @param llmBatch the batch data
   */
  update(llmBatch: AUCT.BatchSnapshotResponse.AsObject) {
    this.batchId = hex(llmBatch.batchId);
    this.prevBatchId = hex(llmBatch.prevBatchId);
    this.batchTxId = llmBatch.batchTxId;
    this.batchTxFeeRateSatPerKw = Big(llmBatch.batchTxFeeRateSatPerKw);
    // loop over all markets to limit the orders of this batch to a specific lease duration
    llmBatch.matchedMarketsMap.forEach(([duration, market]) => {
      // ignore markets for other lease durations
      if (duration === this.leaseDuration) {
        this.clearingPriceRate = market.clearingPriceRate;
        this.matchedOrders = market.matchedOrdersList
          // there should never be a match that does not have both a bid and an ask, but
          // the proto -> TS compiler makes these objects optional. This filter is just
          // a sanity check to avoid unexpected errors
          .filter(m => m.ask && m.bid)
          .map(m => new MatchedOrder(m as Required<AUCT.MatchedOrderSnapshot.AsObject>));
      }
    });
  }
}
