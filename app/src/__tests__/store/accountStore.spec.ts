import { values } from 'mobx';
import { grpc } from '@improbable-eng/grpc-web';
import { waitFor } from '@testing-library/react';
import Big from 'big.js';
import { poolListAccounts } from 'util/tests/sampleData';
import { AccountStore, createStore, Store } from 'store';

const grpcMock = grpc as jest.Mocked<typeof grpc>;

describe('AccountStore', () => {
  let rootStore: Store;
  let store: AccountStore;

  beforeEach(() => {
    rootStore = createStore();
    store = rootStore.accountStore;
  });

  it('should list accounts', async () => {
    expect(store.accounts.size).toBe(0);
    await store.fetchAccounts();
    expect(store.accounts.size).toBe(poolListAccounts.accountsList.length);
  });

  it('should handle errors fetching accounts', async () => {
    grpcMock.unary.mockImplementationOnce(() => {
      throw new Error('test-err');
    });
    expect(rootStore.uiStore.alerts.size).toBe(0);
    await store.fetchAccounts();
    await waitFor(() => {
      expect(rootStore.uiStore.alerts.size).toBe(1);
      expect(values(rootStore.uiStore.alerts)[0].message).toBe('test-err');
    });
  });

  it('should update existing accounts with the same id', async () => {
    expect(store.accounts.size).toEqual(0);
    await store.fetchAccounts();
    expect(store.accounts.size).toEqual(poolListAccounts.accountsList.length);
    const prevAcct = values(store.accounts).slice()[0];
    const prevBalance = prevAcct.totalBalance;
    prevAcct.totalBalance = Big(123);
    await store.fetchAccounts();
    const updatedChan = values(store.accounts).slice()[0];
    // the existing channel should be updated
    expect(prevAcct).toBe(updatedChan);
    expect(updatedChan.totalBalance).toEqual(prevBalance);
  });

  it('should handle errors querying the active account', async () => {
    expect(() => store.activeAccount).toThrow();
    await store.fetchAccounts();
    expect(() => store.activeAccount).not.toThrow();
    store.activeTraderKey = 'invalid';
    expect(() => store.activeAccount).toThrow();
  });

  it('should create a new Account', async () => {
    expect(store.accounts.size).toEqual(0);
    await store.createAccount(3000000, 4032);
    expect(store.accounts.size).toEqual(1);
    expect(store.activeAccount).toBeDefined();
  });

  it('should handle errors creating a new Account', async () => {
    grpcMock.unary.mockImplementationOnce(() => {
      throw new Error('test-err');
    });
    expect(rootStore.uiStore.alerts.size).toBe(0);
    await store.createAccount(3000000, 4032);
    await waitFor(() => {
      expect(rootStore.uiStore.alerts.size).toBe(1);
      expect(values(rootStore.uiStore.alerts)[0].message).toBe('test-err');
    });
  });
});
