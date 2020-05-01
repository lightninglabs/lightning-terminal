import React from 'react';
import { BalanceLevel, Channel } from 'types/state';
import { action } from '@storybook/addon-actions';
import { StoryContext } from '@storybook/addons';
import { Store } from 'store';
import ChannelRow, { ChannelRowHeader } from 'components/loop/ChannelRow';

export default {
  title: 'Components/Channel Row',
  component: ChannelRow,
  parameters: { contained: true },
};
const render = (
  channel: Channel,
  options?: {
    editable?: boolean;
    checked?: boolean;
    disabled?: boolean;
    dimmed?: boolean;
  },
) => (
  <div style={{ paddingTop: 50 }}>
    <ChannelRowHeader />
    <ChannelRow
      channel={channel}
      editable={(options && options.editable) || false}
      checked={(options && options.checked) || false}
      disabled={(options && options.disabled) || false}
      dimmed={(options && options.dimmed) || false}
      onChange={() => action('onChange')}
    />
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

export const Editable = (ctx: StoryContext) => {
  // grab the store from the Storybook parameter defined in preview.tsx
  const store = ctx.parameters.store as Store;
  return render(store.channels[0], { editable: true });
};

export const Selected = (ctx: StoryContext) => {
  // grab the store from the Storybook parameter defined in preview.tsx
  const store = ctx.parameters.store as Store;
  return render(store.channels[0], { editable: true, checked: true });
};

export const Disabled = (ctx: StoryContext) => {
  // grab the store from the Storybook parameter defined in preview.tsx
  const store = ctx.parameters.store as Store;
  return render(store.channels[0], { editable: true, checked: true, disabled: true });
};

export const Dimmed = (ctx: StoryContext) => {
  // grab the store from the Storybook parameter defined in preview.tsx
  const store = ctx.parameters.store as Store;
  return render(store.channels[0], { editable: true, disabled: true, dimmed: true });
};
