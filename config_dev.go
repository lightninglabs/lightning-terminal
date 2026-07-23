//go:build dev

package terminal

import (
	"time"

	"github.com/lightninglabs/lightning-terminal/firewall"
)

// DevConfig is a struct that holds the configuration options for a development
// environment. The purpose of this struct is to hold config options for
// features not yet available in production. Since our itests are built with
// the dev tag, we can test these features in our itests.
//
// nolint:ll
type DevConfig struct {
	// PrivacyTimestampVariation sets the amount of variation for timestamp
	// obfuscation in privacy mapping. This defines how much timestamps can
	// be randomly shifted (±variation) to protect privacy.
	PrivacyTimestampVariation time.Duration `long:"privacy-timestamp-variation" description:"The amount of random uniform variation for timestamp obfuscation in privacy mapping (e.g., 5m for ±5 minutes)."`
}

// defaultDevConfig returns a new DevConfig with default values set.
func defaultDevConfig() *DevConfig {
	return &DevConfig{
		PrivacyTimestampVariation: firewall.DefaultTimeVariation,
	}
}

// Validate checks that all the values set in our DevConfig are valid and uses
// the passed parameters to override any defaults if necessary.
func (c *DevConfig) Validate(cfg *Config) error {
	// Apply development overrides.
	if c.PrivacyTimestampVariation != 0 {
		cfg.PrivacyTimestampVariation = c.PrivacyTimestampVariation
	}

	return nil
}
