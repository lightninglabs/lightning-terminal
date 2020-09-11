import { values } from 'mobx';
import { grpc } from '@improbable-eng/grpc-web';
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
    index = 1;
    grpcMock.unary.mockImplementation((_, opts) => {
      const res = {
        ...poolBatchSnapshot,
        batchId: `${index++}${poolBatchSnapshot.batchId}`,
        prevBatchId: `${index++}${poolBatchSnapshot.prevBatchId}`,
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
    expect(store.selectedBatchId).toBeUndefined();

    await store.fetchBatches();
    expect(store.batches.size).toBe(BATCH_QUERY_LIMIT);
    expect(store.orderedIds.length).toBe(BATCH_QUERY_LIMIT);
    expect(store.selectedBatchId).toBeDefined();
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

  it('should handle errors when fetching batches', async () => {
    grpcMock.unary.mockImplementationOnce(() => {
      throw new Error('test-err');
    });
    expect(rootStore.uiStore.alerts.size).toBe(0);
    await store.fetchBatches();
    expect(rootStore.uiStore.alerts.size).toBe(1);
    expect(values(rootStore.uiStore.alerts)[0].message).toBe('test-err');
  });

  it('should fetch the latest batch', async () => {
    await store.fetchBatches();
    expect(store.orderedIds.length).toBe(BATCH_QUERY_LIMIT);

    index = 100;
    await store.fetchLatestBatch();
    expect(store.orderedIds.length).toBe(BATCH_QUERY_LIMIT + 1);
    expect(store.orderedIds[0]).toBe(`100${poolBatchSnapshot.batchId}`);
  });

  it('should handle errors when fetching the latest batch', async () => {
    grpcMock.unary.mockImplementationOnce(() => {
      throw new Error('test-err');
    });
    expect(rootStore.uiStore.alerts.size).toBe(0);
    await store.fetchLatestBatch();
    expect(rootStore.uiStore.alerts.size).toBe(1);
    expect(values(rootStore.uiStore.alerts)[0].message).toBe('test-err');
  });

  it('should return the sorted batches', async () => {
    await store.fetchBatches();
    expect(store.sortedBatches[0].batchId).toBe(`1${poolBatchSnapshot.batchId}`);
    expect(store.sortedBatches[BATCH_QUERY_LIMIT - 1].batchId).toBe(
      `39${poolBatchSnapshot.batchId}`,
    );

    index = 500;
    await store.fetchLatestBatch();
    expect(store.sortedBatches[0].batchId).toBe(`500${poolBatchSnapshot.batchId}`);
    expect(store.sortedBatches[BATCH_QUERY_LIMIT].batchId).toBe(
      `39${poolBatchSnapshot.batchId}`,
    );
  });
});
