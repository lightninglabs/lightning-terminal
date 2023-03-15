// package: lnrpc
// file: lnd.proto

import * as lnd_pb from "./lnd_pb";
import {grpc} from "@improbable-eng/grpc-web";

type LightningWalletBalance = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.WalletBalanceRequest;
  readonly responseType: typeof lnd_pb.WalletBalanceResponse;
};

type LightningChannelBalance = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.ChannelBalanceRequest;
  readonly responseType: typeof lnd_pb.ChannelBalanceResponse;
};

type LightningGetTransactions = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.GetTransactionsRequest;
  readonly responseType: typeof lnd_pb.TransactionDetails;
};

type LightningEstimateFee = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.EstimateFeeRequest;
  readonly responseType: typeof lnd_pb.EstimateFeeResponse;
};

type LightningSendCoins = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.SendCoinsRequest;
  readonly responseType: typeof lnd_pb.SendCoinsResponse;
};

type LightningListUnspent = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.ListUnspentRequest;
  readonly responseType: typeof lnd_pb.ListUnspentResponse;
};

type LightningSubscribeTransactions = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof lnd_pb.GetTransactionsRequest;
  readonly responseType: typeof lnd_pb.Transaction;
};

type LightningSendMany = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.SendManyRequest;
  readonly responseType: typeof lnd_pb.SendManyResponse;
};

type LightningNewAddress = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.NewAddressRequest;
  readonly responseType: typeof lnd_pb.NewAddressResponse;
};

type LightningSignMessage = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.SignMessageRequest;
  readonly responseType: typeof lnd_pb.SignMessageResponse;
};

type LightningVerifyMessage = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.VerifyMessageRequest;
  readonly responseType: typeof lnd_pb.VerifyMessageResponse;
};

type LightningConnectPeer = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.ConnectPeerRequest;
  readonly responseType: typeof lnd_pb.ConnectPeerResponse;
};

type LightningDisconnectPeer = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.DisconnectPeerRequest;
  readonly responseType: typeof lnd_pb.DisconnectPeerResponse;
};

type LightningListPeers = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.ListPeersRequest;
  readonly responseType: typeof lnd_pb.ListPeersResponse;
};

type LightningSubscribePeerEvents = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof lnd_pb.PeerEventSubscription;
  readonly responseType: typeof lnd_pb.PeerEvent;
};

type LightningGetInfo = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.GetInfoRequest;
  readonly responseType: typeof lnd_pb.GetInfoResponse;
};

type LightningGetRecoveryInfo = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.GetRecoveryInfoRequest;
  readonly responseType: typeof lnd_pb.GetRecoveryInfoResponse;
};

type LightningPendingChannels = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.PendingChannelsRequest;
  readonly responseType: typeof lnd_pb.PendingChannelsResponse;
};

type LightningListChannels = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.ListChannelsRequest;
  readonly responseType: typeof lnd_pb.ListChannelsResponse;
};

type LightningSubscribeChannelEvents = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof lnd_pb.ChannelEventSubscription;
  readonly responseType: typeof lnd_pb.ChannelEventUpdate;
};

type LightningClosedChannels = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.ClosedChannelsRequest;
  readonly responseType: typeof lnd_pb.ClosedChannelsResponse;
};

type LightningOpenChannelSync = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.OpenChannelRequest;
  readonly responseType: typeof lnd_pb.ChannelPoint;
};

type LightningOpenChannel = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof lnd_pb.OpenChannelRequest;
  readonly responseType: typeof lnd_pb.OpenStatusUpdate;
};

type LightningBatchOpenChannel = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.BatchOpenChannelRequest;
  readonly responseType: typeof lnd_pb.BatchOpenChannelResponse;
};

type LightningFundingStateStep = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.FundingTransitionMsg;
  readonly responseType: typeof lnd_pb.FundingStateStepResp;
};

type LightningChannelAcceptor = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: true;
  readonly responseStream: true;
  readonly requestType: typeof lnd_pb.ChannelAcceptResponse;
  readonly responseType: typeof lnd_pb.ChannelAcceptRequest;
};

type LightningCloseChannel = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof lnd_pb.CloseChannelRequest;
  readonly responseType: typeof lnd_pb.CloseStatusUpdate;
};

type LightningAbandonChannel = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.AbandonChannelRequest;
  readonly responseType: typeof lnd_pb.AbandonChannelResponse;
};

type LightningSendPayment = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: true;
  readonly responseStream: true;
  readonly requestType: typeof lnd_pb.SendRequest;
  readonly responseType: typeof lnd_pb.SendResponse;
};

type LightningSendPaymentSync = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.SendRequest;
  readonly responseType: typeof lnd_pb.SendResponse;
};

type LightningSendToRoute = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: true;
  readonly responseStream: true;
  readonly requestType: typeof lnd_pb.SendToRouteRequest;
  readonly responseType: typeof lnd_pb.SendResponse;
};

type LightningSendToRouteSync = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.SendToRouteRequest;
  readonly responseType: typeof lnd_pb.SendResponse;
};

type LightningAddInvoice = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.Invoice;
  readonly responseType: typeof lnd_pb.AddInvoiceResponse;
};

type LightningListInvoices = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.ListInvoiceRequest;
  readonly responseType: typeof lnd_pb.ListInvoiceResponse;
};

type LightningLookupInvoice = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.PaymentHash;
  readonly responseType: typeof lnd_pb.Invoice;
};

type LightningSubscribeInvoices = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof lnd_pb.InvoiceSubscription;
  readonly responseType: typeof lnd_pb.Invoice;
};

type LightningDecodePayReq = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.PayReqString;
  readonly responseType: typeof lnd_pb.PayReq;
};

type LightningListPayments = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.ListPaymentsRequest;
  readonly responseType: typeof lnd_pb.ListPaymentsResponse;
};

type LightningDeletePayment = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.DeletePaymentRequest;
  readonly responseType: typeof lnd_pb.DeletePaymentResponse;
};

type LightningDeleteAllPayments = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.DeleteAllPaymentsRequest;
  readonly responseType: typeof lnd_pb.DeleteAllPaymentsResponse;
};

type LightningDescribeGraph = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.ChannelGraphRequest;
  readonly responseType: typeof lnd_pb.ChannelGraph;
};

type LightningGetNodeMetrics = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.NodeMetricsRequest;
  readonly responseType: typeof lnd_pb.NodeMetricsResponse;
};

type LightningGetChanInfo = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.ChanInfoRequest;
  readonly responseType: typeof lnd_pb.ChannelEdge;
};

type LightningGetNodeInfo = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.NodeInfoRequest;
  readonly responseType: typeof lnd_pb.NodeInfo;
};

type LightningQueryRoutes = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.QueryRoutesRequest;
  readonly responseType: typeof lnd_pb.QueryRoutesResponse;
};

type LightningGetNetworkInfo = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.NetworkInfoRequest;
  readonly responseType: typeof lnd_pb.NetworkInfo;
};

type LightningStopDaemon = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.StopRequest;
  readonly responseType: typeof lnd_pb.StopResponse;
};

type LightningSubscribeChannelGraph = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof lnd_pb.GraphTopologySubscription;
  readonly responseType: typeof lnd_pb.GraphTopologyUpdate;
};

type LightningDebugLevel = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.DebugLevelRequest;
  readonly responseType: typeof lnd_pb.DebugLevelResponse;
};

type LightningFeeReport = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.FeeReportRequest;
  readonly responseType: typeof lnd_pb.FeeReportResponse;
};

type LightningUpdateChannelPolicy = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.PolicyUpdateRequest;
  readonly responseType: typeof lnd_pb.PolicyUpdateResponse;
};

type LightningForwardingHistory = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.ForwardingHistoryRequest;
  readonly responseType: typeof lnd_pb.ForwardingHistoryResponse;
};

type LightningExportChannelBackup = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.ExportChannelBackupRequest;
  readonly responseType: typeof lnd_pb.ChannelBackup;
};

type LightningExportAllChannelBackups = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.ChanBackupExportRequest;
  readonly responseType: typeof lnd_pb.ChanBackupSnapshot;
};

type LightningVerifyChanBackup = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.ChanBackupSnapshot;
  readonly responseType: typeof lnd_pb.VerifyChanBackupResponse;
};

type LightningRestoreChannelBackups = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.RestoreChanBackupRequest;
  readonly responseType: typeof lnd_pb.RestoreBackupResponse;
};

type LightningSubscribeChannelBackups = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof lnd_pb.ChannelBackupSubscription;
  readonly responseType: typeof lnd_pb.ChanBackupSnapshot;
};

type LightningBakeMacaroon = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.BakeMacaroonRequest;
  readonly responseType: typeof lnd_pb.BakeMacaroonResponse;
};

type LightningListMacaroonIDs = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.ListMacaroonIDsRequest;
  readonly responseType: typeof lnd_pb.ListMacaroonIDsResponse;
};

type LightningDeleteMacaroonID = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.DeleteMacaroonIDRequest;
  readonly responseType: typeof lnd_pb.DeleteMacaroonIDResponse;
};

type LightningListPermissions = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.ListPermissionsRequest;
  readonly responseType: typeof lnd_pb.ListPermissionsResponse;
};

type LightningCheckMacaroonPermissions = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.CheckMacPermRequest;
  readonly responseType: typeof lnd_pb.CheckMacPermResponse;
};

type LightningRegisterRPCMiddleware = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: true;
  readonly responseStream: true;
  readonly requestType: typeof lnd_pb.RPCMiddlewareResponse;
  readonly responseType: typeof lnd_pb.RPCMiddlewareRequest;
};

type LightningSendCustomMessage = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.SendCustomMessageRequest;
  readonly responseType: typeof lnd_pb.SendCustomMessageResponse;
};

type LightningSubscribeCustomMessages = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof lnd_pb.SubscribeCustomMessagesRequest;
  readonly responseType: typeof lnd_pb.CustomMessage;
};

type LightningListAliases = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.ListAliasesRequest;
  readonly responseType: typeof lnd_pb.ListAliasesResponse;
};

type LightningLookupHtlcResolution = {
  readonly methodName: string;
  readonly service: typeof Lightning;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lnd_pb.LookupHtlcResolutionRequest;
  readonly responseType: typeof lnd_pb.LookupHtlcResolutionResponse;
};

export class Lightning {
  static readonly serviceName: string;
  static readonly WalletBalance: LightningWalletBalance;
  static readonly ChannelBalance: LightningChannelBalance;
  static readonly GetTransactions: LightningGetTransactions;
  static readonly EstimateFee: LightningEstimateFee;
  static readonly SendCoins: LightningSendCoins;
  static readonly ListUnspent: LightningListUnspent;
  static readonly SubscribeTransactions: LightningSubscribeTransactions;
  static readonly SendMany: LightningSendMany;
  static readonly NewAddress: LightningNewAddress;
  static readonly SignMessage: LightningSignMessage;
  static readonly VerifyMessage: LightningVerifyMessage;
  static readonly ConnectPeer: LightningConnectPeer;
  static readonly DisconnectPeer: LightningDisconnectPeer;
  static readonly ListPeers: LightningListPeers;
  static readonly SubscribePeerEvents: LightningSubscribePeerEvents;
  static readonly GetInfo: LightningGetInfo;
  static readonly GetRecoveryInfo: LightningGetRecoveryInfo;
  static readonly PendingChannels: LightningPendingChannels;
  static readonly ListChannels: LightningListChannels;
  static readonly SubscribeChannelEvents: LightningSubscribeChannelEvents;
  static readonly ClosedChannels: LightningClosedChannels;
  static readonly OpenChannelSync: LightningOpenChannelSync;
  static readonly OpenChannel: LightningOpenChannel;
  static readonly BatchOpenChannel: LightningBatchOpenChannel;
  static readonly FundingStateStep: LightningFundingStateStep;
  static readonly ChannelAcceptor: LightningChannelAcceptor;
  static readonly CloseChannel: LightningCloseChannel;
  static readonly AbandonChannel: LightningAbandonChannel;
  static readonly SendPayment: LightningSendPayment;
  static readonly SendPaymentSync: LightningSendPaymentSync;
  static readonly SendToRoute: LightningSendToRoute;
  static readonly SendToRouteSync: LightningSendToRouteSync;
  static readonly AddInvoice: LightningAddInvoice;
  static readonly ListInvoices: LightningListInvoices;
  static readonly LookupInvoice: LightningLookupInvoice;
  static readonly SubscribeInvoices: LightningSubscribeInvoices;
  static readonly DecodePayReq: LightningDecodePayReq;
  static readonly ListPayments: LightningListPayments;
  static readonly DeletePayment: LightningDeletePayment;
  static readonly DeleteAllPayments: LightningDeleteAllPayments;
  static readonly DescribeGraph: LightningDescribeGraph;
  static readonly GetNodeMetrics: LightningGetNodeMetrics;
  static readonly GetChanInfo: LightningGetChanInfo;
  static readonly GetNodeInfo: LightningGetNodeInfo;
  static readonly QueryRoutes: LightningQueryRoutes;
  static readonly GetNetworkInfo: LightningGetNetworkInfo;
  static readonly StopDaemon: LightningStopDaemon;
  static readonly SubscribeChannelGraph: LightningSubscribeChannelGraph;
  static readonly DebugLevel: LightningDebugLevel;
  static readonly FeeReport: LightningFeeReport;
  static readonly UpdateChannelPolicy: LightningUpdateChannelPolicy;
  static readonly ForwardingHistory: LightningForwardingHistory;
  static readonly ExportChannelBackup: LightningExportChannelBackup;
  static readonly ExportAllChannelBackups: LightningExportAllChannelBackups;
  static readonly VerifyChanBackup: LightningVerifyChanBackup;
  static readonly RestoreChannelBackups: LightningRestoreChannelBackups;
  static readonly SubscribeChannelBackups: LightningSubscribeChannelBackups;
  static readonly BakeMacaroon: LightningBakeMacaroon;
  static readonly ListMacaroonIDs: LightningListMacaroonIDs;
  static readonly DeleteMacaroonID: LightningDeleteMacaroonID;
  static readonly ListPermissions: LightningListPermissions;
  static readonly CheckMacaroonPermissions: LightningCheckMacaroonPermissions;
  static readonly RegisterRPCMiddleware: LightningRegisterRPCMiddleware;
  static readonly SendCustomMessage: LightningSendCustomMessage;
  static readonly SubscribeCustomMessages: LightningSubscribeCustomMessages;
  static readonly ListAliases: LightningListAliases;
  static readonly LookupHtlcResolution: LightningLookupHtlcResolution;
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

export class LightningClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  walletBalance(
    requestMessage: lnd_pb.WalletBalanceRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.WalletBalanceResponse|null) => void
  ): UnaryResponse;
  walletBalance(
    requestMessage: lnd_pb.WalletBalanceRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.WalletBalanceResponse|null) => void
  ): UnaryResponse;
  channelBalance(
    requestMessage: lnd_pb.ChannelBalanceRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ChannelBalanceResponse|null) => void
  ): UnaryResponse;
  channelBalance(
    requestMessage: lnd_pb.ChannelBalanceRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ChannelBalanceResponse|null) => void
  ): UnaryResponse;
  getTransactions(
    requestMessage: lnd_pb.GetTransactionsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.TransactionDetails|null) => void
  ): UnaryResponse;
  getTransactions(
    requestMessage: lnd_pb.GetTransactionsRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.TransactionDetails|null) => void
  ): UnaryResponse;
  estimateFee(
    requestMessage: lnd_pb.EstimateFeeRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.EstimateFeeResponse|null) => void
  ): UnaryResponse;
  estimateFee(
    requestMessage: lnd_pb.EstimateFeeRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.EstimateFeeResponse|null) => void
  ): UnaryResponse;
  sendCoins(
    requestMessage: lnd_pb.SendCoinsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.SendCoinsResponse|null) => void
  ): UnaryResponse;
  sendCoins(
    requestMessage: lnd_pb.SendCoinsRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.SendCoinsResponse|null) => void
  ): UnaryResponse;
  listUnspent(
    requestMessage: lnd_pb.ListUnspentRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ListUnspentResponse|null) => void
  ): UnaryResponse;
  listUnspent(
    requestMessage: lnd_pb.ListUnspentRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ListUnspentResponse|null) => void
  ): UnaryResponse;
  subscribeTransactions(requestMessage: lnd_pb.GetTransactionsRequest, metadata?: grpc.Metadata): ResponseStream<lnd_pb.Transaction>;
  sendMany(
    requestMessage: lnd_pb.SendManyRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.SendManyResponse|null) => void
  ): UnaryResponse;
  sendMany(
    requestMessage: lnd_pb.SendManyRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.SendManyResponse|null) => void
  ): UnaryResponse;
  newAddress(
    requestMessage: lnd_pb.NewAddressRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.NewAddressResponse|null) => void
  ): UnaryResponse;
  newAddress(
    requestMessage: lnd_pb.NewAddressRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.NewAddressResponse|null) => void
  ): UnaryResponse;
  signMessage(
    requestMessage: lnd_pb.SignMessageRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.SignMessageResponse|null) => void
  ): UnaryResponse;
  signMessage(
    requestMessage: lnd_pb.SignMessageRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.SignMessageResponse|null) => void
  ): UnaryResponse;
  verifyMessage(
    requestMessage: lnd_pb.VerifyMessageRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.VerifyMessageResponse|null) => void
  ): UnaryResponse;
  verifyMessage(
    requestMessage: lnd_pb.VerifyMessageRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.VerifyMessageResponse|null) => void
  ): UnaryResponse;
  connectPeer(
    requestMessage: lnd_pb.ConnectPeerRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ConnectPeerResponse|null) => void
  ): UnaryResponse;
  connectPeer(
    requestMessage: lnd_pb.ConnectPeerRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ConnectPeerResponse|null) => void
  ): UnaryResponse;
  disconnectPeer(
    requestMessage: lnd_pb.DisconnectPeerRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.DisconnectPeerResponse|null) => void
  ): UnaryResponse;
  disconnectPeer(
    requestMessage: lnd_pb.DisconnectPeerRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.DisconnectPeerResponse|null) => void
  ): UnaryResponse;
  listPeers(
    requestMessage: lnd_pb.ListPeersRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ListPeersResponse|null) => void
  ): UnaryResponse;
  listPeers(
    requestMessage: lnd_pb.ListPeersRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ListPeersResponse|null) => void
  ): UnaryResponse;
  subscribePeerEvents(requestMessage: lnd_pb.PeerEventSubscription, metadata?: grpc.Metadata): ResponseStream<lnd_pb.PeerEvent>;
  getInfo(
    requestMessage: lnd_pb.GetInfoRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.GetInfoResponse|null) => void
  ): UnaryResponse;
  getInfo(
    requestMessage: lnd_pb.GetInfoRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.GetInfoResponse|null) => void
  ): UnaryResponse;
  getRecoveryInfo(
    requestMessage: lnd_pb.GetRecoveryInfoRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.GetRecoveryInfoResponse|null) => void
  ): UnaryResponse;
  getRecoveryInfo(
    requestMessage: lnd_pb.GetRecoveryInfoRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.GetRecoveryInfoResponse|null) => void
  ): UnaryResponse;
  pendingChannels(
    requestMessage: lnd_pb.PendingChannelsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.PendingChannelsResponse|null) => void
  ): UnaryResponse;
  pendingChannels(
    requestMessage: lnd_pb.PendingChannelsRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.PendingChannelsResponse|null) => void
  ): UnaryResponse;
  listChannels(
    requestMessage: lnd_pb.ListChannelsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ListChannelsResponse|null) => void
  ): UnaryResponse;
  listChannels(
    requestMessage: lnd_pb.ListChannelsRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ListChannelsResponse|null) => void
  ): UnaryResponse;
  subscribeChannelEvents(requestMessage: lnd_pb.ChannelEventSubscription, metadata?: grpc.Metadata): ResponseStream<lnd_pb.ChannelEventUpdate>;
  closedChannels(
    requestMessage: lnd_pb.ClosedChannelsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ClosedChannelsResponse|null) => void
  ): UnaryResponse;
  closedChannels(
    requestMessage: lnd_pb.ClosedChannelsRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ClosedChannelsResponse|null) => void
  ): UnaryResponse;
  openChannelSync(
    requestMessage: lnd_pb.OpenChannelRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ChannelPoint|null) => void
  ): UnaryResponse;
  openChannelSync(
    requestMessage: lnd_pb.OpenChannelRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ChannelPoint|null) => void
  ): UnaryResponse;
  openChannel(requestMessage: lnd_pb.OpenChannelRequest, metadata?: grpc.Metadata): ResponseStream<lnd_pb.OpenStatusUpdate>;
  batchOpenChannel(
    requestMessage: lnd_pb.BatchOpenChannelRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.BatchOpenChannelResponse|null) => void
  ): UnaryResponse;
  batchOpenChannel(
    requestMessage: lnd_pb.BatchOpenChannelRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.BatchOpenChannelResponse|null) => void
  ): UnaryResponse;
  fundingStateStep(
    requestMessage: lnd_pb.FundingTransitionMsg,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.FundingStateStepResp|null) => void
  ): UnaryResponse;
  fundingStateStep(
    requestMessage: lnd_pb.FundingTransitionMsg,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.FundingStateStepResp|null) => void
  ): UnaryResponse;
  channelAcceptor(metadata?: grpc.Metadata): BidirectionalStream<lnd_pb.ChannelAcceptResponse, lnd_pb.ChannelAcceptRequest>;
  closeChannel(requestMessage: lnd_pb.CloseChannelRequest, metadata?: grpc.Metadata): ResponseStream<lnd_pb.CloseStatusUpdate>;
  abandonChannel(
    requestMessage: lnd_pb.AbandonChannelRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.AbandonChannelResponse|null) => void
  ): UnaryResponse;
  abandonChannel(
    requestMessage: lnd_pb.AbandonChannelRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.AbandonChannelResponse|null) => void
  ): UnaryResponse;
  sendPayment(metadata?: grpc.Metadata): BidirectionalStream<lnd_pb.SendRequest, lnd_pb.SendResponse>;
  sendPaymentSync(
    requestMessage: lnd_pb.SendRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.SendResponse|null) => void
  ): UnaryResponse;
  sendPaymentSync(
    requestMessage: lnd_pb.SendRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.SendResponse|null) => void
  ): UnaryResponse;
  sendToRoute(metadata?: grpc.Metadata): BidirectionalStream<lnd_pb.SendToRouteRequest, lnd_pb.SendResponse>;
  sendToRouteSync(
    requestMessage: lnd_pb.SendToRouteRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.SendResponse|null) => void
  ): UnaryResponse;
  sendToRouteSync(
    requestMessage: lnd_pb.SendToRouteRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.SendResponse|null) => void
  ): UnaryResponse;
  addInvoice(
    requestMessage: lnd_pb.Invoice,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.AddInvoiceResponse|null) => void
  ): UnaryResponse;
  addInvoice(
    requestMessage: lnd_pb.Invoice,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.AddInvoiceResponse|null) => void
  ): UnaryResponse;
  listInvoices(
    requestMessage: lnd_pb.ListInvoiceRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ListInvoiceResponse|null) => void
  ): UnaryResponse;
  listInvoices(
    requestMessage: lnd_pb.ListInvoiceRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ListInvoiceResponse|null) => void
  ): UnaryResponse;
  lookupInvoice(
    requestMessage: lnd_pb.PaymentHash,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.Invoice|null) => void
  ): UnaryResponse;
  lookupInvoice(
    requestMessage: lnd_pb.PaymentHash,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.Invoice|null) => void
  ): UnaryResponse;
  subscribeInvoices(requestMessage: lnd_pb.InvoiceSubscription, metadata?: grpc.Metadata): ResponseStream<lnd_pb.Invoice>;
  decodePayReq(
    requestMessage: lnd_pb.PayReqString,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.PayReq|null) => void
  ): UnaryResponse;
  decodePayReq(
    requestMessage: lnd_pb.PayReqString,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.PayReq|null) => void
  ): UnaryResponse;
  listPayments(
    requestMessage: lnd_pb.ListPaymentsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ListPaymentsResponse|null) => void
  ): UnaryResponse;
  listPayments(
    requestMessage: lnd_pb.ListPaymentsRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ListPaymentsResponse|null) => void
  ): UnaryResponse;
  deletePayment(
    requestMessage: lnd_pb.DeletePaymentRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.DeletePaymentResponse|null) => void
  ): UnaryResponse;
  deletePayment(
    requestMessage: lnd_pb.DeletePaymentRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.DeletePaymentResponse|null) => void
  ): UnaryResponse;
  deleteAllPayments(
    requestMessage: lnd_pb.DeleteAllPaymentsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.DeleteAllPaymentsResponse|null) => void
  ): UnaryResponse;
  deleteAllPayments(
    requestMessage: lnd_pb.DeleteAllPaymentsRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.DeleteAllPaymentsResponse|null) => void
  ): UnaryResponse;
  describeGraph(
    requestMessage: lnd_pb.ChannelGraphRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ChannelGraph|null) => void
  ): UnaryResponse;
  describeGraph(
    requestMessage: lnd_pb.ChannelGraphRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ChannelGraph|null) => void
  ): UnaryResponse;
  getNodeMetrics(
    requestMessage: lnd_pb.NodeMetricsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.NodeMetricsResponse|null) => void
  ): UnaryResponse;
  getNodeMetrics(
    requestMessage: lnd_pb.NodeMetricsRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.NodeMetricsResponse|null) => void
  ): UnaryResponse;
  getChanInfo(
    requestMessage: lnd_pb.ChanInfoRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ChannelEdge|null) => void
  ): UnaryResponse;
  getChanInfo(
    requestMessage: lnd_pb.ChanInfoRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ChannelEdge|null) => void
  ): UnaryResponse;
  getNodeInfo(
    requestMessage: lnd_pb.NodeInfoRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.NodeInfo|null) => void
  ): UnaryResponse;
  getNodeInfo(
    requestMessage: lnd_pb.NodeInfoRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.NodeInfo|null) => void
  ): UnaryResponse;
  queryRoutes(
    requestMessage: lnd_pb.QueryRoutesRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.QueryRoutesResponse|null) => void
  ): UnaryResponse;
  queryRoutes(
    requestMessage: lnd_pb.QueryRoutesRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.QueryRoutesResponse|null) => void
  ): UnaryResponse;
  getNetworkInfo(
    requestMessage: lnd_pb.NetworkInfoRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.NetworkInfo|null) => void
  ): UnaryResponse;
  getNetworkInfo(
    requestMessage: lnd_pb.NetworkInfoRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.NetworkInfo|null) => void
  ): UnaryResponse;
  stopDaemon(
    requestMessage: lnd_pb.StopRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.StopResponse|null) => void
  ): UnaryResponse;
  stopDaemon(
    requestMessage: lnd_pb.StopRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.StopResponse|null) => void
  ): UnaryResponse;
  subscribeChannelGraph(requestMessage: lnd_pb.GraphTopologySubscription, metadata?: grpc.Metadata): ResponseStream<lnd_pb.GraphTopologyUpdate>;
  debugLevel(
    requestMessage: lnd_pb.DebugLevelRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.DebugLevelResponse|null) => void
  ): UnaryResponse;
  debugLevel(
    requestMessage: lnd_pb.DebugLevelRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.DebugLevelResponse|null) => void
  ): UnaryResponse;
  feeReport(
    requestMessage: lnd_pb.FeeReportRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.FeeReportResponse|null) => void
  ): UnaryResponse;
  feeReport(
    requestMessage: lnd_pb.FeeReportRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.FeeReportResponse|null) => void
  ): UnaryResponse;
  updateChannelPolicy(
    requestMessage: lnd_pb.PolicyUpdateRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.PolicyUpdateResponse|null) => void
  ): UnaryResponse;
  updateChannelPolicy(
    requestMessage: lnd_pb.PolicyUpdateRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.PolicyUpdateResponse|null) => void
  ): UnaryResponse;
  forwardingHistory(
    requestMessage: lnd_pb.ForwardingHistoryRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ForwardingHistoryResponse|null) => void
  ): UnaryResponse;
  forwardingHistory(
    requestMessage: lnd_pb.ForwardingHistoryRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ForwardingHistoryResponse|null) => void
  ): UnaryResponse;
  exportChannelBackup(
    requestMessage: lnd_pb.ExportChannelBackupRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ChannelBackup|null) => void
  ): UnaryResponse;
  exportChannelBackup(
    requestMessage: lnd_pb.ExportChannelBackupRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ChannelBackup|null) => void
  ): UnaryResponse;
  exportAllChannelBackups(
    requestMessage: lnd_pb.ChanBackupExportRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ChanBackupSnapshot|null) => void
  ): UnaryResponse;
  exportAllChannelBackups(
    requestMessage: lnd_pb.ChanBackupExportRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ChanBackupSnapshot|null) => void
  ): UnaryResponse;
  verifyChanBackup(
    requestMessage: lnd_pb.ChanBackupSnapshot,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.VerifyChanBackupResponse|null) => void
  ): UnaryResponse;
  verifyChanBackup(
    requestMessage: lnd_pb.ChanBackupSnapshot,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.VerifyChanBackupResponse|null) => void
  ): UnaryResponse;
  restoreChannelBackups(
    requestMessage: lnd_pb.RestoreChanBackupRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.RestoreBackupResponse|null) => void
  ): UnaryResponse;
  restoreChannelBackups(
    requestMessage: lnd_pb.RestoreChanBackupRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.RestoreBackupResponse|null) => void
  ): UnaryResponse;
  subscribeChannelBackups(requestMessage: lnd_pb.ChannelBackupSubscription, metadata?: grpc.Metadata): ResponseStream<lnd_pb.ChanBackupSnapshot>;
  bakeMacaroon(
    requestMessage: lnd_pb.BakeMacaroonRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.BakeMacaroonResponse|null) => void
  ): UnaryResponse;
  bakeMacaroon(
    requestMessage: lnd_pb.BakeMacaroonRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.BakeMacaroonResponse|null) => void
  ): UnaryResponse;
  listMacaroonIDs(
    requestMessage: lnd_pb.ListMacaroonIDsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ListMacaroonIDsResponse|null) => void
  ): UnaryResponse;
  listMacaroonIDs(
    requestMessage: lnd_pb.ListMacaroonIDsRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ListMacaroonIDsResponse|null) => void
  ): UnaryResponse;
  deleteMacaroonID(
    requestMessage: lnd_pb.DeleteMacaroonIDRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.DeleteMacaroonIDResponse|null) => void
  ): UnaryResponse;
  deleteMacaroonID(
    requestMessage: lnd_pb.DeleteMacaroonIDRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.DeleteMacaroonIDResponse|null) => void
  ): UnaryResponse;
  listPermissions(
    requestMessage: lnd_pb.ListPermissionsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ListPermissionsResponse|null) => void
  ): UnaryResponse;
  listPermissions(
    requestMessage: lnd_pb.ListPermissionsRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ListPermissionsResponse|null) => void
  ): UnaryResponse;
  checkMacaroonPermissions(
    requestMessage: lnd_pb.CheckMacPermRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.CheckMacPermResponse|null) => void
  ): UnaryResponse;
  checkMacaroonPermissions(
    requestMessage: lnd_pb.CheckMacPermRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.CheckMacPermResponse|null) => void
  ): UnaryResponse;
  registerRPCMiddleware(metadata?: grpc.Metadata): BidirectionalStream<lnd_pb.RPCMiddlewareResponse, lnd_pb.RPCMiddlewareRequest>;
  sendCustomMessage(
    requestMessage: lnd_pb.SendCustomMessageRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.SendCustomMessageResponse|null) => void
  ): UnaryResponse;
  sendCustomMessage(
    requestMessage: lnd_pb.SendCustomMessageRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.SendCustomMessageResponse|null) => void
  ): UnaryResponse;
  subscribeCustomMessages(requestMessage: lnd_pb.SubscribeCustomMessagesRequest, metadata?: grpc.Metadata): ResponseStream<lnd_pb.CustomMessage>;
  listAliases(
    requestMessage: lnd_pb.ListAliasesRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ListAliasesResponse|null) => void
  ): UnaryResponse;
  listAliases(
    requestMessage: lnd_pb.ListAliasesRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.ListAliasesResponse|null) => void
  ): UnaryResponse;
  lookupHtlcResolution(
    requestMessage: lnd_pb.LookupHtlcResolutionRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.LookupHtlcResolutionResponse|null) => void
  ): UnaryResponse;
  lookupHtlcResolution(
    requestMessage: lnd_pb.LookupHtlcResolutionRequest,
    callback: (error: ServiceError|null, responseMessage: lnd_pb.LookupHtlcResolutionResponse|null) => void
  ): UnaryResponse;
}

