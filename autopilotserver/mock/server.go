package mock

import (
	"context"
	"encoding/hex"
	"fmt"
	"net"
	"sync"

	"github.com/btcsuite/btcd/btcec/v2"
	"github.com/btcsuite/btcd/btcec/v2/ecdsa"
	"github.com/btcsuite/btcd/chaincfg/chainhash"
	"github.com/lightninglabs/lightning-terminal/autopilotserverrpc"
	"github.com/lightninglabs/lightning-terminal/rules"
	"github.com/lightningnetwork/lnd/lntest/node"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"gopkg.in/macaroon-bakery.v2/bakery"
)

// Server implements the autopilotserverrpc.AutopilotServer interface and is
// used to mock the autopilot server in tests.
type Server struct {
	autopilotserverrpc.AutopilotServer

	// featureSet is the set of features that the autopilot server supports.
	featureSet map[string]*Feature

	// sessions is a map from the public key string of the remote node
	// (the litd node in this case) to the private key of the autopilot
	// server.
	sessions map[string]*clientSession
	sessMu   sync.Mutex

	// port is the port number on which the mock autopilot server will
	// host its grpc service.
	port int

	grpcServer *grpc.Server

	wg sync.WaitGroup
}

type ClientState uint8

const (
	ClientStateActive = iota
	ClientStateInactive
	ClientStateRevoked
)

type clientSession struct {
	key   *btcec.PrivateKey
	state ClientState
}

// NewServer constructs a new MockAutoPilotServer.
func NewServer() *Server {
	return &Server{
		port:     node.NextAvailablePort(),
		sessions: make(map[string]*clientSession),
		grpcServer: grpc.NewServer(
			grpc.Creds(insecure.NewCredentials()),
		),
		featureSet: defaultFeatures,
	}
}

// Start kicks off the mock autopilot grpc server.
func (m *Server) Start() error {
	lis, err := net.Listen("tcp", fmt.Sprintf("localhost:%d", m.port))
	if err != nil {
		return err
	}

	autopilotserverrpc.RegisterAutopilotServer(m.grpcServer, m)

	m.wg.Add(1)
	go func() {
		defer m.wg.Done()

		err := m.grpcServer.Serve(lis)
		if err != nil && err != grpc.ErrServerStopped {
			log.Errorf("RPC server stopped with error: %v", err)
		}
	}()

	return nil
}

// Stop cleans up any resources held by the mock server.
func (m *Server) Stop() {
	m.grpcServer.Stop()
	m.wg.Wait()
}

// GetPort returns the port number that the mock server is serving its grpc
// server on.
func (m *Server) GetPort() int {
	return m.port
}

// SetFeatures can be used to override the feature set served by the mock
// autopilot server.
func (m *Server) SetFeatures(f map[string]*Feature) {
	m.featureSet = f
}

// ResetDefaultFeatures resets the servers features set to the default set.
func (m *Server) ResetDefaultFeatures() {
	m.featureSet = defaultFeatures
}

// Terms returns any meta data from the autopilot server.
//
// Note: this is part of the autopilotrpc.AutopilotServer interface.
func (m *Server) Terms(context.Context, *autopilotserverrpc.TermsRequest) (
	*autopilotserverrpc.TermsResponse, error) {

	return &autopilotserverrpc.TermsResponse{
		MinRequiredVersion: &autopilotserverrpc.Version{
			Major: 0,
			Minor: 0,
			Patch: 0,
		},
	}, nil
}

// ListFeatures converts the mockFeatures into the form that the autopilot
// server would.
//
// Note: this is part of the autopilotrpc.AutopilotServer interface.
func (m *Server) ListFeatures(_ context.Context,
	_ *autopilotserverrpc.ListFeaturesRequest) (
	*autopilotserverrpc.ListFeaturesResponse, error) {

	res := make(map[string]*autopilotserverrpc.Feature, len(m.featureSet))
	for name, f := range m.featureSet {
		rules, err := rulesToRPC(f.Rules)
		if err != nil {
			return nil, err
		}

		res[name] = &autopilotserverrpc.Feature{
			Name:            name,
			Description:     f.Description,
			Rules:           rules,
			PermissionsList: permissionsToRPC(f.Permissions),
		}
	}

	return &autopilotserverrpc.ListFeaturesResponse{
		Features: res,
	}, nil
}

// RegisterSession will create a new priv key for the autopilot server and
// return the corresponding public key.
//
// Note: this is part of the autopilotrpc.AutopilotServer interface.
func (m *Server) RegisterSession(_ context.Context,
	req *autopilotserverrpc.RegisterSessionRequest) (
	*autopilotserverrpc.RegisterSessionResponse, error) {

	m.sessMu.Lock()
	defer m.sessMu.Unlock()

	_, ok := m.sessions[hex.EncodeToString(req.ResponderPubKey)]
	if ok {
		return nil, fmt.Errorf("client already registered")
	}

	priv, err := btcec.NewPrivateKey()
	if err != nil {
		return nil, err
	}

	// If linked session, check that signature is valid.
	if len(req.GroupResponderKey) != 0 {
		// Check that the group key is a known key.
		_, ok := m.sessions[hex.EncodeToString(req.GroupResponderKey)]
		if !ok {
			return nil, fmt.Errorf("unknown group key")
		}

		// Check that the signature provided is valid.
		sig, err := ecdsa.ParseDERSignature(req.GroupResponderSig)
		if err != nil {
			return nil, err
		}

		msg := chainhash.HashB(req.ResponderPubKey)

		groupKey, err := btcec.ParsePubKey(req.GroupResponderKey)
		if err != nil {
			return nil, err
		}

		if !sig.Verify(msg, groupKey) {
			return nil, fmt.Errorf("invalid signature")
		}
	}

	m.sessions[hex.EncodeToString(req.ResponderPubKey)] = &clientSession{
		key:   priv,
		state: ClientStateActive,
	}

	return &autopilotserverrpc.RegisterSessionResponse{
		InitiatorPubKey: priv.PubKey().SerializeCompressed(),
	}, nil
}

func (m *Server) ActivateSession(_ context.Context,
	req *autopilotserverrpc.ActivateSessionRequest) (
	*autopilotserverrpc.ActivateSessionResponse, error) {

	m.sessMu.Lock()
	defer m.sessMu.Unlock()

	session, ok := m.sessions[hex.EncodeToString(req.ResponderPubKey)]
	if !ok {
		return nil, fmt.Errorf("no such client")
	}

	session.state = ClientStateActive
	return &autopilotserverrpc.ActivateSessionResponse{}, nil
}

// RevokeSession revokes a single session and also stops it if it is currently
// active.
//
// Note: this is part of the autopilotrpc.AutopilotServer interface.
func (m *Server) RevokeSession(_ context.Context,
	req *autopilotserverrpc.RevokeSessionRequest) (
	*autopilotserverrpc.RevokeSessionResponse, error) {

	m.sessMu.Lock()
	defer m.sessMu.Unlock()

	sess, ok := m.sessions[hex.EncodeToString(req.ResponderPubKey)]
	if !ok {
		return nil, nil
	}

	sess.state = ClientStateRevoked

	return &autopilotserverrpc.RevokeSessionResponse{}, nil
}

// GetPrivKey can be used to extract the private key that the autopilot created
// for the given litd static key.
func (m *Server) GetPrivKey(remoteKey *btcec.PublicKey) (
	*btcec.PrivateKey, error) {

	m.sessMu.Lock()
	defer m.sessMu.Unlock()

	key := hex.EncodeToString(remoteKey.SerializeCompressed())
	session, ok := m.sessions[key]
	if !ok {
		return nil, fmt.Errorf("no key found")
	}

	return session.key, nil
}

func (m *Server) GetClientState(remoteKey *btcec.PublicKey) (
	ClientState, error) {

	m.sessMu.Lock()
	defer m.sessMu.Unlock()

	key := hex.EncodeToString(remoteKey.SerializeCompressed())
	session, ok := m.sessions[key]
	if !ok {
		return 0, fmt.Errorf("no such client found")
	}

	return session.state, nil
}

func (m *Server) SetClientState(remoteKey *btcec.PublicKey,
	s ClientState) error {

	m.sessMu.Lock()
	defer m.sessMu.Unlock()

	key := hex.EncodeToString(remoteKey.SerializeCompressed())
	session, ok := m.sessions[key]
	if !ok {
		return fmt.Errorf("no such client found")
	}

	session.state = s

	return nil
}

// Feature is a feature that the autopilot server could return.
type Feature struct {
	Description string
	Rules       map[string]*RuleRanges
	Permissions map[string][]bakery.Op
}

// defaultFeatures is an example of a set of features that the autopilot server
// could return.
var defaultFeatures = map[string]*Feature{
	"HealthCheck": {
		Description: "check that your node is up",
		Rules: map[string]*RuleRanges{
			rules.RateLimitName: RateLimitRule,
		},
		Permissions: map[string][]bakery.Op{
			"/lnrpc.Lightning/GetInfo": {{
				Entity: "info",
				Action: "read",
			}},
		},
	},
	"AutoFees": {
		Description: "manages your channel fees",
		Rules: map[string]*RuleRanges{
			rules.RateLimitName: RateLimitRule,
		},
		Permissions: map[string][]bakery.Op{
			"/lnrpc.Lightning/ListChannels": {{
				Entity: "offchain",
				Action: "read",
			}},
			"/lnrpc.Lightning/UpdateChannelPolicy": {{
				Entity: "offchain",
				Action: "write",
			}},
			"/lnrpc.Lightning/FeeReport": {{
				Entity: "offchain",
				Action: "read",
			}},
		},
	},
}

var RateLimitRule = &RuleRanges{
	Default: &rules.RateLimit{
		WriteLimit: &rules.Rate{
			Iterations: 1,
			NumHours:   1,
		},
		ReadLimit: &rules.Rate{
			Iterations: 10,
			NumHours:   1,
		},
	},
	MinVal: &rules.RateLimit{
		WriteLimit: &rules.Rate{
			Iterations: 0,
			NumHours:   1,
		},
		ReadLimit: &rules.Rate{
			Iterations: 1,
			NumHours:   1,
		},
	},
	MaxVal: &rules.RateLimit{
		WriteLimit: &rules.Rate{
			Iterations: 10,
			NumHours:   1,
		},
		ReadLimit: &rules.Rate{
			Iterations: 1000,
			NumHours:   1,
		},
	},
}

type RuleRanges struct {
	Default rules.Values
	MinVal  rules.Values
	MaxVal  rules.Values
}

func rulesToRPC(rulesMap map[string]*RuleRanges) (
	map[string]*autopilotserverrpc.Rule, error) {

	res := make(map[string]*autopilotserverrpc.Rule, len(rulesMap))
	for name, rule := range rulesMap {
		defaultVals, err := rules.Marshal(rule.Default)
		if err != nil {
			return nil, err
		}

		minVals, err := rules.Marshal(rule.MinVal)
		if err != nil {
			return nil, err
		}

		maxVals, err := rules.Marshal(rule.MaxVal)
		if err != nil {
			return nil, err
		}

		res[name] = &autopilotserverrpc.Rule{
			Name:     name,
			Default:  defaultVals,
			MinValue: minVals,
			MaxValue: maxVals,
		}
	}

	return res, nil
}

func permissionsToRPC(ps map[string][]bakery.Op) []*autopilotserverrpc.Permissions {
	res := make([]*autopilotserverrpc.Permissions, len(ps))

	for method, ops := range ps {
		operations := make([]*autopilotserverrpc.Operation, len(ops))
		for i, op := range ops {
			operations[i] = &autopilotserverrpc.Operation{
				Entity: op.Entity,
				Action: op.Action,
			}
		}

		res = append(res, &autopilotserverrpc.Permissions{
			Method:     method,
			Operations: operations,
		})
	}

	return res
}
