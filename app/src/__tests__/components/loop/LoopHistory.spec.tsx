import React from 'react';
import { observable } from 'mobx';
import * as LOOP from 'types/generated/loop_pb';
import { renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';
import LoopHistory from 'components/loop/LoopHistory';

describe('LoopHistory component', () => {
  let store: Store;

  beforeEach(async () => {
    store = createStore();
    await store.fetchAllData();

    // remove all but one swap to prevent `getByText` from
    // complaining about multiple elements in tests
    const swap = store.swapStore.sortedSwaps[0];
    store.swapStore.swaps.clear();
    store.swapStore.swaps.set(swap.id, swap);
  });

  const render = () => {
    return renderWithProviders(<LoopHistory />, store);
  };

  it('should display a successful swap', async () => {
    store.swapStore.sortedSwaps[0].state = LOOP.SwapState.SUCCESS;
    const { getByText } = render();
    expect(getByText('dot.svg')).toHaveClass('success');
  });

  it('should display a failed swap', async () => {
    store.swapStore.sortedSwaps[0].state = LOOP.SwapState.FAILED;
    const { getByText } = render();
    expect(getByText('dot.svg')).toHaveClass('error');
  });

  it('should display a pending swap', async () => {
    store.swapStore.sortedSwaps[0].state = LOOP.SwapState.INITIATED;
    const { getByText } = render();
    expect(getByText('dot.svg')).toHaveClass('warn');
  });

  it('should display the empty message', async () => {
    store.swapStore.swaps = observable.map();
    const { getByText } = render();
    expect(
      getByText('After performing swaps, you will see ongoing loops and history here.'),
    ).toBeInTheDocument();
  });
});
