import {
  action,
  computed,
  observable,
  ObservableMap,
  reaction,
  runInAction,
  toJS,
  values,
} from 'mobx';
import { Store } from 'store';
import { Swap } from '../models';

export default class SwapStore {
  private _store: Store;

  /** the collection of swaps */
  @observable swaps: ObservableMap<string, Swap> = observable.map();

  pollingInterval?: NodeJS.Timeout;

  constructor(store: Store) {
    this._store = store;

    // automatically start & stop polling for swaps if there are any pending
    reaction(
      () => this.pendingSwaps.length,
      (length: number) => {
        if (length > 0) {
          this.startPolling();
        } else {
          this.stopPolling();
        }
      },
    );
  }

  /**
   * an array of swaps sorted by created date descending
   */
  @computed get sortedSwaps() {
    return values(this.swaps)
      .slice()
      .sort((a, b) => b.initiationTime - a.initiationTime);
  }

  /**
   * an array of the two most recent swaps
   */
  @computed get recentSwaps() {
    return this.sortedSwaps.slice(0, 2);
  }

  /**
   * an array of swaps that are currently pending
   */
  @computed get pendingSwaps() {
    return this.sortedSwaps.filter(s => s.isPending);
  }

  /**
   * queries the Loop api to fetch the list of swaps and stores them
   * in the state
   */
  @action.bound
  async fetchSwaps() {
    this._store.log.info('fetching swaps');

    const { swapsList } = await this._store.api.loop.listSwaps();
    runInAction(() => {
      swapsList.forEach(loopSwap => {
        // update existing swaps or create new ones in state. using this
        // approach instead of overwriting the array will cause fewer state
        // mutations, resulting in better react rendering performance
        const existing = this.swaps.get(loopSwap.id);
        if (existing) {
          existing.update(loopSwap);
        } else {
          this.swaps.set(loopSwap.id, new Swap(loopSwap));
        }
      });
      // remove any swaps in state that are not in the API response
      const serverIds = swapsList.map(c => c.id);
      const localIds = Object.keys(this.swaps);
      localIds.filter(id => !serverIds.includes(id)).forEach(id => this.swaps.delete(id));

      this._store.log.info('updated swapStore.swaps', toJS(this.swaps));
    });
  }

  @action.bound
  startPolling() {
    if (this.pollingInterval) this.stopPolling();
    this._store.log.info('start polling for swap updates');
    this.pollingInterval = setInterval(this.fetchSwaps, 1000);
  }

  @action.bound
  stopPolling() {
    this._store.log.info('stop polling for swap updates');
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = undefined;
      this._store.log.info('polling stopped');
    } else {
      this._store.log.info('polling was already stopped');
    }
  }
}
