package terminal

import (
	"bytes"
	"path/filepath"
	"strings"
	"testing"

	"github.com/btcsuite/btclog/v2"
	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/stretchr/testify/require"
)

// TestConfirmPendingKVDBToSQLMigration verifies that the startup prompt is
// shown only when active legacy kvdb state is about to be migrated.
func TestConfirmPendingKVDBToSQLMigration(t *testing.T) {
	tests := []struct {
		name string

		// setsEnv signals that the test mutates the process
		// environment via t.Setenv, which means t.Parallel can't be
		// used in the subtest.
		setsEnv bool

		// setup configures the cfg and creates any on-disk legacy
		// kvdb state the test needs before the prompt runs.
		setup func(t *testing.T, cfg *Config, dbDir string)

		// input is the response written to the prompt's stdin.
		input string

		// expectErr is the substring expected in the error returned
		// by the prompt function. An empty value asserts no error.
		expectErr string

		// expectOutput lists substrings that must appear in the
		// prompt's stdout.
		expectOutput []string

		// expectNoOutput asserts that nothing was written to the
		// prompt's stdout, e.g. because the prompt was bypassed.
		expectNoOutput bool
	}{
		{
			name: "accepts yes for pending migration",
			setup: func(t *testing.T, _ *Config, dbDir string) {
				createActiveAccountsKVDB(t, dbDir)
			},
			input: "yes\n",
			expectOutput: []string{
				"about to migrate", "switch back",
			},
		},
		{
			name: "rejects non yes answer",
			setup: func(t *testing.T, _ *Config, dbDir string) {
				createActiveAccountsKVDB(t, dbDir)
			},
			input:     "no\n",
			expectErr: "manual confirmation declined",
		},
		{
			name: "skips prompt on auto migration config",
			setup: func(t *testing.T, cfg *Config, dbDir string) {
				cfg.AutoMigrateKVDB = true
				require.NoError(t, readAutoMigrateKVDB(cfg))
				createActiveAccountsKVDB(t, dbDir)
			},
			input:          "no\n",
			expectNoOutput: true,
		},
		{
			name:    "skips prompt on auto migration environment",
			setsEnv: true,
			setup: func(t *testing.T, cfg *Config, dbDir string) {
				t.Setenv(autoMigrateKVDBEnvVar, "true")
				require.NoError(t, readAutoMigrateKVDB(cfg))
				createActiveAccountsKVDB(t, dbDir)
			},
			input:          "no\n",
			expectNoOutput: true,
		},
		{
			name: "skips prompt when no legacy kvdb exists",
		},
		{
			name: "skips prompt for tombstoned kvdb",
			setup: func(t *testing.T, _ *Config, dbDir string) {
				createActiveAccountsKVDB(t, dbDir)
				require.NoError(
					t, accounts.DeprecateKVDB(dbDir),
				)
			},
		},
		{
			name: "uses macaroon dir for accounts kvdb",
			setup: func(t *testing.T, cfg *Config, _ string) {
				customMacDir := filepath.Join(
					t.TempDir(), "custom",
				)
				cfg.MacaroonPath = filepath.Join(
					customMacDir, "lit.macaroon",
				)
				createActiveAccountsKVDB(t, customMacDir)
			},
			input:        "yes\n",
			expectOutput: []string{"about to migrate"},
		},
		{
			name: "accepts yes without trailing newline",
			setup: func(t *testing.T, _ *Config, dbDir string) {
				createActiveAccountsKVDB(t, dbDir)
			},
			input:        "yes",
			expectOutput: []string{"about to migrate"},
		},
		{
			name: "rejects non yes without trailing newline",
			setup: func(t *testing.T, _ *Config, dbDir string) {
				createActiveAccountsKVDB(t, dbDir)
			},
			input:     "no",
			expectErr: "manual confirmation declined",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			if !tc.setsEnv {
				t.Parallel()
			}

			cfg, dbDir := testMigrationPromptConfig(t)
			if tc.setup != nil {
				tc.setup(t, cfg, dbDir)
			}

			var output bytes.Buffer
			err := cfg.confirmPendingKVDBToSQLMigrationWithInput(
				strings.NewReader(tc.input), &output,
			)

			if tc.expectErr != "" {
				require.ErrorContains(t, err, tc.expectErr)
			} else {
				require.NoError(t, err)
			}

			if tc.expectNoOutput {
				require.Empty(t, output.String())
			}
			for _, want := range tc.expectOutput {
				require.Contains(t, output.String(), want)
			}
		})
	}

	// The remaining subtests don't exercise the prompt path, so they
	// don't fit the table above.
	t.Run("rejects invalid auto migration env value", func(t *testing.T) {
		// Note we intentionally don't use t.Parallel() here as that
		// panics with t.Setenv.

		cfg, _ := testMigrationPromptConfig(t)
		t.Setenv(autoMigrateKVDBEnvVar, "definitely-not-bool")
		err := readAutoMigrateKVDB(cfg)
		require.ErrorContains(t, err, "not a valid boolean")
	})

	t.Run("logs migration prompt text", func(t *testing.T) {
		// Note we intentionally don't use t.Parallel() here as the
		// subtest calls UseLogger(...), which mutates the
		// package-global logger. Running it in parallel with
		// the other prompt subtests lets one goroutine read log while
		// another replaces it, which can lead to a race.

		var logOutput bytes.Buffer

		testLogger := btclog.NewSLogger(
			btclog.NewDefaultHandler(&logOutput),
		)

		oldLogger := log
		UseLogger(testLogger.SubSystem(Subsystem))
		t.Cleanup(func() {
			UseLogger(oldLogger)
		})

		err := promptForKVDBToSQLMigrationConfirmation(
			strings.NewReader("yes\n"), &bytes.Buffer{},
		)
		require.NoError(t, err)
		require.Contains(t, logOutput.String(), "about to migrate")
		require.Contains(t, logOutput.String(), "databasebackend=bbolt")
	})
}

// testMigrationPromptConfig creates a config whose LiT directory and network
// point at the same network directory used by the legacy kvdb stores.
func testMigrationPromptConfig(t *testing.T) (*Config, string) {
	t.Helper()

	litDir := t.TempDir()
	network := "regtest"
	dbDir := filepath.Join(litDir, network)
	cfg := &Config{
		LitDir:       litDir,
		Network:      network,
		MacaroonPath: filepath.Join(dbDir, "lit.macaroon"),
	}

	return cfg, dbDir
}

// createActiveAccountsKVDB creates a minimal non-tombstoned legacy accounts
// database so the startup confirmation sees pending kvdb state to migrate.
func createActiveAccountsKVDB(t *testing.T, dbDir string) {
	t.Helper()

	store, err := accounts.NewBoltStore(
		dbDir, accounts.DBFilename, clock.NewDefaultClock(),
	)
	require.NoError(t, err)

	require.NoError(t, store.Close())
}
