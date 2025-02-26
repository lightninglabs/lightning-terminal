//go:build itest
// +build itest

package itest

var allTestCases = []*testCase{
	{
		name: "integrated mode",
		test: testModeIntegrated,
	},
	{
		name: "remote mode",
		test: testModeRemote,
	},
	{
		name: "stateless init mode",
		test: testStatelessInitMode,
	},
	{
		name: "firewall rules",
		test: testFirewallRules,
	},
	{
		name: "large http header",
		test: testLargeHttpHeader,
	},
	{
		name:       "custom channels",
		test:       testCustomChannels,
		noAliceBob: true,
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
}
