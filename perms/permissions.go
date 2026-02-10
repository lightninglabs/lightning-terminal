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
		"/litrpc.Accounts/CreditAccount": {{
			Entity: "account",
			Action: "write",
		}},
		"/litrpc.Accounts/DebitAccount": {{
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

		// Scripts service permissions.
		"/litrpc.Scripts/CreateScript": {{
			Entity: "scripts",
			Action: "write",
		}},
		"/litrpc.Scripts/UpdateScript": {{
			Entity: "scripts",
			Action: "write",
		}},
		"/litrpc.Scripts/DeleteScript": {{
			Entity: "scripts",
			Action: "write",
		}},
		"/litrpc.Scripts/GetScript": {{
			Entity: "scripts",
			Action: "read",
		}},
		"/litrpc.Scripts/ListScripts": {{
			Entity: "scripts",
			Action: "read",
		}},
		"/litrpc.Scripts/StartScript": {{
			Entity: "scripts",
			Action: "execute",
		}},
		"/litrpc.Scripts/StopScript": {{
			Entity: "scripts",
			Action: "execute",
		}},
		"/litrpc.Scripts/ListRunningScripts": {{
			Entity: "scripts",
			Action: "read",
		}},
		"/litrpc.Scripts/ValidateScript": {{
			Entity: "scripts",
			Action: "read",
		}},
		"/litrpc.Scripts/GetExecutionHistory": {{
			Entity: "scripts",
			Action: "read",
		}},

		// Script KV store permissions.
		"/litrpc.Scripts/KVGet": {{
			Entity: "scriptkv",
			Action: "read",
		}},
		"/litrpc.Scripts/KVPut": {{
			Entity: "scriptkv",
			Action: "write",
		}},
		"/litrpc.Scripts/KVDelete": {{
			Entity: "scriptkv",
			Action: "write",
		}},
		"/litrpc.Scripts/KVList": {{
			Entity: "scriptkv",
			Action: "read",
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
