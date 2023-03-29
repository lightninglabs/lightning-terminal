// package: looprpc
// file: swapserverrpc/server.proto

var swapserverrpc_server_pb = require("../swapserverrpc/server_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var SwapServer = (function () {
  function SwapServer() {}
  SwapServer.serviceName = "looprpc.SwapServer";
  return SwapServer;
}());

SwapServer.LoopOutTerms = {
  methodName: "LoopOutTerms",
  service: SwapServer,
  requestStream: false,
  responseStream: false,
  requestType: swapserverrpc_server_pb.ServerLoopOutTermsRequest,
  responseType: swapserverrpc_server_pb.ServerLoopOutTerms
};

SwapServer.NewLoopOutSwap = {
  methodName: "NewLoopOutSwap",
  service: SwapServer,
  requestStream: false,
  responseStream: false,
  requestType: swapserverrpc_server_pb.ServerLoopOutRequest,
  responseType: swapserverrpc_server_pb.ServerLoopOutResponse
};

SwapServer.LoopOutPushPreimage = {
  methodName: "LoopOutPushPreimage",
  service: SwapServer,
  requestStream: false,
  responseStream: false,
  requestType: swapserverrpc_server_pb.ServerLoopOutPushPreimageRequest,
  responseType: swapserverrpc_server_pb.ServerLoopOutPushPreimageResponse
};

SwapServer.LoopOutQuote = {
  methodName: "LoopOutQuote",
  service: SwapServer,
  requestStream: false,
  responseStream: false,
  requestType: swapserverrpc_server_pb.ServerLoopOutQuoteRequest,
  responseType: swapserverrpc_server_pb.ServerLoopOutQuote
};

SwapServer.LoopInTerms = {
  methodName: "LoopInTerms",
  service: SwapServer,
  requestStream: false,
  responseStream: false,
  requestType: swapserverrpc_server_pb.ServerLoopInTermsRequest,
  responseType: swapserverrpc_server_pb.ServerLoopInTerms
};

SwapServer.NewLoopInSwap = {
  methodName: "NewLoopInSwap",
  service: SwapServer,
  requestStream: false,
  responseStream: false,
  requestType: swapserverrpc_server_pb.ServerLoopInRequest,
  responseType: swapserverrpc_server_pb.ServerLoopInResponse
};

SwapServer.LoopInQuote = {
  methodName: "LoopInQuote",
  service: SwapServer,
  requestStream: false,
  responseStream: false,
  requestType: swapserverrpc_server_pb.ServerLoopInQuoteRequest,
  responseType: swapserverrpc_server_pb.ServerLoopInQuoteResponse
};

SwapServer.SubscribeLoopOutUpdates = {
  methodName: "SubscribeLoopOutUpdates",
  service: SwapServer,
  requestStream: false,
  responseStream: true,
  requestType: swapserverrpc_server_pb.SubscribeUpdatesRequest,
  responseType: swapserverrpc_server_pb.SubscribeLoopOutUpdatesResponse
};

SwapServer.SubscribeLoopInUpdates = {
  methodName: "SubscribeLoopInUpdates",
  service: SwapServer,
  requestStream: false,
  responseStream: true,
  requestType: swapserverrpc_server_pb.SubscribeUpdatesRequest,
  responseType: swapserverrpc_server_pb.SubscribeLoopInUpdatesResponse
};

SwapServer.CancelLoopOutSwap = {
  methodName: "CancelLoopOutSwap",
  service: SwapServer,
  requestStream: false,
  responseStream: false,
  requestType: swapserverrpc_server_pb.CancelLoopOutSwapRequest,
  responseType: swapserverrpc_server_pb.CancelLoopOutSwapResponse
};

SwapServer.Probe = {
  methodName: "Probe",
  service: SwapServer,
  requestStream: false,
  responseStream: false,
  requestType: swapserverrpc_server_pb.ServerProbeRequest,
  responseType: swapserverrpc_server_pb.ServerProbeResponse
};

SwapServer.RecommendRoutingPlugin = {
  methodName: "RecommendRoutingPlugin",
  service: SwapServer,
  requestStream: false,
  responseStream: false,
  requestType: swapserverrpc_server_pb.RecommendRoutingPluginReq,
  responseType: swapserverrpc_server_pb.RecommendRoutingPluginRes
};

SwapServer.ReportRoutingResult = {
  methodName: "ReportRoutingResult",
  service: SwapServer,
  requestStream: false,
  responseStream: false,
  requestType: swapserverrpc_server_pb.ReportRoutingResultReq,
  responseType: swapserverrpc_server_pb.ReportRoutingResultRes
};

SwapServer.MuSig2SignSweep = {
  methodName: "MuSig2SignSweep",
  service: SwapServer,
  requestStream: false,
  responseStream: false,
  requestType: swapserverrpc_server_pb.MuSig2SignSweepReq,
  responseType: swapserverrpc_server_pb.MuSig2SignSweepRes
};

SwapServer.PushKey = {
  methodName: "PushKey",
  service: SwapServer,
  requestStream: false,
  responseStream: false,
  requestType: swapserverrpc_server_pb.ServerPushKeyReq,
  responseType: swapserverrpc_server_pb.ServerPushKeyRes
};

exports.SwapServer = SwapServer;

function SwapServerClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

SwapServerClient.prototype.loopOutTerms = function loopOutTerms(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapServer.LoopOutTerms, {
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

SwapServerClient.prototype.newLoopOutSwap = function newLoopOutSwap(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapServer.NewLoopOutSwap, {
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

SwapServerClient.prototype.loopOutPushPreimage = function loopOutPushPreimage(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapServer.LoopOutPushPreimage, {
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

SwapServerClient.prototype.loopOutQuote = function loopOutQuote(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapServer.LoopOutQuote, {
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

SwapServerClient.prototype.loopInTerms = function loopInTerms(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapServer.LoopInTerms, {
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

SwapServerClient.prototype.newLoopInSwap = function newLoopInSwap(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapServer.NewLoopInSwap, {
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

SwapServerClient.prototype.loopInQuote = function loopInQuote(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapServer.LoopInQuote, {
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

SwapServerClient.prototype.subscribeLoopOutUpdates = function subscribeLoopOutUpdates(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(SwapServer.SubscribeLoopOutUpdates, {
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

SwapServerClient.prototype.subscribeLoopInUpdates = function subscribeLoopInUpdates(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(SwapServer.SubscribeLoopInUpdates, {
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

SwapServerClient.prototype.cancelLoopOutSwap = function cancelLoopOutSwap(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapServer.CancelLoopOutSwap, {
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

SwapServerClient.prototype.probe = function probe(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapServer.Probe, {
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

SwapServerClient.prototype.recommendRoutingPlugin = function recommendRoutingPlugin(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapServer.RecommendRoutingPlugin, {
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

SwapServerClient.prototype.reportRoutingResult = function reportRoutingResult(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapServer.ReportRoutingResult, {
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

SwapServerClient.prototype.muSig2SignSweep = function muSig2SignSweep(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapServer.MuSig2SignSweep, {
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

SwapServerClient.prototype.pushKey = function pushKey(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapServer.PushKey, {
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

exports.SwapServerClient = SwapServerClient;

