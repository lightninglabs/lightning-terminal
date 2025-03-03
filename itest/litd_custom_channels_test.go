package itest

import (
	"bytes"
	"context"
	"fmt"
	"math"
	"math/big"
	"slices"
	"time"

	"github.com/btcsuite/btcd/btcec/v2/schnorr"
	"github.com/btcsuite/btcd/btcutil"
	"github.com/btcsuite/btcd/chaincfg/chainhash"
	"github.com/lightninglabs/taproot-assets/asset"
	"github.com/lightninglabs/taproot-assets/itest"
	"github.com/lightninglabs/taproot-assets/proof"
	"github.com/lightninglabs/taproot-assets/rfqmath"
	"github.com/lightninglabs/taproot-assets/rfqmsg"
	"github.com/lightninglabs/taproot-assets/taprpc"
	"github.com/lightninglabs/taproot-assets/taprpc/mintrpc"
	oraclerpc "github.com/lightninglabs/taproot-assets/taprpc/priceoraclerpc"
	"github.com/lightninglabs/taproot-assets/taprpc/rfqrpc"
	"github.com/lightninglabs/taproot-assets/taprpc/tapchannelrpc"
	tchrpc "github.com/lightninglabs/taproot-assets/taprpc/tapchannelrpc"
	"github.com/lightninglabs/taproot-assets/taprpc/universerpc"
	"github.com/lightninglabs/taproot-assets/tapscript"
	"github.com/lightningnetwork/lnd/fn"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lnrpc/invoicesrpc"
	"github.com/lightningnetwork/lnd/lnrpc/walletrpc"
	"github.com/lightningnetwork/lnd/lntest"
	"github.com/lightningnetwork/lnd/lntest/port"
	"github.com/lightningnetwork/lnd/lntest/wait"
	"github.com/lightningnetwork/lnd/lnwallet/chainfee"
	"github.com/lightningnetwork/lnd/lnwire"
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
	litdArgsTemplateNoOracle = []string{
		"--taproot-assets.allow-public-uni-proof-courier",
		"--taproot-assets.universe.public-access=rw",
		"--taproot-assets.universe.sync-all-assets",
		"--taproot-assets.universerpccourier.skipinitdelay",
		"--taproot-assets.universerpccourier.backoffresetwait=1s",
		"--taproot-assets.universerpccourier.numtries=5",
		"--taproot-assets.universerpccourier.initialbackoff=300ms",
		"--taproot-assets.universerpccourier.maxbackoff=600ms",
		"--taproot-assets.universerpccourier.skipinitdelay",
		"--taproot-assets.universerpccourier.backoffresetwait=100ms",
		"--taproot-assets.universerpccourier.initialbackoff=300ms",
		"--taproot-assets.universerpccourier.maxbackoff=600ms",
		"--taproot-assets.custodianproofretrievaldelay=500ms",
	}
	litdArgsTemplate = append(litdArgsTemplateNoOracle, []string{
		"--taproot-assets.experimental.rfq.priceoracleaddress=" +
			"use_mock_price_oracle_service_promise_to_" +
			"not_use_on_mainnet",
		"--taproot-assets.experimental.rfq.mockoracleassetsperbtc=" +
			"5820600",
	}...)
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

	// Explicitly set the proof courier as Zane (now has no other role
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

	chanPointCD, _, _ := createTestAssetNetwork(
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
	payInvoiceWithAssets(
		t.t, charlie, dave, invoiceResp.PaymentRequest, assetID,
	)
	logBalance(t.t, nodes, assetID, "after invoice")

	invoiceResp2 := createAssetInvoice(
		t.t, dave, charlie, fabiaInvoiceAssetAmount/2, assetID,
	)

	// Sleep for a second to make sure the balances fully propagated before
	// we make the payment. Otherwise, we'll make an RFQ order with a max
	// amount of zero.
	time.Sleep(time.Second * 1)

	payInvoiceWithAssets(
		t.t, fabia, erin, invoiceResp2.PaymentRequest, assetID,
	)
	logBalance(t.t, nodes, assetID, "after invoice 2")

	// Now we send a large invoice from Charlie to Dave.
	const largeInvoiceAmount = 100_000
	invoiceResp3 := createAssetInvoice(
		t.t, charlie, dave, largeInvoiceAmount, assetID,
	)
	payInvoiceWithAssets(
		t.t, charlie, dave, invoiceResp3.PaymentRequest, assetID,
	)
	logBalance(t.t, nodes, assetID, "after invoice 3")

	// Make sure the invoice on the receiver side and the payment on the
	// sender side show the individual HTLCs that arrived for it and that
	// they show the correct asset amounts when decoded.
	assertInvoiceHtlcAssets(
		t.t, dave, invoiceResp3, assetID, largeInvoiceAmount,
	)
	assertPaymentHtlcAssets(
		t.t, charlie, invoiceResp3.RHash, assetID, largeInvoiceAmount,
	)

	// We keysend the rest, so that all the balance is on Dave's side.
	charlieRemainingBalance := charlieFundingAmount - largeInvoiceAmount -
		fabiaInvoiceAssetAmount/2
	sendAssetKeySendPayment(
		t.t, charlie, dave, charlieRemainingBalance,
		assetID, fn.None[int64](),
	)
	logBalance(t.t, nodes, assetID, "after keysend")

	// And now we close the channel to test how things look if all the
	// balance is on the non-initiator (recipient) side.
	t.Logf("Closing Charlie -> Dave channel")
	closeAssetChannelAndAssert(
		t, net, charlie, dave, chanPointCD, assetID, nil,
		universeTap, initiatorZeroAssetBalanceCoOpBalanceCheck,
	)
}

// testCustomChannels tests that we can create a network with custom channels
// and send asset payments over them.
func testCustomChannels(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplate)

	// Explicitly set the proof courier as Zane (now has no other role
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

	chanPointCD, chanPointDY, chanPointEF := createTestAssetNetwork(
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
	// Test case 1: Send a direct asset keysend payment from Charlie to Dave,
	// sending the whole asset balance.
	//
	// Charlie  --[assets]-->  Dave
	//
	// ------------
	keySendAmount := charlieFundingAmount
	sendAssetKeySendPayment(
		t.t, charlie, dave, charlieFundingAmount, assetID,
		fn.None[int64](),
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
	payInvoiceWithAssets(
		t.t, dave, charlie, invoiceResp.PaymentRequest, assetID,
		withSmallShards(),
	)
	logBalance(t.t, nodes, assetID, "after invoice back")

	// Make sure the invoice on the receiver side and the payment on the
	// sender side show the individual HTLCs that arrived for it and that
	// they show the correct asset amounts when decoded.
	assertInvoiceHtlcAssets(
		t.t, charlie, invoiceResp, assetID, charlieInvoiceAmount,
	)
	assertPaymentHtlcAssets(
		t.t, dave, invoiceResp.RHash, assetID, charlieInvoiceAmount,
	)

	charlieAssetBalance += charlieInvoiceAmount
	daveAssetBalance -= charlieInvoiceAmount

	// We should also be able to do a non-asset (BTC only) keysend payment
	// from Charlie to Dave. This'll also replenish the BTC balance of
	// Dave, making it possible to send another asset HTLC below, sending
	// all assets back to Charlie (so we have enough balance for further
	// tests).
	sendKeySendPayment(t.t, charlie, dave, 2000)
	logBalance(t.t, nodes, assetID, "after BTC only keysend")

	// Let's keysend the rest of the asset balance back to Charlie.
	sendAssetKeySendPayment(
		t.t, dave, charlie, charlieFundingAmount-charlieInvoiceAmount,
		assetID, fn.None[int64](),
	)
	logBalance(t.t, nodes, assetID, "after keysend back")

	charlieAssetBalance += charlieFundingAmount - charlieInvoiceAmount
	daveAssetBalance -= charlieFundingAmount - charlieInvoiceAmount

	// ------------
	// Test case 2: Pay a normal sats invoice from Dave by
	// Charlie using an asset,
	// making it a direct channel invoice payment with no RFQ SCID present in
	// the invoice (but an RFQ is used when trying to send the payment). In this
	// case, Charlie gets to choose if he wants to pay Dave using assets or
	// sats. In contrast, test case 3.5 we have the opposite scenario where
	// an asset invoice is used and Charlie must pay with assets and not have
	// a choice (and that case is supposed to fail because Charlie tries to
	// pay with sats instead).
	//
	// Charlie  --[assets]-->  Dave
	//
	// ------------
	createAndPayNormalInvoice(
		t.t, charlie, dave, dave, 20_000, assetID, withSmallShards(),
		withFailure(lnrpc.Payment_FAILED, failureIncorrectDetails),
	)
	logBalance(t.t, nodes, assetID, "after invoice")

	// We should also be able to do a multi-hop BTC only payment, paying an
	// invoice from Erin by Charlie.
	// Charlie  --[assets]-->  Dave  --[sats]-->  Erin
	createAndPayNormalInvoiceWithBtc(t.t, charlie, erin, 2000)
	logBalance(t.t, nodes, assetID, "after BTC only invoice")

	// ------------
	// Test case 3: Pay an asset invoice from Dave by Charlie, making it
	// a direct channel invoice payment with an RFQ SCID present in the
	// invoice.
	//
	// Charlie  --[assets]-->  Dave
	//
	// ------------
	const daveInvoiceAssetAmount = 2_000
	invoiceResp = createAssetInvoice(
		t.t, charlie, dave, daveInvoiceAssetAmount, assetID,
	)
	payInvoiceWithAssets(
		t.t, charlie, dave, invoiceResp.PaymentRequest, assetID,
		withSmallShards(),
	)
	logBalance(t.t, nodes, assetID, "after invoice")

	charlieAssetBalance -= daveInvoiceAssetAmount
	daveAssetBalance += daveInvoiceAssetAmount

	// ------------
	// Test case 3.5: Pay an asset invoice with an RFQ SCID present from Dave
	// by Charlie with normal
	// satoshi payment flow. We expect that payment to fail, since it's a
	// direct channel payment and the invoice is for assets, not sats. So
	// without a conversion, it is rejected by the receiver.
	// Normally, sats is the standard and we can always pay a taproot assets
	// invoice with sats, but this special case where it is a direct channel
	// payment,  the fact that Dave requested specifically to receive a
	// taproot asset from Charlie, that must be honored because Charlie did
	// an RFQ with Dave when that invoice was created agreeing that when it
	// was paid that Dave would receive taproot asset instead of sats.
	//
	// Charlie  --[assets]-->  Dave
	//
	// ------------
	invoiceResp = createAssetInvoice(
		t.t, charlie, dave, daveInvoiceAssetAmount, assetID,
	)
	payInvoiceWithSatoshi(
		t.t, charlie, invoiceResp, withFailure(
			lnrpc.Payment_FAILED, failureIncorrectDetails,
		),
	)
	logBalance(t.t, nodes, assetID, "after asset invoice paid with sats")

	// We don't need to update the asset balances of Charlie and Dave here
	// as the invoice payment failed.

	// ------------
	// Test case 4: Pay a normal sats invoice from Erin by Charlie
	// using an asset.
	//
	// Charlie  --[assets]-->  Dave  --[sats]-->  Erin
	//
	// ------------
	paidAssetAmount := createAndPayNormalInvoice(
		t.t, charlie, dave, erin, 20_000, assetID, withSmallShards(),
	)
	logBalance(t.t, nodes, assetID, "after invoice")

	charlieAssetBalance -= paidAssetAmount
	daveAssetBalance += paidAssetAmount

	// ------------
	// Test case 5: Create an asset invoice on Fabia and pay it from
	// Charlie using an asset.
	//
	// Charlie  --[assets]-->  Dave  --[sats]-->  Erin  --[assets]-->  Fabia
	//
	// ------------
	const fabiaInvoiceAssetAmount1 = 1000
	invoiceResp = createAssetInvoice(
		t.t, erin, fabia, fabiaInvoiceAssetAmount1, assetID,
	)
	payInvoiceWithAssets(
		t.t, charlie, dave, invoiceResp.PaymentRequest, assetID,
		withSmallShards(),
	)
	logBalance(t.t, nodes, assetID, "after invoice")

	charlieAssetBalance -= fabiaInvoiceAssetAmount1
	daveAssetBalance += fabiaInvoiceAssetAmount1
	erinAssetBalance -= fabiaInvoiceAssetAmount1
	fabiaAssetBalance += fabiaInvoiceAssetAmount1

	// ------------
	// Test case 6: Create an asset invoice on Fabia and pay it with just
	// BTC from Dave, making sure it ends up being a multipart payment (we
	// set the maximum shard size to 80k sat and 15k asset units will be
	// more than a single shard). The purpose here is to force testing of multi
	// part payments so that we can do so with a simple network instead of
	// building a more complicated one that actually needs multi part paymemts
	// in order to get the payment to successfully route.
	//
	//                         Dave  --[sats]-->  Erin  --[assets]-->  Fabia
	//
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
	// 80k sat max shard size. Again, as in test case 6 above, we are doing
	// this here to test multi part payments in a simpler way.
	//
	// Charlie  --[assets]-->  Dave  --[sats]-->  Erin  --[assets]-->  Fabia
	//
	// ------------
	const fabiaInvoiceAssetAmount3 = 10_000
	invoiceResp = createAssetInvoice(
		t.t, erin, fabia, fabiaInvoiceAssetAmount3, assetID,
	)
	payInvoiceWithAssets(
		t.t, charlie, dave, invoiceResp.PaymentRequest, assetID,
		withSmallShards(),
	)
	logBalance(t.t, nodes, assetID, "after invoice")

	charlieAssetBalance -= fabiaInvoiceAssetAmount3
	daveAssetBalance += fabiaInvoiceAssetAmount3
	erinAssetBalance -= fabiaInvoiceAssetAmount3
	fabiaAssetBalance += fabiaInvoiceAssetAmount3

	// ------------
	// Test case 8: An invoice payment over two channels that are both asset
	// channels.
	//
	// Charlie  --[assets]-->  Dave
	//                          |
	//                          |
	//                       [assets]
	//                          |
	//                          v
	//                        Yara
	//
	// ------------
	logBalance(t.t, nodes, assetID, "before asset-to-asset")

	const yaraInvoiceAssetAmount1 = 1000
	invoiceResp = createAssetInvoice(
		t.t, dave, yara, yaraInvoiceAssetAmount1, assetID,
	)
	payInvoiceWithAssets(
		t.t, charlie, dave, invoiceResp.PaymentRequest, assetID,
		withSmallShards(),
	)
	logBalance(t.t, nodes, assetID, "after asset-to-asset")

	charlieAssetBalance -= yaraInvoiceAssetAmount1
	yaraAssetBalance += yaraInvoiceAssetAmount1

	// ------------
	// Test case 9: Now we'll close each of the channels, starting with the
	// Charlie -> Dave custom channel.
	//
	// Charlie  --[assets]-->  Dave
	//
	// ------------
	t.Logf("Closing Charlie -> Dave channel")
	closeAssetChannelAndAssert(
		t, net, charlie, dave, chanPointCD, assetID, nil,
		universeTap, assertDefaultCoOpCloseBalance(true, true),
	)

	t.Logf("Closing Dave -> Yara channel, close initiated by Yara")
	closeAssetChannelAndAssert(
		t, net, yara, dave, chanPointDY, assetID, nil,
		universeTap, assertDefaultCoOpCloseBalance(false, true),
	)

	t.Logf("Closing Erin -> Fabia channel")
	closeAssetChannelAndAssert(
		t, net, erin, fabia, chanPointEF, assetID, nil,
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
	fundRespCD, err := charlieTap.FundChannel(
		ctx, &tchrpc.FundChannelRequest{
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
	assertAssetChan(t.t, charlie, dave, fundingAmount, cents)

	// And let's just close the channel again.
	chanPointCD = &lnrpc.ChannelPoint{
		OutputIndex: uint32(fundRespCD.OutputIndex),
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: fundRespCD.Txid,
		},
	}

	t.Logf("Closing Charlie -> Dave channel")
	closeAssetChannelAndAssert(
		t, net, charlie, dave, chanPointCD, assetID, nil,
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
func testCustomChannelsGroupedAsset(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplate)

	// Explicitly set the proof courier as Zane (now has no other role
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

	chanPointCD, chanPointDY, chanPointEF := createTestAssetNetwork(
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
	sendKeySendPayment(t.t, charlie, dave, 2000)
	logBalance(t.t, nodes, assetID, "after BTC only keysend")

	// ------------
	// Test case 2: Pay a normal invoice from Dave by Charlie, making it
	// a direct channel invoice payment with no RFQ SCID present in the
	// invoice.
	// ------------
	createAndPayNormalInvoice(
		t.t, charlie, dave, dave, 20_000, assetID, withSmallShards(),
		withFailure(lnrpc.Payment_FAILED, failureIncorrectDetails),
	)
	logBalance(t.t, nodes, assetID, "after invoice")

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
	payInvoiceWithAssets(
		t.t, charlie, dave, invoiceResp.PaymentRequest, assetID,
		withSmallShards(),
	)
	logBalance(t.t, nodes, assetID, "after invoice")

	// Make sure the invoice on the receiver side and the payment on the
	// sender side show the individual HTLCs that arrived for it and that
	// they show the correct asset amounts when decoded.
	assertInvoiceHtlcAssets(
		t.t, dave, invoiceResp, assetID, daveInvoiceAssetAmount,
	)
	assertPaymentHtlcAssets(
		t.t, charlie, invoiceResp.RHash, assetID,
		daveInvoiceAssetAmount,
	)

	charlieAssetBalance -= daveInvoiceAssetAmount
	daveAssetBalance += daveInvoiceAssetAmount

	// ------------
	// Test case 4: Pay a normal invoice from Erin by Charlie.
	// ------------
	paidAssetAmount := createAndPayNormalInvoice(
		t.t, charlie, dave, erin, 20_000, assetID, withSmallShards(),
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
	payInvoiceWithAssets(
		t.t, charlie, dave, invoiceResp.PaymentRequest, assetID,
		withSmallShards(),
	)
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
	payInvoiceWithAssets(
		t.t, charlie, dave, invoiceResp.PaymentRequest, assetID,
		withSmallShards(),
	)
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
	payInvoiceWithAssets(
		t.t, charlie, dave, invoiceResp.PaymentRequest, assetID,
		withSmallShards(),
	)
	logBalance(t.t, nodes, assetID, "after asset-to-asset")

	charlieAssetBalance -= yaraInvoiceAssetAmount1
	yaraAssetBalance += yaraInvoiceAssetAmount1

	// ------------
	// Test case 9: Now we'll close each of the channels, starting with the
	// Charlie -> Dave custom channel.
	// ------------
	t.Logf("Closing Charlie -> Dave channel")
	closeAssetChannelAndAssert(
		t, net, charlie, dave, chanPointCD, assetID, groupID,
		universeTap, assertDefaultCoOpCloseBalance(true, true),
	)

	t.Logf("Closing Dave -> Yara channel, close initiated by Yara")
	closeAssetChannelAndAssert(
		t, net, yara, dave, chanPointDY, assetID, groupID,
		universeTap, assertDefaultCoOpCloseBalance(false, true),
	)

	t.Logf("Closing Erin -> Fabia channel")
	closeAssetChannelAndAssert(
		t, net, erin, fabia, chanPointEF, assetID, groupID,
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
	fundRespCD, err := charlieTap.FundChannel(
		ctx, &tchrpc.FundChannelRequest{
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
	assertAssetChan(t.t, charlie, dave, fundingAmount, cents)

	// And let's just close the channel again.
	chanPointCD = &lnrpc.ChannelPoint{
		OutputIndex: uint32(fundRespCD.OutputIndex),
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: fundRespCD.Txid,
		},
	}

	t.Logf("Closing Charlie -> Dave channel")
	closeAssetChannelAndAssert(
		t, net, charlie, dave, chanPointCD, assetID, groupID,
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

	// Charlie should have asset outputs: the leftover change from the
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
func testCustomChannelsForceClose(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplate)

	// Explicitly set the proof courier as Zane (now has no other role
	// other than proof shuffling), otherwise a hashmail courier will be
	// used. For the funding transaction, we're just posting it and don't
	// expect a true receiver.
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
		ctx, &lnrpc.SendCoinsRequest{
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
	_, err = charlieTap.FundChannel(ctx, &tchrpc.FundChannelRequest{
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
		ctx, &tchrpc.FundChannelRequest{
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
	assertAssetChan(t.t, charlie, dave, fundingAmount, cents)

	// Before we start sending out payments, let's make sure each node can
	// see the other one in the graph and has all required features.
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(charlie, dave))
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(dave, charlie))

	// We'll also have dave sync with Charlie+Zane to ensure he has the
	// proof for the funding output. We sync the transfers as well so he
	// has all the proofs needed.
	mode := universerpc.UniverseSyncMode_SYNC_FULL
	diff, err := daveTap.SyncUniverse(ctx, &universerpc.SyncRequest{
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
			ctx, &taprpc.ListTransfersRequest{
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
			ctx, &taprpc.ListTransfersRequest{
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
	zaneAddr, err := universeTap.NewAddr(ctx, &taprpc.NewAddrRequest{
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
	sendResp, err := daveTap.SendAsset(ctx, &taprpc.SendAssetRequest{
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
	zaneAddr2, err := universeTap.NewAddr(ctx, &taprpc.NewAddrRequest{
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
	sendResp2, err := charlieTap.SendAsset(ctx, &taprpc.SendAssetRequest{
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
func testCustomChannelsBreach(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplate)

	// Explicitly set the proof courier as Zane (now has no other role
	// other than proof shuffling), otherwise a hashmail courier will be
	// used. For the funding transaction, we're just posting it and don't
	// expect a true receiver.
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
		ctx, &tchrpc.FundChannelRequest{
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
	assertAssetChan(t.t, charlie, dave, fundingAmount, cents)

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

// testCustomChannelsLiquidityEdgeCases is a test that runs through some
// taproot asset channel liquidity related edge cases.
func testCustomChannelsLiquidityEdgeCases(ctx context.Context,
	net *NetworkHarness, t *harnessTest) {

	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplate)

	// Explicitly set the proof courier as Zane (now has no other role
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
	defer closeChannelAndAssert(t, net, dave, channelOp, true)

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
		t.t, charlie, dave, 50, assetID, fn.None[int64](),
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

	go func() {
		sendAssetKeySendPayment(
			t.t, dave, charlie, 50, assetID, fn.None[int64](),
			withFailure(lnrpc.Payment_FAILED, failureNoRoute),
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
		t.t, dave, charlie, 50, assetID, fn.None[int64](),
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
		t.t, charlie, dave, erin, 20_000, assetID, withSmallShards(),
	)

	logBalance(t.t, nodes, assetID, "after 20k sat asset payment")

	// Edge case: There was a bug when paying an asset invoice that would
	// evaluate to more than the channel capacity, causing a payment failure
	// even though enough asset balance exists.
	//
	// Pay a bolt11 invoice with assets, which evaluates to more than the
	// channel btc capacity.
	_ = createAndPayNormalInvoice(
		t.t, charlie, dave, erin, 1_000_000, assetID, withSmallShards(),
	)

	logBalance(t.t, nodes, assetID, "after big asset payment (btc "+
		"invoice, multi-hop)")

	// Edge case: Big asset invoice paid by direct peer with assets.
	const bigAssetAmount = 100_000
	invoiceResp := createAssetInvoice(
		t.t, charlie, dave, bigAssetAmount, assetID,
	)

	payInvoiceWithAssets(
		t.t, charlie, dave, invoiceResp.PaymentRequest, assetID,
	)

	logBalance(t.t, nodes, assetID, "after big asset payment (asset "+
		"invoice, direct)")

	// Make sure the invoice on the receiver side and the payment on the
	// sender side show the individual HTLCs that arrived for it and that
	// they show the correct asset amounts when decoded.
	assertInvoiceHtlcAssets(
		t.t, dave, invoiceResp, assetID, bigAssetAmount,
	)
	assertPaymentHtlcAssets(
		t.t, charlie, invoiceResp.RHash, assetID, bigAssetAmount,
	)

	// Dave sends 200k assets and 5k sats to Yara.
	sendAssetKeySendPayment(
		t.t, dave, yara, 2*bigAssetAmount, assetID, fn.None[int64](),
	)
	sendKeySendPayment(t.t, dave, yara, 5_000)

	logBalance(t.t, nodes, assetID, "after 200k assets to Yara")

	// Edge case: Now Charlie creates a big asset invoice to be paid for by
	// Yara with assets. This is a multi-hop payment going over 2 asset
	// channels, where the total asset value exceeds the btc capacity of the
	// channels.
	invoiceResp = createAssetInvoice(
		t.t, dave, charlie, bigAssetAmount, assetID,
	)

	payInvoiceWithAssets(
		t.t, yara, dave, invoiceResp.PaymentRequest, assetID,
	)

	logBalance(t.t, nodes, assetID, "after big asset payment (asset "+
		"invoice, multi-hop)")

	// Edge case: Now Charlie creates a tiny asset invoice to be paid for by
	// Yara with satoshi. This is a multi-hop payment going over 2 asset
	// channels, where the total asset value is less than the default anchor
	// amount of 354 sats.
	createAssetInvoice(t.t, dave, charlie, 1, assetID, withInvoiceErrSubStr(
		"cannot create invoice over 1 asset units, as the minimal "+
			"transportable amount",
	))

	logBalance(t.t, nodes, assetID, "after small payment (asset "+
		"invoice, <354sats)")

	// Edge case: We now create a small BTC invoice on Erin and ask Charlie
	// to pay it with assets. We should get a payment failure as the amount
	// is too small to be paid with assets economically. But a payment is
	// still possible, since the amount is large enough to represent a
	// single unit (17.1 sat per unit).
	btcInvoiceResp, err := erin.AddInvoice(ctx, &lnrpc.Invoice{
		Memo:      "small BTC invoice",
		ValueMsat: 18_000,
	})
	require.NoError(t.t, err)
	payInvoiceWithAssets(
		t.t, charlie, dave, btcInvoiceResp.PaymentRequest, assetID,
		withFeeLimit(2_000), withPayErrSubStr(
			"rejecting payment of 20000 mSAT",
		),
	)

	// When we override the uneconomical payment, it should succeed.
	payInvoiceWithAssets(
		t.t, charlie, dave, btcInvoiceResp.PaymentRequest, assetID,
		withFeeLimit(2_000), withAllowOverpay(),
	)
	logBalance(
		t.t, nodes, assetID, "after small payment (BTC invoice 1 sat)",
	)

	// When we try to pay an invoice amount that's smaller than the
	// corresponding value of a single asset unit, the payment will always
	// be rejected, even if we set the allow_uneconomical flag.
	btcInvoiceResp, err = erin.AddInvoice(ctx, &lnrpc.Invoice{
		Memo:      "very small BTC invoice",
		ValueMsat: 1_000,
	})
	require.NoError(t.t, err)
	payInvoiceWithAssets(
		t.t, charlie, dave, btcInvoiceResp.PaymentRequest, assetID,
		withFeeLimit(1_000), withAllowOverpay(), withPayErrSubStr(
			"rejecting payment of 2000 mSAT",
		),
	)

	// Edge case: Check if the RFQ HTLC tracking accounts for cancelled
	// HTLCs. We achieve this by manually creating & using an RFQ quote with
	// a set max amount. We first pay to a hodl invoice that we eventually
	// cancel, then pay to a normal invoice which should succeed.

	// We start by sloshing some funds in the Erin<->Fabia.
	sendAssetKeySendPayment(
		t.t, erin, fabia, 100_000, assetID, fn.Some[int64](20_000),
	)

	logBalance(t.t, nodes, assetID, "balance after 1st slosh")

	// We create the RFQ order. We set the max amt to ~180k sats which is
	// going to evaluate to about 10k assets.
	inOneHour := time.Now().Add(time.Hour)
	resQ, err := charlieTap.RfqClient.AddAssetSellOrder(
		ctx, &rfqrpc.AddAssetSellOrderRequest{
			AssetSpecifier: &rfqrpc.AssetSpecifier{
				Id: &rfqrpc.AssetSpecifier_AssetId{
					AssetId: assetID,
				},
			},
			PaymentMaxAmt:  180_000_000,
			Expiry:         uint64(inOneHour.Unix()),
			PeerPubKey:     dave.PubKey[:],
			TimeoutSeconds: 100,
		},
	)
	require.NoError(t.t, err)

	// We now create a hodl invoice on Fabia, for 10k assets.
	hodlInv := createAssetHodlInvoice(t.t, erin, fabia, 10_000, assetID)

	// Charlie tries to pay via Dave, by providing the RFQ quote ID that was
	// manually created above.
	var quoteID rfqmsg.ID
	copy(quoteID[:], resQ.GetAcceptedQuote().Id)
	payInvoiceWithAssets(
		t.t, charlie, dave, hodlInv.payReq, assetID, withSmallShards(),
		withFailure(lnrpc.Payment_IN_FLIGHT, failureNone),
		withRFQ(quoteID),
	)

	// We now assert that the expected numbers of HTLCs are present on each
	// node.
	// Reminder, topology looks like this:
	//
	// Charlie <-> Dave <-> Erin <-> Fabia
	//
	// Therefore the routing nodes should have double the number of HTLCs
	// required for the payment present.
	assertNumHtlcs(t.t, charlie, 3)
	assertNumHtlcs(t.t, dave, 6)
	assertNumHtlcs(t.t, erin, 6)
	assertNumHtlcs(t.t, fabia, 3)

	// Now let's cancel the invoice on Fabia.
	payHash := hodlInv.preimage.Hash()
	_, err = fabia.InvoicesClient.CancelInvoice(
		ctx, &invoicesrpc.CancelInvoiceMsg{
			PaymentHash: payHash[:],
		},
	)
	require.NoError(t.t, err)

	// There should be no HTLCs present on any channel.
	assertNumHtlcs(t.t, charlie, 0)
	assertNumHtlcs(t.t, dave, 0)
	assertNumHtlcs(t.t, erin, 0)
	assertNumHtlcs(t.t, fabia, 0)

	// Now Fabia creates the normal invoice.
	invoiceResp = createAssetInvoice(
		t.t, erin, fabia, 10_000, assetID,
	)

	// Now Charlie pays the invoice, again by using the manually specified
	// RFQ quote ID. This payment should succeed.
	payInvoiceWithAssets(
		t.t, charlie, dave, invoiceResp.PaymentRequest, assetID,
		withSmallShards(), withRFQ(quoteID),
	)

	logBalance(t.t, nodes, assetID, "after manual rfq hodl")

	// Edge case: Charlie negotiates a quote with Dave which has a low max
	// amount (~170k sats). Then Charlie creates an invoice with a total
	// amount slightly larger than the max allowed in the quote (200k sats).
	// Erin will try to pay that invoice with sats, in shards of max size
	// 80k sats. Dave will eventually stop forwarding HTLCs as the RFQ HTLC
	// tracking mechanism should stop them from being forwarded, as they
	// violate the maximum allowed amount of the quote.

	// Charlie starts by negotiating the quote.
	inOneHour = time.Now().Add(time.Hour)
	res, err := charlieTap.RfqClient.AddAssetBuyOrder(
		ctx, &rfqrpc.AddAssetBuyOrderRequest{
			AssetSpecifier: &rfqrpc.AssetSpecifier{
				Id: &rfqrpc.AssetSpecifier_AssetId{
					AssetId: assetID,
				},
			},
			AssetMaxAmt:    10_000,
			Expiry:         uint64(inOneHour.Unix()),
			PeerPubKey:     dave.PubKey[:],
			TimeoutSeconds: 10,
		},
	)
	require.NoError(t.t, err)

	type acceptedQuote = *rfqrpc.AddAssetBuyOrderResponse_AcceptedQuote
	quote, ok := res.Response.(acceptedQuote)
	require.True(t.t, ok)

	// We now manually add the invoice in order to inject the above,
	// manually generated, quote.
	iResp, err := charlie.AddInvoice(ctx, &lnrpc.Invoice{
		Memo:       "",
		Value:      200_000,
		RPreimage:  bytes.Repeat([]byte{11}, 32),
		CltvExpiry: 60,
		RouteHints: []*lnrpc.RouteHint{{
			HopHints: []*lnrpc.HopHint{{
				NodeId: dave.PubKeyStr,
				ChanId: quote.AcceptedQuote.Scid,
			}},
		}},
	})
	require.NoError(t.t, err)

	// Now Erin tries to pay the invoice. Since rfq quote cannot satisfy the
	// total amount of the invoice this payment will fail.
	payInvoiceWithSatoshi(
		t.t, erin, iResp, withPayErrSubStr("context deadline exceeded"),
		withFailure(lnrpc.Payment_FAILED, failureNone),
	)

	logBalance(t.t, nodes, assetID, "after small manual rfq")
}

// testCustomChannelsStrictForwarding is a test that tests the strict forwarding
// behavior of a node when it comes to paying asset invoices with assets and
// BTC invoices with satoshis.
func testCustomChannelsStrictForwarding(ctx context.Context,
	net *NetworkHarness, t *harnessTest) {

	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplate)

	// Explicitly set the proof courier as Zane (now has no other role
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
	defer closeChannelAndAssert(t, net, dave, channelOp, true)

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

	// Do a payment from Charlie to Erin to shift the balances in all
	// channels enough to allow for the following payments in any direction.
	// Pay a normal bolt11 invoice involving RFQ flow.
	_ = createAndPayNormalInvoice(
		t.t, charlie, dave, erin, 500_000, assetID, withSmallShards(),
	)

	logBalance(t.t, nodes, assetID, "after payment")

	// Edge case: Now Dave creates an asset invoice to be paid for by Erin
	// with satoshi. For the last hop we try to settle the invoice in
	// satoshi, where we will check whether Daves's strict forwarding
	// works as expected. Charlie is only used as a dummy RFQ peer in this
	// case, Erin totally ignores the RFQ hint and just pays with sats.
	assetInvoice := createAssetInvoice(t.t, charlie, dave, 40, assetID)

	assetInvoiceStream, err := dave.InvoicesClient.SubscribeSingleInvoice(
		ctx, &invoicesrpc.SubscribeSingleInvoiceRequest{
			RHash: assetInvoice.RHash,
		},
	)
	require.NoError(t.t, err)

	// Erin pays Dave with enough satoshis, but Charlie will not settle as
	// he expects assets.
	hops := [][]byte{dave.PubKey[:]}
	payInvoiceWithSatoshiLastHop(
		t.t, erin, assetInvoice, hops, withFailure(
			lnrpc.Payment_FAILED, 0,
		),
	)

	// Make sure the invoice hasn't been settled and there's no HTLC on the
	// channel between Erin and Dave.
	t.lndHarness.LNDHarness.AssertInvoiceState(
		assetInvoiceStream, lnrpc.Invoice_OPEN,
	)
	assertHTLCNotActive(t.t, erin, channelOp, assetInvoice.RHash)
	assertInvoiceState(
		t.t, dave, assetInvoice.PaymentAddr, lnrpc.Invoice_OPEN,
	)

	logBalance(t.t, nodes, assetID, "after failed payment (asset "+
		"invoice, strict forwarding)")

	// Now let's make sure that we can actually still pay the invoice with
	// assets from Charlie.
	payInvoiceWithAssets(
		t.t, charlie, dave, assetInvoice.PaymentRequest, assetID,
	)
	t.lndHarness.LNDHarness.AssertInvoiceState(
		assetInvoiceStream, lnrpc.Invoice_SETTLED,
	)
	assertInvoiceState(
		t.t, dave, assetInvoice.PaymentAddr, lnrpc.Invoice_SETTLED,
	)

	// Edge case: We now try the opposite: Dave creates a BTC invoice but
	// Charlie tries to pay it with assets. This should fail as well.
	btcInvoice := createNormalInvoice(t.t, dave, 1_000)
	btcInvoiceStream, err := dave.InvoicesClient.SubscribeSingleInvoice(
		ctx, &invoicesrpc.SubscribeSingleInvoiceRequest{
			RHash: btcInvoice.RHash,
		},
	)
	require.NoError(t.t, err)

	payInvoiceWithAssets(
		t.t, charlie, dave, btcInvoice.PaymentRequest, assetID,
		withFailure(lnrpc.Payment_FAILED, failureIncorrectDetails),
	)
	t.lndHarness.LNDHarness.AssertInvoiceState(
		btcInvoiceStream, lnrpc.Invoice_OPEN,
	)
	assertHTLCNotActive(t.t, erin, channelOp, btcInvoice.RHash)
	assertInvoiceState(
		t.t, dave, btcInvoice.PaymentAddr, lnrpc.Invoice_OPEN,
	)

	// And finally we make sure that we can still pay the invoice with
	// satoshis from Erin, using custom records.
	payInvoiceWithSatoshi(t.t, erin, btcInvoice, withDestCustomRecords(
		map[uint64][]byte{106823: {0x01}},
	))
	t.lndHarness.LNDHarness.AssertInvoiceState(
		btcInvoiceStream, lnrpc.Invoice_SETTLED,
	)
	assertInvoiceState(
		t.t, dave, btcInvoice.PaymentAddr, lnrpc.Invoice_SETTLED,
	)
}

// testCustomChannelsBalanceConsistency is a test that test the balance of nodes
// under channel opening circumstances.
func testCustomChannelsBalanceConsistency(ctx context.Context,
	net *NetworkHarness, t *harnessTest) {

	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplate)

	// Explicitly set the proof courier as Zane (now has no other role
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
		ctx, &tchrpc.FundChannelRequest{
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
		t.t, charlieTap.node, cents, 1, charlieBalance, 0,
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
		t.t, charlieTap.node, daveTap.node, charlieBalance, cents,
	)

	logBalance(t.t, nodes, assetID, "initial")

	// Normal case.
	// Send 500 assets from Charlie to Dave.
	sendAssetKeySendPayment(
		t.t, charlie, dave, 500, assetID, fn.None[int64](),
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
		t.t, dave, charlie, 250, assetID, fn.None[int64](),
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

// testCustomChannelsSingleAssetMultiInput tests whether it is possible to fund
// a channel using FundChannel that uses multiple inputs from the same asset.
func testCustomChannelsSingleAssetMultiInput(ctx context.Context,
	net *NetworkHarness, t *harnessTest) {

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

	// Mint an assets on Charlie and sync Dave to Charlie as the universe.
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

	t.Logf("Minted %d lightning cents, syncing universes...",
		cents.Amount)
	syncUniverses(t.t, charlieTap, dave)
	t.Logf("Universes synced between all nodes, distributing assets...")

	// Charlie should have two balance outputs with the full balance.
	assertAssetBalance(t.t, charlieTap, assetID, cents.Amount)

	// Send assets to Dave so he can fund a channel.
	halfCentsAmount := cents.Amount / 2
	daveAddr1, err := daveTap.NewAddr(ctx, &taprpc.NewAddrRequest{
		Amt:     halfCentsAmount,
		AssetId: assetID,
		ProofCourierAddr: fmt.Sprintf(
			"%s://%s", proof.UniverseRpcCourierType,
			charlieTap.node.Cfg.LitAddr(),
		),
	})
	require.NoError(t.t, err)
	daveAddr2, err := daveTap.NewAddr(ctx, &taprpc.NewAddrRequest{
		Amt:     halfCentsAmount,
		AssetId: assetID,
		ProofCourierAddr: fmt.Sprintf(
			"%s://%s", proof.UniverseRpcCourierType,
			charlieTap.node.Cfg.LitAddr(),
		),
	})
	require.NoError(t.t, err)

	t.Logf("Sending %v asset units to Dave twice...", halfCentsAmount)

	// Send the assets to Dave.
	itest.AssertAddrCreated(t.t, daveTap, cents, daveAddr1)
	itest.AssertAddrCreated(t.t, daveTap, cents, daveAddr2)
	sendResp, err := charlieTap.SendAsset(ctx, &taprpc.SendAssetRequest{
		TapAddrs: []string{daveAddr1.Encoded, daveAddr2.Encoded},
	})
	require.NoError(t.t, err)
	itest.ConfirmAndAssertOutboundTransferWithOutputs(
		t.t, t.lndHarness.Miner.Client, charlieTap, sendResp, assetID,
		[]uint64{
			cents.Amount - 2*halfCentsAmount, halfCentsAmount,
			halfCentsAmount,
		}, 0, 1, 3,
	)
	itest.AssertNonInteractiveRecvComplete(t.t, daveTap, 2)

	// Fund a channel using multiple inputs from the same asset.
	fundRespCD, err := daveTap.FundChannel(
		ctx, &tchrpc.FundChannelRequest{
			AssetAmount:        2 * halfCentsAmount,
			AssetId:            assetID,
			PeerPubkey:         charlieTap.node.PubKey[:],
			FeeRateSatPerVbyte: 5,
			PushSat:            0,
		},
	)
	require.NoError(t.t, err)
	t.Logf("Funded channel between Charlie and Dave: %v", fundRespCD)

	// Let's confirm the channel.
	mineBlocks(t, net, 6, 1)

	// Tapd should not report any balance for Charlie, since the asset is
	// used in a funding transaction. It should also not report any balance
	// for Dave. All those balances are reported through channel balances.
	assertAssetBalance(t.t, charlieTap, assetID, 0)
	assertAssetBalance(t.t, daveTap, assetID, 0)

	// Make sure the channel shows the correct asset information.
	assertAssetChan(
		t.t, charlieTap.node, daveTap.node, 2*halfCentsAmount, cents,
	)
}

// testCustomChannelsOraclePricing tests that all asset transfers are correctly
// priced when using an oracle that isn't tapd's mock oracle.
func testCustomChannelsOraclePricing(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	usdMetaData := &taprpc.AssetMeta{
		Data: []byte(`{
"description":"this is a USD stablecoin with decimal display of 6"
}`),
		Type: taprpc.AssetMetaType_META_TYPE_JSON,
	}

	const decimalDisplay = 6
	itestAsset = &mintrpc.MintAsset{
		AssetType: taprpc.AssetType_NORMAL,
		Name:      "USD",
		AssetMeta: usdMetaData,
		// We mint 1 million USD with a decimal display of 6, which
		// results in 1 trillion asset units.
		Amount:         1_000_000_000_000,
		DecimalDisplay: decimalDisplay,
	}

	oracleAddr := fmt.Sprintf("localhost:%d", port.NextAvailablePort())
	oracle := newOracleHarness(oracleAddr)
	oracle.start(t.t)
	t.t.Cleanup(oracle.stop)

	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplateNoOracle)
	litdArgs = append(litdArgs, fmt.Sprintf(
		"--taproot-assets.experimental.rfq.priceoracleaddress="+
			"rfqrpc://%s", oracleAddr,
	))

	// Explicitly set the proof courier as Zane (now has no other role
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
	const btcChannelFundingAmount = 10_000_000
	chanPointDE := openChannelAndAssert(
		t, net, dave, erin, lntest.OpenChannelParams{
			Amt:         btcChannelFundingAmount,
			SatPerVByte: 5,
		},
	)
	defer closeChannelAndAssert(t, net, dave, chanPointDE, false)

	// This is the only public channel, we need everyone to be aware of it.
	assertChannelKnown(t.t, charlie, chanPointDE)
	assertChannelKnown(t.t, fabia, chanPointDE)

	universeTap := newTapClient(t.t, zane)
	charlieTap := newTapClient(t.t, charlie)
	daveTap := newTapClient(t.t, dave)
	erinTap := newTapClient(t.t, erin)
	fabiaTap := newTapClient(t.t, fabia)
	yaraTap := newTapClient(t.t, yara)

	// Mint an asset on Charlie and sync Dave to Charlie as the universe.
	mintedAssets := itest.MintAssetsConfirmBatch(
		t.t, t.lndHarness.Miner.Client, charlieTap,
		[]*mintrpc.MintAssetRequest{
			{
				Asset: itestAsset,
			},
		},
	)
	usdAsset := mintedAssets[0]
	assetID := usdAsset.AssetGenesis.AssetId

	// Now that we've minted the asset, we can set the price in the oracle.
	var id asset.ID
	copy(id[:], assetID)

	// Let's assume the current USD price for 1 BTC is 66,548.40. We'll take
	// that price and add a 4% spread, 2% on each side (buy/sell) to earn
	// money as the oracle. 2% is 1,330.97, so we'll set the sell price to
	// 65,217.43 and the purchase price to 67,879.37.
	// The following numbers are to help understand the magic numbers below.
	// They're the price in USD/BTC, the price of 1 USD in sats and the
	// expected price in asset units per BTC.
	// 65,217.43 => 1533.332 => 65_217_430_000
	// 66,548.40 => 1502.666 => 66_548_400_000
	// 67,879.37 => 1473.202 => 67_879_370_000
	salePrice := rfqmath.NewBigIntFixedPoint(65_217_43, 2)
	purchasePrice := rfqmath.NewBigIntFixedPoint(67_879_37, 2)

	// We now have the prices defined in USD. But the asset has a decimal
	// display of 6, so we need to multiply them by 10^6.
	factor := rfqmath.NewBigInt(
		big.NewInt(int64(math.Pow10(decimalDisplay))),
	)
	salePrice.Coefficient = salePrice.Coefficient.Mul(factor)
	purchasePrice.Coefficient = purchasePrice.Coefficient.Mul(factor)
	oracle.setPrice(id, purchasePrice, salePrice)

	t.Logf("Minted %d USD assets, syncing universes...", usdAsset.Amount)
	syncUniverses(t.t, charlieTap, dave, erin, fabia, yara)
	t.Logf("Universes synced between all nodes, distributing assets...")

	const (
		sendAmount        = uint64(400_000_000)
		daveFundingAmount = uint64(400_000_000)
		erinFundingAmount = uint64(200_000_000)
	)
	charlieFundingAmount := usdAsset.Amount - 2*sendAmount

	chanPointCD, chanPointDY, chanPointEF := createTestAssetNetwork(
		t, net, charlieTap, daveTap, erinTap, fabiaTap, yaraTap,
		universeTap, usdAsset, sendAmount, charlieFundingAmount,
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

	// We now create an invoice at Fabia for 100 USD, which is 100_000_000
	// asset units with decimal display of 6.
	const fabiaInvoiceAssetAmount = 100_000_000
	invoiceResp := createAssetInvoice(
		t.t, erin, fabia, fabiaInvoiceAssetAmount, assetID,
	)
	decodedInvoice, err := fabia.DecodePayReq(ctx, &lnrpc.PayReqString{
		PayReq: invoiceResp.PaymentRequest,
	})
	require.NoError(t.t, err)

	// The invoice amount should come out as 100 * 1533.332.
	require.EqualValues(t.t, 153_333_242, decodedInvoice.NumMsat)

	numUnits, rate := payInvoiceWithAssets(
		t.t, charlie, dave, invoiceResp.PaymentRequest, assetID,
	)
	logBalance(t.t, nodes, assetID, "after invoice")

	// The calculated amount Charlie has to pay should come out as
	// 153_333_242 / 1473.202, which is quite exactly 4% more than will
	// arrive at the destination (which is the oracle's configured spread).
	// This is before routing fees though.
	const charlieInvoiceAmount = 104_081_638
	require.EqualValues(t.t, charlieInvoiceAmount, numUnits)

	// The default routing fees are 1ppm + 1msat per hop, and we have 3
	// hops in total, but only 1 hop where routing fees are collected in sats.
	charliePaidMSat := addRoutingFee(addRoutingFee(lnwire.MilliSatoshi(
		decodedInvoice.NumMsat,
	)))
	charliePaidAmount := rfqmath.MilliSatoshiToUnits(
		charliePaidMSat, rate,
	).ScaleTo(0).ToUint64()
	assertPaymentHtlcAssets(
		t.t, charlie, invoiceResp.RHash, assetID, charliePaidAmount,
	)

	// We now make sure the asset and satoshi channel balances are exactly
	// what we expect them to be.
	var (
		// channelFundingAmount is the hard coded satoshi amount that
		// currently goes into asset channels.
		channelFundingAmount int64 = 100_000

		// commitFeeP2TR is the default commit fee for a P2TR channel
		// commitment with 4 outputs (to_local, to_remote, 2 anchors).
		commitFeeP2TR        int64 = 2420
		commitFeeP2WSH       int64 = 2810
		anchorAmount         int64 = 330
		assetHtlcCarryAmount       = int64(
			rfqmath.DefaultOnChainHtlcSat,
		)
		unbalancedLocalAmount = channelFundingAmount - commitFeeP2TR -
			anchorAmount
		balancedLocalAmount = unbalancedLocalAmount - anchorAmount
	)

	// Checking Charlie's sat and asset balances in channel Charlie->Dave.
	assertChannelSatBalance(
		t.t, charlie, chanPointCD,
		balancedLocalAmount-assetHtlcCarryAmount, assetHtlcCarryAmount,
	)
	assertChannelAssetBalance(
		t.t, charlie, chanPointCD,
		charlieFundingAmount-charliePaidAmount, charliePaidAmount,
	)

	// Checking Dave's sat and asset balances in channel Charlie->Dave.
	assertChannelSatBalance(
		t.t, dave, chanPointCD,
		assetHtlcCarryAmount, balancedLocalAmount-assetHtlcCarryAmount,
	)
	assertChannelAssetBalance(
		t.t, dave, chanPointCD,
		charliePaidAmount, charlieFundingAmount-charliePaidAmount,
	)

	// Checking Dave's sat balance in channel Dave->Erin.
	forwardAmountDave := addRoutingFee(
		lnwire.MilliSatoshi(decodedInvoice.NumMsat),
	).ToSatoshis()
	assertChannelSatBalance(
		t.t, dave, chanPointDE,
		btcChannelFundingAmount-commitFeeP2WSH-2*anchorAmount-
			int64(forwardAmountDave),
		int64(forwardAmountDave),
	)

	// Checking Erin's sat balance in channel Dave->Erin.
	assertChannelSatBalance(
		t.t, erin, chanPointDE,
		int64(forwardAmountDave),
		btcChannelFundingAmount-commitFeeP2WSH-2*anchorAmount-
			int64(forwardAmountDave),
	)

	// Checking Erin's sat and asset balances in channel Erin->Fabia.
	assertChannelSatBalance(
		t.t, erin, chanPointEF,
		balancedLocalAmount-assetHtlcCarryAmount, assetHtlcCarryAmount,
	)
	assertChannelAssetBalance(
		t.t, erin, chanPointEF,
		erinFundingAmount-fabiaInvoiceAssetAmount,
		fabiaInvoiceAssetAmount,
	)

	// Checking Fabia's sat and asset balances in channel Erin->Fabia.
	assertChannelSatBalance(
		t.t, fabia, chanPointEF,
		assetHtlcCarryAmount, balancedLocalAmount-assetHtlcCarryAmount,
	)
	assertChannelAssetBalance(
		t.t, erin, chanPointEF,
		fabiaInvoiceAssetAmount,
		erinFundingAmount-fabiaInvoiceAssetAmount,
	)

	t.Logf("Closing Charlie -> Dave channel")
	closeAssetChannelAndAssert(
		t, net, charlie, dave, chanPointCD, assetID, nil, universeTap,
		noOpCoOpCloseBalanceCheck,
	)

	t.Logf("Closing Dave -> Yara channel, close initiated by Yara")
	closeAssetChannelAndAssert(
		t, net, yara, dave, chanPointDY, assetID, nil, universeTap,
		noOpCoOpCloseBalanceCheck,
	)

	t.Logf("Closing Erin -> Fabia channel")
	closeAssetChannelAndAssert(
		t, net, erin, fabia, chanPointEF, assetID, nil, universeTap,
		noOpCoOpCloseBalanceCheck,
	)
}

// testCustomChannelsFee tests whether the custom channel funding process
// fails if the proposed fee rate is lower than the minimum relay fee.
func testCustomChannelsFee(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

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

	// Mint an assets on Charlie and sync Dave to Charlie as the universe.
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

	// Fund a channel with a fee rate of zero.
	zeroFeeRate := uint32(0)

	_, err = charlieTap.FundChannel(
		ctx, &tchrpc.FundChannelRequest{
			AssetAmount:        cents.Amount,
			AssetId:            assetID,
			PeerPubkey:         daveTap.node.PubKey[:],
			FeeRateSatPerVbyte: zeroFeeRate,
			PushSat:            0,
		},
	)

	errSpecifyFeerate := "fee rate must be specified"
	require.ErrorContains(t.t, err, errSpecifyFeerate)

	// Fund a channel with a fee rate that is too low.
	tooLowFeeRate := uint32(1)
	tooLowFeeRateAmount := chainfee.SatPerVByte(tooLowFeeRate)

	_, err = charlieTap.FundChannel(
		ctx, &tchrpc.FundChannelRequest{
			AssetAmount:        cents.Amount,
			AssetId:            assetID,
			PeerPubkey:         daveTap.node.PubKey[:],
			FeeRateSatPerVbyte: tooLowFeeRate,
			PushSat:            0,
		},
	)

	errFeeRateTooLow := fmt.Sprintf("fee rate %s too low, "+
		"min_relay_fee: ", tooLowFeeRateAmount.FeePerKWeight())
	require.ErrorContains(t.t, err, errFeeRateTooLow)
}

// testCustomChannelsHtlcForceClose tests that we can force close a channel
// with HTLCs in both directions and that the HTLC outputs are correctly
// swept.
func testCustomChannelsHtlcForceClose(ctxb context.Context, net *NetworkHarness,
	t *harnessTest) {

	runCustomChannelsHtlcForceClose(ctxb, t, net, false)
	runCustomChannelsHtlcForceClose(ctxb, t, net, true)
}

// runCustomChannelsHtlcForceClose is a helper function that runs the HTLC force
// close test with the given MPP setting.
func runCustomChannelsHtlcForceClose(ctx context.Context, t *harnessTest,
	net *NetworkHarness, mpp bool) {

	t.Logf("Running test with MPP: %v", mpp)

	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplate)

	// Zane will serve as our designated Universe node.
	zane, err := net.NewNode(
		t.t, "Zane", lndArgs, false, true, litdArgs...,
	)
	require.NoError(t.t, err)

	litdArgs = append(litdArgs, fmt.Sprintf(
		"--taproot-assets.proofcourieraddr=%s://%s",
		proof.UniverseRpcCourierType, zane.Cfg.LitAddr(),
	))

	// Next, we'll make Alice and Bob, who will be the main nodes under
	// test.
	alice, err := net.NewNode(
		t.t, "Alice", lndArgs, false, true, litdArgs...,
	)
	require.NoError(t.t, err)
	bob, err := net.NewNode(
		t.t, "Bob", lndArgs, false, true, litdArgs...,
	)
	require.NoError(t.t, err)

	// Now we'll connect all nodes, and also fund them with some coins.
	nodes := []*HarnessNode{alice, bob}
	connectAllNodes(t.t, net, nodes)
	fundAllNodes(t.t, net, nodes)

	aliceTap := newTapClient(t.t, alice)
	bobTap := newTapClient(t.t, bob)

	// Next, we'll mint an asset for Alice, who will be the node that opens
	// the channel outbound.
	mintedAssets := itest.MintAssetsConfirmBatch(
		t.t, t.lndHarness.Miner.Client, aliceTap,
		[]*mintrpc.MintAssetRequest{
			{
				Asset: itestAsset,
			},
		},
	)
	cents := mintedAssets[0]
	assetID := cents.AssetGenesis.AssetId

	t.Logf("Minted %d lightning cents, syncing universes...", cents.Amount)
	syncUniverses(t.t, aliceTap, bob)
	t.Logf("Universes synced between all nodes, distributing assets...")

	// With the assets created, and synced -- we'll now open the channel
	// between Alice and Bob.
	t.Logf("Opening asset channels...")
	assetFundResp, err := aliceTap.FundChannel(
		ctx, &tchrpc.FundChannelRequest{
			AssetAmount:        fundingAmount,
			AssetId:            assetID,
			PeerPubkey:         bob.PubKey[:],
			FeeRateSatPerVbyte: 5,
		},
	)
	require.NoError(t.t, err)
	t.Logf("Funded channel between Alice and Bob: %v", assetFundResp)

	// With the channel open, mine a block to confirm it.
	mineBlocks(t, net, 6, 1)

	// Before we start sending out payments, let's make sure each node can
	// see the other one in the graph and has all required features.
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(alice, bob))
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(bob, alice))

	// First, we'll send over some funds from Alice to Bob, as we want Bob
	// to be able to extend HTLCs in the other direction.
	const (
		numPayments   = 10
		keySendAmount = 2_500
	)
	for i := 0; i < numPayments; i++ {
		sendAssetKeySendPayment(
			t.t, alice, bob, keySendAmount, assetID,
			fn.None[int64](),
		)
	}

	// Now that both parties have some funds, we'll move onto the main test.
	//
	// We'll make 2 hodl invoice for each peer, so 4 total. From Alice's
	// PoV, she'll have two outgoing HTLCs (or +4 with MPP), and two
	// incoming HTLCs.
	var (
		bobHodlInvoices   []assetHodlInvoice
		aliceHodlInvoices []assetHodlInvoice

		// The default oracle rate is 17_180 mSat/asset unit, so 10_000
		// will be equal to 171_800_000 mSat. When we use the mpp bool
		// for the smallShards param of payInvoiceWithAssets, that
		// means we'll split the payment into shards of 80_000_000 mSat
		// max. So we'll get three shards per payment.
		assetInvoiceAmt   = 10_000
		assetsPerMPPShard = 4656
	)
	for i := 0; i < 2; i++ {
		bobHodlInvoices = append(
			bobHodlInvoices, createAssetHodlInvoice(
				t.t, alice, bob, uint64(assetInvoiceAmt),
				assetID,
			),
		)
		aliceHodlInvoices = append(
			aliceHodlInvoices, createAssetHodlInvoice(
				t.t, bob, alice, uint64(assetInvoiceAmt),
				assetID,
			),
		)
	}

	// Now we'll have both Bob and Alice pay each other's invoices. We only
	// care that they're in flight at this point, as they won't be settled
	// yet.
	for _, aliceInvoice := range aliceHodlInvoices {
		opts := []payOpt{
			withFailure(
				lnrpc.Payment_IN_FLIGHT,
				lnrpc.PaymentFailureReason_FAILURE_REASON_NONE,
			),
		}
		if mpp {
			opts = append(opts, withSmallShards())
		}
		payInvoiceWithAssets(
			t.t, bob, alice, aliceInvoice.payReq, assetID, opts...,
		)
	}
	for _, bobInvoice := range bobHodlInvoices {
		payInvoiceWithAssets(
			t.t, alice, bob, bobInvoice.payReq, assetID,
			withFailure(
				lnrpc.Payment_IN_FLIGHT,
				lnrpc.PaymentFailureReason_FAILURE_REASON_NONE,
			),
		)
	}

	// At this point, both sides should have 4 (or +4 with MPP) HTLCs
	// active.
	numHtlcs := 4
	if mpp {
		numAdditionalShards := assetInvoiceAmt / assetsPerMPPShard
		numHtlcs += numAdditionalShards * 2
	}
	assertNumHtlcs(t.t, alice, numHtlcs)
	assertNumHtlcs(t.t, bob, numHtlcs)

	// Before we force close, we'll grab the current height, the CSV delay
	// needed, and also the absolute timeout of the set of active HTLCs.
	closeExpiryInfo := newCloseExpiryInfo(t.t, alice)

	// With all of the HTLCs established, we'll now force close the channel
	// with Alice.
	t.Logf("Force close by Alice w/ HTLCs...")
	aliceChanPoint := &lnrpc.ChannelPoint{
		OutputIndex: uint32(assetFundResp.OutputIndex),
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: assetFundResp.Txid,
		},
	}
	_, closeTxid, err := net.CloseChannel(alice, aliceChanPoint, true)
	require.NoError(t.t, err)

	t.Logf("Channel closed! Mining blocks, close_txid=%v", closeTxid)

	// Next, we'll mine a block which should start the clock ticking on the
	// relative timeout for the Alice, and Bob.
	//
	// After this next block, both of them can start to sweep.
	//
	// For Alice, she'll go to the second level, revealing her preimage in
	// the process. She'll then need to wait for the relative timeout to
	// expire before she can sweep her output.
	//
	// For Bob, since the remote party (Alice) closed, he can try to sweep
	// right away after initial confirmation.
	mineBlocks(t, net, 1, 1)

	// After force closing, Bob should now have a transfer that tracks the
	// force closed commitment transaction.
	locateAssetTransfers(t.t, bobTap, *closeTxid)

	t.Logf("Settling Bob's hodl invoice")

	// At this point, the commitment transaction has been mined, and we have
	// 4 total HTLCs on Alice's commitment transaction:
	//
	//  * 2x outgoing HTLCs from Alice to Bob
	//  * 2x incoming HTLCs from Bob to Alice (+2 with MPP)
	//
	// We'll leave half the HTLCs timeout, while pulling the other half.
	// To start, we'll signal Bob to settle one of his incoming HTLCs on
	// Alice's commitment transaction. For him, this is a remote success
	// spend, so there's no CSV delay other than the 1 CSV (carve out), and
	// he can spend directly from the commitment transaction.
	_, err = bob.InvoicesClient.SettleInvoice(
		ctx, &invoicesrpc.SettleInvoiceMsg{
			Preimage: bobHodlInvoices[0].preimage[:],
		},
	)
	require.NoError(t.t, err)

	// We'll pause here for Bob to extend the sweep request to the sweeper.
	assertSweepExists(
		t.t, bob,
		walletrpc.WitnessType_TAPROOT_HTLC_ACCEPTED_REMOTE_SUCCESS,
	)

	// We'll mine an empty block to get the sweeper to tick.
	mineBlocks(t, net, 1, 0)

	bobSweepTx1, err := waitForNTxsInMempool(
		net.Miner.Client, 1, shortTimeout,
	)
	require.NoError(t.t, err)

	// Next, we'll mine an additional block, this should allow Bob to sweep
	// both his commitment output, and the incoming HTLC that we just
	// settled above.
	mineBlocks(t, net, 1, 1)

	// At this point, we should have the next sweep transaction in the
	// mempool: Bob's incoming HTLC sweep directly off the commitment
	// transaction.
	bobSweepTx2, err := waitForNTxsInMempool(
		net.Miner.Client, 1, shortTimeout,
	)
	require.NoError(t.t, err)

	// We'll now mine the next block, which should confirm Bob's HTLC sweep
	// transaction.
	mineBlocks(t, net, 1, 1)

	bobSweepTransfer1 := locateAssetTransfers(t.t, bobTap, *bobSweepTx1[0])
	bobSweepTransfer2 := locateAssetTransfers(t.t, bobTap, *bobSweepTx2[0])
	t.Logf("Bob's sweep transfer 1: %v",
		toProtoJSON(t.t, bobSweepTransfer1))
	t.Logf("Bob's sweep transfer 2: %v",
		toProtoJSON(t.t, bobSweepTransfer2))

	t.Logf("Confirming Bob's remote HTLC success sweep")

	// Bob's balance should now reflect that he's gained the value of the
	// HTLC, in addition to his settled balance. We need to subtract 1 from
	// the final balance due to the rounding down of the asset amount during
	// RFQ conversion.
	bobExpectedBalance := closeExpiryInfo.remoteAssetBalance +
		uint64(assetInvoiceAmt-1)
	t.Logf("Expecting Bob's balance to be %d", bobExpectedBalance)
	assertSpendableBalance(t.t, bobTap, assetID, bobExpectedBalance)

	// With Bob's HTLC settled, we'll now have Alice do the same. For her,
	// it'll be a 2nd level sweep, which requires an extra transaction.
	//
	// Before, we do that though, enough blocks have passed so Alice can now
	// sweep her to-local output. So we'll mine an extra block, then assert
	// that she's swept everything properly. With the way the sweeper works,
	// we need to mine one extra block before the sweeper picks things up.
	mineBlocks(t, net, 1, 0)

	aliceSweepTx1, err := waitForNTxsInMempool(
		net.Miner.Client, 1, shortTimeout,
	)
	require.NoError(t.t, err)

	mineBlocks(t, net, 1, 1)

	aliceSweepTransfer1 := locateAssetTransfers(
		t.t, aliceTap, *aliceSweepTx1[0],
	)
	t.Logf("Alice's sweep transfer 1: %v",
		toProtoJSON(t.t, aliceSweepTransfer1))

	t.Logf("Confirming Alice's to-local sweep")

	// With this extra block mined, Alice's settled balance should be the
	// starting balance, minus the 2 HTLCs, plus her settled balance.
	aliceExpectedBalance := itestAsset.Amount - fundingAmount
	aliceExpectedBalance += closeExpiryInfo.localAssetBalance
	assertSpendableBalance(
		t.t, aliceTap, assetID, aliceExpectedBalance,
	)

	t.Logf("Settling Alice's hodl invoice")

	// With her commitment output swept above, we'll now settle one of
	// Alice's incoming HTLCs.
	_, err = alice.InvoicesClient.SettleInvoice(
		ctx, &invoicesrpc.SettleInvoiceMsg{
			Preimage: aliceHodlInvoices[0].preimage[:],
		},
	)
	require.NoError(t.t, err)

	// We'll pause here for Alice to extend the sweep request to the
	// sweeper.
	assertSweepExists(
		t.t, alice,
		walletrpc.WitnessType_TAPROOT_HTLC_ACCEPTED_LOCAL_SUCCESS,
	)

	// We'll now mine a block, which should trigger Alice's broadcast of the
	// second level sweep transaction.
	sweepBlocks := mineBlocks(t, net, 1, 0)

	// If the block mined above didn't also mine our sweep, then we'll mine
	// one final block which will confirm Alice's sweep transaction.
	if len(sweepBlocks[0].Transactions) == 1 {
		sweepTx, err := waitForNTxsInMempool(
			net.Miner.Client, 1, shortTimeout,
		)
		require.NoError(t.t, err)

		// With the sweep transaction in the mempool, we'll mine a block
		// to confirm the sweep.
		mineBlocks(t, net, 1, 1)

		aliceSweepTransfer := locateAssetTransfers(
			t.t, aliceTap, *sweepTx[0],
		)
		t.Logf("Alice's first-level sweep transfer: %v",
			toProtoJSON(t.t, aliceSweepTransfer))
	} else {
		sweepTx := sweepBlocks[0].Transactions[1]
		aliceSweepTransfer := locateAssetTransfers(
			t.t, aliceTap, sweepTx.TxHash(),
		)
		t.Logf("Alice's first-level sweep transfer: %v",
			toProtoJSON(t.t, aliceSweepTransfer))
	}

	t.Logf("Confirming Alice's second level remote HTLC success sweep")

	// Next, we'll mine enough blocks to trigger the CSV expiry so Alice can
	// sweep the HTLC into her wallet.
	mineBlocks(t, net, closeExpiryInfo.csvDelay, 0)

	// We'll pause here and wait until the sweeper recognizes that we've
	// offered the second level sweep transaction.
	assertSweepExists(
		t.t, alice,
		//nolint: lll
		walletrpc.WitnessType_TAPROOT_HTLC_ACCEPTED_SUCCESS_SECOND_LEVEL,
	)

	t.Logf("Confirming Alice's local HTLC success sweep")

	// Now that we know the sweep was offered, we'll mine an extra block to
	// actually trigger a sweeper broadcast. Due to an internal block race
	// condition, the sweep transaction may have already been
	// published+mined. If so, we don't need to mine the extra block.
	sweepBlocks = mineBlocks(t, net, 1, 0)

	// If the block mined above didn't also mine our sweep, then we'll mine
	// one final block which will confirm Alice's sweep transaction.
	if len(sweepBlocks[0].Transactions) == 1 {
		sweepTx, err := waitForNTxsInMempool(
			net.Miner.Client, 1, shortTimeout,
		)
		require.NoError(t.t, err)

		mineBlocks(t, net, 1, 1)

		aliceSweepTransfer := locateAssetTransfers(
			t.t, aliceTap, *sweepTx[0],
		)
		t.Logf("Alice's second-level sweep transfer: %v",
			toProtoJSON(t.t, aliceSweepTransfer))
	} else {
		sweepTx := sweepBlocks[0].Transactions[1]
		aliceSweepTransfer := locateAssetTransfers(
			t.t, aliceTap, sweepTx.TxHash(),
		)
		t.Logf("Alice's second-level sweep transfer: %v",
			toProtoJSON(t.t, aliceSweepTransfer))
	}

	// With the sweep transaction confirmed, Alice's balance should have
	// incremented by the amt of the HTLC.
	aliceExpectedBalance += uint64(assetInvoiceAmt - 1)
	assertSpendableBalance(
		t.t, aliceTap, assetID, aliceExpectedBalance,
	)

	t.Logf("Mining enough blocks to time out the remaining HTLCs")

	// At this point, we've swept two HTLCs: one from the remote commit, and
	// one via the second layer. We'll now mine the remaining amount of
	// blocks to time out the HTLCs.
	blockToMine := closeExpiryInfo.blockTillExpiry(
		aliceHodlInvoices[1].preimage.Hash(),
	)
	mineBlocks(t, net, blockToMine, 0)

	// We'll wait for both Alice and Bob to present their respective sweeps
	// to the sweeper.
	assertSweepExists(
		t.t, alice,
		walletrpc.WitnessType_TAPROOT_HTLC_LOCAL_OFFERED_TIMEOUT,
	)
	assertSweepExists(
		t.t, bob,
		walletrpc.WitnessType_TAPROOT_HTLC_OFFERED_REMOTE_TIMEOUT,
	)

	// We'll mine an extra block to trigger the sweeper.
	mineBlocks(t, net, 1, 0)

	t.Logf("Confirming initial HTLC timeout txns")

	// Finally, we'll mine a single block to confirm them.
	mineBlocks(t, net, 1, 2)

	// At this point, Bob's balance should be incremented by an additional
	// HTLC value.
	bobExpectedBalance += uint64(assetInvoiceAmt - 1)
	assertSpendableBalance(
		t.t, bobTap, assetID, bobExpectedBalance,
	)

	t.Logf("Mining extra blocks for Alice's CSV to expire on 2nd level txn")

	// Next, we'll mine 4 additional blocks to Alice's CSV delay expires for
	// the second level timeout output.
	mineBlocks(t, net, closeExpiryInfo.csvDelay, 0)

	// Wait for Alice to extend the second level output to the sweeper
	// before we mine the next block to the sweeper.
	assertSweepExists(
		t.t, alice,
		walletrpc.WitnessType_TAPROOT_HTLC_OFFERED_TIMEOUT_SECOND_LEVEL,
	)

	t.Logf("Confirming Alice's final timeout sweep")

	// With the way the sweeper works, we'll now need to mine an extra block
	// to trigger the sweep.
	sweepBlocks = mineBlocks(t, net, 1, 0)

	// If the block mined above didn't also mine our sweep, then we'll mine
	// one final block which will confirm Alice's sweep transaction.
	if len(sweepBlocks[0].Transactions) == 1 {
		sweepTx, err := waitForNTxsInMempool(
			net.Miner.Client, 1, shortTimeout,
		)
		require.NoError(t.t, err)

		// We'll mine one final block which will confirm Alice's sweep
		// transaction.
		mineBlocks(t, net, 1, 1)

		aliceSweepTransfer := locateAssetTransfers(
			t.t, aliceTap, *sweepTx[0],
		)
		t.Logf("Alice's final timeout sweep transfer: %v",
			toProtoJSON(t.t, aliceSweepTransfer))
	} else {
		sweepTx := sweepBlocks[0].Transactions[1]
		aliceSweepTransfer := locateAssetTransfers(
			t.t, aliceTap, sweepTx.TxHash(),
		)
		t.Logf("Alice's final timeout sweep transfer: %v",
			toProtoJSON(t.t, aliceSweepTransfer))
	}

	// Finally, we'll assert that Alice's balance has been incremented by
	// the timeout value.
	aliceExpectedBalance += uint64(assetInvoiceAmt - 1)
	t.Logf("Expecting Alice's balance to be %d", aliceExpectedBalance)
	assertSpendableBalance(
		t.t, aliceTap, assetID, aliceExpectedBalance,
	)

	t.Logf("Sending all settled funds to Zane")

	// As a final sanity check, both Alice and Bob should be able to send
	// their entire balances to Zane, our 3rd party.
	//
	// We'll make two addrs for Zane, one for Alice, and one for bob.
	zaneTap := newTapClient(t.t, zane)
	aliceAddr, err := zaneTap.NewAddr(ctx, &taprpc.NewAddrRequest{
		Amt:     aliceExpectedBalance,
		AssetId: assetID,
		ProofCourierAddr: fmt.Sprintf(
			"%s://%s", proof.UniverseRpcCourierType,
			zaneTap.node.Cfg.LitAddr(),
		),
	})
	require.NoError(t.t, err)
	bobAddr, err := zaneTap.NewAddr(ctx, &taprpc.NewAddrRequest{
		Amt:     bobExpectedBalance,
		AssetId: assetID,
		ProofCourierAddr: fmt.Sprintf(
			"%s://%s", proof.UniverseRpcCourierType,
			zaneTap.node.Cfg.LitAddr(),
		),
	})
	require.NoError(t.t, err)

	_, err = aliceTap.SendAsset(ctx, &taprpc.SendAssetRequest{
		TapAddrs: []string{aliceAddr.Encoded},
	})
	require.NoError(t.t, err)
	mineBlocks(t, net, 1, 1)

	itest.AssertNonInteractiveRecvComplete(t.t, zaneTap, 1)

	_, err = bobTap.SendAsset(ctx, &taprpc.SendAssetRequest{
		TapAddrs: []string{bobAddr.Encoded},
	})
	require.NoError(t.t, err)
	mineBlocks(t, net, 1, 1)

	itest.AssertNonInteractiveRecvComplete(t.t, zaneTap, 2)

	// Zane's balance should now be the sum of Alice's and Bob's balances.
	zaneExpectedBalance := aliceExpectedBalance + bobExpectedBalance
	assertSpendableBalance(
		t.t, zaneTap, assetID, zaneExpectedBalance,
	)
}

// testCustomChannelsForwardBandwidth is a test that runs through some Taproot
// Assets Channel liquidity edge cases, specifically related to forwarding HTLCs
// into channels with no available asset bandwidth.
func testCustomChannelsForwardBandwidth(ctx context.Context,
	net *NetworkHarness, t *harnessTest) {

	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplate)

	// Explicitly set the proof courier as Zane (now has no other role
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

	_, _, chanPointEF := createTestAssetNetwork(
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

	// We now deplete the channel between Erin and Fabia by moving all
	// assets to Fabia.
	sendAssetKeySendPayment(
		t.t, erin, fabia, erinFundingAmount, assetID, fn.None[int64](),
	)
	logBalance(t.t, nodes, assetID, "after moving assets to Fabia")

	// Test case 1: We cannot keysend more assets from Erin to Fabia.
	sendAssetKeySendPayment(
		t.t, erin, fabia, 1, assetID, fn.None[int64](),
		withFailure(lnrpc.Payment_FAILED, failureNoBalance),
	)

	// Test case 2: We cannot pay an invoice from Charlie to Fabia.
	invoiceResp := createAssetInvoice(t.t, erin, fabia, 123, assetID)
	payInvoiceWithSatoshi(
		t.t, charlie, invoiceResp,
		withFailure(lnrpc.Payment_FAILED, failureNoRoute),
	)

	// Test case 3: We now create an asset buy order for a normal amount of
	// assets. We then "fake" an invoice referencing that buy order that
	// is for an amount that is too small to be paid with a single asset
	// unit. This should be handled gracefully and not lead to a crash.
	// Ideally such an invoice shouldn't be created in the first place, but
	// we want to make sure that the system doesn't crash in this case.
	numUnits := uint64(10)
	buyOrderResp, err := fabiaTap.RfqClient.AddAssetBuyOrder(
		ctx, &rfqrpc.AddAssetBuyOrderRequest{
			AssetSpecifier: &rfqrpc.AssetSpecifier{
				Id: &rfqrpc.AssetSpecifier_AssetId{
					AssetId: assetID,
				},
			},
			AssetMaxAmt: numUnits,
			Expiry: uint64(
				time.Now().Add(time.Hour).Unix(),
			),
			PeerPubKey:     erin.PubKey[:],
			TimeoutSeconds: 10,
		},
	)
	require.NoError(t.t, err)

	quoteResp := buyOrderResp.Response
	quote, ok := quoteResp.(*rfqrpc.AddAssetBuyOrderResponse_AcceptedQuote)
	require.True(t.t, ok)

	// We calculate the milli-satoshi amount one below the equivalent of a
	// single asset unit.
	rate, err := oraclerpc.UnmarshalFixedPoint(&oraclerpc.FixedPoint{
		Coefficient: quote.AcceptedQuote.AskAssetRate.Coefficient,
		Scale:       quote.AcceptedQuote.AskAssetRate.Scale,
	})
	require.NoError(t.t, err)

	oneUnit := uint64(1)
	oneUnitFP := rfqmath.NewBigIntFixedPoint(oneUnit, 0)
	oneUnitMilliSat := rfqmath.UnitsToMilliSatoshi(oneUnitFP, *rate)

	t.Logf("Got quote for %v asset units per BTC", rate)
	msatPerUnit := float64(oneUnitMilliSat) / float64(oneUnit)
	t.Logf("Got quote for %v asset units at %3f msat/unit from peer %s "+
		"with SCID %d", numUnits, msatPerUnit, erin.PubKeyStr,
		quote.AcceptedQuote.Scid)

	// We now manually add the invoice in order to inject the above,
	// manually generated, quote.
	invoiceResp2, err := fabia.AddInvoice(ctx, &lnrpc.Invoice{
		Memo:      "too small invoice",
		ValueMsat: int64(oneUnitMilliSat - 1),
		RouteHints: []*lnrpc.RouteHint{{
			HopHints: []*lnrpc.HopHint{{
				NodeId: erin.PubKeyStr,
				ChanId: quote.AcceptedQuote.Scid,
			}},
		}},
	})
	require.NoError(t.t, err)

	payInvoiceWithSatoshi(t.t, dave, invoiceResp2, withFailure(
		lnrpc.Payment_FAILED, failureNoRoute,
	))

	// Let's make sure we can still use the channel between Erin and Fabia
	// by doing a satoshi keysend payment.
	sendKeySendPayment(t.t, erin, fabia, 2000)
	logBalance(t.t, nodes, assetID, "after BTC only keysend")

	// Finally, we close the channel between Erin and Fabia to make sure
	// everything is settled correctly.
	closeAssetChannelAndAssert(
		t, net, erin, fabia, chanPointEF, assetID, nil,
		universeTap, noOpCoOpCloseBalanceCheck,
	)
}

// testCustomChannelsDecodeAssetInvoice tests that we're able to properly
// decode and display asset invoice related information.
func testCustomChannelsDecodeAssetInvoice(ctx context.Context,
	net *NetworkHarness, t *harnessTest) {

	// First, we'll set up some information for our custom oracle that we'll
	// use to feed in price information.
	oracleAddr := fmt.Sprintf("localhost:%d", port.NextAvailablePort())
	oracle := newOracleHarness(oracleAddr)
	oracle.start(t.t)
	t.t.Cleanup(oracle.stop)

	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplateNoOracle)
	litdArgs = append(litdArgs, fmt.Sprintf(
		"--taproot-assets.experimental.rfq.priceoracleaddress="+
			"rfqrpc://%s", oracleAddr,
	))

	// For this test, Zane will be our dedicated Universe server for all
	// parties.
	zane, err := net.NewNode(
		t.t, "Zane", lndArgs, false, true, litdArgs...,
	)
	require.NoError(t.t, err)

	litdArgs = append(litdArgs, fmt.Sprintf(
		"--taproot-assets.proofcourieraddr=%s://%s",
		proof.UniverseRpcCourierType, zane.Cfg.LitAddr(),
	))

	// We'll just make a single node here, as this doesn't actually rely on
	// a set of active channels.
	alice, err := net.NewNode(
		t.t, "Alice", lndArgs, false, true, litdArgs...,
	)
	require.NoError(t.t, err)
	aliceTap := newTapClient(t.t, alice)

	// Fund Alice so she'll have enough funds to mint the asset.
	fundAllNodes(t.t, net, []*HarnessNode{alice})

	// Next, we'll make a new asset with a specified decimal display. We'll
	// also make grouped asset as well.
	usdMetaData := &taprpc.AssetMeta{
		Data: []byte(`{
"description":"this is a USD stablecoin with decimal display of 6"
}`),
		Type: taprpc.AssetMetaType_META_TYPE_JSON,
	}

	const decimalDisplay = 6
	itestAsset = &mintrpc.MintAsset{
		AssetType: taprpc.AssetType_NORMAL,
		Name:      "USD",
		AssetMeta: usdMetaData,
		// We mint 1 million USD with a decimal display of 6, which
		// results in 1 trillion asset units.
		Amount:          1_000_000_000_000,
		DecimalDisplay:  decimalDisplay,
		NewGroupedAsset: true,
	}

	// Mint an asset on Charlie and sync Dave to Charlie as the universe.
	mintedAssets := itest.MintAssetsConfirmBatch(
		t.t, t.lndHarness.Miner.Client, aliceTap,
		[]*mintrpc.MintAssetRequest{
			{
				Asset: itestAsset,
			},
		},
	)
	usdAsset := mintedAssets[0]
	assetID := usdAsset.AssetGenesis.AssetId

	// Now that we've minted the asset, we can set the price in the oracle.
	var id asset.ID
	copy(id[:], assetID)

	// We'll assume a price of $100,000.00 USD for a single BTC. This is
	// just the current subjective price our oracle will use. From this BTC
	// price, we'll scale things up to be in the precision of the asset we
	// minted above.
	btcPrice := rfqmath.NewBigIntFixedPoint(
		100_000_00, 2,
	)
	factor := rfqmath.NewBigInt(
		big.NewInt(int64(math.Pow10(decimalDisplay))),
	)
	btcPrice.Coefficient = btcPrice.Coefficient.Mul(factor)
	oracle.setPrice(id, btcPrice, btcPrice)

	// Now we'll make a normal invoice for 1 BTC using Alice.
	expirySeconds := 10
	amountSat := 100_000_000
	invoiceResp, err := alice.AddInvoice(ctx, &lnrpc.Invoice{
		Value:  int64(amountSat),
		Memo:   "normal invoice",
		Expiry: int64(expirySeconds),
	})
	require.NoError(t.t, err)

	payReq := invoiceResp.PaymentRequest

	// Now that we have our payment request, we'll call into the new decode
	// asset pay req call.
	decodeResp, err := aliceTap.DecodeAssetPayReq(
		ctx, &tapchannelrpc.AssetPayReq{
			AssetId:      assetID,
			PayReqString: payReq,
		},
	)
	require.NoError(t.t, err)

	// The decimal display information, genesis, and asset group information
	// should all match.
	require.EqualValues(
		t.t, decimalDisplay, decodeResp.DecimalDisplay.DecimalDisplay,
	)
	require.Equal(t.t, usdAsset.AssetGenesis, decodeResp.GenesisInfo)
	require.Equal(t.t, usdAsset.AssetGroup, decodeResp.AssetGroup)

	// The 1 BTC invoice should map to 100k asset units, with decimal
	// display 6 that's 100 billion asset units.
	const expectedUnits = 100_000_000_000
	require.Equal(t.t, int64(expectedUnits), int64(decodeResp.AssetAmount))
}
