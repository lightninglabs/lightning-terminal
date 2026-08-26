package itest

import (
	"context"
	"fmt"
	"time"

	"github.com/lightninglabs/faraday/frdrpc"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lnrpc/routerrpc"
	"github.com/lightningnetwork/lnd/lntest"
	"github.com/lightningnetwork/lnd/lntest/wait"
	"github.com/stretchr/testify/require"
)

const (
	// faradayNumForwards is the number of payments that are routed through
	// the forwarding node.
	faradayNumForwards = 3

	// faradayForwardAmtSat is the amount in satoshis of each payment that
	// is routed through the forwarding node.
	faradayForwardAmtSat = 100_000

	// faradayChannelSize is the capacity in satoshis of the channels that
	// make up the routing network.
	faradayChannelSize = 1_000_000
)

// testFaradayForwardingAbility routes payments through a three node network Bob
// -> Alice -> Charlie, in which Alice is the forwarding node, and then checks
// that Alice's faraday sub-server reports the forwarding activity of the (Bob,
// Charlie) peer pair via the ForwardingAbility endpoint.
func testFaradayForwardingAbility(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	// Capture the observation window start before the channels are opened
	// so that the pair's effective uptime spans most of the window.
	windowStart := time.Now()

	// Charlie is the payment sink. It only receives, so its wallet does not
	// need to be funded.
	charlie, err := net.NewNode(t.t, "Charlie", nil, false, true)
	require.NoError(t.t, err)
	defer shutdownAndAssert(net, t, charlie)

	net.EnsureConnected(t.t, net.Alice, charlie)

	// Open the two channels of the routing network. Bob funds the channel
	// to Alice so that he has outbound liquidity, and Alice funds the
	// channel to Charlie for the outgoing leg of the forwards.
	channelBAOp := openChannelAndAssert(
		t, net, net.Bob, net.Alice, lntest.OpenChannelParams{
			Amt: faradayChannelSize,
		},
	)
	defer closeChannelAndAssert(t, net, net.Bob, channelBAOp, false)

	channelACOp := openChannelAndAssert(
		t, net, net.Alice, charlie, lntest.OpenChannelParams{
			Amt: faradayChannelSize,
		},
	)
	defer closeChannelAndAssert(t, net, net.Alice, channelACOp, false)

	// Route payments from Bob to Charlie through Alice. The first attempts
	// may fail with a pathfinding error until Bob has learned about the
	// Alice->Charlie channel from gossip, so each payment is retried until
	// it succeeds. Failed attempts don't settle any HTLCs and therefore
	// don't show up as forwards.
	sendPayment := func() error {
		invoice, err := charlie.AddInvoice(ctx, &lnrpc.Invoice{
			Value: faradayForwardAmtSat,
		})
		if err != nil {
			return err
		}

		stream, err := net.Bob.RouterClient.SendPaymentV2(
			ctx, &routerrpc.SendPaymentRequest{
				PaymentRequest: invoice.PaymentRequest,
				TimeoutSeconds: 10,
				FeeLimitMsat:   100_000,
			},
		)
		if err != nil {
			return err
		}

		result, err := getPaymentResult(stream, false)
		if err != nil {
			return err
		}
		if result.Status != lnrpc.Payment_SUCCEEDED {
			return fmt.Errorf("payment failed with reason: %v",
				result.FailureReason)
		}

		return nil
	}

	for range faradayNumForwards {
		require.NoError(t.t, wait.NoError(sendPayment, defaultTimeout))
	}

	// Query the ForwardingAbility endpoint on the forwarding node's faraday
	// sub-server. Faraday learns about channels through an asynchronous
	// channel event subscription, so we poll until the forwards of the
	// (Bob, Charlie) pair are fully reported.
	faradayClient, err := net.Alice.faradayClient()
	require.NoError(t.t, err)

	var ability frdrpc.ForwardingAbility
	err = wait.NoError(func() error {
		resp, err := faradayClient.ForwardingAbility(
			ctx, &frdrpc.ForwardingAbilityRequest{
				StartTime: uint64(windowStart.Unix()),
				// The channels only exist for a part of the
				// observation window, so we require only a
				// small uptime fraction and a nominal
				// liquidity floor.
				UptimeThreshold:   0.01,
				LiquidityFloorSat: 1,
			},
		)
		if err != nil {
			return err
		}

		abilities, err := frdrpc.DecodeForwardingAbility(resp)
		if err != nil {
			return err
		}

		var ok bool
		ability, ok = abilities[net.Bob.PubKeyStr][charlie.PubKeyStr]
		if !ok {
			return fmt.Errorf("no entry for the (Bob, Charlie) "+
				"pair, got: %v", abilities)
		}

		if ability.Forwards != faradayNumForwards {
			return fmt.Errorf("expected %d forwards, got %d",
				faradayNumForwards, ability.Forwards)
		}

		// The pair's effective uptime accrues from the moment the
		// channels are open and funded, but is reported in whole
		// seconds, so we wait until at least one second has been
		// registered.
		if ability.EffectiveUptimeS == 0 {
			return fmt.Errorf("expected non-zero effective uptime")
		}

		return nil
	}, defaultTimeout)
	require.NoError(t.t, err)

	t.Logf("Forwarding ability for (Bob, Charlie): %+v", ability)

	// The forwarded volume is reported as the outgoing amount, which
	// matches the invoice amounts exactly, while the routing fees on top
	// of it depend on the default channel policy.
	require.EqualValues(
		t.t, faradayNumForwards*faradayForwardAmtSat*1000,
		ability.ForwardedMsat,
	)
	require.Greater(t.t, ability.FeeMsat, int64(0))
}
