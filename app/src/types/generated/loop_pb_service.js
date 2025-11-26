// package: looprpc
// file: loop.proto

var loop_pb = require("./loop_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var SwapClient = (function () {
  function SwapClient() {}
  SwapClient.serviceName = "looprpc.SwapClient";
  return SwapClient;
}());

SwapClient.LoopOut = {
  methodName: "LoopOut",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.LoopOutRequest,
  responseType: loop_pb.SwapResponse
};

SwapClient.LoopIn = {
  methodName: "LoopIn",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.LoopInRequest,
  responseType: loop_pb.SwapResponse
};

SwapClient.Monitor = {
  methodName: "Monitor",
  service: SwapClient,
  requestStream: false,
  responseStream: true,
  requestType: loop_pb.MonitorRequest,
  responseType: loop_pb.SwapStatus
};

SwapClient.ListSwaps = {
  methodName: "ListSwaps",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.ListSwapsRequest,
  responseType: loop_pb.ListSwapsResponse
};

SwapClient.SwapInfo = {
  methodName: "SwapInfo",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.SwapInfoRequest,
  responseType: loop_pb.SwapStatus
};

SwapClient.AbandonSwap = {
  methodName: "AbandonSwap",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.AbandonSwapRequest,
  responseType: loop_pb.AbandonSwapResponse
};

SwapClient.LoopOutTerms = {
  methodName: "LoopOutTerms",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.TermsRequest,
  responseType: loop_pb.OutTermsResponse
};

SwapClient.LoopOutQuote = {
  methodName: "LoopOutQuote",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.QuoteRequest,
  responseType: loop_pb.OutQuoteResponse
};

SwapClient.GetLoopInTerms = {
  methodName: "GetLoopInTerms",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.TermsRequest,
  responseType: loop_pb.InTermsResponse
};

SwapClient.GetLoopInQuote = {
  methodName: "GetLoopInQuote",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.QuoteRequest,
  responseType: loop_pb.InQuoteResponse
};

SwapClient.Probe = {
  methodName: "Probe",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.ProbeRequest,
  responseType: loop_pb.ProbeResponse
};

SwapClient.GetL402Tokens = {
  methodName: "GetL402Tokens",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.TokensRequest,
  responseType: loop_pb.TokensResponse
};

SwapClient.GetLsatTokens = {
  methodName: "GetLsatTokens",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.TokensRequest,
  responseType: loop_pb.TokensResponse
};

SwapClient.FetchL402Token = {
  methodName: "FetchL402Token",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.FetchL402TokenRequest,
  responseType: loop_pb.FetchL402TokenResponse
};

SwapClient.GetInfo = {
  methodName: "GetInfo",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.GetInfoRequest,
  responseType: loop_pb.GetInfoResponse
};

SwapClient.StopDaemon = {
  methodName: "StopDaemon",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.StopDaemonRequest,
  responseType: loop_pb.StopDaemonResponse
};

SwapClient.GetLiquidityParams = {
  methodName: "GetLiquidityParams",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.GetLiquidityParamsRequest,
  responseType: loop_pb.LiquidityParameters
};

SwapClient.SetLiquidityParams = {
  methodName: "SetLiquidityParams",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.SetLiquidityParamsRequest,
  responseType: loop_pb.SetLiquidityParamsResponse
};

SwapClient.SuggestSwaps = {
  methodName: "SuggestSwaps",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.SuggestSwapsRequest,
  responseType: loop_pb.SuggestSwapsResponse
};

SwapClient.ListReservations = {
  methodName: "ListReservations",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.ListReservationsRequest,
  responseType: loop_pb.ListReservationsResponse
};

SwapClient.InstantOut = {
  methodName: "InstantOut",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.InstantOutRequest,
  responseType: loop_pb.InstantOutResponse
};

SwapClient.InstantOutQuote = {
  methodName: "InstantOutQuote",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.InstantOutQuoteRequest,
  responseType: loop_pb.InstantOutQuoteResponse
};

SwapClient.ListInstantOuts = {
  methodName: "ListInstantOuts",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.ListInstantOutsRequest,
  responseType: loop_pb.ListInstantOutsResponse
};

SwapClient.NewStaticAddress = {
  methodName: "NewStaticAddress",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.NewStaticAddressRequest,
  responseType: loop_pb.NewStaticAddressResponse
};

SwapClient.ListUnspentDeposits = {
  methodName: "ListUnspentDeposits",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.ListUnspentDepositsRequest,
  responseType: loop_pb.ListUnspentDepositsResponse
};

SwapClient.WithdrawDeposits = {
  methodName: "WithdrawDeposits",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.WithdrawDepositsRequest,
  responseType: loop_pb.WithdrawDepositsResponse
};

SwapClient.ListStaticAddressDeposits = {
  methodName: "ListStaticAddressDeposits",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.ListStaticAddressDepositsRequest,
  responseType: loop_pb.ListStaticAddressDepositsResponse
};

SwapClient.ListStaticAddressWithdrawals = {
  methodName: "ListStaticAddressWithdrawals",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.ListStaticAddressWithdrawalRequest,
  responseType: loop_pb.ListStaticAddressWithdrawalResponse
};

SwapClient.ListStaticAddressSwaps = {
  methodName: "ListStaticAddressSwaps",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.ListStaticAddressSwapsRequest,
  responseType: loop_pb.ListStaticAddressSwapsResponse
};

SwapClient.GetStaticAddressSummary = {
  methodName: "GetStaticAddressSummary",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.StaticAddressSummaryRequest,
  responseType: loop_pb.StaticAddressSummaryResponse
};

SwapClient.StaticAddressLoopIn = {
  methodName: "StaticAddressLoopIn",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.StaticAddressLoopInRequest,
  responseType: loop_pb.StaticAddressLoopInResponse
};

exports.SwapClient = SwapClient;

function SwapClientClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

SwapClientClient.prototype.loopOut = function loopOut(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.LoopOut, {
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

SwapClientClient.prototype.loopIn = function loopIn(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.LoopIn, {
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

SwapClientClient.prototype.monitor = function monitor(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(SwapClient.Monitor, {
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

SwapClientClient.prototype.listSwaps = function listSwaps(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.ListSwaps, {
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

SwapClientClient.prototype.swapInfo = function swapInfo(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.SwapInfo, {
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

SwapClientClient.prototype.abandonSwap = function abandonSwap(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.AbandonSwap, {
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

SwapClientClient.prototype.loopOutTerms = function loopOutTerms(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.LoopOutTerms, {
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

SwapClientClient.prototype.loopOutQuote = function loopOutQuote(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.LoopOutQuote, {
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

SwapClientClient.prototype.getLoopInTerms = function getLoopInTerms(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.GetLoopInTerms, {
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

SwapClientClient.prototype.getLoopInQuote = function getLoopInQuote(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.GetLoopInQuote, {
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

SwapClientClient.prototype.probe = function probe(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.Probe, {
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

SwapClientClient.prototype.getL402Tokens = function getL402Tokens(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.GetL402Tokens, {
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

SwapClientClient.prototype.getLsatTokens = function getLsatTokens(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.GetLsatTokens, {
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

SwapClientClient.prototype.fetchL402Token = function fetchL402Token(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.FetchL402Token, {
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

SwapClientClient.prototype.getInfo = function getInfo(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.GetInfo, {
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

SwapClientClient.prototype.stopDaemon = function stopDaemon(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.StopDaemon, {
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

SwapClientClient.prototype.getLiquidityParams = function getLiquidityParams(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.GetLiquidityParams, {
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

SwapClientClient.prototype.setLiquidityParams = function setLiquidityParams(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.SetLiquidityParams, {
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

SwapClientClient.prototype.suggestSwaps = function suggestSwaps(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.SuggestSwaps, {
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

SwapClientClient.prototype.listReservations = function listReservations(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.ListReservations, {
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

SwapClientClient.prototype.instantOut = function instantOut(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.InstantOut, {
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

SwapClientClient.prototype.instantOutQuote = function instantOutQuote(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.InstantOutQuote, {
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

SwapClientClient.prototype.listInstantOuts = function listInstantOuts(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.ListInstantOuts, {
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

SwapClientClient.prototype.newStaticAddress = function newStaticAddress(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.NewStaticAddress, {
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

SwapClientClient.prototype.listUnspentDeposits = function listUnspentDeposits(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.ListUnspentDeposits, {
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

SwapClientClient.prototype.withdrawDeposits = function withdrawDeposits(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.WithdrawDeposits, {
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

SwapClientClient.prototype.listStaticAddressDeposits = function listStaticAddressDeposits(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.ListStaticAddressDeposits, {
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

SwapClientClient.prototype.listStaticAddressWithdrawals = function listStaticAddressWithdrawals(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.ListStaticAddressWithdrawals, {
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

SwapClientClient.prototype.listStaticAddressSwaps = function listStaticAddressSwaps(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.ListStaticAddressSwaps, {
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

SwapClientClient.prototype.getStaticAddressSummary = function getStaticAddressSummary(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.GetStaticAddressSummary, {
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

SwapClientClient.prototype.staticAddressLoopIn = function staticAddressLoopIn(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SwapClient.StaticAddressLoopIn, {
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

exports.SwapClientClient = SwapClientClient;

