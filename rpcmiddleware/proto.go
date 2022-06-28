package rpcmiddleware

import (
	"errors"
	"fmt"

	"github.com/lightningnetwork/lnd/lnrpc"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protoreflect"
	"google.golang.org/protobuf/reflect/protoregistry"
)

// MessageTypeOf return the protobuf reflection type of the given fully
// qualified message type name.
func MessageTypeOf(typeName string) (protoreflect.MessageType, error) {
	return protoregistry.GlobalTypes.FindMessageByName(
		protoreflect.FullName(typeName),
	)
}

// ParseProtobuf parses a proto serialized message of the given type into its
// native version.
func ParseProtobuf(typeName string, serialized []byte) (proto.Message, error) {
	messageType, err := MessageTypeOf(typeName)
	if err != nil {
		return nil, err
	}
	msg := messageType.New()
	err = proto.Unmarshal(serialized, msg.Interface())
	if err != nil {
		return nil, err
	}

	return msg.Interface(), nil
}

func ParseResponseErr(serialized []byte) error {
	return errors.New(string(serialized))
}

func RPCOk(req *lnrpc.RPCMiddlewareRequest) (*lnrpc.RPCMiddlewareResponse,
	error) {

	return RPCErrString(req, "")
}

func RPCErr(req *lnrpc.RPCMiddlewareRequest,
	err error) (*lnrpc.RPCMiddlewareResponse, error) {

	if err != nil {
		return RPCErrString(req, err.Error())
	}

	return RPCErrString(req, "")
}

func RPCErrString(req *lnrpc.RPCMiddlewareRequest, format string,
	args ...interface{}) (*lnrpc.RPCMiddlewareResponse, error) {

	feedback := &lnrpc.InterceptFeedback{}
	resp := &lnrpc.RPCMiddlewareResponse{
		RefMsgId: req.MsgId,
		MiddlewareMessage: &lnrpc.RPCMiddlewareResponse_Feedback{
			Feedback: feedback,
		},
	}

	if format != "" {
		feedback.Error = fmt.Sprintf(format, args...)
	}

	return resp, nil
}

func RPCReplacement(req *lnrpc.RPCMiddlewareRequest,
	replacementResponse proto.Message) (*lnrpc.RPCMiddlewareResponse,
	error) {

	rawResponse, err := proto.Marshal(replacementResponse)
	if err != nil {
		return RPCErr(
			req, fmt.Errorf("cannot marshal proto msg: %v", err),
		)
	}

	feedback := &lnrpc.InterceptFeedback{
		ReplaceResponse:       true,
		ReplacementSerialized: rawResponse,
	}

	return &lnrpc.RPCMiddlewareResponse{
		RefMsgId: req.MsgId,
		MiddlewareMessage: &lnrpc.RPCMiddlewareResponse_Feedback{
			Feedback: feedback,
		},
	}, nil
}

func RPCErrReplacement(req *lnrpc.RPCMiddlewareRequest,
	replacementError error) (*lnrpc.RPCMiddlewareResponse, error) {

	feedback := &lnrpc.InterceptFeedback{
		ReplaceResponse:       true,
		ReplacementSerialized: []byte(replacementError.Error()),
	}

	return &lnrpc.RPCMiddlewareResponse{
		RefMsgId: req.MsgId,
		MiddlewareMessage: &lnrpc.RPCMiddlewareResponse_Feedback{
			Feedback: feedback,
		},
	}, nil
}
