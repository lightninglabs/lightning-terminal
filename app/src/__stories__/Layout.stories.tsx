import React from 'react';
import { useStore } from 'store';
import LoopPage from 'components/loop/LoopPage';
import { Layout } from '../components/layout';

export default {
  title: 'Components/Layout',
  component: Layout,
};

export const Default = () => {
  const { uiStore } = useStore();
  uiStore.goToLoop();

  return <Layout />;
};

export const WithContent = () => {
  const { uiStore } = useStore();
  uiStore.goToLoop();
  return (
    <Layout>
      <LoopPage />
    </Layout>
  );
};

export const Collapsed = () => {
  const { uiStore, settingsStore } = useStore();
  uiStore.goToLoop();
  settingsStore.sidebarVisible = false;

  return (
    <Layout>
      <LoopPage />
    </Layout>
  );
};
