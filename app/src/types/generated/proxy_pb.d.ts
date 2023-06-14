// package: litrpc
// file: proxy.proto

import * as jspb from "google-protobuf";

export class BakeSuperMacaroonRequest extends jspb.Message {
  getRootKeyIdSuffix(): number;
  setRootKeyIdSuffix(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BakeSuperMacaroonRequest.AsObject;
  static toObject(includeInstance: boolean, msg: BakeSuperMacaroonRequest): BakeSuperMacaroonRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BakeSuperMacaroonRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BakeSuperMacaroonRequest;
  static deserializeBinaryFromReader(message: BakeSuperMacaroonRequest, reader: jspb.BinaryReader): BakeSuperMacaroonRequest;
}

export namespace BakeSuperMacaroonRequest {
  export type AsObject = {
    rootKeyIdSuffix: number,
  }
}

export class BakeSuperMacaroonResponse extends jspb.Message {
  getMacaroon(): string;
  setMacaroon(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BakeSuperMacaroonResponse.AsObject;
  static toObject(includeInstance: boolean, msg: BakeSuperMacaroonResponse): BakeSuperMacaroonResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BakeSuperMacaroonResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BakeSuperMacaroonResponse;
  static deserializeBinaryFromReader(message: BakeSuperMacaroonResponse, reader: jspb.BinaryReader): BakeSuperMacaroonResponse;
}

export namespace BakeSuperMacaroonResponse {
  export type AsObject = {
    macaroon: string,
  }
}

export class StopDaemonRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StopDaemonRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StopDaemonRequest): StopDaemonRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StopDaemonRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StopDaemonRequest;
  static deserializeBinaryFromReader(message: StopDaemonRequest, reader: jspb.BinaryReader): StopDaemonRequest;
}

export namespace StopDaemonRequest {
  export type AsObject = {
  }
}

export class StopDaemonResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StopDaemonResponse.AsObject;
  static toObject(includeInstance: boolean, msg: StopDaemonResponse): StopDaemonResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StopDaemonResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StopDaemonResponse;
  static deserializeBinaryFromReader(message: StopDaemonResponse, reader: jspb.BinaryReader): StopDaemonResponse;
}

export namespace StopDaemonResponse {
  export type AsObject = {
  }
}

export class GetInfoRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetInfoRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetInfoRequest): GetInfoRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetInfoRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetInfoRequest;
  static deserializeBinaryFromReader(message: GetInfoRequest, reader: jspb.BinaryReader): GetInfoRequest;
}

export namespace GetInfoRequest {
  export type AsObject = {
  }
}

export class GetInfoResponse extends jspb.Message {
  getVersion(): string;
  setVersion(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetInfoResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetInfoResponse): GetInfoResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetInfoResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetInfoResponse;
  static deserializeBinaryFromReader(message: GetInfoResponse, reader: jspb.BinaryReader): GetInfoResponse;
}

export namespace GetInfoResponse {
  export type AsObject = {
    version: string,
  }
}

