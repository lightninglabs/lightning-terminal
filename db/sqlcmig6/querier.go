package sqlcmig6

import (
	"context"
	"database/sql"
)

type Querier interface {
	AddAccountInvoice(ctx context.Context, arg AddAccountInvoiceParams) error
	DeleteAccount(ctx context.Context, id int64) error
	DeleteAccountPayment(ctx context.Context, arg DeleteAccountPaymentParams) error
	DeleteAllTempKVStores(ctx context.Context) error
	DeleteFeatureKVStoreRecord(ctx context.Context, arg DeleteFeatureKVStoreRecordParams) error
	DeleteGlobalKVStoreRecord(ctx context.Context, arg DeleteGlobalKVStoreRecordParams) error
	DeleteGroupKVStoreRecord(ctx context.Context, arg DeleteGroupKVStoreRecordParams) error
	DeleteSessionsWithState(ctx context.Context, state int16) error
	GetAccount(ctx context.Context, id int64) (Account, error)
	GetAccountByLabel(ctx context.Context, label sql.NullString) (Account, error)
	GetAccountIDByAlias(ctx context.Context, alias int64) (int64, error)
	GetAccountIndex(ctx context.Context, name string) (int64, error)
	GetAccountInvoice(ctx context.Context, arg GetAccountInvoiceParams) (AccountInvoice, error)
	GetAccountPayment(ctx context.Context, arg GetAccountPaymentParams) (AccountPayment, error)
	GetAliasBySessionID(ctx context.Context, id int64) ([]byte, error)
	GetAllPrivacyPairs(ctx context.Context, groupID int64) ([]GetAllPrivacyPairsRow, error)
	GetFeatureID(ctx context.Context, name string) (int64, error)
	GetFeatureKVStoreRecord(ctx context.Context, arg GetFeatureKVStoreRecordParams) ([]byte, error)
	GetGlobalKVStoreRecord(ctx context.Context, arg GetGlobalKVStoreRecordParams) ([]byte, error)
	GetGroupKVStoreRecord(ctx context.Context, arg GetGroupKVStoreRecordParams) ([]byte, error)
	GetOrInsertFeatureID(ctx context.Context, name string) (int64, error)
	GetOrInsertRuleID(ctx context.Context, name string) (int64, error)
	GetPseudoForReal(ctx context.Context, arg GetPseudoForRealParams) (string, error)
	GetRealForPseudo(ctx context.Context, arg GetRealForPseudoParams) (string, error)
	GetRuleID(ctx context.Context, name string) (int64, error)
	GetSessionAliasesInGroup(ctx context.Context, groupID sql.NullInt64) ([][]byte, error)
	GetSessionByAlias(ctx context.Context, alias []byte) (Session, error)
	GetSessionByID(ctx context.Context, id int64) (Session, error)
	GetSessionByLocalPublicKey(ctx context.Context, localPublicKey []byte) (Session, error)
	GetSessionFeatureConfigs(ctx context.Context, sessionID int64) ([]SessionFeatureConfig, error)
	GetSessionIDByAlias(ctx context.Context, alias []byte) (int64, error)
	GetSessionMacaroonCaveats(ctx context.Context, sessionID int64) ([]SessionMacaroonCaveat, error)
	GetSessionMacaroonPermissions(ctx context.Context, sessionID int64) ([]SessionMacaroonPermission, error)
	GetSessionPrivacyFlags(ctx context.Context, sessionID int64) ([]SessionPrivacyFlag, error)
	GetSessionsInGroup(ctx context.Context, groupID sql.NullInt64) ([]Session, error)
	InsertAccount(ctx context.Context, arg InsertAccountParams) (int64, error)
	InsertAction(ctx context.Context, arg InsertActionParams) (int64, error)
	InsertKVStoreRecord(ctx context.Context, arg InsertKVStoreRecordParams) error
	InsertPrivacyPair(ctx context.Context, arg InsertPrivacyPairParams) error
	InsertSession(ctx context.Context, arg InsertSessionParams) (int64, error)
	InsertSessionFeatureConfig(ctx context.Context, arg InsertSessionFeatureConfigParams) error
	InsertSessionMacaroonCaveat(ctx context.Context, arg InsertSessionMacaroonCaveatParams) error
	InsertSessionMacaroonPermission(ctx context.Context, arg InsertSessionMacaroonPermissionParams) error
	InsertSessionPrivacyFlag(ctx context.Context, arg InsertSessionPrivacyFlagParams) error
	ListAccountInvoices(ctx context.Context, accountID int64) ([]AccountInvoice, error)
	ListAccountPayments(ctx context.Context, accountID int64) ([]AccountPayment, error)
	ListAllAccounts(ctx context.Context) ([]Account, error)
	ListAllKVStoresRecords(ctx context.Context) ([]Kvstore, error)
	ListSessions(ctx context.Context) ([]Session, error)
	ListSessionsByState(ctx context.Context, state int16) ([]Session, error)
	ListSessionsByType(ctx context.Context, type_ int16) ([]Session, error)
	SetAccountIndex(ctx context.Context, arg SetAccountIndexParams) error
	SetActionState(ctx context.Context, arg SetActionStateParams) error
	SetSessionGroupID(ctx context.Context, arg SetSessionGroupIDParams) error
	SetSessionRemotePublicKey(ctx context.Context, arg SetSessionRemotePublicKeyParams) error
	SetSessionRevokedAt(ctx context.Context, arg SetSessionRevokedAtParams) error
	UpdateAccountBalance(ctx context.Context, arg UpdateAccountBalanceParams) (int64, error)
	UpdateAccountExpiry(ctx context.Context, arg UpdateAccountExpiryParams) (int64, error)
	UpdateAccountLastUpdate(ctx context.Context, arg UpdateAccountLastUpdateParams) (int64, error)
	UpdateFeatureKVStoreRecord(ctx context.Context, arg UpdateFeatureKVStoreRecordParams) error
	UpdateGlobalKVStoreRecord(ctx context.Context, arg UpdateGlobalKVStoreRecordParams) error
	UpdateGroupKVStoreRecord(ctx context.Context, arg UpdateGroupKVStoreRecordParams) error
	UpdateSessionState(ctx context.Context, arg UpdateSessionStateParams) error
	UpsertAccountPayment(ctx context.Context, arg UpsertAccountPaymentParams) error
}

var _ Querier = (*Queries)(nil)
