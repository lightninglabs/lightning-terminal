package main

import (
	"context"
	"encoding/hex"
	"fmt"
	"os"
	"strconv"

	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/lightningnetwork/lnd/lncfg"
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
			updateAccountCommand,
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
		cli.StringFlag{
			Name: "save_to",
			Usage: "store the account macaroon created for the " +
				"account to the given file",
		},
	},
	Action: createAccount,
}

func createAccount(ctx *cli.Context) error {
	ctxb := context.Background()
	clientConn, cleanup, err := connectClient(ctx, false)
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

	// User requested to store the newly baked account macaroon to a file
	// in addition to printing it to the console.
	if ctx.IsSet("save_to") {
		fileName := lncfg.CleanAndExpandPath(ctx.String("save_to"))
		err := os.WriteFile(fileName, resp.Macaroon, 0644)
		if err != nil {
			return fmt.Errorf("error writing account macaroon "+
				"to %s: %v", fileName, err)
		}

		fmt.Printf("Account macaroon saved to %s\n", fileName)
	}

	return nil
}

var updateAccountCommand = cli.Command{
	Name:      "update",
	ShortName: "u",
	Usage:     "Update an existing off-chain account.",
	ArgsUsage: "id new_balance [new_expiration_date] [--save_to=]",
	Description: `
	Updates an existing off-chain account and sets either a new balance or
	new expiration date or both.
	`,
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:  "id",
			Usage: "the ID of the account to update",
		},
		cli.Int64Flag{
			Name: "new_balance",
			Usage: "the new balance of the account; -1 means do " +
				"not update the balance",
			Value: -1,
		},
		cli.Int64Flag{
			Name: "new_expiration_date",
			Usage: "the new expiration date of the account " +
				"expressed in seconds since the unix epoch; " +
				"-1 means do not update the expiration date; " +
				"0 means it does not expire",
			Value: -1,
		},
	},
	Action: updateAccount,
}

func updateAccount(ctx *cli.Context) error {
	ctxb := context.Background()
	clientConn, cleanup, err := connectClient(ctx, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewAccountsClient(clientConn)

	var (
		id             []byte
		newBalance     int64
		expirationDate int64
	)
	args := ctx.Args()

	// We parse the ID as hex even though we're supposed to send it as a hex
	// encoded string over the RPC. But that way we can verify it's actually
	// the id.
	switch {
	case ctx.IsSet("id"):
		id, err = hex.DecodeString(ctx.String("id"))
	case args.Present():
		id, err = hex.DecodeString(args.First())
		args = args.Tail()
	default:
		return fmt.Errorf("id is missing")
	}
	if err != nil {
		return fmt.Errorf("error decoding id: %v", err)
	}

	switch {
	case ctx.IsSet("new_balance"):
		newBalance = ctx.Int64("new_balance")
	case args.Present():
		newBalance, err = strconv.ParseInt(args.First(), 10, 64)
		if err != nil {
			return fmt.Errorf("unable to decode balance %v", err)
		}
		args = args.Tail()
	}

	switch {
	case ctx.IsSet("new_expiration_date"):
		expirationDate = ctx.Int64("new_expiration_date")
	case args.Present():
		expirationDate, err = strconv.ParseInt(args.First(), 10, 64)
		if err != nil {
			return fmt.Errorf(
				"unable to decode expiration_date: %v", err,
			)
		}
		args = args.Tail()
	}

	req := &litrpc.UpdateAccountRequest{
		Id:             hex.EncodeToString(id),
		AccountBalance: newBalance,
		ExpirationDate: expirationDate,
	}
	resp, err := client.UpdateAccount(ctxb, req)
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
	clientConn, cleanup, err := connectClient(ctx, false)
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
	clientConn, cleanup, err := connectClient(ctx, false)
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
