import {
  autorun,
  entries,
  IObservableArray,
  makeAutoObservable,
  observable,
  ObservableMap,
  runInAction,
  toJS,
  values,
} from 'mobx';
import { SwapStatus } from 'types/generated/loop_pb';
import debounce from 'lodash/debounce';
import { Store } from 'store';
import { Swap } from '../models';

interface PersistentSwapState {
  swappedChannels: Record<string, string[]>;
  dismissedSwapIds: string[];
}

export default class SwapStore {
  private _store: Store;

  /** the collection of swaps */
  swaps: ObservableMap<string, Swap> = observable.map();

  /** a list of channels used in pending swaps. mapping of chanId to an array of swap IDs */
  swappedChannels: ObservableMap<string, string[]> = observable.map();

  /** the ids of failed swaps that have been dismissed */
  dismissedSwapIds: IObservableArray<string> = observable.array([]);

  constructor(store: Store) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this._store = store;
  }

  /** swaps sorted by created date descending */
  get sortedSwaps() {
    const { field, descending } = this._store.settingsStore.historySort;
    const swaps = values(this.swaps)
      .slice()
      .sort((a, b) => Swap.compare(a, b, field));

    return descending ? swaps.reverse() : swaps;
  }

  /** the last two swaps */
  get lastTwoSwaps() {
    return this.sortedSwaps.slice(0, 2);
  }

  /** swaps that are currently processing or recently completed */
  get processingSwaps() {
    return this.sortedSwaps.filter(
      s => s.isPending || (s.isRecent && !this.dismissedSwapIds.includes(s.id)),
    );
  }

  /** checks the subserver status to ensure loop is running */
  get canFetchData() {
    if (
      this._store.subServerStore.subServers.loop.running &&
      !this._store.subServerStore.subServers.loop.error
    ) {
      return true;
    }

    return false;
  }

  /** stores the id of a dismissed swap */
  dismissSwap(swapId: string) {
    this.dismissedSwapIds.push(swapId);
  }

  /** stores the channels that were used in a swap to the state */
  addSwappedChannels(swapId: string, channelIds: string[]) {
    channelIds.forEach(chanId => {
      const swapIds = this.swappedChannels.get(chanId) || [];
      swapIds.push(swapId);
      this.swappedChannels.set(chanId, swapIds);
    });
    this._store.log.info('stored swapped channels', toJS(this.swappedChannels));
  }

  /** removes completed swap IDs from the swappedChannels list */
  pruneSwappedChannels() {
    this._store.log.info('pruning swapped channels list');
    // create a list of the currently pending swaps
    const processingIds = values(this.swaps)
      .filter(s => s.isPending)
      .map(s => s.id);
    // loop over the swapped channels that are stored
    entries(this.swappedChannels).forEach(([chanId, swapIds]) => {
      // filter out the swaps that are no longer processing
      const pendingSwapIds = swapIds.filter(id => processingIds.includes(id));
      if (swapIds.length !== pendingSwapIds.length) {
        // if the list has changed then the swapped channels value needs to be updated
        if (pendingSwapIds.length === 0) {
          // remove the channel id key if there are no more processing swaps using it
          this.swappedChannels.delete(chanId);
        } else {
          // update the swapIds with the updated list
          this.swappedChannels.set(chanId, pendingSwapIds);
        }
      }
    });
    this._store.log.info('updated swapStore.swappedChannels', toJS(this.swappedChannels));
  }

  /** fetch channels at most once every 2 seconds when using this func  */
  pruneSwappedChannelsThrottled = debounce(this.pruneSwappedChannels, 1000);
  /**
   * queries the Loop api to fetch the list of swaps and stores them
   * in the state
   */
  async fetchSwaps() {
    this._store.log.info('fetching swaps');

    try {
      const { swapsList } = await this._store.api.loop.listSwaps();
      runInAction(() => {
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

        this.pruneSwappedChannels();
        this._store.log.info('updated swapStore.swaps', toJS(this.swaps));
      });
    } catch (error) {
      this._store.appView.handleError(error, 'Unable to fetch Swaps');
    }
  }

  /** adds a new swap or updates an existing one */
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
  onSwapUpdate(loopSwap: SwapStatus.AsObject) {
    this.addOrUpdateSwap(loopSwap);
    // throttled functions should be used below because this function will
    // called for all pending swaps each time any one of them is updated.

    // the swap update likely caused a change in onchain/offchain balances
    // so fetch updated data from the server
    this._store.channelStore.fetchChannelsThrottled();
    this._store.nodeStore.fetchBalancesThrottled();
    // remove completed swaps from the swappedChannels list
    this.pruneSwappedChannelsThrottled();
  }

  /** exports the sorted list of swaps to CSV file */
  exportSwaps() {
    this._store.log.info('exporting Swaps to a CSV file');
    this._store.csv.export('swaps', Swap.csvColumns, toJS(this.sortedSwaps));
  }

  /**
   * initialize the swap state and auto-save when the state is changed
   */
  init() {
    this.load();
    autorun(
      () => {
        const swapState: PersistentSwapState = {
          swappedChannels: (this.swappedChannels.toJSON() as unknown) as Record<
            string,
            string[]
          >,
          dismissedSwapIds: this.dismissedSwapIds,
        };
        this._store.storage.set('swapState', swapState);
        this._store.log.info('saved swapState to localStorage', swapState);
      },
      { name: 'swapStoreAutorun' },
    );
  }

  /**
   * load swap state from the browser's local storage
   */
  load() {
    this._store.log.info('loading swapState from localStorage');
    const swapState = this._store.storage.get<PersistentSwapState>('swapState');
    if (swapState) {
      this.swappedChannels = observable.map<string, string[]>(swapState.swappedChannels);
      this.dismissedSwapIds = observable.array(swapState.dismissedSwapIds);
      this._store.log.info('loaded swapState', swapState);
    }
  }
}
