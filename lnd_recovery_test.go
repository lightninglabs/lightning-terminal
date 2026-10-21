package terminal

import (
	"bytes"
	"sync"
	"testing"

	"github.com/lightningnetwork/lnd/channeldb"
	"github.com/lightningnetwork/lnd/chanstate"
	"github.com/lightningnetwork/lnd/htlcswitch"
	"github.com/lightningnetwork/lnd/kvdb"
	"github.com/lightningnetwork/lnd/lnwire"
	"github.com/stretchr/testify/require"
)

// TestLndForwardingResponseRecovery checks that the embedded lnd preserves
// pending forwarding responses written by v0.21.4 when their channel closes.
func TestLndForwardingResponseRecovery(t *testing.T) {
	t.Parallel()

	for _, tc := range []struct {
		name    string
		message lnwire.Message
	}{
		{
			name: "settle",
			message: &lnwire.UpdateFulfillHTLC{
				ChanID:          lnwire.ChannelID{1},
				ID:              2,
				PaymentPreimage: [32]byte{2},
			},
		},
		{
			name: "fail",
			message: &lnwire.UpdateFailHTLC{
				ChanID: lnwire.ChannelID{1},
				ID:     2,
				Reason: bytes.Repeat([]byte{3}, 256),
			},
		},
	} {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			testLndForwardingResponseRecovery(t, tc.message)
		})
	}
}

func testLndForwardingResponseRecovery(t *testing.T,
	wireMessage lnwire.Message) {

	t.Helper()

	dbDir := t.TempDir()
	openDB := func() (*channeldb.DB, func()) {
		backend, err := kvdb.GetBoltBackend(
			&kvdb.BoltBackendConfig{
				DBPath:         dbDir,
				DBFileName:     "channel.db",
				NoFreelistSync: true,
				DBTimeout:      kvdb.DefaultDBTimeout,
			},
		)
		require.NoError(t, err)
		closeDB := sync.OnceFunc(func() {
			require.NoError(t, backend.Close())
		})
		t.Cleanup(closeDB)

		db, err := channeldb.CreateWithBackend(backend)
		require.NoError(t, err)
		return db, closeDB
	}

	db, closeDB := openDB()
	closed := false
	outKey := htlcswitch.CircuitKey{
		ChanID: lnwire.NewShortChanIDFromInt(70), HtlcID: 2,
	}
	inKey := htlcswitch.CircuitKey{
		ChanID: lnwire.NewShortChanIDFromInt(80), HtlcID: 1,
	}
	cfg := &htlcswitch.CircuitMapConfig{
		DB: db,
		FetchAllOpenChannels: func() (
			[]*chanstate.OpenChannel, error) {

			return nil, nil
		},
		FetchClosedChannels: func(bool) (
			[]*chanstate.ChannelCloseSummary, error) {

			if !closed {
				return nil, nil
			}
			return []*chanstate.ChannelCloseSummary{{
				ShortChanID: outKey.ChanID,
			}}, nil
		},
		CheckFwdResponse: db.ChannelStateDB().CheckFwdResponse,
		CheckResolutionMsg: func(
			*htlcswitch.CircuitKey) error {

			return htlcswitch.ErrResMsgNotFound
		},
	}
	circuits, err := htlcswitch.NewCircuitMap(cfg)
	require.NoError(t, err)
	_, err = circuits.CommitCircuits(&htlcswitch.PaymentCircuit{
		Incoming: inKey,
	})
	require.NoError(t, err)
	err = circuits.OpenCircuits(htlcswitch.Keystone{
		InKey: inKey, OutKey: outKey,
	})
	require.NoError(t, err)

	// Write the released v0.21.4 format directly, independently
	// of the currently selected lnd's response writer.
	var message bytes.Buffer
	_, err = lnwire.WriteMessage(&message, wireMessage, 0)
	require.NoError(t, err)
	err = kvdb.Update(db, func(tx kvdb.RwTx) error {
		bucket, err := tx.CreateTopLevelBucket(
			[]byte("fwd-response-store-bucket-key"),
		)
		if err != nil {
			return err
		}
		return bucket.Put(outKey.Bytes(), message.Bytes())
	}, func() {})
	require.NoError(t, err)

	// Restart from disk after the outgoing channel has closed.
	closeDB()
	closed = true
	db, _ = openDB()
	cfg.DB = db
	cfg.CheckFwdResponse = db.ChannelStateDB().CheckFwdResponse
	circuits, err = htlcswitch.NewCircuitMap(cfg)
	require.NoError(t, err)
	require.NotNil(t, circuits.LookupOpenCircuit(outKey),
		"closed channel lost a circuit with a pending response")

	responses, err := db.ChannelStateDB().FetchFwdResponses()
	require.NoError(t, err)
	require.Len(t, responses, 1)
	require.Equal(t, outKey, responses[0].OutKey)
	require.IsType(t, wireMessage, responses[0].Message)
	var replay bytes.Buffer
	_, err = lnwire.WriteMessage(&replay, responses[0].Message, 0)
	require.NoError(t, err)
	require.Equal(t, message.Bytes(), replay.Bytes())
}
