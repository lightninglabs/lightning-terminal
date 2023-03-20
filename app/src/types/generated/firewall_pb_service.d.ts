// package: litrpc
// file: firewall.proto

import * as firewall_pb from "./firewall_pb";
import {grpc} from "@improbable-eng/grpc-web";

type FirewallListActions = {
  readonly methodName: string;
  readonly service: typeof Firewall;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof firewall_pb.ListActionsRequest;
  readonly responseType: typeof firewall_pb.ListActionsResponse;
};

type FirewallPrivacyMapConversion = {
  readonly methodName: string;
  readonly service: typeof Firewall;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof firewall_pb.PrivacyMapConversionRequest;
  readonly responseType: typeof firewall_pb.PrivacyMapConversionResponse;
};

export class Firewall {
  static readonly serviceName: string;
  static readonly ListActions: FirewallListActions;
  static readonly PrivacyMapConversion: FirewallPrivacyMapConversion;
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

export class FirewallClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  listActions(
    requestMessage: firewall_pb.ListActionsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: firewall_pb.ListActionsResponse|null) => void
  ): UnaryResponse;
  listActions(
    requestMessage: firewall_pb.ListActionsRequest,
    callback: (error: ServiceError|null, responseMessage: firewall_pb.ListActionsResponse|null) => void
  ): UnaryResponse;
  privacyMapConversion(
    requestMessage: firewall_pb.PrivacyMapConversionRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: firewall_pb.PrivacyMapConversionResponse|null) => void
  ): UnaryResponse;
  privacyMapConversion(
    requestMessage: firewall_pb.PrivacyMapConversionRequest,
    callback: (error: ServiceError|null, responseMessage: firewall_pb.PrivacyMapConversionResponse|null) => void
  ): UnaryResponse;
}

