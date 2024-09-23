//go:build itest
// +build itest

package itest

var allTestCases = []*testCase{
	{
		name: "test mode integrated",
		test: testModeIntegrated,
	},
	{
		name: "test mode remote",
		test: testModeRemote,
	},
	{
		name: "test firewall rules",
		test: testFirewallRules,
	},
	{
		name: "test large http header",
		test: testLargeHttpHeader,
	},
	{
		name: "test custom channels",
		test: testCustomChannels,
	},
	{
		name: "test custom channels large",
		test: testCustomChannelsLarge,
	},
	{
		name: "test custom channels grouped asset",
		test: testCustomChannelsGroupedAsset,
	},
	{
		name: "test custom channels force close",
		test: testCustomChannelsForceClose,
	},
	{
		name: "test custom channels breach",
		test: testCustomChannelsBreach,
	},
	{
		name: "test custom channels liquidity",
		test: testCustomChannelsLiquidityEdgeCases,
	},
}
