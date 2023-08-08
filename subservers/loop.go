package subservers

import (
	"context"

	restProxy "github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"github.com/lightninglabs/lndclient"
	"github.com/lightninglabs/loop"
	"github.com/lightninglabs/loop/loopd"
	"github.com/lightninglabs/loop/loopd/perms"
	"github.com/lightninglabs/loop/looprpc"
	"github.com/lightningnetwork/lnd/lnrpc"
	"google.golang.org/grpc"
	"gopkg.in/macaroon-bakery.v2/bakery"
)

// loopSubServer implements the SubServer interface.
type loopSubServer struct {
	*loopd.Daemon
	remote    bool
	cfg       *loopd.Config
	remoteCfg *RemoteDaemonConfig
}

// A compile-time check to ensure that loopSubServer implements SubServer.
var _ SubServer = (*loopSubServer)(nil)

// NewLoopSubServer returns a new loop implementation of the SubServer
// interface.
func NewLoopSubServer(cfg *loopd.Config, remoteCfg *RemoteDaemonConfig,
	remote bool) SubServer {

	// Overwrite the loop daemon's user agent name, so it sends "litd"
	// instead of "loopd".
	loop.AgentName = "litd"

	return &loopSubServer{
		Daemon:    loopd.New(cfg, nil),
		cfg:       cfg,
		remoteCfg: remoteCfg,
		remote:    remote,
	}
}

// Name returns the name of the sub-server.
//
// NOTE: this is part of the SubServer interface.
func (l *loopSubServer) Name() string {
	return LOOP
}

// Remote returns true if the sub-server is running remotely and so should be
// connected to instead of spinning up an integrated server.
//
// NOTE: this is part of the SubServer interface.
func (l *loopSubServer) Remote() bool {
	return l.remote
}

// RemoteConfig returns the config required to connect to the sub-server if it
// is running in remote mode.
//
// NOTE: this is part of the SubServer interface.
func (l *loopSubServer) RemoteConfig() *RemoteDaemonConfig {
	return l.remoteCfg
}

// Start starts the sub-server in integrated mode.
//
// NOTE: this is part of the SubServer interface.
func (l *loopSubServer) Start(_ lnrpc.LightningClient,
	lndGrpc *lndclient.GrpcLndServices, withMacaroonService bool) error {

	return l.StartAsSubserver(lndGrpc, withMacaroonService)
}

// Stop stops the sub-server in integrated mode.
//
// NOTE: this is part of the SubServer interface.
func (l *loopSubServer) Stop() error {
	l.Daemon.Stop()

	return nil
}

// RegisterGrpcService must register the sub-server's GRPC server with the given
// registrar.
//
// NOTE: this is part of the SubServer interface.
func (l *loopSubServer) RegisterGrpcService(registrar grpc.ServiceRegistrar) {
	looprpc.RegisterSwapClientServer(registrar, l)
}

// RegisterRestService registers the sub-server's REST handlers with the given
// endpoint.
//
// NOTE: this is part of the SubServer interface.
func (l *loopSubServer) RegisterRestService(ctx context.Context,
	mux *restProxy.ServeMux, endpoint string,
	dialOpts []grpc.DialOption) error {

	return looprpc.RegisterSwapClientHandlerFromEndpoint(
		ctx, mux, endpoint, dialOpts,
	)
}

// ServerErrChan returns an error channel that should be listened on after
// starting the sub-server to listen for any runtime errors. It is optional and
// may be set to nil. This only applies in integrated mode.
//
// NOTE: this is part of the SubServer interface.
func (l *loopSubServer) ServerErrChan() chan error {
	return l.ErrChan
}

// MacPath returns the path to the sub-server's macaroon if it is not running in
// remote mode.
//
// NOTE: this is part of the SubServer interface.
func (l *loopSubServer) MacPath() string {
	return l.cfg.MacaroonPath
}

// Permissions returns a map of all RPC methods and their required macaroon
// permissions to access the sub-server.
//
// NOTE: this is part of the SubServer interface.
func (l *loopSubServer) Permissions() map[string][]bakery.Op {
	return perms.RequiredPermissions
}

// WhiteListedURLs returns a map of all the sub-server's URLs that can be
// accessed without a macaroon.
//
// NOTE: this is part of the SubServer interface.
func (l *loopSubServer) WhiteListedURLs() map[string]struct{} {
	return nil
}
