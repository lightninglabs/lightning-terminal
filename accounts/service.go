package accounts

import (
	"context"
	"encoding/hex"
	"fmt"
	"math"
	"os"
	"path"
	"strings"
	"sync"

	"github.com/lightninglabs/lndclient"
	"github.com/lightningnetwork/lnd/macaroons"
	"go.etcd.io/bbolt"
	"gopkg.in/macaroon-bakery.v2/bakery/checkers"
	"gopkg.in/macaroon.v2"
)

const (
	// DBFilename is the filename within the data directory which contains
	// the macaroon stores.
	DBFilename = "accounts.db"
)

// Service is an account storage and interceptor for accounting based macaroon
// balances and utility methods to manage accounts.
type Service struct {
	*Store

	lnd lndclient.LndServices

	contextCancel context.CancelFunc

	wg   sync.WaitGroup
	quit chan struct{}
}

// NewService returns a service backed by the macaroon Bolt DB stored in the
// passed-in directory.
func NewService(dir string) (*Service, error) {
	// Ensure that the path to the directory exists.
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		if err := os.MkdirAll(dir, 0700); err != nil {
			return nil, err
		}
	}

	// Open the database that we'll use to store the primary macaroon key,
	// and all generated macaroons+caveats.
	accountsDB, err := bbolt.Open(
		path.Join(dir, DBFilename), 0600, bbolt.DefaultOptions,
	)
	if err != nil {
		return nil, err
	}

	accountStore, err := NewStore(accountsDB)
	if err != nil {
		return nil, err
	}

	return &Service{
		Store: accountStore,
		quit:  make(chan struct{}),
	}, nil
}

// Name returns the name of the interceptor.
func (s *Service) Name() string {
	return accountMiddlewareName
}

// ReadOnly returns true if this interceptor should be registered in read-only
// mode. In read-only mode no custom caveat name can be specified.
func (s *Service) ReadOnly() bool {
	return false
}

// CustomCaveatName returns the name of the custom caveat that is expected to be
// handled by this interceptor. Cannot be specified in read-only mode.
func (s *Service) CustomCaveatName() string {
	return CondAccount
}

// Start starts the account service and its interceptor capability.
func (s *Service) Start(lndServices lndclient.LndServices) error {
	s.lnd = lndServices

	mainCtx, cancel := context.WithCancel(context.Background())
	s.contextCancel = cancel

	// Get a list of all existing invoices on startup and add them to our
	// cache. We need to keep track of all invoices, even quite old ones to
	// make sure tokens are valid. But to save space we only keep track of
	// an invoice's state.
	invoiceResp, err := s.lnd.Client.ListInvoices(
		mainCtx, lndclient.ListInvoicesRequest{
			MaxInvoices: math.MaxUint64,
		},
	)
	if err != nil {
		return err
	}

	// Advance our indices to the latest known one so we'll only receive
	// updates for new invoices and/or newly settled invoices.
	addIndex := uint64(0)
	settleIndex := uint64(0)
	for _, invoice := range invoiceResp.Invoices {
		if invoice.AddIndex > addIndex {
			addIndex = invoice.AddIndex
		}
		if invoice.SettleIndex > settleIndex {
			settleIndex = invoice.SettleIndex
		}
	}

	invoiceChan, invoiceErrChan, err := s.lnd.Client.SubscribeInvoices(
		mainCtx, lndclient.InvoiceSubscriptionRequest{
			AddIndex:    addIndex,
			SettleIndex: settleIndex,
		},
	)
	if err != nil {
		return fmt.Errorf("error subscribing invoices: %v", err)
	}

	s.wg.Add(1)
	go func() {
		defer s.wg.Done()

		for {
			select {
			case invoice := <-invoiceChan:
				if err := s.invoiceUpdate(invoice); err != nil {
					log.Errorf("Error processing invoice "+
						"update: %v", err)
				}

			case err := <-invoiceErrChan:
				log.Errorf("Error in invoice subscription: %v",
					err)
				return

			case <-mainCtx.Done():
				return

			case <-s.quit:
				return
			}
		}
	}()

	return nil
}

// Stop shuts down the account service.
func (s *Service) Stop() error {
	s.contextCancel()
	close(s.quit)

	s.wg.Wait()

	return s.Store.Close()
}

func customCaveatCondition(mac *macaroon.Macaroon, condition string) string {
	for _, caveat := range mac.Caveats() {
		caveatCond, arg, err := checkers.ParseCaveat(string(caveat.Id))
		if err != nil {
			// If we can't parse the caveat, it probably doesn't
			// concern us.
			continue
		}

		if caveatCond == macaroons.CondLndCustom {
			customCondition := strings.TrimSpace(arg)
			if customCondition == "" {
				return ""
			}

			parts := strings.Split(customCondition, " ")
			if len(parts) != 2 {
				continue
			}

			if parts[0] == condition {
				return parts[1]
			}
		}
	}

	return ""
}

func accountFromMacaroon(mac *macaroon.Macaroon) (*AccountID, error) {
	// Get the macaroon from the context and see if it is locked to an
	// account.
	macaroonAccount := customCaveatCondition(mac, CondAccount)
	if macaroonAccount == "" {
		// There is no condition that locks the macaroon to an account,
		// so there is nothing to check.
		return nil, nil
	}

	// The macaroon is indeed locked to an account. Fetch the account and
	// validate its balance.
	accountIDBytes, err := hex.DecodeString(macaroonAccount)
	if err != nil {
		return nil, err
	}

	var accountID AccountID
	copy(accountID[:], accountIDBytes)
	return &accountID, nil
}
