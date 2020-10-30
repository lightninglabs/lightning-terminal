/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';
import * as POOL from 'types/generated/trader_pb';
import { fireEvent } from '@testing-library/react';
import { injectIntoGrpcUnary, renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';
import OrderFormSection from 'components/pool/OrderFormSection';

describe('OrderFormSection', () => {
  let store: Store;

  beforeEach(async () => {
    store = createStore();
    await store.accountStore.fetchAccounts();
    await store.orderStore.fetchOrders();
  });

  const render = () => {
    return renderWithProviders(<OrderFormSection />, store);
  };

  it('should display the Bid form fields', () => {
    const { getByText } = render();

    fireEvent.click(getByText('Bid'));

    expect(getByText('Desired Inbound Liquidity')).toBeInTheDocument();
    expect(getByText('Bid Premium')).toBeInTheDocument();
    expect(getByText('Minimum Channel Size')).toBeInTheDocument();
    expect(getByText('Place Bid Order')).toBeInTheDocument();
  });

  it('should display the Ask form fields', () => {
    const { getByText } = render();

    fireEvent.click(getByText('Ask'));

    expect(getByText('Offered Outbound Liquidity')).toBeInTheDocument();
    expect(getByText('Ask Premium')).toBeInTheDocument();
    expect(getByText('Minimum Channel Size')).toBeInTheDocument();
    expect(getByText('Place Ask Order')).toBeInTheDocument();
  });

  it('should submit a bid order', async () => {
    const { getByText, getByPlaceholderText } = render();

    fireEvent.change(getByPlaceholderText('500,000'), { target: { value: '1000000' } });
    fireEvent.change(getByPlaceholderText('5,000'), { target: { value: '10000' } });
    fireEvent.change(getByPlaceholderText('100,000'), { target: { value: '100000' } });
    fireEvent.change(getByPlaceholderText('253'), { target: { value: '255' } });

    let bid: Required<POOL.Bid.AsObject>;
    // capture the rate that is sent to the API
    injectIntoGrpcUnary((_, props) => {
      bid = (props.request.toObject() as any).bid;
    });

    fireEvent.click(getByText('Place Bid Order'));
    expect(bid!.details.amt).toBe(1000000);
    expect(bid!.details.rateFixed).toBe(4960);
    expect(bid!.details.minUnitsMatch).toBe(1);
    expect(bid!.leaseDurationBlocks).toBe(2016);
    expect(bid!.details.maxBatchFeeRateSatPerKw).toBe(255);
  });

  it('should submit an ask order', async () => {
    const { getByText, getByPlaceholderText } = render();

    fireEvent.click(getByText('Ask'));
    fireEvent.change(getByPlaceholderText('500,000'), { target: { value: '1000000' } });
    fireEvent.change(getByPlaceholderText('5,000'), { target: { value: '10000' } });
    fireEvent.change(getByPlaceholderText('100,000'), { target: { value: '100000' } });
    fireEvent.change(getByPlaceholderText('253'), { target: { value: '255' } });

    let ask: Required<POOL.Ask.AsObject>;
    // capture the rate that is sent to the API
    injectIntoGrpcUnary((_, props) => {
      ask = (props.request.toObject() as any).ask;
    });

    fireEvent.click(getByText('Place Ask Order'));
    expect(ask!.details.amt).toBe(1000000);
    expect(ask!.details.rateFixed).toBe(4960);
    expect(ask!.details.minUnitsMatch).toBe(1);
    expect(ask!.leaseDurationBlocks).toBe(2016);
    expect(ask!.details.maxBatchFeeRateSatPerKw).toBe(255);
  });

  it('should display an error if order submission fails', async () => {
    const { getByText, findByText, getByPlaceholderText } = render();

    fireEvent.click(getByText('Ask'));
    fireEvent.change(getByPlaceholderText('500,000'), { target: { value: '1000000' } });
    fireEvent.change(getByPlaceholderText('5,000'), { target: { value: '10000' } });
    fireEvent.change(getByPlaceholderText('100,000'), { target: { value: '100000' } });
    fireEvent.change(getByPlaceholderText('253'), { target: { value: '255' } });

    injectIntoGrpcUnary(() => {
      throw new Error('test-error');
    });

    fireEvent.click(getByText('Place Ask Order'));
    expect(await findByText('Unable to submit the order')).toBeInTheDocument();
    expect(await findByText('test-error')).toBeInTheDocument();
  });

  it('should display an error for amount field', () => {
    const { getByText, getByPlaceholderText } = render();

    fireEvent.change(getByPlaceholderText('500,000'), { target: { value: '1' } });
    expect(getByText('must be a multiple of 100,000')).toBeInTheDocument();
  });

  it('should display an error for min chan size field', () => {
    const { getByText, getByPlaceholderText } = render();

    fireEvent.change(getByPlaceholderText('100,000'), { target: { value: '1' } });
    expect(getByText('must be a multiple of 100,000')).toBeInTheDocument();

    fireEvent.change(getByPlaceholderText('500,000'), { target: { value: '1000000' } });
    fireEvent.change(getByPlaceholderText('100,000'), { target: { value: '1100000' } });
    expect(getByText('must be less than liquidity amount')).toBeInTheDocument();
  });

  it('should display an error for batch fee rate field', () => {
    const { getByText, getByPlaceholderText } = render();

    fireEvent.change(getByPlaceholderText('253'), { target: { value: '1' } });
    expect(getByText('minimum 253 sats/kw')).toBeInTheDocument();
  });
});
