import { makeAutoObservable } from 'mobx';
import * as AUCT from 'types/generated/auctioneerrpc/auctioneer_pb';
import * as POOL from 'types/generated/trader_pb';
import { SortParams } from 'types/state';
import Big from 'big.js';
import formatDate from 'date-fns/format';
import { hex } from 'util/strings';
import { Store } from 'store/store';

export enum OrderType {
  Bid = 'Bid',
  Ask = 'Ask',
}

export const NODE_TIERS: Record<Tier, string> = {
  [AUCT.NodeTier.TIER_DEFAULT]: 'Default - T1',
  [AUCT.NodeTier.TIER_0]: 'T0 - All Nodes',
  [AUCT.NodeTier.TIER_1]: 'T1 - Preferred Nodes',
};

export type Tier = AUCT.NodeTierMap[keyof AUCT.NodeTierMap];

export default class Order {
  private _store: Store;
  // native values from the POOL api
  nonce = '';
  traderKey = '';
  amount = Big(0);
  state = 0;
  rateFixed = Big(0);
  maxBatchFeeRateSatPerKw = Big(0);
  units = 0;
  unitsUnfulfilled = 0;
  reserved = Big(0);
  creationTimestamp = Big(0);
  minNodeTier?: Tier = 0;
  // custom app values
  type: OrderType = OrderType.Bid;
  // for bids, this is the minimum. for asks this is the maximum
  duration = Big(0);

  constructor(store: Store) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this._store = store;
  }

  /** the number of leases for this order */
  get leaseCount() {
    const leasesByNonce = this._store.orderStore.leasesByNonce;
    const leases = leasesByNonce[this.nonce] || [];
    return leases.length;
  }

  /** the order fixed rate expressed as basis points */
  get basisPoints() {
    const pct = this._store.api.pool.calcPctRate(this.rateFixed, this.duration);
    return Math.round(pct * 100 * 100);
  }

  /**
   * true if this order's state is submitted or partially filled
   */
  get isPending() {
    const pendingStates: number[] = [
      AUCT.OrderState.ORDER_SUBMITTED,
      AUCT.OrderState.ORDER_PARTIALLY_FILLED,
    ];
    return pendingStates.includes(this.state);
  }

  /**
   * The numeric account `state` as a user friendly string
   */
  get stateLabel() {
    switch (this.state) {
      case AUCT.OrderState.ORDER_SUBMITTED:
        return 'Submitted';
      case AUCT.OrderState.ORDER_CLEARED:
        return 'Cleared';
      case AUCT.OrderState.ORDER_PARTIALLY_FILLED:
        return 'Partially Filled';
      case AUCT.OrderState.ORDER_EXECUTED:
        return 'Filled';
      case AUCT.OrderState.ORDER_CANCELED:
        return 'Cancelled';
      case AUCT.OrderState.ORDER_EXPIRED:
        return 'Expired';
      case AUCT.OrderState.ORDER_FAILED:
        return 'Failed';
    }

    return 'Unknown';
  }

  /** the state label with the number of associated leases */
  get stateWithCount() {
    return this.leaseCount === 0
      ? this.stateLabel
      : `${this.stateLabel} (${this.leaseCount})`;
  }

  /** The date this swap was created as a JS Date object */
  get createdOn() {
    return new Date(this.creationTimestamp.div(1000).div(1000).toNumber());
  }

  /** The date this swap was created as formatted string */
  get createdOnLabel() {
    return formatDate(this.createdOn, 'MMM d, h:mm a');
  }

  /**
   * Updates this order model using data provided from the POOL GRPC api
   * @param poolOrder the order data
   */
  update(
    poolOrder: POOL.Order.AsObject,
    type: OrderType,
    duration: number,
    minNodeTier?: Tier,
  ) {
    this.nonce = hex(poolOrder.orderNonce);
    this.traderKey = hex(poolOrder.traderKey);
    this.amount = Big(poolOrder.amt);
    this.state = poolOrder.state;
    this.rateFixed = Big(poolOrder.rateFixed);
    this.maxBatchFeeRateSatPerKw = Big(poolOrder.maxBatchFeeRateSatPerKw);
    this.units = poolOrder.units;
    this.unitsUnfulfilled = poolOrder.unitsUnfulfilled;
    this.reserved = Big(poolOrder.reservedValueSat);
    this.creationTimestamp = Big(poolOrder.creationTimestampNs);

    this.type = type;
    this.duration = Big(duration);
    this.minNodeTier = minNodeTier;
  }

  /**
   * Compares a specific field of two orders for sorting
   * @param a the first order to compare
   * @param b the second order to compare
   * @param sortBy the field and direction to sort the two orders by
   * @returns a positive number if `a`'s field is greater than `b`'s,
   * a negative number if `a`'s field is less than `b`'s, or zero otherwise
   */
  static compare(a: Order, b: Order, field: SortParams<Order>['field']): number {
    switch (field) {
      case 'type':
        return a.type.toLowerCase() > b.type.toLowerCase() ? 1 : -1;
      case 'amount':
        return a.amount.sub(b.amount).toNumber();
      case 'rateFixed':
        return a.rateFixed.sub(b.rateFixed).toNumber();
      case 'duration':
        return a.duration.sub(b.duration).toNumber();
      case 'stateLabel':
        return a.stateLabel.toLowerCase() > b.stateLabel.toLowerCase() ? 1 : -1;
      case 'creationTimestamp':
      default:
        return a.creationTimestamp.sub(b.creationTimestamp).toNumber();
    }
  }
}
