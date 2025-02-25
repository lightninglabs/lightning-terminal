package session

import (
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
StateCreated ---
       		\---> StateRevoked (terminal)
*/

const (
	// StateCreated is the state of a session once it has been fully
	// committed to the Store and is ready to be used. This is the first
	// state of a session.
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

	// StateReserved is a temporary initial state of a session. On start-up,
	// any sessions in this state should be cleaned up.
	//
	// NOTE: this isn't used yet.
	StateReserved State = 4
)

// Terminal returns true if the state is a terminal state.
func (s State) Terminal() bool {
	return s == StateExpired || s == StateRevoked
}

// legalStateShifts is a map that defines the legal State transitions that a
// Session can be put through.
var legalStateShifts = map[State]map[State]bool{
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
	created, expiry time.Time, serverAddr string, devServer bool,
	perms []bakery.Op, caveats []macaroon.Caveat,
	featureConfig FeaturesConfig, privacy bool, linkedGroupID *ID,
	flags PrivacyFlags) (*Session, error) {

	_, pairingSecret, err := mailbox.NewPassphraseEntropy()
	if err != nil {
		return nil, fmt.Errorf("error deriving pairing secret: %v", err)
	}

	macRootKey := macaroons.NewSuperMacaroonRootKeyID(id)

	// The group ID will by default be the same as the Session ID
	// unless this session links to a previous session.
	groupID := id
	if linkedGroupID != nil {
		// If this session is linked to a previous session, then the
		// group ID is the same as the linked session's group ID.
		groupID = *linkedGroupID
	}

	sess := &Session{
		ID:                id,
		Label:             label,
		State:             StateCreated,
		Type:              typ,
		Expiry:            expiry.UTC(),
		CreatedAt:         created.UTC(),
		ServerAddr:        serverAddr,
		DevServer:         devServer,
		MacaroonRootKey:   macRootKey,
		PairingSecret:     pairingSecret,
		LocalPrivateKey:   localPrivKey,
		LocalPublicKey:    localPrivKey.PubKey(),
		RemotePublicKey:   nil,
		WithPrivacyMapper: privacy,
		PrivacyFlags:      flags,
		GroupID:           groupID,
	}

	if perms != nil || caveats != nil {
		sess.MacaroonRecipe = &MacaroonRecipe{
			Permissions: perms,
			Caveats:     caveats,
		}
	}

	if len(featureConfig) != 0 {
		sess.FeatureConfig = &featureConfig
	}

	return sess, nil
}

// IDToGroupIndex defines an interface for the session ID to group ID index.
type IDToGroupIndex interface {
	// GetGroupID will return the group ID for the given session ID.
	GetGroupID(sessionID ID) (ID, error)

	// GetSessionIDs will return the set of session IDs that are in the
	// group with the given ID.
	GetSessionIDs(groupID ID) ([]ID, error)
}

// Store is the interface a persistent storage must implement for storing and
// retrieving Terminal Connect sessions.
type Store interface {
	// NewSession creates a new session with the given user-defined
	// parameters.
	//
	// NOTE: currently this purely a constructor of the Session type and
	// does not make any database calls. This will be changed in a future
	// commit.
	NewSession(id ID, localPrivKey *btcec.PrivateKey, label string,
		typ Type, expiry time.Time, serverAddr string, devServer bool,
		perms []bakery.Op, caveats []macaroon.Caveat,
		featureConfig FeaturesConfig, privacy bool, linkedGroupID *ID,
		flags PrivacyFlags) (*Session, error)

	// CreateSession adds a new session to the store. If a session with the
	// same local public key already exists an error is returned. This
	// can only be called with a Session with an ID that the Store has
	// reserved.
	CreateSession(*Session) error

	// GetSession fetches the session with the given key.
	GetSession(key *btcec.PublicKey) (*Session, error)

	// ListAllSessions returns all sessions currently known to the store.
	ListAllSessions() ([]*Session, error)

	// ListSessionsByType returns all sessions of the given type.
	ListSessionsByType(t Type) ([]*Session, error)

	// ListSessionsByState returns all sessions currently known to the store
	// that are in the given states.
	ListSessionsByState(...State) ([]*Session, error)

	// UpdateSessionRemotePubKey can be used to add the given remote pub key
	// to the session with the given local pub key.
	UpdateSessionRemotePubKey(localPubKey,
		remotePubKey *btcec.PublicKey) error

	// GetUnusedIDAndKeyPair can be used to generate a new, unused, local
	// private key and session ID pair. Care must be taken to ensure that no
	// other thread calls this before the returned ID and key pair from this
	// method are either used or discarded.
	GetUnusedIDAndKeyPair() (ID, *btcec.PrivateKey, error)

	// GetSessionByID fetches the session with the given ID.
	GetSessionByID(id ID) (*Session, error)

	// CheckSessionGroupPredicate iterates over all the sessions in a group
	// and checks if each one passes the given predicate function. True is
	// returned if each session passes.
	CheckSessionGroupPredicate(groupID ID,
		fn func(s *Session) bool) (bool, error)

	// DeleteReservedSessions deletes all sessions that are in the
	// StateReserved state.
	DeleteReservedSessions() error

	// ShiftState updates the state of the session with the given ID to the
	// "dest" state.
	ShiftState(id ID, dest State) error

	IDToGroupIndex
}
