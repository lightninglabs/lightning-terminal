import { grpc } from '@improbable-eng/grpc-web';
import { ProtobufMessage } from '@improbable-eng/grpc-web/dist/typings/message';
import { UnaryMethodDefinition } from '@improbable-eng/grpc-web/dist/typings/service';
import { UnaryRpcOptions } from '@improbable-eng/grpc-web/dist/typings/unary';
import { sampleApiResponses } from './sampleData';

const grpcMock = grpc as jest.Mocked<typeof grpc>;

// the type for the injection function so that it can be passed the args
type UnaryFunc = (
  methodDescriptor: UnaryMethodDefinition<any, any>,
  props: UnaryRpcOptions<ProtobufMessage, ProtobufMessage>,
) => void;

/**
 * Creates a GRPC response containing sample response data
 * @param desc the method descriptor provided by the grpc library
 */
export const sampleGrpcResponse = (desc: UnaryMethodDefinition<any, any>): any => {
  const path = `${desc.service.serviceName}.${desc.methodName}`;
  return {
    status: grpc.Code.OK,
    statusMessage: '',
    message: { toObject: () => sampleApiResponses[path] },
    headers: {},
    trailers: {},
  };
};

/**
 * Mocks the grpc.unary() function to return sample data
 */
export const restoreGrpcSampleDataMock = () => {
  grpcMock.unary.mockImplementation((desc, props) => {
    // return a response by calling the onEnd function
    props.onEnd(sampleGrpcResponse(desc));
    return undefined as any;
  });
};

/**
 * Injects a function into the scope of the grpc.unary function. This is helpful
 * to inspect request params or track calls to the API inside of unit tests
 * @param func the function to execute inside of the grpc call
 */
export const injectIntoGrpcUnary = (func: UnaryFunc, methodName?: string) => {
  grpcMock.unary.mockImplementationOnce((desc, props) => {
    // call the func for the specified method or always
    if (!methodName || methodName === desc.methodName) {
      func(desc, props);
    }
    // return a response by calling the onEnd function
    props.onEnd(sampleGrpcResponse(desc));
    return undefined as any;
  });
};

/**
 * Throws an error for the next GRPC request
 * @param errorMessage the error message to throw
 * @param methodName only throw for this method name
 */
export const throwGrpcError = (errorMessage: string, methodName?: string) => {
  grpcMock.unary.mockImplementationOnce((desc, props) => {
    // throw an error for the specified method or always
    if (!methodName || methodName === desc.methodName) {
      throw new Error(errorMessage);
    }
    // return a response by calling the onEnd function
    props.onEnd(sampleGrpcResponse(desc));
    return undefined as any;
  });
};
