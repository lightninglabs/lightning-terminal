// package: litrpc
// file: proxy.proto

import * as proxy_pb from "./proxy_pb";
import {grpc} from "@improbable-eng/grpc-web";

type ProxyGetInfo = {
  readonly methodName: string;
  readonly service: typeof Proxy;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof proxy_pb.GetInfoRequest;
  readonly responseType: typeof proxy_pb.GetInfoResponse;
};

type ProxyStopDaemon = {
  readonly methodName: string;
  readonly service: typeof Proxy;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof proxy_pb.StopDaemonRequest;
  readonly responseType: typeof proxy_pb.StopDaemonResponse;
};

type ProxyBakeSuperMacaroon = {
  readonly methodName: string;
  readonly service: typeof Proxy;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof proxy_pb.BakeSuperMacaroonRequest;
  readonly responseType: typeof proxy_pb.BakeSuperMacaroonResponse;
};

export class Proxy {
  static readonly serviceName: string;
  static readonly GetInfo: ProxyGetInfo;
  static readonly StopDaemon: ProxyStopDaemon;
  static readonly BakeSuperMacaroon: ProxyBakeSuperMacaroon;
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

export class ProxyClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  getInfo(
    requestMessage: proxy_pb.GetInfoRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: proxy_pb.GetInfoResponse|null) => void
  ): UnaryResponse;
  getInfo(
    requestMessage: proxy_pb.GetInfoRequest,
    callback: (error: ServiceError|null, responseMessage: proxy_pb.GetInfoResponse|null) => void
  ): UnaryResponse;
  stopDaemon(
    requestMessage: proxy_pb.StopDaemonRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: proxy_pb.StopDaemonResponse|null) => void
  ): UnaryResponse;
  stopDaemon(
    requestMessage: proxy_pb.StopDaemonRequest,
    callback: (error: ServiceError|null, responseMessage: proxy_pb.StopDaemonResponse|null) => void
  ): UnaryResponse;
  bakeSuperMacaroon(
    requestMessage: proxy_pb.BakeSuperMacaroonRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: proxy_pb.BakeSuperMacaroonResponse|null) => void
  ): UnaryResponse;
  bakeSuperMacaroon(
    requestMessage: proxy_pb.BakeSuperMacaroonRequest,
    callback: (error: ServiceError|null, responseMessage: proxy_pb.BakeSuperMacaroonResponse|null) => void
  ): UnaryResponse;
}

