//go:build itest

package itest

import (
	"bytes"
	"context"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/btcsuite/btcd/btcutil"
	terminal "github.com/lightninglabs/lightning-terminal"
	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/db/sqlcmig6"
	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lntest"
	"github.com/lightningnetwork/lnd/lntypes"
	"github.com/lightningnetwork/lnd/lnwire"
	"github.com/lightningnetwork/lnd/macaroons"
	"github.com/lightningnetwork/lnd/sqldb/v2"
	"github.com/stretchr/testify/require"
	"go.etcd.io/bbolt"
	"gopkg.in/macaroon-bakery.v2/bakery"
	"gopkg.in/macaroon-bakery.v2/bakery/checkers"
	"gopkg.in/macaroon.v2"
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

	ctxt, cancel := context.WithTimeout(ctx, defaultTimeout)
	defer cancel()

	// Step 1: Start a node with a bbolt backend.
	// We want to start from an explicit bbolt backend regardless of the
	// command line flag used to run the itests.
	migNode, err := net.NewNode(
		t.t, "Migrator", nil, false, true,
		fmt.Sprintf(
			"--databasebackend=%s", terminal.DatabaseBackendBbolt,
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

	// Setup a raw gRPC connection used to set up RPC clients.
	rawConn, err := connectRPC(
		ctxt, migNode.Cfg.LitAddr(), migNode.Cfg.LitTLSCertPath,
	)
	require.NoError(t.t, err)
	defer rawConn.Close()

	// Get the litd admin macaroon context from the migration node.
	macBytes := getLiTMacFromFile(t.t, migNode.Cfg)
	ctxm := macaroonContext(ctxt, macBytes)

	// LiT RPC clients are used to seed test fixtures.
	accountsClient := litrpc.NewAccountsClient(rawConn)

	// Lightning/router clients are used to create account
	// invoices/payments.
	lightningClient := lnrpc.NewLightningClient(rawConn)

	// Step 2a: Insert data into bbolt via litcli or direct store access.
	// setupAccountMigrationData persists accounts and related data which
	// are intended to mimic the data inserted in the
	// accounts/sql_migration_test.go migration tests.
	//
	// NOTE: For accounts migration tests explicitly, we can add all the
	// required data by just executing `litcli accounts CMD` commands.
	// Therefore, this is done prior to stopping the node. For all other
	// migration tests, we need to insert data by directly connecting to the
	// database as `litcli` does not provide enough flexibility to insert
	// the exact data we need to mimic the migration unit tests.
	accountsData := setupAccountMigrationData(
		ctxt, ctxm, t, accountsClient, lightningClient, net.Bob,
	)

	// Close now so restarts can reopen bbolt stores without locks.
	rawConn.Close()

	// Hold bbolt data to assert before and after migration.
	var sessionData sessionMigrationData

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
			dbDir := filepath.Dir(migNode.Cfg.LitMacPath)

			accountStore, err := accounts.NewBoltStore(
				dbDir, accounts.DBFilename,
				clock.NewDefaultClock(),
			)
			if err != nil {
				return err
			}
			defer accountStore.Close()

			sessionData, err = setupBBoltMigrationData(
				ctxt, t, accountStore, dbDir, accountsData,
			)
			if err != nil {
				return err
			}

			// Step 3: Assert data in bbolt via direct store access.
			return assertMigrationDataInBBoltDB(
				ctxt, accountStore, dbDir, accountsData,
				sessionData,
			)
		}, []LitArgOption{
			WithLitArg(
				"databasebackend",
				terminal.DatabaseBackendBbolt,
			),
		},
	)
	require.NoError(t.t, err)

	// Step 4: Assert data via litcli where possible.
	assertMigrationDataViaLitCLI(
		ctxt, t, migNode, accountsData, sessionData,
	)

	// Step 5: Restart the node once more with the configured backend to
	// trigger the kvdb -> SQL migration.
	err = net.RestartNode(
		migNode, func() error { return nil }, []LitArgOption{
			WithLitArg("databasebackend", *litDBBackend),
		},
	)
	require.NoError(t.t, err)

	// Step 6: Assert data in SQL via direct database access.
	assertMigrationDataSQL(ctxt, t, migNode, accountsData, sessionData)

	// Step 7: Assert data via litcli where possible.
	assertMigrationDataViaLitCLI(
		ctxt, t, migNode, accountsData, sessionData,
	)
}

type accountMigrationExpectation struct {
	id             string
	label          string
	expirationDate int64
	initialBalance uint64
	invoices       int
	payments       int
	lastUpdate     int64
}

type accountMigrationData struct {
	expectations     map[string]accountMigrationExpectation
	sessionAccountID string
}

// setupAccountMigrationData creates account fixtures for migration tests
// that mimic accounts/sql_migration_test.go, excluding the randomized account
// test. The expected accounts db state is then returned.
func setupAccountMigrationData(ctx context.Context, adminCtx context.Context,
	t *harnessTest, accountsClient litrpc.AccountsClient,
	lightningClient lnrpc.LightningClient,
	peer *HarnessNode) accountMigrationData {

	now := time.Now()
	expectations := make(map[string]accountMigrationExpectation)

	createAccount := func(balance uint64, expiry int64,
		label string) *litrpc.CreateAccountResponse {

		resp, err := accountsClient.CreateAccount(
			adminCtx, &litrpc.CreateAccountRequest{
				AccountBalance: balance,
				ExpirationDate: expiry,
				Label:          label,
			},
		)
		require.NoError(t.t, err)

		expectations[label] = accountMigrationExpectation{
			id:             resp.Account.Id,
			label:          label,
			expirationDate: expiry,
			initialBalance: balance,
		}

		return resp
	}

	// Mimics accounts/sql_migration_test.go "account no expiry".
	noExpiry := createAccount(0, 0, "migration-no-expiry")

	// Mimics accounts/sql_migration_test.go "account with expiry".
	expiryDate := now.Add(time.Hour).Unix()
	createAccount(0, expiryDate, "migration-with-expiry")

	// Mimics accounts/sql_migration_test.go "account with balance".
	createAccount(100000, 0, "migration-balance")

	// Mimics accounts/sql_migration_test.go "account with set UpdatedAt".
	updateExpiry := now.Add(2 * time.Hour).Unix()
	updatedResp := createAccount(
		0, now.Add(30*time.Minute).Unix(), "migration-updated",
	)
	updatedAcct, err := accountsClient.UpdateAccount(
		adminCtx, &litrpc.UpdateAccountRequest{
			Id:             updatedResp.Account.Id,
			AccountBalance: -1,
			ExpirationDate: updateExpiry,
		},
	)
	require.NoError(t.t, err)
	updated := expectations["migration-updated"]
	updated.expirationDate = updateExpiry
	updated.lastUpdate = updatedAcct.LastUpdate
	expectations["migration-updated"] = updated

	// Mimics accounts/sql_migration_test.go "account with invoices".
	invoicesResp := createAccount(0, 0, "migration-invoices")
	invoiceCtx := macaroonContext(ctx, invoicesResp.Macaroon)
	payNode(
		invoiceCtx, ctx, t, peer.RouterClient, lightningClient,
		4000, "acct-inbound-1",
	)
	payNode(
		invoiceCtx, ctx, t, peer.RouterClient, lightningClient,
		3000, "acct-inbound-2",
	)
	invoiceExpectation := expectations["migration-invoices"]
	invoiceExpectation.invoices = 2
	expectations["migration-invoices"] = invoiceExpectation

	// Mimics accounts/sql_migration_test.go "account with payments".
	// NOTE: As there's no way to insert payments into the accounts store
	// directly by just using `litcli`, we insert the payments outside
	// of this function, by directly connecting to the bbolt db.
	createAccount(50000, 0, "migration-payments")
	paymentExpectation := expectations["migration-payments"]
	paymentExpectation.payments = 4
	expectations["migration-payments"] = paymentExpectation

	// Note that we don't mimic the accounts/sql_migration_test.go
	// "multiple accounts", as the test data already contains multiple
	// accounts due to the rest of the test data.

	return accountMigrationData{
		expectations:     expectations,
		sessionAccountID: noExpiry.Account.Id,
	}
}

// setupBBoltMigrationData seeds the bbolt db with sessions, firewall data, and
// payments, by creating a direct connection to the bbolt db.
func setupBBoltMigrationData(ctx context.Context, t *harnessTest,
	accountStore *accounts.BoltStore, dbDir string,
	accountsData accountMigrationData) (sessionMigrationData, error) {

	err := setupMigrationPayments(accountStore, accountsData)
	if err != nil {
		return sessionMigrationData{}, err
	}

	return setupSessionMigrationData(
		ctx, t, accountStore, dbDir,
	)
}

// setupMigrationPayments inserts payments into the bbolt accounts store to
// mimic the payments in accounts/sql_migration_test.go "account with payments"
// unit test.
func setupMigrationPayments(store accounts.Store,
	accountsData accountMigrationData) error {

	paymentExpectation, ok :=
		accountsData.expectations["migration-payments"]
	if !ok {
		return fmt.Errorf("missing payment account data")
	}

	parsedID, err := accounts.ParseAccountID(paymentExpectation.id)
	if err != nil {
		return err
	}

	payments := []struct {
		hash   lntypes.Hash
		amount lnwire.MilliSatoshi
		status lnrpc.Payment_PaymentStatus
	}{
		{
			hash:   lntypes.Hash{1, 1, 1, 1},
			amount: 100,
			status: lnrpc.Payment_UNKNOWN,
		},
		{
			hash:   lntypes.Hash{2, 2, 2, 2},
			amount: 200,
			status: lnrpc.Payment_IN_FLIGHT,
		},
		{
			hash:   lntypes.Hash{3, 3, 3, 3},
			amount: 200,
			status: lnrpc.Payment_SUCCEEDED,
		},
		{
			hash:   lntypes.Hash{4, 4, 4, 4},
			amount: 200,
			status: lnrpc.Payment_FAILED,
		},
	}

	for _, payment := range payments {
		_, err = store.UpsertAccountPayment(
			context.Background(), *parsedID, payment.hash,
			payment.amount, payment.status,
		)
		if err != nil {
			return err
		}
	}

	return nil
}

// setupSessionMigrationData creates session fixtures for migration tests that
// mimic session/sql_migration_test.go, excluding randomized session tests.
func setupSessionMigrationData(ctx context.Context, t *harnessTest,
	accountStore accounts.Store,
	dbDir string) (sessionMigrationData, error) {

	data := sessionMigrationData{
		expectations: make(map[string]sessionMigrationExpectation),
	}

	sessionStore, err := session.NewDB(
		dbDir, session.DBFilename, clock.NewDefaultClock(),
		accountStore,
	)
	if err != nil {
		return data, err
	}
	defer sessionStore.Close()

	expiry := time.Unix(1000, 0)

	createSession := func(label string, typ session.Type,
		serverAddr string, opts ...session.Option) (*session.Session,
		error) {

		sess, err := sessionStore.NewSession(
			ctx, label, typ, expiry, serverAddr, opts...,
		)
		if err != nil {
			return nil, err
		}

		err = sessionStore.ShiftState(
			ctx, sess.ID, session.StateCreated,
		)
		if err != nil {
			return nil, err
		}

		return sess, nil
	}

	addExpectation := func(sess *session.Session) {
		data.expectations[sess.Label] = buildSessionExpectation(sess)
	}

	findSessionByLabel := func(label string) (*session.Session, error) {
		sessions, err := sessionStore.ListAllSessions(ctx)
		if err != nil {
			return nil, err
		}

		for _, sess := range sessions {
			if sess.Label == label {
				return sess, nil
			}
		}

		return nil, fmt.Errorf("session %s not found", label)
	}

	// Mimic "one session no options".
	sess, err := createSession(
		"migration-session-basic", session.TypeMacaroonAdmin, "",
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	// Mimic "multiple sessions no options".
	sess, err = createSession(
		"migration-session-multi-1", session.TypeMacaroonAdmin, "",
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	sess, err = createSession(
		"migration-session-multi-2", session.TypeMacaroonAdmin, "",
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	sess, err = createSession(
		"migration-session-multi-3", session.TypeMacaroonAdmin, "",
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	// Mimic "one session with one privacy flag".
	sess, err = createSession(
		"migration-session-privacy-one",
		session.TypeMacaroonAdmin, "",
		session.WithPrivacy(session.PrivacyFlags{
			session.ClearPubkeys,
		}),
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	// Mimic "one session with multiple privacy flags".
	sess, err = createSession(
		"migration-session-privacy-multi",
		session.TypeMacaroonAdmin, "",
		session.WithPrivacy(session.PrivacyFlags{
			session.ClearChanInitiator,
			session.ClearHTLCs,
			session.ClearClosingTxIds,
		}),
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	// Mimic "one session with a feature config".
	featureConfig := session.FeaturesConfig{
		"AutoFees":      {1, 2, 3, 4},
		"AutoSomething": {4, 3, 4, 5, 6, 6},
	}
	sess, err = createSession(
		"migration-session-feature",
		session.TypeMacaroonAdmin, "",
		session.WithFeatureConfig(featureConfig),
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	// Mimic "one session with a feature config with empty".
	featureConfigEmpty := session.FeaturesConfig{
		"AutoFees": {},
	}
	sess, err = createSession(
		"migration-session-feature-empty",
		session.TypeMacaroonAdmin, "",
		session.WithFeatureConfig(featureConfigEmpty),
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	// Mimic "one session with a feature config with nil".
	featureConfigNil := session.FeaturesConfig{
		"AutoFees": nil,
	}
	sess, err = createSession(
		"migration-session-feature-nil",
		session.TypeMacaroonAdmin, "",
		session.WithFeatureConfig(featureConfigNil),
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	// Mimic "one session with dev server".
	sess, err = createSession(
		"migration-session-dev-server",
		session.TypeMacaroonAdmin, "",
		session.WithDevServer(),
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	macCaveats := []macaroon.Caveat{
		{
			Id: []byte("migration-caveat"),
		},
	}
	macPerms := []bakery.Op{
		{
			Entity: "offchain",
			Action: "read",
		},
	}

	// Mimic "one session with macaroon recipe".
	sess, err = createSession(
		"migration-session-mac-recipe",
		session.TypeMacaroonAdmin, "foo.bar.baz:1234",
		session.WithMacaroonRecipe(macCaveats, macPerms),
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	// Mimic "one session with macaroon recipe nil caveats".
	sess, err = createSession(
		"migration-session-mac-nil-caveats",
		session.TypeMacaroonAdmin, "foo.bar.baz:1234",
		session.WithMacaroonRecipe(nil, macPerms),
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	// Mimic "one session with macaroon recipe nil perms".
	sess, err = createSession(
		"migration-session-mac-nil-perms",
		session.TypeMacaroonAdmin, "foo.bar.baz:1234",
		session.WithMacaroonRecipe(macCaveats, nil),
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	// Mimic "macaroon recipe with nil perms and caveats".
	sess, err = createSession(
		"migration-session-mac-nil-all",
		session.TypeMacaroonAdmin, "foo.bar.baz:1234",
		session.WithMacaroonRecipe(nil, nil),
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	// Mimic "one session with a linked account".
	linkedAccount, err := accountStore.NewAccount(
		ctx, 1234, time.Now().Add(time.Hour), "",
	)
	if err != nil {
		return data, err
	}
	accountCaveat := checkers.Condition(
		macaroons.CondLndCustom,
		fmt.Sprintf("%s %x", accounts.CondAccount, linkedAccount.ID[:]),
	)
	accountCaveats := []macaroon.Caveat{
		{
			Id: []byte(accountCaveat),
		},
	}
	sess, err = createSession(
		"migration-session-linked-account",
		session.TypeMacaroonAccount, "",
		session.WithAccount(linkedAccount.ID),
		session.WithMacaroonRecipe(accountCaveats, nil),
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	// Mimic "one session with a deleted linked account".
	removedAccount, err := accountStore.NewAccount(
		ctx, 1234, time.Now().Add(time.Hour), "",
	)
	if err != nil {
		return data, err
	}
	removedCaveat := checkers.Condition(
		macaroons.CondLndCustom,
		fmt.Sprintf(
			"%s %x", accounts.CondAccount, removedAccount.ID[:],
		),
	)
	removedCaveats := []macaroon.Caveat{
		{
			Id: []byte(removedCaveat),
		},
	}
	sess, err = createSession(
		"migration-session-removed-account",
		session.TypeMacaroonAccount, "",
		session.WithAccount(removedAccount.ID),
		session.WithMacaroonRecipe(removedCaveats, nil),
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	err = accountStore.RemoveAccount(ctx, removedAccount.ID)
	if err != nil {
		return data, err
	}
	removedExpectation := data.expectations[sess.Label]
	removedExpectation.accountID = ""
	data.expectations[sess.Label] = removedExpectation

	// Mimic "linked session".
	groupSess, err := createSession(
		"migration-session-group-root",
		session.TypeMacaroonAdmin, "",
	)
	if err != nil {
		return data, err
	}
	addExpectation(groupSess)

	err = sessionStore.ShiftState(
		ctx, groupSess.ID, session.StateCreated,
	)
	if err != nil {
		return data, err
	}

	err = sessionStore.ShiftState(
		ctx, groupSess.ID, session.StateRevoked,
	)
	if err != nil {
		return data, err
	}

	sess, err = createSession(
		"migration-session-group-linked",
		session.TypeMacaroonAdmin, "",
		session.WithLinkedGroupID(&groupSess.ID),
	)
	if err != nil {
		return data, err
	}
	addExpectation(sess)

	// Mimic "multiple sessions with the same ID".
	dup1, err := createSession(
		"migration-session-dup-1", session.TypeMacaroonAdmin, "",
	)
	if err != nil {
		return data, err
	}

	dup2, err := createSession(
		"migration-session-dup-2", session.TypeMacaroonAdmin, "",
	)
	if err != nil {
		return data, err
	}

	dup3, err := createSession(
		"migration-session-dup-3", session.TypeMacaroonAdmin, "",
	)
	if err != nil {
		return data, err
	}

	err = updateSessionIDAndCreatedAt(
		sessionStore, dup3.ID, dup2.MacaroonRootKey,
		dup2.CreatedAt.Add(time.Minute),
	)
	if err != nil {
		return data, err
	}

	dup4, err := createSession(
		"migration-session-dup-4", session.TypeMacaroonAdmin, "",
	)
	if err != nil {
		return data, err
	}

	dup5, err := createSession(
		"migration-session-dup-5", session.TypeMacaroonAdmin, "",
	)
	if err != nil {
		return data, err
	}

	dup6, err := createSession(
		"migration-session-dup-6", session.TypeMacaroonAdmin, "",
	)
	if err != nil {
		return data, err
	}

	err = updateSessionIDAndCreatedAt(
		sessionStore, dup5.ID, dup4.MacaroonRootKey,
		dup4.CreatedAt.Add(time.Minute),
	)
	if err != nil {
		return data, err
	}

	err = updateSessionIDAndCreatedAt(
		sessionStore, dup6.ID, dup4.MacaroonRootKey,
		dup4.CreatedAt.Add(time.Minute*2),
	)
	if err != nil {
		return data, err
	}

	dup1, err = findSessionByLabel(dup1.Label)
	if err != nil {
		return data, err
	}
	addExpectation(dup1)

	dup3, err = findSessionByLabel(dup3.Label)
	if err != nil {
		return data, err
	}
	addExpectation(dup3)

	dup6, err = findSessionByLabel(dup6.Label)
	if err != nil {
		return data, err
	}
	addExpectation(dup6)

	return data, nil
}

// buildSessionExpectation converts a bbolt session into the expected RPC
// representation after migration.
func buildSessionExpectation(s *session.Session) sessionMigrationExpectation {
	featureConfigs := make(map[string]string)
	if s.FeatureConfig != nil {
		for name, cfg := range *s.FeatureConfig {
			featureConfigs[name] = string(cfg)
		}
	}

	var recipe *macaroonRecipeExpectation
	if s.MacaroonRecipe != nil {
		perms := make(
			[]macaroonPermExpectation, 0,
			len(s.MacaroonRecipe.Permissions),
		)
		for _, perm := range s.MacaroonRecipe.Permissions {
			perms = append(perms, macaroonPermExpectation{
				entity: perm.Entity,
				action: perm.Action,
			})
		}

		caveats := make(
			[]string, 0, len(s.MacaroonRecipe.Caveats),
		)
		for _, cav := range s.MacaroonRecipe.Caveats {
			caveats = append(caveats, string(cav.Id))
		}

		recipe = &macaroonRecipeExpectation{
			perms:   perms,
			caveats: caveats,
		}
	}

	var accountID string
	s.AccountID.WhenSome(func(id accounts.AccountID) {
		accountID = hex.EncodeToString(id[:])
	})

	return sessionMigrationExpectation{
		label:          s.Label,
		sessionType:    sessionTypeToRPC(s.Type),
		devServer:      s.DevServer,
		privacyFlags:   s.PrivacyFlags.Serialize(),
		featureConfigs: featureConfigs,
		macaroonRecipe: recipe,
		accountID:      accountID,
		groupID:        s.GroupID[:],
	}
}

// sessionTypeToRPC maps the session store type to the RPC enum variant.
func sessionTypeToRPC(typ session.Type) litrpc.SessionType {
	switch typ {
	case session.TypeMacaroonReadonly:
		return litrpc.SessionType_TYPE_MACAROON_READONLY
	case session.TypeMacaroonAdmin:
		return litrpc.SessionType_TYPE_MACAROON_ADMIN
	case session.TypeMacaroonCustom:
		return litrpc.SessionType_TYPE_MACAROON_CUSTOM
	case session.TypeUIPassword:
		return litrpc.SessionType_TYPE_UI_PASSWORD
	case session.TypeAutopilot:
		return litrpc.SessionType_TYPE_AUTOPILOT
	case session.TypeMacaroonAccount:
		return litrpc.SessionType_TYPE_MACAROON_ACCOUNT
	default:
		return litrpc.SessionType_TYPE_MACAROON_ADMIN
	}
}

// updateSessionIDAndCreatedAt overrides the ID and CreatedAt of a session
// to mimic legacy duplicate-ID states.
//
// NOTE: this mimics updateSessionIDAndCreatedAt in
// session/sql_migration_test.go, which can't be used from itests.
func updateSessionIDAndCreatedAt(store *session.BoltStore, oldID session.ID,
	newRootKey uint64, newCreatedAt time.Time) error {

	newID := session.IDFromMacRootKeyID(newRootKey)
	if oldID == newID {
		return fmt.Errorf("can't update session ID to the same ID")
	}

	return store.Update(func(tx *bbolt.Tx) error {
		sessionBkt := tx.Bucket([]byte("session"))
		if sessionBkt == nil {
			return fmt.Errorf("session bucket not found")
		}

		idIndexBkt := sessionBkt.Bucket([]byte("id-index"))
		if idIndexBkt == nil {
			return fmt.Errorf("id-index bucket not found")
		}

		idBkt := idIndexBkt.Bucket(oldID[:])
		if idBkt == nil {
			return fmt.Errorf("session ID entry not found")
		}

		sessionKey := idBkt.Get([]byte("key"))
		if len(sessionKey) == 0 {
			return fmt.Errorf("session key missing for ID")
		}

		rawSession := sessionBkt.Get(sessionKey)
		if len(rawSession) == 0 {
			return fmt.Errorf("session not found")
		}

		sess, err := session.DeserializeSession(
			bytes.NewReader(rawSession),
		)
		if err != nil {
			return err
		}

		sess.ID = newID
		sess.GroupID = newID
		sess.MacaroonRootKey = newRootKey
		sess.CreatedAt = newCreatedAt

		var buf bytes.Buffer
		if err := session.SerializeSession(&buf, sess); err != nil {
			return err
		}

		return sessionBkt.Put(sessionKey, buf.Bytes())
	})
}

type macaroonPermExpectation struct {
	entity string
	action string
}
type macaroonRecipeExpectation struct {
	perms   []macaroonPermExpectation
	caveats []string
}

type sessionMigrationExpectation struct {
	label          string
	sessionType    litrpc.SessionType
	devServer      bool
	privacyFlags   uint64
	featureConfigs map[string]string
	macaroonRecipe *macaroonRecipeExpectation
	accountID      string
	groupID        []byte
}

type sessionMigrationData struct {
	expectations map[string]sessionMigrationExpectation
}

// assertMigrationDataInBBoltDB validates bbolt data before migration.
func assertMigrationDataInBBoltDB(ctx context.Context,
	accountStore *accounts.BoltStore, dbDir string,
	accountsData accountMigrationData,
	sessionData sessionMigrationData) error {

	err := assertAccountsMigrationDataBolt(ctx, accountStore, accountsData)
	if err != nil {
		return err
	}

	return assertSessionMigrationDataBolt(
		ctx, accountStore, dbDir, sessionData,
	)
}

// assertAccountsMigrationDataBolt checks account data in the bbolt store.
func assertAccountsMigrationDataBolt(ctx context.Context,
	accountStore accounts.Store, data accountMigrationData) error {

	accountsList, err := accountStore.Accounts(ctx)
	if err != nil {
		return err
	}

	// Note that other migration tests for sessions and firewalldb may add
	// accounts, and therefore we only check that the accounts store
	// contains at least the expected amount, and not exactly the amount.
	if len(accountsList) < len(data.expectations) {
		return fmt.Errorf(
			"expected at least %d accounts, got %d",
			len(data.expectations), len(accountsList),
		)
	}

	accountsByLabel := make(
		map[string]*accounts.OffChainBalanceAccount,
	)
	for _, acct := range accountsList {
		accountsByLabel[acct.Label] = acct
	}

	for label, expected := range data.expectations {
		acct, ok := accountsByLabel[label]
		if !ok {
			return fmt.Errorf("account %s not found", label)
		}

		if hex.EncodeToString(acct.ID[:]) != expected.id {
			return fmt.Errorf("account %s id mismatch", label)
		}

		expiry := int64(0)
		if !acct.ExpirationDate.IsZero() {
			expiry = acct.ExpirationDate.Unix()
		}
		if expiry != expected.expirationDate {
			return fmt.Errorf(
				"account %s expiration mismatch", label,
			)
		}

		initial := uint64(acct.InitialBalance.ToSatoshis())
		if initial != expected.initialBalance {
			return fmt.Errorf(
				"account %s balance mismatch", label,
			)
		}

		if len(acct.Invoices) != expected.invoices {
			return fmt.Errorf(
				"account %s invoices mismatch", label,
			)
		}
		if len(acct.Payments) != expected.payments {
			return fmt.Errorf(
				"account %s payments mismatch", label,
			)
		}

		if expected.lastUpdate > 0 {
			if acct.LastUpdate.Unix() != expected.lastUpdate {
				return fmt.Errorf(
					"account %s last update mismatch",
					label,
				)
			}
		}
	}

	return nil
}

// assertSessionMigrationDataBolt checks session data in the bbolt store
// before triggering the sqlite migration.
func assertSessionMigrationDataBolt(ctx context.Context,
	accountStore accounts.Store, dbDir string,
	data sessionMigrationData) error {

	dbClock := clock.NewDefaultClock()
	sessionStore, err := session.NewDB(
		dbDir, session.DBFilename, dbClock, accountStore,
	)
	if err != nil {
		return err
	}
	defer sessionStore.Close()

	sessions, err := sessionStore.ListAllSessions(ctx)
	if err != nil {
		return err
	}

	// Note that other migration tests for may add sessions, and therefore
	// we only check that the session store contains at least the expected
	// amount, and not the exact amount.
	if len(sessions) < len(data.expectations) {
		return fmt.Errorf(
			"expected at least %d sessions, got %d",
			len(data.expectations), len(sessions),
		)
	}

	sessionsByLabel := make(map[string]*session.Session)
	for _, sess := range sessions {
		sessionsByLabel[sess.Label] = sess
	}

	for label, expected := range data.expectations {
		sess, ok := sessionsByLabel[label]
		if !ok {
			return fmt.Errorf("session %s not found", label)
		}

		actual := buildSessionExpectation(sess)
		err := normalizeRemovedAccountExpectation(
			ctx, accountStore, expected, &actual,
		)
		if err != nil {
			return err
		}

		if err := compareSessionExpectation(
			label, expected, actual,
		); err != nil {
			return err
		}
	}

	return nil
}

// assertMigrationDataViaLitCLI checks migration data using litcli commands.
func assertMigrationDataViaLitCLI(ctx context.Context, t *harnessTest,
	node *HarnessNode, accountsData accountMigrationData,
	sessionData sessionMigrationData) {

	listResp, err := listAccountsViaLitCLI(ctx, node)
	require.NoError(t.t, err)
	assertAccountMigrationDataFromList(t, listResp, accountsData)

	sessionsResp, err := listSessionsViaLitCLI(ctx, node)
	require.NoError(t.t, err)
	assertSessionMigrationDataFromList(t, sessionsResp, sessionData)
}

// listAccountsViaLitCLI runs `litcli accounts list` and parses the response.
func listAccountsViaLitCLI(ctx context.Context, node *HarnessNode) (
	*litrpc.ListAccountsResponse, error) {

	litcliPath, err := exec.LookPath("litcli")
	if err != nil {
		return nil, fmt.Errorf("litcli not found in PATH")
	}

	cmd := exec.CommandContext(ctx, litcliPath, "accounts", "list")
	cmd.Env = append(os.Environ(),
		fmt.Sprintf("LITCLI_RPCSERVER=%s", node.Cfg.LitAddr()),
		fmt.Sprintf(
			"LITCLI_TLSCERTPATH=%s", node.Cfg.LitTLSCertPath,
		),
		fmt.Sprintf("LITCLI_MACAROONPATH=%s", node.Cfg.LitMacPath),
		fmt.Sprintf(
			"LITCLI_NETWORK=%s", node.Cfg.NetParams.Name,
		),
		fmt.Sprintf("LITCLI_BASEDIR=%s", node.Cfg.LitDir),
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf(
			"litcli accounts list failed: %w: %s",
			err, strings.TrimSpace(string(output)),
		)
	}

	raw := strings.TrimSpace(string(output))
	if raw == "" {
		return nil, fmt.Errorf("litcli accounts list returned no data")
	}

	var resp litrpc.ListAccountsResponse
	err = lnrpc.ProtoJSONUnmarshalOpts.Unmarshal(
		[]byte(raw), &resp,
	)
	if err != nil {
		return nil, err
	}

	return &resp, nil
}

// listSessionsViaLitCLI runs `litcli sessions list all` and parses output
// into an RPC response.
func listSessionsViaLitCLI(ctx context.Context, node *HarnessNode) (
	*litrpc.ListSessionsResponse, error) {

	litcliPath, err := exec.LookPath("litcli")
	if err != nil {
		return nil, fmt.Errorf("litcli not found in PATH")
	}

	cmd := exec.CommandContext(
		ctx, litcliPath, "sessions", "list", "all",
	)
	cmd.Env = append(os.Environ(),
		fmt.Sprintf("LITCLI_RPCSERVER=%s", node.Cfg.LitAddr()),
		fmt.Sprintf(
			"LITCLI_TLSCERTPATH=%s", node.Cfg.LitTLSCertPath,
		),
		fmt.Sprintf("LITCLI_MACAROONPATH=%s", node.Cfg.LitMacPath),
		fmt.Sprintf(
			"LITCLI_NETWORK=%s", node.Cfg.NetParams.Name,
		),
		fmt.Sprintf("LITCLI_BASEDIR=%s", node.Cfg.LitDir),
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf(
			"litcli sessions list all failed: %w: %s",
			err, strings.TrimSpace(string(output)),
		)
	}

	raw := strings.TrimSpace(string(output))
	if raw == "" {
		return nil, fmt.Errorf("litcli sessions list returned no data")
	}

	var resp litrpc.ListSessionsResponse
	err = lnrpc.ProtoJSONUnmarshalOpts.Unmarshal(
		[]byte(raw), &resp,
	)
	if err != nil {
		return nil, err
	}

	return &resp, nil
}

// assertAccountMigrationDataFromList checks account data in a list response.
func assertAccountMigrationDataFromList(t *harnessTest,
	listResp *litrpc.ListAccountsResponse,
	data accountMigrationData) {

	require.NotNil(t.t, listResp)

	// Note that other migration tests for sessions and firewalldb may add
	// accounts, and therefore we only check that the accounts store
	// contains at least the expected amount, and not exactly the amount.
	require.GreaterOrEqual(
		t.t, len(listResp.Accounts), len(data.expectations),
	)
	accountsByLabel := make(map[string]*litrpc.Account)
	for _, acct := range listResp.Accounts {
		accountsByLabel[acct.Label] = acct
	}

	for label, expected := range data.expectations {
		acct, ok := accountsByLabel[label]
		require.Truef(t.t, ok, "account %s not found", label)
		require.Equal(t.t, expected.id, acct.Id)
		require.Equal(t.t, expected.expirationDate, acct.ExpirationDate)
		require.Equal(t.t, expected.initialBalance, acct.InitialBalance)
		require.Len(t.t, acct.Invoices, expected.invoices)
		require.Len(t.t, acct.Payments, expected.payments)
		if expected.lastUpdate > 0 {
			require.Equal(t.t, expected.lastUpdate, acct.LastUpdate)
		}
	}
}

// assertSessionMigrationDataFromList checks session data from a list response.
func assertSessionMigrationDataFromList(t *harnessTest,
	resp *litrpc.ListSessionsResponse,
	data sessionMigrationData) {

	require.NotNil(t.t, resp)
	require.GreaterOrEqual(
		t.t, len(resp.Sessions), len(data.expectations),
	)
	sessionsByLabel := make(map[string]*litrpc.Session)
	for _, sess := range resp.Sessions {
		sessionsByLabel[sess.Label] = sess
	}

	for label, expected := range data.expectations {
		sess, ok := sessionsByLabel[label]
		require.Truef(t.t, ok, "session %s not found", label)

		// If the account was removed after session creation, the RPC list
		// still reports the account ID. Match that behavior by aligning
		// the expected value before asserting.
		expected = normalizeRemovedAccountExpectationList(
			t, sess, expected,
		)

		require.Equal(t.t, expected.sessionType, sess.SessionType)
		require.Equal(t.t, expected.devServer, sess.DevServer)
		require.Equal(t.t, expected.privacyFlags, sess.PrivacyFlags)
		require.Equal(t.t, expected.accountID, sess.AccountId)
		require.Equal(t.t, expected.groupID, sess.GroupId)

		assertFeatureConfigs(
			t, sess.FeatureConfigs, expected.featureConfigs,
		)
		assertMacaroonRecipe(
			t, sess.MacaroonRecipe, expected.macaroonRecipe,
		)
	}
}

// assertFeatureConfigs checks that expected feature configs are preserved.
func assertFeatureConfigs(t *harnessTest,
	actual map[string]string, expected map[string]string) {

	if len(expected) == 0 {
		require.Len(t.t, actual, 0)
		return
	}

	require.Len(t.t, actual, len(expected))
	for name, expectedValue := range expected {
		actualValue, ok := actual[name]
		require.Truef(t.t, ok, "feature config %s missing", name)
		require.Equal(t.t, expectedValue, actualValue)
	}
}

// assertMacaroonRecipe checks that migrated macaroon recipe fields are kept.
func assertMacaroonRecipe(t *harnessTest, actual *litrpc.MacaroonRecipe,
	expected *macaroonRecipeExpectation) {

	if expected == nil {
		if actual == nil {
			return
		}

		require.Empty(t.t, actual.Permissions)
		require.Empty(t.t, actual.Caveats)
		return
	}

	if len(expected.perms) == 0 && len(expected.caveats) == 0 {
		if actual == nil {
			return
		}

		require.Empty(t.t, actual.Permissions)
		require.Empty(t.t, actual.Caveats)
		return
	}

	require.NotNil(t.t, actual)
	require.Equal(
		t.t, len(expected.caveats), len(actual.Caveats),
	)
	require.Equal(
		t.t, len(expected.perms), len(actual.Permissions),
	)

	expectedCaveats := append([]string{}, expected.caveats...)
	actualCaveats := append([]string{}, actual.Caveats...)
	sort.Strings(expectedCaveats)
	sort.Strings(actualCaveats)
	require.Equal(t.t, expectedCaveats, actualCaveats)

	expectedPerms := make([]macaroonPermExpectation, len(expected.perms))
	copy(expectedPerms, expected.perms)
	sort.Slice(expectedPerms, func(i, j int) bool {
		if expectedPerms[i].entity == expectedPerms[j].entity {
			return expectedPerms[i].action < expectedPerms[j].action
		}

		return expectedPerms[i].entity < expectedPerms[j].entity
	})

	actualPerms := make([]macaroonPermExpectation, len(actual.Permissions))
	for i, perm := range actual.Permissions {
		actualPerms[i] = macaroonPermExpectation{
			entity: perm.Entity,
			action: perm.Action,
		}
	}
	sort.Slice(actualPerms, func(i, j int) bool {
		if actualPerms[i].entity == actualPerms[j].entity {
			return actualPerms[i].action < actualPerms[j].action
		}

		return actualPerms[i].entity < actualPerms[j].entity
	})

	require.Equal(t.t, expectedPerms, actualPerms)
}

// assertMigrationDataSQL connects to the SQL DB to assert the migration
// results.
func assertMigrationDataSQL(ctx context.Context, t *harnessTest,
	node *HarnessNode, accountsData accountMigrationData,
	sessionData sessionMigrationData) {

	assertAccountMigrationDataSQL(ctx, t, node, accountsData)
	assertSessionMigrationDataSQL(ctx, t, node, sessionData)
}

// assertAccountMigrationDataSQL connects to the SQL DB and queries account
// data to assert migration results.
func assertAccountMigrationDataSQL(ctx context.Context, t *harnessTest,
	node *HarnessNode, data accountMigrationData) {

	dbPath := filepath.Join(
		node.Cfg.LitDir, node.Cfg.NetParams.Name, "litd.db",
	)

	sqlStore, err := sqldb.NewSqliteStore(
		&sqldb.SqliteConfig{
			SkipMigrations:        true,
			SkipMigrationDbBackup: true,
		}, dbPath,
	)
	require.NoError(t.t, err)
	defer sqlStore.BaseDB.Close()

	queries := sqlcmig6.NewForType(sqlStore.BaseDB, sqlStore.BackendType)

	accountsList, err := queries.ListAllAccounts(ctx)
	require.NoError(t.t, err)

	// Note that other migration tests for sessions and firewalldb may add
	// accounts, and therefore we only check that the accounts store
	// contains at least the expected amount, and not exactly the amount.
	require.GreaterOrEqual(
		t.t, len(accountsList), len(data.expectations),
	)

	accountsByLabel := make(map[string]sqlcmig6.Account)
	for _, acct := range accountsList {
		if acct.Label.Valid {
			accountsByLabel[acct.Label.String] = acct
		}
	}

	for label, expected := range data.expectations {
		acct, ok := accountsByLabel[label]
		require.Truef(t.t, ok, "account %s not found", label)

		alias, err := accounts.AccountIDFromInt64(acct.Alias)
		require.NoError(t.t, err)
		require.Equal(t.t, expected.id, alias.String())

		expiry := int64(0)
		if !acct.Expiration.IsZero() {
			expiry = acct.Expiration.Unix()
		}
		require.Equal(t.t, expected.expirationDate, expiry)

		initial := lnwire.MilliSatoshi(
			acct.InitialBalanceMsat,
		).ToSatoshis()
		require.Equal(t.t, expected.initialBalance, uint64(initial))

		invoices, err := queries.ListAccountInvoices(ctx, acct.ID)
		require.NoError(t.t, err)
		require.Len(t.t, invoices, expected.invoices)

		payments, err := queries.ListAccountPayments(ctx, acct.ID)
		require.NoError(t.t, err)
		require.Len(t.t, payments, expected.payments)

		if expected.lastUpdate > 0 {
			require.Equal(
				t.t, expected.lastUpdate,
				acct.LastUpdated.Unix(),
			)
		}
	}
}

// assertSessionMigrationDataSQL connects to the SQL DB and queries sessions
// to assert migration results.
func assertSessionMigrationDataSQL(ctx context.Context, t *harnessTest,
	node *HarnessNode, data sessionMigrationData) {

	dbPath := filepath.Join(
		node.Cfg.LitDir,
		node.Cfg.NetParams.Name,
		"litd.db",
	)

	sqlStore, err := sqldb.NewSqliteStore(
		&sqldb.SqliteConfig{
			SkipMigrations:        true,
			SkipMigrationDbBackup: true,
		}, dbPath,
	)
	require.NoError(t.t, err)
	defer sqlStore.BaseDB.Close()

	queries := sqlcmig6.NewForType(
		sqlStore.BaseDB, sqlStore.BackendType,
	)

	sessions, err := queries.ListSessions(ctx)
	require.NoError(t.t, err)
	require.GreaterOrEqual(
		t.t, len(sessions), len(data.expectations),
	)

	sessionsByLabel := make(map[string]sqlcmig6.Session)
	for _, sess := range sessions {
		sessionsByLabel[sess.Label] = sess
	}

	for label, expected := range data.expectations {
		dbSess, ok := sessionsByLabel[label]
		require.Truef(t.t, ok, "session %s not found", label)

		actual, err := buildSessionExpectationFromSQL(
			ctx, queries, dbSess,
		)
		require.NoError(t.t, err)

		err = compareSessionExpectation(label, expected, actual)
		require.NoError(t.t, err)
	}
}

// buildSessionExpectationFromSQL converts SQL rows into expectations.
func buildSessionExpectationFromSQL(ctx context.Context,
	queries *sqlcmig6.Queries,
	dbSess sqlcmig6.Session) (sessionMigrationExpectation, error) {

	featureConfigs := make(map[string]string)
	configRows, err := queries.GetSessionFeatureConfigs(ctx, dbSess.ID)
	if err != nil {
		return sessionMigrationExpectation{}, err
	}
	for _, cfg := range configRows {
		featureConfigs[cfg.FeatureName] = string(cfg.Config)
	}

	var recipe *macaroonRecipeExpectation
	caveats, err := queries.GetSessionMacaroonCaveats(ctx, dbSess.ID)
	if err != nil {
		return sessionMigrationExpectation{}, err
	}
	perms, err := queries.GetSessionMacaroonPermissions(ctx, dbSess.ID)
	if err != nil {
		return sessionMigrationExpectation{}, err
	}
	if len(caveats) > 0 || len(perms) > 0 {
		permsExp := make(
			[]macaroonPermExpectation, 0, len(perms),
		)
		for _, perm := range perms {
			permsExp = append(permsExp, macaroonPermExpectation{
				entity: perm.Entity,
				action: perm.Action,
			})
		}

		caveatsExp := make([]string, 0, len(caveats))
		for _, cav := range caveats {
			caveatsExp = append(
				caveatsExp, string(cav.CaveatID),
			)
		}

		recipe = &macaroonRecipeExpectation{
			perms:   permsExp,
			caveats: caveatsExp,
		}
	}

	privFlagsRows, err := queries.GetSessionPrivacyFlags(
		ctx, dbSess.ID,
	)
	if err != nil {
		return sessionMigrationExpectation{}, err
	}
	privFlags := make(
		session.PrivacyFlags, 0, len(privFlagsRows),
	)
	for _, flag := range privFlagsRows {
		privFlags = append(
			privFlags, session.PrivacyFlag(flag.Flag),
		)
	}

	var accountID string
	if dbSess.AccountID.Valid {
		acct, err := queries.GetAccount(
			ctx, dbSess.AccountID.Int64,
		)
		if err != nil {
			return sessionMigrationExpectation{}, err
		}

		alias, err := accounts.AccountIDFromInt64(acct.Alias)
		if err != nil {
			return sessionMigrationExpectation{}, err
		}
		accountID = alias.String()
	}

	var groupID []byte
	if dbSess.GroupID.Valid {
		alias, err := queries.GetAliasBySessionID(
			ctx, dbSess.GroupID.Int64,
		)
		if err != nil {
			return sessionMigrationExpectation{}, err
		}
		groupID = alias
	}

	return sessionMigrationExpectation{
		label:          dbSess.Label,
		sessionType:    sessionTypeToRPC(session.Type(dbSess.Type)),
		devServer:      dbSess.DevServer,
		privacyFlags:   privFlags.Serialize(),
		featureConfigs: featureConfigs,
		macaroonRecipe: recipe,
		accountID:      accountID,
		groupID:        groupID,
	}, nil
}

// normalizeRemovedAccountExpectation clears bbolt account IDs that
// reference deleted accounts.
func normalizeRemovedAccountExpectation(ctx context.Context,
	accountStore accounts.Store, expected sessionMigrationExpectation,
	actual *sessionMigrationExpectation) error {

	if actual == nil {
		return fmt.Errorf("actual session expectation missing")
	}

	if expected.accountID != "" || actual.accountID == "" {
		return nil
	}

	accountID, err := accounts.ParseAccountID(actual.accountID)
	if err != nil {
		return err
	}

	_, err = accountStore.Account(ctx, *accountID)
	if err == nil {
		return fmt.Errorf("account %s still exists", actual.accountID)
	}
	if !errors.Is(err, accounts.ErrAccNotFound) {
		return err
	}

	actual.accountID = ""
	return nil
}

// compareSessionExpectation verifies a bbolt session against expectations.
func compareSessionExpectation(label string,
	expected sessionMigrationExpectation,
	actual sessionMigrationExpectation) error {

	if expected.sessionType != actual.sessionType {
		return fmt.Errorf(
			"session %s type mismatch", label,
		)
	}

	if expected.devServer != actual.devServer {
		return fmt.Errorf(
			"session %s dev server mismatch", label,
		)
	}

	if expected.privacyFlags != actual.privacyFlags {
		return fmt.Errorf(
			"session %s privacy flags mismatch", label,
		)
	}

	if expected.accountID != actual.accountID {
		return fmt.Errorf(
			"session %s account id mismatch", label,
		)
	}

	if !bytes.Equal(expected.groupID, actual.groupID) {
		return fmt.Errorf(
			"session %s group id mismatch", label,
		)
	}

	err := compareFeatureConfigMap(
		label, expected.featureConfigs, actual.featureConfigs,
	)
	if err != nil {
		return err
	}

	return compareMacaroonRecipeExpectation(
		label, expected.macaroonRecipe, actual.macaroonRecipe,
	)
}

// compareFeatureConfigMap matches expected session feature configs.
func compareFeatureConfigMap(label string, expected map[string]string,
	actual map[string]string) error {

	if len(expected) == 0 && len(actual) == 0 {
		return nil
	}

	if len(expected) != len(actual) {
		return fmt.Errorf(
			"session %s feature config length mismatch", label,
		)
	}

	for name, expectedValue := range expected {
		actualValue, ok := actual[name]
		if !ok {
			return fmt.Errorf(
				"session %s feature config %s missing",
				label, name,
			)
		}
		if actualValue != expectedValue {
			return fmt.Errorf(
				"session %s feature config %s mismatch",
				label, name,
			)
		}
	}

	return nil
}

// compareMacaroonRecipeExpectation matches expected session macaroon
// recipe data.
func compareMacaroonRecipeExpectation(label string,
	expected *macaroonRecipeExpectation,
	actual *macaroonRecipeExpectation) error {

	if expected == nil {
		if actual == nil {
			return nil
		}
		if len(actual.perms) == 0 && len(actual.caveats) == 0 {
			return nil
		}
		return fmt.Errorf("session %s recipe mismatch", label)
	}

	if len(expected.perms) == 0 && len(expected.caveats) == 0 {
		if actual == nil {
			return nil
		}
		if len(actual.perms) == 0 && len(actual.caveats) == 0 {
			return nil
		}
		return fmt.Errorf("session %s recipe mismatch", label)
	}

	if actual == nil {
		return fmt.Errorf("session %s recipe missing", label)
	}

	if len(expected.caveats) != len(actual.caveats) {
		return fmt.Errorf(
			"session %s caveat count mismatch", label,
		)
	}

	if len(expected.perms) != len(actual.perms) {
		return fmt.Errorf(
			"session %s permission count mismatch", label,
		)
	}

	expectedCaveats := append([]string{}, expected.caveats...)
	actualCaveats := append([]string{}, actual.caveats...)
	sort.Strings(expectedCaveats)
	sort.Strings(actualCaveats)
	if !equalStringSlices(expectedCaveats, actualCaveats) {
		return fmt.Errorf(
			"session %s caveats mismatch", label,
		)
	}

	expectedPerms := append(
		[]macaroonPermExpectation{}, expected.perms...,
	)
	actualPerms := append(
		[]macaroonPermExpectation{}, actual.perms...,
	)
	sort.Slice(expectedPerms, func(i, j int) bool {
		if expectedPerms[i].entity == expectedPerms[j].entity {
			return expectedPerms[i].action < expectedPerms[j].action
		}

		return expectedPerms[i].entity < expectedPerms[j].entity
	})
	sort.Slice(actualPerms, func(i, j int) bool {
		if actualPerms[i].entity == actualPerms[j].entity {
			return actualPerms[i].action < actualPerms[j].action
		}

		return actualPerms[i].entity < actualPerms[j].entity
	})
	if !equalPermSlices(expectedPerms, actualPerms) {
		return fmt.Errorf(
			"session %s permissions mismatch", label,
		)
	}

	return nil
}

// equalStringSlices compares two string slices that are already sorted.
func equalStringSlices(left []string, right []string) bool {
	if len(left) != len(right) {
		return false
	}

	for i := range left {
		if left[i] != right[i] {
			return false
		}
	}

	return true
}

// equalPermSlices compares macaroon permission slices that are sorted.
func equalPermSlices(left []macaroonPermExpectation,
	right []macaroonPermExpectation) bool {

	if len(left) != len(right) {
		return false
	}

	for i := range left {
		if left[i] != right[i] {
			return false
		}
	}

	return true
}

// normalizeRemovedAccountExpectationList clears expected account IDs when
// the session reports a removed account.
func normalizeRemovedAccountExpectationList(t *harnessTest,
	sess *litrpc.Session,
	expected sessionMigrationExpectation) sessionMigrationExpectation {

	if sess == nil {
		return expected
	}

	if expected.accountID == "" && sess.AccountId != "" {
		expected.accountID = sess.AccountId
	}

	return expected
}
