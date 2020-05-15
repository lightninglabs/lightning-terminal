import { lndChannelBalance, lndWalletBalance } from 'util/tests/sampleData';
import { createStore, NodeStore } from 'store';

describe('NodeAction', () => {
  let store: NodeStore;

  beforeEach(() => {
    store = createStore().nodeStore;
  });

  it('should fetch node balances', async () => {
    expect(store.wallet.channelBalance).toBe(0);
    expect(store.wallet.walletBalance).toBe(0);
    await store.fetchBalances();
    expect(store.wallet.channelBalance).toEqual(lndChannelBalance.balance);
    expect(store.wallet.walletBalance).toEqual(lndWalletBalance.totalBalance);
  });
});
