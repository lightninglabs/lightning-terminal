//go:build dev

package perms

import (
	"net"

	"github.com/btcsuite/btcd/chaincfg"
	"github.com/lightningnetwork/lnd/autopilot"
	"github.com/lightningnetwork/lnd/chainreg"
	graphdb "github.com/lightningnetwork/lnd/graph/db"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lnrpc/autopilotrpc"
	"github.com/lightningnetwork/lnd/lnrpc/chainrpc"
	"github.com/lightningnetwork/lnd/lnrpc/devrpc"
	"github.com/lightningnetwork/lnd/lnrpc/invoicesrpc"
	"github.com/lightningnetwork/lnd/lnrpc/neutrinorpc"
	"github.com/lightningnetwork/lnd/lnrpc/peersrpc"
	"github.com/lightningnetwork/lnd/lnrpc/routerrpc"
	"github.com/lightningnetwork/lnd/lnrpc/signrpc"
	"github.com/lightningnetwork/lnd/lnrpc/walletrpc"
	"github.com/lightningnetwork/lnd/lnrpc/watchtowerrpc"
	"github.com/lightningnetwork/lnd/lnrpc/wtclientrpc"
	"github.com/lightningnetwork/lnd/lntest/mock"
	"github.com/lightningnetwork/lnd/routing"
	"github.com/lightningnetwork/lnd/sweep"
)

// mockConfig implements lnrpc.SubServerConfigDispatcher. It provides the
// functionality required so that the lnrpc.GrpcHandler.CreateSubServer
// function can be called without panicking.
type mockConfig struct{}

var _ lnrpc.SubServerConfigDispatcher = (*mockConfig)(nil)

// FetchConfig is a mock implementation of lnrpc.SubServerConfigDispatcher. It
// is used as a parameter to lnrpc.GrpcHandler.CreateSubServer and allows the
// function to be called without panicking. This is useful because
// CreateSubServer can be used to extract the permissions required by each
// registered subserver.
//
// TODO(elle): remove this once the sub-server permission lists in LND have been
// exported
func (t *mockConfig) FetchConfig(subServerName string) (interface{}, bool) {
	switch subServerName {
	case "InvoicesRPC":
		return &invoicesrpc.Config{}, true
	case "WatchtowerClientRPC":
		return &wtclientrpc.Config{
			Resolver: func(_, _ string) (*net.TCPAddr, error) {
				return nil, nil
			},
		}, true
	case "AutopilotRPC":
		cfg := &autopilotrpc.Config{}
		setFieldIfPresent(cfg, "Manager", &autopilot.Manager{})

		return cfg, true
	case "ChainRPC":
		cfg := &chainrpc.Config{}
		setFieldIfPresent(cfg, "ChainNotifier", &chainreg.NoChainBackend{})
		setFieldIfPresent(cfg, "Chain", &mock.ChainIO{})

		return cfg, true
	case "DevRPC":
		cfg := &devrpc.Config{}
		setFieldIfPresent(cfg, "ActiveNetParams", &chaincfg.RegressionNetParams)
		setFieldIfPresent(cfg, "GraphDB", &graphdb.ChannelGraph{})

		return cfg, true
	case "NeutrinoKitRPC":
		return &neutrinorpc.Config{}, true
	case "PeersRPC":
		return &peersrpc.Config{}, true
	case "RouterRPC":
		return &routerrpc.Config{
			Router: &routing.ChannelRouter{},
		}, true
	case "SignRPC":
		cfg := &signrpc.Config{}
		setFieldIfPresent(cfg, "Signer", &mock.DummySigner{})

		return cfg, true
	case "WalletKitRPC":
		cfg := &walletrpc.Config{}
		setFieldIfPresent(cfg, "FeeEstimator", &chainreg.NoChainBackend{})
		setFieldIfPresent(cfg, "Wallet", &mock.WalletController{})
		setFieldIfPresent(cfg, "KeyRing", &mock.SecretKeyRing{})
		setFieldIfPresent(cfg, "Sweeper", &sweep.UtxoSweeper{})
		setFieldIfPresent(cfg, "Chain", &mock.ChainIO{})

		return cfg, true
	case "WatchtowerRPC":
		return &watchtowerrpc.Config{}, true
	default:
		return nil, false
	}
}
