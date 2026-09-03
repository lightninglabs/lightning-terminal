package terminal

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/lightninglabs/lightning-terminal/perms"
	"github.com/lightninglabs/lightning-terminal/queue"
	"github.com/lightninglabs/lightning-terminal/status"
	"github.com/lightninglabs/lightning-terminal/subservers"
	"github.com/lightninglabs/lndclient"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"
	"gopkg.in/macaroon-bakery.v2/bakery"
)

// syncLightningClient scripts GetInfo while leaving unused RPCs unimplemented.
type syncLightningClient struct {
	lnrpc.LightningClient

	getInfo func(context.Context) (*lnrpc.GetInfoResponse, error)
}

// startupSubServer supplies only the methods used during manager startup.
type startupSubServer struct {
	subservers.SubServer

	name   string
	remote bool
	start  func() error
}

func (s *startupSubServer) Name() string {
	return s.name
}

func (s *startupSubServer) Remote() bool {
	return s.remote
}

func (s *startupSubServer) Start(lnrpc.LightningClient,
	*lndclient.GrpcLndServices, bool) error {

	return s.start()
}

func (s *startupSubServer) Permissions() map[string][]bakery.Op {
	return nil
}

func (s *startupSubServer) WhiteListedURLs() map[string]struct{} {
	return nil
}

func (s *startupSubServer) ServerErrChan() chan error {
	return nil
}

// TestStartIntegratedSubServers checks startup order, mode gating, and the
// degraded startup path after tapd fails.
func TestStartIntegratedSubServers(t *testing.T) {
	tests := []struct {
		name       string
		remoteLND  bool
		remoteTapd bool
		failTapd   bool
		stopLND    bool
		wantOrder  []string
	}{
		{
			name:      "wait after tapd before siblings",
			wantOrder: []string{"tapd", "sync", "loop"},
		},
		{
			name:      "skip wait after tapd failure",
			failTapd:  true,
			wantOrder: []string{"tapd", "loop"},
		},
		{
			name:      "remote LND",
			remoteLND: true,
			wantOrder: []string{"tapd", "loop"},
		},
		{
			name:       "remote tapd",
			remoteTapd: true,
			wantOrder:  []string{"loop"},
		},
		{
			name:      "LND stops during sync",
			stopLND:   true,
			wantOrder: []string{"tapd", "sync"},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			permsMgr, err := perms.NewManager(false)
			require.NoError(t, err)
			mgr := subservers.NewManager(
				permsMgr, status.NewStatusManager(),
			)
			var order []string
			tapd := &startupSubServer{
				name:   subservers.TAP,
				remote: test.remoteTapd,
				start: func() error {
					order = append(order, "tapd")
					if test.failTapd {
						return errors.New(
							"tapd startup failed",
						)
					}

					return nil
				},
			}
			loop := &startupSubServer{
				name: subservers.LOOP,
				start: func() error {
					order = append(order, "loop")

					return nil
				},
			}
			require.NoError(t, mgr.AddServer(tapd, true))
			require.NoError(t, mgr.AddServer(loop, true))

			lndQuit := make(chan struct{})
			errQueue := queue.NewConcurrentQueue[error](1)
			errQueue.Start()
			defer errQueue.Stop()
			g := &LightningTerminal{
				cfg: &Config{
					LndMode:            ModeIntegrated,
					TaprootAssetsMode:  ModeIntegrated,
					LndRPCTimeout:      time.Second,
					LndConnectInterval: time.Hour,
				},
				subServerMgr: mgr,
				errQueue:     errQueue,
				basicClient: &syncLightningClient{
					getInfo: func(context.Context) (
						*lnrpc.GetInfoResponse, error) {

						order = append(order, "sync")
						if test.stopLND {
							close(lndQuit)
						}

						synced := !test.stopLND
						return &lnrpc.GetInfoResponse{
							SyncedToChain: synced,
						}, nil
					},
				},
			}
			if test.remoteLND {
				g.cfg.LndMode = ModeRemote
			}
			if test.remoteTapd {
				g.cfg.TaprootAssetsMode = ModeRemote
			}

			ctx, cancel := context.WithTimeout(
				context.Background(), time.Second,
			)
			defer cancel()
			err = g.startIntegratedSubServers(ctx, lndQuit)
			if test.stopLND {
				require.EqualError(t, err,
					"error waiting for lnd chain sync: "+
						"LND has stopped")
			} else {
				require.NoError(t, err)
			}
			require.Equal(t, test.wantOrder, order)
		})
	}
}

func (c *syncLightningClient) GetInfo(ctx context.Context,
	_ *lnrpc.GetInfoRequest, _ ...grpc.CallOption) (
	*lnrpc.GetInfoResponse, error) {

	return c.getInfo(ctx)
}

// TestWaitForChainSync covers retries and termination while LND is not synced.
func TestWaitForChainSync(t *testing.T) {
	t.Parallel()

	const rpcTimeout = 20 * time.Millisecond

	tests := []struct {
		name       string
		firstError error
		timeoutRPC bool
		cancel     bool
		lndStopped bool
		systemErr  bool
		wantErr    string
	}{
		{name: "not synced then synced"},
		{
			name:       "transient error then synced",
			firstError: errors.New("temporary RPC error"),
		},
		{
			name:       "RPC timeout then synced",
			timeoutRPC: true,
		},
		{
			name:    "context canceled",
			cancel:  true,
			wantErr: context.Canceled.Error(),
		},
		{
			name:       "LND stopped",
			lndStopped: true,
			wantErr:    "LND has stopped",
		},
		{
			name:      "subsystem failed",
			systemErr: true,
			wantErr:   "error from subsystem: fatal test error",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			t.Parallel()

			ctx, cancel := context.WithTimeout(
				context.Background(), time.Second,
			)
			defer cancel()

			lndQuit := make(chan struct{})
			errQueue := queue.NewConcurrentQueue[error](1)
			errQueue.Start()
			defer errQueue.Stop()

			g := &LightningTerminal{
				cfg: &Config{
					LndRPCTimeout:      rpcTimeout,
					LndConnectInterval: time.Millisecond,
				},
				errQueue: errQueue,
			}

			// Stop signals must interrupt the retry delay without
			// waiting for another poll or the parent deadline.
			if test.wantErr != "" {
				g.cfg.LndConnectInterval = time.Hour
			}

			calls := 0
			g.basicClient = &syncLightningClient{
				getInfo: func(rpcCtx context.Context) (
					*lnrpc.GetInfoResponse, error) {

					calls++
					if calls > 1 {
						return &lnrpc.GetInfoResponse{
							SyncedToChain: true,
						}, nil
					}

					if test.cancel {
						cancel()
					}
					if test.lndStopped {
						close(lndQuit)
					}
					if test.systemErr {
						errQueue.ChanIn() <- errors.New(
							"fatal test error",
						)
					}
					if test.timeoutRPC {
						<-rpcCtx.Done()
						require.NoError(t, ctx.Err())

						return nil, rpcCtx.Err()
					}

					return &lnrpc.GetInfoResponse{},
						test.firstError
				},
			}

			err := g.waitForChainSync(ctx, lndQuit)
			if test.wantErr != "" {
				require.EqualError(t, err, test.wantErr)
				require.Equal(t, 1, calls)

				return
			}

			require.NoError(t, err)
			require.Equal(t, 2, calls)
		})
	}
}
