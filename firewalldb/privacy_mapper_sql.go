package firewalldb

import (
	"context"
	"database/sql"
	"errors"

	"github.com/lightninglabs/lightning-terminal/db/sqlc"
	"github.com/lightninglabs/lightning-terminal/session"
)

// SQLPrivacyPairQueries is a subset of the sqlc.Queries interface that can be
// used to interact with the privacy map table.
//
//nolint:lll
type SQLPrivacyPairQueries interface {
	SQLSessionQueries

	InsertPrivacyPair(ctx context.Context, arg sqlc.InsertPrivacyPairParams) error
	GetAllPrivacyPairs(ctx context.Context, groupID int64) ([]sqlc.GetAllPrivacyPairsRow, error)
	GetPseudoForReal(ctx context.Context, arg sqlc.GetPseudoForRealParams) (string, error)
	GetRealForPseudo(ctx context.Context, arg sqlc.GetRealForPseudoParams) (string, error)
}

// PrivacyDB constructs a PrivacyMapDB that will be indexed under the given
// group ID key.
//
// NOTE: this is part of the PrivacyMapper interface.
func (s *SQLDB) PrivacyDB(groupID session.ID) PrivacyMapDB {
	return &sqlExecutor[PrivacyMapTx]{
		db: s.db,
		wrapTx: func(queries SQLQueries) PrivacyMapTx {
			return &privacyMapSQLTx{
				queries: queries,
				groupID: groupID,
			}
		},
	}
}

// privacyMapSQLTx is an implementation of PrivacyMapTx.
type privacyMapSQLTx struct {
	queries SQLQueries
	groupID session.ID
}

// NewPair inserts a new real-pseudo pair into the db.
//
// NOTE: this is part of the PrivacyMapTx interface.
func (p *privacyMapSQLTx) NewPair(ctx context.Context, real,
	pseudo string) error {

	groupID, err := p.getGroupID(ctx)
	if err != nil {
		return err
	}

	_, err = p.queries.GetPseudoForReal(ctx, sqlc.GetPseudoForRealParams{
		GroupID: groupID,
		RealVal: real,
	})
	if err == nil {
		return ErrDuplicateRealValue
	} else if !errors.Is(err, sql.ErrNoRows) {
		return err
	}

	_, err = p.queries.GetRealForPseudo(ctx, sqlc.GetRealForPseudoParams{
		GroupID:   groupID,
		PseudoVal: pseudo,
	})
	if err == nil {
		return ErrDuplicatePseudoValue
	} else if !errors.Is(err, sql.ErrNoRows) {
		return err
	}

	return p.queries.InsertPrivacyPair(ctx, sqlc.InsertPrivacyPairParams{
		GroupID:   groupID,
		RealVal:   real,
		PseudoVal: pseudo,
	})
}

// PseudoToReal will check the db to see if the given pseudo key exists. If
// it does then the real value is returned, else an error is returned.
//
// NOTE: this is part of the PrivacyMapTx interface.
func (p *privacyMapSQLTx) PseudoToReal(ctx context.Context,
	pseudo string) (string, error) {

	groupID, err := p.getGroupID(ctx)
	if err != nil {
		return "", err
	}

	realVal, err := p.queries.GetRealForPseudo(
		ctx, sqlc.GetRealForPseudoParams{
			GroupID:   groupID,
			PseudoVal: pseudo,
		},
	)
	if errors.Is(err, sql.ErrNoRows) {
		return "", ErrNoSuchKeyFound
	} else if err != nil {
		return "", err
	}

	return realVal, nil
}

// RealToPseudo will check the db to see if the given real key exists. If it
// does then the pseudo value is returned, else an error is returned.
//
// NOTE: this is part of the PrivacyMapTx interface.
func (p *privacyMapSQLTx) RealToPseudo(ctx context.Context,
	real string) (string, error) {

	groupID, err := p.getGroupID(ctx)
	if err != nil {
		return "", err
	}

	pseudo, err := p.queries.GetPseudoForReal(
		ctx, sqlc.GetPseudoForRealParams{
			GroupID: groupID,
			RealVal: real,
		},
	)
	if errors.Is(err, sql.ErrNoRows) {
		return "", ErrNoSuchKeyFound
	} else if err != nil {
		return "", err
	}

	return pseudo, nil
}

// FetchAllPairs loads and returns the real-to-pseudo pairs.
//
// NOTE: this is part of the PrivacyMapTx interface.
func (p *privacyMapSQLTx) FetchAllPairs(ctx context.Context) (*PrivacyMapPairs,
	error) {

	groupID, err := p.getGroupID(ctx)
	if err != nil {
		return nil, err
	}

	pairs, err := p.queries.GetAllPrivacyPairs(ctx, groupID)
	if err != nil {
		return nil, err
	}

	privacyPairs := make(map[string]string, len(pairs))
	for _, pair := range pairs {
		privacyPairs[pair.RealVal] = pair.PseudoVal
	}

	return NewPrivacyMapPairs(privacyPairs), nil
}

// getGroupID is a helper that can be used to get the DB ID for a session group
// given the group ID alias. If such a group is not found, then
// session.ErrUnknownGroup is returned.
func (p *privacyMapSQLTx) getGroupID(ctx context.Context) (int64, error) {
	groupID, err := p.queries.GetSessionIDByAlias(ctx, p.groupID[:])
	if errors.Is(err, sql.ErrNoRows) {
		return 0, session.ErrUnknownGroup
	} else if err != nil {
		return 0, err
	}

	return groupID, nil
}

// A compile-time constraint to ensure that the privacyMapSQLTx type implements
// the PrivacyMapTx interface.
var _ PrivacyMapTx = (*privacyMapSQLTx)(nil)
