package subservers

import (
	"fmt"
	"sync"

	"github.com/lightninglabs/lndclient"
	"github.com/lightningnetwork/lnd/lncfg"
	"github.com/lightningnetwork/lnd/lnrpc"
	"google.golang.org/grpc"
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

// started reports whether the integrated sub-server was initialized and still
// needs cleanup. Runtime readiness is tracked by the status manager.
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
	// If the sub-server has not yet started, then we can exit early.
	if !s.started() {
		return nil
	}

	var returnErr error
	s.stopped.Do(func() {
		// Keep consuming errors until their producers have stopped. A
		// producer may report an error while its Stop method is waiting
		// for its goroutines to exit.
		defer func() {
			close(s.quit)
			s.wg.Wait()
			s.setStarted(false)
		}()

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
	onStarted func(), onError func(error)) error {

	err := s.Start(lndClient, lndGrpc, withMacaroonService)
	if err != nil {
		return err
	}
	s.setStarted(true)

	// Publish readiness before an already-buffered runtime error can
	// mark the sub-server as errored.
	onStarted()

	if s.ServerErrChan() == nil {
		return nil
	}

	s.wg.Add(1)
	go func() {
		defer s.wg.Done()

		const errFormat = "received critical error from " +
			"sub-server (%s), shutting down: %v"

		for {
			select {
			case err, ok := <-s.ServerErrChan():
				if !ok {
					return
				}

				// Errors affect readiness, but cleanup is
				// still required after successful startup.
				onError(fmt.Errorf(errFormat, s.Name(), err))

			case <-s.quit:
				return
			}
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
