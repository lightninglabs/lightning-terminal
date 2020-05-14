import * as LOOP from 'types/generated/loop_pb';
import { waitFor } from '@testing-library/react';
import { loopListSwaps } from 'util/tests/sampleData';
import { createStore, SwapStore } from 'store';

describe('SwapStore', () => {
  let store: SwapStore;

  beforeEach(async () => {
    const rootStore = createStore();
    store = rootStore.swapStore;
  });

  it('should fetch list of swaps', async () => {
    expect(store.sortedSwaps).toHaveLength(0);
    await store.fetchSwaps();
    expect(store.sortedSwaps).toHaveLength(7);
  });

  it('should update existing swaps with the same id', async () => {
    expect(store.swaps.size).toEqual(0);
    await store.fetchSwaps();
    expect(store.swaps.size).toEqual(loopListSwaps.swapsList.length);
    const prevSwap = store.sortedSwaps[0];
    const prevAmount = prevSwap.amount;
    prevSwap.amount = 123;
    await store.fetchSwaps();
    const updatedSwap = store.sortedSwaps[0];
    // the existing swap should be updated
    expect(prevSwap).toBe(updatedSwap);
    expect(updatedSwap.amount).toBe(prevAmount);
  });

  it.each<[number, string]>([
    [LOOP.SwapState.INITIATED, 'Initiated'],
    [LOOP.SwapState.PREIMAGE_REVEALED, 'Preimage Revealed'],
    [LOOP.SwapState.HTLC_PUBLISHED, 'HTLC Published'],
    [LOOP.SwapState.SUCCESS, 'Success'],
    [LOOP.SwapState.FAILED, 'Failed'],
    [LOOP.SwapState.INVOICE_SETTLED, 'Invoice Settled'],
    [-1, 'Unknown'],
  ])('should display the correct label for swap state %s', async (state, label) => {
    await store.fetchSwaps();
    const swap = store.sortedSwaps[0];
    swap.state = state;
    expect(swap.stateLabel).toEqual(label);
  });

  it.each<[number, string]>([
    [LOOP.SwapType.LOOP_IN, 'Loop In'],
    [LOOP.SwapType.LOOP_OUT, 'Loop Out'],
    [-1, 'Unknown'],
  ])('should display the correct name for swap type %s', async (type, label) => {
    await store.fetchSwaps();
    const swap = store.sortedSwaps[0];
    swap.type = type;
    expect(swap.typeName).toEqual(label);
  });

  it('should poll for swap updates', async () => {
    await store.fetchSwaps();
    const swap = store.sortedSwaps[0];
    // create a pending swap to trigger auto-polling
    swap.state = LOOP.SwapState.INITIATED;
    expect(store.pendingSwaps).toHaveLength(1);
    // wait for polling to start
    await waitFor(() => {
      expect(store.pollingInterval).toBeDefined();
    });
    // change the swap to complete
    swap.state = LOOP.SwapState.SUCCESS;
    expect(store.pendingSwaps).toHaveLength(0);
    // confirm polling has stopped
    await waitFor(() => {
      expect(store.pollingInterval).toBeUndefined();
    });
  });

  it('should handle startPolling when polling is already running', () => {
    expect(store.pollingInterval).toBeUndefined();
    store.startPolling();
    expect(store.pollingInterval).toBeDefined();
    store.startPolling();
    expect(store.pollingInterval).toBeDefined();
  });

  it('should handle stopPolling when polling is already stopped', () => {
    expect(store.pollingInterval).toBeUndefined();
    store.stopPolling();
    expect(store.pollingInterval).toBeUndefined();
  });
});
