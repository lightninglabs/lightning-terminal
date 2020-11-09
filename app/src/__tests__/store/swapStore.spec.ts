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

  it('should add swapped channels', () => {
    expect(store.swappedChannels.size).toBe(0);
    store.addSwappedChannels('s1', ['c1', 'c2']);
    expect(store.swappedChannels.size).toBe(2);
    expect(store.swappedChannels.get('c1')).toEqual(['s1']);
    expect(store.swappedChannels.get('c2')).toEqual(['s1']);
    store.addSwappedChannels('s2', ['c2']);
    expect(store.swappedChannels.size).toBe(2);
    expect(store.swappedChannels.get('c2')).toEqual(['s1', 's2']);
  });

  it('should prune the swapped channels list', async () => {
    await rootStore.channelStore.fetchChannels();
    await store.fetchSwaps();
    const swaps = store.sortedSwaps;
    // make these swaps pending
    swaps[0].state = LOOP.SwapState.HTLC_PUBLISHED;
    swaps[1].state = LOOP.SwapState.INITIATED;
    const channels = rootStore.channelStore.sortedChannels;
    const [c1, c2, c3] = channels.map(c => c.chanId);
    store.addSwappedChannels(swaps[0].id, [c1, c2]);
    store.addSwappedChannels(swaps[1].id, [c2, c3]);
    // confirm swapped channels are set
    expect(store.swappedChannels.size).toBe(3);
    expect(store.swappedChannels.get(c2)).toHaveLength(2);
    // change one swap to complete
    swaps[1].state = LOOP.SwapState.SUCCESS;
    store.pruneSwappedChannels();
    // confirm swap1 removed
    expect(store.swappedChannels.size).toBe(2);
    expect(store.swappedChannels.get(c1)).toHaveLength(1);
    expect(store.swappedChannels.get(c2)).toHaveLength(1);
    expect(store.swappedChannels.get(c3)).toBeUndefined();
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
    expect(rootStore.appView.alerts.size).toBe(0);
    await store.fetchSwaps();
    await waitFor(() => {
      expect(rootStore.appView.alerts.size).toBe(1);
      expect(values(rootStore.appView.alerts)[0].message).toBe('test-err');
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
