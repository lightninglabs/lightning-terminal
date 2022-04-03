import React from 'react';
import { runInAction } from 'mobx';
import { act, waitFor } from '@testing-library/react';
import Big from 'big.js';
import { formatSats } from 'util/formatters';
import { renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';
import BatchStats from 'components/pool/batches/BatchStats';

describe('BatchStats', () => {
  let store: Store;
  const o = { withSuffix: false };

  beforeEach(async () => {
    store = createStore();
    await store.orderStore.fetchOrders();
    await store.batchStore.fetchBatches();
    await store.batchStore.fetchNextBatchInfo();
  });

  const render = () => {
    return renderWithProviders(<BatchStats />, store);
  };

  it('should display the batch countdown', async () => {
    jest.useFakeTimers();
    runInAction(() => {
      const nowSecs = Math.ceil(Date.now() / 1000);
      store.batchStore.nextBatchTimestamp = Big(nowSecs + 90);
    });
    const { getByText } = render();
    expect(getByText('Next Batch')).toBeInTheDocument();
    expect(getByText('1m 30s')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(getByText('1m 29s')).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('should display the next fee rate', () => {
    const { getByText } = render();
    expect(getByText('Next Fee')).toBeInTheDocument();
    expect(getByText(`${store.batchesView.nextFeeRate}`)).toBeInTheDocument();
    runInAction(() => {
      store.batchStore.nextFeeRate = 25;
    });
    expect(getByText('25')).toBeInTheDocument();
  });

  it('should display the previous rate', () => {
    const { getByText } = render();
    expect(getByText('Previous Rate')).toBeInTheDocument();
    expect(getByText(`${store.batchesView.currentRate}`)).toBeInTheDocument();
    runInAction(() => {
      store.batchStore.batches.clear();
    });
    expect(getByText('0')).toBeInTheDocument();
  });

  it('should display the percent rate changed', () => {
    const { getByText } = render();
    expect(getByText('Change')).toBeInTheDocument();
    expect(getByText(`${store.batchesView.currentRateChange}%`)).toBeInTheDocument();
    runInAction(() => {
      store.batchStore.batches.clear();
    });
    expect(getByText(`0%`)).toBeInTheDocument();
  });

  it('should display the paid sats', () => {
    const { getByText } = render();
    expect(getByText('Earned')).toBeInTheDocument();
    expect(getByText(formatSats(store.orderStore.earnedSats, o))).toBeInTheDocument();
  });

  it('should display the previous rate', () => {
    const { getByText } = render();
    expect(getByText('Paid')).toBeInTheDocument();
    expect(getByText(formatSats(store.orderStore.paidSats, o))).toBeInTheDocument();
  });
});
