package scripting

import (
	"context"
	"fmt"

	"go.starlark.net/starlark"
)

// SubscriptionClient defines the interface for LND subscription methods.
type SubscriptionClient interface {
	// SubscribeInvoices subscribes to invoice updates.
	SubscribeInvoices(ctx context.Context) (<-chan map[string]interface{}, <-chan error, error)

	// SubscribeChannelEvents subscribes to channel events.
	SubscribeChannelEvents(ctx context.Context) (<-chan map[string]interface{}, <-chan error, error)

	// SubscribeHtlcEvents subscribes to HTLC events.
	SubscribeHtlcEvents(ctx context.Context) (<-chan map[string]interface{}, <-chan error, error)

	// SubscribeTransactions subscribes to on-chain transactions.
	SubscribeTransactions(ctx context.Context) (<-chan map[string]interface{}, <-chan error, error)

	// SubscribePeerEvents subscribes to peer connection events.
	SubscribePeerEvents(ctx context.Context) (<-chan map[string]interface{}, <-chan error, error)
}

// subscriptionEngine extends Engine with subscription capabilities.
type subscriptionEngine struct {
	*Engine
	subClient SubscriptionClient
}

// registerSubscriptionBuiltins adds LND subscription builtin functions to the
// lnd module.
func (e *Engine) registerSubscriptionBuiltins(lndModule *StarlarkModule, subClient SubscriptionClient) {
	se := &subscriptionEngine{
		Engine:    e,
		subClient: subClient,
	}

	lndModule.AddFunc("subscribe_invoices",
		starlark.NewBuiltin("subscribe_invoices", se.builtinSubscribeInvoices))
	lndModule.AddFunc("subscribe_channel_events",
		starlark.NewBuiltin("subscribe_channel_events", se.builtinSubscribeChannelEvents))
	lndModule.AddFunc("subscribe_htlc_events",
		starlark.NewBuiltin("subscribe_htlc_events", se.builtinSubscribeHtlcEvents))
	lndModule.AddFunc("subscribe_transactions",
		starlark.NewBuiltin("subscribe_transactions", se.builtinSubscribeTransactions))
	lndModule.AddFunc("subscribe_peer_events",
		starlark.NewBuiltin("subscribe_peer_events", se.builtinSubscribePeerEvents))
}

// builtinSubscribeInvoices implements lnd.subscribe_invoices(handler).
func (se *subscriptionEngine) builtinSubscribeInvoices(thread *starlark.Thread,
	fn *starlark.Builtin, args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var handler starlark.Callable
	if err := starlark.UnpackArgs("subscribe_invoices", args, kwargs,
		"handler", &handler); err != nil {
		return nil, err
	}

	if se.subClient == nil {
		return nil, fmt.Errorf("subscription client not available")
	}

	updates, errs, err := se.subClient.SubscribeInvoices(se.sandbox.Context())
	if err != nil {
		return nil, fmt.Errorf("failed to subscribe to invoices: %w", err)
	}

	se.startSubscriptionLoop("invoices", updates, errs, handler)

	return starlark.None, nil
}

// builtinSubscribeChannelEvents implements lnd.subscribe_channel_events(handler).
func (se *subscriptionEngine) builtinSubscribeChannelEvents(thread *starlark.Thread,
	fn *starlark.Builtin, args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var handler starlark.Callable
	if err := starlark.UnpackArgs("subscribe_channel_events", args, kwargs,
		"handler", &handler); err != nil {
		return nil, err
	}

	if se.subClient == nil {
		return nil, fmt.Errorf("subscription client not available")
	}

	updates, errs, err := se.subClient.SubscribeChannelEvents(se.sandbox.Context())
	if err != nil {
		return nil, fmt.Errorf("failed to subscribe to channel events: %w", err)
	}

	se.startSubscriptionLoop("channel_events", updates, errs, handler)

	return starlark.None, nil
}

// builtinSubscribeHtlcEvents implements lnd.subscribe_htlc_events(handler).
func (se *subscriptionEngine) builtinSubscribeHtlcEvents(thread *starlark.Thread,
	fn *starlark.Builtin, args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var handler starlark.Callable
	if err := starlark.UnpackArgs("subscribe_htlc_events", args, kwargs,
		"handler", &handler); err != nil {
		return nil, err
	}

	if se.subClient == nil {
		return nil, fmt.Errorf("subscription client not available")
	}

	updates, errs, err := se.subClient.SubscribeHtlcEvents(se.sandbox.Context())
	if err != nil {
		return nil, fmt.Errorf("failed to subscribe to HTLC events: %w", err)
	}

	se.startSubscriptionLoop("htlc_events", updates, errs, handler)

	return starlark.None, nil
}

// builtinSubscribeTransactions implements lnd.subscribe_transactions(handler).
func (se *subscriptionEngine) builtinSubscribeTransactions(thread *starlark.Thread,
	fn *starlark.Builtin, args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var handler starlark.Callable
	if err := starlark.UnpackArgs("subscribe_transactions", args, kwargs,
		"handler", &handler); err != nil {
		return nil, err
	}

	if se.subClient == nil {
		return nil, fmt.Errorf("subscription client not available")
	}

	updates, errs, err := se.subClient.SubscribeTransactions(se.sandbox.Context())
	if err != nil {
		return nil, fmt.Errorf("failed to subscribe to transactions: %w", err)
	}

	se.startSubscriptionLoop("transactions", updates, errs, handler)

	return starlark.None, nil
}

// builtinSubscribePeerEvents implements lnd.subscribe_peer_events(handler).
func (se *subscriptionEngine) builtinSubscribePeerEvents(thread *starlark.Thread,
	fn *starlark.Builtin, args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var handler starlark.Callable
	if err := starlark.UnpackArgs("subscribe_peer_events", args, kwargs,
		"handler", &handler); err != nil {
		return nil, err
	}

	if se.subClient == nil {
		return nil, fmt.Errorf("subscription client not available")
	}

	updates, errs, err := se.subClient.SubscribePeerEvents(se.sandbox.Context())
	if err != nil {
		return nil, fmt.Errorf("failed to subscribe to peer events: %w", err)
	}

	se.startSubscriptionLoop("peer_events", updates, errs, handler)

	return starlark.None, nil
}

// startSubscriptionLoop starts a goroutine that processes subscription events
// and calls the handler for each event.
func (se *subscriptionEngine) startSubscriptionLoop(name string,
	updates <-chan map[string]interface{}, errs <-chan error,
	handler starlark.Callable) {

	se.AddSubscriptionGoroutine()

	go func() {
		defer se.DoneSubscriptionGoroutine()

		for {
			select {
			case update, ok := <-updates:
				if !ok {
					log.Infof("[script:%s] %s subscription closed",
						se.scriptName, name)
					return
				}

				// Convert update to Starlark dict.
				starlarkUpdate, err := toStarlarkValue(update)
				if err != nil {
					log.Errorf("[script:%s] failed to convert %s update: %v",
						se.scriptName, name, err)
					continue
				}

				// Call the handler.
				if err := se.CallHandler(handler, starlarkUpdate); err != nil {
					if se.sandbox.IsStopped() {
						return
					}
					log.Errorf("[script:%s] %s handler error: %v",
						se.scriptName, name, err)
				}

			case err, ok := <-errs:
				if !ok {
					return
				}
				log.Errorf("[script:%s] %s subscription error: %v",
					se.scriptName, name, err)
				return

			case <-se.sandbox.Context().Done():
				log.Infof("[script:%s] %s subscription cancelled",
					se.scriptName, name)
				return
			}
		}
	}()
}

// MockSubscriptionClient provides a mock implementation for testing.
type MockSubscriptionClient struct{}

// SubscribeInvoices returns mock invoice updates.
func (m *MockSubscriptionClient) SubscribeInvoices(ctx context.Context) (
	<-chan map[string]interface{}, <-chan error, error) {

	updates := make(chan map[string]interface{})
	errs := make(chan error)
	return updates, errs, nil
}

// SubscribeChannelEvents returns mock channel event updates.
func (m *MockSubscriptionClient) SubscribeChannelEvents(ctx context.Context) (
	<-chan map[string]interface{}, <-chan error, error) {

	updates := make(chan map[string]interface{})
	errs := make(chan error)
	return updates, errs, nil
}

// SubscribeHtlcEvents returns mock HTLC event updates.
func (m *MockSubscriptionClient) SubscribeHtlcEvents(ctx context.Context) (
	<-chan map[string]interface{}, <-chan error, error) {

	updates := make(chan map[string]interface{})
	errs := make(chan error)
	return updates, errs, nil
}

// SubscribeTransactions returns mock transaction updates.
func (m *MockSubscriptionClient) SubscribeTransactions(ctx context.Context) (
	<-chan map[string]interface{}, <-chan error, error) {

	updates := make(chan map[string]interface{})
	errs := make(chan error)
	return updates, errs, nil
}

// SubscribePeerEvents returns mock peer event updates.
func (m *MockSubscriptionClient) SubscribePeerEvents(ctx context.Context) (
	<-chan map[string]interface{}, <-chan error, error) {

	updates := make(chan map[string]interface{})
	errs := make(chan error)
	return updates, errs, nil
}
