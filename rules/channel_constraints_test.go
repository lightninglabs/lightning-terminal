package rules

import (
	"context"
	"fmt"
	"testing"

	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/stretchr/testify/require"
	"google.golang.org/protobuf/proto"
)

// TestChannelConstraintVerifySane tests that the ChannelConstraint VerifySane
// method correctly verifies the value of the channel open constraint depending
// on given min and max sane values.
func TestChannelConstraintVerifySane(t *testing.T) {
	var (
		min = &ChannelConstraint{
			MinCapacitySat: 5,
			MaxCapacitySat: 5,
			MaxPushSat:     5,
			PrivateAllowed: false,
			PublicAllowed:  true,
		}
		max = &ChannelConstraint{
			MinCapacitySat: 10,
			MaxCapacitySat: 10,
			MaxPushSat:     10,
			PrivateAllowed: false,
			PublicAllowed:  true,
		}
	)

	tests := []struct {
		name      string
		rule      *ChannelConstraint
		expectErr error
	}{
		{
			name: "between bounds",
			rule: &ChannelConstraint{
				MinCapacitySat: 6,
				MaxCapacitySat: 6,
				MaxPushSat:     6,
				PublicAllowed:  true,
			},
		},
		{
			name: "at bounds min",
			rule: &ChannelConstraint{
				MinCapacitySat: 5,
				MaxCapacitySat: 5,
				MaxPushSat:     5,
				PublicAllowed:  true,
			},
		},
		{
			name: "at bounds max",
			rule: &ChannelConstraint{
				MinCapacitySat: 10,
				MaxCapacitySat: 10,
				MaxPushSat:     10,
				PublicAllowed:  true,
			},
		},
		{
			name: "min capacity sat out of bounds",
			rule: &ChannelConstraint{
				MinCapacitySat: 4,
				MaxCapacitySat: 6,
				MaxPushSat:     6,
				PublicAllowed:  true,
			},
			expectErr: fmt.Errorf("invalid min capacity"),
		},
		{
			name: "max capacity sat out of bounds",
			rule: &ChannelConstraint{
				MinCapacitySat: 6,
				MaxCapacitySat: 11,
				MaxPushSat:     6,
				PublicAllowed:  true,
			},
			expectErr: fmt.Errorf("invalid max capacity"),
		},
		{
			name: "max push sat below",
			rule: &ChannelConstraint{
				MinCapacitySat: 6,
				MaxCapacitySat: 6,
				MaxPushSat:     4,
				PublicAllowed:  true,
			},
			expectErr: fmt.Errorf("invalid max push amount"),
		},
		{
			name: "max push sat above",
			rule: &ChannelConstraint{
				MinCapacitySat: 6,
				MaxCapacitySat: 6,
				MaxPushSat:     11,
				PublicAllowed:  true,
			},
			expectErr: fmt.Errorf("invalid max push amount"),
		},
		{
			name: "no channels allowed",
			rule: &ChannelConstraint{
				MinCapacitySat: 6,
				MaxCapacitySat: 6,
				MaxPushSat:     6,
				PrivateAllowed: true,
			},
			expectErr: fmt.Errorf("private channels not allowed"),
		},
		{
			name: "public channels must be allowed",
			rule: &ChannelConstraint{
				MinCapacitySat: 6,
				MaxCapacitySat: 6,
				MaxPushSat:     6,
			},
			expectErr: fmt.Errorf("public channels must be " +
				"allowed"),
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			err := test.rule.VerifySane(min, max)
			require.Equal(t, test.expectErr, err)
		})
	}
}

// TestChannelConstraintCheckers ensures that the ChannelConstraint values
// correctly accepts or denies a request.
func TestChannelConstraintCheckers(t *testing.T) {
	values := &ChannelConstraint{
		MinCapacitySat: 10,
		MaxCapacitySat: 100,
		MaxPushSat:     10,
		PublicAllowed:  true,
		PrivateAllowed: false,
	}

	tests := []struct {
		name      string
		uri       string
		msg       proto.Message
		expectErr string
	}{
		{
			name: "non open channel uri",
			uri:  "random-uri",
		},
		{
			name: "open request within bounds",
			uri:  "/lnrpc.Lightning/OpenChannelSync",
			msg: &lnrpc.OpenChannelRequest{
				LocalFundingAmount: 5,
				PushSat:            5,
			},
		},
		{
			name: "open request with too much capacity",
			uri:  "/lnrpc.Lightning/OpenChannelSync",
			msg: &lnrpc.OpenChannelRequest{
				LocalFundingAmount: 100,
				PushSat:            1,
			},
			expectErr: "invalid total capacity",
		},
		{
			name: "open request with not enough capacity",
			uri:  "/lnrpc.Lightning/OpenChannelSync",
			msg: &lnrpc.OpenChannelRequest{
				LocalFundingAmount: 8,
				PushSat:            1,
			},
			expectErr: "invalid total capacity",
		},
		{
			name: "open request with a too large push amt",
			uri:  "/lnrpc.Lightning/OpenChannelSync",
			msg: &lnrpc.OpenChannelRequest{
				LocalFundingAmount: 10,
				PushSat:            11,
			},
			expectErr: "invalid push sat",
		},
		{
			name: "batch open request with too large capacity",
			uri:  "/lnrpc.Lightning/BatchOpenChannel",
			msg: &lnrpc.BatchOpenChannelRequest{
				Channels: []*lnrpc.BatchOpenChannel{
					{
						LocalFundingAmount: 100,
						PushSat:            1,
					},
					{
						LocalFundingAmount: 99,
						PushSat:            1,
					},
				},
			},
			expectErr: "invalid total capacity",
		},
		{
			name: "private not allowed",
			uri:  "/lnrpc.Lightning/OpenChannelSync",
			msg: &lnrpc.OpenChannelRequest{
				LocalFundingAmount: 5,
				PushSat:            5,
				Private:            true,
			},
			expectErr: "private channels not allowed",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			_, err := values.HandleRequest(
				context.Background(), test.uri, test.msg,
			)
			if test.expectErr != "" {
				require.ErrorContains(t, err, test.expectErr)
				return
			}
			require.NoError(t, err)
		})
	}
}
