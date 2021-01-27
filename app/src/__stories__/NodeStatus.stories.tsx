import React, { useEffect } from 'react';
import Big from 'big.js';
import { useStore } from 'store';
import NodeStatus from 'components/NodeStatus';

export default {
  title: 'Components/Node Status',
  component: NodeStatus,
  parameters: { centered: true },
};

export const Default = () => {
  const store = useStore();
  useEffect(() => {
    const { channelBalance, walletBalance, confirmedBalance } = store.nodeStore.wallet;
    store.nodeStore.wallet = {
      channelBalance: Big(0),
      walletBalance: Big(0),
      confirmedBalance: Big(0),
    };

    // change back to sample data when the component is unmounted
    return () => {
      store.nodeStore.wallet = { channelBalance, walletBalance, confirmedBalance };
    };
  }, []);

  return <NodeStatus />;
};

export const WithBalances = () => <NodeStatus />;
