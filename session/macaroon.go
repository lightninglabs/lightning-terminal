package session

import (
	"encoding/binary"
	"fmt"

	"github.com/btcsuite/btcd/btcec/v2"
	"github.com/lightninglabs/lightning-terminal/macaroons"
	"gopkg.in/macaroon.v2"
)

// ID represents the id of a session.
type ID [4]byte

// IDFromMacaroon is a helper function that creates a session ID from
// a macaroon ID.
func IDFromMacaroon(mac *macaroon.Macaroon) (ID, error) {
	rootKeyID, err := macaroons.RootKeyIDFromMacaroon(mac)
	if err != nil {
		return ID{}, err
	}

	return IDFromMacRootKeyID(rootKeyID), nil
}

// IDFromMacRootKeyID converts a macaroon root key ID to a session ID.
func IDFromMacRootKeyID(rootKeyID uint64) ID {
	rootKeyBytes := make([]byte, 8)
	binary.BigEndian.PutUint64(rootKeyBytes[:], rootKeyID)

	var id ID
	copy(id[:], rootKeyBytes[4:])

	return id
}

// IDFromBytes is a helper function that creates a session ID from a byte slice.
func IDFromBytes(b []byte) (ID, error) {
	var id ID
	if len(b) != 4 {
		return id, fmt.Errorf("session ID must be 4 bytes long")
	}
	copy(id[:], b)
	return id, nil
}

// NewSessionPrivKeyAndID randomly derives a new private key and session ID
// pair.
func NewSessionPrivKeyAndID() (*btcec.PrivateKey, ID, error) {
	var id ID

	privateKey, err := btcec.NewPrivateKey()
	if err != nil {
		return nil, id, fmt.Errorf("error deriving private key: %v",
			err)
	}

	pubKey := privateKey.PubKey()

	// NOTE: we use 4 bytes [1:5] of the serialised public key to create the
	// macaroon root key base along with the Session ID. This will provide
	// 4 bytes of entropy. Previously, bytes [0:4] where used but this
	// resulted in lower entropy due to the first byte always being either
	// 0x02 or 0x03.
	copy(id[:], pubKey.SerializeCompressed()[1:5])

	log.Debugf("Generated new Session ID: %x", id)

	return privateKey, id, nil
}
