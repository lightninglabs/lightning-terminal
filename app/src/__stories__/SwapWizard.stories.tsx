import React from 'react';
import { action } from '@storybook/addon-actions';
import SwapWizard from 'components/loop/swap/SwapWizard';

export default {
  title: 'Components/Swap Wizard',
  component: SwapWizard,
  parameters: { contained: true },
  decorators: [(storyFn: any) => <div style={{ padding: 100 }}>{storyFn()}</div>],
};

export const Default = () => {
  return <SwapWizard channelIds={['asdf', 'fdsa']} onClose={() => action('onClose')} />;
};
