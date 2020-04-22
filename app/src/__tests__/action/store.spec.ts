import { lndListChannels } from 'util/sampleData';
import { createActions, StoreActions } from 'action';
import { Store } from 'store';

describe('SwapAction', () => {
  let store: Store;
  let actions: StoreActions;

  beforeEach(() => {
    store = new Store();
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
