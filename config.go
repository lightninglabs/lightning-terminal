package terminal

import (
	"crypto/tls"
	"errors"
	"fmt"
	"io/ioutil"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/jessevdk/go-flags"
	"github.com/lightninglabs/faraday"
	"github.com/lightninglabs/faraday/frdrpc"
	"github.com/lightninglabs/lndclient"
	"github.com/lightninglabs/loop/loopd"
	"github.com/lightningnetwork/lnd"
	"github.com/lightningnetwork/lnd/build"
	"github.com/lightningnetwork/lnd/cert"
	"github.com/lightningnetwork/lnd/lncfg"
	"github.com/mwitkow/go-conntrack/connhelpers"
	"golang.org/x/crypto/acme/autocert"
)

const (
	defaultHTTPSListen = "127.0.0.1:8443"

	uiPasswordMinLength = 8

	defaultLndMacaroon = "admin.macaroon"
)

var (
	lndDefaultConfig     = lnd.DefaultConfig()
	faradayDefaultConfig = faraday.DefaultConfig()
	loopDefaultConfig    = loopd.DefaultConfig()

	defaultLetsEncryptDir = "letsencrypt"
)

// Config is the main configuration struct of lightning-terminal. It contains
// all config items of its enveloping subservers, each prefixed with their
// daemon's short name.
type Config struct {
	HTTPSListen    string `long:"httpslisten" description:"host:port to listen for incoming HTTP/2 connections on"`
	UIPassword     string `long:"uipassword" description:"the password that must be entered when using the loop UI. use a strong password to protect your node from unauthorized access through the web UI"`
	UIPasswordFile string `long:"uipassword_file" description:"same as uipassword but instead of passing in the value directly, read the password from the specified file"`
	UIPasswordEnv  string `long:"uipassword_env" description:"same as uipassword but instead of passing in the value directly, read the password from the specified environment variable"`

	LetsEncrypt     bool   `long:"letsencrypt" description:"use Let's Encrypt to create a TLS certificate for the UI instead of using lnd's TLS certificate. port 80 must be free to listen on and must be reachable from the internet for this to work"`
	LetsEncryptHost string `long:"letsencrypthost" description:"the host name to create a Let's Encrypt certificate for'"`
	LetsEncryptDir  string `long:"letsencryptdir" description:"the directory where the Let's Encrypt library will store its key and certificate"`

	Lnd     *lnd.Config     `group:"lnd" namespace:"lnd"`
	Faraday *faraday.Config `group:"faraday" namespace:"faraday"`
	Loop    *loopd.Config   `group:"loop" namespace:"loop"`

	frdrpcCfg *frdrpc.Config
}

// lndConnectParams returns the connection parameters to connect to the local
// lnd instance.
func (c *Config) lndConnectParams() (string, lndclient.Network, string, string,
	error) {

	network, err := getNetwork(c.Lnd.Bitcoin)
	if err != nil {
		return "", "", "", "", err
	}

	// When we start lnd internally, we take the listen address as
	// the client dial address. But with TLS enabled by default, we
	// cannot call 0.0.0.0 internally when dialing lnd as that IP
	// address isn't in the cert. We need to rewrite it to the
	// loopback address.
	lndDialAddr := c.Lnd.RPCListeners[0].String()
	switch {
	case strings.Contains(lndDialAddr, "0.0.0.0"):
		lndDialAddr = strings.Replace(
			lndDialAddr, "0.0.0.0", "127.0.0.1", 1,
		)

	case strings.Contains(lndDialAddr, "[::]"):
		lndDialAddr = strings.Replace(
			lndDialAddr, "[::]", "[::1]", 1,
		)
	}

	return lndDialAddr, lndclient.Network(network),
		c.Lnd.TLSCertPath, c.Lnd.AdminMacPath, nil
}

// defaultConfig returns a configuration struct with all default values set.
func defaultConfig() *Config {
	return &Config{
		HTTPSListen: defaultHTTPSListen,
		Lnd:         &lndDefaultConfig,
		Faraday:     &faradayDefaultConfig,
		Loop:        &loopDefaultConfig,
	}
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

// readUIPassword reads the password for the UI either from the command line
// flag, a file specified or an environment variable.
func readUIPassword(config *Config) error {
	// A password is passed in as a command line flag (or config file
	// variable) directly.
	if len(strings.TrimSpace(config.UIPassword)) > 0 {
		config.UIPassword = strings.TrimSpace(config.UIPassword)
		return nil
	}

	// A file that contains the password is specified.
	if len(strings.TrimSpace(config.UIPasswordFile)) > 0 {
		content, err := ioutil.ReadFile(strings.TrimSpace(
			config.UIPasswordFile,
		))
		if err != nil {
			return fmt.Errorf("could not read file %s: %v",
				config.UIPasswordFile, err)
		}
		config.UIPassword = strings.TrimSpace(string(content))
		return nil
	}

	// The name of an environment variable was specified.
	if len(strings.TrimSpace(config.UIPasswordEnv)) > 0 {
		content := os.Getenv(strings.TrimSpace(config.UIPasswordEnv))
		if len(content) == 0 {
			return fmt.Errorf("environment variable %s is empty",
				config.UIPasswordEnv)
		}
		config.UIPassword = strings.TrimSpace(content)
		return nil
	}

	return fmt.Errorf("mandatory password for UI not configured. specify " +
		"either a password directly or a file or environment " +
		"variable that contains the password")
}

func buildTLSConfigForHttp2(config *Config) (*tls.Config, error) {
	var tlsConfig *tls.Config

	switch {
	case config.LetsEncrypt:
		serverName := config.LetsEncryptHost
		if serverName == "" {
			return nil, errors.New("let's encrypt host name " +
				"option is required for using let's encrypt")
		}

		log.Infof("Setting up Let's Encrypt for server %v", serverName)

		certDir := config.LetsEncryptDir
		log.Infof("Setting up Let's Encrypt with cache dir %v", certDir)

		manager := autocert.Manager{
			Cache:      autocert.DirCache(certDir),
			Prompt:     autocert.AcceptTOS,
			HostPolicy: autocert.HostWhitelist(serverName),
		}

		go func() {
			err := http.ListenAndServe(
				":http", manager.HTTPHandler(nil),
			)
			if err != nil {
				log.Errorf("Error starting Let's Encrypt "+
					"HTTP listener on port 80: %v", err)
			}
		}()
		tlsConfig = &tls.Config{
			GetCertificate: manager.GetCertificate,
		}

	default:
		tlsCert, _, err := cert.LoadCert(
			config.Lnd.TLSCertPath, config.Lnd.TLSKeyPath,
		)
		if err != nil {
			return nil, fmt.Errorf("failed reading TLS server keys: %v",
				err)
		}
		tlsConfig = cert.TLSConfFromCert(tlsCert)
		tlsConfig.CipherSuites = append(
			tlsConfig.CipherSuites,
			tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
		)
	}

	tlsConfig, err := connhelpers.TlsConfigWithHttp2Enabled(tlsConfig)
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
