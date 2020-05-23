import React from 'react';
import { SwapStatus } from 'types/generated/loop_pb';
import { grpc } from '@improbable-eng/grpc-web';
import { fireEvent, waitFor } from '@testing-library/react';
import { saveAs } from 'file-saver';
import { formatSats } from 'util/formatters';
import { renderWithProviders } from 'util/tests';
import { loopListSwaps } from 'util/tests/sampleData';
import { createStore, Store } from 'store';
import LoopPage from 'components/loop/LoopPage';

const grpcMock = grpc as jest.Mocked<typeof grpc>;

describe('LoopPage component', () => {
  let store: Store;

  beforeEach(async () => {
    store = createStore();
    await store.init();
  });

  const render = () => {
    return renderWithProviders(<LoopPage />, store);
  };

  it('should display the page title', () => {
    const { getByText } = render();
    expect(getByText('Lightning Loop')).toBeInTheDocument();
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
    await waitFor(() => expect(store.channelStore.totalInbound).toBeGreaterThan(0));
    expect(getByText(formatSats(store.channelStore.totalInbound))).toBeInTheDocument();
    expect(getByText(formatSats(store.channelStore.totalOutbound))).toBeInTheDocument();
  });

  it('should display the loop history records', async () => {
    const { findByText } = render();
    // convert from numeric timestamp to string (1586390353623905000 -> '4/15/2020')
    const formatDate = (s: SwapStatus.AsObject) =>
      new Date(s.initiationTime / 1000 / 1000).toLocaleDateString();
    const [swap1, swap2] = loopListSwaps.swapsList.sort(
      (a, b) => b.initiationTime - a.initiationTime,
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
      expect(getByText('Loop out')).toBeInTheDocument();
      expect(getByText('Loop in')).toBeInTheDocument();
    });

    it('should display swap wizard when Loop out is clicked', async () => {
      const { getByText } = render();
      expect(getByText('Loop')).toBeInTheDocument();
      fireEvent.click(getByText('Loop'));
      store.channelStore.sortedChannels.slice(0, 3).forEach(c => {
        store.buildSwapStore.toggleSelectedChannel(c.chanId);
      });
      fireEvent.click(getByText('Loop out'));
      expect(getByText('Step 1 of 2')).toBeInTheDocument();
    });

    it('should display the swap wizard when Loop in is clicked', async () => {
      const { getByText } = render();
      expect(getByText('Loop')).toBeInTheDocument();
      fireEvent.click(getByText('Loop'));
      store.channelStore.sortedChannels.slice(0, 3).forEach(c => {
        store.buildSwapStore.toggleSelectedChannel(c.chanId);
      });
      fireEvent.click(getByText('Loop in'));
      expect(getByText('Step 1 of 2')).toBeInTheDocument();
    });

    it('should hide the swap wizard when the back arrow is clicked', async () => {
      const { getByText } = render();
      expect(getByText('Loop')).toBeInTheDocument();
      fireEvent.click(getByText('Loop'));
      store.channelStore.sortedChannels.slice(0, 3).forEach(c => {
        store.buildSwapStore.toggleSelectedChannel(c.chanId);
      });
      fireEvent.click(getByText('Loop in'));
      expect(getByText('Step 1 of 2')).toBeInTheDocument();
      fireEvent.click(getByText('arrow-left.svg'));
      expect(getByText('Loop History')).toBeInTheDocument();
    });

    it('should execute the swap', async () => {
      const { getByText } = render();
      expect(getByText('Loop')).toBeInTheDocument();
      fireEvent.click(getByText('Loop'));
      store.channelStore.sortedChannels.slice(0, 3).forEach(c => {
        store.buildSwapStore.toggleSelectedChannel(c.chanId);
      });
      fireEvent.click(getByText('Loop out'));
      expect(getByText('Step 1 of 2')).toBeInTheDocument();
      fireEvent.click(getByText('Next'));
      expect(getByText('Step 2 of 2')).toBeInTheDocument();
      fireEvent.click(getByText('Confirm'));
      expect(getByText('Configuring Loops')).toBeInTheDocument();
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
        store.buildSwapStore.toggleSelectedChannel(c.chanId);
      });
      fireEvent.click(getByText('Loop out'));
      expect(getByText('Step 1 of 2')).toBeInTheDocument();
      fireEvent.click(getByText('Next'));
      expect(getByText('Step 2 of 2')).toBeInTheDocument();
      fireEvent.click(getByText('Confirm'));
      expect(getByText('Configuring Loops')).toBeInTheDocument();
      expect(store.buildSwapStore.processingTimeout).toBeDefined();
      fireEvent.click(getByText('arrow-left.svg'));
      expect(getByText('Review the quote')).toBeInTheDocument();
      expect(store.buildSwapStore.processingTimeout).toBeUndefined();
    });
  });
});
