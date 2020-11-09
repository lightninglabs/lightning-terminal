import React from 'react';
import { useStore } from 'store';
import LoopPage from 'components/loop/LoopPage';
import { Layout } from '../components/layout';

export default {
  title: 'Components/Layout',
  component: Layout,
};

export const Default = () => {
  const { appView } = useStore();
  appView.goToLoop();

  return <Layout />;
};

export const WithContent = () => {
  const { appView } = useStore();
  appView.goToLoop();
  return (
    <Layout>
      <LoopPage />
    </Layout>
  );
};

export const Collapsed = () => {
  const { appView, settingsStore } = useStore();
  appView.goToLoop();
  settingsStore.sidebarVisible = false;

  return (
    <Layout>
      <LoopPage />
    </Layout>
  );
};
