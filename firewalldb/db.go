package firewalldb

import (
	"fmt"
)

var (
	// ErrNoSuchKeyFound is returned when there is no key-value pair found
	// for the given key.
	ErrNoSuchKeyFound = fmt.Errorf("no such key found")
)
