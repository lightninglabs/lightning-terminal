import { lndListChannels } from 'util/tests/sampleData';
import { createActions, StoreActions } from 'action';
import { createStore, Store } from 'store';

describe('Store', () => {
  let store: Store;
  let actions: StoreActions;

  beforeEach(() => {
    store = createStore();
    actions = createActions(store);
  });

  it('should compute inbound liquidity', async () => {
    const inbound = lndListChannels.channelsList.reduce(
      (sum, chan) => sum + chan.remoteBalance,
      0,
    );

    await actions.channel.getChannels();
    expect(store.totalInbound).toBe(inbound);
  });

  it('should compute outbound liquidity', async () => {
    const outbound = lndListChannels.channelsList.reduce(
      (sum, chan) => sum + chan.localBalance,
      0,
    );
    await actions.channel.getChannels();
    expect(store.totalOutbound).toBe(outbound);
  });
});
