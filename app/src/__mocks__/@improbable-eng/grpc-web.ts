import { ProtobufMessage } from '@improbable-eng/grpc-web/dist/typings/message';
import { UnaryMethodDefinition } from '@improbable-eng/grpc-web/dist/typings/service';
import { UnaryRpcOptions } from '@improbable-eng/grpc-web/dist/typings/unary';
import { sampleApiResponses } from 'util/sampleData';

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
        toObject: () => sampleApiResponses[path],
      } as TRes,
      headers: {} as any,
      trailers: {} as any,
    });
  },
};
