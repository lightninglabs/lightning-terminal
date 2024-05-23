// package: looprpc
// file: swapserverrpc/reservation.proto

import * as swapserverrpc_reservation_pb from "../swapserverrpc/reservation_pb";
import {grpc} from "@improbable-eng/grpc-web";

type ReservationServiceReservationNotificationStream = {
  readonly methodName: string;
  readonly service: typeof ReservationService;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof swapserverrpc_reservation_pb.ReservationNotificationRequest;
  readonly responseType: typeof swapserverrpc_reservation_pb.ServerReservationNotification;
};

type ReservationServiceOpenReservation = {
  readonly methodName: string;
  readonly service: typeof ReservationService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof swapserverrpc_reservation_pb.ServerOpenReservationRequest;
  readonly responseType: typeof swapserverrpc_reservation_pb.ServerOpenReservationResponse;
};

export class ReservationService {
  static readonly serviceName: string;
  static readonly ReservationNotificationStream: ReservationServiceReservationNotificationStream;
  static readonly OpenReservation: ReservationServiceOpenReservation;
}

export type ServiceError = { message: string, code: number; metadata: grpc.Metadata }
export type Status = { details: string, code: number; metadata: grpc.Metadata }

interface UnaryResponse {
  cancel(): void;
}
interface ResponseStream<T> {
  cancel(): void;
  on(type: 'data', handler: (message: T) => void): ResponseStream<T>;
  on(type: 'end', handler: (status?: Status) => void): ResponseStream<T>;
  on(type: 'status', handler: (status: Status) => void): ResponseStream<T>;
}
interface RequestStream<T> {
  write(message: T): RequestStream<T>;
  end(): void;
  cancel(): void;
  on(type: 'end', handler: (status?: Status) => void): RequestStream<T>;
  on(type: 'status', handler: (status: Status) => void): RequestStream<T>;
}
interface BidirectionalStream<ReqT, ResT> {
  write(message: ReqT): BidirectionalStream<ReqT, ResT>;
  end(): void;
  cancel(): void;
  on(type: 'data', handler: (message: ResT) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'end', handler: (status?: Status) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'status', handler: (status: Status) => void): BidirectionalStream<ReqT, ResT>;
}

export class ReservationServiceClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  reservationNotificationStream(requestMessage: swapserverrpc_reservation_pb.ReservationNotificationRequest, metadata?: grpc.Metadata): ResponseStream<swapserverrpc_reservation_pb.ServerReservationNotification>;
  openReservation(
    requestMessage: swapserverrpc_reservation_pb.ServerOpenReservationRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_reservation_pb.ServerOpenReservationResponse|null) => void
  ): UnaryResponse;
  openReservation(
    requestMessage: swapserverrpc_reservation_pb.ServerOpenReservationRequest,
    callback: (error: ServiceError|null, responseMessage: swapserverrpc_reservation_pb.ServerOpenReservationResponse|null) => void
  ): UnaryResponse;
}

