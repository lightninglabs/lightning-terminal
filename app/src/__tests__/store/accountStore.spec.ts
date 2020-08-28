import { values } from 'mobx';
import * as POOL from 'types/generated/trader_pb';
import { grpc } from '@improbable-eng/grpc-web';
import { waitFor } from '@testing-library/react';
import Big from 'big.js';
import {
  poolCloseAccount,
  poolDepositAccount,
  poolListAccounts,
  poolWithdrawAccount,
} from 'util/tests/sampleData';
import { AccountStore, createStore, Store } from 'store';
import { Account } from 'store/models';

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

  it.each<[number, string]>([
    [POOL.AccountState.PENDING_OPEN, 'Pending Open'],
    [POOL.AccountState.PENDING_UPDATE, 'Pending Update'],
    [POOL.AccountState.OPEN, 'Open'],
    [POOL.AccountState.EXPIRED, 'Expired'],
    [POOL.AccountState.PENDING_CLOSED, 'Pending Closed'],
    [POOL.AccountState.CLOSED, 'Closed'],
    [POOL.AccountState.RECOVERY_FAILED, 'Recovery Failed'],
    [-1, 'Unknown'],
  ])('should return the correct account state label', (state: number, label: string) => {
    const poolAccount = {
      ...poolListAccounts.accountsList[0],
      state: state as any,
    };
    const account = new Account(poolAccount);
    expect(account.stateLabel).toBe(label);
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

  it('should close an Account', async () => {
    await store.fetchAccounts();
    const txid = await store.closeAccount();
    expect(txid).toEqual(poolCloseAccount.closeTxid);
  });

  it('should handle errors closing an Account', async () => {
    await store.fetchAccounts();
    grpcMock.unary.mockImplementationOnce(() => {
      throw new Error('test-err');
    });
    expect(rootStore.uiStore.alerts.size).toBe(0);
    await store.closeAccount();
    await waitFor(() => {
      expect(rootStore.uiStore.alerts.size).toBe(1);
      expect(values(rootStore.uiStore.alerts)[0].message).toBe('test-err');
    });
  });

  it('should deposit funds into an account', async () => {
    await store.fetchAccounts();
    const txid = await store.deposit(1);
    expect(+store.activeAccount.totalBalance).toBe(poolDepositAccount.account?.value);
    expect(txid).toEqual(poolDepositAccount.depositTxid);
  });

  it('should handle errors depositing funds', async () => {
    await store.fetchAccounts();
    grpcMock.unary.mockImplementationOnce(() => {
      throw new Error('test-err');
    });
    expect(rootStore.uiStore.alerts.size).toBe(0);
    await store.deposit(1);
    await waitFor(() => {
      expect(rootStore.uiStore.alerts.size).toBe(1);
      expect(values(rootStore.uiStore.alerts)[0].message).toBe('test-err');
    });
  });

  it('should withdraw funds from an account', async () => {
    await store.fetchAccounts();
    const txid = await store.withdraw(1);
    expect(+store.activeAccount.totalBalance).toBe(poolWithdrawAccount.account?.value);
    expect(txid).toEqual(poolWithdrawAccount.withdrawTxid);
  });

  it('should handle errors withdrawing funds', async () => {
    await store.fetchAccounts();
    grpcMock.unary.mockImplementationOnce(() => {
      throw new Error('test-err');
    });
    expect(rootStore.uiStore.alerts.size).toBe(0);
    await store.withdraw(1);
    await waitFor(() => {
      expect(rootStore.uiStore.alerts.size).toBe(1);
      expect(values(rootStore.uiStore.alerts)[0].message).toBe('test-err');
    });
  });
});
