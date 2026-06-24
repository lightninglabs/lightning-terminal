package main

import "fmt"

const maxPriceOracleMetadataBytes = 32768

// ValidatePriceOracleMetadata checks that metadata for AddInvoice stays within
// tapd's documented maximum size.
func ValidatePriceOracleMetadata(s string) error {
	if len(s) > maxPriceOracleMetadataBytes {
		return fmt.Errorf("price_oracle_metadata exceeds maximum length "+
			"of %d bytes (got %d)", maxPriceOracleMetadataBytes, len(s))
	}

	return nil
}
