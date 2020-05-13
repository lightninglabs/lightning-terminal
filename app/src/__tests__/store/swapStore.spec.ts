import * as LOOP from 'types/generated/loop_pb';
import { createStore, SwapStore } from 'store';

describe('SwapStore', () => {
  let store: SwapStore;

  beforeEach(() => {
    store = createStore().swapStore;
  });

  it('should fetch list of swaps', async () => {
    expect(store.sortedSwaps).toHaveLength(0);
    await store.fetchSwaps();
    expect(store.sortedSwaps).toHaveLength(7);
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
});
