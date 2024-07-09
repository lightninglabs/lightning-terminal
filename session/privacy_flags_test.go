package session

import (
	"testing"

	"github.com/stretchr/testify/require"
)

// TestPrivacyFlags tests correct serialization and deserialization of
// privacy flags.
func TestPrivacyFlags(t *testing.T) {
	// Unknown flags should return an error.
	unknownFlags, err := Deserialize(uint64(1 << 63))
	require.ErrorIs(t, err, ErrUnknownPrivacyFlag)

	// ClearPubkeys should be correctly serialized and deserialized.
	flags, err := Deserialize(uint64(3))
	require.NoError(t, err)
	require.Equal(t, "ClearPubkeys|ClearAmounts", flags.String())

	// String serialization is stable.
	flagsDisordered := PrivacyFlags{ClearAmounts, ClearPubkeys}
	flagsDisorderedStr := flagsDisordered.String()
	require.Equal(t, "ClearPubkeys|ClearAmounts", flagsDisorderedStr)

	// We can parse the string back to the original flags.
	flagsDisorderedParsed, err := Parse(flagsDisorderedStr)
	require.NoError(t, err)
	require.True(t, flagsDisordered.Equal(flagsDisorderedParsed))
	_, err = Parse("ClearPubkeys|ClearSomethingElse")
	require.ErrorIs(t, err, ErrUnknownPrivacyFlag)
	flagsEmpty, err := Parse("")
	require.NoError(t, err)
	require.Equal(t, PrivacyFlags{}, flagsEmpty)

	extendedFlags := flags.Add(PrivacyFlags{ClearChanIDs})
	require.Equal(t, "ClearPubkeys|ClearAmounts|ClearChanIDs",
		extendedFlags.String())

	// Check that comparison works.
	require.False(t, unknownFlags.Equal(flags))
	require.False(t, flags.Equal(
		PrivacyFlags{ClearAmounts, ClearChanIDs},
	))

	// Check that order doesn't matter.
	require.True(t, flags.Equal(
		PrivacyFlags{ClearAmounts, ClearPubkeys},
	))

	serialized := flags.Serialize()
	deserialized, err := Deserialize(serialized)
	require.NoError(t, err)
	require.Equal(t, flags, deserialized)

	require.True(t, flags.Contains(ClearPubkeys))
	require.True(t, flags.Contains(ClearAmounts))
	require.False(t, flags.Contains(ClearChanIDs))

	autoOpenFlags := PrivacyFlags{ClearPubkeys, ClearNetworkAddresses}
	require.NoError(t, err)
	require.Equal(t, "ClearPubkeys|ClearNetworkAddresses",
		autoOpenFlags.String())
}
