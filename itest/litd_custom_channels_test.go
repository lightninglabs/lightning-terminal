package itest

import (
	"context"
	"crypto/rand"
	"fmt"
	"math"
	"math/big"
	"slices"
	"strconv"
	"time"

	"github.com/btcsuite/btcd/btcec/v2"
	"github.com/btcsuite/btcd/btcec/v2/schnorr"
	"github.com/btcsuite/btcd/btcutil"
	"github.com/btcsuite/btcd/chaincfg/chainhash"
	"github.com/btcsuite/btcd/wire"
	"github.com/lightninglabs/taproot-assets/asset"
	"github.com/lightninglabs/taproot-assets/itest"
	"github.com/lightninglabs/taproot-assets/proof"
	"github.com/lightninglabs/taproot-assets/rfqmath"
	"github.com/lightninglabs/taproot-assets/rfqmsg"
	"github.com/lightninglabs/taproot-assets/rpcutils"
	"github.com/lightninglabs/taproot-assets/taprpc"
	"github.com/lightninglabs/taproot-assets/taprpc/mintrpc"
	oraclerpc "github.com/lightninglabs/taproot-assets/taprpc/priceoraclerpc"
	"github.com/lightninglabs/taproot-assets/taprpc/rfqrpc"
	tchrpc "github.com/lightninglabs/taproot-assets/taprpc/tapchannelrpc"
	"github.com/lightninglabs/taproot-assets/taprpc/universerpc"
	"github.com/lightninglabs/taproot-assets/tapscript"
	"github.com/lightningnetwork/lnd/fn"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lnrpc/invoicesrpc"
	"github.com/lightningnetwork/lnd/lnrpc/routerrpc"
	"github.com/lightningnetwork/lnd/lntest"
	"github.com/lightningnetwork/lnd/lntest/node"
	"github.com/lightningnetwork/lnd/lntest/port"
	"github.com/lightningnetwork/lnd/lntypes"
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
		"--height-hint-cache-query-disable",
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
	// nolint:ll
	litdArgsTemplate = append(litdArgsTemplateNoOracle, []string{
		"--taproot-assets.experimental.rfq.priceoracleaddress=" +
			"use_mock_price_oracle_service_promise_to_" +
			"not_use_on_mainnet",
		"--taproot-assets.experimental.rfq.mockoracleassetsperbtc=" +
			"5820600",
		"--taproot-assets.experimental.rfq.acceptpricedeviationppm=50000",
	}...)

	// nolint:ll
	litdArgsTemplateDiffOracle = append(litdArgsTemplateNoOracle, []string{
		"--taproot-assets.experimental.rfq.priceoracleaddress=" +
			"use_mock_price_oracle_service_promise_to_" +
			"not_use_on_mainnet",
		"--taproot-assets.experimental.rfq.mockoracleassetsperbtc=" +
			"8820600",
		"--taproot-assets.experimental.rfq.acceptpricedeviationppm=50000",
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

	// We use Charlie as the proof courier. But in order for Charlie to also
	// use itself, we need to define its port upfront.
	charliePort := port.NextAvailablePort()
	litdArgs = append(litdArgs, fmt.Sprintf(
		"--taproot-assets.proofcourieraddr=%s://%s",
		proof.UniverseRpcCourierType,
		fmt.Sprintf(node.ListenerFormat, charliePort),
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
	charlie, err := net.NewNodeWithPort(
		t.t, "Charlie", lndArgs, false, true, charliePort, litdArgs...,
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

	universeTap := newTapClient(t.t, charlie)
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
		t.t, dave, invoiceResp3, assetID, nil, largeInvoiceAmount,
	)
	assertPaymentHtlcAssets(
		t.t, charlie, invoiceResp3.RHash, assetID, nil,
		largeInvoiceAmount,
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
		t, net, charlie, dave, chanPointCD, [][]byte{assetID}, nil,
		universeTap, initiatorZeroAssetBalanceCoOpBalanceCheck,
	)
}

// testCustomChannels tests that we can create a network with custom channels
// and send asset payments over them.
func testCustomChannels(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplate)

	// We use Charlie as the proof courier. But in order for Charlie to also
	// use itself, we need to define its port upfront.
	charliePort := port.NextAvailablePort()
	litdArgs = append(litdArgs, fmt.Sprintf(
		"--taproot-assets.proofcourieraddr=%s://%s",
		proof.UniverseRpcCourierType,
		fmt.Sprintf(node.ListenerFormat, charliePort),
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
	charlie, err := net.NewNodeWithPort(
		t.t, "Charlie", lndArgs, false, true, charliePort, litdArgs...,
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
	yara, err := net.NewNode(t.t, "Yara", lndArgs, false, true, litdArgs...)
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

	universeTap := newTapClient(t.t, charlie)
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
	// Test case 1: Send a direct keysend payment from Charlie to Dave,
	// sending the whole balance.
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
		t.t, charlie, invoiceResp, assetID, nil, charlieInvoiceAmount,
	)
	assertPaymentHtlcAssets(
		t.t, dave, invoiceResp.RHash, assetID, nil,
		charlieInvoiceAmount,
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

	// Let's keysend the rest of the balance back to Charlie.
	sendAssetKeySendPayment(
		t.t, dave, charlie, charlieFundingAmount-charlieInvoiceAmount,
		assetID, fn.None[int64](),
	)
	logBalance(t.t, nodes, assetID, "after keysend back")

	charlieAssetBalance += charlieFundingAmount - charlieInvoiceAmount
	daveAssetBalance -= charlieFundingAmount - charlieInvoiceAmount

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
	// Test case 3.5: Pay an asset invoice from Dave by Charlie with normal
	// satoshi payment flow. We expect that payment to fail, since it's a
	// direct channel payment and the invoice is for assets, not sats. So
	// without a conversion, it is rejected by the receiver.
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

	// First send some sats from Erin to Fabia, for Fabia to have some
	// minimal sats liquidity on her end.
	sendKeySendPayment(t.t, erin, fabia, 5000)

	logBalance(t.t, nodes, assetID, "after erin->fabia sats keysend")

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
	// Test case 8: Now we'll close each of the channels, starting with the
	// Charlie -> Dave custom channel.
	// ------------
	t.Logf("Closing Charlie -> Dave channel")
	closeAssetChannelAndAssert(
		t, net, charlie, dave, chanPointCD, [][]byte{assetID}, nil,
		universeTap, assertDefaultCoOpCloseBalance(true, true),
	)

	t.Logf("Closing Dave -> Yara channel, close initiated by Yara")
	closeAssetChannelAndAssert(
		t, net, yara, dave, chanPointDY, [][]byte{assetID}, nil,
		universeTap, assertDefaultCoOpCloseBalance(false, true),
	)

	t.Logf("Closing Erin -> Fabia channel")
	closeAssetChannelAndAssert(
		t, net, erin, fabia, chanPointEF, [][]byte{assetID}, nil,
		universeTap, assertDefaultCoOpCloseBalance(true, true),
	)

	// We've been tracking the off-chain channel balances all this time, so
	// now that we have the assets on-chain again, we can assert them. Due
	// to rounding errors that happened when sending multiple shards with
	// MPP, we need to do some slight adjustments.
	charlieAssetBalance += 1
	erinAssetBalance += 3
	fabiaAssetBalance -= 3
	yaraAssetBalance -= 1
	assertBalance(
		t.t, charlieTap, charlieAssetBalance,
		itest.WithAssetID(assetID),
	)
	assertBalance(
		t.t, daveTap, daveAssetBalance, itest.WithAssetID(assetID),
	)
	assertBalance(
		t.t, erinTap, erinAssetBalance, itest.WithAssetID(assetID),
	)
	assertBalance(
		t.t, fabiaTap, fabiaAssetBalance, itest.WithAssetID(assetID),
	)
	assertBalance(
		t.t, yaraTap, yaraAssetBalance, itest.WithAssetID(assetID),
	)

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
	assertAssetChan(
		t.t, charlie, dave, fundingAmount, []*taprpc.Asset{cents},
	)

	// And let's just close the channel again.
	chanPointCD = &lnrpc.ChannelPoint{
		OutputIndex: uint32(fundRespCD.OutputIndex),
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: fundRespCD.Txid,
		},
	}

	t.Logf("Closing Charlie -> Dave channel")
	closeAssetChannelAndAssert(
		t, net, charlie, dave, chanPointCD, [][]byte{assetID}, nil,
		universeTap, assertDefaultCoOpCloseBalance(false, false),
	)

	// Charlie should still have four asset pieces, two with the same size.
	assertBalance(
		t.t, charlieTap, charlieAssetBalance,
		itest.WithAssetID(assetID), itest.WithNumUtxos(2),
		itest.WithScriptKeyType(asset.ScriptKeyBip86),
	)

	// Dave should have two outputs, one from the initial channel with Yara
	// and one from the remaining amount of the channel with Charlie.
	assertBalance(
		t.t, daveTap, daveAssetBalance, itest.WithAssetID(assetID),
		itest.WithNumUtxos(2),
		itest.WithScriptKeyType(asset.ScriptKeyBip86),
	)

	// Fabia and Yara should all have a single output each, just what was
	// left over from the initial channel.
	assertBalance(
		t.t, fabiaTap, fabiaAssetBalance, itest.WithAssetID(assetID),
		itest.WithNumUtxos(1),
		itest.WithScriptKeyType(asset.ScriptKeyBip86),
	)
	assertBalance(
		t.t, yaraTap, yaraAssetBalance, itest.WithAssetID(assetID),
		itest.WithNumUtxos(1),
		itest.WithScriptKeyType(asset.ScriptKeyBip86),
	)

	// Erin didn't use all of his assets when opening the channel, so he
	// should have two outputs, the change from the channel opening and the
	// remaining amount after closing the channel.
	assertBalance(
		t.t, erinTap, erinAssetBalance, itest.WithAssetID(assetID),
		itest.WithNumUtxos(2),
		itest.WithScriptKeyType(asset.ScriptKeyBip86),
	)

	// The asset balances should still remain unchanged.
	assertBalance(
		t.t, charlieTap, charlieAssetBalance,
		itest.WithAssetID(assetID),
	)
	assertBalance(
		t.t, daveTap, daveAssetBalance, itest.WithAssetID(assetID),
	)
	assertBalance(
		t.t, erinTap, erinAssetBalance, itest.WithAssetID(assetID),
	)
	assertBalance(
		t.t, fabiaTap, fabiaAssetBalance, itest.WithAssetID(assetID),
	)
}

// testCustomChannelsGroupedAsset tests that we can create a network with custom
// channels that use grouped assets and send asset payments over them.
func testCustomChannelsGroupedAsset(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplate)

	// We use Charlie as the proof courier. But in order for Charlie to also
	// use itself, we need to define its port upfront.
	charliePort := port.NextAvailablePort()
	litdArgs = append(litdArgs, fmt.Sprintf(
		"--taproot-assets.proofcourieraddr=%s://%s",
		proof.UniverseRpcCourierType,
		fmt.Sprintf(node.ListenerFormat, charliePort),
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
	charlie, err := net.NewNodeWithPort(
		t.t, "Charlie", lndArgs, false, true, charliePort, litdArgs...,
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

	universeTap := newTapClient(t.t, charlie)
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
	groupKey, err := btcec.ParsePubKey(groupID)
	require.NoError(t.t, err)
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
		t.t, charlie, dave, keySendAmount, nil, fn.None[int64](),
		withGroupKey(groupID),
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
		t.t, charlie, dave, dave, 20_000, nil, withSmallShards(),
		withFailure(lnrpc.Payment_FAILED, failureIncorrectDetails),
		withGroupKey(groupID),
	)
	logBalance(t.t, nodes, assetID, "after failed invoice")

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
		t.t, charlie, dave, daveInvoiceAssetAmount, nil,
		withInvGroupKey(groupID),
	)
	payInvoiceWithAssets(
		t.t, charlie, dave, invoiceResp.PaymentRequest, nil,
		withSmallShards(), withGroupKey(groupID),
	)
	logBalance(t.t, nodes, assetID, "after invoice")

	groupBytes := schnorr.SerializePubKey(groupKey)

	// Make sure the invoice on the receiver side and the payment on the
	// sender side show the individual HTLCs that arrived for it and that
	// they show the correct asset amounts when decoded.
	assertInvoiceHtlcAssets(
		t.t, dave, invoiceResp, nil, groupBytes, daveInvoiceAssetAmount,
	)
	assertPaymentHtlcAssets(
		t.t, charlie, invoiceResp.RHash, nil, groupBytes,
		daveInvoiceAssetAmount,
	)

	charlieAssetBalance -= daveInvoiceAssetAmount
	daveAssetBalance += daveInvoiceAssetAmount

	// ------------
	// Test case 4: Pay a normal invoice from Erin by Charlie.
	// ------------
	paidAssetAmount := createAndPayNormalInvoice(
		t.t, charlie, dave, erin, 20_000, nil, withSmallShards(),
		withGroupKey(groupID),
	)
	logBalance(t.t, nodes, assetID, "after invoice")

	charlieAssetBalance -= paidAssetAmount
	daveAssetBalance += paidAssetAmount

	// ------------
	// Test case 5: Create an asset invoice on Fabia and pay it from
	// Charlie.
	// ------------

	// First send some sats from Erin to Fabia, for Fabia to have some
	// minimal sats liquidity on her end.
	sendKeySendPayment(t.t, erin, fabia, 5000)

	logBalance(t.t, nodes, assetID, "after erin->fabia sats keysend")

	const fabiaInvoiceAssetAmount1 = 1000
	invoiceResp = createAssetInvoice(
		t.t, erin, fabia, fabiaInvoiceAssetAmount1, nil,
		withInvGroupKey(groupID),
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
		t.t, charlie, dave, invoiceResp.PaymentRequest, nil,
		withSmallShards(), withGroupKey(groupID),
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
		t.t, dave, yara, yaraInvoiceAssetAmount1, nil,
		withInvGroupKey(groupID),
	)
	payInvoiceWithAssets(
		t.t, charlie, dave, invoiceResp.PaymentRequest, assetID,
		withSmallShards(),
	)
	logBalance(t.t, nodes, assetID, "after asset-to-asset")

	charlieAssetBalance -= yaraInvoiceAssetAmount1
	yaraAssetBalance += yaraInvoiceAssetAmount1

	// ------------
	// Test case 8: Now we'll close each of the channels, starting with the
	// Charlie -> Dave custom channel.
	// ------------
	t.Logf("Closing Charlie -> Dave channel")
	closeAssetChannelAndAssert(
		t, net, charlie, dave, chanPointCD, [][]byte{assetID}, groupID,
		universeTap, assertDefaultCoOpCloseBalance(true, true),
	)

	t.Logf("Closing Dave -> Yara channel, close initiated by Yara")
	closeAssetChannelAndAssert(
		t, net, yara, dave, chanPointDY, [][]byte{assetID}, groupID,
		universeTap, assertDefaultCoOpCloseBalance(false, true),
	)

	t.Logf("Closing Erin -> Fabia channel")
	closeAssetChannelAndAssert(
		t, net, erin, fabia, chanPointEF, [][]byte{assetID}, groupID,
		universeTap, assertDefaultCoOpCloseBalance(true, true),
	)

	// We've been tracking the off-chain channel balances all this time, so
	// now that we have the assets on-chain again, we can assert them. Due
	// to rounding errors that happened when sending multiple shards with
	// MPP, we need to do some slight adjustments.
	charlieAssetBalance += 2
	daveAssetBalance -= 1
	erinAssetBalance += 3
	fabiaAssetBalance -= 3
	yaraAssetBalance -= 1
	itest.AssertBalances(
		t.t, charlieTap, charlieAssetBalance,
		itest.WithAssetID(assetID),
	)
	itest.AssertBalances(
		t.t, daveTap, daveAssetBalance, itest.WithAssetID(assetID),
	)
	itest.AssertBalances(
		t.t, erinTap, erinAssetBalance, itest.WithAssetID(assetID),
	)
	itest.AssertBalances(
		t.t, fabiaTap, fabiaAssetBalance, itest.WithAssetID(assetID),
	)
	itest.AssertBalances(
		t.t, yaraTap, yaraAssetBalance, itest.WithAssetID(assetID),
	)

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
	assertAssetChan(
		t.t, charlie, dave, fundingAmount, []*taprpc.Asset{cents},
	)

	// And let's just close the channel again.
	chanPointCD = &lnrpc.ChannelPoint{
		OutputIndex: uint32(fundRespCD.OutputIndex),
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: fundRespCD.Txid,
		},
	}

	t.Logf("Closing Charlie -> Dave channel")
	closeAssetChannelAndAssert(
		t, net, charlie, dave, chanPointCD, [][]byte{assetID}, groupID,
		universeTap, assertDefaultCoOpCloseBalance(false, false),
	)

	// Charlie should have asset outputs: the leftover change from the
	// channel funding, and the new close output.
	itest.AssertBalances(
		t.t, charlieTap, charlieAssetBalance,
		itest.WithAssetID(assetID), itest.WithNumUtxos(2),
	)

	// The asset balances should still remain unchanged.
	itest.AssertBalances(
		t.t, charlieTap, charlieAssetBalance,
		itest.WithAssetID(assetID),
	)
	itest.AssertBalances(
		t.t, daveTap, daveAssetBalance, itest.WithAssetID(assetID),
	)
	itest.AssertBalances(
		t.t, erinTap, erinAssetBalance, itest.WithAssetID(assetID),
	)
	itest.AssertBalances(
		t.t, fabiaTap, fabiaAssetBalance, itest.WithAssetID(assetID),
	)
}

// testCustomChannelsGroupTranchesForceClose tests that we can successfully open
// a custom channel with multiple pieces of a grouped asset. We then test that
// we can successfully co-op and force close such channels and sweep the
// remaining channel balances.
func testCustomChannelsGroupTranchesForceClose(ctx context.Context,
	net *NetworkHarness, t *harnessTest) {

	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplate)

	// We use Charlie as the proof courier. But in order for Charlie to also
	// use itself, we need to define its port upfront.
	charliePort := port.NextAvailablePort()
	litdArgs = append(litdArgs, fmt.Sprintf(
		"--taproot-assets.proofcourieraddr=%s://%s",
		proof.UniverseRpcCourierType,
		fmt.Sprintf(node.ListenerFormat, charliePort),
	))

	// The topology we are going for looks like the following:
	//
	// Charlie  --[assets]-->  Dave  --[sats]-->  Erin  --[assets]-->  Fabia
	//
	// With [assets] being a custom channel and [sats] being a normal, BTC
	// only channel.
	charlie, err := net.NewNodeWithPort(
		t.t, "Charlie", lndArgs, false, true, charliePort, litdArgs...,
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

	nodes := []*HarnessNode{charlie, dave, erin, fabia}
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

	universeTap := newTapClient(t.t, charlie)
	charlieTap := newTapClient(t.t, charlie)
	daveTap := newTapClient(t.t, dave)
	erinTap := newTapClient(t.t, erin)
	fabiaTap := newTapClient(t.t, fabia)

	groupAssetReq := itest.CopyRequest(&mintrpc.MintAssetRequest{
		Asset: itestAsset,
	})
	groupAssetReq.Asset.NewGroupedAsset = true

	// Mint the asset tranches 1 and 2 on Charlie and sync all nodes to
	// Charlie as the universe.
	mintedAssetsT1 := itest.MintAssetsConfirmBatch(
		t.t, t.lndHarness.Miner.Client, charlieTap,
		[]*mintrpc.MintAssetRequest{groupAssetReq},
	)
	centsT1 := mintedAssetsT1[0]
	assetID1 := centsT1.AssetGenesis.AssetId
	groupKey := centsT1.GetAssetGroup().GetTweakedGroupKey()

	groupAssetReq = itest.CopyRequest(&mintrpc.MintAssetRequest{
		Asset: itestAsset,
	})
	groupAssetReq.Asset.GroupedAsset = true
	groupAssetReq.Asset.GroupKey = groupKey
	groupAssetReq.Asset.Name = "itest-asset-cents-tranche-2"

	mintedAssetsT2 := itest.MintAssetsConfirmBatch(
		t.t, t.lndHarness.Miner.Client, charlieTap,
		[]*mintrpc.MintAssetRequest{groupAssetReq},
	)
	centsT2 := mintedAssetsT2[0]
	assetID2 := centsT2.AssetGenesis.AssetId

	t.Logf("Minted lightning cents tranche 1 (%x) and 2 (%x) for group "+
		"key %x, syncing universes...", assetID1, assetID2, groupKey)
	syncUniverses(t.t, charlieTap, dave, erin, fabia)
	t.Logf("Universes synced between all nodes, distributing assets...")

	chanPointCD, chanPointEF := createTestAssetNetworkGroupKey(
		ctx, t, net, charlieTap, daveTap, erinTap, fabiaTap,
		universeTap, []*taprpc.Asset{centsT1, centsT2},
		fundingAmount, fundingAmount, DefaultPushSat,
	)

	t.Logf("Created channels %v and %v", chanPointCD, chanPointEF)

	// We now send some assets over the channels to test the functionality.
	// Print initial channel balances.
	groupIDs := [][]byte{assetID1, assetID2}
	logBalanceGroup(t.t, nodes, groupIDs, "initial")

	// ------------
	// Test case 1: Send a few direct keysend payments from Charlie to Dave.
	// We want to send at least 30k assets, so we use up one channel
	// internal tranche of assets and should at least once have an HTLC
	// that transports assets from two tranches.
	// ------------
	const (
		keySendAmount    = 5000
		keySendSatAmount = 5000
		numSends         = 6
		totalFirstSend   = keySendAmount * numSends
	)
	for i := 0; i < numSends; i++ {
		sendAssetKeySendPayment(
			t.t, charlie, dave, keySendAmount, nil,
			fn.None[int64](), withGroupKey(groupKey),
		)
	}

	// With noop HTLCs implemented the sats balance of Dave will only
	// increase up to the reserve amount. Let's make a direct non-asset
	// keysend to make sure the sats balance is also enough.
	sendKeySendPayment(t.t, charlie, dave, keySendSatAmount)

	logBalanceGroup(t.t, nodes, groupIDs, "after keysend Charlie->Dave")

	// ------------
	// Test case 2: Send a few direct keysend payments from Erin to Fabia.
	// ------------
	for i := 0; i < numSends; i++ {
		sendAssetKeySendPayment(
			t.t, erin, fabia, keySendAmount, nil,
			fn.None[int64](), withGroupKey(groupKey),
		)
	}
	logBalanceGroup(t.t, nodes, groupIDs, "after keysend Erin->Fabia")

	// We also assert that in a grouped channel with multiple grouped asset
	// UTXOs we get a proper error if we try to do payments or create
	// invoices while using a single asset ID.
	sendAssetKeySendPayment(
		t.t, erin, fabia, keySendAmount, assetID1, fn.None[int64](),
		withPayErrSubStr(
			"make sure to use group key for grouped asset channels",
		),
	)
	createAssetInvoice(
		t.t, charlie, dave, 100, assetID1, withInvoiceErrSubStr(
			"make sure to use group key for grouped asset channels",
		),
	)
	invoiceResp := createAssetInvoice(
		t.t, charlie, dave, keySendAmount, nil,
		withInvGroupKey(groupKey),
	)
	payInvoiceWithAssets(
		t.t, charlie, dave, invoiceResp.PaymentRequest, assetID1,
		withPayErrSubStr(
			"make sure to use group key for grouped asset channels",
		),
	)

	// ------------
	// Test case 3: Co-op close the channel between Charlie and Dave.
	// ------------
	t.Logf("Closing Charlie -> Dave channel")
	closeAssetChannelAndAssert(
		t, net, charlie, dave, chanPointCD,
		[][]byte{assetID1, assetID2}, groupKey, universeTap,
		assertDefaultCoOpCloseBalance(true, true),
	)

	assertSpendableBalance(
		t.t, charlieTap, nil, groupKey, fundingAmount-totalFirstSend+2,
	)
	assertSpendableBalance(t.t, daveTap, nil, groupKey, totalFirstSend)

	// ------------
	// Test case 4: Force close the channel between Erin and Fabia.
	// ------------
	_, closeTxid, err := net.CloseChannel(erin, chanPointEF, true)
	require.NoError(t.t, err)

	t.Logf("Channel force closed! Mining blocks, close_txid=%v", closeTxid)

	// Next, we'll mine a block to confirm the force close.
	mineBlocks(t, net, 1, 1)

	// At this point, we should have the force close transaction in the set
	// of transfers for both nodes.
	forceCloseTransfer := findForceCloseTransfer(
		t.t, erinTap, fabiaTap, closeTxid,
	)
	t.Logf("Force close transfer: %v", toProtoJSON(t.t, forceCloseTransfer))

	// Now that we have the transfer on disk, we'll also assert that the
	// universe also has proof for both the relevant transfer outputs.
	for _, transfer := range forceCloseTransfer.Transfers {
		for _, transferOut := range transfer.Outputs {
			assertUniverseProofExists(
				t.t, universeTap, transferOut.AssetId, groupKey,
				transferOut.ScriptKey,
				transferOut.Anchor.Outpoint,
			)
		}
	}

	t.Logf("Universe proofs located!")

	// We should also have a new sweep transaction in the mempool.
	fabiaSweepTxid, err := waitForNTxsInMempool(
		net.Miner.Client, 1, shortTimeout,
	)
	require.NoError(t.t, err)

	t.Logf("Fabia sweep txid: %v", fabiaSweepTxid)

	mineBlocks(t, net, 1, 1)

	// Fabia should have her sweep output confirmed now, and the assets
	// should be back in her on-chain wallet and spendable.
	assertSpendableBalance(t.t, fabiaTap, nil, groupKey, totalFirstSend)

	// Next, we'll mine three additional blocks to trigger the CSV delay
	// for Erin.
	mineBlocks(t, net, 4, 0)

	// We expect that Erin's sweep transaction has been broadcast.
	erinSweepTxid, err := waitForNTxsInMempool(
		net.Miner.Client, 1, shortTimeout,
	)
	require.NoError(t.t, err)

	t.Logf("Erin sweep txid: %v", erinSweepTxid)

	// Now we'll mine a block to confirm Erin's sweep transaction.
	mineBlocks(t, net, 1, 1)

	// Charlie should now have an asset transfer for his sweep transaction.
	erinSweepTransfer := locateAssetTransfers(
		t.t, erinTap, *erinSweepTxid[0],
	)

	t.Logf("Erin sweep transfer: %v", toProtoJSON(t.t, erinSweepTransfer))

	assertSpendableBalance(
		t.t, erinTap, nil, groupKey, fundingAmount-totalFirstSend,
	)
}

// testCustomChannelsGroupTranchesHtlcForceClose tests that we can successfully
// open a custom channel with multiple pieces of a grouped asset, then force
// close it while having pending HTLCs. We then test that we can successfully
// sweep all balances from those HTLCs.
func testCustomChannelsGroupTranchesHtlcForceClose(ctx context.Context,
	net *NetworkHarness, t *harnessTest) {

	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplate)

	// We use Charlie as the proof courier. But in order for Charlie to also
	// use itself, we need to define its port upfront.
	charliePort := port.NextAvailablePort()
	litdArgs = append(litdArgs, fmt.Sprintf(
		"--taproot-assets.proofcourieraddr=%s://%s",
		proof.UniverseRpcCourierType,
		fmt.Sprintf(node.ListenerFormat, charliePort),
	))

	// The topology we are going for looks like the following:
	//
	// Charlie  --[assets]-->  Dave  --[sats]-->  Erin  --[assets]-->  Fabia
	//
	// With [assets] being a custom channel and [sats] being a normal, BTC
	// only channel.
	charlie, err := net.NewNodeWithPort(
		t.t, "Charlie", lndArgs, false, true, charliePort, litdArgs...,
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

	nodes := []*HarnessNode{charlie, dave, erin, fabia}
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

	universeTap := newTapClient(t.t, charlie)
	charlieTap := newTapClient(t.t, charlie)
	daveTap := newTapClient(t.t, dave)
	erinTap := newTapClient(t.t, erin)
	fabiaTap := newTapClient(t.t, fabia)

	groupAssetReq := itest.CopyRequest(&mintrpc.MintAssetRequest{
		Asset: itestAsset,
	})
	groupAssetReq.Asset.NewGroupedAsset = true

	// Mint the asset tranches 1 and 2 on Charlie and sync all nodes to
	// Charlie as the universe.
	mintedAssetsT1 := itest.MintAssetsConfirmBatch(
		t.t, t.lndHarness.Miner.Client, charlieTap,
		[]*mintrpc.MintAssetRequest{groupAssetReq},
	)
	centsT1 := mintedAssetsT1[0]
	assetID1 := centsT1.AssetGenesis.AssetId
	groupKey := centsT1.GetAssetGroup().GetTweakedGroupKey()

	groupAssetReq = itest.CopyRequest(&mintrpc.MintAssetRequest{
		Asset: itestAsset,
	})
	groupAssetReq.Asset.GroupedAsset = true
	groupAssetReq.Asset.GroupKey = groupKey
	groupAssetReq.Asset.Name = "itest-asset-cents-tranche-2"

	mintedAssetsT2 := itest.MintAssetsConfirmBatch(
		t.t, t.lndHarness.Miner.Client, charlieTap,
		[]*mintrpc.MintAssetRequest{groupAssetReq},
	)
	centsT2 := mintedAssetsT2[0]
	assetID2 := centsT2.AssetGenesis.AssetId

	t.Logf("Minted lightning cents tranche 1 (%x) and 2 (%x) for group "+
		"key %x, syncing universes...", assetID1, assetID2, groupKey)
	syncUniverses(t.t, charlieTap, dave, erin, fabia)
	t.Logf("Universes synced between all nodes, distributing assets...")

	chanPointCD, chanPointEF := createTestAssetNetworkGroupKey(
		ctx, t, net, charlieTap, daveTap, erinTap, fabiaTap,
		universeTap, []*taprpc.Asset{centsT1, centsT2},
		fundingAmount, fundingAmount, DefaultPushSat,
	)

	t.Logf("Created channels %v and %v", chanPointCD, chanPointEF)

	// We now send some assets over the channels to test the functionality.
	// Print initial channel balances.
	groupIDs := [][]byte{assetID1, assetID2}
	logBalanceGroup(t.t, nodes, groupIDs, "initial")

	// First, we'll send over some funds from Charlie to Dave, as we want
	// Dave to be able to extend HTLCs in the other direction.
	const (
		numPayments      = 10
		keySendAmount    = 2_500
		keySendSatAmount = 5_000
	)
	for i := 0; i < numPayments; i++ {
		sendAssetKeySendPayment(
			t.t, charlie, dave, keySendAmount, nil,
			fn.None[int64](), withGroupKey(groupKey),
		)
	}

	// With noop HTLCs implemented the sats balance of Dave will only
	// increase up to the reserve amount. Let's make a direct non-asset
	// keysend to make sure the sats balance is also enough.
	sendKeySendPayment(t.t, charlie, dave, keySendSatAmount)

	// Now that both parties have some funds, we'll move onto the main test.
	//
	// We'll make 2 hodl invoice for each peer, so 4 total. From Charlie's
	// PoV, he'll have 6 outgoing HTLCs, and two incoming HTLCs.
	var (
		daveHodlInvoices    []assetHodlInvoice
		charlieHodlInvoices []assetHodlInvoice

		// The default oracle rate is 17_180 mSat/asset unit, so 10_000
		// will be equal to 171_800_000 mSat. When we use the mpp bool
		// for the smallShards param of payInvoiceWithAssets, that
		// means we'll split the payment into shards of 80_000_000 mSat
		// max. So we'll get three shards per payment.
		assetInvoiceAmt   = 10_000
		assetsPerMPPShard = 4656
	)
	for i := 0; i < 2; i++ {
		daveHodlInvoices = append(
			daveHodlInvoices, createAssetHodlInvoice(
				t.t, charlie, dave, uint64(assetInvoiceAmt),
				nil, withInvGroupKey(groupKey),
			),
		)
		charlieHodlInvoices = append(
			charlieHodlInvoices, createAssetHodlInvoice(
				t.t, dave, charlie, uint64(assetInvoiceAmt),
				nil, withInvGroupKey(groupKey),
			),
		)
	}

	// Now we'll have both Dave and Charlie pay each other's invoices. We
	// only care that they're in flight at this point, as they won't be
	// settled yet.
	baseOpts := []payOpt{
		withGroupKey(groupKey),
		withFailure(
			lnrpc.Payment_IN_FLIGHT,
			lnrpc.PaymentFailureReason_FAILURE_REASON_NONE,
		),
	}
	for _, charlieInvoice := range charlieHodlInvoices {
		// For this direction, we also want to enforce MPP.
		opts := append(slices.Clone(baseOpts), withSmallShards())
		payInvoiceWithAssets(
			t.t, dave, charlie, charlieInvoice.payReq, nil, opts...,
		)
	}
	for _, daveInvoice := range daveHodlInvoices {
		payInvoiceWithAssets(
			t.t, charlie, dave, daveInvoice.payReq, nil,
			baseOpts...,
		)
	}

	// Make sure we can sweep all the HTLCs.
	const charlieStartAmount = 2
	charlieExpectedBalance, _ := assertForceCloseSweeps(
		ctx, net, t, charlie, dave, chanPointCD, charlieStartAmount,
		assetInvoiceAmt, assetsPerMPPShard, nil, groupKey,
		charlieHodlInvoices, daveHodlInvoices, true,
	)

	// Finally, we'll assert that Charlie's balance has been incremented by
	// the timeout value.
	charlieExpectedBalance += uint64(assetInvoiceAmt - 1)
	t.Logf("Expecting Charlie's balance to be %d", charlieExpectedBalance)
	assertSpendableBalance(
		t.t, charlieTap, nil, groupKey, charlieExpectedBalance,
	)

	t.Logf("Sending all settled funds to Fabia")

	// As a final sanity check, both Charlie and Dave should be able to send
	// their entire balances to Fabia, our 3rd party.
	//
	// We'll make two addrs for Fabia, one for Charlie, and one for Dave.
	charlieSpendableBalanceAsset1, err := spendableBalance(
		charlieTap, assetID1, nil,
	)
	require.NoError(t.t, err)
	charlieSpendableBalanceAsset2, err := spendableBalance(
		charlieTap, assetID2, nil,
	)
	require.NoError(t.t, err)

	t.Logf("Charlie's spendable balance asset 1: %d, asset 2: %d",
		charlieSpendableBalanceAsset1, charlieSpendableBalanceAsset2)

	fabiaCourierAddr := fmt.Sprintf(
		"%s://%s", proof.UniverseRpcCourierType,
		fabiaTap.node.Cfg.LitAddr(),
	)
	charlieAddr1, err := fabiaTap.NewAddr(ctx, &taprpc.NewAddrRequest{
		Amt:              charlieSpendableBalanceAsset1,
		AssetId:          assetID1,
		ProofCourierAddr: fabiaCourierAddr,
	})
	require.NoError(t.t, err)
	charlieAddr2, err := fabiaTap.NewAddr(ctx, &taprpc.NewAddrRequest{
		Amt:              charlieSpendableBalanceAsset2,
		AssetId:          assetID2,
		ProofCourierAddr: fabiaCourierAddr,
	})
	require.NoError(t.t, err)

	daveSpendableBalanceAsset1, err := spendableBalance(
		daveTap, assetID1, nil,
	)
	require.NoError(t.t, err)
	daveSpendableBalanceAsset2, err := spendableBalance(
		daveTap, assetID2, nil,
	)
	require.NoError(t.t, err)

	t.Logf("Daves's spendable balance asset 1: %d, asset 2: %d",
		daveSpendableBalanceAsset1, daveSpendableBalanceAsset2)

	daveAddr1, err := fabiaTap.NewAddr(ctx, &taprpc.NewAddrRequest{
		Amt:              daveSpendableBalanceAsset1,
		AssetId:          assetID1,
		ProofCourierAddr: fabiaCourierAddr,
	})
	require.NoError(t.t, err)
	daveAddr2, err := fabiaTap.NewAddr(ctx, &taprpc.NewAddrRequest{
		Amt:              daveSpendableBalanceAsset2,
		AssetId:          assetID2,
		ProofCourierAddr: fabiaCourierAddr,
	})
	require.NoError(t.t, err)

	_, err = charlieTap.SendAsset(ctx, &taprpc.SendAssetRequest{
		TapAddrs: []string{charlieAddr1.Encoded},
	})
	require.NoError(t.t, err)
	mineBlocks(t, net, 1, 1)

	itest.AssertNonInteractiveRecvComplete(t.t, fabiaTap, 1)

	ctxb := context.Background()
	charlieAssets, err := charlieTap.ListAssets(
		ctxb, &taprpc.ListAssetRequest{
			IncludeSpent: true,
		},
	)
	require.NoError(t.t, err)
	charlieTransfers, err := charlieTap.ListTransfers(
		ctxb, &taprpc.ListTransfersRequest{},
	)
	require.NoError(t.t, err)

	t.Logf("Charlie's assets: %v", toProtoJSON(t.t, charlieAssets))
	t.Logf("Charlie's transfers: %v", toProtoJSON(t.t, charlieTransfers))

	_, err = charlieTap.SendAsset(ctx, &taprpc.SendAssetRequest{
		TapAddrs: []string{charlieAddr2.Encoded},
	})
	require.NoError(t.t, err)
	mineBlocks(t, net, 1, 1)

	itest.AssertNonInteractiveRecvComplete(t.t, fabiaTap, 2)

	_, err = daveTap.SendAsset(ctx, &taprpc.SendAssetRequest{
		TapAddrs: []string{daveAddr1.Encoded},
	})
	require.NoError(t.t, err)
	mineBlocks(t, net, 1, 1)

	itest.AssertNonInteractiveRecvComplete(t.t, fabiaTap, 3)

	_, err = daveTap.SendAsset(ctx, &taprpc.SendAssetRequest{
		TapAddrs: []string{daveAddr2.Encoded},
	})
	require.NoError(t.t, err)
	mineBlocks(t, net, 1, 1)

	itest.AssertNonInteractiveRecvComplete(t.t, fabiaTap, 4)

	// Fabia's balance should now be the sum of Charlie's and Dave's
	// balances.
	fabiaExpectedBalance := uint64(50_002)
	assertSpendableBalance(
		t.t, fabiaTap, nil, groupKey, fabiaExpectedBalance,
	)
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
	itest.AssertBalances(
		t.t, charlieTap, itestAsset.Amount-fundingAmount,
		itest.WithAssetID(assetID),
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
	assertAssetChan(
		t.t, charlie, dave, fundingAmount, []*taprpc.Asset{cents},
	)

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
	forceCloseTransfer := findForceCloseTransfer(
		t.t, charlieTap, daveTap, closeTxid,
	)
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

	// We should also have a new sweep transaction in the mempool.
	daveSweepTxid, err := waitForNTxsInMempool(
		net.Miner.Client, 1, shortTimeout,
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
	mineBlocks(t, net, 4, 0)

	// We expect that Charlie's sweep transaction has been broadcast.
	charlieSweepTxid, err := waitForNTxsInMempool(
		net.Miner.Client, 1, shortTimeout,
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
	itest.AssertBalances(
		t.t, daveTap, daveBalance, itest.WithAssetID(assetID),
		itest.WithNumUtxos(1),
	)
	itest.AssertBalances(
		t.t, charlieTap, charlieBalance, itest.WithAssetID(assetID),
		itest.WithNumUtxos(2),
	)

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

	// We use Charlie as the proof courier. But in order for Charlie to also
	// use itself, we need to define its port upfront.
	charliePort := port.NextAvailablePort()
	litdArgs = append(litdArgs, fmt.Sprintf(
		"--taproot-assets.proofcourieraddr=%s://%s",
		proof.UniverseRpcCourierType,
		fmt.Sprintf(node.ListenerFormat, charliePort),
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
	charlie, err := net.NewNodeWithPort(
		t.t, "Charlie", charlieFlags, false, true, charliePort,
		litdArgs...,
	)
	require.NoError(t.t, err)

	dave, err := net.NewNode(t.t, "Dave", lndArgs, false, true, litdArgs...)
	require.NoError(t.t, err)

	// Next we'll connect all the nodes and also fund them with some coins.
	nodes := []*HarnessNode{charlie, dave}
	connectAllNodes(t.t, net, nodes)
	fundAllNodes(t.t, net, nodes)

	universeTap := newTapClient(t.t, charlie)
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
	itest.AssertBalances(
		t.t, charlieTap, itestAsset.Amount-fundingAmount,
		itest.WithAssetID(assetID), itest.WithNumUtxos(1),
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
	assertAssetChan(
		t.t, charlie, dave, fundingAmount, []*taprpc.Asset{cents},
	)

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
	itest.AssertBalances(
		t.t, charlieTap, charlieBalance, itest.WithAssetID(assetID),
		itest.WithNumUtxos(3),
	)

	t.Logf("Charlie balance after breach: %d", charlieBalance)
}

// testCustomChannelsV1Upgrade tests the upgrade path of a taproot assets
// channel. It upgrades one of the peers to a version that utilizes feature bits
// and new features over the channel, testing that backwards compatibility is
// maintained along the way. We also introduce a channel breach, right at the
// point before we switched over to the new features, to test that sweeping is
// done properly.
func testCustomChannelsV1Upgrade(ctx context.Context, net *NetworkHarness,
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

	davePort := port.NextAvailablePort()
	daveFlags := append(
		slices.Clone(lndArgs), "--nolisten", "--minbackoff=1h",
	)

	// For this simple test, we'll just have Charlie -> Dave as an assets
	// channel.
	dave, err := net.NewNodeWithPort(
		t.t, "Dave", daveFlags, false, true, davePort,
		litdArgs...,
	)
	require.NoError(t.t, err)

	charlie, err := net.NewNode(
		t.t, "Charlie", lndArgs, false, true, litdArgs...,
	)
	require.NoError(t.t, err)

	// Next we'll connect all the nodes and also fund them with some coins.
	nodes := []*HarnessNode{dave, charlie}
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

	t.Logf("Minted %d itest asset cents, syncing universes...",
		cents.Amount)

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

	// With the channel open, mine 6 blocks to confirm it.
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
	itest.AssertBalances(
		t.t, charlieTap, itestAsset.Amount-fundingAmount,
		itest.WithAssetID(assetID), itest.WithNumUtxos(1),
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
	assertAssetChan(
		t.t, charlie, dave, fundingAmount, []*taprpc.Asset{cents},
	)

	// Before we start sending out payments, let's make sure each node can
	// see the other one in the graph and has all required features.
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(charlie, dave))
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(dave, charlie))

	logBalance(t.t, nodes, assetID, "start")

	// Let's dispatch 5 asset & 5 keysend payments from Charlie to Dave. At
	// this point Charlie is running the old version of LiT.
	for range 5 {
		sendAssetKeySendPayment(
			t.t, charlie, dave, 50, assetID, fn.None[int64](),
		)
		sendKeySendPayment(t.t, charlie, dave, 1_000)
	}

	logBalance(t.t, nodes, assetID, "before upgrade")

	// Let's assert that Charlie & Dave actually run different versions of
	// taproot-assets. We expect Dave to be running the latest version,
	// while Charlie is running an older version (v0.15.0).
	daveInfo, err := daveTap.GetInfo(ctx, &taprpc.GetInfoRequest{})
	require.NoError(t.t, err)

	charlieInfo, err := charlieTap.GetInfo(ctx, &taprpc.GetInfoRequest{})
	require.NoError(t.t, err)

	require.NotEqual(t.t, daveInfo.Version, charlieInfo.Version)

	res, err := charlie.ChannelBalance(ctx, &lnrpc.ChannelBalanceRequest{})
	require.NoError(t.t, err)

	charlieSatsBefore := res.LocalBalance

	// Now we'll restart Charlie and assert that he upgraded. We also back
	// up the DB at this point, in order to induce a breach later right at
	// the switching point before upgrading the channel. We will verify that
	// the breach transaction will be swept by the right party.
	require.NoError(t.t, net.StopAndBackupDB(charlie, WithUpgrade()))
	connectAllNodes(t.t, net, nodes)

	charlieInfo, err = charlieTap.GetInfo(ctx, &taprpc.GetInfoRequest{})
	require.NoError(t.t, err)

	// Dave and Charlie should both be running the same version (latest).
	require.Equal(t.t, daveInfo.Version, charlieInfo.Version)

	// Let's send another 5 asset and keysend payments from Charlie to Dave.
	// Charlie is now on the latest version of LiT and the channel upgraded.
	for range 5 {
		sendAssetKeySendPayment(
			t.t, charlie, dave, 50, assetID, fn.None[int64](),
		)
	}

	res, err = charlie.ChannelBalance(ctx, &lnrpc.ChannelBalanceRequest{})
	require.NoError(t.t, err)

	charlieSatsAfter := res.LocalBalance

	// Because of no-op HTLCs, the satoshi balance of Charlie should not
	// have shifted while sending the asset payments.
	require.Equal(t.t, charlieSatsBefore, charlieSatsAfter)

	logBalance(t.t, nodes, assetID, "after upgrade")

	// Now let's restart Charlie and restore the DB to the previous snapshot
	// which corresponds to a previous (invalid) and unupgraded channel
	// state.
	require.NoError(t.t, net.StopAndRestoreDB(charlie))

	// With Charlie restored, we'll now execute the force close.
	t.Logf("Force close by Charlie to breach...")
	charlieChanPoint := &lnrpc.ChannelPoint{
		OutputIndex: uint32(assetFundResp.OutputIndex),
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: assetFundResp.Txid,
		},
	}
	_, breachTxid, err := net.CloseChannel(charlie, charlieChanPoint, true)
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

	require.Len(t.t, charlieBreachTransfer.Outputs, 2)
	assetOutput := charlieBreachTransfer.Outputs[0]
	assertUniverseProofExists(
		t.t, universeTap, assetID, nil, assetOutput.ScriptKey,
		assetOutput.Anchor.Outpoint,
	)

	op, err := wire.NewOutPointFromString(assetOutput.Anchor.Outpoint)
	require.NoError(t.t, err)

	// We'll manually export the proof of the breach transfer, in order to
	// verify that it indeed did not use STXO proofs.
	proofResp, err := daveTap.ExportProof(ctx, &taprpc.ExportProofRequest{
		AssetId:   assetID,
		ScriptKey: assetOutput.ScriptKey,
		Outpoint: &taprpc.OutPoint{
			Txid:        op.Hash[:],
			OutputIndex: op.Index,
		},
	})
	require.NoError(t.t, err)

	proofFile, err := proof.DecodeFile(proofResp.RawProofFile)
	require.NoError(t.t, err)
	require.Equal(t.t, proofFile.NumProofs(), 3)
	latestProof, err := proofFile.LastProof()
	require.NoError(t.t, err)

	// This proof should not contain the STXO exclusion proofs, since the
	// breach occured right before the channel upgraded.
	stxoProofs := latestProof.ExclusionProofs[0].CommitmentProof.STXOProofs
	require.Nil(t.t, stxoProofs)

	// With the breach transaction mined, Dave should now have a transaction
	// in the mempool sweeping *both* commitment outputs.
	daveJusticeTxid, err := waitForNTxsInMempool(
		net.Miner.Client, 1, time.Second*5,
	)
	require.NoError(t.t, err)

	t.Logf("Dave justice txid: %v", daveJusticeTxid)

	// Next, we'll mine a block to confirm Dave's justice transaction.
	mineBlocks(t, net, 1, 1)

	// Dave should now have a transfer for his justice transaction.
	daveJusticeTransfer := locateAssetTransfers(
		t.t, daveTap, *daveJusticeTxid[0],
	)

	t.Logf("Dave justice transfer: %v",
		toProtoJSON(t.t, daveJusticeTransfer))

	// Dave should claim all of the asset balance that was put into the
	// channel.
	daveBalance := uint64(fundingAmount)

	itest.AssertBalances(
		t.t, daveTap, daveBalance, itest.WithAssetID(assetID),
		itest.WithNumUtxos(2),
	)

	t.Logf("Dave balance after breach: %d", daveBalance)

	require.Len(t.t, daveJusticeTransfer.Outputs, 2)
	assetOutput = daveJusticeTransfer.Outputs[0]
	op, err = wire.NewOutPointFromString(assetOutput.Anchor.Outpoint)
	require.NoError(t.t, err)

	// We'll now also export the proof for the justice transaction. Here we
	// expect to find STXO proofs, as the sweeping party is an upgraded node
	// that supports it.
	proofResp, err = daveTap.ExportProof(ctx, &taprpc.ExportProofRequest{
		AssetId:   assetID,
		ScriptKey: assetOutput.ScriptKey,
		Outpoint: &taprpc.OutPoint{
			Txid:        op.Hash[:],
			OutputIndex: op.Index,
		},
	})
	require.NoError(t.t, err)

	proofFile, err = proof.DecodeFile(proofResp.RawProofFile)
	require.NoError(t.t, err)
	require.Equal(t.t, 4, proofFile.NumProofs())
	latestProof, err = proofFile.LastProof()
	require.NoError(t.t, err)

	// This proof should contain the STXO exclusion proofs
	stxoProofs = latestProof.InclusionProof.CommitmentProof.STXOProofs
	require.NotNil(t.t, stxoProofs)
}

// testCustomChannelsLiquidityEdgeCasesCore is the core logic of the liquidity
// edge cases. This test goes through certain scenarios that expose edge cases
// and behaviors that proved to be buggy in the past and have been directly
// addressed. It accepts an extra parameter which dictates whether it should use
// group keys or asset IDs.
func testCustomChannelsLiquidityEdgeCasesCore(ctx context.Context,
	net *NetworkHarness, t *harnessTest, groupMode bool) {

	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplate)

	// We use Charlie as the proof courier. But in order for Charlie to also
	// use itself, we need to define its port upfront.
	charliePort := port.NextAvailablePort()
	litdArgs = append(litdArgs, fmt.Sprintf(
		"--taproot-assets.proofcourieraddr=%s://%s",
		proof.UniverseRpcCourierType,
		fmt.Sprintf(node.ListenerFormat, charliePort),
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
	charlie, err := net.NewNodeWithPort(
		t.t, "Charlie", lndArgs, false, true, charliePort, litdArgs...,
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

	// Create the normal channel between Dave and Erin. We don't clean up
	// this channel because we expect there to be in-flight HTLCs due to
	// some of the edge cases we're testing. Waiting for those HTLCs to time
	// out would take too long.
	t.Logf("Opening normal channel between Dave and Erin...")
	channelOp := openChannelAndAssert(
		t, net, dave, erin, lntest.OpenChannelParams{
			Amt:         10_000_000,
			SatPerVByte: 5,
		},
	)

	// This is the only public channel, we need everyone to be aware of it.
	assertChannelKnown(t.t, charlie, channelOp)
	assertChannelKnown(t.t, fabia, channelOp)

	universeTap := newTapClient(t.t, charlie)
	charlieTap := newTapClient(t.t, charlie)
	daveTap := newTapClient(t.t, dave)
	erinTap := newTapClient(t.t, erin)
	fabiaTap := newTapClient(t.t, fabia)
	yaraTap := newTapClient(t.t, yara)

	assetReq := itest.CopyRequest(&mintrpc.MintAssetRequest{
		Asset: itestAsset,
	})

	// In order to use group keys in this test, the asset must belong to a
	// group.
	if groupMode {
		assetReq.Asset.NewGroupedAsset = true
	}

	// Mint an asset on Charlie and sync all nodes to Charlie as the
	// universe.
	mintedAssets := itest.MintAssetsConfirmBatch(
		t.t, t.lndHarness.Miner.Client, charlieTap,
		[]*mintrpc.MintAssetRequest{assetReq},
	)
	cents := mintedAssets[0]
	assetID := cents.AssetGenesis.AssetId

	// If groupMode is enabled, treat the asset as part of a group by
	// assigning its tweaked group key. Otherwise, treat it as an ungrouped
	// asset using only its asset ID.
	var (
		groupID  []byte
		groupKey *btcec.PublicKey
	)
	if groupMode {
		groupID = cents.GetAssetGroup().GetTweakedGroupKey()

		groupKey, err = btcec.ParsePubKey(groupID)
		require.NoError(t.t, err)
	}

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

	// Edge case: We send a single satoshi keysend payment from Dave to
	// Fabia. Which will make it so that Fabia's balance in the channel
	// between Erin and her is 1 satoshi, which is below the dust limit.
	// This is only allowed while Fabia doesn't have any assets on her side
	// yet.
	erinFabiaChan := fetchChannel(t.t, fabia, chanPointEF)
	hinEF := &lnrpc.HopHint{
		NodeId:                    erin.PubKeyStr,
		ChanId:                    erinFabiaChan.PeerScidAlias,
		CltvExpiryDelta:           80,
		FeeBaseMsat:               1000,
		FeeProportionalMillionths: 1,
	}
	sendKeySendPayment(
		t.t, dave, fabia, 1, withPayRouteHints([]*lnrpc.RouteHint{{
			HopHints: []*lnrpc.HopHint{hinEF},
		}}),
	)
	logBalance(t.t, nodes, assetID, "after single sat keysend")

	// We make sure that a single sat keysend payment is not allowed when
	// it carries assets.
	sendAssetKeySendPayment(
		t.t, erin, fabia, 123, assetID, fn.Some[int64](1),
		withPayErrSubStr(
			fmt.Sprintf("keysend payment satoshi amount must be "+
				"greater than or equal to %d satoshis",
				rfqmath.DefaultOnChainHtlcSat),
		),
	)

	// Normal case.
	// Send 50 assets from Charlie to Dave.
	sendAssetKeySendPayment(
		t.t, charlie, dave, 50, assetID, fn.None[int64](),
		withGroupKey(groupID),
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
			withGroupKey(groupID),
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
		withGroupKey(groupID),
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
		withGroupKey(groupID),
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
		withGroupKey(groupID),
	)

	logBalance(t.t, nodes, assetID, "after big asset payment (btc "+
		"invoice, multi-hop)")

	// Edge case: Big asset invoice paid by direct peer with assets.
	const bigAssetAmount = 100_000

	invoiceResp := createAssetInvoice(
		t.t, charlie, dave, bigAssetAmount, assetID,
		withInvGroupKey(groupID),
	)

	payInvoiceWithAssets(
		t.t, charlie, dave, invoiceResp.PaymentRequest, assetID,
		withGroupKey(groupID),
	)

	logBalance(t.t, nodes, assetID, "after big asset payment (asset "+
		"invoice, direct)")

	var groupBytes []byte
	if groupMode {
		groupBytes = schnorr.SerializePubKey(groupKey)
	}

	// Make sure the invoice on the receiver side and the payment on the
	// sender side show the individual HTLCs that arrived for it and that
	// they show the correct asset amounts when decoded.
	assertInvoiceHtlcAssets(
		t.t, dave, invoiceResp, assetID, groupBytes, bigAssetAmount,
	)
	assertPaymentHtlcAssets(
		t.t, charlie, invoiceResp.RHash, assetID, groupBytes,
		bigAssetAmount,
	)

	// Dave sends 200k assets and 5k sats to Yara.
	sendAssetKeySendPayment(
		t.t, dave, yara, 2*bigAssetAmount, assetID, fn.None[int64](),
		withGroupKey(groupID),
	)
	sendKeySendPayment(t.t, dave, yara, 5_000)

	logBalance(t.t, nodes, assetID, "after 200k assets to Yara")

	// Edge case: Now Charlie creates a big asset invoice to be paid for by
	// Yara with assets. This is a multi-hop payment going over 2 asset
	// channels, where the total asset value exceeds the btc capacity of the
	// channels.
	invoiceResp = createAssetInvoice(
		t.t, dave, charlie, bigAssetAmount, assetID,
		withInvGroupKey(groupID),
	)

	payInvoiceWithAssets(
		t.t, yara, dave, invoiceResp.PaymentRequest, assetID,
		withGroupKey(groupID),
	)

	logBalance(t.t, nodes, assetID, "after big asset payment (asset "+
		"invoice, multi-hop)")

	// Edge case: Now Charlie creates a tiny asset invoice to be paid for by
	// Yara with satoshi. This is a multi-hop payment going over 2 asset
	// channels, where the total asset value is less than the default anchor
	// amount of 354 sats.
	createAssetInvoice(
		t.t, dave, charlie, 1, assetID, withInvoiceErrSubStr(
			"could not create any quotes for the invoice",
		),
		withInvGroupKey(groupID),
	)

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
		withFeeLimit(2_000), withGroupKey(groupID), withPayErrSubStr(
			"failed to acquire any quotes",
		),
	)

	// When we override the uneconomical payment, it should succeed.
	payInvoiceWithAssets(
		t.t, charlie, dave, btcInvoiceResp.PaymentRequest, assetID,
		withFeeLimit(2_000), withAllowOverpay(),
		withGroupKey(groupID),
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
			"failed to acquire any quotes",
		), withGroupKey(groupID),
	)

	// Edge case: Check if the RFQ HTLC tracking accounts for cancelled
	// HTLCs. We achieve this by manually creating & using an RFQ quote with
	// a set max amount. We first pay to a hodl invoice that we eventually
	// cancel, then pay to a normal invoice which should succeed.

	// We start by sloshing some funds in the Erin<->Fabia.
	sendAssetKeySendPayment(
		t.t, erin, fabia, 100_000, assetID, fn.Some[int64](20_000),
		withGroupKey(groupID),
	)

	logBalance(t.t, nodes, assetID, "balance after 1st slosh")

	// If we are running this test in group mode, then the manual rfq
	// negotiation needs to also happen on the group key.
	var assetSpecifier rfqrpc.AssetSpecifier
	if groupMode {
		assetSpecifier = rfqrpc.AssetSpecifier{
			Id: &rfqrpc.AssetSpecifier_GroupKey{
				GroupKey: groupID,
			},
		}
	} else {
		assetSpecifier = rfqrpc.AssetSpecifier{
			Id: &rfqrpc.AssetSpecifier_AssetId{
				AssetId: assetID,
			},
		}
	}

	// We create the RFQ order. We set the max amt to ~180k sats which is
	// going to evaluate to about 10k assets.
	inOneHour := time.Now().Add(time.Hour)
	resQ, err := charlieTap.RfqClient.AddAssetSellOrder(
		ctx, &rfqrpc.AddAssetSellOrderRequest{
			AssetSpecifier: &assetSpecifier,
			PaymentMaxAmt:  180_000_000,
			Expiry:         uint64(inOneHour.Unix()),
			PeerPubKey:     dave.PubKey[:],
			TimeoutSeconds: 100,
		},
	)
	require.NoError(t.t, err)

	// We now create a hodl invoice on Fabia, for 10k assets.
	hodlInv := createAssetHodlInvoice(
		t.t, erin, fabia, 10_000, assetID,
		withInvGroupKey(groupID),
	)

	// Charlie tries to pay via Dave, by providing the RFQ quote ID that was
	// manually created above.
	var quoteID rfqmsg.ID
	copy(quoteID[:], resQ.GetAcceptedQuote().Id)

	payInvoiceWithAssets(
		t.t, charlie, dave, hodlInv.payReq, assetID, withSmallShards(),
		withFailure(lnrpc.Payment_IN_FLIGHT, failureNone),
		withRFQ(quoteID), withGroupKey(groupID),
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

	// Now Fabia creates another invoice. We also use a fixed msat value for
	// the invoice. Since our itest oracle evaluates every asset to about
	// 17.1 sats, this invoice should be a bit below 10k assets, so roughly
	// the same volume as the previous invoice we just cancelled.
	invoiceResp = createAssetInvoice(
		t.t, erin, fabia, 0, assetID, withInvGroupKey(groupID),
		withMsatAmount(170_000_000),
	)

	// Now Charlie pays the invoice, again by using the manually specified
	// RFQ quote ID. This payment should succeed.
	payInvoiceWithAssets(
		t.t, charlie, dave, invoiceResp.PaymentRequest, assetID,
		withSmallShards(), withRFQ(quoteID),
		withGroupKey(groupID),
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
			AssetSpecifier: &assetSpecifier,
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
	hint := &lnrpc.HopHint{
		NodeId:                    dave.PubKeyStr,
		ChanId:                    quote.AcceptedQuote.Scid,
		CltvExpiryDelta:           80,
		FeeBaseMsat:               1000,
		FeeProportionalMillionths: 1,
	}
	var preimage lntypes.Preimage
	_, _ = rand.Read(preimage[:])
	payHash = preimage.Hash()
	iResp, err := charlie.AddHoldInvoice(
		ctx, &invoicesrpc.AddHoldInvoiceRequest{
			Memo:  "",
			Value: 200_000,
			Hash:  payHash[:],
			RouteHints: []*lnrpc.RouteHint{{
				HopHints: []*lnrpc.HopHint{hint},
			}},
		},
	)
	require.NoError(t.t, err)

	htlcStream, err := dave.RouterClient.SubscribeHtlcEvents(
		ctx, &routerrpc.SubscribeHtlcEventsRequest{},
	)
	require.NoError(t.t, err)

	// Now Erin tries to pay the invoice. Since rfq quote cannot satisfy the
	// total amount of the invoice this payment will fail.
	payPayReqWithSatoshi(
		t.t, erin, iResp.PaymentRequest,
		withFailure(lnrpc.Payment_IN_FLIGHT, failureNone),
		withGroupKey(groupID), withMaxShards(4),
	)

	t.Logf("Asserting number of HTLCs on each node...")
	assertMinNumHtlcs(t.t, dave, 2)

	t.Logf("Asserting HTLC events on Dave...")
	assertHtlcEvents(
		t.t, htlcStream, withNumEvents(1), withForwardFailure(),
	)

	_, err = charlie.InvoicesClient.CancelInvoice(
		ctx, &invoicesrpc.CancelInvoiceMsg{
			PaymentHash: payHash[:],
		},
	)
	require.NoError(t.t, err)

	assertNumHtlcs(t.t, dave, 0)

	logBalance(t.t, nodes, assetID, "after small manual rfq")

	_ = htlcStream.CloseSend()
	_, _ = erin.RouterClient.ResetMissionControl(
		context.Background(), &routerrpc.ResetMissionControlRequest{},
	)

	// Edge case: Fabia creates an invoice which Erin cannot satisfy with
	// his side of asset liquidity. This tests that Erin will not try to
	// add an HTLC with more asset units than what his local balance is. To
	// validate that the channel is still healthy, we follow up with a
	// smaller invoice payment which is meant to succeed.

	// We now create a hodl invoice on Fabia, for 125k assets.
	hodlInv = createAssetHodlInvoice(t.t, erin, fabia, 125_000, assetID)

	htlcStream, err = erin.RouterClient.SubscribeHtlcEvents(
		ctx, &routerrpc.SubscribeHtlcEventsRequest{},
	)
	require.NoError(t.t, err)

	// Charlie tries to pay, this is not meant to succeed, as Erin does not
	// have enough assets to forward to Fabia.
	payInvoiceWithAssets(
		t.t, charlie, dave, hodlInv.payReq, assetID,
		withFailure(lnrpc.Payment_IN_FLIGHT, failureNone),
	)

	// Let's check that at least 2 HTLCs were added on the Erin->Fabia link,
	// which means that Erin would have an extra incoming HTLC for each
	// outgoing one. So we expect a minimum of 4 HTLCs present on Erin.
	assertMinNumHtlcs(t.t, erin, 4)

	// We also want to make sure that at least one failure occurred that
	// hinted at the problem (not enough assets to forward).
	assertHtlcEvents(
		t.t, htlcStream, withNumEvents(1),
		withLinkFailure(routerrpc.FailureDetail_INSUFFICIENT_BALANCE),
	)

	logBalance(t.t, nodes, assetID, "with min 4 present HTLCs")

	// Now Fabia cancels the invoice, this is meant to cancel back any
	// locked in HTLCs and reset Erin's local balance back to its original
	// value.
	payHash = hodlInv.preimage.Hash()
	_, err = fabia.InvoicesClient.CancelInvoice(
		ctx, &invoicesrpc.CancelInvoiceMsg{
			PaymentHash: payHash[:],
		},
	)
	require.NoError(t.t, err)

	// Let's assert that Erin cancelled all his HTLCs.
	assertNumHtlcs(t.t, erin, 0)

	logBalance(t.t, nodes, assetID, "after hodl cancel & 0 present HTLCs")

	// Now let's create a smaller invoice and pay it, to validate that the
	// channel is still healthy.
	invoiceResp = createAssetInvoice(t.t, erin, fabia, 50_000, assetID)

	_, _ = charlie.RouterClient.ResetMissionControl(
		context.Background(), &routerrpc.ResetMissionControlRequest{},
	)
	payInvoiceWithAssets(
		t.t, charlie, dave, invoiceResp.PaymentRequest, assetID,
	)

	logBalance(t.t, nodes, assetID, "after safe asset htlc failure")

	// Another test case: Make sure an asset invoice contains the correct
	// channel policy. We expect it to be the policy for the direction from
	// edge node to receiver node. To test this, we first set two different
	// policies on the channel between Erin and Fabia.
	resp, err := erin.UpdateChannelPolicy(ctx, &lnrpc.PolicyUpdateRequest{
		Scope: &lnrpc.PolicyUpdateRequest_ChanPoint{
			ChanPoint: chanPointEF,
		},
		BaseFeeMsat:   31337,
		FeeRatePpm:    443322,
		TimeLockDelta: 19,
	})
	require.NoError(t.t, err)
	require.Empty(t.t, resp.FailedUpdates)

	resp, err = fabia.UpdateChannelPolicy(ctx, &lnrpc.PolicyUpdateRequest{
		Scope: &lnrpc.PolicyUpdateRequest_ChanPoint{
			ChanPoint: chanPointEF,
		},
		BaseFeeMsat:   42069,
		FeeRatePpm:    223344,
		TimeLockDelta: 18,
	})
	require.NoError(t.t, err)
	require.Empty(t.t, resp.FailedUpdates)

	// We now create an invoice on Fabia and expect Erin's policy to be used
	// in the invoice.
	invoiceResp = createAssetInvoice(t.t, erin, fabia, 1_000, assetID)
	req, err := erin.DecodePayReq(ctx, &lnrpc.PayReqString{
		PayReq: invoiceResp.PaymentRequest,
	})
	require.NoError(t.t, err)

	require.Len(t.t, req.RouteHints, 1)
	require.Len(t.t, req.RouteHints[0].HopHints, 1)
	invoiceHint := req.RouteHints[0].HopHints[0]
	require.Equal(t.t, erin.PubKeyStr, invoiceHint.NodeId)
	require.EqualValues(t.t, 31337, invoiceHint.FeeBaseMsat)
	require.EqualValues(t.t, 443322, invoiceHint.FeeProportionalMillionths)
	require.EqualValues(t.t, 19, invoiceHint.CltvExpiryDelta)

	// Now we pay the invoice and expect the same policy with very expensive
	// fees to be used.
	payInvoiceWithSatoshi(
		t.t, dave, invoiceResp, withFeeLimit(100_000_000),
	)

	logBalance(t.t, nodes, assetID, "after policy checks")

	resBuy, err := daveTap.RfqClient.AddAssetBuyOrder(
		ctx, &rfqrpc.AddAssetBuyOrderRequest{
			AssetSpecifier: &assetSpecifier,
			AssetMaxAmt:    1_000,
			Expiry:         uint64(inOneHour.Unix()),
			PeerPubKey:     charlie.PubKey[:],
			TimeoutSeconds: 100,
		},
	)
	require.NoError(t.t, err)

	scid := resBuy.GetAcceptedQuote().Scid

	invResp := createAssetInvoice(
		t.t, charlie, dave, 1_000, assetID,
		withInvGroupKey(groupID), withRouteHints([]*lnrpc.RouteHint{
			{
				HopHints: []*lnrpc.HopHint{
					{
						NodeId: charlie.PubKeyStr,
						ChanId: scid,
					},
				},
			},
		}),
	)

	payInvoiceWithAssets(
		t.t, charlie, dave, invResp.PaymentRequest, assetID,
		withGroupKey(groupID),
	)

	logBalance(t.t, nodes, assetID, "after invoice with route hints")
}

// testCustomChannelsLiquidityEdgeCases is a test that runs through some
// taproot asset channel liquidity related edge cases.
func testCustomChannelsLiquidityEdgeCases(ctx context.Context,
	net *NetworkHarness, t *harnessTest) {

	// Run liquidity edge cases and only use single asset IDs for invoices
	// and payments.
	testCustomChannelsLiquidityEdgeCasesCore(ctx, net, t, false)
}

// testCustomChannelsLiquidityEdgeCasesGroup is a test that runs through some
// taproot asset channel liquidity related edge cases using group keys.
func testCustomChannelsLiquidityEdgeCasesGroup(ctx context.Context,
	net *NetworkHarness, t *harnessTest) {

	// Run liquidity edge cases and only use group keys for invoices and
	// payments.
	testCustomChannelsLiquidityEdgeCasesCore(ctx, net, t, true)
}

// testCustomChannelsMultiRFQ tests that sending and receiving payments works
// when using the multi-rfq features of tapd. This means that liquidity across
// multiple channels and peers can be used to send out a payment, or receive to
// an invoice.
func testCustomChannelsMultiRFQ(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplate)
	litdArgsDiffOracle := slices.Clone(litdArgsTemplateDiffOracle)

	charlie, err := net.NewNode(
		t.t, "Charlie", lndArgs, false, true, litdArgs...,
	)
	require.NoError(t.t, err)

	litdArgs = append(litdArgs, fmt.Sprintf(
		"--taproot-assets.proofcourieraddr=%s://%s",
		proof.UniverseRpcCourierType, charlie.Cfg.LitAddr(),
	))

	litdArgsDiffOracle = append(litdArgsDiffOracle, fmt.Sprintf(
		"--taproot-assets.proofcourieraddr=%s://%s",
		proof.UniverseRpcCourierType, charlie.Cfg.LitAddr(),
	))

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
	george, err := net.NewNode(
		t.t, "George", lndArgs, false, true, litdArgsDiffOracle...,
	)
	require.NoError(t.t, err)

	nodes := []*HarnessNode{charlie, dave, erin, fabia, yara, george}
	connectAllNodes(t.t, net, nodes)
	fundAllNodes(t.t, net, nodes)

	// Let's create the tap clients.
	charlieTap := newTapClient(t.t, charlie)
	daveTap := newTapClient(t.t, dave)
	erinTap := newTapClient(t.t, erin)
	fabiaTap := newTapClient(t.t, fabia)
	yaraTap := newTapClient(t.t, yara)
	georgeTap := newTapClient(t.t, george)

	assetReq := itest.CopyRequest(&mintrpc.MintAssetRequest{
		Asset: itestAsset,
	})

	assetReq.Asset.NewGroupedAsset = true

	// Mint an asset on Charlie and sync all nodes to Charlie as the
	// universe.
	mintedAssets := itest.MintAssetsConfirmBatch(
		t.t, t.lndHarness.Miner.Client, charlieTap,
		[]*mintrpc.MintAssetRequest{assetReq},
	)
	cents := mintedAssets[0]
	assetID := cents.AssetGenesis.AssetId
	groupID := cents.GetAssetGroup().GetTweakedGroupKey()

	syncUniverses(t.t, charlieTap, dave, erin, fabia, yara, george)

	multiRfqNodes := multiRfqNodes{
		charlie: itestNode{
			Lnd:  charlie,
			Tapd: charlieTap,
		},
		dave: itestNode{
			Lnd:  dave,
			Tapd: daveTap,
		},
		erin: itestNode{
			Lnd:  erin,
			Tapd: erinTap,
		},
		fabia: itestNode{
			Lnd:  fabia,
			Tapd: fabiaTap,
		},
		yara: itestNode{
			Lnd:  yara,
			Tapd: yaraTap,
		},
		george: itestNode{
			Lnd:  george,
			Tapd: georgeTap,
		},
		universeTap: charlieTap,
	}

	createTestMultiRFQAssetNetwork(
		t, net, multiRfqNodes, cents, 10_000, 10_000, 10_000,
	)

	logBalance(t.t, nodes, assetID, "before multi-rfq receive")

	hodlInv := createAssetHodlInvoice(t.t, nil, fabia, 20_000, assetID)

	payInvoiceWithSatoshi(
		t.t, charlie, &lnrpc.AddInvoiceResponse{
			PaymentRequest: hodlInv.payReq,
		},
		withFailure(lnrpc.Payment_IN_FLIGHT, failureNone),
	)

	logBalance(t.t, nodes, assetID, "after inflight multi-rfq")

	// Assert that some HTLCs are present from Fabia's point of view.
	assertMinNumHtlcs(t.t, fabia, 1)

	// Assert that Charlie also has at least one outgoing HTLC as a sanity
	// check.
	assertMinNumHtlcs(t.t, charlie, 1)

	// Now let's cancel the invoice and assert that all inbound channels
	// have cleared their HTLCs.
	payHash := hodlInv.preimage.Hash()
	_, err = fabia.InvoicesClient.CancelInvoice(
		ctx, &invoicesrpc.CancelInvoiceMsg{
			PaymentHash: payHash[:],
		},
	)
	require.NoError(t.t, err)

	assertNumHtlcs(t.t, dave, 0)
	assertNumHtlcs(t.t, erin, 0)
	assertNumHtlcs(t.t, yara, 0)

	logBalance(t.t, nodes, assetID, "after cancelled hodl")

	// Now let's create a normal invoice that will be settled once all the
	// HTLCs have been received. This is only possible because the payer
	// uses multiple bolt11 hop hints to reach the destination.
	invoiceResp := createAssetInvoice(
		t.t, nil, fabia, 15_000, nil, withInvGroupKey(groupID),
	)

	payInvoiceWithSatoshi(
		t.t, charlie, invoiceResp,
	)

	logBalance(t.t, nodes, assetID, "after multi-rfq receive")

	// Now we'll test that sending with multiple rfq quotes works.

	// Let's start by providing some liquidity to Charlie's peers, in order
	// for them to be able to push some amount if Fabia picks them as part
	// of the route.
	sendKeySendPayment(t.t, charlie, erin, 800_000)
	sendKeySendPayment(t.t, charlie, dave, 800_000)
	sendKeySendPayment(t.t, charlie, yara, 800_000)

	// Let's ask for the rough equivalent of ~15k assets. Fabia, who's going
	// to pay the invoice, only has parts of assets that are less than 10k
	// in channels with one of the 3 intermediate peers. The only way to
	// pay this invoice is by splitting the payment across multiple peers by
	// using multiple RFQ quotes.
	invAmt := int64(15_000 * 17)

	iResp, err := charlie.AddHoldInvoice(
		ctx, &invoicesrpc.AddHoldInvoiceRequest{
			Memo:  "",
			Value: invAmt,
			Hash:  payHash[:],
		},
	)
	require.NoError(t.t, err)

	payReq := iResp.PaymentRequest

	payInvoiceWithAssets(
		t.t, fabia, nil, payReq, assetID,
		withFailure(lnrpc.Payment_IN_FLIGHT, failureNone),
	)

	assertMinNumHtlcs(t.t, charlie, 2)
	assertMinNumHtlcs(t.t, fabia, 2)

	logBalance(t.t, nodes, assetID, "multi-rfq send in-flight")

	_, err = charlie.SettleInvoice(ctx, &invoicesrpc.SettleInvoiceMsg{
		Preimage: hodlInv.preimage[:],
	})
	require.NoError(t.t, err)

	assertNumHtlcs(t.t, charlie, 0)
	assertNumHtlcs(t.t, fabia, 0)

	logBalance(t.t, nodes, assetID, "after multi-rfq send")

	// Let's make another round-trip involving multi-rfq functionality.
	// Let's have Fabia receive another large payment and send it back
	// again, this time with a greater amount.
	invoiceResp = createAssetInvoice(t.t, nil, fabia, 25_000, assetID)

	payInvoiceWithSatoshi(
		t.t, charlie, invoiceResp,
	)

	logBalance(t.t, nodes, assetID, "after multi-rfq receive (2nd)")

	// Let's bump up the invoice amount a bit, to roughly ~22k assets.
	invAmt = 22_000 * 17
	inv, err := charlie.AddInvoice(ctx, &lnrpc.Invoice{
		Value: invAmt,
	})
	require.NoError(t.t, err)

	payReq = inv.PaymentRequest

	payInvoiceWithAssets(
		t.t, fabia, nil, payReq, nil, withGroupKey(groupID),
	)

	logBalance(t.t, nodes, assetID, "after multi-rfq send (2nd)")
}

// testCustomChannelsStrictForwarding is a test that tests the strict forwarding
// behavior of a node when it comes to paying asset invoices with assets and
// BTC invoices with satoshis.
func testCustomChannelsStrictForwarding(ctx context.Context,
	net *NetworkHarness, t *harnessTest) {

	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplate)

	// We use Charlie as the proof courier. But in order for Charlie to also
	// use itself, we need to define its port upfront.
	charliePort := port.NextAvailablePort()
	litdArgs = append(litdArgs, fmt.Sprintf(
		"--taproot-assets.proofcourieraddr=%s://%s",
		proof.UniverseRpcCourierType,
		fmt.Sprintf(node.ListenerFormat, charliePort),
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
	charlie, err := net.NewNodeWithPort(
		t.t, "Charlie", lndArgs, false, true, charliePort, litdArgs...,
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

	universeTap := newTapClient(t.t, charlie)
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
	payInvoiceWithSatoshiLastHop(t.t, erin, assetInvoice, hops, withFailure(
		lnrpc.Payment_FAILED, 0,
	))

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

	// We use Charlie as the proof courier. But in order for Charlie to also
	// use itself, we need to define its port upfront.
	charliePort := port.NextAvailablePort()
	litdArgs = append(litdArgs, fmt.Sprintf(
		"--taproot-assets.proofcourieraddr=%s://%s",
		proof.UniverseRpcCourierType,
		fmt.Sprintf(node.ListenerFormat, charliePort),
	))

	charlie, err := net.NewNodeWithPort(
		t.t, "Charlie", lndArgs, false, true, charliePort, litdArgs...,
	)
	require.NoError(t.t, err)
	dave, err := net.NewNode(t.t, "Dave", lndArgs, false, true, litdArgs...)
	require.NoError(t.t, err)

	nodes := []*HarnessNode{charlie, dave}
	connectAllNodes(t.t, net, nodes)
	fundAllNodes(t.t, net, nodes)

	charlieTap := newTapClient(t.t, charlie)
	daveTap := newTapClient(t.t, dave)
	universeTap := newTapClient(t.t, charlie)

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
	itest.AssertBalances(
		t.t, charlieTap, cents.Amount, itest.WithAssetID(assetID),
		itest.WithNumUtxos(1),
	)

	// The script key should be local to charlie, and the script key should
	// be known. It is after all the asset he just minted himself.
	itest.AssertBalances(
		t.t, charlieTap, cents.Amount, itest.WithAssetID(assetID),
		itest.WithNumUtxos(1), itest.WithScriptKey(cents.ScriptKey),
		itest.WithScriptKeyType(asset.ScriptKeyBip86),
	)

	fundingScriptTree := tapscript.NewChannelFundingScriptTree()
	fundingScriptKey := fundingScriptTree.TaprootKey
	fundingScriptKeyBytes := fundingScriptKey.SerializeCompressed()

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
	itest.AssertBalances(t.t, charlieTap, 0, itest.WithAssetID(assetID))
	itest.AssertBalances(t.t, daveTap, 0, itest.WithAssetID(assetID))

	// There should only be a single asset piece for Charlie, the one in the
	// channel.
	itest.AssertBalances(
		t.t, charlieTap, charlieBalance, itest.WithAssetID(assetID),
		itest.WithNumUtxos(1),
		itest.WithScriptKeyType(asset.ScriptKeyScriptPathChannel),
		itest.WithScriptKey(fundingScriptKeyBytes),
	)

	// Assert that the proofs for both channels has been uploaded to the
	// designated Universe server.
	assertUniverseProofExists(
		t.t, universeTap, assetID, groupKey, fundingScriptKeyBytes,
		fmt.Sprintf("%v:%v", fundRespCD.Txid, fundRespCD.OutputIndex),
	)

	// Make sure the channel shows the correct asset information.
	assertAssetChan(
		t.t, charlieTap.node, daveTap.node, charlieBalance,
		[]*taprpc.Asset{cents},
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
	itest.AssertBalances(t.t, charlieTap, 0, itest.WithAssetID(assetID))
	itest.AssertBalances(t.t, daveTap, 0, itest.WithAssetID(assetID))

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
	itest.AssertBalances(t.t, charlieTap, 0, itest.WithAssetID(assetID))
	itest.AssertBalances(t.t, daveTap, 0, itest.WithAssetID(assetID))

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
	itest.AssertBalances(
		t.t, charlieTap, charlieBalance-250, itest.WithAssetID(assetID),
		itest.WithNumUtxos(1),
		itest.WithScriptKeyType(asset.ScriptKeyBip86),
	)
	itest.AssertBalances(
		t.t, daveTap, 250, itest.WithAssetID(assetID),
		itest.WithNumUtxos(1),
		itest.WithScriptKeyType(asset.ScriptKeyBip86),
	)
}

// testCustomChannelsSingleAssetMultiInput tests whether it is possible to fund
// a channel using FundChannel that uses multiple inputs from the same asset.
func testCustomChannelsSingleAssetMultiInput(ctx context.Context,
	net *NetworkHarness, t *harnessTest) {

	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplate)

	// We use Charlie as the proof courier. But in order for Charlie to also
	// use itself, we need to define its port upfront.
	charliePort := port.NextAvailablePort()
	litdArgs = append(litdArgs, fmt.Sprintf(
		"--taproot-assets.proofcourieraddr=%s://%s",
		proof.UniverseRpcCourierType,
		fmt.Sprintf(node.ListenerFormat, charliePort),
	))

	charlie, err := net.NewNodeWithPort(
		t.t, "Charlie", lndArgs, false, true, charliePort, litdArgs...,
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
	itest.AssertBalances(
		t.t, charlieTap, cents.Amount, itest.WithAssetID(assetID),
		itest.WithNumUtxos(1),
		itest.WithScriptKeyType(asset.ScriptKeyBip86),
	)

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
	itest.AssertBalances(t.t, charlieTap, 0, itest.WithAssetID(assetID))
	itest.AssertBalances(t.t, daveTap, 0, itest.WithAssetID(assetID))

	// Make sure the channel shows the correct asset information.
	assertAssetChan(
		t.t, charlieTap.node, daveTap.node, 2*halfCentsAmount,
		[]*taprpc.Asset{cents},
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
	tcAsset := &mintrpc.MintAsset{
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

	// We use Charlie as the proof courier. But in order for Charlie to also
	// use itself, we need to define its port upfront.
	charliePort := port.NextAvailablePort()
	litdArgs = append(litdArgs, fmt.Sprintf(
		"--taproot-assets.proofcourieraddr=%s://%s",
		proof.UniverseRpcCourierType,
		fmt.Sprintf(node.ListenerFormat, charliePort),
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
	charlie, err := net.NewNodeWithPort(
		t.t, "Charlie", lndArgs, false, true, charliePort, litdArgs...,
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

	universeTap := newTapClient(t.t, charlie)
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
				Asset: tcAsset,
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

	// The default routing fees are 1ppm + 1msat per hop, and we have 2
	// hops in total.
	charliePaidMSat := addRoutingFee(addRoutingFee(lnwire.MilliSatoshi(
		decodedInvoice.NumMsat,
	)))
	charliePaidAmount := rfqmath.MilliSatoshiToUnits(
		charliePaidMSat, rate,
	).ScaleTo(0).ToUint64()
	assertPaymentHtlcAssets(
		t.t, charlie, invoiceResp.RHash, assetID, nil,
		charliePaidAmount,
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
		t, net, charlie, dave, chanPointCD, [][]byte{assetID}, nil,
		universeTap, noOpCoOpCloseBalanceCheck,
	)

	t.Logf("Closing Dave -> Yara channel, close initiated by Yara")
	closeAssetChannelAndAssert(
		t, net, yara, dave, chanPointDY, [][]byte{assetID}, nil,
		universeTap, noOpCoOpCloseBalanceCheck,
	)

	t.Logf("Closing Erin -> Fabia channel")
	closeAssetChannelAndAssert(
		t, net, erin, fabia, chanPointEF, [][]byte{assetID}, nil,
		universeTap, noOpCoOpCloseBalanceCheck,
	)
}

// testCustomChannelsFee tests whether the custom channel funding process
// fails if the proposed fee rate is lower than the minimum relay fee.
func testCustomChannelsFee(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplate)

	// We use Charlie as the proof courier. But in order for Charlie to also
	// use itself, we need to define its port upfront.
	charliePort := port.NextAvailablePort()
	litdArgs = append(litdArgs, fmt.Sprintf(
		"--taproot-assets.proofcourieraddr=%s://%s",
		proof.UniverseRpcCourierType,
		fmt.Sprintf(node.ListenerFormat, charliePort),
	))

	charlie, err := net.NewNodeWithPort(
		t.t, "Charlie", lndArgs, false, true, charliePort, litdArgs...,
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

	net.feeService.SetMinRelayFeerate(
		chainfee.SatPerVByte(2).FeePerKVByte(),
	)

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
}

// testCustomChannelsHtlcForceCloseMpp tests that we can force close a channel
// with HTLCs in both directions and that the HTLC outputs are correctly
// swept, using MPP.
func testCustomChannelsHtlcForceCloseMpp(ctxb context.Context,
	net *NetworkHarness, t *harnessTest) {

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

	aliceChanPoint := &lnrpc.ChannelPoint{
		OutputIndex: uint32(assetFundResp.OutputIndex),
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: assetFundResp.Txid,
		},
	}

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
		numPayments        = 10
		keySendAssetAmount = 2_500
		keySendSatAmount   = 5_000
	)
	for i := 0; i < numPayments; i++ {
		sendAssetKeySendPayment(
			t.t, alice, bob, keySendAssetAmount, assetID,
			fn.None[int64](),
		)
	}

	// With noop HTLCs implemented the sats balance of Bob will only
	// increase up to the reserve amount. Let's make a direct non-asset
	// keysend to make sure the sats balance is also enough.
	sendKeySendPayment(t.t, alice, bob, keySendSatAmount)

	logBalance(t.t, nodes, assetID, "after keysends to Bob")

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

	// Make sure we can sweep all the HTLCs.
	aliceExpectedBalance, bobExpectedBalance := assertForceCloseSweeps(
		ctx, net, t, alice, bob, aliceChanPoint,
		itestAsset.Amount-fundingAmount, assetInvoiceAmt,
		assetsPerMPPShard, assetID, nil, aliceHodlInvoices,
		bobHodlInvoices, mpp,
	)

	// Finally, we'll assert that Alice's balance has been incremented by
	// the timeout value.
	aliceExpectedBalance += uint64(assetInvoiceAmt - 1)
	t.Logf("Expecting Alice's balance to be %d", aliceExpectedBalance)
	assertSpendableBalance(
		t.t, aliceTap, assetID, nil, aliceExpectedBalance,
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
		t.t, zaneTap, assetID, nil, zaneExpectedBalance,
	)
}

// testCustomChannelsForwardBandwidth is a test that runs through some Taproot
// Assets Channel liquidity edge cases, specifically related to forwarding HTLCs
// into channels with no available asset bandwidth.
func testCustomChannelsForwardBandwidth(ctx context.Context,
	net *NetworkHarness, t *harnessTest) {

	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplate)

	// We use Charlie as the proof courier. But in order for Charlie to also
	// use itself, we need to define its port upfront.
	charliePort := port.NextAvailablePort()
	litdArgs = append(litdArgs, fmt.Sprintf(
		"--taproot-assets.proofcourieraddr=%s://%s",
		proof.UniverseRpcCourierType,
		fmt.Sprintf(node.ListenerFormat, charliePort),
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
	charlie, err := net.NewNodeWithPort(
		t.t, "Charlie", lndArgs, false, true, charliePort, litdArgs...,
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

	universeTap := newTapClient(t.t, charlie)
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
	rate, err := rpcutils.UnmarshalFixedPoint(&oraclerpc.FixedPoint{
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
	hopHint := &lnrpc.HopHint{
		NodeId:                    erin.PubKeyStr,
		ChanId:                    quote.AcceptedQuote.Scid,
		CltvExpiryDelta:           80,
		FeeBaseMsat:               1000,
		FeeProportionalMillionths: 1,
	}
	invoiceResp2, err := fabia.AddInvoice(ctx, &lnrpc.Invoice{
		Memo:      "too small invoice",
		ValueMsat: int64(oneUnitMilliSat - 1),
		RouteHints: []*lnrpc.RouteHint{{
			HopHints: []*lnrpc.HopHint{hopHint},
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
		t, net, erin, fabia, chanPointEF, [][]byte{assetID}, nil,
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
	tcAsset := &mintrpc.MintAsset{
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
				Asset: tcAsset,
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
	decodeResp, err := aliceTap.DecodeAssetPayReq(ctx, &tchrpc.AssetPayReq{
		AssetId:      assetID,
		PayReqString: payReq,
	})
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

	// We do the same call again, but this time using the group key for the
	// decoding query.
	decodeResp2, err := aliceTap.DecodeAssetPayReq(ctx, &tchrpc.AssetPayReq{
		GroupKey:     usdAsset.AssetGroup.TweakedGroupKey,
		PayReqString: payReq,
	})
	require.NoError(t.t, err)

	require.Equal(t.t, decodeResp.AssetAmount, decodeResp2.AssetAmount)
	require.Equal(t.t, decodeResp.AssetGroup, decodeResp2.AssetGroup)
	require.Equal(
		t.t, decodeResp.DecimalDisplay, decodeResp2.DecimalDisplay,
	)
}

// testCustomChannelsSelfPayment tests that circular self-payments can be made
// to re-balance between BTC and assets.
func testCustomChannelsSelfPayment(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplate)

	// We use Alice as the proof courier. But in order for Alice to also
	// use itself, we need to define its port upfront.
	alicePort := port.NextAvailablePort()
	litdArgs = append(litdArgs, fmt.Sprintf(
		"--taproot-assets.proofcourieraddr=%s://%s",
		proof.UniverseRpcCourierType,
		fmt.Sprintf(node.ListenerFormat, alicePort),
	))

	// Next, we'll make Alice and Bob, who will be the main nodes under
	// test.
	alice, err := net.NewNodeWithPort(
		t.t, "Alice", lndArgs, false, true, alicePort, litdArgs...,
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
	t.Logf("Opening asset channel...")
	assetFundResp, err := aliceTap.FundChannel(
		ctx, &tchrpc.FundChannelRequest{
			AssetAmount:        fundingAmount,
			AssetId:            assetID,
			PeerPubkey:         bob.PubKey[:],
			FeeRateSatPerVbyte: 5,
		},
	)
	require.NoError(t.t, err)
	t.Logf("Funded asset channel between Alice and Bob: %v", assetFundResp)

	assetChanPoint := &lnrpc.ChannelPoint{
		OutputIndex: uint32(assetFundResp.OutputIndex),
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: assetFundResp.Txid,
		},
	}

	// With the channel open, mine a block to confirm it.
	mineBlocks(t, net, 6, 1)

	// Before we start sending out payments, let's make sure each node can
	// see the other one in the graph and has all required features.
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(alice, bob))
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(bob, alice))

	t.Logf("Opening normal channel between Alice and Bob...")
	satChanPoint := openChannelAndAssert(
		t, net, alice, bob, lntest.OpenChannelParams{
			Amt:         10_000_000,
			SatPerVByte: 5,
		},
	)
	defer closeChannelAndAssert(t, net, alice, satChanPoint, false)

	assetChan := fetchChannel(t.t, alice, assetChanPoint)
	assetChanSCID := assetChan.ChanId
	satChan := fetchChannel(t.t, alice, satChanPoint)
	satChanSCID := satChan.ChanId

	t.Logf("Alice pubkey: %x", alice.PubKey[:])
	t.Logf("Bob   pubkey: %x", bob.PubKey[:])
	t.Logf("Outgoing channel SCID: %d", satChanSCID)
	logBalance(t.t, nodes, assetID, "initial")

	t.Logf("Key sending 15k assets from Alice to Bob...")
	const (
		assetKeySendAmount = 15_000
		numInvoicePayments = 10
		assetInvoiceAmount = 1_234
		btcInvoiceAmount   = 10_000
		btcKeySendAmount   = 200_000
		btcReserveAmount   = 2000
		btcHtlcCost        = numInvoicePayments * 354
	)
	sendAssetKeySendPayment(
		t.t, alice, bob, assetKeySendAmount, assetID,
		fn.Some[int64](btcReserveAmount+btcHtlcCost),
	)

	// We also send 200k sats from Alice to Bob, to make sure the BTC
	// channel has liquidity in both directions.
	sendKeySendPayment(t.t, alice, bob, btcKeySendAmount)
	logBalance(t.t, nodes, assetID, "after keysend")

	// We now do a series of small payments. They should all succeed and the
	// balances should be updated accordingly.
	aliceAssetBalance := uint64(fundingAmount - assetKeySendAmount)
	bobAssetBalance := uint64(assetKeySendAmount)
	for i := 0; i < numInvoicePayments; i++ {
		// The BTC balance of Alice before we start the payment. We
		// expect that to go down by at least the invoice amount.
		btcBalanceAliceBefore := fetchChannel(
			t.t, alice, satChanPoint,
		).LocalBalance

		invoiceResp := createAssetInvoice(
			t.t, bob, alice, assetInvoiceAmount, assetID,
		)
		payInvoiceWithSatoshi(
			t.t, alice, invoiceResp, withOutgoingChanIDs(
				[]uint64{satChanSCID},
			), withAllowSelfPayment(),
		)

		logBalance(
			t.t, nodes, assetID,
			"after paying invoice "+strconv.Itoa(i),
		)

		// The accumulated delta from the rounding of multiple sends.
		// We basically allow the balance to be off by one unit for each
		// payment.
		delta := float64(i + 1)

		// We now expect the channel balance to have decreased in the
		// BTC channel and increased in the assets channel.
		assertChannelAssetBalanceWithDelta(
			t.t, alice, assetChanPoint,
			aliceAssetBalance+assetInvoiceAmount,
			bobAssetBalance-assetInvoiceAmount, delta,
		)
		aliceAssetBalance += assetInvoiceAmount
		bobAssetBalance -= assetInvoiceAmount

		btcBalanceAliceAfter := fetchChannel(
			t.t, alice, satChanPoint,
		).LocalBalance

		// The difference between the two balances should be at least
		// the invoice amount.
		decodedInvoice, err := alice.DecodePayReq(
			context.Background(), &lnrpc.PayReqString{
				PayReq: invoiceResp.PaymentRequest,
			},
		)
		require.NoError(t.t, err)
		require.GreaterOrEqual(
			t.t, btcBalanceAliceBefore-btcBalanceAliceAfter,
			decodedInvoice.NumSatoshis,
		)
	}

	// We now do the opposite: We create a satoshi invoice on Alice and
	// attempt to pay it with assets.
	aliceAssetBalance, bobAssetBalance = channelAssetBalance(
		t.t, alice, assetChanPoint,
	)
	for i := 0; i < numInvoicePayments; i++ {
		// The BTC balance of Alice before we start the payment. We
		// expect that to go down by at least the invoice amount.
		btcBalanceAliceBefore := fetchChannel(
			t.t, alice, satChanPoint,
		).LocalBalance

		hopHint := &lnrpc.HopHint{
			NodeId:                    bob.PubKeyStr,
			ChanId:                    satChan.PeerScidAlias,
			CltvExpiryDelta:           80,
			FeeBaseMsat:               1000,
			FeeProportionalMillionths: 1,
		}
		invoiceResp := createNormalInvoice(
			t.t, alice, btcInvoiceAmount, withRouteHints(
				[]*lnrpc.RouteHint{{
					HopHints: []*lnrpc.HopHint{hopHint},
				}},
			),
		)
		sentUnits, _ := payInvoiceWithAssets(
			t.t, alice, bob, invoiceResp.PaymentRequest, assetID,
			withAllowSelfPayment(), withOutgoingChanIDs(
				[]uint64{assetChanSCID},
			),
		)

		logBalance(
			t.t, nodes, assetID,
			"after paying sat invoice "+strconv.Itoa(i),
		)

		// The accumulated delta from the rounding of multiple sends.
		// We basically allow the balance to be off by one unit for each
		// payment.
		delta := float64(i + 1)

		// We now expect the channel balance to have increased in the
		// BTC channel and decreased in the assets channel.
		assertChannelAssetBalanceWithDelta(
			t.t, alice, assetChanPoint,
			aliceAssetBalance-sentUnits,
			bobAssetBalance+sentUnits, delta,
		)
		aliceAssetBalance -= sentUnits
		bobAssetBalance += sentUnits

		btcBalanceAliceAfter := fetchChannel(
			t.t, alice, satChanPoint,
		).LocalBalance

		// The difference between the two balances should be at least
		// the invoice amount.
		decodedInvoice, err := alice.DecodePayReq(
			context.Background(), &lnrpc.PayReqString{
				PayReq: invoiceResp.PaymentRequest,
			},
		)
		require.NoError(t.t, err)
		require.GreaterOrEqual(
			t.t, btcBalanceAliceAfter-btcBalanceAliceBefore,
			decodedInvoice.NumSatoshis,
		)
	}
}

// testCustomChannelsMultiChannelPathfinding tests that multiple channels with
// different assets are properly considered when pathfinding for payments.
func testCustomChannelsMultiChannelPathfinding(ctx context.Context,
	net *NetworkHarness, t *harnessTest) {

	lndArgs := slices.Clone(lndArgsTemplate)
	litdArgs := slices.Clone(litdArgsTemplate)

	// We use Alice as the proof courier. But in order for Alice to also
	// use itself, we need to define its port upfront.
	alicePort := port.NextAvailablePort()
	litdArgs = append(litdArgs, fmt.Sprintf(
		"--taproot-assets.proofcourieraddr=%s://%s",
		proof.UniverseRpcCourierType,
		fmt.Sprintf(node.ListenerFormat, alicePort),
	))

	// Next, we'll make Alice and Bob, who will be the main nodes under
	// test.
	alice, err := net.NewNodeWithPort(
		t.t, "Alice", lndArgs, false, true, alicePort, litdArgs...,
	)
	require.NoError(t.t, err)
	bob, err := net.NewNode(
		t.t, "Bob", lndArgs, false, true, litdArgs...,
	)
	require.NoError(t.t, err)

	charlie, err := net.NewNode(
		t.t, "Charlie", lndArgs, false, true, litdArgs...,
	)
	require.NoError(t.t, err)

	// Now we'll connect all nodes, and also fund them with some coins.
	nodes := []*HarnessNode{alice, bob, charlie}
	connectAllNodes(t.t, net, nodes)
	fundAllNodes(t.t, net, nodes)

	aliceTap := newTapClient(t.t, alice)

	// Next, we'll mint an asset for Alice, who will be the node that opens
	// the channel outbound.
	mintedAssets1 := itest.MintAssetsConfirmBatch(
		t.t, t.lndHarness.Miner.Client, aliceTap,
		[]*mintrpc.MintAssetRequest{
			{
				Asset: itestAsset,
			},
		},
	)
	cents := mintedAssets1[0]
	assetIDCents := cents.AssetGenesis.AssetId

	// We'll mint a second asset, representing british pences.
	mintedAssets2 := itest.MintAssetsConfirmBatch(
		t.t, t.lndHarness.Miner.Client, aliceTap,
		[]*mintrpc.MintAssetRequest{
			{
				Asset: &mintrpc.MintAsset{
					AssetType: taprpc.AssetType_NORMAL,
					Name:      "itest-asset-pences",
					AssetMeta: dummyMetaData,
					Amount:    1_000_000,
				},
			},
		},
	)
	pences := mintedAssets2[0]
	assetIDPences := pences.AssetGenesis.AssetId

	t.Logf("Minted %d lightning cents and %d lightning pences, syncing "+
		"universes...", cents.Amount, pences.Amount)
	syncUniverses(t.t, aliceTap, bob)
	t.Logf("Universes synced between all nodes, distributing assets...")

	// With the assets created, and synced -- we'll now open the channel
	// between Alice and Bob.
	t.Logf("Opening asset channel with cents...")
	assetFundResp1, err := aliceTap.FundChannel(
		ctx, &tchrpc.FundChannelRequest{
			AssetAmount:        fundingAmount,
			AssetId:            assetIDCents,
			PeerPubkey:         bob.PubKey[:],
			FeeRateSatPerVbyte: 5,
		},
	)
	require.NoError(t.t, err)
	t.Logf("Funded cents channel between Alice and Bob: %v", assetFundResp1)

	// With the channel open, mine a block to confirm it.
	mineBlocks(t, net, 6, 1)

	t.Logf("Opening asset channel with pences...")
	assetFundResp2, err := aliceTap.FundChannel(
		ctx, &tchrpc.FundChannelRequest{
			AssetAmount:        fundingAmount,
			AssetId:            assetIDPences,
			PeerPubkey:         bob.PubKey[:],
			FeeRateSatPerVbyte: 5,
		},
	)
	require.NoError(t.t, err)
	t.Logf("Funded pences channel between Alice and Bob: %v",
		assetFundResp2)

	// With the channel open, mine a block to confirm it.
	mineBlocks(t, net, 6, 1)

	t.Logf("Opening normal channel between Bob and Charlie...")
	satChanPoint := openChannelAndAssert(
		t, net, bob, charlie, lntest.OpenChannelParams{
			Amt:         10_000_000,
			SatPerVByte: 5,
		},
	)
	defer closeChannelAndAssert(t, net, charlie, satChanPoint, false)

	// Before we start sending out payments, let's make sure each node can
	// see the other one in the graph and has all required features.
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(alice, bob))
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(bob, alice))
	require.NoError(t.t, t.lndHarness.AssertNodeKnown(alice, charlie))

	// We now make sure that the balance of the cents channel is higher on
	// Alice, by sending some of the pences to Bob in a keysend payment.
	const pencesKeySendAmount = 5_000
	sendAssetKeySendPayment(
		t.t, alice, bob, pencesKeySendAmount, assetIDPences,
		fn.None[int64](),
	)

	logBalance(t.t, nodes, assetIDCents, "cents, after keysend pences")
	logBalance(t.t, nodes, assetIDPences, "pences, after keysend pences")

	// We now create a normal invoice on Charlie for some amount, then try
	// to pay it with pences.
	const btcInvoiceAmount = 500_00
	invoiceResp := createNormalInvoice(t.t, charlie, btcInvoiceAmount)
	payInvoiceWithAssets(
		t.t, alice, bob, invoiceResp.PaymentRequest, assetIDPences,
	)
}
