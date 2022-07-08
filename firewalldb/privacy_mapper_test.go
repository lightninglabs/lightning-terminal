package firewalldb

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/require"
)

// TestPrivacyMapStorage tests the privacy mapper CRUD logic.
func TestPrivacyMapStorage(t *testing.T) {
	tmpDir := t.TempDir()
	db, err := NewDB(tmpDir, "test.db")
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

		return nil
	})
}

// TestPrivacyMapTxs tests that the `Update` and `View` functions correctly
// provide atomic access to the db. If anything fails in the middle of an
// `Update` function, then all the changes prior should be rolled back.
func TestPrivacyMapTxs(t *testing.T) {
	tmpDir := t.TempDir()
	db, err := NewDB(tmpDir, "test.db")
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
