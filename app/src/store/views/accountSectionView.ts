import { makeAutoObservable } from 'mobx';
import { Store } from 'store';

export type VisibleSection = 'summary' | 'fund-new' | 'fund-new-confirm' | 'fund';

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
      return this.section === 'fund-new-confirm' ? 'fund-new-confirm' : 'fund-new';
    }
    return this.section;
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

  showFundNewConfirm() {
    this.setSection('fund-new-confirm');
  }
}
