// package: poolrpc
// file: auctioneer.proto

import * as auctioneer_pb from "./auctioneer_pb";
import {grpc} from "@improbable-eng/grpc-web";

type ChannelAuctioneerReserveAccount = {
  readonly methodName: string;
  readonly service: typeof ChannelAuctioneer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof auctioneer_pb.ReserveAccountRequest;
  readonly responseType: typeof auctioneer_pb.ReserveAccountResponse;
};

type ChannelAuctioneerInitAccount = {
  readonly methodName: string;
  readonly service: typeof ChannelAuctioneer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof auctioneer_pb.ServerInitAccountRequest;
  readonly responseType: typeof auctioneer_pb.ServerInitAccountResponse;
};

type ChannelAuctioneerModifyAccount = {
  readonly methodName: string;
  readonly service: typeof ChannelAuctioneer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof auctioneer_pb.ServerModifyAccountRequest;
  readonly responseType: typeof auctioneer_pb.ServerModifyAccountResponse;
};

type ChannelAuctioneerSubmitOrder = {
  readonly methodName: string;
  readonly service: typeof ChannelAuctioneer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof auctioneer_pb.ServerSubmitOrderRequest;
  readonly responseType: typeof auctioneer_pb.ServerSubmitOrderResponse;
};

type ChannelAuctioneerCancelOrder = {
  readonly methodName: string;
  readonly service: typeof ChannelAuctioneer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof auctioneer_pb.ServerCancelOrderRequest;
  readonly responseType: typeof auctioneer_pb.ServerCancelOrderResponse;
};

type ChannelAuctioneerOrderState = {
  readonly methodName: string;
  readonly service: typeof ChannelAuctioneer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof auctioneer_pb.ServerOrderStateRequest;
  readonly responseType: typeof auctioneer_pb.ServerOrderStateResponse;
};

type ChannelAuctioneerSubscribeBatchAuction = {
  readonly methodName: string;
  readonly service: typeof ChannelAuctioneer;
  readonly requestStream: true;
  readonly responseStream: true;
  readonly requestType: typeof auctioneer_pb.ClientAuctionMessage;
  readonly responseType: typeof auctioneer_pb.ServerAuctionMessage;
};

type ChannelAuctioneerTerms = {
  readonly methodName: string;
  readonly service: typeof ChannelAuctioneer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof auctioneer_pb.TermsRequest;
  readonly responseType: typeof auctioneer_pb.TermsResponse;
};

type ChannelAuctioneerRelevantBatchSnapshot = {
  readonly methodName: string;
  readonly service: typeof ChannelAuctioneer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof auctioneer_pb.RelevantBatchRequest;
  readonly responseType: typeof auctioneer_pb.RelevantBatch;
};

type ChannelAuctioneerBatchSnapshot = {
  readonly methodName: string;
  readonly service: typeof ChannelAuctioneer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof auctioneer_pb.BatchSnapshotRequest;
  readonly responseType: typeof auctioneer_pb.BatchSnapshotResponse;
};

type ChannelAuctioneerNodeRating = {
  readonly methodName: string;
  readonly service: typeof ChannelAuctioneer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof auctioneer_pb.ServerNodeRatingRequest;
  readonly responseType: typeof auctioneer_pb.ServerNodeRatingResponse;
};

type ChannelAuctioneerBatchSnapshots = {
  readonly methodName: string;
  readonly service: typeof ChannelAuctioneer;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof auctioneer_pb.BatchSnapshotsRequest;
  readonly responseType: typeof auctioneer_pb.BatchSnapshotsResponse;
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
  static readonly Terms: ChannelAuctioneerTerms;
  static readonly RelevantBatchSnapshot: ChannelAuctioneerRelevantBatchSnapshot;
  static readonly BatchSnapshot: ChannelAuctioneerBatchSnapshot;
  static readonly NodeRating: ChannelAuctioneerNodeRating;
  static readonly BatchSnapshots: ChannelAuctioneerBatchSnapshots;
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
    requestMessage: auctioneer_pb.ReserveAccountRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: auctioneer_pb.ReserveAccountResponse|null) => void
  ): UnaryResponse;
  reserveAccount(
    requestMessage: auctioneer_pb.ReserveAccountRequest,
    callback: (error: ServiceError|null, responseMessage: auctioneer_pb.ReserveAccountResponse|null) => void
  ): UnaryResponse;
  initAccount(
    requestMessage: auctioneer_pb.ServerInitAccountRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: auctioneer_pb.ServerInitAccountResponse|null) => void
  ): UnaryResponse;
  initAccount(
    requestMessage: auctioneer_pb.ServerInitAccountRequest,
    callback: (error: ServiceError|null, responseMessage: auctioneer_pb.ServerInitAccountResponse|null) => void
  ): UnaryResponse;
  modifyAccount(
    requestMessage: auctioneer_pb.ServerModifyAccountRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: auctioneer_pb.ServerModifyAccountResponse|null) => void
  ): UnaryResponse;
  modifyAccount(
    requestMessage: auctioneer_pb.ServerModifyAccountRequest,
    callback: (error: ServiceError|null, responseMessage: auctioneer_pb.ServerModifyAccountResponse|null) => void
  ): UnaryResponse;
  submitOrder(
    requestMessage: auctioneer_pb.ServerSubmitOrderRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: auctioneer_pb.ServerSubmitOrderResponse|null) => void
  ): UnaryResponse;
  submitOrder(
    requestMessage: auctioneer_pb.ServerSubmitOrderRequest,
    callback: (error: ServiceError|null, responseMessage: auctioneer_pb.ServerSubmitOrderResponse|null) => void
  ): UnaryResponse;
  cancelOrder(
    requestMessage: auctioneer_pb.ServerCancelOrderRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: auctioneer_pb.ServerCancelOrderResponse|null) => void
  ): UnaryResponse;
  cancelOrder(
    requestMessage: auctioneer_pb.ServerCancelOrderRequest,
    callback: (error: ServiceError|null, responseMessage: auctioneer_pb.ServerCancelOrderResponse|null) => void
  ): UnaryResponse;
  orderState(
    requestMessage: auctioneer_pb.ServerOrderStateRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: auctioneer_pb.ServerOrderStateResponse|null) => void
  ): UnaryResponse;
  orderState(
    requestMessage: auctioneer_pb.ServerOrderStateRequest,
    callback: (error: ServiceError|null, responseMessage: auctioneer_pb.ServerOrderStateResponse|null) => void
  ): UnaryResponse;
  subscribeBatchAuction(metadata?: grpc.Metadata): BidirectionalStream<auctioneer_pb.ClientAuctionMessage, auctioneer_pb.ServerAuctionMessage>;
  terms(
    requestMessage: auctioneer_pb.TermsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: auctioneer_pb.TermsResponse|null) => void
  ): UnaryResponse;
  terms(
    requestMessage: auctioneer_pb.TermsRequest,
    callback: (error: ServiceError|null, responseMessage: auctioneer_pb.TermsResponse|null) => void
  ): UnaryResponse;
  relevantBatchSnapshot(
    requestMessage: auctioneer_pb.RelevantBatchRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: auctioneer_pb.RelevantBatch|null) => void
  ): UnaryResponse;
  relevantBatchSnapshot(
    requestMessage: auctioneer_pb.RelevantBatchRequest,
    callback: (error: ServiceError|null, responseMessage: auctioneer_pb.RelevantBatch|null) => void
  ): UnaryResponse;
  batchSnapshot(
    requestMessage: auctioneer_pb.BatchSnapshotRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: auctioneer_pb.BatchSnapshotResponse|null) => void
  ): UnaryResponse;
  batchSnapshot(
    requestMessage: auctioneer_pb.BatchSnapshotRequest,
    callback: (error: ServiceError|null, responseMessage: auctioneer_pb.BatchSnapshotResponse|null) => void
  ): UnaryResponse;
  nodeRating(
    requestMessage: auctioneer_pb.ServerNodeRatingRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: auctioneer_pb.ServerNodeRatingResponse|null) => void
  ): UnaryResponse;
  nodeRating(
    requestMessage: auctioneer_pb.ServerNodeRatingRequest,
    callback: (error: ServiceError|null, responseMessage: auctioneer_pb.ServerNodeRatingResponse|null) => void
  ): UnaryResponse;
  batchSnapshots(
    requestMessage: auctioneer_pb.BatchSnapshotsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: auctioneer_pb.BatchSnapshotsResponse|null) => void
  ): UnaryResponse;
  batchSnapshots(
    requestMessage: auctioneer_pb.BatchSnapshotsRequest,
    callback: (error: ServiceError|null, responseMessage: auctioneer_pb.BatchSnapshotsResponse|null) => void
  ): UnaryResponse;
}

