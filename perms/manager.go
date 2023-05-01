package perms

import (
	"fmt"
	"regexp"
	"strings"
	"sync"

	faraday "github.com/lightninglabs/faraday/frdrpcserver/perms"
	loop "github.com/lightninglabs/loop/loopd/perms"
	pool "github.com/lightninglabs/pool/perms"
	"github.com/lightningnetwork/lnd"
	"github.com/lightningnetwork/lnd/lnrpc"
	"gopkg.in/macaroon-bakery.v2/bakery"
)

const (
	poolPerms    string = "pool"
	loopPerms    string = "loop"
	faradayPerms string = "faraday"
	litPerms     string = "lit"
	lndPerms     string = "lnd"
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
	fixedPerms map[string]map[string][]bakery.Op

	// perms is a map containing all permissions that the manager knows
	// are available for use. This map will start out not including any of
	// lnd's sub-server permissions. Only when the LND build tags are
	// obtained and OnLNDBuildTags is called will this map include the
	// available LND sub-server permissions. This map must only be accessed
	// once the permsMu mutex is held.
	perms   map[string][]bakery.Op
	permsMu sync.RWMutex
}

// NewManager constructs a new Manager instance and collects any of the
// fixed permissions. If withAllSubServers is true, then all the LND sub-server
// permissions will be added to the available permissions set regardless of
// whether LND was compiled with those sub-servers. If it is not set, however,
// then OnLNDBuildTags can be used to specify the exact sub-servers that LND
// was compiled with and then only the corresponding permissions will be added.
func NewManager(withAllSubServers bool) (*Manager, error) {
	permissions := make(map[string]map[string][]bakery.Op)
	permissions[faradayPerms] = faraday.RequiredPermissions
	permissions[loopPerms] = loop.RequiredPermissions
	permissions[poolPerms] = pool.RequiredPermissions
	permissions[litPerms] = RequiredPermissions
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

// SubServerHandler returns the name of the subserver that should handle the
// given URI.
func (pm *Manager) SubServerHandler(uri string) (string, error) {
	switch {
	case pm.IsSubServerURI(lndPerms, uri):
		return lndPerms, nil

	case pm.IsSubServerURI(faradayPerms, uri):
		return faradayPerms, nil

	case pm.IsSubServerURI(loopPerms, uri):
		return loopPerms, nil

	case pm.IsSubServerURI(poolPerms, uri):
		return poolPerms, nil

	case pm.IsSubServerURI(litPerms, uri):
		return litPerms, nil

	default:
		return "", fmt.Errorf("unknown gRPC web request: %v", uri)
	}
}

// IsSubServerURI if the given URI belongs to the RPC of the given server.
func (pm *Manager) IsSubServerURI(name string, uri string) bool {
	if name == lndPerms {
		return pm.isLndURI(uri)
	}

	_, ok := pm.fixedPerms[name][uri]
	return ok
}

// isLndURI returns true if the given URI belongs to an RPC of lnd.
func (pm *Manager) isLndURI(uri string) bool {
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
