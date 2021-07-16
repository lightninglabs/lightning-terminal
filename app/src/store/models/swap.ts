import { makeAutoObservable } from 'mobx';
import { now } from 'mobx-utils';
import * as LOOP from 'types/generated/loop_pb';
import { SortParams } from 'types/state';
import Big from 'big.js';
import formatDate from 'date-fns/format';
import { CsvColumns } from 'util/csv';
import { ellipseInside } from 'util/strings';

export default class Swap {
  // native values from the Loop api
  id = '';
  type = 0;
  amount = Big(0);
  initiationTime = Big(0);
  lastUpdateTime = Big(0);
  state = 0;
  failureReason = 0;

  constructor(loopSwap: LOOP.SwapStatus.AsObject) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this.update(loopSwap);
  }

  /** the first and last 6 chars of the swap id */
  get ellipsedId() {
    return ellipseInside(this.id);
  }

  /** True if the swap's state is Failed */
  get isFailed() {
    return this.state === LOOP.SwapState.FAILED;
  }

  /** True if the swap */
  get isRecent() {
    const fiveMinutes = 5 * 60 * 1000;
    return now() - this.updatedOn.getTime() < fiveMinutes;
  }

  /** True when the state of this swap is not Success or Failed */
  get isPending() {
    const pending =
      this.state !== LOOP.SwapState.SUCCESS && this.state !== LOOP.SwapState.FAILED;

    return pending;
  }

  /**
   * The numeric swap type as a user friendly string
   */
  get typeName() {
    switch (this.type) {
      case LOOP.SwapType.LOOP_IN:
        return 'Loop In';
      case LOOP.SwapType.LOOP_OUT:
        return 'Loop Out';
    }
    return 'Unknown';
  }

  /**
   * The numeric swap `state` as a user friendly string
   */
  get stateLabel() {
    switch (this.state) {
      case LOOP.SwapState.INITIATED:
        return 'Initiated';
      case LOOP.SwapState.PREIMAGE_REVEALED:
        return 'Preimage Revealed';
      case LOOP.SwapState.HTLC_PUBLISHED:
        return 'HTLC Published';
      case LOOP.SwapState.SUCCESS:
        return 'Success';
      case LOOP.SwapState.FAILED:
        return 'Failed';
      case LOOP.SwapState.INVOICE_SETTLED:
        return 'Invoice Settled';
    }

    return 'Unknown';
  }

  /**
   * The numeric swap `failureReason` as a user friendly string
   */
  get failureLabel() {
    switch (this.failureReason) {
      case LOOP.FailureReason.FAILURE_REASON_OFFCHAIN:
        return 'Off-chain Failure';
      case LOOP.FailureReason.FAILURE_REASON_TIMEOUT:
        return 'On-chain Timeout';
      case LOOP.FailureReason.FAILURE_REASON_SWEEP_TIMEOUT:
        return 'Sweep Timeout';
      case LOOP.FailureReason.FAILURE_REASON_INSUFFICIENT_VALUE:
        return 'Insufficient Value';
      case LOOP.FailureReason.FAILURE_REASON_TEMPORARY:
        return 'Temporary Failure';
      case LOOP.FailureReason.FAILURE_REASON_INCORRECT_AMOUNT:
        return 'Incorrect Amount';
      case LOOP.FailureReason.FAILURE_REASON_NONE:
      default:
        return 'Failed';
    }
  }

  /** The date this swap was created as a JS Date object */
  get createdOn() {
    return new Date(this.initiationTime.div(1000).div(1000).toNumber());
  }

  /** The date this swap was created as formatted string */
  get createdOnLabel() {
    return formatDate(this.createdOn, 'MMM d, h:mm a');
  }

  /** The date this swap was last updated as a JS Date object */
  get updatedOn() {
    return new Date(this.lastUpdateTime.div(1000).div(1000).toNumber());
  }

  /** The date this swap was last updated as formatted string */
  get updatedOnLabel() {
    return formatDate(this.updatedOn, 'MMM d, h:mm a');
  }

  /**
   * Updates this swap model using data provided from the Loop GRPC api
   * @param loopSwap the swap data
   */
  update(loopSwap: LOOP.SwapStatus.AsObject) {
    this.id = loopSwap.id;
    this.type = loopSwap.type;
    this.amount = Big(loopSwap.amt);
    this.initiationTime = Big(loopSwap.initiationTime);
    this.lastUpdateTime = Big(loopSwap.lastUpdateTime);
    this.state = loopSwap.state;
    this.failureReason = loopSwap.failureReason;
  }

  /**
   * Compares a specific field of two swaps for sorting
   * @param a the first swap to compare
   * @param b the second swap to compare
   * @param sortBy the field and direction to sort the two swaps by
   * @returns a positive number if `a`'s field is greater than `b`'s,
   * a negative number if `a`'s field is less than `b`'s, or zero otherwise
   */
  static compare(a: Swap, b: Swap, field: SortParams<Swap>['field']): number {
    switch (field) {
      case 'stateLabel':
        return a.stateLabel.toLowerCase() > b.stateLabel.toLowerCase() ? 1 : -1;
      case 'typeName':
        return a.typeName.toLowerCase() > b.typeName.toLowerCase() ? 1 : -1;
      case 'amount':
        return a.amount.sub(b.amount).toNumber();
      case 'initiationTime':
        return a.initiationTime.sub(b.initiationTime).toNumber();
      case 'lastUpdateTime':
      default:
        return a.lastUpdateTime.sub(b.lastUpdateTime).toNumber();
    }
  }

  /**
   * Specifies which properties of this class should be exported to CSV
   * @param key must match the name of a property on this class
   * @param value the user-friendly name displayed in the CSV header
   */
  static csvColumns: CsvColumns = {
    id: 'Swap ID',
    typeName: 'Type',
    amount: 'Amount',
    stateLabel: 'Status',
    createdOnLabel: 'Created On',
    updatedOnLabel: 'Updated On',
  };
}
