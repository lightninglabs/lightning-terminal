package accounts

import (
	"bytes"
	"fmt"
	"io"
	"time"

	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/lntypes"
	"github.com/lightningnetwork/lnd/lnwire"
	"github.com/lightningnetwork/lnd/tlv"
)

const (
	typeID             tlv.Type = 1
	typeAccountType    tlv.Type = 2
	typeInitialBalance tlv.Type = 3
	typeCurrentBalance tlv.Type = 4
	typeLastUpdate     tlv.Type = 5
	typeExpirationDate tlv.Type = 6
	typeInvoices       tlv.Type = 7
	typePayments       tlv.Type = 8
	typeLabel          tlv.Type = 9
)

func serializeAccount(account *OffChainBalanceAccount) ([]byte, error) {
	if account == nil {
		return nil, fmt.Errorf("account cannot be nil")
	}
	var (
		buf            bytes.Buffer
		id             = account.ID[:]
		accountType    = uint8(account.Type)
		initialBalance = uint64(account.InitialBalance)
		currentBalance = uint64(account.CurrentBalance)
		lastUpdate     = uint64(account.LastUpdate.UnixNano())
		label          = []byte(account.Label)
	)

	tlvRecords := []tlv.Record{
		tlv.MakePrimitiveRecord(typeID, &id),
		tlv.MakePrimitiveRecord(typeAccountType, &accountType),
		tlv.MakePrimitiveRecord(typeInitialBalance, &initialBalance),
		tlv.MakePrimitiveRecord(typeCurrentBalance, &currentBalance),
		tlv.MakePrimitiveRecord(typeLastUpdate, &lastUpdate),
	}

	if !account.ExpirationDate.IsZero() {
		expirationDate := uint64(account.ExpirationDate.UnixNano())
		tlvRecords = append(tlvRecords, tlv.MakePrimitiveRecord(
			typeExpirationDate, &expirationDate,
		))
	}

	tlvRecords = append(
		tlvRecords,
		newInvoiceEntryMapRecord(typeInvoices, &account.Invoices),
		newPaymentEntryMapRecord(typePayments, &account.Payments),
		tlv.MakePrimitiveRecord(typeLabel, &label),
	)

	tlvStream, err := tlv.NewStream(tlvRecords...)
	if err != nil {
		return nil, err
	}

	if err := tlvStream.Encode(&buf); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

func deserializeAccount(content []byte) (*OffChainBalanceAccount, error) {
	var (
		r              = bytes.NewReader(content)
		id             []byte
		accountType    uint8
		initialBalance uint64
		currentBalance uint64
		lastUpdate     uint64
		expirationDate uint64
		invoices       AccountInvoices
		payments       AccountPayments
		label          []byte
	)

	tlvStream, err := tlv.NewStream(
		tlv.MakePrimitiveRecord(typeID, &id),
		tlv.MakePrimitiveRecord(typeAccountType, &accountType),
		tlv.MakePrimitiveRecord(typeInitialBalance, &initialBalance),
		tlv.MakePrimitiveRecord(typeCurrentBalance, &currentBalance),
		tlv.MakePrimitiveRecord(typeLastUpdate, &lastUpdate),
		tlv.MakePrimitiveRecord(typeExpirationDate, &expirationDate),
		newInvoiceEntryMapRecord(typeInvoices, &invoices),
		newPaymentEntryMapRecord(typePayments, &payments),
		tlv.MakePrimitiveRecord(typeLabel, &label),
	)
	if err != nil {
		return nil, err
	}

	parsedTypes, err := tlvStream.DecodeWithParsedTypes(r)
	if err != nil {
		return nil, err
	}

	account := &OffChainBalanceAccount{
		Type:           AccountType(accountType),
		InitialBalance: lnwire.MilliSatoshi(initialBalance),
		CurrentBalance: int64(currentBalance),
		LastUpdate:     time.Unix(0, int64(lastUpdate)),
		Invoices:       invoices,
		Payments:       payments,
		Label:          string(label),
	}
	copy(account.ID[:], id)

	if t, ok := parsedTypes[typeExpirationDate]; ok && t == nil {
		account.ExpirationDate = time.Unix(0, int64(expirationDate))
	}

	return account, nil
}

// newInvoiceEntryMapRecord returns a new TLV record for encoding the given map
// of invoice hashes.
func newInvoiceEntryMapRecord(tlvType tlv.Type,
	invoiceMap *AccountInvoices) tlv.Record {

	recordSize := func() uint64 {
		return uint64(len(*invoiceMap) * lntypes.HashSize)
	}
	return tlv.MakeDynamicRecord(
		tlvType, invoiceMap, recordSize, InvoiceEntryMapEncoder,
		InvoiceEntryMapDecoder,
	)
}

// InvoiceEntryMapEncoder encodes a map of invoice hashes.
func InvoiceEntryMapEncoder(w io.Writer, val any, buf *[8]byte) error {
	if t, ok := val.(*AccountInvoices); ok {
		if err := tlv.WriteVarInt(w, uint64(len(*t)), buf); err != nil {
			return err
		}
		for hash := range *t {
			hash := [32]byte(hash)

			if err := tlv.EBytes32(w, &hash, buf); err != nil {
				return err
			}
		}
		return nil
	}
	return tlv.NewTypeForEncodingErr(val, "*AccountInvoices")
}

// InvoiceEntryMapDecoder decodes a map of invoice hashes.
func InvoiceEntryMapDecoder(r io.Reader, val any, buf *[8]byte,
	_ uint64) error {

	if typ, ok := val.(*AccountInvoices); ok {
		numItems, err := tlv.ReadVarInt(r, buf)
		if err != nil {
			return err
		}

		hashes := make(AccountInvoices, numItems)
		for i := uint64(0); i < numItems; i++ {
			var item [32]byte
			if err := tlv.DBytes32(r, &item, buf, 32); err != nil {
				return err
			}
			hashes[item] = struct{}{}
		}
		*typ = hashes
		return nil
	}
	return tlv.NewTypeForEncodingErr(val, "*AccountInvoices")
}

// newPaymentEntryMapRecord returns a new TLV record for encoding the given map
// of payment entries.
func newPaymentEntryMapRecord(tlvType tlv.Type,
	hashMap *AccountPayments) tlv.Record {

	recordSize := func() uint64 {
		// We have a 32-byte hash, a single byte for the status and
		// 8 bytes for the total amount for each entry.
		return uint64(len(*hashMap) * (lntypes.HashSize + 1 + 8))
	}
	return tlv.MakeDynamicRecord(
		tlvType, hashMap, recordSize, PaymentEntryMapEncoder,
		PaymentEntryMapDecoder,
	)
}

// PaymentEntryMapEncoder encodes a map of payment entries.
func PaymentEntryMapEncoder(w io.Writer, val any, buf *[8]byte) error {
	if t, ok := val.(*AccountPayments); ok {
		if err := tlv.WriteVarInt(w, uint64(len(*t)), buf); err != nil {
			return err
		}
		for hash, entry := range *t {
			hash := [32]byte(hash)

			if err := tlv.EBytes32(w, &hash, buf); err != nil {
				return err
			}

			// We know there aren't that many payment states, and
			// they all fit into a single byte.
			status := []byte{byte(entry.Status)}
			if _, err := w.Write(status); err != nil {
				return err
			}

			err := tlv.EUint64T(w, uint64(entry.FullAmount), buf)
			if err != nil {
				return err
			}
		}
		return nil
	}
	return tlv.NewTypeForEncodingErr(val, "*AccountPayments")
}

// PaymentEntryMapDecoder decodes a map of payment entries.
func PaymentEntryMapDecoder(r io.Reader, val any, buf *[8]byte, _ uint64) error {
	if typ, ok := val.(*AccountPayments); ok {
		numItems, err := tlv.ReadVarInt(r, buf)
		if err != nil {
			return err
		}

		entries := make(AccountPayments, numItems)
		for i := uint64(0); i < numItems; i++ {
			var item [32]byte
			if err := tlv.DBytes32(r, &item, buf, 32); err != nil {
				return err
			}

			status := make([]byte, 1)
			if _, err := r.Read(status); err != nil {
				return err
			}

			var fullAmt uint64
			if err := tlv.DUint64(r, &fullAmt, buf, 8); err != nil {
				return err
			}

			entries[item] = &PaymentEntry{
				Status: lnrpc.Payment_PaymentStatus(
					status[0],
				),
				FullAmount: lnwire.MilliSatoshi(fullAmt),
			}
		}
		*typ = entries
		return nil
	}
	return tlv.NewTypeForEncodingErr(val, "*AccountPayments")
}
