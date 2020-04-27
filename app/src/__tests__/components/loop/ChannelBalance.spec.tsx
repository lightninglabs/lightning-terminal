import React from 'react';
import { BalanceLevel, Channel } from 'types/state';
import { renderWithProviders } from 'util/tests';
import ChannelBalance from 'components/loop/ChannelBalance';

describe('ChannelBalance component', () => {
  const channel: Channel = {
    active: true,
    capacity: 15000000,
    chanId: '150633093070848',
    localBalance: 9990950,
    remoteBalance: 5000000,
    remotePubkey: '02ac59099da6d4bd818e6a81098f5d54580b7c3aa8255c707fa0f95ca89b02cb8c',
    uptime: 100,
    localPercent: 67,
    balancePercent: 67,
    balanceLevel: BalanceLevel.warn,
  };

  const bgColor = (el: any) => window.getComputedStyle(el).backgroundColor;
  const width = (el: any) => window.getComputedStyle(el).width;

  const render = () => {
    const result = renderWithProviders(<ChannelBalance channel={channel} />);
    const el = result.container.children[0];
    return {
      ...result,
      el,
      remote: el.children[0],
      local: el.children[2],
    };
  };

  it('should display a good balance', () => {
    channel.localPercent = 55;
    channel.balanceLevel = BalanceLevel.good;
    const { el, remote, local } = render();
    expect(el.children.length).toBe(3);
    expect(width(local)).toBe('55%');
    expect(bgColor(local)).toBe('rgb(70, 232, 14)');
    expect(bgColor(remote)).toBe('rgb(70, 232, 14)');
  });

  it('should display a warning balance', () => {
    channel.localPercent = 72;
    channel.balanceLevel = BalanceLevel.warn;
    const { el, remote, local } = render();
    expect(el.children.length).toBe(3);
    expect(width(local)).toBe('72%');
    expect(bgColor(local)).toBe('rgb(246, 107, 28)');
    expect(bgColor(remote)).toBe('rgb(246, 107, 28)');
  });

  it('should display a bad balance', () => {
    channel.localPercent = 93;
    channel.balanceLevel = BalanceLevel.bad;
    const { el, remote, local } = render();
    expect(el.children.length).toBe(3);
    expect(width(local)).toBe('93%');
    expect(bgColor(local)).toBe('rgb(245, 64, 110)');
    expect(bgColor(remote)).toBe('rgb(245, 64, 110)');
  });

  it('should display an inactive channel', () => {
    channel.active = false;
    channel.localPercent = 55;
    channel.balanceLevel = BalanceLevel.good;
    const { el, remote, local } = render();
    expect(el.children.length).toBe(3);
    expect(width(local)).toBe('55%');
    expect(bgColor(local)).toBe('rgb(132, 138, 153)');
    expect(bgColor(remote)).toBe('rgb(132, 138, 153)');
  });
});
