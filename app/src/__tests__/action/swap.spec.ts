import { SwapDirection } from 'types/state';
import { grpc } from '@improbable-eng/grpc-web';
import * as config from 'config';
import SwapAction from 'action/swap';
import { GrpcClient, LoopApi } from 'api';
import { createStore, Store } from 'store';

const grpcMock = grpc as jest.Mocked<typeof grpc>;

describe('SwapAction', () => {
  let store: Store;
  let loop: SwapAction;

  beforeEach(() => {
    const grpc = new GrpcClient();
    const loopApiMock = new LoopApi(grpc);
    store = createStore();
    loop = new SwapAction(store, loopApiMock);
  });

  it('should fetch list of swaps', async () => {
    expect(store.swaps).toEqual([]);
    await loop.listSwaps();
    expect(store.swaps).toHaveLength(7);
  });

  it('should fetch loop terms', async () => {
    expect(store.terms.in).toEqual({ min: 0, max: 0 });
    expect(store.terms.out).toEqual({ min: 0, max: 0 });
    await loop.getTerms();
    expect(store.terms.in).toEqual({ min: 250000, max: 1000000 });
    expect(store.terms.out).toEqual({ min: 250000, max: 1000000 });
  });

  it('should fetch a loop in quote', async () => {
    expect(store.buildSwapStore.quote.swapFee).toEqual(0);
    expect(store.buildSwapStore.quote.minerFee).toEqual(0);
    expect(store.buildSwapStore.quote.prepayAmount).toEqual(0);
    store.buildSwapStore.setDirection(SwapDirection.IN);
    store.buildSwapStore.setAmount(600);
    await loop.getQuote();
    expect(store.buildSwapStore.quote.swapFee).toEqual(83);
    expect(store.buildSwapStore.quote.minerFee).toEqual(7387);
    expect(store.buildSwapStore.quote.prepayAmount).toEqual(1337);
  });

  it('should fetch a loop out quote', async () => {
    expect(store.buildSwapStore.quote.swapFee).toEqual(0);
    expect(store.buildSwapStore.quote.minerFee).toEqual(0);
    expect(store.buildSwapStore.quote.prepayAmount).toEqual(0);
    store.buildSwapStore.setDirection(SwapDirection.OUT);
    store.buildSwapStore.setAmount(600);
    await loop.getQuote();
    expect(store.buildSwapStore.quote.swapFee).toEqual(83);
    expect(store.buildSwapStore.quote.minerFee).toEqual(7387);
    expect(store.buildSwapStore.quote.prepayAmount).toEqual(1337);
  });

  it('should perform a loop in', async () => {
    store.buildSwapStore.setDirection(SwapDirection.IN);
    store.buildSwapStore.setAmount(600);
    await loop.loop();
    expect(grpcMock.unary).toHaveBeenCalledWith(
      expect.objectContaining({ methodName: 'LoopIn' }),
      expect.any(Object),
    );
  });

  it('should perform a loop out', async () => {
    store.buildSwapStore.setDirection(SwapDirection.OUT);
    store.buildSwapStore.setAmount(600);
    await loop.loop();
    expect(grpcMock.unary).toHaveBeenCalledWith(
      expect.objectContaining({ methodName: 'LoopOut' }),
      expect.anything(),
    );
  });

  it('should set the correct swap deadline in production', async () => {
    store.buildSwapStore.setDirection(SwapDirection.OUT);
    store.buildSwapStore.setAmount(600);
    // mock the grpc unary function in order to capture the supplied deadline
    let deadline = 0;
    grpcMock.unary.mockImplementation((desc, props) => {
      deadline = (props.request.toObject() as any).swapPublicationDeadline;
      props.onEnd({} as any);
      return undefined as any;
    });
    // run a loop in production and verify the deadline
    Object.defineProperty(config, 'IS_PROD', { get: () => true });
    await loop.loop();
    expect(deadline).toBeGreaterThan(0);
    // run a loop not in production and verify the deadline
    Object.defineProperty(config, 'IS_PROD', { get: () => false });
    await loop.loop();
    expect(deadline).toEqual(0);
  });

  it('should handle loop errors', async () => {
    grpcMock.unary.mockImplementationOnce(() => {
      throw new Error('asdf');
    });
    store.buildSwapStore.setDirection(SwapDirection.IN);
    store.buildSwapStore.setAmount(600);

    expect(store.buildSwapStore.swapError).toBeUndefined();
    await loop.loop();
    expect(store.buildSwapStore.swapError).toBeDefined();
  });
});
