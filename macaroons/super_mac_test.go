package macaroons

import (
	"encoding/hex"
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/require"
	"gopkg.in/macaroon-bakery.v2/bakery"
)

var (
	// testMacHex is a read-only supermacaroon.
	testMacHex = "0201036c6e6402f802030a1011540404373b4d0b3682b15ea7af60c" +
		"c121431383434313932313339323432393138343738341a0f0a076163636" +
		"f756e741204726561641a0f0a0761756374696f6e1204726561641a0d0a0" +
		"561756469741204726561641a0c0a04617574681204726561641a0c0a046" +
		"96e666f1204726561641a100a08696e7369676874731204726561641a100" +
		"a08696e766f696365731204726561641a0f0a046c6f6f701202696e12036" +
		"f75741a100a086d616361726f6f6e1204726561641a0f0a076d657373616" +
		"7651204726561641a100a086f6666636861696e1204726561641a0f0a076" +
		"f6e636861696e1204726561641a0d0a056f726465721204726561641a0d0" +
		"a0570656572731204726561641a0d0a0572617465731204726561641a160" +
		"a0e7265636f6d6d656e646174696f6e1204726561641a0e0a067265706f7" +
		"2741204726561641a130a0b73756767657374696f6e731204726561641a0" +
		"c0a04737761701204726561641a0d0a057465726d7312047265616400000" +
		"6202362c91888e95dfbbf1eb995bd0fef2b549e2de7f4e9fa11aff445273" +
		"60a6caf"
)

// TestSuperMacaroonRootKeyID tests that adding the super macaroon prefix to
// a root key ID results in a valid super macaroon root key ID.
func TestSuperMacaroonRootKeyID(t *testing.T) {
	t.Parallel()

	someBytes := [4]byte{02, 03, 44, 88}
	rootKeyID := NewSuperMacaroonRootKeyID(someBytes)
	require.True(t, isSuperMacaroonRootKeyID(rootKeyID))
	require.False(t, isSuperMacaroonRootKeyID(123))
}

// TestIsSuperMacaroon tests that we can correctly identify an example super
// macaroon.
func TestIsSuperMacaroon(t *testing.T) {
	t.Parallel()

	require.True(t, IsSuperMacaroon(testMacHex))
}

// TestSuperMacaroonHelpers tests that SuperMacaroonExists and
// MacaroonMatchesPermissions behave correctly.
func TestSuperMacaroonHelpers(t *testing.T) {
	t.Parallel()

	tempDir := t.TempDir()
	path := filepath.Join(tempDir, "test.macaroon")

	// Verify that it doesn't exist yet.
	require.False(t, SuperMacaroonExists(path))

	// Write the test macaroon.
	macBytes, err := hex.DecodeString(testMacHex)
	require.NoError(t, err)
	err = os.WriteFile(path, macBytes, 0600)
	require.NoError(t, err)

	// Now it should exist.
	require.True(t, SuperMacaroonExists(path))

	// The macaroon matches this expected list of permissions.
	expectedPerms := []bakery.Op{
		{Entity: "account", Action: "read"},
		{Entity: "auction", Action: "read"},
		{Entity: "audit", Action: "read"},
		{Entity: "auth", Action: "read"},
		{Entity: "info", Action: "read"},
		{Entity: "insights", Action: "read"},
		{Entity: "invoices", Action: "read"},
		{Entity: "loop", Action: "in"},
		{Entity: "loop", Action: "out"},
		{Entity: "macaroon", Action: "read"},
		{Entity: "message", Action: "read"},
		{Entity: "offchain", Action: "read"},
		{Entity: "onchain", Action: "read"},
		{Entity: "order", Action: "read"},
		{Entity: "peers", Action: "read"},
		{Entity: "rates", Action: "read"},
		{Entity: "recommendation", Action: "read"},
		{Entity: "report", Action: "read"},
		{Entity: "suggestions", Action: "read"},
		{Entity: "swap", Action: "read"},
		{Entity: "terms", Action: "read"},
	}

	matches, err := MacaroonMatchesPermissions(path, expectedPerms)
	require.NoError(t, err)
	require.True(t, matches)

	// A subset of permissions should NOT match exactly.
	matches, err = MacaroonMatchesPermissions(path, expectedPerms[:5])
	require.NoError(t, err)
	require.False(t, matches)

	// Extra/different permissions should NOT match exactly.
	differentPerms := append(
		expectedPerms,
		bakery.Op{Entity: "invalid", Action: "write"},
	)
	matches, err = MacaroonMatchesPermissions(path, differentPerms)
	require.NoError(t, err)
	require.False(t, matches)
}

// TestHasMacaroonSuffix tests that HasMacaroonSuffix correctly
// checks the suffix of the super macaroon path.
func TestHasMacaroonSuffix(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		path    string
		wantErr bool
		errStr  string
	}{
		{
			name:    "empty path",
			path:    "",
			wantErr: true,
			errStr:  "super-macaroon-path cannot be empty",
		},
		{
			name:    "valid path",
			path:    "/tmp/test.macaroon",
			wantErr: false,
		},
		{
			name:    "invalid path - missing suffix",
			path:    "/tmp/test.mac",
			wantErr: true,
			errStr: "super-macaroon-path must end " +
				"with the .macaroon suffix",
		},
		{
			name:    "invalid path - wrong suffix",
			path:    "/tmp/test.macaroon.tmp",
			wantErr: true,
			errStr: "super-macaroon-path must end " +
				"with the .macaroon suffix",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			err := HasMacaroonSuffix(tt.path)
			if tt.wantErr {
				require.Error(t, err)
				require.Contains(t, err.Error(), tt.errStr)
			} else {
				require.NoError(t, err)
			}
		})
	}
}
