package session

import (
	"context"
	"fmt"
	"time"

	"github.com/btcsuite/btcd/btcec/v2"
	"github.com/lightninglabs/lightning-node-connect/mailbox"
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

const (
	StateCreated State = 0
	StateInUse   State = 1
	StateRevoked State = 2
	StateExpired State = 3
)

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

	// GroupID is the Session ID of the very first Session in the linked
	// group of sessions. If this is the very first session in the group
	// then this will be the same as ID.
	GroupID ID
}

// MacaroonBaker is a function type for baking a super macaroon.
type MacaroonBaker func(ctx context.Context, rootKeyID uint64,
	recipe *MacaroonRecipe) (string, error)

// NewSession creates a new session with the given user-defined parameters.
func NewSession(id ID, localPrivKey *btcec.PrivateKey, label string, typ Type,
	expiry time.Time, serverAddr string, devServer bool, perms []bakery.Op,
	caveats []macaroon.Caveat, featureConfig FeaturesConfig,
	privacy bool, linkedGroupID *ID) (*Session, error) {

	_, pairingSecret, err := mailbox.NewPassphraseEntropy()
	if err != nil {
		return nil, fmt.Errorf("error deriving pairing secret: %v", err)
	}

	macRootKey := NewSuperMacaroonRootKeyID(id)

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
		Expiry:            expiry,
		CreatedAt:         time.Now(),
		ServerAddr:        serverAddr,
		DevServer:         devServer,
		MacaroonRootKey:   macRootKey,
		PairingSecret:     pairingSecret,
		LocalPrivateKey:   localPrivKey,
		LocalPublicKey:    localPrivKey.PubKey(),
		RemotePublicKey:   nil,
		WithPrivacyMapper: privacy,
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
	// CreateSession adds a new session to the store. If a session with the
	// same local public key already exists an error is returned. This
	// can only be called with a Session with an ID that the Store has
	// reserved.
	CreateSession(*Session) error

	// GetSession fetches the session with the given key.
	GetSession(key *btcec.PublicKey) (*Session, error)

	// ListSessions returns all sessions currently known to the store.
	ListSessions(filterFn func(s *Session) bool) ([]*Session, error)

	// RevokeSession updates the state of the session with the given local
	// public key to be revoked.
	RevokeSession(*btcec.PublicKey) error

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

	IDToGroupIndex
}
