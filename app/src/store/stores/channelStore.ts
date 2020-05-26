import {
  action,
  computed,
  observable,
  ObservableMap,
  runInAction,
  toJS,
  values,
} from 'mobx';
import { Store } from 'store';
import { Channel } from '../models';

export default class ChannelStore {
  private _store: Store;

  /** the collection of channels */
  @observable channels: ObservableMap<string, Channel> = observable.map();

  constructor(store: Store) {
    this._store = store;
  }

  /**
   * an array of channels sorted by balance percent descending
   */
  @computed get sortedChannels() {
    return values(this.channels)
      .slice()
      .sort((a, b) => b.sortOrder - a.sortOrder);
  }

  /**
   * the sum of remote balance for all channels
   */
  @computed get totalInbound() {
    return this.sortedChannels.reduce((sum, chan) => sum + chan.remoteBalance, 0);
  }

  /**
   * the sum of local balance for all channels
   */
  @computed get totalOutbound() {
    return this.sortedChannels.reduce((sum, chan) => sum + chan.localBalance, 0);
  }

  /**
   * queries the LND api to fetch the list of channels and stores them
   * in the state
   */
  @action.bound
  async fetchChannels() {
    this._store.log.info('fetching channels');

    try {
      const { channelsList } = await this._store.api.lnd.listChannels();
      runInAction('fetchChannelsContinuation', () => {
        channelsList.forEach(lndChan => {
          // update existing channels or create new ones in state. using this
          // approach instead of overwriting the array will cause fewer state
          // mutations, resulting in better react rendering performance
          const existing = this.channels.get(lndChan.chanId);
          if (existing) {
            existing.update(lndChan);
          } else {
            this.channels.set(lndChan.chanId, new Channel(this._store, lndChan));
          }
        });
        // remove any channels in state that are not in the API response
        const serverIds = channelsList.map(c => c.chanId);
        const localIds = Object.keys(this.channels);
        localIds
          .filter(id => !serverIds.includes(id))
          .forEach(id => this.channels.delete(id));

        this._store.log.info('updated channelStore.channels', toJS(this.channels));
      });
    } catch (error) {
      runInAction('fetchChannelsError', () => {
        this._store.uiStore.notify(error.message, 'Unable to fetch Channels');
      });
    }
  }

  /** exports the sorted list of channels to CSV file */
  @action.bound
  exportChannels() {
    this._store.log.info('exporting Channels to a CSV file');
    this._store.csv.export('channels', Channel.csvColumns, toJS(this.sortedChannels));
  }
}
