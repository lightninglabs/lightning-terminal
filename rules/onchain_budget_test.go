package rules

import (
	"context"
	"errors"
	"testing"

	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/stretchr/testify/require"
)

// TestOnChainBudgetVerifySane tests that the OnChainBudgetMgr VerifySane method
// correctly verifies the value of the rate limit depending on given min sane
// value.
func TestOnChainBudgetVerifySane(t *testing.T) {
	var min = &OnChainBudget{
		AbsoluteAmtSats: 1000,
		MaxSatPerVByte:  30,
	}

	tests := []struct {
		name      string
		values    *OnChainBudget
		expectErr bool
	}{
		{
			name: "within bounds",
			values: &OnChainBudget{
				AbsoluteAmtSats: 2000,
				MaxSatPerVByte:  40,
			},
		},
		{
			name: "at bounds",
			values: &OnChainBudget{
				AbsoluteAmtSats: 1000,
				MaxSatPerVByte:  30,
			},
		},
		{
			name: "amount too low",
			values: &OnChainBudget{
				AbsoluteAmtSats: 999,
				MaxSatPerVByte:  30,
			},
			expectErr: true,
		},
		{
			name: "fee rate limit too low",
			values: &OnChainBudget{
				AbsoluteAmtSats: 1000,
				MaxSatPerVByte:  29,
			},
			expectErr: true,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			err := test.values.VerifySane(min, nil)
			if test.expectErr {
				require.Error(t, err)
				return
			}
			require.NoError(t, err)
		})
	}
}

// TestOnChainBudgetCheckRequest checks that a request is correctly accepted or
// denied based on the OnChainBudgetMgr rule values.
func TestOnChainBudgetCheckRequest(t *testing.T) {
	ctx := context.Background()

	values := &OnChainBudget{
		AbsoluteAmtSats: 100,
		MaxSatPerVByte:  40,
	}

	tx := newMockKVStoresTx()
	cfg := &ConfigImpl{
		Stores:    &mockKVStores{tx: tx},
		ReqID:     0,
		LndConnID: "test",
	}

	mgr := &OnChainBudgetMgr{}

	enf := &OnChainBudgetEnforcer{
		onChainBudgetConfig: cfg,
		OnChainBudget:       values,
		OnChainBudgetMgr:    mgr,
	}

	// assertSpentAmt is a helper closer that checks that the stored
	// spent amount and pending amount is what we expect.
	assertSpentAmt := func(expectedAmt, expectedPending uint64) {
		t.Helper()
		spent, pending, err := enf.getBudgetState(ctx, tx)
		require.NoError(t, err)
		require.Equal(t, expectedAmt, spent.Amount)
		require.Equal(t, expectedPending, pending.Amount)
	}

	// Assert that our initial total amount spent is zero.
	assertSpentAmt(0, 0)

	// A request for an irrelevant URI should not affect the budget.
	_, err := enf.HandleRequest(ctx, "random-URI", nil)
	require.NoError(t, err)
	assertSpentAmt(0, 0)

	// Assert that if there is an attempt to open a channel with a fee rate
	// that is too high, then the request should be rejected and the budget
	// should not be affected.
	_, err = enf.HandleRequest(
		ctx, "/lnrpc.Lightning/OpenChannelSync",
		&lnrpc.OpenChannelRequest{
			SatPerVbyte:        60,
			LocalFundingAmount: 20,
			PushSat:            10,
		},
	)
	require.Error(t, err)
	assertSpentAmt(0, 0)

	// Now attempt a valid OpenChannelSync request. Ensure that the budget
	// is updated accordingly. Since this is just a request, only the
	// pending amount should be updated.
	r, err := enf.HandleRequest(
		ctx, "/lnrpc.Lightning/OpenChannelSync",
		&lnrpc.OpenChannelRequest{
			SatPerVbyte:        10,
			LocalFundingAmount: 20,
			PushSat:            10,
		},
	)
	require.NoError(t, err)
	assertSpentAmt(0, 30)

	// Check that the request id was added to the memo field.
	openReq, ok := r.(*lnrpc.OpenChannelRequest)
	require.True(t, ok)
	require.Equal(t, "onBudget-test-0:", openReq.Memo)

	// If the above request causes an error on the lnd side for whatever
	// reason, the pending amounts should be reset.
	_, err = enf.HandleErrorResponse(
		ctx, "/lnrpc.Lightning/OpenChannelSync", errors.New("no good"),
	)
	require.NoError(t, err)
	assertSpentAmt(0, 0)

	// Try the call again.
	_, err = enf.HandleRequest(
		ctx, "/lnrpc.Lightning/OpenChannelSync",
		&lnrpc.OpenChannelRequest{
			SatPerVbyte:        10,
			LocalFundingAmount: 20,
			PushSat:            10,
		},
	)
	require.NoError(t, err)
	assertSpentAmt(0, 30)

	// Another call with the same request ID should not be allowed.
	_, err = enf.HandleRequest(
		ctx, "/lnrpc.Lightning/OpenChannelSync",
		&lnrpc.OpenChannelRequest{
			SatPerVbyte:        10,
			LocalFundingAmount: 20,
			PushSat:            10,
		},
	)
	require.ErrorContains(t, err,
		"pending payment already exists for request ID onBudget-test-0")
	assertSpentAmt(0, 30)

	// Now check that a response using the same request ID will move the
	// pending amount from above into the spent amount.
	_, err = enf.HandleResponse(
		ctx, "/lnrpc.Lightning/OpenChannelSync", &lnrpc.ChannelPoint{},
	)
	require.NoError(t, err)
	assertSpentAmt(30, 0)

	// There is now 70 sats left to spend.
	// Assert that trying to do a batch open where each individual channel
	// amount is ok but the total exceeds the budget will fail.
	_, err = enf.HandleRequest(
		ctx, "/lnrpc.Lightning/BatchOpenChannel",
		&lnrpc.BatchOpenChannelRequest{
			SatPerVbyte: 10,
			Channels: []*lnrpc.BatchOpenChannel{
				{
					LocalFundingAmount: 20,
					PushSat:            10,
				},
				{
					LocalFundingAmount: 20,
					PushSat:            10,
				},
				{
					LocalFundingAmount: 20,
					PushSat:            10,
				},
			},
		},
	)
	require.Error(t, err)
	assertSpentAmt(30, 0)

	// Try again with a valid batch.
	r, err = enf.HandleRequest(
		ctx, "/lnrpc.Lightning/BatchOpenChannel",
		&lnrpc.BatchOpenChannelRequest{
			SatPerVbyte: 10,
			Channels: []*lnrpc.BatchOpenChannel{
				{
					LocalFundingAmount: 20,
					PushSat:            10,
				},
				{
					LocalFundingAmount: 20,
					PushSat:            10,
				},
			},
		},
	)
	require.NoError(t, err)
	assertSpentAmt(30, 60)

	// Check that the request id was added to the memo fields.
	batchOpenReq, ok := r.(*lnrpc.BatchOpenChannelRequest)
	require.True(t, ok)
	require.Len(t, batchOpenReq.Channels, 2)
	require.Equal(t, "onBudget-test-0:", batchOpenReq.Channels[0].Memo)
	require.Equal(t, "onBudget-test-0:", batchOpenReq.Channels[1].Memo)

	// Before confirming the above request with a response, let's create a
	// new request but with a different request id. First ensure that an
	// amount that would exceed the current budget would fail.
	cfg.ReqID = 1
	_, err = enf.HandleRequest(
		ctx, "/lnrpc.Lightning/OpenChannelSync",
		&lnrpc.OpenChannelRequest{
			LocalFundingAmount: 15,
		},
	)
	require.Error(t, err)
	assertSpentAmt(30, 60)

	// Now check that one within the budget would succeed.
	_, err = enf.HandleRequest(
		ctx, "/lnrpc.Lightning/OpenChannelSync",
		&lnrpc.OpenChannelRequest{
			LocalFundingAmount: 5,
		},
	)
	require.NoError(t, err)
	assertSpentAmt(30, 65)

	// Check that a response for request ID 1 results in the correct budget
	// update.
	_, err = enf.HandleResponse(
		ctx, "/lnrpc.Lightning/OpenChannelSync", &lnrpc.ChannelPoint{},
	)
	require.NoError(t, err)
	assertSpentAmt(35, 60)

	// Check that repeating the response has no effect.
	_, err = enf.HandleResponse(
		ctx, "/lnrpc.Lightning/OpenChannelSync", &lnrpc.ChannelPoint{},
	)
	require.NoError(t, err)
	assertSpentAmt(35, 60)

	// Finally, switch the request ID back to 0 and complete it.
	cfg.ReqID = 0
	_, err = enf.HandleResponse(
		ctx, "/lnrpc.Lightning/BatchOpenChannel",
		&lnrpc.BatchOpenChannelResponse{},
	)
	require.NoError(t, err)
	assertSpentAmt(95, 0)

	// Spend the remaining budget with a sync channel open request.
	cfg.ReqID = 2
	_, err = enf.HandleRequest(
		ctx, "/lnrpc.Lightning/OpenChannelSync",
		&lnrpc.OpenChannelRequest{
			LocalFundingAmount: 2,
		},
	)
	require.NoError(t, err)
	assertSpentAmt(95, 2)

	// An error response with the wrong URI should not affect the budget.
	_, err = enf.HandleErrorResponse(
		ctx, "/lnrpc.Lightning/OpenChannel", errors.New("no good"),
	)
	require.NoError(t, err)
	assertSpentAmt(95, 2)

	// Issue another OpenChannelSync request while another one is in flight.
	cfg.ReqID = 3
	_, err = enf.HandleRequest(
		ctx, "/lnrpc.Lightning/OpenChannelSync",
		&lnrpc.OpenChannelRequest{
			LocalFundingAmount: 3,
		},
	)
	require.NoError(t, err)
	assertSpentAmt(95, 5)

	_, err = enf.HandleResponse(
		ctx, "/lnrpc.Lightning/OpenChannelSync",
		&lnrpc.ChannelPoint{},
	)
	require.NoError(t, err)
	assertSpentAmt(98, 2)

	cfg.ReqID = 2
	_, err = enf.HandleResponse(
		ctx, "/lnrpc.Lightning/OpenChannelSync",
		&lnrpc.ChannelPoint{},
	)
	require.NoError(t, err)
	assertSpentAmt(100, 0)
}

// TestHandleMemoResponse tests that the memo prefix is correctly removed from
// the channel bookkeeping apis.
func TestHandleMemoResponse(t *testing.T) {
	ctx := context.Background()

	values := &OnChainBudget{
		AbsoluteAmtSats: 100,
		MaxSatPerVByte:  40,
	}

	tx := newMockKVStoresTx()
	cfg := &ConfigImpl{
		Stores:    &mockKVStores{tx: tx},
		ReqID:     0,
		LndConnID: "test",
	}

	mgr := &OnChainBudgetMgr{}

	enf := &OnChainBudgetEnforcer{
		onChainBudgetConfig: cfg,
		OnChainBudget:       values,
		OnChainBudgetMgr:    mgr,
	}

	assertMemoInvariant := func(memo string) {
		t.Helper()
		require.Equal(t, memo, removeReqId(memo))
	}

	testMemo1 := "onBudget-abcdefghijklmnop-0: some"
	clearMemo1 := removeReqId(testMemo1)
	require.Equal(t, clearMemo1, " some")

	testMemo2 := "some"
	clearMemo2 := removeReqId(testMemo2)
	require.Equal(t, clearMemo2, "some")

	// We check that the memo field is correctly removed, such that a second
	// removal leads to the same string. The detailed mechanics of
	// removeReqId is tested in a separate test.
	response, err := enf.HandleResponse(
		ctx, "/lnrpc.Lightning/ListChannels",
		&lnrpc.ListChannelsResponse{
			Channels: []*lnrpc.Channel{
				{Memo: testMemo1},
				{Memo: testMemo2},
			},
		},
	)
	require.NoError(t, err)
	for _, channel := range response.(*lnrpc.ListChannelsResponse).Channels {
		assertMemoInvariant(channel.Memo)
	}

	response, err = enf.HandleResponse(
		ctx, "/lnrpc.Lightning/PendingChannels",
		&lnrpc.PendingChannelsResponse{
			TotalLimboBalance: 0,
			PendingOpenChannels: []*lnrpc.PendingChannelsResponse_PendingOpenChannel{
				{
					Channel: &lnrpc.PendingChannelsResponse_PendingChannel{
						Memo: testMemo1,
					},
				},
				{
					Channel: &lnrpc.PendingChannelsResponse_PendingChannel{
						Memo: testMemo2,
					},
				},
			},
			PendingClosingChannels: []*lnrpc.PendingChannelsResponse_ClosedChannel{
				{
					Channel: &lnrpc.PendingChannelsResponse_PendingChannel{
						Memo: testMemo1,
					},
				},
			},
			PendingForceClosingChannels: []*lnrpc.PendingChannelsResponse_ForceClosedChannel{
				{
					Channel: &lnrpc.PendingChannelsResponse_PendingChannel{
						Memo: testMemo1,
					},
				},
			},
			WaitingCloseChannels: []*lnrpc.PendingChannelsResponse_WaitingCloseChannel{
				{
					Channel: &lnrpc.PendingChannelsResponse_PendingChannel{
						Memo: testMemo1,
					},
				},
			},
		},
	)
	require.NoError(t, err)
	pending := response.(*lnrpc.PendingChannelsResponse)
	for _, channel := range pending.PendingOpenChannels {
		assertMemoInvariant(channel.Channel.Memo)
	}

	for _, channel := range pending.PendingClosingChannels {
		assertMemoInvariant(channel.Channel.Memo)
	}

	for _, channel := range pending.PendingForceClosingChannels {
		assertMemoInvariant(channel.Channel.Memo)
	}

	for _, channel := range pending.WaitingCloseChannels {
		assertMemoInvariant(channel.Channel.Memo)
	}
}

// TestRemoveMemo tests that request identifiers are correctly removed from the
// memo string.
func TestRemoveMemo(t *testing.T) {
	tests := []struct {
		name     string
		memo     string
		expected string
	}{
		{
			name:     "no memo",
			memo:     "onBudget-abcdefghijklmnop",
			expected: "onBudget-abcdefghijklmnop",
		},
		{
			name:     "no colon",
			memo:     "onBudget-abcdefghijklmnop-",
			expected: "onBudget-abcdefghijklmnop-",
		},
		{
			name:     "with colon",
			memo:     "onBudget-abcdefghijklmnop-0:",
			expected: "",
		},
		{
			name:     "with colon and more",
			memo:     "onBudget-abcdefghijklmnop-123:more:",
			expected: "more:",
		},
		{
			name:     "invalid conn id and more",
			memo:     "onBudget-abcdefghijklmno-123:more",
			expected: "onBudget-abcdefghijklmno-123:more",
		},
		{
			name: "different prefixes",
			memo: "onBudget-abcdefghijklmnop-123:" +
				"offBudget-abcdefghijklmnop-123:more",
			expected: "offBudget-abcdefghijklmnop-123:more",
		},
		{
			name: "different prefixes reversed",
			memo: "offBudget-abcdefghijklmnop-123:" +
				"onBudget-abcdefghijklmnop-123:more",
			expected: "offBudget-abcdefghijklmnop-123:more",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			require.Equal(t, test.expected, removeReqId(test.memo))
		})
	}
}
