package main

import (
	"context"
	"encoding/hex"
	"fmt"

	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/urfave/cli"
)

var listActionsCommand = cli.Command{
	Name:   "actions",
	Usage:  "List actions performed on the Litd server",
	Category: "Firewall",
	Action: listActions,
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

func listActions(ctx *cli.Context) error {
	ctxb := context.Background()
	clientConn, cleanup, err := connectClient(ctx, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewFirewallClient(clientConn)

	state, err := parseActionState(ctx.String("state"))
	if err != nil {
		return err
	}

	var sessionID []byte
	if ctx.String("session_id") != "" {
		sessionID, err = hex.DecodeString(ctx.String("session_id"))
		if err != nil {
			return err
		}
	}

	var groupID []byte
	if ctx.String("group_id") != "" {
		groupID, err = hex.DecodeString(ctx.String("group_id"))
		if err != nil {
			return err
		}
	}

	resp, err := client.ListActions(
		ctxb, &litrpc.ListActionsRequest{
			SessionId:      sessionID,
			FeatureName:    ctx.String("feature"),
			ActorName:      ctx.String("actor"),
			MethodName:     ctx.String("method"),
			State:          state,
			IndexOffset:    ctx.Uint64("index_offset"),
			MaxNumActions:  ctx.Uint64("max_num_actions"),
			Reversed:       !ctx.Bool("oldest_first"),
			CountTotal:     ctx.Bool("count_total"),
			StartTimestamp: ctx.Uint64("start_timestamp"),
			EndTimestamp:   ctx.Uint64("end_timestamp"),
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
