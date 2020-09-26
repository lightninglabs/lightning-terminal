import { action, computed, observable } from 'mobx';
import * as AUCT from 'types/generated/auctioneer_pb';
import * as POOL from 'types/generated/trader_pb';
import Big from 'big.js';
import { hex } from 'util/strings';

export enum OrderType {
  Bid = 'Bid',
  Ask = 'Ask',
}

export default class Order {
  // native values from the POOL api
  @observable nonce = '';
  @observable traderKey = '';
  @observable amount = Big(0);
  @observable state = 0;
  @observable rateFixed = 0;
  @observable maxBatchFeeRateSatPerKw = 0;
  @observable units = 0;
  @observable unitsUnfulfilled = 0;
  @observable reserved = Big(0);
  // custom app values
  @observable type: OrderType = OrderType.Bid;
  // for bids, this is the minimum. for asks this is the maximum
  @observable duration = 0;

  /**
   * true if this order's state is submitted or partially filled
   */
  @computed get isPending() {
    const pendingStates: number[] = [
      AUCT.OrderState.ORDER_SUBMITTED,
      AUCT.OrderState.ORDER_PARTIALLY_FILLED,
    ];
    return pendingStates.includes(this.state);
  }

  /**
   * The numeric account `state` as a user friendly string
   */
  @computed get stateLabel() {
    switch (this.state) {
      case AUCT.OrderState.ORDER_SUBMITTED:
        return 'Submitted';
      case AUCT.OrderState.ORDER_CLEARED:
        return 'Cleared';
      case AUCT.OrderState.ORDER_PARTIALLY_FILLED:
        return 'Partially Filled';
      case AUCT.OrderState.ORDER_EXECUTED:
        return 'Executed';
      case AUCT.OrderState.ORDER_CANCELED:
        return 'Cancelled';
      case AUCT.OrderState.ORDER_EXPIRED:
        return 'Expired';
      case AUCT.OrderState.ORDER_FAILED:
        return 'Failed';
    }

    return 'Unknown';
  }

  /**
   * Updates this order model using data provided from the POOL GRPC api
   * @param poolOrder the order data
   */
  @action.bound
  update(poolOrder: POOL.Order.AsObject, type: OrderType, duration: number) {
    this.nonce = hex(poolOrder.orderNonce);
    this.traderKey = hex(poolOrder.traderKey);
    this.amount = Big(poolOrder.amt);
    this.state = poolOrder.state;
    this.rateFixed = poolOrder.rateFixed;
    this.maxBatchFeeRateSatPerKw = poolOrder.maxBatchFeeRateSatPerKw;
    this.units = poolOrder.units;
    this.unitsUnfulfilled = poolOrder.unitsUnfulfilled;
    this.reserved = Big(poolOrder.reservedValueSat);

    this.type = type;
    this.duration = duration;
  }
}
