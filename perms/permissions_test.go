package perms

import (
	"testing"

	"github.com/stretchr/testify/require"
	"gopkg.in/macaroon-bakery.v2/bakery"
)

// TestMatchRegexURI tests the behaviour of the MatchRegexURI method of the
// Manager.
func TestMatchRegexURI(t *testing.T) {
	// Construct a new Manager with a predefined list of perms.
	m := &Manager{
		perms: map[string][]bakery.Op{
			"/lnrpc.WalletUnlocker/GenSeed":    {},
			"/lnrpc.WalletUnlocker/InitWallet": {},
			"/lnrpc.Lightning/SendCoins": {{
				Entity: "onchain",
				Action: "write",
			}},
			"/litrpc.Sessions/AddSession": {{
				Entity: "sessions",
				Action: "write",
			}},
			"/litrpc.Sessions/ListSessions": {{
				Entity: "sessions",
				Action: "read",
			}},
			"/litrpc.Sessions/RevokeSession": {{
				Entity: "sessions",
				Action: "write",
			}},
		},
	}

	// Assert that a full URI is not considered a wild card.
	uris, isRegex := m.MatchRegexURI("/litrpc.Sessions/RevokeSession")
	require.False(t, isRegex)
	require.Empty(t, uris)

	// Assert that an invalid URI is also caught as such.
	uris, isRegex = m.MatchRegexURI("***")
	require.False(t, isRegex)
	require.Nil(t, uris)

	// Assert that the function correctly matches on a valid wild card for
	// litrpc URIs.
	uris, isRegex = m.MatchRegexURI("/litrpc.Sessions/.*")
	require.True(t, isRegex)
	require.ElementsMatch(t, uris, []string{
		"/litrpc.Sessions/AddSession",
		"/litrpc.Sessions/ListSessions",
		"/litrpc.Sessions/RevokeSession",
	})

	// Assert that the function correctly matches on a valid wild card for
	// lnd URIs. First we check that we can specify that only the
	// "WalletUnlocker" methods should be included.
	uris, isRegex = m.MatchRegexURI("/lnrpc.WalletUnlocker/.*")
	require.True(t, isRegex)
	require.ElementsMatch(t, uris, []string{
		"/lnrpc.WalletUnlocker/GenSeed",
		"/lnrpc.WalletUnlocker/InitWallet",
	})

	// Now we check that we can include all the `lnrpc` methods.
	uris, isRegex = m.MatchRegexURI("/lnrpc\\..*")
	require.True(t, isRegex)
	require.ElementsMatch(t, uris, []string{
		"/lnrpc.WalletUnlocker/GenSeed",
		"/lnrpc.WalletUnlocker/InitWallet",
		"/lnrpc.Lightning/SendCoins",
	})

	// Assert that the function does not return any URIs for a wild card
	// URI that does not match on any of its perms.
	uris, isRegex = m.MatchRegexURI("/poolrpc.Trader/.*")
	require.True(t, isRegex)
	require.Empty(t, uris)

	// Assert that the read-only permission's keyword is not seen as a valid
	// regex.
	uris, isRegex = m.MatchRegexURI("***readonly***")
	require.False(t, isRegex)
	require.Empty(t, uris)
}
