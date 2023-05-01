package subservers

import (
	"github.com/lightninglabs/lndclient"
	"github.com/lightninglabs/pool"
	"github.com/lightninglabs/pool/poolrpc"
	"github.com/lightningnetwork/lnd/lnrpc"
	"google.golang.org/grpc"
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
