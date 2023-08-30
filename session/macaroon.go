package session

import (
	"bytes"
	"context"
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"strconv"

	"github.com/btcsuite/btcd/btcec/v2"
	"github.com/lightningnetwork/lnd/lnrpc"
	"google.golang.org/protobuf/proto"
	"gopkg.in/macaroon-bakery.v2/bakery"
	"gopkg.in/macaroon.v2"
)

var (
	// SuperMacaroonRootKeyPrefix is the prefix we set on a super macaroon's
	// root key to clearly mark it as such.
	SuperMacaroonRootKeyPrefix = [4]byte{0xFF, 0xEE, 0xDD, 0xCC}
)

// ID represents the id of a session.
type ID [4]byte

// SuperMacaroonValidator is a function type for validating a super macaroon.
type SuperMacaroonValidator func(ctx context.Context,
	superMacaroon []byte, requiredPermissions []bakery.Op,
	fullMethod string) error

// NewSuperMacaroonRootKeyID returns a new macaroon root key ID that has the
// prefix to mark it as a super macaroon root key.
func NewSuperMacaroonRootKeyID(id [4]byte) uint64 {
	rootKeyBytes := make([]byte, 8)
	copy(rootKeyBytes[:], SuperMacaroonRootKeyPrefix[:])
	copy(rootKeyBytes[4:], id[:])
	return binary.BigEndian.Uint64(rootKeyBytes)
}

// ParseMacaroon parses a hex encoded macaroon into its native struct.
func ParseMacaroon(macHex string) (*macaroon.Macaroon, error) {
	macBytes, err := hex.DecodeString(macHex)
	if err != nil {
		return nil, err
	}

	mac := &macaroon.Macaroon{}
	if err := mac.UnmarshalBinary(macBytes); err != nil {
		return nil, err
	}

	return mac, nil
}

// IsSuperMacaroon returns true if the given hex encoded macaroon is a super
// macaroon baked by LiT which can be identified by its root key ID.
func IsSuperMacaroon(macHex string) bool {
	mac, err := ParseMacaroon(macHex)
	if err != nil {
		return false
	}

	rootKeyID, err := RootKeyIDFromMacaroon(mac)
	if err != nil {
		return false
	}

	return isSuperMacaroonRootKeyID(rootKeyID)
}

// isSuperMacaroonRootKeyID returns true if the given macaroon root key ID (also
// known as storage ID) is a super macaroon, which can be identified by its
// first 4 bytes.
func isSuperMacaroonRootKeyID(rootKeyID uint64) bool {
	rootKeyBytes := make([]byte, 8)
	binary.BigEndian.PutUint64(rootKeyBytes, rootKeyID)
	return bytes.HasPrefix(rootKeyBytes, SuperMacaroonRootKeyPrefix[:])
}

// IDFromMacaroon is a helper function that creates a session ID from
// a macaroon ID.
func IDFromMacaroon(mac *macaroon.Macaroon) (ID, error) {
	rootKeyID, err := RootKeyIDFromMacaroon(mac)
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

// RootKeyIDFromMacaroon extracts the root key ID of the passed macaroon.
func RootKeyIDFromMacaroon(mac *macaroon.Macaroon) (uint64, error) {
	rawID := mac.Id()
	if rawID[0] != byte(bakery.LatestVersion) {
		return 0, fmt.Errorf("mac id is not on the latest version")
	}

	decodedID := &lnrpc.MacaroonId{}
	idProto := rawID[1:]
	err := proto.Unmarshal(idProto, decodedID)
	if err != nil {
		return 0, err
	}

	// The storage ID is a string representation of a 64-bit unsigned
	// number.
	return strconv.ParseUint(string(decodedID.StorageId), 10, 64)
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
