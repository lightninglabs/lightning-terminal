import React from 'react';
import { SwapDirection } from 'types/state';
import { fireEvent } from '@testing-library/react';
import { formatSats } from 'util/formatters';
import { renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';
import SwapWizard from 'components/loop/swap/SwapWizard';

describe('SwapWizard component', () => {
  let store: Store;

  beforeEach(async () => {
    store = createStore();
    await store.init();

    await store.buildSwapStore.startSwap();
    store.channelStore.sortedChannels.slice(0, 3).forEach(c => {
      store.buildSwapStore.toggleSelectedChannel(c.chanId);
    });
    await store.buildSwapStore.setDirection(SwapDirection.OUT);
  });

  const render = () => {
    return renderWithProviders(<SwapWizard />, store);
  };

  describe('General behavior', () => {
    it('should display the description labels', () => {
      const { getByText } = render();
      expect(getByText('Step 1 of 2')).toBeInTheDocument();
      expect(getByText('Set Liquidity Parameters')).toBeInTheDocument();
    });

    it('should navigate forward and back through each step', async () => {
      const { getByText } = render();
      expect(getByText('Step 1 of 2')).toBeInTheDocument();
      fireEvent.click(getByText('Next'));
      expect(getByText('Step 2 of 2')).toBeInTheDocument();
      fireEvent.click(getByText('Confirm'));
      expect(getByText('Configuring Loops')).toBeInTheDocument();
      fireEvent.click(getByText('arrow-left.svg'));
      expect(getByText('Step 2 of 2')).toBeInTheDocument();
      fireEvent.click(getByText('arrow-left.svg'));
      expect(getByText('Step 1 of 2')).toBeInTheDocument();
    });
  });

  describe('Config Step', () => {
    it('should display the correct min an max values', () => {
      const { getByText } = render();
      const { min, max } = store.buildSwapStore.termsForDirection;
      expect(getByText(formatSats(min))).toBeInTheDocument();
      expect(getByText(formatSats(max))).toBeInTheDocument();
    });

    it('should display the correct number of channels', () => {
      const { getByText } = render();
      const { selectedChanIds } = store.buildSwapStore;
      expect(getByText(`${selectedChanIds.length}`)).toBeInTheDocument();
    });

    it('should update the amount when the slider changes', () => {
      const { getByText, getByLabelText } = render();
      const build = store.buildSwapStore;
      expect(build.amount).toEqual(625000);
      expect(getByText(`625,000 sats`)).toBeInTheDocument();
      fireEvent.change(getByLabelText('range-slider'), { target: { value: '575000' } });
      expect(build.amount).toEqual(575000);
      expect(getByText(`575,000 sats`)).toBeInTheDocument();
    });
  });

  describe('Review Step', () => {
    beforeEach(async () => {
      store.buildSwapStore.setAmount(500000);
      store.buildSwapStore.goToNextStep();
      await store.buildSwapStore.getQuote();
    });

    it('should display the description labels', () => {
      const { getByText } = render();
      expect(getByText('Step 2 of 2')).toBeInTheDocument();
      expect(getByText('Review the quote')).toBeInTheDocument();
      expect(getByText('Loop Out Amount')).toBeInTheDocument();
      expect(getByText('Fees')).toBeInTheDocument();
      expect(getByText('Invoice Total')).toBeInTheDocument();
    });

    it('should display the correct values', () => {
      const { getByText } = render();
      const build = store.buildSwapStore;
      expect(getByText(formatSats(build.amount))).toBeInTheDocument();
      expect(getByText(build.feesLabel)).toBeInTheDocument();
      expect(getByText(formatSats(build.invoiceTotal))).toBeInTheDocument();
    });
  });

  describe('Processing Step', () => {
    beforeEach(async () => {
      store.buildSwapStore.setAmount(500000);
      store.buildSwapStore.goToNextStep();
      await store.buildSwapStore.getQuote();
      store.buildSwapStore.goToNextStep();
    });

    it('should display the description label', () => {
      const { getByText } = render();
      expect(getByText('Configuring Loops')).toBeInTheDocument();
    });

    it('should display an error message', () => {
      store.buildSwapStore.swapError = new Error('error-test');
      const { getByText } = render();
      expect(getByText('error-test')).toBeInTheDocument();
    });
  });
});
