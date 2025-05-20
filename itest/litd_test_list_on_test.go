//go:build itest
// +build itest

package itest

var allTestCases = []*testCase{
	{
		name: "terminal integrated mode",
		test: testModeIntegrated,
	},
	{
		name: "terminal remote mode",
		test: testModeRemote,
	},
	{
		name: "terminal stateless init mode",
		test: testStatelessInitMode,
	},
	{
		name: "terminal firewall rules",
		test: testFirewallRules,
	},
	{
		name: "terminal large http header",
		test: testLargeHttpHeader,
	},
	{
		name:       "custom channels",
		test:       testCustomChannels,
		noAliceBob: true,
	},
	{
		name:       "custom channels backward compatibility",
		test:       testCustomChannels,
		noAliceBob: true,
		backwardCompat: map[string]string{
			"Dave":  "v0.14.1-alpha",
			"Fabia": "v0.14.1-alpha",
		},
	},
	{
		name:       "custom channels large",
		test:       testCustomChannelsLarge,
		noAliceBob: true,
	},
	{
		name:       "custom channels grouped asset",
		test:       testCustomChannelsGroupedAsset,
		noAliceBob: true,
	},
	{
		name:       "custom channels group tranches force close",
		test:       testCustomChannelsGroupTranchesForceClose,
		noAliceBob: true,
	},
	{
		name:       "custom channels group tranches htlc force close",
		test:       testCustomChannelsGroupTranchesHtlcForceClose,
		noAliceBob: true,
	},
	{
		name:       "custom channels force close",
		test:       testCustomChannelsForceClose,
		noAliceBob: true,
	},
	{
		name:       "custom channels breach",
		test:       testCustomChannelsBreach,
		noAliceBob: true,
	},
	{
		name:       "custom channels liquidity",
		test:       testCustomChannelsLiquidityEdgeCases,
		noAliceBob: true,
	},
	{
		name:       "custom channels liquidity group",
		test:       testCustomChannelsLiquidityEdgeCasesGroup,
		noAliceBob: true,
	},
	{
		name:       "custom channels htlc force close",
		test:       testCustomChannelsHtlcForceClose,
		noAliceBob: true,
	},
	{
		name:       "custom channels htlc force close MPP",
		test:       testCustomChannelsHtlcForceCloseMpp,
		noAliceBob: true,
	},
	{
		name:       "custom channels balance consistency",
		test:       testCustomChannelsBalanceConsistency,
		noAliceBob: true,
	},
	{
		name:       "custom channels single asset multi input",
		test:       testCustomChannelsSingleAssetMultiInput,
		noAliceBob: true,
	},
	{
		name:       "custom channels oracle pricing",
		test:       testCustomChannelsOraclePricing,
		noAliceBob: true,
	},
	{
		name:       "custom channels fee",
		test:       testCustomChannelsFee,
		noAliceBob: true,
	},
	{
		name:       "custom channels forward bandwidth",
		test:       testCustomChannelsForwardBandwidth,
		noAliceBob: true,
	},
	{
		name:       "custom channels strict forwarding",
		test:       testCustomChannelsStrictForwarding,
		noAliceBob: true,
	},
	{
		name:       "custom channels decode payreq",
		test:       testCustomChannelsDecodeAssetInvoice,
		noAliceBob: true,
	},
	{
		name:       "custom channels self-payment",
		test:       testCustomChannelsSelfPayment,
		noAliceBob: true,
	},
	{
		name:       "custom channels multi rfq",
		test:       testCustomChannelsMultiRFQReceive,
		noAliceBob: true,
	},
}
