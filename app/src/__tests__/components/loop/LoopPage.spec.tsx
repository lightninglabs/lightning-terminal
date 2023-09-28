import React, { Suspense } from 'react';
import { runInAction } from 'mobx';
import { SwapStatus } from 'types/generated/loop_pb';
import { grpc } from '@improbable-eng/grpc-web';
import { fireEvent, waitFor } from '@testing-library/react';
import Big from 'big.js';
import { saveAs } from 'file-saver';
import { formatSats } from 'util/formatters';
import { renderWithProviders } from 'util/tests';
import { loopListSwaps } from 'util/tests/sampleData';
import { createStore, Store } from 'store';
import { prefixTranslation } from 'util/translate';
import LoopPage from 'components/loop/LoopPage';

const grpcMock = grpc as jest.Mocked<typeof grpc>;

describe('LoopPage component', () => {
  let store: Store;

  beforeEach(async () => {
    store = createStore();
    await store.fetchAllData();
    await store.buildSwapView.getTerms();
  });

  const render = () => {
    const cmp = (
      <Suspense fallback={null}>
        <LoopPage />
      </Suspense>
    );
    return renderWithProviders(cmp, store);
  };

  it('should display the page title', () => {
    const { getByText } = render();
    expect(getByText('Lightning Loop')).toBeInTheDocument();
  });

  it('should display the network badge', () => {
    const { getByText, queryByText } = render();

    const setNetwork = (network: string) => {
      runInAction(() => {
        store.nodeStore.network = network as any;
      });
    };
    setNetwork('regtest');
    expect(getByText('regtest')).toBeInTheDocument();
    setNetwork('testnet');
    expect(getByText('testnet')).toBeInTheDocument();
    setNetwork('mainnet');
    expect(queryByText('mainnet')).not.toBeInTheDocument();
  });

  it('should display the three tiles', () => {
    const { getByText } = render();
    expect(getByText('Loop History')).toBeInTheDocument();
    expect(getByText('Total Inbound Liquidity')).toBeInTheDocument();
    expect(getByText('Total Outbound Liquidity')).toBeInTheDocument();
  });

  it('should display the liquidity numbers', async () => {
    const { getByText, store } = render();
    // wait for the channels to be fetched async before checking the UI labels
    await waitFor(() => expect(+store.channelStore.totalInbound).toBeGreaterThan(0));
    expect(getByText(formatSats(store.channelStore.totalInbound))).toBeInTheDocument();
    expect(getByText(formatSats(store.channelStore.totalOutbound))).toBeInTheDocument();
  });

  it('should display the loop history records', async () => {
    const { findByText } = render();
    // convert from numeric timestamp to string (1586390353623905000 -> '4/15/2020')
    const formatDate = (s: SwapStatus.AsObject) =>
      new Date(+Big(s.initiationTime).div(1000).div(1000)).toLocaleDateString();
    const [swap1, swap2] = loopListSwaps.swapsList.sort(
      (a, b) => +Big(b.initiationTime).sub(a.initiationTime),
    );

    expect(await findByText(formatDate(swap1))).toBeInTheDocument();
    expect(await findByText('530,000 sats')).toBeInTheDocument();
    expect(await findByText(formatDate(swap2))).toBeInTheDocument();
    expect(await findByText('525,000 sats')).toBeInTheDocument();
  });

  it('should display the export icon', () => {
    const { getByText } = render();
    expect(getByText('download.svg')).toBeInTheDocument();
  });

  it('should display the help icon', () => {
    const { getByText } = render();
    expect(getByText('help-circle.svg')).toBeInTheDocument();
  });

  it('should export channels', () => {
    const { getByText } = render();
    fireEvent.click(getByText('download.svg'));
    expect(saveAs).toBeCalledWith(expect.any(Blob), 'channels.csv');
  });

  describe('Swap Process', () => {
    it('should display actions bar when Loop button is clicked', () => {
      const { getByText } = render();
      expect(getByText('Loop')).toBeInTheDocument();
      fireEvent.click(getByText('Loop'));
      expect(getByText('Loop Out')).toBeInTheDocument();
      expect(getByText('Loop In')).toBeInTheDocument();
    });

    it('should display swap wizard when Loop out is clicked', async () => {
      const { getByText, findByText } = render();
      expect(getByText('Loop')).toBeInTheDocument();
      fireEvent.click(getByText('Loop'));
      store.channelStore.sortedChannels.slice(0, 3).forEach(c => {
        store.buildSwapView.toggleSelectedChannel(c.chanId);
      });
      fireEvent.click(getByText('Loop Out'));
      expect(await findByText('Step 1 of 2')).toBeInTheDocument();
    });

    it('should display the swap wizard when Loop in is clicked', async () => {
      const { getByText } = render();
      expect(getByText('Loop')).toBeInTheDocument();
      fireEvent.click(getByText('Loop'));
      store.channelStore.sortedChannels.slice(0, 1).forEach(c => {
        store.buildSwapView.toggleSelectedChannel(c.chanId);
      });
      fireEvent.click(getByText('Loop Out'));
      expect(getByText('Step 1 of 2')).toBeInTheDocument();
    });

    it('should hide the swap wizard when the back arrow is clicked', async () => {
      const { getByText } = render();
      expect(getByText('Loop')).toBeInTheDocument();
      fireEvent.click(getByText('Loop'));
      store.channelStore.sortedChannels.slice(0, 1).forEach(c => {
        store.buildSwapView.toggleSelectedChannel(c.chanId);
      });
      fireEvent.click(getByText('Loop Out'));
      expect(getByText('Step 1 of 2')).toBeInTheDocument();
      fireEvent.click(getByText('arrow-left.svg'));
      expect(getByText('Loop History')).toBeInTheDocument();
    });

    it('should execute the swap', async () => {
      const { getByText } = render();
      expect(getByText('Loop')).toBeInTheDocument();
      fireEvent.click(getByText('Loop'));
      store.channelStore.sortedChannels.slice(0, 3).forEach(c => {
        store.buildSwapView.toggleSelectedChannel(c.chanId);
      });
      fireEvent.click(getByText('Loop Out'));
      expect(getByText('Step 1 of 2')).toBeInTheDocument();
      fireEvent.click(getByText('Next'));
      expect(getByText('Step 2 of 2')).toBeInTheDocument();
      fireEvent.click(getByText('Confirm'));
      expect(getByText('Submitting Loop')).toBeInTheDocument();
      await waitFor(() => {
        expect(grpcMock.unary).toHaveBeenCalledWith(
          expect.objectContaining({ methodName: 'LoopOut' }),
          expect.anything(),
        );
      });
    });

    it('should abort the swap if back is clicked on the processing step', () => {
      const { getByText } = render();
      expect(getByText('Loop')).toBeInTheDocument();
      fireEvent.click(getByText('Loop'));
      store.channelStore.sortedChannels.slice(0, 3).forEach(c => {
        store.buildSwapView.toggleSelectedChannel(c.chanId);
      });
      fireEvent.click(getByText('Loop Out'));
      expect(getByText('Step 1 of 2')).toBeInTheDocument();
      fireEvent.click(getByText('Next'));
      expect(getByText('Step 2 of 2')).toBeInTheDocument();
      fireEvent.click(getByText('Confirm'));
      expect(getByText('Submitting Loop')).toBeInTheDocument();
      expect(store.buildSwapView.processingTimeout).toBeDefined();
      fireEvent.click(getByText('arrow-left.svg'));
      expect(getByText('Review Loop amount and fee')).toBeInTheDocument();
      expect(store.buildSwapView.processingTimeout).toBeUndefined();
    });

    it('should sort the channel list', () => {
      const { getByText, store } = render();
      expect(getByText('Capacity')).toBeInTheDocument();
      expect(store.settingsStore.channelSort.field).toBeUndefined();
      expect(store.settingsStore.channelSort.descending).toBe(true);

      fireEvent.click(getByText('Can Receive'));
      expect(store.settingsStore.channelSort.field).toBe('remoteBalance');

      fireEvent.click(getByText('Can Send'));
      expect(store.settingsStore.channelSort.field).toBe('localBalance');

      fireEvent.click(getByText('In Fee %'));
      expect(store.settingsStore.channelSort.field).toBe('remoteFeeRate');

      fireEvent.click(getByText('Uptime %'));
      expect(store.settingsStore.channelSort.field).toBe('uptimePercent');

      fireEvent.click(getByText('Peer/Alias'));
      expect(store.settingsStore.channelSort.field).toBe('aliasLabel');

      fireEvent.click(getByText('Capacity'));
      expect(store.settingsStore.channelSort.field).toBe('capacity');
      expect(store.settingsStore.channelSort.descending).toBe(false);

      fireEvent.click(getByText('Capacity'));
      expect(store.settingsStore.channelSort.field).toBe('capacity');
      expect(store.settingsStore.channelSort.descending).toBe(true);

      expect(getByText('slash.svg')).toBeInTheDocument();
      fireEvent.click(getByText('slash.svg'));
      expect(store.settingsStore.channelSort.field).toBeUndefined();
      expect(store.settingsStore.channelSort.descending).toBe(true);
    });

    it('should display subserver disabled message', () => {
      const { getByText, store } = render();
      const { l } = prefixTranslation('cmps.common.SubServerStatus');

      store.subServerStore.subServers.loop.disabled = true;
      render();

      expect(getByText(l('isDisabled'))).toBeInTheDocument();
    });
  });
});
