import { values } from 'mobx';
import { grpc } from '@improbable-eng/grpc-web';
import { waitFor } from '@testing-library/react';
import { lndChannelBalance, lndWalletBalance } from 'util/tests/sampleData';
import { createStore, NodeStore, Store } from 'store';

const grpcMock = grpc as jest.Mocked<typeof grpc>;

describe('NodeStore', () => {
  let rootStore: Store;
  let store: NodeStore;

  beforeEach(() => {
    rootStore = createStore();
    store = rootStore.nodeStore;
  });

  it('should fetch node balances', async () => {
    expect(store.wallet.channelBalance).toBe(0);
    expect(store.wallet.walletBalance).toBe(0);
    await store.fetchBalances();
    expect(store.wallet.channelBalance).toEqual(lndChannelBalance.balance);
    expect(store.wallet.walletBalance).toEqual(lndWalletBalance.totalBalance);
  });

  it('should handle errors fetching channels', async () => {
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
