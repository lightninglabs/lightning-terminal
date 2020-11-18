import { makeAutoObservable } from 'mobx';
import * as POOL from 'types/generated/trader_pb';
import Big from 'big.js';
import { ellipseInside, hex } from 'util/strings';
import { prefixTranslation } from 'util/translate';
import { Store } from 'store/store';

const { l } = prefixTranslation('stores.AccountStore');

export default class Account {
  private _store: Store;

  // native values from the pool api
  traderKey = '';
  totalBalance = Big(0);
  availableBalance = Big(0);
  expirationHeight = 0;
  state = 0;
  fundingTxnId = '';

  constructor(store: Store, poolAccount: POOL.Account.AsObject) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this._store = store;
    this.update(poolAccount);
  }

  /** the first and last 6 chars of the funding txn id */
  get fundingTxnIdEllipsed() {
    return ellipseInside(this.fundingTxnId, 4);
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

  /** the number of blocks until this account expires */
  get expiresInBlocks() {
    const currentHeight = this._store.nodeStore.blockHeight;
    const expiresHeight = this.expirationHeight;
    return Math.max(expiresHeight - currentHeight, 0);
  }

  /** the estimated amount of time until the active account expires */
  get expiresInLabel() {
    if (this.state === POOL.AccountState.EXPIRED) return '';

    const blocksPerDay = 144;
    const blocks = this.expiresInBlocks;
    if (blocks <= 0) return '';

    const days = Math.round(blocks / blocksPerDay);
    const weeks = Math.floor(days / 7);
    if (days <= 1) {
      const hours = Math.floor(blocks / 6);
      return `~${hours} ${l('common.hours', { count: hours })}`;
    } else if (days < 14) {
      return `~${days} ${l('common.days', { count: days })}`;
    } else if (weeks < 8) {
      return `~${weeks} ${l('common.weeks', { count: weeks })}`;
    }
    const months = weeks / 4.3;

    return `~${months.toFixed(1)} ${l('common.months', { count: months })}`;
  }

  /** indicates if this account is going to expire soon */
  get expiresSoon() {
    // warn if the account expires in under 3 days
    const limit = 144 * 3;
    return this.expiresInBlocks <= limit;
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
