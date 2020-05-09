import React from 'react';
import { SwapDirection } from 'types/state';
import { action } from '@storybook/addon-actions';
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
  const store = useStore();
  store.buildSwapStore.showActions = false;
  return (
    <LoopActions
      direction={SwapDirection.OUT}
      channels={store.channelStore.channels.slice(0, 3)}
      onLoopClick={() => action('onLoopClick')}
      onDirectionClick={() => action('onTypeClick')}
      onCancelClick={() => action('onCancelClick')}
    />
  );
};

export const Opened = () => {
  const store = useStore();
  store.buildSwapStore.showActions = true;
  return (
    <LoopActions
      direction={SwapDirection.OUT}
      channels={store.channelStore.channels.slice(0, 3)}
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
      channels={store.channelStore.channels.slice(0, 3)}
      onLoopClick={store.buildSwapStore.toggleShowActions}
      onDirectionClick={() => action('onTypeClick')}
      onCancelClick={store.buildSwapStore.cancel}
    />
  );
};
