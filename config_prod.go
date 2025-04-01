//go:build !dev

package terminal

import (
	"fmt"
	"path/filepath"

	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/firewalldb"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/clock"
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
func NewStores(cfg *Config, clock clock.Clock) (*stores, error) {
	networkDir := filepath.Join(cfg.LitDir, cfg.Network)

	acctStore, err := accounts.NewBoltStore(
		filepath.Dir(cfg.MacaroonPath), accounts.DBFilename, clock,
	)
	if err != nil {
		return nil, err
	}

	sessStore, err := session.NewDB(
		networkDir, session.DBFilename, clock, acctStore,
	)
	if err != nil {
		return nil, fmt.Errorf("error creating session BoltStore: %v",
			err)
	}

	firewallDB, err := firewalldb.NewBoltDB(
		networkDir, firewalldb.DBFilename, sessStore,
	)
	if err != nil {
		return nil, fmt.Errorf("error creating firewall DB: %v", err)
	}

	return &stores{
		accounts:     acctStore,
		sessions:     sessStore,
		firewallBolt: firewallDB,
		firewall:     firewalldb.NewDB(firewallDB),
		close: func() error {
			var returnErr error
			if err := acctStore.Close(); err != nil {
				returnErr = fmt.Errorf("error closing "+
					"account store: %v", err)

				log.Error(returnErr.Error())
			}
			if err := sessStore.Close(); err != nil {
				returnErr = fmt.Errorf("error closing "+
					"session store: %v", err)

				log.Error(returnErr.Error())
			}
			if err := firewallDB.Close(); err != nil {
				returnErr = fmt.Errorf("error closing "+
					"firewall DB: %v", err)

				log.Error(returnErr.Error())
			}

			return returnErr
		},
	}, nil
}
