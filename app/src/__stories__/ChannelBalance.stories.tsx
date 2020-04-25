import React from 'react';
import { BalanceLevel } from 'types/state';
import { StoryContext } from '@storybook/addons';
import { Store } from 'store';
import ChannelBalance from 'components/loop/ChannelBalance';

export default {
  title: 'Channel Balance',
  component: ChannelBalance,
  parameters: { centered: true },
};

export const Good = (ctx: StoryContext) => {
  // grab the store from the Storybook parameter defined in preview.tsx
  const store = ctx.parameters.store as Store;
  const channel = {
    ...store.channels[0],
    localPercent: 59,
    balanceLevel: BalanceLevel.good,
  };
  return <ChannelBalance channel={channel} />;
};

export const Warn = (ctx: StoryContext) => {
  // grab the store from the Storybook parameter defined in preview.tsx
  const store = ctx.parameters.store as Store;
  const channel = {
    ...store.channels[0],
    localPercent: 28,
    balanceLevel: BalanceLevel.warn,
  };
  return <ChannelBalance channel={channel} />;
};

export const Bad = (ctx: StoryContext) => {
  // grab the store from the Storybook parameter defined in preview.tsx
  const store = ctx.parameters.store as Store;
  const channel = {
    ...store.channels[0],
    localPercent: 91,
    balanceLevel: BalanceLevel.bad,
  };
  return <ChannelBalance channel={channel} />;
};

export const Inactive = (ctx: StoryContext) => {
  // grab the store from the Storybook parameter defined in preview.tsx
  const store = ctx.parameters.store as Store;
  const channel = {
    ...store.channels[0],
    active: false,
  };
  return <ChannelBalance channel={channel} />;
};
