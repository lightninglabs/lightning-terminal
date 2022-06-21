package main

import (
	"context"
	"encoding/hex"
	"fmt"
	"strconv"

	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/urfave/cli"
)

var accountsCommands = []cli.Command{
	{
		Name:      "accounts",
		ShortName: "a",
		Usage:     "manage accounts",
		Category:  "Accounts",
		Subcommands: []cli.Command{
			createAccountCommand,
			listAccountsCommand,
			removeAccountCommand,
		},
	},
}

var createAccountCommand = cli.Command{
	Name:      "create",
	ShortName: "c",
	Usage:     "Create a new off-chain account with a balance.",
	ArgsUsage: "balance [expiration_date]",
	Description: `
	Adds an entry to the account database. This entry represents an amount
	of satoshis (account balance) that can be spent using off-chain
	transactions (e.g. paying invoices).

	Macaroons can be created to be locked to an account. This makes sure
	that the bearer of the macaroon can only spend at most that amount of
	satoshis through the daemon that has issued the macaroon.

	Accounts only assert a maximum amount spendable. Having a certain
	account balance does not guarantee that the node has the channel
	liquidity to actually spend that amount.
	`,
	Flags: []cli.Flag{
		cli.Uint64Flag{
			Name:  "balance",
			Usage: "the initial balance of the account",
		},
		cli.Int64Flag{
			Name: "expiration_date",
			Usage: "the expiration date of the account expressed " +
				"in seconds since the unix epoch. 0 means " +
				"it does not expire",
		},
	},
	Action: createAccount,
}

func createAccount(ctx *cli.Context) error {
	ctxb := context.Background()
	clientConn, cleanup, err := connectClient(ctx)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewAccountsClient(clientConn)

	var (
		initialBalance uint64
		expirationDate int64
	)
	args := ctx.Args()

	switch {
	case ctx.IsSet("balance"):
		initialBalance = ctx.Uint64("balance")
	case args.Present():
		initialBalance, err = strconv.ParseUint(args.First(), 10, 64)
		if err != nil {
			return fmt.Errorf("unable to decode balance %v", err)
		}
		args = args.Tail()
	}

	switch {
	case ctx.IsSet("expiration_date"):
		expirationDate = ctx.Int64("expiration_date")
	case args.Present():
		expirationDate, err = strconv.ParseInt(args.First(), 10, 64)
		if err != nil {
			return fmt.Errorf(
				"unable to decode expiration_date: %v", err,
			)
		}
		args = args.Tail()
	}

	if initialBalance <= 0 {
		return fmt.Errorf("initial balance cannot be smaller than 1")
	}

	req := &litrpc.CreateAccountRequest{
		AccountBalance: initialBalance,
		ExpirationDate: expirationDate,
	}
	resp, err := client.CreateAccount(ctxb, req)
	if err != nil {
		return err
	}

	printRespJSON(resp)
	return nil
}

var listAccountsCommand = cli.Command{
	Name:      "list",
	ShortName: "l",
	Usage:     "Lists all off-chain accounts.",
	Description: `
	Returns all accounts that are currently stored in the account
	database.
	`,
	Action: listAccounts,
}

func listAccounts(ctx *cli.Context) error {
	ctxb := context.Background()
	clientConn, cleanup, err := connectClient(ctx)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewAccountsClient(clientConn)

	req := &litrpc.ListAccountsRequest{}
	resp, err := client.ListAccounts(ctxb, req)
	if err != nil {
		return err
	}

	printRespJSON(resp)
	return nil
}

var removeAccountCommand = cli.Command{
	Name:      "remove",
	ShortName: "r",
	Usage:     "Removes an off-chain account from the database.",
	ArgsUsage: "id",
	Description: `
	Removes an account entry from the account database.
	`,
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:  "id",
			Usage: "the ID of the account",
		},
	},
	Action: removeAccount,
}

func removeAccount(ctx *cli.Context) error {
	ctxb := context.Background()
	clientConn, cleanup, err := connectClient(ctx)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewAccountsClient(clientConn)

	var accountID string
	args := ctx.Args()

	switch {
	case ctx.IsSet("id"):
		accountID = ctx.String("id")
	case args.Present():
		accountID = args.First()
		args = args.Tail()
	default:
		return fmt.Errorf("id argument missing")
	}

	if len(accountID) == 0 {
		return fmt.Errorf("id argument missing")
	}
	if _, err := hex.DecodeString(accountID); err != nil {
		return err
	}

	req := &litrpc.RemoveAccountRequest{
		Id: accountID,
	}
	_, err = client.RemoveAccount(ctxb, req)
	return err
}
