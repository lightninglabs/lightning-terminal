import React from 'react';
import { observable } from 'mobx';
import { useObserver } from 'mobx-react-lite';
import { useStore } from 'store';
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
  store.channelStore.channels = observable.map();
  store.channelStore.sortedChannels.slice(0, 10).map(c => {
    store.channelStore.channels.set(c.chanId, c);
  });
  return useObserver(() => <ChannelList />);
};

export const ManyChannels = () => {
  return useObserver(() => <ChannelList />);
};
