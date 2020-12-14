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

  getHtlcConfirmations(): number;
  setHtlcConfirmations(value: number): void;

  getSwapPublicationDeadline(): number;
  setSwapPublicationDeadline(value: number): void;

  getLabel(): string;
  setLabel(value: string): void;

  getInitiator(): string;
  setInitiator(value: string): void;

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
    htlcConfirmations: number,
    swapPublicationDeadline: number,
    label: string,
    initiator: string,
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

  getLabel(): string;
  setLabel(value: string): void;

  getInitiator(): string;
  setInitiator(value: string): void;

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
    label: string,
    initiator: string,
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
    htlcAddressNp2wsh: string,
    htlcAddressP2wsh: string,
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

  getFailureReason(): FailureReasonMap[keyof FailureReasonMap];
  setFailureReason(value: FailureReasonMap[keyof FailureReasonMap]): void;

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
    amt: number,
    id: string,
    idBytes: Uint8Array | string,
    type: SwapTypeMap[keyof SwapTypeMap],
    state: SwapStateMap[keyof SwapStateMap],
    failureReason: FailureReasonMap[keyof FailureReasonMap],
    initiationTime: number,
    lastUpdateTime: number,
    htlcAddress: string,
    htlcAddressP2wsh: string,
    htlcAddressNp2wsh: string,
    costServer: number,
    costOnchain: number,
    costOffchain: number,
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
  getMinSwapAmount(): number;
  setMinSwapAmount(value: number): void;

  getMaxSwapAmount(): number;
  setMaxSwapAmount(value: number): void;

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
    minSwapAmount: number,
    maxSwapAmount: number,
  }
}

export class OutTermsResponse extends jspb.Message {
  getMinSwapAmount(): number;
  setMinSwapAmount(value: number): void;

  getMaxSwapAmount(): number;
  setMaxSwapAmount(value: number): void;

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
    minSwapAmount: number,
    maxSwapAmount: number,
    minCltvDelta: number,
    maxCltvDelta: number,
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

export class InQuoteResponse extends jspb.Message {
  getSwapFeeSat(): number;
  setSwapFeeSat(value: number): void;

  getHtlcPublishFeeSat(): number;
  setHtlcPublishFeeSat(value: number): void;

  getCltvDelta(): number;
  setCltvDelta(value: number): void;

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
    swapFeeSat: number,
    htlcPublishFeeSat: number,
    cltvDelta: number,
  }
}

export class OutQuoteResponse extends jspb.Message {
  getSwapFeeSat(): number;
  setSwapFeeSat(value: number): void;

  getPrepayAmtSat(): number;
  setPrepayAmtSat(value: number): void;

  getHtlcSweepFeeSat(): number;
  setHtlcSweepFeeSat(value: number): void;

  getSwapPaymentDest(): Uint8Array | string;
  getSwapPaymentDest_asU8(): Uint8Array;
  getSwapPaymentDest_asB64(): string;
  setSwapPaymentDest(value: Uint8Array | string): void;

  getCltvDelta(): number;
  setCltvDelta(value: number): void;

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
    swapFeeSat: number,
    prepayAmtSat: number,
    htlcSweepFeeSat: number,
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

  getSweepFeeRateSatPerVbyte(): number;
  setSweepFeeRateSatPerVbyte(value: number): void;

  getMaxSwapFeePpm(): number;
  setMaxSwapFeePpm(value: number): void;

  getMaxRoutingFeePpm(): number;
  setMaxRoutingFeePpm(value: number): void;

  getMaxPrepayRoutingFeePpm(): number;
  setMaxPrepayRoutingFeePpm(value: number): void;

  getMaxPrepaySat(): number;
  setMaxPrepaySat(value: number): void;

  getMaxMinerFeeSat(): number;
  setMaxMinerFeeSat(value: number): void;

  getSweepConfTarget(): number;
  setSweepConfTarget(value: number): void;

  getFailureBackoffSec(): number;
  setFailureBackoffSec(value: number): void;

  getAutoLoopOut(): boolean;
  setAutoLoopOut(value: boolean): void;

  getAutoOutBudgetSat(): number;
  setAutoOutBudgetSat(value: number): void;

  getAutoOutBudgetStartSec(): number;
  setAutoOutBudgetStartSec(value: number): void;

  getAutoMaxInFlight(): number;
  setAutoMaxInFlight(value: number): void;

  getMinSwapAmount(): number;
  setMinSwapAmount(value: number): void;

  getMaxSwapAmount(): number;
  setMaxSwapAmount(value: number): void;

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
    sweepFeeRateSatPerVbyte: number,
    maxSwapFeePpm: number,
    maxRoutingFeePpm: number,
    maxPrepayRoutingFeePpm: number,
    maxPrepaySat: number,
    maxMinerFeeSat: number,
    sweepConfTarget: number,
    failureBackoffSec: number,
    autoLoopOut: boolean,
    autoOutBudgetSat: number,
    autoOutBudgetStartSec: number,
    autoMaxInFlight: number,
    minSwapAmount: number,
    maxSwapAmount: number,
  }
}

export class LiquidityRule extends jspb.Message {
  getChannelId(): number;
  setChannelId(value: number): void;

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
    channelId: number,
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

export class SuggestSwapsResponse extends jspb.Message {
  clearLoopOutList(): void;
  getLoopOutList(): Array<LoopOutRequest>;
  setLoopOutList(value: Array<LoopOutRequest>): void;
  addLoopOut(value?: LoopOutRequest, index?: number): LoopOutRequest;

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

export interface FailureReasonMap {
  FAILURE_REASON_NONE: 0;
  FAILURE_REASON_OFFCHAIN: 1;
  FAILURE_REASON_TIMEOUT: 2;
  FAILURE_REASON_SWEEP_TIMEOUT: 3;
  FAILURE_REASON_INSUFFICIENT_VALUE: 4;
  FAILURE_REASON_TEMPORARY: 5;
  FAILURE_REASON_INCORRECT_AMOUNT: 6;
}

export const FailureReason: FailureReasonMap;

export interface LiquidityRuleTypeMap {
  UNKNOWN: 0;
  THRESHOLD: 1;
}

export const LiquidityRuleType: LiquidityRuleTypeMap;

