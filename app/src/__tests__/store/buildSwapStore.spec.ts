import { SwapDirection } from 'types/state';
import { grpc } from '@improbable-eng/grpc-web';
import { waitFor } from '@testing-library/react';
import * as config from 'config';
import { sampleApiResponses } from 'util/tests/sampleData';
import { BuildSwapStore, createStore } from 'store';

const grpcMock = grpc as jest.Mocked<typeof grpc>;

describe('SwapStore', () => {
  let store: BuildSwapStore;

  beforeEach(() => {
    store = createStore().buildSwapStore;
  });

  it('should toggle the selected channels', () => {
    expect(store.selectedChanIds).toHaveLength(0);
    store.toggleSelectedChannel('test');
    expect(store.selectedChanIds).toHaveLength(1);
    store.toggleSelectedChannel('test');
    expect(store.selectedChanIds).toHaveLength(0);
  });

  it('should fetch loop terms', async () => {
    expect(store.terms.in).toEqual({ min: 0, max: 0 });
    expect(store.terms.out).toEqual({ min: 0, max: 0 });
    await store.getTerms();
    expect(store.terms.in).toEqual({ min: 250000, max: 1000000 });
    expect(store.terms.out).toEqual({ min: 250000, max: 1000000 });
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
    // mock the grpc unary function in order to capture the supplied deadline
    // passed in with the API request
    let deadline = 0;
    grpcMock.unary.mockImplementation((desc, props) => {
      deadline = (props.request.toObject() as any).swapPublicationDeadline;
      const path = `${desc.service.serviceName}.${desc.methodName}`;
      // return a response by calling the onEnd function
      props.onEnd({
        status: 0,
        statusMessage: '',
        // the message returned should have a toObject function
        message: {
          toObject: () => sampleApiResponses[path],
        } as any,
        headers: {} as any,
        trailers: {} as any,
      });
      return undefined as any;
    });

    // run a loop in production and verify the deadline
    Object.defineProperty(config, 'IS_PROD', { get: () => true });
    store.requestSwap();
    await waitFor(() => expect(deadline).toBeGreaterThan(0));

    // run a loop not in production and verify the deadline
    Object.defineProperty(config, 'IS_PROD', { get: () => false });
    store.requestSwap();
    await waitFor(() => expect(deadline).toEqual(0));
  });

  it('should handle loop errors', async () => {
    grpcMock.unary.mockImplementation(desc => {
      if (desc.methodName === 'LoopIn') throw new Error('asdf');
      return undefined as any;
    });
    store.setDirection(SwapDirection.IN);
    store.setAmount(600);

    expect(store.swapError).toBeUndefined();
    store.requestSwap();
    await waitFor(() => {
      expect(store.swapError).toBeDefined();
    });
  });

  it('should delay for 3 seconds before performing a swap in production', async () => {
    store.setDirection(SwapDirection.OUT);
    store.setAmount(600);
    // mock the grpc unary function in order to time the delay of the API request
    const start = Date.now();
    let delay = 0;
    grpcMock.unary.mockImplementation((desc, props) => {
      delay = Date.now() - start;
      const path = `${desc.service.serviceName}.${desc.methodName}`;
      // return a response by calling the onEnd function
      props.onEnd({
        status: 0,
        statusMessage: '',
        // the message returned should have a toObject function
        message: {
          toObject: () => sampleApiResponses[path],
        } as any,
        headers: {} as any,
        trailers: {} as any,
      });
      return undefined as any;
    });

    // run a loop in production and verify the delay
    Object.defineProperty(process.env, 'NODE_ENV', { get: () => 'production' });
    store.requestSwap();
    await waitFor(
      () => {
        expect(delay).toBeGreaterThan(2900);
        expect(delay).toBeLessThan(3100);
      },
      { timeout: 3500 },
    );
    Object.defineProperty(process.env, 'NODE_ENV', { get: () => 'test' });
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
