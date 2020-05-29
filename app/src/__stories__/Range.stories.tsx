import React, { useState } from 'react';
import Big from 'big.js';
import Range from 'components/common/Range';

export default {
  title: 'Components/Range',
  component: Range,
  parameters: { centered: true },
};

export const Default = () => {
  const [value, setValue] = useState(Big(50));
  return <Range value={value} onChange={setValue} />;
};

export const StepByFive = () => {
  const [value, setValue] = useState(Big(50));
  return <Range value={value} onChange={setValue} step={5} />;
};

export const WithMinMax = () => {
  const [value, setValue] = useState(Big(50));
  return <Range value={value} onChange={setValue} showRadios />;
};
