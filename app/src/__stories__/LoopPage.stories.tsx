import React, { useEffect } from 'react';
import { useStore } from 'store';
import { Layout } from 'components/layout';
import LoopPage from 'components/loop/LoopPage';

export default {
  title: 'Pages/Loop',
  component: LoopPage,
  parameters: { contained: true },
};

export const Default = () => {
  const store = useStore();
  useEffect(() => {
    // only use a small set of channels
    store.channelStore.sortedChannels.splice(10);

    // change back to sample data when the component is unmounted
    return () => {
      store.channelStore.fetchChannels();
    };
  }, []);

  return <LoopPage />;
};

export const ManyChannels = () => <LoopPage />;

export const InsideLayout = () => (
  <Layout>
    <LoopPage />
  </Layout>
);
