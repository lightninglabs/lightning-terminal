import { action, computed, observable, toJS } from 'mobx';
import { Store } from 'store';
import Channel from './models/channel';

export default class ChannelStore {
  private _store: Store;

  /** the list of channels */
  @observable channels: Channel[] = [];

  constructor(store: Store) {
    this._store = store;
  }

  /**
   * the sum of remote balance for all channels
   */
  @computed get totalInbound() {
    return this.channels.reduce((sum, chan) => sum + chan.remoteBalance, 0);
  }

  /**
   * the sum of local balance for all channels
   */
  @computed get totalOutbound() {
    return this.channels.reduce((sum, chan) => sum + chan.localBalance, 0);
  }

  /**
   * queries the LND api to fetch the list of channels and stores them
   * in the state
   */
  @action.bound
  async fetchChannels() {
    this._store.log.info('fetching channels');

    const { channelsList } = await this._store.api.lnd.listChannels();
    channelsList.forEach(lndChan => {
      // update existing channels or create new ones in state. using this
      // approach instead of overwriting the array will cause fewer state
      // mutations, resulting in better react rendering performance
      const existing = this.channels.find(c => c.chanId === lndChan.chanId);
      if (existing) {
        existing.update(lndChan);
      } else {
        this.channels.push(new Channel(lndChan));
      }
    });
    // remove any channels in state that are not in the API response
    const serverIds = channelsList.map(c => c.chanId);
    this.channels
      .filter(c => !serverIds.includes(c.chanId))
      .forEach(c => this.channels.splice(this.channels.indexOf(c), 1));

    this._store.log.info('updated channelStore.channels', toJS(this._store.channels));
  }
}
