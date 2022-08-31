package terminal

import (
	faraday "github.com/lightninglabs/faraday/frdrpcserver/perms"
	loop "github.com/lightninglabs/loop/loopd/perms"
	pool "github.com/lightninglabs/pool/perms"
	"github.com/lightningnetwork/lnd"
	"gopkg.in/macaroon-bakery.v2/bakery"
)

var (
	// litPermissions is a map of all LiT RPC methods and their required
	// macaroon permissions to access the session service.
	litPermissions = map[string][]bakery.Op{
		"/litrpc.Sessions/AddSession": {{
			Entity: "sessions",
			Action: "write",
		}},
		"/litrpc.Sessions/ListSessions": {{
			Entity: "sessions",
			Action: "read",
		}},
		"/litrpc.Sessions/RevokeSession": {{
			Entity: "sessions",
			Action: "write",
		}},
	}

	// whiteListedLNDMethods is a map of all lnd RPC methods that don't
	// require any macaroon authentication.
	whiteListedLNDMethods = map[string][]bakery.Op{
		"/lnrpc.WalletUnlocker/GenSeed":        {},
		"/lnrpc.WalletUnlocker/InitWallet":     {},
		"/lnrpc.WalletUnlocker/UnlockWallet":   {},
		"/lnrpc.WalletUnlocker/ChangePassword": {},

		// The State service must be available at all times, even
		// before we can check macaroons, so we whitelist it.
		"/lnrpc.State/SubscribeState": {},
		"/lnrpc.State/GetState":       {},
	}
)

// subServerName is a name used to identify a particular Lit sub-server.
type subServerName string

const (
	poolPerms    subServerName = "pool"
	loopPerms    subServerName = "loop"
	faradayPerms subServerName = "faraday"
	litPerms     subServerName = "lit"
	lndPerms     subServerName = "lnd"
)

// PermissionsManager manages the permission lists that Lit requires.
type PermissionsManager struct {
	// fixedPerms is constructed once on creation of the PermissionsManager.
	// It contains all the permissions that will not change throughout the
	// lifetime of the manager. It maps sub-server name to uri to permission
	// operations.
	fixedPerms map[subServerName]map[string][]bakery.Op

	// perms is a map containing all permissions that the manager knows
	// are available for use.
	perms map[string][]bakery.Op
}

// NewPermissionsManager constructs a new PermissionsManager instance and
// collects any of the fixed permissions.
func NewPermissionsManager() (*PermissionsManager, error) {
	permissions := make(map[subServerName]map[string][]bakery.Op)
	permissions[faradayPerms] = faraday.RequiredPermissions
	permissions[loopPerms] = loop.RequiredPermissions
	permissions[poolPerms] = pool.RequiredPermissions
	permissions[litPerms] = litPermissions
	permissions[lndPerms] = lnd.MainRPCServerPermissions()
	for k, v := range whiteListedLNDMethods {
		permissions[lndPerms][k] = v
	}

	allPerms := make(map[string][]bakery.Op)
	for _, perms := range permissions {
		for k, v := range perms {
			allPerms[k] = v
		}
	}

	return &PermissionsManager{
		fixedPerms: permissions,
		perms:      allPerms,
	}, nil
}

// URIPermissions returns a list of permission operations for the given URI if
// the uri is known to the manager. The second return parameter will be false
// if the URI is unknown to the manager.
func (pm *PermissionsManager) URIPermissions(uri string) ([]bakery.Op, bool) {
	ops, ok := pm.perms[uri]
	return ops, ok
}

// ActivePermissions returns all the available active permissions that the
// manager is aware of. Optionally, readOnly can be set to true if only the
// read-only permissions should be returned.
func (pm *PermissionsManager) ActivePermissions(readOnly bool) []bakery.Op {
	// De-dup the permissions and optionally apply the read-only filter.
	dedupMap := make(map[string]map[string]bool)
	for _, methodPerms := range pm.perms {
		for _, methodPerm := range methodPerms {
			if methodPerm.Action == "" || methodPerm.Entity == "" {
				continue
			}

			if readOnly && methodPerm.Action != "read" {
				continue
			}

			if dedupMap[methodPerm.Entity] == nil {
				dedupMap[methodPerm.Entity] = make(
					map[string]bool,
				)
			}
			dedupMap[methodPerm.Entity][methodPerm.Action] = true
		}
	}

	result := make([]bakery.Op, 0, len(dedupMap))
	for entity, actions := range dedupMap {
		for action := range actions {
			result = append(result, bakery.Op{
				Entity: entity,
				Action: action,
			})
		}
	}

	return result
}

// GetLitPerms returns a map of all permissions that the manager is aware of
// _except_ for any LND permissions. In other words, this returns permissions
// for which the external validator of Lit is responsible.
func (pm *PermissionsManager) GetLitPerms() map[string][]bakery.Op {
	mapSize := len(pm.fixedPerms[litPerms]) +
		len(pm.fixedPerms[faradayPerms]) +
		len(pm.fixedPerms[loopPerms]) + len(pm.fixedPerms[poolPerms])

	result := make(map[string][]bakery.Op, mapSize)
	for key, value := range pm.fixedPerms[faradayPerms] {
		result[key] = value
	}
	for key, value := range pm.fixedPerms[loopPerms] {
		result[key] = value
	}
	for key, value := range pm.fixedPerms[poolPerms] {
		result[key] = value
	}
	for key, value := range pm.fixedPerms[litPerms] {
		result[key] = value
	}
	return result
}

// IsLndURI returns true if the given URI belongs to an RPC of lnd.
func (pm *PermissionsManager) IsLndURI(uri string) bool {
	_, lndCall := pm.fixedPerms[lndPerms][uri]
	return lndCall
}

// IsLoopURI returns true if the given URI belongs to an RPC of loopd.
func (pm *PermissionsManager) IsLoopURI(uri string) bool {
	_, ok := pm.fixedPerms[loopPerms][uri]
	return ok
}

// IsFaradayURI returns true if the given URI belongs to an RPC of faraday.
func (pm *PermissionsManager) IsFaradayURI(uri string) bool {
	_, ok := pm.fixedPerms[faradayPerms][uri]
	return ok
}

// IsPoolURI returns true if the given URI belongs to an RPC of poold.
func (pm *PermissionsManager) IsPoolURI(uri string) bool {
	_, ok := pm.fixedPerms[poolPerms][uri]
	return ok
}

// IsLitURI returns true if the given URI belongs to an RPC of LiT.
func (pm *PermissionsManager) IsLitURI(uri string) bool {
	_, ok := pm.fixedPerms[litPerms][uri]
	return ok
}
