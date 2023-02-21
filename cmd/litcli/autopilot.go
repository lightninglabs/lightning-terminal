package main

import (
	"context"
	"encoding/hex"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/lightninglabs/lightning-terminal/rules"
	"github.com/urfave/cli"
)

var autopilotCommands = cli.Command{
	Name:     "autopilot",
	Usage:    "manage autopilot sessions",
	Category: "Autopilot",
	Subcommands: []cli.Command{
		listAutopilotFeaturesCmd,
		addAutopilotSessionCmd,
		revokeAutopilotSessionCmd,
		listAutopilotSessionsCmd,
	},
}

var listAutopilotFeaturesCmd = cli.Command{
	Name:      "features",
	ShortName: "f",
	Usage:     "List available Autopilot features.",
	Description: `
	List available Autopilot features.	
	`,
	Action: listFeatures,
}

var addAutopilotSessionCmd = cli.Command{
	Name:      "add",
	ShortName: "a",
	Usage:     "Initialize an Autopilot session.",
	Description: `
	Initialize an Autopilot session.	
	`,
	Action: initAutopilotSession,
	Flags: []cli.Flag{
		labelFlag,
		expiryFlag,
		mailboxServerAddrFlag,
		devserver,
		cli.StringSliceFlag{
			Name:     "feature",
			Required: true,
		},
		cli.StringFlag{
			Name: "channel-restrict-list",
			Usage: "list of channel IDs that the " +
				"Autopilot server should not " +
				"perform actions on. In the " +
				"form of: chanID1,chanID2,...",
		},
		cli.StringFlag{
			Name: "peer-restrict-list",
			Usage: "list of peer IDs that the " +
				"Autopilot server should not " +
				"perform actions on. In the " +
				"form of: peerID1,peerID2,...",
		},
		cli.StringSliceFlag{
			Name: "configuration",
			Usage: `per feature JSON-serialized configuration, ` +
				`expected format: {"version":0,"option1":` +
				`"parameter1","option2":"parameter2",...}`,
		},
	},
}

var revokeAutopilotSessionCmd = cli.Command{
	Name:      "revoke",
	ShortName: "r",
	Usage:     "Revoke an Autopilot session.",
	Description: `
	Revoke an active Autopilot session.
	`,
	Action: revokeAutopilotSession,
	Flags: []cli.Flag{
		cli.StringFlag{
			Name: "localpubkey",
			Usage: "local pubkey of the " +
				"session to revoke",
			Required: true,
		},
	},
}

var listAutopilotSessionsCmd = cli.Command{
	Name:      "list",
	ShortName: "l",
	Usage:     "List all Autopilot sessions.",
	Description: `
	List all Autopilot sessions.
	`,
	Action: listAutopilotSessions,
}

func revokeAutopilotSession(ctx *cli.Context) error {
	ctxb := context.Background()
	clientConn, cleanup, err := connectClient(ctx)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewAutopilotClient(clientConn)

	pubkey, err := hex.DecodeString(ctx.String("localpubkey"))
	if err != nil {
		return err
	}

	resp, err := client.RevokeAutopilotSession(
		ctxb, &litrpc.RevokeAutopilotSessionRequest{
			LocalPublicKey: pubkey,
		},
	)
	if err != nil {
		return err
	}

	printRespJSON(resp)

	return nil
}

func listAutopilotSessions(ctx *cli.Context) error {
	ctxb := context.Background()
	clientConn, cleanup, err := connectClient(ctx)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewAutopilotClient(clientConn)

	resp, err := client.ListAutopilotSessions(
		ctxb, &litrpc.ListAutopilotSessionsRequest{},
	)
	if err != nil {
		return err
	}

	printRespJSON(resp)

	return nil
}

func listFeatures(ctx *cli.Context) error {
	ctxb := context.Background()
	clientConn, cleanup, err := connectClient(ctx)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewAutopilotClient(clientConn)

	resp, err := client.ListAutopilotFeatures(
		ctxb, &litrpc.ListAutopilotFeaturesRequest{},
	)
	if err != nil {
		return err
	}

	printRespJSON(resp)

	return nil
}

func initAutopilotSession(ctx *cli.Context) error {
	sessionLength := time.Second * time.Duration(ctx.Uint64("expiry"))
	sessionExpiry := time.Now().Add(sessionLength).Unix()

	ctxb := context.Background()
	clientConn, cleanup, err := connectClient(ctx)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewAutopilotClient(clientConn)

	ruleMap := &litrpc.RulesMap{
		Rules: make(map[string]*litrpc.RuleValue),
	}

	chanRestrictList := ctx.String("channel-restrict-list")
	if chanRestrictList != "" {
		var chanIDs []uint64
		chans := strings.Split(chanRestrictList, ",")
		for _, c := range chans {
			i, err := strconv.ParseUint(c, 10, 64)
			if err != nil {
				return err
			}
			chanIDs = append(chanIDs, i)
		}

		ruleMap.Rules[rules.ChannelRestrictName] = &litrpc.RuleValue{
			Value: &litrpc.RuleValue_ChannelRestrict{
				ChannelRestrict: &litrpc.ChannelRestrict{
					ChannelIds: chanIDs,
				},
			},
		}
	}

	peerRestrictList := ctx.String("peer-restrict-list")
	if peerRestrictList != "" {
		peerIDs := strings.Split(peerRestrictList, ",")

		ruleMap.Rules[rules.PeersRestrictName] = &litrpc.RuleValue{
			Value: &litrpc.RuleValue_PeerRestrict{
				PeerRestrict: &litrpc.PeerRestrict{
					PeerIds: peerIDs,
				},
			},
		}
	}

	configs := ctx.StringSlice("configuration")
	features := ctx.StringSlice("feature")

	if len(configs) > 0 && len(features) != len(configs) {
		return fmt.Errorf("number of features and configurations " +
			"must match")
	}

	featureMap := make(map[string]*litrpc.FeatureConfig)
	for i, feature := range ctx.StringSlice("feature") {
		var config []byte

		// We allow empty configs, to signal the usage of the default
		// configuration when the session is registered.
		if len(configs) > 0 && configs[i] != "{}" {
			config = []byte(configs[i])
		}

		featureMap[feature] = &litrpc.FeatureConfig{
			Rules:  ruleMap,
			Config: config,
		}
	}

	resp, err := client.AddAutopilotSession(
		ctxb, &litrpc.AddAutopilotSessionRequest{
			Label:                  ctx.String("label"),
			ExpiryTimestampSeconds: uint64(sessionExpiry),
			MailboxServerAddr:      ctx.String("mailboxserveraddr"),
			DevServer:              ctx.Bool("devserver"),
			Features:               featureMap,
		},
	)
	if err != nil {
		return err
	}

	printRespJSON(resp)

	return nil
}
