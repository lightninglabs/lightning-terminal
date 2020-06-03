import { values } from 'mobx';
import { BuildSwapSteps, SwapDirection } from 'types/state';
import { grpc } from '@improbable-eng/grpc-web';
import { waitFor } from '@testing-library/react';
import Big from 'big.js';
import { injectIntoGrpcUnary } from 'util/tests';
import { BuildSwapStore, createStore, Store } from 'store';
import { SWAP_ABORT_DELAY } from 'store/stores/buildSwapStore';

const grpcMock = grpc as jest.Mocked<typeof grpc>;

describe('BuildSwapStore', () => {
  let rootStore: Store;
  let store: BuildSwapStore;

  beforeEach(async () => {
    rootStore = createStore();
    await rootStore.fetchAllData();
    store = rootStore.buildSwapStore;
  });

  it('should not start a swap if there are no channels', async () => {
    rootStore.channelStore.channels.clear();
    expect(store.currentStep).toBe(BuildSwapSteps.Closed);
    expect(rootStore.uiStore.alerts.size).toBe(0);
    await store.startSwap();
    expect(store.currentStep).toBe(BuildSwapSteps.Closed);
    expect(rootStore.uiStore.alerts.size).toBe(1);
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
    expect(store.terms.in).toEqual({ min: Big(0), max: Big(0) });
    expect(store.terms.out).toEqual({ min: Big(0), max: Big(0) });
    await store.getTerms();
    expect(store.terms.in).toEqual({ min: Big(250000), max: Big(1000000) });
    expect(store.terms.out).toEqual({ min: Big(250000), max: Big(1000000) });
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
    store.setAmount(Big(100));
    await store.getTerms();
    expect(+store.amount).toBe(625000);
    store.setAmount(Big(5000000));
    await store.getTerms();
    expect(+store.amount).toBe(625000);
    store.setAmount(Big(500000));
    await store.getTerms();
    expect(+store.amount).toBe(500000);
  });

  it('should fetch a loop in quote', async () => {
    expect(+store.quote.swapFee).toEqual(0);
    expect(+store.quote.minerFee).toEqual(0);
    expect(+store.quote.prepayAmount).toEqual(0);
    store.setDirection(SwapDirection.IN);
    store.setAmount(Big(600));
    await store.getQuote();
    expect(+store.quote.swapFee).toEqual(83);
    expect(+store.quote.minerFee).toEqual(7387);
    expect(+store.quote.prepayAmount).toEqual(1337);
  });

  it('should fetch a loop out quote', async () => {
    expect(+store.quote.swapFee).toEqual(0);
    expect(+store.quote.minerFee).toEqual(0);
    expect(+store.quote.prepayAmount).toEqual(0);
    store.setDirection(SwapDirection.OUT);
    store.setAmount(Big(600));
    await store.getQuote();
    expect(+store.quote.swapFee).toEqual(83);
    expect(+store.quote.minerFee).toEqual(7387);
    expect(+store.quote.prepayAmount).toEqual(1337);
  });

  it('should handle errors fetching loop quote', async () => {
    grpcMock.unary.mockImplementationOnce(desc => {
      if (desc.methodName === 'LoopOutQuote') throw new Error('test-err');
      return undefined as any;
    });
    store.setDirection(SwapDirection.OUT);
    store.setAmount(Big(600));
    expect(rootStore.uiStore.alerts.size).toBe(0);
    await store.getQuote();
    await waitFor(() => {
      expect(rootStore.uiStore.alerts.size).toBe(1);
      expect(values(rootStore.uiStore.alerts)[0].message).toBe('test-err');
    });
  });

  it('should perform a loop in', async () => {
    const channels = rootStore.channelStore.sortedChannels;
    // the pubkey in the sampleData is not valid, so hard-code this valid one
    channels[0].remotePubkey =
      '035c82e14eb74d2324daa17eebea8c58b46a9eabac87191cc83ee26275b514e6a0';
    store.toggleSelectedChannel(channels[0].chanId);
    store.setDirection(SwapDirection.IN);
    store.setAmount(Big(600));
    store.requestSwap();
    await waitFor(() => {
      expect(grpcMock.unary).toHaveBeenCalledWith(
        expect.objectContaining({ methodName: 'LoopIn' }),
        expect.any(Object),
      );
    });
  });

  it('should perform a loop out', async () => {
    const channels = rootStore.channelStore.sortedChannels;
    store.toggleSelectedChannel(channels[0].chanId);
    store.setDirection(SwapDirection.OUT);
    store.setAmount(Big(600));
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
    store.setAmount(Big(600));

    let deadline = 0;
    // mock the grpc unary function in order to capture the supplied deadline
    // passed in with the API request
    injectIntoGrpcUnary((desc, props) => {
      deadline = (props.request.toObject() as any).swapPublicationDeadline;
    });

    // run a loop on mainnet and verify the deadline
    rootStore.nodeStore.network = 'mainnet';
    store.requestSwap();
    await waitFor(() => expect(deadline).toBeGreaterThan(0));

    // inject again for the next swap
    injectIntoGrpcUnary((desc, props) => {
      deadline = (props.request.toObject() as any).swapPublicationDeadline;
    });

    // run a loop on regtest and verify the deadline
    rootStore.nodeStore.network = 'regtest';
    store.requestSwap();
    await waitFor(() => expect(deadline).toEqual(0));
  });

  it('should handle errors when performing a loop', async () => {
    grpcMock.unary.mockImplementationOnce(desc => {
      if (desc.methodName === 'LoopIn') throw new Error('test-err');
      return undefined as any;
    });
    store.setDirection(SwapDirection.IN);
    store.setAmount(Big(600));
    expect(rootStore.uiStore.alerts.size).toBe(0);
    store.requestSwap();
    await waitFor(() => {
      expect(rootStore.uiStore.alerts.size).toBe(1);
      expect(values(rootStore.uiStore.alerts)[0].message).toBe('test-err');
    });
  });

  it('should delay for 3 seconds before performing a swap in production', async () => {
    store.setDirection(SwapDirection.OUT);
    store.setAmount(Big(600));

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
