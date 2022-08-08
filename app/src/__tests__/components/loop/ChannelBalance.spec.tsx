import React from 'react';
import { renderWithProviders } from 'util/tests';
import { lndChannel } from 'util/tests/sampleData';
import { createStore } from 'store';
import { Channel } from 'store/models';
import ChannelBalance from 'components/loop/ChannelBalance';

describe('ChannelBalance component', () => {
  let channel: Channel;

  const bgColor = (el: any) => window.getComputedStyle(el).backgroundColor;
  const width = (el: any) => window.getComputedStyle(el).width;

  const render = (ratio: number, active = true) => {
    const store = createStore();
    channel = Channel.create(store, lndChannel);
    channel.localBalance = channel.capacity.mul(ratio);
    channel.remoteBalance = channel.capacity.mul(1 - ratio);
    channel.active = active;

    const result = renderWithProviders(<ChannelBalance channel={channel} />, store);
    const el = result.container.children[0];
    return {
      ...result,
      el,
      remote: el.children[0],
      local: el.children[2],
    };
  };

  it('should display a good balance', () => {
    const { el, remote, local } = render(0.25);
    expect(el.children.length).toBe(3);
    expect(width(local)).toBe('25%');
    expect(bgColor(local)).toBe('rgb(16, 185, 129)');
    expect(bgColor(remote)).toBe('rgb(16, 185, 129)');
  });

  it('should display a warning balance', () => {
    const { el, remote, local } = render(0.52);
    expect(el.children.length).toBe(3);
    expect(width(local)).toBe('52%');
    expect(bgColor(local)).toBe('rgb(245, 158, 11)');
    expect(bgColor(remote)).toBe('rgb(245, 158, 11)');
  });

  it('should display a bad balance', () => {
    const { el, remote, local } = render(0.93);
    expect(el.children.length).toBe(3);
    expect(width(local)).toBe('93%');
    expect(bgColor(local)).toBe('rgb(245, 64, 110)');
    expect(bgColor(remote)).toBe('rgb(245, 64, 110)');
  });

  it('should display an inactive channel', () => {
    const { el, remote, local } = render(0.55, false);
    expect(el.children.length).toBe(3);
    expect(width(local)).toBe('55%');
    expect(bgColor(local)).toBe('rgb(132, 138, 153)');
    expect(bgColor(remote)).toBe('rgb(132, 138, 153)');
  });
});
