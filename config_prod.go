//go:build !dev

package terminal

import (
	"path/filepath"

	"github.com/lightninglabs/lightning-terminal/accounts"
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

// NewAccountStore creates a new account store using the default Bolt backend
// since in production, this is the only backend supported currently.
func NewAccountStore(cfg *Config, clock clock.Clock) (accounts.Store, error) {
	return accounts.NewBoltStore(
		filepath.Dir(cfg.MacaroonPath), accounts.DBFilename, clock,
	)
}
