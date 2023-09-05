package autopilotserver

import (
	"context"

	"github.com/btcsuite/btcd/btcec/v2"
	"gopkg.in/macaroon-bakery.v2/bakery"
)

// Autopilot represents the functionality exposed by an autopilot server.
type Autopilot interface {
	// ListFeatures fetches the set of features offered by the autopilot
	// server along with all the rules and permissions required for those
	// features.
	ListFeatures(ctx context.Context) (map[string]*Feature, error)

	// ListFeaturePerms returns a map of feature names to a map of
	// permissions required for each feature. This call uses an in-memory
	// store that is updated periodically and so this should be used instead
	// of the ListFeatures call if only the permissions are required to
	// avoid doing multiple calls to the autopilot server. The ListFeatures
	// call can however be used to force the update of the in-memory list.
	ListFeaturePerms(ctx context.Context) (map[string]map[string]bool,
		error)

	// RegisterSession attempts to register a session with the autopilot
	// server. If the registration is successful, then the Client will also
	// track the session so that it can continuously ensure that the session
	// remains active.
	RegisterSession(ctx context.Context, pubKey *btcec.PublicKey,
		mailboxAddr string, devServer bool,
		featureConf map[string][]byte, linkedGroupKey *btcec.PublicKey,
		linkSig []byte) (*btcec.PublicKey, error)

	// ActivateSession attempts to inform the autopilot server that the
	// given session is still active. After this is called, the autopilot
	// client will periodically ensure that the session remains active.
	// The boolean returned is true if the error received was permanent
	// meaning that the session should be revoked and recreated.
	ActivateSession(ctx context.Context, pubKey *btcec.PublicKey) (bool,
		error)

	// SessionRevoked should be called when a session is no longer active
	// so that the client can forget the session.
	SessionRevoked(ctx context.Context, key *btcec.PublicKey)

	// Start kicks off the goroutines of the client.
	Start(opts ...func(cfg *Config)) error

	// Stop cleans up any resources held by the client.
	Stop()
}

// Feature holds all the info necessary to subscribe to a feature offered by
// the autopilot server.
type Feature struct {
	// Name is the name of the feature.
	Name string

	// Description is a human-readable description of what the feature
	// offers
	Description string

	// Permissions is a list of RPC methods and access writes a feature
	// will need.
	Permissions map[string][]bakery.Op

	// Rules is a list of all the firewall that must be specified for this
	// feature.
	Rules map[string]*RuleValues

	// DefaultConfig is a JSON-serialized configuration of the feature. It
	// represents the default configuration we can use if the user doesn't
	// specify any.
	DefaultConfig []byte
}

// RuleValues holds the default value along with the sane max and min values
// that the autopilot server indicates makes sense for feature that the rule is
// being applied to. The values can be unmarshalled in a higher layer if the
// name of the rule is known to LiT.
type RuleValues struct {
	Default []byte
	MinVal  []byte
	MaxVal  []byte
}
