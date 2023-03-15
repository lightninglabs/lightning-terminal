// package: lnrpc
// file: lnd.proto

var lnd_pb = require("./lnd_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var Lightning = (function () {
  function Lightning() {}
  Lightning.serviceName = "lnrpc.Lightning";
  return Lightning;
}());

Lightning.WalletBalance = {
  methodName: "WalletBalance",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.WalletBalanceRequest,
  responseType: lnd_pb.WalletBalanceResponse
};

Lightning.ChannelBalance = {
  methodName: "ChannelBalance",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.ChannelBalanceRequest,
  responseType: lnd_pb.ChannelBalanceResponse
};

Lightning.GetTransactions = {
  methodName: "GetTransactions",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.GetTransactionsRequest,
  responseType: lnd_pb.TransactionDetails
};

Lightning.EstimateFee = {
  methodName: "EstimateFee",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.EstimateFeeRequest,
  responseType: lnd_pb.EstimateFeeResponse
};

Lightning.SendCoins = {
  methodName: "SendCoins",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.SendCoinsRequest,
  responseType: lnd_pb.SendCoinsResponse
};

Lightning.ListUnspent = {
  methodName: "ListUnspent",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.ListUnspentRequest,
  responseType: lnd_pb.ListUnspentResponse
};

Lightning.SubscribeTransactions = {
  methodName: "SubscribeTransactions",
  service: Lightning,
  requestStream: false,
  responseStream: true,
  requestType: lnd_pb.GetTransactionsRequest,
  responseType: lnd_pb.Transaction
};

Lightning.SendMany = {
  methodName: "SendMany",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.SendManyRequest,
  responseType: lnd_pb.SendManyResponse
};

Lightning.NewAddress = {
  methodName: "NewAddress",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.NewAddressRequest,
  responseType: lnd_pb.NewAddressResponse
};

Lightning.SignMessage = {
  methodName: "SignMessage",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.SignMessageRequest,
  responseType: lnd_pb.SignMessageResponse
};

Lightning.VerifyMessage = {
  methodName: "VerifyMessage",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.VerifyMessageRequest,
  responseType: lnd_pb.VerifyMessageResponse
};

Lightning.ConnectPeer = {
  methodName: "ConnectPeer",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.ConnectPeerRequest,
  responseType: lnd_pb.ConnectPeerResponse
};

Lightning.DisconnectPeer = {
  methodName: "DisconnectPeer",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.DisconnectPeerRequest,
  responseType: lnd_pb.DisconnectPeerResponse
};

Lightning.ListPeers = {
  methodName: "ListPeers",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.ListPeersRequest,
  responseType: lnd_pb.ListPeersResponse
};

Lightning.SubscribePeerEvents = {
  methodName: "SubscribePeerEvents",
  service: Lightning,
  requestStream: false,
  responseStream: true,
  requestType: lnd_pb.PeerEventSubscription,
  responseType: lnd_pb.PeerEvent
};

Lightning.GetInfo = {
  methodName: "GetInfo",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.GetInfoRequest,
  responseType: lnd_pb.GetInfoResponse
};

Lightning.GetRecoveryInfo = {
  methodName: "GetRecoveryInfo",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.GetRecoveryInfoRequest,
  responseType: lnd_pb.GetRecoveryInfoResponse
};

Lightning.PendingChannels = {
  methodName: "PendingChannels",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.PendingChannelsRequest,
  responseType: lnd_pb.PendingChannelsResponse
};

Lightning.ListChannels = {
  methodName: "ListChannels",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.ListChannelsRequest,
  responseType: lnd_pb.ListChannelsResponse
};

Lightning.SubscribeChannelEvents = {
  methodName: "SubscribeChannelEvents",
  service: Lightning,
  requestStream: false,
  responseStream: true,
  requestType: lnd_pb.ChannelEventSubscription,
  responseType: lnd_pb.ChannelEventUpdate
};

Lightning.ClosedChannels = {
  methodName: "ClosedChannels",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.ClosedChannelsRequest,
  responseType: lnd_pb.ClosedChannelsResponse
};

Lightning.OpenChannelSync = {
  methodName: "OpenChannelSync",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.OpenChannelRequest,
  responseType: lnd_pb.ChannelPoint
};

Lightning.OpenChannel = {
  methodName: "OpenChannel",
  service: Lightning,
  requestStream: false,
  responseStream: true,
  requestType: lnd_pb.OpenChannelRequest,
  responseType: lnd_pb.OpenStatusUpdate
};

Lightning.BatchOpenChannel = {
  methodName: "BatchOpenChannel",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.BatchOpenChannelRequest,
  responseType: lnd_pb.BatchOpenChannelResponse
};

Lightning.FundingStateStep = {
  methodName: "FundingStateStep",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.FundingTransitionMsg,
  responseType: lnd_pb.FundingStateStepResp
};

Lightning.ChannelAcceptor = {
  methodName: "ChannelAcceptor",
  service: Lightning,
  requestStream: true,
  responseStream: true,
  requestType: lnd_pb.ChannelAcceptResponse,
  responseType: lnd_pb.ChannelAcceptRequest
};

Lightning.CloseChannel = {
  methodName: "CloseChannel",
  service: Lightning,
  requestStream: false,
  responseStream: true,
  requestType: lnd_pb.CloseChannelRequest,
  responseType: lnd_pb.CloseStatusUpdate
};

Lightning.AbandonChannel = {
  methodName: "AbandonChannel",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.AbandonChannelRequest,
  responseType: lnd_pb.AbandonChannelResponse
};

Lightning.SendPayment = {
  methodName: "SendPayment",
  service: Lightning,
  requestStream: true,
  responseStream: true,
  requestType: lnd_pb.SendRequest,
  responseType: lnd_pb.SendResponse
};

Lightning.SendPaymentSync = {
  methodName: "SendPaymentSync",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.SendRequest,
  responseType: lnd_pb.SendResponse
};

Lightning.SendToRoute = {
  methodName: "SendToRoute",
  service: Lightning,
  requestStream: true,
  responseStream: true,
  requestType: lnd_pb.SendToRouteRequest,
  responseType: lnd_pb.SendResponse
};

Lightning.SendToRouteSync = {
  methodName: "SendToRouteSync",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.SendToRouteRequest,
  responseType: lnd_pb.SendResponse
};

Lightning.AddInvoice = {
  methodName: "AddInvoice",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.Invoice,
  responseType: lnd_pb.AddInvoiceResponse
};

Lightning.ListInvoices = {
  methodName: "ListInvoices",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.ListInvoiceRequest,
  responseType: lnd_pb.ListInvoiceResponse
};

Lightning.LookupInvoice = {
  methodName: "LookupInvoice",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.PaymentHash,
  responseType: lnd_pb.Invoice
};

Lightning.SubscribeInvoices = {
  methodName: "SubscribeInvoices",
  service: Lightning,
  requestStream: false,
  responseStream: true,
  requestType: lnd_pb.InvoiceSubscription,
  responseType: lnd_pb.Invoice
};

Lightning.DecodePayReq = {
  methodName: "DecodePayReq",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.PayReqString,
  responseType: lnd_pb.PayReq
};

Lightning.ListPayments = {
  methodName: "ListPayments",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.ListPaymentsRequest,
  responseType: lnd_pb.ListPaymentsResponse
};

Lightning.DeletePayment = {
  methodName: "DeletePayment",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.DeletePaymentRequest,
  responseType: lnd_pb.DeletePaymentResponse
};

Lightning.DeleteAllPayments = {
  methodName: "DeleteAllPayments",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.DeleteAllPaymentsRequest,
  responseType: lnd_pb.DeleteAllPaymentsResponse
};

Lightning.DescribeGraph = {
  methodName: "DescribeGraph",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.ChannelGraphRequest,
  responseType: lnd_pb.ChannelGraph
};

Lightning.GetNodeMetrics = {
  methodName: "GetNodeMetrics",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.NodeMetricsRequest,
  responseType: lnd_pb.NodeMetricsResponse
};

Lightning.GetChanInfo = {
  methodName: "GetChanInfo",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.ChanInfoRequest,
  responseType: lnd_pb.ChannelEdge
};

Lightning.GetNodeInfo = {
  methodName: "GetNodeInfo",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.NodeInfoRequest,
  responseType: lnd_pb.NodeInfo
};

Lightning.QueryRoutes = {
  methodName: "QueryRoutes",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.QueryRoutesRequest,
  responseType: lnd_pb.QueryRoutesResponse
};

Lightning.GetNetworkInfo = {
  methodName: "GetNetworkInfo",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.NetworkInfoRequest,
  responseType: lnd_pb.NetworkInfo
};

Lightning.StopDaemon = {
  methodName: "StopDaemon",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.StopRequest,
  responseType: lnd_pb.StopResponse
};

Lightning.SubscribeChannelGraph = {
  methodName: "SubscribeChannelGraph",
  service: Lightning,
  requestStream: false,
  responseStream: true,
  requestType: lnd_pb.GraphTopologySubscription,
  responseType: lnd_pb.GraphTopologyUpdate
};

Lightning.DebugLevel = {
  methodName: "DebugLevel",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.DebugLevelRequest,
  responseType: lnd_pb.DebugLevelResponse
};

Lightning.FeeReport = {
  methodName: "FeeReport",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.FeeReportRequest,
  responseType: lnd_pb.FeeReportResponse
};

Lightning.UpdateChannelPolicy = {
  methodName: "UpdateChannelPolicy",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.PolicyUpdateRequest,
  responseType: lnd_pb.PolicyUpdateResponse
};

Lightning.ForwardingHistory = {
  methodName: "ForwardingHistory",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.ForwardingHistoryRequest,
  responseType: lnd_pb.ForwardingHistoryResponse
};

Lightning.ExportChannelBackup = {
  methodName: "ExportChannelBackup",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.ExportChannelBackupRequest,
  responseType: lnd_pb.ChannelBackup
};

Lightning.ExportAllChannelBackups = {
  methodName: "ExportAllChannelBackups",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.ChanBackupExportRequest,
  responseType: lnd_pb.ChanBackupSnapshot
};

Lightning.VerifyChanBackup = {
  methodName: "VerifyChanBackup",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.ChanBackupSnapshot,
  responseType: lnd_pb.VerifyChanBackupResponse
};

Lightning.RestoreChannelBackups = {
  methodName: "RestoreChannelBackups",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.RestoreChanBackupRequest,
  responseType: lnd_pb.RestoreBackupResponse
};

Lightning.SubscribeChannelBackups = {
  methodName: "SubscribeChannelBackups",
  service: Lightning,
  requestStream: false,
  responseStream: true,
  requestType: lnd_pb.ChannelBackupSubscription,
  responseType: lnd_pb.ChanBackupSnapshot
};

Lightning.BakeMacaroon = {
  methodName: "BakeMacaroon",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.BakeMacaroonRequest,
  responseType: lnd_pb.BakeMacaroonResponse
};

Lightning.ListMacaroonIDs = {
  methodName: "ListMacaroonIDs",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.ListMacaroonIDsRequest,
  responseType: lnd_pb.ListMacaroonIDsResponse
};

Lightning.DeleteMacaroonID = {
  methodName: "DeleteMacaroonID",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.DeleteMacaroonIDRequest,
  responseType: lnd_pb.DeleteMacaroonIDResponse
};

Lightning.ListPermissions = {
  methodName: "ListPermissions",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.ListPermissionsRequest,
  responseType: lnd_pb.ListPermissionsResponse
};

Lightning.CheckMacaroonPermissions = {
  methodName: "CheckMacaroonPermissions",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.CheckMacPermRequest,
  responseType: lnd_pb.CheckMacPermResponse
};

Lightning.RegisterRPCMiddleware = {
  methodName: "RegisterRPCMiddleware",
  service: Lightning,
  requestStream: true,
  responseStream: true,
  requestType: lnd_pb.RPCMiddlewareResponse,
  responseType: lnd_pb.RPCMiddlewareRequest
};

Lightning.SendCustomMessage = {
  methodName: "SendCustomMessage",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.SendCustomMessageRequest,
  responseType: lnd_pb.SendCustomMessageResponse
};

Lightning.SubscribeCustomMessages = {
  methodName: "SubscribeCustomMessages",
  service: Lightning,
  requestStream: false,
  responseStream: true,
  requestType: lnd_pb.SubscribeCustomMessagesRequest,
  responseType: lnd_pb.CustomMessage
};

Lightning.ListAliases = {
  methodName: "ListAliases",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.ListAliasesRequest,
  responseType: lnd_pb.ListAliasesResponse
};

Lightning.LookupHtlcResolution = {
  methodName: "LookupHtlcResolution",
  service: Lightning,
  requestStream: false,
  responseStream: false,
  requestType: lnd_pb.LookupHtlcResolutionRequest,
  responseType: lnd_pb.LookupHtlcResolutionResponse
};

exports.Lightning = Lightning;

function LightningClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

LightningClient.prototype.walletBalance = function walletBalance(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.WalletBalance, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.channelBalance = function channelBalance(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.ChannelBalance, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.getTransactions = function getTransactions(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.GetTransactions, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.estimateFee = function estimateFee(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.EstimateFee, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.sendCoins = function sendCoins(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.SendCoins, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.listUnspent = function listUnspent(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.ListUnspent, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.subscribeTransactions = function subscribeTransactions(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(Lightning.SubscribeTransactions, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners.end.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

LightningClient.prototype.sendMany = function sendMany(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.SendMany, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.newAddress = function newAddress(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.NewAddress, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.signMessage = function signMessage(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.SignMessage, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.verifyMessage = function verifyMessage(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.VerifyMessage, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.connectPeer = function connectPeer(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.ConnectPeer, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.disconnectPeer = function disconnectPeer(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.DisconnectPeer, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.listPeers = function listPeers(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.ListPeers, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.subscribePeerEvents = function subscribePeerEvents(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(Lightning.SubscribePeerEvents, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners.end.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

LightningClient.prototype.getInfo = function getInfo(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.GetInfo, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.getRecoveryInfo = function getRecoveryInfo(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.GetRecoveryInfo, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.pendingChannels = function pendingChannels(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.PendingChannels, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.listChannels = function listChannels(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.ListChannels, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.subscribeChannelEvents = function subscribeChannelEvents(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(Lightning.SubscribeChannelEvents, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners.end.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

LightningClient.prototype.closedChannels = function closedChannels(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.ClosedChannels, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.openChannelSync = function openChannelSync(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.OpenChannelSync, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.openChannel = function openChannel(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(Lightning.OpenChannel, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners.end.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

LightningClient.prototype.batchOpenChannel = function batchOpenChannel(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.BatchOpenChannel, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.fundingStateStep = function fundingStateStep(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.FundingStateStep, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.channelAcceptor = function channelAcceptor(metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.client(Lightning.ChannelAcceptor, {
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport
  });
  client.onEnd(function (status, statusMessage, trailers) {
    listeners.status.forEach(function (handler) {
      handler({ code: status, details: statusMessage, metadata: trailers });
    });
    listeners.end.forEach(function (handler) {
      handler({ code: status, details: statusMessage, metadata: trailers });
    });
    listeners = null;
  });
  client.onMessage(function (message) {
    listeners.data.forEach(function (handler) {
      handler(message);
    })
  });
  client.start(metadata);
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    write: function (requestMessage) {
      client.send(requestMessage);
      return this;
    },
    end: function () {
      client.finishSend();
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

LightningClient.prototype.closeChannel = function closeChannel(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(Lightning.CloseChannel, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners.end.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

LightningClient.prototype.abandonChannel = function abandonChannel(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.AbandonChannel, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.sendPayment = function sendPayment(metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.client(Lightning.SendPayment, {
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport
  });
  client.onEnd(function (status, statusMessage, trailers) {
    listeners.status.forEach(function (handler) {
      handler({ code: status, details: statusMessage, metadata: trailers });
    });
    listeners.end.forEach(function (handler) {
      handler({ code: status, details: statusMessage, metadata: trailers });
    });
    listeners = null;
  });
  client.onMessage(function (message) {
    listeners.data.forEach(function (handler) {
      handler(message);
    })
  });
  client.start(metadata);
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    write: function (requestMessage) {
      client.send(requestMessage);
      return this;
    },
    end: function () {
      client.finishSend();
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

LightningClient.prototype.sendPaymentSync = function sendPaymentSync(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.SendPaymentSync, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.sendToRoute = function sendToRoute(metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.client(Lightning.SendToRoute, {
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport
  });
  client.onEnd(function (status, statusMessage, trailers) {
    listeners.status.forEach(function (handler) {
      handler({ code: status, details: statusMessage, metadata: trailers });
    });
    listeners.end.forEach(function (handler) {
      handler({ code: status, details: statusMessage, metadata: trailers });
    });
    listeners = null;
  });
  client.onMessage(function (message) {
    listeners.data.forEach(function (handler) {
      handler(message);
    })
  });
  client.start(metadata);
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    write: function (requestMessage) {
      client.send(requestMessage);
      return this;
    },
    end: function () {
      client.finishSend();
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

LightningClient.prototype.sendToRouteSync = function sendToRouteSync(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.SendToRouteSync, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.addInvoice = function addInvoice(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.AddInvoice, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.listInvoices = function listInvoices(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.ListInvoices, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.lookupInvoice = function lookupInvoice(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.LookupInvoice, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.subscribeInvoices = function subscribeInvoices(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(Lightning.SubscribeInvoices, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners.end.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

LightningClient.prototype.decodePayReq = function decodePayReq(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.DecodePayReq, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.listPayments = function listPayments(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.ListPayments, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.deletePayment = function deletePayment(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.DeletePayment, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.deleteAllPayments = function deleteAllPayments(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.DeleteAllPayments, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.describeGraph = function describeGraph(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.DescribeGraph, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.getNodeMetrics = function getNodeMetrics(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.GetNodeMetrics, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.getChanInfo = function getChanInfo(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.GetChanInfo, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.getNodeInfo = function getNodeInfo(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.GetNodeInfo, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.queryRoutes = function queryRoutes(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.QueryRoutes, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.getNetworkInfo = function getNetworkInfo(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.GetNetworkInfo, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.stopDaemon = function stopDaemon(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.StopDaemon, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.subscribeChannelGraph = function subscribeChannelGraph(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(Lightning.SubscribeChannelGraph, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners.end.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

LightningClient.prototype.debugLevel = function debugLevel(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.DebugLevel, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.feeReport = function feeReport(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.FeeReport, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.updateChannelPolicy = function updateChannelPolicy(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.UpdateChannelPolicy, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.forwardingHistory = function forwardingHistory(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.ForwardingHistory, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.exportChannelBackup = function exportChannelBackup(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.ExportChannelBackup, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.exportAllChannelBackups = function exportAllChannelBackups(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.ExportAllChannelBackups, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.verifyChanBackup = function verifyChanBackup(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.VerifyChanBackup, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.restoreChannelBackups = function restoreChannelBackups(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.RestoreChannelBackups, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.subscribeChannelBackups = function subscribeChannelBackups(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(Lightning.SubscribeChannelBackups, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners.end.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

LightningClient.prototype.bakeMacaroon = function bakeMacaroon(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.BakeMacaroon, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.listMacaroonIDs = function listMacaroonIDs(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.ListMacaroonIDs, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.deleteMacaroonID = function deleteMacaroonID(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.DeleteMacaroonID, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.listPermissions = function listPermissions(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.ListPermissions, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.checkMacaroonPermissions = function checkMacaroonPermissions(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.CheckMacaroonPermissions, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.registerRPCMiddleware = function registerRPCMiddleware(metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.client(Lightning.RegisterRPCMiddleware, {
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport
  });
  client.onEnd(function (status, statusMessage, trailers) {
    listeners.status.forEach(function (handler) {
      handler({ code: status, details: statusMessage, metadata: trailers });
    });
    listeners.end.forEach(function (handler) {
      handler({ code: status, details: statusMessage, metadata: trailers });
    });
    listeners = null;
  });
  client.onMessage(function (message) {
    listeners.data.forEach(function (handler) {
      handler(message);
    })
  });
  client.start(metadata);
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    write: function (requestMessage) {
      client.send(requestMessage);
      return this;
    },
    end: function () {
      client.finishSend();
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

LightningClient.prototype.sendCustomMessage = function sendCustomMessage(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.SendCustomMessage, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.subscribeCustomMessages = function subscribeCustomMessages(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(Lightning.SubscribeCustomMessages, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners.end.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

LightningClient.prototype.listAliases = function listAliases(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.ListAliases, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

LightningClient.prototype.lookupHtlcResolution = function lookupHtlcResolution(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Lightning.LookupHtlcResolution, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

exports.LightningClient = LightningClient;

