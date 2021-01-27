import React from 'react';
import { runInAction } from 'mobx';
import { fireEvent, waitFor } from '@testing-library/react';
import Big from 'big.js';
import { hex } from 'util/strings';
import { injectIntoGrpcUnary, renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';
import OrderListSection from 'components/pool/OrderListSection';

describe('OrderListSection', () => {
  let store: Store;

  beforeEach(async () => {
    store = createStore();
    await store.nodeStore.fetchInfo();
    await store.nodeStore.fetchBalances();
    await store.channelStore.fetchChannels();
    await store.accountStore.fetchAccounts();
    await store.orderStore.fetchOrders();
  });

  const render = () => {
    return renderWithProviders(<OrderListSection />, store);
  };

  it('should display a list of open orders', () => {
    const { getByText } = render();

    expect(getByText('Orders')).toBeInTheDocument();
    expect(store.orderListView.filter).toBe('open');
    store.orderListView.orders.forEach(o => {
      expect(getByText(o.basisPoints.toString())).toBeInTheDocument();
      expect(getByText(o.stateWithCount)).toBeInTheDocument();
      expect(getByText(o.createdOnLabel)).toBeInTheDocument();
    });
  });

  it('should filter the list of orders', () => {
    const { getByText, getAllByText } = render();

    expect(store.orderListView.filter).toBe('open');
    fireEvent.click(getByText('Filled'));
    expect(store.orderListView.filter).toBe('filled');
    store.orderListView.orders.forEach(o => {
      expect(getByText(o.type)).toBeInTheDocument();
      expect(getByText(o.createdOnLabel)).toBeInTheDocument();
    });

    fireEvent.click(getByText('All'));
    expect(store.orderListView.filter).toBe('');
    expect(getAllByText('Bid')).toHaveLength(4);
    expect(getAllByText('Ask')).toHaveLength(1);

    fireEvent.click(getByText('Open', { selector: 'button' }));
    expect(store.orderListView.filter).toBe('open');
  });

  it('should cancel an open order', async () => {
    const { getAllByText } = render();

    let nonce: string;
    injectIntoGrpcUnary((_, props) => {
      nonce = (props.request.toObject() as any).orderNonce;
    });

    expect(getAllByText('close.svg')).toHaveLength(2);
    fireEvent.click(getAllByText('close.svg')[0]);

    await waitFor(() => {
      expect(hex(nonce)).toBe(store.orderListView.orders[0].nonce);
    });
  });

  it.each<[string, number[]]>([
    ['Type', [2, 0, 6, 9, 3]],
    ['Liquidity', [3, 9, 0, 2, 6]],
    ['Duration', [2, 3, 9, 6, 0]],
    ['Rate (bps)', [6, 0, 9, 2, 3]],
    ['Status', [6, 3, 2, 9, 0]],
    ['Created On', [2, 3, 0, 6, 9]],
  ])('should sort the orders list by %s', (sortBy, values) => {
    const { getByText, getAllByText } = render();
    fireEvent.click(getByText('All'));

    const ids = () =>
      store.orderListView.orders.map(o => parseInt(o.nonce.substring(0, 1)));

    fireEvent.click(getAllByText(sortBy)[0]);
    expect(ids()).toEqual(values);
    fireEvent.click(getAllByText(sortBy)[0]);
    expect(ids()).toEqual(values.reverse());
  });

  it('should display leases for the selected order', () => {
    const { getByText } = render();

    expect(store.orderListView.selectedNonce).toBe(store.orderListView.orders[0].nonce);
    store.orderListView.selectedLeases.forEach(l => {
      expect(getByText(l.balances)).toBeInTheDocument();
    });

    // show all orders and click on the last one
    fireEvent.click(getByText('All'));
    const lastOrder = store.orderListView.orders[store.orderListView.orders.length - 1];
    fireEvent.click(getByText(lastOrder.createdOnLabel));
    store.orderListView.selectedLeases.forEach(l => {
      expect(getByText(l.balances)).toBeInTheDocument();
    });
  });

  it.each<[string, number[], number]>([
    ['Balances', [5, 6], 0],
    ['APR', [6, 5], 0],
    ['Premium', [5, 6], 0],
    ['Duration', [6, 5], 1],
    ['Status', [6, 5], 1],
    ['Alias', [5, 6], 0],
  ])('should sort the leases list by %s', (sortBy, sortedOrder, elIndex) => {
    const { getByText, getAllByText } = render();
    fireEvent.click(getByText('All'));
    // select the order with two leases
    fireEvent.click(getByText('Ask'));

    const ids = () =>
      store.orderListView.selectedLeases.map(o =>
        parseInt(o.channelPoint.substring(o.channelPoint.length - 1)),
      );
    runInAction(() => {
      // update the first lease's value to make sorting consistent
      const firstLease =
        store.orderStore.leasesByNonce[store.orderListView.selectedNonce][0];
      firstLease.premiumSat = Big(15000);
      firstLease.channelLeaseExpiry = 1000;
      // set channel balances to make sorting consistent
      store.orderListView.selectedLeases.forEach((lease, i) => {
        if (lease.channel) {
          lease.channel.localBalance = Big(2000000).plus(i * 100000);
        }
      });
    });

    fireEvent.click(getAllByText(sortBy)[elIndex]);
    expect(ids()).toEqual(sortedOrder);
    fireEvent.click(getAllByText(sortBy)[elIndex]);
    expect(ids()).toEqual(sortedOrder.reverse());
  });

  it('should display the order list empty message', () => {
    runInAction(() => {
      store.orderStore.orders.clear();
    });
    const { getByText } = render();

    expect(getByText('You do not have any open orders.')).toBeInTheDocument();
    fireEvent.click(getByText('Filled'));
    expect(getByText('You do not have any filled orders.')).toBeInTheDocument();
    fireEvent.click(getByText('All'));
    expect(
      getByText(
        'You do not have any orders. Submit an order using the form on the left.',
      ),
    ).toBeInTheDocument();
  });

  it('should display the lease list empty message', () => {
    runInAction(() => {
      store.orderStore.leases.clear();
    });
    const { getByText } = render();
    expect(
      getByText('Select a filled order to view its leases here.'),
    ).toBeInTheDocument();
  });
});
