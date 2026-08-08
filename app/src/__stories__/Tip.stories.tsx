import React from 'react';
import Tip from 'components/common/Tip';

export default {
  title: 'Components/Tooltip',
  component: Tip,
  parameters: { contained: true },
};

const placements = [
  'top',
  'topRight',
  'right',
  'bottomRight',
  'bottom',
  'bottomLeft',
  'left',
  'topLeft',
];

export const Placements = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: 300 }}>
      {placements.map(p => (
        <div key={p} style={{ display: 'inline-block' }}>
          <Tip placement={p} overlay="Tip of the day">
            <span style={{ margin: 10 }}>{p}</span>
          </Tip>
        </div>
      ))}
    </div>
  );
};
