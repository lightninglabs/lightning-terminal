import React from 'react';
import { action } from '@storybook/addon-actions';
import { StoryContext } from '@storybook/addons';
import { Store } from 'store';
import LoopActions from 'components/loop/LoopActions';

export default {
  title: 'Components/Loop Actions',
  component: LoopActions,
  parameters: { contained: true },
  decorators: [
    (storyFn: any) => <div style={{ width: 600, margin: 'auto' }}>{storyFn()}</div>,
  ],
};

export const Default = (ctx: StoryContext) => {
  // grab the store from the Storybook parameter defined in preview.tsx
  const { channels } = ctx.parameters.store as Store;
  return (
    <LoopActions
      swapType="Loop Out"
      channels={channels.slice(0, 3)}
      onLoopClick={() => action('onLoopClick')}
      onTypeClick={() => action('onTypeClick')}
      onCancelClick={() => action('onCancelClick')}
    />
  );
};
