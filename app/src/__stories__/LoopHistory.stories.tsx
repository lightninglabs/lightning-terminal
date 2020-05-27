import React from 'react';
import { observable } from 'mobx';
import { useStore } from 'store';
import Tile from 'components/common/Tile';
import LoopHistory from 'components/loop/LoopHistory';

export default {
  title: 'Components/Loop History',
  component: LoopHistory,
  parameters: { centered: true },
};

export const Default = () => {
  return <LoopHistory />;
};

export const InsideTile = () => {
  return (
    <Tile title="Loop History">
      <LoopHistory />
    </Tile>
  );
};

export const Empty = () => {
  const { swapStore } = useStore();
  swapStore.swaps = observable.map();
  return (
    <Tile title="Loop History" onMaximizeClick={() => null}>
      <LoopHistory />
    </Tile>
  );
};
