package itest

import (
	"context"
	"fmt"
	"slices"
	"time"

	"github.com/btcsuite/btcd/btcec/v2/schnorr"
	"github.com/btcsuite/btcd/btcutil"
	"github.com/btcsuite/btcd/chaincfg/chainhash"
	"github.com/lightninglabs/taproot-assets/itest"
	"github.com/lightninglabs/taproot-assets/proof"
	"github.com/lightninglabs/taproot-assets/taprpc"
	"github.com/lightninglabs/taproot-assets/taprpc/mintrpc"
	tchrpc "github.com/lightninglabs/taproot-assets/taprpc/tapchannelrpc"
	"github.com/lightninglabs/taproot-assets/taprpc/universerpc"
	"github.com/lightninglabs/taproot-assets/tapscript"
	"github.com/lightningnetwork/lnd/fn"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lnrpc/invoicesrpc"
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

// testCustomChannelsLarge tests that we can create a network with custom
// channels and send large asset payments over them.
func testCustomChannelsLarge(_ context.Context, net *NetworkHarness,
	t *harnessTest) {

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
			Amt:         10_000_000,
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

	t.Logf("Minted %d lightning cents, syncing universes...", cents.Amount)
	syncUniverses(t.t, charlieTap, dave, erin, fabia, yara)
	t.Logf("Universes synced between all nodes, distributing assets...")

	const (
		daveFundingAmount = uint64(400_000)
		erinFundingAmount = uint64(200_000)
	)
	charlieFundingAmount := cents.Amount - uint64(2*400_000)

	fundRespCD, _, _ := createTestAssetNetwork(
		t, net, charlieTap, daveTap, erinTap, fabiaTap, yaraTap,
		universeTap, cents, 400_000, charlieFundingAmount,
		daveFundingAmount, erinFundingAmount, DefaultPushSat,
	)

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

	// Try larger invoice payments, first from Charlie to Fabia, then half
	// of the amount back in the other direction.
	const fabiaInvoiceAssetAmount = 20_000
	invoiceResp := createAssetInvoice(
		t.t, erin, fabia, fabiaInvoiceAssetAmount, assetID,
	)
	payInvoiceWithAssets(t.t, charlie, dave, invoiceResp, assetID, false)
	logBalance(t.t, nodes, assetID, "after invoice")

	invoiceResp2 := createAssetInvoice(
		t.t, dave, charlie, fabiaInvoiceAssetAmount/2, assetID,
	)

	// Sleep for a second to make sure the balances fully propagated before
	// we make the payment. Otherwise, we'll make an RFQ order with a max
	// amount of zero.
	time.Sleep(time.Second * 1)

	payInvoiceWithAssets(t.t, fabia, erin, invoiceResp2, assetID, false)
	logBalance(t.t, nodes, assetID, "after invoice 2")

	// Now we send a large invoice from Charlie to Dave.
	const largeInvoiceAmount = 100_000
	invoiceResp3 := createAssetInvoice(
		t.t, charlie, dave, largeInvoiceAmount, assetID,
	)
	payInvoiceWithAssets(t.t, charlie, dave, invoiceResp3, assetID, false)
	logBalance(t.t, nodes, assetID, "after invoice 3")

	// We keysend the rest, so that all the balance is on Dave's side.
	charlieRemainingBalance := charlieFundingAmount - largeInvoiceAmount -
		fabiaInvoiceAssetAmount/2
	sendAssetKeySendPayment(
		t.t, charlie, dave, charlieRemainingBalance,
		assetID, fn.None[int64](), lnrpc.Payment_SUCCEEDED,
		fn.None[lnrpc.PaymentFailureReason](),
	)
	logBalance(t.t, nodes, assetID, "after keysend")

	// And now we close the channel to test how things look if all the
	// balance is on the non-initiator (recipient) side.
	charlieChanPoint := &lnrpc.ChannelPoint{
		OutputIndex: uint32(fundRespCD.OutputIndex),
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: fundRespCD.Txid,
		},
	}

	t.Logf("Closing Charlie -> Dave channel")
	closeAssetChannelAndAssert(
		t, net, charlie, dave, charlieChanPoint, assetID, nil,
		universeTap, initiatorZeroAssetBalanceCoOpBalanceCheck,
	)
}

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
	fundingScriptTree := tapscript.NewChannelFundingScriptTree()
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
		daveFundingAmount, erinFundingAmount, DefaultPushSat,
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
	// Test case 1: Send a direct keysend payment from Charlie to Dave,
	// sending the whole balance.
	// ------------
	keySendAmount := charlieFundingAmount
	sendAssetKeySendPayment(
		t.t, charlie, dave, charlieFundingAmount, assetID,
		fn.None[int64](), lnrpc.Payment_SUCCEEDED,
		fn.None[lnrpc.PaymentFailureReason](),
	)
	logBalance(t.t, nodes, assetID, "after keysend")

	charlieAssetBalance -= keySendAmount
	daveAssetBalance += keySendAmount

	// We should be able to send 1000 assets back immediately, because
	// there is enough on-chain balance on Dave's side to be able to create
	// an HTLC. We use an invoice to execute another code path.
	const charlieInvoiceAmount = 1_000
	invoiceResp := createAssetInvoice(
		t.t, dave, charlie, charlieInvoiceAmount, assetID,
	)
	payInvoiceWithAssets(t.t, dave, charlie, invoiceResp, assetID, true)
	logBalance(t.t, nodes, assetID, "after invoice back")

	charlieAssetBalance += charlieInvoiceAmount
	daveAssetBalance -= charlieInvoiceAmount

	// We should also be able to do a non-asset (BTC only) keysend payment
	// from Charlie to Dave. This'll also replenish the BTC balance of
	// Dave, making it possible to send another asset HTLC below, sending
	// all assets back to Charlie (so we have enough balance for further
	// tests).
	sendKeySendPayment(t.t, charlie, dave, 2000)
	logBalance(t.t, nodes, assetID, "after BTC only keysend")

	// Let's keysend the rest of the balance back to Charlie.
	sendAssetKeySendPayment(
		t.t, dave, charlie, charlieFundingAmount-charlieInvoiceAmount,
		assetID, fn.None[int64](), lnrpc.Payment_SUCCEEDED,
		fn.None[lnrpc.PaymentFailureReason](),
	)
	logBalance(t.t, nodes, assetID, "after keysend back")

	charlieAssetBalance += charlieFundingAmount - charlieInvoiceAmount
	daveAssetBalance -= charlieFundingAmount - charlieInvoiceAmount

	// ------------
	// Test case 2: Pay a normal invoice from Dave by Charlie, making it
	// a direct channel invoice payment with no RFQ SCID present in the
	// invoice.
	// ------------
	paidAssetAmount := createAndPayNormalInvoice(
		t.t, charlie, dave, dave, 20_000, assetID, true,
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
	payInvoiceWithAssets(t.t, charlie, dave, invoiceResp, assetID, true)
	logBalance(t.t, nodes, assetID, "after invoice")

	charlieAssetBalance -= daveInvoiceAssetAmount
	daveAssetBalance += daveInvoiceAssetAmount

	// ------------
	// Test case 3.5: Pay an asset invoice from Dave by Charlie with normal
	// payment flow.
	// ------------
	invoiceResp = createAssetInvoice(
		t.t, charlie, dave, daveInvoiceAssetAmount, assetID,
	)
	payInvoiceWithSatoshi(t.t, charlie, invoiceResp)
	logBalance(t.t, nodes, assetID, "after asset invoice paid with sats")

	// We don't need to update the asset balances of Charlie and Dave here
	// as the invoice was paid with sats.

	// ------------
	// Test case 4: Pay a normal invoice from Erin by Charlie.
	// ------------
	paidAssetAmount = createAndPayNormalInvoice(
		t.t, charlie, dave, erin, 20_000, assetID, true,
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
	payInvoiceWithAssets(t.t, charlie, dave, invoiceResp, assetID, true)
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
	payInvoiceWithAssets(t.t, charlie, dave, invoiceResp, assetID, true)
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
	payInvoiceWithAssets(t.t, charlie, dave, invoiceResp, assetID, true)
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
		universeTap, assertDefaultCoOpCloseBalance(true, true),
	)

	t.Logf("Closing Dave -> Yara channel, close initiated by Yara")
	closeAssetChannelAndAssert(
		t, net, yara, dave, daveChanPoint, assetID, nil,
		universeTap, assertDefaultCoOpCloseBalance(false, true),
	)

	t.Logf("Closing Erin -> Fabia channel")
	closeAssetChannelAndAssert(
		t, net, erin, fabia, erinChanPoint, assetID, nil,
		universeTap, assertDefaultCoOpCloseBalance(true, true),
	)

	// We've been tracking the off-chain channel balances all this time, so
	// now that we have the assets on-chain again, we can assert them. Due
	// to rounding errors that happened when sending multiple shards with
	// MPP, we need to do some slight adjustments.
	charlieAssetBalance += 1
	erinAssetBalance += 4
	fabiaAssetBalance -= 4
	yaraAssetBalance -= 1
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
		universeTap, assertDefaultCoOpCloseBalance(false, false),
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
	daveFirstChannelRemainder := daveFundingAmount -
		yaraInvoiceAssetAmount1 + 1
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
	fundingScriptTree := tapscript.NewChannelFundingScriptTree()
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
		daveFundingAmount, erinFundingAmount, DefaultPushSat,
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
		lnrpc.Payment_SUCCEEDED, fn.None[lnrpc.PaymentFailureReason](),
	)
	logBalance(t.t, nodes, assetID, "after keysend")

	charlieAssetBalance -= keySendAmount
	daveAssetBalance += keySendAmount

	// We should be able to send the 100 assets back immediately, because
	// there is enough on-chain balance on Dave's side to be able to create
	// an HTLC.
	sendAssetKeySendPayment(
		t.t, dave, charlie, keySendAmount, assetID, fn.None[int64](),
		lnrpc.Payment_SUCCEEDED, fn.None[lnrpc.PaymentFailureReason](),
	)
	logBalance(t.t, nodes, assetID, "after keysend back")

	charlieAssetBalance += keySendAmount
	daveAssetBalance -= keySendAmount

	// We should also be able to do a non-asset (BTC only) keysend payment.
	sendKeySendPayment(t.t, charlie, dave, 2000)
	logBalance(t.t, nodes, assetID, "after BTC only keysend")

	// ------------
	// Test case 2: Pay a normal invoice from Dave by Charlie, making it
	// a direct channel invoice payment with no RFQ SCID present in the
	// invoice.
	// ------------
	paidAssetAmount := createAndPayNormalInvoice(
		t.t, charlie, dave, dave, 20_000, assetID, true,
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
	payInvoiceWithAssets(t.t, charlie, dave, invoiceResp, assetID, true)
	logBalance(t.t, nodes, assetID, "after invoice")

	charlieAssetBalance -= daveInvoiceAssetAmount
	daveAssetBalance += daveInvoiceAssetAmount

	// ------------
	// Test case 4: Pay a normal invoice from Erin by Charlie.
	// ------------
	paidAssetAmount = createAndPayNormalInvoice(
		t.t, charlie, dave, erin, 20_000, assetID, true,
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
	payInvoiceWithAssets(t.t, charlie, dave, invoiceResp, assetID, true)
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
	payInvoiceWithAssets(t.t, charlie, dave, invoiceResp, assetID, true)
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
	payInvoiceWithAssets(t.t, charlie, dave, invoiceResp, assetID, true)
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
		universeTap, assertDefaultCoOpCloseBalance(true, true),
	)

	t.Logf("Closing Dave -> Yara channel, close initiated by Yara")
	closeAssetChannelAndAssert(
		t, net, yara, dave, daveChanPoint, assetID, groupID,
		universeTap, assertDefaultCoOpCloseBalance(false, true),
	)

	t.Logf("Closing Erin -> Fabia channel")
	closeAssetChannelAndAssert(
		t, net, erin, fabia, erinChanPoint, assetID, groupID,
		universeTap, assertDefaultCoOpCloseBalance(true, true),
	)

	// We've been tracking the off-chain channel balances all this time, so
	// now that we have the assets on-chain again, we can assert them. Due
	// to rounding errors that happened when sending multiple shards with
	// MPP, we need to do some slight adjustments.
	charlieAssetBalance += 2
	daveAssetBalance -= 1
	erinAssetBalance += 4
	fabiaAssetBalance -= 4
	yaraAssetBalance -= 1
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
		universeTap, assertDefaultCoOpCloseBalance(false, false),
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

	// Before we actually create the asset channel, we want to make sure
	// that failed attempts of creating a channel (e.g. due to insufficient
	// on-chain funds) are cleaned up properly on the recipient side.
	// We do this by sending all of Charlie's coins to a burn address then
	// just sending him 50k sats, which isn't enough to fund a channel.
	_, err = charlie.LightningClient.SendCoins(
		ctxb, &lnrpc.SendCoinsRequest{
			Addr:             burnAddr,
			SendAll:          true,
			MinConfs:         0,
			SpendUnconfirmed: true,
		},
	)
	require.NoError(t.t, err)
	net.SendCoins(t.t, 50_000, charlie)

	// The attempt should fail. But the recipient should receive the error,
	// clean up the state and allow Charlie to try again after acquiring
	// more funds.
	_, err = charlieTap.FundChannel(ctxb, &tchrpc.FundChannelRequest{
		AssetAmount:        fundingAmount,
		AssetId:            assetID,
		PeerPubkey:         dave.PubKey[:],
		FeeRateSatPerVbyte: 5,
	})
	require.ErrorContains(t.t, err, "not enough witness outputs to create")

	// Now we'll fund the channel with the correct amount.
	net.SendCoins(t.t, btcutil.SatoshiPerBitcoin, charlie)

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

	// Charlie's balance should reflect that the funding asset is now
	// excluded from balance reporting by tapd.
	assertAssetBalance(
		t.t, charlieTap, assetID, itestAsset.Amount-fundingAmount,
	)

	// Make sure that Charlie properly uploaded funding proof to the
	// Universe server.
	fundingScriptTree := tapscript.NewChannelFundingScriptTree()
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
			fn.Some(btcAmt), lnrpc.Payment_SUCCEEDED,
			fn.None[lnrpc.PaymentFailureReason](),
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

	// We'll make sure Dave can spend his asset UTXO by sending it all but
	// one unit to Zane (the universe).
	assetSendAmount := daveBalance - 1
	zaneAddr, err := universeTap.NewAddr(ctxb, &taprpc.NewAddrRequest{
		Amt:     assetSendAmount,
		AssetId: assetID,
		ProofCourierAddr: fmt.Sprintf(
			"%s://%s", proof.UniverseRpcCourierType,
			charlieTap.node.Cfg.LitAddr(),
		),
	})
	require.NoError(t.t, err)

	t.Logf("Sending %v asset from Dave units to Zane...", assetSendAmount)

	// Send the assets to Zane. We expect Dave to have 3 transfers: the
	// funding txn, their force close sweep, and now this new send.
	itest.AssertAddrCreated(t.t, universeTap, cents, zaneAddr)
	sendResp, err := daveTap.SendAsset(ctxb, &taprpc.SendAssetRequest{
		TapAddrs: []string{zaneAddr.Encoded},
	})
	require.NoError(t.t, err)
	itest.ConfirmAndAssertOutboundTransfer(
		t.t, t.lndHarness.Miner.Client, daveTap, sendResp, assetID,
		[]uint64{1, assetSendAmount}, 2, 3,
	)
	itest.AssertNonInteractiveRecvComplete(t.t, universeTap, 1)

	// And now we also send all assets but one from Charlie to the universe
	// to make sure the time lock sweep output can also be spent correctly.
	assetSendAmount = charlieBalance - 1
	zaneAddr2, err := universeTap.NewAddr(ctxb, &taprpc.NewAddrRequest{
		Amt:     assetSendAmount,
		AssetId: assetID,
		ProofCourierAddr: fmt.Sprintf(
			"%s://%s", proof.UniverseRpcCourierType,
			charlieTap.node.Cfg.LitAddr(),
		),
	})
	require.NoError(t.t, err)

	t.Logf("Sending %v asset from Charlie units to Zane...",
		assetSendAmount)

	itest.AssertAddrCreated(t.t, universeTap, cents, zaneAddr2)
	sendResp2, err := charlieTap.SendAsset(ctxb, &taprpc.SendAssetRequest{
		TapAddrs: []string{zaneAddr2.Encoded},
	})
	require.NoError(t.t, err)
	itest.ConfirmAndAssertOutboundTransfer(
		t.t, t.lndHarness.Miner.Client, charlieTap, sendResp2, assetID,
		[]uint64{1, assetSendAmount}, 3, 4,
	)
	itest.AssertNonInteractiveRecvComplete(t.t, universeTap, 2)
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

	// Charlie's balance should reflect that the funding asset is now
	// excluded from balance reporting by tapd.
	assertAssetBalance(
		t.t, charlieTap, assetID, itestAsset.Amount-fundingAmount,
	)

	// Make sure that Charlie properly uploaded funding proof to the
	// Universe server.
	fundingScriptTree := tapscript.NewChannelFundingScriptTree()
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
			fn.Some(btcAmt), lnrpc.Payment_SUCCEEDED,
			fn.None[lnrpc.PaymentFailureReason](),
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
		lnrpc.Payment_SUCCEEDED,
		fn.None[lnrpc.PaymentFailureReason](),
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

// testCustomChannelsLiquidityEdgeCases is a test that runs through some
// taproot asset channel liquidity related edge cases.
func testCustomChannelsLiquidityEdgeCases(_ context.Context,
	net *NetworkHarness, t *harnessTest) {

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
			Amt:         10_000_000,
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

	t.Logf("Minted %d lightning cents, syncing universes...", cents.Amount)
	syncUniverses(t.t, charlieTap, dave, erin, fabia, yara)
	t.Logf("Universes synced between all nodes, distributing assets...")

	const (
		daveFundingAmount = uint64(400_000)
		erinFundingAmount = uint64(200_000)
	)
	charlieFundingAmount := cents.Amount - uint64(2*400_000)

	_, _, _ = createTestAssetNetwork(
		t, net, charlieTap, daveTap, erinTap, fabiaTap, yaraTap,
		universeTap, cents, 400_000, charlieFundingAmount,
		daveFundingAmount, erinFundingAmount, 0,
	)

	// Before we start sending out payments, let's make sure each node can
	// see the other one in the graph and has all required features.
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(charlie, dave))
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(dave, charlie))
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(dave, yara))
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(yara, dave))
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(erin, fabia))
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(fabia, erin))
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(charlie, erin))

	logBalance(t.t, nodes, assetID, "initial")

	// Normal case.
	// Send 50 assets from Charlie to Dave.
	sendAssetKeySendPayment(
		t.t, charlie, dave, 50, assetID,
		fn.None[int64](), lnrpc.Payment_SUCCEEDED,
		fn.None[lnrpc.PaymentFailureReason](),
	)

	logBalance(t.t, nodes, assetID, "after 50 assets")

	// Normal case.
	// Send 1k sats from Charlie to Dave.
	sendKeySendPayment(t.t, charlie, dave, 1000)

	logBalance(t.t, nodes, assetID, "after 1k sats")

	// Edge case: The channel reserve check should trigger, and we should
	// get a payment failure, not a timeout.
	//
	// Now Dave tries to send 50 assets to Charlie. There shouldn't be
	// enough sats in the channel.
	//
	// Assume an acceptable completion window which is half the payment
	// timeout. If the payment succeeds within this duration this means we
	// didn't fall into a routing loop.
	timeoutChan := time.After(PaymentTimeout / 2)
	done := make(chan bool, 1)

	//nolint:lll
	go func() {
		sendAssetKeySendPayment(
			t.t, dave, charlie, 50, assetID,
			fn.None[int64](), lnrpc.Payment_FAILED,
			fn.Some(lnrpc.PaymentFailureReason_FAILURE_REASON_NO_ROUTE),
		)

		done <- true
	}()

	select {
	case <-done:
	case <-timeoutChan:
		t.Fatalf("Payment didn't fail within expected time duration")
	}

	logBalance(t.t, nodes, assetID, "after failed 50 assets")

	// Send 10k sats from Charlie to Dave.
	sendKeySendPayment(t.t, charlie, dave, 10000)

	logBalance(t.t, nodes, assetID, "10k sats")

	// Now Dave tries to send 50 assets again, this time he should have
	// enough sats.
	sendAssetKeySendPayment(
		t.t, dave, charlie, 50, assetID,
		fn.None[int64](), lnrpc.Payment_SUCCEEDED,
		fn.None[lnrpc.PaymentFailureReason](),
	)

	logBalance(t.t, nodes, assetID, "after 50 sats backwards")

	// Edge case: This refers to a bug where an asset allocation would be
	// expected for this HTLC. This is a dust HTLC and it can not carry
	// assets.
	//
	// Send 1 sat from Charlie to Dave.
	sendKeySendPayment(t.t, charlie, dave, 1)

	logBalance(t.t, nodes, assetID, "after 1 sat")

	// Pay a normal bolt11 invoice involving RFQ flow.
	_ = createAndPayNormalInvoice(
		t.t, charlie, dave, erin, 20_000, assetID, true,
	)

	logBalance(t.t, nodes, assetID, "after 20k sat asset payment")

	// Edge case: There was a bug when paying an asset invoice that would
	// evaluate to more than the channel capacity, causing a payment failure
	// even though enough asset balance exists.
	//
	// Pay a bolt11 invoice with assets, which evaluates to more than the
	// channel btc capacity.
	_ = createAndPayNormalInvoice(
		t.t, charlie, dave, erin, 1_000_000, assetID, true,
	)

	logBalance(t.t, nodes, assetID, "after big asset payment (btc "+
		"invoice, multi-hop)")

	// Edge case: Big asset invoice paid by direct peer with assets.
	invoiceResp := createAssetInvoice(
		t.t, charlie, dave, 100_000, assetID,
	)

	payInvoiceWithAssets(t.t, charlie, dave, invoiceResp, assetID, false)

	logBalance(t.t, nodes, assetID, "after big asset payment (asset "+
		"invoice, direct)")

	// Edge case: Big normal invoice, paid by direct channel peer with
	// assets.
	_ = createAndPayNormalInvoice(
		t.t, dave, charlie, charlie, 1_000_000, assetID, true,
	)

	logBalance(t.t, nodes, assetID, "after big asset payment (btc "+
		"invoice, direct)")

	// Dave sends 200k assets and 5k sats to Yara.
	sendAssetKeySendPayment(
		t.t, dave, yara, 200_000, assetID,
		fn.None[int64](), lnrpc.Payment_SUCCEEDED,
		fn.None[lnrpc.PaymentFailureReason](),
	)
	sendKeySendPayment(t.t, dave, yara, 5_000)

	logBalance(t.t, nodes, assetID, "after 200k assets to Yara")

	// Edge case: Now Charlie creates a big asset invoice to be paid for by
	// Yara with assets. This is a multi-hop payment going over 2 asset
	// channels, where the total asset value exceeds the btc capacity of the
	// channels.
	invoiceResp = createAssetInvoice(
		t.t, dave, charlie, 100_000, assetID,
	)

	payInvoiceWithAssets(t.t, yara, dave, invoiceResp, assetID, false)

	logBalance(t.t, nodes, assetID, "after big asset payment (asset "+
		"invoice, multi-hop)")

	// Edge case: Now Charlie creates an asset invoice to be paid for by
	// Yara with satoshi. For the last hop we try to settle the invoice in
	// satoshi, where we will check whether Charlie's strict forwarding
	// works as expected.
	invoiceResp = createAssetInvoice(
		t.t, charlie, dave, 1, assetID,
	)

	ctxb := context.Background()
	stream, err := dave.InvoicesClient.SubscribeSingleInvoice(
		ctxb, &invoicesrpc.SubscribeSingleInvoiceRequest{
			RHash: invoiceResp.RHash,
		},
	)
	require.NoError(t.t, err)

	// Yara pays Dave with enough satoshis, but Charlie will not settle as
	// he expects assets.
	payInvoiceWithSatoshiLastHop(
		t.t, yara, invoiceResp, dave.PubKey[:], lnrpc.Payment_FAILED,
	)

	t.lndHarness.LNDHarness.AssertInvoiceState(stream, lnrpc.Invoice_OPEN)

	logBalance(t.t, nodes, assetID, "after failed payment (asset "+
		"invoice, strict forwarding)")
}

// testCustomChannelsBalanceConsistency is a test that test the balance of nodes
// under channel opening circumstances.
func testCustomChannelsBalanceConsistency(_ context.Context,
	net *NetworkHarness, t *harnessTest) {

	ctxb := context.Background()
	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplate)

	zane, err := net.NewNode(
		t.t, "Zane", lndArgs, false, true, litdArgs...,
	)
	require.NoError(t.t, err)

	litdArgs = append(litdArgs, fmt.Sprintf(
		"--taproot-assets.proofcourieraddr=%s://%s",
		proof.UniverseRpcCourierType, zane.Cfg.LitAddr(),
	))

	charlie, err := net.NewNode(
		t.t, "Charlie", lndArgs, false, true, litdArgs...,
	)
	require.NoError(t.t, err)
	dave, err := net.NewNode(t.t, "Dave", lndArgs, false, true, litdArgs...)
	require.NoError(t.t, err)

	nodes := []*HarnessNode{charlie, dave}
	connectAllNodes(t.t, net, nodes)
	fundAllNodes(t.t, net, nodes)

	charlieTap := newTapClient(t.t, charlie)
	daveTap := newTapClient(t.t, dave)
	universeTap := newTapClient(t.t, zane)

	// Mint an asset on Charlie and sync Dave to Charlie as the universe.
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
	var groupKey []byte
	if cents.AssetGroup != nil {
		groupKey = cents.AssetGroup.TweakedGroupKey
	}

	t.Logf("Minted %d lightning cents, syncing universes...", cents.Amount)
	syncUniverses(t.t, charlieTap, dave)
	t.Logf("Universes synced between all nodes, distributing assets...")

	charlieBalance := cents.Amount

	// Charlie should have a single balance output with the full balance.
	assertAssetBalance(t.t, charlieTap, assetID, cents.Amount)

	// The script key should be local to charlie, and the script key should
	// be known. It is after all the asset he just minted himself.
	scriptKeyLocal := true
	scriptKeyKnown := false
	scriptKeyHasScriptPath := false

	scriptKey, err := schnorr.ParsePubKey(cents.ScriptKey[1:])
	require.NoError(t.t, err)
	assertAssetExists(
		t.t, charlieTap, assetID, charlieBalance,
		scriptKey, scriptKeyLocal, scriptKeyKnown,
		scriptKeyHasScriptPath,
	)

	fundingScriptTree := tapscript.NewChannelFundingScriptTree()
	fundingScriptKey := fundingScriptTree.TaprootKey
	fundingScriptTreeBytes := fundingScriptKey.SerializeCompressed()

	fundRespCD, err := charlieTap.FundChannel(
		ctxb, &tchrpc.FundChannelRequest{
			AssetAmount:        charlieBalance,
			AssetId:            assetID,
			PeerPubkey:         daveTap.node.PubKey[:],
			FeeRateSatPerVbyte: 5,
			PushSat:            0,
		},
	)
	require.NoError(t.t, err)
	t.Logf("Funded channel between Charlie and Dave: %v", fundRespCD)

	// Make sure the pending channel shows up in the list and has the
	// custom records set as JSON.
	assertPendingChannels(
		t.t, charlieTap.node, assetID, 1, charlieBalance, 0,
	)

	// Let's confirm the channel.
	mineBlocks(t, net, 6, 1)

	// Tapd should not report any balance for Charlie, since the asset is
	// used in a funding transaction. It should also not report any balance
	// for Dave. All those balances are reported through channel balances.
	assertAssetBalance(t.t, charlieTap, assetID, 0)
	assertAssetBalance(t.t, daveTap, assetID, 0)

	// There should only be a single asset piece for Charlie, the one in the
	// channel.
	assertNumAssetOutputs(t.t, charlieTap, assetID, 1)

	// The script key should now not be local anymore, since he funded a
	// channel with it. Charlie does still know the script key though.
	scriptKeyLocal = false
	scriptKeyKnown = true
	scriptKeyHasScriptPath = true
	assertAssetExists(
		t.t, charlieTap, assetID, charlieBalance,
		fundingScriptKey, scriptKeyLocal, scriptKeyKnown,
		scriptKeyHasScriptPath,
	)

	// Assert that the proofs for both channels has been uploaded to the
	// designated Universe server.
	assertUniverseProofExists(
		t.t, universeTap, assetID, groupKey, fundingScriptTreeBytes,
		fmt.Sprintf("%v:%v", fundRespCD.Txid, fundRespCD.OutputIndex),
	)

	// Make sure the channel shows the correct asset information.
	assertAssetChan(
		t.t, charlieTap.node, daveTap.node, charlieBalance, assetID,
	)

	logBalance(t.t, nodes, assetID, "initial")

	// Normal case.
	// Send 500 assets from Charlie to Dave.
	sendAssetKeySendPayment(
		t.t, charlie, dave, 500, assetID,
		fn.None[int64](), lnrpc.Payment_SUCCEEDED,
		fn.None[lnrpc.PaymentFailureReason](),
	)

	logBalance(t.t, nodes, assetID, "after 500 assets")

	// Tapd should still not report balances for Charlie and Dave, since
	// they are still locked up in the funding transaction.
	assertAssetBalance(t.t, charlieTap, assetID, 0)
	assertAssetBalance(t.t, daveTap, assetID, 0)

	// Send 10k sats from Charlie to Dave. Dave needs the sats to be able to
	// send assets.
	sendKeySendPayment(t.t, charlie, dave, 10000)

	// Now Dave tries to send 250 assets.
	sendAssetKeySendPayment(
		t.t, dave, charlie, 250, assetID,
		fn.None[int64](), lnrpc.Payment_SUCCEEDED,
		fn.None[lnrpc.PaymentFailureReason](),
	)

	logBalance(t.t, nodes, assetID, "after 250 sats backwards")

	// Tapd should still not report balances for Charlie and Dave, since
	// they are still locked up in the funding transaction.
	assertAssetBalance(t.t, charlieTap, assetID, 0)
	assertAssetBalance(t.t, daveTap, assetID, 0)

	// We will now close the channel.
	t.Logf("Close the channel between Charlie and Dave...")
	charlieChanPoint := &lnrpc.ChannelPoint{
		OutputIndex: uint32(fundRespCD.OutputIndex),
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: fundRespCD.Txid,
		},
	}

	closeChannelAndAssert(t, net, charlie, charlieChanPoint, false)

	// Charlie should have a single balance output with the balance 250 less
	// than the total amount minted.
	assertAssetBalance(t.t, charlieTap, assetID, charlieBalance-250)
	assertAssetBalance(t.t, daveTap, assetID, 250)

	// The script key should now be local to both Charlie and Dave, since
	// the channel was closed.
	scriptKeyLocal = true
	scriptKeyKnown = true
	scriptKeyHasScriptPath = false
	assertAssetExists(
		t.t, charlieTap, assetID, charlieBalance-250,
		nil, scriptKeyLocal, scriptKeyKnown, scriptKeyHasScriptPath,
	)
	assertAssetExists(
		t.t, daveTap, assetID, 250,
		nil, scriptKeyLocal, scriptKeyKnown, scriptKeyHasScriptPath,
	)

	assertNumAssetOutputs(t.t, charlieTap, assetID, 1)
	assertNumAssetOutputs(t.t, daveTap, assetID, 1)
}
