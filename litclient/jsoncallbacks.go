package litclient

import (
	"context"

	"github.com/lightninglabs/faraday/frdrpc"
	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/lightninglabs/loop/looprpc"
	"github.com/lightninglabs/pool/poolrpc"
	"github.com/lightninglabs/taproot-assets/taprpc"
	"github.com/lightninglabs/taproot-assets/taprpc/assetwalletrpc"
	"github.com/lightninglabs/taproot-assets/taprpc/mintrpc"
	"github.com/lightninglabs/taproot-assets/taprpc/universerpc"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lnrpc/autopilotrpc"
	"github.com/lightningnetwork/lnd/lnrpc/chainrpc"
	"github.com/lightningnetwork/lnd/lnrpc/invoicesrpc"
	"github.com/lightningnetwork/lnd/lnrpc/routerrpc"
	"github.com/lightningnetwork/lnd/lnrpc/signrpc"
	"github.com/lightningnetwork/lnd/lnrpc/verrpc"
	"github.com/lightningnetwork/lnd/lnrpc/walletrpc"
	"github.com/lightningnetwork/lnd/lnrpc/watchtowerrpc"
	"github.com/lightningnetwork/lnd/lnrpc/wtclientrpc"
	"google.golang.org/grpc"
)

// StubPackageRegistration defines the signature of a function that maps JSON
// method URIs to the function that should be called to handle the method.
type StubPackageRegistration func(map[string]func(context.Context,
	*grpc.ClientConn, string, func(string, error)))

// Registrations defines a list of StubPackageRegistrations that a lit client
// will have access to when using Lit.
var Registrations = []StubPackageRegistration{
	lnrpc.RegisterLightningJSONCallbacks,
	lnrpc.RegisterStateJSONCallbacks,
	autopilotrpc.RegisterAutopilotJSONCallbacks,
	chainrpc.RegisterChainNotifierJSONCallbacks,
	invoicesrpc.RegisterInvoicesJSONCallbacks,
	routerrpc.RegisterRouterJSONCallbacks,
	signrpc.RegisterSignerJSONCallbacks,
	verrpc.RegisterVersionerJSONCallbacks,
	walletrpc.RegisterWalletKitJSONCallbacks,
	watchtowerrpc.RegisterWatchtowerJSONCallbacks,
	wtclientrpc.RegisterWatchtowerClientJSONCallbacks,
	looprpc.RegisterSwapClientJSONCallbacks,
	poolrpc.RegisterTraderJSONCallbacks,
	frdrpc.RegisterFaradayServerJSONCallbacks,
	litrpc.RegisterSessionsJSONCallbacks,
	litrpc.RegisterAccountsJSONCallbacks,
	litrpc.RegisterAutopilotJSONCallbacks,
	litrpc.RegisterFirewallJSONCallbacks,
	litrpc.RegisterStatusJSONCallbacks,
	taprpc.RegisterTaprootAssetsJSONCallbacks,
	assetwalletrpc.RegisterAssetWalletJSONCallbacks,
	universerpc.RegisterUniverseJSONCallbacks,
	mintrpc.RegisterMintJSONCallbacks,
}
