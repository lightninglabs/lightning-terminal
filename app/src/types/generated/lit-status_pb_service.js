// package: litrpc
// file: lit-status.proto

var lit_status_pb = require("./lit-status_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var Status = (function () {
  function Status() {}
  Status.serviceName = "litrpc.Status";
  return Status;
}());

Status.SubServerStatus = {
  methodName: "SubServerStatus",
  service: Status,
  requestStream: false,
  responseStream: false,
  requestType: lit_status_pb.SubServerStatusReq,
  responseType: lit_status_pb.SubServerStatusResp
};

exports.Status = Status;

function StatusClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

StatusClient.prototype.subServerStatus = function subServerStatus(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Status.SubServerStatus, {
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

exports.StatusClient = StatusClient;

