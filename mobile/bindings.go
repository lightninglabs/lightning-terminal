//go:build mobile
// +build mobile

package litdmobile

import (
	"errors"
	"fmt"
	"os"
	"strings"
	"sync/atomic"

	"github.com/jessevdk/go-flags"
	terminal "github.com/lightninglabs/lightning-terminal"
	"github.com/lightningnetwork/lnd"
	"google.golang.org/grpc"
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
	// We only support a single litd instance at a time (singleton) for now,
	// so we make sure to return immediately if it has already been
	// started.
	if !atomic.CompareAndSwapInt32(&litdStarted, 0, 1) {
		err := errors.New("litd already started")
		rpcReady.OnError(err)
		return
	}

	// (Re-)initialize the in-mem gRPC listeners we're going to give to lnd.
	// This is required each time lnd is started, because when lnd shuts
	// down, the in-mem listeners are closed.
	RecreateListeners()

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

	var (
		rpcListening = make(chan struct{})
		term         *terminal.LightningTerminal
	)
	go func() {
		term = terminal.New(lightningLis, rpcListening)
		err := term.Run()
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

	// By this point, we should be started, call rpcReady
	go func() {
		select {
		case <-rpcListening:
			cfg := term.GetConfig()
			adminMacCfg := &lnd.Config{
				TLSCertPath:  cfg.TLSCertPath,
				NoMacaroons:  false,
				AdminMacPath: cfg.Lnd.AdminMacPath,
			}
			proxyCfg := &lnd.Config{}
			swapCfg := &lnd.Config{
				TLSCertPath:  cfg.Loop.TLSCertPath,
				AdminMacPath: cfg.Loop.MacaroonPath,
			}
			poolCfg := &lnd.Config{
				TLSCertPath:  cfg.Pool.TLSCertPath,
				AdminMacPath: cfg.Pool.MacaroonPath,
			}
			// By default we'll apply the admin auth options, which will include
			// macaroons.
			setDefaultDialOption(
				func() ([]grpc.DialOption, error) {
					return lnd.AdminAuthOptions(adminMacCfg, false)
				},
			)
			// For WalletUnlocker, StateService, and Proxy, the macaroons might not be
			// available yet when called, so we use a more restricted set of
			// options that don't include them.
			setWalletUnlockerDialOption(
				func() ([]grpc.DialOption, error) {
					return lnd.AdminAuthOptions(adminMacCfg, true)
				},
			)
			setStateDialOption(
				func() ([]grpc.DialOption, error) {
					return lnd.AdminAuthOptions(adminMacCfg, true)
				},
			)
			setProxyDialOption(
				func() ([]grpc.DialOption, error) {
					return lnd.AdminAuthOptions(proxyCfg, true)
				},
			)
			setSwapClientDialOption(
				func() ([]grpc.DialOption, error) {
					return lnd.AdminAuthOptions(swapCfg, true)
				},
			)
			setTraderDialOption(
				func() ([]grpc.DialOption, error) {
					return lnd.AdminAuthOptions(poolCfg, true)
				},
			)
		}
		rpcReady.OnResponse([]byte{})
	}()
}
