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

  getIsExternalAddr(): boolean;
  setIsExternalAddr(value: boolean): void;

  clearReservationIdsList(): void;
  getReservationIdsList(): Array<Uint8Array | string>;
  getReservationIdsList_asU8(): Array<Uint8Array>;
  getReservationIdsList_asB64(): Array<string>;
  setReservationIdsList(value: Array<Uint8Array | string>): void;
  addReservationIds(value: Uint8Array | string, index?: number): Uint8Array | string;

  getPaymentTimeout(): number;
  setPaymentTimeout(value: number): void;

  hasAssetInfo(): boolean;
  clearAssetInfo(): void;
  getAssetInfo(): AssetLoopOutRequest | undefined;
  setAssetInfo(value?: AssetLoopOutRequest): void;

  hasAssetRfqInfo(): boolean;
  clearAssetRfqInfo(): void;
  getAssetRfqInfo(): AssetRfqInfo | undefined;
  setAssetRfqInfo(value?: AssetRfqInfo): void;

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
    isExternalAddr: boolean,
    reservationIdsList: Array<Uint8Array | string>,
    paymentTimeout: number,
    assetInfo?: AssetLoopOutRequest.AsObject,
    assetRfqInfo?: AssetRfqInfo.AsObject,
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

  hasAssetInfo(): boolean;
  clearAssetInfo(): void;
  getAssetInfo(): AssetLoopOutInfo | undefined;
  setAssetInfo(value?: AssetLoopOutInfo): void;

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
    assetInfo?: AssetLoopOutInfo.AsObject,
  }
}

export class ListSwapsRequest extends jspb.Message {
  hasListSwapFilter(): boolean;
  clearListSwapFilter(): void;
  getListSwapFilter(): ListSwapsFilter | undefined;
  setListSwapFilter(value?: ListSwapsFilter): void;

  getMaxSwaps(): string;
  setMaxSwaps(value: string): void;

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
    listSwapFilter?: ListSwapsFilter.AsObject,
    maxSwaps: string,
  }
}

export class ListSwapsFilter extends jspb.Message {
  getSwapType(): ListSwapsFilter.SwapTypeFilterMap[keyof ListSwapsFilter.SwapTypeFilterMap];
  setSwapType(value: ListSwapsFilter.SwapTypeFilterMap[keyof ListSwapsFilter.SwapTypeFilterMap]): void;

  getPendingOnly(): boolean;
  setPendingOnly(value: boolean): void;

  clearOutgoingChanSetList(): void;
  getOutgoingChanSetList(): Array<string>;
  setOutgoingChanSetList(value: Array<string>): void;
  addOutgoingChanSet(value: string, index?: number): string;

  getLabel(): string;
  setLabel(value: string): void;

  getLoopInLastHop(): Uint8Array | string;
  getLoopInLastHop_asU8(): Uint8Array;
  getLoopInLastHop_asB64(): string;
  setLoopInLastHop(value: Uint8Array | string): void;

  getAssetSwapOnly(): boolean;
  setAssetSwapOnly(value: boolean): void;

  getStartTimestampNs(): string;
  setStartTimestampNs(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListSwapsFilter.AsObject;
  static toObject(includeInstance: boolean, msg: ListSwapsFilter): ListSwapsFilter.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListSwapsFilter, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListSwapsFilter;
  static deserializeBinaryFromReader(message: ListSwapsFilter, reader: jspb.BinaryReader): ListSwapsFilter;
}

export namespace ListSwapsFilter {
  export type AsObject = {
    swapType: ListSwapsFilter.SwapTypeFilterMap[keyof ListSwapsFilter.SwapTypeFilterMap],
    pendingOnly: boolean,
    outgoingChanSetList: Array<string>,
    label: string,
    loopInLastHop: Uint8Array | string,
    assetSwapOnly: boolean,
    startTimestampNs: string,
  }

  export interface SwapTypeFilterMap {
    ANY: 0;
    LOOP_OUT: 1;
    LOOP_IN: 2;
  }

  export const SwapTypeFilter: SwapTypeFilterMap;
}

export class ListSwapsResponse extends jspb.Message {
  clearSwapsList(): void;
  getSwapsList(): Array<SwapStatus>;
  setSwapsList(value: Array<SwapStatus>): void;
  addSwaps(value?: SwapStatus, index?: number): SwapStatus;

  getNextStartTime(): string;
  setNextStartTime(value: string): void;

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
    nextStartTime: string,
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

  clearDepositOutpointsList(): void;
  getDepositOutpointsList(): Array<string>;
  setDepositOutpointsList(value: Array<string>): void;
  addDepositOutpoints(value: string, index?: number): string;

  hasAssetInfo(): boolean;
  clearAssetInfo(): void;
  getAssetInfo(): AssetLoopOutRequest | undefined;
  setAssetInfo(value?: AssetLoopOutRequest): void;

  getAutoSelectDeposits(): boolean;
  setAutoSelectDeposits(value: boolean): void;

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
    depositOutpointsList: Array<string>,
    assetInfo?: AssetLoopOutRequest.AsObject,
    autoSelectDeposits: boolean,
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

  hasAssetRfqInfo(): boolean;
  clearAssetRfqInfo(): void;
  getAssetRfqInfo(): AssetRfqInfo | undefined;
  setAssetRfqInfo(value?: AssetRfqInfo): void;

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
    assetRfqInfo?: AssetRfqInfo.AsObject,
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
  getTokensList(): Array<L402Token>;
  setTokensList(value: Array<L402Token>): void;
  addTokens(value?: L402Token, index?: number): L402Token;

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
    tokensList: Array<L402Token.AsObject>,
  }
}

export class FetchL402TokenRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FetchL402TokenRequest.AsObject;
  static toObject(includeInstance: boolean, msg: FetchL402TokenRequest): FetchL402TokenRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FetchL402TokenRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FetchL402TokenRequest;
  static deserializeBinaryFromReader(message: FetchL402TokenRequest, reader: jspb.BinaryReader): FetchL402TokenRequest;
}

export namespace FetchL402TokenRequest {
  export type AsObject = {
  }
}

export class FetchL402TokenResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FetchL402TokenResponse.AsObject;
  static toObject(includeInstance: boolean, msg: FetchL402TokenResponse): FetchL402TokenResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FetchL402TokenResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FetchL402TokenResponse;
  static deserializeBinaryFromReader(message: FetchL402TokenResponse, reader: jspb.BinaryReader): FetchL402TokenResponse;
}

export namespace FetchL402TokenResponse {
  export type AsObject = {
  }
}

export class L402Token extends jspb.Message {
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
  toObject(includeInstance?: boolean): L402Token.AsObject;
  static toObject(includeInstance: boolean, msg: L402Token): L402Token.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: L402Token, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): L402Token;
  static deserializeBinaryFromReader(message: L402Token, reader: jspb.BinaryReader): L402Token;
}

export namespace L402Token {
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

  getCommitHash(): string;
  setCommitHash(value: string): void;

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
    commitHash: string,
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

  getEasyAssetParamsMap(): jspb.Map<string, EasyAssetAutoloopParams>;
  clearEasyAssetParamsMap(): void;
  getFastSwapPublication(): boolean;
  setFastSwapPublication(value: boolean): void;

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
    easyAssetParamsMap: Array<[string, EasyAssetAutoloopParams.AsObject]>,
    fastSwapPublication: boolean,
  }
}

export class EasyAssetAutoloopParams extends jspb.Message {
  getEnabled(): boolean;
  setEnabled(value: boolean): void;

  getLocalTargetAssetAmt(): string;
  setLocalTargetAssetAmt(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EasyAssetAutoloopParams.AsObject;
  static toObject(includeInstance: boolean, msg: EasyAssetAutoloopParams): EasyAssetAutoloopParams.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: EasyAssetAutoloopParams, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EasyAssetAutoloopParams;
  static deserializeBinaryFromReader(message: EasyAssetAutoloopParams, reader: jspb.BinaryReader): EasyAssetAutoloopParams;
}

export namespace EasyAssetAutoloopParams {
  export type AsObject = {
    enabled: boolean,
    localTargetAssetAmt: string,
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

export class ListReservationsRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListReservationsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListReservationsRequest): ListReservationsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListReservationsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListReservationsRequest;
  static deserializeBinaryFromReader(message: ListReservationsRequest, reader: jspb.BinaryReader): ListReservationsRequest;
}

export namespace ListReservationsRequest {
  export type AsObject = {
  }
}

export class ListReservationsResponse extends jspb.Message {
  clearReservationsList(): void;
  getReservationsList(): Array<ClientReservation>;
  setReservationsList(value: Array<ClientReservation>): void;
  addReservations(value?: ClientReservation, index?: number): ClientReservation;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListReservationsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListReservationsResponse): ListReservationsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListReservationsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListReservationsResponse;
  static deserializeBinaryFromReader(message: ListReservationsResponse, reader: jspb.BinaryReader): ListReservationsResponse;
}

export namespace ListReservationsResponse {
  export type AsObject = {
    reservationsList: Array<ClientReservation.AsObject>,
  }
}

export class ClientReservation extends jspb.Message {
  getReservationId(): Uint8Array | string;
  getReservationId_asU8(): Uint8Array;
  getReservationId_asB64(): string;
  setReservationId(value: Uint8Array | string): void;

  getState(): string;
  setState(value: string): void;

  getAmount(): string;
  setAmount(value: string): void;

  getTxId(): string;
  setTxId(value: string): void;

  getVout(): number;
  setVout(value: number): void;

  getExpiry(): number;
  setExpiry(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ClientReservation.AsObject;
  static toObject(includeInstance: boolean, msg: ClientReservation): ClientReservation.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ClientReservation, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ClientReservation;
  static deserializeBinaryFromReader(message: ClientReservation, reader: jspb.BinaryReader): ClientReservation;
}

export namespace ClientReservation {
  export type AsObject = {
    reservationId: Uint8Array | string,
    state: string,
    amount: string,
    txId: string,
    vout: number,
    expiry: number,
  }
}

export class InstantOutRequest extends jspb.Message {
  clearReservationIdsList(): void;
  getReservationIdsList(): Array<Uint8Array | string>;
  getReservationIdsList_asU8(): Array<Uint8Array>;
  getReservationIdsList_asB64(): Array<string>;
  setReservationIdsList(value: Array<Uint8Array | string>): void;
  addReservationIds(value: Uint8Array | string, index?: number): Uint8Array | string;

  clearOutgoingChanSetList(): void;
  getOutgoingChanSetList(): Array<string>;
  setOutgoingChanSetList(value: Array<string>): void;
  addOutgoingChanSet(value: string, index?: number): string;

  getDestAddr(): string;
  setDestAddr(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InstantOutRequest.AsObject;
  static toObject(includeInstance: boolean, msg: InstantOutRequest): InstantOutRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InstantOutRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InstantOutRequest;
  static deserializeBinaryFromReader(message: InstantOutRequest, reader: jspb.BinaryReader): InstantOutRequest;
}

export namespace InstantOutRequest {
  export type AsObject = {
    reservationIdsList: Array<Uint8Array | string>,
    outgoingChanSetList: Array<string>,
    destAddr: string,
  }
}

export class InstantOutResponse extends jspb.Message {
  getInstantOutHash(): Uint8Array | string;
  getInstantOutHash_asU8(): Uint8Array;
  getInstantOutHash_asB64(): string;
  setInstantOutHash(value: Uint8Array | string): void;

  getSweepTxId(): string;
  setSweepTxId(value: string): void;

  getState(): string;
  setState(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InstantOutResponse.AsObject;
  static toObject(includeInstance: boolean, msg: InstantOutResponse): InstantOutResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InstantOutResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InstantOutResponse;
  static deserializeBinaryFromReader(message: InstantOutResponse, reader: jspb.BinaryReader): InstantOutResponse;
}

export namespace InstantOutResponse {
  export type AsObject = {
    instantOutHash: Uint8Array | string,
    sweepTxId: string,
    state: string,
  }
}

export class InstantOutQuoteRequest extends jspb.Message {
  getAmt(): string;
  setAmt(value: string): void;

  getNumReservations(): number;
  setNumReservations(value: number): void;

  clearReservationIdsList(): void;
  getReservationIdsList(): Array<Uint8Array | string>;
  getReservationIdsList_asU8(): Array<Uint8Array>;
  getReservationIdsList_asB64(): Array<string>;
  setReservationIdsList(value: Array<Uint8Array | string>): void;
  addReservationIds(value: Uint8Array | string, index?: number): Uint8Array | string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InstantOutQuoteRequest.AsObject;
  static toObject(includeInstance: boolean, msg: InstantOutQuoteRequest): InstantOutQuoteRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InstantOutQuoteRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InstantOutQuoteRequest;
  static deserializeBinaryFromReader(message: InstantOutQuoteRequest, reader: jspb.BinaryReader): InstantOutQuoteRequest;
}

export namespace InstantOutQuoteRequest {
  export type AsObject = {
    amt: string,
    numReservations: number,
    reservationIdsList: Array<Uint8Array | string>,
  }
}

export class InstantOutQuoteResponse extends jspb.Message {
  getServiceFeeSat(): string;
  setServiceFeeSat(value: string): void;

  getSweepFeeSat(): string;
  setSweepFeeSat(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InstantOutQuoteResponse.AsObject;
  static toObject(includeInstance: boolean, msg: InstantOutQuoteResponse): InstantOutQuoteResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InstantOutQuoteResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InstantOutQuoteResponse;
  static deserializeBinaryFromReader(message: InstantOutQuoteResponse, reader: jspb.BinaryReader): InstantOutQuoteResponse;
}

export namespace InstantOutQuoteResponse {
  export type AsObject = {
    serviceFeeSat: string,
    sweepFeeSat: string,
  }
}

export class ListInstantOutsRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListInstantOutsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListInstantOutsRequest): ListInstantOutsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListInstantOutsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListInstantOutsRequest;
  static deserializeBinaryFromReader(message: ListInstantOutsRequest, reader: jspb.BinaryReader): ListInstantOutsRequest;
}

export namespace ListInstantOutsRequest {
  export type AsObject = {
  }
}

export class ListInstantOutsResponse extends jspb.Message {
  clearSwapsList(): void;
  getSwapsList(): Array<InstantOut>;
  setSwapsList(value: Array<InstantOut>): void;
  addSwaps(value?: InstantOut, index?: number): InstantOut;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListInstantOutsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListInstantOutsResponse): ListInstantOutsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListInstantOutsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListInstantOutsResponse;
  static deserializeBinaryFromReader(message: ListInstantOutsResponse, reader: jspb.BinaryReader): ListInstantOutsResponse;
}

export namespace ListInstantOutsResponse {
  export type AsObject = {
    swapsList: Array<InstantOut.AsObject>,
  }
}

export class InstantOut extends jspb.Message {
  getSwapHash(): Uint8Array | string;
  getSwapHash_asU8(): Uint8Array;
  getSwapHash_asB64(): string;
  setSwapHash(value: Uint8Array | string): void;

  getState(): string;
  setState(value: string): void;

  getAmount(): string;
  setAmount(value: string): void;

  clearReservationIdsList(): void;
  getReservationIdsList(): Array<Uint8Array | string>;
  getReservationIdsList_asU8(): Array<Uint8Array>;
  getReservationIdsList_asB64(): Array<string>;
  setReservationIdsList(value: Array<Uint8Array | string>): void;
  addReservationIds(value: Uint8Array | string, index?: number): Uint8Array | string;

  getSweepTxId(): string;
  setSweepTxId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InstantOut.AsObject;
  static toObject(includeInstance: boolean, msg: InstantOut): InstantOut.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InstantOut, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InstantOut;
  static deserializeBinaryFromReader(message: InstantOut, reader: jspb.BinaryReader): InstantOut;
}

export namespace InstantOut {
  export type AsObject = {
    swapHash: Uint8Array | string,
    state: string,
    amount: string,
    reservationIdsList: Array<Uint8Array | string>,
    sweepTxId: string,
  }
}

export class NewStaticAddressRequest extends jspb.Message {
  getClientKey(): Uint8Array | string;
  getClientKey_asU8(): Uint8Array;
  getClientKey_asB64(): string;
  setClientKey(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NewStaticAddressRequest.AsObject;
  static toObject(includeInstance: boolean, msg: NewStaticAddressRequest): NewStaticAddressRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NewStaticAddressRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NewStaticAddressRequest;
  static deserializeBinaryFromReader(message: NewStaticAddressRequest, reader: jspb.BinaryReader): NewStaticAddressRequest;
}

export namespace NewStaticAddressRequest {
  export type AsObject = {
    clientKey: Uint8Array | string,
  }
}

export class NewStaticAddressResponse extends jspb.Message {
  getAddress(): string;
  setAddress(value: string): void;

  getExpiry(): number;
  setExpiry(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NewStaticAddressResponse.AsObject;
  static toObject(includeInstance: boolean, msg: NewStaticAddressResponse): NewStaticAddressResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NewStaticAddressResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NewStaticAddressResponse;
  static deserializeBinaryFromReader(message: NewStaticAddressResponse, reader: jspb.BinaryReader): NewStaticAddressResponse;
}

export namespace NewStaticAddressResponse {
  export type AsObject = {
    address: string,
    expiry: number,
  }
}

export class ListUnspentDepositsRequest extends jspb.Message {
  getMinConfs(): number;
  setMinConfs(value: number): void;

  getMaxConfs(): number;
  setMaxConfs(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListUnspentDepositsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListUnspentDepositsRequest): ListUnspentDepositsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListUnspentDepositsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListUnspentDepositsRequest;
  static deserializeBinaryFromReader(message: ListUnspentDepositsRequest, reader: jspb.BinaryReader): ListUnspentDepositsRequest;
}

export namespace ListUnspentDepositsRequest {
  export type AsObject = {
    minConfs: number,
    maxConfs: number,
  }
}

export class ListUnspentDepositsResponse extends jspb.Message {
  clearUtxosList(): void;
  getUtxosList(): Array<Utxo>;
  setUtxosList(value: Array<Utxo>): void;
  addUtxos(value?: Utxo, index?: number): Utxo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListUnspentDepositsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListUnspentDepositsResponse): ListUnspentDepositsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListUnspentDepositsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListUnspentDepositsResponse;
  static deserializeBinaryFromReader(message: ListUnspentDepositsResponse, reader: jspb.BinaryReader): ListUnspentDepositsResponse;
}

export namespace ListUnspentDepositsResponse {
  export type AsObject = {
    utxosList: Array<Utxo.AsObject>,
  }
}

export class Utxo extends jspb.Message {
  getStaticAddress(): string;
  setStaticAddress(value: string): void;

  getAmountSat(): string;
  setAmountSat(value: string): void;

  getOutpoint(): string;
  setOutpoint(value: string): void;

  getConfirmations(): string;
  setConfirmations(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Utxo.AsObject;
  static toObject(includeInstance: boolean, msg: Utxo): Utxo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Utxo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Utxo;
  static deserializeBinaryFromReader(message: Utxo, reader: jspb.BinaryReader): Utxo;
}

export namespace Utxo {
  export type AsObject = {
    staticAddress: string,
    amountSat: string,
    outpoint: string,
    confirmations: string,
  }
}

export class WithdrawDepositsRequest extends jspb.Message {
  clearOutpointsList(): void;
  getOutpointsList(): Array<OutPoint>;
  setOutpointsList(value: Array<OutPoint>): void;
  addOutpoints(value?: OutPoint, index?: number): OutPoint;

  getAll(): boolean;
  setAll(value: boolean): void;

  getDestAddr(): string;
  setDestAddr(value: string): void;

  getSatPerVbyte(): string;
  setSatPerVbyte(value: string): void;

  getAmount(): string;
  setAmount(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WithdrawDepositsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: WithdrawDepositsRequest): WithdrawDepositsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WithdrawDepositsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WithdrawDepositsRequest;
  static deserializeBinaryFromReader(message: WithdrawDepositsRequest, reader: jspb.BinaryReader): WithdrawDepositsRequest;
}

export namespace WithdrawDepositsRequest {
  export type AsObject = {
    outpointsList: Array<OutPoint.AsObject>,
    all: boolean,
    destAddr: string,
    satPerVbyte: string,
    amount: string,
  }
}

export class WithdrawDepositsResponse extends jspb.Message {
  getWithdrawalTxHash(): string;
  setWithdrawalTxHash(value: string): void;

  getAddress(): string;
  setAddress(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WithdrawDepositsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: WithdrawDepositsResponse): WithdrawDepositsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WithdrawDepositsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WithdrawDepositsResponse;
  static deserializeBinaryFromReader(message: WithdrawDepositsResponse, reader: jspb.BinaryReader): WithdrawDepositsResponse;
}

export namespace WithdrawDepositsResponse {
  export type AsObject = {
    withdrawalTxHash: string,
    address: string,
  }
}

export class OutPoint extends jspb.Message {
  getTxidBytes(): Uint8Array | string;
  getTxidBytes_asU8(): Uint8Array;
  getTxidBytes_asB64(): string;
  setTxidBytes(value: Uint8Array | string): void;

  getTxidStr(): string;
  setTxidStr(value: string): void;

  getOutputIndex(): number;
  setOutputIndex(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OutPoint.AsObject;
  static toObject(includeInstance: boolean, msg: OutPoint): OutPoint.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OutPoint, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OutPoint;
  static deserializeBinaryFromReader(message: OutPoint, reader: jspb.BinaryReader): OutPoint;
}

export namespace OutPoint {
  export type AsObject = {
    txidBytes: Uint8Array | string,
    txidStr: string,
    outputIndex: number,
  }
}

export class ListStaticAddressDepositsRequest extends jspb.Message {
  getStateFilter(): DepositStateMap[keyof DepositStateMap];
  setStateFilter(value: DepositStateMap[keyof DepositStateMap]): void;

  clearOutpointsList(): void;
  getOutpointsList(): Array<string>;
  setOutpointsList(value: Array<string>): void;
  addOutpoints(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListStaticAddressDepositsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListStaticAddressDepositsRequest): ListStaticAddressDepositsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListStaticAddressDepositsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListStaticAddressDepositsRequest;
  static deserializeBinaryFromReader(message: ListStaticAddressDepositsRequest, reader: jspb.BinaryReader): ListStaticAddressDepositsRequest;
}

export namespace ListStaticAddressDepositsRequest {
  export type AsObject = {
    stateFilter: DepositStateMap[keyof DepositStateMap],
    outpointsList: Array<string>,
  }
}

export class ListStaticAddressDepositsResponse extends jspb.Message {
  clearFilteredDepositsList(): void;
  getFilteredDepositsList(): Array<Deposit>;
  setFilteredDepositsList(value: Array<Deposit>): void;
  addFilteredDeposits(value?: Deposit, index?: number): Deposit;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListStaticAddressDepositsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListStaticAddressDepositsResponse): ListStaticAddressDepositsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListStaticAddressDepositsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListStaticAddressDepositsResponse;
  static deserializeBinaryFromReader(message: ListStaticAddressDepositsResponse, reader: jspb.BinaryReader): ListStaticAddressDepositsResponse;
}

export namespace ListStaticAddressDepositsResponse {
  export type AsObject = {
    filteredDepositsList: Array<Deposit.AsObject>,
  }
}

export class ListStaticAddressWithdrawalRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListStaticAddressWithdrawalRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListStaticAddressWithdrawalRequest): ListStaticAddressWithdrawalRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListStaticAddressWithdrawalRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListStaticAddressWithdrawalRequest;
  static deserializeBinaryFromReader(message: ListStaticAddressWithdrawalRequest, reader: jspb.BinaryReader): ListStaticAddressWithdrawalRequest;
}

export namespace ListStaticAddressWithdrawalRequest {
  export type AsObject = {
  }
}

export class ListStaticAddressWithdrawalResponse extends jspb.Message {
  clearWithdrawalsList(): void;
  getWithdrawalsList(): Array<StaticAddressWithdrawal>;
  setWithdrawalsList(value: Array<StaticAddressWithdrawal>): void;
  addWithdrawals(value?: StaticAddressWithdrawal, index?: number): StaticAddressWithdrawal;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListStaticAddressWithdrawalResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListStaticAddressWithdrawalResponse): ListStaticAddressWithdrawalResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListStaticAddressWithdrawalResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListStaticAddressWithdrawalResponse;
  static deserializeBinaryFromReader(message: ListStaticAddressWithdrawalResponse, reader: jspb.BinaryReader): ListStaticAddressWithdrawalResponse;
}

export namespace ListStaticAddressWithdrawalResponse {
  export type AsObject = {
    withdrawalsList: Array<StaticAddressWithdrawal.AsObject>,
  }
}

export class ListStaticAddressSwapsRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListStaticAddressSwapsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListStaticAddressSwapsRequest): ListStaticAddressSwapsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListStaticAddressSwapsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListStaticAddressSwapsRequest;
  static deserializeBinaryFromReader(message: ListStaticAddressSwapsRequest, reader: jspb.BinaryReader): ListStaticAddressSwapsRequest;
}

export namespace ListStaticAddressSwapsRequest {
  export type AsObject = {
  }
}

export class ListStaticAddressSwapsResponse extends jspb.Message {
  clearSwapsList(): void;
  getSwapsList(): Array<StaticAddressLoopInSwap>;
  setSwapsList(value: Array<StaticAddressLoopInSwap>): void;
  addSwaps(value?: StaticAddressLoopInSwap, index?: number): StaticAddressLoopInSwap;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListStaticAddressSwapsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListStaticAddressSwapsResponse): ListStaticAddressSwapsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListStaticAddressSwapsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListStaticAddressSwapsResponse;
  static deserializeBinaryFromReader(message: ListStaticAddressSwapsResponse, reader: jspb.BinaryReader): ListStaticAddressSwapsResponse;
}

export namespace ListStaticAddressSwapsResponse {
  export type AsObject = {
    swapsList: Array<StaticAddressLoopInSwap.AsObject>,
  }
}

export class StaticAddressSummaryRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StaticAddressSummaryRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StaticAddressSummaryRequest): StaticAddressSummaryRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StaticAddressSummaryRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StaticAddressSummaryRequest;
  static deserializeBinaryFromReader(message: StaticAddressSummaryRequest, reader: jspb.BinaryReader): StaticAddressSummaryRequest;
}

export namespace StaticAddressSummaryRequest {
  export type AsObject = {
  }
}

export class StaticAddressSummaryResponse extends jspb.Message {
  getStaticAddress(): string;
  setStaticAddress(value: string): void;

  getRelativeExpiryBlocks(): string;
  setRelativeExpiryBlocks(value: string): void;

  getTotalNumDeposits(): number;
  setTotalNumDeposits(value: number): void;

  getValueUnconfirmedSatoshis(): string;
  setValueUnconfirmedSatoshis(value: string): void;

  getValueDepositedSatoshis(): string;
  setValueDepositedSatoshis(value: string): void;

  getValueExpiredSatoshis(): string;
  setValueExpiredSatoshis(value: string): void;

  getValueWithdrawnSatoshis(): string;
  setValueWithdrawnSatoshis(value: string): void;

  getValueLoopedInSatoshis(): string;
  setValueLoopedInSatoshis(value: string): void;

  getValueHtlcTimeoutSweepsSatoshis(): string;
  setValueHtlcTimeoutSweepsSatoshis(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StaticAddressSummaryResponse.AsObject;
  static toObject(includeInstance: boolean, msg: StaticAddressSummaryResponse): StaticAddressSummaryResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StaticAddressSummaryResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StaticAddressSummaryResponse;
  static deserializeBinaryFromReader(message: StaticAddressSummaryResponse, reader: jspb.BinaryReader): StaticAddressSummaryResponse;
}

export namespace StaticAddressSummaryResponse {
  export type AsObject = {
    staticAddress: string,
    relativeExpiryBlocks: string,
    totalNumDeposits: number,
    valueUnconfirmedSatoshis: string,
    valueDepositedSatoshis: string,
    valueExpiredSatoshis: string,
    valueWithdrawnSatoshis: string,
    valueLoopedInSatoshis: string,
    valueHtlcTimeoutSweepsSatoshis: string,
  }
}

export class Deposit extends jspb.Message {
  getId(): Uint8Array | string;
  getId_asU8(): Uint8Array;
  getId_asB64(): string;
  setId(value: Uint8Array | string): void;

  getState(): DepositStateMap[keyof DepositStateMap];
  setState(value: DepositStateMap[keyof DepositStateMap]): void;

  getOutpoint(): string;
  setOutpoint(value: string): void;

  getValue(): string;
  setValue(value: string): void;

  getConfirmationHeight(): string;
  setConfirmationHeight(value: string): void;

  getBlocksUntilExpiry(): string;
  setBlocksUntilExpiry(value: string): void;

  getSwapHash(): Uint8Array | string;
  getSwapHash_asU8(): Uint8Array;
  getSwapHash_asB64(): string;
  setSwapHash(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Deposit.AsObject;
  static toObject(includeInstance: boolean, msg: Deposit): Deposit.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Deposit, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Deposit;
  static deserializeBinaryFromReader(message: Deposit, reader: jspb.BinaryReader): Deposit;
}

export namespace Deposit {
  export type AsObject = {
    id: Uint8Array | string,
    state: DepositStateMap[keyof DepositStateMap],
    outpoint: string,
    value: string,
    confirmationHeight: string,
    blocksUntilExpiry: string,
    swapHash: Uint8Array | string,
  }
}

export class StaticAddressWithdrawal extends jspb.Message {
  getTxId(): string;
  setTxId(value: string): void;

  clearDepositsList(): void;
  getDepositsList(): Array<Deposit>;
  setDepositsList(value: Array<Deposit>): void;
  addDeposits(value?: Deposit, index?: number): Deposit;

  getTotalDepositAmountSatoshis(): string;
  setTotalDepositAmountSatoshis(value: string): void;

  getWithdrawnAmountSatoshis(): string;
  setWithdrawnAmountSatoshis(value: string): void;

  getChangeAmountSatoshis(): string;
  setChangeAmountSatoshis(value: string): void;

  getConfirmationHeight(): number;
  setConfirmationHeight(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StaticAddressWithdrawal.AsObject;
  static toObject(includeInstance: boolean, msg: StaticAddressWithdrawal): StaticAddressWithdrawal.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StaticAddressWithdrawal, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StaticAddressWithdrawal;
  static deserializeBinaryFromReader(message: StaticAddressWithdrawal, reader: jspb.BinaryReader): StaticAddressWithdrawal;
}

export namespace StaticAddressWithdrawal {
  export type AsObject = {
    txId: string,
    depositsList: Array<Deposit.AsObject>,
    totalDepositAmountSatoshis: string,
    withdrawnAmountSatoshis: string,
    changeAmountSatoshis: string,
    confirmationHeight: number,
  }
}

export class StaticAddressLoopInSwap extends jspb.Message {
  getSwapHash(): Uint8Array | string;
  getSwapHash_asU8(): Uint8Array;
  getSwapHash_asB64(): string;
  setSwapHash(value: Uint8Array | string): void;

  clearDepositOutpointsList(): void;
  getDepositOutpointsList(): Array<string>;
  setDepositOutpointsList(value: Array<string>): void;
  addDepositOutpoints(value: string, index?: number): string;

  getState(): StaticAddressLoopInSwapStateMap[keyof StaticAddressLoopInSwapStateMap];
  setState(value: StaticAddressLoopInSwapStateMap[keyof StaticAddressLoopInSwapStateMap]): void;

  getSwapAmountSatoshis(): string;
  setSwapAmountSatoshis(value: string): void;

  getPaymentRequestAmountSatoshis(): string;
  setPaymentRequestAmountSatoshis(value: string): void;

  clearDepositsList(): void;
  getDepositsList(): Array<Deposit>;
  setDepositsList(value: Array<Deposit>): void;
  addDeposits(value?: Deposit, index?: number): Deposit;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StaticAddressLoopInSwap.AsObject;
  static toObject(includeInstance: boolean, msg: StaticAddressLoopInSwap): StaticAddressLoopInSwap.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StaticAddressLoopInSwap, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StaticAddressLoopInSwap;
  static deserializeBinaryFromReader(message: StaticAddressLoopInSwap, reader: jspb.BinaryReader): StaticAddressLoopInSwap;
}

export namespace StaticAddressLoopInSwap {
  export type AsObject = {
    swapHash: Uint8Array | string,
    depositOutpointsList: Array<string>,
    state: StaticAddressLoopInSwapStateMap[keyof StaticAddressLoopInSwapStateMap],
    swapAmountSatoshis: string,
    paymentRequestAmountSatoshis: string,
    depositsList: Array<Deposit.AsObject>,
  }
}

export class StaticAddressLoopInRequest extends jspb.Message {
  clearOutpointsList(): void;
  getOutpointsList(): Array<string>;
  setOutpointsList(value: Array<string>): void;
  addOutpoints(value: string, index?: number): string;

  getMaxSwapFeeSatoshis(): string;
  setMaxSwapFeeSatoshis(value: string): void;

  getLastHop(): Uint8Array | string;
  getLastHop_asU8(): Uint8Array;
  getLastHop_asB64(): string;
  setLastHop(value: Uint8Array | string): void;

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

  getPaymentTimeoutSeconds(): number;
  setPaymentTimeoutSeconds(value: number): void;

  getAmount(): string;
  setAmount(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StaticAddressLoopInRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StaticAddressLoopInRequest): StaticAddressLoopInRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StaticAddressLoopInRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StaticAddressLoopInRequest;
  static deserializeBinaryFromReader(message: StaticAddressLoopInRequest, reader: jspb.BinaryReader): StaticAddressLoopInRequest;
}

export namespace StaticAddressLoopInRequest {
  export type AsObject = {
    outpointsList: Array<string>,
    maxSwapFeeSatoshis: string,
    lastHop: Uint8Array | string,
    label: string,
    initiator: string,
    routeHintsList: Array<swapserverrpc_common_pb.RouteHint.AsObject>,
    pb_private: boolean,
    paymentTimeoutSeconds: number,
    amount: string,
  }
}

export class StaticAddressLoopInResponse extends jspb.Message {
  getSwapHash(): Uint8Array | string;
  getSwapHash_asU8(): Uint8Array;
  getSwapHash_asB64(): string;
  setSwapHash(value: Uint8Array | string): void;

  getState(): string;
  setState(value: string): void;

  getAmount(): string;
  setAmount(value: string): void;

  getHtlcCltv(): number;
  setHtlcCltv(value: number): void;

  getQuotedSwapFeeSatoshis(): string;
  setQuotedSwapFeeSatoshis(value: string): void;

  getMaxSwapFeeSatoshis(): string;
  setMaxSwapFeeSatoshis(value: string): void;

  getInitiationHeight(): number;
  setInitiationHeight(value: number): void;

  getProtocolVersion(): string;
  setProtocolVersion(value: string): void;

  getLabel(): string;
  setLabel(value: string): void;

  getInitiator(): string;
  setInitiator(value: string): void;

  getPaymentTimeoutSeconds(): number;
  setPaymentTimeoutSeconds(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StaticAddressLoopInResponse.AsObject;
  static toObject(includeInstance: boolean, msg: StaticAddressLoopInResponse): StaticAddressLoopInResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StaticAddressLoopInResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StaticAddressLoopInResponse;
  static deserializeBinaryFromReader(message: StaticAddressLoopInResponse, reader: jspb.BinaryReader): StaticAddressLoopInResponse;
}

export namespace StaticAddressLoopInResponse {
  export type AsObject = {
    swapHash: Uint8Array | string,
    state: string,
    amount: string,
    htlcCltv: number,
    quotedSwapFeeSatoshis: string,
    maxSwapFeeSatoshis: string,
    initiationHeight: number,
    protocolVersion: string,
    label: string,
    initiator: string,
    paymentTimeoutSeconds: number,
  }
}

export class AssetLoopOutRequest extends jspb.Message {
  getAssetId(): Uint8Array | string;
  getAssetId_asU8(): Uint8Array;
  getAssetId_asB64(): string;
  setAssetId(value: Uint8Array | string): void;

  getAssetEdgeNode(): Uint8Array | string;
  getAssetEdgeNode_asU8(): Uint8Array;
  getAssetEdgeNode_asB64(): string;
  setAssetEdgeNode(value: Uint8Array | string): void;

  getMaxLimitMultiplier(): number;
  setMaxLimitMultiplier(value: number): void;

  getExpiry(): string;
  setExpiry(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AssetLoopOutRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AssetLoopOutRequest): AssetLoopOutRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AssetLoopOutRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AssetLoopOutRequest;
  static deserializeBinaryFromReader(message: AssetLoopOutRequest, reader: jspb.BinaryReader): AssetLoopOutRequest;
}

export namespace AssetLoopOutRequest {
  export type AsObject = {
    assetId: Uint8Array | string,
    assetEdgeNode: Uint8Array | string,
    maxLimitMultiplier: number,
    expiry: string,
  }
}

export class AssetRfqInfo extends jspb.Message {
  getPrepayRfqId(): Uint8Array | string;
  getPrepayRfqId_asU8(): Uint8Array;
  getPrepayRfqId_asB64(): string;
  setPrepayRfqId(value: Uint8Array | string): void;

  getMaxPrepayAssetAmt(): string;
  setMaxPrepayAssetAmt(value: string): void;

  hasPrepayAssetRate(): boolean;
  clearPrepayAssetRate(): void;
  getPrepayAssetRate(): FixedPoint | undefined;
  setPrepayAssetRate(value?: FixedPoint): void;

  getSwapRfqId(): Uint8Array | string;
  getSwapRfqId_asU8(): Uint8Array;
  getSwapRfqId_asB64(): string;
  setSwapRfqId(value: Uint8Array | string): void;

  getMaxSwapAssetAmt(): string;
  setMaxSwapAssetAmt(value: string): void;

  hasSwapAssetRate(): boolean;
  clearSwapAssetRate(): void;
  getSwapAssetRate(): FixedPoint | undefined;
  setSwapAssetRate(value?: FixedPoint): void;

  getAssetName(): string;
  setAssetName(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AssetRfqInfo.AsObject;
  static toObject(includeInstance: boolean, msg: AssetRfqInfo): AssetRfqInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AssetRfqInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AssetRfqInfo;
  static deserializeBinaryFromReader(message: AssetRfqInfo, reader: jspb.BinaryReader): AssetRfqInfo;
}

export namespace AssetRfqInfo {
  export type AsObject = {
    prepayRfqId: Uint8Array | string,
    maxPrepayAssetAmt: string,
    prepayAssetRate?: FixedPoint.AsObject,
    swapRfqId: Uint8Array | string,
    maxSwapAssetAmt: string,
    swapAssetRate?: FixedPoint.AsObject,
    assetName: string,
  }
}

export class FixedPoint extends jspb.Message {
  getCoefficient(): string;
  setCoefficient(value: string): void;

  getScale(): number;
  setScale(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FixedPoint.AsObject;
  static toObject(includeInstance: boolean, msg: FixedPoint): FixedPoint.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FixedPoint, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FixedPoint;
  static deserializeBinaryFromReader(message: FixedPoint, reader: jspb.BinaryReader): FixedPoint;
}

export namespace FixedPoint {
  export type AsObject = {
    coefficient: string,
    scale: number,
  }
}

export class AssetLoopOutInfo extends jspb.Message {
  getAssetId(): string;
  setAssetId(value: string): void;

  getAssetName(): string;
  setAssetName(value: string): void;

  getAssetCostOffchain(): string;
  setAssetCostOffchain(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AssetLoopOutInfo.AsObject;
  static toObject(includeInstance: boolean, msg: AssetLoopOutInfo): AssetLoopOutInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AssetLoopOutInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AssetLoopOutInfo;
  static deserializeBinaryFromReader(message: AssetLoopOutInfo, reader: jspb.BinaryReader): AssetLoopOutInfo;
}

export namespace AssetLoopOutInfo {
  export type AsObject = {
    assetId: string,
    assetName: string,
    assetCostOffchain: string,
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
  FAILURE_REASON_INCORRECT_HTLC_AMT_SWEPT: 9;
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

export interface DepositStateMap {
  UNKNOWN_STATE: 0;
  DEPOSITED: 1;
  WITHDRAWING: 2;
  WITHDRAWN: 3;
  LOOPING_IN: 4;
  LOOPED_IN: 5;
  SWEEP_HTLC_TIMEOUT: 6;
  HTLC_TIMEOUT_SWEPT: 7;
  PUBLISH_EXPIRED: 8;
  WAIT_FOR_EXPIRY_SWEEP: 9;
  EXPIRED: 10;
}

export const DepositState: DepositStateMap;

export interface StaticAddressLoopInSwapStateMap {
  UNKNOWN_STATIC_ADDRESS_SWAP_STATE: 0;
  INIT_HTLC: 1;
  SIGN_HTLC_TX: 2;
  MONITOR_INVOICE_HTLC_TX: 3;
  PAYMENT_RECEIVED: 4;
  SWEEP_STATIC_ADDRESS_HTLC_TIMEOUT: 5;
  MONITOR_HTLC_TIMEOUT_SWEEP: 6;
  HTLC_STATIC_ADDRESS_TIMEOUT_SWEPT: 7;
  SUCCEEDED: 8;
  SUCCEEDED_TRANSITIONING_FAILED: 9;
  UNLOCK_DEPOSITS: 10;
  FAILED_STATIC_ADDRESS_SWAP: 11;
}

export const StaticAddressLoopInSwapState: StaticAddressLoopInSwapStateMap;

