package accounts

import (
	"testing"
)

// TestRoundTripCheckers makes sure all round trip checkers can be instantiated
// correctly without panicking.
func TestRoundTripCheckers(t *testing.T) {
	s := Service{}
	for checkerName := range s.generateCheckers(nil) {
		t.Logf("Checker registered: %v", checkerName)
	}
}
