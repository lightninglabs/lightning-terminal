// package: litrpc
// file: lit-status.proto

import * as lit_status_pb from "./lit-status_pb";
import {grpc} from "@improbable-eng/grpc-web";

type StatusSubServerStatus = {
  readonly methodName: string;
  readonly service: typeof Status;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lit_status_pb.SubServerStatusReq;
  readonly responseType: typeof lit_status_pb.SubServerStatusResp;
};

export class Status {
  static readonly serviceName: string;
  static readonly SubServerStatus: StatusSubServerStatus;
}

export type ServiceError = { message: string, code: number; metadata: grpc.Metadata }
export type Status = { details: string, code: number; metadata: grpc.Metadata }

interface UnaryResponse {
  cancel(): void;
}
interface ResponseStream<T> {
  cancel(): void;
  on(type: 'data', handler: (message: T) => void): ResponseStream<T>;
  on(type: 'end', handler: (status?: Status) => void): ResponseStream<T>;
  on(type: 'status', handler: (status: Status) => void): ResponseStream<T>;
}
interface RequestStream<T> {
  write(message: T): RequestStream<T>;
  end(): void;
  cancel(): void;
  on(type: 'end', handler: (status?: Status) => void): RequestStream<T>;
  on(type: 'status', handler: (status: Status) => void): RequestStream<T>;
}
interface BidirectionalStream<ReqT, ResT> {
  write(message: ReqT): BidirectionalStream<ReqT, ResT>;
  end(): void;
  cancel(): void;
  on(type: 'data', handler: (message: ResT) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'end', handler: (status?: Status) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'status', handler: (status: Status) => void): BidirectionalStream<ReqT, ResT>;
}

export class StatusClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  subServerStatus(
    requestMessage: lit_status_pb.SubServerStatusReq,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lit_status_pb.SubServerStatusResp|null) => void
  ): UnaryResponse;
  subServerStatus(
    requestMessage: lit_status_pb.SubServerStatusReq,
    callback: (error: ServiceError|null, responseMessage: lit_status_pb.SubServerStatusResp|null) => void
  ): UnaryResponse;
}

