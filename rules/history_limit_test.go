package rules

import (
	"context"
	"testing"
	"time"

	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/stretchr/testify/require"
)

// TestHistoryLimitVerifySane tests that the HistoryLimit VerifySane method
// correctly verifies the value of the rate limit depending on given min and
// max sane values.
func TestHistoryLimitVerifySane(t *testing.T) {
	var min = &HistoryLimit{
		Duration: time.Hour * 24,
	}

	tests := []struct {
		name      string
		rule      *HistoryLimit
		expectErr bool
	}{
		{
			name: "between bounds (start date)",
			rule: &HistoryLimit{
				StartDate: time.Now().Add(-time.Hour * 48),
			},
		},
		{
			name: "between bounds (duration)",
			rule: &HistoryLimit{
				Duration: time.Hour * 48,
			},
		},
		{
			name: "too short (start date)",
			rule: &HistoryLimit{
				StartDate: time.Now().Add(-time.Hour),
			},
			expectErr: true,
		},
		{
			name: "too short (duration)",
			rule: &HistoryLimit{
				Duration: time.Hour,
			},
			expectErr: true,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			err := test.rule.VerifySane(min, nil)
			if test.expectErr {
				require.Error(t, err)
				return
			}
			require.NoError(t, err)
		})
	}
}

// TestHistoryLimitCheckers ensures that the HistoryLimit values correctly
// accepts or denys a request or correctly modifies a response.
func TestHistoryLimitCheckers(t *testing.T) {
	values := &HistoryLimit{
		StartDate: time.Now().Add(-24 * time.Hour),
	}

	ctx := context.Background()

	// A request for an irrelevant URI should be accepted.
	_, err := values.HandleRequest(ctx, "random-URI", nil)
	require.NoError(t, err)

	// The ForwardingHistory request has a StartTime parameter. The request
	// should be allowed if the parameter is ok given the HistoryLimit values.
	_, err = values.HandleRequest(
		ctx, "/lnrpc.Lightning/ForwardingHistory",
		&lnrpc.ForwardingHistoryRequest{
			StartTime: uint64(time.Now().Add(-time.Hour).Unix()),
		},
	)
	require.NoError(t, err)

	// And it should be denied if it violates the values.
	// The ForwardingHistory request has a StartTime parameter. The request
	// should be allowed if the parameter is ok given the HistoryLimit values.
	_, err = values.HandleRequest(
		ctx, "/lnrpc.Lightning/ForwardingHistory",
		&lnrpc.ForwardingHistoryRequest{
			StartTime: uint64(
				time.Now().Add(-48 * time.Hour).Unix(),
			),
		},
	)
	require.Error(t, err)

	// The ListInvoices function does not have a StartTime parameter and
	// so the HistoryLimit values needs to alter the _response_ of this query
	// instead to only include the invoices created after the HistoryLimit
	// start date.
	invoices := []*lnrpc.Invoice{
		{CreationDate: time.Now().Unix()},
		{CreationDate: time.Now().Add(-time.Hour * 5).Unix()},
		{CreationDate: time.Now().Add(-time.Hour * 25).Unix()},
	}

	respMsg, err := values.HandleResponse(
		ctx, "lnrpc.Lightning/ListInvoices",
		&lnrpc.ListInvoiceResponse{
			Invoices: invoices,
		},
	)
	require.NoError(t, err)
	require.NotNil(t, respMsg)

	resp, ok := respMsg.(*lnrpc.ListInvoiceResponse)
	require.True(t, ok)

	require.Len(t, resp.Invoices, 2)
	require.True(t, time.Unix(resp.Invoices[0].CreationDate, 0).After(
		values.StartDate,
	))
	require.True(t, time.Unix(resp.Invoices[1].CreationDate, 0).After(
		values.StartDate,
	))
}
