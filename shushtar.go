package shushtar

import (
	"context"
	"crypto/tls"
	"encoding/base64"
	"errors"
	"fmt"
	"github.com/lightningnetwork/lnd/lncfg"
	"io/ioutil"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	restProxy "github.com/grpc-ecosystem/grpc-gateway/runtime"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"github.com/jessevdk/go-flags"
	"github.com/lightninglabs/faraday/frdrpc"
	"github.com/lightninglabs/loop/lndclient"
	"github.com/lightninglabs/loop/loopd"
	"github.com/lightninglabs/loop/looprpc"
	"github.com/lightningnetwork/lnd"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lntest/wait"
	"github.com/lightningnetwork/lnd/macaroons"
	"github.com/lightningnetwork/lnd/signal"
	"github.com/mwitkow/grpc-proxy/proxy"
	"github.com/rakyll/statik/fs"
	"google.golang.org/grpc"
	"google.golang.org/grpc/backoff"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/grpclog"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
	"gopkg.in/macaroon.v2"

	// Import generated go package that contains all static files for the
	// UI in a compressed format.
	_ "github.com/lightninglabs/shushtar/statik"
)

const (
	defaultServerTimeout  = 10 * time.Second
	defaultConnectTimeout = 5 * time.Second
	defaultStartupTimeout = 5 * time.Second
)

var (
	// maxMsgRecvSize is the largest message our REST proxy will receive. We
	// set this to 200MiB atm.
	maxMsgRecvSize = grpc.MaxCallRecvMsgSize(1 * 1024 * 1024 * 200)

	authError = status.Error(
		codes.Unauthenticated, "authentication required",
	)
)

// Shushtar is the main grand unified binary instance. Its task is to start an
// lnd node then start and register external subservers to it.
type Shushtar struct {
	cfg         *Config
	lndAddr     string
	listenerCfg lnd.ListenerCfg

	wg         sync.WaitGroup
	lndErrChan chan error

	lndClient     *lndclient.GrpcLndServices
	lndGrpcServer *grpc.Server

	faradayServer  *frdrpc.RPCServer
	faradayStarted bool

	loopServer  *loopd.Daemon
	loopStarted bool

	grpcWebProxy *grpc.Server
	httpServer   *http.Server
}

// New creates a new instance of the shushtar daemon.
func New() *Shushtar {
	return &Shushtar{
		cfg:        defaultConfig(),
		lndErrChan: make(chan error, 1),
	}
}

// Run starts everything and then blocks until either the application is shut
// down or a critical error happens.
func (g *Shushtar) Run() error {
	// Pre-parse the command line options to pick up an alternative config
	// file.
	_, err := flags.Parse(g.cfg)
	if err != nil {
		return err
	}

	// Load the configuration, and parse any command line options. This
	// function will also set up logging properly.
	g.cfg.Lnd, err = loadLndConfig(g.cfg)
	if err != nil {
		return err
	}

	// Validate the shushtar config options.
	if g.cfg.LetsEncryptDir == "" {
		g.cfg.LetsEncryptDir = filepath.Join(
			g.cfg.Lnd.LndDir, defaultLetsEncryptDir,
		)
	}
	g.cfg.LetsEncryptDir = lncfg.CleanAndExpandPath(g.cfg.LetsEncryptDir)
	if g.cfg.LetsEncrypt && g.cfg.LetsEncryptHost == "" {
		return fmt.Errorf("host must be set when using let's encrypt")
	}
	err = readUIPassword(g.cfg)
	if err != nil {
		return fmt.Errorf("could not read UI password: %v", err)
	}
	if len(g.cfg.UIPassword) < uiPasswordMinLength {
		return fmt.Errorf("please set a strong password for the UI, "+
			"at least %d characters long", uiPasswordMinLength)
	}

	// Initiate our listeners. For now, we only support listening on one
	// port at a time because we can only pass in one pre-configured RPC
	// listener into lnd.
	if len(g.cfg.Lnd.RPCListeners) > 1 {
		return fmt.Errorf("grub only supports one RPC listener at a " +
			"time")
	}
	rpcAddr := g.cfg.Lnd.RPCListeners[0]
	g.listenerCfg = lnd.ListenerCfg{
		RPCListener: &lnd.ListenerWithSignal{
			Listener: &onDemandListener{addr: rpcAddr},
			Ready:    make(chan struct{}),
			ExternalRPCSubserverCfg: &lnd.RPCSubserverConfig{
				Permissions: getSubserverPermissions(),
				Registrar:   g,
			},
			ExternalRestRegistrar: g,
		},
	}

	// With TLS enabled by default, we cannot call 0.0.0.0 internally when
	// dialing lnd as that IP address isn't in the cert. We need to rewrite
	// it to the loopback address.
	lndDialAddr := rpcAddr.String()
	switch {
	case strings.Contains(lndDialAddr, "0.0.0.0"):
		lndDialAddr = strings.Replace(
			lndDialAddr, "0.0.0.0", "127.0.0.1", 1,
		)

	case strings.Contains(lndDialAddr, "[::]"):
		lndDialAddr = strings.Replace(
			lndDialAddr, "[::]", "[::1]", 1,
		)
	}
	g.lndAddr = lndDialAddr

	// Some of the subservers' configuration options won't have any effect
	// (like the log or lnd options) as they will be taken from lnd's config
	// struct. Others we want to force to be the same as lnd so the user
	// doesn't have to set them manually, like the network for example.
	network, err := getNetwork(g.cfg.Lnd.Bitcoin)
	if err != nil {
		return err
	}
	g.cfg.Loop.Network = network

	// Create the instances of our subservers now so we can hook them up to
	// lnd once it's fully started.
	g.faradayServer = frdrpc.NewRPCServer(&frdrpc.Config{})
	g.loopServer = loopd.New(g.cfg.Loop, nil)

	// Hook interceptor for os signals.
	signal.Intercept()

	// Call the "real" main in a nested manner so the defers will properly
	// be executed in the case of a graceful shutdown.
	g.wg.Add(1)
	go func() {
		defer g.wg.Done()

		err := lnd.Main(
			g.cfg.Lnd, g.listenerCfg, signal.ShutdownChannel(),
		)
		if e, ok := err.(*flags.Error); err != nil &&
			(!ok || e.Type != flags.ErrHelp) {

			log.Errorf("Error running main lnd: %v", err)
			g.lndErrChan <- err
			return
		}

		close(g.lndErrChan)
	}()
	defer func() {
		err := g.shutdown()
		if err != nil {
			log.Errorf("Error shutting down: %v", err)
		}
	}()

	// Wait for lnd to be unlocked, then start all clients.
	select {
	case <-g.listenerCfg.RPCListener.Ready:

	case <-signal.ShutdownChannel():
		return errors.New("shutting down")
	}
	err = g.startSubservers(network)
	if err != nil {
		log.Errorf("Could not start subservers: %v", err)
		return err
	}

	err = g.startGrpcWebProxy()
	if err != nil {
		log.Errorf("Could not start gRPC web proxy server: %v", err)
		return err
	}

	// Now block until we receive an error or the main shutdown signal.
	select {
	case err := <-g.loopServer.ErrChan:
		// Loop will shut itself down if an error happens. We don't need
		// to try to stop it again.
		g.loopStarted = false
		log.Errorf("Received critical error from loop, shutting down: "+
			"%v", err)

	case err := <-g.lndErrChan:
		if err != nil {
			log.Errorf("Received critical error from lnd, "+
				"shutting down: %v", err)
		}

	case <-signal.ShutdownChannel():
		log.Infof("Shutdown signal received")
	}

	return nil
}

// startSubservers creates an internal connection to lnd and then starts all
// embedded daemons as external subservers that hook into the same gRPC and REST
// servers that lnd started.
func (g *Shushtar) startSubservers(network string) error {
	var basicClient lnrpc.LightningClient

	// The main RPC listener of lnd might need some time to start, it could
	// be that we run into a connection refused a few times.
	err := wait.NoError(func() error {
		// Create an lnd client now that we have the full configuration.
		// We'll need a basic client and a full client because not all
		// subservers have the same requirements.
		var err error
		basicClient, err = lndclient.NewBasicClient(
			g.lndAddr, g.cfg.Lnd.TLSCertPath,
			filepath.Dir(g.cfg.Lnd.AdminMacPath), network,
			lndclient.MacFilename(filepath.Base(
				g.cfg.Lnd.AdminMacPath,
			)),
		)
		if err != nil {
			return err
		}
		g.lndClient, err = lndclient.NewLndServices(
			&lndclient.LndServicesConfig{
				LndAddress:  g.lndAddr,
				Network:     network,
				MacaroonDir: filepath.Dir(g.cfg.Lnd.AdminMacPath),
				TLSPath:     g.cfg.Lnd.TLSCertPath,
			},
		)
		return err

	}, defaultStartupTimeout)
	if err != nil {
		return err
	}

	// The chain notifier also needs some time to start. Loop will subscribe
	// to the notifier and crash if it isn't ready yet, so we need to wait
	// here as a workaround.
	//
	// TODO(guggero): Remove once loop can retry itself.
	err = wait.NoError(func() error {
		ctxt, cancel := context.WithTimeout(
			context.Background(), defaultStartupTimeout,
		)
		defer cancel()

		notifier := g.lndClient.ChainNotifier
		resChan, errChan, err := notifier.RegisterBlockEpochNtfn(
			ctxt,
		)
		if err != nil {
			return err
		}

		// Block until we get a positive/negative answer or the timeout
		// is reached.
		select {
		case <-resChan:
			return nil

		case err := <-errChan:
			return err

		case <-ctxt.Done():
			return fmt.Errorf("wait for chain notifier to be " +
				"ready timed out")
		}
	}, defaultStartupTimeout)
	if err != nil {
		return err
	}

	err = g.faradayServer.StartAsSubserver(basicClient)
	if err != nil {
		return err
	}
	g.faradayStarted = true

	err = g.loopServer.StartAsSubserver(g.lndClient)
	if err != nil {
		return err
	}
	g.loopStarted = true

	return nil
}

// RegisterGrpcSubserver is a callback on the lnd.SubserverConfig struct that is
// called once lnd has initialized its main gRPC server instance. It gives the
// daemons (or external subservers) the possibility to register themselves to
// the same server instance.
func (g *Shushtar) RegisterGrpcSubserver(grpcServer *grpc.Server) error {
	g.lndGrpcServer = grpcServer
	frdrpc.RegisterFaradayServerServer(grpcServer, g.faradayServer)
	looprpc.RegisterSwapClientServer(grpcServer, g.loopServer)
	return nil
}

// RegisterRestSubserver is a callback on the lnd.SubserverConfig struct that is
// called once lnd has initialized its main REST server instance. It gives the
// daemons (or external subservers) the possibility to register themselves to
// the same server instance.
func (g *Shushtar) RegisterRestSubserver(ctx context.Context,
	mux *restProxy.ServeMux, endpoint string,
	dialOpts []grpc.DialOption) error {

	err := frdrpc.RegisterFaradayServerHandlerFromEndpoint(
		ctx, mux, endpoint, dialOpts,
	)
	if err != nil {
		return err
	}

	return looprpc.RegisterSwapClientHandlerFromEndpoint(
		ctx, mux, endpoint, dialOpts,
	)
}

// shutdown stops all subservers that were started and attached to lnd.
func (g *Shushtar) shutdown() error {
	var returnErr error

	if g.faradayStarted {
		err := g.faradayServer.Stop()
		if err != nil {
			log.Errorf("Error stopping faraday: %v", err)
			returnErr = err
		}
	}

	if g.loopStarted {
		g.loopServer.Stop()
		err := <-g.loopServer.ErrChan
		if err != nil {
			log.Errorf("Error stopping loop: %v", err)
			returnErr = err
		}
	}

	if g.lndClient != nil {
		g.lndClient.Close()
	}

	if g.grpcWebProxy != nil {
		g.grpcWebProxy.Stop()
		err := g.httpServer.Close()
		if err != nil {
			log.Errorf("Error stopping loop: %v", err)
			returnErr = err
		}
	}

	// In case the error wasn't thrown by lnd, make sure we stop it too.
	signal.RequestShutdown()

	g.wg.Wait()

	err := <-g.lndErrChan
	if err != nil {
		log.Errorf("Error stopping lnd: %v", err)
		returnErr = err
	}

	return returnErr
}

// startGrpcWebProxy creates a proxy that speaks gRPC web on one side and native
// gRPC on the other side. This allows gRPC web requests from the browser to be
// forwarded to lnd's native gRPC interface.
func (g *Shushtar) startGrpcWebProxy() error {
	// Initialize the in-memory file server from the content compiled by
	// the statik library.
	statikFS, err := fs.New()
	if err != nil {
		return fmt.Errorf("could not load statik file system: %v", err)
	}
	staticFileServer := http.FileServer(&ClientRouteWrapper{statikFS})

	// Create the gRPC web proxy that connects to lnd internally using the
	// admin macaroon and converts the browser's gRPC web calls into native
	// gRPC.
	lndGrpcServer, grpcServer, err := buildGrpcWebProxyServer(
		g.lndAddr, g.cfg.UIPassword, g.cfg.Lnd,
	)
	if err != nil {
		return fmt.Errorf("could not create gRPC web proxy: %v", err)
	}
	g.grpcWebProxy = grpcServer

	// Both gRPC (web) and static file requests will come into through the
	// main UI HTTP server. We use this simple switching handler to send the
	// requests to the correct implementation.
	httpHandler := func(resp http.ResponseWriter, req *http.Request) {
		// gRPC requests are easy to identify. Send them to the gRPC web
		// proxy.
		if lndGrpcServer.IsGrpcWebRequest(req) ||
			lndGrpcServer.IsGrpcWebSocketRequest(req) {

			log.Infof("Handling gRPC request: %s", req.URL.Path)
			lndGrpcServer.ServeHTTP(resp, req)

			return
		}

		// If we got here, it's a static file the browser wants, or
		// something we don't know in which case the static file server
		// will answer with a 404.
		log.Infof("Handling static file request: %s", req.URL.Path)
		staticFileServer.ServeHTTP(resp, req)
	}

	// Create and start our HTTPS server now that will handle both gRPC web
	// and static file requests.
	g.httpServer = &http.Server{
		WriteTimeout: defaultServerTimeout,
		ReadTimeout:  defaultServerTimeout,
		Handler:      http.HandlerFunc(httpHandler),
	}
	httpListener, err := net.Listen("tcp", g.cfg.HTTPSListen)
	if err != nil {
		return fmt.Errorf("unable to listen on %v: %v",
			g.cfg.HTTPSListen, err)
	}
	tlsConfig, err := buildTLSConfigForHttp2(g.cfg)
	if err != nil {
		return fmt.Errorf("unable to create TLS config: %v", err)
	}
	tlsListener := tls.NewListener(httpListener, tlsConfig)

	g.wg.Add(1)
	go func() {
		defer g.wg.Done()

		log.Infof("Listening for http_tls on: %v", tlsListener.Addr())
		err := g.httpServer.Serve(tlsListener)
		if err != nil && err != http.ErrServerClosed {
			log.Errorf("http_tls server error: %v", err)
		}
	}()

	return nil
}

// buildGrpcWebProxyServer creates a gRPC server that will serve gRPC web to the
// browser and translate all incoming gRPC web calls into native gRPC that are
// then forwarded to lnd's RPC interface.
func buildGrpcWebProxyServer(lndAddr, uiPassword string,
	config *lnd.Config) (*grpcweb.WrappedGrpcServer, *grpc.Server, error) {

	// Apply gRPC-wide changes.
	grpc.EnableTracing = true
	grpclog.SetLoggerV2(NewGrpcLogLogger(
		config.LogWriter, GrpcLogSubsystem,
	))

	// The gRPC web calls are protected by HTTP basic auth which is defined
	// by base64(username:password). Because we only have a password, we
	// just use base64(password:password).
	basicAuth := base64.StdEncoding.EncodeToString([]byte(fmt.Sprintf(
		"%s:%s", uiPassword, uiPassword,
	)))

	// Setup the connection to lnd. GRPC web has a few kinks that need to be
	// addressed with a custom director that just takes care of a few HTTP
	// header fields.
	backendConn, err := dialLnd(lndAddr, config)
	if err != nil {
		return nil, nil, fmt.Errorf("could not dial lnd: %v", err)
	}
	director := newDirector(backendConn, basicAuth)

	// Set up the final gRPC server that will serve gRPC web to the browser
	// and translate all incoming gRPC web calls into native gRPC that are
	// then forwarded to lnd's RPC interface.
	grpcServer := grpc.NewServer(
		grpc.CustomCodec(proxy.Codec()),
		grpc.UnknownServiceHandler(proxy.TransparentHandler(director)),
	)
	options := []grpcweb.Option{
		grpcweb.WithWebsockets(true),
		grpcweb.WithWebsocketPingInterval(2 * time.Minute),
		grpcweb.WithCorsForRegisteredEndpointsOnly(false),
	}
	return grpcweb.WrapServer(grpcServer, options...), grpcServer, nil
}

// newDirector returns a new director function that fixes some common known
// issues when using gRPC web from the browser.
func newDirector(backendConn *grpc.ClientConn,
	basicAuth string) proxy.StreamDirector {

	return func(ctx context.Context, fullMethodName string) (context.Context,
		*grpc.ClientConn, error) {

		md, _ := metadata.FromIncomingContext(ctx)

		authHeaders := md.Get("authorization")
		if len(authHeaders) == 0 {
			return nil, nil, authError
		}
		authHeaderParts := strings.Split(authHeaders[0], " ")
		if len(authHeaderParts) != 2 {
			return nil, nil, authError
		}
		if authHeaderParts[1] != basicAuth {
			return nil, nil, authError
		}

		// If this header is present in the request from the web client,
		// the actual connection to the backend will not be established.
		// https://github.com/improbable-eng/grpc-web/issues/568
		mdCopy := md.Copy()
		delete(mdCopy, "connection")

		outCtx := metadata.NewOutgoingContext(ctx, mdCopy)
		return outCtx, backendConn, nil
	}
}

// dialLnd connects to lnd through the given address and uses the admin macaroon
// to authenticate.
func dialLnd(lndAddr string, config *lnd.Config) (*grpc.ClientConn, error) {
	dialAdminMac, err := readMacaroon(config.AdminMacPath)
	if err != nil {
		return nil, fmt.Errorf("could not read admin macaroon: %v", err)
	}

	tlsConfig, err := credentials.NewClientTLSFromFile(
		config.TLSCertPath, "",
	)
	if err != nil {
		return nil, fmt.Errorf("could not read lnd TLS cert: %v", err)
	}

	opt := []grpc.DialOption{
		dialAdminMac,
		grpc.WithCodec(proxy.Codec()), // nolint
		grpc.WithTransportCredentials(tlsConfig),
		grpc.WithDefaultCallOptions(maxMsgRecvSize),
		grpc.WithConnectParams(grpc.ConnectParams{
			Backoff:           backoff.DefaultConfig,
			MinConnectTimeout: defaultConnectTimeout,
		}),
	}

	log.Infof("Dialing lnd gRPC server at %s", lndAddr)
	cc, err := grpc.Dial(lndAddr, opt...)
	if err != nil {
		return nil, fmt.Errorf("failed dialing backend: %v", err)
	}
	return cc, nil
}

// readMacaroon tries to read the macaroon file at the specified path and create
// gRPC dial options from it.
func readMacaroon(macPath string) (grpc.DialOption, error) {
	// Load the specified macaroon file.
	macBytes, err := ioutil.ReadFile(macPath)
	if err != nil {
		return nil, fmt.Errorf("unable to read macaroon path : %v", err)
	}

	mac := &macaroon.Macaroon{}
	if err = mac.UnmarshalBinary(macBytes); err != nil {
		return nil, fmt.Errorf("unable to decode macaroon: %v", err)
	}

	// Now we append the macaroon credentials to the dial options.
	cred := macaroons.NewMacaroonCredential(mac)
	return grpc.WithPerRPCCredentials(cred), nil
}

// ClientRouteWrapper is a wrapper around a FileSystem which properly handles
// URL routes that are defined in the client app but unknown to the backend
// http server
type ClientRouteWrapper struct {
	assets http.FileSystem
}

// Open intercepts requests to open files. If the file does not exist and there
// is no file extension, then assume this is a client side route and return the
// contents of index.html
func (i *ClientRouteWrapper) Open(name string) (http.File, error) {
	ret, err := i.assets.Open(name)
	if !os.IsNotExist(err) || filepath.Ext(name) != "" {
		return ret, err
	}

	return i.assets.Open("/index.html")
}
