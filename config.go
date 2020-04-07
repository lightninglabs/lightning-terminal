package main

import (
	"github.com/jessevdk/go-flags"
)

var (
	defaultHTTPSListen = "localhost:8443"
	defaultLndHost     = "localhost:10009"
	defaultLoopHost    = "localhost:10010"
	defaultTLSCertPath = "https.cert"
	defaultTLSKeyPath  = "https.key"
)

type config struct {
	HTTPSListen string `long:"httpslisten" description:"host:port to listen for incoming HTTP/2 connections on"`
	LNDHost     string `long:"lndhost" description:"host:port that LND listens for RPC connections on"`
	LoopHost    string `long:"loophost" description:"host:port that Loop listens for RPC connections on"`
	TLSCertPath string `long:"tlscertpath" description:"path to the TLS cert to use for HTTPS requests"`
	TLSKeyPath  string `long:"tlskeypath" description:"path to the TLS key to use for HTTPS requests"`
}

// loadConfig starts with a skeleton default config, and reads in user provided
// configuration from the command line. It does not provide a full set of
// defaults or validate user input.
func loadConfig() (*config, error) {
	// Start with a default config.
	config := &config{
		HTTPSListen: defaultHTTPSListen,
		LNDHost:     defaultLndHost,
		LoopHost:    defaultLoopHost,
		TLSCertPath: defaultTLSCertPath,
		TLSKeyPath:  defaultTLSKeyPath,
	}

	// Parse command line options to obtain user specified values.
	if _, err := flags.Parse(config); err != nil {
		return nil, err
	}

	return config, nil
}
