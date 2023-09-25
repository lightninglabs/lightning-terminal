package perms

import (
	"gopkg.in/macaroon-bakery.v2/bakery"
)

var (
	// RequiredPermissions is a map of all LiT RPC methods and their
	// required macaroon permissions to access the session service.
	RequiredPermissions = map[string][]bakery.Op{
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
		"/litrpc.Accounts/UpdateAccount": {{
			Entity: "account",
			Action: "write",
		}},
		"/litrpc.Accounts/ListAccounts": {{
			Entity: "account",
			Action: "read",
		}},
		"/litrpc.Accounts/AccountInfo": {{
			Entity: "account",
			Action: "read",
		}},
		"/litrpc.Accounts/RemoveAccount": {{
			Entity: "account",
			Action: "write",
		}},
		"/litrpc.Firewall/ListActions": {{
			Entity: "actions",
			Action: "read",
		}},
		"/litrpc.Autopilot/ListAutopilotFeatures": {{
			Entity: "autopilot",
			Action: "read",
		}},
		"/litrpc.Autopilot/AddAutopilotSession": {{
			Entity: "autopilot",
			Action: "write",
		}},
		"/litrpc.Autopilot/ListAutopilotSessions": {{
			Entity: "autopilot",
			Action: "read",
		}},
		"/litrpc.Autopilot/RevokeAutopilotSession": {{
			Entity: "autopilot",
			Action: "write",
		}},
		"/litrpc.Firewall/PrivacyMapConversion": {{
			Entity: "privacymap",
			Action: "read",
		}},
		"/litrpc.Proxy/StopDaemon": {{
			Entity: "proxy",
			Action: "write",
		}},
		"/litrpc.Proxy/GetInfo": {{
			Entity: "proxy",
			Action: "read",
		}},
		"/litrpc.Proxy/BakeSuperMacaroon": {{
			Entity: "supermacaroon",
			Action: "write",
		}},
	}

	// whiteListedLNDMethods is a map of all lnd RPC methods that don't
	// require any macaroon authentication.
	whiteListedLNDMethods = map[string]struct{}{
		"/lnrpc.WalletUnlocker/GenSeed":        {},
		"/lnrpc.WalletUnlocker/InitWallet":     {},
		"/lnrpc.WalletUnlocker/UnlockWallet":   {},
		"/lnrpc.WalletUnlocker/ChangePassword": {},

		// The State service must be available at all times, even
		// before we can check macaroons, so we whitelist it.
		"/lnrpc.State/SubscribeState": {},
		"/lnrpc.State/GetState":       {},
	}

	// whiteListedLitMethods is a map of all LiT's RPC methods that don't
	// require any macaroon authentication.
	whiteListedLitMethods = map[string][]bakery.Op{
		// The Status service must be available at all times, even
		// before we can check macaroons, so we whitelist it.
		"/litrpc.Status/SubServerStatus": {},
	}

	// lndSubServerNameToTag is a map from the name of an LND subserver to
	// the name of the LND tag that corresponds to the subserver. This map
	// only contains the subserver-to-tag pairs for the pairs where the
	// names differ.
	lndSubServerNameToTag = map[string]string{
		"WalletKitRPC":        "walletrpc",
		"DevRPC":              "dev",
		"NeutrinoKitRPC":      "neutrinorpc",
		"VersionRPC":          "verrpc",
		"WatchtowerClientRPC": "wtclientrpc",
	}

	// lndAutoCompiledSubServers is a map of the LND subservers that are
	// automatically compiled with it and therefore don't need a build tag.
	lndAutoCompiledSubServers = map[string]bool{
		"VersionRPC":          true,
		"RouterRPC":           true,
		"WatchtowerClientRPC": true,
	}
)
