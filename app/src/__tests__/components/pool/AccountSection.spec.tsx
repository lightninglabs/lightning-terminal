import React from 'react';
import { runInAction } from 'mobx';
import { OrderState } from 'types/generated/auctioneer_pb';
import { formatSats } from 'util/formatters';
import { renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';
import AccountSection from 'components/pool/AccountSection';

describe('AccountSection', () => {
  let store: Store;

  beforeEach(async () => {
    store = createStore();
    await store.accountStore.fetchAccounts();
    await store.orderStore.fetchOrders();
  });

  const render = () => {
    return renderWithProviders(<AccountSection />, store);
  };

  it('should display the account key and balances', () => {
    const { getByText } = render();
    const account = store.accountStore.activeAccount;

    expect(getByText('Account')).toBeInTheDocument();
    expect(getByText(account.traderKeyEllipsed)).toBeInTheDocument();

    expect(getByText('Total Balance')).toBeInTheDocument();
    expect(getByText(formatSats(account.totalBalance))).toBeInTheDocument();

    expect(getByText('Available Balance')).toBeInTheDocument();
    expect(getByText(formatSats(account.availableBalance))).toBeInTheDocument();

    expect(getByText('2 Pending Orders')).toBeInTheDocument();
    expect(
      getByText(formatSats(store.orderStore.pendingOrdersAmount)),
    ).toBeInTheDocument();

    runInAction(() => {
      // cancel one of the orders to check the pending label changes
      store.orderStore.accountOrders[0].state = OrderState.ORDER_CANCELED;
    });
    expect(getByText('1 Pending Order')).toBeInTheDocument();
    expect(
      getByText(formatSats(store.orderStore.pendingOrdersAmount)),
    ).toBeInTheDocument();
  });
});
