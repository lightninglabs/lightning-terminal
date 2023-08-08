package subservers

import (
	"context"

	restProxy "github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"github.com/lightninglabs/lndclient"
	"github.com/lightninglabs/pool"
	"github.com/lightninglabs/pool/perms"
	"github.com/lightninglabs/pool/poolrpc"
	"github.com/lightningnetwork/lnd/lnrpc"
	"google.golang.org/grpc"
	"gopkg.in/macaroon-bakery.v2/bakery"
)

// poolSubServer implements the SubServer interface.
type poolSubServer struct {
	*pool.Server
	remote    bool
	cfg       *pool.Config
	remoteCfg *RemoteDaemonConfig
}

// A compile-time check to ensure that poolSubServer implements SubServer.
var _ SubServer = (*poolSubServer)(nil)

// NewPoolSubServer returns a new pool implementation of the SubServer
// interface.
func NewPoolSubServer(cfg *pool.Config, remoteCfg *RemoteDaemonConfig,
	remote bool) SubServer {

	// Overwrite the pool daemon's user agent name, so it sends "litd"
	// instead of and "poold".
	pool.SetAgentName("litd")

	return &poolSubServer{
		Server:    pool.NewServer(cfg),
		cfg:       cfg,
		remoteCfg: remoteCfg,
		remote:    remote,
	}
}

// Name returns the name of the sub-server.
//
// NOTE: this is part of the SubServer interface.
func (p *poolSubServer) Name() string {
	return POOL
}

// Remote returns true if the sub-server is running remotely and so should be
// connected to instead of spinning up an integrated server.
//
// NOTE: this is part of the SubServer interface.
func (p *poolSubServer) Remote() bool {
	return p.remote
}

// RemoteConfig returns the config required to connect to the sub-server if it
// is running in remote mode.
//
// NOTE: this is part of the SubServer interface.
func (p *poolSubServer) RemoteConfig() *RemoteDaemonConfig {
	return p.remoteCfg
}

// Start starts the sub-server in integrated mode.
//
// NOTE: this is part of the SubServer interface.
func (p *poolSubServer) Start(lnClient lnrpc.LightningClient,
	lndGrpc *lndclient.GrpcLndServices, withMacaroonService bool) error {

	return p.StartAsSubserver(lnClient, lndGrpc, withMacaroonService)
}

// RegisterGrpcService must register the sub-server's GRPC server with the given
// registrar.
//
// NOTE: this is part of the SubServer interface.
func (p *poolSubServer) RegisterGrpcService(registrar grpc.ServiceRegistrar) {
	poolrpc.RegisterTraderServer(registrar, p)
}

// RegisterRestService registers the sub-server's REST handlers with the given
// endpoint.
//
// NOTE: this is part of the SubServer interface.
func (p *poolSubServer) RegisterRestService(ctx context.Context,
	mux *restProxy.ServeMux, endpoint string,
	dialOpts []grpc.DialOption) error {

	return poolrpc.RegisterTraderHandlerFromEndpoint(
		ctx, mux, endpoint, dialOpts,
	)
}

// ServerErrChan returns an error channel that should be listened on after
// starting the sub-server to listen for any runtime errors. It is optional and
// may be set to nil. This only applies in integrated mode.
//
// NOTE: this is part of the SubServer interface.
func (p *poolSubServer) ServerErrChan() chan error {
	return nil
}

// MacPath returns the path to the sub-server's macaroon if it is not running in
// remote mode.
//
// NOTE: this is part of the SubServer interface.
func (p *poolSubServer) MacPath() string {
	return p.cfg.MacaroonPath
}

// Permissions returns a map of all RPC methods and their required macaroon
// permissions to access the sub-server.
//
// NOTE: this is part of the SubServer interface.
func (p *poolSubServer) Permissions() map[string][]bakery.Op {
	return perms.RequiredPermissions
}

// WhiteListedURLs returns a map of all the sub-server's URLs that can be
// accessed without a macaroon.
//
// NOTE: this is part of the SubServer interface.
func (p *poolSubServer) WhiteListedURLs() map[string]struct{} {
	return nil
}
