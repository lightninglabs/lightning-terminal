import {
  action,
  computed,
  IReactionDisposer,
  observable,
  ObservableMap,
  reaction,
  runInAction,
  toJS,
  values,
} from 'mobx';
import { IS_PROD, IS_TEST } from 'config';
import { Store } from 'store';
import { Swap } from '../models';

export default class SwapStore {
  private _store: Store;
  /** a reference to the polling timer, needed to stop polling */
  pollingInterval?: NodeJS.Timeout;
  /** the mobx disposer func to cancel automatic polling */
  stopAutoPolling: IReactionDisposer;

  /** the collection of swaps */
  @observable swaps: ObservableMap<string, Swap> = observable.map();

  /** the ids of failed swaps that have been dismissed */
  @observable dismissedSwapIds: string[] = [];

  constructor(store: Store) {
    this._store = store;

    // automatically start & stop polling for swaps if there are any pending
    this.stopAutoPolling = reaction(
      () => this.pendingSwaps.length,
      (length: number) => {
        if (length > 0) {
          this.startPolling();
        } else {
          this.stopPolling();
          // also update our channels and balances when the loop is complete
          this._store.channelStore.fetchChannels();
          this._store.nodeStore.fetchBalances();
        }
      },
    );
  }

  /** swaps sorted by created date descending */
  @computed get sortedSwaps() {
    return values(this.swaps)
      .slice()
      .sort((a, b) => b.initiationTime - a.initiationTime);
  }

  /** the last two swaps */
  @computed get lastTwoSwaps() {
    return this.sortedSwaps.slice(0, 2);
  }

  /** swaps that are currently processing or recently completed */
  @computed get processingSwaps() {
    return this.sortedSwaps.filter(
      s => s.isPending || (s.isRecent && !this.dismissedSwapIds.includes(s.id)),
    );
  }

  /** swaps that are currently pending */
  @computed get pendingSwaps() {
    return this.sortedSwaps.filter(s => s.isPending);
  }

  @action.bound
  dismissSwap(swapId: string) {
    this.dismissedSwapIds.push(swapId);
  }

  /**
   * queries the Loop api to fetch the list of swaps and stores them
   * in the state
   */
  @action.bound
  async fetchSwaps() {
    this._store.log.info('fetching swaps');

    try {
      const { swapsList } = await this._store.api.loop.listSwaps();
      runInAction('fetchSwapsContinuation', () => {
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
        localIds
          .filter(id => !serverIds.includes(id))
          .forEach(id => this.swaps.delete(id));

        this._store.log.info('updated swapStore.swaps', toJS(this.swaps));
      });
    } catch (error) {
      runInAction('fetchSwapsError', () => {
        this._store.uiStore.notify(error.message, 'Unable to fetch Swaps');
      });
    }
  }

  @action.bound
  startPolling() {
    if (this.pollingInterval) this.stopPolling();
    this._store.log.info('start polling for swap updates');
    const ms = IS_PROD ? 60 * 1000 : IS_TEST ? 100 : 1000;
    this.pollingInterval = setInterval(this.fetchSwaps, ms);
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

  /** exports the sorted list of swaps to CSV file */
  @action.bound
  exportSwaps() {
    this._store.log.info('exporting Swaps to a CSV file');
    this._store.csv.export('swaps', Swap.csvColumns, toJS(this.sortedSwaps));
  }
}
