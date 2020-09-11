import { action, observable } from 'mobx';
import * as AUCT from 'types/generated/auctioneer_pb';

class MatchedOrder {
  @observable matchingRate = 0;
  @observable unitsMatched = 0;
  @observable totalSatsCleared = 0;
  @observable ask = {
    maxDurationBlocks: 0,
    rateFixed: 0,
  };
  @observable bid = {
    minDurationBlocks: 0,
    rateFixed: 0,
  };

  constructor(llmMatch: Required<AUCT.MatchedOrderSnapshot.AsObject>) {
    this.matchingRate = llmMatch.matchingRate;
    this.unitsMatched = llmMatch.unitsMatched;
    this.totalSatsCleared = llmMatch.totalSatsCleared;
    this.ask = {
      maxDurationBlocks: llmMatch.ask.maxDurationBlocks,
      rateFixed: llmMatch.ask.rateFixed,
    };
    this.bid = {
      minDurationBlocks: llmMatch.bid.minDurationBlocks,
      rateFixed: llmMatch.bid.rateFixed,
    };
  }
}

export default class Batch {
  // native values from the POOL api
  @observable batchId = '';
  @observable prevBatchId = '';
  @observable clearingPriceRate = 0;
  @observable batchTxId = '';
  @observable matchedOrders: MatchedOrder[] = [];

  constructor(llmBatch: AUCT.BatchSnapshotResponse.AsObject) {
    this.update(llmBatch);
  }

  /**
   * Updates this batch model using data provided from the POOL GRPC api
   * @param llmBatch the batch data
   */
  @action.bound
  update(llmBatch: AUCT.BatchSnapshotResponse.AsObject) {
    this.batchId = llmBatch.batchId.toString();
    this.prevBatchId = llmBatch.prevBatchId.toString();
    this.clearingPriceRate = llmBatch.clearingPriceRate;
    this.batchTxId = llmBatch.batchTxId;
    this.matchedOrders = llmBatch.matchedOrdersList
      // there should never be a match that does not have both a bid and an ask, but
      // the proto -> TS compiler makes these objects optional. This filter is just
      // a sanity check to avoid unexpected errors
      .filter(m => m.ask && m.bid)
      .map(m => new MatchedOrder(m as Required<AUCT.MatchedOrderSnapshot.AsObject>));
  }
}
