package migration1

import (
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
}

// NewSession creates a new session with the given user-defined parameters.
func NewSession(label string, typ Type, expiry time.Time, serverAddr string,
	devServer bool, perms []bakery.Op, caveats []macaroon.Caveat,
	featureConfig FeaturesConfig, privacy bool) (*Session, error) {

	_, pairingSecret, err := mailbox.NewPassphraseEntropy()
	if err != nil {
		return nil, fmt.Errorf("error deriving pairing secret: %v", err)
	}

	privateKey, err := btcec.NewPrivateKey()
	if err != nil {
		return nil, fmt.Errorf("error deriving private key: %v", err)
	}
	pubKey := privateKey.PubKey()

	// NOTE: after this migration, no new sessions use the first 4 bytes of
	// the serialised pub key for the macaroon root key. After this
	// migration, bytes 1-4 are used (instead of 0-3) this is so that we
	// get the full 4 byte entropy instead of wasting one byte on the 0x02
	// and 0x03 prefix of the public key.
	var macRootKeyBase [4]byte
	copy(macRootKeyBase[:], pubKey.SerializeCompressed())
	macRootKey := NewSuperMacaroonRootKeyID(macRootKeyBase)

	sess := &Session{
		ID:                macRootKeyBase,
		Label:             label,
		State:             StateCreated,
		Type:              typ,
		Expiry:            expiry,
		CreatedAt:         time.Now(),
		ServerAddr:        serverAddr,
		DevServer:         devServer,
		MacaroonRootKey:   macRootKey,
		PairingSecret:     pairingSecret,
		LocalPrivateKey:   privateKey,
		LocalPublicKey:    pubKey,
		RemotePublicKey:   nil,
		WithPrivacyMapper: privacy,
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
