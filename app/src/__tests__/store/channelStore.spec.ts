import { observable, ObservableMap, values } from 'mobx';
import { grpc } from '@improbable-eng/grpc-web';
import { waitFor } from '@testing-library/react';
import Big from 'big.js';
import { BalanceMode } from 'util/constants';
import { lndListChannels } from 'util/tests/sampleData';
import { createStore, Store } from 'store';
import Channel from 'store/models/channel';
import ChannelStore from 'store/stores/channelStore';

const grpcMock = grpc as jest.Mocked<typeof grpc>;

describe('ChannelStore', () => {
  let rootStore: Store;
  let store: ChannelStore;

  const channelSubset = (channels: ObservableMap<string, Channel>) => {
    const few = values(channels)
      .slice(0, 20)
      .reduce((result, c) => {
        result[c.chanId] = c;
        return result;
      }, {} as Record<string, Channel>);
    return observable.map(few);
  };

  beforeEach(() => {
    rootStore = createStore();
    store = rootStore.channelStore;
  });

  it('should fetch list of channels', async () => {
    expect(store.channels.size).toEqual(0);
    await store.fetchChannels();
    expect(store.channels.size).toEqual(lndListChannels.channelsList.length);
  });

  it('should handle errors fetching channels', async () => {
    grpcMock.unary.mockImplementationOnce(desc => {
      if (desc.methodName === 'ListChannels') throw new Error('test-err');
      return undefined as any;
    });
    expect(rootStore.uiStore.alerts.size).toBe(0);
    await store.fetchChannels();
    await waitFor(() => {
      expect(rootStore.uiStore.alerts.size).toBe(1);
      expect(values(rootStore.uiStore.alerts)[0].message).toBe('test-err');
    });
  });

  it('should update existing channels with the same id', async () => {
    expect(store.channels.size).toEqual(0);
    await store.fetchChannels();
    expect(store.channels.size).toEqual(lndListChannels.channelsList.length);
    const prevChan = store.sortedChannels[0];
    const prevUptime = prevChan.uptime;
    prevChan.uptime = Big(123);
    await store.fetchChannels();
    const updatedChan = store.sortedChannels[0];
    // the existing channel should be updated
    expect(prevChan).toBe(updatedChan);
    expect(updatedChan.uptime).toEqual(prevUptime);
  });

  it('should sort channels correctly when using receive mode', async () => {
    await store.fetchChannels();
    rootStore.settingsStore.setBalanceMode(BalanceMode.receive);
    store.channels = channelSubset(store.channels);
    store.sortedChannels.forEach((c, i) => {
      if (i === 0) return;
      expect(c.localPercent).toBeLessThanOrEqual(
        store.sortedChannels[i - 1].localPercent,
      );
    });
  });

  it('should sort channels correctly when using send mode', async () => {
    await store.fetchChannels();
    rootStore.settingsStore.setBalanceMode(BalanceMode.send);
    store.channels = channelSubset(store.channels);
    store.sortedChannels.forEach((c, i) => {
      if (i === 0) return;
      expect(c.localPercent).toBeGreaterThanOrEqual(
        store.sortedChannels[i - 1].localPercent,
      );
    });
  });

  it('should sort channels correctly when using routing mode', async () => {
    await store.fetchChannels();
    rootStore.settingsStore.setBalanceMode(BalanceMode.routing);
    store.channels = channelSubset(store.channels);
    store.sortedChannels.forEach((c, i) => {
      if (i === 0) return;
      const currPct = Math.max(c.localPercent, 99 - c.localPercent);
      const prev = store.sortedChannels[i - 1];
      const prevPct = Math.max(prev.localPercent, 99 - prev.localPercent);
      expect(currPct).toBeLessThanOrEqual(prevPct);
    });
  });

  it('should compute inbound liquidity', async () => {
    await store.fetchChannels();
    const inbound = lndListChannels.channelsList.reduce(
      (sum, chan) => sum + chan.remoteBalance,
      0,
    );

    expect(+store.totalInbound).toBe(inbound);
  });

  it('should compute outbound liquidity', async () => {
    await store.fetchChannels();
    const outbound = lndListChannels.channelsList.reduce(
      (sum, chan) => sum + chan.localBalance,
      0,
    );

    expect(+store.totalOutbound).toBe(outbound);
  });
});
