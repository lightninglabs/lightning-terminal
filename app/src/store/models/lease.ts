import { makeAutoObservable } from 'mobx';
import * as AUCT from 'types/generated/auctioneerrpc/auctioneer_pb';
import * as POOL from 'types/generated/trader_pb';
import Big from 'big.js';
import { CsvColumns } from 'util/csv';
import { hex } from 'util/strings';
import { NODE_TIERS, Tier } from './order';

export default class Lease {
  // native values from the POOL api
  channelPoint = '';
  channelAmtSat = Big(0);
  channelDurationBlocks = 0;
  channelLeaseExpiry = 0;
  premiumSat = Big(0);
  executionFeeSat = Big(0);
  chainFeeSat = Big(0);
  clearingRatePrice = Big(0);
  orderFixedRate = Big(0);
  orderNonce = '';
  purchased = false;
  channelRemoteNodeKey = '';
  channelNodeTier: Tier = 0;

  constructor(poolLease: POOL.Lease.AsObject) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this.update(poolLease);
  }

  /** the node tier as user-friendly text */
  get tierLabel() {
    return NODE_TIERS[this.channelNodeTier];
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
    this.clearingRatePrice = Big(poolLease.clearingRatePrice);
    this.orderFixedRate = Big(poolLease.orderFixedRate);
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

  /**
   * Specifies which properties of this class should be exported to CSV
   * @param key must match the name of a property on this class
   * @param value the user-friendly name displayed in the CSV header
   */
  static csvColumns: CsvColumns = {
    orderNonce: 'Order Nonce',
    channelPoint: 'Channel Point',
    channelRemoteNodeKey: 'Remote Pubkey',
    channelAmtSat: 'Amount',
    channelDurationBlocks: 'Duration',
    channelLeaseExpiry: 'Lease Expiry',
    premiumSat: 'Premium',
    executionFeeSat: 'Execution Fee',
    chainFeeSat: 'Chain Fee',
    clearingRatePrice: 'Clearing Rate',
    orderFixedRate: 'Fixed Rate',
    purchased: 'Purchased',
    tierLabel: 'Tier',
  };
}
