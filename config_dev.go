//go:build dev

package terminal

import (
	"path/filepath"

	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightningnetwork/lnd/clock"
)

// DevConfig is a struct that holds the configuration options for a development
// environment. The purpose of this struct is to hold config options for
// features not yet available in production. Since our itests are built with
// the dev tag, we can test these features in our itests.
//
// nolint:lll
type DevConfig struct {
}

// Validate checks that all the values set in our DevConfig are valid and uses
// the passed parameters to override any defaults if necessary.
func (c *DevConfig) Validate(dbDir, network string) error {
	return nil
}

// defaultDevConfig returns a new DevConfig with default values set.
func defaultDevConfig() *DevConfig {
	return &DevConfig{}
}

// NewAccountStore creates a new account store based on the chosen database
// backend.
func NewAccountStore(cfg *Config, clock clock.Clock) (accounts.Store, error) {
	return accounts.NewBoltStore(
		filepath.Dir(cfg.MacaroonPath), accounts.DBFilename, clock,
	)
}
