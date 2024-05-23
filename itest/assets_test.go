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

	"github.com/btcsuite/btcd/btcec/v2"
	"github.com/btcsuite/btcd/btcec/v2/schnorr"
	"github.com/btcsuite/btcd/btcutil"
	"github.com/btcsuite/btcd/chaincfg/chainhash"
	"github.com/btcsuite/btcd/wire"
	"github.com/davecgh/go-spew/spew"
	tapfn "github.com/lightninglabs/taproot-assets/fn"
	"github.com/lightninglabs/taproot-assets/itest"
	"github.com/lightninglabs/taproot-assets/proof"
	"github.com/lightninglabs/taproot-assets/rfq"
	"github.com/lightninglabs/taproot-assets/rfqmath"
	"github.com/lightninglabs/taproot-assets/rfqmsg"
	"github.com/lightninglabs/taproot-assets/tapfreighter"
	"github.com/lightninglabs/taproot-assets/taprpc"
	"github.com/lightninglabs/taproot-assets/taprpc/assetwalletrpc"
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
	fundingScriptTreeBytes := fundingScriptKey.SerializeCompressed()

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

	// After opening the channels, the asset balance of the funding nodes
	// should have been decreased with the funding amount. The asset with
	// the funding output was imported into the asset DB but are kept out of
	// the balance reporting by tapd.
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
		t.t, erinTap, assetID, assetSendAmount-erinFundingAmount, nil,
		true, false, false,
	)
	assertAssetExists(
		t.t, erinTap, assetID, erinFundingAmount, fundingScriptKey,
		false, true, true,
	)

	// Assert that the proofs for both channels has been uploaded to the
	// designated Universe server.
	assertUniverseProofExists(
		t.t, universeTap, assetID, groupKey, fundingScriptTreeBytes,
		fmt.Sprintf("%v:%v", fundRespCD.Txid, fundRespCD.OutputIndex),
	)
	assertUniverseProofExists(
		t.t, universeTap, assetID, groupKey, fundingScriptTreeBytes,
		fmt.Sprintf("%v:%v", fundRespDY.Txid, fundRespDY.OutputIndex),
	)
	assertUniverseProofExists(
		t.t, universeTap, assetID, groupKey, fundingScriptTreeBytes,
		fmt.Sprintf("%v:%v", fundRespEF.Txid, fundRespEF.OutputIndex),
	)

	// Make sure the channel shows the correct asset information.
	assertAssetChan(
		t.t, charlieTap.node, daveTap.node, charlieFundingAmount,
		mintedAsset,
	)
	assertAssetChan(
		t.t, daveTap.node, yaraTap.node, daveFundingAmount, mintedAsset,
	)
	assertAssetChan(
		t.t, erinTap.node, fabiaTap.node, erinFundingAmount,
		mintedAsset,
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

	t.Logf("Asserting proof outpoint=%v, script_key=%x", outpoint,
		scriptKey)

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
	var pendingJSON rfqmsg.JsonAssetChannel
	err = json.Unmarshal(
		pendingChan.Channel.CustomChannelData, &pendingJSON,
	)
	require.NoError(t, err)
	require.Len(t, pendingJSON.Assets, 1)

	require.NotZero(t, pendingJSON.Assets[0].Capacity)

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
		pendingJSON.Assets[0].AssetInfo.DecimalDisplay,
	)

	// Check the balance of the pending channel.
	assetID := mintedAsset.AssetGenesis.AssetId
	pendingLocalBalance, pendingRemoteBalance, _, _ :=
		getAssetChannelBalance(
			t, node, assetID, true,
		)
	require.EqualValues(t, localSum, pendingLocalBalance)
	require.EqualValues(t, remoteSum, pendingRemoteBalance)
}

func assertAssetChan(t *testing.T, src, dst *HarnessNode, fundingAmount uint64,
	mintedAsset *taprpc.Asset) {

	assetID := mintedAsset.AssetGenesis.AssetId
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

		// Check the decimal display of the channel funding blob. If no
		// explicit value was set, we assume and expect the value of 0.
		var expectedDecimalDisplay uint8
		if mintedAsset.DecimalDisplay != nil {
			expectedDecimalDisplay = uint8(
				mintedAsset.DecimalDisplay.DecimalDisplay,
			)
		}

		if a.AssetInfo.DecimalDisplay != expectedDecimalDisplay {
			return fmt.Errorf("expected decimal display %d, got %d",
				expectedDecimalDisplay,
				a.AssetInfo.DecimalDisplay)
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
	pending bool) (uint64, uint64, uint64, uint64) {

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

	targetChan := fetchChannel(t, node, chanPoint)

	var assetBalance rfqmsg.JsonAssetChannel
	err := json.Unmarshal(targetChan.CustomChannelData, &assetBalance)
	require.NoError(t, err)

	require.Len(t, assetBalance.Assets, 1)

	require.InDelta(t, local, assetBalance.Assets[0].LocalBalance, 1)
	require.InDelta(t, remote, assetBalance.Assets[0].RemoteBalance, 1)
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
	}

	stream, err := srcTapd.SendPayment(ctxt, &tchrpc.SendPaymentRequest{
		AssetId:        assetID,
		AssetAmount:    amt,
		PaymentRequest: sendReq,
	})
	require.NoError(t, err)

	result, err := getAssetPaymentResult(stream, false)
	require.NoError(t, err)
	if result.Status == lnrpc.Payment_FAILED {
		t.Logf("Failure reason: %v", result.FailureReason)
	}
	require.Equal(t, cfg.payStatus, result.Status)
	require.Equal(t, cfg.failureReason, result.FailureReason)
}

func sendKeySendPayment(t *testing.T, src, dst *HarnessNode,
	amt btcutil.Amount) {

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
		Dest:              dst.PubKey[:],
		Amt:               int64(amt),
		DestCustomRecords: customRecords,
		PaymentHash:       hash[:],
		TimeoutSeconds:    int32(PaymentTimeout.Seconds()),
	}

	stream, err := src.RouterClient.SendPaymentV2(ctxt, req)
	require.NoError(t, err)

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
	amountSat btcutil.Amount, assetID []byte, opts ...payOpt) uint64 {

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

	numUnits, _ := payInvoiceWithAssets(
		t, src, rfqPeer, invoiceResp.PaymentRequest, assetID, opts...,
	)

	return numUnits
}

func payInvoiceWithSatoshi(t *testing.T, payer *HarnessNode,
	invoice *lnrpc.AddInvoiceResponse, opts ...payOpt) {

	cfg := defaultPayConfig()
	for _, opt := range opts {
		opt(cfg)
	}

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	sendReq := &routerrpc.SendPaymentRequest{
		PaymentRequest:   invoice.PaymentRequest,
		TimeoutSeconds:   int32(PaymentTimeout.Seconds()),
		MaxShardSizeMsat: 80_000_000,
		FeeLimitMsat:     1_000_000,
	}
	stream, err := payer.RouterClient.SendPaymentV2(ctxt, sendReq)
	require.NoError(t, err)

	result, err := getPaymentResult(stream)
	if cfg.expectTimeout {
		require.ErrorContains(t, err, "context deadline exceeded")
	} else {
		require.NoError(t, err)
		require.Equal(t, cfg.payStatus, result.Status)
		require.Equal(t, cfg.failureReason, result.FailureReason)
	}
}

func payInvoiceWithSatoshiLastHop(t *testing.T, payer *HarnessNode,
	invoice *lnrpc.AddInvoiceResponse, hopPub []byte,
	expectedStatus lnrpc.Payment_PaymentStatus) {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	routeRes, err := payer.RouterClient.BuildRoute(
		ctxb, &routerrpc.BuildRouteRequest{
			AmtMsat:        17800,
			FinalCltvDelta: 80,
			PaymentAddr:    invoice.PaymentAddr,
			HopPubkeys:     [][]byte{hopPub},
		},
	)
	require.NoError(t, err)

	res, err := payer.RouterClient.SendToRouteV2(
		ctxt, &routerrpc.SendToRouteRequest{
			PaymentHash: invoice.RHash,
			Route:       routeRes.Route,
		},
	)

	switch expectedStatus {
	case lnrpc.Payment_FAILED:
		require.NoError(t, err)
		require.Equal(t, lnrpc.HTLCAttempt_FAILED, res.Status)
		require.Nil(t, res.Preimage)

	case lnrpc.Payment_SUCCEEDED:
		require.NoError(t, err)
		require.Equal(t, lnrpc.HTLCAttempt_SUCCEEDED, res.Status)
	}
}

type payConfig struct {
	smallShards   bool
	expectTimeout bool
	payStatus     lnrpc.Payment_PaymentStatus
	failureReason lnrpc.PaymentFailureReason
	rfq           fn.Option[rfqmsg.ID]
}

func defaultPayConfig() *payConfig {
	return &payConfig{
		smallShards:   false,
		expectTimeout: false,
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

func withExpectTimeout() payOpt {
	return func(c *payConfig) {
		c.expectTimeout = true
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
		PaymentRequest: payReq,
		TimeoutSeconds: int32(PaymentTimeout.Seconds()),
		FeeLimitMsat:   1_000_000,
	}

	if cfg.smallShards {
		sendReq.MaxShardSizeMsat = 80_000_000
	}

	var rfqBytes []byte
	cfg.rfq.WhenSome(func(i rfqmsg.ID) {
		rfqBytes = make([]byte, len(i[:]))
		copy(rfqBytes, i[:])
	})

	stream, err := payerTapd.SendPayment(ctxt, &tchrpc.SendPaymentRequest{
		AssetId:        assetID,
		PeerPubkey:     rfqPeer.PubKey[:],
		PaymentRequest: sendReq,
		RfqId:          rfqBytes,
	})
	require.NoError(t, err)

	var (
		numUnits uint64
		rateVal  rfqmath.FixedPoint[rfqmath.BigInt]
	)
	if cfg.rfq.IsNone() {
		// We want to receive the accepted quote message first, so we
		// know how many assets we're going to pay.
		quoteMsg, err := stream.Recv()
		require.NoError(t, err)
		acceptedQuote := quoteMsg.GetAcceptedSellOrder()
		require.NotNil(t, acceptedQuote)

		peerPubKey := acceptedQuote.Peer
		require.Equal(t, peerPubKey, rfqPeer.PubKeyStr)

		rpcRate := acceptedQuote.BidAssetRate
		rate, err := rfqrpc.UnmarshalFixedPoint(rpcRate)
		require.NoError(t, err)

		rateVal = *rate

		t.Logf("Got quote for %v asset units per BTC", rate)

		amountMsat := lnwire.MilliSatoshi(decodedInvoice.NumMsat)
		milliSatsFP := rfqmath.MilliSatoshiToUnits(amountMsat, *rate)
		numUnits = milliSatsFP.ScaleTo(0).ToUint64()
		msatPerUnit := float64(decodedInvoice.NumMsat) /
			float64(numUnits)
		t.Logf("Got quote for %v asset units at %3f msat/unit from "+
			"peer %s with SCID %d", numUnits, msatPerUnit,
			peerPubKey, acceptedQuote.Scid)
	}

	result, err := getAssetPaymentResult(
		stream, cfg.payStatus == lnrpc.Payment_IN_FLIGHT,
	)
	require.NoError(t, err)
	require.Equal(t, cfg.payStatus, result.Status)
	require.Equal(t, cfg.failureReason, result.FailureReason)

	return numUnits, rateVal
}

func createAssetInvoice(t *testing.T, dstRfqPeer, dst *HarnessNode,
	assetAmount uint64, assetID []byte) *lnrpc.AddInvoiceResponse {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	timeoutSeconds := int64(rfq.DefaultInvoiceExpiry.Seconds())

	t.Logf("Asking peer %x for quote to buy assets to receive for "+
		"invoice over %d units; waiting up to %ds",
		dstRfqPeer.PubKey[:], assetAmount, timeoutSeconds)

	dstTapd := newTapClient(t, dst)

	resp, err := dstTapd.AddInvoice(ctxt, &tchrpc.AddInvoiceRequest{
		AssetId:     assetID,
		AssetAmount: assetAmount,
		PeerPubkey:  dstRfqPeer.PubKey[:],
		InvoiceRequest: &lnrpc.Invoice{
			Memo: fmt.Sprintf("this is an asset invoice over "+
				"%d units", assetAmount),
			Expiry: timeoutSeconds,
		},
	})
	require.NoError(t, err)

	decodedInvoice, err := dst.DecodePayReq(ctxt, &lnrpc.PayReqString{
		PayReq: resp.InvoiceResult.PaymentRequest,
	})
	require.NoError(t, err)

	rpcRate := resp.AcceptedBuyQuote.AskAssetRate
	rate, err := rfqrpc.UnmarshalFixedPoint(rpcRate)
	require.NoError(t, err)

	t.Logf("Got quote for %v asset units per BTC", rate)

	assetUnits := rfqmath.NewBigIntFixedPoint(assetAmount, 0)
	numMSats := rfqmath.UnitsToMilliSatoshi(assetUnits, *rate)
	mSatPerUnit := float64(decodedInvoice.NumMsat) / float64(assetAmount)

	require.EqualValues(t, numMSats, decodedInvoice.NumMsat)

	t.Logf("Got quote for %d mSats at %3f msat/unit from peer %x with "+
		"SCID %d", decodedInvoice.NumMsat, mSatPerUnit,
		dstRfqPeer.PubKey[:], resp.AcceptedBuyQuote.Scid)

	return resp.InvoiceResult
}

// assertInvoiceHtlcAssets makes sure the invoice with the given hash shows the
// individual HTLCs that arrived for it and that they show the correct asset
// amounts for the given ID when decoded.
func assertInvoiceHtlcAssets(t *testing.T, node *HarnessNode,
	addedInvoice *lnrpc.AddInvoiceResponse, assetID []byte,
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

	targetID := hex.EncodeToString(assetID)

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
	assetID []byte, assetAmount uint64) {

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

	targetID := hex.EncodeToString(assetID)

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
	assetAmount uint64, assetID []byte) assetHodlInvoice {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	timeoutSeconds := int64(rfq.DefaultInvoiceExpiry.Seconds())

	t.Logf("Asking peer %x for quote to buy assets to receive for "+
		"invoice over %d units; waiting up to %ds",
		dstRfqPeer.PubKey[:], assetAmount, timeoutSeconds)

	dstTapd := newTapClient(t, dst)

	// As this is a hodl invoice, we'll also need to create a preimage
	// external to lnd.
	var preimage lntypes.Preimage
	_, err := rand.Read(preimage[:])
	require.NoError(t, err)

	payHash := preimage.Hash()

	resp, err := dstTapd.AddInvoice(ctxt, &tchrpc.AddInvoiceRequest{
		AssetId:     assetID,
		AssetAmount: assetAmount,
		PeerPubkey:  dstRfqPeer.PubKey[:],
		InvoiceRequest: &lnrpc.Invoice{
			Memo: fmt.Sprintf("this is an asset invoice over "+
				"%d units", assetAmount),
			Expiry: timeoutSeconds,
		},
		HodlInvoice: &tchrpc.HodlInvoice{
			PaymentHash: payHash[:],
		},
	})
	require.NoError(t, err)

	decodedInvoice, err := dst.DecodePayReq(ctxt, &lnrpc.PayReqString{
		PayReq: resp.InvoiceResult.PaymentRequest,
	})
	require.NoError(t, err)

	rpcRate := resp.AcceptedBuyQuote.AskAssetRate
	rate, err := rfqrpc.UnmarshalFixedPoint(rpcRate)
	require.NoError(t, err)

	assetUnits := rfqmath.NewBigIntFixedPoint(assetAmount, 0)
	numMSats := rfqmath.UnitsToMilliSatoshi(assetUnits, *rate)
	mSatPerUnit := float64(decodedInvoice.NumMsat) / float64(assetAmount)

	require.EqualValues(t, uint64(numMSats), uint64(decodedInvoice.NumMsat))

	t.Logf("Got quote for %d sats at %v msat/unit from peer %x with SCID "+
		"%d", decodedInvoice.NumMsat, mSatPerUnit, dstRfqPeer.PubKey[:],
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
	assetID, groupKey []byte, universeTap *tapClient)

// noOpCoOpCloseBalanceCheck is a no-op implementation of the co-op close
// balance check that can be used in tests.
func noOpCoOpCloseBalanceCheck(_ *testing.T, _, _ *HarnessNode, _ *wire.MsgTx,
	_ *lnrpc.ChannelCloseUpdate, _, _ []byte, _ *tapClient) {

	// This is a no-op function.
}

// closeAssetChannelAndAssert closes the channel between the local and remote
// node and asserts the final balances of the closing transaction.
func closeAssetChannelAndAssert(t *harnessTest, net *NetworkHarness,
	local, remote *HarnessNode, chanPoint *lnrpc.ChannelPoint,
	assetID, groupKey []byte, universeTap *tapClient,
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
		t.t, local, remote, closeTx, closeUpdate, assetID, groupKey,
		universeTap,
	)
}

// assertDefaultCoOpCloseBalance returns a default implementation of the co-op
// close balance check that can be used in tests. It assumes the initiator has
// both an asset and BTC balance left, while the responder's balance can be
// specified with the boolean variables.
func assertDefaultCoOpCloseBalance(remoteBtcBalance,
	remoteAssetBalance bool) coOpCloseBalanceCheck {

	return func(t *testing.T, local, remote *HarnessNode,
		closeTx *wire.MsgTx, closeUpdate *lnrpc.ChannelCloseUpdate,
		assetID, groupKey []byte, universeTap *tapClient) {

		defaultCoOpCloseBalanceCheck(
			t, local, remote, closeTx, closeUpdate, assetID,
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
	assetID, groupKey []byte, universeTap *tapClient, remoteBtcBalance,
	remoteAssetBalance bool) {

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

	// We now verify the arrival of the local balance asset proof at the
	// universe server.
	var localAssetCloseOut rfqmsg.JsonCloseOutput
	err := json.Unmarshal(
		localCloseOut.CustomChannelData, &localAssetCloseOut,
	)
	require.NoError(t, err)

	for assetIDStr, scriptKeyStr := range localAssetCloseOut.ScriptKeys {
		scriptKeyBytes, err := hex.DecodeString(scriptKeyStr)
		require.NoError(t, err)

		require.Equal(t, hex.EncodeToString(assetID), assetIDStr)

		a := assertUniverseProofExists(
			t, universeTap, assetID, groupKey, scriptKeyBytes,
			fmt.Sprintf("%v:%v", closeTxid, localAssetIndex),
		)

		localTapd := newTapClient(t, local)

		scriptKey, err := btcec.ParsePubKey(scriptKeyBytes)
		require.NoError(t, err)
		assertAssetExists(
			t, localTapd, assetID, a.Amount, scriptKey, true,
			true, false,
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

		require.Equal(t, hex.EncodeToString(assetID), assetIDStr)

		a := assertUniverseProofExists(
			t, universeTap, assetID, groupKey, scriptKeyBytes,
			fmt.Sprintf("%v:%v", closeTxid, remoteAssetIndex),
		)

		remoteTapd := newTapClient(t, remote)

		scriptKey, err := btcec.ParsePubKey(scriptKeyBytes)
		require.NoError(t, err)
		assertAssetExists(
			t, remoteTapd, assetID, a.Amount, scriptKey, true,
			true, false,
		)
	}
}

// initiatorZeroAssetBalanceCoOpBalanceCheck is a co-op close balance check
// function that can be used when the initiator has a zero asset balance.
func initiatorZeroAssetBalanceCoOpBalanceCheck(t *testing.T, _,
	remote *HarnessNode, closeTx *wire.MsgTx,
	closeUpdate *lnrpc.ChannelCloseUpdate, assetID, groupKey []byte,
	universeTap *tapClient) {

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

	for assetIDStr, scriptKeyStr := range remoteAssetCloseOut.ScriptKeys {
		scriptKeyBytes, err := hex.DecodeString(scriptKeyStr)
		require.NoError(t, err)

		require.Equal(t, hex.EncodeToString(assetID), assetIDStr)

		a := assertUniverseProofExists(
			t, universeTap, assetID, groupKey, scriptKeyBytes,
			fmt.Sprintf("%v:%v", closeTxid, assetOutputIndex),
		)

		remoteTapd := newTapClient(t, remote)

		scriptKey, err := btcec.ParsePubKey(scriptKeyBytes)
		require.NoError(t, err)
		assertAssetExists(
			t, remoteTapd, assetID, a.Amount, scriptKey, true,
			true, false,
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

		assetIDFound := false
		for _, balance := range assetIDBalances.AssetBalances {
			if !bytes.Equal(balance.AssetGenesis.AssetId, assetID) {
				continue
			}

			assetIDFound = true
			if expectedBalance != balance.Balance {
				return fmt.Errorf("expected balance %d, got %d",
					expectedBalance, balance.Balance)
			}
		}

		if expectedBalance > 0 && !assetIDFound {
			return fmt.Errorf("expected balance %d, got 0",
				expectedBalance)
		}
		return nil
	}, shortTimeout)
	if err != nil {
		r, err2 := client.ListAssets(ctxb, &taprpc.ListAssetRequest{})
		require.NoError(t, err2)

		t.Logf("Failed to assert expected balance of %d, current "+
			"assets: %v", expectedBalance, toProtoJSON(t, r))

		utxos, err3 := client.ListUtxos(
			ctxb, &taprpc.ListUtxosRequest{},
		)
		require.NoError(t, err3)

		t.Logf("Current UTXOs: %v", toProtoJSON(t, utxos))

		t.Fatalf("Failed to assert balance: %v", err)
	}
}

// assertSpendableBalance differs from assertAssetBalance in that it asserts
// that the entire balance is spendable. We consider something spendable if we
// have a local script key for it.
func assertSpendableBalance(t *testing.T, client *tapClient, assetID []byte,
	expectedBalance uint64) {

	t.Helper()

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, shortTimeout)
	defer cancel()

	err := wait.NoError(func() error {
		utxos, err := client.ListUtxos(ctxt, &taprpc.ListUtxosRequest{})
		if err != nil {
			return err
		}

		assets := tapfn.FlatMap(
			maps.Values(utxos.ManagedUtxos),
			func(utxo *taprpc.ManagedUtxo) []*taprpc.Asset {
				return utxo.Assets
			},
		)

		relevantAssets := fn.Filter(func(utxo *taprpc.Asset) bool {
			return bytes.Equal(utxo.AssetGenesis.AssetId, assetID)
		}, assets)

		var assetSum uint64
		for _, asset := range relevantAssets {
			if asset.ScriptKeyIsLocal {
				assetSum += asset.Amount
			}
		}

		if assetSum != expectedBalance {
			return fmt.Errorf("expected balance %d, got %d",
				expectedBalance, assetSum)
		}

		return nil
	}, shortTimeout)
	if err != nil {
		r, err2 := client.ListAssets(ctxb, &taprpc.ListAssetRequest{})
		require.NoError(t, err2)

		t.Logf("Failed to assert expected balance of %d, current "+
			"assets: %v", expectedBalance, toProtoJSON(t, r))

		utxos, err3 := client.ListUtxos(
			ctxb, &taprpc.ListUtxosRequest{},
		)
		require.NoError(t, err3)

		t.Logf("Current UTXOs: %v", toProtoJSON(t, utxos))

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

	time.Sleep(time.Millisecond * 250)

	for _, node := range nodes {
		local, remote, localSat, remoteSat :=
			getAssetChannelBalance(t, node, assetID, false)

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

	var assetData rfqmsg.JsonAssetChannel
	err = json.Unmarshal(mainChan.CustomChannelData, &assetData)
	require.NoError(t, err)

	return forceCloseExpiryInfo{
		csvDelay:           mainChan.CsvDelay,
		currentHeight:      nodeInfo.BlockHeight,
		cltvDelays:         cltvs,
		localAssetBalance:  assetData.Assets[0].LocalBalance,
		remoteAssetBalance: assetData.Assets[0].RemoteBalance,
		t:                  t,
		node:               node,
	}
}
