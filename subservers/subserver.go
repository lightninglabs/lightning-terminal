package subservers

import (
	"context"
	"fmt"
	"sync"

	"github.com/lightninglabs/lndclient"
	"github.com/lightningnetwork/lnd/lncfg"
	"github.com/lightningnetwork/lnd/lnrpc"
	"google.golang.org/grpc"
	"google.golang.org/grpc/connectivity"
)

const (
	LND      string = "lnd"
	LIT      string = "lit"
	LOOP     string = "loop"
	POOL     string = "pool"
	TAP      string = "taproot-assets"
	FARADAY  string = "faraday"
	ACCOUNTS string = "accounts"
)

// subServerWrapper is a wrapper around the SubServer interface and is used by
// the subServerMgr to manage a SubServer.
type subServerWrapper struct {
	SubServer

	integratedStarted bool
	startedMu         sync.RWMutex

	stopped sync.Once

	remoteConn *grpc.ClientConn

	wg   sync.WaitGroup
	quit chan struct{}
}

// started returns true if the subServer has been started. This only applies if
// the subServer is running in integrated mode.
func (s *subServerWrapper) started() bool {
	s.startedMu.RLock()
	defer s.startedMu.RUnlock()

	return s.integratedStarted
}

// setStarted sets the subServer as started or not. This only applies if the
// subServer is running in integrated mode.
func (s *subServerWrapper) setStarted(started bool) {
	s.startedMu.Lock()
	defer s.startedMu.Unlock()

	s.integratedStarted = started
}

// stop the subServer by closing the connection to it if it is remote or by
// stopping the integrated process.
func (s *subServerWrapper) stop() error {
	// An integrated sub-server that never started has nothing to stop. A
	// remote sub-server has no started flag, so always tear it down to
	// close its connection and stop its connection watcher.
	if !s.Remote() && !s.started() {
		return nil
	}

	var returnErr error
	s.stopped.Do(func() {
		close(s.quit)
		s.wg.Wait()

		// If running in remote mode, close the connection.
		if s.Remote() && s.remoteConn != nil {
			err := s.remoteConn.Close()
			if err != nil {
				returnErr = fmt.Errorf("could not close "+
					"remote connection: %v", err)
			}
			return
		}

		// Else, stop the integrated sub-server process.
		err := s.Stop()
		if err != nil {
			returnErr = fmt.Errorf("could not close "+
				"integrated connection: %v", err)
			return
		}

		if s.ServerErrChan() == nil {
			return
		}

		select {
		case returnErr = <-s.ServerErrChan():
		default:
		}
	})

	return returnErr
}

// startIntegrated starts the subServer in integrated mode.
func (s *subServerWrapper) startIntegrated(lndClient lnrpc.LightningClient,
	lndGrpc *lndclient.GrpcLndServices, withMacaroonService bool,
	onError func(error)) error {

	err := s.Start(lndClient, lndGrpc, withMacaroonService)
	if err != nil {
		return err
	}
	s.setStarted(true)

	if s.ServerErrChan() == nil {
		return nil
	}

	s.wg.Add(1)
	go func() {
		defer s.wg.Done()

		select {
		case err := <-s.ServerErrChan():
			// The sub server should shut itself down if an error
			// happens. We don't need to try to stop it again.
			s.setStarted(false)

			onError(
				fmt.Errorf("received critical error from "+
					"sub-server (%s), shutting down: %v",
					s.Name(), err),
			)

		case <-s.quit:
		}
	}()

	return nil
}

// connectRemote attempts to make a connection to the remote sub-server.
func (s *subServerWrapper) connectRemote() error {
	cfg := s.RemoteConfig()
	certPath := lncfg.CleanAndExpandPath(cfg.TLSCertPath)
	name := s.Name()
	conn, err := dialBackend(name, cfg.RPCServer, certPath)
	if err != nil {
		return fmt.Errorf("remote dial error: %v", err)
	}

	s.remoteConn = conn

	return nil
}

// watchRemoteConn watches the remote sub-server's connection and reports its
// runtime health through the given callbacks. onError is called when the
// connection is lost after startup and onRunning when it recovers, so the
// status server reflects a runtime disconnect instead of keeping the
// sub-server marked as running. The watcher stops when the sub-server is
// stopped.
func (s *subServerWrapper) watchRemoteConn(onError func(error),
	onRunning func()) {

	conn := s.remoteConn
	if conn == nil {
		return
	}

	s.wg.Add(1)
	go func() {
		defer s.wg.Done()

		// Cancel the state-change wait when the sub-server stops.
		ctx, cancel := context.WithCancel(context.Background())
		defer cancel()
		go func() {
			select {
			case <-s.quit:
				cancel()
			case <-ctx.Done():
			}
		}()

		// errored holds the last state we reported so we only push a
		// status change on an actual transition.
		var errored bool
		for {
			state := conn.GetState()
			switch state {
			case connectivity.TransientFailure,
				connectivity.Shutdown:

				if !errored {
					errored = true
					onError(fmt.Errorf("remote sub-server "+
						"(%s) is disconnected (%s)",
						s.Name(), state))
				}

			case connectivity.Ready:
				if errored {
					errored = false
					onRunning()
				}

			case connectivity.Idle:
				// A gRPC connection only leaves the idle
				// state when used, so nudge it to connect.
				// This keeps the connection observable so a
				// disconnect is detected even when no
				// requests are in flight.
				conn.Connect()
			}

			// Block until the connection state changes or the
			// sub-server is stopped.
			if !conn.WaitForStateChange(ctx, state) {
				return
			}
		}
	}()
}
