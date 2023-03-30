// package: poolrpc
// file: trader.proto

import * as trader_pb from "./trader_pb";
import * as auctioneerrpc_auctioneer_pb from "./auctioneerrpc/auctioneer_pb";
import {grpc} from "@improbable-eng/grpc-web";

type TraderGetInfo = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.GetInfoRequest;
  readonly responseType: typeof trader_pb.GetInfoResponse;
};

type TraderStopDaemon = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.StopDaemonRequest;
  readonly responseType: typeof trader_pb.StopDaemonResponse;
};

type TraderQuoteAccount = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.QuoteAccountRequest;
  readonly responseType: typeof trader_pb.QuoteAccountResponse;
};

type TraderInitAccount = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.InitAccountRequest;
  readonly responseType: typeof trader_pb.Account;
};

type TraderListAccounts = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.ListAccountsRequest;
  readonly responseType: typeof trader_pb.ListAccountsResponse;
};

type TraderCloseAccount = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.CloseAccountRequest;
  readonly responseType: typeof trader_pb.CloseAccountResponse;
};

type TraderWithdrawAccount = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.WithdrawAccountRequest;
  readonly responseType: typeof trader_pb.WithdrawAccountResponse;
};

type TraderDepositAccount = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.DepositAccountRequest;
  readonly responseType: typeof trader_pb.DepositAccountResponse;
};

type TraderRenewAccount = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.RenewAccountRequest;
  readonly responseType: typeof trader_pb.RenewAccountResponse;
};

type TraderBumpAccountFee = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.BumpAccountFeeRequest;
  readonly responseType: typeof trader_pb.BumpAccountFeeResponse;
};

type TraderRecoverAccounts = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.RecoverAccountsRequest;
  readonly responseType: typeof trader_pb.RecoverAccountsResponse;
};

type TraderAccountModificationFees = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.AccountModificationFeesRequest;
  readonly responseType: typeof trader_pb.AccountModificationFeesResponse;
};

type TraderSubmitOrder = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.SubmitOrderRequest;
  readonly responseType: typeof trader_pb.SubmitOrderResponse;
};

type TraderListOrders = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.ListOrdersRequest;
  readonly responseType: typeof trader_pb.ListOrdersResponse;
};

type TraderCancelOrder = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.CancelOrderRequest;
  readonly responseType: typeof trader_pb.CancelOrderResponse;
};

type TraderQuoteOrder = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.QuoteOrderRequest;
  readonly responseType: typeof trader_pb.QuoteOrderResponse;
};

type TraderAuctionFee = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.AuctionFeeRequest;
  readonly responseType: typeof trader_pb.AuctionFeeResponse;
};

type TraderLeaseDurations = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.LeaseDurationRequest;
  readonly responseType: typeof trader_pb.LeaseDurationResponse;
};

type TraderNextBatchInfo = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.NextBatchInfoRequest;
  readonly responseType: typeof trader_pb.NextBatchInfoResponse;
};

type TraderBatchSnapshot = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof auctioneerrpc_auctioneer_pb.BatchSnapshotRequest;
  readonly responseType: typeof auctioneerrpc_auctioneer_pb.BatchSnapshotResponse;
};

type TraderGetLsatTokens = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.TokensRequest;
  readonly responseType: typeof trader_pb.TokensResponse;
};

type TraderLeases = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.LeasesRequest;
  readonly responseType: typeof trader_pb.LeasesResponse;
};

type TraderNodeRatings = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.NodeRatingRequest;
  readonly responseType: typeof trader_pb.NodeRatingResponse;
};

type TraderBatchSnapshots = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof auctioneerrpc_auctioneer_pb.BatchSnapshotsRequest;
  readonly responseType: typeof auctioneerrpc_auctioneer_pb.BatchSnapshotsResponse;
};

type TraderOfferSidecar = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.OfferSidecarRequest;
  readonly responseType: typeof trader_pb.SidecarTicket;
};

type TraderRegisterSidecar = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.RegisterSidecarRequest;
  readonly responseType: typeof trader_pb.SidecarTicket;
};

type TraderExpectSidecarChannel = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.ExpectSidecarChannelRequest;
  readonly responseType: typeof trader_pb.ExpectSidecarChannelResponse;
};

type TraderDecodeSidecarTicket = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.SidecarTicket;
  readonly responseType: typeof trader_pb.DecodedSidecarTicket;
};

type TraderListSidecars = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.ListSidecarsRequest;
  readonly responseType: typeof trader_pb.ListSidecarsResponse;
};

type TraderCancelSidecar = {
  readonly methodName: string;
  readonly service: typeof Trader;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof trader_pb.CancelSidecarRequest;
  readonly responseType: typeof trader_pb.CancelSidecarResponse;
};

export class Trader {
  static readonly serviceName: string;
  static readonly GetInfo: TraderGetInfo;
  static readonly StopDaemon: TraderStopDaemon;
  static readonly QuoteAccount: TraderQuoteAccount;
  static readonly InitAccount: TraderInitAccount;
  static readonly ListAccounts: TraderListAccounts;
  static readonly CloseAccount: TraderCloseAccount;
  static readonly WithdrawAccount: TraderWithdrawAccount;
  static readonly DepositAccount: TraderDepositAccount;
  static readonly RenewAccount: TraderRenewAccount;
  static readonly BumpAccountFee: TraderBumpAccountFee;
  static readonly RecoverAccounts: TraderRecoverAccounts;
  static readonly AccountModificationFees: TraderAccountModificationFees;
  static readonly SubmitOrder: TraderSubmitOrder;
  static readonly ListOrders: TraderListOrders;
  static readonly CancelOrder: TraderCancelOrder;
  static readonly QuoteOrder: TraderQuoteOrder;
  static readonly AuctionFee: TraderAuctionFee;
  static readonly LeaseDurations: TraderLeaseDurations;
  static readonly NextBatchInfo: TraderNextBatchInfo;
  static readonly BatchSnapshot: TraderBatchSnapshot;
  static readonly GetLsatTokens: TraderGetLsatTokens;
  static readonly Leases: TraderLeases;
  static readonly NodeRatings: TraderNodeRatings;
  static readonly BatchSnapshots: TraderBatchSnapshots;
  static readonly OfferSidecar: TraderOfferSidecar;
  static readonly RegisterSidecar: TraderRegisterSidecar;
  static readonly ExpectSidecarChannel: TraderExpectSidecarChannel;
  static readonly DecodeSidecarTicket: TraderDecodeSidecarTicket;
  static readonly ListSidecars: TraderListSidecars;
  static readonly CancelSidecar: TraderCancelSidecar;
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

export class TraderClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  getInfo(
    requestMessage: trader_pb.GetInfoRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.GetInfoResponse|null) => void
  ): UnaryResponse;
  getInfo(
    requestMessage: trader_pb.GetInfoRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.GetInfoResponse|null) => void
  ): UnaryResponse;
  stopDaemon(
    requestMessage: trader_pb.StopDaemonRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.StopDaemonResponse|null) => void
  ): UnaryResponse;
  stopDaemon(
    requestMessage: trader_pb.StopDaemonRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.StopDaemonResponse|null) => void
  ): UnaryResponse;
  quoteAccount(
    requestMessage: trader_pb.QuoteAccountRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.QuoteAccountResponse|null) => void
  ): UnaryResponse;
  quoteAccount(
    requestMessage: trader_pb.QuoteAccountRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.QuoteAccountResponse|null) => void
  ): UnaryResponse;
  initAccount(
    requestMessage: trader_pb.InitAccountRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.Account|null) => void
  ): UnaryResponse;
  initAccount(
    requestMessage: trader_pb.InitAccountRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.Account|null) => void
  ): UnaryResponse;
  listAccounts(
    requestMessage: trader_pb.ListAccountsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.ListAccountsResponse|null) => void
  ): UnaryResponse;
  listAccounts(
    requestMessage: trader_pb.ListAccountsRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.ListAccountsResponse|null) => void
  ): UnaryResponse;
  closeAccount(
    requestMessage: trader_pb.CloseAccountRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.CloseAccountResponse|null) => void
  ): UnaryResponse;
  closeAccount(
    requestMessage: trader_pb.CloseAccountRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.CloseAccountResponse|null) => void
  ): UnaryResponse;
  withdrawAccount(
    requestMessage: trader_pb.WithdrawAccountRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.WithdrawAccountResponse|null) => void
  ): UnaryResponse;
  withdrawAccount(
    requestMessage: trader_pb.WithdrawAccountRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.WithdrawAccountResponse|null) => void
  ): UnaryResponse;
  depositAccount(
    requestMessage: trader_pb.DepositAccountRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.DepositAccountResponse|null) => void
  ): UnaryResponse;
  depositAccount(
    requestMessage: trader_pb.DepositAccountRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.DepositAccountResponse|null) => void
  ): UnaryResponse;
  renewAccount(
    requestMessage: trader_pb.RenewAccountRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.RenewAccountResponse|null) => void
  ): UnaryResponse;
  renewAccount(
    requestMessage: trader_pb.RenewAccountRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.RenewAccountResponse|null) => void
  ): UnaryResponse;
  bumpAccountFee(
    requestMessage: trader_pb.BumpAccountFeeRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.BumpAccountFeeResponse|null) => void
  ): UnaryResponse;
  bumpAccountFee(
    requestMessage: trader_pb.BumpAccountFeeRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.BumpAccountFeeResponse|null) => void
  ): UnaryResponse;
  recoverAccounts(
    requestMessage: trader_pb.RecoverAccountsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.RecoverAccountsResponse|null) => void
  ): UnaryResponse;
  recoverAccounts(
    requestMessage: trader_pb.RecoverAccountsRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.RecoverAccountsResponse|null) => void
  ): UnaryResponse;
  accountModificationFees(
    requestMessage: trader_pb.AccountModificationFeesRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.AccountModificationFeesResponse|null) => void
  ): UnaryResponse;
  accountModificationFees(
    requestMessage: trader_pb.AccountModificationFeesRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.AccountModificationFeesResponse|null) => void
  ): UnaryResponse;
  submitOrder(
    requestMessage: trader_pb.SubmitOrderRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.SubmitOrderResponse|null) => void
  ): UnaryResponse;
  submitOrder(
    requestMessage: trader_pb.SubmitOrderRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.SubmitOrderResponse|null) => void
  ): UnaryResponse;
  listOrders(
    requestMessage: trader_pb.ListOrdersRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.ListOrdersResponse|null) => void
  ): UnaryResponse;
  listOrders(
    requestMessage: trader_pb.ListOrdersRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.ListOrdersResponse|null) => void
  ): UnaryResponse;
  cancelOrder(
    requestMessage: trader_pb.CancelOrderRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.CancelOrderResponse|null) => void
  ): UnaryResponse;
  cancelOrder(
    requestMessage: trader_pb.CancelOrderRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.CancelOrderResponse|null) => void
  ): UnaryResponse;
  quoteOrder(
    requestMessage: trader_pb.QuoteOrderRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.QuoteOrderResponse|null) => void
  ): UnaryResponse;
  quoteOrder(
    requestMessage: trader_pb.QuoteOrderRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.QuoteOrderResponse|null) => void
  ): UnaryResponse;
  auctionFee(
    requestMessage: trader_pb.AuctionFeeRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.AuctionFeeResponse|null) => void
  ): UnaryResponse;
  auctionFee(
    requestMessage: trader_pb.AuctionFeeRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.AuctionFeeResponse|null) => void
  ): UnaryResponse;
  leaseDurations(
    requestMessage: trader_pb.LeaseDurationRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.LeaseDurationResponse|null) => void
  ): UnaryResponse;
  leaseDurations(
    requestMessage: trader_pb.LeaseDurationRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.LeaseDurationResponse|null) => void
  ): UnaryResponse;
  nextBatchInfo(
    requestMessage: trader_pb.NextBatchInfoRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.NextBatchInfoResponse|null) => void
  ): UnaryResponse;
  nextBatchInfo(
    requestMessage: trader_pb.NextBatchInfoRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.NextBatchInfoResponse|null) => void
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
  getLsatTokens(
    requestMessage: trader_pb.TokensRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.TokensResponse|null) => void
  ): UnaryResponse;
  getLsatTokens(
    requestMessage: trader_pb.TokensRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.TokensResponse|null) => void
  ): UnaryResponse;
  leases(
    requestMessage: trader_pb.LeasesRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.LeasesResponse|null) => void
  ): UnaryResponse;
  leases(
    requestMessage: trader_pb.LeasesRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.LeasesResponse|null) => void
  ): UnaryResponse;
  nodeRatings(
    requestMessage: trader_pb.NodeRatingRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.NodeRatingResponse|null) => void
  ): UnaryResponse;
  nodeRatings(
    requestMessage: trader_pb.NodeRatingRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.NodeRatingResponse|null) => void
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
  offerSidecar(
    requestMessage: trader_pb.OfferSidecarRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.SidecarTicket|null) => void
  ): UnaryResponse;
  offerSidecar(
    requestMessage: trader_pb.OfferSidecarRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.SidecarTicket|null) => void
  ): UnaryResponse;
  registerSidecar(
    requestMessage: trader_pb.RegisterSidecarRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.SidecarTicket|null) => void
  ): UnaryResponse;
  registerSidecar(
    requestMessage: trader_pb.RegisterSidecarRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.SidecarTicket|null) => void
  ): UnaryResponse;
  expectSidecarChannel(
    requestMessage: trader_pb.ExpectSidecarChannelRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.ExpectSidecarChannelResponse|null) => void
  ): UnaryResponse;
  expectSidecarChannel(
    requestMessage: trader_pb.ExpectSidecarChannelRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.ExpectSidecarChannelResponse|null) => void
  ): UnaryResponse;
  decodeSidecarTicket(
    requestMessage: trader_pb.SidecarTicket,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.DecodedSidecarTicket|null) => void
  ): UnaryResponse;
  decodeSidecarTicket(
    requestMessage: trader_pb.SidecarTicket,
    callback: (error: ServiceError|null, responseMessage: trader_pb.DecodedSidecarTicket|null) => void
  ): UnaryResponse;
  listSidecars(
    requestMessage: trader_pb.ListSidecarsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.ListSidecarsResponse|null) => void
  ): UnaryResponse;
  listSidecars(
    requestMessage: trader_pb.ListSidecarsRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.ListSidecarsResponse|null) => void
  ): UnaryResponse;
  cancelSidecar(
    requestMessage: trader_pb.CancelSidecarRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: trader_pb.CancelSidecarResponse|null) => void
  ): UnaryResponse;
  cancelSidecar(
    requestMessage: trader_pb.CancelSidecarRequest,
    callback: (error: ServiceError|null, responseMessage: trader_pb.CancelSidecarResponse|null) => void
  ): UnaryResponse;
}

