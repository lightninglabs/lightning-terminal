import React from 'react';
import { useStore } from 'store';
import Tile from 'components/common/Tile';
import LoopHistory from 'components/loop/LoopHistory';

export default {
  title: 'Components/Loop History',
  component: LoopHistory,
  parameters: { centered: true },
};

export const Default = () => {
  const { swapStore } = useStore();
  return <LoopHistory swaps={swapStore.sortedSwaps} />;
};

export const InsideTile = () => {
  const { swapStore } = useStore();
  return (
    <Tile title="Loop History">
      <LoopHistory swaps={swapStore.sortedSwaps} />
    </Tile>
  );
};
