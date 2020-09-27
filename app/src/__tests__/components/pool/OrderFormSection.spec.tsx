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

  it('should display the Buy form fields', () => {
    const { getByText } = render();

    fireEvent.click(getByText('Buy'));

    expect(getByText('Place Order')).toBeInTheDocument();
    expect(getByText('Amount')).toBeInTheDocument();
    expect(getByText('Minimum Duration')).toBeInTheDocument();
    expect(getByText('Interest Rate')).toBeInTheDocument();
    expect(getByText('Place Buy Order')).toBeInTheDocument();
  });

  it('should display the Sell form fields', () => {
    const { getByText } = render();

    fireEvent.click(getByText('Sell'));

    expect(getByText('Place Order')).toBeInTheDocument();
    expect(getByText('Amount')).toBeInTheDocument();
    expect(getByText('Maximum Duration')).toBeInTheDocument();
    expect(getByText('Interest Rate')).toBeInTheDocument();
    expect(getByText('Place Sell Order')).toBeInTheDocument();
  });

  it('should submit a buy order', async () => {
    const { getByText, getByPlaceholderText } = render();

    fireEvent.change(getByPlaceholderText('500,000'), { target: { value: '1000000' } });
    fireEvent.change(getByPlaceholderText('2016'), { target: { value: '1008' } });
    fireEvent.change(getByPlaceholderText('0.5'), { target: { value: '1' } });
    fireEvent.change(getByPlaceholderText('253'), { target: { value: '255' } });

    let bid: Required<POOL.Bid.AsObject>;
    // capture the rate that is sent to the API
    injectIntoGrpcUnary((_, props) => {
      bid = (props.request.toObject() as any).bid;
    });

    fireEvent.click(getByText('Place Buy Order'));
    expect(bid!.details.amt).toBe(1000000);
    expect(bid!.minDurationBlocks).toBe(1008);
    expect(bid!.details.rateFixed).toBe(9920);
  });

  it('should submit a sell order', async () => {
    const { getByText, getByPlaceholderText } = render();

    fireEvent.click(getByText('Sell'));
    fireEvent.change(getByPlaceholderText('500,000'), { target: { value: '1000000' } });
    fireEvent.change(getByPlaceholderText('2016'), { target: { value: '1008' } });
    fireEvent.change(getByPlaceholderText('0.5'), { target: { value: '1' } });
    fireEvent.change(getByPlaceholderText('253'), { target: { value: '255' } });

    let ask: Required<POOL.Ask.AsObject>;
    // capture the rate that is sent to the API
    injectIntoGrpcUnary((_, props) => {
      ask = (props.request.toObject() as any).ask;
    });

    fireEvent.click(getByText('Place Sell Order'));
    expect(ask!.details.amt).toBe(1000000);
    expect(ask!.maxDurationBlocks).toBe(1008);
    expect(ask!.details.rateFixed).toBe(9920);
  });

  it('should display an error if order submission fails', async () => {
    const { getByText, findByText, getByPlaceholderText } = render();

    fireEvent.click(getByText('Sell'));
    fireEvent.change(getByPlaceholderText('500,000'), { target: { value: '1000000' } });
    fireEvent.change(getByPlaceholderText('2016'), { target: { value: '1008' } });
    fireEvent.change(getByPlaceholderText('0.5'), { target: { value: '1' } });
    fireEvent.change(getByPlaceholderText('253'), { target: { value: '255' } });

    injectIntoGrpcUnary(() => {
      throw new Error('test-error');
    });

    fireEvent.click(getByText('Place Sell Order'));
    expect(await findByText('Unable to submit the order')).toBeInTheDocument();
    expect(await findByText('test-error')).toBeInTheDocument();
  });

  it('should display info and error for amount field', () => {
    const { getByText, getByPlaceholderText } = render();

    fireEvent.change(getByPlaceholderText('500,000'), { target: { value: '100000' } });
    expect(getByText('100,000 sats')).toBeInTheDocument();
    fireEvent.change(getByPlaceholderText('500,000'), { target: { value: '1' } });
    expect(getByText('must be a multiple of 100,000')).toBeInTheDocument();

    fireEvent.change(getByPlaceholderText('500,000'), { target: { value: 'abc' } });
    expect(getByText('0 sats')).toBeInTheDocument();
  });

  it('should display info and error for duration field', () => {
    const { getByText, getByPlaceholderText } = render();

    fireEvent.change(getByPlaceholderText('2016'), { target: { value: '1008' } });
    expect(getByText('~1 week')).toBeInTheDocument();
    fireEvent.change(getByPlaceholderText('2016'), { target: { value: '4032' } });
    expect(getByText('~4 weeks')).toBeInTheDocument();
    fireEvent.change(getByPlaceholderText('2016'), { target: { value: '12096' } });
    expect(getByText('~2.8 months')).toBeInTheDocument();
  });

  it('should display info and error for interest rate field', () => {
    const { getByText, getByPlaceholderText } = render();

    fireEvent.change(getByPlaceholderText('500,000'), { target: { value: '1000000' } });
    fireEvent.change(getByPlaceholderText('2016'), { target: { value: '1008' } });
    fireEvent.change(getByPlaceholderText('0.5'), { target: { value: '1' } });

    expect(getByText('pay 10,000 sats (10 per block)')).toBeInTheDocument();
    fireEvent.change(getByPlaceholderText('0.5'), { target: { value: '2' } });
    expect(getByText('pay 20,000 sats (20 per block)')).toBeInTheDocument();
    fireEvent.change(getByPlaceholderText('0.5'), { target: { value: '0.1' } });
    expect(getByText('per block fixed rate of 0.99 is too small')).toBeInTheDocument();
  });

  it('should display info and error for interest rate field', () => {
    const { getByText, getByPlaceholderText } = render();

    fireEvent.change(getByPlaceholderText('500,000'), { target: { value: '1000000' } });
    fireEvent.change(getByPlaceholderText('2016'), { target: { value: '1008' } });
    fireEvent.change(getByPlaceholderText('0.5'), { target: { value: '1' } });
    fireEvent.change(getByPlaceholderText('253'), { target: { value: '252' } });

    expect(getByText('minimum 253 sats/kw')).toBeInTheDocument();
  });
});
