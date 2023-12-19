package main

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"os"

	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/urfave/cli"
)

// helperCommands are commands that do not require a connection to LiTd to
// return a response.
var helperCommands = cli.Command{
	Name:        "helper",
	Usage:       "Helper commands",
	Description: "Helper commands.",
	Category:    "LiT",
	Subcommands: []cli.Command{
		generateSuperMacRootIDCmd,
		isSuperMacaroonCmd,
	},
}

// generateSuperMacRootIDCmd is a command that can be used to generate a root
// key ID for a super macaroon. A suffix may be specified.
var generateSuperMacRootIDCmd = cli.Command{
	Name: "supermacrootkey",
	Usage: "Generate a valid super macaroon root key ID from " +
		"scratch or from a given root key ID suffix.",
	Description: "This command can be used to generate a valid " +
		"super macaroon root key ID from scratch or from " +
		"a given root key ID suffix.",
	Action: superMacRootKey,
	Flags: []cli.Flag{
		cli.StringFlag{
			Name: "root_key_suffix",
			Usage: "A 4-byte suffix to use in the construction " +
				"of the root key ID. If not provided, then a " +
				"random one will be generated. This must be " +
				"specified as a hex string using a maximum " +
				"of 8 characters.",
		},
	},
}

// superMacRootKey generates a super macaroon root key ID.
func superMacRootKey(ctx *cli.Context) error {
	var suffix [4]byte

	if ctx.IsSet("root_key_suffix") {
		suffixBytes, err := hex.DecodeString(
			ctx.String("root_key_suffix"),
		)
		if err != nil {
			return err
		}

		copy(suffix[:], suffixBytes)
	} else {
		_, err := rand.Read(suffix[:])
		if err != nil {
			return err
		}
	}

	id := session.NewSuperMacaroonRootKeyID(suffix)

	printJSON(struct {
		RootKeyID uint64 `json:"root_key_id"`
	}{
		RootKeyID: id,
	})

	return nil
}

// isSuperMacaronoCmd is a command that a user can run in order to check if
// a macaroon is a super macaroon.
var isSuperMacaroonCmd = cli.Command{
	Name:  "issupermacaroon",
	Usage: "Prints 'true' if the given macaroon is a super macaroon.",
	Description: "This command can be used to verify if a macaroon is " +
		"considered a super macaroon.",
	Action: isSuperMacaroon,
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:     "mac",
			Usage:    "The hex-encoded macaroon.",
			Required: true,
		},
	},
}

// isSuperMacaroon checks if the users given macaroon is considered a super
// macaroon.
func isSuperMacaroon(ctx *cli.Context) error {
	isSuperMac := session.IsSuperMacaroon(ctx.String("mac"))

	printJSON(struct {
		IsSuperMacaroon bool `json:"is_super_macaroon"`
	}{
		IsSuperMacaroon: isSuperMac,
	})

	return nil
}

// printJSON marshals the given interface as a json byte slice, formats it to
// use easy to read indentation and writes it as a string to standard out.
func printJSON(resp interface{}) {
	b, err := json.Marshal(resp)
	if err != nil {
		fatal(err)
	}

	var out bytes.Buffer
	_ = json.Indent(&out, b, "", "\t")
	_, _ = out.WriteString("\n")
	_, _ = out.WriteTo(os.Stdout)
}
