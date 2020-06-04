import { values } from 'mobx';
import * as LOOP from 'types/generated/loop_pb';
import { grpc } from '@improbable-eng/grpc-web';
import { waitFor } from '@testing-library/react';
import Big from 'big.js';
import { loopListSwaps } from 'util/tests/sampleData';
import { createStore, Store, SwapStore } from 'store';

const grpcMock = grpc as jest.Mocked<typeof grpc>;

describe('SwapStore', () => {
  let rootStore: Store;
  let store: SwapStore;

  beforeEach(async () => {
    rootStore = createStore();
    store = rootStore.swapStore;
  });

  it('should fetch list of swaps', async () => {
    expect(store.sortedSwaps).toHaveLength(0);
    await store.fetchSwaps();
    expect(store.sortedSwaps).toHaveLength(7);
  });

  it('should handle errors fetching swaps', async () => {
    grpcMock.unary.mockImplementationOnce(desc => {
      if (desc.methodName === 'ListSwaps') throw new Error('test-err');
      return undefined as any;
    });
    expect(rootStore.uiStore.alerts.size).toBe(0);
    await store.fetchSwaps();
    await waitFor(() => {
      expect(rootStore.uiStore.alerts.size).toBe(1);
      expect(values(rootStore.uiStore.alerts)[0].message).toBe('test-err');
    });
  });

  it('should update existing swaps with the same id', async () => {
    expect(store.swaps.size).toEqual(0);
    await store.fetchSwaps();
    expect(store.swaps.size).toEqual(loopListSwaps.swapsList.length);
    const prevSwap = store.sortedSwaps[0];
    const prevAmount = prevSwap.amount;
    prevSwap.amount = Big(123);
    await store.fetchSwaps();
    const updatedSwap = store.sortedSwaps[0];
    // the existing swap should be updated
    expect(prevSwap).toBe(updatedSwap);
    expect(updatedSwap.amount).toEqual(prevAmount);
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

  it('should handle swap events', () => {
    const swap = loopListSwaps.swapsList[0];
    swap.id += 'test';
    expect(store.sortedSwaps).toHaveLength(0);
    store.onSwapUpdate(swap);
    expect(store.sortedSwaps).toHaveLength(1);
  });
});
