import { action, observable } from 'mobx';
import { Store } from 'store';

export default class UiStore {
  private _store: Store;

  @observable processingSwapsVisible = false;

  constructor(store: Store) {
    this._store = store;
  }

  @action.bound
  toggleProcessingSwaps() {
    this.processingSwapsVisible = !this.processingSwapsVisible;
  }
}
