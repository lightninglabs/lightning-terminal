import { values } from 'mobx';
import { grpc } from '@improbable-eng/grpc-web';
import { waitFor } from '@testing-library/react';
import { lndChannelBalance, lndGetInfo, lndWalletBalance } from 'util/tests/sampleData';
import { createStore, NodeStore, Store } from 'store';

const grpcMock = grpc as jest.Mocked<typeof grpc>;

describe('NodeStore', () => {
  let rootStore: Store;
  let store: NodeStore;

  beforeEach(() => {
    rootStore = createStore();
    store = rootStore.nodeStore;
  });

  it('should fetch node info', async () => {
    expect(store.pubkey).toBe('');
    expect(store.alias).toBe('');
    expect(store.chain).toBe('bitcoin');
    expect(store.network).toBe('mainnet');
    await store.fetchInfo();
    expect(store.pubkey).toEqual(lndGetInfo.identityPubkey);
    expect(store.alias).toEqual(lndGetInfo.alias);
    expect(store.chain).toEqual(lndGetInfo.chainsList[0].chain);
    expect(store.network).toEqual(lndGetInfo.chainsList[0].network);
  });

  it('should handle errors fetching balances', async () => {
    grpcMock.unary.mockImplementationOnce(desc => {
      if (desc.methodName === 'GetInfo') throw new Error('test-err');
      return undefined as any;
    });
    expect(rootStore.uiStore.alerts.size).toBe(0);
    await store.fetchInfo();
    await waitFor(() => {
      expect(rootStore.uiStore.alerts.size).toBe(1);
      expect(values(rootStore.uiStore.alerts)[0].message).toBe('test-err');
    });
  });

  it('should fetch node balances', async () => {
    expect(+store.wallet.channelBalance).toBe(0);
    expect(+store.wallet.walletBalance).toBe(0);
    await store.fetchBalances();
    expect(+store.wallet.channelBalance).toEqual(lndChannelBalance.balance);
    expect(+store.wallet.walletBalance).toEqual(lndWalletBalance.totalBalance);
  });

  it('should handle errors fetching balances', async () => {
    grpcMock.unary.mockImplementationOnce(desc => {
      if (desc.methodName === 'ChannelBalance') throw new Error('test-err');
      return undefined as any;
    });
    expect(rootStore.uiStore.alerts.size).toBe(0);
    await store.fetchBalances();
    await waitFor(() => {
      expect(rootStore.uiStore.alerts.size).toBe(1);
      expect(values(rootStore.uiStore.alerts)[0].message).toBe('test-err');
    });
  });
});
