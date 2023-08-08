// package: looprpc
// file: swapserverrpc/server.proto

import * as jspb from "google-protobuf";
import * as swapserverrpc_common_pb from "../swapserverrpc/common_pb";

export class ServerLoopOutRequest extends jspb.Message {
  getReceiverKey(): Uint8Array | string;
  getReceiverKey_asU8(): Uint8Array;
  getReceiverKey_asB64(): string;
  setReceiverKey(value: Uint8Array | string): void;

  getSwapHash(): Uint8Array | string;
  getSwapHash_asU8(): Uint8Array;
  getSwapHash_asB64(): string;
  setSwapHash(value: Uint8Array | string): void;

  getAmt(): string;
  setAmt(value: string): void;

  getSwapPublicationDeadline(): string;
  setSwapPublicationDeadline(value: string): void;

  getProtocolVersion(): ProtocolVersionMap[keyof ProtocolVersionMap];
  setProtocolVersion(value: ProtocolVersionMap[keyof ProtocolVersionMap]): void;

  getExpiry(): number;
  setExpiry(value: number): void;

  getUserAgent(): string;
  setUserAgent(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerLoopOutRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ServerLoopOutRequest): ServerLoopOutRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerLoopOutRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerLoopOutRequest;
  static deserializeBinaryFromReader(message: ServerLoopOutRequest, reader: jspb.BinaryReader): ServerLoopOutRequest;
}

export namespace ServerLoopOutRequest {
  export type AsObject = {
    receiverKey: Uint8Array | string,
    swapHash: Uint8Array | string,
    amt: string,
    swapPublicationDeadline: string,
    protocolVersion: ProtocolVersionMap[keyof ProtocolVersionMap],
    expiry: number,
    userAgent: string,
  }
}

export class ServerLoopOutResponse extends jspb.Message {
  getSwapInvoice(): string;
  setSwapInvoice(value: string): void;

  getPrepayInvoice(): string;
  setPrepayInvoice(value: string): void;

  getSenderKey(): Uint8Array | string;
  getSenderKey_asU8(): Uint8Array;
  getSenderKey_asB64(): string;
  setSenderKey(value: Uint8Array | string): void;

  getExpiry(): number;
  setExpiry(value: number): void;

  getServerMessage(): string;
  setServerMessage(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerLoopOutResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ServerLoopOutResponse): ServerLoopOutResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerLoopOutResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerLoopOutResponse;
  static deserializeBinaryFromReader(message: ServerLoopOutResponse, reader: jspb.BinaryReader): ServerLoopOutResponse;
}

export namespace ServerLoopOutResponse {
  export type AsObject = {
    swapInvoice: string,
    prepayInvoice: string,
    senderKey: Uint8Array | string,
    expiry: number,
    serverMessage: string,
  }
}

export class ServerLoopOutQuoteRequest extends jspb.Message {
  getAmt(): string;
  setAmt(value: string): void;

  getSwapPublicationDeadline(): string;
  setSwapPublicationDeadline(value: string): void;

  getProtocolVersion(): ProtocolVersionMap[keyof ProtocolVersionMap];
  setProtocolVersion(value: ProtocolVersionMap[keyof ProtocolVersionMap]): void;

  getExpiry(): number;
  setExpiry(value: number): void;

  getUserAgent(): string;
  setUserAgent(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerLoopOutQuoteRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ServerLoopOutQuoteRequest): ServerLoopOutQuoteRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerLoopOutQuoteRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerLoopOutQuoteRequest;
  static deserializeBinaryFromReader(message: ServerLoopOutQuoteRequest, reader: jspb.BinaryReader): ServerLoopOutQuoteRequest;
}

export namespace ServerLoopOutQuoteRequest {
  export type AsObject = {
    amt: string,
    swapPublicationDeadline: string,
    protocolVersion: ProtocolVersionMap[keyof ProtocolVersionMap],
    expiry: number,
    userAgent: string,
  }
}

export class ServerLoopOutQuote extends jspb.Message {
  getSwapPaymentDest(): string;
  setSwapPaymentDest(value: string): void;

  getSwapFee(): string;
  setSwapFee(value: string): void;

  getSwapFeeRate(): string;
  setSwapFeeRate(value: string): void;

  getPrepayAmt(): string;
  setPrepayAmt(value: string): void;

  getMinSwapAmount(): string;
  setMinSwapAmount(value: string): void;

  getMaxSwapAmount(): string;
  setMaxSwapAmount(value: string): void;

  getCltvDelta(): number;
  setCltvDelta(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerLoopOutQuote.AsObject;
  static toObject(includeInstance: boolean, msg: ServerLoopOutQuote): ServerLoopOutQuote.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerLoopOutQuote, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerLoopOutQuote;
  static deserializeBinaryFromReader(message: ServerLoopOutQuote, reader: jspb.BinaryReader): ServerLoopOutQuote;
}

export namespace ServerLoopOutQuote {
  export type AsObject = {
    swapPaymentDest: string,
    swapFee: string,
    swapFeeRate: string,
    prepayAmt: string,
    minSwapAmount: string,
    maxSwapAmount: string,
    cltvDelta: number,
  }
}

export class ServerLoopOutTermsRequest extends jspb.Message {
  getProtocolVersion(): ProtocolVersionMap[keyof ProtocolVersionMap];
  setProtocolVersion(value: ProtocolVersionMap[keyof ProtocolVersionMap]): void;

  getUserAgent(): string;
  setUserAgent(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerLoopOutTermsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ServerLoopOutTermsRequest): ServerLoopOutTermsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerLoopOutTermsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerLoopOutTermsRequest;
  static deserializeBinaryFromReader(message: ServerLoopOutTermsRequest, reader: jspb.BinaryReader): ServerLoopOutTermsRequest;
}

export namespace ServerLoopOutTermsRequest {
  export type AsObject = {
    protocolVersion: ProtocolVersionMap[keyof ProtocolVersionMap],
    userAgent: string,
  }
}

export class ServerLoopOutTerms extends jspb.Message {
  getMinSwapAmount(): string;
  setMinSwapAmount(value: string): void;

  getMaxSwapAmount(): string;
  setMaxSwapAmount(value: string): void;

  getMinCltvDelta(): number;
  setMinCltvDelta(value: number): void;

  getMaxCltvDelta(): number;
  setMaxCltvDelta(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerLoopOutTerms.AsObject;
  static toObject(includeInstance: boolean, msg: ServerLoopOutTerms): ServerLoopOutTerms.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerLoopOutTerms, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerLoopOutTerms;
  static deserializeBinaryFromReader(message: ServerLoopOutTerms, reader: jspb.BinaryReader): ServerLoopOutTerms;
}

export namespace ServerLoopOutTerms {
  export type AsObject = {
    minSwapAmount: string,
    maxSwapAmount: string,
    minCltvDelta: number,
    maxCltvDelta: number,
  }
}

export class ServerLoopInRequest extends jspb.Message {
  getSenderKey(): Uint8Array | string;
  getSenderKey_asU8(): Uint8Array;
  getSenderKey_asB64(): string;
  setSenderKey(value: Uint8Array | string): void;

  getSenderInternalPubkey(): Uint8Array | string;
  getSenderInternalPubkey_asU8(): Uint8Array;
  getSenderInternalPubkey_asB64(): string;
  setSenderInternalPubkey(value: Uint8Array | string): void;

  getSwapHash(): Uint8Array | string;
  getSwapHash_asU8(): Uint8Array;
  getSwapHash_asB64(): string;
  setSwapHash(value: Uint8Array | string): void;

  getAmt(): string;
  setAmt(value: string): void;

  getSwapInvoice(): string;
  setSwapInvoice(value: string): void;

  getLastHop(): Uint8Array | string;
  getLastHop_asU8(): Uint8Array;
  getLastHop_asB64(): string;
  setLastHop(value: Uint8Array | string): void;

  getProtocolVersion(): ProtocolVersionMap[keyof ProtocolVersionMap];
  setProtocolVersion(value: ProtocolVersionMap[keyof ProtocolVersionMap]): void;

  getProbeInvoice(): string;
  setProbeInvoice(value: string): void;

  getUserAgent(): string;
  setUserAgent(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerLoopInRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ServerLoopInRequest): ServerLoopInRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerLoopInRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerLoopInRequest;
  static deserializeBinaryFromReader(message: ServerLoopInRequest, reader: jspb.BinaryReader): ServerLoopInRequest;
}

export namespace ServerLoopInRequest {
  export type AsObject = {
    senderKey: Uint8Array | string,
    senderInternalPubkey: Uint8Array | string,
    swapHash: Uint8Array | string,
    amt: string,
    swapInvoice: string,
    lastHop: Uint8Array | string,
    protocolVersion: ProtocolVersionMap[keyof ProtocolVersionMap],
    probeInvoice: string,
    userAgent: string,
  }
}

export class ServerLoopInResponse extends jspb.Message {
  getReceiverKey(): Uint8Array | string;
  getReceiverKey_asU8(): Uint8Array;
  getReceiverKey_asB64(): string;
  setReceiverKey(value: Uint8Array | string): void;

  getReceiverInternalPubkey(): Uint8Array | string;
  getReceiverInternalPubkey_asU8(): Uint8Array;
  getReceiverInternalPubkey_asB64(): string;
  setReceiverInternalPubkey(value: Uint8Array | string): void;

  getExpiry(): number;
  setExpiry(value: number): void;

  getServerMessage(): string;
  setServerMessage(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerLoopInResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ServerLoopInResponse): ServerLoopInResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerLoopInResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerLoopInResponse;
  static deserializeBinaryFromReader(message: ServerLoopInResponse, reader: jspb.BinaryReader): ServerLoopInResponse;
}

export namespace ServerLoopInResponse {
  export type AsObject = {
    receiverKey: Uint8Array | string,
    receiverInternalPubkey: Uint8Array | string,
    expiry: number,
    serverMessage: string,
  }
}

export class ServerLoopInQuoteRequest extends jspb.Message {
  getAmt(): string;
  setAmt(value: string): void;

  getPubkey(): Uint8Array | string;
  getPubkey_asU8(): Uint8Array;
  getPubkey_asB64(): string;
  setPubkey(value: Uint8Array | string): void;

  getLastHop(): Uint8Array | string;
  getLastHop_asU8(): Uint8Array;
  getLastHop_asB64(): string;
  setLastHop(value: Uint8Array | string): void;

  clearRouteHintsList(): void;
  getRouteHintsList(): Array<swapserverrpc_common_pb.RouteHint>;
  setRouteHintsList(value: Array<swapserverrpc_common_pb.RouteHint>): void;
  addRouteHints(value?: swapserverrpc_common_pb.RouteHint, index?: number): swapserverrpc_common_pb.RouteHint;

  getProtocolVersion(): ProtocolVersionMap[keyof ProtocolVersionMap];
  setProtocolVersion(value: ProtocolVersionMap[keyof ProtocolVersionMap]): void;

  getUserAgent(): string;
  setUserAgent(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerLoopInQuoteRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ServerLoopInQuoteRequest): ServerLoopInQuoteRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerLoopInQuoteRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerLoopInQuoteRequest;
  static deserializeBinaryFromReader(message: ServerLoopInQuoteRequest, reader: jspb.BinaryReader): ServerLoopInQuoteRequest;
}

export namespace ServerLoopInQuoteRequest {
  export type AsObject = {
    amt: string,
    pubkey: Uint8Array | string,
    lastHop: Uint8Array | string,
    routeHintsList: Array<swapserverrpc_common_pb.RouteHint.AsObject>,
    protocolVersion: ProtocolVersionMap[keyof ProtocolVersionMap],
    userAgent: string,
  }
}

export class ServerLoopInQuoteResponse extends jspb.Message {
  getSwapFee(): string;
  setSwapFee(value: string): void;

  getSwapFeeRate(): string;
  setSwapFeeRate(value: string): void;

  getMinSwapAmount(): string;
  setMinSwapAmount(value: string): void;

  getMaxSwapAmount(): string;
  setMaxSwapAmount(value: string): void;

  getCltvDelta(): number;
  setCltvDelta(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerLoopInQuoteResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ServerLoopInQuoteResponse): ServerLoopInQuoteResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerLoopInQuoteResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerLoopInQuoteResponse;
  static deserializeBinaryFromReader(message: ServerLoopInQuoteResponse, reader: jspb.BinaryReader): ServerLoopInQuoteResponse;
}

export namespace ServerLoopInQuoteResponse {
  export type AsObject = {
    swapFee: string,
    swapFeeRate: string,
    minSwapAmount: string,
    maxSwapAmount: string,
    cltvDelta: number,
  }
}

export class ServerLoopInTermsRequest extends jspb.Message {
  getProtocolVersion(): ProtocolVersionMap[keyof ProtocolVersionMap];
  setProtocolVersion(value: ProtocolVersionMap[keyof ProtocolVersionMap]): void;

  getUserAgent(): string;
  setUserAgent(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerLoopInTermsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ServerLoopInTermsRequest): ServerLoopInTermsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerLoopInTermsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerLoopInTermsRequest;
  static deserializeBinaryFromReader(message: ServerLoopInTermsRequest, reader: jspb.BinaryReader): ServerLoopInTermsRequest;
}

export namespace ServerLoopInTermsRequest {
  export type AsObject = {
    protocolVersion: ProtocolVersionMap[keyof ProtocolVersionMap],
    userAgent: string,
  }
}

export class ServerLoopInTerms extends jspb.Message {
  getMinSwapAmount(): string;
  setMinSwapAmount(value: string): void;

  getMaxSwapAmount(): string;
  setMaxSwapAmount(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerLoopInTerms.AsObject;
  static toObject(includeInstance: boolean, msg: ServerLoopInTerms): ServerLoopInTerms.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerLoopInTerms, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerLoopInTerms;
  static deserializeBinaryFromReader(message: ServerLoopInTerms, reader: jspb.BinaryReader): ServerLoopInTerms;
}

export namespace ServerLoopInTerms {
  export type AsObject = {
    minSwapAmount: string,
    maxSwapAmount: string,
  }
}

export class ServerLoopOutPushPreimageRequest extends jspb.Message {
  getProtocolVersion(): ProtocolVersionMap[keyof ProtocolVersionMap];
  setProtocolVersion(value: ProtocolVersionMap[keyof ProtocolVersionMap]): void;

  getPreimage(): Uint8Array | string;
  getPreimage_asU8(): Uint8Array;
  getPreimage_asB64(): string;
  setPreimage(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerLoopOutPushPreimageRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ServerLoopOutPushPreimageRequest): ServerLoopOutPushPreimageRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerLoopOutPushPreimageRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerLoopOutPushPreimageRequest;
  static deserializeBinaryFromReader(message: ServerLoopOutPushPreimageRequest, reader: jspb.BinaryReader): ServerLoopOutPushPreimageRequest;
}

export namespace ServerLoopOutPushPreimageRequest {
  export type AsObject = {
    protocolVersion: ProtocolVersionMap[keyof ProtocolVersionMap],
    preimage: Uint8Array | string,
  }
}

export class ServerLoopOutPushPreimageResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerLoopOutPushPreimageResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ServerLoopOutPushPreimageResponse): ServerLoopOutPushPreimageResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerLoopOutPushPreimageResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerLoopOutPushPreimageResponse;
  static deserializeBinaryFromReader(message: ServerLoopOutPushPreimageResponse, reader: jspb.BinaryReader): ServerLoopOutPushPreimageResponse;
}

export namespace ServerLoopOutPushPreimageResponse {
  export type AsObject = {
  }
}

export class SubscribeUpdatesRequest extends jspb.Message {
  getProtocolVersion(): ProtocolVersionMap[keyof ProtocolVersionMap];
  setProtocolVersion(value: ProtocolVersionMap[keyof ProtocolVersionMap]): void;

  getSwapHash(): Uint8Array | string;
  getSwapHash_asU8(): Uint8Array;
  getSwapHash_asB64(): string;
  setSwapHash(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscribeUpdatesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SubscribeUpdatesRequest): SubscribeUpdatesRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SubscribeUpdatesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscribeUpdatesRequest;
  static deserializeBinaryFromReader(message: SubscribeUpdatesRequest, reader: jspb.BinaryReader): SubscribeUpdatesRequest;
}

export namespace SubscribeUpdatesRequest {
  export type AsObject = {
    protocolVersion: ProtocolVersionMap[keyof ProtocolVersionMap],
    swapHash: Uint8Array | string,
  }
}

export class SubscribeLoopOutUpdatesResponse extends jspb.Message {
  getTimestampNs(): string;
  setTimestampNs(value: string): void;

  getState(): ServerSwapStateMap[keyof ServerSwapStateMap];
  setState(value: ServerSwapStateMap[keyof ServerSwapStateMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscribeLoopOutUpdatesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SubscribeLoopOutUpdatesResponse): SubscribeLoopOutUpdatesResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SubscribeLoopOutUpdatesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscribeLoopOutUpdatesResponse;
  static deserializeBinaryFromReader(message: SubscribeLoopOutUpdatesResponse, reader: jspb.BinaryReader): SubscribeLoopOutUpdatesResponse;
}

export namespace SubscribeLoopOutUpdatesResponse {
  export type AsObject = {
    timestampNs: string,
    state: ServerSwapStateMap[keyof ServerSwapStateMap],
  }
}

export class SubscribeLoopInUpdatesResponse extends jspb.Message {
  getTimestampNs(): string;
  setTimestampNs(value: string): void;

  getState(): ServerSwapStateMap[keyof ServerSwapStateMap];
  setState(value: ServerSwapStateMap[keyof ServerSwapStateMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscribeLoopInUpdatesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SubscribeLoopInUpdatesResponse): SubscribeLoopInUpdatesResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SubscribeLoopInUpdatesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscribeLoopInUpdatesResponse;
  static deserializeBinaryFromReader(message: SubscribeLoopInUpdatesResponse, reader: jspb.BinaryReader): SubscribeLoopInUpdatesResponse;
}

export namespace SubscribeLoopInUpdatesResponse {
  export type AsObject = {
    timestampNs: string,
    state: ServerSwapStateMap[keyof ServerSwapStateMap],
  }
}

export class RouteCancel extends jspb.Message {
  getRouteType(): RoutePaymentTypeMap[keyof RoutePaymentTypeMap];
  setRouteType(value: RoutePaymentTypeMap[keyof RoutePaymentTypeMap]): void;

  clearAttemptsList(): void;
  getAttemptsList(): Array<HtlcAttempt>;
  setAttemptsList(value: Array<HtlcAttempt>): void;
  addAttempts(value?: HtlcAttempt, index?: number): HtlcAttempt;

  getFailure(): PaymentFailureReasonMap[keyof PaymentFailureReasonMap];
  setFailure(value: PaymentFailureReasonMap[keyof PaymentFailureReasonMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RouteCancel.AsObject;
  static toObject(includeInstance: boolean, msg: RouteCancel): RouteCancel.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RouteCancel, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RouteCancel;
  static deserializeBinaryFromReader(message: RouteCancel, reader: jspb.BinaryReader): RouteCancel;
}

export namespace RouteCancel {
  export type AsObject = {
    routeType: RoutePaymentTypeMap[keyof RoutePaymentTypeMap],
    attemptsList: Array<HtlcAttempt.AsObject>,
    failure: PaymentFailureReasonMap[keyof PaymentFailureReasonMap],
  }
}

export class HtlcAttempt extends jspb.Message {
  getRemainingHops(): number;
  setRemainingHops(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HtlcAttempt.AsObject;
  static toObject(includeInstance: boolean, msg: HtlcAttempt): HtlcAttempt.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: HtlcAttempt, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HtlcAttempt;
  static deserializeBinaryFromReader(message: HtlcAttempt, reader: jspb.BinaryReader): HtlcAttempt;
}

export namespace HtlcAttempt {
  export type AsObject = {
    remainingHops: number,
  }
}

export class CancelLoopOutSwapRequest extends jspb.Message {
  getProtocolVersion(): ProtocolVersionMap[keyof ProtocolVersionMap];
  setProtocolVersion(value: ProtocolVersionMap[keyof ProtocolVersionMap]): void;

  getSwapHash(): Uint8Array | string;
  getSwapHash_asU8(): Uint8Array;
  getSwapHash_asB64(): string;
  setSwapHash(value: Uint8Array | string): void;

  getPaymentAddress(): Uint8Array | string;
  getPaymentAddress_asU8(): Uint8Array;
  getPaymentAddress_asB64(): string;
  setPaymentAddress(value: Uint8Array | string): void;

  hasRouteCancel(): boolean;
  clearRouteCancel(): void;
  getRouteCancel(): RouteCancel | undefined;
  setRouteCancel(value?: RouteCancel): void;

  getCancelInfoCase(): CancelLoopOutSwapRequest.CancelInfoCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CancelLoopOutSwapRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CancelLoopOutSwapRequest): CancelLoopOutSwapRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CancelLoopOutSwapRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CancelLoopOutSwapRequest;
  static deserializeBinaryFromReader(message: CancelLoopOutSwapRequest, reader: jspb.BinaryReader): CancelLoopOutSwapRequest;
}

export namespace CancelLoopOutSwapRequest {
  export type AsObject = {
    protocolVersion: ProtocolVersionMap[keyof ProtocolVersionMap],
    swapHash: Uint8Array | string,
    paymentAddress: Uint8Array | string,
    routeCancel?: RouteCancel.AsObject,
  }

  export enum CancelInfoCase {
    CANCEL_INFO_NOT_SET = 0,
    ROUTE_CANCEL = 5,
  }
}

export class CancelLoopOutSwapResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CancelLoopOutSwapResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CancelLoopOutSwapResponse): CancelLoopOutSwapResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CancelLoopOutSwapResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CancelLoopOutSwapResponse;
  static deserializeBinaryFromReader(message: CancelLoopOutSwapResponse, reader: jspb.BinaryReader): CancelLoopOutSwapResponse;
}

export namespace CancelLoopOutSwapResponse {
  export type AsObject = {
  }
}

export class ServerProbeRequest extends jspb.Message {
  getProtocolVersion(): ProtocolVersionMap[keyof ProtocolVersionMap];
  setProtocolVersion(value: ProtocolVersionMap[keyof ProtocolVersionMap]): void;

  getAmt(): string;
  setAmt(value: string): void;

  getTarget(): Uint8Array | string;
  getTarget_asU8(): Uint8Array;
  getTarget_asB64(): string;
  setTarget(value: Uint8Array | string): void;

  getLastHop(): Uint8Array | string;
  getLastHop_asU8(): Uint8Array;
  getLastHop_asB64(): string;
  setLastHop(value: Uint8Array | string): void;

  clearRouteHintsList(): void;
  getRouteHintsList(): Array<swapserverrpc_common_pb.RouteHint>;
  setRouteHintsList(value: Array<swapserverrpc_common_pb.RouteHint>): void;
  addRouteHints(value?: swapserverrpc_common_pb.RouteHint, index?: number): swapserverrpc_common_pb.RouteHint;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerProbeRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ServerProbeRequest): ServerProbeRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerProbeRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerProbeRequest;
  static deserializeBinaryFromReader(message: ServerProbeRequest, reader: jspb.BinaryReader): ServerProbeRequest;
}

export namespace ServerProbeRequest {
  export type AsObject = {
    protocolVersion: ProtocolVersionMap[keyof ProtocolVersionMap],
    amt: string,
    target: Uint8Array | string,
    lastHop: Uint8Array | string,
    routeHintsList: Array<swapserverrpc_common_pb.RouteHint.AsObject>,
  }
}

export class ServerProbeResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerProbeResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ServerProbeResponse): ServerProbeResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerProbeResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerProbeResponse;
  static deserializeBinaryFromReader(message: ServerProbeResponse, reader: jspb.BinaryReader): ServerProbeResponse;
}

export namespace ServerProbeResponse {
  export type AsObject = {
  }
}

export class RecommendRoutingPluginReq extends jspb.Message {
  getProtocolVersion(): ProtocolVersionMap[keyof ProtocolVersionMap];
  setProtocolVersion(value: ProtocolVersionMap[keyof ProtocolVersionMap]): void;

  getSwapHash(): Uint8Array | string;
  getSwapHash_asU8(): Uint8Array;
  getSwapHash_asB64(): string;
  setSwapHash(value: Uint8Array | string): void;

  getPaymentAddress(): Uint8Array | string;
  getPaymentAddress_asU8(): Uint8Array;
  getPaymentAddress_asB64(): string;
  setPaymentAddress(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RecommendRoutingPluginReq.AsObject;
  static toObject(includeInstance: boolean, msg: RecommendRoutingPluginReq): RecommendRoutingPluginReq.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RecommendRoutingPluginReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RecommendRoutingPluginReq;
  static deserializeBinaryFromReader(message: RecommendRoutingPluginReq, reader: jspb.BinaryReader): RecommendRoutingPluginReq;
}

export namespace RecommendRoutingPluginReq {
  export type AsObject = {
    protocolVersion: ProtocolVersionMap[keyof ProtocolVersionMap],
    swapHash: Uint8Array | string,
    paymentAddress: Uint8Array | string,
  }
}

export class RecommendRoutingPluginRes extends jspb.Message {
  getPlugin(): RoutingPluginMap[keyof RoutingPluginMap];
  setPlugin(value: RoutingPluginMap[keyof RoutingPluginMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RecommendRoutingPluginRes.AsObject;
  static toObject(includeInstance: boolean, msg: RecommendRoutingPluginRes): RecommendRoutingPluginRes.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RecommendRoutingPluginRes, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RecommendRoutingPluginRes;
  static deserializeBinaryFromReader(message: RecommendRoutingPluginRes, reader: jspb.BinaryReader): RecommendRoutingPluginRes;
}

export namespace RecommendRoutingPluginRes {
  export type AsObject = {
    plugin: RoutingPluginMap[keyof RoutingPluginMap],
  }
}

export class ReportRoutingResultReq extends jspb.Message {
  getProtocolVersion(): ProtocolVersionMap[keyof ProtocolVersionMap];
  setProtocolVersion(value: ProtocolVersionMap[keyof ProtocolVersionMap]): void;

  getSwapHash(): Uint8Array | string;
  getSwapHash_asU8(): Uint8Array;
  getSwapHash_asB64(): string;
  setSwapHash(value: Uint8Array | string): void;

  getPaymentAddress(): Uint8Array | string;
  getPaymentAddress_asU8(): Uint8Array;
  getPaymentAddress_asB64(): string;
  setPaymentAddress(value: Uint8Array | string): void;

  getPlugin(): RoutingPluginMap[keyof RoutingPluginMap];
  setPlugin(value: RoutingPluginMap[keyof RoutingPluginMap]): void;

  getSuccess(): boolean;
  setSuccess(value: boolean): void;

  getAttempts(): number;
  setAttempts(value: number): void;

  getTotalTime(): string;
  setTotalTime(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReportRoutingResultReq.AsObject;
  static toObject(includeInstance: boolean, msg: ReportRoutingResultReq): ReportRoutingResultReq.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ReportRoutingResultReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReportRoutingResultReq;
  static deserializeBinaryFromReader(message: ReportRoutingResultReq, reader: jspb.BinaryReader): ReportRoutingResultReq;
}

export namespace ReportRoutingResultReq {
  export type AsObject = {
    protocolVersion: ProtocolVersionMap[keyof ProtocolVersionMap],
    swapHash: Uint8Array | string,
    paymentAddress: Uint8Array | string,
    plugin: RoutingPluginMap[keyof RoutingPluginMap],
    success: boolean,
    attempts: number,
    totalTime: string,
  }
}

export class ReportRoutingResultRes extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReportRoutingResultRes.AsObject;
  static toObject(includeInstance: boolean, msg: ReportRoutingResultRes): ReportRoutingResultRes.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ReportRoutingResultRes, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReportRoutingResultRes;
  static deserializeBinaryFromReader(message: ReportRoutingResultRes, reader: jspb.BinaryReader): ReportRoutingResultRes;
}

export namespace ReportRoutingResultRes {
  export type AsObject = {
  }
}

export class MuSig2SignSweepReq extends jspb.Message {
  getProtocolVersion(): ProtocolVersionMap[keyof ProtocolVersionMap];
  setProtocolVersion(value: ProtocolVersionMap[keyof ProtocolVersionMap]): void;

  getSwapHash(): Uint8Array | string;
  getSwapHash_asU8(): Uint8Array;
  getSwapHash_asB64(): string;
  setSwapHash(value: Uint8Array | string): void;

  getPaymentAddress(): Uint8Array | string;
  getPaymentAddress_asU8(): Uint8Array;
  getPaymentAddress_asB64(): string;
  setPaymentAddress(value: Uint8Array | string): void;

  getNonce(): Uint8Array | string;
  getNonce_asU8(): Uint8Array;
  getNonce_asB64(): string;
  setNonce(value: Uint8Array | string): void;

  getSweepTxPsbt(): Uint8Array | string;
  getSweepTxPsbt_asU8(): Uint8Array;
  getSweepTxPsbt_asB64(): string;
  setSweepTxPsbt(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MuSig2SignSweepReq.AsObject;
  static toObject(includeInstance: boolean, msg: MuSig2SignSweepReq): MuSig2SignSweepReq.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MuSig2SignSweepReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MuSig2SignSweepReq;
  static deserializeBinaryFromReader(message: MuSig2SignSweepReq, reader: jspb.BinaryReader): MuSig2SignSweepReq;
}

export namespace MuSig2SignSweepReq {
  export type AsObject = {
    protocolVersion: ProtocolVersionMap[keyof ProtocolVersionMap],
    swapHash: Uint8Array | string,
    paymentAddress: Uint8Array | string,
    nonce: Uint8Array | string,
    sweepTxPsbt: Uint8Array | string,
  }
}

export class MuSig2SignSweepRes extends jspb.Message {
  getNonce(): Uint8Array | string;
  getNonce_asU8(): Uint8Array;
  getNonce_asB64(): string;
  setNonce(value: Uint8Array | string): void;

  getPartialSignature(): Uint8Array | string;
  getPartialSignature_asU8(): Uint8Array;
  getPartialSignature_asB64(): string;
  setPartialSignature(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MuSig2SignSweepRes.AsObject;
  static toObject(includeInstance: boolean, msg: MuSig2SignSweepRes): MuSig2SignSweepRes.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MuSig2SignSweepRes, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MuSig2SignSweepRes;
  static deserializeBinaryFromReader(message: MuSig2SignSweepRes, reader: jspb.BinaryReader): MuSig2SignSweepRes;
}

export namespace MuSig2SignSweepRes {
  export type AsObject = {
    nonce: Uint8Array | string,
    partialSignature: Uint8Array | string,
  }
}

export class ServerPushKeyReq extends jspb.Message {
  getProtocolVersion(): ProtocolVersionMap[keyof ProtocolVersionMap];
  setProtocolVersion(value: ProtocolVersionMap[keyof ProtocolVersionMap]): void;

  getSwapHash(): Uint8Array | string;
  getSwapHash_asU8(): Uint8Array;
  getSwapHash_asB64(): string;
  setSwapHash(value: Uint8Array | string): void;

  getInternalPrivkey(): Uint8Array | string;
  getInternalPrivkey_asU8(): Uint8Array;
  getInternalPrivkey_asB64(): string;
  setInternalPrivkey(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerPushKeyReq.AsObject;
  static toObject(includeInstance: boolean, msg: ServerPushKeyReq): ServerPushKeyReq.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerPushKeyReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerPushKeyReq;
  static deserializeBinaryFromReader(message: ServerPushKeyReq, reader: jspb.BinaryReader): ServerPushKeyReq;
}

export namespace ServerPushKeyReq {
  export type AsObject = {
    protocolVersion: ProtocolVersionMap[keyof ProtocolVersionMap],
    swapHash: Uint8Array | string,
    internalPrivkey: Uint8Array | string,
  }
}

export class ServerPushKeyRes extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerPushKeyRes.AsObject;
  static toObject(includeInstance: boolean, msg: ServerPushKeyRes): ServerPushKeyRes.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerPushKeyRes, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerPushKeyRes;
  static deserializeBinaryFromReader(message: ServerPushKeyRes, reader: jspb.BinaryReader): ServerPushKeyRes;
}

export namespace ServerPushKeyRes {
  export type AsObject = {
  }
}

export interface ProtocolVersionMap {
  LEGACY: 0;
  MULTI_LOOP_OUT: 1;
  NATIVE_SEGWIT_LOOP_IN: 2;
  PREIMAGE_PUSH_LOOP_OUT: 3;
  USER_EXPIRY_LOOP_OUT: 4;
  HTLC_V2: 5;
  MULTI_LOOP_IN: 6;
  LOOP_OUT_CANCEL: 7;
  PROBE: 8;
  ROUTING_PLUGIN: 9;
  HTLC_V3: 10;
  MUSIG2: 11;
}

export const ProtocolVersion: ProtocolVersionMap;

export interface ServerSwapStateMap {
  SERVER_INITIATED: 0;
  SERVER_HTLC_PUBLISHED: 1;
  SERVER_SUCCESS: 2;
  SERVER_FAILED_UNKNOWN: 3;
  SERVER_FAILED_NO_HTLC: 4;
  SERVER_FAILED_INVALID_HTLC_AMOUNT: 5;
  SERVER_FAILED_OFF_CHAIN_TIMEOUT: 6;
  SERVER_FAILED_TIMEOUT: 7;
  SERVER_FAILED_SWAP_DEADLINE: 8;
  SERVER_FAILED_HTLC_PUBLICATION: 9;
  SERVER_TIMEOUT_PUBLISHED: 10;
  SERVER_UNEXPECTED_FAILURE: 11;
  SERVER_HTLC_CONFIRMED: 12;
  SERVER_CLIENT_PREPAY_CANCEL: 13;
  SERVER_CLIENT_INVOICE_CANCEL: 14;
  SERVER_FAILED_MULTIPLE_SWAP_SCRIPTS: 15;
  SERVER_FAILED_INITIALIZATION: 16;
}

export const ServerSwapState: ServerSwapStateMap;

export interface RoutePaymentTypeMap {
  ROUTE_UNKNOWN: 0;
  PREPAY_ROUTE: 1;
  INVOICE_ROUTE: 2;
}

export const RoutePaymentType: RoutePaymentTypeMap;

export interface PaymentFailureReasonMap {
  LND_FAILURE_REASON_NONE: 0;
  LND_FAILURE_REASON_TIMEOUT: 1;
  LND_FAILURE_REASON_NO_ROUTE: 2;
  LND_FAILURE_REASON_ERROR: 3;
  LND_FAILURE_REASON_INCORRECT_PAYMENT_DETAILS: 4;
  LND_FAILURE_REASON_INSUFFICIENT_BALANCE: 5;
}

export const PaymentFailureReason: PaymentFailureReasonMap;

export interface RoutingPluginMap {
  NONE: 0;
  LOW_HIGH: 1;
}

export const RoutingPlugin: RoutingPluginMap;

