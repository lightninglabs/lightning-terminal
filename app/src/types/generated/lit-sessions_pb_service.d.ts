// package: litrpc
// file: lit-sessions.proto

import * as lit_sessions_pb from "./lit-sessions_pb";
import {grpc} from "@improbable-eng/grpc-web";

type SessionsAddSession = {
  readonly methodName: string;
  readonly service: typeof Sessions;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lit_sessions_pb.AddSessionRequest;
  readonly responseType: typeof lit_sessions_pb.AddSessionResponse;
};

type SessionsListSessions = {
  readonly methodName: string;
  readonly service: typeof Sessions;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lit_sessions_pb.ListSessionsRequest;
  readonly responseType: typeof lit_sessions_pb.ListSessionsResponse;
};

type SessionsRevokeSession = {
  readonly methodName: string;
  readonly service: typeof Sessions;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lit_sessions_pb.RevokeSessionRequest;
  readonly responseType: typeof lit_sessions_pb.RevokeSessionResponse;
};

export class Sessions {
  static readonly serviceName: string;
  static readonly AddSession: SessionsAddSession;
  static readonly ListSessions: SessionsListSessions;
  static readonly RevokeSession: SessionsRevokeSession;
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

export class SessionsClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  addSession(
    requestMessage: lit_sessions_pb.AddSessionRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lit_sessions_pb.AddSessionResponse|null) => void
  ): UnaryResponse;
  addSession(
    requestMessage: lit_sessions_pb.AddSessionRequest,
    callback: (error: ServiceError|null, responseMessage: lit_sessions_pb.AddSessionResponse|null) => void
  ): UnaryResponse;
  listSessions(
    requestMessage: lit_sessions_pb.ListSessionsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lit_sessions_pb.ListSessionsResponse|null) => void
  ): UnaryResponse;
  listSessions(
    requestMessage: lit_sessions_pb.ListSessionsRequest,
    callback: (error: ServiceError|null, responseMessage: lit_sessions_pb.ListSessionsResponse|null) => void
  ): UnaryResponse;
  revokeSession(
    requestMessage: lit_sessions_pb.RevokeSessionRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lit_sessions_pb.RevokeSessionResponse|null) => void
  ): UnaryResponse;
  revokeSession(
    requestMessage: lit_sessions_pb.RevokeSessionRequest,
    callback: (error: ServiceError|null, responseMessage: lit_sessions_pb.RevokeSessionResponse|null) => void
  ): UnaryResponse;
}

