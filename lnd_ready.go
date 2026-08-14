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
//
// Note that lnd only leaves WAITING_TO_START once it has completed its leader
// election and opened (and if necessary migrated) all of its databases, all of
// which happen well after the listener is bound. On nodes with a large channel
// and graph state, or on the first startup after an lnd version bump that
// migrates them, that can legitimately take many minutes. The timeout must
// therefore be generous: it exists only to eventually surface a genuinely
// stuck lnd, not to police a normal but slow startup. We additionally abort as
// soon as lnd stops or reports an error, so a real failure is still surfaced
// promptly rather than waiting out the full timeout.
func waitForLndRPCReady(ctx context.Context, stateClient lnrpc.StateClient,
	timeout time.Duration, lndQuit <-chan struct{},
	errChan <-chan error) error {

	timer := time.NewTimer(timeout)
	defer timer.Stop()

	logTicker := time.NewTicker(lndReadyLogInterval)
	defer logTicker.Stop()

	var (
		startTime = time.Now()
		lastErr   error
	)

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

		case <-logTicker.C:
			log.Infof("Still waiting for lnd's RPC interceptor to "+
				"leave WAITING_TO_START (%v elapsed of a %v "+
				"timeout, last error: %v); lnd is most likely "+
				"still opening or migrating its databases",
				time.Since(startTime).Truncate(time.Second),
				timeout, lastErr)

		case <-timer.C:
			if lastErr != nil {
				return fmt.Errorf("lnd's RPC interceptor "+
					"did not leave WAITING_TO_START "+
					"within %v: %w", timeout, lastErr)
			}

			return fmt.Errorf("lnd's RPC interceptor did not "+
				"leave WAITING_TO_START within %v", timeout)

		case err := <-errChan:
			return fmt.Errorf("error while waiting for lnd's RPC "+
				"interceptor to leave WAITING_TO_START: %w",
				err)

		case <-lndQuit:
			return fmt.Errorf("lnd stopped while waiting for its " +
				"RPC interceptor to leave WAITING_TO_START")

		case <-ctx.Done():
			return ctx.Err()
		}
	}
}
