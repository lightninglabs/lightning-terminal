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

SwapClient.GetLsatTokens = {
  methodName: "GetLsatTokens",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.TokensRequest,
  responseType: loop_pb.TokensResponse
};

SwapClient.GetInfo = {
  methodName: "GetInfo",
  service: SwapClient,
  requestStream: false,
  responseStream: false,
  requestType: loop_pb.GetInfoRequest,
  responseType: loop_pb.GetInfoResponse
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

exports.SwapClientClient = SwapClientClient;

