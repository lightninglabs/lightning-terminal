import * as AUCT from 'types/generated/auctioneer_pb';
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
      htlcIndex: 0,
      forwardingChannel: 124244814004224,
      forwardingHtlcIndex: 0,
    },
  ],
  csvDelay: 1802,
  pb_private: false,
  initiator: true,
  chanStatusFlags: 'ChanStatusDefault',
  localChanReserveSat: 150000,
  remoteChanReserveSat: 150000,
  staticRemoteKey: true,
  commitmentType: LND.CommitmentType.STATIC_REMOTE_KEY,
  lifetime: 21802,
  uptime: 21802,
  closeAddress: '',
  pushAmountSat: 5000000,
  thawHeight: 0,
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

const txIdBytes = b64(txId, true);
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
    openInitiator: 1,
    closeInitiator: 1,
    resolutionsList: [],
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
  label: '',
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
    failureReason: (i % 2 === 0 ? 0 : i % 7) as LOOP.SwapStatus.AsObject['failureReason'],
    initiationTime: 1586390353623905000 + i * 100000000000000,
    lastUpdateTime: 1586398369729857000 + i * 200000000000000,
    htlcAddress: 'bcrt1qzu4077erkr78k52yuf2rwkk6ayr6m3wtazdfz2qqmd7taa5vvy9s5d75gd',
    htlcAddressP2wsh: 'bcrt1qzu4077erkr78k52yuf2rwkk6ayr6m3wtazdfz2qqmd7taa5vvy9s5d75gd',
    htlcAddressNp2wsh: '',
    costServer: 66,
    costOnchain: 6812,
    costOffchain: 2,
    label: `Sample Swap #${i + 1}`,
  })),
};

export const loopOutTerms: LOOP.OutTermsResponse.AsObject = {
  minSwapAmount: 250000,
  maxSwapAmount: 1000000,
  minCltvDelta: 20,
  maxCltvDelta: 60,
};

export const loopInTerms: LOOP.InTermsResponse.AsObject = {
  minSwapAmount: 250000,
  maxSwapAmount: 1000000,
};

export const loopOutQuote: LOOP.OutQuoteResponse.AsObject = {
  cltvDelta: 50,
  htlcSweepFeeSat: 7387,
  prepayAmtSat: 1337,
  swapFeeSat: 83,
  swapPaymentDest: 'Au1a9/hEsbxHUOwFC1QwxZq6EnnKYtpAdc74OZK8/syU',
};

export const loopInQuote: LOOP.InQuoteResponse.AsObject = {
  cltvDelta: 50,
  htlcPublishFeeSat: 7387,
  swapFeeSat: 83,
};

export const loopSwapResponse: LOOP.SwapResponse.AsObject = {
  htlcAddress: 'bcrt1qkjct8aqxfwyla50mfxdnzlmuphg3zwuz2zmuy99c9sw67xj7tn2sfkflhw',
  htlcAddressNp2wsh: '',
  htlcAddressP2wsh: 'bcrt1qkjct8aqxfwyla50mfxdnzlmuphg3zwuz2zmuy99c9sw67xj7tn2sfkflhw',
  id: '18e17a2f44efc7f344ef6330281765e569315f93d3eaf9b0f959b404836e3480',
  idBytes: 'GOF6L0Tvx/NE72MwKBdl5WkxX5PT6vmw+Vm0BINuNIA=',
  serverMessage: 'Loop, there it is!',
};

//
// Pool API Responses
//

export const poolInitAccount: POOL.Account.AsObject = {
  availableBalance: 10000000,
  latestTxid: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
  expirationHeight: 4334,
  outpoint: {
    outputIndex: 0,
    txid: 'fY/L3gq49iu3bykuK32Ar95ewk3a2wUkFSOGfmGFncc=',
  },
  state: POOL.AccountState.OPEN,
  traderKey: 'Ap+9XjK2X8EOrmAJvcvWS1B9jt3xLYka0S7aMru0Bude',
  value: 30000000,
};

export const poolQuoteAccount: POOL.QuoteAccountResponse.AsObject = {
  minerFeeRateSatPerKw: 12500,
  minerFeeTotal: 7650,
};

export const poolCloseAccount: POOL.CloseAccountResponse.AsObject = {
  closeTxid: '+BQm/hnM0SleT2NxS7bdw0JNDuvIMhL4qxLUkdbCJdo=',
};

export const poolListAccounts: POOL.ListAccountsResponse.AsObject = {
  accountsList: [
    poolInitAccount,
    {
      availableBalance: 15000000,
      latestTxid: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
      expirationHeight: 4331,
      outpoint: {
        outputIndex: 0,
        txid: 'AEf0nMpgbBL4ugP59b6MAV0eSZ+OQsHpae1j9gWPcQ0=',
      },
      state: POOL.AccountState.OPEN,
      traderKey: 'A1XCKczWrUUjZg4rmtYoQnji2mGEyLxM8FvIPZ9ZnRCk',
      value: 15000000,
    },
    {
      availableBalance: 7773185,
      latestTxid: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
      expirationHeight: 4328,
      outpoint: {
        outputIndex: 0,
        txid: 'r+q2xqhXJ4PoyOffB73PdFMtiiszxuot05zJ3UTnI1M=',
      },
      state: POOL.AccountState.OPEN,
      traderKey: 'A9Mua6d2a+1NZZ8knxJ/XtE3VENxQO4erD9Y3igCmH9q',
      value: 10000000,
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
    value: poolInitAccount.value - 1,
  },
};

export const poolListOrders: POOL.ListOrdersResponse.AsObject = {
  asksList: [
    {
      details: {
        traderKey: 'A9Mua6d2a+1NZZ8knxJ/XtE3VENxQO4erD9Y3igCmH9q',
        rateFixed: 372,
        amt: 1500000,
        maxBatchFeeRateSatPerKw: 125000,
        orderNonce: 'HuKK1bRqo62yzG1mymSNaF9xi70fVWk4PZD98pglCgA=',
        state: AUCT.OrderState.ORDER_SUBMITTED,
        units: 15,
        unitsUnfulfilled: 15,
        reservedValueSat: 0,
        creationTimestampNs: 1602960026879575142,
        eventsList: [],
        minUnitsMatch: 5,
      },
      leaseDurationBlocks: 2016,
      version: 0,
    },
    {
      details: {
        traderKey: 'Ap+9XjK2X8EOrmAJvcvWS1B9jt3xLYka0S7aMru0Bude',
        rateFixed: 496,
        amt: 1000000,
        maxBatchFeeRateSatPerKw: 125000,
        orderNonce: '7ScYDUtk+CY5tTCjrxLF0Hu35mTC9d5WaKLIOO5T3Zw=',
        state: AUCT.OrderState.ORDER_SUBMITTED,
        units: 10,
        unitsUnfulfilled: 10,
        reservedValueSat: 0,
        creationTimestampNs: 1602960026879575142,
        eventsList: [],
        minUnitsMatch: 5,
      },
      leaseDurationBlocks: 2016,
      version: 0,
    },
  ],
  bidsList: [
    {
      details: {
        traderKey: 'A9Mua6d2a+1NZZ8knxJ/XtE3VENxQO4erD9Y3igCmH9q',
        rateFixed: 992,
        amt: 500000,
        maxBatchFeeRateSatPerKw: 125000,
        orderNonce: 'W4XLkXhEKMcKfzV+Ex+jXQJeaVXoCoKQzptMRi6g+ZA=',
        state: AUCT.OrderState.ORDER_SUBMITTED,
        units: 5,
        unitsUnfulfilled: 5,
        reservedValueSat: 0,
        creationTimestampNs: 1602960026879575142,
        eventsList: [],
        minUnitsMatch: 5,
      },
      leaseDurationBlocks: 2016,
      version: 0,
      minNodeTier: AUCT.NodeTier.TIER_1,
    },
    {
      details: {
        traderKey: 'Ap+9XjK2X8EOrmAJvcvWS1B9jt3xLYka0S7aMru0Bude',
        rateFixed: 744,
        amt: 300000,
        maxBatchFeeRateSatPerKw: 125000,
        orderNonce: 'bQ8sbc9+HtMVoBD86YMbyOH8GvugrAWhULU2J4dGZQ0=',
        state: AUCT.OrderState.ORDER_SUBMITTED,
        units: 3,
        unitsUnfulfilled: 3,
        reservedValueSat: 0,
        creationTimestampNs: 1602960026879575142,
        eventsList: [],
        minUnitsMatch: 5,
      },
      leaseDurationBlocks: 2016,
      version: 0,
      minNodeTier: AUCT.NodeTier.TIER_1,
    },
  ],
};

export const poolSubmitOrder: POOL.SubmitOrderResponse.AsObject = {
  acceptedOrderNonce: 'W4XLkXhEKMcKfzV+Ex+jXQJeaVXoCoKQzptMRi6g+ZA=',
};

export const poolInvalidOrder: AUCT.InvalidOrder.AsObject = {
  orderNonce: 'W4XLkXhEKMcKfzV+Ex+jXQJeaVXoCoKQzptMRi6g+ZA=',
  failReason: AUCT.InvalidOrder.FailReason.INVALID_AMT,
  failString: 'Invalid Amount',
};

export const poolCancelOrder: POOL.CancelOrderResponse.AsObject = {};

export const poolBatchSnapshot: AUCT.BatchSnapshotResponse.AsObject = {
  version: 0,
  batchId: '0260ad81d3108e011dfb7ec3be22cacf2e6406419ae210ed4e7a4a294a87b840c8',
  prevBatchId: '02df8606a074ccec54ff17cd62bff9351f3bcf0fabdab0ccc60b44a878b1b051b9',
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
      totalSatsCleared: 7700000,
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
      totalSatsCleared: 30000000,
      unitsMatched: 300,
    },
  ],
  batchTxId: '6f29af3cb54480fec52d3a48ba94a5327aa31ed2c3b85ee8f0fd0da2f5ea8620',
  batchTx:
    '02000000000103f1a75ac5d0fdd52393410f71ead0bd9ab8d0af3974d47e86dde91c76cab46bb9010000000000000000f1a75ac5d0fdd52393410f71ead0bd9ab8d0af3974d47e86dde91c76cab46bb90300000000000000004324d5c4a412675ee5262aaa5afcca95ecdeb94764145823b93a41c53a7d07ef0600000000000000000523751100000000002200200dd535051271e7718bedb65e6861b31815a644b91d3a5107a74fa8ee16c823ed207e750000000000220020a70ab73d7d1c2efaeb280e26b98df9761d8e37cb3160cafc29381e8086254f7180c3c9010000000022002050dba23ca20d53adf5f94695040839c0be1ef609b70e19713c1d88d7d0db04f5c008fe0200000000220020bb8bc3b7c011060ff4002ab1c995a4eddcd1b4ef41aee5dca690a2903ede53ea24819e0300000000220020a3e3dfb76e7a4e72634bb5ee3006491fffbaecafe8882554d9a6b434f0b841aa02473044022066fe9cc1b0ecc84367839cdbaad606888260e6349d6c21f22186660f78dbe38202206fa0066fd0a4385348c615777b3e751db5f5d8306771522445a873dc7bed56a101232103d7c453a1aefcbbc6043372036db9d76816f830865392f97a262c447b59eb332eac03483045022100db6895c68e4cbd5fb83af7c37164dbf3da0c1222fb55177c4c367f05e9bed55902206b4775bb1c978380f95a9c444f392a53803b8b6d5508d41d0982a540d0c9062601483045022100ecc4ccaf440eae13e2afb8461f1c28d66af87f7e5d880732ae2fe72f85d5572302204656d5dbc963166c7bd92a93631fe49e20e4b1121914ca76e7cb87c3d983ee5a014e2103c736dec8b8f45cecd32fcedfcb8c0be92a2a3b40bffa8b1ce64640972a19fc49ad2102c642aaf70c56aa156db9546fc6e76c484b6a091b645fb848fd51916bd1e931caac736403cc531cb16803483045022100ed30c4f090dbe19d4f1dcb28f2701cf8a0bbf671a360d217384332248502de6c022025dac44cd380eda709bda3cbe6dbbe7a916549994bd72e48470a322a89fbbfba01473044022070c7e4909786fe5d482f35e1301d5cd2b5932c91b23d16bf699fe6bf455165220220015a3241a84620a27c110f307906f7047262947694c29b4752891d8b00153054014e2103305a3323068e66461ac3b247a2bfdc339959c3975da0ac4677e4d027462aaa14ad2102e2ec3f93e098e073490ad19fda9c11a92e2ed02ed3eecc5527972dba99b6d4e1ac736403a4f51bb16800000000',
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
  'looprpc.SwapClient.LoopOutTerms': loopOutTerms,
  'looprpc.SwapClient.GetLoopInTerms': loopInTerms,
  'looprpc.SwapClient.LoopOutQuote': loopOutQuote,
  'looprpc.SwapClient.GetLoopInQuote': loopInQuote,
  'looprpc.SwapClient.LoopIn': loopSwapResponse,
  'looprpc.SwapClient.LoopOut': loopSwapResponse,
  'poolrpc.Trader.ListAccounts': poolListAccounts,
  'poolrpc.Trader.QuoteAccount': poolQuoteAccount,
  'poolrpc.Trader.InitAccount': poolInitAccount,
  'poolrpc.Trader.CloseAccount': poolCloseAccount,
  'poolrpc.Trader.DepositAccount': poolDepositAccount,
  'poolrpc.Trader.WithdrawAccount': poolWithdrawAccount,
  'poolrpc.Trader.ListOrders': poolListOrders,
  'poolrpc.Trader.SubmitOrder': poolSubmitOrder,
  'poolrpc.Trader.CancelOrder': poolCancelOrder,
  'poolrpc.Trader.BatchSnapshot': poolBatchSnapshot,
};
