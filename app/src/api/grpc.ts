import { grpc } from '@improbable-eng/grpc-web';
import { ProtobufMessage } from '@improbable-eng/grpc-web/dist/typings/message';
import { Metadata } from '@improbable-eng/grpc-web/dist/typings/metadata';
import { UnaryMethodDefinition } from '@improbable-eng/grpc-web/dist/typings/service';
import { DEV_HOST } from 'config';
import { grpcLog as log } from 'util/log';

class GrpcClient {
  /**
   * Executes a single GRPC request and returns a promise which will resolve with the response
   * @param methodDescriptor the GRPC method to call on the service
   * @param request The GRPC request message to send
   * @param metadata headers to include with the request
   */
  request<TReq extends ProtobufMessage, TRes extends ProtobufMessage>(
    methodDescriptor: UnaryMethodDefinition<TReq, TRes>,
    request: TReq,
    metadata?: Metadata.ConstructorArg,
  ): Promise<TRes> {
    return new Promise((resolve, reject) => {
      log.debug(
        `Request: ${methodDescriptor.service.serviceName}.${methodDescriptor.methodName}`,
      );
      log.debug(` - req: `, request.toObject());
      grpc.unary(methodDescriptor, {
        host: DEV_HOST,
        request,
        metadata,
        onEnd: ({ status, statusMessage, headers, message, trailers }) => {
          log.debug(' - status', status, statusMessage);
          log.debug(' - headers', headers);
          if (status === grpc.Code.OK && message) {
            log.debug(' - message', message.toObject());
            resolve(message as TRes);
          } else {
            reject(new Error(`${status}: ${statusMessage}`));
          }
          log.debug(' - trailers', trailers);
        },
      });
    });
  }
}

export default GrpcClient;
