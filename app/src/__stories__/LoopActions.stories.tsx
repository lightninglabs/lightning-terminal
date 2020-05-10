import React from 'react';
import { BuildSwapSteps, SwapDirection } from 'types/state';
import { action } from '@storybook/addon-actions';
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

// only use 3 channels for these stories
const channels = lndListChannels.channelsList.slice(0, 3).map(c => new Channel(c));

export const Default = () => {
  const store = useStore();
  store.buildSwapStore.currentStep = BuildSwapSteps.Closed;
  return (
    <LoopActions
      direction={SwapDirection.OUT}
      channels={channels}
      onLoopClick={() => action('onLoopClick')}
      onDirectionClick={() => action('onTypeClick')}
      onCancelClick={() => action('onCancelClick')}
    />
  );
};

export const Opened = () => {
  const store = useStore();
  store.buildSwapStore.currentStep = BuildSwapSteps.SelectDirection;
  return (
    <LoopActions
      direction={SwapDirection.OUT}
      channels={channels}
      onLoopClick={() => action('onLoopClick')}
      onDirectionClick={() => action('onTypeClick')}
      onCancelClick={() => action('onCancelClick')}
    />
  );
};

export const ZeroChannels = () => {
  const store = useStore();
  store.buildSwapStore.currentStep = BuildSwapSteps.SelectDirection;
  return (
    <LoopActions
      direction={SwapDirection.OUT}
      channels={[]}
      onLoopClick={() => action('onLoopClick')}
      onDirectionClick={() => action('onTypeClick')}
      onCancelClick={() => action('onCancelClick')}
    />
  );
};

export const Interactive = () => {
  const store = useStore();
  return (
    <LoopActions
      direction={SwapDirection.OUT}
      channels={channels}
      onLoopClick={store.buildSwapStore.startSwap}
      onDirectionClick={() => action('onTypeClick')}
      onCancelClick={store.buildSwapStore.cancel}
    />
  );
};
