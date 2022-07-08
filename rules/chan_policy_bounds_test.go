package rules

import (
	"context"
	"fmt"
	"testing"

	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/stretchr/testify/require"
	"google.golang.org/protobuf/proto"
)

// TestChanPolicyBoundsVerifySane tests that the ChanPolicyBounds VerifySane
// method correctly verifies the value of the channel policy bounds depending on
// given min and max sane values.
func TestChanPolicyBoundsVerifySane(t *testing.T) {
	var (
		min = &ChanPolicyBounds{
			MinBaseMsat:  5,
			MaxBaseMsat:  5,
			MinRatePPM:   5,
			MaxRatePPM:   5,
			MinCLTVDelta: 5,
			MaxCLTVDelta: 5,
			MinHtlcMsat:  5,
			MaxHtlcMsat:  5,
		}
		max = &ChanPolicyBounds{
			MinBaseMsat:  10,
			MaxBaseMsat:  10,
			MinRatePPM:   10,
			MaxRatePPM:   10,
			MinCLTVDelta: 10,
			MaxCLTVDelta: 10,
			MinHtlcMsat:  10,
			MaxHtlcMsat:  10,
		}
	)

	tests := []struct {
		name      string
		rule      *ChanPolicyBounds
		expectErr error
	}{
		{
			name: "between bounds",
			rule: &ChanPolicyBounds{
				MinBaseMsat:  6,
				MaxBaseMsat:  6,
				MinRatePPM:   6,
				MaxRatePPM:   6,
				MinCLTVDelta: 6,
				MaxCLTVDelta: 6,
				MinHtlcMsat:  6,
				MaxHtlcMsat:  6,
			},
		},
		{
			name: "min base msat out of bounds",
			rule: &ChanPolicyBounds{
				MinBaseMsat:  1,
				MaxBaseMsat:  6,
				MinRatePPM:   6,
				MaxRatePPM:   6,
				MinCLTVDelta: 6,
				MaxCLTVDelta: 6,
				MinHtlcMsat:  6,
				MaxHtlcMsat:  6,
			},
			expectErr: fmt.Errorf("invalid min base fee"),
		},
		{
			name: "max base msat out of bounds",
			rule: &ChanPolicyBounds{
				MinBaseMsat:  6,
				MaxBaseMsat:  11,
				MinRatePPM:   6,
				MaxRatePPM:   6,
				MinCLTVDelta: 6,
				MaxCLTVDelta: 6,
				MinHtlcMsat:  6,
				MaxHtlcMsat:  6,
			},
			expectErr: fmt.Errorf("invalid max base fee"),
		},
		{
			name: "min prop fee out of bounds",
			rule: &ChanPolicyBounds{
				MinBaseMsat:  6,
				MaxBaseMsat:  6,
				MinRatePPM:   3,
				MaxRatePPM:   6,
				MinCLTVDelta: 6,
				MaxCLTVDelta: 6,
				MinHtlcMsat:  6,
				MaxHtlcMsat:  6,
			},
			expectErr: fmt.Errorf("invalid min proportional fee"),
		},
		{
			name: "max prop fee out of bounds",
			rule: &ChanPolicyBounds{
				MinBaseMsat:  6,
				MaxBaseMsat:  6,
				MinRatePPM:   6,
				MaxRatePPM:   2,
				MinCLTVDelta: 6,
				MaxCLTVDelta: 6,
				MinHtlcMsat:  6,
				MaxHtlcMsat:  6,
			},
			expectErr: fmt.Errorf("invalid max proportional fee"),
		},
		{
			name: "min cltv delta out of bounds",
			rule: &ChanPolicyBounds{
				MinBaseMsat:  6,
				MaxBaseMsat:  6,
				MinRatePPM:   6,
				MaxRatePPM:   6,
				MinCLTVDelta: 1,
				MaxCLTVDelta: 6,
				MinHtlcMsat:  6,
				MaxHtlcMsat:  6,
			},
			expectErr: fmt.Errorf("invalid min cltv delta"),
		},
		{
			name: "max cltv delta out of bounds",
			rule: &ChanPolicyBounds{
				MinBaseMsat:  6,
				MaxBaseMsat:  6,
				MinRatePPM:   6,
				MaxRatePPM:   6,
				MinCLTVDelta: 6,
				MaxCLTVDelta: 30,
				MinHtlcMsat:  6,
				MaxHtlcMsat:  6,
			},
			expectErr: fmt.Errorf("invalid max cltv delta"),
		},
		{
			name: "min htlc msat out of bounds",
			rule: &ChanPolicyBounds{
				MinBaseMsat:  6,
				MaxBaseMsat:  6,
				MinRatePPM:   6,
				MaxRatePPM:   6,
				MinCLTVDelta: 6,
				MaxCLTVDelta: 6,
				MinHtlcMsat:  1,
				MaxHtlcMsat:  6,
			},
			expectErr: fmt.Errorf("invalid min htlc msat amt"),
		},
		{
			name: "max cltv delta of out bounds",
			rule: &ChanPolicyBounds{
				MinBaseMsat:  6,
				MaxBaseMsat:  6,
				MinRatePPM:   6,
				MaxRatePPM:   6,
				MinCLTVDelta: 6,
				MaxCLTVDelta: 6,
				MinHtlcMsat:  6,
				MaxHtlcMsat:  30,
			},
			expectErr: fmt.Errorf("invalid max htlc msat amt"),
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			err := test.rule.VerifySane(min, max)
			require.Equal(t, test.expectErr, err)
		})
	}
}

// TestChannelPolicyBoundsCheckers ensures that the ChanPolicyBounds values
// correctly accepts or denys a request.
func TestChannelPolicyBoundsCheckers(t *testing.T) {
	values := &ChanPolicyBounds{
		MinBaseMsat:  5,
		MaxBaseMsat:  10,
		MinRatePPM:   5000000,
		MaxRatePPM:   10000000,
		MinCLTVDelta: 10,
		MaxCLTVDelta: 40,
		MinHtlcMsat:  10,
		MaxHtlcMsat:  1000,
	}

	tests := []struct {
		name      string
		uri       string
		msg       proto.Message
		expectErr bool
	}{
		{
			name: "non policy update uri",
			uri:  "random-uri",
		},
		{
			name: "policy within bounds (using fee rate ppm)",
			uri:  "/lnrpc.Lightning/UpdateChannelPolicy",
			msg: &lnrpc.PolicyUpdateRequest{
				BaseFeeMsat:          6,
				FeeRatePpm:           6000000,
				TimeLockDelta:        20,
				MinHtlcMsat:          20,
				MaxHtlcMsat:          100,
				MinHtlcMsatSpecified: true,
			},
		},
		{
			name: "policy within bounds (using fee rate)",
			uri:  "/lnrpc.Lightning/UpdateChannelPolicy",
			msg: &lnrpc.PolicyUpdateRequest{
				BaseFeeMsat:          6,
				FeeRate:              6,
				TimeLockDelta:        20,
				MinHtlcMsat:          20,
				MaxHtlcMsat:          100,
				MinHtlcMsatSpecified: true,
			},
		},
		{
			name: "base fees too high",
			uri:  "/lnrpc.Lightning/UpdateChannelPolicy",
			msg: &lnrpc.PolicyUpdateRequest{
				BaseFeeMsat:          11,
				FeeRate:              6,
				TimeLockDelta:        20,
				MinHtlcMsat:          20,
				MaxHtlcMsat:          100,
				MinHtlcMsatSpecified: true,
			},
			expectErr: true,
		},
		{
			name: "base fees too low",
			uri:  "/lnrpc.Lightning/UpdateChannelPolicy",
			msg: &lnrpc.PolicyUpdateRequest{
				BaseFeeMsat:          4,
				FeeRate:              6,
				TimeLockDelta:        20,
				MinHtlcMsat:          20,
				MaxHtlcMsat:          100,
				MinHtlcMsatSpecified: true,
			},
			expectErr: true,
		},
		{
			name: "fee-rate too low (using fee-rate)",
			uri:  "/lnrpc.Lightning/UpdateChannelPolicy",
			msg: &lnrpc.PolicyUpdateRequest{
				BaseFeeMsat:          6,
				FeeRate:              4,
				TimeLockDelta:        20,
				MinHtlcMsat:          20,
				MaxHtlcMsat:          100,
				MinHtlcMsatSpecified: true,
			},
			expectErr: true,
		},
		{
			name: "fee-rate too high (using fee-rate)",
			uri:  "/lnrpc.Lightning/UpdateChannelPolicy",
			msg: &lnrpc.PolicyUpdateRequest{
				BaseFeeMsat:          6,
				FeeRate:              11,
				TimeLockDelta:        20,
				MinHtlcMsat:          20,
				MaxHtlcMsat:          100,
				MinHtlcMsatSpecified: true,
			},
			expectErr: true,
		},
		{
			name: "fee-rate too low (using fee-rate ppm)",
			uri:  "/lnrpc.Lightning/UpdateChannelPolicy",
			msg: &lnrpc.PolicyUpdateRequest{
				BaseFeeMsat:          6,
				FeeRatePpm:           4000000,
				TimeLockDelta:        20,
				MinHtlcMsat:          20,
				MaxHtlcMsat:          100,
				MinHtlcMsatSpecified: true,
			},
			expectErr: true,
		},
		{
			name: "fee-rate too high (using fee-rate ppm)",
			uri:  "/lnrpc.Lightning/UpdateChannelPolicy",
			msg: &lnrpc.PolicyUpdateRequest{
				BaseFeeMsat:          6,
				FeeRatePpm:           11000000,
				TimeLockDelta:        20,
				MinHtlcMsat:          20,
				MaxHtlcMsat:          100,
				MinHtlcMsatSpecified: true,
			},
			expectErr: true,
		},
		{
			name: "cltv delta too low",
			uri:  "/lnrpc.Lightning/UpdateChannelPolicy",
			msg: &lnrpc.PolicyUpdateRequest{
				BaseFeeMsat:          6,
				FeeRatePpm:           6000000,
				TimeLockDelta:        2,
				MinHtlcMsat:          20,
				MaxHtlcMsat:          100,
				MinHtlcMsatSpecified: true,
			},
			expectErr: true,
		},
		{
			name: "cltv delta too high",
			uri:  "/lnrpc.Lightning/UpdateChannelPolicy",
			msg: &lnrpc.PolicyUpdateRequest{
				BaseFeeMsat:          6,
				FeeRatePpm:           6000000,
				TimeLockDelta:        60,
				MinHtlcMsat:          20,
				MaxHtlcMsat:          100,
				MinHtlcMsatSpecified: true,
			},
			expectErr: true,
		},
		{
			name: "cltv delta too low",
			uri:  "/lnrpc.Lightning/UpdateChannelPolicy",
			msg: &lnrpc.PolicyUpdateRequest{
				BaseFeeMsat:          6,
				FeeRatePpm:           6000000,
				TimeLockDelta:        2,
				MinHtlcMsat:          20,
				MaxHtlcMsat:          100,
				MinHtlcMsatSpecified: true,
			},
			expectErr: true,
		},
		{
			name: "min htlc msat amt too low",
			uri:  "/lnrpc.Lightning/UpdateChannelPolicy",
			msg: &lnrpc.PolicyUpdateRequest{
				BaseFeeMsat:          6,
				FeeRatePpm:           6000000,
				TimeLockDelta:        60,
				MinHtlcMsat:          2,
				MaxHtlcMsat:          100,
				MinHtlcMsatSpecified: true,
			},
			expectErr: true,
		},
		{
			name: "max htlc msat amt too high",
			uri:  "/lnrpc.Lightning/UpdateChannelPolicy",
			msg: &lnrpc.PolicyUpdateRequest{
				BaseFeeMsat:          6,
				FeeRatePpm:           6000000,
				TimeLockDelta:        60,
				MinHtlcMsat:          20,
				MaxHtlcMsat:          2000,
				MinHtlcMsatSpecified: true,
			},
			expectErr: true,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			_, err := values.HandleRequest(
				context.Background(), test.uri, test.msg,
			)
			if test.expectErr {
				require.Error(t, err)
				return
			}
			require.NoError(t, err)
		})
	}
}
