import React from 'react';
import { SwapDirection } from 'types/state';
import { fireEvent } from '@testing-library/react';
import { formatSats } from 'util/formatters';
import { renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';
import { Channel } from 'store/models';
import ChannelRow from 'components/loop/ChannelRow';

describe('ChannelRow component', () => {
  let channel: Channel;
  let store: Store;

  beforeEach(async () => {
    store = createStore();
    await store.fetchAllData();
    channel = new Channel(store, {
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

  it('should display the peer pubkey', () => {
    const { getByText } = render();
    expect(getByText(channel.ellipsedPubkey)).toBeInTheDocument();
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
    store.buildSwapStore.startSwap();
    const { getByRole } = render();
    expect(getByRole('checkbox')).toBeInTheDocument();
    expect(getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
  });

  it('should display a checked checkbox when it is checked', () => {
    store.buildSwapStore.startSwap();
    store.buildSwapStore.toggleSelectedChannel(channel.chanId);
    const { getByRole } = render();
    expect(getByRole('checkbox')).toBeInTheDocument();
    expect(getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
  });

  it('should display a disabled checkbox', () => {
    store.buildSwapStore.startSwap();
    store.buildSwapStore.toggleSelectedChannel(channel.chanId);
    store.buildSwapStore.setDirection(SwapDirection.OUT);
    const { getByRole } = render();
    expect(getByRole('checkbox')).toBeInTheDocument();
    expect(getByRole('checkbox')).toHaveAttribute('aria-disabled', 'true');
  });

  it('should trigger onChange when it is clicked', () => {
    store.buildSwapStore.startSwap();
    const { getByRole } = render();
    expect(getByRole('checkbox')).toBeInTheDocument();
    fireEvent.click(getByRole('checkbox'));
    expect(store.buildSwapStore.selectedChanIds).toEqual([channel.chanId]);
  });

  it('should not trigger onChange when it is disabled and clicked', () => {
    store.buildSwapStore.startSwap();
    store.buildSwapStore.setDirection(SwapDirection.OUT);
    const { getByRole } = render();
    expect(getByRole('checkbox')).toBeInTheDocument();
    fireEvent.click(getByRole('checkbox'));
    expect(store.buildSwapStore.selectedChanIds).toEqual([]);
  });
});
