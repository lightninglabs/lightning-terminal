//go:build dev

package migrationstreams

import (
	"context"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/pgx/v5"
	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/sqldb/v2"
)

const (
	// KVDBtoSQLMigVersion is the version of the migration that migrates the
	// kvdb to the sql database.
	//
	// TODO: When this the kvdb to sql migration goes live into prod, this
	// should be moved to non dev db/migrations.go file, and this constant
	// value should be updated to reflect the real migration number.
	KVDBtoSQLMigVersion = 1
)

// MakeMigrationStreams creates the migration streams for the dev environments.
func MakeMigrationStreams(ctx context.Context,
	basicClient lnrpc.LightningClient, macPath string,
	clock clock.Clock) []sqldb.MigrationStream {

	// Create the prod migration stream.
	migStream := sqldb.MigrationStream{
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

	// Create the dev migration stream.
	migStreamDev := sqldb.MigrationStream{
		TrackingTableName: pgx.DefaultMigrationsTable + "_dev",
		SQLFileDirectory:  "sqlc/migrations_dev",
		SQLFiles:          db.SqlSchemas,

		// LatestMigrationVersion is the latest migration version of the
		// dev migrations database. This is used to implement downgrade
		// protection for the daemon.
		//
		// NOTE: This MUST be updated when a new dev migration is added.
		LatestMigrationVersion: db.LatestDevMigrationVersion,

		MakeProgrammaticMigrations: func(db *sqldb.BaseDB) (
			map[uint]migrate.ProgrammaticMigrEntry, error) {

			// Any Callbacks added to this map will be executed when
			// after the dev migration number for the uint key in
			// the map has been applied. If no entry exists for a
			// given uint, then no callback will be executed for
			// that migration number. This is useful for adding a
			// code migration step as a callback to be run
			// after a specific migration of a given number has been
			// applied.
			res := make(map[uint]migrate.ProgrammaticMigrEntry)

			res[KVDBtoSQLMigVersion] = MakePostStepCallbacksMig6(
				ctx, basicClient, db, macPath, clock,
				KVDBtoSQLMigVersion,
			)

			return res, nil
		},
	}

	return []sqldb.MigrationStream{migStream, migStreamDev}
}
