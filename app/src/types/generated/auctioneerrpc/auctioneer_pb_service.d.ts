// package: poolrpc
// file: auctioneerrpc/auctioneer.proto

import * as auctioneerrpc_auctioneer_pb from "../auctioneerrpc/auctioneer_pb";
import {grpc} from "@improbable-eng/grpc-web";

type ChannelAuctioneerReserveAccount = {
  readonly methodName: string;
  readonly service: typeof ChannelAuctioneer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof auctioneerrpc_auctioneer_pb.ReserveAccountRequest;
  readonly responseType: typeof auctioneerrpc_auctioneer_pb.ReserveAccountResponse;
};

type ChannelAuctioneerInitAccount = {
  readonly methodName: string;
  readonly service: typeof ChannelAuctioneer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof auctioneerrpc_auctioneer_pb.ServerInitAccountRequest;
  readonly responseType: typeof auctioneerrpc_auctioneer_pb.ServerInitAccountResponse;
};

type ChannelAuctioneerModifyAccount = {
  readonly methodName: string;
  readonly service: typeof ChannelAuctioneer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof auctioneerrpc_auctioneer_pb.ServerModifyAccountRequest;
  readonly responseType: typeof auctioneerrpc_auctioneer_pb.ServerModifyAccountResponse;
};

type ChannelAuctioneerSubmitOrder = {
  readonly methodName: string;
  readonly service: typeof ChannelAuctioneer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof auctioneerrpc_auctioneer_pb.ServerSubmitOrderRequest;
  readonly responseType: typeof auctioneerrpc_auctioneer_pb.ServerSubmitOrderResponse;
};

type ChannelAuctioneerCancelOrder = {
  readonly methodName: string;
  readonly service: typeof ChannelAuctioneer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof auctioneerrpc_auctioneer_pb.ServerCancelOrderRequest;
  readonly responseType: typeof auctioneerrpc_auctioneer_pb.ServerCancelOrderResponse;
};

type ChannelAuctioneerOrderState = {
  readonly methodName: string;
  readonly service: typeof ChannelAuctioneer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof auctioneerrpc_auctioneer_pb.ServerOrderStateRequest;
  readonly responseType: typeof auctioneerrpc_auctioneer_pb.ServerOrderStateResponse;
};

type ChannelAuctioneerSubscribeBatchAuction = {
  readonly methodName: string;
  readonly service: typeof ChannelAuctioneer;
  readonly requestStream: true;
  readonly responseStream: true;
  readonly requestType: typeof auctioneerrpc_auctioneer_pb.ClientAuctionMessage;
  readonly responseType: typeof auctioneerrpc_auctioneer_pb.ServerAuctionMessage;
};

type ChannelAuctioneerSubscribeSidecar = {
  readonly methodName: string;
  readonly service: typeof ChannelAuctioneer;
  readonly requestStream: true;
  readonly responseStream: true;
  readonly requestType: typeof auctioneerrpc_auctioneer_pb.ClientAuctionMessage;
  readonly responseType: typeof auctioneerrpc_auctioneer_pb.ServerAuctionMessage;
};

type ChannelAuctioneerTerms = {
  readonly methodName: string;
  readonly service: typeof ChannelAuctioneer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof auctioneerrpc_auctioneer_pb.TermsRequest;
  readonly responseType: typeof auctioneerrpc_auctioneer_pb.TermsResponse;
};

type ChannelAuctioneerRelevantBatchSnapshot = {
  readonly methodName: string;
  readonly service: typeof ChannelAuctioneer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof auctioneerrpc_auctioneer_pb.RelevantBatchRequest;
  readonly responseType: typeof auctioneerrpc_auctioneer_pb.RelevantBatch;
};

type ChannelAuctioneerBatchSnapshot = {
  readonly methodName: string;
  readonly service: typeof ChannelAuctioneer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof auctioneerrpc_auctioneer_pb.BatchSnapshotRequest;
  readonly responseType: typeof auctioneerrpc_auctioneer_pb.BatchSnapshotResponse;
};

type ChannelAuctioneerNodeRating = {
  readonly methodName: string;
  readonly service: typeof ChannelAuctioneer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof auctioneerrpc_auctioneer_pb.ServerNodeRatingRequest;
  readonly responseType: typeof auctioneerrpc_auctioneer_pb.ServerNodeRatingResponse;
};

type ChannelAuctioneerBatchSnapshots = {
  readonly methodName: string;
  readonly service: typeof ChannelAuctioneer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof auctioneerrpc_auctioneer_pb.BatchSnapshotsRequest;
  readonly responseType: typeof auctioneerrpc_auctioneer_pb.BatchSnapshotsResponse;
};

type ChannelAuctioneerMarketInfo = {
  readonly methodName: string;
  readonly service: typeof ChannelAuctioneer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof auctioneerrpc_auctioneer_pb.MarketInfoRequest;
  readonly responseType: typeof auctioneerrpc_auctioneer_pb.MarketInfoResponse;
};

export class ChannelAuctioneer {
  static readonly serviceName: string;
  static readonly ReserveAccount: ChannelAuctioneerReserveAccount;
  static readonly InitAccount: ChannelAuctioneerInitAccount;
  static readonly ModifyAccount: ChannelAuctioneerModifyAccount;
  static readonly SubmitOrder: ChannelAuctioneerSubmitOrder;
  static readonly CancelOrder: ChannelAuctioneerCancelOrder;
  static readonly OrderState: ChannelAuctioneerOrderState;
  static readonly SubscribeBatchAuction: ChannelAuctioneerSubscribeBatchAuction;
  static readonly SubscribeSidecar: ChannelAuctioneerSubscribeSidecar;
  static readonly Terms: ChannelAuctioneerTerms;
  static readonly RelevantBatchSnapshot: ChannelAuctioneerRelevantBatchSnapshot;
  static readonly BatchSnapshot: ChannelAuctioneerBatchSnapshot;
  static readonly NodeRating: ChannelAuctioneerNodeRating;
  static readonly BatchSnapshots: ChannelAuctioneerBatchSnapshots;
  static readonly MarketInfo: ChannelAuctioneerMarketInfo;
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

export class ChannelAuctioneerClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  reserveAccount(
    requestMessage: auctioneerrpc_auctioneer_pb.ReserveAccountRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: auctioneerrpc_auctioneer_pb.ReserveAccountResponse|null) => void
  ): UnaryResponse;
  reserveAccount(
    requestMessage: auctioneerrpc_auctioneer_pb.ReserveAccountRequest,
    callback: (error: ServiceError|null, responseMessage: auctioneerrpc_auctioneer_pb.ReserveAccountResponse|null) => void
  ): UnaryResponse;
  initAccount(
    requestMessage: auctioneerrpc_auctioneer_pb.ServerInitAccountRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: auctioneerrpc_auctioneer_pb.ServerInitAccountResponse|null) => void
  ): UnaryResponse;
  initAccount(
    requestMessage: auctioneerrpc_auctioneer_pb.ServerInitAccountRequest,
    callback: (error: ServiceError|null, responseMessage: auctioneerrpc_auctioneer_pb.ServerInitAccountResponse|null) => void
  ): UnaryResponse;
  modifyAccount(
    requestMessage: auctioneerrpc_auctioneer_pb.ServerModifyAccountRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: auctioneerrpc_auctioneer_pb.ServerModifyAccountResponse|null) => void
  ): UnaryResponse;
  modifyAccount(
    requestMessage: auctioneerrpc_auctioneer_pb.ServerModifyAccountRequest,
    callback: (error: ServiceError|null, responseMessage: auctioneerrpc_auctioneer_pb.ServerModifyAccountResponse|null) => void
  ): UnaryResponse;
  submitOrder(
    requestMessage: auctioneerrpc_auctioneer_pb.ServerSubmitOrderRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: auctioneerrpc_auctioneer_pb.ServerSubmitOrderResponse|null) => void
  ): UnaryResponse;
  submitOrder(
    requestMessage: auctioneerrpc_auctioneer_pb.ServerSubmitOrderRequest,
    callback: (error: ServiceError|null, responseMessage: auctioneerrpc_auctioneer_pb.ServerSubmitOrderResponse|null) => void
  ): UnaryResponse;
  cancelOrder(
    requestMessage: auctioneerrpc_auctioneer_pb.ServerCancelOrderRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: auctioneerrpc_auctioneer_pb.ServerCancelOrderResponse|null) => void
  ): UnaryResponse;
  cancelOrder(
    requestMessage: auctioneerrpc_auctioneer_pb.ServerCancelOrderRequest,
    callback: (error: ServiceError|null, responseMessage: auctioneerrpc_auctioneer_pb.ServerCancelOrderResponse|null) => void
  ): UnaryResponse;
  orderState(
    requestMessage: auctioneerrpc_auctioneer_pb.ServerOrderStateRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: auctioneerrpc_auctioneer_pb.ServerOrderStateResponse|null) => void
  ): UnaryResponse;
  orderState(
    requestMessage: auctioneerrpc_auctioneer_pb.ServerOrderStateRequest,
    callback: (error: ServiceError|null, responseMessage: auctioneerrpc_auctioneer_pb.ServerOrderStateResponse|null) => void
  ): UnaryResponse;
  subscribeBatchAuction(metadata?: grpc.Metadata): BidirectionalStream<auctioneerrpc_auctioneer_pb.ClientAuctionMessage, auctioneerrpc_auctioneer_pb.ServerAuctionMessage>;
  subscribeSidecar(metadata?: grpc.Metadata): BidirectionalStream<auctioneerrpc_auctioneer_pb.ClientAuctionMessage, auctioneerrpc_auctioneer_pb.ServerAuctionMessage>;
  terms(
    requestMessage: auctioneerrpc_auctioneer_pb.TermsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: auctioneerrpc_auctioneer_pb.TermsResponse|null) => void
  ): UnaryResponse;
  terms(
    requestMessage: auctioneerrpc_auctioneer_pb.TermsRequest,
    callback: (error: ServiceError|null, responseMessage: auctioneerrpc_auctioneer_pb.TermsResponse|null) => void
  ): UnaryResponse;
  relevantBatchSnapshot(
    requestMessage: auctioneerrpc_auctioneer_pb.RelevantBatchRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: auctioneerrpc_auctioneer_pb.RelevantBatch|null) => void
  ): UnaryResponse;
  relevantBatchSnapshot(
    requestMessage: auctioneerrpc_auctioneer_pb.RelevantBatchRequest,
    callback: (error: ServiceError|null, responseMessage: auctioneerrpc_auctioneer_pb.RelevantBatch|null) => void
  ): UnaryResponse;
  batchSnapshot(
    requestMessage: auctioneerrpc_auctioneer_pb.BatchSnapshotRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: auctioneerrpc_auctioneer_pb.BatchSnapshotResponse|null) => void
  ): UnaryResponse;
  batchSnapshot(
    requestMessage: auctioneerrpc_auctioneer_pb.BatchSnapshotRequest,
    callback: (error: ServiceError|null, responseMessage: auctioneerrpc_auctioneer_pb.BatchSnapshotResponse|null) => void
  ): UnaryResponse;
  nodeRating(
    requestMessage: auctioneerrpc_auctioneer_pb.ServerNodeRatingRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: auctioneerrpc_auctioneer_pb.ServerNodeRatingResponse|null) => void
  ): UnaryResponse;
  nodeRating(
    requestMessage: auctioneerrpc_auctioneer_pb.ServerNodeRatingRequest,
    callback: (error: ServiceError|null, responseMessage: auctioneerrpc_auctioneer_pb.ServerNodeRatingResponse|null) => void
  ): UnaryResponse;
  batchSnapshots(
    requestMessage: auctioneerrpc_auctioneer_pb.BatchSnapshotsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: auctioneerrpc_auctioneer_pb.BatchSnapshotsResponse|null) => void
  ): UnaryResponse;
  batchSnapshots(
    requestMessage: auctioneerrpc_auctioneer_pb.BatchSnapshotsRequest,
    callback: (error: ServiceError|null, responseMessage: auctioneerrpc_auctioneer_pb.BatchSnapshotsResponse|null) => void
  ): UnaryResponse;
  marketInfo(
    requestMessage: auctioneerrpc_auctioneer_pb.MarketInfoRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: auctioneerrpc_auctioneer_pb.MarketInfoResponse|null) => void
  ): UnaryResponse;
  marketInfo(
    requestMessage: auctioneerrpc_auctioneer_pb.MarketInfoRequest,
    callback: (error: ServiceError|null, responseMessage: auctioneerrpc_auctioneer_pb.MarketInfoResponse|null) => void
  ): UnaryResponse;
}

