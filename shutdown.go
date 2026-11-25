package terminal

import (
	"os"
	"os/signal"
	"sync"
	"syscall"
)

// shutdownSource stops litd. It is separate from the signal.Interceptor that
// litd hands to lnd, because that interceptor also fires when only lnd stops.
// litd stops on an OS signal, on litd's StopDaemon RPC and on a critical log in
// one of litd's subsystems, but not when only lnd stops.
type shutdownSource struct {
	// quit is closed exactly once when litd should shut down.
	quit chan struct{}

	// once guards closing quit so that RequestShutdown is idempotent.
	once sync.Once

	// signals is the channel OS signals are delivered on. We keep a
	// reference to it so it can be deregistered in Stop.
	signals chan os.Signal
}

// newShutdownSource creates a shutdownSource that listens for OS interrupt and
// termination signals. Go delivers a signal to every channel registered with
// signal.Notify, so lnd's interceptor also receives it.
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
// down.
func (s *shutdownSource) ShutdownChannel() <-chan struct{} {
	return s.quit
}

// Stop deregisters the OS signal handler. It does not request a shutdown.
func (s *shutdownSource) Stop() {
	signal.Stop(s.signals)
}
