import { lndListChannels } from 'util/tests/sampleData';
import ChannelAction from 'action/channel';
import { GrpcClient, LndApi } from 'api';
import { createStore, Store } from 'store';

describe('ChannelAction', () => {
  let store: Store;
  let channel: ChannelAction;

  beforeEach(() => {
    const grpc = new GrpcClient();
    const lndApiMock = new LndApi(grpc);
    store = createStore();
    channel = new ChannelAction(store, lndApiMock);
  });

  it('should fetch list of channels', async () => {
    expect(store.channels).toEqual([]);
    await channel.getChannels();
    expect(store.channels).toHaveLength(lndListChannels.channelsList.length);
  });
});
