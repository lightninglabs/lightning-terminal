import React from 'react';
import { observable } from 'mobx';
import { useStore } from 'store';
import { Channel } from 'store/models';
import ChannelList from 'components/loop/ChannelList';

export default {
  title: 'Components/Channel List',
  component: ChannelList,
  parameters: { contained: true },
};

export const NoChannels = () => {
  const store = useStore();
  store.channelStore.channels = observable.map();
  return <ChannelList />;
};

export const FewChannels = () => {
  const store = useStore();
  const channels = store.channelStore.sortedChannels.slice(0, 10).reduce((result, c) => {
    result[c.chanId] = c;
    return result;
    // store.channelStore.channels.set(c.chanId, c);
  }, {} as Record<string, Channel>);
  store.channelStore.channels = observable.map(channels);
  return <ChannelList />;
};

export const ManyChannels = () => {
  return <ChannelList />;
};
