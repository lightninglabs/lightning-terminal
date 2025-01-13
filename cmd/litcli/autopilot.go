package main

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/lightninglabs/lightning-terminal/rules"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightningnetwork/lnd/lnrpc"
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
	Name:        "features",
	ShortName:   "f",
	Usage:       "List available Autopilot features.",
	Description: "List available Autopilot features.",
	Action:      listFeatures,
}

var addAutopilotSessionCmd = cli.Command{
	Name:      "add",
	ShortName: "a",
	Usage:     "Initialize an Autopilot session.",
	Description: `
	Initialize an Autopilot session.

	If one of the 'feature-' flags is set for any 'feature', then that flag
	must be provided for each 'feature'.

	The rules and configuration options available for each feature can be
	seen in the 'autopilot features' output. For a rule, all fields must be
	set since the unset ones are interpreteded as zero values. Rule values
	must adhere to the limits found in 'autopilot features'. If a rule is
	not set, default values are used.
	
	An example call for AutoFees reads:
	
	#!/bin/bash
	./litcli autopilot add --label=customRules \
	--feature=AutoFees \
	--feature-rules='{
		"rules": {
			"channel-policy-bounds":  {
				"chan_policy_bounds":  {
					"min_base_msat":  "0",
					"max_base_msat":  "10000",
					"min_rate_ppm":   10,
					"max_rate_ppm":   5000,
					"min_cltv_delta": 60,
					"max_cltv_delta": 120,
					"min_htlc_msat":  "1",
					"max_htlc_msat":  "100000000000"
				}
			},
			"peer-restriction":  {
				"peer_restrict":  {
					"peer_ids":  [
						"abcabc", 
						"defdef"
					]
				}
			}
		}
	}' \
	--feature-config='{}'`,
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
		cli.StringSliceFlag{
			Name: "channel-restrict-list",
			Usage: "[deprecated] List of channel IDs that the " +
				"Autopilot server should not " +
				"perform actions on. In the " +
				"form of: chanID1,chanID2,...",
			Hidden: true,
		},
		cli.StringSliceFlag{
			Name: "peer-restrict-list",
			Usage: "[deprecated] List of peer IDs that the " +
				"Autopilot server should not " +
				"perform actions on. In the " +
				"form of: peerID1,peerID2,...",
			Hidden: true,
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
		cli.StringSliceFlag{
			Name: "feature-rules",
			Usage: `JSON-serialized rule map (see main ` +
				`description for a format example).` +
				`An empty rule map is allowed with {} to ` +
				`use the default rules.`,
		},
		cli.StringFlag{
			Name: "privacy-flags",
			Usage: "String representation of privacy flags to set " +
				"for the session. Each individual flag will " +
				"remove privacy from certain aspects of " +
				"messages transmitted to autopilot. " +
				"The strongest privacy is on by " +
				"default and an empty string means full " +
				"privacy. Some features may not be able to " +
				"run correctly with full privacy, see the " +
				"autopilot features call for a list of " +
				"default required privacy flags. Those " +
				"minimally required privacy flags are set " +
				"automatically if nothing is specified here. " +
				"Combining several features will " +
				"require the union of all individual " +
				"feature's privacy flags, which is why it is " +
				"recommended to register each feature " +
				"separately for best privacy. Linking to a " +
				"previous session must preserve privacy " +
				"flags of the previous session. Example: " +
				"\"ClearPubkeys|ClearAmounts\"",
		},
	},
}

var revokeAutopilotSessionCmd = cli.Command{
	Name:        "revoke",
	ShortName:   "r",
	Usage:       "Revoke an Autopilot session.",
	Description: "Revoke an active Autopilot session.",
	Action:      revokeAutopilotSession,
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
	Name:        "list",
	ShortName:   "l",
	Usage:       "List all Autopilot sessions.",
	Description: "List all Autopilot sessions.\n",
	Action:      listAutopilotSessions,
}

func revokeAutopilotSession(cli *cli.Context) error {
	ctx := getContext()
	clientConn, cleanup, err := connectClient(cli, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewAutopilotClient(clientConn)

	pubkey, err := hex.DecodeString(cli.String("localpubkey"))
	if err != nil {
		return err
	}

	resp, err := client.RevokeAutopilotSession(
		ctx, &litrpc.RevokeAutopilotSessionRequest{
			LocalPublicKey: pubkey,
		},
	)
	if err != nil {
		return err
	}

	printRespJSON(resp)

	return nil
}

func listAutopilotSessions(cli *cli.Context) error {
	ctx := getContext()
	clientConn, cleanup, err := connectClient(cli, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewAutopilotClient(clientConn)

	resp, err := client.ListAutopilotSessions(
		ctx, &litrpc.ListAutopilotSessionsRequest{},
	)
	if err != nil {
		return err
	}

	printRespJSON(resp)

	return nil
}

func listFeatures(cli *cli.Context) error {
	ctx := getContext()
	clientConn, cleanup, err := connectClient(cli, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewAutopilotClient(clientConn)

	resp, err := client.ListAutopilotFeatures(
		ctx, &litrpc.ListAutopilotFeaturesRequest{},
	)
	if err != nil {
		return err
	}

	printRespJSON(resp)

	return nil
}

func initAutopilotSession(cli *cli.Context) error {
	sessionLength := time.Second * time.Duration(cli.Uint64("expiry"))
	sessionExpiry := time.Now().Add(sessionLength).Unix()

	ctx := getContext()
	clientConn, cleanup, err := connectClient(cli, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewAutopilotClient(clientConn)

	features := cli.StringSlice("feature")

	// Check that the user only sets unique features.
	fs := make(map[string]struct{})
	for _, feature := range features {
		if _, ok := fs[feature]; ok {
			return fmt.Errorf("feature %v is set multiple times",
				feature)
		}
		fs[feature] = struct{}{}
	}

	// Check that the user did not set multiple restrict lists.
	var chanRestrictList, peerRestrictList string

	channelRestrictSlice := cli.StringSlice("channel-restrict-list")
	if len(channelRestrictSlice) > 1 {
		return fmt.Errorf("channel-restrict-list can only be used once")
	} else if len(channelRestrictSlice) == 1 {
		chanRestrictList = channelRestrictSlice[0]
	}

	peerRestrictSlice := cli.StringSlice("peer-restrict-list")
	if len(peerRestrictSlice) > 1 {
		return fmt.Errorf("peer-restrict-list can only be used once")
	} else if len(peerRestrictSlice) == 1 {
		peerRestrictList = peerRestrictSlice[0]
	}

	// rulesMap stores the rules per each feature.
	rulesMap := make(map[string]*litrpc.RulesMap)
	rulesFlags := cli.StringSlice("feature-rules")

	// For legacy flags, we allow setting the channel and peer restrict
	// lists when only a single feature is added.
	if chanRestrictList != "" || peerRestrictList != "" {
		// Check that the user did not set both the legacy flags and the
		// generic rules flags together.
		if len(rulesFlags) > 0 {
			return fmt.Errorf("either set channel-restrict-list/" +
				"peer-restrict-list or feature-rules, not both")
		}

		if len(features) > 1 {
			return fmt.Errorf("cannot set channel-restrict-list/" +
				"peer-restrict-list when multiple features " +
				"are set")
		}

		feature := features[0]

		// Init the rule map for this feature.
		ruleMap := make(map[string]*litrpc.RuleValue)

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

			channelRestrict := &litrpc.ChannelRestrict{
				ChannelIds: chanIDs,
			}

			ruleMap[rules.ChannelRestrictName] = &litrpc.RuleValue{
				Value: &litrpc.RuleValue_ChannelRestrict{
					ChannelRestrict: channelRestrict,
				},
			}
		}

		if peerRestrictList != "" {
			peerIDs := strings.Split(peerRestrictList, ",")

			ruleMap[rules.PeersRestrictName] = &litrpc.RuleValue{
				Value: &litrpc.RuleValue_PeerRestrict{
					PeerRestrict: &litrpc.PeerRestrict{
						PeerIds: peerIDs,
					},
				},
			}
		}

		rulesMap[feature] = &litrpc.RulesMap{Rules: ruleMap}
	} else {
		// We make sure that if the rules or configs flags are set, they
		// are set for all features, to avoid ambiguity.
		if len(rulesFlags) > 0 && len(features) != len(rulesFlags) {
			return fmt.Errorf("number of features (%v) and rules "+
				"(%v) must match", len(features),
				len(rulesFlags))
		}

		// Parse the rules and store them in the rulesMap.
		for i, rulesFlag := range rulesFlags {
			var ruleMap litrpc.RulesMap

			// We allow empty rules, to signal the usage of the
			// default rules when the session is registered.
			if rulesFlag != "{}" {
				err = lnrpc.ProtoJSONUnmarshalOpts.Unmarshal(
					[]byte(rulesFlag), &ruleMap,
				)
				if err != nil {
					return err
				}
			}

			rulesMap[features[i]] = &ruleMap
		}
	}

	configs := cli.StringSlice("feature-config")
	if len(configs) > 0 && len(features) != len(configs) {
		return fmt.Errorf("number of features (%v) and configurations "+
			"(%v) must match", len(features), len(configs))
	}

	// Parse the configs and store them in the configsMap.
	configsMap := make(map[string][]byte)
	for i, configFlag := range configs {
		var config []byte

		// We allow empty configs, to signal the usage of the default
		// configuration when the session is registered.
		if configFlag != "{}" {
			// We expect the config to be a JSON dictionary, so we
			// unmarshal it into a map to do a first validation.
			var configMap map[string]interface{}
			err := json.Unmarshal([]byte(configs[i]), &configMap)
			if err != nil {
				return fmt.Errorf("could not parse "+
					"configuration for feature %v: %v",
					features[i], err)
			}

			config = []byte(configs[i])
		}

		configsMap[features[i]] = config
	}

	featureMap := make(map[string]*litrpc.FeatureConfig)
	for _, feature := range features {
		// Map access for unknown features will return their zero value
		// if not set, which is what we want to signal default usage.
		featureMap[feature] = &litrpc.FeatureConfig{
			Rules:  rulesMap[feature],
			Config: configsMap[feature],
		}
	}

	var groupID []byte
	if cli.IsSet("group_id") {
		groupID, err = hex.DecodeString(cli.String("group_id"))
		if err != nil {
			return err
		}
	}

	var privacyFlags uint64
	var privacyFlagsSet bool
	if cli.IsSet("privacy-flags") {
		privacyFlagsSet = true

		flags, err := session.Parse(cli.String("privacy-flags"))
		if err != nil {
			return err
		}

		privacyFlags = flags.Serialize()
	}

	resp, err := client.AddAutopilotSession(
		ctx, &litrpc.AddAutopilotSessionRequest{
			Label:                  cli.String("label"),
			ExpiryTimestampSeconds: uint64(sessionExpiry),
			MailboxServerAddr:      cli.String("mailboxserveraddr"),
			DevServer:              cli.Bool("devserver"),
			Features:               featureMap,
			LinkedGroupId:          groupID,
			PrivacyFlags:           privacyFlags,
			PrivacyFlagsSet:        privacyFlagsSet,
		},
	)
	if err != nil {
		return err
	}

	printRespJSON(resp)

	return nil
}
