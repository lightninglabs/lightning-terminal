package session

import (
	"context"
	"fmt"
	"time"

	"github.com/btcsuite/btcd/btcec/v2"
	"github.com/lightninglabs/lightning-node-connect/mailbox"
	"github.com/lightninglabs/lightning-terminal/macaroons"
	"gopkg.in/macaroon-bakery.v2/bakery"
	"gopkg.in/macaroon.v2"
)

// Type represents the type of session.
type Type uint8

const (
	TypeMacaroonReadonly Type = 0
	TypeMacaroonAdmin    Type = 1
	TypeMacaroonCustom   Type = 2
	TypeUIPassword       Type = 3
	TypeAutopilot        Type = 4
	TypeMacaroonAccount  Type = 5
)

// State represents the state of a session.
type State uint8

/*
				   /---> StateExpired (terminal)
StateReserved ---> StateCreated ---
       				   \---> StateRevoked (terminal)
*/

const (
	// StateCreated is the state of a session once it has been fully
	// committed to the BoltStore and is ready to be used. This is the
	// first state after StateReserved.
	StateCreated State = 0

	// StateInUse is the state of a session that is currently being used.
	//
	// NOTE: this state is not currently used, but we keep it around for now
	// since old sessions might still have this state persisted.
	StateInUse State = 1

	// StateRevoked is the state of a session that has been revoked before
	// its expiry date.
	StateRevoked State = 2

	// StateExpired is the state of a session that has passed its expiry
	// date.
	StateExpired State = 3

	// StateReserved is a temporary initial state of a session. This is used
	// to reserve a unique ID and private key pair for a session before it
	// is fully created. On start-up, any sessions in this state should be
	// cleaned up.
	StateReserved State = 4
)

// Terminal returns true if the state is a terminal state.
func (s State) Terminal() bool {
	return s == StateExpired || s == StateRevoked
}

// legalStateShifts is a map that defines the legal State transitions that a
// Session can be put through.
var legalStateShifts = map[State]map[State]bool{
	StateReserved: {
		StateCreated: true,
	},
	StateCreated: {
		StateExpired: true,
		StateRevoked: true,
	},
	StateInUse: {
		StateRevoked: true,
		StateExpired: true,
	},
}

// MacaroonRecipe defines the permissions and caveats that should be used
// to bake a macaroon.
type MacaroonRecipe struct {
	Permissions []bakery.Op
	Caveats     []macaroon.Caveat
}

// FeaturesConfig is a map from feature name to a raw byte array which stores
// any config feature config options.
type FeaturesConfig map[string][]byte

// Session is a struct representing a long-term Terminal Connect session.
type Session struct {
	ID                ID
	Label             string
	State             State
	Type              Type
	Expiry            time.Time
	CreatedAt         time.Time
	RevokedAt         time.Time
	ServerAddr        string
	DevServer         bool
	MacaroonRootKey   uint64
	MacaroonRecipe    *MacaroonRecipe
	PairingSecret     [mailbox.NumPassphraseEntropyBytes]byte
	LocalPrivateKey   *btcec.PrivateKey
	LocalPublicKey    *btcec.PublicKey
	RemotePublicKey   *btcec.PublicKey
	FeatureConfig     *FeaturesConfig
	WithPrivacyMapper bool
	PrivacyFlags      PrivacyFlags

	// GroupID is the Session ID of the very first Session in the linked
	// group of sessions. If this is the very first session in the group
	// then this will be the same as ID.
	GroupID ID
}

// buildSession creates a new session with the given user-defined parameters.
func buildSession(id ID, localPrivKey *btcec.PrivateKey, label string, typ Type,
	created, expiry time.Time, serverAddr string,
	options ...Option) (*Session, error) {

	opts := defaultSessionOptions()
	for _, o := range options {
		o(opts)
	}

	_, pairingSecret, err := mailbox.NewPassphraseEntropy()
	if err != nil {
		return nil, fmt.Errorf("error deriving pairing secret: %v", err)
	}

	macRootKey := macaroons.NewSuperMacaroonRootKeyID(id)

	// The group ID will by default be the same as the Session ID
	// unless this session links to a previous session.
	groupID := id
	if opts.linkedGroupID != nil {
		// If this session is linked to a previous session, then the
		// group ID is the same as the linked session's group ID.
		groupID = *opts.linkedGroupID
	}

	sess := &Session{
		ID:                id,
		Label:             label,
		State:             StateReserved,
		Type:              typ,
		Expiry:            expiry.UTC(),
		CreatedAt:         created.UTC(),
		ServerAddr:        serverAddr,
		DevServer:         opts.devServer,
		MacaroonRootKey:   macRootKey,
		PairingSecret:     pairingSecret,
		LocalPrivateKey:   localPrivKey,
		LocalPublicKey:    localPrivKey.PubKey(),
		RemotePublicKey:   nil,
		WithPrivacyMapper: opts.privacy,
		PrivacyFlags:      opts.privacyFlags,
		GroupID:           groupID,
		MacaroonRecipe:    opts.macaroonRecipe,
	}

	if len(opts.featureConfig) != 0 {
		sess.FeatureConfig = &opts.featureConfig
	}

	return sess, nil
}

// sessionOptions defines various options that can be tweaked via functional
// parameters for session creation.
type sessionOptions struct {
	// privacy indicates if a privacy map should be used with this session.
	privacy bool

	// privacyFlags to use in combination with the session's privacy mapper.
	privacyFlags PrivacyFlags

	// featureConfig holds any feature configuration bytes to use for this
	// session.
	featureConfig FeaturesConfig

	// linkedGroupID is the ID of the group that this session is linked
	// to. By default, a session is not linked to another group.
	linkedGroupID *ID

	// devServer is true if TLS should be skipped when connecting to the
	// mailbox server.
	devServer bool

	// macaroonRecipe holds the permissions and caveats that should be used
	// to bake the macaroon to be used with this session.
	macaroonRecipe *MacaroonRecipe
}

// defaultSessionOptions returns a new sessionOptions struct with default
// values set.
func defaultSessionOptions() *sessionOptions {
	return &sessionOptions{
		privacy:       false,
		privacyFlags:  PrivacyFlags{},
		featureConfig: FeaturesConfig{},
		linkedGroupID: nil,
		devServer:     false,
	}
}

// Option defines the signature of a functional option that can be used to
// tweak various session creation options.
type Option func(*sessionOptions)

// WithPrivacy can be used to enable the privacy mapper for this session.
// An optional set of privacy flags can be provided to further customize the
// privacy mapper.
func WithPrivacy(flags PrivacyFlags) Option {
	return func(o *sessionOptions) {
		o.privacy = true
		o.privacyFlags = flags
	}
}

// WithFeatureConfig can be used to set the feature configuration bytes for
// this session.
func WithFeatureConfig(config FeaturesConfig) Option {
	return func(o *sessionOptions) {
		o.featureConfig = config
	}
}

// WithLinkedGroupID can be used to link this session to a previous session.
func WithLinkedGroupID(groupID *ID) Option {
	return func(o *sessionOptions) {
		o.linkedGroupID = groupID
	}
}

// WithDevServer can be used to set if TLS verification should be skipped when
// connecting to the mailbox server.
func WithDevServer() Option {
	return func(o *sessionOptions) {
		o.devServer = true
	}
}

// WithMacaroonRecipe can be used to set the permissions and caveats that
// should be used to bake the macaroon for a session.
func WithMacaroonRecipe(caveats []macaroon.Caveat, perms []bakery.Op) Option {
	return func(o *sessionOptions) {
		o.macaroonRecipe = &MacaroonRecipe{
			Permissions: perms,
			Caveats:     caveats,
		}
	}
}

// IDToGroupIndex defines an interface for the session ID to group ID index.
type IDToGroupIndex interface {
	// GetGroupID will return the group ID for the given session ID.
	GetGroupID(ctx context.Context, sessionID ID) (ID, error)

	// GetSessionIDs will return the set of session IDs that are in the
	// group with the given ID.
	GetSessionIDs(ctx context.Context, groupID ID) ([]ID, error)
}

// Store is the interface a persistent storage must implement for storing and
// retrieving Terminal Connect sessions.
type Store interface {
	// NewSession creates a new session with the given user-defined
	// parameters. The session will remain in the StateReserved state until
	// ShiftState is called to update the state.
	NewSession(ctx context.Context, label string, typ Type,
		expiry time.Time, serverAddr string, opts ...Option) (*Session,
		error)

	// GetSession fetches the session with the given key.
	GetSession(ctx context.Context, key *btcec.PublicKey) (*Session, error)

	// ListAllSessions returns all sessions currently known to the store.
	ListAllSessions(ctx context.Context) ([]*Session, error)

	// ListSessionsByType returns all sessions of the given type.
	ListSessionsByType(ctx context.Context, t Type) ([]*Session, error)

	// ListSessionsByState returns all sessions currently known to the store
	// that are in the given states.
	ListSessionsByState(ctx context.Context, state ...State) ([]*Session,
		error)

	// UpdateSessionRemotePubKey can be used to add the given remote pub key
	// to the session with the given local pub key.
	UpdateSessionRemotePubKey(ctx context.Context, localPubKey,
		remotePubKey *btcec.PublicKey) error

	// GetSessionByID fetches the session with the given ID.
	GetSessionByID(ctx context.Context, id ID) (*Session, error)

	// DeleteReservedSessions deletes all sessions that are in the
	// StateReserved state.
	DeleteReservedSessions(ctx context.Context) error

	// ShiftState updates the state of the session with the given ID to the
	// "dest" state.
	ShiftState(ctx context.Context, id ID, dest State) error

	IDToGroupIndex
}
