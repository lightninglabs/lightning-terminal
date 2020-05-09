import React from 'react';
import { renderWithProviders } from 'util/tests';
import { lndListChannelsOne } from 'util/tests/sampleData';
import { Channel } from 'store/models';
import ChannelBalance from 'components/loop/ChannelBalance';

describe('ChannelBalance component', () => {
  const channel: Channel = new Channel(lndListChannelsOne.channelsList[0]);

  const bgColor = (el: any) => window.getComputedStyle(el).backgroundColor;
  const width = (el: any) => window.getComputedStyle(el).width;

  const shiftBalance = (channel: Channel, ratio: number) => {
    channel.localBalance = channel.capacity * ratio;
    channel.remoteBalance = channel.capacity * (1 - ratio);
  };

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
    shiftBalance(channel, 0.55);
    channel.localBalance = channel.capacity * 0.55;
    const { el, remote, local } = render();
    expect(el.children.length).toBe(3);
    expect(width(local)).toBe('55%');
    expect(bgColor(local)).toBe('rgb(70, 232, 14)');
    expect(bgColor(remote)).toBe('rgb(70, 232, 14)');
  });

  it('should display a warning balance', () => {
    shiftBalance(channel, 0.72);
    const { el, remote, local } = render();
    expect(el.children.length).toBe(3);
    expect(width(local)).toBe('72%');
    expect(bgColor(local)).toBe('rgb(246, 107, 28)');
    expect(bgColor(remote)).toBe('rgb(246, 107, 28)');
  });

  it('should display a bad balance', () => {
    shiftBalance(channel, 0.93);
    const { el, remote, local } = render();
    expect(el.children.length).toBe(3);
    expect(width(local)).toBe('93%');
    expect(bgColor(local)).toBe('rgb(245, 64, 110)');
    expect(bgColor(remote)).toBe('rgb(245, 64, 110)');
  });

  it('should display an inactive channel', () => {
    channel.active = false;
    shiftBalance(channel, 0.55);
    const { el, remote, local } = render();
    expect(el.children.length).toBe(3);
    expect(width(local)).toBe('55%');
    expect(bgColor(local)).toBe('rgb(132, 138, 153)');
    expect(bgColor(remote)).toBe('rgb(132, 138, 153)');
  });
});
