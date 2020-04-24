import React from 'react';
import { StoryContext } from '@storybook/addons';
import { Store } from 'store';
import Tile from 'components/common/Tile';
import LoopHistory from 'components/loop/LoopHistory';

export default {
  title: 'Loop History',
  component: LoopHistory,
  parameters: { centered: true },
};

export const Default = (ctx: StoryContext) => {
  // grab the store from the Storybook parameter defined in preview.tsx
  const { swaps } = ctx.parameters.store as Store;
  return <LoopHistory swaps={swaps} />;
};

export const InsideTile = (ctx: StoryContext) => {
  // grab the store from the Storybook parameter defined in preview.tsx
  const { swaps } = ctx.parameters.store as Store;
  return (
    <Tile title="Loop History">
      <LoopHistory swaps={swaps} />
    </Tile>
  );
};
