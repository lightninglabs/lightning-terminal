package rpcmiddleware

import (
	"context"
	"fmt"
	"reflect"

	"github.com/lightningnetwork/lnd/lnrpc"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protoreflect"
)

var (
	// ErrNotSupported is returned if a specific method is called that is
	// not supported by the RPC middleware interceptor checker.
	ErrNotSupported = fmt.Errorf("method not supported")

	// errorType is the reflection type of the error interface.
	errorType = reflect.TypeOf((*error)(nil)).Elem()

	// ctxType is the reflection type of the context.Context interface.
	ctxType = reflect.TypeOf((*context.Context)(nil)).Elem()

	// protoMessageType is the reflection type of the proto.Message
	// interface.
	protoMessageType = reflect.TypeOf((*proto.Message)(nil)).Elem()

	// passThroughMessageHandler is a messageHandler that does not modify
	// the message and just passes it through.
	passThroughMessageHandler messageHandler = func(context.Context,
		proto.Message) (proto.Message, error) {

		return nil, nil
	}

	// PassThroughErrorHandler is an ErrorHandler that does not modify an
	// error and instead just passes it through.
	PassThroughErrorHandler ErrorHandler = func(error) (error, error) {
		return nil, nil
	}

	// messageDenyHandler disallows the given message.
	messageDenyHandler messageHandler = func(context.Context,
		proto.Message) (proto.Message, error) {

		return nil, ErrNotSupported
	}
)

// RequestInterceptor is a type that can intercept an RPC request.
type RequestInterceptor interface {
	// Name returns the name of the interceptor.
	Name() string

	// ReadOnly returns true if this interceptor should be registered in
	// read-only mode. In read-only mode no custom caveat name can be
	// specified.
	ReadOnly() bool

	// CustomCaveatName returns the name of the custom caveat that is
	// expected to be handled by this interceptor. Cannot be specified in
	// read-only mode.
	CustomCaveatName() string

	// Intercept processes an RPC middleware interception request and
	// returns the interception result which either accepts or rejects the
	// intercepted message.
	Intercept(context.Context,
		*lnrpc.RPCMiddlewareRequest) (*lnrpc.RPCMiddlewareResponse,
		error)
}

// messageHandler is a function type for a generic gRPC message handler that
// can pass through the message (=return nil, nil), replace the message with a
// new message of the same type (=return non-nil message, nil error) or abort
// the call by returning a non-nil error. If the message is a request, then
// returning a non-nil error will reject the request.
type messageHandler func(context.Context, proto.Message) (proto.Message, error)

// ErrorHandler is a function type for a generic gRPC error handler. It can
// pass through the error unchanged (=return nil, nil), replace the error with
// a different one (=return non-nil error, nil error) or abort by returning a
// non-nil error.
type ErrorHandler func(respErr error) (error, error)

// RoundTripChecker is a type that represents a basic request/response round
// trip checker.
type RoundTripChecker interface {
	// HandlesRequest returns true if the checker accepts protobuf request
	// messages of the given type. This is mainly a safety feature to make
	// sure a round trip checker is implemented correctly.
	HandlesRequest(protoreflect.MessageType) bool

	// HandlesResponse returns true if the checker can handle protobuf
	// response messages of the given type. This is mainly a safety feature
	// to make sure a round trip checker is implemented correctly.
	HandlesResponse(protoreflect.MessageType) bool

	// HandleRequest is called for each incoming gRPC request message of the
	// type declared to be accepted by HandlesRequest. The handler can
	// accept the request as is (=return nil, nil), replace the request with
	// a new message of the same type (=return non-nil message, nil) or
	// refuse (=return non-nil error with rejection reason) an incoming
	// request.
	HandleRequest(context.Context, proto.Message) (proto.Message, error)

	// HandleResponse is called for each outgoing gRPC response message of
	// the type declared to be handled by HandlesResponse. The handler can
	// pass through the response (=return nil, nil), replace the response
	// with a new message of the same type (=return non-nil message, nil
	// error) or abort the call by returning a non-nil error.
	HandleResponse(context.Context, proto.Message) (proto.Message, error)

	// HandleErrorResponse is called for any error response.
	// The handler can pass through the error (=return nil, nil), replace
	// the response error with a new one (=return non-nil error, nil) or
	// abort by returning a non nil error (=return nil, non-nil error).
	HandleErrorResponse(error) (error, error)
}

// DefaultChecker is the default implementation of a round trip checker.
type DefaultChecker struct {
	requestType     protoreflect.MessageType
	responseType    protoreflect.MessageType
	requestHandler  messageHandler
	responseHandler messageHandler
	errorHandler    ErrorHandler
}

// A compile-time check to ensure that DefaultChecker implements
// RoundTripChecker.
var _ RoundTripChecker = (*DefaultChecker)(nil)

// HandlesRequest returns true if the checker accepts protobuf request messages
// of the given type. This is mainly a safety feature to make sure a round trip
// checker is implemented correctly.
func (r *DefaultChecker) HandlesRequest(t protoreflect.MessageType) bool {
	return t == r.requestType
}

// HandlesResponse returns true if the checker can handle protobuf response
// messages of the given type. This is mainly a safety feature to make sure a
// round trip checker is implemented correctly.
func (r *DefaultChecker) HandlesResponse(t protoreflect.MessageType) bool {
	return t == r.responseType
}

// HandleRequest is called for each incoming gRPC request message of the type
// declared to be accepted by HandlesRequest. The handler can accept the request
// as is (=return nil, nil), replace the request with a new message of the same
// type (=return non-nil message, nil) or refuse (=return non-nil error with
// rejection reason) an incoming request.
func (r *DefaultChecker) HandleRequest(ctx context.Context,
	req proto.Message) (proto.Message, error) {

	return r.requestHandler(ctx, req)
}

// HandleResponse is called for each outgoing gRPC response message of the type
// declared to be handled by HandlesResponse. The handler can pass through the
// response (=return nil, nil), replace the response with a new message of the
// same type (=return non-nil message, nil error) or abort the call by returning
// a non-nil error.
func (r *DefaultChecker) HandleResponse(ctx context.Context,
	resp proto.Message) (proto.Message, error) {

	return r.responseHandler(ctx, resp)
}

// HandleErrorResponse is called for any error response.
// The handler can pass through the error (=return nil, nil), replace
// the response error with a new one (=return non-nil error, nil) or
// abort by returning a non nil error (=return nil, non-nil error).
func (r *DefaultChecker) HandleErrorResponse(respErr error) (error, error) {
	return r.errorHandler(respErr)
}

// NewPassThrough returns a round trip checker that allows the incoming request
// and passes through the response unmodified.
func NewPassThrough(requestSample proto.Message,
	responseSample proto.Message) *DefaultChecker {

	return &DefaultChecker{
		requestType:     requestSample.ProtoReflect().Type(),
		responseType:    responseSample.ProtoReflect().Type(),
		requestHandler:  passThroughMessageHandler,
		responseHandler: passThroughMessageHandler,
		errorHandler:    PassThroughErrorHandler,
	}
}

// NewRequestChecker returns a round trip checker that inspects the incoming
// request and passes through the response unmodified.
func NewRequestChecker(requestSample proto.Message,
	responseSample proto.Message,
	typedRequestHandler interface{}) *DefaultChecker {

	return &DefaultChecker{
		requestType:  requestSample.ProtoReflect().Type(),
		responseType: responseSample.ProtoReflect().Type(),
		requestHandler: newReflectionRequestCheckHandler(
			requestSample, typedRequestHandler,
		),
		responseHandler: passThroughMessageHandler,
		errorHandler:    PassThroughErrorHandler,
	}
}

// NewRequestDenier returns a round trip checker that denies the given requests.
func NewRequestDenier(requestSample proto.Message,
	responseSample proto.Message) *DefaultChecker {

	return &DefaultChecker{
		requestType:     requestSample.ProtoReflect().Type(),
		responseType:    responseSample.ProtoReflect().Type(),
		requestHandler:  messageDenyHandler,
		responseHandler: messageDenyHandler,
		errorHandler:    PassThroughErrorHandler,
	}
}

// NewRequestRewriter returns a round trip checker that inspects and potentially
// modifies the incoming request and passes through the response unmodified.
func NewRequestRewriter(requestSample proto.Message,
	responseSample proto.Message,
	typedRequestHandler interface{}) *DefaultChecker {

	return &DefaultChecker{
		requestType:  requestSample.ProtoReflect().Type(),
		responseType: responseSample.ProtoReflect().Type(),
		requestHandler: newReflectionMessageHandler(
			requestSample, typedRequestHandler,
		),
		responseHandler: passThroughMessageHandler,
		errorHandler:    PassThroughErrorHandler,
	}
}

// NewResponseRewriter returns a round trip checker that allows the incoming
// request and inspects and potentially modifies the response.
func NewResponseRewriter(requestSample proto.Message,
	responseSample proto.Message, typedResponseHandler interface{},
	errorHandler ErrorHandler) *DefaultChecker {

	return &DefaultChecker{
		requestType:    requestSample.ProtoReflect().Type(),
		responseType:   responseSample.ProtoReflect().Type(),
		requestHandler: passThroughMessageHandler,
		responseHandler: newReflectionMessageHandler(
			responseSample, typedResponseHandler,
		),
		errorHandler: errorHandler,
	}
}

// NewResponseEmptier returns a round trip checker that allows the incoming
// request and replaces the response with an empty one.
func NewResponseEmptier[reqT, respT proto.Message]() *DefaultChecker {
	req := *new(reqT)
	resp := *new(respT)
	return &DefaultChecker{
		requestType:    req.ProtoReflect().Type(),
		responseType:   resp.ProtoReflect().Type(),
		requestHandler: passThroughMessageHandler,
		responseHandler: newReflectionMessageHandler(
			resp, func(context.Context, respT) (proto.Message,
				error) {

				return *new(respT), nil
			},
		),
		errorHandler: PassThroughErrorHandler,
	}
}

// NewFullChecker returns a round trip checker that both inspects the incoming
// request and response and potentially modifies the response.
func NewFullChecker(requestSample proto.Message,
	responseSample proto.Message, typedRequestHandler interface{},
	typedResponseHandler interface{},
	errorHandler ErrorHandler) *DefaultChecker {

	return &DefaultChecker{
		requestType:  requestSample.ProtoReflect().Type(),
		responseType: responseSample.ProtoReflect().Type(),
		requestHandler: newReflectionRequestCheckHandler(
			requestSample, typedRequestHandler,
		),
		responseHandler: newReflectionMessageHandler(
			responseSample, typedResponseHandler,
		),
		errorHandler: errorHandler,
	}
}

// NewFullRewriter returns a round trip checker that both inspects the incoming
// request and response and potentially modifies the both the request and
// response.
func NewFullRewriter(requestSample proto.Message,
	responseSample proto.Message, typedRequestHandler interface{},
	typedResponseHandler interface{},
	errHandler ErrorHandler) *DefaultChecker {

	return &DefaultChecker{
		requestType:  requestSample.ProtoReflect().Type(),
		responseType: responseSample.ProtoReflect().Type(),
		requestHandler: newReflectionMessageHandler(
			requestSample, typedRequestHandler,
		),
		responseHandler: newReflectionMessageHandler(
			responseSample, typedResponseHandler,
		),
		errorHandler: errHandler,
	}
}

// newReflectionRequestCheckHandler returns a request handler that adapts the
// generic proto.Message capable request handler into one that is type specific
// for the given request message sample message. This requires reflection and
// cannot be implemented with Generics.
func newReflectionRequestCheckHandler(requestSample proto.Message,
	typedHandler interface{}) messageHandler {

	requestType := reflect.TypeOf(requestSample)
	requestProtoType := requestSample.ProtoReflect().Type()
	handlerValue := reflect.ValueOf(typedHandler)

	err := validateRequestCheckHandler(handlerValue.Type(), requestType)
	if err != nil {
		// This is covered by unit tests and shouldn't happen in the
		// first place, as this would be an implementation error.
		panic(err)
	}

	return func(ctx context.Context, req proto.Message) (proto.Message,
		error) {

		if req.ProtoReflect().Type() != requestProtoType {
			return nil, fmt.Errorf("request handler called for "+
				"unsupported type %v (expected %v)",
				req.ProtoReflect().Type(), requestProtoType)
		}

		// We made sure this call would succeed when creating the
		// handler.
		resp := handlerValue.Call([]reflect.Value{
			reflect.ValueOf(ctx),
			reflect.ValueOf(req),
		})

		// We also made sure the types returned from the function would
		// be compatible with what we expect.
		var err error
		if resp[0].Interface() != nil {
			err = resp[0].Interface().(error)
		}

		return nil, err
	}
}

// newReflectionMessageHandler returns a message handler that adapts the generic
// proto.Message capable message handler into one that is type specific for the
// given sample message. This requires reflection and cannot be implemented with
// Generics.
func newReflectionMessageHandler(messageSample proto.Message,
	typedHandler interface{}) messageHandler {

	messageType := reflect.TypeOf(messageSample)
	messageProtoType := messageSample.ProtoReflect().Type()
	handlerValue := reflect.ValueOf(typedHandler)

	err := validateMessageHandler(handlerValue.Type(), messageType)
	if err != nil {
		// This is covered by unit tests and shouldn't happen in the
		// first place, as this would be an implementation error.
		panic(err)
	}

	return func(ctx context.Context, req proto.Message) (proto.Message,
		error) {

		if req.ProtoReflect().Type() != messageProtoType {
			return nil, fmt.Errorf("message handler called for "+
				"unsupported type %v (expected %v)",
				req.ProtoReflect().Type(), messageProtoType)
		}

		// We made sure this call would succeed when creating the
		// handler.
		resp := handlerValue.Call([]reflect.Value{
			reflect.ValueOf(ctx),
			reflect.ValueOf(req),
		})

		// We also made sure the types returned from the function would
		// be compatible with what we expect.
		var (
			replacementMessage proto.Message
			err                error
		)
		if resp[0].Interface() != nil {
			replacementMessage = resp[0].Interface().(proto.Message)
		}
		if resp[1].Interface() != nil {
			err = resp[1].Interface().(error)
		}

		return replacementMessage, err
	}
}

// validateRequestCheckHandler makes sure that the given request handler
// function has the correct number and types of parameters and return values.
func validateRequestCheckHandler(typedHandlerType reflect.Type,
	requestType reflect.Type) error {

	if typedHandlerType.Kind() != reflect.Func {
		return fmt.Errorf("request handler must be a function")
	}
	if typedHandlerType.NumIn() != 2 || typedHandlerType.NumOut() != 1 {
		return fmt.Errorf("request handler must have exactly two " +
			"parameter and one return value")
	}
	if !typedHandlerType.In(0).ConvertibleTo(ctxType) {
		return fmt.Errorf("request handler must have first parameter " +
			"with a sub type of context.Context")
	}
	if !typedHandlerType.In(1).ConvertibleTo(requestType) {
		return fmt.Errorf("request handler must have second parameter " +
			"with a sub type of proto.Message")
	}
	if typedHandlerType.Out(0) != errorType {
		return fmt.Errorf("request handler must return exactly one " +
			"error value")
	}

	return nil
}

// validateMessageHandler makes sure that the given message handler function
// has the correct number and types of parameters and return values.
func validateMessageHandler(typedHandlerType reflect.Type,
	messageType reflect.Type) error {

	if typedHandlerType.Kind() != reflect.Func {
		return fmt.Errorf("message handler must be a function")
	}
	if typedHandlerType.NumIn() != 2 || typedHandlerType.NumOut() != 2 {
		return fmt.Errorf("message handler must have exactly two " +
			"parameter and two return values")
	}
	if !typedHandlerType.In(0).ConvertibleTo(ctxType) {
		return fmt.Errorf("request handler must have first parameter " +
			"with a sub type of context.Context")
	}
	if !typedHandlerType.In(1).ConvertibleTo(messageType) {
		return fmt.Errorf("message handler must have second parameter " +
			"with a sub type of proto.Message")
	}
	outType0 := typedHandlerType.Out(0)
	pmt := protoMessageType
	if outType0 != pmt ||
		typedHandlerType.Out(1) != errorType {

		return fmt.Errorf("message handler must return exactly two " +
			"values, proto.Message and error")
	}

	return nil
}
