package firewalldb

import (
	"context"
	"database/sql"
	"encoding/binary"
	"errors"
	"fmt"
	"math"

	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightninglabs/lightning-terminal/db/sqlc"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/fn"
	"github.com/lightningnetwork/lnd/sqldb"
)

// SQLAccountQueries is a subset of the sqlc.Queries interface that can be used
// to interact with the accounts table.
type SQLAccountQueries interface {
	GetAccount(ctx context.Context, id int64) (sqlc.Account, error)
	GetAccountIDByAlias(ctx context.Context, alias int64) (int64, error)
}

// SQLActionQueries is a subset of the sqlc.Queries interface that can be used
// to interact with action related tables.
//
//nolint:ll
type SQLActionQueries interface {
	SQLSessionQueries
	SQLAccountQueries

	InsertAction(ctx context.Context, arg sqlc.InsertActionParams) (int64, error)
	SetActionState(ctx context.Context, arg sqlc.SetActionStateParams) error
	ListActions(ctx context.Context, arg sqlc.ListActionsParams) ([]sqlc.Action, error)
	CountActions(ctx context.Context, arg sqlc.ActionQueryParams) (int64, error)
	GetAction(ctx context.Context, id int64) (sqlc.Action, error)
}

// sqlActionLocator helps us find an action in the SQL DB.
type sqlActionLocator struct {
	// id is the DB level ID of the action.
	id int64
}

func (s *sqlActionLocator) isActionLocator() {}

// A compile-time check to ensure sqlActionLocator implements the ActionLocator
// interface.
var _ ActionLocator = (*sqlActionLocator)(nil)

// GetActionsReadDB is a method on DB that constructs an ActionsReadDB.
//
// NOTE: This is part of the ActionDB interface.
func (s *SQLDB) GetActionsReadDB(groupID session.ID,
	featureName string) ActionsReadDB {

	return &allActionsReadDB{
		db:          s,
		groupID:     groupID,
		featureName: featureName,
	}
}

// AddAction persists the given action to the database.
//
// NOTE: This is a part of the ActionDB interface.
func (s *SQLDB) AddAction(ctx context.Context,
	req *AddActionReq) (ActionLocator, error) {

	var (
		writeTxOpts db.QueriesTxOptions
		locator     sqlActionLocator

		actor = sql.NullString{
			String: req.ActorName,
			Valid:  req.ActorName != "",
		}
		feature = sql.NullString{
			String: req.FeatureName,
			Valid:  req.FeatureName != "",
		}
		trigger = sql.NullString{
			String: req.Trigger,
			Valid:  req.Trigger != "",
		}
		intent = sql.NullString{
			String: req.Intent,
			Valid:  req.Intent != "",
		}
	)

	err := s.db.ExecTx(ctx, &writeTxOpts, func(db SQLQueries) error {
		// Do best effort to see if this action is linked to a session,
		// and/or an action or none.
		var (
			sessionID sql.NullInt64
			accountID sql.NullInt64
		)

		// First check session DB.
		var sessErr error
		req.SessionID.WhenSome(func(alias session.ID) {
			sessID, err := db.GetSessionIDByAlias(ctx, alias[:])
			if errors.Is(err, sql.ErrNoRows) {
				sessErr = session.ErrSessionNotFound
				return
			} else if err != nil {
				sessErr = err
				return
			}

			sessionID = sqldb.SQLInt64(sessID)
		})
		if sessErr != nil {
			return sessErr
		}

		// If an account ID was provided, then it must exist in our DB.
		var getAcctErr error
		req.AccountID.WhenSome(func(alias accounts.AccountID) {
			aliasInt, err := alias.ToInt64()
			if err != nil {
				getAcctErr = err
				return
			}

			acctID, err := db.GetAccountIDByAlias(ctx, aliasInt)
			if errors.Is(err, sql.ErrNoRows) {
				getAcctErr = accounts.ErrAccNotFound
				return
			} else if err != nil {
				getAcctErr = err
				return
			}

			accountID = sqldb.SQLInt64(acctID)
		})
		if getAcctErr != nil {
			return getAcctErr
		}

		var macID []byte
		req.MacaroonRootKeyID.WhenSome(func(rootKeyID uint64) {
			rootKeyBytes := make([]byte, 8)
			binary.BigEndian.PutUint64(rootKeyBytes[:], rootKeyID)

			macID = rootKeyBytes
		})

		id, err := db.InsertAction(ctx, sqlc.InsertActionParams{
			SessionID:          sessionID,
			AccountID:          accountID,
			ActorName:          actor,
			MacaroonIdentifier: macID,
			FeatureName:        feature,
			ActionTrigger:      trigger,
			Intent:             intent,
			StructuredJsonData: []byte(req.StructuredJsonData),
			RpcMethod:          req.RPCMethod,
			RpcParamsJson:      req.RPCParamsJson,
			CreatedAt:          s.clock.Now().UTC(),
			ActionState:        int16(ActionStateInit),
		})
		if err != nil {
			return err
		}

		locator = sqlActionLocator{
			id: id,
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return &locator, nil
}

// SetActionState finds the action specified by the ActionLocator and sets its
// state to the given state.
//
// NOTE: This is a part of the ActionDB interface.
func (s *SQLDB) SetActionState(ctx context.Context, al ActionLocator,
	state ActionState, errReason string) error {

	if errReason != "" && state != ActionStateError {
		return fmt.Errorf("error reason should only be set for " +
			"ActionStateError")
	}

	locator, ok := al.(*sqlActionLocator)
	if !ok {
		return fmt.Errorf("expected sqlActionLocator, got %T", al)
	}

	var writeTxOpts db.QueriesTxOptions
	return s.db.ExecTx(ctx, &writeTxOpts, func(db SQLQueries) error {
		return db.SetActionState(ctx, sqlc.SetActionStateParams{
			ID:          locator.id,
			ActionState: int16(state),
			ErrorReason: sql.NullString{
				String: errReason,
				Valid:  errReason != "",
			},
		})
	})
}

// ListActions returns a list of Actions. The query IndexOffset and MaxNum
// params can be used to control the number of actions returned.
// ListActionOptions may be used to filter on specific Action values. The return
// values are the list of actions, the last index and the total count (iff
// query.CountTotal is set).
//
// NOTE: This is part of the ActionDB interface.
func (s *SQLDB) ListActions(ctx context.Context,
	query *ListActionsQuery, options ...ListActionOption) ([]*Action,
	uint64, uint64, error) {

	opts := newListActionOptions()
	for _, o := range options {
		o(opts)
	}

	var (
		readTxOpts = db.NewQueryReadTx()
		actions    []*Action
		lastIndex  uint64
		totalCount int64
	)
	err := s.db.ExecTx(ctx, &readTxOpts, func(db SQLQueries) error {
		var (
			actorName = sql.NullString{
				String: opts.actorName,
				Valid:  opts.actorName != "",
			}
			feature = sql.NullString{
				String: opts.featureName,
				Valid:  opts.featureName != "",
			}
			rpcMethod = sql.NullString{
				String: opts.methodName,
				Valid:  opts.methodName != "",
			}
			actionState = sql.NullInt16{
				Int16: int16(opts.state),
				Valid: opts.state != 0,
			}
			startTime = sql.NullTime{
				Time:  opts.startTime,
				Valid: !opts.startTime.IsZero(),
			}
			endTime = sql.NullTime{
				Time:  opts.endTime,
				Valid: !opts.endTime.IsZero(),
			}
		)

		var sessionID sql.NullInt64
		if opts.sessionID != session.EmptyID {
			sID, err := db.GetSessionIDByAlias(
				ctx, opts.sessionID[:],
			)
			if errors.Is(err, sql.ErrNoRows) {
				return session.ErrSessionNotFound
			} else if err != nil {
				return fmt.Errorf("unable to get DB ID for "+
					"legacy session ID %x: %w",
					opts.sessionID, err)
			}

			sessionID = sqldb.SQLInt64(sID)
		}

		var groupID sql.NullInt64
		if opts.groupID != session.EmptyID {
			gID, err := db.GetSessionIDByAlias(ctx, opts.groupID[:])
			if errors.Is(err, sql.ErrNoRows) {
				return session.ErrUnknownGroup
			} else if err != nil {
				return fmt.Errorf("unable to get DB ID for "+
					"legacy group ID %x: %w", opts.groupID,
					err)
			}

			groupID = sqldb.SQLInt64(gID)
		}

		var (
			dbActions []sqlc.Action
			err       error
		)
		actionQueryParams := sqlc.ActionQueryParams{
			SessionID:   sessionID,
			GroupID:     groupID,
			FeatureName: feature,
			ActorName:   actorName,
			RpcMethod:   rpcMethod,
			State:       actionState,
			EndTime:     endTime,
			StartTime:   startTime,
		}
		queryParams := sqlc.ListActionsParams{
			ActionQueryParams: actionQueryParams,
			Reversed:          false,
		}
		if query != nil {
			queryParams.Reversed = query.Reversed
			queryParams.Pagination = &sqlc.Pagination{
				NumLimit: func() int32 {
					if query.MaxNum == 0 {
						return int32(math.MaxInt32)
					}

					return int32(query.MaxNum)
				}(),
				NumOffset: int32(query.IndexOffset),
			}
		}

		dbActions, err = db.ListActions(ctx, queryParams)
		if err != nil {
			return fmt.Errorf("unable to list actions: %w", err)
		}

		// If pagination was used, then the number of results returned
		// won't necessarily match the total number of actions that
		// match the query. So, if pagination was used and the CountAll
		// flag is set, then we need to count the total number of
		// actions that match the query.
		if query != nil && query.CountAll {
			totalCount, err = db.CountActions(
				ctx, actionQueryParams,
			)
			if err != nil {
				return fmt.Errorf("unable to count actions: %w",
					err)
			}
		}

		actions = make([]*Action, len(dbActions))
		for i, dbAction := range dbActions {
			action, err := unmarshalAction(ctx, db, dbAction)
			if err != nil {
				return fmt.Errorf("unable to unmarshal "+
					"action: %w", err)
			}

			actions[i] = action
			lastIndex = uint64(dbAction.ID)
		}

		return nil
	})

	return actions, lastIndex, uint64(totalCount), err
}

func unmarshalAction(ctx context.Context, db SQLActionQueries,
	dbAction sqlc.Action) (*Action, error) {

	var legacySessID fn.Option[session.ID]
	if dbAction.SessionID.Valid {
		legacySessIDB, err := db.GetAliasBySessionID(
			ctx, dbAction.SessionID.Int64,
		)
		if err != nil {
			return nil, fmt.Errorf("unable to get legacy "+
				"session ID for session ID %d: %w",
				dbAction.SessionID.Int64, err)
		}

		sessID, err := session.IDFromBytes(legacySessIDB)
		if err != nil {
			return nil, err
		}

		legacySessID = fn.Some(sessID)
	}

	var legacyAcctID fn.Option[accounts.AccountID]
	if dbAction.AccountID.Valid {
		acct, err := db.GetAccount(ctx, dbAction.AccountID.Int64)
		if err != nil {
			return nil, err
		}

		acctID, err := accounts.AccountIDFromInt64(acct.Alias)
		if err != nil {
			return nil, fmt.Errorf("unable to get account ID: %w",
				err)
		}

		legacyAcctID = fn.Some(acctID)
	}

	// Note that we export the full 8 byte macaroon root key ID in the sql
	// actions DB, while the kvdb version persists and exports stored the
	// last 4 bytes only.
	var macRootKeyID fn.Option[uint64]
	if len(dbAction.MacaroonIdentifier) >= 8 {
		macRootKeyID = fn.Some(
			binary.BigEndian.Uint64(dbAction.MacaroonIdentifier),
		)
	}

	return &Action{
		AddActionReq: AddActionReq{
			MacaroonRootKeyID:  macRootKeyID,
			AccountID:          legacyAcctID,
			SessionID:          legacySessID,
			ActorName:          dbAction.ActorName.String,
			FeatureName:        dbAction.FeatureName.String,
			Trigger:            dbAction.ActionTrigger.String,
			Intent:             dbAction.Intent.String,
			StructuredJsonData: string(dbAction.StructuredJsonData),
			RPCMethod:          dbAction.RpcMethod,
			RPCParamsJson:      dbAction.RpcParamsJson,
		},
		AttemptedAt: dbAction.CreatedAt,
		State:       ActionState(dbAction.ActionState),
		ErrorReason: dbAction.ErrorReason.String,
	}, nil
}
