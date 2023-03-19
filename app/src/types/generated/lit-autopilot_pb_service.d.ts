// package: litrpc
// file: lit-autopilot.proto

import * as lit_autopilot_pb from "./lit-autopilot_pb";
import {grpc} from "@improbable-eng/grpc-web";

type AutopilotListAutopilotFeatures = {
  readonly methodName: string;
  readonly service: typeof Autopilot;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lit_autopilot_pb.ListAutopilotFeaturesRequest;
  readonly responseType: typeof lit_autopilot_pb.ListAutopilotFeaturesResponse;
};

type AutopilotAddAutopilotSession = {
  readonly methodName: string;
  readonly service: typeof Autopilot;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lit_autopilot_pb.AddAutopilotSessionRequest;
  readonly responseType: typeof lit_autopilot_pb.AddAutopilotSessionResponse;
};

type AutopilotListAutopilotSessions = {
  readonly methodName: string;
  readonly service: typeof Autopilot;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lit_autopilot_pb.ListAutopilotSessionsRequest;
  readonly responseType: typeof lit_autopilot_pb.ListAutopilotSessionsResponse;
};

type AutopilotRevokeAutopilotSession = {
  readonly methodName: string;
  readonly service: typeof Autopilot;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lit_autopilot_pb.RevokeAutopilotSessionRequest;
  readonly responseType: typeof lit_autopilot_pb.RevokeAutopilotSessionResponse;
};

export class Autopilot {
  static readonly serviceName: string;
  static readonly ListAutopilotFeatures: AutopilotListAutopilotFeatures;
  static readonly AddAutopilotSession: AutopilotAddAutopilotSession;
  static readonly ListAutopilotSessions: AutopilotListAutopilotSessions;
  static readonly RevokeAutopilotSession: AutopilotRevokeAutopilotSession;
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

export class AutopilotClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  listAutopilotFeatures(
    requestMessage: lit_autopilot_pb.ListAutopilotFeaturesRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lit_autopilot_pb.ListAutopilotFeaturesResponse|null) => void
  ): UnaryResponse;
  listAutopilotFeatures(
    requestMessage: lit_autopilot_pb.ListAutopilotFeaturesRequest,
    callback: (error: ServiceError|null, responseMessage: lit_autopilot_pb.ListAutopilotFeaturesResponse|null) => void
  ): UnaryResponse;
  addAutopilotSession(
    requestMessage: lit_autopilot_pb.AddAutopilotSessionRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lit_autopilot_pb.AddAutopilotSessionResponse|null) => void
  ): UnaryResponse;
  addAutopilotSession(
    requestMessage: lit_autopilot_pb.AddAutopilotSessionRequest,
    callback: (error: ServiceError|null, responseMessage: lit_autopilot_pb.AddAutopilotSessionResponse|null) => void
  ): UnaryResponse;
  listAutopilotSessions(
    requestMessage: lit_autopilot_pb.ListAutopilotSessionsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lit_autopilot_pb.ListAutopilotSessionsResponse|null) => void
  ): UnaryResponse;
  listAutopilotSessions(
    requestMessage: lit_autopilot_pb.ListAutopilotSessionsRequest,
    callback: (error: ServiceError|null, responseMessage: lit_autopilot_pb.ListAutopilotSessionsResponse|null) => void
  ): UnaryResponse;
  revokeAutopilotSession(
    requestMessage: lit_autopilot_pb.RevokeAutopilotSessionRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lit_autopilot_pb.RevokeAutopilotSessionResponse|null) => void
  ): UnaryResponse;
  revokeAutopilotSession(
    requestMessage: lit_autopilot_pb.RevokeAutopilotSessionRequest,
    callback: (error: ServiceError|null, responseMessage: lit_autopilot_pb.RevokeAutopilotSessionResponse|null) => void
  ): UnaryResponse;
}

