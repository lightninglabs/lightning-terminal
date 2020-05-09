import { observable } from 'mobx';
import { lndListChannels } from 'util/tests/sampleData';
import { createStore } from 'store';
import ChannelStore from 'store/channelStore';

describe('Store', () => {
  let store: ChannelStore;

  beforeEach(() => {
    store = createStore().channelStore;
  });

  it('should fetch list of channels', async () => {
    store.channels = observable.map();
    expect(store.channels.size).toEqual(0);
    await store.fetchChannels();
    expect(store.channels.size).toEqual(lndListChannels.channelsList.length);
  });

  it('should compute inbound liquidity', async () => {
    const inbound = lndListChannels.channelsList.reduce(
      (sum, chan) => sum + chan.remoteBalance,
      0,
    );

    expect(store.totalInbound).toBe(inbound);
  });

  it('should compute outbound liquidity', async () => {
    const outbound = lndListChannels.channelsList.reduce(
      (sum, chan) => sum + chan.localBalance,
      0,
    );

    expect(store.totalOutbound).toBe(outbound);
  });
});
