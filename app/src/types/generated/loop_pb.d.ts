// package: looprpc
// file: loop.proto

import * as jspb from "google-protobuf";
import * as swapserverrpc_common_pb from "./swapserverrpc/common_pb";

export class LoopOutRequest extends jspb.Message {
  getAmt(): string;
  setAmt(value: string): void;

  getDest(): string;
  setDest(value: string): void;

  getMaxSwapRoutingFee(): string;
  setMaxSwapRoutingFee(value: string): void;

  getMaxPrepayRoutingFee(): string;
  setMaxPrepayRoutingFee(value: string): void;

  getMaxSwapFee(): string;
  setMaxSwapFee(value: string): void;

  getMaxPrepayAmt(): string;
  setMaxPrepayAmt(value: string): void;

  getMaxMinerFee(): string;
  setMaxMinerFee(value: string): void;

  getLoopOutChannel(): string;
  setLoopOutChannel(value: string): void;

  clearOutgoingChanSetList(): void;
  getOutgoingChanSetList(): Array<string>;
  setOutgoingChanSetList(value: Array<string>): void;
  addOutgoingChanSet(value: string, index?: number): string;

  getSweepConfTarget(): number;
  setSweepConfTarget(value: number): void;

  getHtlcConfirmations(): number;
  setHtlcConfirmations(value: number): void;

  getSwapPublicationDeadline(): string;
  setSwapPublicationDeadline(value: string): void;

  getLabel(): string;
  setLabel(value: string): void;

  getInitiator(): string;
  setInitiator(value: string): void;

  getAccount(): string;
  setAccount(value: string): void;

  getAccountAddrType(): AddressTypeMap[keyof AddressTypeMap];
  setAccountAddrType(value: AddressTypeMap[keyof AddressTypeMap]): void;

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
    amt: string,
    dest: string,
    maxSwapRoutingFee: string,
    maxPrepayRoutingFee: string,
    maxSwapFee: string,
    maxPrepayAmt: string,
    maxMinerFee: string,
    loopOutChannel: string,
    outgoingChanSetList: Array<string>,
    sweepConfTarget: number,
    htlcConfirmations: number,
    swapPublicationDeadline: string,
    label: string,
    initiator: string,
    account: string,
    accountAddrType: AddressTypeMap[keyof AddressTypeMap],
  }
}

export class LoopInRequest extends jspb.Message {
  getAmt(): string;
  setAmt(value: string): void;

  getMaxSwapFee(): string;
  setMaxSwapFee(value: string): void;

  getMaxMinerFee(): string;
  setMaxMinerFee(value: string): void;

  getLastHop(): Uint8Array | string;
  getLastHop_asU8(): Uint8Array;
  getLastHop_asB64(): string;
  setLastHop(value: Uint8Array | string): void;

  getExternalHtlc(): boolean;
  setExternalHtlc(value: boolean): void;

  getHtlcConfTarget(): number;
  setHtlcConfTarget(value: number): void;

  getLabel(): string;
  setLabel(value: string): void;

  getInitiator(): string;
  setInitiator(value: string): void;

  clearRouteHintsList(): void;
  getRouteHintsList(): Array<swapserverrpc_common_pb.RouteHint>;
  setRouteHintsList(value: Array<swapserverrpc_common_pb.RouteHint>): void;
  addRouteHints(value?: swapserverrpc_common_pb.RouteHint, index?: number): swapserverrpc_common_pb.RouteHint;

  getPrivate(): boolean;
  setPrivate(value: boolean): void;

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
    amt: string,
    maxSwapFee: string,
    maxMinerFee: string,
    lastHop: Uint8Array | string,
    externalHtlc: boolean,
    htlcConfTarget: number,
    label: string,
    initiator: string,
    routeHintsList: Array<swapserverrpc_common_pb.RouteHint.AsObject>,
    pb_private: boolean,
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

  getHtlcAddressP2wsh(): string;
  setHtlcAddressP2wsh(value: string): void;

  getHtlcAddressP2tr(): string;
  setHtlcAddressP2tr(value: string): void;

  getServerMessage(): string;
  setServerMessage(value: string): void;

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
    htlcAddressP2wsh: string,
    htlcAddressP2tr: string,
    serverMessage: string,
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
  getAmt(): string;
  setAmt(value: string): void;

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

  getFailureReason(): FailureReasonMap[keyof FailureReasonMap];
  setFailureReason(value: FailureReasonMap[keyof FailureReasonMap]): void;

  getInitiationTime(): string;
  setInitiationTime(value: string): void;

  getLastUpdateTime(): string;
  setLastUpdateTime(value: string): void;

  getHtlcAddress(): string;
  setHtlcAddress(value: string): void;

  getHtlcAddressP2wsh(): string;
  setHtlcAddressP2wsh(value: string): void;

  getHtlcAddressP2tr(): string;
  setHtlcAddressP2tr(value: string): void;

  getCostServer(): string;
  setCostServer(value: string): void;

  getCostOnchain(): string;
  setCostOnchain(value: string): void;

  getCostOffchain(): string;
  setCostOffchain(value: string): void;

  getLastHop(): Uint8Array | string;
  getLastHop_asU8(): Uint8Array;
  getLastHop_asB64(): string;
  setLastHop(value: Uint8Array | string): void;

  clearOutgoingChanSetList(): void;
  getOutgoingChanSetList(): Array<string>;
  setOutgoingChanSetList(value: Array<string>): void;
  addOutgoingChanSet(value: string, index?: number): string;

  getLabel(): string;
  setLabel(value: string): void;

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
    amt: string,
    id: string,
    idBytes: Uint8Array | string,
    type: SwapTypeMap[keyof SwapTypeMap],
    state: SwapStateMap[keyof SwapStateMap],
    failureReason: FailureReasonMap[keyof FailureReasonMap],
    initiationTime: string,
    lastUpdateTime: string,
    htlcAddress: string,
    htlcAddressP2wsh: string,
    htlcAddressP2tr: string,
    costServer: string,
    costOnchain: string,
    costOffchain: string,
    lastHop: Uint8Array | string,
    outgoingChanSetList: Array<string>,
    label: string,
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

export class InTermsResponse extends jspb.Message {
  getMinSwapAmount(): string;
  setMinSwapAmount(value: string): void;

  getMaxSwapAmount(): string;
  setMaxSwapAmount(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InTermsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: InTermsResponse): InTermsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InTermsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InTermsResponse;
  static deserializeBinaryFromReader(message: InTermsResponse, reader: jspb.BinaryReader): InTermsResponse;
}

export namespace InTermsResponse {
  export type AsObject = {
    minSwapAmount: string,
    maxSwapAmount: string,
  }
}

export class OutTermsResponse extends jspb.Message {
  getMinSwapAmount(): string;
  setMinSwapAmount(value: string): void;

  getMaxSwapAmount(): string;
  setMaxSwapAmount(value: string): void;

  getMinCltvDelta(): number;
  setMinCltvDelta(value: number): void;

  getMaxCltvDelta(): number;
  setMaxCltvDelta(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OutTermsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: OutTermsResponse): OutTermsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OutTermsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OutTermsResponse;
  static deserializeBinaryFromReader(message: OutTermsResponse, reader: jspb.BinaryReader): OutTermsResponse;
}

export namespace OutTermsResponse {
  export type AsObject = {
    minSwapAmount: string,
    maxSwapAmount: string,
    minCltvDelta: number,
    maxCltvDelta: number,
  }
}

export class QuoteRequest extends jspb.Message {
  getAmt(): string;
  setAmt(value: string): void;

  getConfTarget(): number;
  setConfTarget(value: number): void;

  getExternalHtlc(): boolean;
  setExternalHtlc(value: boolean): void;

  getSwapPublicationDeadline(): string;
  setSwapPublicationDeadline(value: string): void;

  getLoopInLastHop(): Uint8Array | string;
  getLoopInLastHop_asU8(): Uint8Array;
  getLoopInLastHop_asB64(): string;
  setLoopInLastHop(value: Uint8Array | string): void;

  clearLoopInRouteHintsList(): void;
  getLoopInRouteHintsList(): Array<swapserverrpc_common_pb.RouteHint>;
  setLoopInRouteHintsList(value: Array<swapserverrpc_common_pb.RouteHint>): void;
  addLoopInRouteHints(value?: swapserverrpc_common_pb.RouteHint, index?: number): swapserverrpc_common_pb.RouteHint;

  getPrivate(): boolean;
  setPrivate(value: boolean): void;

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
    amt: string,
    confTarget: number,
    externalHtlc: boolean,
    swapPublicationDeadline: string,
    loopInLastHop: Uint8Array | string,
    loopInRouteHintsList: Array<swapserverrpc_common_pb.RouteHint.AsObject>,
    pb_private: boolean,
  }
}

export class InQuoteResponse extends jspb.Message {
  getSwapFeeSat(): string;
  setSwapFeeSat(value: string): void;

  getHtlcPublishFeeSat(): string;
  setHtlcPublishFeeSat(value: string): void;

  getCltvDelta(): number;
  setCltvDelta(value: number): void;

  getConfTarget(): number;
  setConfTarget(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InQuoteResponse.AsObject;
  static toObject(includeInstance: boolean, msg: InQuoteResponse): InQuoteResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InQuoteResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InQuoteResponse;
  static deserializeBinaryFromReader(message: InQuoteResponse, reader: jspb.BinaryReader): InQuoteResponse;
}

export namespace InQuoteResponse {
  export type AsObject = {
    swapFeeSat: string,
    htlcPublishFeeSat: string,
    cltvDelta: number,
    confTarget: number,
  }
}

export class OutQuoteResponse extends jspb.Message {
  getSwapFeeSat(): string;
  setSwapFeeSat(value: string): void;

  getPrepayAmtSat(): string;
  setPrepayAmtSat(value: string): void;

  getHtlcSweepFeeSat(): string;
  setHtlcSweepFeeSat(value: string): void;

  getSwapPaymentDest(): Uint8Array | string;
  getSwapPaymentDest_asU8(): Uint8Array;
  getSwapPaymentDest_asB64(): string;
  setSwapPaymentDest(value: Uint8Array | string): void;

  getCltvDelta(): number;
  setCltvDelta(value: number): void;

  getConfTarget(): number;
  setConfTarget(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OutQuoteResponse.AsObject;
  static toObject(includeInstance: boolean, msg: OutQuoteResponse): OutQuoteResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OutQuoteResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OutQuoteResponse;
  static deserializeBinaryFromReader(message: OutQuoteResponse, reader: jspb.BinaryReader): OutQuoteResponse;
}

export namespace OutQuoteResponse {
  export type AsObject = {
    swapFeeSat: string,
    prepayAmtSat: string,
    htlcSweepFeeSat: string,
    swapPaymentDest: Uint8Array | string,
    cltvDelta: number,
    confTarget: number,
  }
}

export class ProbeRequest extends jspb.Message {
  getAmt(): string;
  setAmt(value: string): void;

  getLastHop(): Uint8Array | string;
  getLastHop_asU8(): Uint8Array;
  getLastHop_asB64(): string;
  setLastHop(value: Uint8Array | string): void;

  clearRouteHintsList(): void;
  getRouteHintsList(): Array<swapserverrpc_common_pb.RouteHint>;
  setRouteHintsList(value: Array<swapserverrpc_common_pb.RouteHint>): void;
  addRouteHints(value?: swapserverrpc_common_pb.RouteHint, index?: number): swapserverrpc_common_pb.RouteHint;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProbeRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ProbeRequest): ProbeRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ProbeRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ProbeRequest;
  static deserializeBinaryFromReader(message: ProbeRequest, reader: jspb.BinaryReader): ProbeRequest;
}

export namespace ProbeRequest {
  export type AsObject = {
    amt: string,
    lastHop: Uint8Array | string,
    routeHintsList: Array<swapserverrpc_common_pb.RouteHint.AsObject>,
  }
}

export class ProbeResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProbeResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ProbeResponse): ProbeResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ProbeResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ProbeResponse;
  static deserializeBinaryFromReader(message: ProbeResponse, reader: jspb.BinaryReader): ProbeResponse;
}

export namespace ProbeResponse {
  export type AsObject = {
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

  getAmountPaidMsat(): string;
  setAmountPaidMsat(value: string): void;

  getRoutingFeePaidMsat(): string;
  setRoutingFeePaidMsat(value: string): void;

  getTimeCreated(): string;
  setTimeCreated(value: string): void;

  getExpired(): boolean;
  setExpired(value: boolean): void;

  getStorageName(): string;
  setStorageName(value: string): void;

  getId(): string;
  setId(value: string): void;

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
    amountPaidMsat: string,
    routingFeePaidMsat: string,
    timeCreated: string,
    expired: boolean,
    storageName: string,
    id: string,
  }
}

export class LoopStats extends jspb.Message {
  getPendingCount(): string;
  setPendingCount(value: string): void;

  getSuccessCount(): string;
  setSuccessCount(value: string): void;

  getFailCount(): string;
  setFailCount(value: string): void;

  getSumPendingAmt(): string;
  setSumPendingAmt(value: string): void;

  getSumSucceededAmt(): string;
  setSumSucceededAmt(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LoopStats.AsObject;
  static toObject(includeInstance: boolean, msg: LoopStats): LoopStats.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LoopStats, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LoopStats;
  static deserializeBinaryFromReader(message: LoopStats, reader: jspb.BinaryReader): LoopStats;
}

export namespace LoopStats {
  export type AsObject = {
    pendingCount: string,
    successCount: string,
    failCount: string,
    sumPendingAmt: string,
    sumSucceededAmt: string,
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

  getNetwork(): string;
  setNetwork(value: string): void;

  getRpcListen(): string;
  setRpcListen(value: string): void;

  getRestListen(): string;
  setRestListen(value: string): void;

  getMacaroonPath(): string;
  setMacaroonPath(value: string): void;

  getTlsCertPath(): string;
  setTlsCertPath(value: string): void;

  hasLoopOutStats(): boolean;
  clearLoopOutStats(): void;
  getLoopOutStats(): LoopStats | undefined;
  setLoopOutStats(value?: LoopStats): void;

  hasLoopInStats(): boolean;
  clearLoopInStats(): void;
  getLoopInStats(): LoopStats | undefined;
  setLoopInStats(value?: LoopStats): void;

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
    network: string,
    rpcListen: string,
    restListen: string,
    macaroonPath: string,
    tlsCertPath: string,
    loopOutStats?: LoopStats.AsObject,
    loopInStats?: LoopStats.AsObject,
  }
}

export class GetLiquidityParamsRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetLiquidityParamsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetLiquidityParamsRequest): GetLiquidityParamsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetLiquidityParamsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetLiquidityParamsRequest;
  static deserializeBinaryFromReader(message: GetLiquidityParamsRequest, reader: jspb.BinaryReader): GetLiquidityParamsRequest;
}

export namespace GetLiquidityParamsRequest {
  export type AsObject = {
  }
}

export class LiquidityParameters extends jspb.Message {
  clearRulesList(): void;
  getRulesList(): Array<LiquidityRule>;
  setRulesList(value: Array<LiquidityRule>): void;
  addRules(value?: LiquidityRule, index?: number): LiquidityRule;

  getFeePpm(): string;
  setFeePpm(value: string): void;

  getSweepFeeRateSatPerVbyte(): string;
  setSweepFeeRateSatPerVbyte(value: string): void;

  getMaxSwapFeePpm(): string;
  setMaxSwapFeePpm(value: string): void;

  getMaxRoutingFeePpm(): string;
  setMaxRoutingFeePpm(value: string): void;

  getMaxPrepayRoutingFeePpm(): string;
  setMaxPrepayRoutingFeePpm(value: string): void;

  getMaxPrepaySat(): string;
  setMaxPrepaySat(value: string): void;

  getMaxMinerFeeSat(): string;
  setMaxMinerFeeSat(value: string): void;

  getSweepConfTarget(): number;
  setSweepConfTarget(value: number): void;

  getFailureBackoffSec(): string;
  setFailureBackoffSec(value: string): void;

  getAutoloop(): boolean;
  setAutoloop(value: boolean): void;

  getAutoloopBudgetSat(): string;
  setAutoloopBudgetSat(value: string): void;

  getAutoloopBudgetStartSec(): string;
  setAutoloopBudgetStartSec(value: string): void;

  getAutoMaxInFlight(): string;
  setAutoMaxInFlight(value: string): void;

  getMinSwapAmount(): string;
  setMinSwapAmount(value: string): void;

  getMaxSwapAmount(): string;
  setMaxSwapAmount(value: string): void;

  getHtlcConfTarget(): number;
  setHtlcConfTarget(value: number): void;

  getAutoloopDestAddress(): string;
  setAutoloopDestAddress(value: string): void;

  getAutoloopBudgetRefreshPeriodSec(): string;
  setAutoloopBudgetRefreshPeriodSec(value: string): void;

  getAutoloopBudgetLastRefresh(): string;
  setAutoloopBudgetLastRefresh(value: string): void;

  getEasyAutoloop(): boolean;
  setEasyAutoloop(value: boolean): void;

  getEasyAutoloopLocalTargetSat(): string;
  setEasyAutoloopLocalTargetSat(value: string): void;

  getAccount(): string;
  setAccount(value: string): void;

  getAccountAddrType(): AddressTypeMap[keyof AddressTypeMap];
  setAccountAddrType(value: AddressTypeMap[keyof AddressTypeMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LiquidityParameters.AsObject;
  static toObject(includeInstance: boolean, msg: LiquidityParameters): LiquidityParameters.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LiquidityParameters, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LiquidityParameters;
  static deserializeBinaryFromReader(message: LiquidityParameters, reader: jspb.BinaryReader): LiquidityParameters;
}

export namespace LiquidityParameters {
  export type AsObject = {
    rulesList: Array<LiquidityRule.AsObject>,
    feePpm: string,
    sweepFeeRateSatPerVbyte: string,
    maxSwapFeePpm: string,
    maxRoutingFeePpm: string,
    maxPrepayRoutingFeePpm: string,
    maxPrepaySat: string,
    maxMinerFeeSat: string,
    sweepConfTarget: number,
    failureBackoffSec: string,
    autoloop: boolean,
    autoloopBudgetSat: string,
    autoloopBudgetStartSec: string,
    autoMaxInFlight: string,
    minSwapAmount: string,
    maxSwapAmount: string,
    htlcConfTarget: number,
    autoloopDestAddress: string,
    autoloopBudgetRefreshPeriodSec: string,
    autoloopBudgetLastRefresh: string,
    easyAutoloop: boolean,
    easyAutoloopLocalTargetSat: string,
    account: string,
    accountAddrType: AddressTypeMap[keyof AddressTypeMap],
  }
}

export class LiquidityRule extends jspb.Message {
  getChannelId(): string;
  setChannelId(value: string): void;

  getSwapType(): SwapTypeMap[keyof SwapTypeMap];
  setSwapType(value: SwapTypeMap[keyof SwapTypeMap]): void;

  getPubkey(): Uint8Array | string;
  getPubkey_asU8(): Uint8Array;
  getPubkey_asB64(): string;
  setPubkey(value: Uint8Array | string): void;

  getType(): LiquidityRuleTypeMap[keyof LiquidityRuleTypeMap];
  setType(value: LiquidityRuleTypeMap[keyof LiquidityRuleTypeMap]): void;

  getIncomingThreshold(): number;
  setIncomingThreshold(value: number): void;

  getOutgoingThreshold(): number;
  setOutgoingThreshold(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LiquidityRule.AsObject;
  static toObject(includeInstance: boolean, msg: LiquidityRule): LiquidityRule.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LiquidityRule, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LiquidityRule;
  static deserializeBinaryFromReader(message: LiquidityRule, reader: jspb.BinaryReader): LiquidityRule;
}

export namespace LiquidityRule {
  export type AsObject = {
    channelId: string,
    swapType: SwapTypeMap[keyof SwapTypeMap],
    pubkey: Uint8Array | string,
    type: LiquidityRuleTypeMap[keyof LiquidityRuleTypeMap],
    incomingThreshold: number,
    outgoingThreshold: number,
  }
}

export class SetLiquidityParamsRequest extends jspb.Message {
  hasParameters(): boolean;
  clearParameters(): void;
  getParameters(): LiquidityParameters | undefined;
  setParameters(value?: LiquidityParameters): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SetLiquidityParamsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SetLiquidityParamsRequest): SetLiquidityParamsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SetLiquidityParamsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SetLiquidityParamsRequest;
  static deserializeBinaryFromReader(message: SetLiquidityParamsRequest, reader: jspb.BinaryReader): SetLiquidityParamsRequest;
}

export namespace SetLiquidityParamsRequest {
  export type AsObject = {
    parameters?: LiquidityParameters.AsObject,
  }
}

export class SetLiquidityParamsResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SetLiquidityParamsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SetLiquidityParamsResponse): SetLiquidityParamsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SetLiquidityParamsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SetLiquidityParamsResponse;
  static deserializeBinaryFromReader(message: SetLiquidityParamsResponse, reader: jspb.BinaryReader): SetLiquidityParamsResponse;
}

export namespace SetLiquidityParamsResponse {
  export type AsObject = {
  }
}

export class SuggestSwapsRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SuggestSwapsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SuggestSwapsRequest): SuggestSwapsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SuggestSwapsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SuggestSwapsRequest;
  static deserializeBinaryFromReader(message: SuggestSwapsRequest, reader: jspb.BinaryReader): SuggestSwapsRequest;
}

export namespace SuggestSwapsRequest {
  export type AsObject = {
  }
}

export class Disqualified extends jspb.Message {
  getChannelId(): string;
  setChannelId(value: string): void;

  getPubkey(): Uint8Array | string;
  getPubkey_asU8(): Uint8Array;
  getPubkey_asB64(): string;
  setPubkey(value: Uint8Array | string): void;

  getReason(): AutoReasonMap[keyof AutoReasonMap];
  setReason(value: AutoReasonMap[keyof AutoReasonMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Disqualified.AsObject;
  static toObject(includeInstance: boolean, msg: Disqualified): Disqualified.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Disqualified, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Disqualified;
  static deserializeBinaryFromReader(message: Disqualified, reader: jspb.BinaryReader): Disqualified;
}

export namespace Disqualified {
  export type AsObject = {
    channelId: string,
    pubkey: Uint8Array | string,
    reason: AutoReasonMap[keyof AutoReasonMap],
  }
}

export class SuggestSwapsResponse extends jspb.Message {
  clearLoopOutList(): void;
  getLoopOutList(): Array<LoopOutRequest>;
  setLoopOutList(value: Array<LoopOutRequest>): void;
  addLoopOut(value?: LoopOutRequest, index?: number): LoopOutRequest;

  clearLoopInList(): void;
  getLoopInList(): Array<LoopInRequest>;
  setLoopInList(value: Array<LoopInRequest>): void;
  addLoopIn(value?: LoopInRequest, index?: number): LoopInRequest;

  clearDisqualifiedList(): void;
  getDisqualifiedList(): Array<Disqualified>;
  setDisqualifiedList(value: Array<Disqualified>): void;
  addDisqualified(value?: Disqualified, index?: number): Disqualified;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SuggestSwapsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SuggestSwapsResponse): SuggestSwapsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SuggestSwapsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SuggestSwapsResponse;
  static deserializeBinaryFromReader(message: SuggestSwapsResponse, reader: jspb.BinaryReader): SuggestSwapsResponse;
}

export namespace SuggestSwapsResponse {
  export type AsObject = {
    loopOutList: Array<LoopOutRequest.AsObject>,
    loopInList: Array<LoopInRequest.AsObject>,
    disqualifiedList: Array<Disqualified.AsObject>,
  }
}

export class AbandonSwapRequest extends jspb.Message {
  getId(): Uint8Array | string;
  getId_asU8(): Uint8Array;
  getId_asB64(): string;
  setId(value: Uint8Array | string): void;

  getIKnowWhatIAmDoing(): boolean;
  setIKnowWhatIAmDoing(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AbandonSwapRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AbandonSwapRequest): AbandonSwapRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AbandonSwapRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AbandonSwapRequest;
  static deserializeBinaryFromReader(message: AbandonSwapRequest, reader: jspb.BinaryReader): AbandonSwapRequest;
}

export namespace AbandonSwapRequest {
  export type AsObject = {
    id: Uint8Array | string,
    iKnowWhatIAmDoing: boolean,
  }
}

export class AbandonSwapResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AbandonSwapResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AbandonSwapResponse): AbandonSwapResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AbandonSwapResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AbandonSwapResponse;
  static deserializeBinaryFromReader(message: AbandonSwapResponse, reader: jspb.BinaryReader): AbandonSwapResponse;
}

export namespace AbandonSwapResponse {
  export type AsObject = {
  }
}

export interface AddressTypeMap {
  ADDRESS_TYPE_UNKNOWN: 0;
  TAPROOT_PUBKEY: 1;
}

export const AddressType: AddressTypeMap;

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

export interface FailureReasonMap {
  FAILURE_REASON_NONE: 0;
  FAILURE_REASON_OFFCHAIN: 1;
  FAILURE_REASON_TIMEOUT: 2;
  FAILURE_REASON_SWEEP_TIMEOUT: 3;
  FAILURE_REASON_INSUFFICIENT_VALUE: 4;
  FAILURE_REASON_TEMPORARY: 5;
  FAILURE_REASON_INCORRECT_AMOUNT: 6;
  FAILURE_REASON_ABANDONED: 7;
  FAILURE_REASON_INSUFFICIENT_CONFIRMED_BALANCE: 8;
}

export const FailureReason: FailureReasonMap;

export interface LiquidityRuleTypeMap {
  UNKNOWN: 0;
  THRESHOLD: 1;
}

export const LiquidityRuleType: LiquidityRuleTypeMap;

export interface AutoReasonMap {
  AUTO_REASON_UNKNOWN: 0;
  AUTO_REASON_BUDGET_NOT_STARTED: 1;
  AUTO_REASON_SWEEP_FEES: 2;
  AUTO_REASON_BUDGET_ELAPSED: 3;
  AUTO_REASON_IN_FLIGHT: 4;
  AUTO_REASON_SWAP_FEE: 5;
  AUTO_REASON_MINER_FEE: 6;
  AUTO_REASON_PREPAY: 7;
  AUTO_REASON_FAILURE_BACKOFF: 8;
  AUTO_REASON_LOOP_OUT: 9;
  AUTO_REASON_LOOP_IN: 10;
  AUTO_REASON_LIQUIDITY_OK: 11;
  AUTO_REASON_BUDGET_INSUFFICIENT: 12;
  AUTO_REASON_FEE_INSUFFICIENT: 13;
}

export const AutoReason: AutoReasonMap;

