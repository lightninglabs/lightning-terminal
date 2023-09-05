package firewalldb

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/require"
)

// TestPrivacyMapStorage tests the privacy mapper CRUD logic.
func TestPrivacyMapStorage(t *testing.T) {
	tmpDir := t.TempDir()
	db, err := NewDB(tmpDir, "test.db", nil)
	require.NoError(t, err)
	t.Cleanup(func() {
		_ = db.Close()
	})

	pdb1 := db.PrivacyDB([4]byte{1, 1, 1, 1})

	_ = pdb1.Update(func(tx PrivacyMapTx) error {
		_, err = tx.RealToPseudo("real")
		require.ErrorIs(t, err, ErrNoSuchKeyFound)

		_, err = tx.PseudoToReal("pseudo")
		require.ErrorIs(t, err, ErrNoSuchKeyFound)

		err = tx.NewPair("real", "pseudo")
		require.NoError(t, err)

		pseudo, err := tx.RealToPseudo("real")
		require.NoError(t, err)
		require.Equal(t, "pseudo", pseudo)

		real, err := tx.PseudoToReal("pseudo")
		require.NoError(t, err)
		require.Equal(t, "real", real)

		pairs, err := tx.FetchAllPairs()
		require.NoError(t, err)

		require.EqualValues(t, pairs.pairs, map[string]string{
			"real": "pseudo",
		})

		return nil
	})

	pdb2 := db.PrivacyDB([4]byte{2, 2, 2, 2})

	_ = pdb2.Update(func(tx PrivacyMapTx) error {
		_, err = tx.RealToPseudo("real")
		require.ErrorIs(t, err, ErrNoSuchKeyFound)

		_, err = tx.PseudoToReal("pseudo")
		require.ErrorIs(t, err, ErrNoSuchKeyFound)

		err = tx.NewPair("real 2", "pseudo 2")
		require.NoError(t, err)

		pseudo, err := tx.RealToPseudo("real 2")
		require.NoError(t, err)
		require.Equal(t, "pseudo 2", pseudo)

		real, err := tx.PseudoToReal("pseudo 2")
		require.NoError(t, err)
		require.Equal(t, "real 2", real)

		pairs, err := tx.FetchAllPairs()
		require.NoError(t, err)

		require.EqualValues(t, pairs.pairs, map[string]string{
			"real 2": "pseudo 2",
		})

		return nil
	})

	pdb3 := db.PrivacyDB([4]byte{3, 3, 3, 3})

	_ = pdb3.Update(func(tx PrivacyMapTx) error {
		// Check that calling FetchAllPairs returns an empty map if
		// nothing exists in the DB yet.
		m, err := tx.FetchAllPairs()
		require.NoError(t, err)
		require.Empty(t, m.pairs)

		// Add a new pair.
		err = tx.NewPair("real 1", "pseudo 1")
		require.NoError(t, err)

		// Try to add a new pair that has the same real value as the
		// first pair. This should fail.
		err = tx.NewPair("real 1", "pseudo 2")
		require.ErrorContains(t, err, "an entry already exists for "+
			"real value")

		// Try to add a new pair that has the same pseudo value as the
		// first pair. This should fail.
		err = tx.NewPair("real 2", "pseudo 1")
		require.ErrorContains(t, err, "an entry already exists for "+
			"pseudo value")

		// Add a few more pairs.
		err = tx.NewPair("real 2", "pseudo 2")
		require.NoError(t, err)

		err = tx.NewPair("real 3", "pseudo 3")
		require.NoError(t, err)

		err = tx.NewPair("real 4", "pseudo 4")
		require.NoError(t, err)

		// Check that FetchAllPairs correctly returns all the pairs.
		pairs, err := tx.FetchAllPairs()
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
	tmpDir := t.TempDir()
	db, err := NewDB(tmpDir, "test.db", nil)
	require.NoError(t, err)
	t.Cleanup(func() {
		_ = db.Close()
	})

	pdb1 := db.PrivacyDB([4]byte{1, 1, 1, 1})

	// Test that if an action fails midway through the transaction, then
	// it is rolled back.
	err = pdb1.Update(func(tx PrivacyMapTx) error {
		err := tx.NewPair("real", "pseudo")
		if err != nil {
			return err
		}

		p, err := tx.RealToPseudo("real")
		if err != nil {
			return err
		}
		require.Equal(t, "pseudo", p)

		// Now return an error.
		return fmt.Errorf("random error")
	})
	require.Error(t, err)

	err = pdb1.View(func(tx PrivacyMapTx) error {
		_, err := tx.RealToPseudo("real")
		return err
	})
	require.ErrorIs(t, err, ErrNoSuchKeyFound)
}
