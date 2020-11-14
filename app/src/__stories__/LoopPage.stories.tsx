import React, { useEffect } from 'react';
import { observable } from 'mobx';
import { lndListChannelsMany } from 'util/tests/sampleData';
import { useStore } from 'store';
import { Channel } from 'store/models';
import { Layout } from 'components/layout';
import LoopPage from 'components/loop/LoopPage';

export default {
  title: 'Pages/Loop',
  component: LoopPage,
  parameters: { contained: true },
};

export const Default = () => {
  return <LoopPage />;
};

export const ManyChannels = () => {
  const store = useStore();
  useEffect(() => {
    store.channelStore.channels = observable.map();
    lndListChannelsMany.channelsList.forEach(c => {
      const chan = Channel.create(store, c);
      store.channelStore.channels.set(chan.chanId, chan);
    });
  });
  return <LoopPage />;
};

export const InsideLayout = () => {
  return (
    <Layout>
      <LoopPage />
    </Layout>
  );
};
