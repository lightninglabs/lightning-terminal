import React from 'react';
import { useObserver } from 'mobx-react-lite';
import { SwapState, SwapType } from 'types/generated/loop_pb';
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
    channel.localBalance = channel.capacity.mul(options.ratio);
    channel.remoteBalance = channel.capacity.mul(1 - options.ratio);
  }
  return useObserver(() => (
    <div style={{ paddingTop: 50 }}>
      <ChannelRowHeader />
      <ChannelRow channel={channel} />
    </div>
  ));
};

export const Good = () => {
  const store = useStore();
  const channel = Channel.create(store, lndListChannels.channelsList[0]);
  return renderStory(channel, { ratio: 0.3 });
};

export const Warn = () => {
  const store = useStore();
  const channel = Channel.create(store, lndListChannels.channelsList[1]);
  return renderStory(channel, { ratio: 0.5 });
};

export const Bad = () => {
  const store = useStore();
  const channel = Channel.create(store, lndListChannels.channelsList[2]);
  return renderStory(channel, { ratio: 0.91 });
};

export const Inactive = () => {
  const store = useStore();
  const channel = Channel.create(store, lndListChannels.channelsList[3]);
  channel.active = false;
  return renderStory(channel);
};

export const Editable = () => {
  const store = useStore();
  const channel = Channel.create(store, lndListChannels.channelsList[4]);
  store.buildSwapView.startSwap();
  return renderStory(channel);
};

export const Selected = () => {
  const store = useStore();
  const channel = Channel.create(store, lndListChannels.channelsList[5]);
  store.buildSwapView.startSwap();
  store.buildSwapView.toggleSelectedChannel(channel.chanId);
  return renderStory(channel);
};

export const Disabled = () => {
  const store = useStore();
  const channel = Channel.create(store, lndListChannels.channelsList[6]);
  store.buildSwapView.startSwap();
  store.buildSwapView.toggleSelectedChannel(channel.chanId);
  store.buildSwapView.setDirection(SwapDirection.OUT);
  return renderStory(channel);
};

export const Dimmed = () => {
  const store = useStore();
  const channel = Channel.create(store, lndListChannels.channelsList[6]);
  store.buildSwapView.startSwap();
  store.buildSwapView.setDirection(SwapDirection.OUT);
  return renderStory(channel);
};

export const LoopingIn = () => {
  const store = useStore();
  const channel = Channel.create(store, lndListChannels.channelsList[0]);
  const swap = store.swapStore.sortedSwaps[0];
  swap.type = SwapType.LOOP_IN;
  swap.state = SwapState.INITIATED;
  store.swapStore.addSwappedChannels(swap.id, [channel.chanId]);
  return renderStory(channel, { ratio: 0.3 });
};

export const LoopingOut = () => {
  const store = useStore();
  const channel = Channel.create(store, lndListChannels.channelsList[0]);
  const swap = store.swapStore.sortedSwaps[0];
  swap.type = SwapType.LOOP_OUT;
  swap.state = SwapState.INITIATED;
  store.swapStore.addSwappedChannels(swap.id, [channel.chanId]);
  return renderStory(channel, { ratio: 0.3 });
};

export const LoopingInAndOut = () => {
  const store = useStore();
  const channel = Channel.create(store, lndListChannels.channelsList[0]);
  const swap1 = store.swapStore.sortedSwaps[0];
  swap1.type = SwapType.LOOP_IN;
  swap1.state = SwapState.INITIATED;
  store.swapStore.addSwappedChannels(swap1.id, [channel.chanId]);
  const swap2 = store.swapStore.sortedSwaps[1];
  swap2.type = SwapType.LOOP_OUT;
  swap2.state = SwapState.INITIATED;
  store.swapStore.addSwappedChannels(swap2.id, [channel.chanId]);
  return renderStory(channel, { ratio: 0.3 });
};
