package subservers

import (
	"context"
	"strings"

	"github.com/btcsuite/btcd/chaincfg"
	restProxy "github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"github.com/lightninglabs/lndclient"
	tap "github.com/lightninglabs/taproot-assets"
	"github.com/lightninglabs/taproot-assets/address"
	"github.com/lightninglabs/taproot-assets/perms"
	"github.com/lightninglabs/taproot-assets/tapcfg"
	"github.com/lightninglabs/taproot-assets/taprpc"
	"github.com/lightninglabs/taproot-assets/taprpc/assetwalletrpc"
	"github.com/lightninglabs/taproot-assets/taprpc/mintrpc"
	"github.com/lightninglabs/taproot-assets/taprpc/rfqrpc"
	tchrpc "github.com/lightninglabs/taproot-assets/taprpc/tapchannelrpc"
	"github.com/lightninglabs/taproot-assets/taprpc/universerpc"
	"github.com/lightningnetwork/lnd/lnrpc"
	"google.golang.org/grpc"
	"gopkg.in/macaroon-bakery.v2/bakery"
)

// taprootAssetsSubServer implements the SubServer interface.
type taprootAssetsSubServer struct {
	*tap.Server

	remote    bool
	lndRemote bool

	cfg       *tapcfg.Config
	remoteCfg *RemoteDaemonConfig

	errChan chan error
}

// A compile-time check to ensure that taprootAssetsSubServer implements
// SubServer.
var _ SubServer = (*taprootAssetsSubServer)(nil)

// NewTaprootAssetsSubServer returns a new tap implementation of the SubServer
// interface.
func NewTaprootAssetsSubServer(network string, cfg *tapcfg.Config,
	remoteCfg *RemoteDaemonConfig, remote, lndRemote bool) SubServer {

	// Overwrite the tap daemon's user agent name, so it sends "litd"
	// instead of "tapd".
	tap.SetAgentName("litd")

	// A quirk of the address package is that it requires the exact testnet
	// name, not the generic one...
	if network == "testnet" {
		network = chaincfg.TestNet3Params.Name
	}

	chainCfg := address.ParamsForChain(network)

	return &taprootAssetsSubServer{
		Server:    tap.NewServer(&chainCfg, nil),
		cfg:       cfg,
		remoteCfg: remoteCfg,
		remote:    remote,
		lndRemote: lndRemote,
		errChan:   make(chan error, 1),
	}
}

// Name returns the name of the sub-server.
//
// NOTE: this is part of the SubServer interface.
func (t *taprootAssetsSubServer) Name() string {
	return TAP
}

// Remote returns true if the sub-server is running remotely and so should be
// connected to instead of spinning up an integrated server.
//
// NOTE: this is part of the SubServer interface.
func (t *taprootAssetsSubServer) Remote() bool {
	return t.remote
}

// RemoteConfig returns the config required to connect to the sub-server if it
// is running in remote mode.
//
// NOTE: this is part of the SubServer interface.
func (t *taprootAssetsSubServer) RemoteConfig() *RemoteDaemonConfig {
	return t.remoteCfg
}

// Start starts the sub-server in integrated mode.
//
// NOTE: this is part of the SubServer interface.
func (t *taprootAssetsSubServer) Start(_ lnrpc.LightningClient,
	lndGrpc *lndclient.GrpcLndServices, withMacaroonService bool) error {

	t.cfg.RpcConf.NoMacaroons = !withMacaroonService

	var err error
	t.cfg, err = tapcfg.ValidateConfig(*t.cfg, log)
	if err != nil {
		return err
	}

	// If we're being called here, it means tapd is running in integrated
	// mode. But we can only offer Taproot Asset channel functionality if
	// lnd is also running in integrated mode.
	enableChannelFeatures := !t.lndRemote

	err = tapcfg.ConfigureSubServer(
		t.Server, t.cfg, log, &lndGrpc.LndServices,
		enableChannelFeatures, t.errChan,
	)
	if err != nil {
		return err
	}

	return t.StartAsSubserver(lndGrpc)
}

// RegisterGrpcService must register the sub-server's GRPC server with the given
// registrar.
//
// NOTE: this is part of the SubServer interface.
func (t *taprootAssetsSubServer) RegisterGrpcService(
	registrar grpc.ServiceRegistrar) {

	taprpc.RegisterTaprootAssetsServer(registrar, t)
	mintrpc.RegisterMintServer(registrar, t)
	assetwalletrpc.RegisterAssetWalletServer(registrar, t)
	rfqrpc.RegisterRfqServer(registrar, t)
	tchrpc.RegisterTaprootAssetChannelsServer(registrar, t)
	universerpc.RegisterUniverseServer(registrar, t)
}

// RegisterRestService registers the sub-server's REST handlers with the given
// endpoint.
//
// NOTE: this is part of the SubServer interface.
func (t *taprootAssetsSubServer) RegisterRestService(ctx context.Context,
	mux *restProxy.ServeMux, endpoint string,
	dialOpts []grpc.DialOption) error {

	err := taprpc.RegisterTaprootAssetsHandlerFromEndpoint(
		ctx, mux, endpoint, dialOpts,
	)
	if err != nil {
		return err
	}

	err = mintrpc.RegisterMintHandlerFromEndpoint(
		ctx, mux, endpoint, dialOpts,
	)
	if err != nil {
		return err
	}

	err = assetwalletrpc.RegisterAssetWalletHandlerFromEndpoint(
		ctx, mux, endpoint, dialOpts,
	)
	if err != nil {
		return err
	}

	err = rfqrpc.RegisterRfqHandlerFromEndpoint(
		ctx, mux, endpoint, dialOpts,
	)
	if err != nil {
		return err
	}

	err = tchrpc.RegisterTaprootAssetChannelsHandlerFromEndpoint(
		ctx, mux, endpoint, dialOpts,
	)
	if err != nil {
		return err
	}

	err = universerpc.RegisterUniverseHandlerFromEndpoint(
		ctx, mux, endpoint, dialOpts,
	)
	if err != nil {
		return err
	}

	return nil
}

// ServerErrChan returns an error channel that should be listened on after
// starting the sub-server to listen for any runtime errors. It is optional and
// may be set to nil. This only applies in integrated mode.
//
// NOTE: this is part of the SubServer interface.
func (t *taprootAssetsSubServer) ServerErrChan() chan error {
	return t.errChan
}

// MacPath returns the path to the sub-server's macaroon if it is not running in
// remote mode.
//
// NOTE: this is part of the SubServer interface.
func (t *taprootAssetsSubServer) MacPath() string {
	return t.cfg.RpcConf.MacaroonPath
}

// Permissions returns a map of all RPC methods and their required macaroon
// permissions to access the sub-server.
//
// NOTE: this is part of the SubServer interface.
func (t *taprootAssetsSubServer) Permissions() map[string][]bakery.Op {
	return perms.RequiredPermissions
}

// WhiteListedURLs returns a map of all the sub-server's URLs that can be
// accessed without a macaroon.
//
// NOTE: this is part of the SubServer interface.
func (t *taprootAssetsSubServer) WhiteListedURLs() map[string]struct{} {
	// If the taproot-asset daemon is running in integrated mode, then we
	// use cfg.RpcConf.AllowPublicUniProofCourier to determine if universe
	// proof courier RPC endpoints should be included in the whitelist, as
	// well as cfg.RpcConf.AllowPublicStats for the public stats endpoints.
	// If it is running in remote mode however, we just allow the request
	// through since the remote daemon will handle blocking the call if it
	// is not whitelisted there.
	publicUniRead := strings.Contains(
		t.cfg.Universe.PublicAccess,
		string(tap.UniversePublicAccessStatusRead),
	)
	publicUniWrite := strings.Contains(
		t.cfg.Universe.PublicAccess,
		string(tap.UniversePublicAccessStatusWrite),
	)

	return perms.MacaroonWhitelist(
		publicUniRead || t.remote, publicUniWrite || t.remote,
		t.cfg.RpcConf.AllowPublicUniProofCourier || t.remote,
		t.cfg.RpcConf.AllowPublicStats || t.remote,
	)
}
