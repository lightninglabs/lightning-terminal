package terminal

import (
	"bufio"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/firewalldb"
	"github.com/lightninglabs/lightning-terminal/session"
)

var kvdbToSQLMigrationPromptLines = []string{
	"",
	"CAUTION: litd is about to migrate your existing data to a new SQL " +
		"database.",
	"After this, litd will use the SQL database for your existing data " +
		"and any new data added after that point.",
	"However, after the migration you will not be able to switch back " +
		"to your old database, as it will be incompatible with litd " +
		"after the migration.",
	"NOTE: This also means that you will not be able to downgrade litd " +
		"to a version prior to when SQL database support was added " +
		"(v0.17.0-alpha).",
	"",
	"SQL databases are more performant, quicker to start, and much less " +
		"prone to database corruption.",
	"It is therefore strongly recommended that you proceed with this " +
		"database migration.",
	"",
	"If you want to abort the migration and keep using the old database " +
		"type instead, stop now and restart litd with the following " +
		"config option set: `databasebackend=bbolt`.",
	"Please note though that your old database type (bbolt) is " +
		"deprecated, and support for it will be removed in a future " +
		"release. Migration to SQL will at that point be mandatory.",
	"",
}

// confirmPendingKVDBToSQLMigration blocks startup until the user explicitly
// acknowledges that litd is about to migrate legacy kvdb state to SQL and
// tombstone the kvdb files afterwards, unless auto migration is enabled.
func (c *Config) confirmPendingKVDBToSQLMigration() error {
	return c.confirmPendingKVDBToSQLMigrationWithInput(
		os.Stdin, os.Stderr,
	)
}

// confirmPendingKVDBToSQLMigrationWithInput is the testable variant of the
// startup migration confirmation.
func (c *Config) confirmPendingKVDBToSQLMigrationWithInput(
	input io.Reader, output io.Writer) error {

	hasActiveKVDB, err := hasActiveLegacyKVDB(c)
	if err != nil {
		return err
	}

	if !hasActiveKVDB {
		return nil
	}

	return promptForKVDBToSQLMigrationConfirmation(input, output)
}

// hasActiveLegacyKVDB reports whether any legacy LiT kvdb file exists and was
// not already tombstoned by a previous SQL migration.
func hasActiveLegacyKVDB(cfg *Config) (bool, error) {
	// The legacy accounts DB follows the macaroon directory, while the
	// session and rules DBs live under the network-scoped LiT directory.
	// We mirror those runtime locations here so the prompt checks the same
	// files that store initialization will later open.
	networkDir := filepath.Join(cfg.LitDir, cfg.Network)
	accountsDir := filepath.Dir(cfg.MacaroonPath)

	checks := []struct {
		name string
		fn   func(string) (bool, error)
		dir  string
	}{
		{
			name: "accounts",
			fn:   accounts.HasActiveKVDB,
			dir:  accountsDir,
		},
		{
			name: "sessions",
			fn:   session.HasActiveKVDB,
			dir:  networkDir,
		},
		{
			name: "rules",
			fn:   firewalldb.HasActiveKVDB,
			dir:  networkDir,
		},
	}

	for _, check := range checks {
		active, err := check.fn(check.dir)
		if err != nil {
			return false, fmt.Errorf("unable to inspect legacy "+
				"%s kvdb: %w", check.name, err)
		}

		if active {
			return true, nil
		}
	}

	return false, nil
}

// promptForKVDBToSQLMigrationConfirmation requires a literal "yes" response
// before litd continues with a pending kvdb-to-SQL migration.
func promptForKVDBToSQLMigrationConfirmation(input io.Reader,
	output io.Writer) error {

	logKVDBToSQLMigrationPrompt()

	for _, line := range kvdbToSQLMigrationPromptLines {
		_, err := fmt.Fprintln(output, line)
		if err != nil {
			return err
		}
	}

	_, err := fmt.Fprint(output,
		"Type \"yes\" to continue with the migration. Any other "+
			"answer will abort the startup of litd: ",
	)
	if err != nil {
		return err
	}

	reader := bufio.NewReader(input)
	answer, err := reader.ReadString('\n')
	if err != nil && !errors.Is(err, io.EOF) {
		return fmt.Errorf("manual confirmation required before kvdb "+
			"migration can continue: %w", err)
	}

	if strings.TrimSpace(answer) != "yes" {
		return errors.New("manual confirmation declined; refusing to " +
			"continue kvdb-to-SQL migration")
	}

	return nil
}

// logKVDBToSQLMigrationPrompt mirrors the interactive migration warning to
// the configured logger so the full operator guidance is preserved in logs.
func logKVDBToSQLMigrationPrompt() {
	for _, line := range kvdbToSQLMigrationPromptLines {
		if line == "" {
			continue
		}

		log.Infof("%s", line)
	}
}

// sqlMigrationsSkipped reports whether the configured SQL backend will skip
// schema migrations during startup. In that case no kvdb-to-SQL migration is
// attempted and the startup confirmation prompt must not be shown.
func (c *Config) sqlMigrationsSkipped() bool {
	switch c.DatabaseBackend {
	case DatabaseBackendSqlite:
		return c.Sqlite != nil && c.Sqlite.SkipMigrations

	case DatabaseBackendPostgres:
		return c.Postgres != nil && c.Postgres.SkipMigrations

	default:
		return false
	}
}
