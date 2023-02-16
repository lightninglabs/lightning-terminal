package terminal

import (
	"context"
	"fmt"
	"sync"

	"github.com/lightninglabs/lightning-terminal/perms"
	"github.com/lightninglabs/lndclient"
	"github.com/lightningnetwork/lnd/lncfg"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/macaroons"
	"google.golang.org/grpc"
	"gopkg.in/macaroon-bakery.v2/bakery"
)

// SubServer defines an interface that should be implemented by any sub-server
// that the subServer manager should manage. A sub-server can be run in either
// integrated or remote mode. A sub-server is considered non-fatal to LiT
// meaning that if a sub-server fails to start, LiT can safely continue with its
// operations and other sub-servers can too.
type SubServer interface {
	// Name returns the name of the sub-server.
	Name() string

	// Remote returns true if the sub-server is running remotely and so
	// should be connected to instead of spinning up an integrated server.
	Remote() bool

	// RemoteConfig returns the config required to connect to the sub-server
	// if it is running in remote mode.
	RemoteConfig() *RemoteDaemonConfig

	// Start starts the sub-server in integrated mode.
	Start(lnrpc.LightningClient, *lndclient.GrpcLndServices, bool) error

	// Stop stops the sub-server in integrated mode.
	Stop() error

	// RegisterGrpcService must register the sub-server's GRPC server with
	// the given registrar.
	RegisterGrpcService(grpc.ServiceRegistrar)

	// PermsSubServer returns the name that the permission manager stores
	// the permissions for this SubServer under.
	PermsSubServer() perms.SubServerName

	// ServerErrChan returns an error channel that should be listened on
	// after starting the sub-server to listen for any runtime errors. It
	// is optional and may be set to nil. This only applies in integrated
	// mode.
	ServerErrChan() chan error

	// MacPath returns the path to the sub-server's macaroon if it is not
	// running in remote mode.
	MacPath() string

	macaroons.MacaroonValidator
}

// subServer is a wrapper around the SubServer interface and is used by the
// subServerMgr to manage a SubServer.
type subServer struct {
	integratedStarted bool
	startedMu         sync.RWMutex

	stopped sync.Once

	SubServer

	remoteConn *grpc.ClientConn

	wg   sync.WaitGroup
	quit chan struct{}
}

// started returns true if the subServer has been started. This only applies if
// the subServer is running in integrated mode.
func (s *subServer) started() bool {
	s.startedMu.RLock()
	defer s.startedMu.RUnlock()

	return s.integratedStarted
}

// setStarted sets the subServer as started or not. This only applies if the
// subServer is running in integrated mode.
func (s *subServer) setStarted(started bool) {
	s.startedMu.Lock()
	defer s.startedMu.Unlock()

	s.integratedStarted = started
}

// stop the subServer by closing the connection to it if it is remote or by
// stopping the integrated process.
func (s *subServer) stop() error {
	// If the sub-server has not yet started, then we can exit early.
	if !s.started() {
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
func (s *subServer) startIntegrated(lndClient lnrpc.LightningClient,
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

			onError(fmt.Errorf("received "+
				"critical error from sub-server, "+
				"shutting down: %v", err),
			)

		case <-s.quit:
		}
	}()

	return nil
}

// connectRemote attempts to make a connection to the remote sub-server.
func (s *subServer) connectRemote() error {
	var err error
	s.remoteConn, err = dialBackend(
		s.Name(), s.RemoteConfig().RPCServer,
		lncfg.CleanAndExpandPath(s.RemoteConfig().TLSCertPath),
	)
	if err != nil {
		return fmt.Errorf("remote dial error: %v", err)
	}

	return nil
}

// subServerMgr manages a set of subServer objects.
type subServerMgr struct {
	servers []*subServer
	mu      sync.RWMutex

	statusServer *statusServer
	permsMgr     *perms.Manager
}

// newSubServerMgr constructs a new subServerMgr.
func newSubServerMgr(permsMgr *perms.Manager,
	statusServer *statusServer) *subServerMgr {

	return &subServerMgr{
		servers:      []*subServer{},
		statusServer: statusServer,
		permsMgr:     permsMgr,
	}
}

// AddServer adds a new subServer to the manager's set.
func (s *subServerMgr) AddServer(ss SubServer) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.servers = append(s.servers, &subServer{
		SubServer: ss,
		quit:      make(chan struct{}),
	})

	s.statusServer.RegisterSubServer(ss.Name())
}

// StartIntegratedServers starts all the manager's sub-servers that should be
// started in integrated mode.
func (s *subServerMgr) StartIntegratedServers(lndClient lnrpc.LightningClient,
	lndGrpc *lndclient.GrpcLndServices, withMacaroonService bool) {

	s.mu.Lock()
	defer s.mu.Unlock()

	for _, ss := range s.servers {
		if ss.Remote() {
			continue
		}

		err := ss.startIntegrated(
			lndClient, lndGrpc, withMacaroonService,
			func(err error) {
				s.statusServer.setServerErrored(
					ss.Name(), err.Error(),
				)
			},
		)
		if err != nil {
			s.statusServer.setServerErrored(ss.Name(), err.Error())
			continue
		}

		s.statusServer.setServerRunning(ss.Name())
	}
}

// ConnectRemoteSubServers creates connections to all the manager's sub-servers
// that are running remotely.
func (s *subServerMgr) ConnectRemoteSubServers() {
	s.mu.Lock()
	defer s.mu.Unlock()

	for _, ss := range s.servers {
		if !ss.Remote() {
			continue
		}

		err := ss.connectRemote()
		if err != nil {
			s.statusServer.setServerErrored(ss.Name(), err.Error())
			continue
		}

		s.statusServer.setServerRunning(ss.Name())
	}
}

// RegisterRPCServices registers all the manager's sub-servers with the given
// grpc registrar.
func (s *subServerMgr) RegisterRPCServices(server grpc.ServiceRegistrar) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, ss := range s.servers {
		// In remote mode the "director" of the RPC proxy will act as
		// a catch-all for any gRPC request that isn't known because we
		// didn't register any server for it. The director will then
		// forward the request to the remote service.
		if ss.Remote() {
			continue
		}

		ss.RegisterGrpcService(server)
	}
}

// GetRemoteConn checks if any of the manager's sub-servers owns the given uri
// and if so, the remote connection to that sub-server is returned. The bool
// return value indicates if the uri is managed by one of the sub-servers
// running in remote mode.
func (s *subServerMgr) GetRemoteConn(uri string) (bool, *grpc.ClientConn) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, ss := range s.servers {
		if !s.permsMgr.IsSubServerURI(ss.PermsSubServer(), uri) {
			continue
		}

		if !ss.Remote() {
			return false, nil
		}

		return true, ss.remoteConn
	}

	return false, nil
}

// ValidateMacaroon checks if any of the manager's sub-servers owns the given
// uri and if so, if it is running in remote mode, then true is returned since
// the macaroon will be validated by the remote subserver itself when the
// request arrives. Otherwise, the integrated sub-server's validator validates
// the macaroon.
func (s *subServerMgr) ValidateMacaroon(ctx context.Context,
	requiredPermissions []bakery.Op, uri string) (bool, error) {

	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, ss := range s.servers {
		if !s.permsMgr.IsSubServerURI(ss.PermsSubServer(), uri) {
			continue
		}

		if ss.Remote() {
			return true, nil
		}

		if !ss.started() {
			return true, fmt.Errorf("%s is not yet ready for "+
				"requests, lnd possibly still starting or "+
				"syncing", ss.Name())
		}

		err := ss.ValidateMacaroon(ctx, requiredPermissions, uri)
		if err != nil {
			return true, &proxyErr{
				proxyContext: ss.Name(),
				wrapped: fmt.Errorf("invalid macaroon: %v",
					err),
			}
		}
	}

	return false, nil
}

// HandledBy returns true if one of its sub-servers owns the given URI.
func (s *subServerMgr) HandledBy(uri string) (bool, string) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, ss := range s.servers {
		if !s.permsMgr.IsSubServerURI(ss.PermsSubServer(), uri) {
			continue
		}

		return true, ss.Name()
	}

	return false, ""
}

// MacaroonPath checks if any of the manager's sub-servers owns the given uri
// and if so, the appropriate macaroon path is returned for that sub-server.
func (s *subServerMgr) MacaroonPath(uri string) (bool, string) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, ss := range s.servers {
		if !s.permsMgr.IsSubServerURI(ss.PermsSubServer(), uri) {
			continue
		}

		if ss.Remote() {
			return true, ss.RemoteConfig().MacaroonPath
		}

		return true, ss.MacPath()
	}

	return false, ""
}

// ReadRemoteMacaroon checks if any of the manager's sub-servers running in
// remote mode owns the given uri and if so, the appropriate macaroon path is
// returned for that sub-server.
func (s *subServerMgr) ReadRemoteMacaroon(uri string) (bool, []byte, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, ss := range s.servers {
		if !s.permsMgr.IsSubServerURI(ss.PermsSubServer(), uri) {
			continue
		}

		if !ss.Remote() {
			return false, nil, nil
		}

		macBytes, err := readMacaroon(lncfg.CleanAndExpandPath(
			ss.RemoteConfig().MacaroonPath,
		))

		return true, macBytes, err
	}

	return false, nil, nil
}

// Stop stops all the manager's sub-servers
func (s *subServerMgr) Stop() error {
	var returnErr error

	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, ss := range s.servers {
		if ss.Remote() {
			continue
		}

		err := ss.stop()
		if err != nil {
			log.Errorf("Error stopping %s: %v", ss.Name(), err)
			returnErr = err
		}

		s.statusServer.setServerStopped(ss.Name())
	}

	return returnErr
}
