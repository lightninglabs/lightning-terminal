/* eslint-disable @typescript-eslint/camelcase */
import * as LND from 'types/generated/lnd_pb';
import * as LOOP from 'types/generated/loop_pb';

//
// LND API Responses
//

export const lndGetInfo: LND.GetInfoResponse.AsObject = {
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
};

export const lndChannelBalance: LND.ChannelBalanceResponse.AsObject = {
  balance: 9990950,
  pendingOpenBalance: 0,
};

export const lndWalletBalance: LND.WalletBalanceResponse.AsObject = {
  totalBalance: 84992363,
  confirmedBalance: 84992363,
  unconfirmedBalance: 0,
};

export const lndListChannelsOne: LND.ListChannelsResponse.AsObject = {
  channelsList: [
    {
      active: true,
      remotePubkey: '037136742c67e24681f36542f7c8916aa6f6fdf665c1dca2a107425503cff94501',
      channelPoint: '0ef6a4ae3d8f800f4eb736f0776f5d3a72571615a1b7218ab17c9a43f85d8949:0',
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
};

export const lndListChannels: LND.ListChannelsResponse.AsObject = {
  channelsList: [...Array(500)].map((_, i) => {
    const c = lndListChannelsOne.channelsList[0];
    // pick a random capacity between 0.5 and 1 BTC
    const cap = Math.floor(Math.random() * 50000000) + 50000000;
    // pick a local balance that is at least 100K sats
    const local = Math.max(100000, Math.floor(Math.random() * cap - 100000));
    return {
      ...c,
      chanId: `${i}${c.chanId}`,
      remotePubkey: `${i}${c.remotePubkey}`,
      localBalance: local,
      remoteBalance: cap - local,
      capacity: cap,
      uptime: Math.floor(Math.random() * (c.lifetime / 2)) + c.lifetime / 2,
    };
  }),
};

//
// Loop API Responses
//

export const loopListSwaps: LOOP.ListSwapsResponse.AsObject = {
  swapsList: [...Array(7)].map((x, i) => ({
    amt: 500000 + i * 5000,
    id: `f4eb118383c2b09d8c7289ce21c25900cfb4545d46c47ed23a31ad2aa57ce83${i}`,
    idBytes: '9OsRg4PCsJ2MconOIcJZAM+0VF1GxH7SOjGtKqV86DU=',
    type: (i % 3) as LOOP.SwapStatus.AsObject['type'],
    state: i % 2 ? LOOP.SwapState.SUCCESS : LOOP.SwapState.FAILED,
    initiationTime: 1586390353623905000 + i * 100000000000000,
    lastUpdateTime: 1586398369729857000 + i * 200000000000000,
    htlcAddress: 'bcrt1qzu4077erkr78k52yuf2rwkk6ayr6m3wtazdfz2qqmd7taa5vvy9s5d75gd',
    costServer: 66,
    costOnchain: 6812,
    costOffchain: 2,
  })),
};

export const loopTerms: LOOP.TermsResponse.AsObject = {
  minSwapAmount: 250000,
  maxSwapAmount: 1000000,
};

export const loopQuote: LOOP.QuoteResponse.AsObject = {
  cltvDelta: 50,
  minerFee: 7387,
  prepayAmt: 1337,
  swapFee: 83,
  swapPaymentDest: 'Au1a9/hEsbxHUOwFC1QwxZq6EnnKYtpAdc74OZK8/syU',
};

// collection of sample API responses
export const sampleApiResponses: Record<string, any> = {
  'lnrpc.Lightning.GetInfo': lndGetInfo,
  'lnrpc.Lightning.ChannelBalance': lndChannelBalance,
  'lnrpc.Lightning.WalletBalance': lndWalletBalance,
  'lnrpc.Lightning.ListChannels': lndListChannels,
  'looprpc.SwapClient.ListSwaps': loopListSwaps,
  'looprpc.SwapClient.LoopOutTerms': loopTerms,
  'looprpc.SwapClient.GetLoopInTerms': loopTerms,
  'looprpc.SwapClient.LoopOutQuote': loopQuote,
  'looprpc.SwapClient.GetLoopInQuote': loopQuote,
};
