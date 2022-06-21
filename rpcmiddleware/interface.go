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
	// errorType is the reflection type of the error interface.
	errorType = reflect.TypeOf((*error)(nil)).Elem()

	// protoMessageType is the reflection type of the proto.Message
	// interface.
	protoMessageType = reflect.TypeOf((*proto.Message)(nil)).Elem()

	// acceptRequestHandler is a RequestHandler that accepts all requests.
	acceptRequestHandler requestHandler = func(proto.Message) error {
		return nil
	}

	// passThroughResponseHandler is a responseHandler that does not modify
	// the response and just passes it through.
	passThroughResponseHandler responseHandler = func(
		proto.Message) (proto.Message, error) {

		return nil, nil
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

// requestHandler is a function type for a generic gRPC request message handler
// that can accept (=return nil) or refuse (=return non-nil error with rejection
// reason) an incoming request.
type requestHandler func(req proto.Message) error

// responseHandler is a function type for a generic gRPC response message
// handler that can pass through the response (=return nil, nil), replace the
// response with a new message of the same type (=return non-nil message, nil
// error) or abort the call by returning a non-nil error.
type responseHandler func(req proto.Message) (proto.Message, error)

// RoundTripChecker is a type that represents a basic request/response round
// trip checker.
type RoundTripChecker interface {
	// AcceptsRequest returns true if the checker accepts protobuf request
	// messages of the given type. This is mainly a safety feature to make
	// sure a round trip checker is implemented correctly.
	AcceptsRequest(protoreflect.MessageType) bool

	// HandlesResponse returns true if the checker can handle protobuf
	// response messages of the given type. This is mainly a safety feature
	// to make sure a round trip checker is implemented correctly.
	HandlesResponse(protoreflect.MessageType) bool

	// HandleRequest is called for each incoming gRPC request message of the
	// type declared to be accepted by AcceptsRequest. The handler can
	// accept (=return nil) or refuse (=return non-nil error with rejection
	// reason) an incoming request.
	HandleRequest(proto.Message) error

	// HandleResponse is called for each outgoing gRPC response message of
	// the type declared to be handled by HandlesResponse. The handler can
	// pass through the response (=return nil, nil), replace the response
	// with a new message of the same type (=return non-nil message, nil
	// error) or abort the call by returning a non-nil error.
	HandleResponse(proto.Message) (proto.Message, error)
}

// DefaultChecker is the default implementation of a round trip checker.
type DefaultChecker struct {
	requestType     protoreflect.MessageType
	responseType    protoreflect.MessageType
	requestHandler  requestHandler
	responseHandler responseHandler
}

// AcceptsRequest returns true if the checker accepts protobuf request messages
// of the given type. This is mainly a safety feature to make sure a round trip
// checker is implemented correctly.
func (r *DefaultChecker) AcceptsRequest(t protoreflect.MessageType) bool {
	return t == r.requestType
}

// HandlesResponse returns true if the checker can handle protobuf response
// messages of the given type. This is mainly a safety feature to make sure a
// round trip checker is implemented correctly.
func (r *DefaultChecker) HandlesResponse(t protoreflect.MessageType) bool {
	return t == r.responseType
}

// HandleRequest is called for each incoming gRPC request message of the
// type declared to be accepted by AcceptsRequest. The handler can
// accept (=return nil) or refuse (=return non-nil error with rejection
// reason) an incoming request.
func (r *DefaultChecker) HandleRequest(req proto.Message) error {
	return r.requestHandler(req)
}

// HandleResponse is called for each outgoing gRPC response message of
// the type declared to be handled by HandlesResponse. The handler can
// pass through the response (=return nil, nil), replace the response
// with a new message of the same type (=return non-nil message, nil
// error) or abort the call by returning a non-nil error.
func (r *DefaultChecker) HandleResponse(resp proto.Message) (proto.Message,
	error) {

	return r.responseHandler(resp)
}

// NewPassThrough returns a round trip checker that allows the incoming request
// and passes through the response unmodified.
func NewPassThrough(requestSample proto.Message,
	responseSample proto.Message) *DefaultChecker {

	return &DefaultChecker{
		requestType:     requestSample.ProtoReflect().Type(),
		responseType:    responseSample.ProtoReflect().Type(),
		requestHandler:  acceptRequestHandler,
		responseHandler: passThroughResponseHandler,
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
		requestHandler: newReflectionRequestHandler(
			requestSample, typedRequestHandler,
		),
		responseHandler: passThroughResponseHandler,
	}
}

// NewResponseRewriter returns a round trip checker that allows the incoming
// request and inspects and potentially modifies the response.
func NewResponseRewriter(requestSample proto.Message,
	responseSample proto.Message,
	typedResponseHandler interface{}) *DefaultChecker {

	return &DefaultChecker{
		requestType:    requestSample.ProtoReflect().Type(),
		responseType:   responseSample.ProtoReflect().Type(),
		requestHandler: acceptRequestHandler,
		responseHandler: newReflectionResponseHandler(
			responseSample, typedResponseHandler,
		),
	}
}

// NewFullChecker returns a round trip checker that both inspects the incoming
// request and response and potentially modifies the response.
func NewFullChecker(requestSample proto.Message,
	responseSample proto.Message, typedRequestHandler interface{},
	typedResponseHandler interface{}) *DefaultChecker {

	return &DefaultChecker{
		requestType:  requestSample.ProtoReflect().Type(),
		responseType: responseSample.ProtoReflect().Type(),
		requestHandler: newReflectionRequestHandler(
			requestSample, typedRequestHandler,
		),
		responseHandler: newReflectionResponseHandler(
			responseSample, typedResponseHandler,
		),
	}
}

// newReflectionRequestHandler returns a request handler that adapts the generic
// proto.Message capable request handler into one that is type specific for the
// given request message sample message. This requires reflection and cannot be
// implemented with Generics.
func newReflectionRequestHandler(requestSample proto.Message,
	typedHandler interface{}) requestHandler {

	requestType := reflect.TypeOf(requestSample)
	requestProtoType := requestSample.ProtoReflect().Type()
	handlerValue := reflect.ValueOf(typedHandler)

	err := validateRequestHandler(handlerValue.Type(), requestType)
	if err != nil {
		// This is covered by unit tests and shouldn't happen in the
		// first place, as this would be an implementation error.
		panic(err)
	}

	return func(req proto.Message) error {
		if req.ProtoReflect().Type() != requestProtoType {
			return fmt.Errorf("request handler called for "+
				"unsupported type %v (expected %v)",
				req.ProtoReflect().Type(), requestProtoType)
		}

		// We made sure this call would succeed when creating the
		// handler.
		resp := handlerValue.Call([]reflect.Value{
			reflect.ValueOf(req),
		})

		// We also made sure the types returned from the function would
		// be compatible with what we expect.
		var err error
		if resp[0].Interface() != nil {
			err = resp[0].Interface().(error)
		}

		return err
	}
}

// newReflectionResponseHandler returns a response handler that adapts the
// generic proto.Message capable response handler into one that is type specific
// for the given request message sample message. This requires reflection and
// cannot be implemented with Generics.
func newReflectionResponseHandler(responseSample proto.Message,
	typedHandler interface{}) responseHandler {

	responseType := reflect.TypeOf(responseSample)
	responseProtoType := responseSample.ProtoReflect().Type()
	handlerValue := reflect.ValueOf(typedHandler)

	err := validateResponseHandler(handlerValue.Type(), responseType)
	if err != nil {
		// This is covered by unit tests and shouldn't happen in the
		// first place, as this would be an implementation error.
		panic(err)
	}

	return func(req proto.Message) (proto.Message, error) {
		if req.ProtoReflect().Type() != responseProtoType {
			return nil, fmt.Errorf("response handler called for "+
				"unsupported type %v (expected %v)",
				req.ProtoReflect().Type(), responseProtoType)
		}

		// We made sure this call would succeed when creating the
		// handler.
		resp := handlerValue.Call([]reflect.Value{
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

// validateRequestHandler makes sure that the given request handler function
// has the correct number and types of parameters and return values.
func validateRequestHandler(typedHandlerType reflect.Type,
	requestType reflect.Type) error {

	if typedHandlerType.Kind() != reflect.Func {
		return fmt.Errorf("request handler must be a function")
	}
	if typedHandlerType.NumIn() != 1 || typedHandlerType.NumOut() != 1 {
		return fmt.Errorf("request handler must have exactly one " +
			"parameter and one return value")
	}
	if !typedHandlerType.In(0).ConvertibleTo(requestType) {
		return fmt.Errorf("request handler must have one parameter " +
			"with a sub type of proto.Message")
	}
	if typedHandlerType.Out(0) != errorType {
		return fmt.Errorf("request handler must return exactly one " +
			"error value")
	}

	return nil
}

// validateResponseHandler makes sure that the given response handler function
// has the correct number and types of parameters and return values.
func validateResponseHandler(typedHandlerType reflect.Type,
	responseType reflect.Type) error {

	if typedHandlerType.Kind() != reflect.Func {
		return fmt.Errorf("response handler must be a function")
	}
	if typedHandlerType.NumIn() != 1 || typedHandlerType.NumOut() != 2 {
		return fmt.Errorf("response handler must have exactly one " +
			"parameter and two return values")
	}
	if !typedHandlerType.In(0).ConvertibleTo(responseType) {
		return fmt.Errorf("response handler must have one parameter " +
			"with a sub type of proto.Message")
	}
	outType0 := typedHandlerType.Out(0)
	pmt := protoMessageType
	if outType0 != pmt ||
		typedHandlerType.Out(1) != errorType {

		return fmt.Errorf("response handler must return exactly two " +
			"values, proto.Message and error")
	}

	return nil
}
