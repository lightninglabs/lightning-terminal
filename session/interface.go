package session

import (
	"encoding/binary"
	"fmt"
	"time"

	"github.com/btcsuite/btcd/btcec"
	"github.com/lightninglabs/lightning-node-connect/mailbox"
	"gopkg.in/macaroon.v2"
)

// Type represents the type of session.
type Type uint8

const (
	TypeMacaroonReadonly Type = 0
	TypeMacaroonAdmin    Type = 1
	TypeMacaroonCustom   Type = 2
	TypeUIPassword       Type = 3
)

// State represents the state of a session.
type State uint8

const (
	StateCreated State = 0
	StateInUse   State = 1
	StateRevoked State = 2
	StateExpired State = 3
)

// Session is a struct representing a long-term Terminal Connect session.
type Session struct {
	Label           string
	State           State
	Type            Type
	Expiry          time.Time
	ServerAddr      string
	DevServer       bool
	MacaroonRootKey uint64
	Macaroon        *macaroon.Macaroon
	PairingSecret   [mailbox.NumPasswordBytes]byte
	LocalPrivateKey *btcec.PrivateKey
	LocalPublicKey  *btcec.PublicKey
	RemotePublicKey *btcec.PublicKey
}

// NewSession creates a new session with the given user-defined parameters.
func NewSession(label string, typ Type, expiry time.Time, serverAddr string,
	devServer bool) (*Session, error) {

	_, pairingSecret, err := mailbox.NewPassword()
	if err != nil {
		return nil, fmt.Errorf("error deriving pairing secret: %v", err)
	}

	privateKey, err := btcec.NewPrivateKey(btcec.S256())
	if err != nil {
		return nil, fmt.Errorf("error deriving private key: %v", err)
	}
	pubKey := privateKey.PubKey()
	macRootKey := binary.BigEndian.Uint64(pubKey.SerializeCompressed()[0:8])

	return &Session{
		Label:           label,
		State:           StateCreated,
		Type:            typ,
		Expiry:          expiry,
		ServerAddr:      serverAddr,
		DevServer:       devServer,
		MacaroonRootKey: macRootKey,
		PairingSecret:   pairingSecret,
		LocalPrivateKey: privateKey,
		LocalPublicKey:  pubKey,
		RemotePublicKey: nil,
	}, nil
}

// Store is the interface a persistent storage must implement for storing and
// retrieving Terminal Connect sessions.
type Store interface {
	// StoreSession stores a session in the store. If a session with the
	// same local public key already exists, the existing record is updated/
	// overwritten instead.
	StoreSession(*Session) error

	// ListSessions returns all sessions currently known to the store.
	ListSessions() ([]*Session, error)

	// RevokeSession updates the state of the session with the given local
	// public key to be revoked.
	RevokeSession(*btcec.PublicKey) error
}
