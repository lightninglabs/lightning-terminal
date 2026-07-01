package main

import (
	"testing"

	"github.com/stretchr/testify/require"
)

// TestAddInvoiceCommandFlags ensures that the litcli addinvoice command keeps
// the flags its action actually reads (including the asset-specific ones it
// adds) while dropping the inherited lncli flags that don't apply to Taproot
// Asset invoices.
func TestAddInvoiceCommandFlags(t *testing.T) {
	t.Parallel()

	flagNames := make(map[string]struct{})
	for _, flag := range addInvoiceCommand.Flags {
		flagNames[flag.GetName()] = struct{}{}
	}

	// Flags that the addInvoice action reads must remain available.
	expected := []string{
		"memo", "preimage", "amt", "amt_msat", "description_hash",
		"fallback_addr", "expiry", "private", "amp",
		"asset_id", "group_key", "asset_amount", "rfq_peer_pubkey",
	}
	for _, name := range expected {
		_, ok := flagNames[name]
		require.Truef(t, ok, "expected flag %q to be present", name)
	}

	// Flags that don't apply to asset invoices must be removed.
	for name := range addInvoiceUnsupportedFlags {
		_, ok := flagNames[name]
		require.Falsef(t, ok, "expected flag %q to be removed", name)
	}
}
