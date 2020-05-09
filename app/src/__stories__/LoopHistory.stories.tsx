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
  const { swaps } = useStore();
  return <LoopHistory swaps={swaps} />;
};

export const InsideTile = () => {
  const { swaps } = useStore();
  return (
    <Tile title="Loop History">
      <LoopHistory swaps={swaps} />
    </Tile>
  );
};
