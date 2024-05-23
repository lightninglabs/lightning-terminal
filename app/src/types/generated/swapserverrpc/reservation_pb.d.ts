// package: looprpc
// file: swapserverrpc/reservation.proto

import * as jspb from "google-protobuf";

export class ReservationNotificationRequest extends jspb.Message {
  getProtocolVersion(): ReservationProtocolVersionMap[keyof ReservationProtocolVersionMap];
  setProtocolVersion(value: ReservationProtocolVersionMap[keyof ReservationProtocolVersionMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReservationNotificationRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ReservationNotificationRequest): ReservationNotificationRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ReservationNotificationRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReservationNotificationRequest;
  static deserializeBinaryFromReader(message: ReservationNotificationRequest, reader: jspb.BinaryReader): ReservationNotificationRequest;
}

export namespace ReservationNotificationRequest {
  export type AsObject = {
    protocolVersion: ReservationProtocolVersionMap[keyof ReservationProtocolVersionMap],
  }
}

export class ServerReservationNotification extends jspb.Message {
  getReservationId(): Uint8Array | string;
  getReservationId_asU8(): Uint8Array;
  getReservationId_asB64(): string;
  setReservationId(value: Uint8Array | string): void;

  getValue(): string;
  setValue(value: string): void;

  getServerKey(): Uint8Array | string;
  getServerKey_asU8(): Uint8Array;
  getServerKey_asB64(): string;
  setServerKey(value: Uint8Array | string): void;

  getExpiry(): number;
  setExpiry(value: number): void;

  getProtocolVersion(): ReservationProtocolVersionMap[keyof ReservationProtocolVersionMap];
  setProtocolVersion(value: ReservationProtocolVersionMap[keyof ReservationProtocolVersionMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerReservationNotification.AsObject;
  static toObject(includeInstance: boolean, msg: ServerReservationNotification): ServerReservationNotification.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerReservationNotification, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerReservationNotification;
  static deserializeBinaryFromReader(message: ServerReservationNotification, reader: jspb.BinaryReader): ServerReservationNotification;
}

export namespace ServerReservationNotification {
  export type AsObject = {
    reservationId: Uint8Array | string,
    value: string,
    serverKey: Uint8Array | string,
    expiry: number,
    protocolVersion: ReservationProtocolVersionMap[keyof ReservationProtocolVersionMap],
  }
}

export class ServerOpenReservationRequest extends jspb.Message {
  getReservationId(): Uint8Array | string;
  getReservationId_asU8(): Uint8Array;
  getReservationId_asB64(): string;
  setReservationId(value: Uint8Array | string): void;

  getClientKey(): Uint8Array | string;
  getClientKey_asU8(): Uint8Array;
  getClientKey_asB64(): string;
  setClientKey(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerOpenReservationRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ServerOpenReservationRequest): ServerOpenReservationRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerOpenReservationRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerOpenReservationRequest;
  static deserializeBinaryFromReader(message: ServerOpenReservationRequest, reader: jspb.BinaryReader): ServerOpenReservationRequest;
}

export namespace ServerOpenReservationRequest {
  export type AsObject = {
    reservationId: Uint8Array | string,
    clientKey: Uint8Array | string,
  }
}

export class ServerOpenReservationResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerOpenReservationResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ServerOpenReservationResponse): ServerOpenReservationResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerOpenReservationResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerOpenReservationResponse;
  static deserializeBinaryFromReader(message: ServerOpenReservationResponse, reader: jspb.BinaryReader): ServerOpenReservationResponse;
}

export namespace ServerOpenReservationResponse {
  export type AsObject = {
  }
}

export interface ReservationProtocolVersionMap {
  RESERVATION_NONE: 0;
  RESERVATION_SERVER_NOTIFY: 1;
}

export const ReservationProtocolVersion: ReservationProtocolVersionMap;

