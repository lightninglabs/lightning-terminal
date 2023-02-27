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
	LND     string = "lnd"
	LIT     string = "lit"
	LOOP    string = "loop"
	POOL    string = "pool"
	FARADAY string = "faraday"
)

// subServerWrapper is a wrapper around the SubServer interface and is used by
// the subServerMgr to manage a SubServer.
type subServerWrapper struct {
	integratedStarted bool
	startedMu         sync.RWMutex

	stopped sync.Once

	subServer SubServer

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
	// If the sub-server has not yet started, then we can exit early.
	if !s.started() {
		return nil
	}

	var returnErr error
	s.stopped.Do(func() {
		close(s.quit)
		s.wg.Wait()

		// If running in remote mode, close the connection.
		if s.subServer.Remote() && s.remoteConn != nil {
			err := s.remoteConn.Close()
			if err != nil {
				returnErr = fmt.Errorf("could not close "+
					"remote connection: %v", err)
			}
			return
		}

		// Else, stop the integrated sub-server process.
		err := s.subServer.Stop()
		if err != nil {
			returnErr = fmt.Errorf("could not close "+
				"integrated connection: %v", err)
			return
		}

		if s.subServer.ServerErrChan() == nil {
			return
		}

		select {
		case returnErr = <-s.subServer.ServerErrChan():
		default:
		}
	})

	return returnErr
}

// startIntegrated starts the subServer in integrated mode.
func (s *subServerWrapper) startIntegrated(lndClient lnrpc.LightningClient,
	lndGrpc *lndclient.GrpcLndServices, withMacaroonService bool) error {

	err := s.subServer.Start(lndClient, lndGrpc, withMacaroonService)
	if err != nil {
		return err
	}
	s.setStarted(true)

	if s.subServer.ServerErrChan() == nil {
		return nil
	}

	s.wg.Add(1)
	go func() {
		defer s.wg.Done()

		select {
		case err := <-s.subServer.ServerErrChan():
			// The sub server should shut itself down if an error
			// happens. We don't need to try to stop it again.
			s.setStarted(false)

			err = fmt.Errorf("received critical error from "+
				"sub-server (%s), shutting down: %v",
				s.subServer.Name(), err)

			log.Error(err)

		case <-s.quit:
		}
	}()

	return nil
}

// connectRemote attempts to make a connection to the remote sub-server.
func (s *subServerWrapper) connectRemote() error {
	cfg := s.subServer.RemoteConfig()
	certPath := lncfg.CleanAndExpandPath(cfg.TLSCertPath)
	name := s.subServer.Name()
	conn, err := dialBackend(name, cfg.RPCServer, certPath)
	if err != nil {
		return fmt.Errorf("remote dial error: %v", err)
	}

	s.remoteConn = conn

	return nil
}
