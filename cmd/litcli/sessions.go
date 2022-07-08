package main

import (
	"context"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/lightningnetwork/lnd/macaroons"
	"github.com/urfave/cli"
)

var (
	// defaultSessionExpiry is the default time a session can be used for.
	// The current value evaluates to 90 days.
	defaultSessionExpiry = time.Hour * 24 * 90

	labelFlag = cli.StringFlag{
		Name:     "label",
		Usage:    "session label",
		Required: true,
	}
	expiryFlag = cli.Uint64Flag{
		Name: "expiry",
		Usage: "number of seconds that the session should " +
			"remain active",
		Value: uint64(defaultSessionExpiry.Seconds()),
	}
	mailboxServerAddrFlag = cli.StringFlag{
		Name:  "mailboxserveraddr",
		Usage: "the host:port of the mailbox server to be used",
		Value: "mailbox.terminal.lightning.today:443",
	}
	devserver = cli.BoolFlag{
		Name: "devserver",
		Usage: "set to true to skip verification of the " +
			"server's tls cert.",
	}
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
		labelFlag,
		expiryFlag,
		mailboxServerAddrFlag,
		devserver,
		cli.StringFlag{
			Name: "type",
			Usage: "session type to be created which will " +
				"determine the permissions a user has when " +
				"connecting with the session. Options " +
				"include readonly|admin|custom",
			Value: "readonly",
		},
		cli.StringSliceFlag{
			Name: "uri",
			Usage: "A URI that should be included in the " +
				"macaroon of a custom session. Note that " +
				"this flag will only be used if the 'type' " +
				"flag is set to 'custom'. This flag can be " +
				"specified multiple times if multiple URIs " +
				"should be included. Note that a regex can " +
				"also be specified which will then result in " +
				"all URIs matching the regex to be included. " +
				"For example, '/lnrpc\\..*' will result in " +
				"all `lnrpc` permissions being included.",
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

	sessTypeStr := ctx.String("type")
	sessType, err := parseSessionType(sessTypeStr)
	if err != nil {
		return err
	}

	var macPerms []*litrpc.MacaroonPermission
	for _, uri := range ctx.StringSlice("uri") {
		macPerms = append(macPerms, &litrpc.MacaroonPermission{
			Entity: macaroons.PermissionEntityCustomURI,
			Action: uri,
		})
	}

	sessionLength := time.Second * time.Duration(ctx.Uint64("expiry"))
	sessionExpiry := time.Now().Add(sessionLength).Unix()

	ctxb := context.Background()
	resp, err := client.AddSession(
		ctxb, &litrpc.AddSessionRequest{
			Label:                     ctx.String("label"),
			SessionType:               sessType,
			ExpiryTimestampSeconds:    uint64(sessionExpiry),
			MailboxServerAddr:         ctx.String("mailboxserveraddr"),
			DevServer:                 ctx.Bool("devserver"),
			MacaroonCustomPermissions: macPerms,
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
	case "custom":
		return litrpc.SessionType_TYPE_MACAROON_CUSTOM, nil
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
			Name:     "localpubkey",
			Usage:    "local pubkey of the session to revoke",
			Required: true,
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
