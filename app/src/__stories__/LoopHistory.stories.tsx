import React from 'react';
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
