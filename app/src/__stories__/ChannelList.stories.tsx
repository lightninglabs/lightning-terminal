import React from 'react';
import { StoryContext } from '@storybook/addons';
import { Store } from 'store';
import ChannelList from 'components/loop/ChannelList';

export default {
  title: 'Components/Channel List',
  component: ChannelList,
  parameters: { contained: true },
};

export const NoChannels = () => {
  return <ChannelList channels={[]} />;
};

export const FewChannels = (ctx: StoryContext) => {
  // grab the store from the Storybook parameter defined in preview.tsx
  const store = ctx.parameters.store as Store;
  return <ChannelList channels={store.channels.slice(0, 10)} />;
};

export const ManyChannels = (ctx: StoryContext) => {
  // grab the store from the Storybook parameter defined in preview.tsx
  const store = ctx.parameters.store as Store;
  return <ChannelList channels={store.channels} />;
};

export const SortedChannels = (ctx: StoryContext) => {
  // grab the store from the Storybook parameter defined in preview.tsx
  const store = ctx.parameters.store as Store;
  const channels = store.channels
    .slice()
    .sort((a, b) => b.balancePercent - a.balancePercent);
  return <ChannelList channels={channels} />;
};
