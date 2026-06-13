package macaroons

import (
	"bytes"
	"context"
	"encoding/binary"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/lightningnetwork/lnd/lnrpc"
	"google.golang.org/protobuf/proto"
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

// SuperMacaroonExists determines whether a macaroon file exists at the given
// path.
func SuperMacaroonExists(path string) bool {
	if _, err := os.Stat(path); err != nil {
		return false
	}

	return true
}

// MacaroonMatchesPermissions checks if the macaroon at the given path contains
// exactly the expected permissions (no more and no less).
func MacaroonMatchesPermissions(path string,
	expectedPerms []bakery.Op) (bool, error) {

	macBytes, err := os.ReadFile(path)
	if err != nil {
		return false, err
	}

	mac := &macaroon.Macaroon{}
	if err := mac.UnmarshalBinary(macBytes); err != nil {
		return false, err
	}

	rawID := mac.Id()
	if len(rawID) == 0 || rawID[0] != byte(bakery.LatestVersion) {
		return false, errors.New("invalid macaroon version")
	}

	decodedID := &lnrpc.MacaroonId{}
	if err := proto.Unmarshal(rawID[1:], decodedID); err != nil {
		return false, err
	}

	// Map expected permissions for easy lookup: entity -> action -> true.
	expectedMap := make(map[string]map[string]bool)
	for _, op := range expectedPerms {
		if expectedMap[op.Entity] == nil {
			expectedMap[op.Entity] = make(map[string]bool)
		}

		expectedMap[op.Entity][op.Action] = true
	}

	// Map actual permissions from decoded macaroon ID:
	// entity -> action -> true.
	actualMap := make(map[string]map[string]bool)
	for _, op := range decodedID.Ops {
		if op == nil {
			continue
		}
		if actualMap[op.Entity] == nil {
			actualMap[op.Entity] = make(map[string]bool)
		}
		for _, action := range op.Actions {
			actualMap[op.Entity][action] = true
		}
	}

	// Compare the mapped sets for exact equality.
	if len(expectedMap) != len(actualMap) {
		return false, nil
	}

	for entity, actions := range expectedMap {
		actualActions, ok := actualMap[entity]

		if !ok || len(actions) != len(actualActions) {
			return false, nil
		}
		for action := range actions {
			if !actualActions[action] {
				return false, nil
			}
		}
	}

	return true, nil
}

// BakeAndWriteSuperMacaroon bakes a super macaroon and writes it to disk.
func BakeAndWriteSuperMacaroon(ctx context.Context, lnd lnrpc.LightningClient,
	path string, perms []bakery.Op) error {

	var suffixBytes [4]byte
	rootKeyID := NewSuperMacaroonRootKeyID(suffixBytes)

	superMacHex, err := BakeSuperMacaroon(
		ctx, lnd, rootKeyID, perms, nil,
	)
	if err != nil {
		return fmt.Errorf("unable to bake super macaroon: %w", err)
	}

	superMacBytes, err := hex.DecodeString(superMacHex)
	if err != nil {
		return fmt.Errorf("unable to decode baked "+
			"super macaroon: %w", err)
	}

	if err := os.WriteFile(path, superMacBytes, 0600); err != nil {
		return fmt.Errorf("unable to write super macaroon to %v: %w",
			path, err)
	}

	return nil
}

// HasMacaroonSuffix checks that the super macaroon path is not empty and ends
// with the expected suffix.
func HasMacaroonSuffix(path string) error {
	if path == "" {
		return fmt.Errorf("super-macaroon-path cannot be empty")
	}

	if !strings.HasSuffix(path, ".macaroon") {
		return fmt.Errorf("super-macaroon-path must end with the " +
			".macaroon suffix")
	}

	return nil
}
