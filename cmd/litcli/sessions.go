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
		Name: "label",
		Usage: "The session label.",
		Required: true,
	}
	expiryFlag = cli.Uint64Flag{
		Name: "expiry",
		Usage: "The number of seconds that the session should " +
			"remain active.",
		Value: uint64(defaultSessionExpiry.Seconds()),
	}
	mailboxServerAddrFlag = cli.StringFlag{
		Name:  "mailboxserveraddr",
		Usage: "The host:port of the mailbox server to be used.",
		Value: "mailbox.terminal.lightning.today:443",
	}
	devserver = cli.BoolFlag{
		Name: "devserver",
		Usage: "Set to true to skip verification of the " +
			"server's tls cert.",
	}
)

var sessionCommands = []cli.Command{
	{
		Name:      "sessions",
		ShortName: "s",
		Usage:     "Manage Lightning Node Connect sessions",
		Category:  "LNC",
		Subcommands: []cli.Command{
			addSessionCommand,
			listSessionCommand,
			revokeSessionCommand,
		},
		Description: "Manage Lightning Node Connect sessions.",
	},
}

var addSessionCommand = cli.Command{
	Name:        "add",
	ShortName:   "a",
	Usage:       "Create a new Lightning Node Connect session.",
	Description: "Add a new active session.",
	Action:      addSession,
	Flags: []cli.Flag{
		labelFlag,
		expiryFlag,
		mailboxServerAddrFlag,
		devserver,
		cli.StringFlag{
			Name: "type",
			Usage: "The session type to be created which will " +
				"determine the permissions a user has when " +
				"connecting with the session; options " +
				"include readonly|admin|account|custom.",
			Value: "readonly",
		},
		cli.StringSliceFlag{
			Name: "uri",
			Usage: "The URI that should be included in the " +
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
		cli.StringFlag{
			Name: "account_id",
			Usage: "The account id that should be used for " +
				"the account session. Note that this flag " +
				"will only be used if the 'type' flag is " +
				"set to 'account'.",
		},
	},
}

func addSession(ctx *cli.Context) error {
	clientConn, cleanup, err := connectClient(ctx, false)
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
			AccountId:                 ctx.String("account_id"),
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
	case "account":
		return litrpc.SessionType_TYPE_MACAROON_ACCOUNT, nil
	case "custom":
		return litrpc.SessionType_TYPE_MACAROON_CUSTOM, nil
	default:
		return 0, fmt.Errorf("unsupported session type %s", sessionType)
	}
}

var listSessionCommand = cli.Command{
	Name:        "list",
	ShortName:   "l",
	Usage:       "List Lightning Node Connect sessions.",
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
	Usage:       "List all Lightning Node Connect sessions.",
	Description: "List all sessions.\n",
	Action:      listSessions(sessionFilterAll),
}

var listRevokedSessions = cli.Command{
	Name:        "revoked",
	ShortName:   "r",
	Usage:       "List revoked Lightning Node Connect sessions.",
	Description: "List revoked sessions.\n",
	Action:      listSessions(sessionFilterRevoked),
}

var listInUseSessions = cli.Command{
	Name:        "inuse",
	ShortName:   "u",
	Usage:       "List in-use Lightning Node Connect sessions.",
	Description: "List in-use sessions.\n",
	Action:      listSessions(sessionFilterInUse),
}

var listExpiredSessions = cli.Command{
	Name:        "expired",
	ShortName:   "e",
	Usage:       "List expired Lightning Node Connect sessions.",
	Description: "List expired sessions.\n",
	Action:      listSessions(sessionFilterExpired),
}

var listCreatedSessions = cli.Command{
	Name:        "created",
	ShortName:   "c",
	Usage:       "List created Lightning Node Connect sessions.",
	Description: "List created sessions.\n",
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
		clientConn, cleanup, err := connectClient(ctx, false)
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
	Usage:       "Revoke a Lightning Node Connect session.",
	Description: "Revoke an active session.",
	Action:      revokeSession,
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:     "localpubkey",
			Usage:    "The local pubkey of the session to revoke.",
			Required: true,
		},
	},
}

func revokeSession(ctx *cli.Context) error {
	clientConn, cleanup, err := connectClient(ctx, false)
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
