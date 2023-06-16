// package: litrpc
// file: lit-status.proto

import * as jspb from "google-protobuf";

export class SubServerStatusReq extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubServerStatusReq.AsObject;
  static toObject(includeInstance: boolean, msg: SubServerStatusReq): SubServerStatusReq.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SubServerStatusReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubServerStatusReq;
  static deserializeBinaryFromReader(message: SubServerStatusReq, reader: jspb.BinaryReader): SubServerStatusReq;
}

export namespace SubServerStatusReq {
  export type AsObject = {
  }
}

export class SubServerStatusResp extends jspb.Message {
  getSubServersMap(): jspb.Map<string, SubServerStatus>;
  clearSubServersMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubServerStatusResp.AsObject;
  static toObject(includeInstance: boolean, msg: SubServerStatusResp): SubServerStatusResp.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SubServerStatusResp, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubServerStatusResp;
  static deserializeBinaryFromReader(message: SubServerStatusResp, reader: jspb.BinaryReader): SubServerStatusResp;
}

export namespace SubServerStatusResp {
  export type AsObject = {
    subServersMap: Array<[string, SubServerStatus.AsObject]>,
  }
}

export class SubServerStatus extends jspb.Message {
  getDisabled(): boolean;
  setDisabled(value: boolean): void;

  getRunning(): boolean;
  setRunning(value: boolean): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubServerStatus.AsObject;
  static toObject(includeInstance: boolean, msg: SubServerStatus): SubServerStatus.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SubServerStatus, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubServerStatus;
  static deserializeBinaryFromReader(message: SubServerStatus, reader: jspb.BinaryReader): SubServerStatus;
}

export namespace SubServerStatus {
  export type AsObject = {
    disabled: boolean,
    running: boolean,
    error: string,
  }
}

