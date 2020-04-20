import SwapAction from 'action/swap';
import { GrpcClient, LoopApi } from 'api';
import { Store } from 'store';

describe('SwapAction', () => {
  let store: Store;
  let loop: SwapAction;

  beforeEach(() => {
    const grpc = new GrpcClient();
    const loopApiMock = new LoopApi(grpc);
    store = new Store();
    loop = new SwapAction(store, loopApiMock);
  });

  it('should fetch list of channels', async () => {
    expect(store.swaps).toEqual([]);
    await loop.listSwaps();
    expect(store.swaps).toHaveLength(7);
  });
});
