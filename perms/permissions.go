package perms

import (
	"net"
	"regexp"
	"strings"
	"sync"

	faraday "github.com/lightninglabs/faraday/frdrpcserver/perms"
	loop "github.com/lightninglabs/loop/loopd/perms"
	pool "github.com/lightninglabs/pool/perms"
	"github.com/lightningnetwork/lnd"
	"github.com/lightningnetwork/lnd/autopilot"
	"github.com/lightningnetwork/lnd/chainreg"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lnrpc/autopilotrpc"
	"github.com/lightningnetwork/lnd/lnrpc/chainrpc"
	"github.com/lightningnetwork/lnd/lnrpc/devrpc"
	"github.com/lightningnetwork/lnd/lnrpc/invoicesrpc"
	"github.com/lightningnetwork/lnd/lnrpc/neutrinorpc"
	"github.com/lightningnetwork/lnd/lnrpc/peersrpc"
	"github.com/lightningnetwork/lnd/lnrpc/routerrpc"
	"github.com/lightningnetwork/lnd/lnrpc/signrpc"
	"github.com/lightningnetwork/lnd/lnrpc/walletrpc"
	"github.com/lightningnetwork/lnd/lnrpc/watchtowerrpc"
	"github.com/lightningnetwork/lnd/lnrpc/wtclientrpc"
	"github.com/lightningnetwork/lnd/lntest/mock"
	"github.com/lightningnetwork/lnd/routing"
	"github.com/lightningnetwork/lnd/sweep"
	"gopkg.in/macaroon-bakery.v2/bakery"
)

var (
	// LitPermissions is a map of all LiT RPC methods and their required
	// macaroon permissions to access the session service.
	LitPermissions = map[string][]bakery.Op{
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
		"/litrpc.LitService/StopDaemon": {{
			Entity: "litd",
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

// subServerName is a name used to identify a particular Lit sub-server.
type subServerName string

const (
	poolPerms    subServerName = "pool"
	loopPerms    subServerName = "loop"
	faradayPerms subServerName = "faraday"
	litPerms     subServerName = "lit"
	lndPerms     subServerName = "lnd"
)

// Manager manages the permission lists that Lit requires.
type Manager struct {
	// lndSubServerPerms is a map from LND subserver name to permissions
	// map. This is used once the manager receives a list of build tags
	// that LND has been compiled with so that the correct permissions can
	// be extracted based on subservers that LND has been compiled with.
	lndSubServerPerms map[string]map[string][]bakery.Op

	// fixedPerms is constructed once on creation of the Manager.
	// It contains all the permissions that will not change throughout the
	// lifetime of the manager. It maps sub-server name to uri to permission
	// operations.
	fixedPerms map[subServerName]map[string][]bakery.Op

	// perms is a map containing all permissions that the manager knows
	// are available for use. This map will start out not including any of
	// lnd's sub-server permissions. Only when the LND build tags are
	// obtained and OnLNDBuildTags is called will this map include the
	// available LND sub-server permissions. This map must only be accessed
	// once the permsMu mutex is held.
	perms   map[string][]bakery.Op
	permsMu sync.RWMutex
}

// NewManager constructs a new Manager instance and collects any of the fixed
// permissions. If withAllSubServers is true, then all the LND sub-server
// permissions will be added to the available permissions set regardless of
// whether LND was compiled with those sub-servers. If it is not set, however,
// then OnLNDBuildTags can be used to specify the exact sub-servers that LND
// was compiled with and then only the corresponding permissions will be added.
func NewManager(withAllSubServers bool) (*Manager, error) {
	permissions := make(map[subServerName]map[string][]bakery.Op)
	permissions[faradayPerms] = faraday.RequiredPermissions
	permissions[loopPerms] = loop.RequiredPermissions
	permissions[poolPerms] = pool.RequiredPermissions
	permissions[litPerms] = LitPermissions
	permissions[lndPerms] = lnd.MainRPCServerPermissions()
	for k, v := range whiteListedLNDMethods {
		permissions[lndPerms][k] = v
	}

	// Collect all LND sub-server permissions along with the name of the
	// sub-server that each permission is associated with.
	lndSubServerPerms := make(map[string]map[string][]bakery.Op)
	ss := lnrpc.RegisteredSubServers()
	for _, subServer := range ss {
		_, perms, err := subServer.NewGrpcHandler().CreateSubServer(
			&mockConfig{},
		)
		if err != nil {
			return nil, err
		}

		name := subServer.SubServerName
		lndSubServerPerms[name] = make(map[string][]bakery.Op)
		for key, value := range perms {
			lndSubServerPerms[name][key] = value

			// If this sub-server is one that we know is
			// automatically compiled in LND then we add it to our
			// map of active permissions. We also add the permission
			// if withAllSubServers is true.
			if withAllSubServers ||
				lndAutoCompiledSubServers[name] {

				permissions[lndPerms][key] = value
			}
		}
	}

	allPerms := make(map[string][]bakery.Op)
	for _, perms := range permissions {
		for k, v := range perms {
			allPerms[k] = v
		}
	}

	return &Manager{
		lndSubServerPerms: lndSubServerPerms,
		fixedPerms:        permissions,
		perms:             allPerms,
	}, nil
}

// OnLNDBuildTags should be called once a list of LND build tags has been
// obtained. It then uses those build tags to decide which of the LND sub-server
// permissions to add to the main permissions list. This method should only
// be called once.
func (pm *Manager) OnLNDBuildTags(lndBuildTags []string) {
	pm.permsMu.Lock()
	defer pm.permsMu.Unlock()

	tagLookup := make(map[string]bool)
	for _, t := range lndBuildTags {
		tagLookup[strings.ToLower(t)] = true
	}

	for subServerName, perms := range pm.lndSubServerPerms {
		name := subServerName
		if tagName, ok := lndSubServerNameToTag[name]; ok {
			name = tagName
		}

		if !tagLookup[strings.ToLower(name)] {
			continue
		}

		for key, value := range perms {
			pm.perms[key] = value
		}
	}
}

// URIPermissions returns a list of permission operations for the given URI if
// the uri is known to the manager. The second return parameter will be false
// if the URI is unknown to the manager.
func (pm *Manager) URIPermissions(uri string) ([]bakery.Op, bool) {
	pm.permsMu.RLock()
	defer pm.permsMu.RUnlock()

	ops, ok := pm.perms[uri]
	return ops, ok
}

// MatchRegexURI first checks that the given URI is in fact a regex. If it is,
// then it is used to match on the perms that the manager has. The return values
// are a list of URIs that match the regex and the boolean represents whether
// the given uri is in fact a regex.
func (pm *Manager) MatchRegexURI(uriRegex string) ([]string, bool) {
	pm.permsMu.RLock()
	defer pm.permsMu.RUnlock()

	// If the given uri string is one of our permissions, then it is not
	// a regex.
	if _, ok := pm.perms[uriRegex]; ok {
		return nil, false
	}

	// Construct the regex type from the given string.
	r, err := regexp.Compile(uriRegex)
	if err != nil {
		return nil, false
	}

	// Iterate over the list of permissions and collect all permissions that
	// match the given regex.
	var matches []string
	for uri := range pm.perms {
		if !r.MatchString(uri) {
			continue
		}

		matches = append(matches, uri)
	}

	return matches, true
}

// ActivePermissions returns all the available active permissions that the
// manager is aware of. Optionally, readOnly can be set to true if only the
// read-only permissions should be returned.
func (pm *Manager) ActivePermissions(readOnly bool) []bakery.Op {
	pm.permsMu.RLock()
	defer pm.permsMu.RUnlock()

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
func (pm *Manager) GetLitPerms() map[string][]bakery.Op {
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
func (pm *Manager) IsLndURI(uri string) bool {
	var lndSubServerCall bool
	for _, subserverPermissions := range pm.lndSubServerPerms {
		_, found := subserverPermissions[uri]
		if found {
			lndSubServerCall = true
			break
		}
	}
	_, lndCall := pm.fixedPerms[lndPerms][uri]
	return lndCall || lndSubServerCall
}

// IsLoopURI returns true if the given URI belongs to an RPC of loopd.
func (pm *Manager) IsLoopURI(uri string) bool {
	_, ok := pm.fixedPerms[loopPerms][uri]
	return ok
}

// IsFaradayURI returns true if the given URI belongs to an RPC of faraday.
func (pm *Manager) IsFaradayURI(uri string) bool {
	_, ok := pm.fixedPerms[faradayPerms][uri]
	return ok
}

// IsPoolURI returns true if the given URI belongs to an RPC of poold.
func (pm *Manager) IsPoolURI(uri string) bool {
	_, ok := pm.fixedPerms[poolPerms][uri]
	return ok
}

// IsLitURI returns true if the given URI belongs to an RPC of LiT.
func (pm *Manager) IsLitURI(uri string) bool {
	_, ok := pm.fixedPerms[litPerms][uri]
	return ok
}

// mockConfig implements lnrpc.SubServerConfigDispatcher. It provides the
// functionality required so that the lnrpc.GrpcHandler.CreateSubServer
// function can be called without panicking.
type mockConfig struct{}

var _ lnrpc.SubServerConfigDispatcher = (*mockConfig)(nil)

// FetchConfig is a mock implementation of lnrpc.SubServerConfigDispatcher. It
// is used as a parameter to lnrpc.GrpcHandler.CreateSubServer and allows the
// function to be called without panicking. This is useful because
// CreateSubServer can be used to extract the permissions required by each
// registered subserver.
//
// TODO(elle): remove this once the sub-server permission lists in LND have been
// exported
func (t *mockConfig) FetchConfig(subServerName string) (interface{}, bool) {
	switch subServerName {
	case "InvoicesRPC":
		return &invoicesrpc.Config{}, true
	case "WatchtowerClientRPC":
		return &wtclientrpc.Config{
			Resolver: func(_, _ string) (*net.TCPAddr, error) {
				return nil, nil
			},
		}, true
	case "AutopilotRPC":
		return &autopilotrpc.Config{
			Manager: &autopilot.Manager{},
		}, true
	case "ChainRPC":
		return &chainrpc.Config{
			ChainNotifier: &chainreg.NoChainBackend{},
		}, true
	case "DevRPC":
		return &devrpc.Config{}, true
	case "NeutrinoKitRPC":
		return &neutrinorpc.Config{}, true
	case "PeersRPC":
		return &peersrpc.Config{}, true
	case "RouterRPC":
		return &routerrpc.Config{
			Router: &routing.ChannelRouter{},
		}, true
	case "SignRPC":
		return &signrpc.Config{
			Signer: &mock.DummySigner{},
		}, true
	case "WalletKitRPC":
		return &walletrpc.Config{
			FeeEstimator: &chainreg.NoChainBackend{},
			Wallet:       &mock.WalletController{},
			KeyRing:      &mock.SecretKeyRing{},
			Sweeper:      &sweep.UtxoSweeper{},
			Chain:        &mock.ChainIO{},
		}, true
	case "WatchtowerRPC":
		return &watchtowerrpc.Config{}, true
	default:
		return nil, false
	}
}
