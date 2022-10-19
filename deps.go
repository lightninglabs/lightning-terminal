//go:build deps
// +build deps

package terminal

// This is a workaround to make sure go mod keeps around the dependencies in the
// go.sum file that we only use during compilation of the CLI binaries that are
// delivered together with LiT.
import (
	_ "github.com/lightninglabs/faraday/cmd/frcli"
	_ "github.com/lightninglabs/loop/cmd/loop"
	_ "github.com/lightninglabs/pool/cmd/pool"
	_ "github.com/lightningnetwork/lnd/cmd/lncli"
)
