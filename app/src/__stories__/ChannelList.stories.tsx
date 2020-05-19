import React from 'react';
import { observable, ObservableMap, values } from 'mobx';
import { BalanceMode } from 'util/constants';
import { useStore } from 'store';
import { Channel } from 'store/models';
import ChannelList from 'components/loop/ChannelList';

export default {
  title: 'Components/Channel List',
  component: ChannelList,
  parameters: { contained: true },
};

const channelSubset = (channels: ObservableMap<string, Channel>) => {
  const few = values(channels)
    .slice(0, 20)
    .reduce((result, c) => {
      result[c.chanId] = c;
      return result;
    }, {} as Record<string, Channel>);
  return observable.map(few);
};

export const NoChannels = () => {
  const store = useStore();
  store.channelStore.channels = observable.map();
  return <ChannelList />;
};

export const ReceiveMode = () => {
  const { channelStore, settingsStore } = useStore();
  settingsStore.balanceMode = BalanceMode.receive;
  channelStore.channels = channelSubset(channelStore.channels);
  return <ChannelList />;
};

export const SendMode = () => {
  const { channelStore, settingsStore } = useStore();
  settingsStore.balanceMode = BalanceMode.send;
  channelStore.channels = channelSubset(channelStore.channels);
  return <ChannelList />;
};

export const RoutingMode = () => {
  const { channelStore, settingsStore } = useStore();
  settingsStore.balanceMode = BalanceMode.routing;
  channelStore.channels = channelSubset(channelStore.channels);
  return <ChannelList />;
};

export const ManyChannels = () => {
  const { settingsStore } = useStore();
  settingsStore.balanceMode = BalanceMode.routing;
  return <ChannelList />;
};
