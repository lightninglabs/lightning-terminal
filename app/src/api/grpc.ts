import { grpc } from '@improbable-eng/grpc-web';
import { ProtobufMessage } from '@improbable-eng/grpc-web/dist/typings/message';
import { Metadata } from '@improbable-eng/grpc-web/dist/typings/metadata';
import {
  MethodDefinition,
  UnaryMethodDefinition,
} from '@improbable-eng/grpc-web/dist/typings/service';
import { DEV_HOST } from 'config';
import { AuthenticationError } from 'util/errors';
import { grpcLog as log } from 'util/log';
import { sampleApiResponses } from 'util/tests/sampleData';

class GrpcClient {
  /**
   * Indicates if the API should return sample data instead of making real GRPC requests
   */
  useSampleData = false;

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
      if (this.useSampleData) {
        const endpoint = `${methodDescriptor.service.serviceName}.${methodDescriptor.methodName}`;
        const data = sampleApiResponses[endpoint];
        // the calling function expects the return value to have a `toObject` function
        const response: any = { toObject: () => data };
        resolve(response);
        return;
      }

      const method = `${methodDescriptor.methodName}`;
      log.debug(`${method} request`, request.toObject());
      grpc.unary(methodDescriptor, {
        host: DEV_HOST,
        request,
        metadata,
        onEnd: ({ status, statusMessage, headers, message, trailers }) => {
          log.debug(`${method} status`, status, statusMessage);
          log.debug(`${method} headers`, headers);
          if (status === grpc.Code.OK && message) {
            log.debug(`${method} message`, message.toObject());
            resolve(message as TRes);
          } else if (status === grpc.Code.Unauthenticated) {
            reject(new AuthenticationError(statusMessage));
          } else {
            reject(new Error(statusMessage));
          }
          log.debug(`${method} trailers`, trailers);
        },
      });
    });
  }

  /**
   * Subscribes to a GRPC server-streaming endpoint and executes the `onMessage` handler
   * when a new message is received from the server
   * @param methodDescriptor the GRPC method to call on the service
   * @param request the GRPC request message to send
   * @param onMessage the callback function to execute when a new message is received
   * @param metadata headers to include with the request
   */
  subscribe<TReq extends ProtobufMessage, TRes extends ProtobufMessage>(
    methodDescriptor: MethodDefinition<TReq, TRes>,
    request: TReq,
    onMessage: (res: TRes) => void,
    metadata?: Metadata.ConstructorArg,
  ) {
    if (this.useSampleData) return;

    const method = `${methodDescriptor.methodName}`;
    const client = grpc.client(methodDescriptor, {
      host: DEV_HOST,
      transport: grpc.WebsocketTransport(),
    });
    client.onHeaders(headers => {
      log.debug(`${method} - headers`, headers);
    });
    client.onMessage(message => {
      log.debug(`${method} - message`, message.toObject());
      onMessage(message as TRes);
    });
    client.onEnd((status, statusMessage, trailers) => {
      log.debug(`${method} - status`, status, statusMessage);
      log.debug(`${method} - trailers`, trailers);
    });
    client.start(metadata);
    client.send(request);
  }
}

export default GrpcClient;
