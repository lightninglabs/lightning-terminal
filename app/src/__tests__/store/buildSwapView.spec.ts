import { values } from 'mobx';
import { BuildSwapSteps, SwapDirection } from 'types/state';
import { grpc } from '@improbable-eng/grpc-web';
import { waitFor } from '@testing-library/react';
import Big from 'big.js';
import { BalanceMode } from 'util/constants';
import { injectIntoGrpcUnary } from 'util/tests';
import { lndChannel, loopInTerms, loopOutTerms } from 'util/tests/sampleData';
import { createStore, Store } from 'store';
import { Channel } from 'store/models';
import { BuildSwapView } from 'store/views';
import { SWAP_ABORT_DELAY } from 'store/views/buildSwapView';

const grpcMock = grpc as jest.Mocked<typeof grpc>;

describe('BuildSwapView', () => {
  let rootStore: Store;
  let store: BuildSwapView;

  beforeEach(async () => {
    rootStore = createStore();
    await rootStore.fetchAllData();
    store = rootStore.buildSwapView;
  });

  it('should not start a swap if there are no channels', async () => {
    rootStore.channelStore.channels.clear();
    expect(store.currentStep).toBe(BuildSwapSteps.Closed);
    expect(rootStore.appView.alerts.size).toBe(0);
    await store.startSwap();
    expect(store.currentStep).toBe(BuildSwapSteps.Closed);
    expect(rootStore.appView.alerts.size).toBe(1);
  });

  it('should toggle the selected channels', () => {
    expect(store.selectedChanIds).toHaveLength(0);
    store.toggleSelectedChannel('test');
    expect(store.selectedChanIds).toHaveLength(1);
    store.toggleSelectedChannel('test');
    expect(store.selectedChanIds).toHaveLength(0);
  });

  it('should infer the swap direction based on the selected channels (receiving mode)', () => {
    rootStore.settingsStore.setBalanceMode(BalanceMode.receive);
    const channels = rootStore.channelStore.sortedChannels;
    store.toggleSelectedChannel(channels[0].chanId);
    expect(store.inferredDirection).toEqual(SwapDirection.OUT);
    store.toggleSelectedChannel(channels[channels.length - 1].chanId);
    expect(store.inferredDirection).toEqual(SwapDirection.OUT);
  });

  it('should infer the swap direction based on the selected channels (sending mode)', () => {
    rootStore.settingsStore.setBalanceMode(BalanceMode.send);
    const channels = rootStore.channelStore.sortedChannels;
    store.toggleSelectedChannel(channels[0].chanId);
    expect(store.inferredDirection).toEqual(SwapDirection.IN);
    store.toggleSelectedChannel(channels[channels.length - 1].chanId);
    expect(store.inferredDirection).toEqual(SwapDirection.IN);
  });

  it('should infer the swap direction based on the selected channels (routing mode)', () => {
    rootStore.settingsStore.setBalanceMode(BalanceMode.routing);
    const channels = rootStore.channelStore.sortedChannels;
    let c = channels[0];
    c.localBalance = c.capacity.mul(0.2);
    c.remoteBalance = c.capacity.sub(c.localBalance);
    store.toggleSelectedChannel(c.chanId);
    expect(store.inferredDirection).toEqual(SwapDirection.IN);

    c = channels[channels.length - 1];
    c.localBalance = c.capacity.mul(0.85);
    c.remoteBalance = c.capacity.sub(c.localBalance);
    store.toggleSelectedChannel(channels[channels.length - 1].chanId);
    expect(store.inferredDirection).toEqual(SwapDirection.OUT);
  });

  it('should not infer the swap direction with no selected channels (routing mode)', () => {
    rootStore.settingsStore.setBalanceMode(BalanceMode.routing);
    expect(store.inferredDirection).toBeUndefined();
  });

  it('should fetch loop terms', async () => {
    expect(store.terms.in).toEqual({ min: Big(0), max: Big(0) });
    expect(store.terms.out).toEqual({ min: Big(0), max: Big(0) });
    await store.getTerms();
    expect(store.terms.in).toEqual({ min: Big(250000), max: Big(1000000) });
    expect(store.terms.out).toEqual({
      min: Big(250000),
      max: Big(1000000),
      minCltv: 20,
      maxCltv: 60,
    });
  });

  it('should handle errors fetching loop terms', async () => {
    grpcMock.unary.mockImplementationOnce(desc => {
      if (desc.methodName === 'GetLoopInTerms') throw new Error('test-err');
      return undefined as any;
    });
    expect(rootStore.appView.alerts.size).toBe(0);
    await store.getTerms();
    await waitFor(() => {
      expect(rootStore.appView.alerts.size).toBe(1);
      expect(values(rootStore.appView.alerts)[0].message).toBe('test-err');
    });
  });

  it('should return the amount in between min/max by default', async () => {
    await store.getTerms();
    expect(+store.amountForSelected).toBe(625000);
  });

  it('should ensure amount is greater than the min terms', async () => {
    store.setAmount(Big(loopInTerms.minSwapAmount).sub(100));
    await store.getTerms();
    expect(store.amountForSelected.toString()).toBe(loopInTerms.minSwapAmount);
  });

  it('should ensure amount is less than the max terms', async () => {
    store.setAmount(Big(loopInTerms.maxSwapAmount + 100));
    await store.getTerms();
    expect(store.amountForSelected.toString()).toBe(loopInTerms.maxSwapAmount);
  });

  it('should validate the conf target', async () => {
    const { minCltvDelta, maxCltvDelta } = loopOutTerms;
    expect(store.confTarget).toBeUndefined();

    let target = maxCltvDelta - 10;
    store.setConfTarget(target);
    expect(store.confTarget).toBe(target);

    store.setDirection(SwapDirection.OUT);
    await store.getTerms();

    store.setConfTarget(target);
    expect(store.confTarget).toBe(target);

    target = minCltvDelta - 10;
    expect(() => store.setConfTarget(target)).toThrow();

    target = maxCltvDelta + 10;
    expect(() => store.setConfTarget(target)).toThrow();
  });

  it('should submit the Loop Out conf target', async () => {
    const target = 23;
    store.setDirection(SwapDirection.OUT);
    store.setAmount(Big(500000));

    expect(store.confTarget).toBeUndefined();
    store.setConfTarget(target);
    expect(store.confTarget).toBe(target);

    let reqTarget = '';
    // mock the grpc unary function in order to capture the supplied dest
    // passed in with the API request
    injectIntoGrpcUnary((desc, props) => {
      reqTarget = (props.request.toObject() as any).sweepConfTarget;
    });

    store.requestSwap();
    await waitFor(() => expect(reqTarget).toBe(target));
  });

  it('should submit the Loop Out address', async () => {
    const addr = 'xyzabc';
    store.setDirection(SwapDirection.OUT);
    store.setAmount(Big(500000));

    expect(store.loopOutAddress).toBeUndefined();
    store.setLoopOutAddress(addr);
    expect(store.loopOutAddress).toBe(addr);
    // store.goToNextStep();

    let reqAddr = '';
    // mock the grpc unary function in order to capture the supplied dest
    // passed in with the API request
    injectIntoGrpcUnary((desc, props) => {
      reqAddr = (props.request.toObject() as any).dest;
    });

    store.requestSwap();
    await waitFor(() => expect(reqAddr).toBe(addr));
  });

  it('should select all channels with the same peer for loop in', () => {
    const channels = rootStore.channelStore.sortedChannels;
    channels[1].remotePubkey = channels[0].remotePubkey;
    channels[2].remotePubkey = channels[0].remotePubkey;
    expect(store.selectedChanIds).toHaveLength(0);
    store.toggleSelectedChannel(channels[0].chanId);
    store.setDirection(SwapDirection.IN);
    expect(store.selectedChanIds).toHaveLength(3);
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
    expect(+store.quote.prepayAmount).toEqual(0);
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
    expect(rootStore.appView.alerts.size).toBe(0);
    await store.getQuote();
    await waitFor(() => {
      expect(rootStore.appView.alerts.size).toBe(1);
      expect(values(rootStore.appView.alerts)[0].message).toBe('test-err');
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

  it('should store swapped channels after a loop in', async () => {
    const channels = rootStore.channelStore.sortedChannels;
    // the pubkey in the sampleData is not valid, so hard-code this valid one
    channels[0].remotePubkey =
      '035c82e14eb74d2324daa17eebea8c58b46a9eabac87191cc83ee26275b514e6a0';
    store.toggleSelectedChannel(channels[0].chanId);
    store.setDirection(SwapDirection.IN);
    store.setAmount(Big(600));
    expect(rootStore.swapStore.swappedChannels.size).toBe(0);
    store.requestSwap();
    await waitFor(() => expect(store.currentStep).toBe(BuildSwapSteps.Closed));
    expect(rootStore.swapStore.swappedChannels.size).toBe(1);
  });

  it('should store swapped channels after a loop out', async () => {
    const channels = rootStore.channelStore.sortedChannels;
    store.toggleSelectedChannel(channels[0].chanId);
    store.setDirection(SwapDirection.OUT);
    store.setAmount(Big(600));
    expect(rootStore.swapStore.swappedChannels.size).toBe(0);
    store.requestSwap();
    await waitFor(() => expect(store.currentStep).toBe(BuildSwapSteps.Closed));
    expect(rootStore.swapStore.swappedChannels.size).toBe(1);
  });

  it('should set the correct swap deadline in production', async () => {
    store.setDirection(SwapDirection.OUT);
    store.setAmount(Big(600));

    let deadline = '';
    // mock the grpc unary function in order to capture the supplied deadline
    // passed in with the API request
    injectIntoGrpcUnary((desc, props) => {
      deadline = (props.request.toObject() as any).swapPublicationDeadline;
    });

    // run a loop on mainnet and verify the deadline
    rootStore.nodeStore.network = 'mainnet';
    store.requestSwap();
    await waitFor(() => expect(+deadline).toBeGreaterThan(0));

    // inject again for the next swap
    injectIntoGrpcUnary((desc, props) => {
      deadline = (props.request.toObject() as any).swapPublicationDeadline;
    });

    // run a loop on regtest and verify the deadline
    rootStore.nodeStore.network = 'regtest';
    store.requestSwap();
    await waitFor(() => expect(+deadline).toEqual(0));
  });

  it('should handle errors when performing a loop', async () => {
    grpcMock.unary.mockImplementationOnce(desc => {
      if (desc.methodName === 'LoopIn') throw new Error('test-err');
      return undefined as any;
    });
    store.setDirection(SwapDirection.IN);
    store.setAmount(Big(600));
    expect(rootStore.appView.alerts.size).toBe(0);
    store.requestSwap();
    await waitFor(() => {
      expect(rootStore.appView.alerts.size).toBe(1);
      expect(values(rootStore.appView.alerts)[0].message).toBe('test-err');
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

  describe('min/max swap limits', () => {
    const addChannel = (capacity: number, localBalance: number) => {
      const remoteBalance = capacity - localBalance;
      const lndChan = {
        ...lndChannel,
        capacity: `${capacity}`,
        localBalance: `${localBalance}`,
        remoteBalance: `${remoteBalance}`,
      };
      const channel = Channel.create(rootStore, lndChan);
      channel.chanId = `${channel.chanId}${rootStore.channelStore.channels.size}`;
      channel.remotePubkey = `${channel.remotePubkey}${rootStore.channelStore.channels.size}`;
      rootStore.channelStore.channels.set(channel.chanId, channel);
    };

    const round = (amount: number) => {
      return Math.floor(amount / store.AMOUNT_INCREMENT) * store.AMOUNT_INCREMENT;
    };

    beforeEach(() => {
      rootStore.channelStore.channels.clear();
      [
        { capacity: 200000, local: 100000 },
        { capacity: 100000, local: 50000 },
        { capacity: 100000, local: 20000 },
      ].forEach(({ capacity, local }) => addChannel(capacity, local));
    });

    it('should limit Loop In max based on all remote balances', async () => {
      await store.getTerms();
      store.setDirection(SwapDirection.IN);
      // should be the sum of all remote balances minus the reserve
      expect(+store.termsForDirection.max).toBe(round(230000 * 0.99));
    });

    it('should limit Loop In max based on selected remote balances', async () => {
      store.toggleSelectedChannel(store.channels[0].chanId);
      store.toggleSelectedChannel(store.channels[1].chanId);
      await store.getTerms();
      store.setDirection(SwapDirection.IN);
      // should be the sum of the first two remote balances minus the reserve
      expect(+store.termsForDirection.max).toBe(round(150000 * 0.99));
    });

    it('should limit Loop Out max based on all local balances', async () => {
      await store.getTerms();
      store.setDirection(SwapDirection.OUT);
      // should be the sum of all local balances minus the reserve
      expect(+store.termsForDirection.max).toBe(round(170000 * 0.99));
    });

    it('should limit Loop Out max based on selected local balances', async () => {
      store.toggleSelectedChannel(store.channels[0].chanId);
      store.toggleSelectedChannel(store.channels[1].chanId);
      await store.getTerms();
      store.setDirection(SwapDirection.OUT);
      // should be the sum of the first two local balances minus the reserve
      expect(+store.termsForDirection.max).toBe(round(150000 * 0.99));
    });
  });
});
