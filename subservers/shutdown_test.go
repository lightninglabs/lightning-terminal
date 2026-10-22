package subservers

import (
	"errors"
	"testing"
	"time"

	"github.com/lightninglabs/lndclient"
	"github.com/lightningnetwork/lnd/lnrpc"
)

// shutdownErrorServer reports errors while its producers are being stopped.
type shutdownErrorServer struct {
	SubServer

	errors  chan error
	stopped chan struct{}
	release chan struct{}
}

func (s *shutdownErrorServer) Name() string {
	return "shutdown-test"
}

func (s *shutdownErrorServer) Remote() bool {
	return false
}

func (s *shutdownErrorServer) Start(lnrpc.LightningClient,
	*lndclient.GrpcLndServices, bool) error {

	return nil
}

func (s *shutdownErrorServer) ServerErrChan() chan error {
	return s.errors
}

func (s *shutdownErrorServer) Stop() error {
	close(s.stopped)

	for range 3 {
		select {
		case s.errors <- errors.New("producer shutting down"):
		case <-s.release:
			return errors.New("test released blocked producer")
		}
	}

	return nil
}

// TestSubServerShutdownConsumesErrors checks that error notifications neither
// suppress cleanup nor block producers while the sub-server is stopping.
func TestSubServerShutdownConsumesErrors(t *testing.T) {
	for _, priorError := range []bool{false, true} {
		name := "errors_during_stop"
		if priorError {
			name = "error_before_stop"
		}

		t.Run(name, func(t *testing.T) {
			server := &shutdownErrorServer{
				errors:  make(chan error, 1),
				stopped: make(chan struct{}),
				release: make(chan struct{}),
			}
			wrapper := &subServerWrapper{
				SubServer: server,
				quit:      make(chan struct{}),
			}
			reported := make(chan struct{}, 1)
			err := wrapper.startIntegrated(
				nil, nil, false, func() {}, func(error) {
					select {
					case reported <- struct{}{}:
					default:
					}
				},
			)
			if err != nil {
				t.Fatal(err)
			}

			if priorError {
				server.errors <- errors.New("runtime error")
				select {
				case <-reported:
				case <-time.After(time.Second):
					t.Fatal("runtime error not reported")
				}
			}

			done := make(chan struct{})
			go func() {
				_ = wrapper.stop()
				close(done)
			}()
			defer func() {
				close(server.release)
				<-done
			}()

			select {
			case <-done:
			case <-time.After(time.Second):
				t.Fatal("shutdown blocked sending error")
			}

			select {
			case <-server.stopped:
			default:
				t.Fatal("sub-server cleanup was skipped")
			}
		})
	}
}

// TestSubServerStartupErrorOrdering keeps a queued startup error from being
// overwritten by a later running-state notification.
func TestSubServerStartupErrorOrdering(t *testing.T) {
	server := &shutdownErrorServer{
		errors:  make(chan error, 1),
		stopped: make(chan struct{}),
		release: make(chan struct{}),
	}
	server.errors <- errors.New("startup worker failed")
	wrapper := &subServerWrapper{
		SubServer: server,
		quit:      make(chan struct{}),
	}
	events := make(chan string, 8)
	err := wrapper.startIntegrated(
		nil, nil, false,
		func() { events <- "running" },
		func(error) { events <- "errored" },
	)
	if err != nil {
		t.Fatal(err)
	}
	defer func() {
		close(server.release)
		_ = wrapper.stop()
	}()

	for _, expected := range []string{"running", "errored"} {
		select {
		case actual := <-events:
			if actual != expected {
				t.Fatalf(
					"expected %s, got %s",
					expected, actual,
				)
			}
		case <-time.After(time.Second):
			t.Fatalf("missing %s notification", expected)
		}
	}
}
