import SwapAction from 'action/swap';
import LoopApi from 'api/loop';
import { Store } from 'store';

describe('SwapAction', () => {
  let store: Store;
  let loop: SwapAction;

  beforeEach(() => {
    const loopApiMock = new LoopApi();
    store = new Store();
    loop = new SwapAction(store, loopApiMock);
  });

  it('should fetch list of channels', async () => {
    expect(store.swaps).toEqual([]);
    await loop.listSwaps();
    expect(store.swaps).toHaveLength(7);
  });
});
