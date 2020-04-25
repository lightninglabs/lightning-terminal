import React from 'react';
import { BalanceLevel, Channel } from 'types/state';
import { StoryContext } from '@storybook/addons';
import { Store } from 'store';
import ChannelRow, { ChannelRowHeader } from 'components/loop/ChannelRow';

export default {
  title: 'Components/Channel Row',
  component: ChannelRow,
  parameters: { contained: true },
};
const render = (channel: Channel) => (
  <div style={{ paddingTop: 50 }}>
    <ChannelRowHeader />
    <ChannelRow channel={channel} />
  </div>
);

export const Good = (ctx: StoryContext) => {
  // grab the store from the Storybook parameter defined in preview.tsx
  const store = ctx.parameters.store as Store;
  const channel = {
    ...store.channels[0],
    localPercent: 59,
    balanceLevel: BalanceLevel.good,
  };
  return render(channel);
};

export const Warn = (ctx: StoryContext) => {
  // grab the store from the Storybook parameter defined in preview.tsx
  const store = ctx.parameters.store as Store;
  const channel = {
    ...store.channels[1],
    localPercent: 28,
    balanceLevel: BalanceLevel.warn,
  };
  return render(channel);
};

export const Bad = (ctx: StoryContext) => {
  // grab the store from the Storybook parameter defined in preview.tsx
  const store = ctx.parameters.store as Store;
  const channel = {
    ...store.channels[2],
    localPercent: 91,
    balanceLevel: BalanceLevel.bad,
  };
  return render(channel);
};

export const Inactive = (ctx: StoryContext) => {
  // grab the store from the Storybook parameter defined in preview.tsx
  const store = ctx.parameters.store as Store;
  const channel = {
    ...store.channels[3],
    active: false,
  };
  return render(channel);
};
