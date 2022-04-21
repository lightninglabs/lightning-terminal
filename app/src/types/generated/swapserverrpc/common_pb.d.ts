// package: looprpc
// file: swapserverrpc/common.proto

import * as jspb from "google-protobuf";

export class HopHint extends jspb.Message {
  getNodeId(): string;
  setNodeId(value: string): void;

  getChanId(): string;
  setChanId(value: string): void;

  getFeeBaseMsat(): number;
  setFeeBaseMsat(value: number): void;

  getFeeProportionalMillionths(): number;
  setFeeProportionalMillionths(value: number): void;

  getCltvExpiryDelta(): number;
  setCltvExpiryDelta(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HopHint.AsObject;
  static toObject(includeInstance: boolean, msg: HopHint): HopHint.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: HopHint, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HopHint;
  static deserializeBinaryFromReader(message: HopHint, reader: jspb.BinaryReader): HopHint;
}

export namespace HopHint {
  export type AsObject = {
    nodeId: string,
    chanId: string,
    feeBaseMsat: number,
    feeProportionalMillionths: number,
    cltvExpiryDelta: number,
  }
}

export class RouteHint extends jspb.Message {
  clearHopHintsList(): void;
  getHopHintsList(): Array<HopHint>;
  setHopHintsList(value: Array<HopHint>): void;
  addHopHints(value?: HopHint, index?: number): HopHint;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RouteHint.AsObject;
  static toObject(includeInstance: boolean, msg: RouteHint): RouteHint.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RouteHint, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RouteHint;
  static deserializeBinaryFromReader(message: RouteHint, reader: jspb.BinaryReader): RouteHint;
}

export namespace RouteHint {
  export type AsObject = {
    hopHintsList: Array<HopHint.AsObject>,
  }
}

