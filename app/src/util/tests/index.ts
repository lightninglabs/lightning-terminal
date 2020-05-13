import { grpc } from '@improbable-eng/grpc-web';
import { ProtobufMessage } from '@improbable-eng/grpc-web/dist/typings/message';
import { UnaryMethodDefinition } from '@improbable-eng/grpc-web/dist/typings/service';
import { UnaryRpcOptions } from '@improbable-eng/grpc-web/dist/typings/unary';
import { sampleApiResponses } from './sampleData';

/**
 * Suppresses console errors when executing some code.
 * For example: when testing that an error is thrown during a component's
 * rendering, React will log an error message. We can safely ignore these
 * @param func the code to run
 */
export const suppressConsoleErrors = async (func: () => any | Promise<any>) => {
  const oldConsoleErr = console.error;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  console.error = () => {};
  const result = func();
  if (result && typeof result.then === 'function') {
    await result;
  }
  console.error = oldConsoleErr;
};

// the type for the injection function so that it can be passed the args
type UnaryFunc = (
  methodDescriptor: UnaryMethodDefinition<any, any>,
  props: UnaryRpcOptions<ProtobufMessage, ProtobufMessage>,
) => void;

/**
 * Injects a function into the scope of the grpc.unary function. This is helpful
 * to inspect request params or track calls to the API inside of unit tests
 * @param func the function to execute inside of the grpc call
 */
export const injectIntoGrpcUnary = (func: UnaryFunc) => {
  const grpcMock = grpc as jest.Mocked<typeof grpc>;
  grpcMock.unary.mockImplementationOnce((desc, props) => {
    func(desc, props);
    const path = `${desc.service.serviceName}.${desc.methodName}`;
    // return a response by calling the onEnd function
    props.onEnd({
      status: 0,
      statusMessage: '',
      // the message returned should have a toObject function
      message: {
        toObject: () => sampleApiResponses[path],
      } as any,
      headers: {} as any,
      trailers: {} as any,
    });
    return undefined as any;
  });
};

export { default as renderWithProviders } from './renderWithProviders';
