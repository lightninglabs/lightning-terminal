import { makeAutoObservable, observable } from 'mobx';
import * as AUCT from 'types/generated/auctioneer_pb';

class MatchedOrder {
  matchingRate = 0;
  unitsMatched = 0;
  totalSatsCleared = 0;
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
    this.totalSatsCleared = llmMatch.totalSatsCleared;
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

export default class Batch {
  // native values from the POOL api
  batchId = '';
  prevBatchId = '';
  clearingPriceRate = 0;
  batchTxId = '';
  batchTxFeeRateSatPerKw = 0;
  matchedOrders: MatchedOrder[] = [];

  constructor(llmBatch: AUCT.BatchSnapshotResponse.AsObject) {
    makeAutoObservable(
      this,
      { matchedOrders: observable },
      { deep: false, autoBind: true },
    );

    this.update(llmBatch);
  }

  /**
   * Updates this batch model using data provided from the POOL GRPC api
   * @param llmBatch the batch data
   */
  update(llmBatch: AUCT.BatchSnapshotResponse.AsObject) {
    this.batchId = llmBatch.batchId.toString();
    this.prevBatchId = llmBatch.prevBatchId.toString();
    this.clearingPriceRate = llmBatch.clearingPriceRate;
    this.batchTxId = llmBatch.batchTxId;
    this.batchTxFeeRateSatPerKw = llmBatch.batchTxFeeRateSatPerKw;
    this.matchedOrders = llmBatch.matchedOrdersList
      // there should never be a match that does not have both a bid and an ask, but
      // the proto -> TS compiler makes these objects optional. This filter is just
      // a sanity check to avoid unexpected errors
      .filter(m => m.ask && m.bid)
      .map(m => new MatchedOrder(m as Required<AUCT.MatchedOrderSnapshot.AsObject>));
  }
}
