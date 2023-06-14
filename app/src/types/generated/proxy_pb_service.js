// package: litrpc
// file: proxy.proto

var proxy_pb = require("./proxy_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var Proxy = (function () {
  function Proxy() {}
  Proxy.serviceName = "litrpc.Proxy";
  return Proxy;
}());

Proxy.GetInfo = {
  methodName: "GetInfo",
  service: Proxy,
  requestStream: false,
  responseStream: false,
  requestType: proxy_pb.GetInfoRequest,
  responseType: proxy_pb.GetInfoResponse
};

Proxy.StopDaemon = {
  methodName: "StopDaemon",
  service: Proxy,
  requestStream: false,
  responseStream: false,
  requestType: proxy_pb.StopDaemonRequest,
  responseType: proxy_pb.StopDaemonResponse
};

Proxy.BakeSuperMacaroon = {
  methodName: "BakeSuperMacaroon",
  service: Proxy,
  requestStream: false,
  responseStream: false,
  requestType: proxy_pb.BakeSuperMacaroonRequest,
  responseType: proxy_pb.BakeSuperMacaroonResponse
};

exports.Proxy = Proxy;

function ProxyClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

ProxyClient.prototype.getInfo = function getInfo(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Proxy.GetInfo, {
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

ProxyClient.prototype.stopDaemon = function stopDaemon(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Proxy.StopDaemon, {
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

ProxyClient.prototype.bakeSuperMacaroon = function bakeSuperMacaroon(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Proxy.BakeSuperMacaroon, {
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

exports.ProxyClient = ProxyClient;

