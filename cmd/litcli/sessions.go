package main

import (
	"context"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/urfave/cli"
)

var (
	// defaultSessionExpiry is the default time a session can be used for.
	// The current value evaluates to 90 days.
	defaultSessionExpiry = time.Hour * 24 * 90
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
			Value: uint64(defaultSessionExpiry.Seconds()),
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
		cli.StringFlag{
			Name: "type",
			Usage: "session type to be created which will " +
				"determine the permissions a user has when " +
				"connecting with the session. Options " +
				"include readonly|admin",
			Value: "readonly",
		},
	},
}

func addSession(ctx *cli.Context) error {
	clientConn, cleanup, err := connectClient(ctx)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewSessionsClient(clientConn)

	label := ctx.String("label")
	if label == "" {
		return fmt.Errorf("must set a label for the session")
	}

	sessTypeStr := ctx.String("type")
	sessType, err := parseSessionType(sessTypeStr)
	if err != nil {
		return err
	}

	sessionLength := time.Second * time.Duration(ctx.Uint64("expiry"))
	sessionExpiry := time.Now().Add(sessionLength).Unix()

	ctxb := context.Background()
	resp, err := client.AddSession(
		ctxb, &litrpc.AddSessionRequest{
			Label:                  label,
			SessionType:            sessType,
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

func parseSessionType(sessionType string) (litrpc.SessionType, error) {
	switch sessionType {
	case "admin":
		return litrpc.SessionType_TYPE_MACAROON_ADMIN, nil
	case "readonly":
		return litrpc.SessionType_TYPE_MACAROON_READONLY, nil
	default:
		return 0, fmt.Errorf("unsupported session type %s", sessionType)
	}
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
		clientConn, cleanup, err := connectClient(ctx)
		if err != nil {
			return err
		}
		defer cleanup()
		client := litrpc.NewSessionsClient(clientConn)

		ctxb := context.Background()
		resp, err := client.ListSessions(
			ctxb, &litrpc.ListSessionsRequest{},
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
	clientConn, cleanup, err := connectClient(ctx)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewSessionsClient(clientConn)

	pubkey, err := hex.DecodeString(ctx.String("localpubkey"))
	if err != nil {
		return err
	}

	ctxb := context.Background()
	resp, err := client.RevokeSession(
		ctxb, &litrpc.RevokeSessionRequest{
			LocalPublicKey: pubkey,
		},
	)
	if err != nil {
		return err
	}

	printRespJSON(resp)

	return nil
}
