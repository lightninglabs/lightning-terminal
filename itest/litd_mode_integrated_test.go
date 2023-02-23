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
	"github.com/lightninglabs/lightning-node-connect/mailbox"
	terminal "github.com/lightninglabs/lightning-terminal"
	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/lightninglabs/lightning-terminal/perms"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightninglabs/loop/looprpc"
	"github.com/lightninglabs/pool/poolrpc"
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
	litMacaroonFn = func(cfg *LitNodeConfig) string {
		return cfg.LitMacPath
	}

	endpoints = []struct {
		name              string
		macaroonFn        macaroonFn
		requestFn         requestFn
		successPattern    string
		allowedThroughLNC bool
		grpcWebURI        string
		restWebURI        string
		restPOST          bool
	}{{
		name:              "lnrpc",
		macaroonFn:        lndMacaroonFn,
		requestFn:         lnrpcRequestFn,
		successPattern:    "\"identity_pubkey\":\"0",
		allowedThroughLNC: true,
		grpcWebURI:        "/lnrpc.Lightning/GetInfo",
		restWebURI:        "/v1/getinfo",
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
		allowedThroughLNC: true,
		grpcWebURI:        "/frdrpc.FaradayServer/RevenueReport",
		restWebURI:        "/v1/faraday/revenue",
	}, {
		name:              "looprpc",
		macaroonFn:        loopMacaroonFn,
		requestFn:         loopRequestFn,
		successPattern:    "\"swaps\":[]",
		allowedThroughLNC: true,
		grpcWebURI:        "/looprpc.SwapClient/ListSwaps",
		restWebURI:        "/v1/loop/swaps",
	}, {
		name:              "poolrpc",
		macaroonFn:        poolMacaroonFn,
		requestFn:         poolRequestFn,
		successPattern:    "\"accounts_active\":0",
		allowedThroughLNC: true,
		grpcWebURI:        "/poolrpc.Trader/GetInfo",
		restWebURI:        "/v1/pool/info",
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
	}, {
		name:              "litrpc-accounts",
		macaroonFn:        litMacaroonFn,
		requestFn:         litAccountRequestFn,
		successPattern:    "\"accounts\":[]",
		allowedThroughLNC: false,
		grpcWebURI:        "/litrpc.Accounts/ListAccounts",
	}, {
		name:              "litrpc-autopilot",
		macaroonFn:        litMacaroonFn,
		requestFn:         litAutopilotRequestFn,
		successPattern:    "\"features\":{",
		allowedThroughLNC: true,
		grpcWebURI:        "/litrpc.Autopilot/ListAutopilotFeatures",
	}}

	// customURIs is a map of endpoint URIs that we want to allow via a
	// custom-macaroon session type.
	customURIs = map[string]bool{
		"/lnrpc.Lightning/GetInfo":            true,
		"/frdrpc.FaradayServer/RevenueReport": true,
	}
)

// testModeIntegrated makes sure that in integrated mode all daemons work
// correctly.
func testModeIntegrated(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	// Some very basic functionality tests to make sure lnd is working fine
	// in integrated mode.
	net.SendCoins(t.t, btcutil.SatoshiPerBitcoin, net.Alice)

	// We expect a non-empty alias (truncated node ID) to be returned.
	resp, err := net.Alice.GetInfo(ctx, &lnrpc.GetInfoRequest{})
	require.NoError(t.t, err)
	require.NotEmpty(t.t, resp.Alias)
	require.Contains(t.t, resp.Alias, "0")

	t.t.Run("certificate check", func(tt *testing.T) {
		runCertificateCheck(tt, net.Alice)
	})
	t.t.Run("gRPC macaroon auth check", func(tt *testing.T) {
		cfg := net.Alice.Cfg

		for _, endpoint := range endpoints {
			endpoint := endpoint
			tt.Run(endpoint.name+" lnd port", func(ttt *testing.T) {
				runGRPCAuthTest(
					ttt, cfg.RPCAddr(), cfg.TLSCertPath,
					endpoint.macaroonFn(cfg),
					endpoint.requestFn,
					endpoint.successPattern,
				)
			})

			tt.Run(endpoint.name+" lit port", func(ttt *testing.T) {
				runGRPCAuthTest(
					ttt, cfg.LitAddr(), cfg.LitTLSCertPath,
					endpoint.macaroonFn(cfg),
					endpoint.requestFn,
					endpoint.successPattern,
				)
			})
		}
	})

	t.t.Run("UI password auth check", func(tt *testing.T) {
		cfg := net.Alice.Cfg

		for _, endpoint := range endpoints {
			endpoint := endpoint
			tt.Run(endpoint.name+" lnd port", func(ttt *testing.T) {
				runUIPasswordCheck(
					ttt, cfg.RPCAddr(), cfg.TLSCertPath,
					cfg.UIPassword, endpoint.requestFn,
					true, endpoint.successPattern,
				)
			})

			tt.Run(endpoint.name+" lit port", func(ttt *testing.T) {
				runUIPasswordCheck(
					ttt, cfg.LitAddr(), cfg.LitTLSCertPath,
					cfg.UIPassword, endpoint.requestFn,
					false, endpoint.successPattern,
				)
			})
		}
	})

	t.t.Run("UI index page fallback", func(tt *testing.T) {
		runIndexPageCheck(tt, net.Alice.Cfg.LitAddr())
	})

	t.t.Run("grpc-web auth", func(tt *testing.T) {
		cfg := net.Alice.Cfg

		for _, endpoint := range endpoints {
			endpoint := endpoint
			tt.Run(endpoint.name+" lit port", func(ttt *testing.T) {
				runGRPCWebAuthTest(
					ttt, cfg.LitAddr(), cfg.UIPassword,
					endpoint.grpcWebURI,
				)
			})
		}
	})

	t.t.Run("gRPC super macaroon auth check", func(tt *testing.T) {
		cfg := net.Alice.Cfg

		superMacFile, err := bakeSuperMacaroon(cfg, true)
		require.NoError(tt, err)

		defer func() {
			_ = os.Remove(superMacFile)
		}()

		for _, endpoint := range endpoints {
			endpoint := endpoint
			tt.Run(endpoint.name+" lnd port", func(ttt *testing.T) {
				runGRPCAuthTest(
					ttt, cfg.RPCAddr(), cfg.TLSCertPath,
					superMacFile,
					endpoint.requestFn,
					endpoint.successPattern,
				)
			})

			tt.Run(endpoint.name+" lit port", func(ttt *testing.T) {
				runGRPCAuthTest(
					ttt, cfg.LitAddr(), cfg.LitTLSCertPath,
					superMacFile,
					endpoint.requestFn,
					endpoint.successPattern,
				)
			})
		}
	})

	t.t.Run("REST auth", func(tt *testing.T) {
		cfg := net.Alice.Cfg

		for _, endpoint := range endpoints {
			endpoint := endpoint

			if endpoint.restWebURI == "" {
				continue
			}

			tt.Run(endpoint.name+" lit port", func(ttt *testing.T) {
				runRESTAuthTest(
					ttt, cfg.LitAddr(), cfg.UIPassword,
					endpoint.macaroonFn(cfg),
					endpoint.restWebURI,
					endpoint.successPattern,
					endpoint.restPOST,
				)
			})
		}
	})

	t.t.Run("lnc auth", func(tt *testing.T) {
		cfg := net.Alice.Cfg

		ctx := context.Background()
		ctxt, cancel := context.WithTimeout(ctx, defaultTimeout)
		defer cancel()

		rawLNCConn := setUpLNCConn(
			ctxt, t.t, cfg.LitAddr(), cfg.LitTLSCertPath,
			cfg.LitMacPath,
			litrpc.SessionType_TYPE_MACAROON_READONLY, nil,
		)
		defer rawLNCConn.Close()

		for _, endpoint := range endpoints {
			endpoint := endpoint
			tt.Run(endpoint.name+" lit port", func(ttt *testing.T) {
				runLNCAuthTest(
					ttt, rawLNCConn, endpoint.requestFn,
					endpoint.successPattern,
					endpoint.allowedThroughLNC,
					"unknown service",
				)
			})
		}
	})

	t.t.Run("gRPC super macaroon account system test", func(tt *testing.T) {
		cfg := net.Alice.Cfg

		superMacFile, err := bakeSuperMacaroon(cfg, false)
		require.NoError(tt, err)

		defer func() {
			_ = os.Remove(superMacFile)
		}()

		ht := newHarnessTest(tt, net)
		runAccountSystemTest(
			ht, net.Alice, cfg.LitAddr(), cfg.LitTLSCertPath,
			superMacFile, 1,
		)
		runAccountSystemTest(
			ht, net.Alice, cfg.LitAddr(), cfg.LitTLSCertPath,
			superMacFile, 2,
		)
	})

	t.t.Run("lnc auth custom mac perms", func(tt *testing.T) {
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
			ctxt, t.t, cfg.LitAddr(), cfg.LitTLSCertPath,
			cfg.LitMacPath,
			litrpc.SessionType_TYPE_MACAROON_CUSTOM, customPerms,
		)
		defer rawLNCConn.Close()

		for _, endpoint := range endpoints {
			endpoint := endpoint
			tt.Run(endpoint.name+" lit port", func(ttt *testing.T) {
				allowed := customURIs[endpoint.grpcWebURI]
				runLNCAuthTest(
					ttt, rawLNCConn, endpoint.requestFn,
					endpoint.successPattern,
					allowed, "permission denied",
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
	makeRequest requestFn, successContent string) {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	rawConn, err := connectRPC(ctxt, hostPort, tlsCertPath)
	require.NoError(t, err)
	defer rawConn.Close()

	// We have a connection without any macaroon. A call should fail.
	_, err = makeRequest(ctxt, rawConn)
	require.Error(t, err)
	require.Contains(t, err.Error(), "expected 1 macaroon, got 0")

	// Add dummy data as the macaroon, that should fail as well.
	ctxm := macaroonContext(ctxt, []byte("dummy"))
	_, err = makeRequest(ctxm, rawConn)
	require.Error(t, err)
	require.Contains(t, err.Error(), "packet too short")

	// Add a macaroon that can be parsed but that's not issued by lnd, which
	// should also fail.
	ctxm = macaroonContext(ctxt, dummyMacBytes)
	_, err = makeRequest(ctxm, rawConn)
	require.Error(t, err)
	require.Contains(t, err.Error(), "cannot get macaroon: root key with")

	// Then finally we try with the correct macaroon which should now
	// succeed.
	macBytes, err := ioutil.ReadFile(macPath)
	require.NoError(t, err)
	ctxm = macaroonContext(ctxt, macBytes)
	resp, err := makeRequest(ctxm, rawConn)
	require.NoError(t, err)

	json, err := marshalOptions.Marshal(resp)
	require.NoError(t, err)
	require.Contains(t, string(json), successContent)
}

// runUIPasswordCheck tests UI password authentication.
func runUIPasswordCheck(t *testing.T, hostPort, tlsCertPath, uiPassword string,
	makeRequest requestFn, shouldFailWithoutMacaroon bool,
	successContent string) {

	ctxb := context.Background()
	ctxt, cancel := context.WithTimeout(ctxb, defaultTimeout)
	defer cancel()

	rawConn, err := connectRPC(ctxt, hostPort, tlsCertPath)
	require.NoError(t, err)
	defer rawConn.Close()

	// Make sure that a call without any metadata results in an error.
	_, err = makeRequest(ctxt, rawConn)
	require.Error(t, err)
	require.Contains(t, err.Error(), "expected 1 macaroon, got 0")

	// We can do the same calls by providing a UI password. Make sure that
	// sending an incorrect one is ignored.
	ctxm := uiPasswordContext(ctxt, "foobar", false)
	_, err = makeRequest(ctxm, rawConn)
	require.Error(t, err)
	require.Contains(t, err.Error(), "expected 1 macaroon, got 0")

	// Sending a dummy macaroon along with the incorrect UI password also
	// shouldn't be allowed and result in an error.
	ctxm = uiPasswordContext(ctxt, "foobar", true)
	_, err = makeRequest(ctxm, rawConn)
	require.Error(t, err)
	errStr := err.Error()
	err1 := strings.Contains(errStr, "invalid auth: invalid basic auth")
	err2 := strings.Contains(errStr, "cannot get macaroon: root key with")
	require.True(t, err1 || err2, "wrong UI password and dummy mac")

	// Using the correct UI password should work for all requests.
	ctxm = uiPasswordContext(ctxt, uiPassword, false)
	resp, err := makeRequest(ctxm, rawConn)

	// On lnd's gRPC interface we don't support using the UI password.
	if shouldFailWithoutMacaroon {
		require.Error(t, err)
		require.Contains(t, err.Error(), "expected 1 macaroon, got 0")

		// Sending a dummy macaroon will allow us to not get an error in
		// case of the litrpc calls, where we don't support macaroons
		// but have the extraction call in the validator anyway. So we
		// provide a dummy macaroon but still the UI password must be
		// correct to pass.
		ctxm = uiPasswordContext(ctxt, uiPassword, true)
		_, err = makeRequest(ctxm, rawConn)

		require.Error(t, err)
		require.Contains(
			t, err.Error(), "cannot get macaroon: root",
		)
		return
	}

	// We expect the call to succeed.
	require.NoError(t, err)

	json, err := marshalOptions.Marshal(resp)
	require.NoError(t, err)
	require.Contains(t, string(json), successContent)
}

// runIndexPageCheck makes sure the index page is returned correctly.
func runIndexPageCheck(t *testing.T, hostPort string) {
	body, err := getURL(fmt.Sprintf("https://%s/index.html", hostPort))
	require.NoError(t, err)
	require.Contains(t, body, indexHtmlMarker)

	// The UI implements "virtual" pages by using the browser history API.
	// Any URL that looks like a directory should fall back to the main
	// index.html file as well.
	body, err = getURL(fmt.Sprintf("https://%s/loop", hostPort))
	require.NoError(t, err)
	require.Contains(t, body, indexHtmlMarker)
}

// runGRPCWebAuthTest tests authentication of the given gRPC interface.
func runGRPCWebAuthTest(t *testing.T, hostPort, uiPassword, grpcWebURI string) {
	basicAuth := base64.StdEncoding.EncodeToString(
		[]byte(fmt.Sprintf("%s:%s", uiPassword, uiPassword)),
	)

	header := http.Header{
		"content-type": []string{"application/grpc-web+proto"},
		"x-grpc-web":   []string{"1"},
	}

	url := fmt.Sprintf("https://%s%s", hostPort, grpcWebURI)

	// First test a grpc-web call without authorization, which should fail.
	_, responseHeader, err := postURL(url, emptyGrpcWebRequest, header)
	require.NoError(t, err)

	require.Equal(
		t, "expected 1 macaroon, got 0",
		responseHeader.Get("grpc-message"),
	)
	require.Equal(
		t, fmt.Sprintf("%d", codes.Unknown),
		responseHeader.Get("grpc-status"),
	)

	// Now add the basic auth and try again.
	header["authorization"] = []string{fmt.Sprintf("Basic %s", basicAuth)}
	body, responseHeader, err := postURL(url, emptyGrpcWebRequest, header)
	require.NoError(t, err)

	require.Empty(t, responseHeader.Get("grpc-message"))
	require.Empty(t, responseHeader.Get("grpc-status"))

	// We get the status encoded as trailer in the response.
	require.Contains(t, body, "grpc-status: 0")
}

// runRESTAuthTest tests authentication of the given REST interface.
func runRESTAuthTest(t *testing.T, hostPort, uiPassword, macaroonPath, restURI,
	successPattern string, usePOST bool) {

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

	// First test a REST call without authorization, which should fail.
	body, responseHeader, err := callURL(url, method, nil, nil, false)
	require.NoError(t, err)

	require.Equalf(
		t, "application/grpc",
		responseHeader.Get("grpc-metadata-content-type"),
		"response headers: %v, body: %v", responseHeader, body,
	)
	require.Equal(
		t, "application/json",
		responseHeader.Get("content-type"),
	)
	require.Contains(
		t, body,
		"expected 1 macaroon, got 0",
	)

	// Now add the UI password which should make the request succeed.
	body, responseHeader, err = callURL(
		url, method, nil, basicAuthHeader, false,
	)
	require.NoError(t, err)
	require.Contains(t, body, successPattern)

	// And finally, try with the given macaroon.
	macBytes, err := ioutil.ReadFile(macaroonPath)
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
	require.Contains(t, body, successPattern)
}

// runLNCAuthTest tests authentication of the given interface when connecting
// through Lightning Node Connect.
func runLNCAuthTest(t *testing.T, rawLNCConn grpc.ClientConnInterface,
	makeRequest requestFn, successContent string, callAllowed bool,
	expectErrContains string) {

	ctxt, cancel := context.WithTimeout(
		context.Background(), defaultTimeout,
	)
	defer cancel()

	// We should be able to make a request via LNC to the given RPC
	// endpoint, unless it is explicitly disallowed (we currently don't want
	// to support creating more sessions through LNC until we have all
	// macaroon permissions properly set up).
	resp, err := makeRequest(ctxt, rawLNCConn)

	// Is this a disallowed call?
	if !callAllowed {
		require.Error(t, err)
		require.Contains(t, err.Error(), expectErrContains)

		return
	}

	// The call should be allowed, so we expect no error.
	require.NoError(t, err)

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

	transportConn, err := mailbox.NewClient(ctx, connData)
	if err != nil {
		return nil, err
	}

	noiseConn := mailbox.NewNoiseGrpcConn(connData)

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

	tempFile, err := ioutil.TempFile("", "lit-super-macaroon")
	if err != nil {
		_ = os.Remove(tempFile.Name())
		return "", err
	}

	err = ioutil.WriteFile(tempFile.Name(), superMacBytes, 0644)
	if err != nil {
		_ = os.Remove(tempFile.Name())
		return "", err
	}

	return tempFile.Name(), nil
}
