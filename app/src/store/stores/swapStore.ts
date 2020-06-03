import {
  action,
  computed,
  observable,
  ObservableMap,
  runInAction,
  toJS,
  values,
} from 'mobx';
import { SwapStatus } from 'types/generated/loop_pb';
import { Store } from 'store';
import { Swap } from '../models';

export default class SwapStore {
  private _store: Store;
  /** the collection of swaps */
  @observable swaps: ObservableMap<string, Swap> = observable.map();

  /** the ids of failed swaps that have been dismissed */
  @observable dismissedSwapIds: string[] = [];

  constructor(store: Store) {
    this._store = store;
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
          this.addOrUpdateSwap(loopSwap);
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
      this._store.uiStore.handleError(error, 'Unable to fetch Swaps');
    }
  }

  /** adds a new swap or updates an existing one */
  @action.bound
  addOrUpdateSwap(loopSwap: SwapStatus.AsObject) {
    const existing = this.swaps.get(loopSwap.id);
    if (existing) {
      existing.update(loopSwap);
      this._store.log.info('updated existing swap', toJS(loopSwap));
    } else {
      this.swaps.set(loopSwap.id, new Swap(loopSwap));
      this._store.log.info('added new swap', toJS(loopSwap));
    }
  }

  /** updates the swap and refreshes the channel list */
  @action.bound
  onSwapUpdate(loopSwap: SwapStatus.AsObject) {
    this.addOrUpdateSwap(loopSwap);
    this._store.channelStore.fetchChannels();
  }

  /** exports the sorted list of swaps to CSV file */
  @action.bound
  exportSwaps() {
    this._store.log.info('exporting Swaps to a CSV file');
    this._store.csv.export('swaps', Swap.csvColumns, toJS(this.sortedSwaps));
  }
}
