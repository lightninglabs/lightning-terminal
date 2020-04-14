import { grpc } from '@improbable-eng/grpc-web';
import { ProtobufMessage } from '@improbable-eng/grpc-web/dist/typings/message';
import { Metadata } from '@improbable-eng/grpc-web/dist/typings/metadata';
import { UnaryMethodDefinition } from '@improbable-eng/grpc-web/dist/typings/service';
import { DEV_HOST } from 'config';

/**
 * Executes a single GRPC request and returns a promise which will resolve with the response
 * @param methodDescriptor the GRPC method to call on the service
 * @param request The GRPC request message to send
 * @param metadata headers to include with the request
 */
export const grpcRequest = <TReq extends ProtobufMessage, TRes extends ProtobufMessage>(
  methodDescriptor: UnaryMethodDefinition<TReq, TRes>,
  request: TReq,
  metadata?: Metadata.ConstructorArg,
): Promise<TRes> => {
  return new Promise((resolve, reject) => {
    grpc.unary(methodDescriptor, {
      host: DEV_HOST,
      request,
      metadata,
      onEnd: ({ status, statusMessage, headers, message, trailers }) => {
        if (status === grpc.Code.OK && message) {
          resolve(message as TRes);
        } else {
          reject(new Error(`${status}: ${statusMessage}`));
        }
      },
    });
  });
};
