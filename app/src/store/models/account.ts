import { makeAutoObservable } from 'mobx';
import * as POOL from 'types/generated/trader_pb';
import Big from 'big.js';
import { ellipseInside, hex } from 'util/strings';

export default class Account {
  // native values from the pool api
  traderKey = '';
  totalBalance = Big(0);
  availableBalance = Big(0);
  expirationHeight = 0;
  state = 0;
  fundingTxnId = '';

  constructor(poolAccount: POOL.Account.AsObject) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this.update(poolAccount);
  }

  /** the first and last 6 chars of the traderKey */
  get traderKeyEllipsed() {
    return ellipseInside(this.traderKey);
  }

  /** the first and last 6 chars of the funding txn id */
  get fundingTxnIdEllipsed() {
    return ellipseInside(this.fundingTxnId);
  }

  /** the pending balance of the account */
  get pendingBalance() {
    return this.totalBalance.minus(this.availableBalance);
  }

  /** determines if the account is in one of the pending states */
  get isPending() {
    return (
      this.state === POOL.AccountState.PENDING_OPEN ||
      this.state === POOL.AccountState.PENDING_UPDATE ||
      this.state === POOL.AccountState.PENDING_BATCH ||
      this.state === POOL.AccountState.PENDING_CLOSED
    );
  }

  /**
   * The numeric account `state` as a user friendly string
   */
  get stateLabel() {
    switch (this.state) {
      case POOL.AccountState.PENDING_OPEN:
        return 'Pending Open';
      case POOL.AccountState.PENDING_UPDATE:
        return 'Pending Update';
      case POOL.AccountState.PENDING_BATCH:
        return 'Pending Batch';
      case POOL.AccountState.OPEN:
        return 'Open';
      case POOL.AccountState.EXPIRED:
        return 'Expired';
      case POOL.AccountState.PENDING_CLOSED:
        return 'Pending Closed';
      case POOL.AccountState.CLOSED:
        return 'Closed';
      case POOL.AccountState.RECOVERY_FAILED:
        return 'Recovery Failed';
    }

    return 'Unknown';
  }

  /**
   * Updates this account model using data provided from the pool GRPC api
   * @param poolAccount the account data
   */
  update(poolAccount: POOL.Account.AsObject) {
    this.traderKey = hex(poolAccount.traderKey);
    this.totalBalance = Big(poolAccount.value);
    this.availableBalance = Big(poolAccount.availableBalance);
    this.expirationHeight = poolAccount.expirationHeight;
    this.state = poolAccount.state;
    this.fundingTxnId = hex(poolAccount.latestTxid);
  }
}
