package main

import (
	"encoding/hex"
	"fmt"

	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/urfave/cli"
)

var listActionsCommand = cli.Command{
	Name:     "actions",
	Usage:    "List actions performed on the Litd server",
	Category: "Firewall",
	Action:   listActions,
	Flags: []cli.Flag{
		cli.StringFlag{
			Name: "feature",
			Usage: "The name of the feature to " +
				"filter the actions by. If " +
				"left empty, then all " +
				"actions will be returned.",
		},
		cli.StringFlag{
			Name: "actor",
			Usage: "The actor name to filter the actions by. If " +
				"left empty, then all actions will be " +
				"returned.",
		},
		cli.StringFlag{
			Name: "method",
			Usage: "The method name to filter the actions by. If " +
				"left empty, then all actions will be " +
				"returned.",
		},
		cli.StringFlag{
			Name: "session_id",
			Usage: "The hex encoded session ID to filter the " +
				"actions by. If left empty, then all actions " +
				"will be returned.",
		},
		cli.Uint64Flag{
			Name: "start_timestamp",
			Usage: "Only actions executed after this unix " +
				"timestamp will be considered.",
		},
		cli.Uint64Flag{
			Name: "end_timestamp",
			Usage: "Only actions executed before this unix " +
				"timestamp will be considered.",
		},
		cli.StringFlag{
			Name: "state",
			Usage: "The action state to filter on. If not set, " +
				"then actions of any state will be returned. " +
				"Options include: 'pending', 'done' and 'error'.",
		},
		cli.Uint64Flag{
			Name: "index_offset",
			Usage: "The index of an action that will be used as " +
				"the start of a query to determine which " +
				"actions should be returned in the response.",
		},
		cli.Uint64Flag{
			Name:  "max_num_actions",
			Usage: "The max number of actions to return.",
		},
		cli.BoolFlag{
			Name: "oldest_first",
			Usage: "If set, actions succeeding the index_offset " +
				"will be returned.",
		},
		cli.BoolFlag{
			Name: "count_total",
			Usage: "Set to true if the total number of all " +
				"actions that match the given filters should " +
				"be counted and returned in the request. " +
				"Note that setting this will significantly " +
				"decrease the performance of the query if " +
				"there are many actions in the db. Also note " +
				"that if this option is set, the " +
				"index_offset is the index in this set of " +
				"actions where as if it is not set, then " +
				"index_offset is the index of the action in " +
				"the db regardless of filter.",
		},
		cli.StringFlag{
			Name: "group_id",
			Usage: "The hex encoded group ID to filter the " +
				"actions by. The group ID is the same for " +
				"all sessions that have been linked. If a " +
				"session has no linked sessions then the " +
				"group ID will be the same as the " +
				"session ID. This flag will be ignored if " +
				"the `session_id` flag is set.",
		},
	},
}

func listActions(cli *cli.Context) error {
	ctx := getContext()
	clientConn, cleanup, err := connectClient(cli, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewFirewallClient(clientConn)

	state, err := parseActionState(cli.String("state"))
	if err != nil {
		return err
	}

	var sessionID []byte
	if cli.String("session_id") != "" {
		sessionID, err = hex.DecodeString(cli.String("session_id"))
		if err != nil {
			return err
		}
	}

	var groupID []byte
	if cli.String("group_id") != "" {
		groupID, err = hex.DecodeString(cli.String("group_id"))
		if err != nil {
			return err
		}
	}

	resp, err := client.ListActions(
		ctx, &litrpc.ListActionsRequest{
			SessionId:      sessionID,
			FeatureName:    cli.String("feature"),
			ActorName:      cli.String("actor"),
			MethodName:     cli.String("method"),
			State:          state,
			IndexOffset:    cli.Uint64("index_offset"),
			MaxNumActions:  cli.Uint64("max_num_actions"),
			Reversed:       !cli.Bool("oldest_first"),
			CountTotal:     cli.Bool("count_total"),
			StartTimestamp: cli.Uint64("start_timestamp"),
			EndTimestamp:   cli.Uint64("end_timestamp"),
			GroupId:        groupID,
		},
	)
	if err != nil {
		return err
	}

	printRespJSON(resp)

	return nil
}

func parseActionState(actionStr string) (litrpc.ActionState, error) {
	switch actionStr {
	case "":
		return litrpc.ActionState_STATE_UNKNOWN, nil
	case "pending":
		return litrpc.ActionState_STATE_PENDING, nil
	case "done":
		return litrpc.ActionState_STATE_DONE, nil
	case "error":
		return litrpc.ActionState_STATE_ERROR, nil
	default:
		return 0, fmt.Errorf("unknown action state %s. Valid options "+
			"include 'pending', 'done' and 'error'", actionStr)
	}
}
