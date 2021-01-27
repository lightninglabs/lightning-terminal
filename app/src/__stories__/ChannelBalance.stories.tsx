import React from 'react';
import { lndChannel } from 'util/tests/sampleData';
import { Store, useStore } from 'store';
import { Channel } from 'store/models';
import ChannelBalance from 'components/loop/ChannelBalance';

export default {
  title: 'Components/Channel Balance',
  component: ChannelBalance,
  parameters: { centered: true },
};

const getChannel = (store: Store, ratio: number) => {
  const channel = Channel.create(store, lndChannel);
  channel.localBalance = channel.capacity.mul(ratio);
  channel.remoteBalance = channel.capacity.mul(1 - ratio);
  return channel;
};

export const Good = () => {
  const store = useStore();
  return <ChannelBalance channel={getChannel(store, 0.59)} />;
};

export const Warn = () => {
  const store = useStore();
  return <ChannelBalance channel={getChannel(store, 0.28)} />;
};

export const Bad = () => {
  const store = useStore();
  return <ChannelBalance channel={getChannel(store, 0.91)} />;
};

export const Inactive = () => {
  const store = useStore();
  const channel = getChannel(store, 0.45);
  channel.active = false;
  return <ChannelBalance channel={channel} />;
};
