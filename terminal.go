package terminal

import (
	"context"
	"crypto/tls"
	"errors"
	"fmt"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"sync"
	"time"

	restProxy "github.com/grpc-ecosystem/grpc-gateway/runtime"
	"github.com/jessevdk/go-flags"
	"github.com/lightninglabs/faraday/frdrpc"
	"github.com/lightninglabs/lndclient"
	"github.com/lightninglabs/loop/loopd"
	"github.com/lightninglabs/loop/looprpc"
	"github.com/lightningnetwork/lnd"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lntest/wait"
	"github.com/lightningnetwork/lnd/signal"
	"github.com/rakyll/statik/fs"
	"google.golang.org/grpc"
	"gopkg.in/macaroon-bakery.v2/bakery"

	// Import generated go package that contains all static files for the
	// UI in a compressed format.
	_ "github.com/lightninglabs/lightning-terminal/statik"
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
)

// LightningTerminal is the main grand unified binary instance. Its task is to
// start an lnd node then start and register external subservers to it.
type LightningTerminal struct {
	cfg *Config

	wg         sync.WaitGroup
	lndErrChan chan error

	lndClient     *lndclient.GrpcLndServices
	lndGrpcServer *grpc.Server

	faradayServer  *frdrpc.RPCServer
	faradayStarted bool

	loopServer  *loopd.Daemon
	loopStarted bool

	rpcProxy   *rpcProxy
	httpServer *http.Server
}

// New creates a new instance of the lightning-terminal daemon.
func New() *LightningTerminal {
	return &LightningTerminal{
		lndErrChan: make(chan error, 1),
	}
}

// Run starts everything and then blocks until either the application is shut
// down or a critical error happens.
func (g *LightningTerminal) Run() error {
	cfg, err := loadAndValidateConfig()
	if err != nil {
		return fmt.Errorf("could not load config: %v", err)
	}
	g.cfg = cfg

	// Create the instances of our subservers now so we can hook them up to
	// lnd once it's fully started.
	g.faradayServer = frdrpc.NewRPCServer(g.cfg.faradayRpcConfig)
	g.loopServer = loopd.New(g.cfg.Loop, nil)
	g.rpcProxy = newRpcProxy(g.cfg, g, getAllPermissions())

	// Hook interceptor for os signals.
	err = signal.Intercept()
	if err != nil {
		return fmt.Errorf("could not intercept signals: %v", err)
	}

	// Call the "real" main in a nested manner so the defers will properly
	// be executed in the case of a graceful shutdown.
	readyChan := make(chan struct{})
	if g.cfg.LndMode == ModeIntegrated {
		g.wg.Add(1)
		go func() {
			defer g.wg.Done()

			extSubCfg := &lnd.RPCSubserverConfig{
				Permissions:       getSubserverPermissions(),
				Registrar:         g,
				MacaroonValidator: g,
			}
			lisCfg := lnd.ListenerCfg{
				RPCListener: &lnd.ListenerWithSignal{
					Listener: &onDemandListener{
						addr: g.cfg.Lnd.RPCListeners[0],
					},
					Ready:                   readyChan,
					ExternalRPCSubserverCfg: extSubCfg,
					ExternalRestRegistrar:   g,
				},
			}

			err := lnd.Main(
				g.cfg.Lnd, lisCfg, signal.ShutdownChannel(),
			)
			if e, ok := err.(*flags.Error); err != nil &&
				(!ok || e.Type != flags.ErrHelp) {

				log.Errorf("Error running main lnd: %v", err)
				g.lndErrChan <- err
				return
			}

			close(g.lndErrChan)
		}()
	} else {
		close(readyChan)

		_ = g.RegisterGrpcSubserver(g.rpcProxy.grpcServer)
	}
	defer func() {
		err := g.shutdown()
		if err != nil {
			log.Errorf("Error shutting down: %v", err)
		}
	}()

	// Wait for lnd to be unlocked, then start all clients.
	select {
	case <-readyChan:

	case <-signal.ShutdownChannel():
		return errors.New("shutting down")
	}
	err = g.startSubservers()
	if err != nil {
		log.Errorf("Could not start subservers: %v", err)
		return err
	}

	if err := g.startMainWebServer(); err != nil {
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
func (g *LightningTerminal) startSubservers() error {
	var basicClient lnrpc.LightningClient

	host, network, tlsPath, macPath, err := g.cfg.lndConnectParams()
	if err != nil {
		return err
	}

	// Now start the RPC proxy that will handle all incoming gRPC, grpc-web
	// and REST requests.
	if err := g.rpcProxy.Start(); err != nil {
		return fmt.Errorf("error starting lnd gRPC proxy server: %v",
			err)
	}

	// The main RPC listener of lnd might need some time to start, it could
	// be that we run into a connection refused a few times. We use the
	// basic client connection to find out if the RPC server is started yet
	// because that doesn't do anything else than just connect. We'll check
	// if lnd is also ready to be used in the next step.
	err = wait.NoError(func() error {
		// Create an lnd client now that we have the full configuration.
		// We'll need a basic client and a full client because not all
		// subservers have the same requirements.
		var err error
		basicClient, err = lndclient.NewBasicClient(
			host, tlsPath, filepath.Dir(macPath), string(network),
			lndclient.MacFilename(filepath.Base(macPath)),
		)
		return err
	}, defaultStartupTimeout)
	if err != nil {
		return err
	}

	// Now we know that the connection itself is ready. But we also need to
	// wait for two things: The chain notifier to be ready and the lnd
	// wallet being fully synced to its chain backend. The chain notifier
	// will always be ready first so if we instruct the lndclient to wait
	// for the wallet sync, we should be fully ready to start all our
	// subservers. This will just block until lnd signals readiness. But we
	// still want to react to shutdown requests, so we need to listen for
	// those.
	ctxc, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Make sure the context is canceled if the user requests shutdown.
	go func() {
		select {
		// Client requests shutdown, cancel the wait.
		case <-signal.ShutdownChannel():
			cancel()

		// The check was completed and the above defer canceled the
		// context. We can just exit the goroutine, nothing more to do.
		case <-ctxc.Done():
		}
	}()
	g.lndClient, err = lndclient.NewLndServices(
		&lndclient.LndServicesConfig{
			LndAddress:            host,
			Network:               network,
			MacaroonDir:           filepath.Dir(macPath),
			TLSPath:               tlsPath,
			BlockUntilChainSynced: true,
			ChainSyncCtx:          ctxc,
		},
	)
	if err != nil {
		return err
	}

	// Both connection types are ready now, let's start our subservers.
	err = g.faradayServer.StartAsSubserver(g.lndClient.LndServices)
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
func (g *LightningTerminal) RegisterGrpcSubserver(grpcServer *grpc.Server) error {
	g.lndGrpcServer = grpcServer
	frdrpc.RegisterFaradayServerServer(grpcServer, g.faradayServer)
	looprpc.RegisterSwapClientServer(grpcServer, g.loopServer)
	return nil
}

// RegisterRestSubserver is a callback on the lnd.SubserverConfig struct that is
// called once lnd has initialized its main REST server instance. It gives the
// daemons (or external subservers) the possibility to register themselves to
// the same server instance.
func (g *LightningTerminal) RegisterRestSubserver(ctx context.Context,
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

// ValidateMacaroon extracts the macaroon from the context's gRPC metadata,
// checks its signature, makes sure all specified permissions for the called
// method are contained within and finally ensures all caveat conditions are
// met. A non-nil error is returned if any of the checks fail.
func (g *LightningTerminal) ValidateMacaroon(ctx context.Context,
	requiredPermissions []bakery.Op, fullMethod string) error {

	// Validate all macaroons for services that are running in the local
	// process. Calls that we proxy to a remote host don't need to be
	// checked as they'll have their own interceptor.
	switch {
	case isLoopURI(fullMethod):
		return g.loopServer.ValidateMacaroon(
			ctx, requiredPermissions, fullMethod,
		)

	case isFaradayURI(fullMethod):
		return g.faradayServer.ValidateMacaroon(
			ctx, requiredPermissions, fullMethod,
		)
	}

	// Because lnd will spin up its own gRPC server with macaroon
	// interceptors if it is running in this process, it will check its
	// macaroons there. If lnd is running remotely, that process will check
	// the macaroons. So we don't need to worry about anything other than
	// the subservers that are running in the local process.
	return nil
}

// shutdown stops all subservers that were started and attached to lnd.
func (g *LightningTerminal) shutdown() error {
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

	if g.rpcProxy != nil {
		if err := g.rpcProxy.Stop(); err != nil {
			log.Errorf("Error stopping lnd proxy: %v", err)
			returnErr = err
		}
		if err := g.httpServer.Close(); err != nil {
			log.Errorf("Error stopping lnd: %v", err)
			returnErr = err
		}
	}

	// In case the error wasn't thrown by lnd, make sure we stop it too.
	signal.RequestShutdown()

	g.wg.Wait()

	// The lnd error channel was only created if we are actually running lnd
	// in the same process.
	if g.cfg.LndMode == ModeIntegrated {
		err := <-g.lndErrChan
		if err != nil {
			log.Errorf("Error stopping lnd: %v", err)
			returnErr = err
		}
	}

	return returnErr
}

// startMainWebServer creates the main web HTTP server that delegates requests
// between the Statik HTTP server and the RPC proxy. An incoming request will
// go through the following chain of components:
//
//    Request on port 8443
//        |
//        v
//    +---+----------------------+ other  +----------------+
//    | Main web HTTP server     +------->+ Statik HTTP    |
//    +---+----------------------+        +----------------+
//        |
//        v any RPC or REST call
//    +---+----------------------+
//    | grpc-web proxy           |
//    +---+----------------------+
//        |
//        v native gRPC call with basic auth
//    +---+----------------------+
//    | interceptors             |
//    +---+----------------------+
//        |
//        v native gRPC call with macaroon
//    +---+----------------------+ registered call
//    | gRPC server              +--------------+
//    +---+----------------------+              |
//        |                                     |
//        v non-registered call                 |
//    +---+----------------------+    +---------v----------+
//    | director                 |    | local subserver    |
//    +---+----------------------+    |  - loop            |
//        |                           |  - faraday         |
//        v authenticated call        |                    |
//    +---+----------------------+    +--------------------+
//    | lnd (remote or local)    |
//    +--------------------------+
//
func (g *LightningTerminal) startMainWebServer() error {
	// Initialize the in-memory file server from the content compiled by
	// the statik library.
	statikFS, err := fs.New()
	if err != nil {
		return fmt.Errorf("could not load statik file system: %v", err)
	}
	staticFileServer := http.FileServer(&ClientRouteWrapper{statikFS})

	// Both gRPC (web) and static file requests will come into through the
	// main UI HTTP server. We use this simple switching handler to send the
	// requests to the correct implementation.
	httpHandler := func(resp http.ResponseWriter, req *http.Request) {
		// If this is some kind of gRPC, gRPC Web or REST call that
		// should go to lnd or one of the daemons, pass it to the proxy
		// that handles all those calls.
		if g.rpcProxy.isHandling(resp, req) {
			return
		}

		// If we got here, it's a static file the browser wants, or
		// something we don't know in which case the static file server
		// will answer with a 404.
		log.Infof("Handling static file request: %s", req.URL.Path)

		// Add 1-year cache header for static files. React uses content-
		// based hashes in file names, so when any file is updated, the
		// url will change causing the browser cached version to be
		// invalidated.
		var re = regexp.MustCompile(`^/(static|fonts|icons)/.*`)
		if re.MatchString(req.URL.Path) {
			resp.Header().Set("Cache-Control", "max-age=31536000")
		}

		// Transfer static files using gzip to save up to 70% of
		// bandwidth.
		gzipHandler := makeGzipHandler(staticFileServer.ServeHTTP)
		gzipHandler(resp, req)
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
