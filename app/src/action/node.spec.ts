import NodeAction from 'action/node';
import LndApi from 'api/lnd';
import { Store } from 'store';

describe('NodeAction', () => {
  let store: Store;
  let node: NodeAction;

  beforeEach(() => {
    const lndApiMock = new LndApi();
    store = new Store();
    node = new NodeAction(store, lndApiMock);
  });

  it('should fetch list of channels', async () => {
    expect(store.info).toBeUndefined();
    await node.getInfo();
    expect(store.info).toBeDefined();
    expect(store.info?.alias).toEqual('alice');
  });
});
