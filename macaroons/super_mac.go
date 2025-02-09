package macaroons

import (
	"bytes"
	"context"
	"encoding/binary"
	"encoding/hex"
	"errors"

	"github.com/lightningnetwork/lnd/lnrpc"
	"gopkg.in/macaroon-bakery.v2/bakery"
	"gopkg.in/macaroon.v2"
)

// SuperMacaroonRootKeyPrefix is the prefix we set on a super macaroon's root
// key to clearly mark it as such.
var SuperMacaroonRootKeyPrefix = [4]byte{0xFF, 0xEE, 0xDD, 0xCC}

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

// BakeSuperMacaroon uses the lnd client to bake a macaroon that can include
// permissions for multiple daemons.
func BakeSuperMacaroon(ctx context.Context, lnd lnrpc.LightningClient,
	rootKeyID uint64, perms []bakery.Op, caveats []macaroon.Caveat) (string,
	error) {

	if lnd == nil {
		return "", errors.New("lnd not yet connected")
	}

	req := &lnrpc.BakeMacaroonRequest{
		Permissions: make(
			[]*lnrpc.MacaroonPermission, len(perms),
		),
		AllowExternalPermissions: true,
		RootKeyId:                rootKeyID,
	}
	for idx, perm := range perms {
		req.Permissions[idx] = &lnrpc.MacaroonPermission{
			Entity: perm.Entity,
			Action: perm.Action,
		}
	}

	res, err := lnd.BakeMacaroon(ctx, req)
	if err != nil {
		return "", err
	}

	mac, err := ParseMacaroon(res.Macaroon)
	if err != nil {
		return "", err
	}

	for _, caveat := range caveats {
		if err := mac.AddFirstPartyCaveat(caveat.Id); err != nil {
			return "", err
		}
	}

	macBytes, err := mac.MarshalBinary()
	if err != nil {
		return "", err
	}

	return hex.EncodeToString(macBytes), err
}
