import React from 'react';
import { runInAction } from 'mobx';
import * as LOOP from 'types/generated/loop_pb';
import { fireEvent } from '@testing-library/react';
import Big from 'big.js';
import { renderWithProviders } from 'util/tests';
import { loopListSwaps } from 'util/tests/sampleData';
import { createStore, Store } from 'store';
import { Swap } from 'store/models';
import ProcessingSwaps from 'components/loop/processing/ProcessingSwaps';

const { LOOP_IN, LOOP_OUT } = LOOP.SwapType;
const {
  INITIATED,
  PREIMAGE_REVEALED,
  HTLC_PUBLISHED,
  SUCCESS,
  INVOICE_SETTLED,
  FAILED,
} = LOOP.SwapState;
const width = (el: any) => window.getComputedStyle(el).width;

describe('ProcessingSwaps component', () => {
  let store: Store;

  const addSwap = (type: number, state: number, id?: string) => {
    const swap = new Swap(loopListSwaps.swapsList[0]);
    swap.id = `${id || ''}${swap.id}`;
    swap.type = type;
    swap.state = state;
    swap.lastUpdateTime = Big(Date.now() * 1000 * 1000);
    runInAction(() => {
      store.swapStore.swaps.set(swap.id, swap);
    });

    return swap;
  };

  beforeEach(async () => {
    store = createStore();
  });

  const render = () => {
    return renderWithProviders(<ProcessingSwaps />, store);
  };

  it('should display the title', async () => {
    const { getByText } = render();
    expect(getByText('Processing Loops')).toBeInTheDocument();
  });

  it('should display an INITIATED Loop In', () => {
    const { getByText, getByTitle } = render();
    const swap = addSwap(LOOP_IN, INITIATED);
    expect(getByText('dot.svg')).toHaveClass('warn');
    expect(getByText(swap.ellipsedId)).toBeInTheDocument();
    expect(getByText(swap.typeName)).toBeInTheDocument();
    expect(getByTitle(swap.stateLabel)).toBeInTheDocument();
    expect(width(getByTitle(swap.stateLabel))).toBe('25%');
  });

  it('should display an HTLC_PUBLISHED Loop In', () => {
    const { getByText, getByTitle } = render();
    const swap = addSwap(LOOP_IN, HTLC_PUBLISHED);
    expect(getByText('dot.svg')).toHaveClass('warn');
    expect(getByText(swap.ellipsedId)).toBeInTheDocument();
    expect(getByText(swap.typeName)).toBeInTheDocument();
    expect(getByTitle(swap.stateLabel)).toBeInTheDocument();
    expect(width(getByTitle(swap.stateLabel))).toBe('50%');
  });

  it('should display an INVOICE_SETTLED Loop In', () => {
    const { getByText, getByTitle } = render();
    const swap = addSwap(LOOP_IN, INVOICE_SETTLED);
    expect(getByText('dot.svg')).toHaveClass('warn');
    expect(getByText(swap.ellipsedId)).toBeInTheDocument();
    expect(getByText(swap.typeName)).toBeInTheDocument();
    expect(getByTitle(swap.stateLabel)).toBeInTheDocument();
    expect(width(getByTitle(swap.stateLabel))).toBe('75%');
  });

  it('should display an SUCCESS Loop In', () => {
    const { getByText, getByTitle } = render();
    const swap = addSwap(LOOP_IN, SUCCESS);
    expect(getByText(swap.ellipsedId)).toBeInTheDocument();
    expect(getByText(swap.typeName)).toBeInTheDocument();
    expect(getByTitle(swap.stateLabel)).toBeInTheDocument();
    expect(width(getByTitle(swap.stateLabel))).toBe('100%');
  });

  it('should display an FAILED Loop In', () => {
    const { getByText, getAllByText } = render();
    const swap = addSwap(LOOP_IN, FAILED);
    expect(getByText(swap.ellipsedId)).toBeInTheDocument();
    expect(getByText(swap.stateLabel)).toBeInTheDocument();
    expect(getAllByText('close.svg')).toHaveLength(2);
  });

  it('should display an INITIATED Loop Out', () => {
    const { getByText, getByTitle } = render();
    const swap = addSwap(LOOP_OUT, INITIATED);
    expect(getByText('dot.svg')).toHaveClass('warn');
    expect(getByText(swap.ellipsedId)).toBeInTheDocument();
    expect(getByText(swap.typeName)).toBeInTheDocument();
    expect(getByTitle(swap.stateLabel)).toBeInTheDocument();
    expect(width(getByTitle(swap.stateLabel))).toBe('33%');
  });

  it('should display an PREIMAGE_REVEALED Loop Out', () => {
    const { getByText, getByTitle } = render();
    const swap = addSwap(LOOP_OUT, PREIMAGE_REVEALED);
    expect(getByText('dot.svg')).toHaveClass('warn');
    expect(getByText(swap.ellipsedId)).toBeInTheDocument();
    expect(getByText(swap.typeName)).toBeInTheDocument();
    expect(getByTitle(swap.stateLabel)).toBeInTheDocument();
    expect(width(getByTitle(swap.stateLabel))).toBe('66%');
  });

  it('should display an SUCCESS Loop Out', () => {
    const { getByText, getByTitle } = render();
    const swap = addSwap(LOOP_OUT, SUCCESS);
    expect(getByText('dot.svg')).toHaveClass('success');
    expect(getByText(swap.ellipsedId)).toBeInTheDocument();
    expect(getByText(swap.typeName)).toBeInTheDocument();
    expect(getByTitle(swap.stateLabel)).toBeInTheDocument();
    expect(width(getByTitle(swap.stateLabel))).toBe('100%');
  });

  it('should display an FAILED Loop Out', () => {
    const { getByText, getAllByText } = render();
    const swap = addSwap(LOOP_OUT, FAILED);
    expect(getByText(swap.ellipsedId)).toBeInTheDocument();
    expect(getByText(swap.stateLabel)).toBeInTheDocument();
    expect(getAllByText('close.svg')).toHaveLength(2);
  });

  it('should dismiss a failed Loop', () => {
    const { getAllByText } = render();
    addSwap(LOOP_OUT, FAILED);
    expect(store.swapStore.dismissedSwapIds).toHaveLength(0);
    fireEvent.click(getAllByText('close.svg')[1]);
    expect(store.swapStore.dismissedSwapIds).toHaveLength(1);
  });
});
