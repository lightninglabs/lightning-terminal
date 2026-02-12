package firewall

// Config holds all config options for the firewall.
//
//nolint:ll
type Config struct {
	RequestLogger *RequestLoggerConfig `group:"request-logger" namespace:"request-logger" description:"request logger settings"`
}

// RequestLoggerConfig holds all the config options for the request logger.
//
//nolint:ll
type RequestLoggerConfig struct {
	// Disable completely disables request logging. This option exists as a
	// separate flag rather than a log level because there are scenarios
	// where logging should be entirely skipped (no interceptor, no
	// database writes) rather than just filtered. Disabling improves
	// performance by avoiding all logging overhead, whereas a log level
	// would still process and filter each request.
	Disable            bool               `long:"disable" description:"Disable request logging completely. If set, autopilot.disable must also be set"`
	RequestLoggerLevel RequestLoggerLevel `long:"level" description:"Set the request logger level. Options include 'all', 'full' and 'interceptor''"`
}

// DefaultConfig constructs the default firewall Config struct.
func DefaultConfig() *Config {
	return &Config{
		RequestLogger: &RequestLoggerConfig{
			Disable:            false,
			RequestLoggerLevel: RequestLoggerLevelInterceptor,
		},
	}
}
