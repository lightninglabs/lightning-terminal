package session

import (
	"encoding/hex"

	"google.golang.org/grpc/metadata"
)

type contextKey struct {
	name string
}

var sessionIDCtxKey = contextKey{"lit_session_id"}

func FromGrpcMD(md metadata.MD) (ID, bool, error) {
	val := md.Get(sessionIDCtxKey.name)
	if len(val) == 0 {
		return ID{}, false, nil
	}

	b, err := hex.DecodeString(val[0])
	if err != nil {
		return ID{}, false, err
	}

	sessID, err := IDFromBytes(b)
	if err != nil {
		return ID{}, false, err
	}

	return sessID, true, nil
}

func AddToGrpcMD(md metadata.MD, id ID) {
	md.Set(sessionIDCtxKey.name, hex.EncodeToString(id[:]))
}
