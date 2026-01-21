//go:build itest

package itest

import (
	"context"
	"fmt"

	"github.com/btcsuite/btcd/btcutil"
	terminal "github.com/lightninglabs/lightning-terminal"
	"github.com/lightningnetwork/lnd/lntest"
	"github.com/stretchr/testify/require"
)

// testKvdbSQLMigration implements the kvdb -> SQL migration itest.
// The itest mimics the unit tests in accounts/sql_migration_test.go,
// session/sql_migration_test.go, and firewalldb/sql_migration_test.go,
// excluding the randomized cases.
//
// testKvdbSQLMigration proceeds in steps:
// 1. Start a node with a bbolt backend.
// 2. Insert data into bbolt via litcli or direct store access.
// 3. Assert data in bbolt via direct store access.
// 4. Assert data via litcli where possible.
// 5. Restart with the configured backend to trigger kvdb -> SQL migration.
// 6. Assert data in SQL via direct database access.
// 7. Assert data via litcli where possible.
func testKvdbSQLMigration(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	if *litDBBackend == terminal.DatabaseBackendBbolt {
		t.t.Skipf("Skipping kvdb migration test for bbolt backend")
	}

	// Step 1: Start a node with a bbolt backend.
	// We want to start from an explicit bbolt backend regardless of the
	// command line flag used to run the itests.
	migNode, err := net.NewNode(
		t.t, "Migrator", nil, false, true,
		fmt.Sprintf(
			"--databasebackend=%s",
			terminal.DatabaseBackendBbolt,
		),
	)
	require.NoError(t.t, err)
	defer shutdownAndAssert(net, t, migNode)

	// Fund the migration node.
	net.SendCoins(t.t, btcutil.SatoshiPerBitcoin, migNode)

	// Use Bob as the peer for the migration node and the node for payments.
	net.EnsureConnected(t.t, migNode, net.Bob)

	// Open a channel from the migration node -> Bob.
	channelOp := openChannelAndAssert(
		t, net, migNode, net.Bob, lntest.OpenChannelParams{
			Amt:     300000,
			PushAmt: 100000,
		},
	)
	defer closeChannelAndAssert(t, net, migNode, channelOp, false)

	// Step 2a: Insert data into bbolt via litcli or direct store access.
	// setupAccountMigrationData persists accounts and related data which
	// are intended to mimic the data inserted in the
	// accounts/sql_migration_test.go migration tests.
	//
	// TODO: Insert the data we can insert by CLI

	// Restart with bbolt to insert and verify migration data before
	// triggering the sqlite migration.
	// Note that we cannot connect directly to the bbolt backend while the
	// node is running, which is why the node is restarted and the data
	// insertion + asserted through the callback of the `RestartNode`
	// function. That is then executed after the node has been stopped, but
	// before it has been restarted.
	err = net.RestartNode(
		migNode, func() error {
			// Step 2b: Insert bbolt-only fixtures via direct store
			// access.
			// TODO: Insert the the rest of the data by connecting
			// directly to the bbolt db.

			// Step 3: Assert data in bbolt via direct store access.
			return assertMigrationDataInBBoltDB()
		}, []LitArgOption{
			WithLitArg(
				"databasebackend",
				terminal.DatabaseBackendBbolt,
			),
		},
	)
	require.NoError(t.t, err)

	// Step 4: Assert data via litcli where possible.
	assertMigrationDataViaLitCLI()

	// Step 5: Restart the node once more with the configured backend to
	// trigger the kvdb -> SQL migration.
	err = net.RestartNode(
		migNode, func() error { return nil }, []LitArgOption{
			WithLitArg(
				"databasebackend",
				*litDBBackend,
			),
		},
	)
	require.NoError(t.t, err)

	// Step 6: Assert data in SQL via direct database access.
	assertMigrationDataSQL()

	// Step 7: Assert data via litcli where possible.
	assertMigrationDataViaLitCLI()
}

// assertMigrationDataInBBoltDB validates bbolt data before migration.
//
// TODO: Implement function.
func assertMigrationDataInBBoltDB() error {
	return nil
}

// assertMigrationDataViaLitCLI checks migration data using litcli commands.
//
// TODO: Implement function.
func assertMigrationDataViaLitCLI() {}

// assertMigrationDataSQL connects to the SQL DB to assert the migration
// results.
//
// TODO: Implement function.
func assertMigrationDataSQL() {}
