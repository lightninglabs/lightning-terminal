import * as AUCT from 'types/generated/auctioneerrpc/auctioneer_pb';
import * as LIT from 'types/generated/lit-sessions_pb';
import * as STATUS from 'types/generated/lit-status_pb';
import * as LND from 'types/generated/lnd_pb';
import * as LOOP from 'types/generated/loop_pb';
import * as POOL from 'types/generated/trader_pb';
import { b64 } from 'util/strings';

//
// LND API Responses
//

export const lndGetInfo: LND.GetInfoResponse.AsObject = {
  version: '0.11.0-beta commit=lightning-terminal-v0.1.0-alpha',
  commitHash: '9d5c264e7f0fd6751aeb41da497923512ac8fbea',
  identityPubkey: '038b3fc29cfc195c9b190d86ad2d40ce7550a5c6f13941f53c7d7ac5b25c912a6c',
  alias: 'alice',
  color: '#cccccc',
  numPendingChannels: 0,
  numActiveChannels: 1,
  numInactiveChannels: 0,
  numPeers: 1,
  blockHeight: 185,
  blockHash: '547d3dcfb7d56532bed2efdeea0d400f11167b34d493bcd45fedb21f2ef7ed43',
  bestHeaderTimestamp: '1586548672',
  syncedToChain: false,
  syncedToGraph: true,
  testnet: false,
  chainsList: [{ chain: 'bitcoin', network: 'regtest' }],
  requireHtlcInterceptor: false,
  storeFinalHtlcResolutions: false,
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
    customRecordsMap: [],
  },
  numChannels: 3,
  totalCapacity: '47000000',
};

export const lndChannelBalance: LND.ChannelBalanceResponse.AsObject = {
  balance: '9990950',
  pendingOpenBalance: '0',
};

export const lndWalletBalance: LND.WalletBalanceResponse.AsObject = {
  totalBalance: '84992363',
  confirmedBalance: '84992363',
  unconfirmedBalance: '0',
  accountBalanceMap: [],
  lockedBalance: '84992363',
  reservedBalanceAnchorChan: '',
};

const txId = '6ee4e45870ac6191e25173f29804851e9f4bcf10f65f8b63100f488989e1e7a8';
const outIndex = 0;
export const lndChannel: LND.Channel.AsObject = {
  active: true,
  remotePubkey: '037136742c67e24681f36542f7c8916aa6f6fdf665c1dca2a107425503cff94501',
  channelPoint: `${txId}:${outIndex}`,
  chanId: '124244814004224',
  capacity: '15000000',
  localBalance: '9988660',
  remoteBalance: '4501409',
  commitFee: '11201',
  commitWeight: '896',
  feePerKw: '12500',
  unsettledBalance: '498730',
  totalSatoshisSent: '1338',
  totalSatoshisReceived: '499929',
  numUpdates: '6',
  pendingHtlcsList: [
    {
      incoming: false,
      amount: '498730',
      hashLock: 'pl8fmsyoSqEQFQCw6Zu9e1aIlFnMz5H+hW2mmh3kRlI=',
      expirationHeight: 285,
      htlcIndex: '0',
      forwardingChannel: '124244814004224',
      forwardingHtlcIndex: '0',
    },
  ],
  csvDelay: 1802,
  pb_private: false,
  initiator: true,
  chanStatusFlags: 'ChanStatusDefault',
  localChanReserveSat: '150000',
  remoteChanReserveSat: '150000',
  staticRemoteKey: true,
  commitmentType: LND.CommitmentType.STATIC_REMOTE_KEY,
  lifetime: '21802',
  uptime: '21802',
  closeAddress: '',
  pushAmountSat: '5000000',
  thawHeight: 0,
  aliasScidsList: [],
  zeroConf: false,
  zeroConfConfirmedScid: '',
  peerAlias: '',
  peerScidAlias: '',
  memo: 'test channel',
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
      localBalance: `${local}`,
      remoteBalance: `${cap - local}`,
      capacity: `${cap}`,
      uptime: `${Math.floor(Math.random() * (+c.lifetime / 2)) + +c.lifetime / 2}`,
    };
  }),
};

export const lndListChannels: LND.ListChannelsResponse.AsObject = {
  channelsList: lndListChannelsMany.channelsList.slice(0, 10),
};

export const lndPendingChannel: LND.PendingChannelsResponse.PendingChannel.AsObject = {
  capacity: '500000',
  channelPoint: '987da7ae4e56a30ee841edc5a4ccf61112e98bce7d4acfdf8e71a670296d16a7:0',
  commitmentType: 1,
  initiator: 2,
  localBalance: '0',
  localChanReserveSat: '5000',
  remoteBalance: '490950',
  remoteChanReserveSat: '5000',
  remoteNodePub: '03bb934930cdcd25576aa61d08cc95214e0036f1219c435c06976e561558703290',
  numForwardingPackages: '7',
  chanStatusFlags: 'ChanStatusDefault',
  pb_private: false,
  memo: 'test channel',
};

export const lndPendingChannels: LND.PendingChannelsResponse.AsObject = {
  totalLimboBalance: '0',
  pendingOpenChannelsList: [
    {
      channel: {
        ...lndPendingChannel,
        channelPoint: lndListChannels.channelsList[0].channelPoint,
      },
      commitFee: '9050',
      commitWeight: '552',
      feePerKw: '12500',
      fundingExpiryBlocks: 100,
    },
  ],
  pendingClosingChannelsList: [
    {
      channel: {
        ...lndPendingChannel,
        channelPoint: lndListChannels.channelsList[1].channelPoint,
      },
      closingTxid: 'fe65f668a1efe1c088b0e7d44abb707cb0171ebbbe43e8f6bb985a98643f1672',
    },
  ],
  waitingCloseChannelsList: [
    {
      channel: {
        ...lndPendingChannel,
        channelPoint: lndListChannels.channelsList[2].channelPoint,
      },
      commitments: {
        localCommitFeeSat: '9050',
        localTxid: 'fe65f668a1efe1c088b0e7d44abb707cb0171ebbbe43e8f6bb985a98643f1672',
        remoteCommitFeeSat: '9050',
        remotePendingCommitFeeSat: '0',
        remotePendingTxid: '',
        remoteTxid: '9850a4b1cfcfbf972f8541b26b8061ed3091ee8cbed5875167080be4be9524e7',
      },
      limboBalance: '0',
      closingTxid: '6c151252215b73547a5415051c82dd25c725c4309b93fed4f38c4c5b610c3fb0',
    },
  ],
  pendingForceClosingChannelsList: [
    {
      channel: {
        ...lndPendingChannel,
        channelPoint: lndListChannels.channelsList[3].channelPoint,
      },
      anchor: 0,
      blocksTilMaturity: 142,
      closingTxid: '6c151252215b73547a5415051c82dd25c725c4309b93fed4f38c4c5b610c3fb0',
      limboBalance: '990950',
      maturityHeight: 440,
      pendingHtlcsList: [],
      recoveredBalance: '0',
    },
  ],
};

const txIdBytes = b64(txId, true);
export const lndChannelEvent: Required<LND.ChannelEventUpdate.AsObject> = {
  type: LND.ChannelEventUpdate.UpdateType.OPEN_CHANNEL,
  openChannel: lndChannel,
  closedChannel: {
    capacity: '15000000',
    chainHash: '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206',
    chanId: lndChannel.chanId,
    channelPoint: lndChannel.channelPoint,
    closeHeight: 191,
    closeType: 0,
    closingTxHash: '1f765f45f2a6d33837a203e3fc911915c891e9b86f9c9d91a1931b92efdedf5b',
    remotePubkey: '030e98fdacf2464bdfb027b866a018d6cdc5108514208988873abea7eff59afd91',
    settledBalance: '12990950',
    timeLockedBalance: '0',
    openInitiator: 1,
    closeInitiator: 1,
    resolutionsList: [],
    aliasScidsList: [],
    zeroConfConfirmedScid: '',
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
  pendingOpenChannel: {
    txid: '1f765f45f2a6d33837a203e3fc911915c891e9b86f9c9d91a1931b92efdedf5b',
    outputIndex: 0,
  },
  fullyResolvedChannel: {
    fundingTxidBytes: txIdBytes,
    fundingTxidStr: '',
    outputIndex: outIndex,
  },
};

export const lndTransaction: LND.Transaction.AsObject = {
  amount: '12990950',
  blockHash: '',
  blockHeight: 0,
  destAddressesList: [
    'bcrt1qgrvqm263gra5t02cvvkxmp9520rkann0cedzz8',
    'bcrt1qkggx6pzd768hn6psc5tmwuvv4c2nzvpd3ax9a9',
  ],
  numConfirmations: 0,
  rawTxHex:
    '02000000000101a8e7e18989480f10638b5ff610cf4b9f1e850498f27351e29161ac7058e4e46e0000000000ffffffff0280841e000000000016001440d80dab5140fb45bd58632c6d84b453c76ece6fe639c60000000000160014b2106d044df68f79e830c517b7718cae1531302d040047304402207e17f9938f04a2379300a5c0f37305c902855fa000726bb7f0ad78d084acfcee02206d3da5edd73624d6ecfa27ae61e994e75bd0ad8cca6c9b7dda087bcf34b2bbbc0148304502210086d0b7e77b1d81f210d55bc13f9eef975774ac1509a22ff649bd2baac85b3fd702203bb272d6372450159b89ca41d97efbf6bdac076bc271696a1bd556efc31b5cda01475221028d084ada5554c83421bfac35bc78332f3c1f6ae980dea1e0eb3220411b7b83972103c60b39c8558f280fe2f0dfa7cb6a04f016470c4670e631458b400774a667610052ae00000000',
  timeStamp: '1591226124',
  totalFees: '0',
  txHash: '1f765f45f2a6d33837a203e3fc911915c891e9b86f9c9d91a1931b92efdedf5b',
  label: '',
  outputDetailsList: [],
  previousOutpointsList: [],
};

export const lndGetChanInfo: Required<LND.ChannelEdge.AsObject> = {
  channelId: lndChannel.chanId,
  chanPoint: lndChannel.channelPoint,
  lastUpdate: 1591622793,
  node1Pub: lndGetInfo.identityPubkey,
  node2Pub: '021626ad63f6876f2baa6000739312690b027ec289b9d1bf9184f3194e8c923dad',
  capacity: '1800000',
  node1Policy: {
    timeLockDelta: 3000,
    minHtlc: '1000',
    feeBaseMsat: '3000',
    feeRateMilliMsat: '300',
    disabled: false,
    maxHtlcMsat: '1782000000',
    lastUpdate: 1591622793,
    customRecordsMap: [],
  },
  node2Policy: {
    timeLockDelta: 40,
    minHtlc: '1000',
    feeBaseMsat: '1000',
    feeRateMilliMsat: '1',
    disabled: false,
    maxHtlcMsat: '1782000000',
    lastUpdate: 1591622772,
    customRecordsMap: [],
  },
  customRecordsMap: [],
};

//
// Loop API Responses
//

export const loopListSwaps: LOOP.ListSwapsResponse.AsObject = {
  swapsList: [...Array(7)].map((x, i) => ({
    amt: `${500000 + i * 5000}`,
    id: `f4eb118383c2b09d8c7289ce21c25900cfb4545d46c47ed23a31ad2aa57ce83${i}`,
    idBytes: '9OsRg4PCsJ2MconOIcJZAM+0VF1GxH7SOjGtKqV86DU=',
    type: (i % 3) as LOOP.SwapStatus.AsObject['type'],
    state: i % 2 ? LOOP.SwapState.SUCCESS : LOOP.SwapState.FAILED,
    failureReason: (i % 2 === 0 ? 0 : i % 7) as LOOP.SwapStatus.AsObject['failureReason'],
    initiationTime: `${1586390353623905000 + i * 100000000000000}`,
    lastUpdateTime: `${1586398369729857000 + i * 200000000000000}`,
    htlcAddress: 'bcrt1qzu4077erkr78k52yuf2rwkk6ayr6m3wtazdfz2qqmd7taa5vvy9s5d75gd',
    htlcAddressP2wsh: 'bcrt1qzu4077erkr78k52yuf2rwkk6ayr6m3wtazdfz2qqmd7taa5vvy9s5d75gd',
    htlcAddressNp2wsh: '',
    costServer: '66',
    costOnchain: '6812',
    costOffchain: '2',
    label: `Sample Swap #${i + 1}`,
    lastHop: '021626ad63f6876f2baa6000739312690b027ec289b9d1bf9184f3194e8c923dad',
    outgoingChanSetList: ['123456789'],
    htlcAddressP2tr: '',
  })),
};

export const loopOutTerms: LOOP.OutTermsResponse.AsObject = {
  minSwapAmount: '250000',
  maxSwapAmount: '1000000',
  minCltvDelta: 20,
  maxCltvDelta: 60,
};

export const loopInTerms: LOOP.InTermsResponse.AsObject = {
  minSwapAmount: '250000',
  maxSwapAmount: '1000000',
};

export const loopOutQuote: LOOP.OutQuoteResponse.AsObject = {
  cltvDelta: 50,
  htlcSweepFeeSat: '7387',
  prepayAmtSat: '1337',
  swapFeeSat: '83',
  swapPaymentDest: 'Au1a9/hEsbxHUOwFC1QwxZq6EnnKYtpAdc74OZK8/syU',
  confTarget: 6,
};

export const loopInQuote: LOOP.InQuoteResponse.AsObject = {
  cltvDelta: 50,
  htlcPublishFeeSat: '7387',
  swapFeeSat: '83',
  confTarget: 6,
};

export const loopSwapResponse: LOOP.SwapResponse.AsObject = {
  htlcAddress: 'bcrt1qkjct8aqxfwyla50mfxdnzlmuphg3zwuz2zmuy99c9sw67xj7tn2sfkflhw',
  htlcAddressP2wsh: 'bcrt1qkjct8aqxfwyla50mfxdnzlmuphg3zwuz2zmuy99c9sw67xj7tn2sfkflhw',
  id: '18e17a2f44efc7f344ef6330281765e569315f93d3eaf9b0f959b404836e3480',
  idBytes: 'GOF6L0Tvx/NE72MwKBdl5WkxX5PT6vmw+Vm0BINuNIA=',
  serverMessage: 'Loop, there it is!',
  htlcAddressP2tr: '',
};

//
// Pool API Responses
//

export const poolInitAccount: POOL.Account.AsObject = {
  availableBalance: '10000000',
  latestTxid: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
  expirationHeight: 4334,
  outpoint: {
    outputIndex: 0,
    txid: 'fY/L3gq49iu3bykuK32Ar95ewk3a2wUkFSOGfmGFncc=',
  },
  state: POOL.AccountState.OPEN,
  traderKey: 'Ap+9XjK2X8EOrmAJvcvWS1B9jt3xLYka0S7aMru0Bude',
  value: '30000000',
  version: POOL.AccountVersion.ACCOUNT_VERSION_LEGACY,
};

export const poolQuoteAccount: POOL.QuoteAccountResponse.AsObject = {
  minerFeeRateSatPerKw: '12500',
  minerFeeTotal: '7650',
};

export const poolCloseAccount: POOL.CloseAccountResponse.AsObject = {
  closeTxid: '+BQm/hnM0SleT2NxS7bdw0JNDuvIMhL4qxLUkdbCJdo=',
};

export const poolRenewAccount: POOL.RenewAccountResponse.AsObject = {
  renewalTxid: '+BQm/hnM0SleT2NxS7bdw0JNDuvIMhL4qxLUkdbCJdo=',
  account: poolInitAccount,
};

export const poolGetInfo: POOL.GetInfoResponse.AsObject = {
  version: '0.5.4-alpha commit=v0.5.4-alpha.0.20220114202858-525fe156d240',
  accountsTotal: 5,
  accountsActive: 1,
  accountsActiveExpired: 0,
  accountsArchived: 4,
  ordersTotal: 16,
  ordersActive: 0,
  ordersArchived: 16,
  currentBlockHeight: 2164104,
  batchesInvolved: 8,
  nodeRating: {
    nodePubkey: '027433f335bbea5f5631bda2bcf45f57d069a084c800aa80148909bc392b99103c',
    nodeTier: AUCT.NodeTier.TIER_1,
  },
  lsatTokens: 1,
  subscribedToAuctioneer: true,
  newNodesOnly: false,
};

export const poolListAccounts: POOL.ListAccountsResponse.AsObject = {
  accountsList: [
    poolInitAccount,
    {
      availableBalance: '15000000',
      latestTxid: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
      expirationHeight: 4331,
      outpoint: {
        outputIndex: 0,
        txid: 'AEf0nMpgbBL4ugP59b6MAV0eSZ+OQsHpae1j9gWPcQ0=',
      },
      state: POOL.AccountState.OPEN,
      traderKey: 'A1XCKczWrUUjZg4rmtYoQnji2mGEyLxM8FvIPZ9ZnRCk',
      value: '15000000',
      version: POOL.AccountVersion.ACCOUNT_VERSION_LEGACY,
    },
    {
      availableBalance: '7773185',
      latestTxid: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
      expirationHeight: 4328,
      outpoint: {
        outputIndex: 0,
        txid: 'r+q2xqhXJ4PoyOffB73PdFMtiiszxuot05zJ3UTnI1M=',
      },
      state: POOL.AccountState.OPEN,
      traderKey: 'A9Mua6d2a+1NZZ8knxJ/XtE3VENxQO4erD9Y3igCmH9q',
      value: '10000000',
      version: POOL.AccountVersion.ACCOUNT_VERSION_LEGACY,
    },
  ],
};

export const poolDepositAccount: Required<POOL.DepositAccountResponse.AsObject> = {
  depositTxid: '+BQm/hnM0SleT2NxS7bdw0JNDuvIMhL4qxLUkdbCJdo=',
  account: {
    ...poolInitAccount,
    state: POOL.AccountState.PENDING_UPDATE,
    value: poolInitAccount.value + 1,
  },
};

export const poolWithdrawAccount: Required<POOL.WithdrawAccountResponse.AsObject> = {
  withdrawTxid: '+BQm/hnM0SleT2NxS7bdw0JNDuvIMhL4qxLUkdbCJdo=',
  account: {
    ...poolInitAccount,
    state: POOL.AccountState.PENDING_UPDATE,
    value: `${+poolInitAccount.value - 1}`,
  },
};

export const poolListOrders: POOL.ListOrdersResponse.AsObject = {
  asksList: [
    {
      details: {
        traderKey: poolInitAccount.traderKey,
        rateFixed: 4960,
        amt: '3000000',
        maxBatchFeeRateSatPerKw: '25000',
        orderNonce: 'Iw842N6B77EGuZCy5oiBDRAvJrQoIrlsjPosuKevT9g=',
        state: AUCT.OrderState.ORDER_EXECUTED,
        units: 30,
        unitsUnfulfilled: 0,
        reservedValueSat: '0',
        creationTimestampNs: '1605370663652010000',
        eventsList: [],
        minUnitsMatch: 1,
        channelType: 1,
        allowedNodeIdsList: [],
        notAllowedNodeIdsList: [],
        auctionType: AUCT.AuctionType.AUCTION_TYPE_BTC_INBOUND_LIQUIDITY,
        isPublic: true,
      },
      leaseDurationBlocks: 2016,
      version: 1,
      announcementConstraints: AUCT.ChannelAnnouncementConstraints.ONLY_ANNOUNCED,
      confirmationConstraints:
        AUCT.ChannelConfirmationConstraints.CONFIRMATION_NO_PREFERENCE,
    },
  ],
  bidsList: [
    {
      details: {
        traderKey: poolInitAccount.traderKey,
        rateFixed: 4960,
        amt: '2000000',
        maxBatchFeeRateSatPerKw: '25000',
        orderNonce: 'NWKpd8HC5zIWr4f2CRbLEVv+g9s5LeArnK9xREAZ2mY=',
        state: AUCT.OrderState.ORDER_EXECUTED,
        units: 20,
        unitsUnfulfilled: 0,
        reservedValueSat: '0',
        creationTimestampNs: '1605371586127059200',
        eventsList: [],
        minUnitsMatch: 1,
        channelType: 1,
        allowedNodeIdsList: [],
        notAllowedNodeIdsList: [],
        auctionType: AUCT.AuctionType.AUCTION_TYPE_BTC_INBOUND_LIQUIDITY,
        isPublic: false,
      },
      leaseDurationBlocks: 2016,
      version: 1,
      minNodeTier: 1,
      selfChanBalance: '0',
      sidecarTicket: '',
      unannouncedChannel: true,
      zeroConfChannel: true,
    },
    {
      details: {
        traderKey: poolInitAccount.traderKey,
        rateFixed: 2480,
        amt: '2000000',
        maxBatchFeeRateSatPerKw: '25000',
        orderNonce: 'nRXHe7gMTmox7AXMW6yVYg9Lp4ZMNps6KRGQXH4PXu8=',
        state: AUCT.OrderState.ORDER_PARTIALLY_FILLED,
        units: 20,
        unitsUnfulfilled: 10,
        reservedValueSat: '169250',
        creationTimestampNs: '1605372478047663000',
        eventsList: [],
        minUnitsMatch: 1,
        channelType: 1,
        allowedNodeIdsList: [],
        notAllowedNodeIdsList: [],
        auctionType: AUCT.AuctionType.AUCTION_TYPE_BTC_INBOUND_LIQUIDITY,
        isPublic: true,
      },
      leaseDurationBlocks: 2016,
      version: 1,
      minNodeTier: 1,
      selfChanBalance: '0',
      sidecarTicket: '',
      unannouncedChannel: false,
      zeroConfChannel: false,
    },
    {
      details: {
        traderKey: poolInitAccount.traderKey,
        rateFixed: 826,
        amt: '3000000',
        maxBatchFeeRateSatPerKw: '25000',
        orderNonce: 'ZVQRWJ8pTkV5ln/ekUlFICajxLH4M7/B1rdCR8z+eqw=',
        state: AUCT.OrderState.ORDER_CANCELED,
        units: 30,
        unitsUnfulfilled: 30,
        reservedValueSat: '0',
        creationTimestampNs: '1605372382040897300',
        eventsList: [],
        minUnitsMatch: 1,
        channelType: 1,
        allowedNodeIdsList: [],
        notAllowedNodeIdsList: [],
        auctionType: AUCT.AuctionType.AUCTION_TYPE_BTC_INBOUND_LIQUIDITY,
        isPublic: true,
      },
      leaseDurationBlocks: 2016,
      version: 1,
      minNodeTier: 1,
      selfChanBalance: '0',
      sidecarTicket: '',
      unannouncedChannel: false,
      zeroConfChannel: false,
    },
    {
      details: {
        traderKey: poolInitAccount.traderKey,
        rateFixed: 1240,
        amt: '2000000',
        maxBatchFeeRateSatPerKw: '25000',
        orderNonce: 'BAgKGEv94LUG6lizcf0LxT3CJiqMTpvq27XRqr/IG00=',
        state: AUCT.OrderState.ORDER_SUBMITTED,
        units: 20,
        unitsUnfulfilled: 20,
        reservedValueSat: '333500',
        creationTimestampNs: '1605372096883950800',
        eventsList: [],
        minUnitsMatch: 1,
        channelType: 1,
        allowedNodeIdsList: [],
        notAllowedNodeIdsList: [],
        auctionType: AUCT.AuctionType.AUCTION_TYPE_BTC_INBOUND_LIQUIDITY,
        isPublic: true,
      },
      leaseDurationBlocks: 2016,
      version: 1,
      minNodeTier: 1,
      selfChanBalance: '0',
      sidecarTicket: '',
      unannouncedChannel: false,
      zeroConfChannel: false,
    },
  ],
};

export const poolQuoteOrder: POOL.QuoteOrderResponse.AsObject = {
  ratePerBlock: 0.00000248,
  ratePercent: 0.000248,
  totalExecutionFeeSat: '5001',
  totalPremiumSat: '24998',
  worstCaseChainFeeSat: '40810',
};

export const poolSubmitOrder: POOL.SubmitOrderResponse.AsObject = {
  acceptedOrderNonce: 'W4XLkXhEKMcKfzV+Ex+jXQJeaVXoCoKQzptMRi6g+ZA=',
  updatedSidecarTicket: '',
};

export const poolInvalidOrder: AUCT.InvalidOrder.AsObject = {
  orderNonce: 'W4XLkXhEKMcKfzV+Ex+jXQJeaVXoCoKQzptMRi6g+ZA=',
  failReason: AUCT.InvalidOrder.FailReason.INVALID_AMT,
  failString: 'Invalid Amount',
};

export const poolCancelOrder: POOL.CancelOrderResponse.AsObject = {};

export const poolBatchSnapshot: AUCT.BatchSnapshotResponse.AsObject = {
  version: 0,
  batchId: 'A64GSAcrLtlDCUmKXLAv2bxngryfrSxrK9W8s+cl7Vb4',
  prevBatchId: 'Ag/jvmtyBec1qrOj1FuswaZozPADVTguxmLjCa+E4wYS',
  clearingPriceRate: 19841,
  creationTimestampNs: '1610763907325185500',
  matchedOrdersList: [],
  matchedMarketsMap: [
    [
      2016,
      {
        clearingPriceRate: 19841,
        matchedOrdersList: [
          {
            ask: {
              version: 0,
              leaseDurationBlocks: 8640,
              rateFixed: 347,
              chanType: 0,
            },
            bid: {
              version: 0,
              leaseDurationBlocks: 1008,
              rateFixed: 19841,
              chanType: 0,
            },
            matchingRate: 19841,
            totalSatsCleared: '7700000',
            unitsMatched: 77,
          },
          {
            ask: {
              version: 0,
              leaseDurationBlocks: 8640,
              rateFixed: 347,
              chanType: 0,
            },
            bid: {
              version: 0,
              leaseDurationBlocks: 1008,
              rateFixed: 19841,
              chanType: 0,
            },
            matchingRate: 19841,
            totalSatsCleared: '30000000',
            unitsMatched: 300,
          },
        ],
      },
    ],
    [
      4032,
      {
        clearingPriceRate: 8640,
        matchedOrdersList: [
          {
            ask: {
              version: 0,
              leaseDurationBlocks: 8640,
              rateFixed: 347,
              chanType: 0,
            },
            bid: {
              version: 0,
              leaseDurationBlocks: 1008,
              rateFixed: 19841,
              chanType: 0,
            },
            matchingRate: 19841,
            totalSatsCleared: '7700000',
            unitsMatched: 77,
          },
          {
            ask: {
              version: 0,
              leaseDurationBlocks: 8640,
              rateFixed: 347,
              chanType: 0,
            },
            bid: {
              version: 0,
              leaseDurationBlocks: 1008,
              rateFixed: 19841,
              chanType: 0,
            },
            matchingRate: 19841,
            totalSatsCleared: '20000000',
            unitsMatched: 300,
          },
        ],
      },
    ],
  ],
  batchTxId: '6f29af3cb54480fec52d3a48ba94a5327aa31ed2c3b85ee8f0fd0da2f5ea8620',
  batchTx:
    '02000000000103f1a75ac5d0fdd52393410f71ead0bd9ab8d0af3974d47e86dde91c76cab46bb9010000000000000000f1a75ac5d0fdd52393410f71ead0bd9ab8d0af3974d47e86dde91c76cab46bb90300000000000000004324d5c4a412675ee5262aaa5afcca95ecdeb94764145823b93a41c53a7d07ef0600000000000000000523751100000000002200200dd535051271e7718bedb65e6861b31815a644b91d3a5107a74fa8ee16c823ed207e750000000000220020a70ab73d7d1c2efaeb280e26b98df9761d8e37cb3160cafc29381e8086254f7180c3c9010000000022002050dba23ca20d53adf5f94695040839c0be1ef609b70e19713c1d88d7d0db04f5c008fe0200000000220020bb8bc3b7c011060ff4002ab1c995a4eddcd1b4ef41aee5dca690a2903ede53ea24819e0300000000220020a3e3dfb76e7a4e72634bb5ee3006491fffbaecafe8882554d9a6b434f0b841aa02473044022066fe9cc1b0ecc84367839cdbaad606888260e6349d6c21f22186660f78dbe38202206fa0066fd0a4385348c615777b3e751db5f5d8306771522445a873dc7bed56a101232103d7c453a1aefcbbc6043372036db9d76816f830865392f97a262c447b59eb332eac03483045022100db6895c68e4cbd5fb83af7c37164dbf3da0c1222fb55177c4c367f05e9bed55902206b4775bb1c978380f95a9c444f392a53803b8b6d5508d41d0982a540d0c9062601483045022100ecc4ccaf440eae13e2afb8461f1c28d66af87f7e5d880732ae2fe72f85d5572302204656d5dbc963166c7bd92a93631fe49e20e4b1121914ca76e7cb87c3d983ee5a014e2103c736dec8b8f45cecd32fcedfcb8c0be92a2a3b40bffa8b1ce64640972a19fc49ad2102c642aaf70c56aa156db9546fc6e76c484b6a091b645fb848fd51916bd1e931caac736403cc531cb16803483045022100ed30c4f090dbe19d4f1dcb28f2701cf8a0bbf671a360d217384332248502de6c022025dac44cd380eda709bda3cbe6dbbe7a916549994bd72e48470a322a89fbbfba01473044022070c7e4909786fe5d482f35e1301d5cd2b5932c91b23d16bf699fe6bf455165220220015a3241a84620a27c110f307906f7047262947694c29b4752891d8b00153054014e2103305a3323068e66461ac3b247a2bfdc339959c3975da0ac4677e4d027462aaa14ad2102e2ec3f93e098e073490ad19fda9c11a92e2ed02ed3eecc5527972dba99b6d4e1ac736403a4f51bb16800000000',
  batchTxFeeRateSatPerKw: '12574',
};

export const poolBatchSnapshots: AUCT.BatchSnapshotsResponse.AsObject = {
  batchesList: [...Array(20)].map((_, i) => ({
    ...poolBatchSnapshot,
    batchId: `${i}-${poolBatchSnapshot.batchId}`,
    prevBatchId: `${i + 1}-${poolBatchSnapshot.prevBatchId}`,
  })),
};

export const poolLeaseDurations: POOL.LeaseDurationResponse.AsObject = {
  leaseDurationsMap: [], // deprecated
  leaseDurationBucketsMap: [
    [2016, AUCT.DurationBucketState.MARKET_OPEN],
    [4032, AUCT.DurationBucketState.MARKET_OPEN],
    [6048, AUCT.DurationBucketState.ACCEPTING_ORDERS],
    [8064, AUCT.DurationBucketState.MARKET_CLOSED],
  ],
};

export const poolNextBatchInfo: POOL.NextBatchInfoResponse.AsObject = {
  clearTimestamp: '1605936138',
  confTarget: 6,
  feeRateSatPerKw: '12500',
  autoRenewExtensionBlocks: 3024,
};

export const poolNodeRatings: POOL.NodeRatingResponse.AsObject = {
  nodeRatingsList: [
    {
      nodePubkey: b64(lndGetInfo.identityPubkey),
      nodeTier: AUCT.NodeTier.TIER_1,
    },
  ],
};

const stringToChannelPoint = (cp: string) => ({
  txid: b64(cp.split(':')[0], true),
  outputIndex: parseInt(cp.split(':')[1]),
});
export const poolLeases: POOL.LeasesResponse.AsObject = {
  leasesList: [
    {
      channelPoint: stringToChannelPoint(lndListChannels.channelsList[5].channelPoint),
      channelAmtSat: '1000000',
      channelDurationBlocks: 2016,
      channelLeaseExpiry: 2304,
      premiumSat: '9999',
      executionFeeSat: '1001',
      chainFeeSat: '4606',
      clearingRatePrice: '4960',
      orderFixedRate: '4960',
      orderNonce: 'Iw842N6B77EGuZCy5oiBDRAvJrQoIrlsjPosuKevT9g=',
      matchedOrderNonce: 'NWKpd8HC5zIWr4f2CRbLEVv+g9s5LeArnK9xREAZ2mY=',
      purchased: false,
      channelRemoteNodeKey: 'ArW+q/+aS+teUy/E6TgVgVZ2sQ9wX/YJBbwH6if4SuLA',
      channelNodeTier: 1,
      selfChanBalance: '0',
      sidecarChannel: false,
    },
    {
      channelPoint: stringToChannelPoint(lndListChannels.channelsList[6].channelPoint),
      channelAmtSat: '2000000',
      channelDurationBlocks: 2016,
      channelLeaseExpiry: 2304,
      premiumSat: '19998',
      executionFeeSat: '2001',
      chainFeeSat: '4606',
      clearingRatePrice: '4960',
      orderFixedRate: '4960',
      orderNonce: 'Iw842N6B77EGuZCy5oiBDRAvJrQoIrlsjPosuKevT9g=',
      matchedOrderNonce: 'NWKpd8HC5zIWr4f2CRbLEVv+g9s5LeArnK9xREAZ2mY=',
      purchased: false,
      channelRemoteNodeKey: 'A9L6+xEwFa2vULND3YYfdoCQwHqlzE5UyLvvQ+gfapg+',
      channelNodeTier: 1,
      selfChanBalance: '0',
      sidecarChannel: false,
    },
    {
      channelPoint: stringToChannelPoint(lndListChannels.channelsList[7].channelPoint),
      channelAmtSat: '1000000',
      channelDurationBlocks: 2016,
      channelLeaseExpiry: 2317,
      premiumSat: '9999',
      executionFeeSat: '1001',
      chainFeeSat: '4606',
      clearingRatePrice: '4960',
      orderFixedRate: '4960',
      orderNonce: 'NWKpd8HC5zIWr4f2CRbLEVv+g9s5LeArnK9xREAZ2mY=',
      matchedOrderNonce: 'Iw842N6B77EGuZCy5oiBDRAvJrQoIrlsjPosuKevT9g=',
      purchased: true,
      channelRemoteNodeKey: 'A9L6+xEwFa2vULND3YYfdoCQwHqlzE5UyLvvQ+gfapg+',
      channelNodeTier: 1,
      selfChanBalance: '0',
      sidecarChannel: false,
    },
    {
      channelPoint: stringToChannelPoint(lndListChannels.channelsList[8].channelPoint),
      channelAmtSat: '1000000',
      channelDurationBlocks: 2016,
      channelLeaseExpiry: 2317,
      premiumSat: '9999',
      executionFeeSat: '1001',
      chainFeeSat: '4606',
      clearingRatePrice: '4960',
      orderFixedRate: '4960',
      orderNonce: 'NWKpd8HC5zIWr4f2CRbLEVv+g9s5LeArnK9xREAZ2mY=',
      matchedOrderNonce: 'Iw842N6B77EGuZCy5oiBDRAvJrQoIrlsjPosuKevT9g=',
      purchased: true,
      channelRemoteNodeKey: 'ArW+q/+aS+teUy/E6TgVgVZ2sQ9wX/YJBbwH6if4SuLA',
      channelNodeTier: 1,
      selfChanBalance: '0',
      sidecarChannel: false,
    },
    {
      channelPoint: stringToChannelPoint(lndListChannels.channelsList[9].channelPoint),
      channelAmtSat: '1000000',
      channelDurationBlocks: 2016,
      channelLeaseExpiry: 2320,
      premiumSat: '4999',
      executionFeeSat: '1001',
      chainFeeSat: '8162',
      clearingRatePrice: '2480',
      orderFixedRate: '2480',
      orderNonce: 'nRXHe7gMTmox7AXMW6yVYg9Lp4ZMNps6KRGQXH4PXu8=',
      matchedOrderNonce: 'Iw842N6B77EGuZCy5oiBDRAvJrQoIrlsjPosuKevT9g=',
      purchased: true,
      channelRemoteNodeKey: 'A9L6+xEwFa2vULND3YYfdoCQwHqlzE5UyLvvQ+gfapg+',
      channelNodeTier: 1,
      selfChanBalance: '0',
      sidecarChannel: false,
    },
  ],
  totalAmtEarnedSat: '29997',
  totalAmtPaidSat: '57588',
};

export const poolRegisterSidecar: POOL.SidecarTicket.AsObject = {
  ticket:
    'sidecar15o9CCm2VAFa14vyskEhpqxmDjiknDgJaKHL6nZdMHv5f9jSpnTM9jSZecJjDzvqgqbeBRLBupcvtL9cPefg3q2iUfcFYMgFCgfxuicf4ZSpZ9ndwYXJ8F7yrw55TSuxMyZMEFyoMh4rWJX95m5iBWeezDXHSXqFzSVmuFCTtp5KXombXZr64waygqNweCUBnvjTDqsz12EnxE1tsmSoHiFYc1t15J8rHNYAucb9yQWRQTRu146QuBbbLtMEPL62Y',
};

export const litListSessions: LIT.ListSessionsResponse.AsObject = {
  sessionsList: [
    {
      id: '',
      devServer: true,
      expiryTimestampSeconds: '253370782800',
      label: 'Default Session',
      localPublicKey: 'AkHHPwMqjOyBaBVE5o6ZE4opJHkCN7Ut/Gs1E9FekLjn',
      mailboxServerAddr: 'aperture:11110',
      pairingSecret: '9JtMeel8DA9v3Pw=',
      pairingSecretMnemonic: 'virus surprise bunker spray school amateur satoshi panel',
      remotePublicKey: '',
      sessionState: LIT.SessionState.STATE_CREATED,
      sessionType: LIT.SessionType.TYPE_UI_PASSWORD,
      createdAt: '253300000000',
      accountId: '',
      groupId: '',
      revokedAt: '453300000000',
      autopilotFeatureInfoMap: [
        [
          'SampleFeature',
          {
            rulesMap: [
              [
                'channel-policy-bounds',
                {
                  chanPolicyBounds: {
                    minBaseMsat: '0',
                    maxBaseMsat: '10',
                    minRatePpm: 1,
                    maxRatePpm: 10,
                    minCltvDelta: 18,
                    maxCltvDelta: 18,
                    minHtlcMsat: '0',
                    maxHtlcMsat: '0',
                  },
                },
              ],
              [
                'channel-restriction',
                {
                  channelRestrict: {
                    channelIdsList: [],
                  },
                },
              ],
              [
                'history-limit',
                {
                  historyLimit: {
                    startTime: '0',
                    duration: '0',
                  },
                },
              ],
              [
                'peer-restriction',
                {
                  peerRestrict: {
                    peerIdsList: [],
                  },
                },
              ],
              [
                'rate-limit',
                {
                  rateLimit: {
                    readLimit: {
                      iterations: 50,
                      numHours: 1,
                    },
                    writeLimit: {
                      iterations: 50,
                      numHours: 50,
                    },
                  },
                },
              ],
            ],
          },
        ],
      ],
      featureConfigsMap: [['SampleFeature', '{}']],
    },
    {
      id: '',
      devServer: true,
      expiryTimestampSeconds: '253370782800',
      label: 'Default Session',
      localPublicKey: 'ArNt9nOsy8c8p8XtNPIBPoSXjzBfsZ87GVnz6ADTdhVw',
      mailboxServerAddr: 'aperture:11110',
      pairingSecret: 'a51LAsjfD7AAk9c=',
      pairingSecretMnemonic: 'high tumble scheme museum valley submit across kit',
      remotePublicKey: '',
      sessionState: LIT.SessionState.STATE_EXPIRED,
      sessionType: LIT.SessionType.TYPE_UI_PASSWORD,
      createdAt: '253300000000',
      revokedAt: '453300000000',
      groupId: '',
      accountId: '',
      autopilotFeatureInfoMap: [
        [
          'SampleFeature',
          {
            rulesMap: [
              [
                'channel-policy-bounds',
                {
                  chanPolicyBounds: {
                    minBaseMsat: '0',
                    maxBaseMsat: '10',
                    minRatePpm: 1,
                    maxRatePpm: 10,
                    minCltvDelta: 18,
                    maxCltvDelta: 18,
                    minHtlcMsat: '0',
                    maxHtlcMsat: '0',
                  },
                },
              ],
              [
                'channel-restriction',
                {
                  channelRestrict: {
                    channelIdsList: [],
                  },
                },
              ],
              [
                'history-limit',
                {
                  historyLimit: {
                    startTime: '0',
                    duration: '0',
                  },
                },
              ],
              [
                'peer-restriction',
                {
                  peerRestrict: {
                    peerIdsList: [],
                  },
                },
              ],
              [
                'rate-limit',
                {
                  rateLimit: {
                    readLimit: {
                      iterations: 50,
                      numHours: 1,
                    },
                    writeLimit: {
                      iterations: 50,
                      numHours: 50,
                    },
                  },
                },
              ],
            ],
          },
        ],
      ],
      featureConfigsMap: [['SampleFeature', '{}']],
    },
  ],
};

export const litSubServerStatus: STATUS.SubServerStatusResp.AsObject = {
  subServersMap: [
    [
      'faraday',
      {
        disabled: false,
        running: true,
        error: '',
      },
    ],
    [
      'lit',
      {
        disabled: false,
        running: true,
        error: '',
      },
    ],
    [
      'lnd',
      {
        disabled: false,
        running: true,
        error: '',
      },
    ],
    [
      'loop',
      {
        disabled: false,
        running: true,
        error: '',
      },
    ],
    [
      'pool',
      {
        disabled: false,
        running: true,
        error: '',
      },
    ],
    [
      'taproot-assets',
      {
        disabled: false,
        running: true,
        error: '',
      },
    ],
  ],
};

// collection of sample API responses
export const sampleApiResponses: Record<string, any> = {
  'lnrpc.Lightning.GetInfo': lndGetInfo,
  'lnrpc.Lightning.GetNodeInfo': lndGetNodeInfo,
  'lnrpc.Lightning.GetChanInfo': lndGetChanInfo,
  'lnrpc.Lightning.ChannelBalance': lndChannelBalance,
  'lnrpc.Lightning.WalletBalance': lndWalletBalance,
  'lnrpc.Lightning.ListChannels': lndListChannels,
  'lnrpc.Lightning.PendingChannels': lndPendingChannels,
  'looprpc.SwapClient.ListSwaps': loopListSwaps,
  'looprpc.SwapClient.LoopOutTerms': loopOutTerms,
  'looprpc.SwapClient.GetLoopInTerms': loopInTerms,
  'looprpc.SwapClient.LoopOutQuote': loopOutQuote,
  'looprpc.SwapClient.GetLoopInQuote': loopInQuote,
  'looprpc.SwapClient.LoopIn': loopSwapResponse,
  'looprpc.SwapClient.LoopOut': loopSwapResponse,
  'poolrpc.Trader.GetInfo': poolGetInfo,
  'poolrpc.Trader.ListAccounts': poolListAccounts,
  'poolrpc.Trader.QuoteAccount': poolQuoteAccount,
  'poolrpc.Trader.InitAccount': poolInitAccount,
  'poolrpc.Trader.CloseAccount': poolCloseAccount,
  'poolrpc.Trader.RenewAccount': poolRenewAccount,
  'poolrpc.Trader.DepositAccount': poolDepositAccount,
  'poolrpc.Trader.WithdrawAccount': poolWithdrawAccount,
  'poolrpc.Trader.ListOrders': poolListOrders,
  'poolrpc.Trader.QuoteOrder': poolQuoteOrder,
  'poolrpc.Trader.SubmitOrder': poolSubmitOrder,
  'poolrpc.Trader.CancelOrder': poolCancelOrder,
  'poolrpc.Trader.BatchSnapshot': poolBatchSnapshot,
  'poolrpc.Trader.BatchSnapshots': poolBatchSnapshots,
  'poolrpc.Trader.LeaseDurations': poolLeaseDurations,
  'poolrpc.Trader.NextBatchInfo': poolNextBatchInfo,
  'poolrpc.Trader.NodeRatings': poolNodeRatings,
  'poolrpc.Trader.Leases': poolLeases,
  'poolrpc.Trader.RegisterSidecar': poolRegisterSidecar,
  'litrpc.Sessions.ListSessions': litListSessions,
  'litrpc.Status.SubServerStatus': litSubServerStatus,
};
