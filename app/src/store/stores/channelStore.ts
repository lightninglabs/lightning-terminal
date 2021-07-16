import {
  makeAutoObservable,
  observable,
  ObservableMap,
  runInAction,
  toJS,
  values,
} from 'mobx';
import {
  ChannelEventUpdate,
  ChannelPoint,
  PendingChannelsResponse,
} from 'types/generated/lnd_pb';
import { ChannelStatus } from 'types/state';
import Big from 'big.js';
import debounce from 'lodash/debounce';
import { hex } from 'util/strings';
import { Store } from 'store';
import { Channel } from '../models';

const {
  OPEN_CHANNEL,
  CLOSED_CHANNEL,
  ACTIVE_CHANNEL,
  INACTIVE_CHANNEL,
  PENDING_OPEN_CHANNEL,
} = ChannelEventUpdate.UpdateType;

export default class ChannelStore {
  private _store: Store;

  /** the collection of open channels mapped by chanId */
  channels: ObservableMap<string, Channel> = observable.map();

  /** the collection of pending channels mapped by channelPoint */
  pendingChannels: ObservableMap<string, Channel> = observable.map();

  constructor(store: Store) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this._store = store;
  }

  /**
   * an array of channels sorted
   */
  get sortedChannels() {
    const { field, descending } = this._store.settingsStore.channelSort;
    const channels = values(this.channels)
      .slice()
      .sort((a, b) => Channel.compare(a, b, field));
    return descending ? channels.reverse() : channels;
  }

  /**
   * an array of pending channels sorted
   */
  get sortedPendingChannels() {
    const { field, descending } = this._store.settingsStore.channelSort;
    const channels = values(this.pendingChannels)
      .slice()
      .sort((a, b) => Channel.compare(a, b, field));
    return descending ? channels.reverse() : channels;
  }

  /**
   * an array of channels that are currently active
   */
  get activeChannels() {
    return this.sortedChannels.filter(c => c.active);
  }

  /**
   * the sum of remote balance for all channels
   */
  get totalInbound() {
    return this.sortedChannels.reduce(
      (sum, chan) => sum.plus(chan.remoteBalance),
      Big(0),
    );
  }

  /**
   * the sum of local balance for all channels
   */
  get totalOutbound() {
    return this.sortedChannels.reduce((sum, chan) => sum.plus(chan.localBalance), Big(0));
  }

  /**
   * queries the LND api to fetch the list of channels and stores them
   * in the state
   */
  async fetchChannels() {
    this._store.log.info('fetching channels');

    try {
      const { channelsList } = await this._store.api.lnd.listChannels();
      runInAction(() => {
        channelsList.forEach(lndChan => {
          // update existing channels or create new ones in state. using this
          // approach instead of overwriting the array will cause fewer state
          // mutations, resulting in better react rendering performance
          const existing = this.channels.get(lndChan.chanId);
          if (existing) {
            existing.update(lndChan);
          } else {
            this.channels.set(lndChan.chanId, Channel.create(this._store, lndChan));
          }
        });
        // remove any channels in state that are not in the API response
        const serverIds = channelsList.map(c => c.chanId);
        const localIds = this.sortedChannels.map(c => c.chanId);
        localIds
          .filter(id => !serverIds.includes(id))
          .forEach(id => this.channels.delete(id));

        this._store.log.info('updated channelStore.channels', toJS(this.channels));
        // fetch the pending channels
        this.fetchPendingChannels();
        // fetch the aliases for each of the channels
        this.fetchAliases();
        // fetch the remote fee rates for each of the channels
        this.fetchFeeRates();
      });
    } catch (error) {
      this._store.appView.handleError(error, 'Unable to fetch Channels');
    }
  }

  /** fetch channels at most once every 2 seconds when using this func  */
  fetchChannelsThrottled = debounce(this.fetchChannels, 2000);

  /**
   * queries the LND api to fetch the list of pending channels and stores
   * them in the state
   */
  async fetchPendingChannels() {
    this._store.log.info('fetching pending channels');

    try {
      const {
        pendingOpenChannelsList: opening,
        pendingClosingChannelsList: closing,
        waitingCloseChannelsList: waitingClose,
        pendingForceClosingChannelsList: forceClosing,
      } = await this._store.api.lnd.pendingChannels();
      runInAction(() => {
        const mapPending = (status: ChannelStatus) => (c: any) => ({
          pendingChannel: c.channel as PendingChannelsResponse.PendingChannel.AsObject,
          status,
        });
        // convert all of the pending channels into mobx Channel objects
        const pending = [
          ...opening.map(mapPending(ChannelStatus.OPENING)),
          ...closing.map(mapPending(ChannelStatus.CLOSING)),
          ...waitingClose.map(mapPending(ChannelStatus.WAITING_TO_CLOSE)),
          ...forceClosing.map(mapPending(ChannelStatus.FORCE_CLOSING)),
        ];
        pending.forEach(({ status, pendingChannel }) => {
          // update existing channels or create new ones in state. using this
          // approach instead of overwriting the array will cause fewer state
          // mutations, resulting in better react rendering performance
          const existing = this.pendingChannels.get(pendingChannel.channelPoint);
          if (existing) {
            existing.updatePending(status, pendingChannel);
          } else {
            const channel = Channel.createPending(this._store, status, pendingChannel);
            this.pendingChannels.set(channel.chanId, channel);
          }
        });
        // remove any pending channels in state that are not in the API response
        const serverIds = pending.map(c => c.pendingChannel.channelPoint);
        const localIds = this.sortedPendingChannels.map(c => c.channelPoint);
        localIds
          .filter(id => !serverIds.includes(id))
          .forEach(id => this.pendingChannels.delete(id));

        this._store.log.info('updated channelStore.channels', toJS(this.pendingChannels));
      });
    } catch (error) {
      this._store.appView.handleError(error, 'Unable to fetch Pending Channels');
    }
  }

  /** fetch channels at most once every 2 seconds when using this func  */
  fetchPendingChannelsThrottled = debounce(this.fetchPendingChannels, 2000);

  /**
   * queries the LND api to fetch the aliases for all of the peers we have
   * channels opened with
   */
  async fetchAliases() {
    const aliases = await this._store.storage.getCached<string>({
      cacheKey: 'aliases',
      requiredKeys: values(this.channels).map(c => c.remotePubkey),
      log: this._store.log,
      fetchFromApi: async (missingKeys, data) => {
        // call getNodeInfo for each pubkey and wait for all the requests to complete
        const nodeInfos = await Promise.all(
          missingKeys.map(id => this._store.api.lnd.getNodeInfo(id)),
        );
        // return a mapping from pubkey to alias
        return nodeInfos.reduce((acc, { node }) => {
          if (node) acc[node.pubKey] = node.alias;
          return acc;
        }, data);
      },
    });

    runInAction(() => {
      // set the alias on each channel in the store
      values(this.channels).forEach(c => {
        const alias = aliases[c.remotePubkey];
        if (alias && alias !== c.alias) {
          c.alias = alias;
        }
      });
      this._store.log.info('updated channels with aliases', aliases);
    });
  }

  /**
   * queries the LND api to fetch the fees for all of the peers we have
   * channels opened with
   */
  async fetchFeeRates() {
    const feeRates = await this._store.storage.getCached<number>({
      cacheKey: 'feeRates',
      requiredKeys: values(this.channels).map(c => c.chanId),
      log: this._store.log,
      fetchFromApi: async (missingKeys, data) => {
        // call getNodeInfo for each pubkey and wait for all the requests to complete
        const chanInfos = await Promise.all(
          missingKeys.map(id => this._store.api.lnd.getChannelInfo(id)),
        );
        // return an updated mapping from chanId to fee rate
        return chanInfos.reduce((acc, info) => {
          const { channelId, node1Pub, node1Policy, node2Policy } = info;
          const localPubkey = this._store.nodeStore.pubkey;
          const policy = node1Pub === localPubkey ? node2Policy : node1Policy;
          if (policy) {
            acc[channelId] = +Big(policy.feeRateMilliMsat);
          }
          return acc;
        }, data);
      },
    });

    runInAction(() => {
      // set the fee on each channel in the store
      values(this.channels).forEach(c => {
        const rate = feeRates[c.chanId];
        if (rate && c.remoteFeeRate !== rate) {
          c.remoteFeeRate = rate;
        }
      });
      this._store.log.info('updated channels with feeRates', feeRates);
    });
  }

  /** update the channel list based on events from the API */
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
      const channel = Channel.create(this._store, event.openChannel);
      this.channels.set(channel.chanId, channel);
      this._store.log.info('added new open channel', toJS(channel));
      this._store.nodeStore.fetchBalancesThrottled();
      // update the pending channels list to remove any pending
      this.fetchPendingChannelsThrottled();
      // fetch the alias for the added channel
      this.fetchAliases();
      // fetch the remote fee rates for the added channel
      this.fetchFeeRates();
    } else if (event.type === PENDING_OPEN_CHANNEL && event.pendingOpenChannel) {
      // add or update the pending channels by fetching the full list from the
      // API, since the event doesn't contain the channel data
      this.fetchPendingChannelsThrottled();
      // fetch orders, leases, & latest batch whenever a channel is opened
      this._store.orderStore.fetchOrdersThrottled();
      this._store.orderStore.fetchLeasesThrottled();
      this._store.batchStore.fetchLatestBatchThrottled();
    }
  }

  /** exports the sorted list of channels to CSV file */
  exportChannels() {
    this._store.log.info('exporting Channels to a CSV file');
    this._store.csv.export('channels', Channel.csvColumns, toJS(this.sortedChannels));
  }

  /** converts a base64 encoded channel point to a hex encoded channel point */
  private _channelPointToString(channelPoint: ChannelPoint.AsObject) {
    const txidBytes = channelPoint.fundingTxidBytes as string;
    const txid = hex(txidBytes, true);
    return `${txid}:${channelPoint.outputIndex}`;
  }
}
