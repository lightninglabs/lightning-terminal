package terminal

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"
)

// fakeStateClient is a test-only lnrpc.StateClient that replays a canned
// sequence of GetState responses/errors, repeating the last entry once the
// sequence is exhausted.
type fakeStateClient struct {
	lnrpc.StateClient

	responses []*lnrpc.GetStateResponse
	errs      []error
	calls     int
}

func (f *fakeStateClient) GetState(_ context.Context,
	_ *lnrpc.GetStateRequest, _ ...grpc.CallOption) (
	*lnrpc.GetStateResponse, error) {

	idx := f.calls
	if idx >= len(f.responses) {
		idx = len(f.responses) - 1
	}
	f.calls++

	return f.responses[idx], f.errs[idx]
}

// TestWaitForLndRPCReady asserts that waitForLndRPCReady correctly polls
// lnd's StateService until it reports a state other than WAITING_TO_START,
// and that it times out with an error if that never happens.
func TestWaitForLndRPCReady(t *testing.T) {
	t.Parallel()

	activeResp := &lnrpc.GetStateResponse{
		State: lnrpc.WalletState_RPC_ACTIVE,
	}
	waitingResp := &lnrpc.GetStateResponse{
		State: lnrpc.WalletState_WAITING_TO_START,
	}

	testCases := []struct {
		name        string
		client      *fakeStateClient
		timeout     time.Duration
		expectError bool
	}{
		{
			name: "ready immediately",
			client: &fakeStateClient{
				responses: []*lnrpc.GetStateResponse{
					activeResp,
				},
				errs: []error{nil},
			},
			timeout: time.Second,
		},
		{
			name: "ready after N polls",
			client: &fakeStateClient{
				responses: []*lnrpc.GetStateResponse{
					waitingResp, waitingResp, activeResp,
				},
				errs: []error{nil, nil, nil},
			},
			timeout: time.Second,
		},
		{
			name: "timeout without transition",
			client: &fakeStateClient{
				responses: []*lnrpc.GetStateResponse{
					waitingResp,
				},
				errs: []error{nil},
			},
			timeout:     300 * time.Millisecond,
			expectError: true,
		},
		{
			name: "timeout while erroring",
			client: &fakeStateClient{
				responses: []*lnrpc.GetStateResponse{nil},
				errs: []error{
					errors.New("connection refused"),
				},
			},
			timeout:     300 * time.Millisecond,
			expectError: true,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			err := waitForLndRPCReady(
				context.Background(), tc.client, tc.timeout,
			)

			if tc.expectError {
				require.Error(t, err)
				return
			}
			require.NoError(t, err)
		})
	}
}
