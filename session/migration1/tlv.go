package migration1

import (
	"bytes"
	"fmt"
	"io"
	"time"

	"github.com/btcsuite/btcd/btcec/v2"
	"github.com/lightningnetwork/lnd/tlv"
	"gopkg.in/macaroon-bakery.v2/bakery"
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
	typePairingSecret   tlv.Type = 9
	typeLocalPrivateKey tlv.Type = 10
	typeRemotePublicKey tlv.Type = 11
	typeMacaroonRecipe  tlv.Type = 12
	typeCreatedAt       tlv.Type = 13
	typeFeaturesConfig  tlv.Type = 14
	typeWithPrivacy     tlv.Type = 15
	typeRevokedAt       tlv.Type = 16

	// typeMacaroon is no longer used, but we leave it defined for backwards
	// compatibility.
	typeMacaroon tlv.Type = 8 // nolint

	typeMacPerms   tlv.Type = 1
	typeMacCaveats tlv.Type = 2

	typeCaveatID             tlv.Type = 1
	typeCaveatVerificationID tlv.Type = 2
	typeCaveatLocation       tlv.Type = 3

	typePermEntity tlv.Type = 1
	typePermAction tlv.Type = 2

	typeFeatureName   tlv.Type = 1
	typeFeatureConfig tlv.Type = 2
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
		expiry        = uint64(session.Expiry.Unix())
		serverAddr    = []byte(session.ServerAddr)
		devServer     = uint8(0)
		pairingSecret = session.PairingSecret[:]
		privateKey    = session.LocalPrivateKey.Serialize()
		createdAt     = uint64(session.CreatedAt.Unix())
		revokedAt     uint64
		withPrivacy   = uint8(0)
	)

	if !session.RevokedAt.IsZero() {
		revokedAt = uint64(session.RevokedAt.Unix())
	}

	if session.WithPrivacyMapper {
		withPrivacy = 1
	}

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

	if session.MacaroonRecipe != nil {
		tlvRecords = append(tlvRecords, tlv.MakeDynamicRecord(
			typeMacaroonRecipe, session.MacaroonRecipe,
			func() uint64 {
				return recordSize(
					macaroonRecipeEncoder,
					session.MacaroonRecipe,
				)
			},
			macaroonRecipeEncoder, macaroonRecipeDecoder,
		))
	}

	tlvRecords = append(
		tlvRecords, tlv.MakePrimitiveRecord(typeCreatedAt, &createdAt),
	)

	if session.FeatureConfig != nil && len(*session.FeatureConfig) != 0 {
		tlvRecords = append(tlvRecords, tlv.MakeDynamicRecord(
			typeFeaturesConfig, session.FeatureConfig,
			func() uint64 {
				return recordSize(
					featureConfigEncoder,
					session.FeatureConfig,
				)
			},
			featureConfigEncoder, featureConfigDecoder,
		))
	}

	tlvRecords = append(
		tlvRecords,
		tlv.MakePrimitiveRecord(typeWithPrivacy, &withPrivacy),
		tlv.MakePrimitiveRecord(typeRevokedAt, &revokedAt),
	)

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
		session                        = &Session{}
		label, serverAddr              []byte
		pairingSecret, privateKey      []byte
		state, typ, devServer, privacy uint8
		expiry, createdAt, revokedAt   uint64
		macRecipe                      MacaroonRecipe
		featureConfig                  FeaturesConfig
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
		tlv.MakePrimitiveRecord(typePairingSecret, &pairingSecret),
		tlv.MakePrimitiveRecord(typeLocalPrivateKey, &privateKey),
		tlv.MakePrimitiveRecord(
			typeRemotePublicKey, &session.RemotePublicKey,
		),
		tlv.MakeDynamicRecord(
			typeMacaroonRecipe, &macRecipe, nil,
			macaroonRecipeEncoder, macaroonRecipeDecoder,
		),
		tlv.MakePrimitiveRecord(typeCreatedAt, &createdAt),
		tlv.MakeDynamicRecord(
			typeFeaturesConfig, &featureConfig, nil,
			featureConfigEncoder, featureConfigDecoder,
		),
		tlv.MakePrimitiveRecord(typeWithPrivacy, &privacy),
		tlv.MakePrimitiveRecord(typeRevokedAt, &revokedAt),
	)
	if err != nil {
		return nil, err
	}

	parsedTypes, err := tlvStream.DecodeWithParsedTypes(r)
	if err != nil {
		return nil, err
	}

	session.ID = IDFromMacRootKeyID(session.MacaroonRootKey)
	session.Label = string(label)
	session.State = State(state)
	session.Type = Type(typ)
	session.Expiry = time.Unix(int64(expiry), 0)
	session.CreatedAt = time.Unix(int64(createdAt), 0)
	session.ServerAddr = string(serverAddr)
	session.DevServer = devServer == 1
	session.WithPrivacyMapper = privacy == 1

	if revokedAt != 0 {
		session.RevokedAt = time.Unix(int64(revokedAt), 0)
	}

	if t, ok := parsedTypes[typeMacaroonRecipe]; ok && t == nil {
		session.MacaroonRecipe = &macRecipe
	}

	if t, ok := parsedTypes[typePairingSecret]; ok && t == nil {
		copy(session.PairingSecret[:], pairingSecret)
	}

	if t, ok := parsedTypes[typeLocalPrivateKey]; ok && t == nil {
		session.LocalPrivateKey, session.LocalPublicKey = btcec.PrivKeyFromBytes(
			privateKey,
		)
	}

	if t, ok := parsedTypes[typeFeaturesConfig]; ok && t == nil {
		session.FeatureConfig = &featureConfig
	}

	return session, nil
}

func featureConfigEncoder(w io.Writer, val interface{}, buf *[8]byte) error {
	if v, ok := val.(*FeaturesConfig); ok {
		for n, config := range *v {
			name := []byte(n)
			config := config

			var permsTLVBytes bytes.Buffer
			tlvStream, err := tlv.NewStream(
				tlv.MakePrimitiveRecord(typeFeatureName, &name),
				tlv.MakePrimitiveRecord(
					typeFeatureConfig, &config,
				),
			)
			if err != nil {
				return err
			}

			err = tlvStream.Encode(&permsTLVBytes)
			if err != nil {
				return err
			}

			// We encode the record with a varint length followed by
			// the _raw_ TLV bytes.
			tlvLen := uint64(len(permsTLVBytes.Bytes()))
			if err := tlv.WriteVarInt(w, tlvLen, buf); err != nil {
				return err
			}

			_, err = w.Write(permsTLVBytes.Bytes())
			if err != nil {
				return err
			}
		}

		return nil
	}

	return tlv.NewTypeForEncodingErr(val, "FeaturesConfig")
}

func featureConfigDecoder(r io.Reader, val interface{}, buf *[8]byte,
	l uint64) error {

	if v, ok := val.(*FeaturesConfig); ok {
		featureConfig := make(map[string][]byte)

		// Using this information, we'll create a new limited
		// reader that'll return an EOF once the end has been
		// reached so the stream stops consuming bytes.
		innerTlvReader := io.LimitedReader{
			R: r,
			N: int64(l),
		}

		for {
			// Read out the varint that encodes the size of this
			// inner TLV record.
			blobSize, err := tlv.ReadVarInt(&innerTlvReader, buf)
			if err == io.EOF {
				break
			} else if err != nil {
				return err
			}

			innerInnerTlvReader := io.LimitedReader{
				R: &innerTlvReader,
				N: int64(blobSize),
			}

			var (
				name   []byte
				config []byte
			)
			tlvStream, err := tlv.NewStream(
				tlv.MakePrimitiveRecord(
					typeFeatureName, &name,
				),
				tlv.MakePrimitiveRecord(
					typeFeatureConfig, &config,
				),
			)
			if err != nil {
				return err
			}

			err = tlvStream.Decode(&innerInnerTlvReader)
			if err != nil {
				return err
			}

			featureConfig[string(name)] = config
		}

		*v = featureConfig

		return nil
	}

	return tlv.NewTypeForEncodingErr(val, "FeaturesConfig")
}

// macaroonRecipeEncoder is a custom TLV encoder for a MacaroonRecipe record.
func macaroonRecipeEncoder(w io.Writer, val interface{}, buf *[8]byte) error {
	if v, ok := val.(*MacaroonRecipe); ok {
		var recipeTLVBytes bytes.Buffer
		tlvStream, err := tlv.NewStream(
			tlv.MakeDynamicRecord(
				typeMacPerms, &v.Permissions, func() uint64 {
					return recordSize(
						permsEncoder, &v.Permissions,
					)
				}, permsEncoder, permsDecoder,
			),
			tlv.MakeDynamicRecord(
				typeMacCaveats, &v.Caveats, func() uint64 {
					return recordSize(
						caveatsEncoder, &v.Caveats,
					)
				}, caveatsEncoder, caveatsDecoder,
			),
		)
		if err != nil {
			return err
		}

		err = tlvStream.Encode(&recipeTLVBytes)
		if err != nil {
			return err
		}

		_, err = w.Write(recipeTLVBytes.Bytes())
		if err != nil {
			return err
		}

		return nil
	}

	return tlv.NewTypeForEncodingErr(val, "MacaroonRecipe")
}

// macaroonRecipeDecoder is a custom TLV decoder for a MacaroonRecipe record.
func macaroonRecipeDecoder(r io.Reader, val interface{}, buf *[8]byte,
	l uint64) error {

	if v, ok := val.(*MacaroonRecipe); ok {
		// Using this information, we'll create a new limited
		// reader that'll return an EOF once the end has been
		// reached so the stream stops consuming bytes.
		innerTlvReader := io.LimitedReader{
			R: r,
			N: int64(l),
		}

		var (
			perms   []bakery.Op
			caveats []macaroon.Caveat
		)
		tlvStream, err := tlv.NewStream(
			tlv.MakeDynamicRecord(
				typeMacPerms, &perms, nil, permsEncoder,
				permsDecoder,
			),
			tlv.MakeDynamicRecord(
				typeMacCaveats, &caveats, nil, caveatsEncoder,
				caveatsDecoder,
			),
		)
		if err != nil {
			return err
		}

		err = tlvStream.Decode(&innerTlvReader)
		if err != nil {
			return err
		}

		*v = MacaroonRecipe{
			Permissions: perms,
			Caveats:     caveats,
		}

		return nil
	}

	return tlv.NewTypeForDecodingErr(val, "MacaroonRecipe", l, l)
}

// permsEncoder is a custom TLV encoder for macaroon Permission records.
func permsEncoder(w io.Writer, val interface{}, buf *[8]byte) error {
	if v, ok := val.(*[]bakery.Op); ok {
		for _, c := range *v {
			entity := []byte(c.Entity)
			action := []byte(c.Action)

			var permsTLVBytes bytes.Buffer
			tlvStream, err := tlv.NewStream(
				tlv.MakePrimitiveRecord(
					typePermEntity, &entity,
				),
				tlv.MakePrimitiveRecord(
					typePermAction, &action,
				),
			)
			if err != nil {
				return err
			}

			err = tlvStream.Encode(&permsTLVBytes)
			if err != nil {
				return err
			}

			// We encode the record with a varint length followed by
			// the _raw_ TLV bytes.
			tlvLen := uint64(len(permsTLVBytes.Bytes()))
			if err := tlv.WriteVarInt(w, tlvLen, buf); err != nil {
				return err
			}

			_, err = w.Write(permsTLVBytes.Bytes())
			if err != nil {
				return err
			}
		}

		return nil
	}

	return tlv.NewTypeForEncodingErr(val, "MacaroonPermission")
}

// permsDecoder is a custom TLV decoder for macaroon Permission records.
func permsDecoder(r io.Reader, val interface{}, buf *[8]byte, l uint64) error {
	if v, ok := val.(*[]bakery.Op); ok {
		var perms []bakery.Op

		// Using this information, we'll create a new limited
		// reader that'll return an EOF once the end has been
		// reached so the stream stops consuming bytes.
		innerTlvReader := io.LimitedReader{
			R: r,
			N: int64(l),
		}

		for {
			// Read out the varint that encodes the size of this
			// inner TLV record.
			blobSize, err := tlv.ReadVarInt(&innerTlvReader, buf)
			if err == io.EOF {
				break
			} else if err != nil {
				return err
			}

			innerInnerTlvReader := io.LimitedReader{
				R: &innerTlvReader,
				N: int64(blobSize),
			}

			var (
				entity []byte
				action []byte
			)
			tlvStream, err := tlv.NewStream(
				tlv.MakePrimitiveRecord(
					typePermEntity, &entity,
				),
				tlv.MakePrimitiveRecord(
					typePermAction, &action,
				),
			)
			if err != nil {
				return err
			}

			err = tlvStream.Decode(&innerInnerTlvReader)
			if err != nil {
				return err
			}

			perms = append(perms, bakery.Op{
				Entity: string(entity),
				Action: string(action),
			})
		}

		*v = perms

		return nil
	}

	return tlv.NewTypeForEncodingErr(val, "MacaroonPermission")
}

// caveatsEncoder is a custom TLV decoder for macaroon Caveat records.
func caveatsEncoder(w io.Writer, val interface{}, buf *[8]byte) error {
	if v, ok := val.(*[]macaroon.Caveat); ok {
		for _, c := range *v {
			tlvRecords := []tlv.Record{
				tlv.MakePrimitiveRecord(typeCaveatID, &c.Id),
			}

			if c.VerificationId != nil {
				tlvRecords = append(tlvRecords,
					tlv.MakePrimitiveRecord(
						typeCaveatVerificationID,
						&c.VerificationId,
					),
				)
			}

			location := []byte(c.Location)
			if location != nil {
				tlvRecords = append(tlvRecords,
					tlv.MakePrimitiveRecord(
						typeCaveatLocation, &location,
					),
				)
			}

			tlvStream, err := tlv.NewStream(tlvRecords...)
			if err != nil {
				return err
			}

			var caveatTLVBytes bytes.Buffer
			err = tlvStream.Encode(&caveatTLVBytes)
			if err != nil {
				return err
			}

			// We encode the record with a varint length followed by
			// the _raw_ TLV bytes.
			tlvLen := uint64(len(caveatTLVBytes.Bytes()))
			if err := tlv.WriteVarInt(w, tlvLen, buf); err != nil {
				return err
			}

			_, err = w.Write(caveatTLVBytes.Bytes())
			if err != nil {
				return err
			}
		}

		return nil
	}

	return tlv.NewTypeForEncodingErr(val, "MacaroonCaveat")
}

// caveatsDecoder is a custom TLV decoder for the macaroon Caveat record.
func caveatsDecoder(r io.Reader, val interface{}, buf *[8]byte,
	l uint64) error {

	if v, ok := val.(*[]macaroon.Caveat); ok {
		var caveats []macaroon.Caveat

		// Using this information, we'll create a new limited
		// reader that'll return an EOF once the end has been
		// reached so the stream stops consuming bytes.
		innerTlvReader := io.LimitedReader{
			R: r,
			N: int64(l),
		}

		for {
			// Read out the varint that encodes the size of this
			// inner TLV record.
			blobSize, err := tlv.ReadVarInt(r, buf)
			if err == io.EOF {
				break
			} else if err != nil {
				return err
			}

			innerInnerTlvReader := io.LimitedReader{
				R: &innerTlvReader,
				N: int64(blobSize),
			}

			var (
				id             []byte
				verificationID []byte
				location       []byte
			)
			tlvStream, err := tlv.NewStream(
				tlv.MakePrimitiveRecord(
					typeCaveatID, &id,
				),
				tlv.MakePrimitiveRecord(
					typeCaveatVerificationID,
					&verificationID,
				),
				tlv.MakePrimitiveRecord(
					typeCaveatLocation, &location,
				),
			)
			if err != nil {
				return err
			}

			err = tlvStream.Decode(&innerInnerTlvReader)
			if err != nil {
				return err
			}

			caveats = append(caveats, macaroon.Caveat{
				Id:             id,
				VerificationId: verificationID,
				Location:       string(location),
			})
		}

		*v = caveats
		return nil
	}

	return tlv.NewTypeForDecodingErr(val, "MacaroonCaveat", l, l)
}

// recordSize returns the amount of bytes this TLV record will occupy when
// encoded.
func recordSize(encoder tlv.Encoder, v interface{}) uint64 {
	var (
		b   bytes.Buffer
		buf [8]byte
	)

	// We know that encoding works since the tests pass in the build this
	// file is checked into, so we'll simplify things and simply encode it
	// ourselves then report the total amount of bytes used.
	if err := encoder(&b, v, &buf); err != nil {
		// This should never error out, but we log it just in case it
		// does.
		// log.Errorf("encoding the amp invoice state failed: %v", err)
	}

	return uint64(len(b.Bytes()))
}
