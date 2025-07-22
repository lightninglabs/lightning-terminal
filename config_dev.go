//go:build dev

package terminal

import (
	"fmt"
	"path/filepath"

	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightninglabs/lightning-terminal/db/sqlc"
	"github.com/lightninglabs/lightning-terminal/firewalldb"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/sqldb/v2"
)

const (
	// DatabaseBackendSqlite is the name of the SQLite database backend.
	DatabaseBackendSqlite = "sqlite"

	// DatabaseBackendPostgres is the name of the Postgres database backend.
	DatabaseBackendPostgres = "postgres"

	// DatabaseBackendBbolt is the name of the bbolt database backend.
	DatabaseBackendBbolt = "bbolt"

	// defaultSqliteDatabaseFileName is the default name of the SQLite
	// database file.
	defaultSqliteDatabaseFileName = "litd.db"
)

// defaultSqliteDatabasePath is the default path under which we store
// the SQLite database file.
var defaultSqliteDatabasePath = filepath.Join(
	DefaultLitDir, DefaultNetwork, defaultSqliteDatabaseFileName,
)

// DevConfig is a struct that holds the configuration options for a development
// environment. The purpose of this struct is to hold config options for
// features not yet available in production. Since our itests are built with
// the dev tag, we can test these features in our itests.
//
// nolint:ll
type DevConfig struct {
	// DatabaseBackend is the database backend we will use for storing all
	// account related data. While this feature is still in development, we
	// include the bbolt type here so that our itests can continue to be
	// tested against a bbolt backend. Once the full bbolt to SQL migration
	// is complete, however, we will remove the bbolt option.
	DatabaseBackend string `long:"databasebackend" description:"The database backend to use for storing all account related data." choice:"bbolt" choice:"sqlite" choice:"postgres"`

	// Sqlite holds the configuration options for a SQLite database
	// backend.
	Sqlite *db.SqliteConfig `group:"sqlite" namespace:"sqlite"`

	// Postgres holds the configuration options for a Postgres database
	Postgres *db.PostgresConfig `group:"postgres" namespace:"postgres"`
}

// Validate checks that all the values set in our DevConfig are valid and uses
// the passed parameters to override any defaults if necessary.
func (c *DevConfig) Validate(dbDir, network string) error {
	// We'll update the database file location if it wasn't set.
	if c.Sqlite.DatabaseFileName == defaultSqliteDatabasePath {
		c.Sqlite.DatabaseFileName = filepath.Join(
			dbDir, network, defaultSqliteDatabaseFileName,
		)
	}

	return nil
}

// defaultDevConfig returns a new DevConfig with default values set.
func defaultDevConfig() *DevConfig {
	return &DevConfig{
		Sqlite: &db.SqliteConfig{
			DatabaseFileName: defaultSqliteDatabasePath,
		},
		Postgres: &db.PostgresConfig{
			Host:               "localhost",
			Port:               5432,
			MaxOpenConnections: 10,
		},
	}
}

// NewStores creates a new stores instance based on the chosen database backend.
func NewStores(cfg *Config, clock clock.Clock) (*stores, error) {
	var (
		networkDir = filepath.Join(cfg.LitDir, cfg.Network)
		stores     = &stores{
			closeFns: make(map[string]func() error),
		}
	)

	switch cfg.DatabaseBackend {
	case DatabaseBackendSqlite:
		// Before we initialize the SQLite store, we'll make sure that
		// the directory where we will store the database file exists.
		err := makeDirectories(networkDir)
		if err != nil {
			return stores, err
		}

		// Until we have fully added support for sqldb/v2 in all of our
		// stores, we need to use the db packages definition of the
		// SQLite store for the packages that still haven't added
		// support for sqldb/v2. This is only temporary and will be
		// removed once all stores have been updated to use sqldb/v2.
		legacySqlStore, err := db.NewSqliteStore(cfg.Sqlite)

		sqlStore, err := sqldb.NewSqliteStore(&sqldb.SqliteConfig{
			SkipMigrations:        cfg.Sqlite.SkipMigrations,
			SkipMigrationDbBackup: cfg.Sqlite.SkipMigrationDbBackup,
		}, cfg.Sqlite.DatabaseFileName)
		if err != nil {
			return stores, err
		}

		if !cfg.Sqlite.SkipMigrations {
			err = sqldb.ApplyAllMigrations(
				sqlStore, db.LitdMigrationStreams,
			)
			if err != nil {
				return stores, fmt.Errorf("error applying "+
					"migrations to SQLite store: %w", err,
				)
			}
		}

		queries := sqlc.NewForType(sqlStore, sqlStore.BackendType)

		acctStore := accounts.NewSQLStore(
			sqlStore.BaseDB, queries, clock,
		)
		sessStore := session.NewSQLStore(legacySqlStore.BaseDB, clock)
		firewallStore := firewalldb.NewSQLDB(
			legacySqlStore.BaseDB, clock,
		)

		stores.accounts = acctStore
		stores.sessions = sessStore
		stores.firewall = firewalldb.NewDB(firewallStore)
		stores.closeFns["sqlite"] = sqlStore.BaseDB.Close

	case DatabaseBackendPostgres:
		// Until we have fully added support for sqldb/v2 in all of our
		// stores, we need to use the db packages definition of the
		// Postgres store for the packages that still haven't added
		// support for sqldb/v2. This is only temporary and will be
		// removed once all stores have been updated to use sqldb/v2.
		legacySqlStore, err := db.NewPostgresStore(cfg.Postgres)

		sqlStore, err := sqldb.NewPostgresStore(&sqldb.PostgresConfig{
			Dsn:                cfg.Postgres.DSN(false),
			MaxOpenConnections: cfg.Postgres.MaxOpenConnections,
			MaxIdleConnections: cfg.Postgres.MaxIdleConnections,
			ConnMaxLifetime:    cfg.Postgres.ConnMaxLifetime,
			ConnMaxIdleTime:    cfg.Postgres.ConnMaxIdleTime,
			RequireSSL:         cfg.Postgres.RequireSSL,
			SkipMigrations:     cfg.Postgres.SkipMigrations,
		})
		if err != nil {
			return stores, err
		}

		if !cfg.Postgres.SkipMigrations {
			err = sqldb.ApplyAllMigrations(
				sqlStore, db.LitdMigrationStreams,
			)
			if err != nil {
				return stores, fmt.Errorf("error applying "+
					"migrations to Postgres store: %w", err,
				)
			}
		}

		queries := sqlc.NewForType(sqlStore, sqlStore.BackendType)

		acctStore := accounts.NewSQLStore(
			sqlStore.BaseDB, queries, clock,
		)
		sessStore := session.NewSQLStore(legacySqlStore.BaseDB, clock)
		firewallStore := firewalldb.NewSQLDB(
			legacySqlStore.BaseDB, clock,
		)

		stores.accounts = acctStore
		stores.sessions = sessStore
		stores.firewall = firewalldb.NewDB(firewallStore)
		stores.closeFns["postgres"] = sqlStore.BaseDB.Close

	default:
		accountStore, err := accounts.NewBoltStore(
			filepath.Dir(cfg.MacaroonPath), accounts.DBFilename,
			clock,
		)
		if err != nil {
			return stores, err
		}

		stores.accounts = accountStore
		stores.closeFns["bbolt-accounts"] = accountStore.Close

		sessionStore, err := session.NewDB(
			networkDir, session.DBFilename, clock, accountStore,
		)
		if err != nil {
			return stores, err
		}

		stores.sessions = sessionStore
		stores.closeFns["bbolt-sessions"] = sessionStore.Close

		firewallBoltDB, err := firewalldb.NewBoltDB(
			networkDir, firewalldb.DBFilename, stores.sessions,
			stores.accounts, clock,
		)
		if err != nil {
			return stores, fmt.Errorf("error creating firewall "+
				"BoltDB: %v", err)
		}

		stores.firewall = firewalldb.NewDB(firewallBoltDB)
		stores.closeFns["bbolt-firewalldb"] = firewallBoltDB.Close
	}

	return stores, nil
}
