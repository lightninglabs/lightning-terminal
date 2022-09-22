package rpcmiddleware

import "time"

const (
	// DefaultInterceptTimeout is the default maximum time we're allowed to
	// take to respond to an RPC middleware interception request.
	DefaultInterceptTimeout = time.Second * 2
)

// Config is the configuration struct for the RPC middleware.
type Config struct {
	Disabled         bool          `long:"disabled" description:"Disable the RPC middleware"`
	InterceptTimeout time.Duration `long:"intercept-timeout" description:"The maximum time the RPC middleware is allowed to take for intercepting each RPC request"`
}

// DefaultConfig returns the default RPC middleware configuration.
func DefaultConfig() *Config {
	return &Config{
		InterceptTimeout: DefaultInterceptTimeout,
	}
}
