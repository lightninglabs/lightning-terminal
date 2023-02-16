package terminal

import (
	"github.com/lightninglabs/faraday"
	"github.com/lightninglabs/faraday/frdrpc"
	"github.com/lightninglabs/faraday/frdrpcserver"
	"github.com/lightninglabs/lightning-terminal/perms"
	"github.com/lightninglabs/lndclient"
	"github.com/lightninglabs/loop/loopd"
	"github.com/lightninglabs/loop/looprpc"
	"github.com/lightninglabs/pool"
	"github.com/lightninglabs/pool/poolrpc"
	"github.com/lightningnetwork/lnd/lnrpc"
	"google.golang.org/grpc"
)

// faradaySubServer implements the SubServer interface.
type faradaySubServer struct {
	*frdrpcserver.RPCServer

	remote    bool
	cfg       *faraday.Config
	remoteCfg *RemoteDaemonConfig
}

// A compile-time check to ensure that faradaySubServer implements SubServer.
var _ SubServer = (*faradaySubServer)(nil)

// NewFaradaySubServer returns a new faraday implementation of the SubServer
// interface.
func NewFaradaySubServer(cfg *faraday.Config, rpcCfg *frdrpcserver.Config,
	remoteCfg *RemoteDaemonConfig, remote bool) SubServer {

	return &faradaySubServer{
		RPCServer: frdrpcserver.NewRPCServer(rpcCfg),
		cfg:       cfg,
		remoteCfg: remoteCfg,
		remote:    remote,
	}
}

// Name returns the name of the sub-server.
//
// NOTE: this is part of the SubServer interface.
func (f *faradaySubServer) Name() string {
	return "faraday"
}

// Remote returns true if the sub-server is running remotely and so
// should be connected to instead of spinning up an integrated server.
//
// NOTE: this is part of the SubServer interface.
func (f *faradaySubServer) Remote() bool {
	return f.remote
}

// RemoteConfig returns the config required to connect to the sub-server
// if it is running in remote mode.
//
// NOTE: this is part of the SubServer interface.
func (f *faradaySubServer) RemoteConfig() *RemoteDaemonConfig {
	return f.remoteCfg
}

// Start starts the sub-server in integrated mode.
//
// NOTE: this is part of the SubServer interface.
func (f *faradaySubServer) Start(_ lnrpc.LightningClient,
	lndGrpc *lndclient.GrpcLndServices, withMacaroonService bool) error {

	return f.StartAsSubserver(
		lndGrpc.LndServices, withMacaroonService,
	)
}

// RegisterGrpcService must register the sub-server's GRPC server with the given
// registrar.
//
// NOTE: this is part of the SubServer interface.
func (f *faradaySubServer) RegisterGrpcService(service grpc.ServiceRegistrar) {
	frdrpc.RegisterFaradayServerServer(service, f)
}

// PermsSubServer returns the name that the permission manager stores the
// permissions for this SubServer under.
//
// NOTE: this is part of the SubServer interface.
func (f *faradaySubServer) PermsSubServer() perms.SubServerName {
	return perms.SubServerFaraday
}

// ServerErrChan returns an error channel that should be listened on after
// starting the sub-server to listen for any runtime errors. It is optional and
// may be set to nil. This only applies in integrated mode.
//
// NOTE: this is part of the SubServer interface.
func (f *faradaySubServer) ServerErrChan() chan error {
	return nil
}

// MacPath returns the path to the sub-server's macaroon if it is not running in
// remote mode.
//
// NOTE: this is part of the SubServer interface.
func (f *faradaySubServer) MacPath() string {
	return f.cfg.MacaroonPath
}

// faradaySubServer implements the SubServer interface.
type loopSubServer struct {
	*loopd.Daemon
	remote    bool
	cfg       *loopd.Config
	remoteCfg *RemoteDaemonConfig
}

// A compile-time check to ensure that faradaySubServer implements SubServer.
var _ SubServer = (*loopSubServer)(nil)

// NewLoopSubServer returns a new loop implementation of the SubServer
// interface.
func NewLoopSubServer(cfg *loopd.Config, remoteCfg *RemoteDaemonConfig,
	remote bool) SubServer {

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
	return "loop"
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

// PermsSubServer returns the name that the permission manager stores the
// permissions for this SubServer under.
//
// NOTE: this is part of the SubServer interface.
func (l *loopSubServer) PermsSubServer() perms.SubServerName {
	return perms.SubServerLoop
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

// poolSubServer implements the SubServer interface.
type poolSubServer struct {
	*pool.Server
	remote    bool
	cfg       *pool.Config
	remoteCfg *RemoteDaemonConfig
}

// A compile-time check to ensure that faradaySubServer implements SubServer.
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
	return "pool"
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

// PermsSubServer returns the name that the permission manager stores the
// permissions for this SubServer under.
//
// NOTE: this is part of the SubServer interface.
func (p *poolSubServer) PermsSubServer() perms.SubServerName {
	return perms.SubServerPool
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
