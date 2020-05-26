package shushtar

import "gopkg.in/macaroon-bakery.v2/bakery"

var (
	// faradayPermissions is a map of all faraday RPC methods and their
	// required macaroon permissions.
	//
	// TODO(guggero): Move to faraday repo once macaroons are enabled there
	// and use more application specific permissions.
	faradayPermissions = map[string][]bakery.Op{
		"/frdrpc.FaradayServer/OutlierRecommendations": {{
			Entity: "offchain",
			Action: "read",
		}},
		"/frdrpc.FaradayServer/ThresholdRecommendations": {{
			Entity: "offchain",
			Action: "read",
		}},
		"/frdrpc.FaradayServer/RevenueReport": {{
			Entity: "offchain",
			Action: "read",
		}},
		"/frdrpc.FaradayServer/ChannelInsights": {{
			Entity: "offchain",
			Action: "read",
		}},
	}

	// loopPermissions is a map of all loop RPC methods and their required
	// macaroon permissions.
	//
	// TODO(guggero): Move to loop repo once macaroons are enabled there
	// and use more application specific permissions.
	loopPermissions = map[string][]bakery.Op{
		"/looprpc.SwapClient/LoopOut": {{
			Entity: "offchain",
			Action: "read",
		}},
		"/looprpc.SwapClient/LoopIn": {{
			Entity: "offchain",
			Action: "read",
		}},
		"/looprpc.SwapClient/Monitor": {{
			Entity: "offchain",
			Action: "read",
		}},
		"/looprpc.SwapClient/ListSwaps": {{
			Entity: "offchain",
			Action: "read",
		}},
		"/looprpc.SwapClient/SwapInfo": {{
			Entity: "offchain",
			Action: "read",
		}},
		"/looprpc.SwapClient/LoopOutTerms": {{
			Entity: "offchain",
			Action: "read",
		}},
		"/looprpc.SwapClient/LoopOutQuote": {{
			Entity: "offchain",
			Action: "read",
		}},
		"/looprpc.SwapClient/GetLoopInTerms": {{
			Entity: "offchain",
			Action: "read",
		}},
		"/looprpc.SwapClient/GetLoopInQuote": {{
			Entity: "offchain",
			Action: "read",
		}},
		"/looprpc.SwapClient/GetLsatTokens": {{
			Entity: "offchain",
			Action: "read",
		}},
	}
)

// getSubserverPermissions returns a merged map of all subserver macaroon
// permissions.
func getSubserverPermissions() map[string][]bakery.Op {
	mapSize := len(faradayPermissions) + len(loopPermissions)
	result := make(map[string][]bakery.Op, mapSize)
	for key, value := range faradayPermissions {
		result[key] = value
	}
	for key, value := range loopPermissions {
		result[key] = value
	}
	return result
}
