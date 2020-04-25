import React, { useEffect } from 'react';
import { toJS } from 'mobx';
import { StoryContext } from '@storybook/addons';
import { Store } from 'store';
import LoopPage from 'components/loop/LoopPage';

export default {
  title: 'Loop Page',
  component: LoopPage,
};

export const Default = (ctx: StoryContext) => {
  useEffect(() => {
    // grab the store from the Storybook parameter defined in preview.tsx
    const store = ctx.parameters.store as Store;
    const channels = toJS(store.channels);
    // only use a small set of channels
    store.channels = channels.slice(0, 25);

    // change back to sample data when the component is unmounted
    return () => {
      store.channels = channels;
    };
  }, []);

  return <LoopPage />;
};

export const ManyChannels = () => <LoopPage />;
