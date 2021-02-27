import { makeAutoObservable } from 'mobx';
import { Store } from 'store';

export type VisibleSection =
  | 'none'
  | 'summary'
  | 'fund-new'
  | 'fund-new-confirm'
  | 'fund'
  | 'fund-confirm'
  | 'expired'
  | 'close'
  | 'close-confirm'
  | 'renew'
  | 'renew-confirm';

export default class AccountSectionView {
  private _store: Store;

  // the visible view to display in the account section
  section: VisibleSection = 'summary';

  constructor(store: Store) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this._store = store;
  }

  //
  // Computed properties
  //

  /** the calculated section to display */
  get visibleSection(): VisibleSection {
    // force fund new account flow when trader key is undefined
    if (!this._store.accountStore.activeTraderKey) {
      const inFundingFlow = ['fund-new-confirm', 'fund-new'].includes(this.section);
      return inFundingFlow ? this.section : 'none';
    }
    // force close account flow when expired
    if (
      this._store.accountStore.activeAccount.stateLabel === 'Expired' &&
      !['close', 'close-confirm', 'renew', 'renew-confirm'].includes(this.section)
    ) {
      return 'expired';
    }

    // display the selected section
    return this.section;
  }

  /** indicates if the LND node has any open channels */
  get hasChannels() {
    return this._store.channelStore.channels.size > 0;
  }

  //
  // Actions
  //

  setSection(section: VisibleSection) {
    this.section = section;
    this._store.log.info(
      `Updated AccountSectionView.section to '${section}' with '${this.visibleSection}' visible`,
    );
  }

  showSummary() {
    this.setSection('summary');
  }

  showFundAccount() {
    if (
      this._store.accountStore.activeTraderKey &&
      this._store.accountStore.activeAccount.stateLabel === 'Open'
    ) {
      this.setSection('fund');
    } else {
      this.setSection('fund-new');
    }
  }

  showFundNew() {
    this.setSection('fund-new');
  }

  showFundNewConfirm() {
    this.setSection('fund-new-confirm');
  }

  showFundConfirm() {
    this.section = 'fund-confirm';
  }

  showCloseAccount() {
    this.section = 'close';
  }

  showCloseConfirm() {
    this.section = 'close-confirm';
  }

  showRenewAccount() {
    this.section = 'renew';
  }

  showRenewConfirm() {
    this.section = 'renew-confirm';
  }
}
