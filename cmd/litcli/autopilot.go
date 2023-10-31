package main

import (
	"context"
	"encoding/hex"
	"encoding/json"
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
	Usage:    "Manage autopilot sessions",
	Category: "LNC",
	Subcommands: []cli.Command{
		listAutopilotFeaturesCmd,
		addAutopilotSessionCmd,
		revokeAutopilotSessionCmd,
		listAutopilotSessionsCmd,
	},
	Description: "Manage autopilot sessions.",
}

var listAutopilotFeaturesCmd = cli.Command{
	Name:      "features",
	ShortName: "f",
	Usage:     "List available Autopilot features.",
	Description: "List available Autopilot features.",
	Action: listFeatures,
}

var addAutopilotSessionCmd = cli.Command{
	Name:      "add",
	ShortName: "a",
	Usage:     "Initialize an Autopilot session.",
	Description: "Initialize an Autopilot session.\n\n" +
		"   If set for any feature, configuration flags need to be " +
		"repeated for each feature that is registered, corresponding " +
		"to the order of features.",
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
			Usage: "List of channel IDs that the " +
				"Autopilot server should not " +
				"perform actions on. In the " +
				"form of: chanID1,chanID2,...",
		},
		cli.StringFlag{
			Name: "peer-restrict-list",
			Usage: "List of peer IDs that the " +
				"Autopilot server should not " +
				"perform actions on. In the " +
				"form of: peerID1,peerID2,...",
		},
		cli.StringFlag{
			Name: "group_id",
			Usage: "The hex encoded group ID of the session " +
				"group to link this one to.",
		},
		cli.StringSliceFlag{
			Name: "feature-config",
			Usage: "JSON-serialized configuration with the " +
				"expected format: {\"version\":0," +
				"\"option1\":\"parameter1\"," +
				"\"option2\":\"parameter2\",...}. An empty " +
				"configuration is allowed with {} to use the " +
				"default configuration.",
		},
	},
}

var revokeAutopilotSessionCmd = cli.Command{
	Name:      "revoke",
	ShortName: "r",
	Usage:     "Revoke an Autopilot session.",
	Description: "Revoke an active Autopilot session.",
	Action: revokeAutopilotSession,
	Flags: []cli.Flag{
		cli.StringFlag{
			Name: "localpubkey",
			Usage: "Local pubkey of the " +
				"session to revoke.",
			Required: true,
		},
	},
}

var listAutopilotSessionsCmd = cli.Command{
	Name:      "list",
	ShortName: "l",
	Usage:     "List all Autopilot sessions.",
	Description: "List all Autopilot sessions.\n",
	Action: listAutopilotSessions,
}

func revokeAutopilotSession(ctx *cli.Context) error {
	ctxb := context.Background()
	clientConn, cleanup, err := connectClient(ctx, false)
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
	clientConn, cleanup, err := connectClient(ctx, false)
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
	clientConn, cleanup, err := connectClient(ctx, false)
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
	clientConn, cleanup, err := connectClient(ctx, false)
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

	features := ctx.StringSlice("feature")
	configs := ctx.StringSlice("feature-config")
	if len(configs) > 0 && len(features) != len(configs) {
		return fmt.Errorf("number of features (%v) and configurations "+
			"(%v) must match", len(features), len(configs))
	}

	featureMap := make(map[string]*litrpc.FeatureConfig)
	for i, feature := range ctx.StringSlice("feature") {
		var config []byte

		// We allow empty configs, to signal the usage of the default
		// configuration when the session is registered.
		if len(configs) > 0 && configs[i] != "{}" {
			// We expect the config to be a JSON dictionary, so we
			// unmarshal it into a map to do a first validation.
			var configMap map[string]interface{}
			err := json.Unmarshal([]byte(configs[i]), &configMap)
			if err != nil {
				return fmt.Errorf("could not parse "+
					"configuration for feature %v: %v",
					feature, err)
			}

			config = []byte(configs[i])
		}

		featureMap[feature] = &litrpc.FeatureConfig{
			Rules:  ruleMap,
			Config: config,
		}
	}

	var groupID []byte
	if ctx.IsSet("group_id") {
		groupID, err = hex.DecodeString(ctx.String("group_id"))
		if err != nil {
			return err
		}
	}

	resp, err := client.AddAutopilotSession(
		ctxb, &litrpc.AddAutopilotSessionRequest{
			Label:                  ctx.String("label"),
			ExpiryTimestampSeconds: uint64(sessionExpiry),
			MailboxServerAddr:      ctx.String("mailboxserveraddr"),
			DevServer:              ctx.Bool("devserver"),
			Features:               featureMap,
			LinkedGroupId:          groupID,
		},
	)
	if err != nil {
		return err
	}

	printRespJSON(resp)

	return nil
}
