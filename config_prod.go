//go:build !dev

package terminal

import (
	"context"
	"fmt"
	"path/filepath"

	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/firewalldb"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/lnrpc"
)

// DevConfig is an empty shell struct that allows us to build without the dev
// tag. This struct is embedded in the main Config struct, and it adds no new
// functionality in a production build.
type DevConfig struct{}

// defaultDevConfig returns an empty DevConfig struct.
func defaultDevConfig() *DevConfig {
	return &DevConfig{}
}

// Validate is a no-op function during a production build.
func (c *DevConfig) Validate(_, _ string) error {
	return nil
}

// NewStores creates a new instance of the stores struct using the default Bolt
// backend since in production, this is currently the only backend supported.
func NewStores(_ context.Context, cfg *Config,
	_ lnrpc.LightningClient, clock clock.Clock) (*stores, error) {

	networkDir := filepath.Join(cfg.LitDir, cfg.Network)

	stores := &stores{
		closeFns: make(map[string]func() error),
	}

	acctStore, err := accounts.NewBoltStore(
		filepath.Dir(cfg.MacaroonPath), accounts.DBFilename, clock,
	)
	if err != nil {
		return stores, err
	}
	stores.accounts = acctStore
	stores.closeFns["accounts"] = acctStore.Close

	sessStore, err := session.NewDB(
		networkDir, session.DBFilename, clock, acctStore,
	)
	if err != nil {
		return stores, fmt.Errorf("error creating session BoltStore: "+
			"%v", err)
	}
	stores.sessions = sessStore
	stores.closeFns["sessions"] = sessStore.Close

	firewallDB, err := firewalldb.NewBoltDB(
		networkDir, firewalldb.DBFilename, stores.sessions,
		stores.accounts, clock,
	)
	if err != nil {
		return stores, fmt.Errorf("error creating firewall DB: %v", err)
	}
	stores.firewall = firewalldb.NewDB(firewallDB)
	stores.closeFns["firewall"] = firewallDB.Close

	return stores, nil
}
