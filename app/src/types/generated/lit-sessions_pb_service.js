// package: litrpc
// file: lit-sessions.proto

var lit_sessions_pb = require("./lit-sessions_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var Sessions = (function () {
  function Sessions() {}
  Sessions.serviceName = "litrpc.Sessions";
  return Sessions;
}());

Sessions.AddSession = {
  methodName: "AddSession",
  service: Sessions,
  requestStream: false,
  responseStream: false,
  requestType: lit_sessions_pb.AddSessionRequest,
  responseType: lit_sessions_pb.AddSessionResponse
};

Sessions.ListSessions = {
  methodName: "ListSessions",
  service: Sessions,
  requestStream: false,
  responseStream: false,
  requestType: lit_sessions_pb.ListSessionsRequest,
  responseType: lit_sessions_pb.ListSessionsResponse
};

Sessions.RevokeSession = {
  methodName: "RevokeSession",
  service: Sessions,
  requestStream: false,
  responseStream: false,
  requestType: lit_sessions_pb.RevokeSessionRequest,
  responseType: lit_sessions_pb.RevokeSessionResponse
};

exports.Sessions = Sessions;

function SessionsClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

SessionsClient.prototype.addSession = function addSession(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Sessions.AddSession, {
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

SessionsClient.prototype.listSessions = function listSessions(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Sessions.ListSessions, {
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

SessionsClient.prototype.revokeSession = function revokeSession(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Sessions.RevokeSession, {
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

exports.SessionsClient = SessionsClient;

