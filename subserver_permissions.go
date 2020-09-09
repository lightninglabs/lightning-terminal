package terminal

import (
	"github.com/lightninglabs/faraday/frdrpc"
	"github.com/lightninglabs/loop/loopd"
	"gopkg.in/macaroon-bakery.v2/bakery"
)

// getSubserverPermissions returns a merged map of all subserver macaroon
// permissions.
func getSubserverPermissions() map[string][]bakery.Op {
	mapSize := len(frdrpc.RequiredPermissions) +
		len(loopd.RequiredPermissions)
	result := make(map[string][]bakery.Op, mapSize)
	for key, value := range frdrpc.RequiredPermissions {
		result[key] = value
	}
	for key, value := range loopd.RequiredPermissions {
		result[key] = value
	}
	return result
}
