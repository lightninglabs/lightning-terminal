import React, { useEffect } from 'react';
import { toJS } from 'mobx';
import { StoryContext } from '@storybook/addons';
import { Store } from 'store';
import ChannelList from 'components/loop/ChannelList';

export default {
  title: 'Channel List',
  component: ChannelList,
  parameters: { contained: true },
};

export const NoChannels = (ctx: StoryContext) => {
  // grab the store from the Storybook parameter defined in preview.tsx
  const store = ctx.parameters.store as Store;

  useEffect(() => {
    // convert the store state to pure JS so it can be reverted on unmount
    const channels = toJS(store.channels);
    store.channels = [];

    // change back to sample data when the component is unmounted
    return () => {
      store.channels = channels;
    };
  }, []);

  return <ChannelList channels={store.channels} />;
};

export const FewChannels = (ctx: StoryContext) => {
  // grab the store from the Storybook parameter defined in preview.tsx
  const store = ctx.parameters.store as Store;

  useEffect(() => {
    // convert the store state to pure JS so it can be reverted on unmount
    const channels = toJS(store.channels);
    store.channels = channels.slice(0, 5);

    // change back to sample data when the component is unmounted
    return () => {
      store.channels = channels;
    };
  }, []);

  return <ChannelList channels={store.channels} />;
};

export const ManyChannels = (ctx: StoryContext) => {
  // grab the store from the Storybook parameter defined in preview.tsx
  const store = ctx.parameters.store as Store;

  return <ChannelList channels={store.channels} />;
};
