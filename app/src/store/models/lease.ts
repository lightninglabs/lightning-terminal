import { makeAutoObservable } from 'mobx';
import * as AUCT from 'types/generated/auctioneer_pb';
import * as POOL from 'types/generated/trader_pb';
import Big from 'big.js';
import { hex } from 'util/strings';

export default class Lease {
  // native values from the POOL api
  channelPoint = '';
  channelAmtSat = Big(0);
  channelDurationBlocks = 0;
  channelLeaseExpiry = 0;
  premiumSat = Big(0);
  executionFeeSat = Big(0);
  chainFeeSat = Big(0);
  clearingRatePrice = 0;
  orderFixedRate = 0;
  orderNonce = '';
  purchased = false;
  channelRemoteNodeKey = '';
  channelNodeTier = 0;

  constructor(poolLease: POOL.Lease.AsObject) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this.update(poolLease);
  }

  /**
   * Updates this lease model using data provided from the POOL GRPC api
   * @param poolLease the lease data
   */
  update(poolLease: POOL.Lease.AsObject) {
    this.channelPoint = Lease.channelPointToString(poolLease.channelPoint);
    this.channelAmtSat = Big(poolLease.channelAmtSat);
    this.channelDurationBlocks = poolLease.channelDurationBlocks;
    this.channelLeaseExpiry = poolLease.channelLeaseExpiry;
    this.premiumSat = Big(poolLease.premiumSat);
    this.executionFeeSat = Big(poolLease.executionFeeSat);
    this.chainFeeSat = Big(poolLease.chainFeeSat);
    this.clearingRatePrice = poolLease.clearingRatePrice;
    this.orderFixedRate = poolLease.orderFixedRate;
    this.orderNonce = hex(poolLease.orderNonce);
    this.purchased = poolLease.purchased;
    this.channelRemoteNodeKey = hex(poolLease.channelRemoteNodeKey);
    this.channelNodeTier = poolLease.channelNodeTier;
  }

  /**
   * Converts a lease's channelPoint object into a string
   * @param poolLease the lease data from the API
   */
  static channelPointToString(outpoint?: AUCT.OutPoint.AsObject) {
    if (!outpoint) return '';
    const { txid, outputIndex } = outpoint;
    return `${hex(txid, true)}:${outputIndex}`;
  }
}
