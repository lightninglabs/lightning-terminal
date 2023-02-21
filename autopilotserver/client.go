package autopilotserver

import (
	"context"
	"crypto/tls"
	"encoding/hex"
	"errors"
	"fmt"
	"net"
	"strings"
	"sync"
	"time"

	"github.com/btcsuite/btcd/btcec/v2"
	"github.com/lightninglabs/lightning-terminal/autopilotserverrpc"
	"github.com/lightningnetwork/lnd/tor"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"gopkg.in/macaroon-bakery.v2/bakery"
)

// ErrVersionIncompatible is returned when the minimum Lit version required by
// the autopilot server exceeds the version of this binary.
var ErrVersionIncompatible = fmt.Errorf("litd version is not compatible " +
	"with the minimum version required by the autopilot server")

// Config holds the configuration options for the autopilot server client.
type Config struct {
	// Disable will disable the autopilot client.
	Disable bool `long:"disable" description:"disable the autopilot client"`

	// Address is the domain:port of the autopilot server.
	Address string `long:"address" description:"autopilot server address host:port"`

	// Proxy is the SOCKS proxy that should be used to establish the
	// connection.
	Proxy string `long:"proxy" description:"The host:port of a SOCKS proxy through which all connections to the autopilot server will be established over"`

	// Insecure signals that no TLS should be used if set to true.
	Insecure bool `long:"insecure" description:"disable tls"`

	// TLSPath is the path to a local file that holds the autopilot
	// server's TLS certificate. This is only needed if the server is using
	// a self-signed cert.
	TLSPath string `long:"tlspath" description:"Path to autopilot server tls certificate"`

	// PingCadence determines how often the Autopilot client should
	// re-register an existing session with the Autopilot server to ensure
	// that the Autopilot server knows that the session is active.
	PingCadence time.Duration `long:"pingcadence" description:"How often the client should ensure that registered Autopilot sessions are active"`

	// DialOpts is a list of additional options that should be used when
	// dialing the gRPC connection.
	DialOpts []grpc.DialOption

	// LitVersion is the version of the Lit binary.
	LitVersion Version

	// LndVersion is the version of the connected LND binary.
	LndVersion Version
}

// Version defines a software version.
type Version struct {
	// Major is the major version of the software.
	Major uint32

	// Minor is the major version of the software.
	Minor uint32

	// Patch is the patch number that the software is running.
	Patch uint32
}

// A compile-time check to ensure that the Client struct implements the
// Autopilot interface.
var _ Autopilot = (*Client)(nil)

// Client is a client connection to the autopilot server.
type Client struct {
	start sync.Once
	stop  sync.Once

	cfg *Config

	sessions   map[string]*session
	sessionsMu sync.Mutex

	featurePerms *featurePerms

	quit chan struct{}
	wg   sync.WaitGroup
}

type session struct {
	key         *btcec.PublicKey
	lastSuccess time.Time
}

type featurePerms struct {
	perms       map[string]map[string]bool
	lastUpdated time.Time
	sync.Mutex
}

// NewClient returns a autopilot-server client.
func NewClient(cfg *Config) (Autopilot, error) {
	var err error
	cfg.DialOpts, err = getAutopilotServerDialOpts(
		cfg.Insecure, cfg.Proxy, cfg.TLSPath, cfg.DialOpts...,
	)
	if err != nil {
		return nil, err
	}

	return &Client{
		cfg:      cfg,
		sessions: make(map[string]*session),
		quit:     make(chan struct{}),
		featurePerms: &featurePerms{
			perms: make(map[string]map[string]bool),
		},
	}, nil
}

// Start kicks off all the goroutines required by the Client.
func (c *Client) Start(opts ...func(cfg *Config)) error {
	var startErr error
	c.start.Do(func() {
		log.Infof("Starting Autopilot Client")

		for _, o := range opts {
			o(c.cfg)
		}

		version, err := c.getMinVersion(context.Background())
		if err != nil {
			startErr = err
			return
		}

		err = c.checkCompatibility(version)
		if err != nil {
			startErr = err
			if !errors.Is(err, ErrVersionIncompatible) {
				return
			}

			startErr = fmt.Errorf("lit must be on at least "+
				"version v%d.%d.%d to be compatile with the "+
				"autopilot server", version.Major,
				version.Minor, version.Patch)
			return
		}

		c.wg.Add(2)
		go c.activateSessionsForever()
		go c.updateFeaturePermsForever()
	})

	return startErr
}

// Stop cleans up any resources or goroutines managed by the Client.
func (c *Client) Stop() {
	c.stop.Do(func() {
		close(c.quit)
		c.wg.Wait()
	})
}

// ListFeaturePerms returns contents of the in-memory feature permissions list
// if it has been populated.
func (c *Client) ListFeaturePerms(_ context.Context) (
	map[string]map[string]bool, error) {

	c.featurePerms.Lock()
	defer c.featurePerms.Unlock()

	if c.featurePerms.lastUpdated.IsZero() {
		return nil, fmt.Errorf("feature permissions list is not yet " +
			"populated")
	}

	return c.featurePerms.perms, nil
}

// SessionRevoked removes a session from the list of active sessions managed by
// the client.
//
// Note: this is part of the Autopilot interface.
func (c *Client) SessionRevoked(ctx context.Context, pubKey *btcec.PublicKey) {
	key := hex.EncodeToString(pubKey.SerializeCompressed())

	c.sessionsMu.Lock()
	delete(c.sessions, key)
	c.sessionsMu.Unlock()

	// Do a best-effort call to the Autopilot server to notify it that the
	// session is being revoked. It is not the end of the world if this call
	// fails since the Autopilot will move the session to inactive itself
	// after a few unsuccessful connection attempts.
	client, cleanup, err := c.getClientConn()
	if err != nil {
		log.Errorf("could not get client connection: %v", err)
		return
	}
	defer cleanup()

	_, err = client.RevokeSession(
		ctx, &autopilotserverrpc.RevokeSessionRequest{
			ResponderPubKey: pubKey.SerializeCompressed(),
		},
	)
	if err != nil {
		log.Errorf("could not revoke session %x: %v",
			pubKey.SerializeCompressed(), err)

		return
	}
}

// activateSessionsForever periodically ensures that each of our active
// autopilot sessions are known by the autopilot to be active.
func (c *Client) activateSessionsForever() {
	defer c.wg.Done()

	ctx := context.Background()
	ticker := time.NewTicker(c.cfg.PingCadence)
	defer ticker.Stop()

	for {
		c.sessionsMu.Lock()
		for _, s := range c.sessions {
			// If the session was recently registered with the
			// autopilot server, then we don't need to register it
			// again so soon.
			if !s.lastSuccess.IsZero() &&
				time.Since(s.lastSuccess) < c.cfg.PingCadence {

				continue
			}

			key := hex.EncodeToString(s.key.SerializeCompressed())

			log.Debugf("ensuring activation of session %s", key)

			perm, err := c.activateSession(ctx, s.key)
			if err != nil {
				log.Errorf("could not activate session %s: %v",
					key, err)

				if perm {
					delete(c.sessions, key)
				}

				continue
			}

			s.lastSuccess = time.Now()
		}
		c.sessionsMu.Unlock()

		select {
		case <-ticker.C:
		case <-c.quit:
			return
		}
	}
}

// updateFeaturePermsForever periodically attempts to update the in-memory
// feature permissions list.
//
// NOTE: this MUST be called in a goroutine.
func (c *Client) updateFeaturePermsForever() {
	defer c.wg.Done()

	ctx := context.Background()
	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()

	const (
		retryTime   = time.Minute
		refreshTime = time.Hour * 24
	)

	for {
		select {
		case <-ticker.C:
		case <-c.quit:
			return
		}

		c.featurePerms.Lock()
		sinceUpdate := time.Since(c.featurePerms.lastUpdated)
		c.featurePerms.Unlock()

		if sinceUpdate < refreshTime {
			ticker.Reset(refreshTime - sinceUpdate)
			continue
		}

		features, err := c.ListFeatures(ctx)
		if err != nil {
			log.Errorf("could not fetch features from "+
				"autopilot server: %v", err)

			ticker.Reset(retryTime)
			continue
		}

		c.updateFeaturePerms(features)
		ticker.Reset(refreshTime)
	}
}

// updateFeaturePerms updates our in-memory store of the permissions required
// for each feature.
func (c *Client) updateFeaturePerms(features map[string]*Feature) {
	perms := make(map[string]map[string]bool)
	for name, feature := range features {
		perms[name] = make(map[string]bool)
		for p := range feature.Permissions {
			perms[name][p] = true
		}
	}

	c.featurePerms.Lock()
	c.featurePerms.perms = perms
	c.featurePerms.lastUpdated = time.Now()
	c.featurePerms.Unlock()
}

// ListFeatures queries the autopilot server for all the features it has
// available.
//
// Note: this is part of the Autopilot interface.
func (c *Client) ListFeatures(ctx context.Context) (map[string]*Feature,
	error) {

	client, cleanup, err := c.getClientConn()
	if err != nil {
		return nil, err
	}
	defer cleanup()

	resp, err := client.ListFeatures(
		ctx, &autopilotserverrpc.ListFeaturesRequest{},
	)
	if err != nil {
		return nil, err
	}

	features := make(map[string]*Feature, len(resp.Features))
	for i, feature := range resp.Features {
		perms := unmarshalPermissions(feature.PermissionsList)
		rules := unmarshalRules(feature.Rules)
		features[i] = &Feature{
			Name:          feature.Name,
			Description:   feature.Description,
			Permissions:   perms,
			Rules:         rules,
			DefaultConfig: feature.DefaultConfig,
		}
	}

	// Take this opportunity to also update the feature permissions map.
	c.updateFeaturePerms(features)

	return features, nil
}

// RegisterSession attempts to register a session with the autopilot server.
// If the registration is successful, then the Client will also track the
// session so that it can continuously ensure that the session remains active.
//
// Note: this is part of the Autopilot interface.
func (c *Client) RegisterSession(ctx context.Context, pubKey *btcec.PublicKey,
	mailboxAddr string, devServer bool, featureConf map[string][]byte,
	groupKey *btcec.PublicKey, linkSig []byte) (*btcec.PublicKey, error) {

	remotePub, err := c.registerSession(
		ctx, pubKey, mailboxAddr, devServer, featureConf,
		groupKey, linkSig,
	)
	if err != nil {
		log.Errorf("unsuccessful registration of session %x",
			pubKey.SerializeCompressed())

		return nil, err
	}

	c.trackClient(pubKey)

	return remotePub, nil
}

// ActivateSession attempts to inform the autopilot server that the given
// session is still active. It also adds the session to the list tracked by
// the client so that the Client can ensure that the session remains active on
// the autopilot side.
//
// Note: this is part of the Autopilot interface.
func (c *Client) ActivateSession(ctx context.Context, pubKey *btcec.PublicKey) (
	bool, error) {

	c.trackClient(pubKey)

	return c.activateSession(ctx, pubKey)
}

// trackClient adds the given session key to the set of sessions tracked by the
// Client.
func (c *Client) trackClient(pubKey *btcec.PublicKey) {
	c.sessionsMu.Lock()
	defer c.sessionsMu.Unlock()

	key := hex.EncodeToString(pubKey.SerializeCompressed())

	c.sessions[key] = &session{
		key:         pubKey,
		lastSuccess: time.Now(),
	}
}

// registerSession attempts to register a session with the given local static
// public key with the autopilot server.
func (c *Client) registerSession(ctx context.Context, pubKey *btcec.PublicKey,
	mailboxAddr string, devServer bool, featureConfig map[string][]byte,
	groupLocalPub *btcec.PublicKey, linkSig []byte) (*btcec.PublicKey,
	error) {

	client, cleanup, err := c.getClientConn()
	if err != nil {
		return nil, err
	}
	defer cleanup()

	var groupKey []byte
	if groupLocalPub != nil {
		groupKey = groupLocalPub.SerializeCompressed()
	}

	resp, err := client.RegisterSession(
		ctx, &autopilotserverrpc.RegisterSessionRequest{
			ResponderPubKey:   pubKey.SerializeCompressed(),
			MailboxAddr:       mailboxAddr,
			DevServer:         devServer,
			FeatureConfigs:    featureConfig,
			LitVersion:        marshalVersion(c.cfg.LitVersion),
			LndVersion:        marshalVersion(c.cfg.LndVersion),
			GroupResponderKey: groupKey,
			GroupResponderSig: linkSig,
		},
	)
	if err != nil {
		return nil, err
	}

	return btcec.ParsePubKey(resp.InitiatorPubKey)
}

func (c *Client) getMinVersion(ctx context.Context) (*Version, error) {
	client, cleanup, err := c.getClientConn()
	if err != nil {
		return nil, err
	}
	defer cleanup()

	terms, err := client.Terms(ctx, &autopilotserverrpc.TermsRequest{})
	if err != nil {
		return nil, err
	}

	return &Version{
		Major: terms.MinRequiredVersion.Major,
		Minor: terms.MinRequiredVersion.Minor,
		Patch: terms.MinRequiredVersion.Patch,
	}, nil
}

func (c *Client) checkCompatibility(minV *Version) error {
	v := c.cfg.LitVersion

	if v.Major != minV.Major {
		if v.Major > minV.Major {
			return nil
		}
		return ErrVersionIncompatible
	}

	if v.Minor != minV.Minor {
		if v.Minor > minV.Minor {
			return nil
		}
		return ErrVersionIncompatible
	}

	if v.Patch != minV.Patch {
		if v.Patch > minV.Patch {
			return nil
		}
		return ErrVersionIncompatible
	}

	// The actual version and expected version are identical.
	return nil
}

// activateSession ensures that the autopilot server sees the given session as
// active. The returned boolean is true if the error is permanent and the
// session should be revoked. If it is false, then the client should retry
// again in the future.
func (c *Client) activateSession(ctx context.Context, pubKey *btcec.PublicKey) (
	bool, error) {

	client, cleanup, err := c.getClientConn()
	if err != nil {
		return false, err
	}
	defer cleanup()

	_, err = client.ActivateSession(
		ctx, &autopilotserverrpc.ActivateSessionRequest{
			ResponderPubKey: pubKey.SerializeCompressed(),
		},
	)
	if err == nil {
		return false, nil
	}

	// TODO(elle): use structured GRPC errors instead.
	if strings.Contains(err.Error(), "the client has been rejected") {
		return true, err
	}

	return false, err
}

// getClientConn creates a connection to the autopilot server and returns this
// connection along with a cleanup function to be used when the connection
// is no longer needed.
func (c *Client) getClientConn() (autopilotserverrpc.AutopilotClient,
	func(), error) {

	serverConn, err := grpc.Dial(c.cfg.Address, c.cfg.DialOpts...)
	if err != nil {
		return nil, nil, fmt.Errorf("unable to connect to RPC "+
			"server: %v", err)
	}

	clientConn := autopilotserverrpc.NewAutopilotClient(serverConn)

	return clientConn, func() {
		err = serverConn.Close()
		if err != nil {
			log.Errorf("could not close server conn: %v", err)
		}
	}, nil
}

// getAutopilotServerDialOpts returns the dial options to connect to the
// autopilot server.
func getAutopilotServerDialOpts(insecure bool, proxyAddress, tlsPath string,
	dialOpts ...grpc.DialOption) ([]grpc.DialOption, error) {

	// Create a copy of the dial options array.
	opts := dialOpts

	// There are three options to connect to an autopilot server, either
	// insecure, using a self-signed certificate or with a certificate
	// signed by a public CA.
	switch {
	case insecure:
		opts = append(opts, grpc.WithInsecure())

	case tlsPath != "":
		// Load the specified TLS certificate and build
		// transport credentials
		creds, err := credentials.NewClientTLSFromFile(tlsPath, "")
		if err != nil {
			return nil, err
		}
		opts = append(opts, grpc.WithTransportCredentials(creds))

	default:
		creds := credentials.NewTLS(&tls.Config{})
		opts = append(opts, grpc.WithTransportCredentials(creds))
	}
	// If a SOCKS proxy address was specified,
	// then we should dial through it.
	if proxyAddress != "" {
		log.Infof("Proxying connection to autopilotserver server "+
			"over Tor SOCKS proxy %v", proxyAddress)
		torDialer := func(_ context.Context, addr string) (net.Conn,
			error) {

			return tor.Dial(
				addr, proxyAddress, false, false,
				tor.DefaultConnTimeout,
			)
		}
		opts = append(opts, grpc.WithContextDialer(torDialer))
	}

	return opts, nil
}

func unmarshalPermissions(
	perms []*autopilotserverrpc.Permissions) map[string][]bakery.Op {

	res := make(map[string][]bakery.Op)
	for _, perm := range perms {
		operations := make([]bakery.Op, len(perm.Operations))
		for i, op := range perm.Operations {
			operations[i] = bakery.Op{
				Entity: op.Entity,
				Action: op.Action,
			}
		}

		res[perm.Method] = operations
	}

	return res
}

func unmarshalRules(
	rules map[string]*autopilotserverrpc.Rule) map[string]*RuleValues {

	res := make(map[string]*RuleValues, len(rules))
	for name, rule := range rules {
		res[name] = &RuleValues{
			Default: rule.Default,
			MinVal:  rule.MinValue,
			MaxVal:  rule.MaxValue,
		}
	}

	return res
}

func marshalVersion(v Version) *autopilotserverrpc.Version {
	return &autopilotserverrpc.Version{
		Major: v.Major,
		Minor: v.Minor,
		Patch: v.Patch,
	}
}
