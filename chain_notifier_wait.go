package terminal

import (
	"context"
	"strings"
	"time"

	"github.com/lightninglabs/lndclient"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

const (
	chainNotifierStartupMessage = "chain notifier RPC is still in the " +
		"process of starting"
)

// waitForChainNotifierReady blocks until lnd's chain notifier accepts a block
// epoch subscription or the provided context is canceled.
func waitForChainNotifierReady(ctx context.Context,
	notifier lndclient.ChainNotifierClient) error {

	const (
		initialBackoff = 200 * time.Millisecond
		maxBackoff     = 5 * time.Second
		streamGrace    = 2 * time.Second
	)

	backoff := initialBackoff

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()

		default:
		}

		attemptCtx, cancel := context.WithCancel(ctx)
		blockChan, errChan, err := notifier.RegisterBlockEpochNtfn(attemptCtx)
		switch {
		case err != nil:
			cancel()

			isStartupErr := status.Code(err) == codes.Unavailable ||
				strings.Contains(err.Error(),
					chainNotifierStartupMessage)
			if !isStartupErr {
				return err
			}

			log.Warnf("Chain notifier RPC not ready, retrying in %v: %v",
				backoff, err)

		default:
			timer := time.NewTimer(streamGrace)

			select {
			case <-blockChan:
				go drainReadinessNtfn(
					attemptCtx, cancel, blockChan, errChan,
				)
				return nil

			case err = <-errChan:
				cancel()

				log.Warnf("Chain notifier stream ended early, "+
					"retrying: %v", err)

			case <-timer.C:
				go drainReadinessNtfn(
					attemptCtx, cancel, blockChan, errChan,
				)
				return nil

			case <-ctx.Done():
				cancel()
				return ctx.Err()
			}
		}

		select {
		case <-time.After(backoff):

		case <-ctx.Done():
			return ctx.Err()
		}

		backoff *= 2
		if backoff > maxBackoff {
			backoff = maxBackoff
		}
	}
}

// drainReadinessNtfn discards notifications until the daemon shuts down,
// allowing the readiness subscription to stay open without affecting lnd logs.
func drainReadinessNtfn(ctx context.Context, cancel func(),
	blockChan <-chan int32, errChan <-chan error) {

	defer cancel()

	for {
		select {
		case <-blockChan:

		case <-errChan:
			return

		case <-ctx.Done():
			return
		}
	}
}
