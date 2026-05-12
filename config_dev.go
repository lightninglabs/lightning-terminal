//go:build dev

package terminal

// DevConfig is a struct that holds the configuration options for a development
// environment. The purpose of this struct is to hold config options for
// features not yet available in production. Since our itests are built with
// the dev tag, we can test these features in our itests.
//
// nolint:ll
type DevConfig struct{}

// defaultDevConfig returns a new DevConfig with default values set.
func defaultDevConfig() *DevConfig {
	return &DevConfig{}
}

// Validate checks that all the values set in our DevConfig are valid.
func (c *DevConfig) Validate() error {
	return nil
}
