import React from 'react';
import * as LOOP from 'types/generated/loop_pb';
import { renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';
import LoopHistory from 'components/loop/LoopHistory';

describe('LoopHistory component', () => {
  let store: Store;

  beforeEach(async () => {
    store = createStore();
    await store.init();
  });

  const render = () => {
    const swaps = store.swapStore.sortedSwaps.slice(0, 1);
    return renderWithProviders(<LoopHistory swaps={swaps} />);
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
});
