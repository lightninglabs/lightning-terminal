import React from 'react';
import { lndListChannels } from 'util/tests/sampleData';
import { useStore } from 'store';
import LoopActions from 'components/loop/LoopActions';

export default {
  title: 'Components/Loop Actions',
  component: LoopActions,
  parameters: { contained: true },
};

export const Default = () => {
  return <LoopActions />;
};

export const Opened = () => {
  const store = useStore();
  store.buildSwapView.startSwap();
  lndListChannels.channelsList.slice(0, 1).forEach(c => {
    store.buildSwapView.toggleSelectedChannel(c.chanId);
  });
  return <LoopActions />;
};

export const LoopInWarn = () => {
  const store = useStore();
  store.buildSwapView.startSwap();
  lndListChannels.channelsList.slice(0, 3).forEach(c => {
    store.buildSwapView.toggleSelectedChannel(c.chanId);
  });
  return <LoopActions />;
};

export const ZeroChannels = () => {
  const store = useStore();
  store.buildSwapView.startSwap();
  return <LoopActions />;
};
