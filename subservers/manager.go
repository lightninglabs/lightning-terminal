package subservers

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/lightninglabs/lndclient"
	"github.com/lightningnetwork/lnd/lnrpc"
	grpcProxy "github.com/mwitkow/grpc-proxy/proxy"
	"google.golang.org/grpc"
	"google.golang.org/grpc/backoff"
	"google.golang.org/grpc/credentials"
	"gopkg.in/macaroon-bakery.v2/bakery"
)

var (
	// maxMsgRecvSize is the largest message our REST proxy will receive. We
	// set this to 200MiB atm.
	maxMsgRecvSize = grpc.MaxCallRecvMsgSize(1 * 1024 * 1024 * 200)

	// defaultConnectTimeout is the default timeout for connecting to the
	// backend.
	defaultConnectTimeout = 15 * time.Second
)

// Manager manages a set of subServer objects.
type Manager struct {
	servers []*subServerWrapper
	mu      sync.RWMutex
}

// NewManager constructs a new subServerMgr.
func NewManager() *Manager {
	return &Manager{}
}

// AddServer adds a new subServer to the manager's set.
func (s *Manager) AddServer(ss SubServer) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.servers = append(s.servers, &subServerWrapper{
		subServer: ss,
		quit:      make(chan struct{}),
	})
}

// StartIntegratedServers starts all the manager's sub-servers that should be
// started in integrated mode.
func (s *Manager) StartIntegratedServers(lndClient lnrpc.LightningClient,
	lndGrpc *lndclient.GrpcLndServices, withMacaroonService bool) error {

	s.mu.Lock()
	defer s.mu.Unlock()

	for _, ss := range s.servers {
		if ss.subServer.Remote() {
			continue
		}

		err := ss.startIntegrated(
			lndClient, lndGrpc, withMacaroonService,
		)
		if err != nil {
			return fmt.Errorf("Unable to start %v in integrated "+
				"mode: %v", ss.subServer.Name(), err)
		}
	}

	return nil
}

// ConnectRemoteSubServers creates connections to all the manager's sub-servers
// that are running remotely.
func (s *Manager) ConnectRemoteSubServers() {
	s.mu.Lock()
	defer s.mu.Unlock()

	for _, ss := range s.servers {
		if !ss.subServer.Remote() {
			continue
		}

		err := ss.connectRemote()
		if err != nil {
			log.Errorf("Failed to connect to remote %s: %v",
				ss.subServer.Name(), err)

			continue
		}
	}
}

// RegisterRPCServices registers all the manager's sub-servers with the given
// grpc registrar.
func (s *Manager) RegisterRPCServices(server grpc.ServiceRegistrar) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, ss := range s.servers {
		// In remote mode the "director" of the RPC proxy will act as
		// a catch-all for any gRPC request that isn't known because we
		// didn't register any server for it. The director will then
		// forward the request to the remote service.
		if ss.subServer.Remote() {
			continue
		}

		ss.subServer.RegisterGrpcService(server)
	}
}

// ValidateMacaroon checks if any of the manager's sub-servers owns the given
// uri and if so, if it is running in remote mode, then true is returned since
// the macaroon will be validated by the remote subserver itself when the
// request arrives. Otherwise, the integrated sub-server's validator validates
// the macaroon.
func (s *Manager) ValidateMacaroon(ctx context.Context,
	requiredPermissions []bakery.Op, uri string) (bool, error) {

	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, ss := range s.servers {
		// TODO(positiveblue): check subserver permissions.

		// If the sub-server is running in remote mode, then we don't
		// need to validate the macaroon here since the remote server
		// will do it when the request arrives. But we have handled the
		// request, as we were able to identify it.
		if ss.subServer.Remote() {
			return true, nil
		}

		// If the sub-server hasn't started yet, then we can't validate
		// the macaroon. But we know that we can handle the request, as
		// we were able to identify it.
		if !ss.started() {
			return true, fmt.Errorf("%s is not yet ready for "+
				"requests, the subserver has not started or "+
				"lnd still starting/syncing",
				ss.subServer.Name())
		}

		// Validate the macaroon with the integrated sub-server's own
		// validator.
		err := ss.subServer.ValidateMacaroon(
			ctx, requiredPermissions, uri,
		)
		if err != nil {
			return true, fmt.Errorf("invalid macaroon: %v", err)
		}

		// The macaroon is valid for this sub-server, we can return
		// early.
		return true, nil
	}

	// No sub-server owns the given uri, so we haven't handled this call.
	return false, nil
}

// Stop stops all the manager's sub-servers
func (s *Manager) Stop() error {
	var returnErr error

	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, ss := range s.servers {
		if ss.subServer.Remote() {
			continue
		}

		err := ss.stop()
		if err != nil {
			log.Errorf("Error stopping %s: %v", ss.subServer.Name(),
				err)
			returnErr = err
		}
	}

	return returnErr
}

func dialBackend(name, dialAddr, tlsCertPath string) (*grpc.ClientConn, error) {
	tlsConfig, err := credentials.NewClientTLSFromFile(tlsCertPath, "")
	if err != nil {
		return nil, fmt.Errorf("could not read %s TLS cert %s: %v",
			name, tlsCertPath, err)
	}

	opts := []grpc.DialOption{
		// From the grpcProxy doc: This codec is *crucial* to the
		// functioning of the proxy.
		grpc.WithCodec(grpcProxy.Codec()), // nolint
		grpc.WithTransportCredentials(tlsConfig),
		grpc.WithDefaultCallOptions(maxMsgRecvSize),
		grpc.WithConnectParams(grpc.ConnectParams{
			Backoff:           backoff.DefaultConfig,
			MinConnectTimeout: defaultConnectTimeout,
		}),
	}

	log.Infof("Dialing %s gRPC server at %s", name, dialAddr)
	cc, err := grpc.Dial(dialAddr, opts...)
	if err != nil {
		return nil, fmt.Errorf("failed dialing %s backend: %v", name,
			err)
	}
	return cc, nil
}
