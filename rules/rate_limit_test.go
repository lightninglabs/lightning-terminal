package rules

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/lightninglabs/lightning-terminal/firewalldb"
	"github.com/stretchr/testify/require"
	"gopkg.in/macaroon-bakery.v2/bakery"
)

// TestRateLimitVerifySane tests that the RateLimit VerifySane method
// correctly verifies the value of the rate limit depending on given min and
// max sane values.
func TestRateLimitVerifySane(t *testing.T) {
	var (
		min = &RateLimit{
			WriteLimit: &Rate{
				Iterations: 1,
				NumHours:   24 * 7,
			},
			ReadLimit: &Rate{
				Iterations: 1,
				NumHours:   24 * 7,
			},
		}
		max = &RateLimit{
			WriteLimit: &Rate{
				Iterations: 1,
				NumHours:   24,
			},
			ReadLimit: &Rate{
				Iterations: 5,
				NumHours:   1,
			},
		}
	)

	tests := []struct {
		name      string
		values    *RateLimit
		expectErr error
	}{
		{
			name: "between bounds",
			values: &RateLimit{
				WriteLimit: &Rate{
					Iterations: 1,
					NumHours:   48,
				},
				ReadLimit: &Rate{
					Iterations: 2,
					NumHours:   1,
				},
			},
		},
		{
			name: "read limit below bounds",
			values: &RateLimit{
				WriteLimit: &Rate{
					Iterations: 1,
					NumHours:   48,
				},
				ReadLimit: &Rate{
					Iterations: 1,
					NumHours:   24 * 14,
				},
			},
			expectErr: fmt.Errorf("read limit is not between " +
				"the min and max"),
		},
		{
			name: "read limit above bounds",
			values: &RateLimit{
				WriteLimit: &Rate{
					Iterations: 1,
					NumHours:   48,
				},
				ReadLimit: &Rate{
					Iterations: 100,
					NumHours:   1,
				},
			},
			expectErr: fmt.Errorf("read limit is not between " +
				"the min and max"),
		},
		{
			name: "write limit below bounds",
			values: &RateLimit{
				WriteLimit: &Rate{
					Iterations: 1,
					NumHours:   24 * 14,
				},
				ReadLimit: &Rate{
					Iterations: 1,
					NumHours:   24 * 7,
				},
			},
			expectErr: fmt.Errorf("write limit is not between " +
				"the min and max"),
		},
		{
			name: "write limit above bounds",
			values: &RateLimit{
				WriteLimit: &Rate{
					Iterations: 10,
					NumHours:   24,
				},
				ReadLimit: &Rate{
					Iterations: 1,
					NumHours:   24 * 7,
				},
			},
			expectErr: fmt.Errorf("write limit is not between " +
				"the min and max"),
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			err := test.values.VerifySane(min, max)
			require.Equal(t, test.expectErr, err)
		})
	}
}

// TestRateLimitCheckRequest checks that a request is correctly accepted or
// denied based on the RateLimitMgr values values.
func TestRateLimitCheckRequest(t *testing.T) {
	ctx := context.Background()

	// Create a new Actions DB.
	db := &mockActionsDB{}

	// Define a mock permissions map with a few read and write URIs.
	perms := map[string][]bakery.Op{
		"read-uri":       {{Action: "read"}},
		"write-uri":      {{Action: "write"}},
		"read-write-uri": {{Action: "write"}, {Action: "read"}},
	}

	// Create a new config struct.
	cfg := &mockRateLimitCfg{
		db:    db,
		perms: perms,
	}

	// Initialise the new values.
	values := &RateLimit{
		WriteLimit: &Rate{
			Iterations: 1,
			NumHours:   24,
		},
		ReadLimit: &Rate{
			Iterations: 2,
			NumHours:   1,
		},
	}

	enf := &RateLimitEnforcer{
		rateLimitConfig: cfg,
		RateLimit:       values,
	}

	// The actions DB is currently empty. So this request should go through.
	_, err := enf.HandleRequest(ctx, "write-uri", nil)
	require.NoError(t, err)

	// Add a write action to the DB that took place long ago.
	db.addAction("write-uri", time.Now().Add(-25*time.Hour))

	// Since the above action took place more than 24 hours ago and the rate
	// limit values defines the write-limit as 1 per 24 hours, a write call
	// should still be allowed.
	_, err = enf.HandleRequest(ctx, "write-uri", nil)
	require.NoError(t, err)

	// Now we add a more recent write action to the DB.
	db.addAction("write-uri", time.Now())

	// Since the rate limit values only allows one write action per 24 hours,
	// a request for another write action should not be allowed.
	_, err = enf.HandleRequest(ctx, "write-uri", nil)
	require.Error(t, err)

	// A read request should still be allowed since we have not exceeded
	// the read limit yet.
	_, err = enf.HandleRequest(ctx, "read-uri", nil)
	require.NoError(t, err)

	// Add one read action to the db.
	db.addAction("read-uri", time.Now())

	// Since the limit is 2 read actions per hour, we should still be able
	// to make another read call.
	_, err = enf.HandleRequest(ctx, "read-uri", nil)
	require.NoError(t, err)

	// Add one more read action to the db.
	db.addAction("read-uri", time.Now())

	// Another read call should now exceed the limit and so should not be
	// allowed.
	_, err = enf.HandleRequest(ctx, "read-uri", nil)
	require.Error(t, err)
}

// mockRateLimitCfg is used to mock the config backend given to the RateLimitMgr
// values during testing.
type mockRateLimitCfg struct {
	db    *mockActionsDB
	perms map[string][]bakery.Op
}

var _ rateLimitConfig = (*mockRateLimitCfg)(nil)

func (m *mockRateLimitCfg) GetActionsDB() firewalldb.ActionsDB {
	return m.db
}

func (m *mockRateLimitCfg) GetMethodPerms() func(string) ([]bakery.Op, bool) {
	return func(s string) ([]bakery.Op, bool) {
		ops, ok := m.perms[s]
		return ops, ok
	}
}

// mockActionsDB is used to mock the action's db backend used by the RateLimitMgr
// values.
type mockActionsDB struct {
	actions []*firewalldb.RuleAction
}

var _ firewalldb.ActionsDB = (*mockActionsDB)(nil)

func (m *mockActionsDB) addAction(uri string, timestamp time.Time) {
	m.actions = append(m.actions, &firewalldb.RuleAction{
		Method:      uri,
		PerformedAt: timestamp,
	})
}

func (m *mockActionsDB) ListActions(_ context.Context) (
	[]*firewalldb.RuleAction, error) {

	return m.actions, nil
}
