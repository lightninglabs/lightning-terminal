package rules

import (
	"github.com/lightninglabs/lightning-terminal/firewalldb"
	"github.com/lightninglabs/lndclient"
	"gopkg.in/macaroon-bakery.v2/bakery"
)

// Config encompasses all the possible configuration items that could be
// required by the various rules.
type Config interface {
	// GetStores can be used to get access to methods that can be used to
	// perform atomic transactions on permanent and temporary local and
	// global kv stores.
	GetStores() firewalldb.KVStores

	// GetActionsDB can be used by rules to list any past actions that were
	// made for the specific session or feature.
	GetActionsDB() firewalldb.ActionsDB

	// GetMethodPerms returns a map that contains URIs and the permissions
	// required to use them.
	GetMethodPerms() func(string) ([]bakery.Op, bool)

	// GetNodePubKey returns the node ID of the lnd node.
	GetNodePubKey() [33]byte

	// GetRouterClient returns an lnd router client.
	GetRouterClient() lndclient.RouterClient

	// GetReqID is the request ID of the call being evaluated. This can be
	// used to link a request with a response.
	GetReqID() int64

	// GetLndConnID returns the unique identifier for the lnd connection.
	GetLndConnID() string

	// GetLndClient returns an lnd client.
	GetLndClient() lndclient.LightningClient
}

// ConfigImpl is an implementation of the Config interface.
type ConfigImpl struct {
	// GetStores provides access to methods that can be used to perform
	// atomic transactions on permanent and temporary local and global
	// kv stores.
	Stores firewalldb.KVStores

	// ActionsDB can be used by rules to list any past actions that were
	// made for the specific session or feature.
	ActionsDB firewalldb.ActionsDB

	// MethodPerms is a function that can be used to fetch the permissions
	// required for a URI.
	MethodPerms func(string) ([]bakery.Op, bool)

	// NodeID is the pub key of the lnd node.
	NodeID [33]byte

	// RouterClient is an lnd router client.
	RouterClient lndclient.RouterClient

	// ReqID is the request ID of the call being evaluated. This can be used
	// to link a request with a response.
	ReqID int64

	// LndConnID is the unique identifier for the lnd connection.
	LndConnID string

	// LndClient is a connection to the Lit node's LND node.
	LndClient lndclient.LightningClient
}

func (c *ConfigImpl) GetStores() firewalldb.KVStores {
	return c.Stores
}

// GetActionsDB returns the list of past actions.
func (c *ConfigImpl) GetActionsDB() firewalldb.ActionsDB {
	return c.ActionsDB
}

// GetMethodPerms returns a function that can be used to fetch the permissions
// of a URI.
func (c *ConfigImpl) GetMethodPerms() func(string) ([]bakery.Op, bool) {
	return c.MethodPerms
}

// GetNodePubKey returns the node ID for the lnd node.
func (c *ConfigImpl) GetNodePubKey() [33]byte {
	return c.NodeID
}

// GetRouterClient returns an lnd router client.
func (c *ConfigImpl) GetRouterClient() lndclient.RouterClient {
	return c.RouterClient
}

// GetReqID returns the request ID of the request or response being evaluated.
func (c *ConfigImpl) GetReqID() int64 {
	return c.ReqID
}

// GetLndConnID returns the unique identifier for the lnd connection to create
// unique request ids per lnd runtime.
func (c *ConfigImpl) GetLndConnID() string {
	return c.LndConnID
}

// GetLndClient returns an lnd client.
func (c *ConfigImpl) GetLndClient() lndclient.LightningClient {
	return c.LndClient
}

// A compile-time check to ensure that ConfigImpl implements the Config
// interface.
var _ Config = (*ConfigImpl)(nil)
