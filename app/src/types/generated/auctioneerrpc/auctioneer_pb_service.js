// package: poolrpc
// file: auctioneerrpc/auctioneer.proto

var auctioneerrpc_auctioneer_pb = require("../auctioneerrpc/auctioneer_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var ChannelAuctioneer = (function () {
  function ChannelAuctioneer() {}
  ChannelAuctioneer.serviceName = "poolrpc.ChannelAuctioneer";
  return ChannelAuctioneer;
}());

ChannelAuctioneer.ReserveAccount = {
  methodName: "ReserveAccount",
  service: ChannelAuctioneer,
  requestStream: false,
  responseStream: false,
  requestType: auctioneerrpc_auctioneer_pb.ReserveAccountRequest,
  responseType: auctioneerrpc_auctioneer_pb.ReserveAccountResponse
};

ChannelAuctioneer.InitAccount = {
  methodName: "InitAccount",
  service: ChannelAuctioneer,
  requestStream: false,
  responseStream: false,
  requestType: auctioneerrpc_auctioneer_pb.ServerInitAccountRequest,
  responseType: auctioneerrpc_auctioneer_pb.ServerInitAccountResponse
};

ChannelAuctioneer.ModifyAccount = {
  methodName: "ModifyAccount",
  service: ChannelAuctioneer,
  requestStream: false,
  responseStream: false,
  requestType: auctioneerrpc_auctioneer_pb.ServerModifyAccountRequest,
  responseType: auctioneerrpc_auctioneer_pb.ServerModifyAccountResponse
};

ChannelAuctioneer.SubmitOrder = {
  methodName: "SubmitOrder",
  service: ChannelAuctioneer,
  requestStream: false,
  responseStream: false,
  requestType: auctioneerrpc_auctioneer_pb.ServerSubmitOrderRequest,
  responseType: auctioneerrpc_auctioneer_pb.ServerSubmitOrderResponse
};

ChannelAuctioneer.CancelOrder = {
  methodName: "CancelOrder",
  service: ChannelAuctioneer,
  requestStream: false,
  responseStream: false,
  requestType: auctioneerrpc_auctioneer_pb.ServerCancelOrderRequest,
  responseType: auctioneerrpc_auctioneer_pb.ServerCancelOrderResponse
};

ChannelAuctioneer.OrderState = {
  methodName: "OrderState",
  service: ChannelAuctioneer,
  requestStream: false,
  responseStream: false,
  requestType: auctioneerrpc_auctioneer_pb.ServerOrderStateRequest,
  responseType: auctioneerrpc_auctioneer_pb.ServerOrderStateResponse
};

ChannelAuctioneer.SubscribeBatchAuction = {
  methodName: "SubscribeBatchAuction",
  service: ChannelAuctioneer,
  requestStream: true,
  responseStream: true,
  requestType: auctioneerrpc_auctioneer_pb.ClientAuctionMessage,
  responseType: auctioneerrpc_auctioneer_pb.ServerAuctionMessage
};

ChannelAuctioneer.SubscribeSidecar = {
  methodName: "SubscribeSidecar",
  service: ChannelAuctioneer,
  requestStream: true,
  responseStream: true,
  requestType: auctioneerrpc_auctioneer_pb.ClientAuctionMessage,
  responseType: auctioneerrpc_auctioneer_pb.ServerAuctionMessage
};

ChannelAuctioneer.Terms = {
  methodName: "Terms",
  service: ChannelAuctioneer,
  requestStream: false,
  responseStream: false,
  requestType: auctioneerrpc_auctioneer_pb.TermsRequest,
  responseType: auctioneerrpc_auctioneer_pb.TermsResponse
};

ChannelAuctioneer.RelevantBatchSnapshot = {
  methodName: "RelevantBatchSnapshot",
  service: ChannelAuctioneer,
  requestStream: false,
  responseStream: false,
  requestType: auctioneerrpc_auctioneer_pb.RelevantBatchRequest,
  responseType: auctioneerrpc_auctioneer_pb.RelevantBatch
};

ChannelAuctioneer.BatchSnapshot = {
  methodName: "BatchSnapshot",
  service: ChannelAuctioneer,
  requestStream: false,
  responseStream: false,
  requestType: auctioneerrpc_auctioneer_pb.BatchSnapshotRequest,
  responseType: auctioneerrpc_auctioneer_pb.BatchSnapshotResponse
};

ChannelAuctioneer.NodeRating = {
  methodName: "NodeRating",
  service: ChannelAuctioneer,
  requestStream: false,
  responseStream: false,
  requestType: auctioneerrpc_auctioneer_pb.ServerNodeRatingRequest,
  responseType: auctioneerrpc_auctioneer_pb.ServerNodeRatingResponse
};

ChannelAuctioneer.BatchSnapshots = {
  methodName: "BatchSnapshots",
  service: ChannelAuctioneer,
  requestStream: false,
  responseStream: false,
  requestType: auctioneerrpc_auctioneer_pb.BatchSnapshotsRequest,
  responseType: auctioneerrpc_auctioneer_pb.BatchSnapshotsResponse
};

ChannelAuctioneer.MarketInfo = {
  methodName: "MarketInfo",
  service: ChannelAuctioneer,
  requestStream: false,
  responseStream: false,
  requestType: auctioneerrpc_auctioneer_pb.MarketInfoRequest,
  responseType: auctioneerrpc_auctioneer_pb.MarketInfoResponse
};

exports.ChannelAuctioneer = ChannelAuctioneer;

function ChannelAuctioneerClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

ChannelAuctioneerClient.prototype.reserveAccount = function reserveAccount(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ChannelAuctioneer.ReserveAccount, {
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

ChannelAuctioneerClient.prototype.initAccount = function initAccount(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ChannelAuctioneer.InitAccount, {
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

ChannelAuctioneerClient.prototype.modifyAccount = function modifyAccount(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ChannelAuctioneer.ModifyAccount, {
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

ChannelAuctioneerClient.prototype.submitOrder = function submitOrder(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ChannelAuctioneer.SubmitOrder, {
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

ChannelAuctioneerClient.prototype.cancelOrder = function cancelOrder(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ChannelAuctioneer.CancelOrder, {
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

ChannelAuctioneerClient.prototype.orderState = function orderState(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ChannelAuctioneer.OrderState, {
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

ChannelAuctioneerClient.prototype.subscribeBatchAuction = function subscribeBatchAuction(metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.client(ChannelAuctioneer.SubscribeBatchAuction, {
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

ChannelAuctioneerClient.prototype.subscribeSidecar = function subscribeSidecar(metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.client(ChannelAuctioneer.SubscribeSidecar, {
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

ChannelAuctioneerClient.prototype.terms = function terms(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ChannelAuctioneer.Terms, {
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

ChannelAuctioneerClient.prototype.relevantBatchSnapshot = function relevantBatchSnapshot(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ChannelAuctioneer.RelevantBatchSnapshot, {
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

ChannelAuctioneerClient.prototype.batchSnapshot = function batchSnapshot(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ChannelAuctioneer.BatchSnapshot, {
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

ChannelAuctioneerClient.prototype.nodeRating = function nodeRating(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ChannelAuctioneer.NodeRating, {
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

ChannelAuctioneerClient.prototype.batchSnapshots = function batchSnapshots(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ChannelAuctioneer.BatchSnapshots, {
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

ChannelAuctioneerClient.prototype.marketInfo = function marketInfo(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ChannelAuctioneer.MarketInfo, {
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

exports.ChannelAuctioneerClient = ChannelAuctioneerClient;

