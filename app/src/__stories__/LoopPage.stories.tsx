import React from 'react';
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
  // only use a small set of channels
  store.channelStore.sortedChannels.splice(10);

  return <LoopPage />;
};

export const ManyChannels = () => <LoopPage />;

export const InsideLayout = () => {
  const store = useStore();
  store.uiStore.goToLoop();
  return (
    <Layout>
      <LoopPage />
    </Layout>
  );
};
