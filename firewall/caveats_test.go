package firewall

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/require"
)

const (
	testMetaCaveat = "lnd-custom lit-mac-fw meta:{\"actor_name\":" +
		"\"autopilot\",\"feature\":\"re-balance\",\"trigger\":" +
		"\"channel 7413345453234435345 depleted\",\"intent\":" +
		"\"increase outbound liquidity by 2000000 sats\"," +
		"\"structured_json_data\":\"{}\"}"

	testRulesCaveat = "lnd-custom lit-mac-fw rules:{\"session_rules\":{" +
		"\"rate-limit\":\"1/10\"},\"feature_rules\":{\"AutoFees\":{" +
		"\"first-hop-ignore-list\":\"03abcd...,02badb01...\"," +
		"\"max-hops\":\"4\"},\"Rebalance\":{\"off-chain-fees-sats\":" +
		"\"10\",\"re-balance-min-interval-seconds\":\"3600\"}}}"
)

// TestInterceptMetaInfo makes sure that a meta information struct can be
// formatted as a caveat and then parsed again successfully.
func TestInterceptMetaInfo(t *testing.T) {
	info := &InterceptMetaInfo{
		ActorName:          "autopilot",
		Feature:            "re-balance",
		Trigger:            "channel 7413345453234435345 depleted",
		Intent:             "increase outbound liquidity by 2000000 sats",
		StructuredJsonData: "{}",
	}

	caveat, err := info.ToCaveat()
	require.NoError(t, err)

	require.Equal(t, testMetaCaveat, caveat)

	parsedInfo, err := ParseMetaInfoCaveat(caveat)
	require.NoError(t, err)

	require.Equal(t, info, parsedInfo)
}

// TestParseMetaInfoCaveat makes sure the meta information caveat parsing works
// as expected.
func TestParseMetaInfoCaveat(t *testing.T) {
	testCases := []struct {
		name   string
		input  string
		err    error
		result *InterceptMetaInfo
	}{{
		name:  "empty string",
		input: "",
		err:   ErrNoMetaInfoCaveat,
	}, {
		name:  "prefix only",
		input: "lnd-custom lit-mac-fw meta:",
		err:   ErrNoMetaInfoCaveat,
	}, {
		name:  "invalid JSON",
		input: "lnd-custom lit-mac-fw meta:bar",
		err: fmt.Errorf("error unmarshaling JSON: invalid character " +
			"'b' looking for beginning of value"),
	}, {
		name:   "empty JSON",
		input:  "lnd-custom lit-mac-fw meta:{}",
		result: &InterceptMetaInfo{},
	}}

	for _, tc := range testCases {
		tc := tc

		t.Run(tc.name, func(tt *testing.T) {
			i, err := ParseMetaInfoCaveat(tc.input)

			if tc.err != nil {
				require.Error(tt, err)
				require.Equal(tt, tc.err, err)

				return
			}

			require.NoError(tt, err)
			require.Equal(tt, tc.result, i)
		})
	}
}

// TestInterceptRule makes sure that a rules list struct can be formatted as a
// caveat and then parsed again successfully.
func TestInterceptRule(t *testing.T) {
	rules := &InterceptRules{
		FeatureRules: map[string]map[string]string{
			"AutoFees": {
				"first-hop-ignore-list": "03abcd...,02badb01...",
				"max-hops":              "4",
			},
			"Rebalance": {
				"off-chain-fees-sats":             "10",
				"re-balance-min-interval-seconds": "3600",
			},
		},
		SessionRules: map[string]string{
			"rate-limit": "1/10",
		},
	}

	caveat, err := RulesToCaveat(rules)
	require.NoError(t, err)

	require.Equal(t, testRulesCaveat, caveat)

	parsedRules, err := ParseRuleCaveat(caveat)
	require.NoError(t, err)

	require.Equal(t, rules, parsedRules)
}

// TestParseRulesCaveat makes sure the rule list caveat parsing works as
// expected.
func TestParseRulesCaveat(t *testing.T) {
	testCases := []struct {
		name   string
		input  string
		err    error
		result *InterceptRules
	}{{
		name:  "empty string",
		input: "",
		err:   ErrNoRulesCaveat,
	}, {
		name:  "prefix only",
		input: "lnd-custom lit-mac-fw rules:",
		err:   ErrNoRulesCaveat,
	}, {
		name:  "invalid JSON",
		input: "lnd-custom lit-mac-fw rules:bar",
		err: fmt.Errorf("error unmarshaling JSON: invalid character " +
			"'b' looking for beginning of value"),
	}, {
		name:   "empty JSON",
		input:  "lnd-custom lit-mac-fw rules:{}",
		result: &InterceptRules{},
	}, {
		name: "valid rules",
		input: "lnd-custom lit-mac-fw rules:{\"session_rules\":" +
			"{\"rate-limit\":\"2000\"}, \"feature_rules\":" +
			"{\"Autofees\":{\"foo\":\"bar\", \"rate-limit\":" +
			"\"1000\"}}}",
		result: &InterceptRules{
			FeatureRules: map[string]map[string]string{
				"Autofees": {
					"foo":        "bar",
					"rate-limit": "1000",
				},
			},
			SessionRules: map[string]string{
				"rate-limit": "2000",
			},
		},
	}}

	for _, tc := range testCases {
		tc := tc

		t.Run(tc.name, func(tt *testing.T) {
			i, err := ParseRuleCaveat(tc.input)

			if tc.err != nil {
				require.Error(tt, err)
				require.Equal(tt, tc.err, err)

				return
			}

			require.NoError(tt, err)
			require.Equal(tt, tc.result, i)
		})
	}
}
