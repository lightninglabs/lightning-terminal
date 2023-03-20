// package: litrpc
// file: firewall.proto

var firewall_pb = require("./firewall_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var Firewall = (function () {
  function Firewall() {}
  Firewall.serviceName = "litrpc.Firewall";
  return Firewall;
}());

Firewall.ListActions = {
  methodName: "ListActions",
  service: Firewall,
  requestStream: false,
  responseStream: false,
  requestType: firewall_pb.ListActionsRequest,
  responseType: firewall_pb.ListActionsResponse
};

Firewall.PrivacyMapConversion = {
  methodName: "PrivacyMapConversion",
  service: Firewall,
  requestStream: false,
  responseStream: false,
  requestType: firewall_pb.PrivacyMapConversionRequest,
  responseType: firewall_pb.PrivacyMapConversionResponse
};

exports.Firewall = Firewall;

function FirewallClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

FirewallClient.prototype.listActions = function listActions(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Firewall.ListActions, {
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

FirewallClient.prototype.privacyMapConversion = function privacyMapConversion(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Firewall.PrivacyMapConversion, {
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

exports.FirewallClient = FirewallClient;

