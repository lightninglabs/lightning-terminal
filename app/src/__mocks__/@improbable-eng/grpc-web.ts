import { ProtobufMessage } from '@improbable-eng/grpc-web/dist/typings/message';
import { UnaryMethodDefinition } from '@improbable-eng/grpc-web/dist/typings/service';
import { UnaryRpcOptions } from '@improbable-eng/grpc-web/dist/typings/unary';
import * as samples from 'util/sampleData';

// mock grpc module
export const grpc = {
  Code: {
    OK: 0,
    Canceled: 1,
  },
  // mock unary function to simulate GRPC requests
  unary: <TReq extends ProtobufMessage, TRes extends ProtobufMessage>(
    methodDescriptor: UnaryMethodDefinition<TReq, TRes>,
    props: UnaryRpcOptions<TReq, TRes>,
  ) => {
    const path = `${methodDescriptor.service.serviceName}.${methodDescriptor.methodName}`;
    // return a response by calling the onEnd function
    props.onEnd({
      status: 0,
      statusMessage: '',
      // the message returned should have a toObject function
      message: {
        toObject: () => mockApiResponses[path],
      } as TRes,
      headers: {} as any,
      trailers: {} as any,
    });
  },
};

// collection of mock API responses
const mockApiResponses: Record<string, any> = {
  'lnrpc.Lightning.GetInfo': samples.lndGetInfo,
  'lnrpc.Lightning.ListChannels': samples.lndListChannels,
  'looprpc.SwapClient.ListSwaps': samples.loopListSwaps,
};
