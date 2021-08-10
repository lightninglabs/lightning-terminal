package session

import (
	"fmt"
	"io"
	"time"

	"github.com/btcsuite/btcd/btcec"
	"github.com/lightningnetwork/lnd/tlv"
	"gopkg.in/macaroon.v2"
)

const (
	typeLabel           tlv.Type = 1
	typeState           tlv.Type = 2
	typeType            tlv.Type = 3
	typeExpiry          tlv.Type = 4
	typeServerAddr      tlv.Type = 5
	typeDevServer       tlv.Type = 6
	typeMacaroonRootKey tlv.Type = 7
	typeMacaroon        tlv.Type = 8
	typePairingSecret   tlv.Type = 9
	typeLocalPrivateKey tlv.Type = 10
	typeRemotePublicKey tlv.Type = 11
)

// SerializeSession binary serializes the given session to the writer using the
// tlv format.
func SerializeSession(w io.Writer, session *Session) error {
	if session == nil {
		return fmt.Errorf("session cannot be nil")
	}

	var (
		label         = []byte(session.Label)
		state         = uint8(session.State)
		typ           = uint8(session.Type)
		expiry        = uint64(session.Expiry.UnixNano())
		serverAddr    = []byte(session.ServerAddr)
		devServer     = uint8(0)
		pairingSecret = session.PairingSecret[:]
		privateKey    = session.LocalPrivateKey.Serialize()
	)

	if session.DevServer {
		devServer = 1
	}

	tlvRecords := []tlv.Record{
		tlv.MakePrimitiveRecord(typeLabel, &label),
		tlv.MakePrimitiveRecord(typeState, &state),
		tlv.MakePrimitiveRecord(typeType, &typ),
		tlv.MakePrimitiveRecord(typeExpiry, &expiry),
		tlv.MakePrimitiveRecord(typeServerAddr, &serverAddr),
		tlv.MakePrimitiveRecord(typeDevServer, &devServer),
		tlv.MakePrimitiveRecord(
			typeMacaroonRootKey, &session.MacaroonRootKey,
		),
	}

	if session.Macaroon != nil {
		macaroonBytes, err := session.Macaroon.MarshalBinary()
		if err != nil {
			return fmt.Errorf("error marshaling macaroon: %v", err)
		}

		tlvRecords = append(tlvRecords, tlv.MakePrimitiveRecord(
			typeMacaroon, &macaroonBytes),
		)
	}

	tlvRecords = append(
		tlvRecords,
		tlv.MakePrimitiveRecord(typePairingSecret, &pairingSecret),
		tlv.MakePrimitiveRecord(typeLocalPrivateKey, &privateKey),
	)

	if session.RemotePublicKey != nil {
		tlvRecords = append(tlvRecords, tlv.MakePrimitiveRecord(
			typeRemotePublicKey, &session.RemotePublicKey,
		))
	}

	tlvStream, err := tlv.NewStream(tlvRecords...)
	if err != nil {
		return err
	}

	return tlvStream.Encode(w)
}

// DeserializeSession deserializes a session from the given reader, expecting
// the data to be encoded in the tlv format.
func DeserializeSession(r io.Reader) (*Session, error) {
	var (
		session                          = &Session{}
		label, serverAddr, macaroonBytes []byte
		pairingSecret, privateKey        []byte
		state, typ, devServer            uint8
		expiry                           uint64
	)
	tlvStream, err := tlv.NewStream(
		tlv.MakePrimitiveRecord(typeLabel, &label),
		tlv.MakePrimitiveRecord(typeState, &state),
		tlv.MakePrimitiveRecord(typeType, &typ),
		tlv.MakePrimitiveRecord(typeExpiry, &expiry),
		tlv.MakePrimitiveRecord(typeServerAddr, &serverAddr),
		tlv.MakePrimitiveRecord(typeDevServer, &devServer),
		tlv.MakePrimitiveRecord(
			typeMacaroonRootKey, &session.MacaroonRootKey,
		),
		tlv.MakePrimitiveRecord(typeMacaroon, &macaroonBytes),
		tlv.MakePrimitiveRecord(typePairingSecret, &pairingSecret),
		tlv.MakePrimitiveRecord(typeLocalPrivateKey, &privateKey),
		tlv.MakePrimitiveRecord(
			typeRemotePublicKey, &session.RemotePublicKey,
		),
	)
	if err != nil {
		return nil, err
	}

	parsedTypes, err := tlvStream.DecodeWithParsedTypes(r)
	if err != nil {
		return nil, err
	}

	session.Label = string(label)
	session.State = State(state)
	session.Type = Type(typ)
	session.Expiry = time.Unix(0, int64(expiry))
	session.ServerAddr = string(serverAddr)
	session.DevServer = devServer == 1

	if t, ok := parsedTypes[typeMacaroon]; ok && t == nil {
		session.Macaroon = &macaroon.Macaroon{}
		err := session.Macaroon.UnmarshalBinary(macaroonBytes)
		if err != nil {
			return nil, err
		}
	}

	if t, ok := parsedTypes[typePairingSecret]; ok && t == nil {
		copy(session.PairingSecret[:], pairingSecret)
	}

	if t, ok := parsedTypes[typeLocalPrivateKey]; ok && t == nil {
		session.LocalPrivateKey, session.LocalPublicKey = btcec.PrivKeyFromBytes(
			btcec.S256(), privateKey,
		)
	}

	return session, nil
}
