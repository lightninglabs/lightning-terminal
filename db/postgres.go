package db

import (
	"database/sql"
	"fmt"
	"testing"
	"time"

	postgres_migrate "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/lightninglabs/lightning-terminal/db/sqlc"
	"github.com/stretchr/testify/require"
)

const (
	dsnTemplate = "postgres://%v:%v@%v:%d/%v?sslmode=%v"

	// defaultMaxIdleConns is the number of permitted idle connections.
	defaultMaxIdleConns = 6

	// defaultConnMaxIdleTime is the amount of time a connection can be
	// idle before it is closed.
	defaultConnMaxIdleTime = 5 * time.Minute
)

var (
	// DefaultPostgresFixtureLifetime is the default maximum time a Postgres
	// test fixture is being kept alive. After that time the docker
	// container will be terminated forcefully, even if the tests aren't
	// fully executed yet. So this time needs to be chosen correctly to be
	// longer than the longest expected individual test run time.
	DefaultPostgresFixtureLifetime = 60 * time.Minute

	// postgresSchemaReplacements is a map of schema strings that need to be
	// replaced for postgres. This is needed because we write the schemas
	// to work with sqlite primarily, and postgres has some differences.
	postgresSchemaReplacements = map[string]string{
		"BLOB":                "BYTEA",
		"INTEGER PRIMARY KEY": "BIGSERIAL PRIMARY KEY",
		"TIMESTAMP":           "TIMESTAMP WITHOUT TIME ZONE",
		"UNHEX":               "DECODE",
	}
)

// PostgresConfig holds the postgres database configuration.
//
// nolint:ll
type PostgresConfig struct {
	SkipMigrations     bool          `long:"skipmigrations" description:"Skip applying migrations on startup."`
	Host               string        `long:"host" description:"Database server hostname."`
	Port               int           `long:"port" description:"Database server port."`
	User               string        `long:"user" description:"Database user."`
	Password           string        `long:"password" description:"Database user's password."`
	DBName             string        `long:"dbname" description:"Database name to use."`
	MaxOpenConnections int           `long:"maxconnections" description:"Max open connections to keep alive to the database server."`
	MaxIdleConnections int           `long:"maxidleconnections" description:"Max number of idle connections to keep in the connection pool."`
	ConnMaxLifetime    time.Duration `long:"connmaxlifetime" description:"Max amount of time a connection can be reused for before it is closed. Valid time units are {s, m, h}."`
	ConnMaxIdleTime    time.Duration `long:"connmaxidletime" description:"Max amount of time a connection can be idle for before it is closed. Valid time units are {s, m, h}."`
	RequireSSL         bool          `long:"requiressl" description:"Whether to require using SSL (mode: require) when connecting to the server."`
}

// DSN returns the dns to connect to the database.
func (s *PostgresConfig) DSN(hidePassword bool) string {
	var sslMode = "disable"
	if s.RequireSSL {
		sslMode = "require"
	}

	password := s.Password
	if hidePassword {
		// Placeholder used for logging the DSN safely.
		password = "****"
	}

	return fmt.Sprintf(dsnTemplate, s.User, password, s.Host, s.Port,
		s.DBName, sslMode)
}

// PostgresStore is a database store implementation that uses a Postgres
// backend.
type PostgresStore struct {
	cfg *PostgresConfig

	*BaseDB
}

// NewPostgresStore creates a new store that is backed by a Postgres database
// backend.
func NewPostgresStore(cfg *PostgresConfig) (*PostgresStore, error) {
	log.Infof("Using SQL database '%s'", cfg.DSN(true))

	rawDb, err := sql.Open("pgx", cfg.DSN(false))
	if err != nil {
		return nil, err
	}

	maxConns := defaultMaxConns
	if cfg.MaxOpenConnections > 0 {
		maxConns = cfg.MaxOpenConnections
	}

	maxIdleConns := defaultMaxIdleConns
	if cfg.MaxIdleConnections > 0 {
		maxIdleConns = cfg.MaxIdleConnections
	}

	connMaxLifetime := defaultConnMaxLifetime
	if cfg.ConnMaxLifetime > 0 {
		connMaxLifetime = cfg.ConnMaxLifetime
	}

	connMaxIdleTime := defaultConnMaxIdleTime
	if cfg.ConnMaxIdleTime > 0 {
		connMaxIdleTime = cfg.ConnMaxIdleTime
	}

	rawDb.SetMaxOpenConns(maxConns)
	rawDb.SetMaxIdleConns(maxIdleConns)
	rawDb.SetConnMaxLifetime(connMaxLifetime)
	rawDb.SetConnMaxIdleTime(connMaxIdleTime)

	queries := sqlc.NewPostgres(rawDb)
	s := &PostgresStore{
		cfg: cfg,
		BaseDB: &BaseDB{
			DB:      rawDb,
			Queries: queries,
		},
	}

	// Now that the database is open, populate the database with our set of
	// schemas based on our embedded in-memory file system.
	if !cfg.SkipMigrations {
		if err := s.ExecuteMigrations(TargetLatest); err != nil {
			return nil, fmt.Errorf("error executing migrations: "+
				"%w", err)
		}
	}

	return s, nil
}

// ExecuteMigrations runs migrations for the Postgres database, depending on the
// target given, either all migrations or up to a given version.
func (s *PostgresStore) ExecuteMigrations(target MigrationTarget,
	optFuncs ...MigrateOpt) error {

	opts := defaultMigrateOptions()
	for _, optFunc := range optFuncs {
		optFunc(opts)
	}

	driver, err := postgres_migrate.WithInstance(
		s.DB, &postgres_migrate.Config{},
	)
	if err != nil {
		return fmt.Errorf("error creating postgres migration: %w", err)
	}

	postgresFS := newReplacerFS(sqlSchemas, postgresSchemaReplacements)
	return applyMigrations(
		postgresFS, driver, "sqlc/migrations", s.cfg.DBName, target,
		opts,
	)
}

// NewTestPostgresDB is a helper function that creates a Postgres database for
// testing.
func NewTestPostgresDB(t *testing.T) *PostgresStore {
	t.Helper()

	t.Logf("Creating new Postgres DB for testing")

	sqlFixture := NewTestPgFixture(t, DefaultPostgresFixtureLifetime, true)
	store, err := NewPostgresStore(sqlFixture.GetConfig())
	require.NoError(t, err)

	t.Cleanup(func() {
		sqlFixture.TearDown(t)
	})

	return store
}

// NewTestPostgresDBWithVersion is a helper function that creates a Postgres
// database for testing and migrates it to the given version.
func NewTestPostgresDBWithVersion(t *testing.T, version uint) *PostgresStore {
	t.Helper()

	t.Logf("Creating new Postgres DB for testing, migrating to version %d",
		version)

	sqlFixture := NewTestPgFixture(t, DefaultPostgresFixtureLifetime, true)
	storeCfg := sqlFixture.GetConfig()
	storeCfg.SkipMigrations = true
	store, err := NewPostgresStore(storeCfg)
	require.NoError(t, err)

	err = store.ExecuteMigrations(TargetVersion(version))
	require.NoError(t, err)

	t.Cleanup(func() {
		sqlFixture.TearDown(t)
	})

	return store
}
