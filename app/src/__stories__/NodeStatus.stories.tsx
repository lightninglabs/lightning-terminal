import React, { useEffect } from 'react';
import { StoryContext } from '@storybook/addons';
import { Store } from 'store';
import NodeStatus from 'components/NodeStatus';

export default {
  title: 'Node Status',
  component: NodeStatus,
  parameters: { centered: true },
};

export const Default = (ctx: StoryContext) => {
  useEffect(() => {
    // grab the store from the Storybook parameter defined in preview.tsx
    const store = ctx.parameters.store as Store;
    const { channelBalance, walletBalance } = store.balances || {
      channelBalance: 0,
      walletBalance: 0,
    };
    store.balances = { channelBalance: 0, walletBalance: 0 };

    // change back to sample data when the component is unmounted
    return () => {
      store.balances = { channelBalance, walletBalance };
    };
  }, []);

  return <NodeStatus />;
};

export const WithBalances = () => <NodeStatus />;
