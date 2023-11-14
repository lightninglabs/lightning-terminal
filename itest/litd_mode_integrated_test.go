package itest

import (
	"bytes"
	"context"
	"crypto/tls"
	"crypto/x509"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/btcsuite/btcd/btcec/v2"
	"github.com/btcsuite/btcd/btcutil"
	"github.com/lightninglabs/faraday/frdrpc"
	faraday "github.com/lightninglabs/faraday/frdrpcserver/perms"
	"github.com/lightninglabs/lightning-node-connect/mailbox"
	terminal "github.com/lightninglabs/lightning-terminal"
	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/lightninglabs/lightning-terminal/perms"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightninglabs/lightning-terminal/subservers"
	loop "github.com/lightninglabs/loop/loopd/perms"
	"github.com/lightninglabs/loop/looprpc"
	pool "github.com/lightninglabs/pool/perms"
	"github.com/lightninglabs/pool/poolrpc"
	tap "github.com/lightninglabs/taproot-assets/perms"
	"github.com/lightninglabs/taproot-assets/taprpc"
	"github.com/lightninglabs/taproot-assets/taprpc/universerpc"
	"github.com/lightningnetwork/lnd/keychain"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lnrpc/routerrpc"
	"github.com/lightningnetwork/lnd/lnrpc/walletrpc"
	"github.com/lightningnetwork/lnd/macaroons"
	"github.com/stretchr/testify/require"
	"golang.org/x/net/http2"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
	"gopkg.in/macaroon.v2"
)

const (
	// indexHtmlMarker is a string that appears in the rendered index.html
	// file of the main UI.
	indexHtmlMarker = "<title>Lightning Terminal</title>"

	// mailboxServerAddr is the address of the mailbox server to use during
	// integration tests.
	mailboxServerAddr = "mailbox.testnet.lightningcluster.com:443"
)

// requestFn is a function type for a helper function that makes a daemon
// specific request and returns the response and error for it. This is used to
// abstract away the lnd/faraday/loop/pool specific gRPC code from the actual
// test code.
type requestFn func(ctx context.Context,
	c grpc.ClientConnInterface) (proto.Message, error)

// macaroonFn is a function that returns the correct macaroon path for each of
// the integrated daemons.
type macaroonFn func(cfg *LitNodeConfig) string

var (
	dummyMac      = makeMac()
	dummyMacBytes = serializeMac(dummyMac)

	marshalOptions = &protojson.MarshalOptions{
		UseProtoNames:   true,
		EmitUnpopulated: true,
	}

	transport = &http2.Transport{
		TLSClientConfig: &tls.Config{
			InsecureSkipVerify: true,
		},
	}
	client = http.Client{
		Transport: transport,
		Timeout:   1 * time.Second,
	}

	// emptyGrpcWebRequest is the binary serialized POST content of an empty
	// gRPC request. One byte version and then 4 bytes content length.
	emptyGrpcWebRequest = []byte{0, 0, 0, 0, 0}

	lnrpcRequestFn = func(ctx context.Context,
		c grpc.ClientConnInterface) (proto.Message, error) {

		lnrpcConn := lnrpc.NewLightningClient(c)
		return lnrpcConn.GetInfo(
			ctx, &lnrpc.GetInfoRequest{},
		)
	}
	lndMacaroonFn = func(cfg *LitNodeConfig) string {
		return cfg.AdminMacPath
	}
	lnrpcStateRequestFn = func(ctx context.Context,
		c grpc.ClientConnInterface) (proto.Message, error) {

		lnrpcConn := lnrpc.NewStateClient(c)
		return lnrpcConn.GetState(
			ctx, &lnrpc.GetStateRequest{},
		)
	}
	emptyMacaroonFn = func(_ *LitNodeConfig) string {
		return ""
	}
	routerrpcRequestFn = func(ctx context.Context,
		c grpc.ClientConnInterface) (proto.Message, error) {

		routerrpcConn := routerrpc.NewRouterClient(c)
		return routerrpcConn.GetMissionControlConfig(
			ctx, &routerrpc.GetMissionControlConfigRequest{},
		)
	}
	walletrpcRequestFn = func(ctx context.Context,
		c grpc.ClientConnInterface) (proto.Message, error) {

		walletrpcConn := walletrpc.NewWalletKitClient(c)
		return walletrpcConn.ListUnspent(
			ctx, &walletrpc.ListUnspentRequest{},
		)
	}
	faradayRequestFn = func(ctx context.Context,
		c grpc.ClientConnInterface) (proto.Message, error) {

		frdConn := frdrpc.NewFaradayServerClient(c)
		return frdConn.RevenueReport(
			ctx, &frdrpc.RevenueReportRequest{},
		)
	}
	faradayMacaroonFn = func(cfg *LitNodeConfig) string {
		return cfg.FaradayMacPath
	}
	loopRequestFn = func(ctx context.Context,
		c grpc.ClientConnInterface) (proto.Message, error) {

		loopConn := looprpc.NewSwapClientClient(c)
		return loopConn.ListSwaps(ctx, &looprpc.ListSwapsRequest{})
	}
	loopMacaroonFn = func(cfg *LitNodeConfig) string {
		return cfg.LoopMacPath
	}
	poolRequestFn = func(ctx context.Context,
		c grpc.ClientConnInterface) (proto.Message, error) {

		poolConn := poolrpc.NewTraderClient(c)
		return poolConn.GetInfo(ctx, &poolrpc.GetInfoRequest{})
	}
	poolMacaroonFn = func(cfg *LitNodeConfig) string {
		return cfg.PoolMacPath
	}
	tapRequestFn = func(ctx context.Context,
		c grpc.ClientConnInterface) (proto.Message, error) {

		tapConn := taprpc.NewTaprootAssetsClient(c)
		return tapConn.ListAssets(ctx, &taprpc.ListAssetRequest{})
	}
	tapUniverseRequestFn = func(ctx context.Context,
		c grpc.ClientConnInterface) (proto.Message, error) {

		universeConn := universerpc.NewUniverseClient(c)
		return universeConn.Info(ctx, &universerpc.InfoRequest{})
	}
	tapMacaroonFn = func(cfg *LitNodeConfig) string {
		return cfg.TapMacPath
	}
	litSessionRequestFn = func(ctx context.Context,
		c grpc.ClientConnInterface) (proto.Message, error) {

		litConn := litrpc.NewSessionsClient(c)
		return litConn.ListSessions(ctx, &litrpc.ListSessionsRequest{})
	}
	litAccountRequestFn = func(ctx context.Context,
		c grpc.ClientConnInterface) (proto.Message, error) {

		litConn := litrpc.NewAccountsClient(c)
		return litConn.ListAccounts(ctx, &litrpc.ListAccountsRequest{})
	}
	litAutopilotRequestFn = func(ctx context.Context,
		c grpc.ClientConnInterface) (proto.Message, error) {

		litConn := litrpc.NewAutopilotClient(c)
		return litConn.ListAutopilotFeatures(
			ctx, &litrpc.ListAutopilotFeaturesRequest{},
		)
	}
	proxyRequestFn = func(ctx context.Context,
		c grpc.ClientConnInterface) (proto.Message, error) {

		litConn := litrpc.NewProxyClient(c)
		return litConn.GetInfo(ctx, &litrpc.GetInfoRequest{})
	}
	statusRequestFn = func(ctx context.Context,
		c grpc.ClientConnInterface) (proto.Message, error) {

		litConn := litrpc.NewStatusClient(c)
		return litConn.SubServerStatus(
			ctx, &litrpc.SubServerStatusReq{},
		)
	}
	litMacaroonFn = func(cfg *LitNodeConfig) string {
		return cfg.LitMacPath
	}

	endpoints = []struct {
		name           string
		macaroonFn     macaroonFn
		requestFn      requestFn
		successPattern string

		// disabledPattern represents a substring that is expected to be
		// part of the error returned when a gRPC request is made to the
		// disabled endpoint.
		// TODO: once we have a subsystem manager, we can unify the
		// returned for disabled endpoints for both subsystems and
		// subservers by not registering the subsystem URIs to the
		// permsMgr if it has been disabled. This field will then be
		// unnecessary and can be removed.
		disabledPattern string

		allowedThroughLNC bool
		grpcWebURI        string
		restWebURI        string
		restPOST          bool
		canDisable        bool

		// noAuth is true if the call does not require a macaroon.
		noAuth bool

		// litOnly is true if the endpoint is only being served on
		// Lit's grpc server and so will never be accessible via the
		// LND port.
		litOnly bool
	}{{
		name:              "lnrpc",
		macaroonFn:        lndMacaroonFn,
		requestFn:         lnrpcRequestFn,
		successPattern:    "\"identity_pubkey\":\"0",
		allowedThroughLNC: true,
		grpcWebURI:        "/lnrpc.Lightning/GetInfo",
		restWebURI:        "/v1/getinfo",
	}, {
		name:              "lnrpc-whitelist",
		macaroonFn:        emptyMacaroonFn,
		requestFn:         lnrpcStateRequestFn,
		successPattern:    "\"state\":",
		allowedThroughLNC: true,
		grpcWebURI:        "/lnrpc.State/GetState",
		restWebURI:        "/v1/state",
		noAuth:            true,
	}, {
		name:              "routerrpc",
		macaroonFn:        lndMacaroonFn,
		requestFn:         routerrpcRequestFn,
		successPattern:    "\"config\":{",
		allowedThroughLNC: true,
		grpcWebURI:        "/routerrpc.Router/GetMissionControlConfig",
		restWebURI:        "/v2/router/mccfg",
	}, {
		name:              "walletrpc",
		macaroonFn:        lndMacaroonFn,
		requestFn:         walletrpcRequestFn,
		successPattern:    "\"utxos\":[",
		allowedThroughLNC: true,
		grpcWebURI:        "/walletrpc.WalletKit/ListUnspent",
		restWebURI:        "/v2/wallet/utxos",
		restPOST:          true,
	}, {
		name:              "frdrpc",
		macaroonFn:        faradayMacaroonFn,
		requestFn:         faradayRequestFn,
		successPattern:    "\"reports\":[]",
		disabledPattern:   "unknown request",
		allowedThroughLNC: true,
		grpcWebURI:        "/frdrpc.FaradayServer/RevenueReport",
		restWebURI:        "/v1/faraday/revenue",
		canDisable:        true,
	}, {
		name:              "looprpc",
		macaroonFn:        loopMacaroonFn,
		requestFn:         loopRequestFn,
		successPattern:    "\"swaps\":[]",
		disabledPattern:   "unknown request",
		allowedThroughLNC: true,
		grpcWebURI:        "/looprpc.SwapClient/ListSwaps",
		restWebURI:        "/v1/loop/swaps",
		canDisable:        true,
	}, {
		name:              "poolrpc",
		macaroonFn:        poolMacaroonFn,
		requestFn:         poolRequestFn,
		successPattern:    "\"accounts_active\":0",
		disabledPattern:   "unknown request",
		allowedThroughLNC: true,
		grpcWebURI:        "/poolrpc.Trader/GetInfo",
		restWebURI:        "/v1/pool/info",
		canDisable:        true,
	}, {
		name:              "taprpc",
		macaroonFn:        tapMacaroonFn,
		requestFn:         tapRequestFn,
		successPattern:    "\"assets\":[]",
		disabledPattern:   "unknown request",
		allowedThroughLNC: true,
		grpcWebURI:        "/taprpc.TaprootAssets/ListAssets",
		restWebURI:        "/v1/taproot-assets/assets",
		canDisable:        true,
	}, {
		name:              "taprpc-whitelist",
		macaroonFn:        emptyMacaroonFn,
		requestFn:         tapUniverseRequestFn,
		successPattern:    "\"runtime_id\":",
		disabledPattern:   "unknown request",
		allowedThroughLNC: true,
		grpcWebURI:        "/universerpc.Universe/Info",
		restWebURI:        "/v1/taproot-assets/universe/info",
		canDisable:        true,
		noAuth:            true,
	}, {
		name:       "litrpc-sessions",
		macaroonFn: litMacaroonFn,
		requestFn:  litSessionRequestFn,
		// In some test cases we actually expect some sessions, so we
		// don't explicitly check for an empty array but just the
		// existence of the array in the response.
		successPattern:    "\"sessions\":[",
		allowedThroughLNC: false,
		grpcWebURI:        "/litrpc.Sessions/ListSessions",
		restWebURI:        "/v1/sessions",
	}, {
		name:              "litrpc-accounts",
		macaroonFn:        litMacaroonFn,
		requestFn:         litAccountRequestFn,
		successPattern:    "\"accounts\":[",
		disabledPattern:   "accounts has been disabled",
		allowedThroughLNC: false,
		grpcWebURI:        "/litrpc.Accounts/ListAccounts",
		restWebURI:        "/v1/accounts",
		canDisable:        true,
	}, {
		name:              "litrpc-autopilot",
		macaroonFn:        litMacaroonFn,
		requestFn:         litAutopilotRequestFn,
		successPattern:    "\"features\":{",
		allowedThroughLNC: true,
		grpcWebURI:        "/litrpc.Autopilot/ListAutopilotFeatures",
		restWebURI:        "/v1/autopilot/features",
	}, {
		name:              "litrpc-proxy",
		macaroonFn:        litMacaroonFn,
		requestFn:         proxyRequestFn,
		successPattern:    "\"version\":",
		allowedThroughLNC: false,
		grpcWebURI:        "/litrpc.Proxy/GetInfo",
		restWebURI:        "/v1/proxy/info",
		litOnly:           true,
	}, {
		name:              "litrpc-status",
		macaroonFn:        emptyMacaroonFn,
		requestFn:         statusRequestFn,
		successPattern:    "\"sub_servers\":",
		allowedThroughLNC: true,
		grpcWebURI:        "/litrpc.Status/SubServerStatus",
		restWebURI:        "/v1/status",
		noAuth:            true,
		litOnly:           true,
	}}

	// customURIs is a map of endpoint URIs that we want to allow via a
	// custom-macaroon session type.
	customURIs = map[string]bool{
		"/lnrpc.Lightning/GetInfo":            true,
		"/frdrpc.FaradayServer/RevenueReport": true,
	}
)

// testSuite defines the signature of a test suite. The first boolean parameter
// indicates if the UI password is set or disabled and the second one indicates
// if the LiT sub-servers are disabled.
type testSuite func(context.Context, *NetworkHarness, *testing.T, bool, bool,
	int)

// testDisablingSubServers will restart LiT with some sub-servers disabled and
// will then run the test suite against it.
func testDisablingSubServers(ctx context.Context, net *NetworkHarness,
	t *testing.T, test testSuite, node *HarnessNode) {

	// Restart the Lit node with some the sub-servers disabled.
	err := net.RestartNode(
		node, nil, []LitArgOption{
			WithLitArg("taproot-assets-mode", "disable"),
			WithLitArg("loop-mode", "disable"),
			WithLitArg("pool-mode", "disable"),
			WithLitArg("faraday-mode", "disable"),
			WithLitArg("accounts.disable", ""),
		},
	)
	require.NoError(t, err)

	if !node.Cfg.RemoteMode {
		// Reconnect Alice and Bob so that tests can continue to assert
		// that the nodes each have one peer at start up. This is only
		// required if the node is running in integrated mode since in
		// remote mode, the peers would never have disconnected.
		net.ConnectNodes(t, net.Alice, net.Bob)
	}

	t.Run("disable sub-servers", func(t *testing.T) {
		test(ctx, net, t, false, true, 3)
	})
}

// testWithAndWithoutUIPassword runs the given test suite against the given node
// both with the UI password set and without the UI password with the UI
// disabled.
func testWithAndWithoutUIPassword(ctx context.Context, net *NetworkHarness,
	t *testing.T, test testSuite, node *HarnessNode) {

	t.Run("with UI password", func(t *testing.T) {
		test(ctx, net, t, false, false, 1)
	})

	// Restart the node without the ui password and disable the UI.
	err := net.RestartNode(
		node, nil, []LitArgOption{
			WithoutLitArg("uipassword"),
			WithLitArg("disableui", ""),
		},
	)
	require.NoError(t, err)

	if !node.Cfg.RemoteMode {
		// Reconnect Alice and Bob so that tests can continue to assert
		// that the nodes each have one peer at start up. This is only
		// required if the node is running in integrated mode since in
		// remote mode, the peers would never have disconnected.
		net.ConnectNodes(t, net.Alice, net.Bob)
	}

	t.Run("without UI password", func(t *testing.T) {
		test(ctx, net, t, true, false, 2)
	})
}

// testModeIntegrated makes sure that in integrated mode all daemons work
// correctly. It tests the full integrated mode test suite with the ui password
// set and then again with no ui password and a disabled UI.
func testModeIntegrated(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	testWithAndWithoutUIPassword(
		ctx, net, t.t, integratedTestSuite, net.Alice,
	)

	testDisablingSubServers(
		ctx, net, t.t, integratedTestSuite, net.Alice,
	)
}

// integratedTestSuite makes sure that in integrated mode all daemons work
// correctly.
func integratedTestSuite(ctx context.Context, net *NetworkHarness, t *testing.T,
	withoutUIPassword, subServersDisabled bool, runNum int) {

	// Some very basic functionality tests to make sure lnd is working fine
	// in integrated mode.
	net.SendCoins(t, btcutil.SatoshiPerBitcoin, net.Alice)

	// We expect a non-empty alias (truncated node ID) to be returned.
	resp, err := net.Alice.GetInfo(ctx, &lnrpc.GetInfoRequest{})
	require.NoError(t, err)
	require.NotEmpty(t, resp.Alias)
	require.Contains(t, resp.Alias, "0")

	t.Run("certificate check", func(tt *testing.T) {
		runCertificateCheck(tt, net.Alice)
	})
	t.Run("gRPC macaroon auth check", func(tt *testing.T) {
		cfg := net.Alice.Cfg

		for _, endpoint := range endpoints {
			endpoint := endpoint
			endpointDisabled := subServersDisabled &&
				endpoint.canDisable

			tt.Run(endpoint.name+" lnd port", func(ttt *testing.T) {
				runGRPCAuthTest(
					ttt, cfg.RPCAddr(), cfg.TLSCertPath,
					endpoint.macaroonFn(cfg),
					endpoint.noAuth,
					endpoint.requestFn,
					endpoint.successPattern,
					endpointDisabled || endpoint.litOnly,
					"Unimplemented desc = unknown service",
				)
			})

			tt.Run(endpoint.name+" lit port", func(ttt *testing.T) {
				runGRPCAuthTest(
					ttt, cfg.LitAddr(), cfg.LitTLSCertPath,
					endpoint.macaroonFn(cfg),
					endpoint.noAuth,
					endpoint.requestFn,
					endpoint.successPattern,
					endpointDisabled,
					endpoint.disabledPattern,
				)
			})
		}
	})

	t.Run("UI password auth check", func(tt *testing.T) {
		cfg := net.Alice.Cfg

		for _, endpoint := range endpoints {
			endpoint := endpoint
			endpointDisabled := subServersDisabled &&
				endpoint.canDisable

			tt.Run(endpoint.name+" lnd port", func(ttt *testing.T) {
				runUIPasswordCheck(
					ttt, cfg.RPCAddr(), cfg.TLSCertPath,
					cfg.UIPassword, endpoint.requestFn,
					endpoint.noAuth,
					true, endpoint.successPattern,
					endpointDisabled || endpoint.litOnly,
					"Unimplemented desc = unknown service",
				)
			})

			tt.Run(endpoint.name+" lit port", func(ttt *testing.T) {
				shouldFailWithoutMacaroon := false
				if withoutUIPassword {
					shouldFailWithoutMacaroon = true
				}

				runUIPasswordCheck(
					ttt, cfg.LitAddr(), cfg.LitTLSCertPath,
					cfg.UIPassword, endpoint.requestFn,
					endpoint.noAuth,
					shouldFailWithoutMacaroon,
					endpoint.successPattern,
					endpointDisabled,
					endpoint.disabledPattern,
				)
			})
		}
	})

	t.Run("UI index page fallback", func(tt *testing.T) {
		runIndexPageCheck(
			tt, net.Alice.Cfg.LitAddr(), withoutUIPassword,
		)
	})

	t.Run("grpc-web auth", func(tt *testing.T) {
		cfg := net.Alice.Cfg

		for _, endpoint := range endpoints {
			endpoint := endpoint
			endpointDisabled := subServersDisabled &&
				endpoint.canDisable

			tt.Run(endpoint.name+" lit port", func(ttt *testing.T) {
				runGRPCWebAuthTest(
					ttt, cfg.LitAddr(), cfg.UIPassword,
					endpoint.grpcWebURI,
					withoutUIPassword, endpointDisabled,
					endpoint.disabledPattern,
					endpoint.noAuth,
				)
			})
		}
	})

	t.Run("gRPC super macaroon auth check", func(tt *testing.T) {
		cfg := net.Alice.Cfg

		superMacFile, err := bakeSuperMacaroon(cfg, true)
		require.NoError(tt, err)

		defer func() {
			_ = os.Remove(superMacFile)
		}()

		for _, endpoint := range endpoints {
			endpoint := endpoint
			endpointDisabled := subServersDisabled &&
				endpoint.canDisable

			tt.Run(endpoint.name+" lnd port", func(ttt *testing.T) {
				runGRPCAuthTest(
					ttt, cfg.RPCAddr(), cfg.TLSCertPath,
					superMacFile, endpoint.noAuth,
					endpoint.requestFn,
					endpoint.successPattern,
					endpointDisabled || endpoint.litOnly,
					"Unimplemented desc = unknown service",
				)
			})

			tt.Run(endpoint.name+" lit port", func(ttt *testing.T) {
				runGRPCAuthTest(
					ttt, cfg.LitAddr(), cfg.LitTLSCertPath,
					superMacFile, endpoint.noAuth,
					endpoint.requestFn,
					endpoint.successPattern,
					endpointDisabled,
					endpoint.disabledPattern,
				)
			})
		}
	})

	t.Run("REST auth", func(tt *testing.T) {
		cfg := net.Alice.Cfg

		for _, endpoint := range endpoints {
			endpoint := endpoint
			endpointDisabled := subServersDisabled &&
				endpoint.canDisable

			tt.Run(endpoint.name+" lit port", func(ttt *testing.T) {
				runRESTAuthTest(
					ttt, cfg.LitAddr(), cfg.UIPassword,
					endpoint.macaroonFn(cfg),
					endpoint.restWebURI,
					endpoint.successPattern,
					endpoint.restPOST,
					withoutUIPassword, endpointDisabled,
					endpoint.noAuth,
				)
			})
		}
	})

	t.Run("lnc auth", func(tt *testing.T) {
		cfg := net.Alice.Cfg

		ctx := context.Background()
		ctxt, cancel := context.WithTimeout(ctx, defaultTimeout)
		defer cancel()

		rawLNCConn := setUpLNCConn(
			ctxt, t, cfg.LitAddr(), cfg.LitTLSCertPath,
			cfg.LitMacPath,
			litrpc.SessionType_TYPE_MACAROON_READONLY, nil,
		)
		defer rawLNCConn.Close()

		for _, endpoint := range endpoints {
			endpoint := endpoint
			endpointDisabled := subServersDisabled &&
				endpoint.canDisable

			tt.Run(endpoint.name+" lit port", func(ttt *testing.T) {
				runLNCAuthTest(
					ttt, rawLNCConn, endpoint.requestFn,
					endpoint.successPattern,
					endpoint.allowedThroughLNC,
					"unknown service",
					endpointDisabled,
					endpoint.disabledPattern,
					endpoint.noAuth,
				)
			})
		}
	})

	t.Run("gRPC super macaroon account system test", func(tt *testing.T) {
		cfg := net.Alice.Cfg

		// If the accounts service is disabled, we skip this test as it
		// will fail due to the accounts service being disabled.
		if subServersDisabled {
			return
		}

		superMacFile, err := bakeSuperMacaroon(cfg, false)
		require.NoError(tt, err)

		defer func() {
			_ = os.Remove(superMacFile)
		}()

		ht := newHarnessTest(tt, net)
		runAccountSystemTest(
			ht, net.Alice, cfg.LitAddr(), cfg.LitTLSCertPath,
			superMacFile, (runNum*2)-1,
		)
		runAccountSystemTest(
			ht, net.Alice, cfg.LitAddr(), cfg.LitTLSCertPath,
			superMacFile, runNum*2,
		)
	})

	t.Run("lnc auth custom mac perms", func(tt *testing.T) {
		cfg := net.Alice.Cfg

		ctx := context.Background()
		ctxt, cancel := context.WithTimeout(ctx, defaultTimeout)
		defer cancel()

		customPerms := make(
			[]*litrpc.MacaroonPermission, 0, len(customURIs),
		)

		customURIKeyword := macaroons.PermissionEntityCustomURI
		for uri := range customURIs {
			customPerms = append(
				customPerms, &litrpc.MacaroonPermission{
					Entity: customURIKeyword,
					Action: uri,
				},
			)
		}

		rawLNCConn := setUpLNCConn(
			ctxt, t, cfg.LitAddr(), cfg.LitTLSCertPath,
			cfg.LitMacPath,
			litrpc.SessionType_TYPE_MACAROON_CUSTOM, customPerms,
		)
		defer rawLNCConn.Close()

		for _, endpoint := range endpoints {
			endpoint := endpoint
			endpointDisabled := subServersDisabled &&
				endpoint.canDisable

			expectedErr := "permission denied"
			if endpoint.noAuth {
				expectedErr = "unknown service"
			}

			tt.Run(endpoint.name+" lit port", func(ttt *testing.T) {
				allowed := customURIs[endpoint.grpcWebURI]

				runLNCAuthTest(
					ttt, rawLNCConn, endpoint.requestFn,
					endpoint.successPattern,
					allowed, expectedErr,
					endpointDisabled,
					endpoint.disabledPattern,
					endpoint.noAuth,
				)
			})
		}
	})
}

// setUpLNCConn creates a new LNC session and then creates a connection to that
// session via the mailbox that the session was created with.
func setUpLNCConn(ctx context.Context, t *testing.T, hostPort, tlsCertPath,
	macPath string, sessType litrpc.SessionType,
	customMacPerms []*litrpc.MacaroonPermission) *grpc.ClientConn {

	rawConn, err := connectRPC(ctx, hostPort, tlsCertPath)
	require.NoError(t, err)
	defer rawConn.Close()

	macBytes, err := ioutil.ReadFile(macPath)
	require.NoError(t, err)
	ctxm := macaroonContext(ctx, macBytes)

	// We first need to create an LNC session that we can use to connect.
	litClient := litrpc.NewSessionsClient(rawConn)
	sessResp, err := litClient.AddSession(ctxm, &litrpc.AddSessionRequest{
		Label:       "integration-test",
		SessionType: sessType,
		ExpiryTimestampSeconds: uint64(
			time.Now().Add(5 * time.Minute).Unix(),
		),
		MailboxServerAddr:         mailboxServerAddr,
		MacaroonCustomPermissions: customMacPerms,
	})
	require.NoError(t, err)

	// Try the LNC connection now.
	connectPhrase := strings.Split(
		sessResp.Session.PairingSecretMnemonic, " ",
	)

	rawLNCConn, err := connectMailboxWithPairingPhrase(ctx, connectPhrase)
	require.NoError(t, err)

	return rawLNCConn
}

// runCertificateCheck checks that the TLS certificates presented to clients are
// what we expect them to be.
func runCertificateCheck(t *testing.T, node *HarnessNode) {
	litCerts, err := getServerCertificates(node.Cfg.LitAddr())
	require.NoError(t, err)
	require.Len(t, litCerts, 1)
	require.Equal(
		t, "litd autogenerated cert", litCerts[0].Issuer.Organization[0],
	)

	lndCerts, err := getServerCertificates(node.Cfg.RPCAddr())
	require.NoError(t, err)
	require.Len(t, lndCerts, 1)
	require.Equal(
		t, "lnd autogenerated cert", lndCerts[0].Issuer.Organization[0],
	)
}

// runGRPCAuthTest tests authentication of the given gRPC interface.
func runGRPCAuthTest(t *testing.T, hostPort, tlsCertPath, macPath string,
	noMac bool, makeRequest requestFn, successContent string, disabled bool,
	disabledErr string) {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	rawConn, err := connectRPC(ctxt, hostPort, tlsCertPath)
	require.NoError(t, err)
	defer rawConn.Close()

	resp, err := makeRequest(ctxt, rawConn)

	switch {
	case disabled:
		require.ErrorContains(t, err, disabledErr)
		return

	case noMac:
		require.NoError(t, err)

		json, err := marshalOptions.Marshal(resp)
		require.NoError(t, err)
		require.Contains(t, string(json), successContent)

		return

	// We have a connection without any macaroon. A call should fail.
	default:
		require.ErrorContains(t, err, "expected 1 macaroon, got 0")
	}

	// Add dummy data as the macaroon, that should fail as well.
	ctxm := macaroonContext(ctxt, []byte("dummy"))
	_, err = makeRequest(ctxm, rawConn)
	require.ErrorContains(t, err, "packet too short")

	// Add a macaroon that can be parsed but that's not issued by lnd, which
	// should also fail.
	ctxm = macaroonContext(ctxt, dummyMacBytes)
	_, err = makeRequest(ctxm, rawConn)
	require.ErrorContains(t, err, "invalid ID")

	// Then finally we try with the correct macaroon which should now
	// succeed, as long as it is not for a disabled sub-server.
	macBytes, err := os.ReadFile(macPath)
	require.NoError(t, err)
	ctxm = macaroonContext(ctxt, macBytes)
	resp, err = makeRequest(ctxm, rawConn)
	if disabled {
		require.ErrorContains(t, err, disabledErr)
		return
	}
	require.NoError(t, err)

	json, err := marshalOptions.Marshal(resp)
	require.NoError(t, err)
	require.Contains(t, string(json), successContent)
}

// runUIPasswordCheck tests UI password authentication.
func runUIPasswordCheck(t *testing.T, hostPort, tlsCertPath, uiPassword string,
	makeRequest requestFn, noAuth, shouldFailWithoutMacaroon bool,
	successContent string, disabled bool, disabledErr string) {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	rawConn, err := connectRPC(ctxt, hostPort, tlsCertPath)
	require.NoError(t, err)
	defer rawConn.Close()

	// Make sure that a call without any metadata results in an error unless
	// this is a call that is allowed to be un-authenticated in which case
	// we expect it to succeed.
	resp, err := makeRequest(ctxt, rawConn)
	switch {
	case disabled:
		require.ErrorContains(t, err, disabledErr)
	case noAuth:
		require.NoError(t, err)
		json, err := marshalOptions.Marshal(resp)
		require.NoError(t, err)
		require.Contains(t, string(json), successContent)

		return
	default:
		require.ErrorContains(t, err, "expected 1 macaroon, got 0")
	}

	// We can do the same calls by providing a UI password. Make sure that
	// sending an incorrect one is ignored.
	ctxm := uiPasswordContext(ctxt, "foobar", false)
	_, err = makeRequest(ctxm, rawConn)
	if disabled {
		require.ErrorContains(t, err, disabledErr)
	} else {
		require.ErrorContains(t, err, "expected 1 macaroon, got 0")
	}

	// Sending a dummy macaroon along with the incorrect UI password also
	// shouldn't be allowed and result in an error.
	ctxm = uiPasswordContext(ctxt, "foobar", true)
	_, err = makeRequest(ctxm, rawConn)
	if disabled {
		require.ErrorContains(t, err, disabledErr)
	} else {
		require.ErrorContains(t, err, "invalid ID")
	}

	// Using the correct UI password should work for all requests unless the
	// request is for a disabled sub-server.
	ctxm = uiPasswordContext(ctxt, uiPassword, false)
	resp, err = makeRequest(ctxm, rawConn)

	// On lnd's gRPC interface we don't support using the UI password.
	if shouldFailWithoutMacaroon {
		if disabled {
			require.ErrorContains(t, err, disabledErr)
		} else {
			require.ErrorContains(t, err, "expected 1 macaroon, "+
				"got 0")
		}

		// Sending a dummy macaroon will allow us to not get an error in
		// case of the litrpc calls, where we don't support macaroons
		// but have the extraction call in the validator anyway. So we
		// provide a dummy macaroon but still the UI password must be
		// correct to pass.
		ctxm = uiPasswordContext(ctxt, uiPassword, true)
		_, err = makeRequest(ctxm, rawConn)

		if disabled {
			require.ErrorContains(t, err, disabledErr)
		} else {
			require.ErrorContains(t, err, "invalid ID")
		}

		return
	}

	if disabled {
		require.ErrorContains(t, err, disabledErr)
		return
	}

	// We expect the call to succeed unless it is for a disabled sub-server.
	require.NoError(t, err)

	json, err := marshalOptions.Marshal(resp)
	require.NoError(t, err)
	require.Contains(t, string(json), successContent)
}

// runIndexPageCheck makes sure the index page is returned correctly.
func runIndexPageCheck(t *testing.T, hostPort string, uiDisabled bool) {
	expect := indexHtmlMarker
	if uiDisabled {
		expect = ""
	}

	body, err := getURL(fmt.Sprintf("https://%s/index.html", hostPort))
	require.NoError(t, err)
	require.Contains(t, body, expect)

	// The UI implements "virtual" pages by using the browser history API.
	// Any URL that looks like a directory should fall back to the main
	// index.html file as well.
	body, err = getURL(fmt.Sprintf("https://%s/loop", hostPort))
	require.NoError(t, err)
	require.Contains(t, body, expect)
}

// runGRPCWebAuthTest tests authentication of the given gRPC interface.
func runGRPCWebAuthTest(t *testing.T, hostPort, uiPassword, grpcWebURI string,
	shouldFailWithUIPassword, disabled bool, disableErr string,
	noAuth bool) {

	basicAuth := base64.StdEncoding.EncodeToString(
		[]byte(fmt.Sprintf("%s:%s", uiPassword, uiPassword)),
	)

	header := http.Header{
		"content-type": []string{"application/grpc-web+proto"},
		"x-grpc-web":   []string{"1"},
	}

	url := fmt.Sprintf("https://%s%s", hostPort, grpcWebURI)

	// First test a grpc-web call without authorization, which should fail
	// unless this call does not require authentication.
	body, responseHeader, err := postURL(url, emptyGrpcWebRequest, header)
	require.NoError(t, err)

	switch {
	case disabled:
		require.Contains(
			t, responseHeader.Get("grpc-message"), disableErr,
		)

		if noAuth {
			return
		}

	case noAuth:
		require.Empty(t, responseHeader.Get("grpc-message"))
		require.Empty(t, responseHeader.Get("grpc-status"))

		// We get the status encoded as trailer in the response.
		require.Contains(t, body, "grpc-status: 0")

		return
	default:
		require.Equal(
			t, "expected 1 macaroon, got 0",
			responseHeader.Get("grpc-message"),
		)
	}

	require.Equal(
		t, fmt.Sprintf("%d", codes.Unknown),
		responseHeader.Get("grpc-status"),
	)

	// Now add the basic auth and try again.
	header["authorization"] = []string{fmt.Sprintf("Basic %s", basicAuth)}
	body, responseHeader, err = postURL(url, emptyGrpcWebRequest, header)
	require.NoError(t, err)

	if shouldFailWithUIPassword {
		require.Equal(
			t, "expected 1 macaroon, got 0",
			responseHeader.Get("grpc-message"),
		)
		require.Equal(
			t, fmt.Sprintf("%d", codes.Unknown),
			responseHeader.Get("grpc-status"),
		)
		return
	}

	if disabled {
		require.Contains(
			t, responseHeader.Get("grpc-message"), disableErr,
		)
		require.Equal(
			t, fmt.Sprintf("%d", codes.Unknown),
			responseHeader.Get("grpc-status"),
		)
	} else {
		require.Empty(t, responseHeader.Get("grpc-message"))
		require.Empty(t, responseHeader.Get("grpc-status"))

		// We get the status encoded as trailer in the response.
		require.Contains(t, body, "grpc-status: 0")
	}
}

// runRESTAuthTest tests authentication of the given REST interface.
func runRESTAuthTest(t *testing.T, hostPort, uiPassword, macaroonPath, restURI,
	successPattern string, usePOST, shouldFailWithUIPassword,
	disabled, noMac bool) {

	basicAuth := base64.StdEncoding.EncodeToString(
		[]byte(fmt.Sprintf("%s:%s", uiPassword, uiPassword)),
	)
	basicAuthHeader := http.Header{
		"authorization": []string{fmt.Sprintf("Basic %s", basicAuth)},
	}
	url := fmt.Sprintf("https://%s%s", hostPort, restURI)

	method := "GET"
	if usePOST {
		method = "POST"
	}

	// First test a REST call without authorization, which should fail
	// unless this is a call for an endpoint that does not require
	// authorization.
	body, responseHeader, err := callURL(url, method, nil, nil, false)
	require.NoError(t, err)

	require.Equal(
		t, "application/json",
		responseHeader.Get("content-type"),
	)

	switch {
	case disabled:
		require.Empty(
			t, responseHeader.Get("grpc-metadata-content-type"),
		)
		require.Contains(t, body, "Not Found")

		if noMac {
			return
		}

	case noMac:
		require.Contains(t, body, successPattern)
		return

	default:
		require.Equalf(
			t, "application/grpc",
			responseHeader.Get("grpc-metadata-content-type"),
			"response headers: %v, body: %v", responseHeader, body,
		)
		require.Contains(t, body, "expected 1 macaroon, got 0")
	}

	// Now add the UI password which should make the request succeed.
	body, responseHeader, err = callURL(
		url, method, nil, basicAuthHeader, false,
	)
	require.NoError(t, err)

	switch {
	case shouldFailWithUIPassword:
		require.Contains(t, body, "expected 1 macaroon, got 0")

	case disabled:
		require.Contains(t, body, "Not Found")

	default:
		require.Contains(t, body, successPattern)
	}

	// And finally, try with the given macaroon.
	macBytes, err := os.ReadFile(macaroonPath)
	require.NoError(t, err)

	macaroonHeader := http.Header{
		"grpc-metadata-macaroon": []string{
			hex.EncodeToString(macBytes),
		},
	}
	body, responseHeader, err = callURL(
		url, method, nil, macaroonHeader, false,
	)
	require.NoError(t, err)

	if disabled {
		require.Contains(t, body, "Not Found")
	} else {
		require.Contains(t, body, successPattern)
	}
}

// runLNCAuthTest tests authentication of the given interface when connecting
// through Lightning Node Connect.
func runLNCAuthTest(t *testing.T, rawLNCConn grpc.ClientConnInterface,
	makeRequest requestFn, successContent string, callAllowed bool,
	expectErrContains string, disabled bool, disabledPattern string,
	noMac bool) {

	ctxt, cancel := context.WithTimeout(
		context.Background(), defaultTimeout,
	)
	defer cancel()

	// We should be able to make a request via LNC to the given RPC
	// endpoint, unless it is explicitly disallowed (we currently don't want
	// to support creating more sessions through LNC until we have all
	// macaroon permissions properly set up).
	resp, err := makeRequest(ctxt, rawLNCConn)

	switch {
	// The call should be allowed, so we expect no error unless this is
	// for a disabled sub-server.
	case disabled:
		require.ErrorContains(t, err, disabledPattern)
		return

	case noMac:
		require.NoError(t, err)

		json, err := marshalOptions.Marshal(resp)
		require.NoError(t, err)
		require.Contains(t, string(json), successContent)

		return

	// Is this a disallowed call?
	case !callAllowed:
		require.ErrorContains(t, err, expectErrContains)

		return

	default:
		require.NoError(t, err)
	}

	json, err := marshalOptions.Marshal(resp)
	require.NoError(t, err)
	require.Contains(t, string(json), successContent)
}

// getURL retrieves the body of a given URL, ignoring any TLS certificate the
// server might present.
func getURL(url string) (string, error) {
	resp, err := client.Get(url)
	if err != nil {
		return "", err
	}

	defer func() {
		_ = resp.Body.Close()
	}()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	return string(body), nil
}

// postURL retrieves the body of a given URL, ignoring any TLS certificate the
// server might present.
func postURL(url string, postBody []byte, header http.Header) (string,
	http.Header, error) {

	return callURL(url, "POST", postBody, header, true)
}

// callURL does a HTTP call to the given URL, ignoring any TLS certificate the
// server might present.
func callURL(url, method string, postBody []byte, header http.Header,
	expectOk bool) (string, http.Header, error) {

	req, err := http.NewRequest(method, url, bytes.NewReader(postBody))
	if err != nil {
		return "", nil, err
	}
	for key, values := range header {
		for _, value := range values {
			req.Header.Add(key, value)
		}
	}
	resp, err := client.Do(req)
	if err != nil {
		return "", nil, err
	}

	if expectOk && resp.StatusCode != 200 {
		return "", nil, fmt.Errorf("request failed, got status code "+
			"%d (%s)", resp.StatusCode, resp.Status)
	}

	defer func() {
		_ = resp.Body.Close()
	}()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", nil, err
	}

	return string(body), resp.Header, nil
}

// getServerCertificates returns the TLS certificates that a server presents to
// clients.
func getServerCertificates(hostPort string) ([]*x509.Certificate, error) {
	// We don't care about the validity of the certificate, we just want to
	// download it.
	conn, err := tls.Dial("tcp", hostPort, transport.TLSClientConfig)
	if err != nil {
		return nil, fmt.Errorf("error dialing %s: %v", hostPort, err)
	}
	defer func() {
		_ = conn.Close()
	}()

	return conn.ConnectionState().PeerCertificates, nil
}

// connectMailboxWithPairingPhrase tries to establish a connection through LNC
// using the given connect phrase and the test mailbox server.
func connectMailboxWithPairingPhrase(ctx context.Context,
	connectPhrase []string) (*grpc.ClientConn, error) {

	var mnemonicWords [mailbox.NumPassphraseWords]string
	copy(mnemonicWords[:], connectPhrase)
	passphrase := mailbox.PassphraseMnemonicToEntropy(mnemonicWords)

	privKey, err := btcec.NewPrivateKey()
	if err != nil {
		return nil, err
	}
	ecdh := &keychain.PrivKeyECDH{PrivKey: privKey}

	connData := mailbox.NewConnData(ecdh, nil, passphrase[:], nil, nil, nil)
	noiseConn := mailbox.NewNoiseGrpcConn(connData)

	transportConn, err := mailbox.NewGrpcClient(
		ctx, mailboxServerAddr, connData,
		grpc.WithTransportCredentials(credentials.NewTLS(&tls.Config{})),
	)
	if err != nil {
		return nil, err
	}

	dialOpts := []grpc.DialOption{
		grpc.WithContextDialer(transportConn.Dial),
		grpc.WithTransportCredentials(noiseConn),
		grpc.WithPerRPCCredentials(noiseConn),
		grpc.WithBlock(),
	}

	return grpc.DialContext(ctx, mailboxServerAddr, dialOpts...)
}

func macaroonContext(ctx context.Context, macBytes []byte) context.Context {
	md := metadata.MD{}
	if len(macBytes) > 0 {
		md["macaroon"] = []string{hex.EncodeToString(macBytes)}
	}
	return metadata.NewOutgoingContext(ctx, md)
}

func uiPasswordContext(ctx context.Context, password string,
	withDummyMac bool) context.Context {

	basicAuth := base64.StdEncoding.EncodeToString(
		[]byte(fmt.Sprintf("%s:%s", password, password)),
	)

	md := metadata.MD{}
	md["authorization"] = []string{fmt.Sprintf("Basic %s", basicAuth)}

	if withDummyMac {
		md["macaroon"] = []string{hex.EncodeToString(dummyMacBytes)}
	}

	return metadata.NewOutgoingContext(ctx, md)
}

func makeMac() *macaroon.Macaroon {
	dummyMac, err := macaroon.New(
		[]byte("aabbccddeeff00112233445566778899"), []byte("AA=="),
		"LSAT", macaroon.LatestVersion,
	)
	if err != nil {
		panic(fmt.Errorf("unable to create macaroon: %v", err))
	}
	return dummyMac
}

func serializeMac(mac *macaroon.Macaroon) []byte {
	macBytes, err := mac.MarshalBinary()
	if err != nil {
		panic(fmt.Errorf("unable to serialize macaroon: %v", err))
	}
	return macBytes
}

func connectRPC(ctx context.Context, hostPort,
	tlsCertPath string) (*grpc.ClientConn, error) {

	tlsCreds, err := credentials.NewClientTLSFromFile(tlsCertPath, "")
	if err != nil {
		return nil, err
	}

	opts := []grpc.DialOption{
		grpc.WithBlock(),
		grpc.WithTransportCredentials(tlsCreds),
	}

	return grpc.DialContext(ctx, hostPort, opts...)
}

func bakeSuperMacaroon(cfg *LitNodeConfig, readOnly bool) (string, error) {
	lndAdminMac := lndMacaroonFn(cfg)

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	rawConn, err := connectRPC(ctxt, cfg.RPCAddr(), cfg.TLSCertPath)
	if err != nil {
		return "", err
	}
	defer rawConn.Close()

	lndAdminMacBytes, err := ioutil.ReadFile(lndAdminMac)
	if err != nil {
		return "", err
	}
	lndAdminCtx := macaroonContext(ctxt, lndAdminMacBytes)
	lndConn := lnrpc.NewLightningClient(rawConn)

	permsMgr, err := perms.NewManager(false)
	if err != nil {
		return "", err
	}

	permsMgr.RegisterSubServer(
		subservers.LOOP, loop.RequiredPermissions, nil,
	)
	permsMgr.RegisterSubServer(
		subservers.POOL, pool.RequiredPermissions, nil,
	)
	permsMgr.RegisterSubServer(
		subservers.TAP, tap.RequiredPermissions, nil,
	)
	permsMgr.RegisterSubServer(
		subservers.FARADAY, faraday.RequiredPermissions, nil,
	)
	permsMgr.RegisterSubServer(
		subservers.TAP, tap.RequiredPermissions, nil,
	)

	superMacPermissions := permsMgr.ActivePermissions(readOnly)
	nullID := [4]byte{}
	superMacHex, err := terminal.BakeSuperMacaroon(
		lndAdminCtx, lndConn, session.NewSuperMacaroonRootKeyID(nullID),
		superMacPermissions, nil,
	)
	if err != nil {
		return "", err
	}

	// The BakeSuperMacaroon function just hex encoded the macaroon, we know
	// it's valid.
	superMacBytes, _ := hex.DecodeString(superMacHex)

	tempFile, err := os.CreateTemp("", "lit-super-macaroon")
	if err != nil {
		_ = os.Remove(tempFile.Name())
		return "", err
	}

	err = os.WriteFile(tempFile.Name(), superMacBytes, 0644)
	if err != nil {
		_ = os.Remove(tempFile.Name())
		return "", err
	}

	return tempFile.Name(), nil
}
