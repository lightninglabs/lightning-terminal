package itest

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"slices"
	"testing"
	"time"

	"github.com/btcsuite/btcd/btcec/v2"
	"github.com/btcsuite/btcd/btcec/v2/schnorr"
	"github.com/btcsuite/btcd/btcutil"
	"github.com/btcsuite/btcd/chaincfg/chainhash"
	"github.com/davecgh/go-spew/spew"
	"github.com/lightninglabs/taproot-assets/itest"
	"github.com/lightninglabs/taproot-assets/proof"
	"github.com/lightninglabs/taproot-assets/rfqmsg"
	"github.com/lightninglabs/taproot-assets/tapchannel"
	"github.com/lightninglabs/taproot-assets/taprpc"
	"github.com/lightninglabs/taproot-assets/taprpc/assetwalletrpc"
	"github.com/lightninglabs/taproot-assets/taprpc/mintrpc"
	"github.com/lightninglabs/taproot-assets/taprpc/rfqrpc"
	tchrpc "github.com/lightninglabs/taproot-assets/taprpc/tapchannelrpc"
	"github.com/lightninglabs/taproot-assets/taprpc/tapdevrpc"
	"github.com/lightninglabs/taproot-assets/taprpc/universerpc"
	"github.com/lightningnetwork/lnd/fn"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lnrpc/routerrpc"
	"github.com/lightningnetwork/lnd/lntest"
	"github.com/lightningnetwork/lnd/lntest/rpc"
	"github.com/lightningnetwork/lnd/lntest/wait"
	"github.com/lightningnetwork/lnd/lntypes"
	"github.com/lightningnetwork/lnd/lnwire"
	"github.com/lightningnetwork/lnd/macaroons"
	"github.com/lightningnetwork/lnd/record"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/protobuf/proto"
	"gopkg.in/macaroon.v2"
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
		"--taproot-assets.experimental.rfq.mockoraclecentpersat=" +
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

	// We need to send some assets to Dave, so he can fund an asset channel
	// with Yara.
	const (
		fundingAmount = 50_000
		startAmount   = fundingAmount * 2
	)
	daveAddr, err := daveTap.NewAddr(ctxb, &taprpc.NewAddrRequest{
		Amt:     startAmount,
		AssetId: assetID,
		ProofCourierAddr: fmt.Sprintf(
			"%s://%s", proof.UniverseRpcCourierType,
			charlie.Cfg.LitAddr(),
		),
	})
	require.NoError(t.t, err)

	t.Logf("Sending %v asset units to Dave...", startAmount)

	// Send the assets to Erin.
	itest.AssertAddrCreated(t.t, daveTap, cents, daveAddr)
	sendResp, err := charlieTap.SendAsset(ctxb, &taprpc.SendAssetRequest{
		TapAddrs: []string{daveAddr.Encoded},
	})
	require.NoError(t.t, err)
	itest.ConfirmAndAssertOutboundTransfer(
		t.t, t.lndHarness.Miner.Client, charlieTap, sendResp, assetID,
		[]uint64{cents.Amount - startAmount, startAmount}, 0, 1,
	)
	itest.AssertNonInteractiveRecvComplete(t.t, daveTap, 1)

	// We need to send some assets to Erin, so he can fund an asset channel
	// with Fabia.
	erinAddr, err := erinTap.NewAddr(ctxb, &taprpc.NewAddrRequest{
		Amt:     startAmount,
		AssetId: assetID,
		ProofCourierAddr: fmt.Sprintf(
			"%s://%s", proof.UniverseRpcCourierType,
			charlie.Cfg.LitAddr(),
		),
	})
	require.NoError(t.t, err)

	t.Logf("Sending %v asset units to Erin...", startAmount)

	// Send the assets to Erin.
	itest.AssertAddrCreated(t.t, erinTap, cents, erinAddr)
	sendResp, err = charlieTap.SendAsset(ctxb, &taprpc.SendAssetRequest{
		TapAddrs: []string{erinAddr.Encoded},
	})
	require.NoError(t.t, err)
	itest.ConfirmAndAssertOutboundTransfer(
		t.t, t.lndHarness.Miner.Client, charlieTap, sendResp, assetID,
		[]uint64{cents.Amount - 2*startAmount, startAmount}, 1, 2,
	)
	itest.AssertNonInteractiveRecvComplete(t.t, erinTap, 1)

	t.Logf("Opening asset channels...")

	// The first channel we create has a push amount, so Charlie can receive
	// payments immediately and not run into the channel reserve issue.
	charlieFundingAmount := cents.Amount - 2*startAmount
	fundRespCD, err := charlieTap.FundChannel(
		ctxb, &tchrpc.FundChannelRequest{
			AssetAmount:        charlieFundingAmount,
			AssetId:            assetID,
			PeerPubkey:         dave.PubKey[:],
			FeeRateSatPerVbyte: 5,
			PushSat:            1065,
		},
	)
	require.NoError(t.t, err)
	t.Logf("Funded channel between Charlie and Dave: %v", fundRespCD)

	daveFundingAmount := uint64(startAmount)
	fundRespDY, err := daveTap.FundChannel(
		ctxb, &tchrpc.FundChannelRequest{
			AssetAmount:        daveFundingAmount,
			AssetId:            assetID,
			PeerPubkey:         yara.PubKey[:],
			FeeRateSatPerVbyte: 5,
		},
	)
	require.NoError(t.t, err)
	t.Logf("Funded channel between Dave and Yara: %v", fundRespDY)

	erinFundingAmount := uint64(fundingAmount)
	fundRespEF, err := erinTap.FundChannel(
		ctxb, &tchrpc.FundChannelRequest{
			AssetAmount:        erinFundingAmount,
			AssetId:            assetID,
			PeerPubkey:         fabia.PubKey[:],
			FeeRateSatPerVbyte: 5,
		},
	)
	require.NoError(t.t, err)
	t.Logf("Funded channel between Erin and Fabia: %v", fundRespEF)

	// Make sure the pending channel shows up in the list and has the
	// custom records set as JSON.
	assertPendingChannels(t.t, charlie, assetID, 1, charlieFundingAmount, 0)
	assertPendingChannels(
		t.t, dave, assetID, 2, daveFundingAmount, charlieFundingAmount,
	)
	assertPendingChannels(t.t, erin, assetID, 1, erinFundingAmount, 0)

	// Now that we've looked at the pending channels, let's actually confirm
	// all three of them.
	mineBlocks(t, net, 6, 3)

	// We'll be tracking the expected asset balances throughout the test, so
	// we can assert it after each action.
	charlieAssetBalance := charlieFundingAmount
	daveAssetBalance := uint64(startAmount)
	erinAssetBalance := uint64(startAmount)
	fabiaAssetBalance := uint64(0)
	yaraAssetBalance := uint64(0)

	// After opening the channels, the asset balance of the funding nodes
	// shouldn't have been decreased, since the asset with the funding
	// output was imported into the asset DB and should count toward the
	// balance.
	assertAssetBalance(t.t, charlieTap, assetID, charlieAssetBalance)
	assertAssetBalance(t.t, daveTap, assetID, daveAssetBalance)
	assertAssetBalance(t.t, erinTap, assetID, erinAssetBalance)

	// There should only be a single asset piece for Charlie, the one in the
	// channel.
	assertNumAssetOutputs(t.t, charlieTap, assetID, 1)
	assertAssetExists(
		t.t, charlieTap, assetID, charlieFundingAmount,
		fundingScriptKey, false, true, true,
	)

	// Dave should just have one asset piece, since we used the full amount
	// for the channel opening.
	assertNumAssetOutputs(t.t, daveTap, assetID, 1)
	assertAssetExists(
		t.t, daveTap, assetID, daveFundingAmount, fundingScriptKey,
		false, true, true,
	)

	// Erin should just have two equally sized asset pieces, the change and
	// the funding transaction.
	assertNumAssetOutputs(t.t, erinTap, assetID, 2)
	assertAssetExists(
		t.t, erinTap, assetID, startAmount-erinFundingAmount, nil, true,
		false, false,
	)
	assertAssetExists(
		t.t, erinTap, assetID, erinFundingAmount, fundingScriptKey,
		false, true, true,
	)

	// Assert that the proofs for both channels has been uploaded to the
	// designated Universe server.
	assertUniverseProofExists(
		t.t, universeTap, assetID, fundingScriptTreeBytes, fmt.Sprintf(
			"%v:%v", fundRespCD.Txid, fundRespCD.OutputIndex,
		),
	)
	assertUniverseProofExists(
		t.t, universeTap, assetID, fundingScriptTreeBytes, fmt.Sprintf(
			"%v:%v", fundRespDY.Txid, fundRespDY.OutputIndex,
		),
	)
	assertUniverseProofExists(
		t.t, universeTap, assetID, fundingScriptTreeBytes, fmt.Sprintf(
			"%v:%v", fundRespEF.Txid, fundRespEF.OutputIndex,
		),
	)

	// Make sure the channel shows the correct asset information.
	assertAssetChan(t.t, charlie, dave, charlieFundingAmount, assetID)
	assertAssetChan(t.t, dave, yara, daveFundingAmount, assetID)
	assertAssetChan(t.t, erin, fabia, erinFundingAmount, assetID)

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
		t, net, charlie, dave, charlieChanPoint, assetID, nil,
		universeTap, true, true, false,
	)

	t.Logf("Closing Dave -> Yara channel")
	closeAssetChannelAndAssert(
		t, net, dave, yara, daveChanPoint, assetID, nil,
		universeTap, false, true, false,
	)

	t.Logf("Closing Erin -> Fabia channel")
	closeAssetChannelAndAssert(
		t, net, erin, fabia, erinChanPoint, assetID, nil,
		universeTap, true, true, false,
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
		t.t, universeTap, assetID, fundingScriptTreeBytes, fmt.Sprintf(
			"%v:%v", fundRespCD.Txid, fundRespCD.OutputIndex,
		),
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
		universeTap, false, false, false,
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

	// For some reason, the channel funding output of the immediately closed
	// channel is still present in the asset DB, even after we import the
	// co-op close transaction proof.
	// TODO(guggero): Investigate this. The actual number of outputs should
	// be two here, and we shouldn't have the extra fundingAmount in the
	// balance.
	charlieAssetBalance += fundingAmount
	assertNumAssetOutputs(t.t, charlieTap, assetID, 3)

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

	// We need to send some assets to Dave, so he can fund an asset channel
	// with Yara.
	const (
		fundingAmount = 50_000
		startAmount   = fundingAmount * 2
	)
	daveAddr, err := daveTap.NewAddr(ctxb, &taprpc.NewAddrRequest{
		Amt:     startAmount,
		AssetId: assetID,
		ProofCourierAddr: fmt.Sprintf(
			"%s://%s", proof.UniverseRpcCourierType,
			charlie.Cfg.LitAddr(),
		),
	})
	require.NoError(t.t, err)

	t.Logf("Sending %v asset units to Dave...", startAmount)

	// Send the assets to Erin.
	itest.AssertAddrCreated(t.t, daveTap, cents, daveAddr)
	sendResp, err := charlieTap.SendAsset(ctxb, &taprpc.SendAssetRequest{
		TapAddrs: []string{daveAddr.Encoded},
	})
	require.NoError(t.t, err)
	itest.ConfirmAndAssertOutboundTransfer(
		t.t, t.lndHarness.Miner.Client, charlieTap, sendResp, assetID,
		[]uint64{cents.Amount - startAmount, startAmount}, 0, 1,
	)
	itest.AssertNonInteractiveRecvComplete(t.t, daveTap, 1)

	// We need to send some assets to Erin, so he can fund an asset channel
	// with Fabia.
	erinAddr, err := erinTap.NewAddr(ctxb, &taprpc.NewAddrRequest{
		Amt:     startAmount,
		AssetId: assetID,
		ProofCourierAddr: fmt.Sprintf(
			"%s://%s", proof.UniverseRpcCourierType,
			charlie.Cfg.LitAddr(),
		),
	})
	require.NoError(t.t, err)

	t.Logf("Sending %v asset units to Erin...", startAmount)

	// Send the assets to Erin.
	itest.AssertAddrCreated(t.t, erinTap, cents, erinAddr)
	sendResp, err = charlieTap.SendAsset(ctxb, &taprpc.SendAssetRequest{
		TapAddrs: []string{erinAddr.Encoded},
	})
	require.NoError(t.t, err)
	itest.ConfirmAndAssertOutboundTransfer(
		t.t, t.lndHarness.Miner.Client, charlieTap, sendResp, assetID,
		[]uint64{cents.Amount - 2*startAmount, startAmount}, 1, 2,
	)
	itest.AssertNonInteractiveRecvComplete(t.t, erinTap, 1)

	t.Logf("Opening asset channels...")

	// The first channel we create has a push amount, so Charlie can receive
	// payments immediately and not run into the channel reserve issue.
	charlieFundingAmount := cents.Amount - 2*startAmount
	fundRespCD, err := charlieTap.FundChannel(
		ctxb, &tchrpc.FundChannelRequest{
			AssetAmount:        charlieFundingAmount,
			AssetId:            assetID,
			PeerPubkey:         dave.PubKey[:],
			FeeRateSatPerVbyte: 5,
			PushSat:            1065,
		},
	)
	require.NoError(t.t, err)
	t.Logf("Funded channel between Charlie and Dave: %v", fundRespCD)

	daveFundingAmount := uint64(startAmount)
	fundRespDY, err := daveTap.FundChannel(
		ctxb, &tchrpc.FundChannelRequest{
			AssetAmount:        daveFundingAmount,
			AssetId:            assetID,
			PeerPubkey:         yara.PubKey[:],
			FeeRateSatPerVbyte: 5,
		},
	)
	require.NoError(t.t, err)
	t.Logf("Funded channel between Dave and Yara: %v", fundRespDY)

	erinFundingAmount := uint64(fundingAmount)
	fundRespEF, err := erinTap.FundChannel(
		ctxb, &tchrpc.FundChannelRequest{
			AssetAmount:        erinFundingAmount,
			AssetId:            assetID,
			PeerPubkey:         fabia.PubKey[:],
			FeeRateSatPerVbyte: 5,
		},
	)
	require.NoError(t.t, err)
	t.Logf("Funded channel between Erin and Fabia: %v", fundRespEF)

	// Make sure the pending channel shows up in the list and has the
	// custom records set as JSON.
	assertPendingChannels(t.t, charlie, assetID, 1, charlieFundingAmount, 0)
	assertPendingChannels(
		t.t, dave, assetID, 2, daveFundingAmount, charlieFundingAmount,
	)
	assertPendingChannels(t.t, erin, assetID, 1, erinFundingAmount, 0)

	// Now that we've looked at the pending channels, let's actually confirm
	// all three of them.
	mineBlocks(t, net, 6, 3)

	// We'll be tracking the expected asset balances throughout the test, so
	// we can assert it after each action.
	charlieAssetBalance := charlieFundingAmount
	daveAssetBalance := uint64(startAmount)
	erinAssetBalance := uint64(startAmount)
	fabiaAssetBalance := uint64(0)
	yaraAssetBalance := uint64(0)

	// After opening the channels, the asset balance of the funding nodes
	// shouldn't have been decreased, since the asset with the funding
	// output was imported into the asset DB and should count toward the
	// balance.
	assertAssetBalance(t.t, charlieTap, assetID, charlieAssetBalance)
	assertAssetBalance(t.t, daveTap, assetID, daveAssetBalance)
	assertAssetBalance(t.t, erinTap, assetID, erinAssetBalance)

	// There should only be a single asset piece for Charlie, the one in the
	// channel.
	assertNumAssetOutputs(t.t, charlieTap, assetID, 1)
	assertAssetExists(
		t.t, charlieTap, assetID, charlieFundingAmount,
		fundingScriptKey, false, true, true,
	)

	// Dave should just have one asset piece, since we used the full amount
	// for the channel opening.
	assertNumAssetOutputs(t.t, daveTap, assetID, 1)
	assertAssetExists(
		t.t, daveTap, assetID, daveFundingAmount, fundingScriptKey,
		false, true, true,
	)

	// Erin should just have two equally sized asset pieces, the change and
	// the funding transaction.
	assertNumAssetOutputs(t.t, erinTap, assetID, 2)
	assertAssetExists(
		t.t, erinTap, assetID, startAmount-erinFundingAmount, nil, true,
		false, false,
	)
	assertAssetExists(
		t.t, erinTap, assetID, erinFundingAmount, fundingScriptKey,
		false, true, true,
	)

	// Assert that the proofs for both channels has been uploaded to the
	// designated Universe server.
	assertUniverseGroupProofExists(
		t.t, universeTap, groupID, fundingScriptTreeBytes, fmt.Sprintf(
			"%v:%v", fundRespCD.Txid, fundRespCD.OutputIndex,
		),
	)
	assertUniverseGroupProofExists(
		t.t, universeTap, groupID, fundingScriptTreeBytes, fmt.Sprintf(
			"%v:%v", fundRespDY.Txid, fundRespDY.OutputIndex,
		),
	)
	assertUniverseGroupProofExists(
		t.t, universeTap, groupID, fundingScriptTreeBytes, fmt.Sprintf(
			"%v:%v", fundRespEF.Txid, fundRespEF.OutputIndex,
		),
	)

	// Make sure the channel shows the correct asset information.
	assertAssetChan(t.t, charlie, dave, charlieFundingAmount, assetID)
	assertAssetChan(t.t, dave, yara, daveFundingAmount, assetID)
	assertAssetChan(t.t, erin, fabia, erinFundingAmount, assetID)

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
		universeTap, true, true, true,
	)

	t.Logf("Closing Dave -> Yara channel")
	closeAssetChannelAndAssert(
		t, net, dave, yara, daveChanPoint, assetID, groupID,
		universeTap, false, true, true,
	)

	t.Logf("Closing Erin -> Fabia channel")
	closeAssetChannelAndAssert(
		t, net, erin, fabia, erinChanPoint, assetID, groupID,
		universeTap, true, true, true,
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
	assertUniverseGroupProofExists(
		t.t, universeTap, groupID, fundingScriptTreeBytes, fmt.Sprintf(
			"%v:%v", fundRespCD.Txid, fundRespCD.OutputIndex,
		),
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
		universeTap, false, false, true,
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

	// For some reason, the channel funding output of the immediately closed
	// channel is still present in the asset DB, even after we import the
	// co-op close transaction proof.
	// TODO(guggero): Investigate this. The actual number of outputs should
	// be two here, and we shouldn't have the extra fundingAmount in the
	// balance.
	charlieAssetBalance += fundingAmount
	assertNumAssetOutputs(t.t, charlieTap, assetID, 3)

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

	// TODO(roasbeef): consolidate w/ the other test

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
		t.t, universeTap, assetID, fundingScriptTreeBytes, fmt.Sprintf(
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
				t.t, universeTap, assetID,
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

	// TODO(roasbeef): consolidate w/ the other test

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
		t.t, universeTap, assetID, fundingScriptTreeBytes, fmt.Sprintf(
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

func assertNumAssetUTXOs(t *testing.T, tapdClient *tapClient,
	numUTXOs int) *taprpc.ListUtxosResponse {

	ctxb := context.Background()

	var clientUTXOs *taprpc.ListUtxosResponse
	err := wait.NoError(func() error {
		var err error
		clientUTXOs, err = tapdClient.ListUtxos(
			ctxb, &taprpc.ListUtxosRequest{},
		)
		if err != nil {
			return err
		}

		if len(clientUTXOs.ManagedUtxos) != numUTXOs {
			return fmt.Errorf("expected %v UTXO, got %d", numUTXOs,
				len(clientUTXOs.ManagedUtxos))
		}

		return nil
	}, defaultTimeout)
	require.NoErrorf(t, err, "failed to assert UTXOs: %v, last state: %v",
		err, clientUTXOs)

	return clientUTXOs
}

func locateAssetTransfers(t *testing.T, tapdClient *tapClient,
	txid chainhash.Hash) *taprpc.AssetTransfer {

	var transfer *taprpc.AssetTransfer
	err := wait.NoError(func() error {
		ctxb := context.Background()
		forceCloseTransfer, err := tapdClient.ListTransfers(
			ctxb, &taprpc.ListTransfersRequest{
				AnchorTxid: txid.String(),
			},
		)
		if err != nil {
			return fmt.Errorf("unable to list %v transfers: %w",
				tapdClient.node.Name(), err)
		}
		if len(forceCloseTransfer.Transfers) != 1 {
			return fmt.Errorf("%v is missing force close "+
				"transfer", tapdClient.node.Name())
		}

		transfer = forceCloseTransfer.Transfers[0]

		return nil
	}, defaultTimeout)
	require.NoError(t, err)

	return transfer
}

func connectAllNodes(t *testing.T, net *NetworkHarness, nodes []*HarnessNode) {
	for i, node := range nodes {
		for j := i + 1; j < len(nodes); j++ {
			peer := nodes[j]
			net.ConnectNodesPerm(t, node, peer)
		}
	}
}

func fundAllNodes(t *testing.T, net *NetworkHarness, nodes []*HarnessNode) {
	for _, node := range nodes {
		net.SendCoins(t, btcutil.SatoshiPerBitcoin, node)
	}
}

func syncUniverses(t *testing.T, universe *tapClient, nodes ...*HarnessNode) {
	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	for _, node := range nodes {
		nodeTapClient := newTapClient(t, node)

		universeHostAddr := universe.node.Cfg.LitAddr()
		t.Logf("Syncing node %v with universe %v", node.Cfg.Name,
			universeHostAddr)

		itest.SyncUniverses(
			ctxt, t, nodeTapClient, universe, universeHostAddr,
			defaultTimeout,
		)
	}
}

func assertUniverseGroupProofExists(t *testing.T, universe *tapClient,
	groupID, scriptKey []byte, outpoint string) *taprpc.Asset {

	t.Logf("Asserting proof outpoint=%v, script_key=%x", outpoint,
		scriptKey)

	req := &universerpc.UniverseKey{
		Id: &universerpc.ID{
			Id: &universerpc.ID_GroupKey{
				GroupKey: groupID,
			},
			ProofType: universerpc.ProofType_PROOF_TYPE_TRANSFER,
		},
		LeafKey: &universerpc.AssetKey{
			Outpoint: &universerpc.AssetKey_OpStr{
				OpStr: outpoint,
			},
			ScriptKey: &universerpc.AssetKey_ScriptKeyBytes{
				ScriptKeyBytes: scriptKey,
			},
		},
	}

	ctxb := context.Background()
	var proofResp *universerpc.AssetProofResponse
	err := wait.NoError(func() error {
		var pErr error
		proofResp, pErr = universe.QueryProof(ctxb, req)
		return pErr
	}, defaultTimeout)
	require.NoError(
		t, err, "%v: outpoint=%v, script_key=%x", err, outpoint,
		scriptKey,
	)
	require.Equal(
		t, proofResp.AssetLeaf.Asset.AssetGroup.TweakedGroupKey,
		groupID,
	)
	a := proofResp.AssetLeaf.Asset
	t.Logf("Proof found for scriptKey=%x, amount=%d", a.ScriptKey, a.Amount)

	return a
}

func assertUniverseProofExists(t *testing.T, universe *tapClient,
	assetID, scriptKey []byte, outpoint string) *taprpc.Asset {

	t.Logf("Asserting proof outpoint=%v, script_key=%x", outpoint,
		scriptKey)

	req := &universerpc.UniverseKey{
		Id: &universerpc.ID{
			Id: &universerpc.ID_AssetId{
				AssetId: assetID,
			},
			ProofType: universerpc.ProofType_PROOF_TYPE_TRANSFER,
		},
		LeafKey: &universerpc.AssetKey{
			Outpoint: &universerpc.AssetKey_OpStr{
				OpStr: outpoint,
			},
			ScriptKey: &universerpc.AssetKey_ScriptKeyBytes{
				ScriptKeyBytes: scriptKey,
			},
		},
	}

	ctxb := context.Background()
	var proofResp *universerpc.AssetProofResponse
	err := wait.NoError(func() error {
		var pErr error
		proofResp, pErr = universe.QueryProof(ctxb, req)
		return pErr
	}, defaultTimeout)
	require.NoError(
		t, err, "%v: outpoint=%v, script_key=%x", err, outpoint,
		scriptKey,
	)
	require.Equal(
		t, proofResp.AssetLeaf.Asset.AssetGenesis.AssetId, assetID,
	)
	a := proofResp.AssetLeaf.Asset
	t.Logf("Proof found for scriptKey=%x, amount=%d", a.ScriptKey, a.Amount)

	return a
}

func assertPendingChannels(t *testing.T, node *HarnessNode, assetID []byte,
	numChannels int, localSum, remoteSum uint64) {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	pendingChannelsResp, err := node.PendingChannels(
		ctxt, &lnrpc.PendingChannelsRequest{},
	)
	require.NoError(t, err)
	require.Len(t, pendingChannelsResp.PendingOpenChannels, numChannels)

	pendingChan := pendingChannelsResp.PendingOpenChannels[0]
	var pendingJSON rfqmsg.JsonAssetChannel
	err = json.Unmarshal(
		pendingChan.Channel.CustomChannelData, &pendingJSON,
	)
	require.NoError(t, err)
	require.Len(t, pendingJSON.Assets, 1)

	require.NotZero(t, pendingJSON.Assets[0].Capacity)

	pendingLocalBalance, pendingRemoteBalance := getAssetChannelBalance(
		t, node, assetID, true,
	)
	require.EqualValues(t, localSum, pendingLocalBalance)
	require.EqualValues(t, remoteSum, pendingRemoteBalance)
}

func assertAssetChan(t *testing.T, src, dst *HarnessNode, fundingAmount uint64,
	assetID []byte) {

	assetIDStr := hex.EncodeToString(assetID)
	err := wait.NoError(func() error {
		a, err := getChannelCustomData(src, dst)
		if err != nil {
			return err
		}

		if a.AssetInfo.AssetGenesis.AssetID != assetIDStr {
			return fmt.Errorf("expected asset ID %s, got %s",
				assetIDStr, a.AssetInfo.AssetGenesis.AssetID)
		}
		if a.Capacity != fundingAmount {
			return fmt.Errorf("expected capacity %d, got %d",
				fundingAmount, a.Capacity)
		}

		return nil
	}, defaultTimeout)
	require.NoError(t, err)
}

func assertChannelKnown(t *testing.T, node *HarnessNode,
	chanPoint *lnrpc.ChannelPoint) {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	txid, err := chainhash.NewHash(chanPoint.GetFundingTxidBytes())
	require.NoError(t, err)
	targetChanPoint := fmt.Sprintf(
		"%v:%d", txid.String(), chanPoint.OutputIndex,
	)

	err = wait.NoError(func() error {
		graphResp, err := node.DescribeGraph(
			ctxt, &lnrpc.ChannelGraphRequest{},
		)
		if err != nil {
			return err
		}

		found := false
		for _, edge := range graphResp.Edges {
			if edge.ChanPoint == targetChanPoint {
				found = true
				break
			}
		}

		if !found {
			return fmt.Errorf("channel %v not found",
				targetChanPoint)
		}

		return nil
	}, defaultTimeout)
	require.NoError(t, err)
}

func getChannelCustomData(src, dst *HarnessNode) (*rfqmsg.JsonAssetChanInfo,
	error) {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	srcDestChannels, err := src.ListChannels(
		ctxt, &lnrpc.ListChannelsRequest{
			Peer: dst.PubKey[:],
		},
	)
	if err != nil {
		return nil, err
	}

	assetChannels := fn.Filter(func(c *lnrpc.Channel) bool {
		return len(c.CustomChannelData) > 0
	}, srcDestChannels.Channels)

	if len(assetChannels) != 1 {
		return nil, fmt.Errorf("expected 1 asset channel, got %d: %v",
			len(assetChannels), spew.Sdump(assetChannels))
	}

	targetChan := assetChannels[0]

	var assetData rfqmsg.JsonAssetChannel
	err = json.Unmarshal(targetChan.CustomChannelData, &assetData)
	if err != nil {
		return nil, fmt.Errorf("unable to unmarshal asset data: %w",
			err)
	}

	if len(assetData.Assets) != 1 {
		return nil, fmt.Errorf("expected 1 asset, got %d",
			len(assetData.Assets))
	}

	return &assetData.Assets[0], nil
}

func getAssetChannelBalance(t *testing.T, node *HarnessNode, assetID []byte,
	pending bool) (uint64, uint64) {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	balance, err := node.ChannelBalance(
		ctxt, &lnrpc.ChannelBalanceRequest{},
	)
	require.NoError(t, err)

	var assetBalance rfqmsg.JsonAssetChannelBalances
	err = json.Unmarshal(balance.CustomChannelData, &assetBalance)
	require.NoError(t, err)

	balances := assetBalance.OpenChannels
	if pending {
		balances = assetBalance.PendingChannels
	}

	var localSum, remoteSum uint64
	for assetIDString := range balances {
		if assetIDString != hex.EncodeToString(assetID) {
			continue
		}

		localSum += balances[assetIDString].LocalBalance
		remoteSum += balances[assetIDString].RemoteBalance
	}

	return localSum, remoteSum
}

func sendAssetKeySendPayment(t *testing.T, src, dst *HarnessNode, amt uint64,
	assetID []byte, btcAmt fn.Option[int64]) {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	srcTapd := newTapClient(t, src)

	// Now that we know the amount we need to send, we'll convert that into
	// an HTLC tlv, which'll be used as the first hop TLV value.
	encodeReq := &tchrpc.EncodeCustomRecordsRequest_RouterSendPayment{
		RouterSendPayment: &tchrpc.RouterSendPaymentData{
			AssetAmounts: map[string]uint64{
				hex.EncodeToString(assetID): amt,
			},
		},
	}
	encodeResp, err := srcTapd.EncodeCustomRecords(
		ctxt, &tchrpc.EncodeCustomRecordsRequest{
			Input: encodeReq,
		},
	)
	require.NoError(t, err)

	htlcCarrierAmt := btcAmt.UnwrapOr(500)
	sendKeySendPayment(
		t, src, dst, btcutil.Amount(htlcCarrierAmt),
		encodeResp.CustomRecords,
	)
}

func sendKeySendPayment(t *testing.T, src, dst *HarnessNode, amt btcutil.Amount,
	firstHopCustomRecords map[uint64][]byte) {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	// Read out the custom preimage for the keysend payment.
	var preimage lntypes.Preimage
	_, err := rand.Read(preimage[:])
	require.NoError(t, err)

	hash := preimage.Hash()

	// Set the preimage. If the user supplied a preimage with the data
	// flag, the preimage that is set here will be overwritten later.
	customRecords := make(map[uint64][]byte)
	customRecords[record.KeySendType] = preimage[:]

	req := &routerrpc.SendPaymentRequest{
		Dest:                  dst.PubKey[:],
		Amt:                   int64(amt),
		DestCustomRecords:     customRecords,
		FirstHopCustomRecords: firstHopCustomRecords,
		PaymentHash:           hash[:],
		TimeoutSeconds:        3,
	}

	stream, err := src.RouterClient.SendPaymentV2(ctxt, req)
	require.NoError(t, err)

	time.Sleep(time.Second)

	result, err := getPaymentResult(stream)
	require.NoError(t, err)
	require.Equal(t, lnrpc.Payment_SUCCEEDED, result.Status)
}

func createAndPayNormalInvoiceWithBtc(t *testing.T, src, dst *HarnessNode,
	amountSat btcutil.Amount) {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	expirySeconds := 10
	invoiceResp, err := dst.AddInvoice(ctxt, &lnrpc.Invoice{
		Value:  int64(amountSat),
		Memo:   "normal invoice",
		Expiry: int64(expirySeconds),
	})
	require.NoError(t, err)

	payInvoiceWithSatoshi(t, src, invoiceResp)
}

func createAndPayNormalInvoice(t *testing.T, src, rfqPeer, dst *HarnessNode,
	amountSat btcutil.Amount, assetID []byte) uint64 {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	expirySeconds := 10
	invoiceResp, err := dst.AddInvoice(ctxt, &lnrpc.Invoice{
		Value:  int64(amountSat),
		Memo:   "normal invoice",
		Expiry: int64(expirySeconds),
	})
	require.NoError(t, err)

	return payInvoiceWithAssets(t, src, rfqPeer, invoiceResp, assetID)
}

func payInvoiceWithSatoshi(t *testing.T, payer *HarnessNode,
	invoice *lnrpc.AddInvoiceResponse) {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	sendReq := &routerrpc.SendPaymentRequest{
		PaymentRequest:   invoice.PaymentRequest,
		TimeoutSeconds:   2,
		MaxShardSizeMsat: 80_000_000,
		FeeLimitMsat:     1_000_000,
	}
	stream, err := payer.RouterClient.SendPaymentV2(ctxt, sendReq)
	require.NoError(t, err)

	time.Sleep(time.Second)

	result, err := getPaymentResult(stream)
	require.NoError(t, err)
	require.Equal(t, lnrpc.Payment_SUCCEEDED, result.Status)
}

func payInvoiceWithAssets(t *testing.T, payer, rfqPeer *HarnessNode,
	invoice *lnrpc.AddInvoiceResponse, assetID []byte) uint64 {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	payerTapd := newTapClient(t, payer)

	decodedInvoice, err := payer.DecodePayReq(ctxt, &lnrpc.PayReqString{
		PayReq: invoice.PaymentRequest,
	})
	require.NoError(t, err)

	balancePayer, err := getChannelCustomData(payer, rfqPeer)
	require.NoError(t, err)

	timeoutSeconds := uint32(60)
	resp, err := payerTapd.AddAssetSellOrder(
		ctxb, &rfqrpc.AddAssetSellOrderRequest{
			AssetSpecifier: &rfqrpc.AssetSpecifier{
				Id: &rfqrpc.AssetSpecifier_AssetId{
					AssetId: assetID,
				},
			},
			// TODO(guggero): This should actually be the max BTC
			// amount (invoice amount plus fee limit) in
			// milli-satoshi, not the asset amount. Need to change
			// the whole RFQ API to do that though.
			MaxAssetAmount: balancePayer.LocalBalance,
			MinAsk:         uint64(decodedInvoice.NumMsat),
			Expiry:         uint64(decodedInvoice.Expiry),
			PeerPubKey:     rfqPeer.PubKey[:],
			TimeoutSeconds: timeoutSeconds,
		},
	)
	require.NoError(t, err)

	var acceptedQuote *rfqrpc.PeerAcceptedSellQuote
	switch r := resp.Response.(type) {
	case *rfqrpc.AddAssetSellOrderResponse_AcceptedQuote:
		acceptedQuote = r.AcceptedQuote

	case *rfqrpc.AddAssetSellOrderResponse_InvalidQuote:
		t.Fatalf("peer %v sent back an invalid quote, "+
			"status: %v", r.InvalidQuote.Peer,
			r.InvalidQuote.Status.String())

	case *rfqrpc.AddAssetSellOrderResponse_RejectedQuote:
		t.Fatalf("peer %v rejected the quote, code: %v, "+
			"error message: %v", r.RejectedQuote.Peer,
			r.RejectedQuote.ErrorCode, r.RejectedQuote.ErrorMessage)

	default:
		t.Fatalf("unexpected response type: %T", r)
	}

	mSatPerUnit := acceptedQuote.BidPrice
	numUnits := uint64(decodedInvoice.NumMsat) / mSatPerUnit

	t.Logf("Got quote for %v asset units at %v msat/unit from peer "+
		"%x with SCID %d", numUnits, mSatPerUnit, rfqPeer.PubKey[:],
		acceptedQuote.Scid)

	encodeReq := &tchrpc.EncodeCustomRecordsRequest_RouterSendPayment{
		RouterSendPayment: &tchrpc.RouterSendPaymentData{
			RfqId: acceptedQuote.Id,
		},
	}
	encodeResp, err := payerTapd.EncodeCustomRecords(
		ctxt, &tchrpc.EncodeCustomRecordsRequest{
			Input: encodeReq,
		},
	)
	require.NoError(t, err)

	sendReq := &routerrpc.SendPaymentRequest{
		PaymentRequest:        invoice.PaymentRequest,
		TimeoutSeconds:        2,
		FirstHopCustomRecords: encodeResp.CustomRecords,
		MaxShardSizeMsat:      80_000_000,
		FeeLimitMsat:          1_000_000,
	}
	stream, err := payer.RouterClient.SendPaymentV2(ctxt, sendReq)
	require.NoError(t, err)

	time.Sleep(time.Second)

	result, err := getPaymentResult(stream)
	require.NoError(t, err)
	require.Equal(t, lnrpc.Payment_SUCCEEDED, result.Status)

	return numUnits
}

func createAssetInvoice(t *testing.T, dstRfqPeer, dst *HarnessNode,
	assetAmount uint64, assetID []byte) *lnrpc.AddInvoiceResponse {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	timeoutSeconds := uint32(60)
	expiry := time.Now().Add(time.Duration(timeoutSeconds) * time.Second)

	t.Logf("Asking peer %x for quote to buy assets to receive for "+
		"invoice over %d units; waiting up to %ds",
		dstRfqPeer.PubKey[:], assetAmount, timeoutSeconds)

	dstTapd := newTapClient(t, dst)
	resp, err := dstTapd.AddAssetBuyOrder(
		ctxt, &rfqrpc.AddAssetBuyOrderRequest{
			AssetSpecifier: &rfqrpc.AssetSpecifier{
				Id: &rfqrpc.AssetSpecifier_AssetId{
					AssetId: assetID,
				},
			},
			MinAssetAmount: assetAmount,
			Expiry:         uint64(expiry.Unix()),
			PeerPubKey:     dstRfqPeer.PubKey[:],
			TimeoutSeconds: timeoutSeconds,
		},
	)
	require.NoError(t, err)

	var acceptedQuote *rfqrpc.PeerAcceptedBuyQuote
	switch r := resp.Response.(type) {
	case *rfqrpc.AddAssetBuyOrderResponse_AcceptedQuote:
		acceptedQuote = r.AcceptedQuote

	case *rfqrpc.AddAssetBuyOrderResponse_InvalidQuote:
		t.Fatalf("peer %v sent back an invalid quote, "+
			"status: %v", r.InvalidQuote.Peer,
			r.InvalidQuote.Status.String())

	case *rfqrpc.AddAssetBuyOrderResponse_RejectedQuote:
		t.Fatalf("peer %v rejected the quote, code: %v, "+
			"error message: %v", r.RejectedQuote.Peer,
			r.RejectedQuote.ErrorCode, r.RejectedQuote.ErrorMessage)

	default:
		t.Fatalf("unexpected response type: %T", r)
	}

	mSatPerUnit := acceptedQuote.AskPrice
	numMSats := lnwire.MilliSatoshi(assetAmount * mSatPerUnit)

	t.Logf("Got quote for %d sats at %v msat/unit from peer %x with SCID "+
		"%d", numMSats.ToSatoshis(), mSatPerUnit, dstRfqPeer.PubKey[:],
		acceptedQuote.Scid)

	peerChannels, err := dst.ListChannels(ctxt, &lnrpc.ListChannelsRequest{
		Peer: dstRfqPeer.PubKey[:],
	})
	require.NoError(t, err)
	require.Len(t, peerChannels.Channels, 1)
	peerChannel := peerChannels.Channels[0]

	ourPolicy, err := getOurPolicy(
		dst, peerChannel.ChanId, dstRfqPeer.PubKeyStr,
	)
	require.NoError(t, err)

	hopHint := &lnrpc.HopHint{
		NodeId:                    dstRfqPeer.PubKeyStr,
		ChanId:                    acceptedQuote.Scid,
		FeeBaseMsat:               uint32(ourPolicy.FeeBaseMsat),
		FeeProportionalMillionths: uint32(ourPolicy.FeeRateMilliMsat),
		CltvExpiryDelta:           ourPolicy.TimeLockDelta,
	}

	invoice := &lnrpc.Invoice{
		Memo: fmt.Sprintf("this is an asset invoice over "+
			"%d units", assetAmount),
		ValueMsat: int64(numMSats),
		Expiry:    int64(timeoutSeconds),
		RouteHints: []*lnrpc.RouteHint{
			{
				HopHints: []*lnrpc.HopHint{hopHint},
			},
		},
	}

	invoiceResp, err := dst.AddInvoice(ctxb, invoice)
	require.NoError(t, err)

	return invoiceResp
}

func closeAssetChannelAndAssert(t *harnessTest, net *NetworkHarness,
	local, remote *HarnessNode, chanPoint *lnrpc.ChannelPoint,
	assetID, groupID []byte, universeTap *tapClient, remoteBtcBalance,
	remoteAssetBalance, groupAsset bool) {

	closeStream, _, err := t.lndHarness.CloseChannel(
		local, chanPoint, false,
	)
	require.NoError(t.t, err)

	mineBlocks(t, net, 1, 1)

	closeUpdate, err := t.lndHarness.WaitForChannelClose(closeStream)
	require.NoError(t.t, err)

	closeTxid, err := chainhash.NewHash(closeUpdate.ClosingTxid)
	require.NoError(t.t, err)

	closeTransaction := t.lndHarness.Miner.GetRawTransaction(closeTxid)
	closeTx := closeTransaction.MsgTx()
	t.Logf("Channel closed with txid: %v", closeTxid)
	t.Logf("Close transaction: %v", spew.Sdump(closeTx))

	// With the channel closed, we'll now assert that the co-op close
	// transaction was inserted into the local universe.
	//
	// We expect that at most four outputs exist: one for the local asset
	// output, one for the remote asset output, one for the remote BTC
	// channel balance and one for the remote BTC channel balance.
	//
	// Those outputs are only present if the respective party has a
	// non-dust balance.
	numOutputs := 2
	additionalOutputs := 1
	if remoteBtcBalance {
		numOutputs++
	}
	if remoteAssetBalance {
		numOutputs++
		additionalOutputs++
	}

	require.Len(t.t, closeTx.TxOut, numOutputs)

	outIdx := 0
	dummyAmt := int64(1000)
	require.LessOrEqual(t.t, closeTx.TxOut[outIdx].Value, dummyAmt)

	if remoteAssetBalance {
		outIdx++
		require.LessOrEqual(t.t, closeTx.TxOut[outIdx].Value, dummyAmt)
	}

	// We also require there to be at most two additional outputs, one for
	// each of the asset outputs with balance.
	require.Len(t.t, closeUpdate.AdditionalOutputs, additionalOutputs)

	var remoteCloseOut *lnrpc.CloseOutput
	if remoteBtcBalance {
		// The remote node has received a couple of HTLCs with an above
		// dust value, so it should also have accumulated a non-dust
		// balance, even after subtracting 1k sats for the asset output.
		remoteCloseOut = closeUpdate.RemoteCloseOutput
		require.NotNil(t.t, remoteCloseOut)

		outIdx++
		require.EqualValues(
			t.t, remoteCloseOut.AmountSat-dummyAmt,
			closeTx.TxOut[outIdx].Value,
		)
	} else if remoteAssetBalance {
		// The remote node has received a couple of HTLCs but not enough
		// to go above dust. So it should still have an asset balance
		// that we can verify.
		remoteCloseOut = closeUpdate.RemoteCloseOutput
		require.NotNil(t.t, remoteCloseOut)
	}

	// The local node should have received the local BTC balance minus the
	// TX fees and 1k sats for the asset output.
	localCloseOut := closeUpdate.LocalCloseOutput
	require.NotNil(t.t, localCloseOut)
	outIdx++
	require.Greater(
		t.t, closeTx.TxOut[outIdx].Value,
		localCloseOut.AmountSat-dummyAmt,
	)

	// Find out which of the additional outputs is the local one and which
	// is the remote.
	localAuxOut := closeUpdate.AdditionalOutputs[0]

	var remoteAuxOut *lnrpc.CloseOutput
	if remoteAssetBalance {
		remoteAuxOut = closeUpdate.AdditionalOutputs[1]
	}
	if !localAuxOut.IsLocal && remoteAuxOut != nil {
		localAuxOut, remoteAuxOut = remoteAuxOut, localAuxOut
	}

	// The first two transaction outputs should be the additional outputs
	// as identified by the pk scripts in the close update.
	localAssetIndex, remoteAssetIndex := 1, 0
	if bytes.Equal(closeTx.TxOut[0].PkScript, localAuxOut.PkScript) {
		localAssetIndex, remoteAssetIndex = 0, 1
	}

	if remoteAuxOut != nil {
		require.Equal(
			t.t, remoteAuxOut.PkScript,
			closeTx.TxOut[remoteAssetIndex].PkScript,
		)
	}

	require.Equal(
		t.t, localAuxOut.PkScript,
		closeTx.TxOut[localAssetIndex].PkScript,
	)

	// We now verify the arrival of the local balance asset proof at the
	// universe server.
	var localAssetCloseOut rfqmsg.JsonCloseOutput
	err = json.Unmarshal(
		localCloseOut.CustomChannelData, &localAssetCloseOut,
	)
	require.NoError(t.t, err)

	for assetIDStr, scriptKeyStr := range localAssetCloseOut.ScriptKeys {
		scriptKeyBytes, err := hex.DecodeString(scriptKeyStr)
		require.NoError(t.t, err)

		require.Equal(t.t, hex.EncodeToString(assetID), assetIDStr)

		var a *taprpc.Asset
		if groupAsset {
			a = assertUniverseGroupProofExists(
				t.t, universeTap, groupID, scriptKeyBytes,
				fmt.Sprintf(
					"%v:%v", closeTxid, localAssetIndex,
				),
			)
		} else {
			a = assertUniverseProofExists(
				t.t, universeTap, assetID, scriptKeyBytes,
				fmt.Sprintf(
					"%v:%v", closeTxid, localAssetIndex,
				),
			)
		}

		localTapd := newTapClient(t.t, local)

		scriptKey, err := btcec.ParsePubKey(scriptKeyBytes)
		require.NoError(t.t, err)
		assertAssetExists(
			t.t, localTapd, assetID, a.Amount, scriptKey, true,
			true, false,
		)
	}

	// If there is no remote asset balance, we're done.
	if !remoteAssetBalance {
		return
	}

	// At this point the remote close output should be defined, otherwise
	// something went wrong.
	require.NotNil(t.t, remoteCloseOut)

	// And then we verify the arrival of the remote balance asset proof at
	// the universe server as well.
	var remoteAssetCloseOut rfqmsg.JsonCloseOutput
	err = json.Unmarshal(
		remoteCloseOut.CustomChannelData, &remoteAssetCloseOut,
	)
	require.NoError(t.t, err)

	for assetIDStr, scriptKeyStr := range remoteAssetCloseOut.ScriptKeys {
		scriptKeyBytes, err := hex.DecodeString(scriptKeyStr)
		require.NoError(t.t, err)

		require.Equal(t.t, hex.EncodeToString(assetID), assetIDStr)

		var a *taprpc.Asset
		if groupAsset {
			a = assertUniverseGroupProofExists(
				t.t, universeTap, groupID, scriptKeyBytes,
				fmt.Sprintf(
					"%v:%v", closeTxid, remoteAssetIndex,
				),
			)
		} else {
			a = assertUniverseProofExists(
				t.t, universeTap, assetID, scriptKeyBytes,
				fmt.Sprintf(
					"%v:%v", closeTxid, remoteAssetIndex,
				),
			)
		}

		remoteTapd := newTapClient(t.t, remote)

		scriptKey, err := btcec.ParsePubKey(scriptKeyBytes)
		require.NoError(t.t, err)
		assertAssetExists(
			t.t, remoteTapd, assetID, a.Amount, scriptKey, true,
			true, false,
		)
	}
}

type tapClient struct {
	node *HarnessNode
	lnd  *rpc.HarnessRPC
	taprpc.TaprootAssetsClient
	assetwalletrpc.AssetWalletClient
	tapdevrpc.TapDevClient
	mintrpc.MintClient
	rfqrpc.RfqClient
	tchrpc.TaprootAssetChannelsClient
	universerpc.UniverseClient
}

func newTapClient(t *testing.T, node *HarnessNode) *tapClient {
	cfg := node.Cfg
	superMacFile, err := bakeSuperMacaroon(cfg, false)
	require.NoError(t, err)

	t.Cleanup(func() {
		require.NoError(t, os.Remove(superMacFile))
	})

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	rawConn, err := connectRPCWithMac(
		ctxt, cfg.LitAddr(), cfg.LitTLSCertPath, superMacFile,
	)
	require.NoError(t, err)

	t.Cleanup(func() {
		_ = rawConn.Close()
	})

	assetsClient := taprpc.NewTaprootAssetsClient(rawConn)
	assetWalletClient := assetwalletrpc.NewAssetWalletClient(rawConn)
	devClient := tapdevrpc.NewTapDevClient(rawConn)
	mintMintClient := mintrpc.NewMintClient(rawConn)
	rfqClient := rfqrpc.NewRfqClient(rawConn)
	tchClient := tchrpc.NewTaprootAssetChannelsClient(rawConn)
	universeClient := universerpc.NewUniverseClient(rawConn)

	return &tapClient{
		node:                       node,
		TaprootAssetsClient:        assetsClient,
		AssetWalletClient:          assetWalletClient,
		TapDevClient:               devClient,
		MintClient:                 mintMintClient,
		RfqClient:                  rfqClient,
		TaprootAssetChannelsClient: tchClient,
		UniverseClient:             universeClient,
	}
}

func connectRPCWithMac(ctx context.Context, hostPort, tlsCertPath,
	macFilePath string) (*grpc.ClientConn, error) {

	tlsCreds, err := credentials.NewClientTLSFromFile(tlsCertPath, "")
	if err != nil {
		return nil, err
	}

	opts := []grpc.DialOption{
		grpc.WithBlock(),
		grpc.WithTransportCredentials(tlsCreds),
	}

	macOption, err := readMacaroon(macFilePath)
	if err != nil {
		return nil, err
	}

	opts = append(opts, macOption)

	return grpc.DialContext(ctx, hostPort, opts...)
}

func getOurPolicy(node *HarnessNode, chanID uint64,
	remotePubKey string) (*lnrpc.RoutingPolicy, error) {

	ctxb := context.Background()
	edge, err := node.GetChanInfo(ctxb, &lnrpc.ChanInfoRequest{
		ChanId: chanID,
	})
	if err != nil {
		return nil, fmt.Errorf("unable to fetch channel: %w", err)
	}

	policy := edge.Node1Policy
	if edge.Node1Pub == remotePubKey {
		policy = edge.Node2Policy
	}

	return policy, nil
}

func assertAssetBalance(t *testing.T, client *tapClient, assetID []byte,
	expectedBalance uint64) {

	t.Helper()

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, shortTimeout)
	defer cancel()

	req := &taprpc.ListBalancesRequest{
		GroupBy: &taprpc.ListBalancesRequest_AssetId{
			AssetId: true,
		},
	}

	err := wait.NoError(func() error {
		assetIDBalances, err := client.ListBalances(ctxt, req)
		if err != nil {
			return err
		}

		for _, balance := range assetIDBalances.AssetBalances {
			if !bytes.Equal(balance.AssetGenesis.AssetId, assetID) {
				continue
			}

			if expectedBalance != balance.Balance {
				return fmt.Errorf("expected balance %d, got %d",
					expectedBalance, balance.Balance)
			}
		}

		return nil
	}, shortTimeout)
	if err != nil {
		r, err2 := client.ListAssets(ctxb, &taprpc.ListAssetRequest{})
		require.NoError(t, err2)

		t.Logf("Failed to assert expected balance of %d, current "+
			"assets: %v", expectedBalance, toProtoJSON(t, r))
		t.Fatalf("Failed to assert balance: %v", err)
	}
}

func assertNumAssetOutputs(t *testing.T, client *tapClient, assetID []byte,
	numPieces int) {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, shortTimeout)
	defer cancel()

	resp, err := client.ListAssets(ctxt, &taprpc.ListAssetRequest{
		IncludeLeased: true,
	})
	require.NoError(t, err)

	var outputs []*taprpc.Asset
	for _, a := range resp.Assets {
		if !bytes.Equal(a.AssetGenesis.AssetId, assetID) {
			continue
		}

		outputs = append(outputs, a)
	}

	require.Len(t, outputs, numPieces)
}

func assertAssetExists(t *testing.T, client *tapClient, assetID []byte,
	amount uint64, scriptKey *btcec.PublicKey, scriptKeyLocal,
	scriptKeyKnown, scriptKeyHasScript bool) *taprpc.Asset {

	t.Helper()

	var a *taprpc.Asset
	err := wait.NoError(func() error {
		var err error
		a, err = assetExists(
			t, client, assetID, amount, scriptKey, scriptKeyLocal,
			scriptKeyKnown, scriptKeyHasScript,
		)
		return err
	}, shortTimeout)
	require.NoError(t, err)

	return a
}

func assetExists(t *testing.T, client *tapClient, assetID []byte,
	amount uint64, scriptKey *btcec.PublicKey, scriptKeyLocal,
	scriptKeyKnown, scriptKeyHasScript bool) (*taprpc.Asset, error) {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, shortTimeout)
	defer cancel()

	resp, err := client.ListAssets(ctxt, &taprpc.ListAssetRequest{
		IncludeLeased: true,
	})
	if err != nil {
		return nil, err
	}

	for _, a := range resp.Assets {
		if !bytes.Equal(a.AssetGenesis.AssetId, assetID) {
			continue
		}

		if amount != a.Amount {
			continue
		}

		if scriptKey != nil {
			xOnlyKey, _ := schnorr.ParsePubKey(
				schnorr.SerializePubKey(scriptKey),
			)
			xOnlyKeyBytes := xOnlyKey.SerializeCompressed()
			if !bytes.Equal(xOnlyKeyBytes, a.ScriptKey) {
				continue
			}
		}

		if scriptKeyLocal != a.ScriptKeyIsLocal {
			continue
		}

		if scriptKeyKnown != a.ScriptKeyDeclaredKnown {
			continue
		}

		if scriptKeyHasScript != a.ScriptKeyHasScriptPath {
			continue
		}

		// Success, we have found the asset we're looking for.
		return a, nil
	}

	return nil, fmt.Errorf("asset with given criteria (amount=%d) not "+
		"found in list, got: %v", amount, toProtoJSON(t, resp))
}

func logBalance(t *testing.T, nodes []*HarnessNode, assetID []byte,
	occasion string) {

	t.Helper()

	for _, node := range nodes {
		local, remote := getAssetChannelBalance(t, node, assetID, false)
		t.Logf("%-7s balance: local=%-9d remote=%-9d (%v)",
			node.Cfg.Name, local, remote, occasion)
	}
}

// readMacaroon tries to read the macaroon file at the specified path and create
// gRPC dial options from it.
func readMacaroon(macPath string) (grpc.DialOption, error) {
	// Load the specified macaroon file.
	macBytes, err := os.ReadFile(macPath)
	if err != nil {
		return nil, fmt.Errorf("unable to read macaroon path : %w", err)
	}

	return macFromBytes(macBytes)
}

// macFromBytes returns a macaroon from the given byte slice.
func macFromBytes(macBytes []byte) (grpc.DialOption, error) {
	mac := &macaroon.Macaroon{}
	if err := mac.UnmarshalBinary(macBytes); err != nil {
		return nil, fmt.Errorf("unable to decode macaroon: %w", err)
	}

	// Now we append the macaroon credentials to the dial options.
	cred, err := macaroons.NewMacaroonCredential(mac)
	if err != nil {
		return nil, fmt.Errorf("error creating macaroon credential: %w",
			err)
	}
	return grpc.WithPerRPCCredentials(cred), nil
}

func toJSON(t *testing.T, v interface{}) string {
	t.Helper()

	b, err := json.MarshalIndent(v, "", "  ")
	require.NoError(t, err)

	return string(b)
}

func toProtoJSON(t *testing.T, resp proto.Message) string {
	jsonBytes, err := taprpc.ProtoJSONMarshalOpts.Marshal(resp)
	require.NoError(t, err)

	return string(jsonBytes)
}
