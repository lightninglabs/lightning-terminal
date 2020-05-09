import React from 'react';
import { useStore } from 'store';
import LoopPage from 'components/loop/LoopPage';
import { Layout } from '../components/layout';

export default {
  title: 'Layout',
  component: Layout,
};

export const Default = () => <Layout />;

export const WithContent = () => (
  <Layout>
    <LoopPage />
  </Layout>
);

export const Collapsed = () => {
  const store = useStore();
  store.sidebarCollapsed = true;

  return (
    <Layout>
      <LoopPage />
    </Layout>
  );
};
