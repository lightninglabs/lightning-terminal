package terminal

import (
	"github.com/lightninglabs/faraday/frdrpc"
	"github.com/lightninglabs/loop/loopd"
	"github.com/lightninglabs/pool"
	"github.com/lightningnetwork/lnd"
	"github.com/lightningnetwork/lnd/lnrpc/routerrpc"
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
		"/litrpc.Accounts/CreateAccount": {{
			Entity: "account",
			Action: "write",
		}},
		"/litrpc.Accounts/ListAccounts": {{
			Entity: "account",
			Action: "read",
		}},
		"/litrpc.Accounts/RemoveAccount": {{
			Entity: "account",
			Action: "write",
		}},
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

// getLndPermissions returns all lnd permissions for the proxy.
func getLndPermissions() map[string][]bakery.Op {
	lndPerms := lnd.MainRPCServerPermissions()

	_, routerrpcPermissions, _ := routerrpc.New(&routerrpc.Config{})
	for key, value := range routerrpcPermissions {
		lndPerms[key] = value
	}

	return lndPerms
}

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
	lndPermissions := getLndPermissions()
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

// GetAllPermissions retrieves all the permissions needed to bake a super
// macaroon.
func GetAllPermissions(readOnly bool) []bakery.Op {
	dedupMap := make(map[string]map[string]bool)

	for _, methodPerms := range getAllMethodPermissions() {
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
