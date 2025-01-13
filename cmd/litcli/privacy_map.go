package main

import (
	"encoding/hex"
	"fmt"

	"github.com/lightninglabs/lightning-terminal/firewalldb"
	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/urfave/cli"
)

var privacyMapCommands = cli.Command{
	Name:      "privacy",
	ShortName: "p",
	Usage: "Access the real-pseudo string pairs of the " +
		"privacy mapper.",
	Category: "Firewall",
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:   "session_id",
			Usage:  "Deprecated, use group_id instead.",
			Hidden: true,
		},
		cli.BoolFlag{
			Name: "realtopseudo",
			Usage: "Set to true if the input should be " +
				"mapped to its pseudo counterpart. " +
				"Otherwise the input will be taken " +
				"as the pseudo value that should be " +
				"mapped to its real counterpart.",
		},
		cli.StringFlag{
			Name: "group_id",
			Usage: "The ID of the session group who's privacy " +
				"map DB should be queried.",
		},
	},
	Subcommands: []cli.Command{
		privacyMapConvertStrCommand,
		privacyMapConvertUint64Command,
	},
	Description: "Access the real-pseudo string pairs of the " +
		"privacy mapper. To improve privacy around data " +
		"sharing, channel ids, channel points and node " +
		"pubkeys are obfuscated by litd through a system " +
		"called the Privacy Mapper. The Privacy Mapper can " +
		"convert both strings and uint64 to the pseudo " +
		"counter part and back.",
}

var privacyMapConvertStrCommand = cli.Command{
	Name:      "str",
	ShortName: "s",
	Usage:     "Convert a string to its real or pseudo counter part.",
	Action:    privacyMapConvertStr,
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:     "input",
			Usage:    "The string to convert.",
			Required: true,
		},
	},
}

func privacyMapConvertStr(cli *cli.Context) error {
	ctx := getContext()
	clientConn, cleanup, err := connectClient(cli, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewFirewallClient(clientConn)

	var groupID []byte
	if cli.GlobalIsSet("group_id") {
		groupID, err = hex.DecodeString(cli.GlobalString("group_id"))
		if err != nil {
			return err
		}
	} else if cli.GlobalIsSet("session_id") {
		groupID, err = hex.DecodeString(cli.GlobalString("session_id"))
		if err != nil {
			return err
		}
	} else {
		return fmt.Errorf("must set group_id")
	}

	resp, err := client.PrivacyMapConversion(
		ctx, &litrpc.PrivacyMapConversionRequest{
			RealToPseudo: cli.GlobalBool("realtopseudo"),
			Input:        cli.String("input"),
			GroupId:      groupID,
		},
	)
	if err != nil {
		return err
	}

	printRespJSON(resp)

	return nil
}

var privacyMapConvertUint64Command = cli.Command{
	Name:      "uint64",
	ShortName: "u",
	Usage:     "Convert a uint64 to its real or pseudo counter part.",
	Action:    privacyMapConvertUint64,
	Flags: []cli.Flag{
		cli.Uint64Flag{
			Name:     "input",
			Usage:    "The uint64 to convert.",
			Required: true,
		},
	},
}

func privacyMapConvertUint64(cli *cli.Context) error {
	ctx := getContext()
	clientConn, cleanup, err := connectClient(cli, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewFirewallClient(clientConn)

	var groupID []byte
	if cli.GlobalIsSet("group_id") {
		groupID, err = hex.DecodeString(cli.GlobalString("group_id"))
		if err != nil {
			return err
		}
	} else if cli.GlobalIsSet("session_id") {
		groupID, err = hex.DecodeString(cli.GlobalString("session_id"))
		if err != nil {
			return err
		}
	} else {
		return fmt.Errorf("must set group_id")
	}

	input := firewalldb.Uint64ToStr(cli.Uint64("input"))

	resp, err := client.PrivacyMapConversion(
		ctx, &litrpc.PrivacyMapConversionRequest{
			RealToPseudo: cli.GlobalBool("realtopseudo"),
			Input:        input,
			GroupId:      groupID,
		},
	)
	if err != nil {
		return err
	}

	output, err := firewalldb.StrToUint64(resp.Output)
	if err != nil {
		return err
	}

	printRespJSON(&litrpc.PrivacyMapConversionResponse{
		Output: fmt.Sprintf("%d", output),
	})
	return nil
}
