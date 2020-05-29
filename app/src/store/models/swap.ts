import { action, computed, observable } from 'mobx';
import { now } from 'mobx-utils';
import * as LOOP from 'types/generated/loop_pb';
import Big from 'big.js';
import { CsvColumns } from 'util/csv';
import { ellipseInside } from 'util/strings';

export default class Swap {
  // native values from the Loop api
  @observable id = '';
  @observable type = 0;
  @observable amount = Big(0);
  @observable initiationTime = 0;
  @observable lastUpdateTime = 0;
  @observable state = 0;

  constructor(loopSwap: LOOP.SwapStatus.AsObject) {
    this.update(loopSwap);
  }

  /** the first and last 6 chars of the swap id */
  @computed get idEllipsed() {
    return ellipseInside(this.id);
  }

  /** True if the swap's state is Failed */
  @computed get isFailed() {
    return this.state === LOOP.SwapState.FAILED;
  }

  /** True if the swap */
  @computed get isRecent() {
    const fiveMinutes = 5 * 60 * 1000;
    return now() - this.updatedOn.getTime() < fiveMinutes;
  }

  /** True when the state of this swap is not Success or Failed */
  @computed get isPending() {
    const pending =
      this.state !== LOOP.SwapState.SUCCESS && this.state !== LOOP.SwapState.FAILED;

    return pending;
  }

  /**
   * The numeric swap type as a user friendly string
   */
  @computed get typeName() {
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
  @computed get stateLabel() {
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

  /** The date this swap was created as a JS Date object */
  @computed get createdOn() {
    return new Date(this.initiationTime / 1000 / 1000);
  }

  /** The date this swap was created as formatted string */
  @computed get createdOnLabel() {
    return `${this.createdOn.toLocaleDateString()} ${this.createdOn.toLocaleTimeString()}`;
  }

  /** The date this swap was last updated as a JS Date object */
  @computed get updatedOn() {
    return new Date(this.lastUpdateTime / 1000 / 1000);
  }

  /** The date this swap was last updated as formatted string */
  @computed get updatedOnLabel() {
    return `${this.updatedOn.toLocaleDateString()} ${this.updatedOn.toLocaleTimeString()}`;
  }

  /**
   * Updates this swap model using data provided from the Loop GRPC api
   * @param loopSwap the swap data
   */
  @action.bound
  update(loopSwap: LOOP.SwapStatus.AsObject) {
    this.id = loopSwap.id;
    this.type = loopSwap.type;
    this.amount = Big(loopSwap.amt);
    this.initiationTime = loopSwap.initiationTime;
    this.lastUpdateTime = loopSwap.lastUpdateTime;
    this.state = loopSwap.state;
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
