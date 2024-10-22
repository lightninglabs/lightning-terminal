// package: looprpc
// file: swapserverrpc/reservation.proto

var swapserverrpc_reservation_pb = require("../swapserverrpc/reservation_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var ReservationService = (function () {
  function ReservationService() {}
  ReservationService.serviceName = "looprpc.ReservationService";
  return ReservationService;
}());

ReservationService.ReservationNotificationStream = {
  methodName: "ReservationNotificationStream",
  service: ReservationService,
  requestStream: false,
  responseStream: true,
  requestType: swapserverrpc_reservation_pb.ReservationNotificationRequest,
  responseType: swapserverrpc_reservation_pb.ServerReservationNotification
};

ReservationService.OpenReservation = {
  methodName: "OpenReservation",
  service: ReservationService,
  requestStream: false,
  responseStream: false,
  requestType: swapserverrpc_reservation_pb.ServerOpenReservationRequest,
  responseType: swapserverrpc_reservation_pb.ServerOpenReservationResponse
};

exports.ReservationService = ReservationService;

function ReservationServiceClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

ReservationServiceClient.prototype.reservationNotificationStream = function reservationNotificationStream(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(ReservationService.ReservationNotificationStream, {
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

ReservationServiceClient.prototype.openReservation = function openReservation(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ReservationService.OpenReservation, {
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

exports.ReservationServiceClient = ReservationServiceClient;

