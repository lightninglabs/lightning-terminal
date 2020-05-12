import React from 'react';
import { lndListChannels } from 'util/tests/sampleData';
import { useStore } from 'store';
import LoopActions from 'components/loop/LoopActions';

export default {
  title: 'Components/Loop Actions',
  component: LoopActions,
  parameters: { contained: true },
  decorators: [
    (storyFn: any) => <div style={{ width: 600, margin: 'auto' }}>{storyFn()}</div>,
  ],
};

export const Default = () => {
  return <LoopActions />;
};

export const Opened = () => {
  const store = useStore();
  store.buildSwapStore.startSwap();
  // select 3 channels
  lndListChannels.channelsList.slice(0, 3).forEach(c => {
    store.buildSwapStore.toggleSelectedChannel(c.chanId);
  });
  return <LoopActions />;
};

export const ZeroChannels = () => {
  const store = useStore();
  store.buildSwapStore.startSwap();
  return <LoopActions />;
};
