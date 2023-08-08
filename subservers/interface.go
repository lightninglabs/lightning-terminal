package subservers

import (
	"context"

	restProxy "github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"github.com/lightninglabs/lndclient"
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
	macaroons.MacaroonValidator

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

	// RegisterRestService registers the sub-server's REST handlers with the
	// given endpoint.
	RegisterRestService(context.Context, *restProxy.ServeMux, string,
		[]grpc.DialOption) error

	// ServerErrChan returns an error channel that should be listened on
	// after starting the sub-server to listen for any runtime errors. It
	// is optional and may be set to nil. This only applies in integrated
	// mode.
	ServerErrChan() chan error

	// MacPath returns the path to the sub-server's macaroon if it is not
	// running in remote mode.
	MacPath() string

	// Permissions returns a map of all RPC methods and their required
	// macaroon permissions to access the sub-server.
	Permissions() map[string][]bakery.Op

	// WhiteListedURLs returns a map of all the sub-server's URLs that can
	// be accessed without a macaroon.
	WhiteListedURLs() map[string]struct{}
}
