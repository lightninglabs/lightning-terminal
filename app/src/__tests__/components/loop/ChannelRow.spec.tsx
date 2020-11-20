import React from 'react';
import { runInAction } from 'mobx';
import { SwapState, SwapType } from 'types/generated/loop_pb';
import { SwapDirection } from 'types/state';
import { fireEvent, waitFor } from '@testing-library/react';
import { formatSats } from 'util/formatters';
import { renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';
import { Channel, Swap } from 'store/models';
import ChannelRow from 'components/loop/ChannelRow';

describe('ChannelRow component', () => {
  let channel: Channel;
  let store: Store;

  beforeEach(async () => {
    store = createStore();
    await store.fetchAllData();
    channel = Channel.create(store, {
      chanId: '150633093070848',
      remotePubkey: '02ac59099da6d4bd818e6a81098f5d54580b7c3aa8255c707fa0f95ca89b02cb8c',
      capacity: 15000000,
      localBalance: 9990950,
      remoteBalance: 5000000,
      active: true,
      uptime: 97,
      lifetime: 100,
    } as any);
  });

  const render = () => {
    return renderWithProviders(<ChannelRow channel={channel} />, store);
  };

  it('should display the remote balance', () => {
    const { getByText } = render();
    expect(
      getByText(formatSats(channel.remoteBalance, { withSuffix: false })),
    ).toBeInTheDocument();
  });

  it('should display the local balance', () => {
    const { getByText } = render();
    expect(
      getByText(formatSats(channel.localBalance, { withSuffix: false })),
    ).toBeInTheDocument();
  });

  it('should display the uptime', () => {
    const { getByText } = render();
    expect(getByText(channel.uptime.toString())).toBeInTheDocument();
  });

  it('should display the fee rate', async () => {
    const { getByText } = render();
    runInAction(() => {
      channel.remoteFeeRate = 500;
    });
    expect(getByText(channel.remoteFeePct)).toBeInTheDocument();
    fireEvent.mouseEnter(getByText(channel.remoteFeePct));
    await waitFor(() => {
      expect(getByText(`${channel.remoteFeeRate} ppm`)).toBeInTheDocument();
    });
  });

  it('should display the peer pubkey or alias', () => {
    const { getByText } = render();
    expect(getByText(channel.aliasLabel)).toBeInTheDocument();
  });

  it('should display the peer pubkey & alias tooltip', async () => {
    const { getByText, getAllByText } = render();
    runInAction(() => {
      channel.alias = 'test-alias';
    });
    fireEvent.mouseEnter(getByText(channel.aliasLabel));
    await waitFor(() => {
      expect(getByText(channel.remotePubkey)).toBeInTheDocument();
    });
    expect(getAllByText(channel.alias as string)).toHaveLength(2);
    runInAction(() => {
      channel.alias = channel.remotePubkey.substring(12);
    });
    expect(getByText(channel.remotePubkey)).toBeInTheDocument();
  });

  it('should display the capacity', () => {
    const { getByText } = render();
    expect(
      getByText(formatSats(channel.capacity, { withSuffix: false })),
    ).toBeInTheDocument();
  });

  it('should display correct dot icon for an inactive channel', () => {
    channel.active = false;
    const { getByText, getByLabelText } = render();
    expect(getByText('dot.svg')).toBeInTheDocument();
    expect(getByLabelText('idle')).toBeInTheDocument();
  });

  it.each<[number, string]>([
    [20, 'success'],
    [50, 'warn'],
    [90, 'error'],
  ])('should display correct dot icon for a "%s" balance', (localPct, label) => {
    channel.localBalance = channel.capacity.mul(localPct).div(100);
    channel.remoteBalance = channel.capacity.mul(100 - localPct).div(100);

    const { getByText, getByLabelText } = render();
    expect(getByText('dot.svg')).toBeInTheDocument();
    expect(getByLabelText(label)).toBeInTheDocument();
  });

  it('should display a checkbox when it is editable', () => {
    store.buildSwapView.startSwap();
    const { getByRole } = render();
    expect(getByRole('checkbox')).toBeInTheDocument();
    expect(getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
  });

  it('should display a checked checkbox when it is checked', () => {
    store.buildSwapView.startSwap();
    store.buildSwapView.toggleSelectedChannel(channel.chanId);
    const { getByRole } = render();
    expect(getByRole('checkbox')).toBeInTheDocument();
    expect(getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
  });

  it('should display a disabled checkbox', () => {
    store.buildSwapView.startSwap();
    store.buildSwapView.toggleSelectedChannel(channel.chanId);
    store.buildSwapView.setDirection(SwapDirection.OUT);
    const { getByRole } = render();
    expect(getByRole('checkbox')).toBeInTheDocument();
    expect(getByRole('checkbox')).toHaveAttribute('aria-disabled', 'true');
  });

  it('should trigger onChange when it is clicked', () => {
    store.buildSwapView.startSwap();
    const { getByRole } = render();
    expect(getByRole('checkbox')).toBeInTheDocument();
    fireEvent.click(getByRole('checkbox'));
    expect(store.buildSwapView.selectedChanIds).toEqual([channel.chanId]);
  });

  it('should not trigger onChange when it is disabled and clicked', () => {
    store.buildSwapView.startSwap();
    store.buildSwapView.setDirection(SwapDirection.OUT);
    const { getByRole } = render();
    expect(getByRole('checkbox')).toBeInTheDocument();
    fireEvent.click(getByRole('checkbox'));
    expect(store.buildSwapView.selectedChanIds).toEqual([]);
  });

  describe('pending swaps', () => {
    let swap1: Swap;
    let swap2: Swap;

    beforeEach(() => {
      swap1 = store.swapStore.sortedSwaps[0];
      swap2 = store.swapStore.sortedSwaps[1];
      swap1.state = swap2.state = SwapState.INITIATED;
    });

    it('should display the pending Loop In icon', async () => {
      swap1.type = SwapType.LOOP_IN;
      store.swapStore.addSwappedChannels(swap1.id, [channel.chanId]);
      const { getByText } = render();
      expect(getByText('chevrons-right.svg')).toBeInTheDocument();
      fireEvent.mouseEnter(getByText('chevrons-right.svg'));
      await waitFor(() => {
        expect(getByText('Loop In currently in progress')).toBeInTheDocument();
      });
    });

    it('should display the pending Loop Out icon', async () => {
      swap1.type = SwapType.LOOP_OUT;
      store.swapStore.addSwappedChannels(swap1.id, [channel.chanId]);
      const { getByText } = render();
      expect(getByText('chevrons-left.svg')).toBeInTheDocument();
      fireEvent.mouseEnter(getByText('chevrons-left.svg'));
      await waitFor(() => {
        expect(getByText('Loop Out currently in progress')).toBeInTheDocument();
      });
    });

    it('should display the pending Loop In and Loop Out icon', async () => {
      swap1.type = SwapType.LOOP_IN;
      swap2.type = SwapType.LOOP_OUT;
      store.swapStore.addSwappedChannels(swap1.id, [channel.chanId]);
      store.swapStore.addSwappedChannels(swap2.id, [channel.chanId]);
      const { getByText } = render();
      expect(getByText('chevrons.svg')).toBeInTheDocument();
      fireEvent.mouseEnter(getByText('chevrons.svg'));
      await waitFor(() => {
        expect(
          getByText('Loop In and Loop Out currently in progress'),
        ).toBeInTheDocument();
      });
    });
  });
});
