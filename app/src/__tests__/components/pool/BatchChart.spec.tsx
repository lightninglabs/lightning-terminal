import React from 'react';
import { renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';
import BatchChart from 'components/pool/batches/BatchChart';

describe('BatchChart', () => {
  let store: Store;

  beforeAll(() => {
    // hard-code the values of width & height for div elements, otherwise
    // the useSize hook will always return 0. Layout is not supported in jsdom
    window.HTMLDivElement.prototype.getBoundingClientRect = () =>
      ({ width: 1000, height: 1000 } as any);
  });

  beforeEach(async () => {
    store = createStore();
    await store.orderStore.fetchOrders();
    await store.batchStore.fetchBatches();
    await store.batchStore.fetchNextBatchInfo();
  });

  const render = () => {
    return renderWithProviders(<BatchChart />, store);
  };

  it('should display the axis labels', async () => {
    const { findByText } = render();
    expect(await findByText('volume')).toBeInTheDocument();
    expect(await findByText('# orders')).toBeInTheDocument();
  });
});
