import React from 'react';
import { values } from 'mobx';
import { SwapDirection } from 'types/state';
import { fireEvent } from '@testing-library/react';
import Big from 'big.js';
import { formatSats } from 'util/formatters';
import { renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';
import SwapWizard from 'components/loop/swap/SwapWizard';

describe('SwapWizard component', () => {
  let store: Store;

  beforeEach(async () => {
    store = createStore();
    await store.fetchAllData();

    await store.buildSwapView.startSwap();
    store.channelStore.sortedChannels.slice(0, 3).forEach(c => {
      store.buildSwapView.toggleSelectedChannel(c.chanId);
    });
    await store.buildSwapView.setDirection(SwapDirection.OUT);
  });

  const render = () => {
    return renderWithProviders(<SwapWizard />, store);
  };

  describe('General behavior', () => {
    it('should display the description labels', () => {
      const { getByText } = render();
      expect(getByText('Step 1 of 2')).toBeInTheDocument();
      expect(getByText('Loop Out Amount')).toBeInTheDocument();
    });

    it('should navigate forward and back through each step', async () => {
      const { getByText } = render();
      expect(getByText('Step 1 of 2')).toBeInTheDocument();
      fireEvent.click(getByText('Next'));
      expect(getByText('Step 2 of 2')).toBeInTheDocument();
      fireEvent.click(getByText('Confirm'));
      expect(getByText('Submitting Loop')).toBeInTheDocument();
      fireEvent.click(getByText('arrow-left.svg'));
      expect(getByText('Step 2 of 2')).toBeInTheDocument();
      fireEvent.click(getByText('arrow-left.svg'));
      expect(getByText('Step 1 of 2')).toBeInTheDocument();
    });
  });

  describe('Config Step', () => {
    it('should display the correct min an max values', () => {
      const { getByText } = render();
      const { min, max } = store.buildSwapView.termsForDirection;
      expect(getByText(formatSats(min))).toBeInTheDocument();
      expect(getByText(formatSats(max))).toBeInTheDocument();
    });

    it('should display the correct number of channels', () => {
      const { getByText } = render();
      const { selectedChanIds } = store.buildSwapView;
      expect(getByText(`${selectedChanIds.length}`)).toBeInTheDocument();
    });

    it('should update the amount when the slider changes', () => {
      const { getByText, getByLabelText } = render();
      const build = store.buildSwapView;
      expect(+build.amountForSelected).toEqual(625000);
      expect(getByText(`625,000 sats`)).toBeInTheDocument();
      fireEvent.change(getByLabelText('range-slider'), { target: { value: '575000' } });
      expect(+build.amountForSelected).toEqual(575000);
      expect(getByText(`575,000 sats`)).toBeInTheDocument();
    });

    it('should show additional options', () => {
      const { getByText } = render();
      fireEvent.click(getByText('Additional Options'));
      expect(getByText('Hide Options')).toBeInTheDocument();
    });

    it('should store the specified conf target', () => {
      const { getByText, getByPlaceholderText } = render();
      fireEvent.click(getByText('Additional Options'));
      fireEvent.change(getByPlaceholderText('number of blocks (ex: 6)'), {
        target: { value: 20 },
      });
      expect(store.buildSwapView.confTarget).toBeUndefined();
      fireEvent.click(getByText('Next'));
      expect(store.buildSwapView.confTarget).toBe(20);
    });

    it('should store the specified destination address', () => {
      const { getByText, getByPlaceholderText } = render();
      fireEvent.click(getByText('Additional Options'));
      fireEvent.change(getByPlaceholderText('segwit address'), {
        target: { value: 'abcdef' },
      });
      expect(store.buildSwapView.loopOutAddress).toBeUndefined();
      fireEvent.click(getByText('Next'));
      expect(store.buildSwapView.loopOutAddress).toBe('abcdef');
    });

    it('should handle invalid conf target', () => {
      const { getByText, getByPlaceholderText } = render();
      fireEvent.click(getByText('Additional Options'));
      fireEvent.change(getByPlaceholderText('number of blocks (ex: 6)'), {
        target: { value: 'asdf' },
      });
      fireEvent.click(getByText('Next'));
      expect(values(store.appView.alerts)[0].message).toBe(
        'Confirmation target must be between 20 and 60.',
      );
    });
  });

  describe('Review Step', () => {
    beforeEach(async () => {
      store.buildSwapView.setAmount(Big(500000));
      store.buildSwapView.goToNextStep();
      await store.buildSwapView.getQuote();
    });

    it('should display the description labels', () => {
      const { getByText } = render();
      expect(getByText('Step 2 of 2')).toBeInTheDocument();
      expect(getByText('Review Loop amount and fee')).toBeInTheDocument();
      expect(getByText('Loop Out Amount')).toBeInTheDocument();
      expect(getByText('Fees')).toBeInTheDocument();
      expect(getByText('Total')).toBeInTheDocument();
    });

    it('should display the correct values', () => {
      const { getByText } = render();
      const build = store.buildSwapView;
      expect(getByText(formatSats(build.amount))).toBeInTheDocument();
      expect(getByText(build.feesLabel)).toBeInTheDocument();
      expect(getByText(formatSats(build.invoiceTotal))).toBeInTheDocument();
    });
  });

  describe('Processing Step', () => {
    beforeEach(async () => {
      store.buildSwapView.setAmount(Big(500000));
      store.buildSwapView.goToNextStep();
      await store.buildSwapView.getQuote();
      store.buildSwapView.goToNextStep();
    });

    it('should display the description label', () => {
      const { getByText } = render();
      expect(getByText('Submitting Loop')).toBeInTheDocument();
    });
  });
});
