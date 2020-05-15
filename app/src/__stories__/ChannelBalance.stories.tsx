import React from 'react';
import { lndListChannelsOne } from 'util/tests/sampleData';
import { Channel } from 'store/models';
import ChannelBalance from 'components/loop/ChannelBalance';

export default {
  title: 'Components/Channel Balance',
  component: ChannelBalance,
  parameters: { centered: true },
};

const getChannel = (ratio: number) => {
  const channel = new Channel(lndListChannelsOne.channelsList[0]);
  channel.localBalance = channel.capacity * ratio;
  channel.remoteBalance = channel.capacity * (1 - ratio);
  return channel;
};

export const Good = () => {
  return <ChannelBalance channel={getChannel(0.59)} />;
};

export const Warn = () => {
  return <ChannelBalance channel={getChannel(0.28)} />;
};

export const Bad = () => {
  return <ChannelBalance channel={getChannel(0.91)} />;
};

export const Inactive = () => {
  const channel = getChannel(0.45);
  channel.active = false;
  return <ChannelBalance channel={channel} />;
};
