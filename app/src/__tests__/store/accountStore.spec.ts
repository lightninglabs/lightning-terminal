import { values } from 'mobx';
import * as POOL from 'types/generated/trader_pb';
import { grpc } from '@improbable-eng/grpc-web';
import { waitFor } from '@testing-library/react';
import Big from 'big.js';
import copyToClipboard from 'copy-to-clipboard';
import {
  poolCloseAccount,
  poolDepositAccount,
  poolInitAccount,
  poolListAccounts,
  poolWithdrawAccount,
} from 'util/tests/sampleData';
import { AccountStore, createStore, Store } from 'store';
import { Account } from 'store/models';

jest.mock('copy-to-clipboard');

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
    expect(rootStore.appView.alerts.size).toBe(0);
    await store.fetchAccounts();
    await waitFor(() => {
      expect(rootStore.appView.alerts.size).toBe(1);
      expect(values(rootStore.appView.alerts)[0].message).toBe('test-err');
    });
  });

  it('should return sorted accounts', async () => {
    const a = new Account(rootStore, { ...poolInitAccount, value: '300' });
    const b = new Account(rootStore, { ...poolInitAccount, value: '100' });
    const c = new Account(rootStore, {
      ...poolInitAccount,
      expirationHeight: 5000,
      state: POOL.AccountState.PENDING_OPEN,
    });
    const d = new Account(rootStore, {
      ...poolInitAccount,
      expirationHeight: 2000,
      state: POOL.AccountState.PENDING_UPDATE,
    });

    // make the traderKey's unique
    [a, b, c, d].forEach((acct, i) => {
      acct.traderKey = `${i}${acct.traderKey}`;
    });

    store.accounts.set(d.traderKey, d);
    store.accounts.set(c.traderKey, c);
    store.accounts.set(b.traderKey, b);
    store.accounts.set(a.traderKey, a);

    const expected = [a, b, c, d].map(x => x.traderKey);
    const actual = store.sortedAccounts.map(x => x.traderKey);

    expect(actual).toEqual(expected);
  });

  it('should excluded closed accounts in sorted accounts', async () => {
    const a = new Account(rootStore, { ...poolInitAccount, value: '300' });
    const b = new Account(rootStore, { ...poolInitAccount, value: '100' });
    const c = new Account(rootStore, {
      ...poolInitAccount,
      expirationHeight: 5000,
      state: POOL.AccountState.CLOSED,
    });
    const d = new Account(rootStore, {
      ...poolInitAccount,
      expirationHeight: 2000,
      state: POOL.AccountState.PENDING_OPEN,
    });

    // make the traderKey's unique
    [a, b, c, d].forEach((acct, i) => {
      acct.traderKey = `${i}${acct.traderKey}`;
    });

    store.accounts.set(d.traderKey, d);
    store.accounts.set(c.traderKey, c);
    store.accounts.set(b.traderKey, b);
    store.accounts.set(a.traderKey, a);

    const expected = [a, b, d].map(x => x.traderKey);
    const actual = store.sortedAccounts.map(x => x.traderKey);

    expect(actual).toEqual(expected);
  });

  it.each<[number, string]>([
    [POOL.AccountState.PENDING_OPEN, 'Pending Open'],
    [POOL.AccountState.PENDING_UPDATE, 'Pending Update'],
    [POOL.AccountState.PENDING_BATCH, 'Pending Batch'],
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
    const account = new Account(rootStore, poolAccount);
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

  it('should copy the txn id to clipboard', async () => {
    await store.fetchAccounts();
    store.copyTxnId();
    expect(copyToClipboard).toBeCalledWith(store.activeAccount.fundingTxnId);
    expect(rootStore.appView.alerts.size).toBe(1);
    expect(values(rootStore.appView.alerts)[0].message).toBe(
      'Copied funding txn ID to clipboard',
    );
  });

  it('should create a new Account', async () => {
    expect(store.accounts.size).toEqual(0);
    await store.createAccount(Big(3000000), 4032);
    expect(store.accounts.size).toEqual(1);
    expect(store.activeAccount).toBeDefined();
  });

  it('should handle errors creating a new Account', async () => {
    grpcMock.unary.mockImplementationOnce(() => {
      throw new Error('test-err');
    });
    expect(rootStore.appView.alerts.size).toBe(0);
    await store.createAccount(Big(3000000), 4032);
    await waitFor(() => {
      expect(rootStore.appView.alerts.size).toBe(1);
      expect(values(rootStore.appView.alerts)[0].message).toBe('test-err');
    });
  });

  it('should close an Account', async () => {
    await store.fetchAccounts();
    const txid = await store.closeAccount(100);
    expect(txid).toEqual(poolCloseAccount.closeTxid);
  });

  it('should handle errors closing an Account', async () => {
    await store.fetchAccounts();
    grpcMock.unary.mockImplementationOnce(() => {
      throw new Error('test-err');
    });
    expect(rootStore.appView.alerts.size).toBe(0);
    await store.closeAccount(100);
    await waitFor(() => {
      expect(rootStore.appView.alerts.size).toBe(1);
      expect(values(rootStore.appView.alerts)[0].message).toBe('test-err');
    });
  });

  it('should renew an Account', async () => {
    await store.fetchAccounts();
    const txid = await store.renewAccount(100, 253);
    expect(txid).toEqual(poolCloseAccount.closeTxid);
  });

  it('should handle errors renewing an Account', async () => {
    await store.fetchAccounts();
    grpcMock.unary.mockImplementationOnce(() => {
      throw new Error('test-err');
    });
    expect(rootStore.appView.alerts.size).toBe(0);
    await store.renewAccount(100, 253);
    await waitFor(() => {
      expect(rootStore.appView.alerts.size).toBe(1);
      expect(values(rootStore.appView.alerts)[0].message).toBe('test-err');
    });
  });

  it('should deposit funds into an account', async () => {
    await store.fetchAccounts();
    const txid = await store.deposit(1);
    expect(store.activeAccount.totalBalance.toString()).toBe(
      poolDepositAccount.account?.value,
    );
    expect(txid).toEqual(poolDepositAccount.depositTxid);
  });

  it('should handle errors depositing funds', async () => {
    await store.fetchAccounts();
    grpcMock.unary.mockImplementationOnce(() => {
      throw new Error('test-err');
    });
    expect(rootStore.appView.alerts.size).toBe(0);
    await store.deposit(1);
    await waitFor(() => {
      expect(rootStore.appView.alerts.size).toBe(1);
      expect(values(rootStore.appView.alerts)[0].message).toBe('test-err');
    });
  });

  it('should withdraw funds from an account', async () => {
    await store.fetchAccounts();
    const txid = await store.withdraw(1);
    expect(store.activeAccount.totalBalance.toString()).toBe(
      poolWithdrawAccount.account?.value,
    );
    expect(txid).toEqual(poolWithdrawAccount.withdrawTxid);
  });

  it('should handle errors withdrawing funds', async () => {
    await store.fetchAccounts();
    grpcMock.unary.mockImplementationOnce(() => {
      throw new Error('test-err');
    });
    expect(rootStore.appView.alerts.size).toBe(0);
    await store.withdraw(1);
    await waitFor(() => {
      expect(rootStore.appView.alerts.size).toBe(1);
      expect(values(rootStore.appView.alerts)[0].message).toBe('test-err');
    });
  });
});
