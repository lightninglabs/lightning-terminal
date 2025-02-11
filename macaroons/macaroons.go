package macaroons

import (
	"context"
	"fmt"
	"strconv"

	"github.com/lightningnetwork/lnd/lnrpc"
	"google.golang.org/protobuf/proto"
	"gopkg.in/macaroon-bakery.v2/bakery"
	"gopkg.in/macaroon.v2"
)

// Baker is a function type for baking a super macaroon.
type Baker func(ctx context.Context, rootKeyID uint64,
	perms []bakery.Op, caveats []macaroon.Caveat) (string, error)

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
