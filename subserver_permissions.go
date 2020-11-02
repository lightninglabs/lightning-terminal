package terminal

import (
	"github.com/lightninglabs/faraday/frdrpc"
	"github.com/lightninglabs/loop/loopd"
	"github.com/lightninglabs/pool"
	"github.com/lightningnetwork/lnd"
	"gopkg.in/macaroon-bakery.v2/bakery"
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
	return result
}

// getAllPermissions returns a merged map of lnd's and all subservers' macaroon
// permissions.
func getAllPermissions() map[string][]bakery.Op {
	subserverPermissions := getSubserverPermissions()
	lndPermissions := lnd.MainRPCServerPermissions()
	mapSize := len(subserverPermissions) + len(lndPermissions)
	result := make(map[string][]bakery.Op, mapSize)
	for key, value := range lndPermissions {
		result[key] = value
	}
	for key, value := range subserverPermissions {
		result[key] = value
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
