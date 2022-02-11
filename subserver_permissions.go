package terminal

import (
	"github.com/lightninglabs/faraday/frdrpc"
	"github.com/lightninglabs/loop/loopd"
	"github.com/lightninglabs/pool"
	"github.com/lightningnetwork/lnd"
	"gopkg.in/macaroon-bakery.v2/bakery"
)

var (
	// litPermissions is a map of all LiT RPC methods and their required
	// macaroon permissions to access the session service.
	litPermissions = map[string][]bakery.Op{
		"/litrpc.Sessions/AddSession":    {{}},
		"/litrpc.Sessions/ListSessions":  {{}},
		"/litrpc.Sessions/RevokeSession": {{}},
	}

	// whiteListedMethods is a map of all lnd RPC methods that don't require
	// any macaroon authentication.
	whiteListedMethods = map[string][]bakery.Op{
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

// getSubserverPermissions returns a merged map of all subserver macaroon
// permissions.
func getSubserverPermissions() map[string][]bakery.Op {
	mapSize := len(frdrpc.RequiredPermissions) +
		len(loopd.RequiredPermissions) + len(pool.RequiredPermissions)
	result := make(map[string][]bakery.Op, mapSize)
	for key, value := range frdrpc.RequiredPermissions {
		result[key] = value
	}
	for key, value := range loopd.RequiredPermissions {
		result[key] = value
	}
	for key, value := range pool.RequiredPermissions {
		result[key] = value
	}
	for key, value := range litPermissions {
		result[key] = value
	}
	return result
}

// getAllMethodPermissions returns a merged map of lnd's and all subservers'
// method macaroon permissions.
func getAllMethodPermissions() map[string][]bakery.Op {
	subserverPermissions := getSubserverPermissions()
	lndPermissions := lnd.MainRPCServerPermissions()
	mapSize := len(subserverPermissions) + len(lndPermissions) +
		len(whiteListedMethods)
	result := make(map[string][]bakery.Op, mapSize)
	for key, value := range lndPermissions {
		result[key] = value
	}
	for key, value := range subserverPermissions {
		result[key] = value
	}
	for key, value := range whiteListedMethods {
		result[key] = value
	}
	return result
}

// getAllPermissions retrieves all the permissions needed to bake a super
// macaroon.
func getAllPermissions() []bakery.Op {
	dedupMap := make(map[string]map[string]bool)

	for _, methodPerms := range getAllMethodPermissions() {
		for _, methodPerm := range methodPerms {
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

// isLndURI returns true if the given URI belongs to an RPC of lnd.
func isLndURI(uri string) bool {
	_, ok := lnd.MainRPCServerPermissions()[uri]
	return ok
}

// isLoopURI returns true if the given URI belongs to an RPC of loopd.
func isLoopURI(uri string) bool {
	_, ok := loopd.RequiredPermissions[uri]
	return ok
}

// isFaradayURI returns true if the given URI belongs to an RPC of faraday.
func isFaradayURI(uri string) bool {
	_, ok := frdrpc.RequiredPermissions[uri]
	return ok
}

// isPoolURI returns true if the given URI belongs to an RPC of poold.
func isPoolURI(uri string) bool {
	_, ok := pool.RequiredPermissions[uri]
	return ok
}

// isLitURI returns true if the given URI belongs to an RPC of LiT.
func isLitURI(uri string) bool {
	_, ok := litPermissions[uri]
	return ok
}
