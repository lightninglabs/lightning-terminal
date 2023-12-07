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

type SwapClientAbandonSwap = {
  readonly methodName: string;
  readonly service: typeof SwapClient;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof loop_pb.AbandonSwapRequest;
  readonly responseType: typeof loop_pb.AbandonSwapResponse;
};

type SwapClientLoopOutTerms = {
  readonly methodName: string;
  readonly service: typeof SwapClient;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof loop_pb.TermsRequest;
  readonly responseType: typeof loop_pb.OutTermsResponse;
};

type SwapClientLoopOutQuote = {
  readonly methodName: string;
  readonly service: typeof SwapClient;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof loop_pb.QuoteRequest;
  readonly responseType: typeof loop_pb.OutQuoteResponse;
};

type SwapClientGetLoopInTerms = {
  readonly methodName: string;
  readonly service: typeof SwapClient;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof loop_pb.TermsRequest;
  readonly responseType: typeof loop_pb.InTermsResponse;
};

type SwapClientGetLoopInQuote = {
  readonly methodName: string;
  readonly service: typeof SwapClient;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof loop_pb.QuoteRequest;
  readonly responseType: typeof loop_pb.InQuoteResponse;
};

type SwapClientProbe = {
  readonly methodName: string;
  readonly service: typeof SwapClient;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof loop_pb.ProbeRequest;
  readonly responseType: typeof loop_pb.ProbeResponse;
};

type SwapClientGetLsatTokens = {
  readonly methodName: string;
  readonly service: typeof SwapClient;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof loop_pb.TokensRequest;
  readonly responseType: typeof loop_pb.TokensResponse;
};

type SwapClientGetInfo = {
  readonly methodName: string;
  readonly service: typeof SwapClient;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof loop_pb.GetInfoRequest;
  readonly responseType: typeof loop_pb.GetInfoResponse;
};

type SwapClientGetLiquidityParams = {
  readonly methodName: string;
  readonly service: typeof SwapClient;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof loop_pb.GetLiquidityParamsRequest;
  readonly responseType: typeof loop_pb.LiquidityParameters;
};

type SwapClientSetLiquidityParams = {
  readonly methodName: string;
  readonly service: typeof SwapClient;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof loop_pb.SetLiquidityParamsRequest;
  readonly responseType: typeof loop_pb.SetLiquidityParamsResponse;
};

type SwapClientSuggestSwaps = {
  readonly methodName: string;
  readonly service: typeof SwapClient;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof loop_pb.SuggestSwapsRequest;
  readonly responseType: typeof loop_pb.SuggestSwapsResponse;
};

export class SwapClient {
  static readonly serviceName: string;
  static readonly LoopOut: SwapClientLoopOut;
  static readonly LoopIn: SwapClientLoopIn;
  static readonly Monitor: SwapClientMonitor;
  static readonly ListSwaps: SwapClientListSwaps;
  static readonly SwapInfo: SwapClientSwapInfo;
  static readonly AbandonSwap: SwapClientAbandonSwap;
  static readonly LoopOutTerms: SwapClientLoopOutTerms;
  static readonly LoopOutQuote: SwapClientLoopOutQuote;
  static readonly GetLoopInTerms: SwapClientGetLoopInTerms;
  static readonly GetLoopInQuote: SwapClientGetLoopInQuote;
  static readonly Probe: SwapClientProbe;
  static readonly GetLsatTokens: SwapClientGetLsatTokens;
  static readonly GetInfo: SwapClientGetInfo;
  static readonly GetLiquidityParams: SwapClientGetLiquidityParams;
  static readonly SetLiquidityParams: SwapClientSetLiquidityParams;
  static readonly SuggestSwaps: SwapClientSuggestSwaps;
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
  abandonSwap(
    requestMessage: loop_pb.AbandonSwapRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: loop_pb.AbandonSwapResponse|null) => void
  ): UnaryResponse;
  abandonSwap(
    requestMessage: loop_pb.AbandonSwapRequest,
    callback: (error: ServiceError|null, responseMessage: loop_pb.AbandonSwapResponse|null) => void
  ): UnaryResponse;
  loopOutTerms(
    requestMessage: loop_pb.TermsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: loop_pb.OutTermsResponse|null) => void
  ): UnaryResponse;
  loopOutTerms(
    requestMessage: loop_pb.TermsRequest,
    callback: (error: ServiceError|null, responseMessage: loop_pb.OutTermsResponse|null) => void
  ): UnaryResponse;
  loopOutQuote(
    requestMessage: loop_pb.QuoteRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: loop_pb.OutQuoteResponse|null) => void
  ): UnaryResponse;
  loopOutQuote(
    requestMessage: loop_pb.QuoteRequest,
    callback: (error: ServiceError|null, responseMessage: loop_pb.OutQuoteResponse|null) => void
  ): UnaryResponse;
  getLoopInTerms(
    requestMessage: loop_pb.TermsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: loop_pb.InTermsResponse|null) => void
  ): UnaryResponse;
  getLoopInTerms(
    requestMessage: loop_pb.TermsRequest,
    callback: (error: ServiceError|null, responseMessage: loop_pb.InTermsResponse|null) => void
  ): UnaryResponse;
  getLoopInQuote(
    requestMessage: loop_pb.QuoteRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: loop_pb.InQuoteResponse|null) => void
  ): UnaryResponse;
  getLoopInQuote(
    requestMessage: loop_pb.QuoteRequest,
    callback: (error: ServiceError|null, responseMessage: loop_pb.InQuoteResponse|null) => void
  ): UnaryResponse;
  probe(
    requestMessage: loop_pb.ProbeRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: loop_pb.ProbeResponse|null) => void
  ): UnaryResponse;
  probe(
    requestMessage: loop_pb.ProbeRequest,
    callback: (error: ServiceError|null, responseMessage: loop_pb.ProbeResponse|null) => void
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
  getInfo(
    requestMessage: loop_pb.GetInfoRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: loop_pb.GetInfoResponse|null) => void
  ): UnaryResponse;
  getInfo(
    requestMessage: loop_pb.GetInfoRequest,
    callback: (error: ServiceError|null, responseMessage: loop_pb.GetInfoResponse|null) => void
  ): UnaryResponse;
  getLiquidityParams(
    requestMessage: loop_pb.GetLiquidityParamsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: loop_pb.LiquidityParameters|null) => void
  ): UnaryResponse;
  getLiquidityParams(
    requestMessage: loop_pb.GetLiquidityParamsRequest,
    callback: (error: ServiceError|null, responseMessage: loop_pb.LiquidityParameters|null) => void
  ): UnaryResponse;
  setLiquidityParams(
    requestMessage: loop_pb.SetLiquidityParamsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: loop_pb.SetLiquidityParamsResponse|null) => void
  ): UnaryResponse;
  setLiquidityParams(
    requestMessage: loop_pb.SetLiquidityParamsRequest,
    callback: (error: ServiceError|null, responseMessage: loop_pb.SetLiquidityParamsResponse|null) => void
  ): UnaryResponse;
  suggestSwaps(
    requestMessage: loop_pb.SuggestSwapsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: loop_pb.SuggestSwapsResponse|null) => void
  ): UnaryResponse;
  suggestSwaps(
    requestMessage: loop_pb.SuggestSwapsRequest,
    callback: (error: ServiceError|null, responseMessage: loop_pb.SuggestSwapsResponse|null) => void
  ): UnaryResponse;
}

