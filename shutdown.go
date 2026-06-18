package terminal

import (
	"os"
	"os/signal"
	"sync"
	"syscall"
)

// shutdownSource is litd's own shutdown trigger. It is intentionally separate
// from the signal.Interceptor that litd hands to lnd: lnd and litd are forced
// to share a single signal.Interceptor (lnd's signal package only allows one
// interceptor and lnd.Main takes it by value), so litd cannot tell an lnd
// shutdown apart from its own by watching that interceptor's channel. Owning
// its own shutdown source lets litd decide its own lifecycle and keep running
// (e.g. to serve its status endpoint) after lnd alone has stopped.
//
// litd is shut down when:
//   - an OS interrupt or termination signal is received,
//   - litd's StopDaemon RPC is called, or
//   - a fatal litd-specific error occurs.
//
// It is NOT shut down when lnd alone stops.
type shutdownSource struct {
	// quit is closed exactly once when litd should shut down.
	quit chan struct{}

	// once guards closing quit so that RequestShutdown is idempotent.
	once sync.Once

	// signals is the channel OS signals are delivered on. We keep a
	// reference to it so it can be deregistered in Stop.
	signals chan os.Signal
}

// newShutdownSource constructs a shutdownSource and starts listening for OS
// interrupt and termination signals.
//
// Note that Go delivers a signal to every channel registered via
// signal.Notify, so listening here does not prevent lnd's own
// signal.Interceptor from also receiving the same signal. An OS signal
// therefore stops both lnd and litd.
func newShutdownSource() *shutdownSource {
	s := &shutdownSource{
		quit:    make(chan struct{}),
		signals: make(chan os.Signal, 1),
	}

	signal.Notify(s.signals, os.Interrupt, syscall.SIGTERM)

	go func() {
		select {
		case <-s.signals:
			s.RequestShutdown()

		// If shutdown was requested by some other means, there is
		// nothing left to wait for.
		case <-s.quit:
		}
	}()

	return s
}

// RequestShutdown closes the shutdown channel, signalling that litd should shut
// down. It is safe to call multiple times and from multiple goroutines.
func (s *shutdownSource) RequestShutdown() {
	s.once.Do(func() {
		close(s.quit)
	})
}

// ShutdownChannel returns the channel that is closed when litd should shut
// down. The same channel is returned on every call, so callers may select on
// it repeatedly without spawning extra goroutines.
func (s *shutdownSource) ShutdownChannel() <-chan struct{} {
	return s.quit
}

// Stop deregisters the OS signal handler. It does not itself request a
// shutdown. It is mainly useful so that tests don't leave signal handlers
// registered on the process.
func (s *shutdownSource) Stop() {
	signal.Stop(s.signals)
}
