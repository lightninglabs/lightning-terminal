package migration1

import (
	"encoding/binary"
)

var (
	// SuperMacaroonRootKeyPrefix is the prefix we set on a super macaroon's
	// root key to clearly mark it as such.
	SuperMacaroonRootKeyPrefix = [4]byte{0xFF, 0xEE, 0xDD, 0xCC}
)

// ID represents the id of a session.
type ID [4]byte

// NewSuperMacaroonRootKeyID returns a new macaroon root key ID that has the
// prefix to mark it as a super macaroon root key.
func NewSuperMacaroonRootKeyID(id [4]byte) uint64 {
	rootKeyBytes := make([]byte, 8)
	copy(rootKeyBytes[:], SuperMacaroonRootKeyPrefix[:])
	copy(rootKeyBytes[4:], id[:])
	return binary.BigEndian.Uint64(rootKeyBytes)
}

// IDFromMacRootKeyID converts a macaroon root key ID to a session ID.
func IDFromMacRootKeyID(rootKeyID uint64) ID {
	rootKeyBytes := make([]byte, 8)
	binary.BigEndian.PutUint64(rootKeyBytes[:], rootKeyID)

	var id ID
	copy(id[:], rootKeyBytes[4:])

	return id
}
