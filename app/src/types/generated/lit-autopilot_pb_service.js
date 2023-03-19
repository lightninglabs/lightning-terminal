// package: litrpc
// file: lit-autopilot.proto

var lit_autopilot_pb = require("./lit-autopilot_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var Autopilot = (function () {
  function Autopilot() {}
  Autopilot.serviceName = "litrpc.Autopilot";
  return Autopilot;
}());

Autopilot.ListAutopilotFeatures = {
  methodName: "ListAutopilotFeatures",
  service: Autopilot,
  requestStream: false,
  responseStream: false,
  requestType: lit_autopilot_pb.ListAutopilotFeaturesRequest,
  responseType: lit_autopilot_pb.ListAutopilotFeaturesResponse
};

Autopilot.AddAutopilotSession = {
  methodName: "AddAutopilotSession",
  service: Autopilot,
  requestStream: false,
  responseStream: false,
  requestType: lit_autopilot_pb.AddAutopilotSessionRequest,
  responseType: lit_autopilot_pb.AddAutopilotSessionResponse
};

Autopilot.ListAutopilotSessions = {
  methodName: "ListAutopilotSessions",
  service: Autopilot,
  requestStream: false,
  responseStream: false,
  requestType: lit_autopilot_pb.ListAutopilotSessionsRequest,
  responseType: lit_autopilot_pb.ListAutopilotSessionsResponse
};

Autopilot.RevokeAutopilotSession = {
  methodName: "RevokeAutopilotSession",
  service: Autopilot,
  requestStream: false,
  responseStream: false,
  requestType: lit_autopilot_pb.RevokeAutopilotSessionRequest,
  responseType: lit_autopilot_pb.RevokeAutopilotSessionResponse
};

exports.Autopilot = Autopilot;

function AutopilotClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

AutopilotClient.prototype.listAutopilotFeatures = function listAutopilotFeatures(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Autopilot.ListAutopilotFeatures, {
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

AutopilotClient.prototype.addAutopilotSession = function addAutopilotSession(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Autopilot.AddAutopilotSession, {
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

AutopilotClient.prototype.listAutopilotSessions = function listAutopilotSessions(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Autopilot.ListAutopilotSessions, {
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

AutopilotClient.prototype.revokeAutopilotSession = function revokeAutopilotSession(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Autopilot.RevokeAutopilotSession, {
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

exports.AutopilotClient = AutopilotClient;

