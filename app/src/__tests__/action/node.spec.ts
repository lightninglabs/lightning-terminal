import { lndChannelBalance, lndWalletBalance } from 'util/tests/sampleData';
import NodeAction from 'action/node';
import { GrpcClient, LndApi } from 'api';
import { Store } from 'store';

describe('NodeAction', () => {
  let store: Store;
  let node: NodeAction;

  beforeEach(() => {
    const grpc = new GrpcClient();
    const lndApiMock = new LndApi(grpc);
    store = new Store();
    node = new NodeAction(store, lndApiMock);
  });

  it('should fetch list of channels', async () => {
    expect(store.info).toBeUndefined();
    await node.getInfo();
    expect(store.info).toBeDefined();
    expect(store.info?.alias).toEqual('alice');
  });

  it('should fetch node balances', async () => {
    expect(store.balances).toBeUndefined();
    await node.getBalances();
    expect(store.balances).toBeDefined();
    expect(store.balances?.channelBalance).toEqual(lndChannelBalance.balance);
    expect(store.balances?.walletBalance).toEqual(lndWalletBalance.totalBalance);
  });
});
