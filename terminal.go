package terminal

import (
	"context"
	"crypto/tls"
	"embed"
	"encoding/binary"
	"encoding/hex"
	"errors"
	"fmt"
	"io/fs"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
	"time"

	restProxy "github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"github.com/jessevdk/go-flags"
	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/autopilotserver"
	"github.com/lightninglabs/lightning-terminal/firewall"
	"github.com/lightninglabs/lightning-terminal/firewalldb"
	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/lightninglabs/lightning-terminal/perms"
	"github.com/lightninglabs/lightning-terminal/queue"
	mid "github.com/lightninglabs/lightning-terminal/rpcmiddleware"
	"github.com/lightninglabs/lightning-terminal/rules"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightninglabs/lightning-terminal/status"
	"github.com/lightninglabs/lightning-terminal/subservers"
	"github.com/lightninglabs/lndclient"
	"github.com/lightningnetwork/lnd"
	"github.com/lightningnetwork/lnd/build"
	"github.com/lightningnetwork/lnd/chainreg"
	"github.com/lightningnetwork/lnd/kvdb"
	"github.com/lightningnetwork/lnd/lncfg"
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
	"github.com/lightningnetwork/lnd/lntest/wait"
	"github.com/lightningnetwork/lnd/lnwallet/btcwallet"
	"github.com/lightningnetwork/lnd/macaroons"
	"github.com/lightningnetwork/lnd/rpcperms"
	"github.com/lightningnetwork/lnd/signal"
	grpcProxy "github.com/mwitkow/grpc-proxy/proxy"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/test/bufconn"
	"google.golang.org/protobuf/encoding/protojson"
	"gopkg.in/macaroon-bakery.v2/bakery"
	"gopkg.in/macaroon.v2"
)

const (
	MainnetServer = "autopilot.lightning.finance:12010"
	TestnetServer = "test.autopilot.lightning.finance:12010"

	defaultServerTimeout  = 10 * time.Second
	defaultConnectTimeout = 15 * time.Second
	defaultStartupTimeout = 5 * time.Second
)

// restRegistration is a function type that represents a REST proxy
// registration.
type restRegistration func(context.Context, *restProxy.ServeMux, string,
	[]grpc.DialOption) error

var (
	// maxMsgRecvSize is the largest message our REST proxy will receive. We
	// set this to 200MiB atm.
	maxMsgRecvSize = grpc.MaxCallRecvMsgSize(1 * 1024 * 1024 * 200)

	// macDatabaseOpenTimeout is how long we wait for acquiring the lock on
	// the macaroon database before we give up with an error.
	macDatabaseOpenTimeout = time.Second * 5

	// appBuildFS is an in-memory file system that contains all the static
	// HTML/CSS/JS files of the UI. It is compiled into the binary with the
	// go 1.16 embed directive below. Because the path is relative to the
	// root package, all assets will have a path prefix of /app/build/ which
	// we'll strip by giving a sub directory to the HTTP server.
	//
	//go:embed app/build/*
	appBuildFS embed.FS

	// appFilesDir is the sub directory of the above build directory which
	// we pass to the HTTP server.
	appFilesDir = "app/build"

	// appFilesPrefix is the path prefix the static assets of the UI are
	// exposed under. This variable can be overwritten during build time if
	// a different deployment path should be used.
	appFilesPrefix = ""

	// patternRESTRequest is the regular expression that matches all REST
	// URIs that are currently used by lnd, faraday, loop and pool.
	patternRESTRequest = regexp.MustCompile(`^/v\d/.*`)

	// lndRESTRegistrations is the list of all lnd REST handler registration
	// functions we want to call when creating our REST proxy. We include
	// all lnd subserver packages here, even though some might not be active
	// in a remote lnd node. That will result in an "UNIMPLEMENTED" error
	// instead of a 404 which should be an okay tradeoff vs. connecting
	// first and querying all enabled subservers to dynamically populate
	// this list.
	lndRESTRegistrations = []restRegistration{
		lnrpc.RegisterLightningHandlerFromEndpoint,
		lnrpc.RegisterWalletUnlockerHandlerFromEndpoint,
		lnrpc.RegisterStateHandlerFromEndpoint,
		autopilotrpc.RegisterAutopilotHandlerFromEndpoint,
		chainrpc.RegisterChainNotifierHandlerFromEndpoint,
		invoicesrpc.RegisterInvoicesHandlerFromEndpoint,
		routerrpc.RegisterRouterHandlerFromEndpoint,
		signrpc.RegisterSignerHandlerFromEndpoint,
		verrpc.RegisterVersionerHandlerFromEndpoint,
		walletrpc.RegisterWalletKitHandlerFromEndpoint,
		watchtowerrpc.RegisterWatchtowerHandlerFromEndpoint,
		wtclientrpc.RegisterWatchtowerClientHandlerFromEndpoint,
	}

	// minimalCompatibleVersion is the minimal lnd version that is required
	// to run LiT in remote mode.
	minimalCompatibleVersion = &verrpc.Version{
		AppMajor: 0,
		AppMinor: 16,
		AppPatch: 0,
		BuildTags: []string{
			"signrpc", "walletrpc", "chainrpc", "invoicesrpc",
		},
	}
)

// LightningTerminal is the main grand unified binary instance. Its task is to
// start an lnd node then start and register external subservers to it.
type LightningTerminal struct {
	cfg *Config

	defaultImplCfg *lnd.ImplementationCfg

	permsMgr *perms.Manager

	// lndInterceptorChain is a reference to lnd's interceptor chain that
	// guards all incoming calls. This is only set in integrated mode!
	lndInterceptorChain *rpcperms.InterceptorChain

	wg       sync.WaitGroup
	errQueue *queue.ConcurrentQueue[error]

	lndConn     *grpc.ClientConn
	lndClient   *lndclient.GrpcLndServices
	basicClient lnrpc.LightningClient

	subServerMgr *subservers.Manager
	statusMgr    *status.Manager

	autopilotClient autopilotserver.Autopilot

	ruleMgrs rules.ManagerSet

	rpcProxy   *rpcProxy
	httpServer *http.Server

	sessionRpcServer        *sessionRpcServer
	sessionRpcServerStarted bool

	macaroonService        *lndclient.MacaroonService
	macaroonServiceStarted bool
	macaroonDB             kvdb.Backend

	middleware        *mid.Manager
	middlewareStarted bool

	accountService        *accounts.InterceptorService
	accountServiceStarted bool

	accountRpcServer *accounts.RPCServer

	firewallDB *firewalldb.DB
	sessionDB  *session.DB

	restHandler http.Handler
	restCancel  func()
}

// New creates a new instance of the lightning-terminal daemon.
func New() *LightningTerminal {
	return &LightningTerminal{
		statusMgr: status.NewStatusManager(),
	}
}

// Run starts everything and then blocks until either the application is shut
// down or a critical error happens.
func (g *LightningTerminal) Run() error {
	// Hook interceptor for os signals.
	shutdownInterceptor, err := signal.Intercept()
	if err != nil {
		return fmt.Errorf("could not intercept signals: %v", err)
	}

	cfg, err := loadAndValidateConfig(shutdownInterceptor)
	if err != nil {
		return fmt.Errorf("could not load config: %w", err)
	}
	g.cfg = cfg
	g.defaultImplCfg = g.cfg.Lnd.ImplementationConfig(shutdownInterceptor)

	// Show version at startup.
	log.Infof("LiT version: %s", Version())

	// This concurrent error queue can be used by every component that can
	// raise runtime errors. Using a queue will prevent us from blocking on
	// sending errors to it, as long as the queue is running.
	g.errQueue = queue.NewConcurrentQueue[error](queue.DefaultQueueSize)
	g.errQueue.Start()
	defer g.errQueue.Stop()

	// Construct a new Manager.
	g.permsMgr, err = perms.NewManager(false)
	if err != nil {
		return fmt.Errorf("could not create permissions manager")
	}

	// Register LND, LiT and Accounts with the status manager.
	g.statusMgr.RegisterAndEnableSubServer(subservers.LND)
	g.statusMgr.RegisterAndEnableSubServer(subservers.LIT)
	g.statusMgr.RegisterSubServer(subservers.ACCOUNTS)

	// Also enable the accounts subserver if it's not disabled.
	if !g.cfg.Accounts.Disable {
		g.statusMgr.SetEnabled(subservers.ACCOUNTS)
	}

	// Create the instances of our subservers now so we can hook them up to
	// lnd once it's fully started.
	g.subServerMgr = subservers.NewManager(g.permsMgr, g.statusMgr)

	// Register our sub-servers. This must be done before the REST proxy is
	// set up so that the correct REST handlers are registered.
	g.initSubServers()

	// Construct the rpcProxy. It must be initialised before the main web
	// server is started.
	g.rpcProxy = newRpcProxy(
		g.cfg, g, g.validateSuperMacaroon, g.permsMgr, g.subServerMgr,
		g.statusMgr,
	)

	// Register any gRPC services that should be served using LiT's
	// gRPC server regardless of the LND mode being used.
	litrpc.RegisterProxyServer(g.rpcProxy.grpcServer, g.rpcProxy)
	litrpc.RegisterStatusServer(g.rpcProxy.grpcServer, g.statusMgr)

	// Start the main web server that dispatches requests either to the
	// static UI file server or the RPC proxy. This makes it possible to
	// unlock lnd through the UI.
	if err := g.startMainWebServer(); err != nil {
		return fmt.Errorf("error starting main proxy HTTP server: %v",
			err)
	}

	// We'll also create a REST proxy that'll convert any REST calls to gRPC
	// calls and forward them to the internal listener.
	if g.cfg.EnableREST {
		if err := g.createRESTProxy(); err != nil {
			return fmt.Errorf("error creating REST proxy: %v", err)
		}
	}

	// Attempt to start Lit and all of its sub-servers. If an error is
	// returned, it means that either one of Lit's internal sub-servers
	// could not start or LND could not start or be connected to.
	startErr := g.start()
	if startErr != nil {
		g.statusMgr.SetErrored(
			subservers.LIT, "could not start Lit: %v", startErr,
		)
	}

	// Now block until we receive an error or the main shutdown
	// signal.
	<-shutdownInterceptor.ShutdownChannel()
	log.Infof("Shutdown signal received")

	err = g.shutdownSubServers()
	if err != nil {
		log.Errorf("Error shutting down: %v", err)
	}

	g.wg.Wait()

	return startErr
}

// start attempts to start all the various components of Litd. Only Litd and
// LND errors are considered fatal and will result in an error being returned.
// If any of the sub-servers managed by the subServerMgr error while starting
// up, these are considered non-fatal and will not result in an error being
// returned.
func (g *LightningTerminal) start() error {
	var err error

	accountServiceErrCallback := func(err error) {
		g.statusMgr.SetErrored(
			subservers.ACCOUNTS,
			err.Error(),
		)

		log.Errorf("Error thrown in the accounts service, keeping "+
			"litd running: %v", err,
		)
	}

	g.accountService, err = accounts.NewService(
		filepath.Dir(g.cfg.MacaroonPath), accountServiceErrCallback,
	)
	if err != nil {
		return fmt.Errorf("error creating account service: %v", err)
	}

	superMacBaker := func(ctx context.Context, rootKeyID uint64,
		recipe *session.MacaroonRecipe) (string, error) {

		return BakeSuperMacaroon(
			ctx, g.basicClient, rootKeyID,
			recipe.Permissions, recipe.Caveats,
		)
	}

	g.accountRpcServer = accounts.NewRPCServer(
		g.accountService, superMacBaker,
	)

	g.ruleMgrs = rules.NewRuleManagerSet()

	// Create an instance of the local Terminal Connect session store DB.
	networkDir := filepath.Join(g.cfg.LitDir, g.cfg.Network)
	g.sessionDB, err = session.NewDB(networkDir, session.DBFilename)
	if err != nil {
		return fmt.Errorf("error creating session DB: %v", err)
	}

	g.firewallDB, err = firewalldb.NewDB(
		networkDir, firewalldb.DBFilename, g.sessionDB,
	)
	if err != nil {
		return fmt.Errorf("error creating firewall DB: %v", err)
	}

	if !g.cfg.Autopilot.Disable {
		if g.cfg.Autopilot.Address == "" &&
			len(g.cfg.Autopilot.DialOpts) == 0 {

			switch g.cfg.Network {
			case "mainnet":
				g.cfg.Autopilot.Address = MainnetServer
			case "testnet":
				g.cfg.Autopilot.Address = TestnetServer
			default:
				return errors.New("no autopilot server " +
					"address specified")
			}
		}

		g.cfg.Autopilot.LitVersion = autopilotserver.Version{
			Major: uint32(appMajor),
			Minor: uint32(appMinor),
			Patch: uint32(appPatch),
		}

		g.autopilotClient, err = autopilotserver.NewClient(
			g.cfg.Autopilot,
		)
		if err != nil {
			return err
		}
	}

	g.sessionRpcServer, err = newSessionRPCServer(&sessionRpcServerConfig{
		db:        g.sessionDB,
		basicAuth: g.rpcProxy.basicAuth,
		grpcOptions: []grpc.ServerOption{
			grpc.CustomCodec(grpcProxy.Codec()), // nolint: staticcheck,
			grpc.ChainStreamInterceptor(
				g.rpcProxy.StreamServerInterceptor,
			),
			grpc.ChainUnaryInterceptor(
				g.rpcProxy.UnaryServerInterceptor,
			),
			grpc.UnknownServiceHandler(
				grpcProxy.TransparentHandler(
					// Don't allow calls to litrpc.
					g.rpcProxy.makeDirector(false),
				),
			),
		},
		registerGrpcServers: func(server *grpc.Server) {
			g.registerSubDaemonGrpcServers(server, true)
		},
		superMacBaker:           superMacBaker,
		firstConnectionDeadline: g.cfg.FirstLNCConnDeadline,
		permMgr:                 g.permsMgr,
		actionsDB:               g.firewallDB,
		autopilot:               g.autopilotClient,
		ruleMgrs:                g.ruleMgrs,
		privMap:                 g.firewallDB.PrivacyDB,
	})
	if err != nil {
		return fmt.Errorf("could not create new session rpc "+
			"server: %v", err)
	}

	// Call the "real" main in a nested manner so the defers will properly
	// be executed in the case of a graceful shutdown.
	var (
		bufRpcListener = bufconn.Listen(100)
		readyChan      = make(chan struct{})
		bufReadyChan   = make(chan struct{})
		unlockChan     = make(chan struct{})
		lndQuit        = make(chan struct{})
		macChan        = make(chan []byte, 1)
	)
	if g.cfg.LndMode == ModeIntegrated {
		lisCfg := lnd.ListenerCfg{
			RPCListeners: []*lnd.ListenerWithSignal{{
				Listener: &onDemandListener{
					addr: g.cfg.Lnd.RPCListeners[0],
				},
				Ready: readyChan,
			}, {
				Listener: bufRpcListener,
				Ready:    bufReadyChan,
				MacChan:  macChan,
			}},
		}

		implCfg := &lnd.ImplementationCfg{
			GrpcRegistrar:       g,
			RestRegistrar:       g,
			ExternalValidator:   g,
			DatabaseBuilder:     g.defaultImplCfg.DatabaseBuilder,
			WalletConfigBuilder: g,
			ChainControlBuilder: g.defaultImplCfg.ChainControlBuilder,
		}

		g.wg.Add(1)
		go func() {
			defer g.wg.Done()

			err := lnd.Main(g.cfg.Lnd, lisCfg, implCfg, interceptor)
			if e, ok := err.(*flags.Error); err != nil &&
				(!ok || e.Type != flags.ErrHelp) {

				errStr := fmt.Sprintf("Error running main "+
					"lnd: %v", err)
				log.Errorf(errStr)

				g.statusMgr.SetErrored(subservers.LND, errStr)
				g.errQueue.ChanIn() <- err

				return
			}

			close(lndQuit)
		}()
	} else {
		close(unlockChan)
		close(readyChan)
		close(bufReadyChan)

		_ = g.RegisterGrpcSubserver(g.rpcProxy.grpcServer)
	}

	// Wait for lnd to be started up so we know we have a TLS cert.
	select {
	// If lnd needs to be unlocked we get the signal that it's ready to do
	// so. We then go ahead and start the UI so we can unlock it there as
	// well.
	case <-unlockChan:

	// If lnd is running with --noseedbackup and doesn't need unlocking, we
	// get the ready signal immediately.
	case <-readyChan:

	case err := <-g.errQueue.ChanOut():
		g.statusMgr.SetErrored(
			subservers.LND, "error from errQueue channel",
		)

		return fmt.Errorf("could not start LND: %v", err)

	case <-lndQuit:
		g.statusMgr.SetErrored(
			subservers.LND, "lndQuit channel closed",
		)

		return fmt.Errorf("LND has stopped")

	case <-interceptor.ShutdownChannel():
		return fmt.Errorf("received the shutdown signal")
	}

	// Connect to LND.
	g.lndConn, err = connectLND(g.cfg, bufRpcListener)
	if err != nil {
		g.statusMgr.SetErrored(
			subservers.LND, "could not connect to LND: %v", err,
		)

		return fmt.Errorf("could not connect to LND")
	}

	// Initialise any connections to sub-servers that we are running in
	// remote mode.
	g.subServerMgr.ConnectRemoteSubServers()

	// bakeSuperMac is a closure that can be used to bake a new super
	// macaroon that contains all active permissions.
	bakeSuperMac := func(ctx context.Context, rootKeyIDSuffix uint32) (
		string, error) {

		var suffixBytes [4]byte
		binary.BigEndian.PutUint32(suffixBytes[:], rootKeyIDSuffix)

		rootKeyID := session.NewSuperMacaroonRootKeyID(suffixBytes)

		return BakeSuperMacaroon(
			ctx, g.basicClient, rootKeyID,
			g.permsMgr.ActivePermissions(false), nil,
		)
	}

	// Now start the RPC proxy that will handle all incoming gRPC, grpc-web
	// and REST requests.
	if err := g.rpcProxy.Start(g.lndConn, bakeSuperMac); err != nil {
		return fmt.Errorf("error starting lnd gRPC proxy server: %v",
			err)
	}

	// We can now set the status of LND as running.
	// This is done _before_ we wait for the macaroon so that
	// LND commands to create and unlock a wallet can be allowed.
	g.statusMgr.SetRunning(subservers.LND)

	// Now that we have started the main UI web server, show some useful
	// information to the user so they can access the web UI easily.
	if err := g.showStartupInfo(); err != nil {
		return fmt.Errorf("error displaying startup info: %v", err)
	}

	// waitForSignal is a helper closure that can be used to wait on the
	// given channel for a signal while also being responsive to an error
	// from the error Queue, LND quiting or the interceptor receiving a
	// shutdown signal.
	waitForSignal := func(c chan struct{}) error {
		select {
		case <-c:
			return nil

		case err := <-g.errQueue.ChanOut():
			return err

		case <-lndQuit:
			g.statusMgr.SetErrored(
				subservers.LND, "lndQuit channel closed",
			)

			return fmt.Errorf("LND has stopped")

		case <-interceptor.ShutdownChannel():
			return fmt.Errorf("received the shutdown signal")
		}
	}

	// Wait for lnd to be unlocked, then start all clients.
	if err = waitForSignal(readyChan); err != nil {
		return err
	}

	// If we're in integrated mode, we'll need to wait for lnd to send the
	// macaroon after unlock before going any further.
	if g.cfg.LndMode == ModeIntegrated {
		if err = waitForSignal(bufReadyChan); err != nil {
			return err
		}

		// Create a new macReady channel that will serve to signal that
		// the LND macaroon is ready. Spin off a goroutine that will
		// close this channel when the macaroon has been received.
		macReady := make(chan struct{})
		go func() {
			g.cfg.lndAdminMacaroon = <-macChan
			close(macReady)
		}()

		if err = waitForSignal(macReady); err != nil {
			return err
		}
	}

	// Set up all the LND clients required by LiT.
	err = g.setUpLNDClients()
	if err != nil {
		g.statusMgr.SetErrored(
			subservers.LND, "could not set up LND clients: %v", err,
		)

		return fmt.Errorf("could not start LND")
	}

	// If we're in integrated and stateless init mode, we won't create
	// macaroon files in any of the subserver daemons.
	createDefaultMacaroons := true
	if g.cfg.LndMode == ModeIntegrated && g.lndInterceptorChain != nil &&
		g.lndInterceptorChain.MacaroonService() != nil {

		// If the wallet was initialized in stateless mode, we don't
		// want any macaroons lying around on the filesystem. In that
		// case only the UI will be able to access any of the integrated
		// daemons. In all other cases we want default macaroons so we
		// can use the CLI tools to interact with loop/pool/faraday.
		macService := g.lndInterceptorChain.MacaroonService()
		createDefaultMacaroons = !macService.StatelessInit
	}

	// Both connection types are ready now, let's start our sub-servers if
	// they should be started locally as an integrated service.
	g.subServerMgr.StartIntegratedServers(
		g.basicClient, g.lndClient, createDefaultMacaroons,
	)

	err = g.startInternalSubServers(createDefaultMacaroons)
	if err != nil {
		return fmt.Errorf("could not start litd sub-servers: %v", err)
	}

	// We can now set the status of LiT as running.
	g.statusMgr.SetRunning(subservers.LIT)

	// Now block until we receive an error or the main shutdown signal.
	select {
	case err := <-g.errQueue.ChanOut():
		if err != nil {
			return fmt.Errorf("received critical error from "+
				"subsystem, shutting down: %v", err)
		}

	case <-lndQuit:
		g.statusMgr.SetErrored(
			subservers.LND, "lndQuit channel closed",
		)

		return fmt.Errorf("LND is not running")

	case <-interceptor.ShutdownChannel():
		log.Infof("Shutdown signal received")
	}

	return nil
}

// setUpLNDClients sets up the various LND clients required by LiT.
func (g *LightningTerminal) setUpLNDClients() error {
	var (
		insecure      bool
		clientOptions []lndclient.BasicClientOption
	)

	host, network, tlsPath, macPath, macData := g.cfg.lndConnectParams()
	clientOptions = append(clientOptions, lndclient.MacaroonData(
		hex.EncodeToString(macData),
	))
	clientOptions = append(
		clientOptions, lndclient.MacFilename(filepath.Base(macPath)),
	)

	// If we're in integrated mode, we can retrieve the macaroon string
	// from lnd directly, rather than grabbing it from disk.
	if g.cfg.LndMode == ModeIntegrated {
		// Set to true in integrated mode, since we will not require tls
		// when communicating with lnd via a bufconn.
		insecure = true
		clientOptions = append(clientOptions, lndclient.Insecure())
	}

	// The main RPC listener of lnd might need some time to start, it could
	// be that we run into a connection refused a few times. We use the
	// basic client connection to find out if the RPC server is started yet
	// because that doesn't do anything else than just connect. We'll check
	// if lnd is also ready to be used in the next step.
	log.Infof("Connecting basic lnd client")
	err := wait.NoError(func() error {
		// Create an lnd client now that we have the full configuration.
		// We'll need a basic client and a full client because not all
		// subservers have the same requirements.
		var err error
		g.basicClient, err = lndclient.NewBasicClient(
			host, tlsPath, filepath.Dir(macPath), string(network),
			clientOptions...,
		)
		return err
	}, defaultStartupTimeout)
	if err != nil {
		return fmt.Errorf("could not create basic LND Client: %v", err)
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
		case <-interceptor.ShutdownChannel():
			cancel()

		// The check was completed and the above defer canceled the
		// context. We can just exit the goroutine, nothing more to do.
		case <-ctxc.Done():
		}
	}()

	log.Infof("Connecting full lnd client")
	g.lndClient, err = lndclient.NewLndServices(
		&lndclient.LndServicesConfig{
			LndAddress:            host,
			Network:               network,
			TLSPath:               tlsPath,
			Insecure:              insecure,
			CustomMacaroonPath:    macPath,
			CustomMacaroonHex:     hex.EncodeToString(macData),
			BlockUntilChainSynced: true,
			BlockUntilUnlocked:    true,
			CallerCtx:             ctxc,
			CheckVersion:          minimalCompatibleVersion,
		},
	)
	if err != nil {
		return fmt.Errorf("could not create LND Services client: %v",
			err)
	}

	// Pass LND's build tags to the permission manager so that it can
	// filter the available permissions accordingly.
	g.permsMgr.OnLNDBuildTags(g.lndClient.Version.BuildTags)

	// In the integrated mode, we received an admin macaroon once lnd was
	// ready. We can now bake a "super macaroon" that contains all
	// permissions of all daemons that we can use for any internal calls.
	if g.cfg.LndMode == ModeIntegrated {
		// Create a super macaroon that can be used to control lnd,
		// faraday, loop, and pool, all at the same time.
		log.Infof("Baking internal super macaroon")
		ctx := context.Background()
		superMacaroon, err := BakeSuperMacaroon(
			ctx, g.basicClient, session.NewSuperMacaroonRootKeyID(
				[4]byte{},
			),
			g.permsMgr.ActivePermissions(false), nil,
		)
		if err != nil {
			return err
		}

		g.rpcProxy.superMacaroon = superMacaroon
	}

	return nil
}

// startInternalSubServers starts all Litd specific sub-servers.
func (g *LightningTerminal) startInternalSubServers(
	createDefaultMacaroons bool) error {

	log.Infof("Starting LiT macaroon service")

	// Set up the macaroon service.
	rks, db, err := lndclient.NewBoltMacaroonStore(
		filepath.Join(g.cfg.LitDir, g.cfg.Network),
		lncfg.MacaroonDBName, macDatabaseOpenTimeout,
	)
	if err != nil {
		return err
	}

	g.macaroonDB = db
	g.macaroonService, err = lndclient.NewMacaroonService(
		&lndclient.MacaroonServiceConfig{
			RootKeyStore:     rks,
			MacaroonLocation: "litd",
			StatelessInit:    !createDefaultMacaroons,
			RequiredPerms:    perms.RequiredPermissions,
			LndClient:        &g.lndClient.LndServices,
			EphemeralKey:     lndclient.SharedKeyNUMS,
			KeyLocator:       lndclient.SharedKeyLocator,
			MacaroonPath:     g.cfg.MacaroonPath,
		},
	)
	if err != nil {
		log.Errorf("Could not create a new macaroon service: %v", err)
		return err
	}

	if err := g.macaroonService.Start(); err != nil {
		return fmt.Errorf("could not start macaroon service: %v", err)
	}
	g.macaroonServiceStarted = true

	if !g.cfg.Autopilot.Disable {
		withLndVersion := func(cfg *autopilotserver.Config) {
			cfg.LndVersion = autopilotserver.Version{
				Major: g.lndClient.Version.AppMajor,
				Minor: g.lndClient.Version.AppMinor,
				Patch: g.lndClient.Version.AppPatch,
			}
		}

		if err = g.autopilotClient.Start(withLndVersion); err != nil {
			return fmt.Errorf("could not start the autopilot "+
				"client: %v", err)
		}
	}

	log.Infof("Starting LiT session server")
	if err = g.sessionRpcServer.start(); err != nil {
		return err
	}
	g.sessionRpcServerStarted = true

	// The rest of the function only applies if the rpc middleware
	// interceptor has been enabled.
	if g.cfg.RPCMiddleware.Disabled {
		log.Infof("Internal sub server startup complete")

		return nil
	}

	// Even if the accounts service fails on the Start function, or the
	// accounts service is disabled, we still want to call Stop function as
	// this closes the contexts and the db store which were opened with the
	// accounts.NewService function call in the LightningTerminal start
	// function above.
	closeAccountService := func() {
		if err := g.accountService.Stop(); err != nil {
			// We only log the error if we fail to stop the service,
			// as it's not critical that this succeeds in order to
			// keep litd running
			log.Errorf("Error stopping account service: %v", err)
		}
	}

	log.Infof("Starting LiT account service")
	if !g.cfg.Accounts.Disable {
		err = g.accountService.Start(
			g.lndClient.Client, g.lndClient.Router,
			g.lndClient.ChainParams,
		)
		if err != nil {
			log.Errorf("error starting account service: %v, "+
				"disabling account service", err)

			g.statusMgr.SetErrored(subservers.ACCOUNTS, err.Error())

			closeAccountService()
		} else {
			g.statusMgr.SetRunning(subservers.ACCOUNTS)

			g.accountServiceStarted = true
		}
	} else {
		closeAccountService()
	}

	requestLogger, err := firewall.NewRequestLogger(
		g.cfg.Firewall.RequestLogger, g.firewallDB,
	)
	if err != nil {
		return fmt.Errorf("error creating new request logger")
	}

	privacyMapper := firewall.NewPrivacyMapper(
		g.firewallDB.PrivacyDB, firewall.CryptoRandIntn,
		g.sessionDB,
	)

	mw := []mid.RequestInterceptor{
		privacyMapper,
		g.accountService,
		requestLogger,
	}

	if !g.cfg.Autopilot.Disable {
		ruleEnforcer := firewall.NewRuleEnforcer(
			g.firewallDB, g.firewallDB, g.sessionDB,
			g.autopilotClient.ListFeaturePerms,
			g.permsMgr, g.lndClient.NodePubkey,
			g.lndClient.Router,
			g.lndClient.Client, g.ruleMgrs,
			func(reqID uint64, reason string) error {
				return requestLogger.MarkAction(
					reqID, firewalldb.ActionStateError,
					reason,
				)
			}, g.firewallDB.PrivacyDB,
		)

		mw = append(mw, ruleEnforcer)
	}

	// Start the middleware manager.
	log.Infof("Starting LiT middleware manager")
	g.middleware = mid.NewManager(
		g.cfg.RPCMiddleware.InterceptTimeout,
		g.lndClient.Client, g.errQueue.ChanIn(), mw...,
	)

	if err = g.middleware.Start(); err != nil {
		return err
	}
	g.middlewareStarted = true

	log.Infof("Internal sub server startup complete")

	return nil
}

// RegisterGrpcSubserver is a callback on the lnd.SubserverConfig struct that is
// called once lnd has initialized its main gRPC server instance. It gives the
// daemons (or external subservers) the possibility to register themselves to
// the same server instance.
//
// NOTE: This is part of the lnd.GrpcRegistrar interface.
func (g *LightningTerminal) RegisterGrpcSubserver(server *grpc.Server) error {
	if err := g.defaultImplCfg.RegisterGrpcSubserver(server); err != nil {
		return err
	}

	// Register all other daemon RPC servers that are running in-process.
	// The LiT session server should be enabled on the main interface.
	g.registerSubDaemonGrpcServers(server, false)

	return nil
}

// registerSubDaemonGrpcServers registers the sub daemon (Faraday, Loop, Pool
// and LiT session) servers to a given gRPC server, given they are running in
// the local process. Some of LiT's own sub-servers should be registered with
// LNC sessions and some should not - the forLNCSession boolean can be used to
// control this.
func (g *LightningTerminal) registerSubDaemonGrpcServers(server *grpc.Server,
	forLNCSession bool) {

	g.subServerMgr.RegisterRPCServices(server)

	if forLNCSession {
		litrpc.RegisterStatusServer(server, g.statusMgr)
	} else {
		litrpc.RegisterSessionsServer(server, g.sessionRpcServer)

		if !g.cfg.Accounts.Disable {
			litrpc.RegisterAccountsServer(
				server, g.accountRpcServer,
			)
		}
	}

	litrpc.RegisterFirewallServer(server, g.sessionRpcServer)

	if !g.cfg.Autopilot.Disable {
		litrpc.RegisterAutopilotServer(server, g.sessionRpcServer)
	}
}

// RegisterRestSubserver is a callback on the lnd.SubserverConfig struct that is
// called once lnd has initialized its main REST server instance. It gives the
// daemons (or external subservers) the possibility to register themselves to
// the same server instance.
//
// NOTE: This is part of the lnd.RestRegistrar interface.
func (g *LightningTerminal) RegisterRestSubserver(ctx context.Context,
	mux *restProxy.ServeMux, endpoint string,
	dialOpts []grpc.DialOption) error {

	err := g.defaultImplCfg.RegisterRestSubserver(
		ctx, mux, endpoint, dialOpts,
	)
	if err != nil {
		return err
	}

	if !g.cfg.Accounts.Disable {
		err = litrpc.RegisterAccountsHandlerFromEndpoint(
			ctx, mux, endpoint, dialOpts,
		)
		if err != nil {
			return err
		}
	}

	err = litrpc.RegisterFirewallHandlerFromEndpoint(
		ctx, mux, endpoint, dialOpts,
	)
	if err != nil {
		return err
	}

	err = litrpc.RegisterAutopilotHandlerFromEndpoint(
		ctx, mux, endpoint, dialOpts,
	)
	if err != nil {
		return err
	}

	err = litrpc.RegisterSessionsHandlerFromEndpoint(
		ctx, mux, endpoint, dialOpts,
	)
	if err != nil {
		return err
	}

	err = litrpc.RegisterProxyHandlerFromEndpoint(
		ctx, mux, endpoint, dialOpts,
	)
	if err != nil {
		return err
	}

	err = litrpc.RegisterStatusHandlerFromEndpoint(
		ctx, mux, endpoint, dialOpts,
	)
	if err != nil {
		return err
	}

	return g.subServerMgr.RegisterRestServices(ctx, mux, endpoint, dialOpts)
}

// ValidateMacaroon extracts the macaroon from the context's gRPC metadata,
// checks its signature, makes sure all specified permissions for the called
// method are contained within and finally ensures all caveat conditions are
// met. A non-nil error is returned if any of the checks fail.
//
// NOTE: This is part of the lnd.ExternalValidator interface.
func (g *LightningTerminal) ValidateMacaroon(ctx context.Context,
	requiredPermissions []bakery.Op, fullMethod string) error {

	// If the URL being queried has been whitelisted, then no macaroon
	// validation is required for the query.
	if g.permsMgr.IsWhiteListedURL(fullMethod) {
		return nil
	}

	macHex, err := macaroons.RawMacaroonFromContext(ctx)
	if err != nil {
		return err
	}

	// If we're using a super macaroon, we just make sure it is valid and
	// contains all the permissions needed. If we get to this point, we're
	// either in integrated lnd mode where this is the only macaroon
	// validation function, and we're done after the check. Or we're in
	// remote lnd mode but the request is for an in-process daemon which we
	// can validate here. Any request for a remote sub-daemon goes through
	// the proxy and its director and any super macaroon will be converted
	// to a daemon specific macaroon before directing the call to the remote
	// daemon. Those calls don't land here.
	if session.IsSuperMacaroon(macHex) {
		macBytes, err := hex.DecodeString(macHex)
		if err != nil {
			return err
		}

		return g.validateSuperMacaroon(
			ctx, macBytes, requiredPermissions, fullMethod,
		)
	}

	// Validate all macaroons for services that are running in the local
	// process. Calls that we proxy to a remote host don't need to be
	// checked as they'll have their own interceptor.
	handledBySubserver, err := g.subServerMgr.ValidateMacaroon(
		ctx, requiredPermissions, fullMethod,
	)
	if handledBySubserver {
		return err
	}

	if g.permsMgr.IsSubServerURI(subservers.LIT, fullMethod) {
		if !g.macaroonServiceStarted {
			return fmt.Errorf("the macaroon service has not " +
				"started yet")
		}

		if err := g.macaroonService.ValidateMacaroon(
			ctx, requiredPermissions, fullMethod,
		); err != nil {
			return &proxyErr{
				proxyContext: "lit",
				wrapped: fmt.Errorf("invalid macaroon: %w",
					err),
			}
		}
	}

	// Because lnd will spin up its own gRPC server with macaroon
	// interceptors if it is running in this process, it will check its
	// macaroons there. If lnd is running remotely, that process will check
	// the macaroons. So we don't need to worry about anything other than
	// the subservers that are running in the local process.
	return nil
}

// Permissions returns all permissions for which the external validator of the
// terminal is responsible.
//
// NOTE: This is part of the lnd.ExternalValidator interface.
func (g *LightningTerminal) Permissions() map[string][]bakery.Op {
	return g.permsMgr.GetLitPerms()
}

// BuildWalletConfig is responsible for creating or unlocking and then
// fully initializing a wallet.
//
// NOTE: This is only implemented in order for us to intercept the setup call
// and store a reference to the interceptor chain.
//
// NOTE: This is part of the lnd.WalletConfigBuilder interface.
func (g *LightningTerminal) BuildWalletConfig(ctx context.Context,
	dbs *lnd.DatabaseInstances, interceptorChain *rpcperms.InterceptorChain,
	grpcListeners []*lnd.ListenerWithSignal) (*chainreg.PartialChainControl,
	*btcwallet.Config, func(), error) {

	g.lndInterceptorChain = interceptorChain

	return g.defaultImplCfg.WalletConfigBuilder.BuildWalletConfig(
		ctx, dbs, interceptorChain, grpcListeners,
	)
}

// shutdownSubServers stops all subservers that were started and attached to
// lnd.
func (g *LightningTerminal) shutdownSubServers() error {
	var returnErr error

	err := g.subServerMgr.Stop()
	if err != nil {
		returnErr = err
	}

	if g.autopilotClient != nil {
		g.autopilotClient.Stop()
	}

	if g.sessionRpcServerStarted {
		if err := g.sessionRpcServer.stop(); err != nil {
			log.Errorf("Error closing session DB: %v", err)
			returnErr = err
		}
	}

	if g.macaroonServiceStarted {
		if err := g.macaroonService.Stop(); err != nil {
			log.Errorf("Error stopping macaroon service: %v", err)
			returnErr = err
		}
	}

	if g.macaroonDB != nil {
		g.macaroonDB.Close()
	}

	if g.accountServiceStarted {
		if err := g.accountService.Stop(); err != nil {
			log.Errorf("Error stopping account service: %v", err)
			returnErr = err
		}
	}

	if g.middlewareStarted {
		g.middleware.Stop()
	}

	if g.firewallDB != nil {
		if err := g.firewallDB.Close(); err != nil {
			log.Errorf("Error closing rules DB: %v", err)
			returnErr = err
		}
	}

	if g.ruleMgrs != nil {
		if err := g.ruleMgrs.Stop(); err != nil {
			log.Errorf("Error stopping rule manager set: %v", err)
			returnErr = err
		}
	}

	if g.lndClient != nil {
		g.lndClient.Close()
	}

	if g.restCancel != nil {
		g.restCancel()
	}

	if g.lndConn != nil {
		if err := g.lndConn.Close(); err != nil {
			log.Errorf("Error closing lnd connection: %v", err)
			returnErr = err
		}
	}

	if g.rpcProxy != nil {
		if err := g.rpcProxy.Stop(); err != nil {
			log.Errorf("Error stopping rpc proxy: %v", err)
			returnErr = err
		}
	}

	if g.httpServer != nil {
		if err := g.httpServer.Close(); err != nil {
			log.Errorf("Error stopping UI server: %v", err)
			returnErr = err
		}
	}

	// Do we have any last errors to display? We use an anonymous function,
	// so we can use return instead of breaking to a label in the default
	// case.
	func() {
		for {
			select {
			case err := <-g.errQueue.ChanOut():
				if err != nil {
					log.Errorf("Error while stopping "+
						"litd: %v", err)
					returnErr = err
				}
			default:
				return
			}
		}
	}()
	return returnErr
}

// startMainWebServer creates the main web HTTP server that delegates requests
// between the embedded HTTP server and the RPC proxy. An incoming request will
// go through the following chain of components:
//
//	Request on port 8443       <------------------------------------+
//	    |                                 converted gRPC request    |
//	    v                                                           |
//	+---+----------------------+ other  +----------------+          |
//	| Main web HTTP server     +------->+ Embedded HTTP  |          |
//	+---+----------------------+____+   +----------------+          |
//	    |                           |                               |
//	    v any RPC or grpc-web call  |  any REST call                |
//	+---+----------------------+    |->+----------------+           |
//	| grpc-web proxy           |       + grpc-gateway   +-----------+
//	+---+----------------------+       +----------------+
//	    |
//	    v native gRPC call with basic auth
//	+---+----------------------+
//	| interceptors             |
//	+---+----------------------+
//	    |
//	    v native gRPC call with macaroon
//	+---+----------------------+
//	| gRPC server              |
//	+---+----------------------+
//	    |
//	    v unknown authenticated call, gRPC server is just a wrapper
//	+---+----------------------+
//	| director                 |
//	+---+----------------------+
//	    |
//	    v authenticated call
//	+---+----------------------+ call to lnd or integrated daemon
//	| lnd (remote or local)    +---------------+
//	| faraday remote           |               |
//	| loop remote              |    +----------v----------+
//	| pool remote              |    | lnd local subserver |
//	+--------------------------+    |  - faraday          |
//	                                |  - loop             |
//	                                |  - pool             |
//	                                +---------------------+
func (g *LightningTerminal) startMainWebServer() error {
	// Initialize the in-memory file server from the content compiled by
	// the go:embed directive. Since everything's relative to the root dir,
	// we need to create an FS of the sub directory app/build.
	buildDir, err := fs.Sub(appBuildFS, appFilesDir)
	if err != nil {
		return err
	}
	staticFileServer := http.FileServer(&ClientRouteWrapper{
		assets: http.FS(buildDir),
	})

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

		// REST requests aren't that easy to identify, we have to look
		// at the URL itself. If this is a REST request, we give it
		// directly to our REST handler which will then forward it to
		// us again but converted to a gRPC request.
		if g.cfg.EnableREST && isRESTRequest(req) {
			log.Infof("Handling REST request: %s", req.URL.Path)
			g.restHandler.ServeHTTP(resp, req)

			return
		}

		// If the UI is disabled, then we return a 401 here to prevent
		// serving any of the static files.
		if g.cfg.DisableUI {
			resp.WriteHeader(http.StatusUnauthorized)

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
		// To make sure that long-running calls and indefinitely opened
		// streaming connections aren't terminated by the internal
		// proxy, we need to disable all timeouts except the one for
		// reading the HTTP headers. That timeout shouldn't be removed
		// as we would otherwise be prone to the slowloris attack where
		// an attacker takes too long to send the headers and uses up
		// connections that way. Once the headers are read, we either
		// know it's a static resource and can deliver that very cheaply
		// or check the authentication for other calls.
		WriteTimeout:      0,
		IdleTimeout:       0,
		ReadTimeout:       0,
		ReadHeaderTimeout: defaultServerTimeout,
		Handler:           http.HandlerFunc(httpHandler),
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

	// We only enable an additional HTTP only listener if the user
	// explicitly sets a value.
	if g.cfg.HTTPListen != "" {
		insecureListener, err := net.Listen("tcp", g.cfg.HTTPListen)
		if err != nil {
			return fmt.Errorf("unable to listen on %v: %v",
				g.cfg.HTTPListen, err)
		}

		g.wg.Add(1)
		go func() {
			defer g.wg.Done()

			log.Infof("Listening for http on: %v",
				insecureListener.Addr())
			err := g.httpServer.Serve(insecureListener)
			if err != nil && err != http.ErrServerClosed {
				log.Errorf("http server error: %v", err)
			}
		}()
	}

	return nil
}

// createRESTProxy creates a grpc-gateway based REST proxy that takes any call
// identified as a REST call, converts it to a gRPC request and forwards it to
// our local main server for further triage/forwarding.
func (g *LightningTerminal) createRESTProxy() error {
	// The default JSON marshaler of the REST proxy only sets OrigName to
	// true, which instructs it to use the same field names as specified in
	// the proto file and not switch to camel case. What we also want is
	// that the marshaler prints all values, even if they are falsey.
	customMarshalerOption := restProxy.WithMarshalerOption(
		restProxy.MIMEWildcard, &restProxy.JSONPb{
			MarshalOptions: protojson.MarshalOptions{
				UseProtoNames:   true,
				EmitUnpopulated: true,
			},
		},
	)

	// For our REST dial options, we increase the max message size that
	// we'll decode to allow clients to hit endpoints which return more data
	// such as the DescribeGraph call. We set this to 200MiB atm. Should be
	// the same value as maxMsgRecvSize in lnd/cmd/lncli/main.go.
	restDialOpts := []grpc.DialOption{
		// We are forwarding the requests directly to the address of our
		// own local listener. To not need to mess with the TLS
		// certificate (which might be tricky if we're using Let's
		// Encrypt), we just skip the certificate verification.
		// Injecting a malicious hostname into the listener address will
		// result in an error on startup so this should be quite safe.
		grpc.WithTransportCredentials(credentials.NewTLS(
			&tls.Config{InsecureSkipVerify: true},
		)),
		grpc.WithDefaultCallOptions(
			grpc.MaxCallRecvMsgSize(1 * 1024 * 1024 * 200),
		),
	}

	// We use our own RPC listener as the destination for our REST proxy.
	// If the listener is set to listen on all interfaces, we replace it
	// with localhost, as we cannot dial it directly.
	restProxyDest := toLocalAddress(g.cfg.HTTPSListen)

	// Now start the REST proxy for our gRPC server above. We'll ensure
	// we direct LND to connect to its loopback address rather than a
	// wildcard to prevent certificate issues when accessing the proxy
	// externally.
	restMux := restProxy.NewServeMux(customMarshalerOption)
	ctx, cancel := context.WithCancel(context.Background())
	g.restCancel = cancel

	// Enable WebSocket and CORS support as well. A request will pass
	// through the following chain:
	// req ---> CORS handler --> WS proxy ---> REST proxy --> gRPC endpoint
	// where gRPC endpoint is our main HTTP(S) listener again.
	restHandler := lnrpc.NewWebSocketProxy(
		restMux, log, g.cfg.Lnd.WSPingInterval, g.cfg.Lnd.WSPongWait,
		lnrpc.LndClientStreamingURIs,
	)
	g.restHandler = allowCORS(restHandler, g.cfg.RestCORS)

	// First register all lnd handlers. This will make it possible to speak
	// REST over the main RPC listener port in both remote and integrated
	// mode. In integrated mode the user can still use the --lnd.restlisten
	// to spin up an extra REST listener that also offers the same
	// functionality, but is no longer required. In remote mode REST will
	// only be enabled on the main HTTP(S) listener.
	for _, registrationFn := range lndRESTRegistrations {
		err := registrationFn(ctx, restMux, restProxyDest, restDialOpts)
		if err != nil {
			return fmt.Errorf("error registering REST handler: %v",
				err)
		}
	}

	// Now register all handlers for faraday, loop and pool.
	err := g.RegisterRestSubserver(
		ctx, restMux, restProxyDest, restDialOpts,
	)
	if err != nil {
		return fmt.Errorf("error registering REST handler: %v", err)
	}

	return nil
}

// validateSuperMacaroon makes sure the given macaroon is a valid super macaroon
// that was issued by lnd and contains all the required permissions, even if
// the actual RPC method isn't a lnd request.
func (g *LightningTerminal) validateSuperMacaroon(ctx context.Context,
	superMacaroon []byte, requiredPermissions []bakery.Op,
	fullMethod string) error {

	// If we haven't connected to lnd yet, we can't check the super
	// macaroon. The user will need to wait a bit.
	if g.lndClient == nil {
		return fmt.Errorf("cannot validate macaroon, not yet " +
			"connected to lnd, please wait")
	}

	// Convert permissions to the form that lndClient will accept.
	permissions := make(
		[]lndclient.MacaroonPermission, len(requiredPermissions),
	)
	for idx, perm := range requiredPermissions {
		permissions[idx] = lndclient.MacaroonPermission{
			Entity: perm.Entity,
			Action: perm.Action,
		}
	}

	res, err := g.lndClient.Client.CheckMacaroonPermissions(
		ctx, superMacaroon, permissions, fullMethod,
	)
	if err != nil {
		return fmt.Errorf("lnd macaroon validation failed: %v",
			err)
	}
	if !res {
		return fmt.Errorf("macaroon is not valid")
	}

	return nil
}

// initSubServers registers the faraday and loop sub-servers with the
// subServerMgr.
func (g *LightningTerminal) initSubServers() {
	g.subServerMgr.AddServer(
		subservers.NewFaradaySubServer(
			g.cfg.Faraday, g.cfg.faradayRpcConfig,
			g.cfg.Remote.Faraday, g.cfg.faradayRemote,
		), g.cfg.FaradayMode != ModeDisable,
	)

	g.subServerMgr.AddServer(
		subservers.NewLoopSubServer(
			g.cfg.Loop, g.cfg.Remote.Loop, g.cfg.loopRemote,
		), g.cfg.LoopMode != ModeDisable,
	)

	g.subServerMgr.AddServer(
		subservers.NewPoolSubServer(
			g.cfg.Pool, g.cfg.Remote.Pool, g.cfg.poolRemote,
		), g.cfg.PoolMode != ModeDisable,
	)

	g.subServerMgr.AddServer(
		subservers.NewTaprootAssetsSubServer(
			g.cfg.TaprootAssets, g.cfg.Remote.TaprootAssets,
			g.cfg.tapRemote,
		), g.cfg.TaprootAssetsMode != ModeDisable,
	)
}

// BakeSuperMacaroon uses the lnd client to bake a macaroon that can include
// permissions for multiple daemons.
func BakeSuperMacaroon(ctx context.Context, lnd lnrpc.LightningClient,
	rootKeyID uint64, perms []bakery.Op, caveats []macaroon.Caveat) (string,
	error) {

	if lnd == nil {
		return "", errors.New("lnd not yet connected")
	}

	req := &lnrpc.BakeMacaroonRequest{
		Permissions: make(
			[]*lnrpc.MacaroonPermission, len(perms),
		),
		AllowExternalPermissions: true,
		RootKeyId:                rootKeyID,
	}
	for idx, perm := range perms {
		req.Permissions[idx] = &lnrpc.MacaroonPermission{
			Entity: perm.Entity,
			Action: perm.Action,
		}
	}

	res, err := lnd.BakeMacaroon(ctx, req)
	if err != nil {
		return "", err
	}

	mac, err := session.ParseMacaroon(res.Macaroon)
	if err != nil {
		return "", err
	}

	for _, caveat := range caveats {
		if err := mac.AddFirstPartyCaveat(caveat.Id); err != nil {
			return "", err
		}
	}

	macBytes, err := mac.MarshalBinary()
	if err != nil {
		return "", err
	}

	return hex.EncodeToString(macBytes), err
}

// allowCORS wraps the given http.Handler with a function that adds the
// Access-Control-Allow-Origin header to the response.
func allowCORS(handler http.Handler, origins []string) http.Handler {
	allowHeaders := "Access-Control-Allow-Headers"
	allowMethods := "Access-Control-Allow-Methods"
	allowOrigin := "Access-Control-Allow-Origin"

	// If the user didn't supply any origins that means CORS is disabled
	// and we should return the original handler.
	if len(origins) == 0 {
		return handler
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		// Skip everything if the browser doesn't send the Origin field.
		if origin == "" {
			handler.ServeHTTP(w, r)
			return
		}

		// Set the static header fields first.
		w.Header().Set(
			allowHeaders,
			"Content-Type, Accept, Grpc-Metadata-Macaroon",
		)
		w.Header().Set(allowMethods, "GET, POST, DELETE")

		// Either we allow all origins or the incoming request matches
		// a specific origin in our list of allowed origins.
		for _, allowedOrigin := range origins {
			if allowedOrigin == "*" || origin == allowedOrigin {
				// Only set allowed origin to requested origin.
				w.Header().Set(allowOrigin, origin)

				break
			}
		}

		// For a pre-flight request we only need to send the headers
		// back. No need to call the rest of the chain.
		if r.Method == "OPTIONS" {
			return
		}

		// Everything's prepared now, we can pass the request along the
		// chain of handlers.
		handler.ServeHTTP(w, r)
	})
}

// showStartupInfo shows useful information to the user to easily access the
// web UI that was just started.
func (g *LightningTerminal) showStartupInfo() error {
	info := struct {
		mode    string
		status  string
		alias   string
		version string
		webURI  string
	}{
		mode:    g.cfg.LndMode,
		status:  "locked",
		alias:   g.cfg.Lnd.Alias,
		version: build.Version(),
		webURI: fmt.Sprintf("https://%s", strings.ReplaceAll(
			strings.ReplaceAll(
				g.cfg.HTTPSListen, "0.0.0.0", "localhost",
			), "[::]", "localhost",
		)),
	}

	// In remote mode we try to query the info.
	if g.cfg.LndMode == ModeRemote {
		// We try to query GetInfo on the remote node to find out the
		// alias. But the wallet might be locked.
		host, network, tlsPath, macPath, _ := g.cfg.lndConnectParams()
		basicClient, err := lndclient.NewBasicClient(
			host, tlsPath, filepath.Dir(macPath), string(network),
			lndclient.MacFilename(filepath.Base(macPath)),
		)
		if err != nil {
			return fmt.Errorf("error querying remote node: %v", err)
		}

		ctx := context.Background()
		res, err := basicClient.GetInfo(ctx, &lnrpc.GetInfoRequest{})
		if err != nil {
			if !lndclient.IsUnlockError(err) {
				return fmt.Errorf("error querying remote "+
					"node : %v", err)
			}

			// Node is locked.
			info.status = "locked"
			info.alias = "???? (node is locked)"
			info.version = "???? (node is locked)"
		} else {
			info.status = "online"
			info.alias = res.Alias
			info.version = res.Version
		}
	}

	// In integrated mode, we can derive the state from our configuration.
	if g.cfg.LndMode == ModeIntegrated {
		// If the integrated node is running with no seed backup, the
		// wallet cannot be locked and the node is online right away.
		if g.cfg.Lnd.NoSeedBackup {
			info.status = "online"
		}
	}

	// If there's an additional HTTP listener, list it as well.
	listenAddr := g.cfg.HTTPSListen
	if g.cfg.HTTPListen != "" {
		host := toLocalAddress(g.cfg.HTTPListen)
		info.webURI = fmt.Sprintf("%s or http://%s", info.webURI, host)
		listenAddr = fmt.Sprintf("%s, %s", listenAddr, g.cfg.HTTPListen)
	}

	webInterfaceString := fmt.Sprintf(
		"%s (open %s in your browser)", listenAddr, info.webURI,
	)
	if g.cfg.DisableUI {
		webInterfaceString = "disabled"
	}

	str := "" +
		"----------------------------------------------------------\n" +
		" Lightning Terminal (LiT) by Lightning Labs               \n" +
		"                                                          \n" +
		" LND Operating mode      %s                               \n" +
		" LND Node status         %s                               \n" +
		" LND Alias               %s                               \n" +
		" LND Version             %s                               \n" +
		" LiT Version             %s                               \n" +
		" Web interface           %s  			           \n" +
		"----------------------------------------------------------\n"
	fmt.Printf(str, info.mode, info.status, info.alias, info.version,
		Version(), webInterfaceString)

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
	localName := name

	// The file prefix can be overwritten during build time.
	if appFilesPrefix != "" {
		localName = strings.Replace(name, appFilesPrefix, "/", 1)
	}
	localName = strings.ReplaceAll(localName, "//", "/")
	ret, err := i.assets.Open(localName)
	if !os.IsNotExist(err) || filepath.Ext(localName) != "" {
		return ret, err
	}

	return i.assets.Open("/index.html")
}

// toLocalAddress converts an address that is meant as a wildcard listening
// address ("0.0.0.0" or "[::]") into an address that can be dialed (localhost).
func toLocalAddress(listenerAddress string) string {
	addr := strings.ReplaceAll(listenerAddress, "0.0.0.0", "localhost")
	return strings.ReplaceAll(addr, "[::]", "localhost")
}

// isRESTRequest determines if a request is a REST request by checking that the
// URI starts with /vX/ where X is a single digit number. This is currently true
// for all REST URIs of lnd, faraday, loop and pool as they all either start
// with /v1/ or /v2/.
func isRESTRequest(req *http.Request) bool {
	return patternRESTRequest.MatchString(req.URL.Path)
}
