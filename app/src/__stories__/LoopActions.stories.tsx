import React from 'react';
import { lndListChannels } from 'util/tests/sampleData';
import { useStore } from 'store';
import { Channel } from 'store/models';
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
  // only use 3 channels for this story
  const channels = lndListChannels.channelsList.slice(0, 3).map(c => new Channel(c));

  const store = useStore();
  store.buildSwapStore.startSwap();
  store.buildSwapStore.setSelectedChannels(channels);
  return <LoopActions />;
};

export const ZeroChannels = () => {
  const store = useStore();
  store.buildSwapStore.startSwap();
  return <LoopActions />;
};
