import React, { useEffect } from 'react';
import { StoryContext } from '@storybook/addons';
import { Store } from 'store';
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

export const Collapsed = (ctx: StoryContext) => {
  useEffect(() => {
    // grab the store from the Storybook parameter defined in preview.tsx
    const store = ctx.parameters.store as Store;
    store.sidebarCollapsed = true;

    // change back to expanded when the component is unmounted
    return () => {
      store.sidebarCollapsed = false;
    };
  }, []);

  return (
    <Layout>
      <LoopPage />
    </Layout>
  );
};
