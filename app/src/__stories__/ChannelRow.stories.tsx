import React from 'react';
import { useObserver } from 'mobx-react-lite';
import { SwapDirection } from 'types/state';
import { lndListChannels } from 'util/tests/sampleData';
import { useStore } from 'store';
import { Channel } from 'store/models';
import ChannelRow, { ChannelRowHeader } from 'components/loop/ChannelRow';

export default {
  title: 'Components/Channel Row',
  component: ChannelRow,
  parameters: { contained: true },
};

const renderStory = (
  channel: Channel,
  options?: {
    ratio?: number;
    active?: boolean;
  },
) => {
  if (options && options.ratio) {
    channel.localBalance = channel.capacity * options.ratio;
    channel.remoteBalance = channel.capacity * (1 - options.ratio);
  }
  return useObserver(() => (
    <div style={{ paddingTop: 50 }}>
      <ChannelRowHeader />
      <ChannelRow channel={channel} />
    </div>
  ));
};

export const Good = () => {
  const channel = new Channel(lndListChannels.channelsList[0]);
  return renderStory(channel, { ratio: 0.59 });
};

export const Warn = () => {
  const channel = new Channel(lndListChannels.channelsList[1]);
  return renderStory(channel, { ratio: 0.28 });
};

export const Bad = () => {
  const channel = new Channel(lndListChannels.channelsList[2]);
  return renderStory(channel, { ratio: 0.91 });
};

export const Inactive = () => {
  const channel = new Channel(lndListChannels.channelsList[3]);
  channel.active = false;
  return renderStory(channel);
};

export const Editable = () => {
  const channel = new Channel(lndListChannels.channelsList[4]);
  const store = useStore();
  store.buildSwapStore.startSwap();
  return renderStory(channel);
};

export const Selected = () => {
  const channel = new Channel(lndListChannels.channelsList[5]);
  const store = useStore();
  store.buildSwapStore.startSwap();
  store.buildSwapStore.toggleSelectedChannel(channel.chanId);
  return renderStory(channel);
};

export const Disabled = () => {
  const channel = new Channel(lndListChannels.channelsList[6]);
  const store = useStore();
  store.buildSwapStore.startSwap();
  store.buildSwapStore.toggleSelectedChannel(channel.chanId);
  store.buildSwapStore.setDirection(SwapDirection.OUT);
  return renderStory(channel);
};

export const Dimmed = () => {
  const channel = new Channel(lndListChannels.channelsList[6]);
  const store = useStore();
  store.buildSwapStore.startSwap();
  store.buildSwapStore.setDirection(SwapDirection.OUT);
  return renderStory(channel);
};
