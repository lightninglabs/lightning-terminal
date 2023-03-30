// package: looprpc
// file: swapserverrpc/server.proto

import * as swapserverrpc_server_pb from "../swapserverrpc/server_pb";
import {grpc} from "@improbable-eng/grpc-web";

type SwapServerLoopOutTerms = {
  readonly methodName: string;
  readonly service: typeof SwapServer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof swapserverrpc_server_pb.ServerLoopOutTermsRequest;
  readonly responseType: typeof swapserverrpc_server_pb.ServerLoopOutTerms;
};

type SwapServerNewLoopOutSwap = {
  readonly methodName: string;
  readonly service: typeof SwapServer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof swapserverrpc_server_pb.ServerLoopOutRequest;
  readonly responseType: typeof swapserverrpc_server_pb.ServerLoopOutResponse;
};

type SwapServerLoopOutPushPreimage = {
  readonly methodName: string;
  readonly service: typeof SwapServer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof swapserverrpc_server_pb.ServerLoopOutPushPreimageRequest;
  readonly responseType: typeof swapserverrpc_server_pb.ServerLoopOutPushPreimageResponse;
};

type SwapServerLoopOutQuote = {
  readonly methodName: string;
  readonly service: typeof SwapServer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof swapserverrpc_server_pb.ServerLoopOutQuoteRequest;
  readonly responseType: typeof swapserverrpc_server_pb.ServerLoopOutQuote;
};

type SwapServerLoopInTerms = {
  readonly methodName: string;
  readonly service: typeof SwapServer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof swapserverrpc_server_pb.ServerLoopInTermsRequest;
  readonly responseType: typeof swapserverrpc_server_pb.ServerLoopInTerms;
};

type SwapServerNewLoopInSwap = {
  readonly methodName: string;
  readonly service: typeof SwapServer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof swapserverrpc_server_pb.ServerLoopInRequest;
  readonly responseType: typeof swapserverrpc_server_pb.ServerLoopInResponse;
};

type SwapServerLoopInQuote = {
  readonly methodName: string;
  readonly service: typeof SwapServer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof swapserverrpc_server_pb.ServerLoopInQuoteRequest;
  readonly responseType: typeof swapserverrpc_server_pb.ServerLoopInQuoteResponse;
};

type SwapServerSubscribeLoopOutUpdates = {
  readonly methodName: string;
  readonly service: typeof SwapServer;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof swapserverrpc_server_pb.SubscribeUpdatesRequest;
  readonly responseType: typeof swapserverrpc_server_pb.SubscribeLoopOutUpdatesResponse;
};

type SwapServerSubscribeLoopInUpdates = {
  readonly methodName: string;
  readonly service: typeof SwapServer;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof swapserverrpc_server_pb.SubscribeUpdatesRequest;
  readonly responseType: typeof swapserverrpc_server_pb.SubscribeLoopInUpdatesResponse;
};

type SwapServerCancelLoopOutSwap = {
  readonly methodName: string;
  readonly service: typeof SwapServer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof swapserverrpc_server_pb.CancelLoopOutSwapRequest;
  readonly responseType: typeof swapserverrpc_server_pb.CancelLoopOutSwapResponse;
};

type SwapServerProbe = {
  readonly methodName: string;
  readonly service: typeof SwapServer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof swapserverrpc_server_pb.ServerProbeRequest;
  readonly responseType: typeof swapserverrpc_server_pb.ServerProbeResponse;
};

type SwapServerRecommendRoutingPlugin = {
  readonly methodName: string;
  readonly service: typeof SwapServer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof swapserverrpc_server_pb.RecommendRoutingPluginReq;
  readonly responseType: typeof swapserverrpc_server_pb.RecommendRoutingPluginRes;
};

type SwapServerReportRoutingResult = {
  readonly methodName: string;
  readonly service: typeof SwapServer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof swapserverrpc_server_pb.ReportRoutingResultReq;
  readonly responseType: typeof swapserverrpc_server_pb.ReportRoutingResultRes;
};

type SwapServerMuSig2SignSweep = {
  readonly methodName: string;
  readonly service: typeof SwapServer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof swapserverrpc_server_pb.MuSig2SignSweepReq;
  readonly responseType: typeof swapserverrpc_server_pb.MuSig2SignSweepRes;
};

type SwapServerPushKey = {
  readonly methodName: string;
  readonly service: typeof SwapServer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof swapserverrpc_server_pb.ServerPushKeyReq;
  readonly responseType: typeof swapserverrpc_server_pb.ServerPushKeyRes;
};

export class SwapServer {
  static readonly serviceName: string;
  static readonly LoopOutTerms: SwapServerLoopOutTerms;
  static readonly NewLoopOutSwap: SwapServerNewLoopOutSwap;
  static readonly LoopOutPushPreimage: SwapServerLoopOutPushPreimage;
  static readonly LoopOutQuote: SwapServerLoopOutQuote;
  static readonly LoopInTerms: SwapServerLoopInTerms;
  static readonly NewLoopInSwap: SwapServerNewLoopInSwap;
  static readonly LoopInQuote: SwapServerLoopInQuote;
  static readonly SubscribeLoopOutUpdates: SwapServerSubscribeLoopOutUpdates;
  static readonly SubscribeLoopInUpdates: SwapServerSubscribeLoopInUpdates;
  static readonly CancelLoopOutSwap: SwapServerCancelLoopOutSwap;
  static readonly Probe: SwapServerProbe;
  static readonly RecommendRoutingPlugin: SwapServerRecommendRoutingPlugin;
  static readonly ReportRoutingResult: SwapServerReportRoutingResult;
  static readonly MuSig2SignSweep: SwapServerMuSig2SignSweep;
  static readonly PushKey: SwapServerPushKey;
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

export class SwapServerClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  loopOutTerms(
    requestMessage: swapserverrpc_server_pb.ServerLoopOutTermsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_server_pb.ServerLoopOutTerms|null) => void
  ): UnaryResponse;
  loopOutTerms(
    requestMessage: swapserverrpc_server_pb.ServerLoopOutTermsRequest,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_server_pb.ServerLoopOutTerms|null) => void
  ): UnaryResponse;
  newLoopOutSwap(
    requestMessage: swapserverrpc_server_pb.ServerLoopOutRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_server_pb.ServerLoopOutResponse|null) => void
  ): UnaryResponse;
  newLoopOutSwap(
    requestMessage: swapserverrpc_server_pb.ServerLoopOutRequest,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_server_pb.ServerLoopOutResponse|null) => void
  ): UnaryResponse;
  loopOutPushPreimage(
    requestMessage: swapserverrpc_server_pb.ServerLoopOutPushPreimageRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_server_pb.ServerLoopOutPushPreimageResponse|null) => void
  ): UnaryResponse;
  loopOutPushPreimage(
    requestMessage: swapserverrpc_server_pb.ServerLoopOutPushPreimageRequest,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_server_pb.ServerLoopOutPushPreimageResponse|null) => void
  ): UnaryResponse;
  loopOutQuote(
    requestMessage: swapserverrpc_server_pb.ServerLoopOutQuoteRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_server_pb.ServerLoopOutQuote|null) => void
  ): UnaryResponse;
  loopOutQuote(
    requestMessage: swapserverrpc_server_pb.ServerLoopOutQuoteRequest,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_server_pb.ServerLoopOutQuote|null) => void
  ): UnaryResponse;
  loopInTerms(
    requestMessage: swapserverrpc_server_pb.ServerLoopInTermsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_server_pb.ServerLoopInTerms|null) => void
  ): UnaryResponse;
  loopInTerms(
    requestMessage: swapserverrpc_server_pb.ServerLoopInTermsRequest,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_server_pb.ServerLoopInTerms|null) => void
  ): UnaryResponse;
  newLoopInSwap(
    requestMessage: swapserverrpc_server_pb.ServerLoopInRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_server_pb.ServerLoopInResponse|null) => void
  ): UnaryResponse;
  newLoopInSwap(
    requestMessage: swapserverrpc_server_pb.ServerLoopInRequest,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_server_pb.ServerLoopInResponse|null) => void
  ): UnaryResponse;
  loopInQuote(
    requestMessage: swapserverrpc_server_pb.ServerLoopInQuoteRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_server_pb.ServerLoopInQuoteResponse|null) => void
  ): UnaryResponse;
  loopInQuote(
    requestMessage: swapserverrpc_server_pb.ServerLoopInQuoteRequest,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_server_pb.ServerLoopInQuoteResponse|null) => void
  ): UnaryResponse;
  subscribeLoopOutUpdates(requestMessage: swapserverrpc_server_pb.SubscribeUpdatesRequest, metadata?: grpc.Metadata): ResponseStream<swapserverrpc_server_pb.SubscribeLoopOutUpdatesResponse>;
  subscribeLoopInUpdates(requestMessage: swapserverrpc_server_pb.SubscribeUpdatesRequest, metadata?: grpc.Metadata): ResponseStream<swapserverrpc_server_pb.SubscribeLoopInUpdatesResponse>;
  cancelLoopOutSwap(
    requestMessage: swapserverrpc_server_pb.CancelLoopOutSwapRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_server_pb.CancelLoopOutSwapResponse|null) => void
  ): UnaryResponse;
  cancelLoopOutSwap(
    requestMessage: swapserverrpc_server_pb.CancelLoopOutSwapRequest,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_server_pb.CancelLoopOutSwapResponse|null) => void
  ): UnaryResponse;
  probe(
    requestMessage: swapserverrpc_server_pb.ServerProbeRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_server_pb.ServerProbeResponse|null) => void
  ): UnaryResponse;
  probe(
    requestMessage: swapserverrpc_server_pb.ServerProbeRequest,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_server_pb.ServerProbeResponse|null) => void
  ): UnaryResponse;
  recommendRoutingPlugin(
    requestMessage: swapserverrpc_server_pb.RecommendRoutingPluginReq,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_server_pb.RecommendRoutingPluginRes|null) => void
  ): UnaryResponse;
  recommendRoutingPlugin(
    requestMessage: swapserverrpc_server_pb.RecommendRoutingPluginReq,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_server_pb.RecommendRoutingPluginRes|null) => void
  ): UnaryResponse;
  reportRoutingResult(
    requestMessage: swapserverrpc_server_pb.ReportRoutingResultReq,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_server_pb.ReportRoutingResultRes|null) => void
  ): UnaryResponse;
  reportRoutingResult(
    requestMessage: swapserverrpc_server_pb.ReportRoutingResultReq,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_server_pb.ReportRoutingResultRes|null) => void
  ): UnaryResponse;
  muSig2SignSweep(
    requestMessage: swapserverrpc_server_pb.MuSig2SignSweepReq,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_server_pb.MuSig2SignSweepRes|null) => void
  ): UnaryResponse;
  muSig2SignSweep(
    requestMessage: swapserverrpc_server_pb.MuSig2SignSweepReq,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_server_pb.MuSig2SignSweepRes|null) => void
  ): UnaryResponse;
  pushKey(
    requestMessage: swapserverrpc_server_pb.ServerPushKeyReq,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_server_pb.ServerPushKeyRes|null) => void
  ): UnaryResponse;
  pushKey(
    requestMessage: swapserverrpc_server_pb.ServerPushKeyReq,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_server_pb.ServerPushKeyRes|null) => void
  ): UnaryResponse;
}

