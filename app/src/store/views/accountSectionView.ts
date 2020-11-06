import { makeAutoObservable } from 'mobx';
import { Store } from 'store';

export type VisibleSection = 'summary' | 'fund-new' | 'fund';

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
    if (!this._store.accountStore.activeTraderKey) {
      return 'fund-new';
    }
    return this.section;
  }

  //
  // Actions
  //

  showSummary() {
    this.section = 'summary';
  }

  showFundAccount() {
    if (
      this._store.accountStore.activeTraderKey &&
      this._store.accountStore.activeAccount.stateLabel === 'Open'
    ) {
      this.section = 'fund';
    } else {
      this.section = 'fund-new';
    }
  }
}
