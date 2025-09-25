package itest

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/btcsuite/btcd/btcutil"
	"github.com/btcsuite/btcd/chaincfg/chainhash"
	"github.com/btcsuite/btcd/wire"
	"github.com/davecgh/go-spew/spew"
	taprootassets "github.com/lightninglabs/taproot-assets"
	"github.com/lightninglabs/taproot-assets/asset"
	tapfn "github.com/lightninglabs/taproot-assets/fn"
	"github.com/lightninglabs/taproot-assets/itest"
	"github.com/lightninglabs/taproot-assets/proof"
	"github.com/lightninglabs/taproot-assets/rfq"
	"github.com/lightninglabs/taproot-assets/rfqmath"
	"github.com/lightninglabs/taproot-assets/rfqmsg"
	"github.com/lightninglabs/taproot-assets/rpcutils"
	"github.com/lightninglabs/taproot-assets/tapfreighter"
	"github.com/lightninglabs/taproot-assets/taprpc"
	"github.com/lightninglabs/taproot-assets/taprpc/assetwalletrpc"
	"github.com/lightninglabs/taproot-assets/taprpc/authmailboxrpc"
	"github.com/lightninglabs/taproot-assets/taprpc/mintrpc"
	"github.com/lightninglabs/taproot-assets/taprpc/rfqrpc"
	tchrpc "github.com/lightninglabs/taproot-assets/taprpc/tapchannelrpc"
	"github.com/lightninglabs/taproot-assets/taprpc/tapdevrpc"
	"github.com/lightninglabs/taproot-assets/taprpc/universerpc"
	"github.com/lightninglabs/taproot-assets/tapscript"
	"github.com/lightningnetwork/lnd/fn"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lnrpc/invoicesrpc"
	"github.com/lightningnetwork/lnd/lnrpc/routerrpc"
	"github.com/lightningnetwork/lnd/lnrpc/walletrpc"
	"github.com/lightningnetwork/lnd/lntest"
	"github.com/lightningnetwork/lnd/lntest/rpc"
	"github.com/lightningnetwork/lnd/lntest/wait"
	"github.com/lightningnetwork/lnd/lntypes"
	"github.com/lightningnetwork/lnd/lnwire"
	"github.com/lightningnetwork/lnd/macaroons"
	"github.com/lightningnetwork/lnd/record"
	"github.com/stretchr/testify/require"
	"golang.org/x/exp/maps"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"gopkg.in/macaroon.v2"
)

// PaymentTimeout is the default payment timeout we use in our tests.
const (
	PaymentTimeout       = 12 * time.Second
	DefaultPushSat int64 = 1062
)

// nolint: lll
var (
	failureNoBalance        = lnrpc.PaymentFailureReason_FAILURE_REASON_INSUFFICIENT_BALANCE
	failureNoRoute          = lnrpc.PaymentFailureReason_FAILURE_REASON_NO_ROUTE
	failureIncorrectDetails = lnrpc.PaymentFailureReason_FAILURE_REASON_INCORRECT_PAYMENT_DETAILS
	failureTimeout          = lnrpc.PaymentFailureReason_FAILURE_REASON_TIMEOUT
	failureNone             = lnrpc.PaymentFailureReason_FAILURE_REASON_NONE
)

// itestNode is a wrapper around a lnd/tapd node.
type itestNode struct {
	Lnd  *HarnessNode
	Tapd *tapClient
}

// multiRfqNodes contains all the itest nodes that are required to set up the
// multi RFQ network topology.
type multiRfqNodes struct {
	charlie, dave, erin, fabia, yara, george itestNode
	universeTap                              *tapClient
}

// createTestMultiRFQAssetNetwork creates a lightning network topology which
// consists of both bitcoin and asset channels. It focuses on the property of
// having multiple channels available on both the sender and receiver side.
// The George node is using a way different oracle that provides asset rates
// that fall outside of the configured tolerance bounds, leading to RFQ
// negotiation failures.
//
// The topology we are going for looks like the following:
//
//	   /---[sats]--> Erin --[assets]--\
//	  /                                \
//	 /                                  \
//	/                                    \
//
// Charlie  -----[sats]--> Dave --[assets]--> Fabia
//
//	\                                     / /
//	 \                                   / /
//	  \---[sats]--> Yara --[assets]-----/ /
//	   \                                 /
//	    \                               /
//	     \--[sats]-> George --[assets]-/
func createTestMultiRFQAssetNetwork(t *harnessTest, net *NetworkHarness,
	nodes multiRfqNodes, mintedAsset *taprpc.Asset, assetSendAmount,
	fundingAmount uint64, pushSat int64) (*lnrpc.ChannelPoint,
	*lnrpc.ChannelPoint, *lnrpc.ChannelPoint) {

	charlie, charlieTap := nodes.charlie.Lnd, nodes.charlie.Tapd
	dave, daveTap := nodes.dave.Lnd, nodes.dave.Tapd
	erin, erinTap := nodes.erin.Lnd, nodes.erin.Tapd
	_, fabiaTap := nodes.fabia.Lnd, nodes.fabia.Tapd
	yara, yaraTap := nodes.yara.Lnd, nodes.yara.Tapd
	george, georgeTap := nodes.george.Lnd, nodes.george.Tapd
	universeTap := nodes.universeTap

	// Let's open the normal sats channels between Charlie and the routing
	// peers.
	_ = openChannelAndAssert(
		t, net, charlie, erin, lntest.OpenChannelParams{
			Amt:         10_000_000,
			SatPerVByte: 5,
		},
	)

	_ = openChannelAndAssert(
		t, net, charlie, dave, lntest.OpenChannelParams{
			Amt:         10_000_000,
			SatPerVByte: 5,
		},
	)

	_ = openChannelAndAssert(
		t, net, charlie, yara, lntest.OpenChannelParams{
			Amt:         10_000_000,
			SatPerVByte: 5,
		},
	)

	_ = openChannelAndAssert(
		t, net, charlie, george, lntest.OpenChannelParams{
			Amt:         10_000_000,
			SatPerVByte: 5,
		},
	)

	ctxb := context.Background()
	assetID := mintedAsset.AssetGenesis.AssetId
	var groupKey []byte
	if mintedAsset.AssetGroup != nil {
		groupKey = mintedAsset.AssetGroup.TweakedGroupKey
	}

	fundingScriptTree := tapscript.NewChannelFundingScriptTree()
	fundingScriptKey := fundingScriptTree.TaprootKey
	fundingScriptTreeBytes := fundingScriptKey.SerializeCompressed()

	// We need to send some assets to Dave, so he can fund an asset channel
	// with Fabia.
	daveAddr, err := daveTap.NewAddr(ctxb, &taprpc.NewAddrRequest{
		Amt:     assetSendAmount,
		AssetId: assetID,
		ProofCourierAddr: fmt.Sprintf(
			"%s://%s", proof.UniverseRpcCourierType,
			charlieTap.node.Cfg.LitAddr(),
		),
	})
	require.NoError(t.t, err)

	t.Logf("Sending %v asset units to Dave...", assetSendAmount)

	// Send the assets to Dave.
	itest.AssertAddrCreated(t.t, daveTap, mintedAsset, daveAddr)
	sendResp, err := charlieTap.SendAsset(ctxb, &taprpc.SendAssetRequest{
		TapAddrs: []string{daveAddr.Encoded},
	})
	require.NoError(t.t, err)
	itest.ConfirmAndAssertOutboundTransfer(
		t.t, t.lndHarness.Miner.Client, charlieTap, sendResp, assetID,
		[]uint64{mintedAsset.Amount - assetSendAmount, assetSendAmount},
		0, 1,
	)
	itest.AssertNonInteractiveRecvComplete(t.t, daveTap, 1)

	// We need to send some assets to Erin, so he can fund an asset channel
	// with Fabia.
	erinAddr, err := erinTap.NewAddr(ctxb, &taprpc.NewAddrRequest{
		Amt:     assetSendAmount,
		AssetId: assetID,
		ProofCourierAddr: fmt.Sprintf(
			"%s://%s", proof.UniverseRpcCourierType,
			charlieTap.node.Cfg.LitAddr(),
		),
	})
	require.NoError(t.t, err)

	t.Logf("Sending %v asset units to Erin...", assetSendAmount)

	// Send the assets to Erin.
	itest.AssertAddrCreated(t.t, erinTap, mintedAsset, erinAddr)
	sendResp, err = charlieTap.SendAsset(ctxb, &taprpc.SendAssetRequest{
		TapAddrs: []string{erinAddr.Encoded},
	})
	require.NoError(t.t, err)
	itest.ConfirmAndAssertOutboundTransfer(
		t.t, t.lndHarness.Miner.Client, charlieTap, sendResp, assetID,
		[]uint64{
			mintedAsset.Amount - 2*assetSendAmount, assetSendAmount,
		}, 1, 2,
	)
	itest.AssertNonInteractiveRecvComplete(t.t, erinTap, 1)

	// We need to send some assets to Yara, so he can fund an asset channel
	// with Fabia.
	yaraAddr, err := yaraTap.NewAddr(ctxb, &taprpc.NewAddrRequest{
		Amt:     assetSendAmount,
		AssetId: assetID,
		ProofCourierAddr: fmt.Sprintf(
			"%s://%s", proof.UniverseRpcCourierType,
			charlieTap.node.Cfg.LitAddr(),
		),
	})
	require.NoError(t.t, err)

	t.Logf("Sending %v asset units to Yara...", assetSendAmount)

	// Send the assets to Yara.
	itest.AssertAddrCreated(t.t, yaraTap, mintedAsset, yaraAddr)
	sendResp, err = charlieTap.SendAsset(ctxb, &taprpc.SendAssetRequest{
		TapAddrs: []string{yaraAddr.Encoded},
	})
	require.NoError(t.t, err)
	itest.ConfirmAndAssertOutboundTransfer(
		t.t, t.lndHarness.Miner.Client, charlieTap, sendResp, assetID,
		[]uint64{
			mintedAsset.Amount - 3*assetSendAmount, assetSendAmount,
		}, 2, 3,
	)
	itest.AssertNonInteractiveRecvComplete(t.t, yaraTap, 1)

	// We need to send some assets to George, so he can fund an asset
	// channel with Fabia.
	georgeAddr, err := georgeTap.NewAddr(ctxb, &taprpc.NewAddrRequest{
		Amt:     assetSendAmount,
		AssetId: assetID,
		ProofCourierAddr: fmt.Sprintf(
			"%s://%s", proof.UniverseRpcCourierType,
			charlieTap.node.Cfg.LitAddr(),
		),
	})
	require.NoError(t.t, err)

	t.Logf("Sending %v asset units to George...", assetSendAmount)

	// Send the assets to George.
	itest.AssertAddrCreated(t.t, georgeTap, mintedAsset, georgeAddr)
	sendResp, err = charlieTap.SendAsset(ctxb, &taprpc.SendAssetRequest{
		TapAddrs: []string{georgeAddr.Encoded},
	})
	require.NoError(t.t, err)
	itest.ConfirmAndAssertOutboundTransfer(
		t.t, t.lndHarness.Miner.Client, charlieTap, sendResp, assetID,
		[]uint64{
			mintedAsset.Amount - 4*assetSendAmount, assetSendAmount,
		}, 3, 4,
	)
	itest.AssertNonInteractiveRecvComplete(t.t, georgeTap, 1)

	// We fund the Dave->Fabia channel.
	fundRespDF, err := daveTap.FundChannel(
		ctxb, &tchrpc.FundChannelRequest{
			AssetAmount:        fundingAmount,
			AssetId:            assetID,
			PeerPubkey:         fabiaTap.node.PubKey[:],
			FeeRateSatPerVbyte: 5,
			PushSat:            pushSat,
		},
	)
	require.NoError(t.t, err)
	t.Logf("Funded channel between Dave and Fabia: %v", fundRespDF)

	// We fund the Erin->Fabia channel.
	fundRespEF, err := erinTap.FundChannel(
		ctxb, &tchrpc.FundChannelRequest{
			AssetAmount:        fundingAmount,
			AssetId:            assetID,
			PeerPubkey:         fabiaTap.node.PubKey[:],
			FeeRateSatPerVbyte: 5,
			PushSat:            pushSat,
		},
	)
	require.NoError(t.t, err)
	t.Logf("Funded channel between Erin and Fabia: %v", fundRespEF)

	// We fund the Yara->Fabia channel.
	fundRespYF, err := yaraTap.FundChannel(
		ctxb, &tchrpc.FundChannelRequest{
			AssetAmount:        fundingAmount,
			AssetId:            assetID,
			PeerPubkey:         fabiaTap.node.PubKey[:],
			FeeRateSatPerVbyte: 5,
			PushSat:            pushSat,
		},
	)
	require.NoError(t.t, err)
	t.Logf("Funded channel between Yara and Fabia: %v", fundRespYF)

	// We fund the George->Fabia channel.
	fundRespGF, err := georgeTap.FundChannel(
		ctxb, &tchrpc.FundChannelRequest{
			AssetAmount:        fundingAmount,
			AssetId:            assetID,
			PeerPubkey:         fabiaTap.node.PubKey[:],
			FeeRateSatPerVbyte: 5,
			PushSat:            pushSat,
		},
	)
	require.NoError(t.t, err)
	t.Logf("Funded channel between George and Fabia: %v", fundRespGF)

	// Make sure the pending channel shows up in the list and has the
	// custom records set as JSON.
	assertPendingChannels(
		t.t, daveTap.node, mintedAsset, 1, fundingAmount, 0,
	)
	assertPendingChannels(
		t.t, erinTap.node, mintedAsset, 1, fundingAmount, 0,
	)
	assertPendingChannels(
		t.t, yaraTap.node, mintedAsset, 1, fundingAmount, 0,
	)
	assertPendingChannels(
		t.t, georgeTap.node, mintedAsset, 1, fundingAmount, 0,
	)

	// Now that we've looked at the pending channels, let's actually confirm
	// all three of them.
	mineBlocks(t, net, 6, 4)

	// We'll be tracking the expected asset balances throughout the test, so
	// we can assert it after each action.
	charlieAssetBalance := mintedAsset.Amount - 4*assetSendAmount
	daveAssetBalance := assetSendAmount - fundingAmount
	erinAssetBalance := assetSendAmount - fundingAmount
	yaraAssetBalance := assetSendAmount - fundingAmount
	georgeAssetBalance := assetSendAmount - fundingAmount

	itest.AssertBalances(
		t.t, charlieTap, charlieAssetBalance,
		itest.WithAssetID(assetID), itest.WithNumUtxos(1),
	)

	itest.AssertBalances(
		t.t, daveTap, daveAssetBalance, itest.WithAssetID(assetID),
	)

	itest.AssertBalances(
		t.t, erinTap, erinAssetBalance, itest.WithAssetID(assetID),
	)

	itest.AssertBalances(
		t.t, yaraTap, yaraAssetBalance, itest.WithAssetID(assetID),
	)

	itest.AssertBalances(
		t.t, georgeTap, georgeAssetBalance, itest.WithAssetID(assetID),
	)

	// Assert that the proofs for both channels has been uploaded to the
	// designated Universe server.
	assertUniverseProofExists(
		t.t, universeTap, assetID, groupKey, fundingScriptTreeBytes,
		fmt.Sprintf("%v:%v", fundRespDF.Txid, fundRespDF.OutputIndex),
	)
	assertUniverseProofExists(
		t.t, universeTap, assetID, groupKey, fundingScriptTreeBytes,
		fmt.Sprintf("%v:%v", fundRespEF.Txid, fundRespEF.OutputIndex),
	)
	assertUniverseProofExists(
		t.t, universeTap, assetID, groupKey, fundingScriptTreeBytes,
		fmt.Sprintf("%v:%v", fundRespYF.Txid, fundRespYF.OutputIndex),
	)
	assertUniverseProofExists(
		t.t, universeTap, assetID, groupKey, fundingScriptTreeBytes,
		fmt.Sprintf("%v:%v", fundRespGF.Txid, fundRespGF.OutputIndex),
	)

	return nil, nil, nil
}

// createTestAssetNetwork sends asset funds from Charlie to Dave and Erin, so
// they can fund asset channels with Yara and Fabia, respectively. So the asset
// channels created are Charlie->Dave, Dave->Yara, Erin->Fabia. The channels
// are then confirmed and balances asserted.
func createTestAssetNetwork(t *harnessTest, net *NetworkHarness, charlieTap,
	daveTap, erinTap, fabiaTap, yaraTap, universeTap *tapClient,
	mintedAsset *taprpc.Asset, assetSendAmount, charlieFundingAmount,
	daveFundingAmount,
	erinFundingAmount uint64, pushSat int64) (*lnrpc.ChannelPoint,
	*lnrpc.ChannelPoint, *lnrpc.ChannelPoint) {

	ctxb := context.Background()
	assetID := mintedAsset.AssetGenesis.AssetId
	var groupKey []byte
	if mintedAsset.AssetGroup != nil {
		groupKey = mintedAsset.AssetGroup.TweakedGroupKey
	}

	fundingScriptTree := tapscript.NewChannelFundingScriptTree()
	fundingScriptKey := fundingScriptTree.TaprootKey
	fundingScriptKeyBytes := fundingScriptKey.SerializeCompressed()

	// We need to send some assets to Dave, so he can fund an asset channel
	// with Yara.
	daveAddr, err := daveTap.NewAddr(ctxb, &taprpc.NewAddrRequest{
		Amt:     assetSendAmount,
		AssetId: assetID,
		ProofCourierAddr: fmt.Sprintf(
			"%s://%s", proof.UniverseRpcCourierType,
			charlieTap.node.Cfg.LitAddr(),
		),
	})
	require.NoError(t.t, err)

	t.Logf("Sending %v asset units to Dave...", assetSendAmount)

	// Send the assets to Dave.
	itest.AssertAddrCreated(t.t, daveTap, mintedAsset, daveAddr)
	sendResp, err := charlieTap.SendAsset(ctxb, &taprpc.SendAssetRequest{
		TapAddrs: []string{daveAddr.Encoded},
	})
	require.NoError(t.t, err)
	itest.ConfirmAndAssertOutboundTransfer(
		t.t, t.lndHarness.Miner.Client, charlieTap, sendResp, assetID,
		[]uint64{mintedAsset.Amount - assetSendAmount, assetSendAmount},
		0, 1,
	)
	itest.AssertNonInteractiveRecvComplete(t.t, daveTap, 1)

	// We need to send some assets to Erin, so he can fund an asset channel
	// with Fabia.
	erinAddr, err := erinTap.NewAddr(ctxb, &taprpc.NewAddrRequest{
		Amt:     assetSendAmount,
		AssetId: assetID,
		ProofCourierAddr: fmt.Sprintf(
			"%s://%s", proof.UniverseRpcCourierType,
			charlieTap.node.Cfg.LitAddr(),
		),
	})
	require.NoError(t.t, err)

	t.Logf("Sending %v asset units to Erin...", assetSendAmount)

	// Send the assets to Erin.
	itest.AssertAddrCreated(t.t, erinTap, mintedAsset, erinAddr)
	sendResp, err = charlieTap.SendAsset(ctxb, &taprpc.SendAssetRequest{
		TapAddrs: []string{erinAddr.Encoded},
	})
	require.NoError(t.t, err)
	itest.ConfirmAndAssertOutboundTransfer(
		t.t, t.lndHarness.Miner.Client, charlieTap, sendResp, assetID,
		[]uint64{
			mintedAsset.Amount - 2*assetSendAmount, assetSendAmount,
		}, 1, 2,
	)
	itest.AssertNonInteractiveRecvComplete(t.t, erinTap, 1)

	t.Logf("Opening asset channels...")

	// The first channel we create has a push amount, so Charlie can receive
	// payments immediately and not run into the channel reserve issue.
	fundRespCD, err := charlieTap.FundChannel(
		ctxb, &tchrpc.FundChannelRequest{
			AssetAmount:        charlieFundingAmount,
			AssetId:            assetID,
			PeerPubkey:         daveTap.node.PubKey[:],
			FeeRateSatPerVbyte: 5,
			PushSat:            pushSat,
		},
	)
	require.NoError(t.t, err)
	t.Logf("Funded channel between Charlie and Dave: %v", fundRespCD)

	fundRespDY, err := daveTap.FundChannel(
		ctxb, &tchrpc.FundChannelRequest{
			AssetAmount:        daveFundingAmount,
			AssetId:            assetID,
			PeerPubkey:         yaraTap.node.PubKey[:],
			FeeRateSatPerVbyte: 5,
		},
	)
	require.NoError(t.t, err)
	t.Logf("Funded channel between Dave and Yara: %v", fundRespDY)

	fundRespEF, err := erinTap.FundChannel(
		ctxb, &tchrpc.FundChannelRequest{
			AssetAmount:        erinFundingAmount,
			AssetId:            assetID,
			PeerPubkey:         fabiaTap.node.PubKey[:],
			FeeRateSatPerVbyte: 5,
			PushSat:            pushSat,
		},
	)
	require.NoError(t.t, err)
	t.Logf("Funded channel between Erin and Fabia: %v", fundRespEF)

	// Make sure the pending channel shows up in the list and has the
	// custom records set as JSON.
	assertPendingChannels(
		t.t, charlieTap.node, mintedAsset, 1, charlieFundingAmount, 0,
	)
	assertPendingChannels(
		t.t, daveTap.node, mintedAsset, 2, daveFundingAmount,
		charlieFundingAmount,
	)
	assertPendingChannels(
		t.t, erinTap.node, mintedAsset, 1, erinFundingAmount, 0,
	)

	// Now that we've looked at the pending channels, let's actually confirm
	// all three of them.
	mineBlocks(t, net, 6, 3)

	// We'll be tracking the expected asset balances throughout the test, so
	// we can assert it after each action.
	charlieAssetBalance := mintedAsset.Amount - 2*assetSendAmount -
		charlieFundingAmount
	daveAssetBalance := assetSendAmount - daveFundingAmount
	erinAssetBalance := assetSendAmount - erinFundingAmount

	// Assert that we see the funding outputs in the wallet.
	assertBalance(
		t.t, charlieTap, charlieFundingAmount,
		itest.WithAssetID(assetID),
		itest.WithScriptKeyType(asset.ScriptKeyScriptPathChannel),
		itest.WithNumUtxos(1),
		itest.WithScriptKey(fundingScriptKeyBytes),
	)
	assertBalance(
		t.t, daveTap, daveFundingAmount, itest.WithAssetID(assetID),
		itest.WithScriptKeyType(asset.ScriptKeyScriptPathChannel),
		itest.WithNumUtxos(1),
		itest.WithScriptKey(fundingScriptKeyBytes),
	)
	assertBalance(
		t.t, erinTap, erinFundingAmount, itest.WithAssetID(assetID),
		itest.WithScriptKeyType(asset.ScriptKeyScriptPathChannel),
		itest.WithNumUtxos(1),
		itest.WithScriptKey(fundingScriptKeyBytes),
	)

	// After opening the channels, the asset balance of the funding nodes
	// should have been decreased with the funding amount.
	assertBalance(
		t.t, charlieTap, charlieAssetBalance, itest.WithAssetID(assetID),
	)
	assertBalance(
		t.t, daveTap, daveAssetBalance, itest.WithAssetID(assetID),
	)
	assertBalance(
		t.t, erinTap, erinAssetBalance, itest.WithAssetID(assetID),
	)

	// Assert that the proofs for both channels has been uploaded to the
	// designated Universe server.
	assertUniverseProofExists(
		t.t, universeTap, assetID, groupKey, fundingScriptKeyBytes,
		fmt.Sprintf("%v:%v", fundRespCD.Txid, fundRespCD.OutputIndex),
	)
	assertUniverseProofExists(
		t.t, universeTap, assetID, groupKey, fundingScriptKeyBytes,
		fmt.Sprintf("%v:%v", fundRespDY.Txid, fundRespDY.OutputIndex),
	)
	assertUniverseProofExists(
		t.t, universeTap, assetID, groupKey, fundingScriptKeyBytes,
		fmt.Sprintf("%v:%v", fundRespEF.Txid, fundRespEF.OutputIndex),
	)

	// Make sure the channel shows the correct asset information.
	assertAssetChan(
		t.t, charlieTap.node, daveTap.node, charlieFundingAmount,
		[]*taprpc.Asset{mintedAsset},
	)
	assertAssetChan(
		t.t, daveTap.node, yaraTap.node, daveFundingAmount,
		[]*taprpc.Asset{mintedAsset},
	)
	assertAssetChan(
		t.t, erinTap.node, fabiaTap.node, erinFundingAmount,
		[]*taprpc.Asset{mintedAsset},
	)

	chanPointCD := &lnrpc.ChannelPoint{
		OutputIndex: uint32(fundRespCD.OutputIndex),
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: fundRespCD.Txid,
		},
	}
	chanPointDY := &lnrpc.ChannelPoint{
		OutputIndex: uint32(fundRespDY.OutputIndex),
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: fundRespDY.Txid,
		},
	}
	chanPointEF := &lnrpc.ChannelPoint{
		OutputIndex: uint32(fundRespEF.OutputIndex),
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: fundRespEF.Txid,
		},
	}

	return chanPointCD, chanPointDY, chanPointEF
}

// createTestAssetNetworkGroupKey sets up a test network with Charlie, Dave,
// Erin and Fabia and creates asset channels between Charlie->Dave and
// Erin-Fabia in a way that there are two equally sized asset pieces for each
// minted asset (currently limited to exactly two assets). The channels are then
// confirmed and balances asserted.
func createTestAssetNetworkGroupKey(ctx context.Context, t *harnessTest,
	net *NetworkHarness, charlieTap, daveTap, erinTap, fabiaTap,
	universeTap *tapClient, mintedAssets []*taprpc.Asset,
	charlieFundingAmount, erinFundingAmount uint64,
	pushSat int64) (*lnrpc.ChannelPoint, *lnrpc.ChannelPoint) {

	var groupKey []byte
	for _, mintedAsset := range mintedAssets {
		require.NotNil(t.t, mintedAsset.AssetGroup)

		if groupKey == nil {
			groupKey = mintedAsset.AssetGroup.TweakedGroupKey

			continue
		}

		require.Equal(
			t.t, groupKey, mintedAsset.AssetGroup.TweakedGroupKey,
		)
	}

	// We first do a transfer to Charlie by itself, so we get the correct
	// asset pieces that we want for the channel funding.
	sendAssetsAndAssert(
		ctx, t, charlieTap, charlieTap, universeTap, mintedAssets[0],
		charlieFundingAmount/2, 0, 1, 0,
	)
	sendAssetsAndAssert(
		ctx, t, charlieTap, charlieTap, universeTap, mintedAssets[1],
		charlieFundingAmount/2, 1, 2, 0,
	)

	// We need to send some assets to Erin, so he can fund an asset channel
	// with Fabia.
	sendAssetsAndAssert(
		ctx, t, erinTap, charlieTap, universeTap, mintedAssets[0],
		erinFundingAmount/2, 2, 1, charlieFundingAmount/2,
	)
	sendAssetsAndAssert(
		ctx, t, erinTap, charlieTap, universeTap, mintedAssets[1],
		erinFundingAmount/2, 3, 2, charlieFundingAmount/2,
	)

	// Then we burn everything but a single asset piece. We do this to make
	// sure that the channel funding code will select the correct asset
	// UTXOs during the channel funding. Otherwise, it's super hard to
	// predict what exactly goes into the channel funding transaction. And
	// this way it's also easier to assert overall balances.
	assetID1 := mintedAssets[0].AssetGenesis.AssetId
	assetID2 := mintedAssets[1].AssetGenesis.AssetId
	burnAmount1 := mintedAssets[0].Amount - charlieFundingAmount/2 -
		erinFundingAmount/2 - 1
	_, err := charlieTap.BurnAsset(ctx, &taprpc.BurnAssetRequest{
		Asset: &taprpc.BurnAssetRequest_AssetId{
			AssetId: assetID1,
		},
		AmountToBurn:     burnAmount1,
		ConfirmationText: taprootassets.AssetBurnConfirmationText,
	})
	require.NoError(t.t, err)

	mineBlocks(t, net, 1, 1)

	burnAmount2 := mintedAssets[1].Amount - charlieFundingAmount/2 -
		erinFundingAmount/2 - 1
	_, err = charlieTap.BurnAsset(ctx, &taprpc.BurnAssetRequest{
		Asset: &taprpc.BurnAssetRequest_AssetId{
			AssetId: assetID2,
		},
		AmountToBurn:     burnAmount2,
		ConfirmationText: taprootassets.AssetBurnConfirmationText,
	})
	require.NoError(t.t, err)

	mineBlocks(t, net, 1, 1)

	t.Logf("Opening asset channels...")

	// The first channel we create has a push amount, so Charlie can receive
	// payments immediately and not run into the channel reserve issue.
	fundRespCD, err := charlieTap.FundChannel(
		ctx, &tchrpc.FundChannelRequest{
			AssetAmount:        charlieFundingAmount,
			GroupKey:           groupKey,
			PeerPubkey:         daveTap.node.PubKey[:],
			FeeRateSatPerVbyte: 5,
			PushSat:            pushSat,
		},
	)
	require.NoError(t.t, err)
	t.Logf("Funded channel between Charlie and Dave: %v", fundRespCD)

	fundRespEF, err := erinTap.FundChannel(
		ctx, &tchrpc.FundChannelRequest{
			AssetAmount:        erinFundingAmount,
			GroupKey:           groupKey,
			PeerPubkey:         fabiaTap.node.PubKey[:],
			FeeRateSatPerVbyte: 5,
			PushSat:            pushSat,
		},
	)
	require.NoError(t.t, err)
	t.Logf("Funded channel between Erin and Fabia: %v", fundRespEF)

	// Make sure the pending channel shows up in the list and has the
	// custom records set as JSON.
	assertPendingChannels(
		t.t, charlieTap.node, mintedAssets[0], 1,
		charlieFundingAmount/2, 0,
	)
	assertPendingChannels(
		t.t, charlieTap.node, mintedAssets[1], 1,
		charlieFundingAmount/2, 0,
	)
	assertPendingChannels(
		t.t, erinTap.node, mintedAssets[0], 1, erinFundingAmount/2, 0,
	)
	assertPendingChannels(
		t.t, erinTap.node, mintedAssets[1], 1, erinFundingAmount/2, 0,
	)

	// Now that we've looked at the pending channels, let's actually confirm
	// all three of them.
	mineBlocks(t, net, 6, 2)

	var id1, id2 asset.ID
	copy(id1[:], assetID1)
	copy(id2[:], assetID2)

	fundingTree1, err := tapscript.NewChannelFundingScriptTreeUniqueID(
		id1,
	)
	require.NoError(t.t, err)
	fundingScriptKey1 := fundingTree1.TaprootKey
	fundingScriptKeyBytes1 := fundingScriptKey1.SerializeCompressed()

	fundingTree2, err := tapscript.NewChannelFundingScriptTreeUniqueID(
		id2,
	)
	require.NoError(t.t, err)
	fundingScriptKey2 := fundingTree2.TaprootKey
	fundingScriptKeyBytes2 := fundingScriptKey2.SerializeCompressed()

	// We expect the funding outputs to be in the wallet.
	itest.AssertBalances(
		t.t, charlieTap, charlieFundingAmount/2,
		itest.WithAssetID(assetID1),
		itest.WithScriptKeyType(asset.ScriptKeyScriptPathChannel),
		itest.WithNumUtxos(1),
		itest.WithScriptKey(fundingScriptKeyBytes1),
	)
	itest.AssertBalances(
		t.t, charlieTap, charlieFundingAmount/2,
		itest.WithAssetID(assetID2),
		itest.WithScriptKeyType(asset.ScriptKeyScriptPathChannel),
		itest.WithNumUtxos(1),
		itest.WithScriptKey(fundingScriptKeyBytes2),
	)
	itest.AssertBalances(
		t.t, erinTap, erinFundingAmount/2, itest.WithAssetID(assetID1),
		itest.WithScriptKeyType(asset.ScriptKeyScriptPathChannel),
		itest.WithNumUtxos(1),
		itest.WithScriptKey(fundingScriptKeyBytes1),
	)
	itest.AssertBalances(
		t.t, erinTap, erinFundingAmount/2, itest.WithAssetID(assetID2),
		itest.WithScriptKeyType(asset.ScriptKeyScriptPathChannel),
		itest.WithNumUtxos(1),
		itest.WithScriptKey(fundingScriptKeyBytes2),
	)

	// There should be no directly spendable asset balance remaining, except
	// for the 1 asset left over from the burn on Charlie.
	itest.AssertBalances(
		t.t, charlieTap, 1, itest.WithAssetID(assetID1),
		itest.WithNumUtxos(1),
	)
	itest.AssertBalances(
		t.t, charlieTap, 1, itest.WithAssetID(assetID2),
		itest.WithNumUtxos(1),
	)

	// Erin only has the funding output for the channel with Fabia.
	itest.AssertBalances(t.t, erinTap, 0, itest.WithAssetID(assetID1))
	itest.AssertBalances(t.t, erinTap, 0, itest.WithAssetID(assetID1))

	// Assert that the proofs for both channels has been uploaded to the
	// designated Universe server.
	assertUniverseProofExists(
		t.t, universeTap, assetID1, groupKey, fundingScriptKeyBytes1,
		fmt.Sprintf("%v:%v", fundRespCD.Txid, fundRespCD.OutputIndex),
	)
	assertUniverseProofExists(
		t.t, universeTap, assetID2, groupKey, fundingScriptKeyBytes2,
		fmt.Sprintf("%v:%v", fundRespCD.Txid, fundRespCD.OutputIndex),
	)
	assertUniverseProofExists(
		t.t, universeTap, assetID1, groupKey, fundingScriptKeyBytes1,
		fmt.Sprintf("%v:%v", fundRespEF.Txid, fundRespEF.OutputIndex),
	)
	assertUniverseProofExists(
		t.t, universeTap, assetID2, groupKey, fundingScriptKeyBytes2,
		fmt.Sprintf("%v:%v", fundRespEF.Txid, fundRespEF.OutputIndex),
	)

	// Make sure the channel shows the correct asset information.
	assertAssetChan(
		t.t, charlieTap.node, daveTap.node, charlieFundingAmount,
		mintedAssets,
	)
	assertAssetChan(
		t.t, erinTap.node, fabiaTap.node, erinFundingAmount,
		mintedAssets,
	)

	chanPointCD := &lnrpc.ChannelPoint{
		OutputIndex: uint32(fundRespCD.OutputIndex),
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: fundRespCD.Txid,
		},
	}
	chanPointEF := &lnrpc.ChannelPoint{
		OutputIndex: uint32(fundRespEF.OutputIndex),
		FundingTxid: &lnrpc.ChannelPoint_FundingTxidStr{
			FundingTxidStr: fundRespEF.Txid,
		},
	}

	return chanPointCD, chanPointEF
}

// assertBalance is a thin wrapper around itest.AssertBalances that skips the
// balance check for old versions during the backward compatibility test.
func assertBalance(t *testing.T, client *tapClient, balance uint64,
	opts ...itest.BalanceOption) {

	if client.node.Cfg.SkipBalanceChecks {
		return
	}

	itest.AssertBalances(t, client, balance, opts...)
}

// sendAssetsAndAssert sends the given amount of assets to the recipient and
// asserts that the transfer was successful. It also checks that the asset
// balance of the sender and recipient is as expected.
func sendAssetsAndAssert(ctx context.Context, t *harnessTest,
	recipient, sender, universe *tapClient, mintedAsset *taprpc.Asset,
	assetSendAmount uint64, idx, numTransfers int,
	previousSentAmount uint64) {

	assetID := mintedAsset.AssetGenesis.AssetId
	recipientAddr, err := recipient.NewAddr(ctx, &taprpc.NewAddrRequest{
		Amt:     assetSendAmount,
		AssetId: assetID,
		ProofCourierAddr: fmt.Sprintf(
			"%s://%s", proof.UniverseRpcCourierType,
			universe.node.Cfg.LitAddr(),
		),
	})
	require.NoError(t.t, err)

	t.Logf("Sending %v asset units to %s...", assetSendAmount,
		recipient.node.Cfg.Name)

	// We assume that we sent the same size in a previous send.
	totalSent := assetSendAmount + previousSentAmount

	// Send the assets to recipient.
	itest.AssertAddrCreated(
		t.t, recipient, mintedAsset, recipientAddr,
	)
	sendResp, err := sender.SendAsset(ctx, &taprpc.SendAssetRequest{
		TapAddrs: []string{recipientAddr.Encoded},
	})
	require.NoError(t.t, err)
	itest.ConfirmAndAssertOutboundTransfer(
		t.t, t.lndHarness.Miner.Client, sender, sendResp,
		assetID,
		[]uint64{mintedAsset.Amount - totalSent, assetSendAmount},
		idx, idx+1,
	)
	itest.AssertNonInteractiveRecvComplete(t.t, recipient, numTransfers)
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
			return fmt.Errorf("%v is expecting %d transfers, has "+
				"%d", tapdClient.node.Name(), 1,
				len(forceCloseTransfer.Transfers))
		}

		transfer = forceCloseTransfer.Transfers[0]

		if transfer.AnchorTxBlockHash == nil {
			return fmt.Errorf("missing anchor block hash, " +
				"transfer not confirmed")
		}

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

func assertUniverseProofExists(t *testing.T, universe *tapClient,
	assetID, groupKey, scriptKey []byte, outpoint string) *taprpc.Asset {

	t.Logf("Asserting proof outpoint=%v, script_key=%x, asset_id=%x, "+
		"group_key=%x", outpoint, scriptKey, assetID, groupKey)

	req := &universerpc.UniverseKey{
		Id: &universerpc.ID{
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

	switch {
	case len(groupKey) > 0:
		req.Id.Id = &universerpc.ID_GroupKey{
			GroupKey: groupKey,
		}

	case len(assetID) > 0:
		req.Id.Id = &universerpc.ID_AssetId{
			AssetId: assetID,
		}

	default:
		t.Fatalf("Need either asset ID or group key")
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

	if len(groupKey) > 0 {
		require.NotNil(t, proofResp.AssetLeaf.Asset.AssetGroup)
		require.Equal(
			t, proofResp.AssetLeaf.Asset.AssetGroup.TweakedGroupKey,
			groupKey,
		)
	} else {
		require.Equal(
			t, proofResp.AssetLeaf.Asset.AssetGenesis.AssetId,
			assetID,
		)
	}

	a := proofResp.AssetLeaf.Asset
	t.Logf("Proof found for scriptKey=%x, amount=%d", a.ScriptKey, a.Amount)

	return a
}

func assertPendingChannels(t *testing.T, node *HarnessNode,
	mintedAsset *taprpc.Asset, numChannels int, localSum,
	remoteSum uint64) {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	pendingChannelsResp, err := node.PendingChannels(
		ctxt, &lnrpc.PendingChannelsRequest{},
	)
	require.NoError(t, err)
	require.Len(t, pendingChannelsResp.PendingOpenChannels, numChannels)

	pendingChan := pendingChannelsResp.PendingOpenChannels[0]
	pendingJSON, err := parseChannelData(
		node, pendingChan.Channel.CustomChannelData,
	)
	require.NoError(t, err)

	require.GreaterOrEqual(t, len(pendingJSON.FundingAssets), 1)

	require.NotZero(t, pendingJSON.Capacity)

	// Check the decimal display of the channel funding blob. If no explicit
	// value was set, we assume and expect the value of 0.
	var expectedDecimalDisplay uint8
	if mintedAsset.DecimalDisplay != nil {
		expectedDecimalDisplay = uint8(
			mintedAsset.DecimalDisplay.DecimalDisplay,
		)
	}

	require.Equal(
		t, expectedDecimalDisplay,
		pendingJSON.FundingAssets[0].DecimalDisplay,
	)

	// Check the balance of the pending channel.
	assetID := mintedAsset.AssetGenesis.AssetId
	pendingLocalBalance, pendingRemoteBalance, _, _ :=
		getAssetChannelBalance(t, node, [][]byte{assetID}, true)
	require.EqualValues(t, localSum, pendingLocalBalance)
	require.EqualValues(t, remoteSum, pendingRemoteBalance)
}

// haveFundingAsset returns true if the given channel has the asset with the
// given asset ID as a funding asset.
func haveFundingAsset(assetChannel *rfqmsg.JsonAssetChannel,
	assetID []byte) bool {

	assetIDStr := hex.EncodeToString(assetID)
	for _, fundingAsset := range assetChannel.FundingAssets {
		if fundingAsset.AssetGenesis.AssetID == assetIDStr {
			return true
		}
	}

	return false
}

func assertAssetChan(t *testing.T, src, dst *HarnessNode, fundingAmount uint64,
	channelAssets []*taprpc.Asset) {

	err := wait.NoError(func() error {
		a, err := getChannelCustomData(src, dst)
		if err != nil {
			return err
		}

		for _, channelAsset := range channelAssets {
			assetID := channelAsset.AssetGenesis.AssetId
			if !haveFundingAsset(a, assetID) {
				return fmt.Errorf("expected asset ID %x, to "+
					"be in channel", assetID)
			}
		}

		if a.Capacity != fundingAmount {
			return fmt.Errorf("expected capacity %d, got %d",
				fundingAmount, a.Capacity)
		}

		// Check the decimal display of the channel funding blob. If no
		// explicit value was set, we assume and expect the value of 0.
		// We only need to check the first funding asset, since we
		// enforce them to be the same.
		var expectedDecimalDisplay uint8
		if channelAssets[0].DecimalDisplay != nil {
			expectedDecimalDisplay = uint8(
				channelAssets[0].DecimalDisplay.DecimalDisplay,
			)
		}

		if a.FundingAssets[0].DecimalDisplay != expectedDecimalDisplay {
			return fmt.Errorf("expected decimal display %d, got %d",
				expectedDecimalDisplay,
				a.FundingAssets[0].DecimalDisplay)
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

func getChannelCustomData(src, dst *HarnessNode) (*rfqmsg.JsonAssetChannel,
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

	assetData, err := parseChannelData(src, targetChan.CustomChannelData)
	if err != nil {
		return nil, fmt.Errorf("unable to unmarshal asset data: %w",
			err)
	}

	if len(assetData.FundingAssets) == 0 {
		return nil, fmt.Errorf("expected at least 1 asset, got %d",
			len(assetData.FundingAssets))
	}

	return assetData, nil
}

func getAssetChannelBalance(t *testing.T, node *HarnessNode, assetIDs [][]byte,
	pending bool) (uint64, uint64, uint64, uint64) {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	balance, err := node.ChannelBalance(
		ctxt, &lnrpc.ChannelBalanceRequest{},
	)
	require.NoError(t, err)

	// In case there are no channels, the custom channel data will just be
	// empty. Which means the total asset balance is zero.
	if len(balance.CustomChannelData) == 0 {
		return 0, 0, 0, 0
	}

	var assetBalance rfqmsg.JsonAssetChannelBalances
	err = json.Unmarshal(balance.CustomChannelData, &assetBalance)
	require.NoErrorf(t, err, "json: '%x'", balance.CustomChannelData)

	balances := assetBalance.OpenChannels
	if pending {
		balances = assetBalance.PendingChannels
	}

	idMatch := func(assetIDString string) bool {
		for _, groupedID := range assetIDs {
			if assetIDString == hex.EncodeToString(groupedID) {
				return true
			}
		}

		return false
	}

	var localSum, remoteSum uint64
	for assetIDString := range balances {
		if !idMatch(assetIDString) {
			continue
		}

		localSum += balances[assetIDString].LocalBalance
		remoteSum += balances[assetIDString].RemoteBalance
	}

	return localSum, remoteSum, balance.LocalBalance.Sat,
		balance.RemoteBalance.Sat
}

func fetchChannel(t *testing.T, node *HarnessNode,
	chanPoint *lnrpc.ChannelPoint) *lnrpc.Channel {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	channelResp, err := node.ListChannels(ctxt, &lnrpc.ListChannelsRequest{
		ActiveOnly: true,
	})
	require.NoError(t, err)

	chanFundingHash, err := lnrpc.GetChanPointFundingTxid(chanPoint)
	require.NoError(t, err)

	chanPointStr := fmt.Sprintf("%v:%v", chanFundingHash,
		chanPoint.OutputIndex)

	var targetChan *lnrpc.Channel
	for _, channel := range channelResp.Channels {
		if channel.ChannelPoint == chanPointStr {
			targetChan = channel

			break
		}
	}
	require.NotNil(t, targetChan)

	return targetChan
}

func assertChannelSatBalance(t *testing.T, node *HarnessNode,
	chanPoint *lnrpc.ChannelPoint, local, remote int64) {

	targetChan := fetchChannel(t, node, chanPoint)

	require.InDelta(t, local, targetChan.LocalBalance, 1)
	require.InDelta(t, remote, targetChan.RemoteBalance, 1)
}

func assertChannelAssetBalance(t *testing.T, node *HarnessNode,
	chanPoint *lnrpc.ChannelPoint, local, remote uint64) {

	assertChannelAssetBalanceWithDelta(
		t, node, chanPoint, local, remote, 1,
	)
}

func assertChannelAssetBalanceWithDelta(t *testing.T, node *HarnessNode,
	chanPoint *lnrpc.ChannelPoint, local, remote uint64, delta float64) {

	targetChan := fetchChannel(t, node, chanPoint)

	assetBalance, err := parseChannelData(
		node, targetChan.CustomChannelData,
	)
	require.NoError(t, err)

	require.Len(t, assetBalance.FundingAssets, 1)

	require.InDelta(t, local, assetBalance.LocalBalance, delta)
	require.InDelta(t, remote, assetBalance.RemoteBalance, delta)
}

func channelAssetBalance(t *testing.T, node *HarnessNode,
	chanPoint *lnrpc.ChannelPoint) (uint64, uint64) {

	targetChan := fetchChannel(t, node, chanPoint)

	assetBalance, err := parseChannelData(
		node, targetChan.CustomChannelData,
	)
	require.NoError(t, err)

	require.GreaterOrEqual(t, len(assetBalance.FundingAssets), 1)

	return assetBalance.LocalBalance, assetBalance.RemoteBalance
}

// addRoutingFee adds the default routing fee (1 part per million fee rate plus
// 1000 milli-satoshi base fee) to the given milli-satoshi amount.
func addRoutingFee(amt lnwire.MilliSatoshi) lnwire.MilliSatoshi {
	return amt + (amt / 1000_000) + 1000
}

func sendAssetKeySendPayment(t *testing.T, src, dst *HarnessNode, amt uint64,
	assetID []byte, btcAmt fn.Option[int64], opts ...payOpt) {

	cfg := defaultPayConfig()
	for _, opt := range opts {
		opt(cfg)
	}

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	srcTapd := newTapClient(t, src)

	// Read out the custom preimage for the keysend payment.
	var preimage lntypes.Preimage
	_, err := rand.Read(preimage[:])
	require.NoError(t, err)

	hash := preimage.Hash()

	// Set the preimage. If the user supplied a preimage with the data
	// flag, the preimage that is set here will be overwritten later.
	customRecords := make(map[uint64][]byte)
	customRecords[record.KeySendType] = preimage[:]

	sendReq := &routerrpc.SendPaymentRequest{
		Dest:              dst.PubKey[:],
		Amt:               btcAmt.UnwrapOr(500),
		DestCustomRecords: customRecords,
		PaymentHash:       hash[:],
		TimeoutSeconds:    int32(PaymentTimeout.Seconds()),
		MaxParts:          cfg.maxShards,
		OutgoingChanIds:   cfg.outgoingChanIDs,
		AllowSelfPayment:  cfg.allowSelfPayment,
	}

	request := &tchrpc.SendPaymentRequest{
		AssetAmount:    amt,
		PaymentRequest: sendReq,
	}

	switch {
	case len(cfg.groupKey) > 0:
		request.GroupKey = cfg.groupKey

	default:
		request.AssetId = assetID
	}

	stream, err := srcTapd.SendPayment(ctxt, request)
	require.NoError(t, err)

	// If an error is returned by the RPC method (meaning the stream itself
	// was established, no network or auth error), we expect the error to be
	// returned on the first read on the stream.
	if cfg.errSubStr != "" {
		_, err := stream.Recv()
		require.ErrorContains(t, err, cfg.errSubStr)

		return
	}

	tapPayment, err := getAssetPaymentResult(t, stream, false)
	require.NoError(t, err)

	payment := tapPayment.lndPayment
	if payment.Status == lnrpc.Payment_FAILED {
		t.Logf("Failure reason: %v", payment.FailureReason)
	}
	require.Equal(t, cfg.payStatus, payment.Status)
	require.Equal(t, cfg.failureReason, payment.FailureReason)
}

func sendKeySendPayment(t *testing.T, src, dst *HarnessNode,
	amt btcutil.Amount, opts ...payOpt) {

	cfg := defaultPayConfig()
	for _, opt := range opts {
		opt(cfg)
	}

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

	for key, value := range cfg.destCustomRecords {
		customRecords[key] = value
	}

	req := &routerrpc.SendPaymentRequest{
		Dest:              dst.PubKey[:],
		Amt:               int64(amt),
		DestCustomRecords: customRecords,
		PaymentHash:       hash[:],
		TimeoutSeconds:    int32(PaymentTimeout.Seconds()),
		FeeLimitMsat:      int64(cfg.feeLimit),
		MaxParts:          cfg.maxShards,
		OutgoingChanIds:   cfg.outgoingChanIDs,
		AllowSelfPayment:  cfg.allowSelfPayment,
		RouteHints:        cfg.routeHints,
	}

	stream, err := src.RouterClient.SendPaymentV2(ctxt, req)
	require.NoError(t, err)

	result, err := getPaymentResult(stream, false)
	require.NoError(t, err)
	require.Equal(t, lnrpc.Payment_SUCCEEDED, result.Status)
}

func createAndPayNormalInvoiceWithBtc(t *testing.T, src, dst *HarnessNode,
	amountSat btcutil.Amount) {

	invoiceResp := createNormalInvoice(t, dst, amountSat)

	payInvoiceWithSatoshi(t, src, invoiceResp)
}

func createNormalInvoice(t *testing.T, dst *HarnessNode,
	amountSat btcutil.Amount,
	opts ...invoiceOpt) *lnrpc.AddInvoiceResponse {

	cfg := defaultInvoiceConfig()
	for _, opt := range opts {
		opt(cfg)
	}

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	expirySeconds := 10
	invoiceResp, err := dst.AddInvoice(ctxt, &lnrpc.Invoice{
		Value:      int64(amountSat),
		Memo:       "normal invoice",
		Expiry:     int64(expirySeconds),
		RouteHints: cfg.routeHints,
	})
	require.NoError(t, err)

	return invoiceResp
}

func createAndPayNormalInvoice(t *testing.T, src, rfqPeer, dst *HarnessNode,
	amountSat btcutil.Amount, assetID []byte, opts ...payOpt) uint64 {

	invoiceResp := createNormalInvoice(t, dst, amountSat)
	numUnits, _ := payInvoiceWithAssets(
		t, src, rfqPeer, invoiceResp.PaymentRequest, assetID, opts...,
	)

	return numUnits
}

func payInvoiceWithSatoshi(t *testing.T, payer *HarnessNode,
	invoice *lnrpc.AddInvoiceResponse, opts ...payOpt) {

	payPayReqWithSatoshi(t, payer, invoice.PaymentRequest, opts...)
}

func payPayReqWithSatoshi(t *testing.T, payer *HarnessNode, payReq string,
	opts ...payOpt) {

	cfg := defaultPayConfig()
	for _, opt := range opts {
		opt(cfg)
	}

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	sendReq := &routerrpc.SendPaymentRequest{
		PaymentRequest:   payReq,
		TimeoutSeconds:   int32(PaymentTimeout.Seconds()),
		FeeLimitMsat:     int64(cfg.feeLimit),
		MaxParts:         cfg.maxShards,
		OutgoingChanIds:  cfg.outgoingChanIDs,
		AllowSelfPayment: cfg.allowSelfPayment,
	}

	if cfg.smallShards {
		sendReq.MaxShardSizeMsat = 80_000_000
	}

	stream, err := payer.RouterClient.SendPaymentV2(ctxt, sendReq)
	require.NoError(t, err)

	result, err := getPaymentResult(
		stream, cfg.payStatus == lnrpc.Payment_IN_FLIGHT,
	)
	if cfg.errSubStr != "" {
		require.ErrorContains(t, err, cfg.errSubStr)
	} else {
		require.NoError(t, err)
		require.Equal(t, cfg.payStatus, result.Status)
		require.Equal(t, cfg.failureReason, result.FailureReason)
	}
}

func payInvoiceWithSatoshiLastHop(t *testing.T, payer *HarnessNode,
	invoice *lnrpc.AddInvoiceResponse, hops [][]byte, opts ...payOpt) {

	cfg := defaultPayConfig()
	for _, opt := range opts {
		opt(cfg)
	}

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	decodedInvoice, err := payer.DecodePayReq(ctxt, &lnrpc.PayReqString{
		PayReq: invoice.PaymentRequest,
	})
	require.NoError(t, err)

	routeRes, err := payer.RouterClient.BuildRoute(
		ctxb, &routerrpc.BuildRouteRequest{
			AmtMsat:     decodedInvoice.NumMsat,
			PaymentAddr: invoice.PaymentAddr,
			HopPubkeys:  hops,
		},
	)
	require.NoError(t, err)

	res, err := payer.RouterClient.SendToRouteV2(
		ctxt, &routerrpc.SendToRouteRequest{
			PaymentHash: invoice.RHash,
			Route:       routeRes.Route,
		},
	)
	require.NoError(t, err)

	switch cfg.payStatus {
	case lnrpc.Payment_FAILED:
		require.NoError(t, err)
		require.Equal(t, lnrpc.HTLCAttempt_FAILED, res.Status)
		require.NotNil(t, res.Failure)
		require.Nil(t, res.Preimage)

	case lnrpc.Payment_SUCCEEDED:
		require.NoError(t, err)
		require.Equal(t, lnrpc.HTLCAttempt_SUCCEEDED, res.Status)
	}
}

type payConfig struct {
	smallShards       bool
	maxShards         uint32
	errSubStr         string
	allowOverpay      bool
	feeLimit          lnwire.MilliSatoshi
	destCustomRecords map[uint64][]byte
	payStatus         lnrpc.Payment_PaymentStatus
	failureReason     lnrpc.PaymentFailureReason
	rfq               fn.Option[rfqmsg.ID]
	groupKey          []byte
	outgoingChanIDs   []uint64
	allowSelfPayment  bool
	routeHints        []*lnrpc.RouteHint
}

func defaultPayConfig() *payConfig {
	return &payConfig{
		smallShards:   false,
		errSubStr:     "",
		feeLimit:      1_000_000,
		payStatus:     lnrpc.Payment_SUCCEEDED,
		failureReason: lnrpc.PaymentFailureReason_FAILURE_REASON_NONE,
	}
}

type payOpt func(*payConfig)

func withSmallShards() payOpt {
	return func(c *payConfig) {
		c.smallShards = true
	}
}

func withMaxShards(maxShards uint32) payOpt {
	return func(c *payConfig) {
		c.maxShards = maxShards
	}
}

func withPayErrSubStr(errSubStr string) payOpt {
	return func(c *payConfig) {
		c.errSubStr = errSubStr
	}
}

func withFailure(status lnrpc.Payment_PaymentStatus,
	reason lnrpc.PaymentFailureReason) payOpt {

	return func(c *payConfig) {
		c.payStatus = status
		c.failureReason = reason
	}
}

func withRFQ(rfqID rfqmsg.ID) payOpt {
	return func(c *payConfig) {
		c.rfq = fn.Some(rfqID)
	}
}

func withFeeLimit(limit lnwire.MilliSatoshi) payOpt {
	return func(c *payConfig) {
		c.feeLimit = limit
	}
}

func withDestCustomRecords(records map[uint64][]byte) payOpt {
	return func(c *payConfig) {
		c.destCustomRecords = records
	}
}

func withAllowOverpay() payOpt {
	return func(c *payConfig) {
		c.allowOverpay = true
	}
}

func withGroupKey(groupKey []byte) payOpt {
	return func(c *payConfig) {
		c.groupKey = groupKey
	}
}

func withOutgoingChanIDs(ids []uint64) payOpt {
	return func(c *payConfig) {
		c.outgoingChanIDs = ids
	}
}

func withAllowSelfPayment() payOpt {
	return func(c *payConfig) {
		c.allowSelfPayment = true
	}
}

func withPayRouteHints(hints []*lnrpc.RouteHint) payOpt {
	return func(c *payConfig) {
		c.routeHints = hints
	}
}

func payInvoiceWithAssets(t *testing.T, payer, rfqPeer *HarnessNode,
	payReq string, assetID []byte,
	opts ...payOpt) (uint64, rfqmath.BigIntFixedPoint) {

	cfg := defaultPayConfig()
	for _, opt := range opts {
		opt(cfg)
	}

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	payerTapd := newTapClient(t, payer)

	decodedInvoice, err := payer.DecodePayReq(ctxt, &lnrpc.PayReqString{
		PayReq: payReq,
	})
	require.NoError(t, err)

	sendReq := &routerrpc.SendPaymentRequest{
		PaymentRequest:    payReq,
		TimeoutSeconds:    int32(PaymentTimeout.Seconds()),
		FeeLimitMsat:      int64(cfg.feeLimit),
		DestCustomRecords: cfg.destCustomRecords,
		MaxParts:          cfg.maxShards,
		OutgoingChanIds:   cfg.outgoingChanIDs,
		AllowSelfPayment:  cfg.allowSelfPayment,
	}

	if cfg.smallShards {
		sendReq.MaxShardSizeMsat = 80_000_000
	}

	var rfqBytes []byte
	cfg.rfq.WhenSome(func(i rfqmsg.ID) {
		rfqBytes = make([]byte, len(i[:]))
		copy(rfqBytes, i[:])
	})

	var peerPubKey []byte
	if rfqPeer != nil {
		peerPubKey = rfqPeer.PubKey[:]
	}

	request := &tchrpc.SendPaymentRequest{
		PeerPubkey:     peerPubKey,
		PaymentRequest: sendReq,
		RfqId:          rfqBytes,
		AllowOverpay:   cfg.allowOverpay,
	}

	switch {
	case len(cfg.groupKey) > 0:
		request.GroupKey = cfg.groupKey

	default:
		request.AssetId = assetID
	}

	stream, err := payerTapd.SendPayment(ctxt, request)
	require.NoError(t, err)

	// If an error is returned by the RPC method (meaning the stream itself
	// was established, no network or auth error), we expect the error to be
	// returned on the stream.
	if cfg.errSubStr != "" {
		msg, err := stream.Recv()

		// On errors we still get an empty set of RFQs as a response.
		if msg.GetAcceptedSellOrders() != nil {
			_, err = stream.Recv()
		}

		require.ErrorContains(t, err, cfg.errSubStr)

		return 0, rfqmath.BigIntFixedPoint{}
	}

	var (
		numUnits uint64
		rateVal  rfqmath.FixedPoint[rfqmath.BigInt]
	)

	tapPayment, err := getAssetPaymentResult(
		t, stream, cfg.payStatus == lnrpc.Payment_IN_FLIGHT,
	)
	require.NoError(t, err)

	payment := tapPayment.lndPayment
	require.Equal(t, cfg.payStatus, payment.Status)
	require.Equal(t, cfg.failureReason, payment.FailureReason)

	amountMsat := lnwire.MilliSatoshi(decodedInvoice.NumMsat)

	rateVal = tapPayment.assetRate
	milliSatsFP := rfqmath.MilliSatoshiToUnits(amountMsat, rateVal)
	numUnits = milliSatsFP.ScaleTo(0).ToUint64()

	return numUnits, rateVal
}

type invoiceConfig struct {
	errSubStr  string
	groupKey   []byte
	msats      lnwire.MilliSatoshi
	routeHints []*lnrpc.RouteHint
}

func defaultInvoiceConfig() *invoiceConfig {
	return &invoiceConfig{
		errSubStr: "",
	}
}

type invoiceOpt func(*invoiceConfig)

func withInvoiceErrSubStr(errSubStr string) invoiceOpt {
	return func(c *invoiceConfig) {
		c.errSubStr = errSubStr
	}
}

func withInvGroupKey(groupKey []byte) invoiceOpt {
	return func(c *invoiceConfig) {
		c.groupKey = groupKey
	}
}

func withMsatAmount(amt uint64) invoiceOpt {
	return func(c *invoiceConfig) {
		c.msats = lnwire.MilliSatoshi(amt)
	}
}

func withRouteHints(hints []*lnrpc.RouteHint) invoiceOpt {
	return func(c *invoiceConfig) {
		c.routeHints = hints
	}
}

func createAssetInvoice(t *testing.T, dstRfqPeer, dst *HarnessNode,
	assetAmount uint64, assetID []byte,
	opts ...invoiceOpt) *lnrpc.AddInvoiceResponse {

	cfg := defaultInvoiceConfig()
	for _, opt := range opts {
		opt(cfg)
	}

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	timeoutSeconds := int64(rfq.DefaultInvoiceExpiry.Seconds())

	var peerPubKey []byte
	if dstRfqPeer != nil {
		peerPubKey = dstRfqPeer.PubKey[:]

		t.Logf("Asking peer %x for quote to buy assets to receive for "+
			"invoice over %d units; waiting up to %ds",
			dstRfqPeer.PubKey[:], assetAmount, timeoutSeconds)
	}

	dstTapd := newTapClient(t, dst)

	request := &tchrpc.AddInvoiceRequest{
		AssetAmount: assetAmount,
		PeerPubkey:  peerPubKey,
		InvoiceRequest: &lnrpc.Invoice{
			Memo: fmt.Sprintf("this is an asset invoice for "+
				"%d units", assetAmount),
			Expiry:     timeoutSeconds,
			ValueMsat:  int64(cfg.msats),
			RouteHints: cfg.routeHints,
		},
	}

	switch {
	case len(cfg.groupKey) > 0:
		request.GroupKey = cfg.groupKey

	default:
		request.AssetId = assetID
	}

	resp, err := dstTapd.AddInvoice(ctxt, request)
	if cfg.errSubStr != "" {
		require.ErrorContains(t, err, cfg.errSubStr)

		return nil
	} else {
		require.NoError(t, err)
	}

	decodedInvoice, err := dst.DecodePayReq(ctxt, &lnrpc.PayReqString{
		PayReq: resp.InvoiceResult.PaymentRequest,
	})
	require.NoError(t, err)

	rpcRate := resp.AcceptedBuyQuote.AskAssetRate
	rate, err := rpcutils.UnmarshalRfqFixedPoint(rpcRate)
	require.NoError(t, err)

	t.Logf("Got quote for %v asset units per BTC", rate)

	var mSatPerUnit float64

	if cfg.msats > 0 {
		require.EqualValues(t, decodedInvoice.NumMsat, cfg.msats)
		units := rfqmath.MilliSatoshiToUnits(cfg.msats, *rate)

		mSatPerUnit = float64(cfg.msats) / float64(units.ToUint64())
	} else {
		assetUnits := rfqmath.NewBigIntFixedPoint(assetAmount, 0)
		numMSats := rfqmath.UnitsToMilliSatoshi(assetUnits, *rate)
		mSatPerUnit = float64(decodedInvoice.NumMsat) /
			float64(assetAmount)

		require.EqualValues(t, numMSats, decodedInvoice.NumMsat)
	}

	t.Logf("Got quote for %d mSats at %3f msat/unit from peer %x with "+
		"SCID %d", decodedInvoice.NumMsat, mSatPerUnit,
		resp.AcceptedBuyQuote.Peer, resp.AcceptedBuyQuote.Scid)

	return resp.InvoiceResult
}

// assertInvoiceHtlcAssets makes sure the invoice with the given hash shows the
// individual HTLCs that arrived for it and that they show the correct asset
// amounts for the given ID when decoded.
func assertInvoiceHtlcAssets(t *testing.T, node *HarnessNode,
	addedInvoice *lnrpc.AddInvoiceResponse, assetID []byte, groupID []byte,
	assetAmount uint64) {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	invoice, err := node.InvoicesClient.LookupInvoiceV2(
		ctxt, &invoicesrpc.LookupInvoiceMsg{
			InvoiceRef: &invoicesrpc.LookupInvoiceMsg_PaymentAddr{
				PaymentAddr: addedInvoice.PaymentAddr,
			},
		},
	)
	require.NoError(t, err)
	require.NotEmpty(t, invoice.Htlcs)

	t.Logf("Asset invoice: %v", toProtoJSON(t, invoice))

	var targetID string
	switch {
	case len(groupID) > 0:
		targetID = hex.EncodeToString(groupID)

	case len(assetID) > 0:
		targetID = hex.EncodeToString(assetID)
	}

	var totalAssetAmount uint64
	for _, htlc := range invoice.Htlcs {
		require.NotEmpty(t, htlc.CustomChannelData)

		jsonHtlc := &rfqmsg.JsonHtlc{}
		err := json.Unmarshal(htlc.CustomChannelData, jsonHtlc)
		require.NoError(t, err)

		for _, balance := range jsonHtlc.Balances {
			if balance.AssetID != targetID {
				continue
			}

			totalAssetAmount += balance.Amount
		}
	}

	// Due to rounding we allow up to 1 unit of error.
	require.InDelta(t, assetAmount, totalAssetAmount, 1)
}

// assertPaymentHtlcAssets makes sure the payment with the given hash shows the
// individual HTLCs that arrived for it and that they show the correct asset
// amounts for the given ID when decoded.
func assertPaymentHtlcAssets(t *testing.T, node *HarnessNode, payHash []byte,
	assetID []byte, groupID []byte, assetAmount uint64) {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	stream, err := node.RouterClient.TrackPaymentV2(
		ctxt, &routerrpc.TrackPaymentRequest{
			PaymentHash:       payHash,
			NoInflightUpdates: true,
		},
	)
	require.NoError(t, err)

	payment, err := stream.Recv()
	require.NoError(t, err)
	require.NotNil(t, payment)
	require.NotEmpty(t, payment.Htlcs)

	t.Logf("Asset payment: %v", toProtoJSON(t, payment))

	var targetID string
	switch {
	case len(groupID) > 0:
		targetID = hex.EncodeToString(groupID)

	case len(assetID) > 0:
		targetID = hex.EncodeToString(assetID)
	}

	var totalAssetAmount uint64
	for _, htlc := range payment.Htlcs {
		require.NotNil(t, htlc.Route)
		require.NotEmpty(t, htlc.Route.CustomChannelData)

		jsonHtlc := &rfqmsg.JsonHtlc{}
		err := json.Unmarshal(htlc.Route.CustomChannelData, jsonHtlc)
		require.NoError(t, err)

		for _, balance := range jsonHtlc.Balances {
			if balance.AssetID != targetID {
				continue
			}

			totalAssetAmount += balance.Amount
		}
	}

	// Due to rounding we allow up to 1 unit of error.
	require.InDelta(t, assetAmount, totalAssetAmount, 1)
}

type assetHodlInvoice struct {
	preimage lntypes.Preimage
	payReq   string
}

func createAssetHodlInvoice(t *testing.T, dstRfqPeer, dst *HarnessNode,
	assetAmount uint64, assetID []byte,
	opts ...invoiceOpt) assetHodlInvoice {

	cfg := defaultInvoiceConfig()
	for _, opt := range opts {
		opt(cfg)
	}

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	timeoutSeconds := int64(rfq.DefaultInvoiceExpiry.Seconds())

	var rfqPeer []byte

	if dstRfqPeer != nil {
		rfqPeer = dstRfqPeer.PubKey[:]
	}

	t.Logf("Asking peer %x for quote to buy assets to receive for "+
		"invoice for %d units; waiting up to %ds",
		rfqPeer, assetAmount, timeoutSeconds)

	dstTapd := newTapClient(t, dst)

	// As this is a hodl invoice, we'll also need to create a preimage
	// external to lnd.
	var preimage lntypes.Preimage
	_, err := rand.Read(preimage[:])
	require.NoError(t, err)

	payHash := preimage.Hash()
	request := &tchrpc.AddInvoiceRequest{
		AssetAmount: assetAmount,
		PeerPubkey:  rfqPeer,
		InvoiceRequest: &lnrpc.Invoice{
			Memo: fmt.Sprintf("this is an asset invoice for "+
				"%d units", assetAmount),
			Expiry: timeoutSeconds,
		},
		HodlInvoice: &tchrpc.HodlInvoice{
			PaymentHash: payHash[:],
		},
	}

	switch {
	case len(cfg.groupKey) > 0:
		request.GroupKey = cfg.groupKey

	default:
		request.AssetId = assetID
	}

	resp, err := dstTapd.AddInvoice(ctxt, request)
	require.NoError(t, err)

	decodedInvoice, err := dst.DecodePayReq(ctxt, &lnrpc.PayReqString{
		PayReq: resp.InvoiceResult.PaymentRequest,
	})
	require.NoError(t, err)

	rpcRate := resp.AcceptedBuyQuote.AskAssetRate
	rate, err := rpcutils.UnmarshalRfqFixedPoint(rpcRate)
	require.NoError(t, err)

	assetUnits := rfqmath.NewBigIntFixedPoint(assetAmount, 0)
	numMSats := rfqmath.UnitsToMilliSatoshi(assetUnits, *rate)
	mSatPerUnit := float64(decodedInvoice.NumMsat) / float64(assetAmount)

	require.EqualValues(t, uint64(numMSats), uint64(decodedInvoice.NumMsat))

	t.Logf("Got quote for %d msat at %v msat/unit from peer %x with SCID "+
		"%d", decodedInvoice.NumMsat, mSatPerUnit, rfqPeer,
		resp.AcceptedBuyQuote.Scid)

	return assetHodlInvoice{
		preimage: preimage,
		payReq:   resp.InvoiceResult.PaymentRequest,
	}
}

func waitForSendEvent(t *testing.T,
	sendEvents taprpc.TaprootAssets_SubscribeSendEventsClient,
	expectedState tapfreighter.SendState) {

	t.Helper()

	for {
		sendEvent, err := sendEvents.Recv()
		require.NoError(t, err)

		t.Logf("Received send event: %v", sendEvent.SendState)
		if sendEvent.SendState == expectedState.String() {
			return
		}
	}
}

// coOpCloseBalanceCheck is a function type that can be passed into
// closeAssetChannelAndAsset to asset the final balance of the closing
// transaction.
type coOpCloseBalanceCheck func(t *testing.T, local, remote *HarnessNode,
	closeTx *wire.MsgTx, closeUpdate *lnrpc.ChannelCloseUpdate,
	assetIDs [][]byte, groupKey []byte, universeTap *tapClient)

// noOpCoOpCloseBalanceCheck is a no-op implementation of the co-op close
// balance check that can be used in tests.
func noOpCoOpCloseBalanceCheck(_ *testing.T, _, _ *HarnessNode, _ *wire.MsgTx,
	_ *lnrpc.ChannelCloseUpdate, _ [][]byte, _ []byte, _ *tapClient) {

	// This is a no-op function.
}

// closeAssetChannelAndAssert closes the channel between the local and remote
// node and asserts the final balances of the closing transaction.
func closeAssetChannelAndAssert(t *harnessTest, net *NetworkHarness,
	local, remote *HarnessNode, chanPoint *lnrpc.ChannelPoint,
	assetIDs [][]byte, groupKey []byte, universeTap *tapClient,
	balanceCheck coOpCloseBalanceCheck) {

	t.t.Helper()

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	closeStream, _, err := t.lndHarness.CloseChannel(
		local, chanPoint, false,
	)
	require.NoError(t.t, err)

	localTapd := newTapClient(t.t, local)
	sendEvents, err := localTapd.SubscribeSendEvents(
		ctxt, &taprpc.SubscribeSendEventsRequest{},
	)
	require.NoError(t.t, err)

	if !local.Cfg.OldChannelFormat {
		assertWaitingCloseChannelAssetData(t.t, local, chanPoint)
	}
	if !remote.Cfg.OldChannelFormat {
		assertWaitingCloseChannelAssetData(t.t, remote, chanPoint)
	}

	mineBlocks(t, net, 1, 1)

	closeUpdate, err := t.lndHarness.WaitForChannelClose(closeStream)
	require.NoError(t.t, err)

	closeTxid, err := chainhash.NewHash(closeUpdate.ClosingTxid)
	require.NoError(t.t, err)

	closeTransaction := t.lndHarness.Miner.GetRawTransaction(*closeTxid)
	closeTx := closeTransaction.MsgTx()
	t.Logf("Channel closed with txid: %v", closeTxid)
	t.Logf("Close transaction: %v", spew.Sdump(closeTx))

	waitForSendEvent(t.t, sendEvents, tapfreighter.SendStateComplete)

	// Check the final balance of the closing transaction.
	balanceCheck(
		t.t, local, remote, closeTx, closeUpdate, assetIDs, groupKey,
		universeTap,
	)

	if !local.Cfg.OldChannelFormat {
		assertClosedChannelAssetData(t.t, local, chanPoint)
	}
	if !remote.Cfg.OldChannelFormat {
		assertClosedChannelAssetData(t.t, remote, chanPoint)
	}
}

// assertDefaultCoOpCloseBalance returns a default implementation of the co-op
// close balance check that can be used in tests. It assumes the initiator has
// both an asset and BTC balance left, while the responder's balance can be
// specified with the boolean variables.
func assertDefaultCoOpCloseBalance(remoteBtcBalance,
	remoteAssetBalance bool) coOpCloseBalanceCheck {

	return func(t *testing.T, local, remote *HarnessNode,
		closeTx *wire.MsgTx, closeUpdate *lnrpc.ChannelCloseUpdate,
		assetIDs [][]byte, groupKey []byte, universeTap *tapClient) {

		defaultCoOpCloseBalanceCheck(
			t, local, remote, closeTx, closeUpdate, assetIDs,
			groupKey, universeTap, remoteBtcBalance,
			remoteAssetBalance,
		)
	}
}

// defaultCoOpCloseBalanceCheck is a default implementation of the co-op close
// balance check that can be used in tests. It assumes the initiator has both
// an asset and BTC balance left, while the responder's balance can be specified
// with the boolean variables.
func defaultCoOpCloseBalanceCheck(t *testing.T, local, remote *HarnessNode,
	closeTx *wire.MsgTx, closeUpdate *lnrpc.ChannelCloseUpdate,
	assetIDs [][]byte, groupKey []byte, universeTap *tapClient,
	remoteBtcBalance, remoteAssetBalance bool) {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

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

	closeTxid := closeTx.TxHash()
	require.Len(t, closeTx.TxOut, numOutputs)

	outIdx := 0
	dummyAmt := int64(1000)
	require.LessOrEqual(t, closeTx.TxOut[outIdx].Value, dummyAmt)

	if remoteAssetBalance {
		outIdx++
		require.LessOrEqual(t, closeTx.TxOut[outIdx].Value, dummyAmt)
	}

	// We also require there to be at most two additional outputs, one for
	// each of the asset outputs with balance.
	require.Len(t, closeUpdate.AdditionalOutputs, additionalOutputs)

	var remoteCloseOut *lnrpc.CloseOutput
	if remoteBtcBalance {
		// The remote node has received a couple of HTLCs with an above
		// dust value, so it should also have accumulated a non-dust
		// balance, even after subtracting 1k sats for the asset output.
		remoteCloseOut = closeUpdate.RemoteCloseOutput
		require.NotNil(t, remoteCloseOut)

		outIdx++
		require.EqualValues(
			t, remoteCloseOut.AmountSat-dummyAmt,
			closeTx.TxOut[outIdx].Value,
		)
	} else if remoteAssetBalance {
		// The remote node has received a couple of HTLCs but not enough
		// to go above dust. So it should still have an asset balance
		// that we can verify.
		remoteCloseOut = closeUpdate.RemoteCloseOutput
		require.NotNil(t, remoteCloseOut)
	}

	// The local node should have received the local BTC balance minus the
	// TX fees and 1k sats for the asset output.
	localCloseOut := closeUpdate.LocalCloseOutput
	require.NotNil(t, localCloseOut)
	outIdx++
	require.Greater(
		t, closeTx.TxOut[outIdx].Value,
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
			t, remoteAuxOut.PkScript,
			closeTx.TxOut[remoteAssetIndex].PkScript,
		)
	}

	require.Equal(
		t, localAuxOut.PkScript,
		closeTx.TxOut[localAssetIndex].PkScript,
	)

	// Because we don't exactly know what asset IDs made it into the close
	// transaction, we need to fetch the closed channel to find that out.
	closedChans, err := local.ClosedChannels(
		ctxt, &lnrpc.ClosedChannelsRequest{
			Cooperative: true,
		},
	)
	require.NoError(t, err)
	require.NotEmpty(t, closedChans.Channels)

	var closedJsonChannel *rfqmsg.JsonAssetChannel
	for _, closedChan := range closedChans.Channels {
		if closedChan.ClosingTxHash == closeTx.TxHash().String() {
			closedJsonChannel, err = parseChannelData(
				local, closedChan.CustomChannelData,
			)
			require.NoError(t, err)

			break
		}
	}
	require.NotNil(t, closedJsonChannel)

	// We now verify the arrival of the local balance asset proof at the
	// universe server.
	var localAssetCloseOut rfqmsg.JsonCloseOutput
	err = json.Unmarshal(
		localCloseOut.CustomChannelData, &localAssetCloseOut,
	)
	require.NoError(t, err)

	assetIDStrings := fn.Map(hex.EncodeToString, assetIDs)
	for assetIDStr, scriptKeyStr := range localAssetCloseOut.ScriptKeys {
		scriptKeyBytes, err := hex.DecodeString(scriptKeyStr)
		require.NoError(t, err)

		require.Contains(t, assetIDStrings, assetIDStr)

		// We only check for a proof if an asset of that asset ID was
		// actually in the close output, which might not always be the
		// case in grouped asset channels.
		localAssetIDs := fn.NewSet[string](fn.Map(
			func(t rfqmsg.JsonAssetTranche) string {
				return t.AssetID
			},
			closedJsonChannel.LocalAssets,
		)...)
		if !localAssetIDs.Contains(assetIDStr) {
			continue
		}

		assetID, err := hex.DecodeString(assetIDStr)
		require.NoError(t, err)

		a := assertUniverseProofExists(
			t, universeTap, assetID, groupKey, scriptKeyBytes,
			fmt.Sprintf("%v:%v", closeTxid, localAssetIndex),
		)

		localTapd := newTapClient(t, local)
		itest.AssertBalances(
			t, localTapd, a.Amount, itest.WithAssetID(assetID),
			itest.WithScriptKeyType(asset.ScriptKeyBip86),
			itest.WithScriptKey(scriptKeyBytes),
		)
	}

	// If there is no remote asset balance, we're done.
	if !remoteAssetBalance {
		return
	}

	// At this point the remote close output should be defined, otherwise
	// something went wrong.
	require.NotNil(t, remoteCloseOut)

	// And then we verify the arrival of the remote balance asset proof at
	// the universe server as well.
	var remoteAssetCloseOut rfqmsg.JsonCloseOutput
	err = json.Unmarshal(
		remoteCloseOut.CustomChannelData, &remoteAssetCloseOut,
	)
	require.NoError(t, err)

	for assetIDStr, scriptKeyStr := range remoteAssetCloseOut.ScriptKeys {
		scriptKeyBytes, err := hex.DecodeString(scriptKeyStr)
		require.NoError(t, err)

		require.Contains(t, assetIDStrings, assetIDStr)

		// We only check for a proof if an asset of that asset ID was
		// actually in the close output, which might not always be the
		// case in grouped asset channels.
		remoteAssetIDs := fn.NewSet[string](fn.Map(
			func(t rfqmsg.JsonAssetTranche) string {
				return t.AssetID
			},
			closedJsonChannel.RemoteAssets,
		)...)
		if !remoteAssetIDs.Contains(assetIDStr) {
			continue
		}

		assetID, err := hex.DecodeString(assetIDStr)
		require.NoError(t, err)

		a := assertUniverseProofExists(
			t, universeTap, assetID, groupKey, scriptKeyBytes,
			fmt.Sprintf("%v:%v", closeTxid, remoteAssetIndex),
		)

		remoteTapd := newTapClient(t, remote)
		itest.AssertBalances(
			t, remoteTapd, a.Amount, itest.WithAssetID(assetID),
			itest.WithScriptKeyType(asset.ScriptKeyBip86),
			itest.WithScriptKey(scriptKeyBytes),
		)
	}
}

// initiatorZeroAssetBalanceCoOpBalanceCheck is a co-op close balance check
// function that can be used when the initiator has a zero asset balance.
func initiatorZeroAssetBalanceCoOpBalanceCheck(t *testing.T, _,
	remote *HarnessNode, closeTx *wire.MsgTx,
	closeUpdate *lnrpc.ChannelCloseUpdate, assetIDs [][]byte,
	groupKey []byte, universeTap *tapClient) {

	// With the channel closed, we'll now assert that the co-op close
	// transaction was inserted into the local universe.
	//
	// Since the initiator has a zero asset balance, we expect that at most
	// three outputs exist: one for the remote asset output, one for the
	// remote BTC channel balance and one for the initiator's BTC channel
	// balance (which cannot be zero or below dust due to the mandatory
	// channel reserve).
	numOutputs := 3

	closeTxid := closeTx.TxHash()
	require.Len(t, closeTx.TxOut, numOutputs)

	// We assume that the local node has a non-zero BTC balance left.
	localOut, _ := closeTxOut(t, closeTx, closeUpdate, true)
	require.Greater(t, localOut.Value, int64(1000))

	// We also require there to be exactly one additional output, which is
	// the remote asset output.
	require.Len(t, closeUpdate.AdditionalOutputs, 1)
	assetTxOut, assetOutputIndex := findTxOut(
		t, closeTx, closeUpdate.AdditionalOutputs[0].PkScript,
	)
	require.LessOrEqual(t, assetTxOut.Value, int64(1000))

	// The remote node has received a couple of HTLCs with an above
	// dust value, so it should also have accumulated a non-dust
	// balance, even after subtracting 1k sats for the asset output.
	remoteCloseOut := closeUpdate.RemoteCloseOutput
	require.NotNil(t, remoteCloseOut)

	// Find out which of the additional outputs is the local one and which
	// is the remote.
	remoteAuxOut := closeUpdate.AdditionalOutputs[0]
	require.False(t, remoteAuxOut.IsLocal)

	// And then we verify the arrival of the remote balance asset proof at
	// the universe server as well.
	var remoteAssetCloseOut rfqmsg.JsonCloseOutput
	err := json.Unmarshal(
		remoteCloseOut.CustomChannelData, &remoteAssetCloseOut,
	)
	require.NoError(t, err)

	assetIDStrings := fn.Map(hex.EncodeToString, assetIDs)
	for assetIDStr, scriptKeyStr := range remoteAssetCloseOut.ScriptKeys {
		scriptKeyBytes, err := hex.DecodeString(scriptKeyStr)
		require.NoError(t, err)

		require.Contains(t, assetIDStrings, assetIDStr)

		assetID, err := hex.DecodeString(assetIDStr)
		require.NoError(t, err)

		a := assertUniverseProofExists(
			t, universeTap, assetID, groupKey, scriptKeyBytes,
			fmt.Sprintf("%v:%v", closeTxid, assetOutputIndex),
		)

		remoteTapd := newTapClient(t, remote)
		itest.AssertBalances(
			t, remoteTapd, a.Amount, itest.WithAssetID(assetID),
			itest.WithScriptKeyType(asset.ScriptKeyBip86),
			itest.WithScriptKey(scriptKeyBytes),
		)
	}
}

// closeTxOut returns either the local or remote output from the close
// transaction, based on the information given in the close update.
func closeTxOut(t *testing.T, closeTx *wire.MsgTx,
	closeUpdate *lnrpc.ChannelCloseUpdate, local bool) (*wire.TxOut, int) {

	var targetPkScript []byte
	if local {
		require.NotNil(t, closeUpdate.LocalCloseOutput)
		targetPkScript = closeUpdate.LocalCloseOutput.PkScript
	} else {
		require.NotNil(t, closeUpdate.RemoteCloseOutput)
		targetPkScript = closeUpdate.RemoteCloseOutput.PkScript
	}

	return findTxOut(t, closeTx, targetPkScript)
}

// findTxOut returns the transaction output with the target pk script from the
// given transaction.
func findTxOut(t *testing.T, tx *wire.MsgTx, targetPkScript []byte) (
	*wire.TxOut, int) {

	for i, txOut := range tx.TxOut {
		if bytes.Equal(txOut.PkScript, targetPkScript) {
			return txOut, i
		}
	}

	t.Fatalf("close output (targetPkScript=%x) not found in close "+
		"transaction", targetPkScript)

	return &wire.TxOut{}, 0
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
	authmailboxrpc.MailboxClient
}

func newTapClient(t *testing.T, node *HarnessNode) *tapClient {
	cfg := node.Cfg
	superMacFile := bakeSuperMacaroon(t, cfg, getLiTMacFromFile, false)

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
	mboxClient := authmailboxrpc.NewMailboxClient(rawConn)

	return &tapClient{
		node:                       node,
		TaprootAssetsClient:        assetsClient,
		AssetWalletClient:          assetWalletClient,
		TapDevClient:               devClient,
		MintClient:                 mintMintClient,
		RfqClient:                  rfqClient,
		TaprootAssetChannelsClient: tchClient,
		UniverseClient:             universeClient,
		MailboxClient:              mboxClient,
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

func spendableBalance(client *tapClient, assetID,
	groupKey []byte) (uint64, error) {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, shortTimeout)
	defer cancel()

	utxos, err := client.ListUtxos(ctxt, &taprpc.ListUtxosRequest{})
	if err != nil {
		return 0, err
	}

	assets := tapfn.FlatMap(
		maps.Values(utxos.ManagedUtxos),
		func(utxo *taprpc.ManagedUtxo) []*taprpc.Asset {
			return utxo.Assets
		},
	)

	relevantAssets := fn.Filter(func(utxo *taprpc.Asset) bool {
		if len(groupKey) > 0 {
			return bytes.Equal(
				utxo.AssetGroup.TweakedGroupKey, groupKey,
			)
		}

		return bytes.Equal(utxo.AssetGenesis.AssetId, assetID)
	}, assets)

	var assetSum uint64
	for _, a := range relevantAssets {
		if a.ScriptKeyIsLocal {
			assetSum += a.Amount
		}
	}

	return assetSum, nil
}

// assertSpendableBalance differs from assertAssetBalance in that it asserts
// that the entire balance is spendable. We consider something spendable if we
// have a local script key for it.
func assertSpendableBalance(t *testing.T, client *tapClient, assetID,
	groupKey []byte, expectedBalance uint64) {

	t.Helper()

	err := wait.NoError(func() error {
		assetSum, err := spendableBalance(client, assetID, groupKey)
		if err != nil {
			return err
		}

		if assetSum != expectedBalance {
			return fmt.Errorf("expected balance %d, got %d",
				expectedBalance, assetSum)
		}

		return nil
	}, shortTimeout)
	if err != nil {
		ctxb := context.Background()
		listResp, err2 := client.ListAssets(
			ctxb, &taprpc.ListAssetRequest{},
		)
		require.NoError(t, err2)

		t.Logf("Failed to assert expected balance of %d, current "+
			"assets: %v", expectedBalance, toProtoJSON(t, listResp))

		utxos, err2 := client.ListUtxos(
			ctxb, &taprpc.ListUtxosRequest{},
		)
		require.NoError(t, err2)

		t.Logf("Current UTXOs: %v", toProtoJSON(t, utxos))

		t.Fatalf("Failed to assert balance: %v", err)
	}
}

func logBalance(t *testing.T, nodes []*HarnessNode, assetID []byte,
	occasion string) {

	t.Helper()

	time.Sleep(time.Millisecond * 250)

	for _, node := range nodes {
		local, remote, localSat, remoteSat := getAssetChannelBalance(
			t, node, [][]byte{assetID}, false,
		)

		t.Logf("%-7s balance: local=%-9d remote=%-9d, localSat=%-9d, "+
			"remoteSat=%-9d (%v)", node.Cfg.Name, local, remote,
			localSat, remoteSat, occasion)
	}
}

func logBalanceGroup(t *testing.T, nodes []*HarnessNode, assetIDs [][]byte,
	occasion string) {

	t.Helper()

	time.Sleep(time.Millisecond * 250)

	for _, node := range nodes {
		local, remote, localSat, remoteSat := getAssetChannelBalance(
			t, node, assetIDs, false,
		)

		t.Logf("%-7s balance: local=%-9d remote=%-9d, localSat=%-9d, "+
			"remoteSat=%-9d (%v)", node.Cfg.Name, local, remote,
			localSat, remoteSat, occasion)
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

func assertMinNumHtlcs(t *testing.T, node *HarnessNode, expected int) {
	t.Helper()

	ctxb := context.Background()

	err := wait.NoError(func() error {
		listChansRequest := &lnrpc.ListChannelsRequest{}
		listChansResp, err := node.ListChannels(ctxb, listChansRequest)
		if err != nil {
			return err
		}

		var numHtlcs int
		for _, channel := range listChansResp.Channels {
			numHtlcs += len(channel.PendingHtlcs)
		}

		if numHtlcs < expected {
			return fmt.Errorf("expected %v HTLCs, got %v, %v",
				expected, numHtlcs,
				toProtoJSON(t, listChansResp))
		}

		return nil
	}, defaultTimeout)
	require.NoError(t, err)
}

type subscribeEventsClient = routerrpc.Router_SubscribeHtlcEventsClient

type htlcEventConfig struct {
	timeout            time.Duration
	numEvents          int
	withLinkFailure    bool
	withForwardFailure bool
	withFailureDetail  routerrpc.FailureDetail
}

func defaultHtlcEventConfig() *htlcEventConfig {
	return &htlcEventConfig{
		timeout: defaultTimeout,
	}
}

type htlcEventOpt func(*htlcEventConfig)

func withTimeout(timeout time.Duration) htlcEventOpt {
	return func(config *htlcEventConfig) {
		config.timeout = timeout
	}
}

func withNumEvents(numEvents int) htlcEventOpt {
	return func(config *htlcEventConfig) {
		config.numEvents = numEvents
	}
}

func withLinkFailure(detail routerrpc.FailureDetail) htlcEventOpt {
	return func(config *htlcEventConfig) {
		config.withLinkFailure = true
		config.withFailureDetail = detail
	}
}

func withForwardFailure() htlcEventOpt {
	return func(config *htlcEventConfig) {
		config.withForwardFailure = true
	}
}

func assertHtlcEvents(t *testing.T, c subscribeEventsClient,
	opts ...htlcEventOpt) {

	t.Helper()

	cfg := defaultHtlcEventConfig()
	for _, opt := range opts {
		opt(cfg)
	}

	timeout := time.After(cfg.timeout)
	events := make(chan *routerrpc.HtlcEvent)

	go func() {
		defer close(events)

		for {
			evt, err := c.Recv()
			if err != nil {
				t.Logf("Received HTLC event error: %v", err)
				return
			}

			select {
			case events <- evt:
			case <-timeout:
				t.Logf("Htlc event receive timeout")
				return
			}
		}
	}()

	var numEvents int
	for {
		type (
			linkFailEvent    = *routerrpc.HtlcEvent_LinkFailEvent
			forwardFailEvent = *routerrpc.HtlcEvent_ForwardFailEvent
		)

		select {
		case evt, ok := <-events:
			if !ok {
				t.Fatalf("Htlc event stream closed")
				return
			}

			if cfg.withLinkFailure {
				linkEvent, ok := evt.Event.(linkFailEvent)
				if !ok {
					// We only count link failure events.
					continue
				}

				if linkEvent.LinkFailEvent.FailureDetail !=
					cfg.withFailureDetail {

					continue
				}
			}

			if cfg.withForwardFailure {
				_, ok := evt.Event.(forwardFailEvent)
				if !ok {
					// We only count link failure events.
					continue
				}
			}

			numEvents++

			if numEvents == cfg.numEvents {
				return
			}

		case <-timeout:
			t.Fatalf("Htlc event receive timeout")
			return
		}
	}
}

func assertNumHtlcs(t *testing.T, node *HarnessNode, expected int) {
	t.Helper()

	ctxb := context.Background()

	err := wait.NoError(func() error {
		listChansRequest := &lnrpc.ListChannelsRequest{}
		listChansResp, err := node.ListChannels(ctxb, listChansRequest)
		if err != nil {
			return err
		}

		var numHtlcs int
		for _, channel := range listChansResp.Channels {
			numHtlcs += len(channel.PendingHtlcs)
		}

		if numHtlcs != expected {
			return fmt.Errorf("expected %v HTLCs, got %v, %v",
				expected, numHtlcs,
				spew.Sdump(toProtoJSON(t, listChansResp)))
		}

		return nil
	}, defaultTimeout)
	require.NoError(t, err)
}

type forceCloseExpiryInfo struct {
	currentHeight uint32
	csvDelay      uint32

	cltvDelays map[lntypes.Hash]uint32

	localAssetBalance  uint64
	remoteAssetBalance uint64

	t *testing.T

	node *HarnessNode
}

func (f *forceCloseExpiryInfo) blockTillExpiry(hash lntypes.Hash) uint32 {
	ctxb := context.Background()
	nodeInfo, err := f.node.GetInfo(ctxb, &lnrpc.GetInfoRequest{})
	require.NoError(f.t, err)

	cltv, ok := f.cltvDelays[hash]
	require.True(f.t, ok)

	f.t.Logf("current_height=%v, expiry=%v, mining %v blocks",
		nodeInfo.BlockHeight, cltv, cltv-nodeInfo.BlockHeight)

	return cltv - nodeInfo.BlockHeight
}

func newCloseExpiryInfo(t *testing.T, node *HarnessNode) forceCloseExpiryInfo {
	ctxb := context.Background()

	listChansRequest := &lnrpc.ListChannelsRequest{}
	listChansResp, err := node.ListChannels(ctxb, listChansRequest)
	require.NoError(t, err)

	mainChan := listChansResp.Channels[0]

	nodeInfo, err := node.GetInfo(ctxb, &lnrpc.GetInfoRequest{})
	require.NoError(t, err)

	cltvs := make(map[lntypes.Hash]uint32)
	for _, htlc := range mainChan.PendingHtlcs {
		var payHash lntypes.Hash
		copy(payHash[:], htlc.HashLock)
		cltvs[payHash] = htlc.ExpirationHeight
	}

	assetData, err := parseChannelData(node, mainChan.CustomChannelData)
	require.NoError(t, err)

	return forceCloseExpiryInfo{
		csvDelay:           mainChan.CsvDelay,
		currentHeight:      nodeInfo.BlockHeight,
		cltvDelays:         cltvs,
		localAssetBalance:  assetData.LocalBalance,
		remoteAssetBalance: assetData.RemoteBalance,
		t:                  t,
		node:               node,
	}
}

// AssertHLTCNotActive asserts the node doesn't have a pending HTLC in the
// given channel, which mean either the HTLC never exists, or it was pending
// and now settled. Returns the HTLC if found and active.
func assertHTLCNotActive(t *testing.T, hn *HarnessNode,
	cp *lnrpc.ChannelPoint, payHash []byte) *lnrpc.HTLC {

	var result *lnrpc.HTLC
	target := hex.EncodeToString(payHash)

	err := wait.NoError(func() error {
		// We require the RPC call to be succeeded and won't wait for
		// it as it's an unexpected behavior.
		ch := fetchChannel(t, hn, cp)

		// Check all payment hashes active for this channel.
		for _, htlc := range ch.PendingHtlcs {
			h := hex.EncodeToString(htlc.HashLock)

			// Break if found the htlc.
			if h == target {
				result = htlc
				break
			}
		}

		// If we've found nothing, we're done.
		if result == nil {
			return nil
		}

		// Otherwise return an error.
		return fmt.Errorf("node [%s:%x] still has: the payHash %x",
			hn.Name(), hn.PubKey[:], payHash)
	}, defaultTimeout)
	require.NoError(t, err, "timeout checking pending HTLC")

	return result
}

func assertInvoiceState(t *testing.T, hn *HarnessNode, payAddr []byte,
	expectedState lnrpc.Invoice_InvoiceState) {

	msg := &invoicesrpc.LookupInvoiceMsg{
		InvoiceRef: &invoicesrpc.LookupInvoiceMsg_PaymentAddr{
			PaymentAddr: payAddr,
		},
	}

	err := wait.NoError(func() error {
		invoice, err := hn.InvoicesClient.LookupInvoiceV2(
			context.Background(), msg,
		)
		if err != nil {
			return err
		}

		if invoice.State == expectedState {
			return nil
		}

		return fmt.Errorf("%s: invoice with payment address %x not "+
			"in state %s", hn.Name(), payAddr, expectedState)
	}, defaultTimeout)
	require.NoError(t, err, "timeout waiting for invoice settled state")
}

type pendingChan = lnrpc.PendingChannelsResponse_PendingChannel

// assertWaitingCloseChannelAssetData asserts that the waiting close channel has
// the expected asset data.
func assertPendingChannelAssetData(t *testing.T, node *HarnessNode,
	chanPoint *lnrpc.ChannelPoint, find func(string,
		*lnrpc.PendingChannelsResponse) (*pendingChan, error)) {

	ctxb := context.Background()

	err := wait.NoError(func() error {
		// Make sure we can find the closed channel in the channel
		// database.
		pendingChannels, err := node.PendingChannels(
			ctxb, &lnrpc.PendingChannelsRequest{},
		)
		if err != nil {
			return err
		}

		targetChanPointStr := fmt.Sprintf("%v:%v",
			chanPoint.GetFundingTxidStr(),
			chanPoint.GetOutputIndex())

		targetChan, err := find(targetChanPointStr, pendingChannels)
		if err != nil {
			return err
		}

		if len(targetChan.CustomChannelData) == 0 {
			return fmt.Errorf("pending channel %s has no "+
				"custom channel data", targetChanPointStr)
		}

		closeData, err := parseChannelData(
			node, targetChan.CustomChannelData,
		)
		if err != nil {
			return fmt.Errorf("error unmarshalling custom channel "+
				"data: %v", err)
		}

		if len(closeData.FundingAssets) == 0 {
			return fmt.Errorf("expected at least 1 funding asset, "+
				"got %d", len(closeData.FundingAssets))
		}

		return nil
	}, defaultTimeout)
	require.NoError(t, err, "timeout waiting for pending channel")
}

// assertPendingForceCloseChannelAssetData asserts that the pending force close
// channel has the expected asset data.
func assertPendingForceCloseChannelAssetData(t *testing.T, node *HarnessNode,
	chanPoint *lnrpc.ChannelPoint) {

	assertPendingChannelAssetData(
		t, node, chanPoint, func(chanPoint string,
			resp *lnrpc.PendingChannelsResponse) (*pendingChan,
			error) {

			if len(resp.PendingForceClosingChannels) == 0 {
				return nil, fmt.Errorf("no pending force close " +
					"channels found")
			}

			for _, ch := range resp.PendingForceClosingChannels {
				if ch.Channel.ChannelPoint == chanPoint {
					return ch.Channel, nil
				}
			}

			return nil, fmt.Errorf("pending channel %s not found",
				chanPoint)
		},
	)
}

// assertWaitingCloseChannelAssetData asserts that the waiting close channel has
// the expected asset data.
func assertWaitingCloseChannelAssetData(t *testing.T, node *HarnessNode,
	chanPoint *lnrpc.ChannelPoint) {

	assertPendingChannelAssetData(
		t, node, chanPoint, func(chanPoint string,
			resp *lnrpc.PendingChannelsResponse) (*pendingChan,
			error) {

			if len(resp.WaitingCloseChannels) == 0 {
				return nil, fmt.Errorf("no waiting close " +
					"channels found")
			}

			for _, ch := range resp.WaitingCloseChannels {
				if ch.Channel.ChannelPoint == chanPoint {
					return ch.Channel, nil
				}
			}

			return nil, fmt.Errorf("pending channel %s not found",
				chanPoint)
		},
	)
}

// assertClosedChannelAssetData asserts that the closed channel has the expected
// asset data.
func assertClosedChannelAssetData(t *testing.T, node *HarnessNode,
	chanPoint *lnrpc.ChannelPoint) {

	ctxb := context.Background()

	// Make sure we can find the closed channel in the channel database.
	closedChannels, err := node.ClosedChannels(
		ctxb, &lnrpc.ClosedChannelsRequest{},
	)
	require.NoError(t, err)

	require.NotEmpty(t, closedChannels.Channels)

	targetChanPointStr := fmt.Sprintf("%v:%v",
		chanPoint.GetFundingTxidStr(), chanPoint.GetOutputIndex())

	var closedChan *lnrpc.ChannelCloseSummary
	for _, ch := range closedChannels.Channels {
		if ch.ChannelPoint == targetChanPointStr {
			closedChan = ch
			break
		}
	}
	require.NotNil(t, closedChan)
	require.NotEmpty(t, closedChan.CustomChannelData)

	closeData, err := parseChannelData(node, closedChan.CustomChannelData)
	require.NoError(t, err)

	require.GreaterOrEqual(t, len(closeData.FundingAssets), 1)
}

func findForceCloseTransfer(t *testing.T, node1, node2 *tapClient,
	closeTxid *chainhash.Hash) *taprpc.ListTransfersResponse {

	var (
		ctxb   = context.Background()
		result *taprpc.ListTransfersResponse
		err    error
	)
	fErr := wait.NoError(func() error {
		result, err = node1.ListTransfers(
			ctxb, &taprpc.ListTransfersRequest{
				AnchorTxid: closeTxid.String(),
			},
		)
		if err != nil {
			return fmt.Errorf("unable to list node1 transfers: %w",
				err)
		}
		if len(result.Transfers) != 1 {
			return fmt.Errorf("node1 is missing force close " +
				"transfer")
		}

		forceCloseTransfer2, err := node2.ListTransfers(
			ctxb, &taprpc.ListTransfersRequest{
				AnchorTxid: closeTxid.String(),
			},
		)
		if err != nil {
			return fmt.Errorf("unable to list node2 transfers: %w",
				err)
		}
		if len(forceCloseTransfer2.Transfers) != 1 {
			return fmt.Errorf("node2 is missing force close " +
				"transfer")
		}

		return nil
	}, defaultTimeout)
	require.NoError(t, fErr)

	return result
}

// assertForceCloseSweeps asserts that the force close sweeps are initiated
// correctly.
func assertForceCloseSweeps(ctx context.Context, net *NetworkHarness,
	t *harnessTest, alice, bob *HarnessNode, chanPoint *lnrpc.ChannelPoint,
	aliceStartAmount uint64, assetInvoiceAmt, assetsPerMPPShard int,
	assetID, groupKey []byte, aliceHodlInvoices,
	bobHodlInvoices []assetHodlInvoice, mpp bool) (uint64, uint64) {

	aliceTap := newTapClient(t.t, alice)
	bobTap := newTapClient(t.t, bob)

	// At this point, both sides should have 4 (or +4 with MPP) HTLCs
	// active.
	numHtlcs := 4
	numAdditionalShards := assetInvoiceAmt / assetsPerMPPShard
	if mpp {
		numHtlcs += numAdditionalShards * 2
	}
	t.Logf("Asserting both Alice and Bob have %d HTLCs...", numHtlcs)
	assertNumHtlcs(t.t, alice, numHtlcs)
	assertNumHtlcs(t.t, bob, numHtlcs)

	// Before we force close, we'll grab the current height, the CSV delay
	// needed, and also the absolute timeout of the set of active HTLCs.
	closeExpiryInfo := newCloseExpiryInfo(t.t, alice)

	// With all of the HTLCs established, we'll now force close the channel
	// with Alice.
	t.Logf("Force close by Alice w/ HTLCs...")
	_, closeTxid, err := net.CloseChannel(alice, chanPoint, true)
	require.NoError(t.t, err)

	t.Logf("Channel closed! Mining blocks, close_txid=%v", closeTxid)

	// The channel should first be in "waiting close" until it confirms.
	assertWaitingCloseChannelAssetData(t.t, alice, chanPoint)

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

	// It should then go to "pending force closed".
	assertPendingForceCloseChannelAssetData(t.t, alice, chanPoint)

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
	assertSpendableBalance(
		t.t, bobTap, assetID, groupKey, bobExpectedBalance,
	)

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
	aliceExpectedBalance := aliceStartAmount
	aliceExpectedBalance += closeExpiryInfo.localAssetBalance
	assertSpendableBalance(
		t.t, aliceTap, assetID, groupKey, aliceExpectedBalance,
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
		t.t, aliceTap, assetID, groupKey, aliceExpectedBalance,
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
	numTimeoutHTLCs := 1
	if mpp {
		numTimeoutHTLCs += numAdditionalShards
	}
	assertSweepExists(
		t.t, alice,
		walletrpc.WitnessType_TAPROOT_HTLC_LOCAL_OFFERED_TIMEOUT,
	)
	assertSweepExists(
		t.t, bob,
		walletrpc.WitnessType_TAPROOT_HTLC_OFFERED_REMOTE_TIMEOUT,
	)

	t.Logf("Confirming initial HTLC timeout txns")

	timeoutSweeps, err := waitForNTxsInMempool(
		net.Miner.Client, 2, shortTimeout,
	)
	require.NoError(t.t, err)

	t.Logf("Asserting balance on sweeps: %v", timeoutSweeps)

	// Finally, we'll mine a single block to confirm them.
	mineBlocks(t, net, 1, 2)

	// Make sure Bob swept all his HTLCs.
	bobSweeps, err := bob.WalletKitClient.ListSweeps(
		ctx, &walletrpc.ListSweepsRequest{
			Verbose: true,
		},
	)
	require.NoError(t.t, err)

	var bobSweepTx *wire.MsgTx
	for _, sweep := range bobSweeps.GetTransactionDetails().Transactions {
		for _, tx := range timeoutSweeps {
			if sweep.TxHash == tx.String() {
				txBytes, err := hex.DecodeString(sweep.RawTxHex)
				require.NoError(t.t, err)

				bobSweepTx = &wire.MsgTx{}
				err = bobSweepTx.Deserialize(
					bytes.NewReader(txBytes),
				)
				require.NoError(t.t, err)
			}
		}
	}
	require.NotNil(t.t, bobSweepTx, "Bob's sweep transaction not found")

	// There's always an extra input that pays for the fees. So we can only
	// count the remainder as HTLC inputs.
	numSweptHTLCs := len(bobSweepTx.TxIn) - 1

	// If we didn't yet sweep all HTLCs, then we need to wait for another
	// sweep.
	if numSweptHTLCs < numTimeoutHTLCs {
		assertSweepExists(
			t.t, bob,
			// nolint: lll
			walletrpc.WitnessType_TAPROOT_HTLC_OFFERED_REMOTE_TIMEOUT,
		)

		t.Logf("Confirming additional HTLC timeout sweep txns")

		additionalTimeoutSweeps, err := waitForNTxsInMempool(
			net.Miner.Client, 1, shortTimeout,
		)
		require.NoError(t.t, err)

		t.Logf("Asserting balance on additional timeout sweeps: %v",
			additionalTimeoutSweeps)

		// Finally, we'll mine a single block to confirm them.
		mineBlocks(t, net, 1, 1)
	}

	// At this point, Bob's balance should be incremented by an additional
	// HTLC value.
	bobExpectedBalance += uint64(assetInvoiceAmt - 1)
	assertSpendableBalance(
		t.t, bobTap, assetID, groupKey, bobExpectedBalance,
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

	return aliceExpectedBalance, bobExpectedBalance
}

// oldJsonAssetChanInfo is a struct that represents the old channel information
// of a single asset within a channel, as it looked for litd v0.14.1 and before.
type oldJsonAssetChanInfo struct {
	AssetInfo     rfqmsg.JsonAssetUtxo `json:"asset_utxo"`
	Capacity      uint64               `json:"capacity"`
	LocalBalance  uint64               `json:"local_balance"`
	RemoteBalance uint64               `json:"remote_balance"`
}

// oldJsonAssetChannel is a struct that represents the old channel information
// of all assets within a channel, as it looked for litd v0.14.1 and before.
type oldJsonAssetChannel struct {
	Assets []oldJsonAssetChanInfo `json:"assets"`
}

// parseChannelData parses the given channel data into a rfqmsg.JsonAssetChannel
// struct. It can deal with the old (litd v0.14.1 and before) and new (litd
// v0.15.0 and after) channel data formats.
func parseChannelData(node *HarnessNode,
	data []byte) (*rfqmsg.JsonAssetChannel, error) {

	var closeData rfqmsg.JsonAssetChannel
	if node.Cfg.OldChannelFormat {
		var oldData oldJsonAssetChannel
		err := json.Unmarshal(data, &oldData)
		if err != nil {
			return nil, fmt.Errorf("error unmarshalling old "+
				"channel data: %w", err)
		}

		oldAsset := oldData.Assets[0]
		closeData.FundingAssets = []rfqmsg.JsonAssetUtxo{
			oldAsset.AssetInfo,
		}
		closeData.Capacity = oldAsset.Capacity
		closeData.LocalBalance = oldAsset.LocalBalance
		closeData.RemoteBalance = oldAsset.RemoteBalance

		return &closeData, nil
	}

	err := json.Unmarshal(data, &closeData)
	if err != nil {
		return nil, fmt.Errorf("error unmarshalling channel data: %w",
			err)
	}

	return &closeData, nil
}
