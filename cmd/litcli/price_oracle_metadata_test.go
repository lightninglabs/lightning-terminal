package main

import (
	"strings"
	"testing"
)

func TestValidatePriceOracleMetadata(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		input   string
		wantErr bool
	}{
		{
			name:    "empty",
			input:   "",
			wantErr: false,
		},
		{
			name:    "at limit",
			input:   strings.Repeat("a", maxPriceOracleMetadataBytes),
			wantErr: false,
		},
		{
			name:    "over limit",
			input:   strings.Repeat("a", maxPriceOracleMetadataBytes+1),
			wantErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			err := ValidatePriceOracleMetadata(tc.input)
			if tc.wantErr && err == nil {
				t.Fatal("expected error")
			}
			if !tc.wantErr && err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
		})
	}
}
