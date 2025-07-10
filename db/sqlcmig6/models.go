package sqlcmig6

import (
	"database/sql"
	"time"
)

type Account struct {
	ID                 int64
	Alias              int64
	Label              sql.NullString
	Type               int16
	InitialBalanceMsat int64
	CurrentBalanceMsat int64
	LastUpdated        time.Time
	Expiration         time.Time
}

type AccountIndex struct {
	Name  string
	Value int64
}

type AccountInvoice struct {
	AccountID int64
	Hash      []byte
}

type AccountPayment struct {
	AccountID      int64
	Hash           []byte
	Status         int16
	FullAmountMsat int64
}

type Action struct {
	ID                 int64
	SessionID          sql.NullInt64
	AccountID          sql.NullInt64
	MacaroonIdentifier []byte
	ActorName          sql.NullString
	FeatureName        sql.NullString
	ActionTrigger      sql.NullString
	Intent             sql.NullString
	StructuredJsonData []byte
	RpcMethod          string
	RpcParamsJson      []byte
	CreatedAt          time.Time
	ActionState        int16
	ErrorReason        sql.NullString
}

type Feature struct {
	ID   int64
	Name string
}

type Kvstore struct {
	ID        int64
	Perm      bool
	RuleID    int64
	GroupID   sql.NullInt64
	FeatureID sql.NullInt64
	EntryKey  string
	Value     []byte
}

type PrivacyPair struct {
	GroupID   int64
	RealVal   string
	PseudoVal string
}

type Rule struct {
	ID   int64
	Name string
}

type Session struct {
	ID              int64
	Alias           []byte
	Label           string
	State           int16
	Type            int16
	Expiry          time.Time
	CreatedAt       time.Time
	RevokedAt       sql.NullTime
	ServerAddress   string
	DevServer       bool
	MacaroonRootKey int64
	PairingSecret   []byte
	LocalPrivateKey []byte
	LocalPublicKey  []byte
	RemotePublicKey []byte
	Privacy         bool
	AccountID       sql.NullInt64
	GroupID         sql.NullInt64
}

type SessionFeatureConfig struct {
	SessionID   int64
	FeatureName string
	Config      []byte
}

type SessionMacaroonCaveat struct {
	ID             int64
	SessionID      int64
	CaveatID       []byte
	VerificationID []byte
	Location       sql.NullString
}

type SessionMacaroonPermission struct {
	ID        int64
	SessionID int64
	Entity    string
	Action    string
}

type SessionPrivacyFlag struct {
	SessionID int64
	Flag      int32
}
