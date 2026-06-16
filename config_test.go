package terminal

import (
	"database/sql"
	"os"
	"path/filepath"
	"testing"

	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/stretchr/testify/require"
)

// TestBlockStartupForPostgresIfSqliteDBExists verifies that a Postgres startup
// is rejected when the default SQLite database file still exists for the
// selected network.
func TestBlockStartupForPostgresIfSqliteDBExists(t *testing.T) {
	litDir := t.TempDir()
	sqlitePath := filepath.Join(
		litDir, "regtest", defaultSqliteDatabaseFileName,
	)

	fixture := db.NewTestPgFixture(
		t, db.DefaultPostgresFixtureLifetime, true,
	)
	t.Cleanup(func() {
		fixture.TearDown(t)
	})

	require.NoError(t, os.MkdirAll(filepath.Dir(sqlitePath), 0700))
	require.NoError(t, os.WriteFile(sqlitePath, []byte("sqlite"), 0600))

	cfg := &Config{
		DatabaseBackend: DatabaseBackendPostgres,
		LitDir:          litDir,
		Network:         "regtest",
		Postgres:        fixture.GetConfig(),
	}

	err := validateExclusiveSQLBackends(t.Context(), cfg, litDir)
	require.Error(t, err)
	require.Contains(t, err.Error(), "sqlite database file already exists")
	require.Contains(t, err.Error(), sqlitePath)
}

// TestBlockStartupForSqliteIfPostgresDBExists verifies that a SQLite startup is
// rejected when the configured Postgres database already exists.
func TestBlockStartupForSqliteIfPostgresDBExists(t *testing.T) {
	fixture := db.NewTestPgFixture(
		t, db.DefaultPostgresFixtureLifetime, true,
	)
	t.Cleanup(func() {
		fixture.TearDown(t)
	})

	cfg := &Config{
		DatabaseBackend: DatabaseBackendSqlite,
		Postgres:        fixture.GetConfig(),
	}

	err := validateExclusiveSQLBackends(t.Context(), cfg, "")
	require.Error(t, err)
	require.Contains(t, err.Error(), "postgres database")
	require.Contains(t, err.Error(), cfg.Postgres.DBName)
}

// TestDontBlockSqliteOnlyStartup verifies that SQLite startup is allowed when
// no concrete Postgres database is configured.
func TestDontBlockSqliteOnlyStartup(t *testing.T) {
	cfg := &Config{
		DatabaseBackend: DatabaseBackendSqlite,
	}

	require.NoError(
		t, validateExclusiveSQLBackends(t.Context(), cfg, ""),
	)
}

// TestDontBlockSqliteStartupIfConfiguredPostgresDoesntExist verifies that a
// SQLite startup is allowed when the configured Postgres database does not
// exist.
func TestDontBlockSqliteStartupIfConfiguredPostgresDoesntExist(t *testing.T) {
	fixture := db.NewTestPgFixture(
		t, db.DefaultPostgresFixtureLifetime, true,
	)
	t.Cleanup(func() {
		fixture.TearDown(t)
	})

	pgCfg := fixture.GetConfig()
	pgCfg.DBName = "does_not_exist_for_config_validation"

	cfg := &Config{
		DatabaseBackend: DatabaseBackendSqlite,
		Postgres:        pgCfg,
	}

	require.NoError(
		t, validateExclusiveSQLBackends(t.Context(), cfg, ""),
	)

	// We also validate that the validateExclusiveSQLBackends passed because
	// the db with the configured DBName doesn't exist and not because the
	// connection parameters are wrong. This proves that we're ok with a
	// postgres setup existing, as long as the specific database doesn't
	// exist.
	dbConn, err := sql.Open("postgres", pgCfg.DSN(false))
	require.NoError(t, err)
	t.Cleanup(func() {
		require.NoError(t, dbConn.Close())
	})

	err = dbConn.Ping()
	require.Error(t, err)
	require.True(t, isMissingPostgresDatabase(err))
}

// TestDontBlockPostgresOnlyStartup verifies that a Postgres is allowed when
// no sqlite database file exists for the selected network, despite the actual
// folder where the file would be placed exists.
func TestDontBlockPostgresOnlyStartup(t *testing.T) {
	litDir := t.TempDir()
	sqlitePath := filepath.Join(
		litDir, "regtest", defaultSqliteDatabaseFileName,
	)

	fixture := db.NewTestPgFixture(
		t, db.DefaultPostgresFixtureLifetime, true,
	)
	t.Cleanup(func() {
		fixture.TearDown(t)
	})

	require.NoError(t, os.MkdirAll(filepath.Dir(sqlitePath), 0700))

	// NOTE: we don't write any file to the sqlite path here, so the sqlite
	// database file never exists, only the default directory where it would
	// be located.

	cfg := &Config{
		DatabaseBackend: DatabaseBackendPostgres,
		LitDir:          litDir,
		Network:         "regtest",
		Postgres:        fixture.GetConfig(),
	}

	require.NoError(
		t, validateExclusiveSQLBackends(
			t.Context(), cfg, litDir,
		),
	)
}
