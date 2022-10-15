package rpcmiddleware

import (
	"context"
	"sync"
	"time"

	"github.com/lightninglabs/lndclient"
)

// Manager is the main middleware manager service.
type Manager struct {
	interceptTimeout time.Duration
	lndClient        lndclient.LightningClient
	interceptors     []RequestInterceptor

	mainErrChan chan<- error
	wg          sync.WaitGroup
	cancel      context.CancelFunc
	quit        chan struct{}
	stopOnce    sync.Once
}

// NewManager returns a new middleware manager.
func NewManager(interceptTimeout time.Duration,
	lndClient lndclient.LightningClient, errChan chan<- error,
	interceptors ...RequestInterceptor) *Manager {

	return &Manager{
		interceptTimeout: interceptTimeout,
		lndClient:        lndClient,
		interceptors:     interceptors,
		mainErrChan:      errChan,
		quit:             make(chan struct{}),
	}
}

// Start starts the firewall by registering the interceptors with lnd.
func (f *Manager) Start() error {
	ctxc, cancel := context.WithCancel(context.Background())
	f.cancel = cancel

	for _, i := range f.interceptors {
		errChan, err := f.lndClient.RegisterRPCMiddleware(
			ctxc, i.Name(), i.CustomCaveatName(), i.ReadOnly(),
			f.interceptTimeout, i.Intercept,
		)
		if err != nil {
			cancel()
			f.wg.Wait()

			return err
		}

		f.wg.Add(1)
		go func(i RequestInterceptor, errChan chan error) {
			defer f.wg.Done()

			for {
				select {
				case <-f.quit:
					log.Debugf("Quitting interceptor %v, "+
						"shutting down", i.Name())
					return

				case <-ctxc.Done():
					log.Debugf("Quitting interceptor %v, "+
						"context canceled", i.Name())

					return

				case err := <-errChan:
					log.Errorf("Error in interceptor: %v",
						err)

					select {
					case f.mainErrChan <- err:
					case <-f.quit:
					case <-ctxc.Done():
					}

					return
				}
			}
		}(i, errChan)
	}

	return nil
}

// Stop shuts down the middleware manager.
func (f *Manager) Stop() {
	f.stopOnce.Do(func() {
		close(f.quit)
		f.cancel()

		f.wg.Wait()
	})
}
