package terminal

import (
	"context"
	"fmt"
	"time"

	"github.com/lightningnetwork/lnd/lnrpc"
)

// waitForLndRPCReady polls lnd's StateService until lnd's RPC interceptor has
// left the WAITING_TO_START state, or timeout elapses. Unlike every other
// lnd RPC, the StateService is exempt from both lnd's macaroon check and its
// RPC-readiness check (see lnd's rpcperms.InterceptorChain), so it can be
// queried on a fresh connection before the wallet is unlocked and before any
// macaroon exists. This lets us distinguish lnd's gRPC listener merely being
// bound (which is all readyChan/unlockChan guarantee) from lnd actually being
// able to service non-State RPCs.
func waitForLndRPCReady(ctx context.Context, stateClient lnrpc.StateClient,
	timeout time.Duration) error {

	timer := time.NewTimer(timeout)
	defer timer.Stop()

	var lastErr error

	for {
		resp, err := stateClient.GetState(ctx, &lnrpc.GetStateRequest{})
		switch {
		case err != nil:
			lastErr = err

		case resp.State != lnrpc.WalletState_WAITING_TO_START:
			return nil
		}

		select {
		case <-time.After(stateServicePollInterval):

		case <-timer.C:
			if lastErr != nil {
				return fmt.Errorf("lnd's RPC interceptor "+
					"did not leave WAITING_TO_START "+
					"within %v: %w", timeout, lastErr)
			}

			return fmt.Errorf("lnd's RPC interceptor did not "+
				"leave WAITING_TO_START within %v", timeout)

		case <-ctx.Done():
			return ctx.Err()
		}
	}
}
