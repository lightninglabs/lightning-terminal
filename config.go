package shushtar

import (
	"crypto/tls"
	"fmt"
	"net"
	"os"
	"path/filepath"
	"strings"

	"github.com/jessevdk/go-flags"
	"github.com/lightninglabs/faraday"
	"github.com/lightninglabs/loop/loopd"
	"github.com/lightningnetwork/lnd"
	"github.com/lightningnetwork/lnd/build"
	"github.com/lightningnetwork/lnd/cert"
	"github.com/lightningnetwork/lnd/lncfg"
	"github.com/mwitkow/go-conntrack/connhelpers"
)

// Config is the main configuration struct of shushtar. It contains all config
// items of its enveloping subservers, each prefixed with their daemon's short
// name.
type Config struct {
	HTTPSListen string          `long:"httpslisten" description:"host:port to listen for incoming HTTP/2 connections on"`
	Lnd         *lnd.Config     `group:"lnd" namespace:"lnd"`
	Faraday     *faraday.Config `group:"faraday" namespace:"faraday"`
	Loop        *loopd.Config   `group:"loop" namespace:"loop"`
}

// loadLndConfig loads and sanitizes the lnd main configuration and hooks up all
// loggers.
func loadLndConfig(preCfg *Config) (*lnd.Config, error) {
	// Show the version and exit if the version flag was specified.
	appName := filepath.Base(os.Args[0])
	appName = strings.TrimSuffix(appName, filepath.Ext(appName))
	usageMessage := fmt.Sprintf("Use %s -h to show usage", appName)
	if preCfg.Lnd.ShowVersion {
		fmt.Println(appName, "version", build.Version(),
			"commit="+build.Commit)
		os.Exit(0)
	}

	// If the config file path has not been modified by the user, then we'll
	// use the default config file path. However, if the user has modified
	// their lnddir, then we should assume they intend to use the config
	// file within it.
	configFileDir := lnd.CleanAndExpandPath(preCfg.Lnd.LndDir)
	configFilePath := lnd.CleanAndExpandPath(preCfg.Lnd.ConfigFile)
	if configFileDir != lnd.DefaultLndDir {
		if configFilePath == lnd.DefaultConfigFile {
			configFilePath = filepath.Join(
				configFileDir, lncfg.DefaultConfigFilename,
			)
		}
	}

	// Next, load any additional configuration options from the file.
	var configFileError error
	cfg := preCfg
	if err := flags.IniParse(configFilePath, cfg); err != nil {
		// If it's a parsing related error, then we'll return
		// immediately, otherwise we can proceed as possibly the config
		// file doesn't exist which is OK.
		if _, ok := err.(*flags.IniError); ok {
			return nil, err
		}

		configFileError = err
	}

	// Finally, parse the remaining command line options again to ensure
	// they take precedence.
	if _, err := flags.Parse(cfg); err != nil {
		return nil, err
	}

	// Make sure everything we just loaded makes sense.
	cleanCfg, err := lnd.ValidateConfig(*cfg.Lnd, usageMessage)
	if err != nil {
		return nil, err
	}

	// With the validated config obtained, we now know that the root logging
	// system of lnd is initialized and we can hook up our own loggers now.
	SetupLoggers(cleanCfg.LogWriter)

	// Warn about missing config file only after all other configuration is
	// done. This prevents the warning on help messages and invalid options.
	// Note this should go directly before the return.
	if configFileError != nil {
		log.Warnf("%v", configFileError)
	}

	return cleanCfg, nil
}

func getNetwork(cfg *lncfg.Chain) (string, error) {
	switch {
	case cfg.MainNet:
		return "mainnet", nil

	case cfg.TestNet3:
		return "testnet", nil

	case cfg.RegTest:
		return "regtest", nil

	case cfg.SimNet:
		return "simnet", nil

	default:
		return "", fmt.Errorf("no network selected")
	}
}

func buildTLSConfigForHttp2(config *lnd.Config) (*tls.Config, error) {
	tlsCert, _, err := cert.LoadCert(config.TLSCertPath, config.TLSKeyPath)
	if err != nil {
		return nil, fmt.Errorf("failed reading TLS server keys: %v",
			err)
	}
	tlsConfig := cert.TLSConfFromCert(tlsCert)
	tlsConfig.CipherSuites = append(
		tlsConfig.CipherSuites,
		tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
	)
	tlsConfig, err = connhelpers.TlsConfigWithHttp2Enabled(tlsConfig)
	if err != nil {
		return nil, fmt.Errorf("can't configure h2 handling: %v", err)
	}
	return tlsConfig, nil
}

// onDemandListener is a net.Listener that only actually starts to listen on a
// network port once the Accept method is called.
type onDemandListener struct {
	addr net.Addr
	lis  net.Listener
}

// Accept waits for and returns the next connection to the listener.
func (l *onDemandListener) Accept() (net.Conn, error) {
	if l.lis == nil {
		var err error
		l.lis, err = net.Listen(parseNetwork(l.addr), l.addr.String())
		if err != nil {
			return nil, err
		}
	}
	return l.lis.Accept()
}

// Close closes the listener.
// Any blocked Accept operations will be unblocked and return errors.
func (l *onDemandListener) Close() error {
	return l.lis.Close()
}

// Addr returns the listener's network address.
func (l *onDemandListener) Addr() net.Addr {
	return l.addr
}

// parseNetwork parses the network type of the given address.
func parseNetwork(addr net.Addr) string {
	switch addr := addr.(type) {
	// TCP addresses resolved through net.ResolveTCPAddr give a default
	// network of "tcp", so we'll map back the correct network for the given
	// address. This ensures that we can listen on the correct interface
	// (IPv4 vs IPv6).
	case *net.TCPAddr:
		if addr.IP.To4() != nil {
			return "tcp4"
		}
		return "tcp6"

	default:
		return addr.Network()
	}
}
