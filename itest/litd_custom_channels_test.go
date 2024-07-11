package itest

import (
	"context"
	"fmt"
	"slices"
	"time"

	"github.com/btcsuite/btcd/chaincfg/chainhash"
	"github.com/lightninglabs/taproot-assets/itest"
	"github.com/lightninglabs/taproot-assets/proof"
	"github.com/lightninglabs/taproot-assets/tapchannel"
	"github.com/lightninglabs/taproot-assets/taprpc"
	"github.com/lightninglabs/taproot-assets/taprpc/mintrpc"
	tchrpc "github.com/lightninglabs/taproot-assets/taprpc/tapchannelrpc"
	"github.com/lightninglabs/taproot-assets/taprpc/universerpc"
	"github.com/lightningnetwork/lnd/fn"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lntest"
	"github.com/lightningnetwork/lnd/lntest/wait"
	"github.com/stretchr/testify/require"
)

var (
	dummyMetaData = &taprpc.AssetMeta{
		Data: []byte("some metadata"),
	}

	itestAsset = &mintrpc.MintAsset{
		AssetType: taprpc.AssetType_NORMAL,
		Name:      "itest-asset-cents",
		AssetMeta: dummyMetaData,
		Amount:    1_000_000,
	}

	shortTimeout = time.Second * 5
)

var (
	lndArgsTemplate = []string{
		"--trickledelay=50",
		"--gossip.sub-batch-delay=5ms",
		"--caches.rpc-graph-cache-duration=100ms",
		"--default-remote-max-htlcs=483",
		"--dust-threshold=5000000",
		"--rpcmiddleware.enable",
		"--protocol.anchors",
		"--protocol.option-scid-alias",
		"--protocol.zero-conf",
		"--protocol.simple-taproot-chans",
		"--protocol.simple-taproot-overlay-chans",
		"--protocol.custom-message=17",
		"--accept-keysend",
		"--debuglevel=trace,GRPC=error,BTCN=info",
	}
	litdArgsTemplate = []string{
		"--taproot-assets.allow-public-uni-proof-courier",
		"--taproot-assets.universe.public-access=rw",
		"--taproot-assets.universe.sync-all-assets",
		"--taproot-assets.universerpccourier.skipinitdelay",
		"--taproot-assets.universerpccourier.backoffresetwait=1s",
		"--taproot-assets.universerpccourier.numtries=5",
		"--taproot-assets.universerpccourier.initialbackoff=300ms",
		"--taproot-assets.universerpccourier.maxbackoff=600ms",
		"--taproot-assets.experimental.rfq.priceoracleaddress=" +
			"use_mock_price_oracle_service_promise_to_" +
			"not_use_on_mainnet",
		"--taproot-assets.experimental.rfq.mockoracleassetsperbtc=" +
			"5820600",
		"--taproot-assets.universerpccourier.skipinitdelay",
		"--taproot-assets.universerpccourier.backoffresetwait=100ms",
		"--taproot-assets.universerpccourier.initialbackoff=300ms",
		"--taproot-assets.universerpccourier.maxbackoff=600ms",
		"--taproot-assets.custodianproofretrievaldelay=500ms",
	}
)

const (
	fundingAmount = 50_000
	startAmount   = fundingAmount * 2
)

// testCustomChannels tests that we can create a network with custom channels
// and send asset payments over them.
func testCustomChannels(_ context.Context, net *NetworkHarness,
	t *harnessTest) {

	ctxb := context.Background()
	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplate)

	// Explicitly set the proof courier as Alice (how has no other role
	// other than proof shuffling), otherwise a hashmail courier will be
	// used. For the funding transaction, we're just posting it and don't
	// expect a true receiver.
	zane, err := net.NewNode(
		t.t, "Zane", lndArgs, false, true, litdArgs...,
	)
	require.NoError(t.t, err)

	litdArgs = append(litdArgs, fmt.Sprintf(
		"--taproot-assets.proofcourieraddr=%s://%s",
		proof.UniverseRpcCourierType, zane.Cfg.LitAddr(),
	))

	// The topology we are going for looks like the following:
	//
	// Charlie  --[assets]-->  Dave  --[sats]-->  Erin  --[assets]-->  Fabia
	//                          |
	//                          |
	//                       [assets]
	//                          |
	//                          v
	//                        Yara
	//
	// With [assets] being a custom channel and [sats] being a normal, BTC
	// only channel.
	// All 5 nodes need to be full litd nodes running in integrated mode
	// with tapd included. We also need specific flags to be enabled, so we
	// create 5 completely new nodes, ignoring the two default nodes that
	// are created by the harness.
	charlie, err := net.NewNode(
		t.t, "Charlie", lndArgs, false, true, litdArgs...,
	)
	require.NoError(t.t, err)

	dave, err := net.NewNode(t.t, "Dave", lndArgs, false, true, litdArgs...)
	require.NoError(t.t, err)
	erin, err := net.NewNode(t.t, "Erin", lndArgs, false, true, litdArgs...)
	require.NoError(t.t, err)
	fabia, err := net.NewNode(
		t.t, "Fabia", lndArgs, false, true, litdArgs...,
	)
	require.NoError(t.t, err)
	yara, err := net.NewNode(
		t.t, "Yara", lndArgs, false, true, litdArgs...,
	)
	require.NoError(t.t, err)

	nodes := []*HarnessNode{charlie, dave, erin, fabia, yara}
	connectAllNodes(t.t, net, nodes)
	fundAllNodes(t.t, net, nodes)

	// Create the normal channel between Dave and Erin.
	t.Logf("Opening normal channel between Dave and Erin...")
	channelOp := openChannelAndAssert(
		t, net, dave, erin, lntest.OpenChannelParams{
			Amt:         5_000_000,
			SatPerVByte: 5,
		},
	)
	defer closeChannelAndAssert(t, net, dave, channelOp, false)

	// This is the only public channel, we need everyone to be aware of it.
	assertChannelKnown(t.t, charlie, channelOp)
	assertChannelKnown(t.t, fabia, channelOp)

	universeTap := newTapClient(t.t, zane)
	charlieTap := newTapClient(t.t, charlie)
	daveTap := newTapClient(t.t, dave)
	erinTap := newTapClient(t.t, erin)
	fabiaTap := newTapClient(t.t, fabia)
	yaraTap := newTapClient(t.t, yara)

	// Mint an asset on Charlie and sync all nodes to Charlie as the
	// universe.
	mintedAssets := itest.MintAssetsConfirmBatch(
		t.t, t.lndHarness.Miner.Client, charlieTap,
		[]*mintrpc.MintAssetRequest{
			{
				Asset: itestAsset,
			},
		},
	)
	cents := mintedAssets[0]
	assetID := cents.AssetGenesis.AssetId
	fundingScriptTree := tapchannel.NewFundingScriptTree()
	fundingScriptKey := fundingScriptTree.TaprootKey
	fundingScriptTreeBytes := fundingScriptKey.SerializeCompressed()

	t.Logf("Minted %d lightning cents, syncing universes...", cents.Amount)
	syncUniverses(t.t, charlieTap, dave, erin, fabia, yara)
	t.Logf("Universes synced between all nodes, distributing assets...")

	const (
		daveFundingAmount = uint64(startAmount)
		erinFundingAmount = uint64(fundingAmount)
	)
	charlieFundingAmount := cents.Amount - 2*startAmount

	fundRespCD, fundRespDY, fundRespEF := createTestAssetNetwork(
		t, net, charlieTap, daveTap, erinTap, fabiaTap, yaraTap,
		universeTap, cents, startAmount, charlieFundingAmount,
		daveFundingAmount, erinFundingAmount,
	)

	// We'll be tracking the expected asset balances throughout the test, so
	// we can assert it after each action.
	charlieAssetBalance := charlieFundingAmount
	daveAssetBalance := uint64(startAmount)
	erinAssetBalance := uint64(startAmount)
	fabiaAssetBalance := uint64(0)
	yaraAssetBalance := uint64(0)

	// Before we start sending out payments, let's make sure each node can
	// see the other one in the graph and has all required features.
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(charlie, dave))
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(dave, charlie))
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(dave, yara))
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(yara, dave))
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(erin, fabia))
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(fabia, erin))
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(charlie, erin))

	// Print initial channel balances.
	logBalance(t.t, nodes, assetID, "initial")

	// ------------
	// Test case 1: Send a direct keysend payment from Charlie to Dave.
	// ------------
	const keySendAmount = 1000
	sendAssetKeySendPayment(
		t.t, charlie, dave, keySendAmount, assetID, fn.None[int64](),
	)
	logBalance(t.t, nodes, assetID, "after keysend")

	charlieAssetBalance -= keySendAmount
	daveAssetBalance += keySendAmount

	// We should be able to send the 1000 assets back immediately, because
	// there is enough on-chain balance on Dave's side to be able to create
	// an HTLC. We use an invoice to execute another code path.
	invoiceResp := createAssetInvoice(
		t.t, dave, charlie, keySendAmount, assetID,
	)
	payInvoiceWithAssets(t.t, dave, charlie, invoiceResp, assetID)

	charlieAssetBalance += keySendAmount
	daveAssetBalance -= keySendAmount

	// We should also be able to do a non-asset (BTC only) keysend payment.
	sendKeySendPayment(t.t, charlie, dave, 2000, nil)
	logBalance(t.t, nodes, assetID, "after BTC only keysend")

	// ------------
	// Test case 2: Pay a normal invoice from Dave by Charlie, making it
	// a direct channel invoice payment with no RFQ SCID present in the
	// invoice.
	// ------------
	paidAssetAmount := createAndPayNormalInvoice(
		t.t, charlie, dave, dave, 20_000, assetID,
	)
	logBalance(t.t, nodes, assetID, "after invoice")

	charlieAssetBalance -= paidAssetAmount
	daveAssetBalance += paidAssetAmount

	// We should also be able to do a multi-hop BTC only payment, paying an
	// invoice from Erin by Charlie.
	createAndPayNormalInvoiceWithBtc(t.t, charlie, erin, 2000)
	logBalance(t.t, nodes, assetID, "after BTC only invoice")

	// ------------
	// Test case 3: Pay an asset invoice from Dave by Charlie, making it
	// a direct channel invoice payment with an RFQ SCID present in the
	// invoice.
	// ------------
	const daveInvoiceAssetAmount = 2_000
	invoiceResp = createAssetInvoice(
		t.t, charlie, dave, daveInvoiceAssetAmount, assetID,
	)
	payInvoiceWithAssets(t.t, charlie, dave, invoiceResp, assetID)
	logBalance(t.t, nodes, assetID, "after invoice")

	charlieAssetBalance -= daveInvoiceAssetAmount
	daveAssetBalance += daveInvoiceAssetAmount

	// ------------
	// Test case 4: Pay a normal invoice from Erin by Charlie.
	// ------------
	paidAssetAmount = createAndPayNormalInvoice(
		t.t, charlie, dave, erin, 20_000, assetID,
	)
	logBalance(t.t, nodes, assetID, "after invoice")

	charlieAssetBalance -= paidAssetAmount
	daveAssetBalance += paidAssetAmount

	// ------------
	// Test case 5: Create an asset invoice on Fabia and pay it from
	// Charlie.
	// ------------
	const fabiaInvoiceAssetAmount1 = 1000
	invoiceResp = createAssetInvoice(
		t.t, erin, fabia, fabiaInvoiceAssetAmount1, assetID,
	)
	payInvoiceWithAssets(t.t, charlie, dave, invoiceResp, assetID)
	logBalance(t.t, nodes, assetID, "after invoice")

	charlieAssetBalance -= fabiaInvoiceAssetAmount1
	daveAssetBalance += fabiaInvoiceAssetAmount1
	erinAssetBalance -= fabiaInvoiceAssetAmount1
	fabiaAssetBalance += fabiaInvoiceAssetAmount1

	// ------------
	// Test case 6: Create an asset invoice on Fabia and pay it with just
	// BTC from Dave, making sure it ends up being a multipart payment (we
	// set the maximum shard size to 80k sat and 15k asset units will be
	// more than a single shard).
	// ------------
	const fabiaInvoiceAssetAmount2 = 15_000
	invoiceResp = createAssetInvoice(
		t.t, erin, fabia, fabiaInvoiceAssetAmount2, assetID,
	)
	payInvoiceWithSatoshi(t.t, dave, invoiceResp)
	logBalance(t.t, nodes, assetID, "after invoice")

	erinAssetBalance -= fabiaInvoiceAssetAmount2
	fabiaAssetBalance += fabiaInvoiceAssetAmount2

	// ------------
	// Test case 7: Create an asset invoice on Fabia and pay it with assets
	// from Charlie, making sure it ends up being a multipart payment as
	// well, with the high amount of asset units to send and the hard coded
	// 80k sat max shard size.
	// ------------
	const fabiaInvoiceAssetAmount3 = 10_000
	invoiceResp = createAssetInvoice(
		t.t, erin, fabia, fabiaInvoiceAssetAmount3, assetID,
	)
	payInvoiceWithAssets(t.t, charlie, dave, invoiceResp, assetID)
	logBalance(t.t, nodes, assetID, "after invoice")

	charlieAssetBalance -= fabiaInvoiceAssetAmount3
	daveAssetBalance += fabiaInvoiceAssetAmount3
	erinAssetBalance -= fabiaInvoiceAssetAmount3
	fabiaAssetBalance += fabiaInvoiceAssetAmount3

	// ------------
	// Test case 8: An invoice payment over two channels that are both asset
	// channels.
	// ------------
	logBalance(t.t, nodes, assetID, "before asset-to-asset")

	const yaraInvoiceAssetAmount1 = 1000
	invoiceResp = createAssetInvoice(
		t.t, dave, yara, yaraInvoiceAssetAmount1, assetID,
	)
	payInvoiceWithAssets(t.t, charlie, dave, invoiceResp, assetID)
	logBalance(t.t, nodes, assetID, "after asset-to-asset")

	charlieAssetBalance -= yaraInvoiceAssetAmount1
	yaraAssetBalance += yaraInvoiceAssetAmount1

	// ------------
	// Test case 8: Now we'll close each of the channels, starting with the
	// Charlie -> Dave custom channel.
	// ------------
	charlieChanPoint := &lnrpc.ChannelPoint{
		OutputIndex: uint32(fundRespCD.OutputIndex),
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: fundRespCD.Txid,
		},
	}
	daveChanPoint := &lnrpc.ChannelPoint{
		OutputIndex: uint32(fundRespDY.OutputIndex),
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: fundRespDY.Txid,
		},
	}
	erinChanPoint := &lnrpc.ChannelPoint{
		OutputIndex: uint32(fundRespEF.OutputIndex),
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: fundRespEF.Txid,
		},
	}

	t.Logf("Closing Charlie -> Dave channel")
	closeAssetChannelAndAssert(
		t, net, charlie, dave, charlieChanPoint, assetID, nil,
		universeTap, true, true,
	)

	t.Logf("Closing Dave -> Yara channel, close initiated by Yara")
	closeAssetChannelAndAssert(
		t, net, yara, dave, daveChanPoint, assetID, nil,
		universeTap, false, true,
	)

	t.Logf("Closing Erin -> Fabia channel")
	closeAssetChannelAndAssert(
		t, net, erin, fabia, erinChanPoint, assetID, nil,
		universeTap, true, true,
	)

	// We've been tracking the off-chain channel balances all this time, so
	// now that we have the assets on-chain again, we can assert them. Due
	// to rounding errors that happened when sending multiple shards with
	// MPP, we need to do some slight adjustments.
	charlieAssetBalance += 2
	daveAssetBalance -= 2
	erinAssetBalance += 4
	fabiaAssetBalance -= 4
	assertAssetBalance(t.t, charlieTap, assetID, charlieAssetBalance)
	assertAssetBalance(t.t, daveTap, assetID, daveAssetBalance)
	assertAssetBalance(t.t, erinTap, assetID, erinAssetBalance)
	assertAssetBalance(t.t, fabiaTap, assetID, fabiaAssetBalance)
	assertAssetBalance(t.t, yaraTap, assetID, yaraAssetBalance)

	// ------------
	// Test case 10: We now open a new asset channel and close it again, to
	// make sure that a non-existent remote balance is handled correctly.
	t.Logf("Opening new asset channel between Charlie and Dave...")
	fundRespCD, err = charlieTap.FundChannel(
		ctxb, &tchrpc.FundChannelRequest{
			AssetAmount:        fundingAmount,
			AssetId:            assetID,
			PeerPubkey:         dave.PubKey[:],
			FeeRateSatPerVbyte: 5,
		},
	)
	require.NoError(t.t, err)
	t.Logf("Funded second channel between Charlie and Dave: %v", fundRespCD)

	mineBlocks(t, net, 6, 1)

	// Assert that the proofs for both channels has been uploaded to the
	// designated Universe server.
	assertUniverseProofExists(
		t.t, universeTap, assetID, nil, fundingScriptTreeBytes,
		fmt.Sprintf("%v:%v", fundRespCD.Txid, fundRespCD.OutputIndex),
	)
	assertAssetChan(t.t, charlie, dave, fundingAmount, assetID)

	// And let's just close the channel again.
	charlieChanPoint = &lnrpc.ChannelPoint{
		OutputIndex: uint32(fundRespCD.OutputIndex),
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: fundRespCD.Txid,
		},
	}

	t.Logf("Closing Charlie -> Dave channel")
	closeAssetChannelAndAssert(
		t, net, charlie, dave, charlieChanPoint, assetID, nil,
		universeTap, false, false,
	)

	// Charlie should still have four asset pieces, two with the same size.
	assertNumAssetOutputs(t.t, charlieTap, assetID, 2)
	assertAssetExists(
		t.t, charlieTap, assetID, charlieAssetBalance-fundingAmount,
		nil, true, false, false,
	)
	assertAssetExists(
		t.t, charlieTap, assetID, fundingAmount, nil, true, true,
		false,
	)

	// Dave should have two outputs, one from the initial channel with Yara
	// and one from the remaining amount of the channel with Charlie.
	assertNumAssetOutputs(t.t, daveTap, assetID, 2)
	daveFirstChannelRemainder := daveFundingAmount - yaraInvoiceAssetAmount1
	assertAssetExists(
		t.t, daveTap, assetID, daveFirstChannelRemainder, nil, true,
		true, false,
	)
	assertAssetExists(
		t.t, daveTap, assetID,
		daveAssetBalance-daveFirstChannelRemainder, nil, true, true,
		false,
	)

	// Fabia and Yara should all have a single output each, just what was
	// left over from the initial channel.
	assertNumAssetOutputs(t.t, fabiaTap, assetID, 1)
	assertAssetExists(
		t.t, fabiaTap, assetID, fabiaAssetBalance, nil, true, true,
		false,
	)
	assertNumAssetOutputs(t.t, yaraTap, assetID, 1)
	assertAssetExists(
		t.t, yaraTap, assetID, yaraAssetBalance, nil, true, true, false,
	)

	// Erin didn't use all of his assets when opening the channel, so he
	// should have two outputs, the change from the channel opening and the
	// remaining amount after closing the channel.
	assertNumAssetOutputs(t.t, erinTap, assetID, 2)
	erinChange := startAmount - erinFundingAmount
	assertAssetExists(
		t.t, erinTap, assetID, erinAssetBalance-erinChange, nil, true,
		true, false,
	)
	assertAssetExists(
		t.t, erinTap, assetID, erinChange, nil, true, false, false,
	)

	// The asset balances should still remain unchanged.
	assertAssetBalance(t.t, charlieTap, assetID, charlieAssetBalance)
	assertAssetBalance(t.t, daveTap, assetID, daveAssetBalance)
	assertAssetBalance(t.t, erinTap, assetID, erinAssetBalance)
	assertAssetBalance(t.t, fabiaTap, assetID, fabiaAssetBalance)
}

// testCustomChannelsGroupedAsset tests that we can create a network with custom
// channels that use grouped assets and send asset payments over them.
func testCustomChannelsGroupedAsset(_ context.Context, net *NetworkHarness,
	t *harnessTest) {

	ctxb := context.Background()
	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplate)

	// Explicitly set the proof courier as Alice (has no other role other
	// than proof shuffling), otherwise a hashmail courier will be used.
	// For the funding transaction, we're just posting it and don't expect a
	// true receiver.
	zane, err := net.NewNode(
		t.t, "Zane", lndArgs, false, true, litdArgs...,
	)
	require.NoError(t.t, err)

	litdArgs = append(litdArgs, fmt.Sprintf(
		"--taproot-assets.proofcourieraddr=%s://%s",
		proof.UniverseRpcCourierType, zane.Cfg.LitAddr(),
	))

	// The topology we are going for looks like the following:
	//
	// Charlie  --[assets]-->  Dave  --[sats]-->  Erin  --[assets]-->  Fabia
	//                          |
	//                          |
	//                       [assets]
	//                          |
	//                          v
	//                        Yara
	//
	// With [assets] being a custom channel and [sats] being a normal, BTC
	// only channel.
	// All 5 nodes need to be full litd nodes running in integrated mode
	// with tapd included. We also need specific flags to be enabled, so we
	// create 5 completely new nodes, ignoring the two default nodes that
	// are created by the harness.
	charlie, err := net.NewNode(
		t.t, "Charlie", lndArgs, false, true, litdArgs...,
	)
	require.NoError(t.t, err)

	dave, err := net.NewNode(t.t, "Dave", lndArgs, false, true, litdArgs...)
	require.NoError(t.t, err)
	erin, err := net.NewNode(t.t, "Erin", lndArgs, false, true, litdArgs...)
	require.NoError(t.t, err)
	fabia, err := net.NewNode(
		t.t, "Fabia", lndArgs, false, true, litdArgs...,
	)
	require.NoError(t.t, err)
	yara, err := net.NewNode(
		t.t, "Yara", lndArgs, false, true, litdArgs...,
	)
	require.NoError(t.t, err)

	nodes := []*HarnessNode{charlie, dave, erin, fabia, yara}
	connectAllNodes(t.t, net, nodes)
	fundAllNodes(t.t, net, nodes)

	// Create the normal channel between Dave and Erin.
	t.Logf("Opening normal channel between Dave and Erin...")
	channelOp := openChannelAndAssert(
		t, net, dave, erin, lntest.OpenChannelParams{
			Amt:         5_000_000,
			SatPerVByte: 5,
		},
	)
	defer closeChannelAndAssert(t, net, dave, channelOp, false)

	// This is the only public channel, we need everyone to be aware of it.
	assertChannelKnown(t.t, charlie, channelOp)
	assertChannelKnown(t.t, fabia, channelOp)

	universeTap := newTapClient(t.t, zane)
	charlieTap := newTapClient(t.t, charlie)
	daveTap := newTapClient(t.t, dave)
	erinTap := newTapClient(t.t, erin)
	fabiaTap := newTapClient(t.t, fabia)
	yaraTap := newTapClient(t.t, yara)

	groupAssetReq := itest.CopyRequest(&mintrpc.MintAssetRequest{
		Asset: itestAsset,
	})
	groupAssetReq.Asset.NewGroupedAsset = true

	// Mint an asset on Charlie and sync all nodes to Charlie as the
	// universe.
	mintedAssets := itest.MintAssetsConfirmBatch(
		t.t, t.lndHarness.Miner.Client, charlieTap,
		[]*mintrpc.MintAssetRequest{groupAssetReq},
	)

	cents := mintedAssets[0]
	assetID := cents.AssetGenesis.AssetId
	groupID := cents.GetAssetGroup().GetTweakedGroupKey()
	fundingScriptTree := tapchannel.NewFundingScriptTree()
	fundingScriptKey := fundingScriptTree.TaprootKey
	fundingScriptTreeBytes := fundingScriptKey.SerializeCompressed()

	t.Logf("Minted %d lightning cents, syncing universes...", cents.Amount)
	syncUniverses(t.t, charlieTap, dave, erin, fabia, yara)
	t.Logf("Universes synced between all nodes, distributing assets...")

	const (
		daveFundingAmount = uint64(startAmount)
		erinFundingAmount = uint64(fundingAmount)
	)
	charlieFundingAmount := cents.Amount - 2*startAmount

	fundRespCD, fundRespDY, fundRespEF := createTestAssetNetwork(
		t, net, charlieTap, daveTap, erinTap, fabiaTap, yaraTap,
		universeTap, cents, startAmount, charlieFundingAmount,
		daveFundingAmount, erinFundingAmount,
	)

	// We'll be tracking the expected asset balances throughout the test, so
	// we can assert it after each action.
	charlieAssetBalance := charlieFundingAmount
	daveAssetBalance := uint64(startAmount)
	erinAssetBalance := uint64(startAmount)
	fabiaAssetBalance := uint64(0)
	yaraAssetBalance := uint64(0)

	// Before we start sending out payments, let's make sure each node can
	// see the other one in the graph and has all required features.
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(charlie, dave))
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(dave, charlie))
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(dave, yara))
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(yara, dave))
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(erin, fabia))
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(fabia, erin))
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(charlie, erin))

	// Print initial channel balances.
	logBalance(t.t, nodes, assetID, "initial")

	// ------------
	// Test case 1: Send a direct keysend payment from Charlie to Dave.
	// ------------
	const keySendAmount = 100
	sendAssetKeySendPayment(
		t.t, charlie, dave, keySendAmount, assetID, fn.None[int64](),
	)
	logBalance(t.t, nodes, assetID, "after keysend")

	charlieAssetBalance -= keySendAmount
	daveAssetBalance += keySendAmount

	// We should be able to send the 100 assets back immediately, because
	// there is enough on-chain balance on Dave's side to be able to create
	// an HTLC.
	sendAssetKeySendPayment(
		t.t, dave, charlie, keySendAmount, assetID, fn.None[int64](),
	)
	logBalance(t.t, nodes, assetID, "after keysend back")

	charlieAssetBalance += keySendAmount
	daveAssetBalance -= keySendAmount

	// We should also be able to do a non-asset (BTC only) keysend payment.
	sendKeySendPayment(t.t, charlie, dave, 2000, nil)
	logBalance(t.t, nodes, assetID, "after BTC only keysend")

	// ------------
	// Test case 2: Pay a normal invoice from Dave by Charlie, making it
	// a direct channel invoice payment with no RFQ SCID present in the
	// invoice.
	// ------------
	paidAssetAmount := createAndPayNormalInvoice(
		t.t, charlie, dave, dave, 20_000, assetID,
	)
	logBalance(t.t, nodes, assetID, "after invoice")

	charlieAssetBalance -= paidAssetAmount
	daveAssetBalance += paidAssetAmount

	// We should also be able to do a multi-hop BTC only payment, paying an
	// invoice from Erin by Charlie.
	createAndPayNormalInvoiceWithBtc(t.t, charlie, erin, 2000)
	logBalance(t.t, nodes, assetID, "after BTC only invoice")

	// ------------
	// Test case 3: Pay an asset invoice from Dave by Charlie, making it
	// a direct channel invoice payment with an RFQ SCID present in the
	// invoice.
	// ------------
	const daveInvoiceAssetAmount = 2_000
	invoiceResp := createAssetInvoice(
		t.t, charlie, dave, daveInvoiceAssetAmount, assetID,
	)
	payInvoiceWithAssets(t.t, charlie, dave, invoiceResp, assetID)
	logBalance(t.t, nodes, assetID, "after invoice")

	charlieAssetBalance -= daveInvoiceAssetAmount
	daveAssetBalance += daveInvoiceAssetAmount

	// ------------
	// Test case 4: Pay a normal invoice from Erin by Charlie.
	// ------------
	paidAssetAmount = createAndPayNormalInvoice(
		t.t, charlie, dave, erin, 20_000, assetID,
	)
	logBalance(t.t, nodes, assetID, "after invoice")

	charlieAssetBalance -= paidAssetAmount
	daveAssetBalance += paidAssetAmount

	// ------------
	// Test case 5: Create an asset invoice on Fabia and pay it from
	// Charlie.
	// ------------
	const fabiaInvoiceAssetAmount1 = 1000
	invoiceResp = createAssetInvoice(
		t.t, erin, fabia, fabiaInvoiceAssetAmount1, assetID,
	)
	payInvoiceWithAssets(t.t, charlie, dave, invoiceResp, assetID)
	logBalance(t.t, nodes, assetID, "after invoice")

	charlieAssetBalance -= fabiaInvoiceAssetAmount1
	daveAssetBalance += fabiaInvoiceAssetAmount1
	erinAssetBalance -= fabiaInvoiceAssetAmount1
	fabiaAssetBalance += fabiaInvoiceAssetAmount1

	// ------------
	// Test case 6: Create an asset invoice on Fabia and pay it with just
	// BTC from Dave, making sure it ends up being a multipart payment (we
	// set the maximum shard size to 80k sat and 15k asset units will be
	// more than a single shard).
	// ------------
	const fabiaInvoiceAssetAmount2 = 15_000
	invoiceResp = createAssetInvoice(
		t.t, erin, fabia, fabiaInvoiceAssetAmount2, assetID,
	)
	payInvoiceWithSatoshi(t.t, dave, invoiceResp)
	logBalance(t.t, nodes, assetID, "after invoice")

	erinAssetBalance -= fabiaInvoiceAssetAmount2
	fabiaAssetBalance += fabiaInvoiceAssetAmount2

	// ------------
	// Test case 7: Create an asset invoice on Fabia and pay it with assets
	// from Charlie, making sure it ends up being a multipart payment as
	// well, with the high amount of asset units to send and the hard coded
	// 80k sat max shard size.
	// ------------
	const fabiaInvoiceAssetAmount3 = 10_000
	invoiceResp = createAssetInvoice(
		t.t, erin, fabia, fabiaInvoiceAssetAmount3, assetID,
	)
	payInvoiceWithAssets(t.t, charlie, dave, invoiceResp, assetID)
	logBalance(t.t, nodes, assetID, "after invoice")

	charlieAssetBalance -= fabiaInvoiceAssetAmount3
	daveAssetBalance += fabiaInvoiceAssetAmount3
	erinAssetBalance -= fabiaInvoiceAssetAmount3
	fabiaAssetBalance += fabiaInvoiceAssetAmount3

	// ------------
	// Test case 8: An invoice payment over two channels that are both asset
	// channels.
	// ------------
	logBalance(t.t, nodes, assetID, "before asset-to-asset")

	const yaraInvoiceAssetAmount1 = 1000
	invoiceResp = createAssetInvoice(
		t.t, dave, yara, yaraInvoiceAssetAmount1, assetID,
	)
	payInvoiceWithAssets(t.t, charlie, dave, invoiceResp, assetID)
	logBalance(t.t, nodes, assetID, "after asset-to-asset")

	charlieAssetBalance -= yaraInvoiceAssetAmount1
	yaraAssetBalance += yaraInvoiceAssetAmount1

	// ------------
	// Test case 8: Now we'll close each of the channels, starting with the
	// Charlie -> Dave custom channel.
	// ------------
	charlieChanPoint := &lnrpc.ChannelPoint{
		OutputIndex: uint32(fundRespCD.OutputIndex),
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: fundRespCD.Txid,
		},
	}
	daveChanPoint := &lnrpc.ChannelPoint{
		OutputIndex: uint32(fundRespDY.OutputIndex),
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: fundRespDY.Txid,
		},
	}
	erinChanPoint := &lnrpc.ChannelPoint{
		OutputIndex: uint32(fundRespEF.OutputIndex),
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: fundRespEF.Txid,
		},
	}

	t.Logf("Closing Charlie -> Dave channel")
	closeAssetChannelAndAssert(
		t, net, charlie, dave, charlieChanPoint, assetID, groupID,
		universeTap, true, true,
	)

	t.Logf("Closing Dave -> Yara channel, close initiated by Yara")
	closeAssetChannelAndAssert(
		t, net, yara, dave, daveChanPoint, assetID, groupID,
		universeTap, false, true,
	)

	t.Logf("Closing Erin -> Fabia channel")
	closeAssetChannelAndAssert(
		t, net, erin, fabia, erinChanPoint, assetID, groupID,
		universeTap, true, true,
	)

	// We've been tracking the off-chain channel balances all this time, so
	// now that we have the assets on-chain again, we can assert them. Due
	// to rounding errors that happened when sending multiple shards with
	// MPP, we need to do some slight adjustments.
	charlieAssetBalance += 2
	daveAssetBalance -= 2
	erinAssetBalance += 4
	fabiaAssetBalance -= 4
	assertAssetBalance(t.t, charlieTap, assetID, charlieAssetBalance)
	assertAssetBalance(t.t, daveTap, assetID, daveAssetBalance)
	assertAssetBalance(t.t, erinTap, assetID, erinAssetBalance)
	assertAssetBalance(t.t, fabiaTap, assetID, fabiaAssetBalance)
	assertAssetBalance(t.t, yaraTap, assetID, yaraAssetBalance)

	// ------------
	// Test case 10: We now open a new asset channel and close it again, to
	// make sure that a non-existent remote balance is handled correctly.
	t.Logf("Opening new asset channel between Charlie and Dave...")
	fundRespCD, err = charlieTap.FundChannel(
		ctxb, &tchrpc.FundChannelRequest{
			AssetAmount:        fundingAmount,
			AssetId:            assetID,
			PeerPubkey:         dave.PubKey[:],
			FeeRateSatPerVbyte: 5,
		},
	)
	require.NoError(t.t, err)
	t.Logf("Funded second channel between Charlie and Dave: %v", fundRespCD)

	mineBlocks(t, net, 6, 1)

	// Assert that the proofs for both channels has been uploaded to the
	// designated Universe server.
	assertUniverseProofExists(
		t.t, universeTap, nil, groupID, fundingScriptTreeBytes,
		fmt.Sprintf("%v:%v", fundRespCD.Txid, fundRespCD.OutputIndex),
	)
	assertAssetChan(t.t, charlie, dave, fundingAmount, assetID)

	// And let's just close the channel again.
	charlieChanPoint = &lnrpc.ChannelPoint{
		OutputIndex: uint32(fundRespCD.OutputIndex),
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: fundRespCD.Txid,
		},
	}

	t.Logf("Closing Charlie -> Dave channel")
	closeAssetChannelAndAssert(
		t, net, charlie, dave, charlieChanPoint, assetID, groupID,
		universeTap, false, false,
	)

	// Charlie should still have four asset pieces, two with the same size.
	assertAssetExists(
		t.t, charlieTap, assetID, charlieAssetBalance-fundingAmount,
		nil, true, false, false,
	)
	assertAssetExists(
		t.t, charlieTap, assetID, fundingAmount, nil, true, true,
		false,
	)

	// Charlie should have asset outputs: the left over change from the
	// channel funding, and the new close output.
	assertNumAssetOutputs(t.t, charlieTap, assetID, 2)

	// The asset balances should still remain unchanged.
	assertAssetBalance(t.t, charlieTap, assetID, charlieAssetBalance)
	assertAssetBalance(t.t, daveTap, assetID, daveAssetBalance)
	assertAssetBalance(t.t, erinTap, assetID, erinAssetBalance)
	assertAssetBalance(t.t, fabiaTap, assetID, fabiaAssetBalance)
}

// testCustomChannelsForceClose tests a force close scenario after both parties
// have an active asset balance.
func testCustomChannelsForceClose(_ context.Context, net *NetworkHarness,
	t *harnessTest) {

	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplate)

	// Zane will act as our Universe server for the duration of the test.
	zane, err := net.NewNode(
		t.t, "Zane", lndArgs, false, true, litdArgs...,
	)
	require.NoError(t.t, err)

	// For our litd args, make sure that they all seen Zane as the main
	// Universe server.
	litdArgs = append(litdArgs, fmt.Sprintf(
		"--taproot-assets.proofcourieraddr=%s://%s",
		proof.UniverseRpcCourierType, zane.Cfg.LitAddr(),
	))

	// For this simple test, we'll just have Carol -> Dave as an assets
	// channel.
	charlie, err := net.NewNode(
		t.t, "Charlie", lndArgs, false, true, litdArgs...,
	)
	require.NoError(t.t, err)

	dave, err := net.NewNode(t.t, "Dave", lndArgs, false, true, litdArgs...)
	require.NoError(t.t, err)

	// Next we'll connect all the nodes and also fund them with some coins.
	nodes := []*HarnessNode{charlie, dave}
	connectAllNodes(t.t, net, nodes)
	fundAllNodes(t.t, net, nodes)

	universeTap := newTapClient(t.t, zane)
	charlieTap := newTapClient(t.t, charlie)
	daveTap := newTapClient(t.t, dave)

	ctxb := context.Background()

	// Now we'll make an asset for Charlie that we'll use in the test to
	// open a channel.
	mintedAssets := itest.MintAssetsConfirmBatch(
		t.t, t.lndHarness.Miner.Client, charlieTap,
		[]*mintrpc.MintAssetRequest{
			{
				Asset: itestAsset,
			},
		},
	)
	cents := mintedAssets[0]
	assetID := cents.AssetGenesis.AssetId

	t.Logf("Minted %d lightning cents, syncing universes...", cents.Amount)
	syncUniverses(t.t, charlieTap, dave)
	t.Logf("Universes synced between all nodes, distributing assets...")

	// Next we can open an asset channel from Charlie -> Dave, then kick
	// off the main scenario.
	t.Logf("Opening asset channels...")
	assetFundResp, err := charlieTap.FundChannel(
		ctxb, &tchrpc.FundChannelRequest{
			AssetAmount:        fundingAmount,
			AssetId:            assetID,
			PeerPubkey:         dave.PubKey[:],
			FeeRateSatPerVbyte: 5,
		},
	)
	require.NoError(t.t, err)
	t.Logf("Funded channel between Charlie and Dave: %v", assetFundResp)

	// With the channel open, mine a block to confirm it.
	mineBlocks(t, net, 6, 1)

	// A transfer for the funding transaction should be found in Charlie's
	// DB.
	fundingTxid, err := chainhash.NewHashFromStr(assetFundResp.Txid)
	require.NoError(t.t, err)
	assetFundingTransfer := locateAssetTransfers(
		t.t, charlieTap, *fundingTxid,
	)

	t.Logf("Channel funding transfer: %v",
		toProtoJSON(t.t, assetFundingTransfer))

	// Charlie's balance should reflect that the funding asset was added to
	// the DB.
	assertAssetBalance(t.t, charlieTap, assetID, itestAsset.Amount)

	// Make sure that Charlie properly uploaded funding proof to the
	// Universe server.
	fundingScriptTree := tapchannel.NewFundingScriptTree()
	fundingScriptKey := fundingScriptTree.TaprootKey
	fundingScriptTreeBytes := fundingScriptKey.SerializeCompressed()
	assertUniverseProofExists(
		t.t, universeTap, assetID, nil, fundingScriptTreeBytes,
		fmt.Sprintf(
			"%v:%v", assetFundResp.Txid, assetFundResp.OutputIndex,
		),
	)

	// Make sure the channel shows the correct asset information.
	assertAssetChan(t.t, charlie, dave, fundingAmount, assetID)

	// Before we start sending out payments, let's make sure each node can
	// see the other one in the graph and has all required features.
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(charlie, dave))
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(dave, charlie))

	// We'll also have dave sync with Charlie+Zane to ensure he has the
	// proof for the funding output. We sync the transfers as well so he
	// has all the proofs needed.
	mode := universerpc.UniverseSyncMode_SYNC_FULL
	diff, err := daveTap.SyncUniverse(ctxb, &universerpc.SyncRequest{
		UniverseHost: zane.Cfg.LitAddr(),
		SyncMode:     mode,
	})
	require.NoError(t.t, err)

	t.Logf("Synced Dave w/ Zane, universe_diff=%v", toProtoJSON(t.t, diff))

	// With the channel confirmed, we'll push over some keysend payments
	// from Carol to Dave. We'll send over a bit more BTC each time so Dave
	// will go to chain sweep his output (default fee rate is 50 sat/vb).
	const (
		numPayments   = 5
		keySendAmount = 100
		btcAmt        = int64(5_000)
	)
	for i := 0; i < numPayments; i++ {
		sendAssetKeySendPayment(
			t.t, charlie, dave, keySendAmount, assetID,
			fn.Some(btcAmt),
		)
	}

	logBalance(t.t, nodes, assetID, "after keysend")

	// With the payments sent, we'll now go on chain with a force close
	// from Carol.
	t.Logf("Force closing channel...")
	charlieChanPoint := &lnrpc.ChannelPoint{
		OutputIndex: uint32(assetFundResp.OutputIndex),
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: assetFundResp.Txid,
		},
	}
	_, closeTxid, err := net.CloseChannel(charlie, charlieChanPoint, true)
	require.NoError(t.t, err)

	t.Logf("Channel closed! Mining blocks, close_txid=%v", closeTxid)

	// Next, we'll mine a block to confirm the force close.
	mineBlocks(t, net, 1, 1)

	// At this point, we should have the force close transaction in the set
	// of transfers for both nodes.
	var forceCloseTransfer *taprpc.ListTransfersResponse
	fErr := wait.NoError(func() error {
		forceCloseTransfer, err = charlieTap.ListTransfers(
			ctxb, &taprpc.ListTransfersRequest{
				AnchorTxid: closeTxid.String(),
			},
		)
		if err != nil {
			return fmt.Errorf("unable to list charlie transfers: "+
				"%w", err)
		}
		if len(forceCloseTransfer.Transfers) != 1 {
			return fmt.Errorf("charlie is missing force close " +
				"transfer")
		}

		forceCloseTransfer2, err := daveTap.ListTransfers(
			ctxb, &taprpc.ListTransfersRequest{
				AnchorTxid: closeTxid.String(),
			},
		)
		if err != nil {
			return fmt.Errorf("unable to list dave transfers: %w",
				err)
		}
		if len(forceCloseTransfer2.Transfers) != 1 {
			return fmt.Errorf("dave is missing force close " +
				"transfer")
		}

		return nil
	}, defaultTimeout)
	require.NoError(t.t, fErr)

	t.Logf("Force close transfer: %v", toProtoJSON(t.t, forceCloseTransfer))

	// Now that we have the transfer on disk, we'll also assert that the
	// universe also has proof for both the relevant transfer outputs.
	for _, transfer := range forceCloseTransfer.Transfers {
		for _, transferOut := range transfer.Outputs {
			assertUniverseProofExists(
				t.t, universeTap, assetID, nil,
				transferOut.ScriptKey,
				transferOut.Anchor.Outpoint,
			)
		}
	}

	t.Logf("Universe proofs located!")

	time.Sleep(time.Second * 1)

	// We'll mine one more block, which triggers the 1 CSV needed for Dave
	// to sweep his output.
	mineBlocks(t, net, 1, 0)

	// We should also have a new sweep transaction in the mempool.
	daveSweepTxid, err := waitForNTxsInMempool(
		net.Miner.Client, 1, time.Second*5,
	)
	require.NoError(t.t, err)

	t.Logf("Dave sweep txid: %v", daveSweepTxid)

	// Next, we'll mine a block to confirm Dave's sweep transaction.
	// This'll sweep his non-delay commitment output.
	mineBlocks(t, net, 1, 1)

	// At this point, a transfer should have been created for Dave's sweep
	// transaction.
	daveSweepTransfer := locateAssetTransfers(
		t.t, daveTap, *daveSweepTxid[0],
	)

	t.Logf("Dave sweep transfer: %v", toProtoJSON(t.t, daveSweepTransfer))

	time.Sleep(time.Second * 1)

	// Next, we'll mine three additional blocks to trigger the CSV delay
	// for Charlie.
	mineBlocks(t, net, 3, 0)

	// We expect that Charlie's sweep transaction has been broadcast.
	charlieSweepTxid, err := waitForNTxsInMempool(
		net.Miner.Client, 1, time.Second*5,
	)
	require.NoError(t.t, err)

	t.Logf("Charlie sweep txid: %v", charlieSweepTxid)

	// Now we'll mine a block to confirm Charlie's sweep transaction.
	mineBlocks(t, net, 1, 0)

	// Charlie should now have an asset transfer for his sweep transaction.
	charlieSweepTransfer := locateAssetTransfers(
		t.t, charlieTap, *charlieSweepTxid[0],
	)

	t.Logf("Charlie sweep transfer: %v", toProtoJSON(
		t.t, charlieSweepTransfer,
	))

	// Both sides should now reflect their updated asset balances.
	daveBalance := uint64(numPayments * keySendAmount)
	charlieBalance := itestAsset.Amount - daveBalance
	assertAssetBalance(t.t, daveTap, assetID, daveBalance)
	assertAssetBalance(t.t, charlieTap, assetID, charlieBalance)

	// Dave should have a single managed UTXO that shows he has a new asset
	// UTXO he can use.
	assertNumAssetUTXOs(t.t, daveTap, 1)
	assertNumAssetUTXOs(t.t, charlieTap, 2)
}

// testCustomChannelsBreach tests a force close scenario that breaches an old
// state, after both parties have an active asset balance.
func testCustomChannelsBreach(_ context.Context, net *NetworkHarness,
	t *harnessTest) {

	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplate)

	// Zane will act as our Universe server for the duration of the test.
	zane, err := net.NewNode(
		t.t, "Zane", lndArgs, false, true, litdArgs...,
	)
	require.NoError(t.t, err)

	// For our litd args, make sure that they all seen Zane as the main
	// Universe server.
	litdArgs = append(litdArgs, fmt.Sprintf(
		"--taproot-assets.proofcourieraddr=%s://%s",
		proof.UniverseRpcCourierType, zane.Cfg.LitAddr(),
	))

	// Charlie will be the breached party. We set --nolisten to ensure Dave
	// won't be able to connect to him and trigger the channel protection
	// logic automatically. We also can't have Charlie automatically
	// reconnect too early, otherwise DLP would be initiated instead of the
	// breach we want to provoke.
	charlieFlags := append(
		slices.Clone(lndArgs), "--nolisten", "--minbackoff=1h",
	)

	// For this simple test, we'll just have Carol -> Dave as an assets
	// channel.
	charlie, err := net.NewNode(
		t.t, "Charlie", charlieFlags, false, true, litdArgs...,
	)
	require.NoError(t.t, err)

	dave, err := net.NewNode(t.t, "Dave", lndArgs, false, true, litdArgs...)
	require.NoError(t.t, err)

	// Next we'll connect all the nodes and also fund them with some coins.
	nodes := []*HarnessNode{charlie, dave}
	connectAllNodes(t.t, net, nodes)
	fundAllNodes(t.t, net, nodes)

	universeTap := newTapClient(t.t, zane)
	charlieTap := newTapClient(t.t, charlie)
	daveTap := newTapClient(t.t, dave)

	ctxb := context.Background()

	// Now we'll make an asset for Charlie that we'll use in the test to
	// open a channel.
	mintedAssets := itest.MintAssetsConfirmBatch(
		t.t, t.lndHarness.Miner.Client, charlieTap,
		[]*mintrpc.MintAssetRequest{
			{
				Asset: itestAsset,
			},
		},
	)
	cents := mintedAssets[0]
	assetID := cents.AssetGenesis.AssetId

	t.Logf("Minted %d lightning cents, syncing universes...", cents.Amount)
	syncUniverses(t.t, charlieTap, dave)
	t.Logf("Universes synced between all nodes, distributing assets...")

	// Next we can open an asset channel from Charlie -> Dave, then kick
	// off the main scenario.
	t.Logf("Opening asset channels...")
	assetFundResp, err := charlieTap.FundChannel(
		ctxb, &tchrpc.FundChannelRequest{
			AssetAmount:        fundingAmount,
			AssetId:            assetID,
			PeerPubkey:         dave.PubKey[:],
			FeeRateSatPerVbyte: 5,
		},
	)
	require.NoError(t.t, err)
	t.Logf("Funded channel between Charlie and Dave: %v", assetFundResp)

	// With the channel open, mine a block to confirm it.
	mineBlocks(t, net, 6, 1)

	// A transfer for the funding transaction should be found in Charlie's
	// DB.
	fundingTxid, err := chainhash.NewHashFromStr(assetFundResp.Txid)
	require.NoError(t.t, err)
	assetFundingTransfer := locateAssetTransfers(
		t.t, charlieTap, *fundingTxid,
	)

	t.Logf("Channel funding transfer: %v",
		toProtoJSON(t.t, assetFundingTransfer))

	// Charlie's balance should reflect that the funding asset was added to
	// the DB.
	assertAssetBalance(t.t, charlieTap, assetID, itestAsset.Amount)

	// Make sure that Charlie properly uploaded funding proof to the
	// Universe server.
	fundingScriptTree := tapchannel.NewFundingScriptTree()
	fundingScriptKey := fundingScriptTree.TaprootKey
	fundingScriptTreeBytes := fundingScriptKey.SerializeCompressed()
	assertUniverseProofExists(
		t.t, universeTap, assetID, nil, fundingScriptTreeBytes,
		fmt.Sprintf(
			"%v:%v", assetFundResp.Txid, assetFundResp.OutputIndex,
		),
	)

	// Make sure the channel shows the correct asset information.
	assertAssetChan(t.t, charlie, dave, fundingAmount, assetID)

	// Before we start sending out payments, let's make sure each node can
	// see the other one in the graph and has all required features.
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(charlie, dave))
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(dave, charlie))

	// Next, we'll make keysend payments from Charlie to Dave. we'll use
	// this to reach a state where both parties have funds in the channel.
	const (
		numPayments   = 5
		keySendAmount = 100
		btcAmt        = int64(5_000)
	)
	for i := 0; i < numPayments; i++ {
		sendAssetKeySendPayment(
			t.t, charlie, dave, keySendAmount, assetID,
			fn.Some(btcAmt),
		)
	}

	logBalance(t.t, nodes, assetID, "after keysend -- breach state")

	// Now we'll create an on disk snapshot that we'll use to restore back
	// to as our breached state.
	require.NoError(t.t, net.StopAndBackupDB(dave))
	connectAllNodes(t.t, net, nodes)

	// We'll send one more keysend payment now to revoke the state we were
	// just at above.
	sendAssetKeySendPayment(
		t.t, charlie, dave, keySendAmount, assetID, fn.Some(btcAmt),
	)
	logBalance(t.t, nodes, assetID, "after keysend -- final state")

	// With the final state achieved, we'll now restore Dave (who will be
	// force closing) to that old state, the breach state.
	require.NoError(t.t, net.StopAndRestoreDB(dave))

	// With Dave restored, we'll now execute the force close.
	t.Logf("Force close by Dave to breach...")
	daveChanPoint := &lnrpc.ChannelPoint{
		OutputIndex: uint32(assetFundResp.OutputIndex),
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: assetFundResp.Txid,
		},
	}
	_, breachTxid, err := net.CloseChannel(dave, daveChanPoint, true)
	require.NoError(t.t, err)

	t.Logf("Channel closed! Mining blocks, close_txid=%v", breachTxid)

	// Next, we'll mine a block to confirm the breach transaction.
	mineBlocks(t, net, 1, 1)

	// We should be able to find the transfer of the breach for both
	// parties.
	charlieBreachTransfer := locateAssetTransfers(
		t.t, charlieTap, *breachTxid,
	)
	daveBreachTransfer := locateAssetTransfers(
		t.t, daveTap, *breachTxid,
	)

	t.Logf("Charlie breach transfer: %v",
		toProtoJSON(t.t, charlieBreachTransfer))
	t.Logf("Dave breach transfer: %v",
		toProtoJSON(t.t, daveBreachTransfer))

	// With the breach transaction mined, Charlie should now have a
	// transaction in the mempool sweeping the *both* commitment outputs.
	charlieJusticeTxid, err := waitForNTxsInMempool(
		net.Miner.Client, 1, time.Second*5,
	)
	require.NoError(t.t, err)

	t.Logf("Charlie justice txid: %v", charlieJusticeTxid)

	// Next, we'll mine a block to confirm Charlie's justice transaction.
	mineBlocks(t, net, 1, 1)

	// Charlie should now have a transfer for his justice transaction.
	charlieJusticeTransfer := locateAssetTransfers(
		t.t, charlieTap, *charlieJusticeTxid[0],
	)

	t.Logf("Charlie justice transfer: %v",
		toProtoJSON(t.t, charlieJusticeTransfer))

	// Charlie's balance should now be the same as before the breach
	// attempt: the amount he minted at the very start.
	charlieBalance := itestAsset.Amount
	assertAssetBalance(t.t, charlieTap, assetID, charlieBalance)

	t.Logf("Charlie balance after breach: %d", charlieBalance)

	// Charlie should now have 2 total UTXOs: the change from the funding
	// output, and now the sweep output from the justice transaction.
	charlieUTXOs := assertNumAssetUTXOs(t.t, charlieTap, 2)

	t.Logf("Charlie UTXOs after breach: %v", toProtoJSON(t.t, charlieUTXOs))
}
