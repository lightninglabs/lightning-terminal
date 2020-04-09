// package: looprpc
// file: loop.proto

import * as loop_pb from "./loop_pb";
import {grpc} from "@improbable-eng/grpc-web";

type SwapClientLoopOut = {
  readonly methodName: string;
  readonly service: typeof SwapClient;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof loop_pb.LoopOutRequest;
  readonly responseType: typeof loop_pb.SwapResponse;
};

type SwapClientLoopIn = {
  readonly methodName: string;
  readonly service: typeof SwapClient;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof loop_pb.LoopInRequest;
  readonly responseType: typeof loop_pb.SwapResponse;
};

type SwapClientMonitor = {
  readonly methodName: string;
  readonly service: typeof SwapClient;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof loop_pb.MonitorRequest;
  readonly responseType: typeof loop_pb.SwapStatus;
};

type SwapClientListSwaps = {
  readonly methodName: string;
  readonly service: typeof SwapClient;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof loop_pb.ListSwapsRequest;
  readonly responseType: typeof loop_pb.ListSwapsResponse;
};

type SwapClientSwapInfo = {
  readonly methodName: string;
  readonly service: typeof SwapClient;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof loop_pb.SwapInfoRequest;
  readonly responseType: typeof loop_pb.SwapStatus;
};

type SwapClientLoopOutTerms = {
  readonly methodName: string;
  readonly service: typeof SwapClient;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof loop_pb.TermsRequest;
  readonly responseType: typeof loop_pb.TermsResponse;
};

type SwapClientLoopOutQuote = {
  readonly methodName: string;
  readonly service: typeof SwapClient;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof loop_pb.QuoteRequest;
  readonly responseType: typeof loop_pb.QuoteResponse;
};

type SwapClientGetLoopInTerms = {
  readonly methodName: string;
  readonly service: typeof SwapClient;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof loop_pb.TermsRequest;
  readonly responseType: typeof loop_pb.TermsResponse;
};

type SwapClientGetLoopInQuote = {
  readonly methodName: string;
  readonly service: typeof SwapClient;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof loop_pb.QuoteRequest;
  readonly responseType: typeof loop_pb.QuoteResponse;
};

type SwapClientGetLsatTokens = {
  readonly methodName: string;
  readonly service: typeof SwapClient;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof loop_pb.TokensRequest;
  readonly responseType: typeof loop_pb.TokensResponse;
};

export class SwapClient {
  static readonly serviceName: string;
  static readonly LoopOut: SwapClientLoopOut;
  static readonly LoopIn: SwapClientLoopIn;
  static readonly Monitor: SwapClientMonitor;
  static readonly ListSwaps: SwapClientListSwaps;
  static readonly SwapInfo: SwapClientSwapInfo;
  static readonly LoopOutTerms: SwapClientLoopOutTerms;
  static readonly LoopOutQuote: SwapClientLoopOutQuote;
  static readonly GetLoopInTerms: SwapClientGetLoopInTerms;
  static readonly GetLoopInQuote: SwapClientGetLoopInQuote;
  static readonly GetLsatTokens: SwapClientGetLsatTokens;
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

export class SwapClientClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  loopOut(
    requestMessage: loop_pb.LoopOutRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: loop_pb.SwapResponse|null) => void
  ): UnaryResponse;
  loopOut(
    requestMessage: loop_pb.LoopOutRequest,
    callback: (error: ServiceError|null, responseMessage: loop_pb.SwapResponse|null) => void
  ): UnaryResponse;
  loopIn(
    requestMessage: loop_pb.LoopInRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: loop_pb.SwapResponse|null) => void
  ): UnaryResponse;
  loopIn(
    requestMessage: loop_pb.LoopInRequest,
    callback: (error: ServiceError|null, responseMessage: loop_pb.SwapResponse|null) => void
  ): UnaryResponse;
  monitor(requestMessage: loop_pb.MonitorRequest, metadata?: grpc.Metadata): ResponseStream<loop_pb.SwapStatus>;
  listSwaps(
    requestMessage: loop_pb.ListSwapsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: loop_pb.ListSwapsResponse|null) => void
  ): UnaryResponse;
  listSwaps(
    requestMessage: loop_pb.ListSwapsRequest,
    callback: (error: ServiceError|null, responseMessage: loop_pb.ListSwapsResponse|null) => void
  ): UnaryResponse;
  swapInfo(
    requestMessage: loop_pb.SwapInfoRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: loop_pb.SwapStatus|null) => void
  ): UnaryResponse;
  swapInfo(
    requestMessage: loop_pb.SwapInfoRequest,
    callback: (error: ServiceError|null, responseMessage: loop_pb.SwapStatus|null) => void
  ): UnaryResponse;
  loopOutTerms(
    requestMessage: loop_pb.TermsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: loop_pb.TermsResponse|null) => void
  ): UnaryResponse;
  loopOutTerms(
    requestMessage: loop_pb.TermsRequest,
    callback: (error: ServiceError|null, responseMessage: loop_pb.TermsResponse|null) => void
  ): UnaryResponse;
  loopOutQuote(
    requestMessage: loop_pb.QuoteRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: loop_pb.QuoteResponse|null) => void
  ): UnaryResponse;
  loopOutQuote(
    requestMessage: loop_pb.QuoteRequest,
    callback: (error: ServiceError|null, responseMessage: loop_pb.QuoteResponse|null) => void
  ): UnaryResponse;
  getLoopInTerms(
    requestMessage: loop_pb.TermsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: loop_pb.TermsResponse|null) => void
  ): UnaryResponse;
  getLoopInTerms(
    requestMessage: loop_pb.TermsRequest,
    callback: (error: ServiceError|null, responseMessage: loop_pb.TermsResponse|null) => void
  ): UnaryResponse;
  getLoopInQuote(
    requestMessage: loop_pb.QuoteRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: loop_pb.QuoteResponse|null) => void
  ): UnaryResponse;
  getLoopInQuote(
    requestMessage: loop_pb.QuoteRequest,
    callback: (error: ServiceError|null, responseMessage: loop_pb.QuoteResponse|null) => void
  ): UnaryResponse;
  getLsatTokens(
    requestMessage: loop_pb.TokensRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: loop_pb.TokensResponse|null) => void
  ): UnaryResponse;
  getLsatTokens(
    requestMessage: loop_pb.TokensRequest,
    callback: (error: ServiceError|null, responseMessage: loop_pb.TokensResponse|null) => void
  ): UnaryResponse;
}

