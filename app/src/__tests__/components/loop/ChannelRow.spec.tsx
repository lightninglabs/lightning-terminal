import React from 'react';
import { BalanceLevel, Channel } from 'types/state';
import { ellipseInside } from 'util/strings';
import { renderWithProviders } from 'util/tests';
import ChannelRow from 'components/loop/ChannelRow';

describe('ChannelRow component', () => {
  let channel: Channel;

  const render = () => {
    const result = renderWithProviders(<ChannelRow channel={channel} />);
    return {
      ...result,
    };
  };

  beforeEach(() => {
    channel = {
      active: true,
      capacity: 15000000,
      chanId: '150633093070848',
      localBalance: 9990950,
      remoteBalance: 5000000,
      remotePubkey: '02ac59099da6d4bd818e6a81098f5d54580b7c3aa8255c707fa0f95ca89b02cb8c',
      uptime: 97,
      localPercent: 67,
      balancePercent: 67,
      balanceLevel: BalanceLevel.warn,
    };
  });

  it('should display the remote balance', () => {
    const { getByText } = render();
    expect(getByText(channel.remoteBalance.toLocaleString())).toBeInTheDocument();
  });

  it('should display the local balance', () => {
    const { getByText } = render();
    expect(getByText(channel.localBalance.toLocaleString())).toBeInTheDocument();
  });

  it('should display the uptime', () => {
    const { getByText } = render();
    expect(getByText(channel.uptime.toString())).toBeInTheDocument();
  });

  it('should display the peer pubkey', () => {
    const { getByText } = render();
    expect(getByText(ellipseInside(channel.remotePubkey))).toBeInTheDocument();
  });

  it('should display the capacity', () => {
    const { getByText } = render();
    expect(getByText(channel.capacity.toLocaleString())).toBeInTheDocument();
  });

  it('should display correct dot icon for an inactive channel', () => {
    channel.active = false;
    const { getByText, getByLabelText } = render();
    expect(getByText('dot.svg')).toBeInTheDocument();
    expect(getByLabelText('idle')).toBeInTheDocument();
  });

  it.each<[BalanceLevel, string]>([
    [BalanceLevel.good, 'success'],
    [BalanceLevel.warn, 'warn'],
    [BalanceLevel.bad, 'error'],
  ])('should display correct dot icon for a "%s" balance', (level, label) => {
    channel.balanceLevel = level;
    const { getByText, getByLabelText } = render();
    expect(getByText('dot.svg')).toBeInTheDocument();
    expect(getByLabelText(label)).toBeInTheDocument();
  });
});
