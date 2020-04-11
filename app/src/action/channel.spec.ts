import ChannelAction from 'action/channel';
import LndApi from 'api/lnd';
import { Store } from 'store';

describe('ChannelAction', () => {
  let store: Store;
  let channel: ChannelAction;

  beforeEach(() => {
    const lndApiMock = new LndApi();
    store = new Store();
    channel = new ChannelAction(store, lndApiMock);
  });

  it('should fetch list of channels', async () => {
    expect(store.channels).toEqual([]);
    await channel.getChannels();
    expect(store.channels).toHaveLength(1);
  });
});
