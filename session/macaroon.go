package session

import (
	"bytes"
	"context"
	"encoding/binary"
	"encoding/hex"
	"strconv"

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

	rawID := mac.Id()
	if rawID[0] != byte(bakery.LatestVersion) {
		return false
	}
	decodedID := &lnrpc.MacaroonId{}
	idProto := rawID[1:]
	err = proto.Unmarshal(idProto, decodedID)
	if err != nil {
		return false
	}

	// The storage ID is a string representation of a 64bit unsigned number.
	rootKeyID, err := strconv.ParseUint(string(decodedID.StorageId), 10, 64)
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
