//go:build !dev

package migsets

import (
	"context"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/pgx/v5"
	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/sqldb/v2"
)

// MakeMigrationSets creates the migration sets for production environments.
func MakeMigrationSets(_ context.Context, _ lnrpc.LightningClient, _ string,
	_ clock.Clock) []sqldb.MigrationSet {

	// migSet defines the SQL migration set used to create and upgrade LiT's
	// SQL schema.
	migSet := sqldb.MigrationSet{
		TrackingTableName: pgx.DefaultMigrationsTable,
		SQLFileDirectory:  "sqlc/migrations",
		SQLFiles:          db.SqlSchemas,

		// LatestMigrationVersion is the latest migration version of the
		// database.  This is used to implement downgrade protection for
		// the daemon.
		//
		// NOTE: This MUST be updated when a new migration is added.
		LatestMigrationVersion: db.LatestMigrationVersion,

		MakeProgrammaticMigrations: func(db *sqldb.BaseDB) (
			map[uint]migrate.ProgrammaticMigrEntry, error) {

			return make(map[uint]migrate.ProgrammaticMigrEntry), nil
		},
	}

	return []sqldb.MigrationSet{migSet}
}
