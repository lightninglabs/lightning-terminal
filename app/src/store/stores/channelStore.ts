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
import debounce from 'lodash/debounce';
import { Store } from 'store';
import { Channel } from '../models';

const {
  OPEN_CHANNEL,
  CLOSED_CHANNEL,
  ACTIVE_CHANNEL,
  INACTIVE_CHANNEL,
} = ChannelEventUpdate.UpdateType;

interface AliasCache {
  lastUpdated: number;
  /** mapping from remove pubkey to alias */
  aliases: Record<string, string>;
}

interface FeeCache {
  lastUpdated: number;
  /** mapping form channel id to fee rate */
  feeRates: Record<string, number>;
}

/** cache alias data for 24 hours */
const CACHE_TIMEOUT = 24 * 60 * 60 * 1000;

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
        // fetch the aliases for each of the channels
        this.fetchAliases();
        // fetch the remote fee rates for each of the channels
        this.fetchFeeRates();
      });
    } catch (error) {
      this._store.uiStore.handleError(error, 'Unable to fetch Channels');
    }
  }

  /** fetch channels at most once every 2 seconds when using this func  */
  fetchChannelsThrottled = debounce(this.fetchChannels, 2000);

  /**
   * queries the LND api to fetch the aliases for all of the peers we have
   * channels opened with
   */
  @action.bound
  async fetchAliases() {
    this._store.log.info('fetching aliases for channels');
    // create an array of all channel pubkeys
    let pubkeys = values(this.channels)
      .map(c => c.remotePubkey)
      .filter((r, i, a) => a.indexOf(r) === i); // remove duplicates

    // create a map of pubkey to alias
    let aliases: Record<string, string> = {};

    // look up cached data in storage
    let cachedAliases = this._store.storage.get<AliasCache>('aliases');
    if (cachedAliases && cachedAliases.lastUpdated > Date.now() - CACHE_TIMEOUT) {
      // there is cached data and it has not expired
      aliases = cachedAliases.aliases;
      // exclude pubkeys which we have aliases for already
      pubkeys = pubkeys.filter(pk => !aliases[pk]);
      this._store.log.info(`found aliases in cache. ${pubkeys.length} missing`, pubkeys);
    }

    // if there are any pubkeys that we do not have a cached alias for
    if (pubkeys.length) {
      // call getNodeInfo for each pubkey and wait for all the requests to complete
      const nodeInfos = await Promise.all(
        pubkeys.map(pk => this._store.api.lnd.getNodeInfo(pk)),
      );

      // add fetched aliases to the mapping
      aliases = nodeInfos.reduce((acc, { node }) => {
        if (node) acc[node.pubKey] = node.alias;
        return acc;
      }, aliases);

      // save updated aliases to the cache in storage
      cachedAliases = {
        lastUpdated: Date.now(),
        aliases,
      };
      this._store.storage.set('aliases', cachedAliases);
      this._store.log.info(`updated cache with ${pubkeys.length} new aliases`);
    }

    runInAction('fetchAliasesContinuation', () => {
      // set the alias on each channel in the store
      values(this.channels).forEach(c => {
        const alias = aliases[c.remotePubkey];
        if (alias) {
          c.alias = alias;
          this._store.log.info(`updated channel ${c.chanId} with alias ${alias}`);
        }
      });
    });
  }

  /**
   * queries the LND api to fetch the fees for all of the peers we have
   * channels opened with
   */
  @action.bound
  async fetchFeeRates() {
    this._store.log.info('fetching fees for channels');
    // create an array of all channel ids
    let chanIds = values(this.channels)
      .map(c => c.chanId)
      .filter((r, i, a) => a.indexOf(r) === i); // remove duplicates

    // create a map of chan id to fee rate
    let feeRates: Record<string, number> = {};

    // look up cached data in storage
    let cachedFees = this._store.storage.get<FeeCache>('fee-rates');
    if (cachedFees && cachedFees.lastUpdated > Date.now() - CACHE_TIMEOUT) {
      // there is cached data and it has not expired
      feeRates = cachedFees.feeRates;
      // exclude chanIds which we have feeRates for already
      chanIds = chanIds.filter(id => !feeRates[id]);
      this._store.log.info(`found feeRates in cache. ${chanIds.length} missing`, chanIds);
    }

    // if there are any chanIds that we do not have a cached fee rate for
    if (chanIds.length) {
      // call getNodeInfo for each chan id and wait for all the requests to complete
      const chanInfos = await Promise.all(
        chanIds.map(id => this._store.api.lnd.getChannelInfo(id)),
      );

      // add fetched feeRates to the mapping
      feeRates = chanInfos.reduce((acc, info) => {
        const { channelId, node1Pub, node1Policy, node2Policy } = info;
        const localPubkey = this._store.nodeStore.pubkey;
        const policy = node1Pub === localPubkey ? node2Policy : node1Policy;
        if (policy) {
          acc[channelId] = +Big(policy.feeRateMilliMsat).div(1000000).mul(100);
        }
        return acc;
      }, feeRates);

      // save updated feeRates to the cache in storage
      cachedFees = {
        lastUpdated: Date.now(),
        feeRates,
      };
      this._store.storage.set('fee-rates', cachedFees);
      this._store.log.info(`updated cache with ${chanIds.length} new feeRates`);
    }

    runInAction('fetchFeesContinuation', () => {
      // set the fee on each channel in the store
      values(this.channels).forEach(c => {
        if (feeRates[c.chanId]) {
          c.remoteFeeRate = feeRates[c.chanId];
        }
      });
      this._store.log.info('updated channels with feeRates', toJS(this.channels));
    });
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
      this._store.nodeStore.fetchBalancesThrottled();
    } else if (event.type === OPEN_CHANNEL && event.openChannel) {
      // add the new opened channel
      const channel = new Channel(this._store, event.openChannel);
      this.channels.set(channel.chanId, channel);
      this._store.log.info('added new open channel', toJS(channel));
      this._store.nodeStore.fetchBalancesThrottled();
      // fetch the alias for the added channel
      this.fetchAliases();
      // fetch the remote fee rates for the added channel
      this.fetchFeeRates();
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
