package itest

import (
	"context"
	"fmt"

	"github.com/btcsuite/btcd/chaincfg/chainhash"
	"github.com/btcsuite/btcd/wire"
	"github.com/lightningnetwork/lnd/channeldb"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lntest"
	"github.com/lightningnetwork/lnd/lntest/wait"
	"github.com/stretchr/testify/require"
)

// shutdownAndAssert shuts down the given node and asserts that no errors
// occur.
func shutdownAndAssert(net *NetworkHarness, t *harnessTest,
	node *HarnessNode) {

	// The process may not be in a state to always shutdown immediately, so
	// we'll retry up to a hard limit to ensure we eventually shutdown.
	err := wait.NoError(func() error {
		return net.ShutdownNode(node)
	}, defaultTimeout)
	require.NoErrorf(t.t, err, "unable to shutdown %v", node.Name())
}

// openChannelAndAssert attempts to open a channel with the specified
// parameters extended from Alice to Bob. Additionally, two items are asserted
// after the channel is considered open: the funding transaction should be
// found within a block, and that Alice can report the status of the new
// channel.
func openChannelAndAssert(t *harnessTest, net *NetworkHarness, alice,
	bob *HarnessNode, p lntest.OpenChannelParams) *lnrpc.ChannelPoint {

	t.t.Helper()

	chanOpenUpdate := openChannelStream(t, net, alice, bob, p)

	// Mine 6 blocks, then wait for Alice's node to notify us that the
	// channel has been opened. The funding transaction should be found
	// within the first newly mined block. We mine 6 blocks so that in the
	// case that the channel is public, it is announced to the network.
	block := mineBlocks(t, net, 6, 1)[0]

	fundingChanPoint, err := net.WaitForChannelOpen(chanOpenUpdate)
	require.NoError(t.t, err, "error while waiting for channel open")

	fundingTxID, err := lnrpc.GetChanPointFundingTxid(fundingChanPoint)
	require.NoError(t.t, err, "unable to get txid")

	assertTxInBlock(t, block, fundingTxID)

	// The channel should be listed in the peer information returned by
	// both peers.
	chanPoint := wire.OutPoint{
		Hash:  *fundingTxID,
		Index: fundingChanPoint.OutputIndex,
	}
	require.NoError(
		t.t, net.AssertChannelExists(alice, &chanPoint),
		"unable to assert channel existence",
	)
	require.NoError(
		t.t, net.AssertChannelExists(bob, &chanPoint),
		"unable to assert channel existence",
	)

	return fundingChanPoint
}

// openChannelStream blocks until an OpenChannel request for a channel funding
// by alice succeeds. If it does, a stream client is returned to receive events
// about the opening channel.
func openChannelStream(t *harnessTest, net *NetworkHarness, alice,
	bob *HarnessNode,
	p lntest.OpenChannelParams) lnrpc.Lightning_OpenChannelClient {

	t.t.Helper()

	// Wait until we are able to fund a channel successfully. This wait
	// prevents us from erroring out when trying to create a channel while
	// the node is starting up.
	var chanOpenUpdate lnrpc.Lightning_OpenChannelClient
	err := wait.NoError(func() error {
		var err error
		chanOpenUpdate, err = net.OpenChannel(alice, bob, p)
		return err
	}, defaultTimeout)
	require.NoError(t.t, err, "unable to open channel")

	return chanOpenUpdate
}

// closeChannelAndAssert attempts to close a channel identified by the passed
// channel point owned by the passed Lightning node. A fully blocking channel
// closure is attempted, therefore the passed context should be a child derived
// via timeout from a base parent. Additionally, once the channel has been
// detected as closed, an assertion checks that the transaction is found within
// a block. Finally, this assertion verifies that the node always sends out a
// disable update when closing the channel if the channel was previously
// enabled.
//
// NOTE: This method assumes that the provided funding point is confirmed
// on-chain AND that the edge exists in the node's channel graph. If the funding
// transactions was reorged out at some point, use closeReorgedChannelAndAssert.
func closeChannelAndAssert(t *harnessTest, net *NetworkHarness,
	node *HarnessNode, fundingChanPoint *lnrpc.ChannelPoint,
	force bool) *chainhash.Hash {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	closeUpdates, _, err := net.CloseChannel(node, fundingChanPoint, force)
	require.NoError(t.t, err, "unable to close channel")

	return assertChannelClosed(
		ctxt, t, net, node, fundingChanPoint, closeUpdates,
	)
}

// assertChannelClosed asserts that the channel is properly cleaned up after
// initiating a cooperative or local close.
func assertChannelClosed(ctx context.Context, t *harnessTest,
	net *NetworkHarness, node *HarnessNode,
	fundingChanPoint *lnrpc.ChannelPoint,
	closeUpdates lnrpc.Lightning_CloseChannelClient) *chainhash.Hash {

	txid, err := lnrpc.GetChanPointFundingTxid(fundingChanPoint)
	require.NoError(t.t, err, "unable to get txid")
	chanPointStr := fmt.Sprintf("%v:%v", txid, fundingChanPoint.OutputIndex)

	// If the channel appears in list channels, ensure that its state
	// contains ChanStatusCoopBroadcasted.
	listChansRequest := &lnrpc.ListChannelsRequest{}
	listChansResp, err := node.ListChannels(ctx, listChansRequest)
	require.NoError(t.t, err, "unable to query for list channels")

	for _, channel := range listChansResp.Channels {
		// Skip other channels.
		if channel.ChannelPoint != chanPointStr {
			continue
		}

		// Assert that the channel is in coop broadcasted.
		require.Contains(
			t.t, channel.ChanStatusFlags,
			channeldb.ChanStatusCoopBroadcasted.String(),
			"channel not coop broadcasted",
		)
	}

	// At this point, the channel should now be marked as being in the
	// state of "waiting close".
	pendingChansRequest := &lnrpc.PendingChannelsRequest{}
	pendingChanResp, err := node.PendingChannels(ctx, pendingChansRequest)
	require.NoError(t.t, err, "unable to query for pending channels")

	var found bool
	for _, pendingClose := range pendingChanResp.WaitingCloseChannels {
		if pendingClose.Channel.ChannelPoint == chanPointStr {
			found = true
			break
		}
	}
	require.True(t.t, found, "channel not marked as waiting close")

	// We'll now, generate a single block, wait for the final close status
	// update, then ensure that the closing transaction was included in the
	// block.
	block := mineBlocks(t, net, 1, 1)[0]

	closingTxid, err := net.WaitForChannelClose(closeUpdates)
	require.NoError(t.t, err, "error while waiting for channel close")

	assertTxInBlock(t, block, closingTxid)

	// Finally, the transaction should no longer be in the waiting close
	// state as we've just mined a block that should include the closing
	// transaction.
	err = wait.Predicate(func() bool {
		pendingChansRequest := &lnrpc.PendingChannelsRequest{}
		pendingChanResp, err := node.PendingChannels(
			ctx, pendingChansRequest,
		)
		if err != nil {
			return false
		}

		for _, pendingClose := range pendingChanResp.WaitingCloseChannels {
			if pendingClose.Channel.ChannelPoint == chanPointStr {
				return false
			}
		}

		return true
	}, defaultTimeout)
	require.NoError(
		t.t, err, "closing transaction not marked as fully closed",
	)

	return closingTxid
}
