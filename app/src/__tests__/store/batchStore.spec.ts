import { keys, runInAction, values } from 'mobx';
import * as AUCT from 'types/generated/auctioneerrpc/auctioneer_pb';
import { grpc } from '@improbable-eng/grpc-web';
import { waitFor } from '@testing-library/react';
import * as config from 'config';
import { b64, hex } from 'util/strings';
import { injectIntoGrpcUnary } from 'util/tests';
import {
  poolBatchSnapshot,
  poolLeaseDurations,
  sampleApiResponses,
} from 'util/tests/sampleData';
import { BatchStore, createStore, Store } from 'store';
import { BATCH_QUERY_LIMIT } from 'store/stores/batchStore';

const grpcMock = grpc as jest.Mocked<typeof grpc>;

describe('BatchStore', () => {
  let rootStore: Store;
  let store: BatchStore;
  let index: number;

  beforeEach(() => {
    rootStore = createStore();
    store = rootStore.batchStore;

    // mock the BatchSnapshot response to return a unique id for each batch
    // to avoid overwriting the same record in the store
    index = 0;
    grpcMock.unary.mockImplementation((desc, opts) => {
      let res: any;
      if (desc.methodName === 'BatchSnapshots') {
        const count = (opts.request.toObject() as any).numBatchesBack;
        res = {
          batchesList: [...Array(count)].map((_, i) => ({
            ...poolBatchSnapshot,
            batchId: `${index + i}-${poolBatchSnapshot.batchId}`,
            prevBatchId: `${index + i}-${poolBatchSnapshot.prevBatchId}`,
          })),
        };
        index += BATCH_QUERY_LIMIT;
      } else if (desc.methodName === 'LeaseDurations') {
        res = poolLeaseDurations;
      }
      opts.onEnd({
        status: grpc.Code.OK,
        message: { toObject: () => res },
      } as any);
      return undefined as any;
    });
  });

  it('should fetch batches', async () => {
    expect(store.batches.size).toBe(0);

    await store.fetchBatches();
    expect(store.batches.size).toBe(BATCH_QUERY_LIMIT);
  });

  it('should append start from the oldest batch when fetching batches multiple times', async () => {
    expect(store.batches.size).toBe(0);

    await store.fetchBatches();
    expect(store.batches.size).toBe(BATCH_QUERY_LIMIT);

    // calling a second time should append new batches to the list
    await store.fetchBatches();
    expect(store.batches.size).toBe(BATCH_QUERY_LIMIT * 2);
  });

  it('should handle a number of batches less than the query limit', async () => {
    // mock the BatchSnapshot response to return 5 batches with the last one having a
    // blank prevBatchId to signify that there are no more batches available
    grpcMock.unary.mockImplementation((desc, opts) => {
      let res: any;
      if (desc.methodName === 'BatchSnapshots') {
        res = {
          batchesList: [...Array(5)].map((_, i) => ({
            ...poolBatchSnapshot,
            batchId: b64(`${hex(poolBatchSnapshot.batchId)}0${i}`),
            prevBatchId: i < 4 ? b64(`${hex(poolBatchSnapshot.prevBatchId)}0${i}`) : '',
          })),
        };
        index += BATCH_QUERY_LIMIT;
      } else if (desc.methodName === 'LeaseDurations') {
        res = poolLeaseDurations;
      }
      opts.onEnd({
        status: grpc.Code.OK,
        message: { toObject: () => res },
      } as any);
      return undefined as any;
    });

    expect(store.batches.size).toBe(0);

    await store.fetchBatches();
    expect(store.batches.size).toBe(5);

    await store.fetchBatches();
    expect(store.batches.size).toBe(5);
  });

  it('should handle errors when fetching batches', async () => {
    grpcMock.unary.mockImplementation((desc, opts) => {
      if (desc.methodName === 'BatchSnapshots') {
        throw new Error('test-err');
      }
      opts.onEnd({
        status: grpc.Code.OK,
        message: { toObject: () => poolLeaseDurations },
      } as any);
      return undefined as any;
    });
    expect(rootStore.appView.alerts.size).toBe(0);
    await store.fetchBatches();
    expect(rootStore.appView.alerts.size).toBe(1);
    expect(values(rootStore.appView.alerts)[0].message).toBe('test-err');
  });

  it('should not show error when last snapshot is not found', async () => {
    grpcMock.unary.mockImplementation((desc, opts) => {
      if (desc.methodName === 'BatchSnapshots') {
        throw new Error('batch snapshot not found');
      }
      opts.onEnd({
        status: grpc.Code.OK,
        message: { toObject: () => poolLeaseDurations },
      } as any);
      return undefined as any;
    });
    expect(rootStore.appView.alerts.size).toBe(0);
    await store.fetchBatches();
    expect(rootStore.appView.alerts.size).toBe(0);
  });

  it('should fetch the latest batch', async () => {
    await store.fetchBatches();
    expect(store.batches.size).toBe(BATCH_QUERY_LIMIT);

    // return the same last batch to ensure no new data is added
    const lastBatchId = store.sortedBatches[0].batchId;
    index--;
    await store.fetchLatestBatch();
    expect(store.batches.size).toBe(BATCH_QUERY_LIMIT);
    expect(store.sortedBatches[0].batchId).toBe(lastBatchId);

    // return a new batch as the latest
    index = 100;
    await store.fetchLatestBatch();
    expect(store.batches.size).toBe(BATCH_QUERY_LIMIT + 1);
  });

  it('should handle errors when fetching the latest batch', async () => {
    grpcMock.unary.mockImplementationOnce(() => {
      throw new Error('test-err');
    });
    expect(rootStore.appView.alerts.size).toBe(0);
    await store.fetchLatestBatch();
    expect(rootStore.appView.alerts.size).toBe(1);
    expect(values(rootStore.appView.alerts)[0].message).toBe('test-err');
  });

  it('should return the sorted batches', async () => {
    await store.fetchBatches();
    expect(store.sortedBatches[0].batchId).toBe(hex(`0-${poolBatchSnapshot.batchId}`));
    expect(store.sortedBatches[BATCH_QUERY_LIMIT - 1].batchId).toBe(
      hex(`19-${poolBatchSnapshot.batchId}`),
    );

    index = 500;
    await store.fetchLatestBatch();
    expect(store.sortedBatches[0].batchId).toBe(hex(`500-${poolBatchSnapshot.batchId}`));
    expect(store.sortedBatches[BATCH_QUERY_LIMIT].batchId).toBe(
      hex(`19-${poolBatchSnapshot.batchId}`),
    );
  });

  it('should fetch lease durations', async () => {
    expect(store.leaseDurations.size).toBe(0);
    await store.fetchLeaseDurations();
    expect(store.leaseDurations.size).toBe(
      poolLeaseDurations.leaseDurationBucketsMap.length,
    );
    expect(store.selectedLeaseDuration).toBe(
      poolLeaseDurations.leaseDurationBucketsMap[0][0],
    );
  });

  it('should handle errors when fetching lease durations', async () => {
    grpcMock.unary.mockImplementationOnce(() => {
      throw new Error('test-err');
    });
    expect(rootStore.appView.alerts.size).toBe(0);
    await store.fetchLeaseDurations();
    expect(rootStore.appView.alerts.size).toBe(1);
    expect(values(rootStore.appView.alerts)[0].message).toBe('test-err');
  });

  it('should fetch node tier', async () => {
    // return sample data from gRPC requests instead of the batches defined in beforeEach()
    grpcMock.unary.mockImplementation((desc, opts) => {
      const path = `${desc.service.serviceName}.${desc.methodName}`;
      opts.onEnd({
        status: grpc.Code.OK,
        message: { toObject: () => sampleApiResponses[path] },
      } as any);
      return undefined as any;
    });

    await rootStore.nodeStore.fetchInfo();

    expect(store.nodeTier).toBeUndefined();
    await store.fetchNodeTier();
    expect(store.nodeTier).toBe(AUCT.NodeTier.TIER_1);

    // set the pubkey to a random value
    runInAction(() => {
      rootStore.nodeStore.pubkey = 'asdf';
    });
    await store.fetchNodeTier();
    // confirm the tier is set to T0 if the pubkey is not found in the response
    expect(store.nodeTier).toBe(AUCT.NodeTier.TIER_0);
  });

  it('should handle errors when fetching node tier', async () => {
    grpcMock.unary.mockImplementationOnce(() => {
      throw new Error('test-err');
    });
    expect(rootStore.appView.alerts.size).toBe(0);
    await store.fetchNodeTier();
    expect(rootStore.appView.alerts.size).toBe(1);
    expect(values(rootStore.appView.alerts)[0].message).toBe('test-err');
  });

  it('should set the active market', async () => {
    expect(store.selectedLeaseDuration).toBe(0);
    await store.fetchBatches();
    expect(store.selectedLeaseDuration).toBe(2016);
    expect(keys(store.leaseDurations)).toEqual([2016, 4032, 6048, 8064]);
    store.setActiveMarket(4032);
    expect(store.selectedLeaseDuration).toBe(4032);
    store.setActiveMarket(5000);
    expect(store.selectedLeaseDuration).toBe(4032);
    expect(rootStore.appView.alerts.size).toBe(1);
  });

  it('should start and stop polling', async () => {
    let callCount = 0;
    injectIntoGrpcUnary(desc => {
      if (desc.methodName === 'BatchSnapshots') callCount++;
    });

    // allow polling in this test
    Object.defineProperty(config, 'IS_TEST', { get: () => false });
    jest.useFakeTimers();
    jest.spyOn(global, 'setInterval');

    store.startPolling();
    expect(setInterval).toBeCalled();
    expect(callCount).toBe(0);
    // fast forward 1 minute
    jest.advanceTimersByTime(60 * 1000);
    await waitFor(() => {
      expect(callCount).toBe(1);
    });

    jest.spyOn(global, 'clearInterval');
    store.stopPolling();
    expect(clearInterval).toBeCalled();
    // fast forward 1 more minute
    jest.advanceTimersByTime(120 * 1000);
    expect(callCount).toBe(1);

    // revert IS_TEST
    Object.defineProperty(config, 'IS_TEST', { get: () => true });
    jest.useRealTimers();
  });
});
