package accounts

import (
	"context"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/btcsuite/btcd/btcutil"
	"github.com/lightninglabs/lightning-terminal/litrpc"
	litmac "github.com/lightninglabs/lightning-terminal/macaroons"
	"github.com/lightningnetwork/lnd/lntypes"
	"github.com/lightningnetwork/lnd/lnwire"
	"github.com/lightningnetwork/lnd/macaroons"
	"gopkg.in/macaroon-bakery.v2/bakery/checkers"
	"gopkg.in/macaroon.v2"
)

// RPCServer is the main server that implements the Accounts gRPC service.
type RPCServer struct {
	litrpc.UnimplementedAccountsServer

	service *InterceptorService

	superMacBaker litmac.Baker
}

// NewRPCServer returns a new RPC server for the given service.
func NewRPCServer(service *InterceptorService,
	superMacBaker litmac.Baker) *RPCServer {

	return &RPCServer{
		service:       service,
		superMacBaker: superMacBaker,
	}
}

// CreateAccount adds an entry to the account database. This entry represents
// an amount of satoshis (account balance) that can be spent using off-chain
// transactions (e.g. paying invoices).
//
// Macaroons can be created to be locked to an account. This makes sure that
// the bearer of the macaroon can only spend at most that amount of satoshis
// through the daemon that has issued the macaroon.
//
// Accounts only assert a maximum amount spendable. Having a certain account
// balance does not guarantee that the node has the channel liquidity to
// actually spend that amount.
func (s *RPCServer) CreateAccount(ctx context.Context,
	req *litrpc.CreateAccountRequest) (*litrpc.CreateAccountResponse,
	error) {

	log.Infof("[createaccount] label=%v, balance=%d, expiration=%d",
		req.Label, req.AccountBalance, req.ExpirationDate)

	var (
		balanceMsat    lnwire.MilliSatoshi
		expirationDate time.Time
	)

	// If the expiration date was set, parse it as a unix time stamp.
	// Otherwise, we leave it nil to indicate the account has no expiration
	// date.
	if req.ExpirationDate > 0 {
		expirationDate = time.Unix(req.ExpirationDate, 0)
	}

	// Convert from satoshis to millisatoshis for storage.
	balance := btcutil.Amount(req.AccountBalance)
	balanceMsat = lnwire.NewMSatFromSatoshis(balance)

	// Create the actual account in the macaroon account store.
	account, err := s.service.NewAccount(
		ctx, balanceMsat, expirationDate, req.Label,
	)
	if err != nil {
		return nil, fmt.Errorf("unable to create account: %w", err)
	}

	var rootKeyIdSuffix [4]byte
	copy(rootKeyIdSuffix[:], account.ID[0:4])
	macRootKey := litmac.NewSuperMacaroonRootKeyID(rootKeyIdSuffix)

	accountCaveat := checkers.Condition(
		macaroons.CondLndCustom,
		fmt.Sprintf("%s %x", CondAccount, account.ID[:]),
	)

	macHex, err := s.superMacBaker(
		ctx, macRootKey, MacaroonPermissions,
		[]macaroon.Caveat{{Id: []byte(accountCaveat)}},
	)
	if err != nil {
		return nil, fmt.Errorf("error baking account macaroon: %w", err)
	}

	macBytes, err := hex.DecodeString(macHex)
	if err != nil {
		return nil, fmt.Errorf("error decoding account macaroon: %w",
			err)
	}

	return &litrpc.CreateAccountResponse{
		Account:  marshalAccount(account),
		Macaroon: macBytes,
	}, nil
}

// UpdateAccount updates an existing account in the account database.
func (s *RPCServer) UpdateAccount(ctx context.Context,
	req *litrpc.UpdateAccountRequest) (*litrpc.Account, error) {

	log.Infof("[updateaccount] id=%s, label=%v, balance=%d, expiration=%d",
		req.Id, req.Label, req.AccountBalance, req.ExpirationDate)

	accountID, err := s.findAccount(ctx, req.Id, req.Label)
	if err != nil {
		return nil, err
	}

	// Ask the service to update the account.
	account, err := s.service.UpdateAccount(
		ctx, accountID, btcutil.Amount(req.AccountBalance),
		req.ExpirationDate,
	)
	if err != nil {
		return nil, err
	}

	return marshalAccount(account), nil
}

// CreditAccount increases the balance of an existing account in the account
// database, by the given amount.
func (s *RPCServer) CreditAccount(ctx context.Context,
	req *litrpc.CreditAccountRequest) (*litrpc.CreditAccountResponse,
	error) {

	if req.GetAccount() == nil {
		return nil, fmt.Errorf("account param must be specified")
	}

	var id, label string

	switch idType := req.Account.Identifier.(type) {
	case *litrpc.AccountIdentifier_Id:
		id = idType.Id
	case *litrpc.AccountIdentifier_Label:
		label = idType.Label
	}

	log.Infof("[creditaccount] id=%s, label=%v, amount=%d", id, label,
		req.Amount)

	amount := lnwire.MilliSatoshi(req.Amount * 1000)

	accountID, err := s.findAccount(ctx, id, label)
	if err != nil {
		return nil, err
	}

	account, err := s.service.CreditAccount(ctx, accountID, amount)
	if err != nil {
		return nil, err
	}

	return &litrpc.CreditAccountResponse{
		Account: marshalAccount(account),
	}, nil
}

// DebitAccount decreases the balance of an existing account in the account
// database, by the given amount.
func (s *RPCServer) DebitAccount(ctx context.Context,
	req *litrpc.DebitAccountRequest) (*litrpc.DebitAccountResponse, error) {

	if req.GetAccount() == nil {
		return nil, fmt.Errorf("account param must be specified")
	}

	var id, label string

	switch idType := req.Account.Identifier.(type) {
	case *litrpc.AccountIdentifier_Id:
		id = idType.Id
	case *litrpc.AccountIdentifier_Label:
		label = idType.Label
	}

	log.Infof("[debitaccount] id=%s, label=%v, amount=%d", id, label,
		req.Amount)

	amount := lnwire.MilliSatoshi(req.Amount * 1000)

	accountID, err := s.findAccount(ctx, id, label)
	if err != nil {
		return nil, err
	}

	account, err := s.service.DebitAccount(ctx, accountID, amount)
	if err != nil {
		return nil, err
	}

	return &litrpc.DebitAccountResponse{
		Account: marshalAccount(account),
	}, nil
}

// ListAccounts returns all accounts that are currently stored in the account
// database.
func (s *RPCServer) ListAccounts(ctx context.Context,
	_ *litrpc.ListAccountsRequest) (*litrpc.ListAccountsResponse, error) {

	log.Info("[listaccounts]")

	// Retrieve all accounts from the macaroon account store.
	accts, err := s.service.Accounts(ctx)
	if err != nil {
		return nil, fmt.Errorf("unable to list accounts: %w", err)
	}

	// Map the response into the proper response type and return it.
	rpcAccounts := make([]*litrpc.Account, len(accts))
	for i, acct := range accts {

		rpcAccounts[i] = marshalAccount(acct)
	}

	return &litrpc.ListAccountsResponse{
		Accounts: rpcAccounts,
	}, nil
}

// AccountInfo returns the account with the given ID or label.
func (s *RPCServer) AccountInfo(ctx context.Context,
	req *litrpc.AccountInfoRequest) (*litrpc.Account, error) {

	log.Infof("[accountinfo] id=%v, label=%v", req.Id, req.Label)

	accountID, err := s.findAccount(ctx, req.Id, req.Label)
	if err != nil {
		return nil, err
	}

	dbAccount, err := s.service.Account(ctx, accountID)
	if err != nil {
		return nil, fmt.Errorf("error retrieving account: %w", err)
	}

	return marshalAccount(dbAccount), nil
}

// RemoveAccount removes the given account from the account database.
func (s *RPCServer) RemoveAccount(ctx context.Context,
	req *litrpc.RemoveAccountRequest) (*litrpc.RemoveAccountResponse,
	error) {

	log.Infof("[removeaccount] id=%v, label=%v", req.Id, req.Label)

	accountID, err := s.findAccount(ctx, req.Id, req.Label)
	if err != nil {
		return nil, err
	}

	// Now remove the account.
	err = s.service.RemoveAccount(ctx, accountID)
	if err != nil {
		return nil, fmt.Errorf("error removing account: %w", err)
	}

	return &litrpc.RemoveAccountResponse{}, nil
}

// findAccount finds an account by its ID or label.
func (s *RPCServer) findAccount(ctx context.Context, id string, label string) (
	AccountID, error) {

	switch {
	case id != "" && label != "":
		return AccountID{}, fmt.Errorf("either account ID or label " +
			"must be specified, not both")

	case id != "":
		// Account ID is always a hex string, convert it to our account
		// ID type.
		var accountID AccountID
		decoded, err := hex.DecodeString(id)
		if err != nil {
			return AccountID{}, fmt.Errorf("error decoding "+
				"account ID: %w", err)
		}
		copy(accountID[:], decoded)

		return accountID, nil

	case label != "":
		// We need to find the account by its label.
		accounts, err := s.service.Accounts(ctx)
		if err != nil {
			return AccountID{}, fmt.Errorf("unable to list "+
				"accounts: %w", err)
		}

		for _, acct := range accounts {
			if acct.Label == label {
				return acct.ID, nil
			}
		}

		return AccountID{}, fmt.Errorf("unable to find account "+
			"with label '%s'", label)

	default:
		return AccountID{}, fmt.Errorf("either account ID or label " +
			"must be specified")
	}
}

// marshalAccount converts an account into its RPC counterpart.
func marshalAccount(acct *OffChainBalanceAccount) *litrpc.Account {
	rpcAccount := &litrpc.Account{
		Id:             hex.EncodeToString(acct.ID[:]),
		InitialBalance: uint64(acct.InitialBalance.ToSatoshis()),
		CurrentBalance: acct.CurrentBalanceSats(),
		LastUpdate:     acct.LastUpdate.Unix(),
		ExpirationDate: int64(0),
		Invoices: make(
			[]*litrpc.AccountInvoice, 0, len(acct.Invoices),
		),
		Payments: make(
			[]*litrpc.AccountPayment, 0, len(acct.Payments),
		),
		Label: acct.Label,
	}

	for hash := range acct.Invoices {
		i := &litrpc.AccountInvoice{
			Hash: make([]byte, lntypes.HashSize),
		}
		copy(i.Hash, hash[:])
		rpcAccount.Invoices = append(rpcAccount.Invoices, i)
	}
	for hash, paymentEntry := range acct.Payments {
		p := &litrpc.AccountPayment{
			Hash:       make([]byte, lntypes.HashSize),
			State:      paymentEntry.Status.String(),
			FullAmount: int64(paymentEntry.FullAmount.ToSatoshis()),
		}
		copy(p.Hash, hash[:])
		rpcAccount.Payments = append(rpcAccount.Payments, p)
	}

	if !acct.ExpirationDate.IsZero() {
		rpcAccount.ExpirationDate = acct.ExpirationDate.Unix()
	}

	return rpcAccount
}
