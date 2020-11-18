import { values } from 'mobx';
import { grpc } from '@improbable-eng/grpc-web';
import { waitFor } from '@testing-library/react';
import * as config from 'config';
import { hex } from 'util/strings';
import { injectIntoGrpcUnary } from 'util/tests';
import { poolBatchSnapshot } from 'util/tests/sampleData';
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
    grpcMock.unary.mockImplementation((_, opts) => {
      index++;
      const res = {
        ...poolBatchSnapshot,
        batchId: `${index}-${poolBatchSnapshot.batchId}`,
        prevBatchId: `${index}-${poolBatchSnapshot.prevBatchId}`,
      };
      opts.onEnd({
        status: grpc.Code.OK,
        message: { toObject: () => res },
      } as any);
      return undefined as any;
    });
  });

  it('should fetch batches', async () => {
    expect(store.batches.size).toBe(0);
    expect(store.orderedIds.length).toBe(0);

    await store.fetchBatches();
    expect(store.batches.size).toBe(BATCH_QUERY_LIMIT);
    expect(store.orderedIds.length).toBe(BATCH_QUERY_LIMIT);
  });

  it('should append start from the oldest batch when fetching batches multiple times', async () => {
    expect(store.batches.size).toBe(0);
    expect(store.orderedIds.length).toBe(0);

    await store.fetchBatches();
    expect(store.batches.size).toBe(BATCH_QUERY_LIMIT);
    expect(store.orderedIds.length).toBe(BATCH_QUERY_LIMIT);

    // calling a second time should append new batches to the list
    await store.fetchBatches();
    expect(store.batches.size).toBe(BATCH_QUERY_LIMIT * 2);
    expect(store.orderedIds.length).toBe(BATCH_QUERY_LIMIT * 2);
  });

  it('should handle a number of batches less than the query limit', async () => {
    // mock the BatchSnapshot response to return a unique id for for the
    // first 5 batches, then return a blank prevBatchId to signify that
    // there are no more batches available
    index = 0;
    grpcMock.unary.mockImplementation((_, opts) => {
      index++;
      const res = {
        ...poolBatchSnapshot,
        batchId: `${index}${poolBatchSnapshot.batchId}`,
        prevBatchId: index < 5 ? `${index}${poolBatchSnapshot.prevBatchId}` : '',
      };
      opts.onEnd({
        status: grpc.Code.OK,
        message: { toObject: () => res },
      } as any);
      return undefined as any;
    });

    expect(store.batches.size).toBe(0);

    await store.fetchBatches();
    expect(store.batches.size).toBe(5);
  });

  it('should handle errors when fetching batches', async () => {
    grpcMock.unary.mockImplementationOnce(() => {
      throw new Error('test-err');
    });
    expect(rootStore.appView.alerts.size).toBe(0);
    await store.fetchBatches();
    expect(rootStore.appView.alerts.size).toBe(1);
    expect(values(rootStore.appView.alerts)[0].message).toBe('test-err');
  });

  it('should not show error when last snapshot is not found', async () => {
    grpcMock.unary.mockImplementationOnce(() => {
      throw new Error('batch snapshot not found');
    });
    expect(rootStore.appView.alerts.size).toBe(0);
    await store.fetchBatches();
    expect(rootStore.appView.alerts.size).toBe(0);
  });

  it('should fetch the latest batch', async () => {
    await store.fetchBatches();
    expect(store.orderedIds.length).toBe(BATCH_QUERY_LIMIT);

    // return the same last batch to ensure no new data is added
    const lastBatchId = store.sortedBatches[0].batchId;
    index--;
    await store.fetchLatestBatch();
    expect(store.orderedIds.length).toBe(BATCH_QUERY_LIMIT);
    expect(store.sortedBatches[0].batchId).toBe(lastBatchId);

    // return a new batch as the latest
    index = 100;
    await store.fetchLatestBatch();
    expect(store.orderedIds.length).toBe(BATCH_QUERY_LIMIT + 1);
    expect(store.orderedIds[0]).toBe(hex(`101-${poolBatchSnapshot.batchId}`));
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
    expect(store.sortedBatches[0].batchId).toBe(hex(`1-${poolBatchSnapshot.batchId}`));
    expect(store.sortedBatches[BATCH_QUERY_LIMIT - 1].batchId).toBe(
      hex(`20-${poolBatchSnapshot.batchId}`),
    );

    index = 500;
    await store.fetchLatestBatch();
    expect(store.sortedBatches[0].batchId).toBe(hex(`501-${poolBatchSnapshot.batchId}`));
    expect(store.sortedBatches[BATCH_QUERY_LIMIT].batchId).toBe(
      hex(`20-${poolBatchSnapshot.batchId}`),
    );
  });

  it('should start and stop polling', async () => {
    let callCount = 0;
    injectIntoGrpcUnary(desc => {
      if (desc.methodName === 'BatchSnapshot') callCount++;
    });

    // allow polling in this test
    Object.defineProperty(config, 'IS_TEST', { get: () => false });
    jest.useFakeTimers();

    store.startPolling();
    expect(window.setInterval).toBeCalled();
    expect(callCount).toBe(0);
    // fast forward 1 minute
    jest.runTimersToTime(60 * 1000);
    await waitFor(() => {
      expect(callCount).toBe(1);
    });

    store.stopPolling();
    expect(window.clearInterval).toBeCalled();
    // fast forward 1 more minute
    jest.runTimersToTime(120 * 1000);
    expect(callCount).toBe(1);

    // revert IS_TEST
    Object.defineProperty(config, 'IS_TEST', { get: () => true });
    jest.useRealTimers();
  });
});
