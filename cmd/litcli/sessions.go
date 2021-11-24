package main

import (
	"encoding/hex"
	"fmt"
	"time"

	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/urfave/cli"
)

var sessionCommands = []cli.Command{
	{
		Name:      "sessions",
		ShortName: "s",
		Usage:     "manage Terminal Web sessions",
		Category:  "Sessions",
		Subcommands: []cli.Command{
			addSessionCommand,
			listSessionCommand,
			revokeSessionCommand,
		},
	},
}

var addSessionCommand = cli.Command{
	Name:        "add",
	ShortName:   "a",
	Usage:       "create a new Terminal Web session",
	Description: "Add a new active session.",
	Action:      addSession,
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:  "label",
			Usage: "session label",
		},
		cli.Uint64Flag{
			Name: "expiry",
			Usage: "number of seconds that the session should " +
				"remain active",
			Value: uint64(time.Hour.Seconds()),
		},
		cli.StringFlag{
			Name:  "mailboxserveraddr",
			Usage: "the host:port of the mailbox server to be used",
			Value: "mailbox.terminal.lightning.today:443",
		},
		cli.BoolFlag{
			Name: "devserver",
			Usage: "set to true to skip verification of the " +
				"server's tls cert.",
		},
	},
}

func addSession(ctx *cli.Context) error {
	client, cleanup, err := getClient(ctx)
	if err != nil {
		return err
	}
	defer cleanup()

	label := ctx.String("label")
	if label == "" {
		return fmt.Errorf("must set a label for the session")
	}

	sessionLength := time.Second * time.Duration(ctx.Uint64("expiry"))
	sessionExpiry := time.Now().Add(sessionLength).Unix()

	resp, err := client.AddSession(
		getAuthContext(ctx), &litrpc.AddSessionRequest{
			Label:                  label,
			SessionType:            litrpc.SessionType_TYPE_UI_PASSWORD,
			ExpiryTimestampSeconds: uint64(sessionExpiry),
			MailboxServerAddr:      ctx.String("mailboxserveraddr"),
			DevServer:              ctx.Bool("devserver"),
		},
	)
	if err != nil {
		return err
	}

	printRespJSON(resp)

	return nil
}

var listSessionCommand = cli.Command{
	Name:        "list",
	ShortName:   "l",
	Usage:       "list Terminal Web sessions",
	Description: "List sessions.",
	Subcommands: []cli.Command{
		listAllSessionsCommand,
		listRevokedSessions,
		listInUseSessions,
		listExpiredSessions,
		listCreatedSessions,
	},
}

var listAllSessionsCommand = cli.Command{
	Name:        "all",
	ShortName:   "a",
	Usage:       "list all Terminal Web sessions",
	Description: "List all sessions.",
	Action:      listSessions(sessionFilterAll),
}

var listRevokedSessions = cli.Command{
	Name:        "revoked",
	ShortName:   "r",
	Usage:       "list revoked Terminal Web sessions",
	Description: "List revoked sessions.",
	Action:      listSessions(sessionFilterRevoked),
}

var listInUseSessions = cli.Command{
	Name:        "inuse",
	ShortName:   "u",
	Usage:       "list in-use Terminal Web sessions",
	Description: "List in-use sessions.",
	Action:      listSessions(sessionFilterInUse),
}

var listExpiredSessions = cli.Command{
	Name:        "expired",
	ShortName:   "e",
	Usage:       "list expired Terminal Web sessions",
	Description: "List expired sessions.",
	Action:      listSessions(sessionFilterExpired),
}

var listCreatedSessions = cli.Command{
	Name:        "created",
	ShortName:   "c",
	Usage:       "list created Terminal Web sessions",
	Description: "List created sessions.",
	Action:      listSessions(sessionFilterCreated),
}

type sessionFilter uint32

const (
	sessionFilterAll sessionFilter = iota
	sessionFilterExpired
	sessionFilterInUse
	sessionFilterRevoked
	sessionFilterCreated
)

var sessionStateMap = map[litrpc.SessionState]sessionFilter{
	litrpc.SessionState_STATE_CREATED: sessionFilterCreated,
	litrpc.SessionState_STATE_EXPIRED: sessionFilterExpired,
	litrpc.SessionState_STATE_IN_USE:  sessionFilterInUse,
	litrpc.SessionState_STATE_REVOKED: sessionFilterRevoked,
}

func listSessions(filter sessionFilter) func(ctx *cli.Context) error {
	return func(ctx *cli.Context) error {
		client, cleanup, err := getClient(ctx)
		if err != nil {
			return err
		}
		defer cleanup()

		resp, err := client.ListSessions(
			getAuthContext(ctx), &litrpc.ListSessionsRequest{},
		)
		if err != nil {
			return err
		}

		if filter == sessionFilterAll {
			printRespJSON(resp)
			return nil
		}

		var sessions []*litrpc.Session
		for _, session := range resp.Sessions {
			if sessionStateMap[session.SessionState] != filter {
				continue
			}

			sessions = append(sessions, session)
		}

		printRespJSON(&litrpc.ListSessionsResponse{Sessions: sessions})
		return nil
	}
}

var revokeSessionCommand = cli.Command{
	Name:        "revoke",
	ShortName:   "r",
	Usage:       "revoke a Terminal Web session",
	Description: "Revoke an active session",
	Action:      revokeSession,
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:  "localpubkey",
			Usage: "local pubkey of the session to revoke",
		},
	},
}

func revokeSession(ctx *cli.Context) error {
	client, cleanup, err := getClient(ctx)
	if err != nil {
		return err
	}
	defer cleanup()

	pubkey, err := hex.DecodeString(ctx.String("localpubkey"))
	if err != nil {
		return err
	}

	resp, err := client.RevokeSession(
		getAuthContext(ctx), &litrpc.RevokeSessionRequest{
			LocalPublicKey: pubkey,
		},
	)
	if err != nil {
		return err
	}

	printRespJSON(resp)

	return nil
}
