package firewalldb

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/clock"
	"github.com/stretchr/testify/require"
)

// TestPrivacyMapStorage tests the privacy mapper CRUD logic.
func TestPrivacyMapStorage(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	sessions := session.NewTestDB(t, clock.NewDefaultClock())
	db := NewTestDBWithSessions(t, sessions)

	// First up, let's test that the correct error is returned if an
	// attempt is made to write to a privacy map that is not linked to
	// an existing session group.
	pdb := db.PrivacyDB(session.ID{1, 2, 3, 4})
	err := pdb.Update(ctx,
		func(ctx context.Context, tx PrivacyMapTx) error {
			_, err := tx.RealToPseudo(ctx, "real")
			require.ErrorIs(t, err, session.ErrUnknownGroup)

			_, err = tx.PseudoToReal(ctx, "pseudo")
			require.ErrorIs(t, err, session.ErrUnknownGroup)

			err = tx.NewPair(ctx, "real", "pseudo")
			require.ErrorIs(t, err, session.ErrUnknownGroup)

			_, err = tx.FetchAllPairs(ctx)
			require.ErrorIs(t, err, session.ErrUnknownGroup)

			return nil
		},
	)
	require.NoError(t, err)

	sess, err := sessions.NewSession(
		ctx, "test", session.TypeAutopilot, time.Unix(1000, 0), "",
	)
	require.NoError(t, err)

	pdb1 := db.PrivacyDB(sess.GroupID)

	_ = pdb1.Update(ctx, func(ctx context.Context, tx PrivacyMapTx) error {
		_, err := tx.RealToPseudo(ctx, "real")
		require.ErrorIs(t, err, ErrNoSuchKeyFound)

		_, err = tx.PseudoToReal(ctx, "pseudo")
		require.ErrorIs(t, err, ErrNoSuchKeyFound)

		err = tx.NewPair(ctx, "real", "pseudo")
		require.NoError(t, err)

		pseudo, err := tx.RealToPseudo(ctx, "real")
		require.NoError(t, err)
		require.Equal(t, "pseudo", pseudo)

		real, err := tx.PseudoToReal(ctx, "pseudo")
		require.NoError(t, err)
		require.Equal(t, "real", real)

		pairs, err := tx.FetchAllPairs(ctx)
		require.NoError(t, err)

		require.EqualValues(t, pairs.pairs, map[string]string{
			"real": "pseudo",
		})

		return nil
	})

	sess2, err := sessions.NewSession(
		ctx, "test", session.TypeAutopilot, time.Unix(1000, 0), "",
	)
	require.NoError(t, err)

	pdb2 := db.PrivacyDB(sess2.GroupID)

	_ = pdb2.Update(ctx, func(ctx context.Context, tx PrivacyMapTx) error {
		_, err := tx.RealToPseudo(ctx, "real")
		require.ErrorIs(t, err, ErrNoSuchKeyFound)

		_, err = tx.PseudoToReal(ctx, "pseudo")
		require.ErrorIs(t, err, ErrNoSuchKeyFound)

		err = tx.NewPair(ctx, "real 2", "pseudo 2")
		require.NoError(t, err)

		pseudo, err := tx.RealToPseudo(ctx, "real 2")
		require.NoError(t, err)
		require.Equal(t, "pseudo 2", pseudo)

		real, err := tx.PseudoToReal(ctx, "pseudo 2")
		require.NoError(t, err)
		require.Equal(t, "real 2", real)

		pairs, err := tx.FetchAllPairs(ctx)
		require.NoError(t, err)

		require.EqualValues(t, pairs.pairs, map[string]string{
			"real 2": "pseudo 2",
		})

		return nil
	})

	sess3, err := sessions.NewSession(
		ctx, "test", session.TypeAutopilot, time.Unix(1000, 0), "",
	)
	require.NoError(t, err)

	pdb3 := db.PrivacyDB(sess3.GroupID)

	_ = pdb3.Update(ctx, func(ctx context.Context, tx PrivacyMapTx) error {
		// Check that calling FetchAllPairs returns an empty map if
		// nothing exists in the DB yet.
		m, err := tx.FetchAllPairs(ctx)
		require.NoError(t, err)
		require.Empty(t, m.pairs)

		// Add a new pair.
		err = tx.NewPair(ctx, "real 1", "pseudo 1")
		require.NoError(t, err)

		// Try to add a new pair that has the same real value as the
		// first pair. This should fail.
		err = tx.NewPair(ctx, "real 1", "pseudo 2")
		require.ErrorIs(t, err, ErrDuplicateRealValue)

		// Try to add a new pair that has the same pseudo value as the
		// first pair. This should fail.
		err = tx.NewPair(ctx, "real 2", "pseudo 1")
		require.ErrorIs(t, err, ErrDuplicatePseudoValue)

		// Add a few more pairs.
		err = tx.NewPair(ctx, "real 2", "pseudo 2")
		require.NoError(t, err)

		err = tx.NewPair(ctx, "real 3", "pseudo 3")
		require.NoError(t, err)

		err = tx.NewPair(ctx, "real 4", "pseudo 4")
		require.NoError(t, err)

		// Check that FetchAllPairs correctly returns all the pairs.
		pairs, err := tx.FetchAllPairs(ctx)
		require.NoError(t, err)

		require.EqualValues(t, pairs.pairs, map[string]string{
			"real 1": "pseudo 1",
			"real 2": "pseudo 2",
			"real 3": "pseudo 3",
			"real 4": "pseudo 4",
		})

		// Do a few tests to ensure that the PrivacyMapPairs struct
		// returned from FetchAllPairs also works as expected.
		pseudo, ok := pairs.GetPseudo("real 1")
		require.True(t, ok)
		require.Equal(t, "pseudo 1", pseudo)

		// Fetch a real value that is not present.
		_, ok = pairs.GetPseudo("real 5")
		require.False(t, ok)

		// Try to add a conflicting pair.
		err = pairs.Add(map[string]string{"real 2": "pseudo 10"})
		require.ErrorContains(t, err, "cannot replace existing "+
			"pseudo entry for real value")

		// Add a new pair.
		err = pairs.Add(map[string]string{"real 5": "pseudo 5"})
		require.NoError(t, err)

		pseudo, ok = pairs.GetPseudo("real 5")
		require.True(t, ok)
		require.Equal(t, "pseudo 5", pseudo)

		// Finally, also test adding multiple new pairs with some
		// overlapping with previously added pairs.
		err = pairs.Add(map[string]string{
			// Add some pairs that already exist.
			"real 1": "pseudo 1",
			"real 3": "pseudo 3",
			// Add some new pairs.
			"real 6": "pseudo 6",
			"real 7": "pseudo 7",
		})
		require.NoError(t, err)

		// Verify that all the expected pairs can be found.
		for r, p := range map[string]string{
			"real 1": "pseudo 1",
			"real 2": "pseudo 2",
			"real 3": "pseudo 3",
			"real 4": "pseudo 4",
			"real 5": "pseudo 5",
			"real 6": "pseudo 6",
			"real 7": "pseudo 7",
		} {
			pseudo, ok = pairs.GetPseudo(r)
			require.True(t, ok)
			require.Equal(t, p, pseudo)
		}

		return nil
	})
}

// TestPrivacyMapTxs tests that the `Update` and `View` functions correctly
// provide atomic access to the db. If anything fails in the middle of an
// `Update` function, then all the changes prior should be rolled back.
func TestPrivacyMapTxs(t *testing.T) {
	t.Parallel()
	ctx := context.Background()

	sessions := session.NewTestDB(t, clock.NewDefaultClock())
	db := NewTestDBWithSessions(t, sessions)

	sess, err := sessions.NewSession(
		ctx, "test", session.TypeAutopilot, time.Unix(1000, 0), "",
	)
	require.NoError(t, err)

	pdb1 := db.PrivacyDB(sess.GroupID)

	// Test that if an action fails midway through the transaction, then
	// it is rolled back.
	err = pdb1.Update(ctx, func(ctx context.Context,
		tx PrivacyMapTx) error {

		err := tx.NewPair(ctx, "real", "pseudo")
		if err != nil {
			return err
		}

		p, err := tx.RealToPseudo(ctx, "real")
		if err != nil {
			return err
		}
		require.Equal(t, "pseudo", p)

		// Now return an error.
		return fmt.Errorf("random error")
	})
	require.Error(t, err)

	err = pdb1.View(ctx, func(ctx context.Context, tx PrivacyMapTx) error {
		_, err := tx.RealToPseudo(ctx, "real")
		return err
	})
	require.ErrorIs(t, err, ErrNoSuchKeyFound)
}
