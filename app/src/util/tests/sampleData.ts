import * as LND from 'types/generated/lnd_pb';
import * as LOOP from 'types/generated/loop_pb';

//
// LND API Responses
//

export const lndGetInfo: LND.GetInfoResponse.AsObject = {
  version: '0.10.0-beta commit=v0.10.0-beta',
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

export const lndGetNodeInfo: Required<LND.NodeInfo.AsObject> = {
  channelsList: [],
  node: {
    addressesList: [
      {
        addr: '172.28.0.8:9735',
        network: 'tcp',
      },
    ],
    alias: 'alice',
    color: '#cccccc',
    featuresMap: [
      [0, { name: 'data-loss-protect', isRequired: true, isKnown: true }],
      [13, { name: 'static-remote-key', isRequired: false, isKnown: true }],
      [15, { name: 'payment-addr', isRequired: false, isKnown: true }],
      [17, { name: 'multi-path-payments', isRequired: false, isKnown: true }],
      [5, { name: 'upfront-shutdown-script', isRequired: false, isKnown: true }],
      [7, { name: 'gossip-queries', isRequired: false, isKnown: true }],
      [9, { name: 'tlv-onion', isRequired: false, isKnown: true }],
    ],
    lastUpdate: 1591393224,
    pubKey: '037136742c67e24681f36542f7c8916aa6f6fdf665c1dca2a107425503cff94501',
  },
  numChannels: 3,
  totalCapacity: 47000000,
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

const txId = '6ee4e45870ac6191e25173f29804851e9f4bcf10f65f8b63100f488989e1e7a8';
const outIndex = 0;
export const lndChannel: LND.Channel.AsObject = {
  active: true,
  remotePubkey: '037136742c67e24681f36542f7c8916aa6f6fdf665c1dca2a107425503cff94501',
  channelPoint: `${txId}:${outIndex}`,
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
};

export const lndListChannelsMany: LND.ListChannelsResponse.AsObject = {
  channelsList: [...Array(500)].map((_, i) => {
    const c = lndChannel;
    // pick a random capacity between 0.5 and 1 BTC
    const cap = Math.floor(Math.random() * 50000000) + 50000000;
    // pick a local balance that is at least 100K sats
    const local = Math.max(100000, Math.floor(Math.random() * cap - 100000));
    return {
      ...c,
      chanId: `${i || ''}${c.chanId}`,
      channelPoint: `${c.channelPoint.substring(0, c.channelPoint.length - 2)}:${i}`,
      remotePubkey: `${i || ''}${c.remotePubkey}`,
      localBalance: local,
      remoteBalance: cap - local,
      capacity: cap,
      uptime: Math.floor(Math.random() * (c.lifetime / 2)) + c.lifetime / 2,
    };
  }),
};

export const lndListChannels: LND.ListChannelsResponse.AsObject = {
  channelsList: lndListChannelsMany.channelsList.slice(0, 10),
};

const txIdBytes = Buffer.from(txId, 'hex').reverse().toString('base64');
export const lndChannelEvent: Required<LND.ChannelEventUpdate.AsObject> = {
  type: LND.ChannelEventUpdate.UpdateType.OPEN_CHANNEL,
  openChannel: lndChannel,
  closedChannel: {
    capacity: 15000000,
    chainHash: '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206',
    chanId: lndChannel.chanId,
    channelPoint: lndChannel.channelPoint,
    closeHeight: 191,
    closeType: 0,
    closingTxHash: '1f765f45f2a6d33837a203e3fc911915c891e9b86f9c9d91a1931b92efdedf5b',
    remotePubkey: '030e98fdacf2464bdfb027b866a018d6cdc5108514208988873abea7eff59afd91',
    settledBalance: 12990950,
    timeLockedBalance: 0,
  },
  activeChannel: {
    fundingTxidBytes: txIdBytes,
    fundingTxidStr: '',
    outputIndex: outIndex,
  },
  inactiveChannel: {
    fundingTxidBytes: txIdBytes,
    fundingTxidStr: '',
    outputIndex: outIndex,
  },
};

export const lndTransaction: LND.Transaction.AsObject = {
  amount: 12990950,
  blockHash: '',
  blockHeight: 0,
  destAddressesList: [
    'bcrt1qgrvqm263gra5t02cvvkxmp9520rkann0cedzz8',
    'bcrt1qkggx6pzd768hn6psc5tmwuvv4c2nzvpd3ax9a9',
  ],
  numConfirmations: 0,
  rawTxHex:
    '02000000000101a8e7e18989480f10638b5ff610cf4b9f1e850498f27351e29161ac7058e4e46e0000000000ffffffff0280841e000000000016001440d80dab5140fb45bd58632c6d84b453c76ece6fe639c60000000000160014b2106d044df68f79e830c517b7718cae1531302d040047304402207e17f9938f04a2379300a5c0f37305c902855fa000726bb7f0ad78d084acfcee02206d3da5edd73624d6ecfa27ae61e994e75bd0ad8cca6c9b7dda087bcf34b2bbbc0148304502210086d0b7e77b1d81f210d55bc13f9eef975774ac1509a22ff649bd2baac85b3fd702203bb272d6372450159b89ca41d97efbf6bdac076bc271696a1bd556efc31b5cda01475221028d084ada5554c83421bfac35bc78332f3c1f6ae980dea1e0eb3220411b7b83972103c60b39c8558f280fe2f0dfa7cb6a04f016470c4670e631458b400774a667610052ae00000000',
  timeStamp: 1591226124,
  totalFees: 0,
  txHash: '1f765f45f2a6d33837a203e3fc911915c891e9b86f9c9d91a1931b92efdedf5b',
};

export const lndGetChanInfo: Required<LND.ChannelEdge.AsObject> = {
  channelId: lndChannel.chanId,
  chanPoint: lndChannel.channelPoint,
  lastUpdate: 1591622793,
  node1Pub: lndGetInfo.identityPubkey,
  node2Pub: '021626ad63f6876f2baa6000739312690b027ec289b9d1bf9184f3194e8c923dad',
  capacity: 1800000,
  node1Policy: {
    timeLockDelta: 3000,
    minHtlc: 1000,
    feeBaseMsat: 3000,
    feeRateMilliMsat: 300,
    disabled: false,
    maxHtlcMsat: 1782000000,
    lastUpdate: 1591622793,
  },
  node2Policy: {
    timeLockDelta: 40,
    minHtlc: 1000,
    feeBaseMsat: 1000,
    feeRateMilliMsat: 1,
    disabled: false,
    maxHtlcMsat: 1782000000,
    lastUpdate: 1591622772,
  },
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
    htlcAddressP2wsh: 'bcrt1qzu4077erkr78k52yuf2rwkk6ayr6m3wtazdfz2qqmd7taa5vvy9s5d75gd',
    htlcAddressNp2wsh: '',
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

export const loopSwapResponse: LOOP.SwapResponse.AsObject = {
  htlcAddress: 'bcrt1qkjct8aqxfwyla50mfxdnzlmuphg3zwuz2zmuy99c9sw67xj7tn2sfkflhw',
  htlcAddressNp2wsh: '',
  htlcAddressP2wsh: 'bcrt1qkjct8aqxfwyla50mfxdnzlmuphg3zwuz2zmuy99c9sw67xj7tn2sfkflhw',
  id: '18e17a2f44efc7f344ef6330281765e569315f93d3eaf9b0f959b404836e3480',
  idBytes: 'GOF6L0Tvx/NE72MwKBdl5WkxX5PT6vmw+Vm0BINuNIA=',
};

// collection of sample API responses
export const sampleApiResponses: Record<string, any> = {
  'lnrpc.Lightning.GetInfo': lndGetInfo,
  'lnrpc.Lightning.GetNodeInfo': lndGetNodeInfo,
  'lnrpc.Lightning.GetChanInfo': lndGetChanInfo,
  'lnrpc.Lightning.ChannelBalance': lndChannelBalance,
  'lnrpc.Lightning.WalletBalance': lndWalletBalance,
  'lnrpc.Lightning.ListChannels': lndListChannels,
  'looprpc.SwapClient.ListSwaps': loopListSwaps,
  'looprpc.SwapClient.LoopOutTerms': loopTerms,
  'looprpc.SwapClient.GetLoopInTerms': loopTerms,
  'looprpc.SwapClient.LoopOutQuote': loopQuote,
  'looprpc.SwapClient.GetLoopInQuote': loopQuote,
  'looprpc.SwapClient.LoopIn': loopSwapResponse,
  'looprpc.SwapClient.LoopOut': loopSwapResponse,
};
