import {
  action,
  computed,
  observable,
  ObservableMap,
  runInAction,
  toJS,
  values,
} from 'mobx';
import { ChannelEventUpdate, ChannelPoint } from 'types/generated/lnd_pb';
import Big from 'big.js';
import { Store } from 'store';
import { Channel } from '../models';

const {
  OPEN_CHANNEL,
  CLOSED_CHANNEL,
  ACTIVE_CHANNEL,
  INACTIVE_CHANNEL,
} = ChannelEventUpdate.UpdateType;

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
   * an array of channels that are currently active
   */
  @computed get activeChannels() {
    return this.sortedChannels.filter(c => c.active);
  }

  /**
   * the sum of remote balance for all channels
   */
  @computed get totalInbound() {
    return this.sortedChannels.reduce(
      (sum, chan) => sum.plus(chan.remoteBalance),
      Big(0),
    );
  }

  /**
   * the sum of local balance for all channels
   */
  @computed get totalOutbound() {
    return this.sortedChannels.reduce((sum, chan) => sum.plus(chan.localBalance), Big(0));
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
      this._store.uiStore.handleError(error, 'Unable to fetch Channels');
    }
  }

  /** update the channel list based on events from the API */
  @action.bound
  onChannelEvent(event: ChannelEventUpdate.AsObject) {
    this._store.log.info('handle incoming channel event', event);
    if (event.type === INACTIVE_CHANNEL && event.inactiveChannel) {
      // set the channel in state to inactive
      const point = this._channelPointToString(event.inactiveChannel);
      values(this.channels)
        .filter(c => c.channelPoint === point)
        .forEach(c => {
          c.active = false;
          this._store.log.info('updated channel', toJS(c));
        });
    } else if (event.type === ACTIVE_CHANNEL && event.activeChannel) {
      // set the channel in state to active
      const point = this._channelPointToString(event.activeChannel);
      values(this.channels)
        .filter(c => c.channelPoint === point)
        .forEach(c => {
          c.active = true;
          this._store.log.info('updated channel', toJS(c));
        });
    } else if (event.type === CLOSED_CHANNEL && event.closedChannel) {
      // delete the closed channel
      const channel = this.channels.get(event.closedChannel.chanId);
      this.channels.delete(event.closedChannel.chanId);
      this._store.log.info('removed closed channel', toJS(channel));
    } else if (event.type === OPEN_CHANNEL && event.openChannel) {
      // add the new opened channel
      const channel = new Channel(this._store, event.openChannel);
      this.channels.set(channel.chanId, channel);
      this._store.log.info('added new open channel', toJS(channel));
    }
  }

  /** exports the sorted list of channels to CSV file */
  @action.bound
  exportChannels() {
    this._store.log.info('exporting Channels to a CSV file');
    this._store.csv.export('channels', Channel.csvColumns, toJS(this.sortedChannels));
  }

  /** converts a base64 encoded channel point to a hex encoded channel point */
  private _channelPointToString(channelPoint: ChannelPoint.AsObject) {
    const txidBytes = channelPoint.fundingTxidBytes as string;
    const txid = Buffer.from(txidBytes, 'base64').reverse().toString('hex');
    return `${txid}:${channelPoint.outputIndex}`;
  }
}
