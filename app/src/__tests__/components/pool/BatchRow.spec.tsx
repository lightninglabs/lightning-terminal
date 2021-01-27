import React from 'react';
import { formatSats } from 'util/formatters';
import { renderWithProviders } from 'util/tests';
import { poolBatchSnapshot } from 'util/tests/sampleData';
import { createStore, Store } from 'store';
import { Batch } from 'store/models';
import BatchRow from 'components/pool/batches/BatchRow';

describe('BatchRow', () => {
  let store: Store;
  let batch: Batch;

  beforeEach(async () => {
    store = createStore();
  });

  const render = () => {
    batch = new Batch(store, 2016, poolBatchSnapshot);
    return renderWithProviders(<BatchRow batch={batch} />, store);
  };

  it('should display the batch id', () => {
    const { getByText } = render();
    expect(getByText(batch.batchIdEllipsed)).toBeInTheDocument();
  });

  it('should display the batch txid', () => {
    const { getByText } = render();
    expect(getByText(batch.batchTxIdEllipsed)).toBeInTheDocument();
  });

  it('should display the batch tx fee', () => {
    const { getByText } = render();
    expect(getByText(batch.feeLabel)).toBeInTheDocument();
  });

  it('should display the number of orders', () => {
    const { getByText } = render();
    expect(getByText(batch.ordersCount.toString())).toBeInTheDocument();
  });

  it('should display the amount earned', () => {
    const { getByText } = render();
    const opts = { withSuffix: false };
    expect(getByText(formatSats(batch.earnedSats, opts))).toBeInTheDocument();
  });

  it('should display the batch volume', () => {
    const { getByText } = render();
    const opts = { withSuffix: false };
    expect(getByText(formatSats(batch.volume, opts))).toBeInTheDocument();
  });

  it('should display the batch rate', () => {
    const { getByText } = render();
    expect(getByText(`${batch.basisPoints} bps`)).toBeInTheDocument();
  });
});
