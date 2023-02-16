package terminal

import (
	"github.com/lightninglabs/faraday"
	"github.com/lightninglabs/faraday/frdrpc"
	"github.com/lightninglabs/faraday/frdrpcserver"
	"github.com/lightninglabs/lightning-terminal/perms"
	"github.com/lightninglabs/lndclient"
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
