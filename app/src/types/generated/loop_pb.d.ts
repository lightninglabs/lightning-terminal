// package: looprpc
// file: loop.proto

import * as jspb from "google-protobuf";
import * as google_api_annotations_pb from "./google/api/annotations_pb";

export class LoopOutRequest extends jspb.Message {
  getAmt(): number;
  setAmt(value: number): void;

  getDest(): string;
  setDest(value: string): void;

  getMaxSwapRoutingFee(): number;
  setMaxSwapRoutingFee(value: number): void;

  getMaxPrepayRoutingFee(): number;
  setMaxPrepayRoutingFee(value: number): void;

  getMaxSwapFee(): number;
  setMaxSwapFee(value: number): void;

  getMaxPrepayAmt(): number;
  setMaxPrepayAmt(value: number): void;

  getMaxMinerFee(): number;
  setMaxMinerFee(value: number): void;

  getLoopOutChannel(): number;
  setLoopOutChannel(value: number): void;

  clearOutgoingChanSetList(): void;
  getOutgoingChanSetList(): Array<number>;
  setOutgoingChanSetList(value: Array<number>): void;
  addOutgoingChanSet(value: number, index?: number): number;

  getSweepConfTarget(): number;
  setSweepConfTarget(value: number): void;

  getSwapPublicationDeadline(): number;
  setSwapPublicationDeadline(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LoopOutRequest.AsObject;
  static toObject(includeInstance: boolean, msg: LoopOutRequest): LoopOutRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LoopOutRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LoopOutRequest;
  static deserializeBinaryFromReader(message: LoopOutRequest, reader: jspb.BinaryReader): LoopOutRequest;
}

export namespace LoopOutRequest {
  export type AsObject = {
    amt: number,
    dest: string,
    maxSwapRoutingFee: number,
    maxPrepayRoutingFee: number,
    maxSwapFee: number,
    maxPrepayAmt: number,
    maxMinerFee: number,
    loopOutChannel: number,
    outgoingChanSetList: Array<number>,
    sweepConfTarget: number,
    swapPublicationDeadline: number,
  }
}

export class LoopInRequest extends jspb.Message {
  getAmt(): number;
  setAmt(value: number): void;

  getMaxSwapFee(): number;
  setMaxSwapFee(value: number): void;

  getMaxMinerFee(): number;
  setMaxMinerFee(value: number): void;

  getLastHop(): Uint8Array | string;
  getLastHop_asU8(): Uint8Array;
  getLastHop_asB64(): string;
  setLastHop(value: Uint8Array | string): void;

  getExternalHtlc(): boolean;
  setExternalHtlc(value: boolean): void;

  getHtlcConfTarget(): number;
  setHtlcConfTarget(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LoopInRequest.AsObject;
  static toObject(includeInstance: boolean, msg: LoopInRequest): LoopInRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LoopInRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LoopInRequest;
  static deserializeBinaryFromReader(message: LoopInRequest, reader: jspb.BinaryReader): LoopInRequest;
}

export namespace LoopInRequest {
  export type AsObject = {
    amt: number,
    maxSwapFee: number,
    maxMinerFee: number,
    lastHop: Uint8Array | string,
    externalHtlc: boolean,
    htlcConfTarget: number,
  }
}

export class SwapResponse extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getIdBytes(): Uint8Array | string;
  getIdBytes_asU8(): Uint8Array;
  getIdBytes_asB64(): string;
  setIdBytes(value: Uint8Array | string): void;

  getHtlcAddress(): string;
  setHtlcAddress(value: string): void;

  getHtlcAddressNp2wsh(): string;
  setHtlcAddressNp2wsh(value: string): void;

  getHtlcAddressP2wsh(): string;
  setHtlcAddressP2wsh(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SwapResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SwapResponse): SwapResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SwapResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SwapResponse;
  static deserializeBinaryFromReader(message: SwapResponse, reader: jspb.BinaryReader): SwapResponse;
}

export namespace SwapResponse {
  export type AsObject = {
    id: string,
    idBytes: Uint8Array | string,
    htlcAddress: string,
    htlcAddressNp2wsh: string,
    htlcAddressP2wsh: string,
  }
}

export class MonitorRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MonitorRequest.AsObject;
  static toObject(includeInstance: boolean, msg: MonitorRequest): MonitorRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MonitorRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MonitorRequest;
  static deserializeBinaryFromReader(message: MonitorRequest, reader: jspb.BinaryReader): MonitorRequest;
}

export namespace MonitorRequest {
  export type AsObject = {
  }
}

export class SwapStatus extends jspb.Message {
  getAmt(): number;
  setAmt(value: number): void;

  getId(): string;
  setId(value: string): void;

  getIdBytes(): Uint8Array | string;
  getIdBytes_asU8(): Uint8Array;
  getIdBytes_asB64(): string;
  setIdBytes(value: Uint8Array | string): void;

  getType(): SwapTypeMap[keyof SwapTypeMap];
  setType(value: SwapTypeMap[keyof SwapTypeMap]): void;

  getState(): SwapStateMap[keyof SwapStateMap];
  setState(value: SwapStateMap[keyof SwapStateMap]): void;

  getInitiationTime(): number;
  setInitiationTime(value: number): void;

  getLastUpdateTime(): number;
  setLastUpdateTime(value: number): void;

  getHtlcAddress(): string;
  setHtlcAddress(value: string): void;

  getHtlcAddressP2wsh(): string;
  setHtlcAddressP2wsh(value: string): void;

  getHtlcAddressNp2wsh(): string;
  setHtlcAddressNp2wsh(value: string): void;

  getCostServer(): number;
  setCostServer(value: number): void;

  getCostOnchain(): number;
  setCostOnchain(value: number): void;

  getCostOffchain(): number;
  setCostOffchain(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SwapStatus.AsObject;
  static toObject(includeInstance: boolean, msg: SwapStatus): SwapStatus.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SwapStatus, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SwapStatus;
  static deserializeBinaryFromReader(message: SwapStatus, reader: jspb.BinaryReader): SwapStatus;
}

export namespace SwapStatus {
  export type AsObject = {
    amt: number,
    id: string,
    idBytes: Uint8Array | string,
    type: SwapTypeMap[keyof SwapTypeMap],
    state: SwapStateMap[keyof SwapStateMap],
    initiationTime: number,
    lastUpdateTime: number,
    htlcAddress: string,
    htlcAddressP2wsh: string,
    htlcAddressNp2wsh: string,
    costServer: number,
    costOnchain: number,
    costOffchain: number,
  }
}

export class ListSwapsRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListSwapsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListSwapsRequest): ListSwapsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListSwapsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListSwapsRequest;
  static deserializeBinaryFromReader(message: ListSwapsRequest, reader: jspb.BinaryReader): ListSwapsRequest;
}

export namespace ListSwapsRequest {
  export type AsObject = {
  }
}

export class ListSwapsResponse extends jspb.Message {
  clearSwapsList(): void;
  getSwapsList(): Array<SwapStatus>;
  setSwapsList(value: Array<SwapStatus>): void;
  addSwaps(value?: SwapStatus, index?: number): SwapStatus;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListSwapsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListSwapsResponse): ListSwapsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListSwapsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListSwapsResponse;
  static deserializeBinaryFromReader(message: ListSwapsResponse, reader: jspb.BinaryReader): ListSwapsResponse;
}

export namespace ListSwapsResponse {
  export type AsObject = {
    swapsList: Array<SwapStatus.AsObject>,
  }
}

export class SwapInfoRequest extends jspb.Message {
  getId(): Uint8Array | string;
  getId_asU8(): Uint8Array;
  getId_asB64(): string;
  setId(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SwapInfoRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SwapInfoRequest): SwapInfoRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SwapInfoRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SwapInfoRequest;
  static deserializeBinaryFromReader(message: SwapInfoRequest, reader: jspb.BinaryReader): SwapInfoRequest;
}

export namespace SwapInfoRequest {
  export type AsObject = {
    id: Uint8Array | string,
  }
}

export class TermsRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TermsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: TermsRequest): TermsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TermsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TermsRequest;
  static deserializeBinaryFromReader(message: TermsRequest, reader: jspb.BinaryReader): TermsRequest;
}

export namespace TermsRequest {
  export type AsObject = {
  }
}

export class TermsResponse extends jspb.Message {
  getMinSwapAmount(): number;
  setMinSwapAmount(value: number): void;

  getMaxSwapAmount(): number;
  setMaxSwapAmount(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TermsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: TermsResponse): TermsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TermsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TermsResponse;
  static deserializeBinaryFromReader(message: TermsResponse, reader: jspb.BinaryReader): TermsResponse;
}

export namespace TermsResponse {
  export type AsObject = {
    minSwapAmount: number,
    maxSwapAmount: number,
  }
}

export class QuoteRequest extends jspb.Message {
  getAmt(): number;
  setAmt(value: number): void;

  getConfTarget(): number;
  setConfTarget(value: number): void;

  getExternalHtlc(): boolean;
  setExternalHtlc(value: boolean): void;

  getSwapPublicationDeadline(): number;
  setSwapPublicationDeadline(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): QuoteRequest.AsObject;
  static toObject(includeInstance: boolean, msg: QuoteRequest): QuoteRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: QuoteRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): QuoteRequest;
  static deserializeBinaryFromReader(message: QuoteRequest, reader: jspb.BinaryReader): QuoteRequest;
}

export namespace QuoteRequest {
  export type AsObject = {
    amt: number,
    confTarget: number,
    externalHtlc: boolean,
    swapPublicationDeadline: number,
  }
}

export class QuoteResponse extends jspb.Message {
  getSwapFee(): number;
  setSwapFee(value: number): void;

  getPrepayAmt(): number;
  setPrepayAmt(value: number): void;

  getMinerFee(): number;
  setMinerFee(value: number): void;

  getSwapPaymentDest(): Uint8Array | string;
  getSwapPaymentDest_asU8(): Uint8Array;
  getSwapPaymentDest_asB64(): string;
  setSwapPaymentDest(value: Uint8Array | string): void;

  getCltvDelta(): number;
  setCltvDelta(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): QuoteResponse.AsObject;
  static toObject(includeInstance: boolean, msg: QuoteResponse): QuoteResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: QuoteResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): QuoteResponse;
  static deserializeBinaryFromReader(message: QuoteResponse, reader: jspb.BinaryReader): QuoteResponse;
}

export namespace QuoteResponse {
  export type AsObject = {
    swapFee: number,
    prepayAmt: number,
    minerFee: number,
    swapPaymentDest: Uint8Array | string,
    cltvDelta: number,
  }
}

export class TokensRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TokensRequest.AsObject;
  static toObject(includeInstance: boolean, msg: TokensRequest): TokensRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TokensRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TokensRequest;
  static deserializeBinaryFromReader(message: TokensRequest, reader: jspb.BinaryReader): TokensRequest;
}

export namespace TokensRequest {
  export type AsObject = {
  }
}

export class TokensResponse extends jspb.Message {
  clearTokensList(): void;
  getTokensList(): Array<LsatToken>;
  setTokensList(value: Array<LsatToken>): void;
  addTokens(value?: LsatToken, index?: number): LsatToken;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TokensResponse.AsObject;
  static toObject(includeInstance: boolean, msg: TokensResponse): TokensResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TokensResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TokensResponse;
  static deserializeBinaryFromReader(message: TokensResponse, reader: jspb.BinaryReader): TokensResponse;
}

export namespace TokensResponse {
  export type AsObject = {
    tokensList: Array<LsatToken.AsObject>,
  }
}

export class LsatToken extends jspb.Message {
  getBaseMacaroon(): Uint8Array | string;
  getBaseMacaroon_asU8(): Uint8Array;
  getBaseMacaroon_asB64(): string;
  setBaseMacaroon(value: Uint8Array | string): void;

  getPaymentHash(): Uint8Array | string;
  getPaymentHash_asU8(): Uint8Array;
  getPaymentHash_asB64(): string;
  setPaymentHash(value: Uint8Array | string): void;

  getPaymentPreimage(): Uint8Array | string;
  getPaymentPreimage_asU8(): Uint8Array;
  getPaymentPreimage_asB64(): string;
  setPaymentPreimage(value: Uint8Array | string): void;

  getAmountPaidMsat(): number;
  setAmountPaidMsat(value: number): void;

  getRoutingFeePaidMsat(): number;
  setRoutingFeePaidMsat(value: number): void;

  getTimeCreated(): number;
  setTimeCreated(value: number): void;

  getExpired(): boolean;
  setExpired(value: boolean): void;

  getStorageName(): string;
  setStorageName(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LsatToken.AsObject;
  static toObject(includeInstance: boolean, msg: LsatToken): LsatToken.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LsatToken, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LsatToken;
  static deserializeBinaryFromReader(message: LsatToken, reader: jspb.BinaryReader): LsatToken;
}

export namespace LsatToken {
  export type AsObject = {
    baseMacaroon: Uint8Array | string,
    paymentHash: Uint8Array | string,
    paymentPreimage: Uint8Array | string,
    amountPaidMsat: number,
    routingFeePaidMsat: number,
    timeCreated: number,
    expired: boolean,
    storageName: string,
  }
}

export interface SwapTypeMap {
  LOOP_OUT: 0;
  LOOP_IN: 1;
}

export const SwapType: SwapTypeMap;

export interface SwapStateMap {
  INITIATED: 0;
  PREIMAGE_REVEALED: 1;
  HTLC_PUBLISHED: 2;
  SUCCESS: 3;
  FAILED: 4;
  INVOICE_SETTLED: 5;
}

export const SwapState: SwapStateMap;

