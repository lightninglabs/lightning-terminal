package accounts

import (
	"fmt"
	"testing"

	"github.com/lightningnetwork/lnd/fn"
	"github.com/lightningnetwork/lnd/macaroons"
	"github.com/stretchr/testify/require"
	"gopkg.in/macaroon-bakery.v2/bakery/checkers"
	"gopkg.in/macaroon.v2"
)

// TestAccountIDCaveatEmbedding tests that the account ID can be embedded in a
// macaroon caveat and extracted from it.
func TestAccountIDCaveatEmbedding(t *testing.T) {
	badCondition := checkers.Condition(macaroons.CondLndCustom, fmt.Sprintf(
		"%s %s", CondAccount, "invalid hex",
	))

	tests := []struct {
		name         string
		caveats      []macaroon.Caveat
		expectedErr  string
		expectedAcct fn.Option[AccountID]
	}{
		{
			name: "valid account ID, single caveat",
			caveats: []macaroon.Caveat{
				CaveatFromID(AccountID{1, 2, 3, 4, 5}),
			},
			expectedAcct: fn.Some(AccountID{1, 2, 3, 4, 5}),
		},
		{
			name: "valid account ID, single multiple caveats",
			caveats: []macaroon.Caveat{
				{Id: []byte("some other caveat")},
				CaveatFromID(AccountID{1, 2, 3, 4, 5}),
				{Id: []byte("another one")},
			},
			expectedAcct: fn.Some(AccountID{1, 2, 3, 4, 5}),
		},
		{
			name: "invalid account ID",
			caveats: []macaroon.Caveat{
				{Id: []byte(badCondition)},
			},
			expectedErr: "encoding/hex: invalid",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			t.Parallel()

			acct, err := IDFromCaveats(test.caveats)
			if test.expectedErr != "" {
				require.ErrorContains(t, err, test.expectedErr)

				return
			}
			require.NoError(t, err)

			if test.expectedAcct.IsNone() {
				require.True(t, acct.IsNone())

				return
			}
			require.True(t, acct.IsSome())

			test.expectedAcct.WhenSome(func(id AccountID) {
				acct.WhenSome(func(acct AccountID) {
					require.Equal(t, id, acct)
				})
			})
		})
	}
}
