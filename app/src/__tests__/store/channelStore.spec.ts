import { lndListChannels } from 'util/tests/sampleData';
import { createStore } from 'store';
import ChannelStore from 'store/stores/channelStore';

describe('Store', () => {
  let store: ChannelStore;

  beforeEach(() => {
    store = createStore().channelStore;
  });

  it('should fetch list of channels', async () => {
    expect(store.channels.size).toEqual(0);
    await store.fetchChannels();
    expect(store.channels.size).toEqual(lndListChannels.channelsList.length);
  });

  it('should update existing channels with the same id', async () => {
    expect(store.channels.size).toEqual(0);
    await store.fetchChannels();
    expect(store.channels.size).toEqual(lndListChannels.channelsList.length);
    const prevChan = store.sortedChannels[0];
    const prevUptime = prevChan.uptime;
    prevChan.uptime = 123;
    await store.fetchChannels();
    const updatedChan = store.sortedChannels[0];
    // the existing channel should be updated
    expect(prevChan).toBe(updatedChan);
    expect(updatedChan.uptime).toBe(prevUptime);
  });

  it('should compute inbound liquidity', async () => {
    await store.fetchChannels();
    const inbound = lndListChannels.channelsList.reduce(
      (sum, chan) => sum + chan.remoteBalance,
      0,
    );

    expect(store.totalInbound).toBe(inbound);
  });

  it('should compute outbound liquidity', async () => {
    await store.fetchChannels();
    const outbound = lndListChannels.channelsList.reduce(
      (sum, chan) => sum + chan.localBalance,
      0,
    );

    expect(store.totalOutbound).toBe(outbound);
  });
});
