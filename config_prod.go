//go:build !dev

package terminal

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
