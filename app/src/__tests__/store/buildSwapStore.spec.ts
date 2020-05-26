import { values } from 'mobx';
import { SwapDirection } from 'types/state';
import { grpc } from '@improbable-eng/grpc-web';
import { waitFor } from '@testing-library/react';
import * as config from 'config';
import { injectIntoGrpcUnary } from 'util/tests';
import { BuildSwapStore, createStore, Store } from 'store';
import { SWAP_ABORT_DELAY } from 'store/stores/buildSwapStore';

const grpcMock = grpc as jest.Mocked<typeof grpc>;

describe('BuildSwapStore', () => {
  let rootStore: Store;
  let store: BuildSwapStore;

  beforeEach(async () => {
    rootStore = createStore();
    await rootStore.init();
    store = rootStore.buildSwapStore;
  });

  it('should toggle the selected channels', () => {
    expect(store.selectedChanIds).toHaveLength(0);
    store.toggleSelectedChannel('test');
    expect(store.selectedChanIds).toHaveLength(1);
    store.toggleSelectedChannel('test');
    expect(store.selectedChanIds).toHaveLength(0);
  });

  it('should infer the swap direction based on the selected channels', () => {
    const channels = rootStore.channelStore.sortedChannels;
    store.toggleSelectedChannel(channels[0].chanId);
    expect(store.inferredDirection).toEqual(SwapDirection.OUT);
    store.toggleSelectedChannel(channels[channels.length - 1].chanId);
    expect(store.inferredDirection).toEqual(SwapDirection.IN);
  });

  it('should fetch loop terms', async () => {
    expect(store.terms.in).toEqual({ min: 0, max: 0 });
    expect(store.terms.out).toEqual({ min: 0, max: 0 });
    await store.getTerms();
    expect(store.terms.in).toEqual({ min: 250000, max: 1000000 });
    expect(store.terms.out).toEqual({ min: 250000, max: 1000000 });
  });

  it('should handle errors fetching loop terms', async () => {
    grpcMock.unary.mockImplementationOnce(desc => {
      if (desc.methodName === 'GetLoopInTerms') throw new Error('test-err');
      return undefined as any;
    });
    expect(rootStore.uiStore.alerts.size).toBe(0);
    await store.getTerms();
    await waitFor(() => {
      expect(rootStore.uiStore.alerts.size).toBe(1);
      expect(values(rootStore.uiStore.alerts)[0].message).toBe('test-err');
    });
  });

  it('should adjust the amount after fetching the loop terms', async () => {
    store.setAmount(100);
    await store.getTerms();
    expect(store.amount).toBe(625000);
    store.setAmount(5000000);
    await store.getTerms();
    expect(store.amount).toBe(625000);
    store.setAmount(500000);
    await store.getTerms();
    expect(store.amount).toBe(500000);
  });

  it('should fetch a loop in quote', async () => {
    expect(store.quote.swapFee).toEqual(0);
    expect(store.quote.minerFee).toEqual(0);
    expect(store.quote.prepayAmount).toEqual(0);
    store.setDirection(SwapDirection.IN);
    store.setAmount(600);
    await store.getQuote();
    expect(store.quote.swapFee).toEqual(83);
    expect(store.quote.minerFee).toEqual(7387);
    expect(store.quote.prepayAmount).toEqual(1337);
  });

  it('should fetch a loop out quote', async () => {
    expect(store.quote.swapFee).toEqual(0);
    expect(store.quote.minerFee).toEqual(0);
    expect(store.quote.prepayAmount).toEqual(0);
    store.setDirection(SwapDirection.OUT);
    store.setAmount(600);
    await store.getQuote();
    expect(store.quote.swapFee).toEqual(83);
    expect(store.quote.minerFee).toEqual(7387);
    expect(store.quote.prepayAmount).toEqual(1337);
  });

  it('should handle errors fetching loop quote', async () => {
    grpcMock.unary.mockImplementationOnce(desc => {
      if (desc.methodName === 'LoopOutQuote') throw new Error('test-err');
      return undefined as any;
    });
    store.setDirection(SwapDirection.OUT);
    store.setAmount(600);
    expect(rootStore.uiStore.alerts.size).toBe(0);
    await store.getQuote();
    await waitFor(() => {
      expect(rootStore.uiStore.alerts.size).toBe(1);
      expect(values(rootStore.uiStore.alerts)[0].message).toBe('test-err');
    });
  });

  it('should perform a loop in', async () => {
    store.setDirection(SwapDirection.IN);
    store.setAmount(600);
    store.requestSwap();
    await waitFor(() => {
      expect(grpcMock.unary).toHaveBeenCalledWith(
        expect.objectContaining({ methodName: 'LoopIn' }),
        expect.any(Object),
      );
    });
  });

  it('should perform a loop out', async () => {
    store.setDirection(SwapDirection.OUT);
    store.setAmount(600);
    store.requestSwap();
    await waitFor(() => {
      expect(grpcMock.unary).toHaveBeenCalledWith(
        expect.objectContaining({ methodName: 'LoopOut' }),
        expect.anything(),
      );
    });
  });

  it('should set the correct swap deadline in production', async () => {
    store.setDirection(SwapDirection.OUT);
    store.setAmount(600);

    let deadline = 0;
    // mock the grpc unary function in order to capture the supplied deadline
    // passed in with the API request
    injectIntoGrpcUnary((desc, props) => {
      deadline = (props.request.toObject() as any).swapPublicationDeadline;
    });

    // run a loop in production and verify the deadline
    Object.defineProperty(config, 'IS_PROD', { get: () => true });
    store.requestSwap();
    await waitFor(() => expect(deadline).toBeGreaterThan(0));

    // inject again for the next swap
    injectIntoGrpcUnary((desc, props) => {
      deadline = (props.request.toObject() as any).swapPublicationDeadline;
    });

    // run a loop NOT in production and verify the deadline
    Object.defineProperty(config, 'IS_PROD', { get: () => false });
    store.requestSwap();
    await waitFor(() => expect(deadline).toEqual(0));
  });

  it('should handle errors when performing a loop', async () => {
    grpcMock.unary.mockImplementationOnce(desc => {
      if (desc.methodName === 'LoopIn') throw new Error('test-err');
      return undefined as any;
    });
    store.setDirection(SwapDirection.IN);
    store.setAmount(600);
    expect(rootStore.uiStore.alerts.size).toBe(0);
    store.requestSwap();
    await waitFor(() => {
      expect(rootStore.uiStore.alerts.size).toBe(1);
      expect(values(rootStore.uiStore.alerts)[0].message).toBe('test-err');
    });
  });

  it('should delay for 3 seconds before performing a swap in production', async () => {
    store.setDirection(SwapDirection.OUT);
    store.setAmount(600);

    let executed = false;
    // mock the grpc unary function in order to know when the API request is executed
    injectIntoGrpcUnary(() => (executed = true));

    // use mock timers so the test doesn't actually need to run for 3 seconds
    jest.useFakeTimers();
    // run a loop in production and verify the delay
    Object.defineProperty(process, 'env', { get: () => ({ NODE_ENV: 'production' }) });

    store.requestSwap();
    jest.advanceTimersByTime(SWAP_ABORT_DELAY - 1);
    // the loop still should not have executed here
    expect(executed).toBe(false);
    // this should trigger the timeout at 3000
    jest.advanceTimersByTime(1);
    expect(executed).toBe(true);

    // reset the env and mock timers
    Object.defineProperty(process, 'env', { get: () => ({ NODE_ENV: 'test' }) });
    jest.useRealTimers();
  });

  it('should do nothing when abortSwap is called without requestSwap', async () => {
    const spy = jest.spyOn(window, 'clearTimeout');
    expect(store.processingTimeout).toBeUndefined();
    // run a loop in production and verify the delay
    store.abortSwap();
    expect(store.processingTimeout).toBeUndefined();
    expect(spy).not.toBeCalled();
    spy.mockClear();
  });
});
