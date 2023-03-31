//go:build mobile
// +build mobile

package litdmobile

import (
	"context"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync/atomic"

	flags "github.com/jessevdk/go-flags"
	"github.com/lightningnetwork/lnd"
	"github.com/lightningnetwork/lnd/lnrpc/verrpc"
	"github.com/lightningnetwork/lnd/signal"
	"google.golang.org/grpc"

	"github.com/lightninglabs/lndclient"
	"github.com/lightninglabs/loop/loopd"
	"github.com/lightninglabs/pool"
)

// litdStarted will be used atomically to ensure only a single lnd instance is
// attempted to be started at once.
var litdStarted int32

// Start starts lnd in a new goroutine.
//
// extraArgs can be used to pass command line arguments to lnd that will
// override what is found in the config file. Example:
//
//	extraArgs = "--bitcoin.testnet --lnddir=\"/tmp/folder name/\" --profile=5050"
//
// The rpcReady is called lnd is ready to accept RPC calls.
//
// NOTE: On mobile platforms the '--lnddir` argument should be set to the
// current app directory in order to ensure lnd has the permissions needed to
// write to it.
func Start(extraArgs string, rpcReady Callback) {
	// We only support a single lnd instance at a time (singleton) for now,
	// so we make sure to return immediately if it has already been
	// started.
	if !atomic.CompareAndSwapInt32(&litdStarted, 0, 1) {
		err := errors.New("lnd already started")
		rpcReady.OnError(err)
		return
	}

	// (Re-)initialize the in-mem gRPC listeners we're going to give to lnd.
	// This is required each time lnd is started, because when lnd shuts
	// down, the in-mem listeners are closed.
	RecreateListeners()

	// Split the argument string on "--" to get separated command line
	// arguments.
	var splitArgs []string
	for _, a := range strings.Split(extraArgs, "--") {
		// Trim any whitespace space, and ignore empty params.
		a := strings.TrimSpace(a)
		if a == "" {
			continue
		}

		// Finally we prefix any non-empty string with -- to mimic the
		// regular command line arguments.
		splitArgs = append(splitArgs, "--"+a)
	}

	// Add the extra arguments to os.Args, as that will be parsed in
	// LoadConfig below.
	os.Args = append(os.Args, splitArgs...)

	// Hook interceptor for os signals.
	shutdownInterceptor, err := signal.Intercept()
	if err != nil {
		atomic.StoreInt32(&litdStarted, 0)
		_, _ = fmt.Fprintln(os.Stderr, err)
		rpcReady.OnError(err)
		return
	}

	// Load the configuration, and parse the extra arguments as command
	// line options. This function will also set up logging properly.
	loadedConfig, err := lnd.LoadConfig(shutdownInterceptor)
	if err != nil {
		atomic.StoreInt32(&litdStarted, 0)
		_, _ = fmt.Fprintln(os.Stderr, err)
		rpcReady.OnError(err)
		return
	}

	// Set a channel that will be notified when the RPC server is ready to
	// accept calls.
	var (
		rpcListening = make(chan struct{})
		quit         = make(chan struct{})
	)

	// We call the main method with the custom in-memory listener called by
	// the mobile APIs, such that the grpc server will use it.
	lisCfg := lnd.ListenerCfg{
		RPCListeners: []*lnd.ListenerWithSignal{{
			Listener: lightningLis,
			Ready:    rpcListening,
		}},
	}
	implCfg := loadedConfig.ImplementationConfig(shutdownInterceptor)

	// Call the "real" main in a nested manner so the defers will properly
	// be executed in the case of a graceful shutdown.
	go func() {
		defer atomic.StoreInt32(&litdStarted, 0)
		defer close(quit)

		loadedConfig, err := lnd.LoadConfig(shutdownInterceptor)
		if err != nil {
			fmt.Errorf("could not load lnd config: %w", err)
			return
		}

		loopConf := loopd.DefaultConfig()
		poolConf := pool.DefaultConfig()

		loopServer := loopd.New(&loopConf, nil)
		poolServer := pool.NewServer(&poolConf)

		err = lnd.Main(
			loadedConfig, lisCfg, implCfg, shutdownInterceptor,
		)
		if err != nil {
			fmt.Errorf("error starting lnd: %w", err)
			return
		}

		macChan := make(chan []byte, 1)

		// We'll need to wait for lnd to send the acaroon after unlock before
		// going any further.
		<-rpcListening
		macData := <-macChan

		ctxc, cancel := context.WithCancel(context.Background())
		defer cancel()

		// lndClient + basicClient conf
		host := "localhost"
		network := lndclient.Network("mainnet")
		tlsPath := ""
		macPath := ""
		insecure := false

		lndClient, err := lndclient.NewLndServices(
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
				CheckVersion: &verrpc.Version{
					AppMajor: 0,
					AppMinor: 15,
					AppPatch: 4,
					BuildTags: []string{
						"signrpc", "walletrpc", "chainrpc", "invoicesrpc",
					},
				},
			},
		)
		if err != nil {
			fmt.Errorf("could not set up lnd client: %w", err)
			return
		}

		basicClient, err := lndclient.NewBasicClient(
			host, tlsPath, filepath.Dir(macPath), string(network),
			nil,
		)
		if err != nil {
			fmt.Errorf("could not set up lnd basic client: %w", err)
			return
		}

		// loop + pool server conf
		createDefaultMacaroons := true

		err = loopServer.StartAsSubserver(
			lndClient, createDefaultMacaroons,
		)

		err = poolServer.StartAsSubserver(
			basicClient, lndClient, createDefaultMacaroons,
		)

		if err != nil {
			if e, ok := err.(*flags.Error); ok &&
				e.Type == flags.ErrHelp {
			} else {
				fmt.Fprintln(os.Stderr, err)
			}
			rpcReady.OnError(err)
			return
		}
	}()

	// By default we'll apply the admin auth options, which will include
	// macaroons.
	setDefaultDialOption(
		func() ([]grpc.DialOption, error) {
			return lnd.AdminAuthOptions(loadedConfig, false)
		},
	)

	// For the WalletUnlocker and StateService, the macaroons might not be
	// available yet when called, so we use a more restricted set of
	// options that don't include them.
	setWalletUnlockerDialOption(
		func() ([]grpc.DialOption, error) {
			return lnd.AdminAuthOptions(loadedConfig, true)
		},
	)
	setStateDialOption(
		func() ([]grpc.DialOption, error) {
			return lnd.AdminAuthOptions(loadedConfig, true)
		},
	)

	// Finally we start a go routine that will call the provided callback
	// when the RPC server is ready to accept calls.
	go func() {
		select {
		case <-rpcListening:
		case <-quit:
			return
		}

		rpcReady.OnResponse([]byte{})
	}()
}
