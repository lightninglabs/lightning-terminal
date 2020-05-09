import React from 'react';
import { useObserver } from 'mobx-react-lite';
import { SwapDirection } from 'types/state';
import { action } from '@storybook/addon-actions';
import { useStore } from 'store';
import SwapWizard from 'components/loop/swap/SwapWizard';

export default {
  title: 'Components/Swap Wizard',
  component: SwapWizard,
  parameters: { contained: true },
  decorators: [
    (StoryFn: any) => (
      <div style={{ padding: 100 }}>
        <StoryFn />
      </div>
    ),
  ],
};

export const Step1Amount = () => {
  const { channelStore, buildSwapStore: build } = useStore();
  build.setDirection(SwapDirection.OUT);
  return (
    <SwapWizard
      channels={channelStore.sortedChannels.slice(0, 3)}
      direction={build.direction}
      amount={build.amount}
      setAmount={build.setAmount}
      minAmount={build.termsMinMax.min}
      maxAmount={build.termsMinMax.max}
      fee={build.fee}
      currentStep={1}
      onNext={build.goToNextStep}
      onPrev={build.goToPrevStep}
      onClose={() => action('onClose')}
    />
  );
};

export const Step2Fees = () => {
  const { channelStore, buildSwapStore: build } = useStore();
  build.setAmount(50000);
  build.setDirection(SwapDirection.OUT);
  return (
    <SwapWizard
      channels={channelStore.sortedChannels.slice(0, 3)}
      direction={build.direction}
      amount={build.amount}
      setAmount={build.setAmount}
      minAmount={build.termsMinMax.min}
      maxAmount={build.termsMinMax.max}
      fee={1234}
      currentStep={2}
      onNext={build.goToNextStep}
      onPrev={build.goToPrevStep}
      onClose={() => action('onClose')}
    />
  );
};

export const Step3Processing = () => {
  const { channelStore, buildSwapStore: build } = useStore();
  build.setDirection(SwapDirection.OUT);
  return (
    <SwapWizard
      channels={channelStore.sortedChannels.slice(0, 3)}
      direction={build.direction}
      amount={build.amount}
      setAmount={build.setAmount}
      minAmount={build.termsMinMax.min}
      maxAmount={build.termsMinMax.max}
      fee={build.fee}
      currentStep={3}
      onNext={build.goToNextStep}
      onPrev={build.goToPrevStep}
      onClose={() => action('onClose')}
    />
  );
};

export const Interactive = () => {
  const { channelStore, buildSwapStore: build } = useStore();
  build.setDirection(SwapDirection.OUT);
  return useObserver(() => (
    <SwapWizard
      channels={channelStore.sortedChannels.slice(0, 3)}
      direction={build.direction}
      amount={build.amount}
      setAmount={build.setAmount}
      minAmount={build.termsMinMax.min}
      maxAmount={build.termsMinMax.max}
      fee={build.fee}
      currentStep={build.currentStep}
      onNext={build.goToNextStep}
      onPrev={build.goToPrevStep}
      onClose={build.cancel}
    />
  ));
};
