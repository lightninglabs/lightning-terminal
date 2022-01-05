import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';
import BatchSection from 'components/pool/BatchSection';

describe('BatchSection', () => {
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
    await store.batchStore.fetchNodeTier();
  });

  const render = () => {
    return renderWithProviders(<BatchSection />, store);
  };

  it('should toggle between the chart and list views', async () => {
    const { getByText, findByText } = render();
    expect(await findByText('volume')).toBeInTheDocument();
    fireEvent.click(getByText('list.svg'));
    expect(getByText('Cleared Rate')).toBeInTheDocument();
    fireEvent.click(getByText('bar-chart.svg'));
    expect(await findByText('volume')).toBeInTheDocument();
  });

  it('should toggle between markets', async () => {
    const { getByText, findByText } = render();
    expect(store.batchStore.selectedLeaseDuration).toBe(2016);
    expect(await findByText('1 month')).toBeInTheDocument();
    fireEvent.click(getByText('1 month'));
    expect(store.batchStore.selectedLeaseDuration).toBe(4032);
  });
});
