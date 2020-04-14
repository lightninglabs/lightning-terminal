import { ProtobufMessage } from '@improbable-eng/grpc-web/dist/typings/message';
import { UnaryMethodDefinition } from '@improbable-eng/grpc-web/dist/typings/service';
import { UnaryRpcOptions } from '@improbable-eng/grpc-web/dist/typings/unary';

// mock grpc module
export const grpc = {
  Code: {
    OK: 0,
    Canceled: 1,
  },
  // mock unary function to simulate GRPC requests
  unary: <TReq extends ProtobufMessage, TRes extends ProtobufMessage>(
    methodDescriptor: UnaryMethodDefinition<TReq, TRes>,
    props: UnaryRpcOptions<TReq, TRes>,
  ) => {
    const path = `${methodDescriptor.service.serviceName}.${methodDescriptor.methodName}`;
    // return a response by calling the onEnd function
    props.onEnd({
      status: 0,
      statusMessage: '',
      // the message returned should have a toObject function
      message: {
        toObject: () => mockApiResponses[path],
      } as TRes,
      headers: {} as any,
      trailers: {} as any,
    });
  },
};

// collection of mock API responses
const mockApiResponses: Record<string, any> = {
  'lnrpc.Lightning.GetInfo': {
    version: '0.9.0-beta commit=v0.9.0-beta',
    identityPubkey: '038b3fc29cfc195c9b190d86ad2d40ce7550a5c6f13941f53c7d7ac5b25c912a6c',
    alias: 'alice',
    color: '#cccccc',
    numPendingChannels: 0,
    numActiveChannels: 1,
    numInactiveChannels: 0,
    numPeers: 1,
    blockHeight: 185,
    blockHash: '547d3dcfb7d56532bed2efdeea0d400f11167b34d493bcd45fedb21f2ef7ed43',
    bestHeaderTimestamp: 1586548672,
    syncedToChain: false,
    syncedToGraph: true,
    testnet: false,
    chainsList: [{ chain: 'bitcoin', network: 'regtest' }],
    urisList: [
      '038b3fc29cfc195c9b190d86ad2d40ce7550a5c6f13941f53c7d7ac5b25c912a6c@172.18.0.7:9735',
    ],
    featuresMap: [
      [0, { name: 'data-loss-protect', isRequired: true, isKnown: true }],
      [13, { name: 'static-remote-key', isRequired: false, isKnown: true }],
      [15, { name: 'payment-addr', isRequired: false, isKnown: true }],
      [17, { name: 'multi-path-payments', isRequired: false, isKnown: true }],
      [5, { name: 'upfront-shutdown-script', isRequired: false, isKnown: true }],
      [7, { name: 'gossip-queries', isRequired: false, isKnown: true }],
      [9, { name: 'tlv-onion', isRequired: false, isKnown: true }],
    ],
  },
  'lnrpc.Lightning.ListChannels': {
    channelsList: [
      {
        active: true,
        remotePubkey:
          '037136742c67e24681f36542f7c8916aa6f6fdf665c1dca2a107425503cff94501',
        channelPoint:
          '0ef6a4ae3d8f800f4eb736f0776f5d3a72571615a1b7218ab17c9a43f85d8949:0',
        chanId: '124244814004224',
        capacity: 15000000,
        localBalance: 9988660,
        remoteBalance: 4501409,
        commitFee: 11201,
        commitWeight: 896,
        feePerKw: 12500,
        unsettledBalance: 498730,
        totalSatoshisSent: 1338,
        totalSatoshisReceived: 499929,
        numUpdates: 6,
        pendingHtlcsList: [
          {
            incoming: false,
            amount: 498730,
            hashLock: 'pl8fmsyoSqEQFQCw6Zu9e1aIlFnMz5H+hW2mmh3kRlI=',
            expirationHeight: 285,
          },
        ],
        csvDelay: 1802,
        pb_private: false,
        initiator: true,
        chanStatusFlags: 'ChanStatusDefault',
        localChanReserveSat: 150000,
        remoteChanReserveSat: 150000,
        staticRemoteKey: true,
        lifetime: 21802,
        uptime: 21802,
        closeAddress: '',
      },
    ],
  },
  'looprpc.SwapClient.ListSwaps': {
    swapsList: [...Array(7)].map((x, i) => ({
      amt: 500000,
      id: 'f4eb118383c2b09d8c7289ce21c25900cfb4545d46c47ed23a31ad2aa57ce835',
      idBytes: '9OsRg4PCsJ2MconOIcJZAM+0VF1GxH7SOjGtKqV86DU=',
      type: i % 3,
      state: i,
      initiationTime: 1586390353623905000,
      lastUpdateTime: 1586398369729857000,
      htlcAddress: 'bcrt1qzu4077erkr78k52yuf2rwkk6ayr6m3wtazdfz2qqmd7taa5vvy9s5d75gd',
      costServer: 66,
      costOnchain: 6812,
      costOffchain: 2,
    })),
  },
};
