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
}
