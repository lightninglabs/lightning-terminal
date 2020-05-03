import React, { useState } from 'react';
import Checkbox from 'components/common/Checkbox';

export default {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: { centered: true },
};

export const Default = () => {
  const [checked, setChecked] = useState(false);
  return <Checkbox checked={checked} onChange={setChecked} />;
};

export const Unchecked = () => <Checkbox />;

export const Checked = () => <Checkbox checked />;

export const DisabledChecked = () => <Checkbox disabled checked />;

export const DisabledUnchecked = () => <Checkbox disabled />;
