//go:build itest

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
		name: "terminal request logger disable",
		test: testRequestLoggerDisable,
	},
	{
		name: "terminal large http header",
		test: testLargeHttpHeader,
	},
}
