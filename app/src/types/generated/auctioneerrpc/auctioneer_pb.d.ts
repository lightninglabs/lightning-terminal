// package: poolrpc
// file: auctioneerrpc/auctioneer.proto

import * as jspb from "google-protobuf";

export class ReserveAccountRequest extends jspb.Message {
  getAccountValue(): string;
  setAccountValue(value: string): void;

  getAccountExpiry(): number;
  setAccountExpiry(value: number): void;

  getTraderKey(): Uint8Array | string;
  getTraderKey_asU8(): Uint8Array;
  getTraderKey_asB64(): string;
  setTraderKey(value: Uint8Array | string): void;

  getVersion(): number;
  setVersion(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReserveAccountRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ReserveAccountRequest): ReserveAccountRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ReserveAccountRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReserveAccountRequest;
  static deserializeBinaryFromReader(message: ReserveAccountRequest, reader: jspb.BinaryReader): ReserveAccountRequest;
}

export namespace ReserveAccountRequest {
  export type AsObject = {
    accountValue: string,
    accountExpiry: number,
    traderKey: Uint8Array | string,
    version: number,
  }
}

export class ReserveAccountResponse extends jspb.Message {
  getAuctioneerKey(): Uint8Array | string;
  getAuctioneerKey_asU8(): Uint8Array;
  getAuctioneerKey_asB64(): string;
  setAuctioneerKey(value: Uint8Array | string): void;

  getInitialBatchKey(): Uint8Array | string;
  getInitialBatchKey_asU8(): Uint8Array;
  getInitialBatchKey_asB64(): string;
  setInitialBatchKey(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReserveAccountResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ReserveAccountResponse): ReserveAccountResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ReserveAccountResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReserveAccountResponse;
  static deserializeBinaryFromReader(message: ReserveAccountResponse, reader: jspb.BinaryReader): ReserveAccountResponse;
}

export namespace ReserveAccountResponse {
  export type AsObject = {
    auctioneerKey: Uint8Array | string,
    initialBatchKey: Uint8Array | string,
  }
}

export class ServerInitAccountRequest extends jspb.Message {
  hasAccountPoint(): boolean;
  clearAccountPoint(): void;
  getAccountPoint(): OutPoint | undefined;
  setAccountPoint(value?: OutPoint): void;

  getAccountScript(): Uint8Array | string;
  getAccountScript_asU8(): Uint8Array;
  getAccountScript_asB64(): string;
  setAccountScript(value: Uint8Array | string): void;

  getAccountValue(): string;
  setAccountValue(value: string): void;

  getAccountExpiry(): number;
  setAccountExpiry(value: number): void;

  getTraderKey(): Uint8Array | string;
  getTraderKey_asU8(): Uint8Array;
  getTraderKey_asB64(): string;
  setTraderKey(value: Uint8Array | string): void;

  getUserAgent(): string;
  setUserAgent(value: string): void;

  getVersion(): number;
  setVersion(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerInitAccountRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ServerInitAccountRequest): ServerInitAccountRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerInitAccountRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerInitAccountRequest;
  static deserializeBinaryFromReader(message: ServerInitAccountRequest, reader: jspb.BinaryReader): ServerInitAccountRequest;
}

export namespace ServerInitAccountRequest {
  export type AsObject = {
    accountPoint?: OutPoint.AsObject,
    accountScript: Uint8Array | string,
    accountValue: string,
    accountExpiry: number,
    traderKey: Uint8Array | string,
    userAgent: string,
    version: number,
  }
}

export class ServerInitAccountResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerInitAccountResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ServerInitAccountResponse): ServerInitAccountResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerInitAccountResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerInitAccountResponse;
  static deserializeBinaryFromReader(message: ServerInitAccountResponse, reader: jspb.BinaryReader): ServerInitAccountResponse;
}

export namespace ServerInitAccountResponse {
  export type AsObject = {
  }
}

export class ServerSubmitOrderRequest extends jspb.Message {
  hasAsk(): boolean;
  clearAsk(): void;
  getAsk(): ServerAsk | undefined;
  setAsk(value?: ServerAsk): void;

  hasBid(): boolean;
  clearBid(): void;
  getBid(): ServerBid | undefined;
  setBid(value?: ServerBid): void;

  getUserAgent(): string;
  setUserAgent(value: string): void;

  getDetailsCase(): ServerSubmitOrderRequest.DetailsCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerSubmitOrderRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ServerSubmitOrderRequest): ServerSubmitOrderRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerSubmitOrderRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerSubmitOrderRequest;
  static deserializeBinaryFromReader(message: ServerSubmitOrderRequest, reader: jspb.BinaryReader): ServerSubmitOrderRequest;
}

export namespace ServerSubmitOrderRequest {
  export type AsObject = {
    ask?: ServerAsk.AsObject,
    bid?: ServerBid.AsObject,
    userAgent: string,
  }

  export enum DetailsCase {
    DETAILS_NOT_SET = 0,
    ASK = 1,
    BID = 2,
  }
}

export class ServerSubmitOrderResponse extends jspb.Message {
  hasInvalidOrder(): boolean;
  clearInvalidOrder(): void;
  getInvalidOrder(): InvalidOrder | undefined;
  setInvalidOrder(value?: InvalidOrder): void;

  hasAccepted(): boolean;
  clearAccepted(): void;
  getAccepted(): boolean;
  setAccepted(value: boolean): void;

  getDetailsCase(): ServerSubmitOrderResponse.DetailsCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerSubmitOrderResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ServerSubmitOrderResponse): ServerSubmitOrderResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerSubmitOrderResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerSubmitOrderResponse;
  static deserializeBinaryFromReader(message: ServerSubmitOrderResponse, reader: jspb.BinaryReader): ServerSubmitOrderResponse;
}

export namespace ServerSubmitOrderResponse {
  export type AsObject = {
    invalidOrder?: InvalidOrder.AsObject,
    accepted: boolean,
  }

  export enum DetailsCase {
    DETAILS_NOT_SET = 0,
    INVALID_ORDER = 1,
    ACCEPTED = 2,
  }
}

export class ServerCancelOrderRequest extends jspb.Message {
  getOrderNoncePreimage(): Uint8Array | string;
  getOrderNoncePreimage_asU8(): Uint8Array;
  getOrderNoncePreimage_asB64(): string;
  setOrderNoncePreimage(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerCancelOrderRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ServerCancelOrderRequest): ServerCancelOrderRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerCancelOrderRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerCancelOrderRequest;
  static deserializeBinaryFromReader(message: ServerCancelOrderRequest, reader: jspb.BinaryReader): ServerCancelOrderRequest;
}

export namespace ServerCancelOrderRequest {
  export type AsObject = {
    orderNoncePreimage: Uint8Array | string,
  }
}

export class ServerCancelOrderResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerCancelOrderResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ServerCancelOrderResponse): ServerCancelOrderResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerCancelOrderResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerCancelOrderResponse;
  static deserializeBinaryFromReader(message: ServerCancelOrderResponse, reader: jspb.BinaryReader): ServerCancelOrderResponse;
}

export namespace ServerCancelOrderResponse {
  export type AsObject = {
  }
}

export class ClientAuctionMessage extends jspb.Message {
  hasCommit(): boolean;
  clearCommit(): void;
  getCommit(): AccountCommitment | undefined;
  setCommit(value?: AccountCommitment): void;

  hasSubscribe(): boolean;
  clearSubscribe(): void;
  getSubscribe(): AccountSubscription | undefined;
  setSubscribe(value?: AccountSubscription): void;

  hasAccept(): boolean;
  clearAccept(): void;
  getAccept(): OrderMatchAccept | undefined;
  setAccept(value?: OrderMatchAccept): void;

  hasReject(): boolean;
  clearReject(): void;
  getReject(): OrderMatchReject | undefined;
  setReject(value?: OrderMatchReject): void;

  hasSign(): boolean;
  clearSign(): void;
  getSign(): OrderMatchSign | undefined;
  setSign(value?: OrderMatchSign): void;

  hasRecover(): boolean;
  clearRecover(): void;
  getRecover(): AccountRecovery | undefined;
  setRecover(value?: AccountRecovery): void;

  getMsgCase(): ClientAuctionMessage.MsgCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ClientAuctionMessage.AsObject;
  static toObject(includeInstance: boolean, msg: ClientAuctionMessage): ClientAuctionMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ClientAuctionMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ClientAuctionMessage;
  static deserializeBinaryFromReader(message: ClientAuctionMessage, reader: jspb.BinaryReader): ClientAuctionMessage;
}

export namespace ClientAuctionMessage {
  export type AsObject = {
    commit?: AccountCommitment.AsObject,
    subscribe?: AccountSubscription.AsObject,
    accept?: OrderMatchAccept.AsObject,
    reject?: OrderMatchReject.AsObject,
    sign?: OrderMatchSign.AsObject,
    recover?: AccountRecovery.AsObject,
  }

  export enum MsgCase {
    MSG_NOT_SET = 0,
    COMMIT = 1,
    SUBSCRIBE = 2,
    ACCEPT = 3,
    REJECT = 4,
    SIGN = 5,
    RECOVER = 6,
  }
}

export class AccountCommitment extends jspb.Message {
  getCommitHash(): Uint8Array | string;
  getCommitHash_asU8(): Uint8Array;
  getCommitHash_asB64(): string;
  setCommitHash(value: Uint8Array | string): void;

  getBatchVersion(): number;
  setBatchVersion(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountCommitment.AsObject;
  static toObject(includeInstance: boolean, msg: AccountCommitment): AccountCommitment.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountCommitment, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountCommitment;
  static deserializeBinaryFromReader(message: AccountCommitment, reader: jspb.BinaryReader): AccountCommitment;
}

export namespace AccountCommitment {
  export type AsObject = {
    commitHash: Uint8Array | string,
    batchVersion: number,
  }
}

export class AccountSubscription extends jspb.Message {
  getTraderKey(): Uint8Array | string;
  getTraderKey_asU8(): Uint8Array;
  getTraderKey_asB64(): string;
  setTraderKey(value: Uint8Array | string): void;

  getCommitNonce(): Uint8Array | string;
  getCommitNonce_asU8(): Uint8Array;
  getCommitNonce_asB64(): string;
  setCommitNonce(value: Uint8Array | string): void;

  getAuthSig(): Uint8Array | string;
  getAuthSig_asU8(): Uint8Array;
  getAuthSig_asB64(): string;
  setAuthSig(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountSubscription.AsObject;
  static toObject(includeInstance: boolean, msg: AccountSubscription): AccountSubscription.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountSubscription, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountSubscription;
  static deserializeBinaryFromReader(message: AccountSubscription, reader: jspb.BinaryReader): AccountSubscription;
}

export namespace AccountSubscription {
  export type AsObject = {
    traderKey: Uint8Array | string,
    commitNonce: Uint8Array | string,
    authSig: Uint8Array | string,
  }
}

export class OrderMatchAccept extends jspb.Message {
  getBatchId(): Uint8Array | string;
  getBatchId_asU8(): Uint8Array;
  getBatchId_asB64(): string;
  setBatchId(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OrderMatchAccept.AsObject;
  static toObject(includeInstance: boolean, msg: OrderMatchAccept): OrderMatchAccept.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OrderMatchAccept, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OrderMatchAccept;
  static deserializeBinaryFromReader(message: OrderMatchAccept, reader: jspb.BinaryReader): OrderMatchAccept;
}

export namespace OrderMatchAccept {
  export type AsObject = {
    batchId: Uint8Array | string,
  }
}

export class OrderMatchReject extends jspb.Message {
  getBatchId(): Uint8Array | string;
  getBatchId_asU8(): Uint8Array;
  getBatchId_asB64(): string;
  setBatchId(value: Uint8Array | string): void;

  getReason(): string;
  setReason(value: string): void;

  getReasonCode(): OrderMatchReject.RejectReasonMap[keyof OrderMatchReject.RejectReasonMap];
  setReasonCode(value: OrderMatchReject.RejectReasonMap[keyof OrderMatchReject.RejectReasonMap]): void;

  getRejectedOrdersMap(): jspb.Map<string, OrderReject>;
  clearRejectedOrdersMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OrderMatchReject.AsObject;
  static toObject(includeInstance: boolean, msg: OrderMatchReject): OrderMatchReject.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OrderMatchReject, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OrderMatchReject;
  static deserializeBinaryFromReader(message: OrderMatchReject, reader: jspb.BinaryReader): OrderMatchReject;
}

export namespace OrderMatchReject {
  export type AsObject = {
    batchId: Uint8Array | string,
    reason: string,
    reasonCode: OrderMatchReject.RejectReasonMap[keyof OrderMatchReject.RejectReasonMap],
    rejectedOrdersMap: Array<[string, OrderReject.AsObject]>,
  }

  export interface RejectReasonMap {
    UNKNOWN: 0;
    SERVER_MISBEHAVIOR: 1;
    BATCH_VERSION_MISMATCH: 2;
    PARTIAL_REJECT: 3;
  }

  export const RejectReason: RejectReasonMap;
}

export class OrderReject extends jspb.Message {
  getReason(): string;
  setReason(value: string): void;

  getReasonCode(): OrderReject.OrderRejectReasonMap[keyof OrderReject.OrderRejectReasonMap];
  setReasonCode(value: OrderReject.OrderRejectReasonMap[keyof OrderReject.OrderRejectReasonMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OrderReject.AsObject;
  static toObject(includeInstance: boolean, msg: OrderReject): OrderReject.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OrderReject, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OrderReject;
  static deserializeBinaryFromReader(message: OrderReject, reader: jspb.BinaryReader): OrderReject;
}

export namespace OrderReject {
  export type AsObject = {
    reason: string,
    reasonCode: OrderReject.OrderRejectReasonMap[keyof OrderReject.OrderRejectReasonMap],
  }

  export interface OrderRejectReasonMap {
    DUPLICATE_PEER: 0;
    CHANNEL_FUNDING_FAILED: 1;
  }

  export const OrderRejectReason: OrderRejectReasonMap;
}

export class ChannelInfo extends jspb.Message {
  getType(): ChannelTypeMap[keyof ChannelTypeMap];
  setType(value: ChannelTypeMap[keyof ChannelTypeMap]): void;

  getLocalNodeKey(): Uint8Array | string;
  getLocalNodeKey_asU8(): Uint8Array;
  getLocalNodeKey_asB64(): string;
  setLocalNodeKey(value: Uint8Array | string): void;

  getRemoteNodeKey(): Uint8Array | string;
  getRemoteNodeKey_asU8(): Uint8Array;
  getRemoteNodeKey_asB64(): string;
  setRemoteNodeKey(value: Uint8Array | string): void;

  getLocalPaymentBasePoint(): Uint8Array | string;
  getLocalPaymentBasePoint_asU8(): Uint8Array;
  getLocalPaymentBasePoint_asB64(): string;
  setLocalPaymentBasePoint(value: Uint8Array | string): void;

  getRemotePaymentBasePoint(): Uint8Array | string;
  getRemotePaymentBasePoint_asU8(): Uint8Array;
  getRemotePaymentBasePoint_asB64(): string;
  setRemotePaymentBasePoint(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChannelInfo.AsObject;
  static toObject(includeInstance: boolean, msg: ChannelInfo): ChannelInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChannelInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChannelInfo;
  static deserializeBinaryFromReader(message: ChannelInfo, reader: jspb.BinaryReader): ChannelInfo;
}

export namespace ChannelInfo {
  export type AsObject = {
    type: ChannelTypeMap[keyof ChannelTypeMap],
    localNodeKey: Uint8Array | string,
    remoteNodeKey: Uint8Array | string,
    localPaymentBasePoint: Uint8Array | string,
    remotePaymentBasePoint: Uint8Array | string,
  }
}

export class OrderMatchSign extends jspb.Message {
  getBatchId(): Uint8Array | string;
  getBatchId_asU8(): Uint8Array;
  getBatchId_asB64(): string;
  setBatchId(value: Uint8Array | string): void;

  getAccountSigsMap(): jspb.Map<string, Uint8Array | string>;
  clearAccountSigsMap(): void;
  getChannelInfosMap(): jspb.Map<string, ChannelInfo>;
  clearChannelInfosMap(): void;
  getTraderNoncesMap(): jspb.Map<string, Uint8Array | string>;
  clearTraderNoncesMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OrderMatchSign.AsObject;
  static toObject(includeInstance: boolean, msg: OrderMatchSign): OrderMatchSign.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OrderMatchSign, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OrderMatchSign;
  static deserializeBinaryFromReader(message: OrderMatchSign, reader: jspb.BinaryReader): OrderMatchSign;
}

export namespace OrderMatchSign {
  export type AsObject = {
    batchId: Uint8Array | string,
    accountSigsMap: Array<[string, Uint8Array | string]>,
    channelInfosMap: Array<[string, ChannelInfo.AsObject]>,
    traderNoncesMap: Array<[string, Uint8Array | string]>,
  }
}

export class AccountRecovery extends jspb.Message {
  getTraderKey(): Uint8Array | string;
  getTraderKey_asU8(): Uint8Array;
  getTraderKey_asB64(): string;
  setTraderKey(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountRecovery.AsObject;
  static toObject(includeInstance: boolean, msg: AccountRecovery): AccountRecovery.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountRecovery, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountRecovery;
  static deserializeBinaryFromReader(message: AccountRecovery, reader: jspb.BinaryReader): AccountRecovery;
}

export namespace AccountRecovery {
  export type AsObject = {
    traderKey: Uint8Array | string,
  }
}

export class ServerAuctionMessage extends jspb.Message {
  hasChallenge(): boolean;
  clearChallenge(): void;
  getChallenge(): ServerChallenge | undefined;
  setChallenge(value?: ServerChallenge): void;

  hasSuccess(): boolean;
  clearSuccess(): void;
  getSuccess(): SubscribeSuccess | undefined;
  setSuccess(value?: SubscribeSuccess): void;

  hasError(): boolean;
  clearError(): void;
  getError(): SubscribeError | undefined;
  setError(value?: SubscribeError): void;

  hasPrepare(): boolean;
  clearPrepare(): void;
  getPrepare(): OrderMatchPrepare | undefined;
  setPrepare(value?: OrderMatchPrepare): void;

  hasSign(): boolean;
  clearSign(): void;
  getSign(): OrderMatchSignBegin | undefined;
  setSign(value?: OrderMatchSignBegin): void;

  hasFinalize(): boolean;
  clearFinalize(): void;
  getFinalize(): OrderMatchFinalize | undefined;
  setFinalize(value?: OrderMatchFinalize): void;

  hasAccount(): boolean;
  clearAccount(): void;
  getAccount(): AuctionAccount | undefined;
  setAccount(value?: AuctionAccount): void;

  getMsgCase(): ServerAuctionMessage.MsgCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerAuctionMessage.AsObject;
  static toObject(includeInstance: boolean, msg: ServerAuctionMessage): ServerAuctionMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerAuctionMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerAuctionMessage;
  static deserializeBinaryFromReader(message: ServerAuctionMessage, reader: jspb.BinaryReader): ServerAuctionMessage;
}

export namespace ServerAuctionMessage {
  export type AsObject = {
    challenge?: ServerChallenge.AsObject,
    success?: SubscribeSuccess.AsObject,
    error?: SubscribeError.AsObject,
    prepare?: OrderMatchPrepare.AsObject,
    sign?: OrderMatchSignBegin.AsObject,
    finalize?: OrderMatchFinalize.AsObject,
    account?: AuctionAccount.AsObject,
  }

  export enum MsgCase {
    MSG_NOT_SET = 0,
    CHALLENGE = 1,
    SUCCESS = 2,
    ERROR = 3,
    PREPARE = 4,
    SIGN = 5,
    FINALIZE = 6,
    ACCOUNT = 7,
  }
}

export class ServerChallenge extends jspb.Message {
  getChallenge(): Uint8Array | string;
  getChallenge_asU8(): Uint8Array;
  getChallenge_asB64(): string;
  setChallenge(value: Uint8Array | string): void;

  getCommitHash(): Uint8Array | string;
  getCommitHash_asU8(): Uint8Array;
  getCommitHash_asB64(): string;
  setCommitHash(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerChallenge.AsObject;
  static toObject(includeInstance: boolean, msg: ServerChallenge): ServerChallenge.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerChallenge, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerChallenge;
  static deserializeBinaryFromReader(message: ServerChallenge, reader: jspb.BinaryReader): ServerChallenge;
}

export namespace ServerChallenge {
  export type AsObject = {
    challenge: Uint8Array | string,
    commitHash: Uint8Array | string,
  }
}

export class SubscribeSuccess extends jspb.Message {
  getTraderKey(): Uint8Array | string;
  getTraderKey_asU8(): Uint8Array;
  getTraderKey_asB64(): string;
  setTraderKey(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscribeSuccess.AsObject;
  static toObject(includeInstance: boolean, msg: SubscribeSuccess): SubscribeSuccess.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SubscribeSuccess, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscribeSuccess;
  static deserializeBinaryFromReader(message: SubscribeSuccess, reader: jspb.BinaryReader): SubscribeSuccess;
}

export namespace SubscribeSuccess {
  export type AsObject = {
    traderKey: Uint8Array | string,
  }
}

export class MatchedMarket extends jspb.Message {
  getMatchedOrdersMap(): jspb.Map<string, MatchedOrder>;
  clearMatchedOrdersMap(): void;
  getClearingPriceRate(): number;
  setClearingPriceRate(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MatchedMarket.AsObject;
  static toObject(includeInstance: boolean, msg: MatchedMarket): MatchedMarket.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MatchedMarket, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MatchedMarket;
  static deserializeBinaryFromReader(message: MatchedMarket, reader: jspb.BinaryReader): MatchedMarket;
}

export namespace MatchedMarket {
  export type AsObject = {
    matchedOrdersMap: Array<[string, MatchedOrder.AsObject]>,
    clearingPriceRate: number,
  }
}

export class OrderMatchPrepare extends jspb.Message {
  getMatchedOrdersMap(): jspb.Map<string, MatchedOrder>;
  clearMatchedOrdersMap(): void;
  getClearingPriceRate(): number;
  setClearingPriceRate(value: number): void;

  clearChargedAccountsList(): void;
  getChargedAccountsList(): Array<AccountDiff>;
  setChargedAccountsList(value: Array<AccountDiff>): void;
  addChargedAccounts(value?: AccountDiff, index?: number): AccountDiff;

  hasExecutionFee(): boolean;
  clearExecutionFee(): void;
  getExecutionFee(): ExecutionFee | undefined;
  setExecutionFee(value?: ExecutionFee): void;

  getBatchTransaction(): Uint8Array | string;
  getBatchTransaction_asU8(): Uint8Array;
  getBatchTransaction_asB64(): string;
  setBatchTransaction(value: Uint8Array | string): void;

  getFeeRateSatPerKw(): string;
  setFeeRateSatPerKw(value: string): void;

  getFeeRebateSat(): string;
  setFeeRebateSat(value: string): void;

  getBatchId(): Uint8Array | string;
  getBatchId_asU8(): Uint8Array;
  getBatchId_asB64(): string;
  setBatchId(value: Uint8Array | string): void;

  getBatchVersion(): number;
  setBatchVersion(value: number): void;

  getMatchedMarketsMap(): jspb.Map<number, MatchedMarket>;
  clearMatchedMarketsMap(): void;
  getBatchHeightHint(): number;
  setBatchHeightHint(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OrderMatchPrepare.AsObject;
  static toObject(includeInstance: boolean, msg: OrderMatchPrepare): OrderMatchPrepare.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OrderMatchPrepare, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OrderMatchPrepare;
  static deserializeBinaryFromReader(message: OrderMatchPrepare, reader: jspb.BinaryReader): OrderMatchPrepare;
}

export namespace OrderMatchPrepare {
  export type AsObject = {
    matchedOrdersMap: Array<[string, MatchedOrder.AsObject]>,
    clearingPriceRate: number,
    chargedAccountsList: Array<AccountDiff.AsObject>,
    executionFee?: ExecutionFee.AsObject,
    batchTransaction: Uint8Array | string,
    feeRateSatPerKw: string,
    feeRebateSat: string,
    batchId: Uint8Array | string,
    batchVersion: number,
    matchedMarketsMap: Array<[number, MatchedMarket.AsObject]>,
    batchHeightHint: number,
  }
}

export class TxOut extends jspb.Message {
  getValue(): string;
  setValue(value: string): void;

  getPkScript(): Uint8Array | string;
  getPkScript_asU8(): Uint8Array;
  getPkScript_asB64(): string;
  setPkScript(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TxOut.AsObject;
  static toObject(includeInstance: boolean, msg: TxOut): TxOut.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TxOut, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TxOut;
  static deserializeBinaryFromReader(message: TxOut, reader: jspb.BinaryReader): TxOut;
}

export namespace TxOut {
  export type AsObject = {
    value: string,
    pkScript: Uint8Array | string,
  }
}

export class OrderMatchSignBegin extends jspb.Message {
  getBatchId(): Uint8Array | string;
  getBatchId_asU8(): Uint8Array;
  getBatchId_asB64(): string;
  setBatchId(value: Uint8Array | string): void;

  getServerNoncesMap(): jspb.Map<string, Uint8Array | string>;
  clearServerNoncesMap(): void;
  clearPrevOutputsList(): void;
  getPrevOutputsList(): Array<TxOut>;
  setPrevOutputsList(value: Array<TxOut>): void;
  addPrevOutputs(value?: TxOut, index?: number): TxOut;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OrderMatchSignBegin.AsObject;
  static toObject(includeInstance: boolean, msg: OrderMatchSignBegin): OrderMatchSignBegin.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OrderMatchSignBegin, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OrderMatchSignBegin;
  static deserializeBinaryFromReader(message: OrderMatchSignBegin, reader: jspb.BinaryReader): OrderMatchSignBegin;
}

export namespace OrderMatchSignBegin {
  export type AsObject = {
    batchId: Uint8Array | string,
    serverNoncesMap: Array<[string, Uint8Array | string]>,
    prevOutputsList: Array<TxOut.AsObject>,
  }
}

export class OrderMatchFinalize extends jspb.Message {
  getBatchId(): Uint8Array | string;
  getBatchId_asU8(): Uint8Array;
  getBatchId_asB64(): string;
  setBatchId(value: Uint8Array | string): void;

  getBatchTxid(): Uint8Array | string;
  getBatchTxid_asU8(): Uint8Array;
  getBatchTxid_asB64(): string;
  setBatchTxid(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OrderMatchFinalize.AsObject;
  static toObject(includeInstance: boolean, msg: OrderMatchFinalize): OrderMatchFinalize.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OrderMatchFinalize, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OrderMatchFinalize;
  static deserializeBinaryFromReader(message: OrderMatchFinalize, reader: jspb.BinaryReader): OrderMatchFinalize;
}

export namespace OrderMatchFinalize {
  export type AsObject = {
    batchId: Uint8Array | string,
    batchTxid: Uint8Array | string,
  }
}

export class SubscribeError extends jspb.Message {
  getError(): string;
  setError(value: string): void;

  getErrorCode(): SubscribeError.ErrorMap[keyof SubscribeError.ErrorMap];
  setErrorCode(value: SubscribeError.ErrorMap[keyof SubscribeError.ErrorMap]): void;

  getTraderKey(): Uint8Array | string;
  getTraderKey_asU8(): Uint8Array;
  getTraderKey_asB64(): string;
  setTraderKey(value: Uint8Array | string): void;

  hasAccountReservation(): boolean;
  clearAccountReservation(): void;
  getAccountReservation(): AuctionAccount | undefined;
  setAccountReservation(value?: AuctionAccount): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscribeError.AsObject;
  static toObject(includeInstance: boolean, msg: SubscribeError): SubscribeError.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SubscribeError, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscribeError;
  static deserializeBinaryFromReader(message: SubscribeError, reader: jspb.BinaryReader): SubscribeError;
}

export namespace SubscribeError {
  export type AsObject = {
    error: string,
    errorCode: SubscribeError.ErrorMap[keyof SubscribeError.ErrorMap],
    traderKey: Uint8Array | string,
    accountReservation?: AuctionAccount.AsObject,
  }

  export interface ErrorMap {
    UNKNOWN: 0;
    SERVER_SHUTDOWN: 1;
    ACCOUNT_DOES_NOT_EXIST: 2;
    INCOMPLETE_ACCOUNT_RESERVATION: 3;
  }

  export const Error: ErrorMap;
}

export class AuctionAccount extends jspb.Message {
  getValue(): string;
  setValue(value: string): void;

  getExpiry(): number;
  setExpiry(value: number): void;

  getTraderKey(): Uint8Array | string;
  getTraderKey_asU8(): Uint8Array;
  getTraderKey_asB64(): string;
  setTraderKey(value: Uint8Array | string): void;

  getAuctioneerKey(): Uint8Array | string;
  getAuctioneerKey_asU8(): Uint8Array;
  getAuctioneerKey_asB64(): string;
  setAuctioneerKey(value: Uint8Array | string): void;

  getBatchKey(): Uint8Array | string;
  getBatchKey_asU8(): Uint8Array;
  getBatchKey_asB64(): string;
  setBatchKey(value: Uint8Array | string): void;

  getState(): AuctionAccountStateMap[keyof AuctionAccountStateMap];
  setState(value: AuctionAccountStateMap[keyof AuctionAccountStateMap]): void;

  getHeightHint(): number;
  setHeightHint(value: number): void;

  hasOutpoint(): boolean;
  clearOutpoint(): void;
  getOutpoint(): OutPoint | undefined;
  setOutpoint(value?: OutPoint): void;

  getLatestTx(): Uint8Array | string;
  getLatestTx_asU8(): Uint8Array;
  getLatestTx_asB64(): string;
  setLatestTx(value: Uint8Array | string): void;

  getVersion(): number;
  setVersion(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AuctionAccount.AsObject;
  static toObject(includeInstance: boolean, msg: AuctionAccount): AuctionAccount.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AuctionAccount, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AuctionAccount;
  static deserializeBinaryFromReader(message: AuctionAccount, reader: jspb.BinaryReader): AuctionAccount;
}

export namespace AuctionAccount {
  export type AsObject = {
    value: string,
    expiry: number,
    traderKey: Uint8Array | string,
    auctioneerKey: Uint8Array | string,
    batchKey: Uint8Array | string,
    state: AuctionAccountStateMap[keyof AuctionAccountStateMap],
    heightHint: number,
    outpoint?: OutPoint.AsObject,
    latestTx: Uint8Array | string,
    version: number,
  }
}

export class MatchedOrder extends jspb.Message {
  clearMatchedBidsList(): void;
  getMatchedBidsList(): Array<MatchedBid>;
  setMatchedBidsList(value: Array<MatchedBid>): void;
  addMatchedBids(value?: MatchedBid, index?: number): MatchedBid;

  clearMatchedAsksList(): void;
  getMatchedAsksList(): Array<MatchedAsk>;
  setMatchedAsksList(value: Array<MatchedAsk>): void;
  addMatchedAsks(value?: MatchedAsk, index?: number): MatchedAsk;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MatchedOrder.AsObject;
  static toObject(includeInstance: boolean, msg: MatchedOrder): MatchedOrder.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MatchedOrder, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MatchedOrder;
  static deserializeBinaryFromReader(message: MatchedOrder, reader: jspb.BinaryReader): MatchedOrder;
}

export namespace MatchedOrder {
  export type AsObject = {
    matchedBidsList: Array<MatchedBid.AsObject>,
    matchedAsksList: Array<MatchedAsk.AsObject>,
  }
}

export class MatchedAsk extends jspb.Message {
  hasAsk(): boolean;
  clearAsk(): void;
  getAsk(): ServerAsk | undefined;
  setAsk(value?: ServerAsk): void;

  getUnitsFilled(): number;
  setUnitsFilled(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MatchedAsk.AsObject;
  static toObject(includeInstance: boolean, msg: MatchedAsk): MatchedAsk.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MatchedAsk, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MatchedAsk;
  static deserializeBinaryFromReader(message: MatchedAsk, reader: jspb.BinaryReader): MatchedAsk;
}

export namespace MatchedAsk {
  export type AsObject = {
    ask?: ServerAsk.AsObject,
    unitsFilled: number,
  }
}

export class MatchedBid extends jspb.Message {
  hasBid(): boolean;
  clearBid(): void;
  getBid(): ServerBid | undefined;
  setBid(value?: ServerBid): void;

  getUnitsFilled(): number;
  setUnitsFilled(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MatchedBid.AsObject;
  static toObject(includeInstance: boolean, msg: MatchedBid): MatchedBid.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MatchedBid, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MatchedBid;
  static deserializeBinaryFromReader(message: MatchedBid, reader: jspb.BinaryReader): MatchedBid;
}

export namespace MatchedBid {
  export type AsObject = {
    bid?: ServerBid.AsObject,
    unitsFilled: number,
  }
}

export class AccountDiff extends jspb.Message {
  getEndingBalance(): string;
  setEndingBalance(value: string): void;

  getEndingState(): AccountDiff.AccountStateMap[keyof AccountDiff.AccountStateMap];
  setEndingState(value: AccountDiff.AccountStateMap[keyof AccountDiff.AccountStateMap]): void;

  getOutpointIndex(): number;
  setOutpointIndex(value: number): void;

  getTraderKey(): Uint8Array | string;
  getTraderKey_asU8(): Uint8Array;
  getTraderKey_asB64(): string;
  setTraderKey(value: Uint8Array | string): void;

  getNewExpiry(): number;
  setNewExpiry(value: number): void;

  getNewVersion(): number;
  setNewVersion(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountDiff.AsObject;
  static toObject(includeInstance: boolean, msg: AccountDiff): AccountDiff.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountDiff, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountDiff;
  static deserializeBinaryFromReader(message: AccountDiff, reader: jspb.BinaryReader): AccountDiff;
}

export namespace AccountDiff {
  export type AsObject = {
    endingBalance: string,
    endingState: AccountDiff.AccountStateMap[keyof AccountDiff.AccountStateMap],
    outpointIndex: number,
    traderKey: Uint8Array | string,
    newExpiry: number,
    newVersion: number,
  }

  export interface AccountStateMap {
    OUTPUT_RECREATED: 0;
    OUTPUT_DUST_EXTENDED_OFFCHAIN: 1;
    OUTPUT_DUST_ADDED_TO_FEES: 2;
    OUTPUT_FULLY_SPENT: 3;
  }

  export const AccountState: AccountStateMap;
}

export class ServerOrder extends jspb.Message {
  getTraderKey(): Uint8Array | string;
  getTraderKey_asU8(): Uint8Array;
  getTraderKey_asB64(): string;
  setTraderKey(value: Uint8Array | string): void;

  getRateFixed(): number;
  setRateFixed(value: number): void;

  getAmt(): string;
  setAmt(value: string): void;

  getMinChanAmt(): string;
  setMinChanAmt(value: string): void;

  getOrderNonce(): Uint8Array | string;
  getOrderNonce_asU8(): Uint8Array;
  getOrderNonce_asB64(): string;
  setOrderNonce(value: Uint8Array | string): void;

  getOrderSig(): Uint8Array | string;
  getOrderSig_asU8(): Uint8Array;
  getOrderSig_asB64(): string;
  setOrderSig(value: Uint8Array | string): void;

  getMultiSigKey(): Uint8Array | string;
  getMultiSigKey_asU8(): Uint8Array;
  getMultiSigKey_asB64(): string;
  setMultiSigKey(value: Uint8Array | string): void;

  getNodePub(): Uint8Array | string;
  getNodePub_asU8(): Uint8Array;
  getNodePub_asB64(): string;
  setNodePub(value: Uint8Array | string): void;

  clearNodeAddrList(): void;
  getNodeAddrList(): Array<NodeAddress>;
  setNodeAddrList(value: Array<NodeAddress>): void;
  addNodeAddr(value?: NodeAddress, index?: number): NodeAddress;

  getChannelType(): OrderChannelTypeMap[keyof OrderChannelTypeMap];
  setChannelType(value: OrderChannelTypeMap[keyof OrderChannelTypeMap]): void;

  getMaxBatchFeeRateSatPerKw(): string;
  setMaxBatchFeeRateSatPerKw(value: string): void;

  clearAllowedNodeIdsList(): void;
  getAllowedNodeIdsList(): Array<Uint8Array | string>;
  getAllowedNodeIdsList_asU8(): Array<Uint8Array>;
  getAllowedNodeIdsList_asB64(): Array<string>;
  setAllowedNodeIdsList(value: Array<Uint8Array | string>): void;
  addAllowedNodeIds(value: Uint8Array | string, index?: number): Uint8Array | string;

  clearNotAllowedNodeIdsList(): void;
  getNotAllowedNodeIdsList(): Array<Uint8Array | string>;
  getNotAllowedNodeIdsList_asU8(): Array<Uint8Array>;
  getNotAllowedNodeIdsList_asB64(): Array<string>;
  setNotAllowedNodeIdsList(value: Array<Uint8Array | string>): void;
  addNotAllowedNodeIds(value: Uint8Array | string, index?: number): Uint8Array | string;

  getAuctionType(): AuctionTypeMap[keyof AuctionTypeMap];
  setAuctionType(value: AuctionTypeMap[keyof AuctionTypeMap]): void;

  getIsPublic(): boolean;
  setIsPublic(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerOrder.AsObject;
  static toObject(includeInstance: boolean, msg: ServerOrder): ServerOrder.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerOrder, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerOrder;
  static deserializeBinaryFromReader(message: ServerOrder, reader: jspb.BinaryReader): ServerOrder;
}

export namespace ServerOrder {
  export type AsObject = {
    traderKey: Uint8Array | string,
    rateFixed: number,
    amt: string,
    minChanAmt: string,
    orderNonce: Uint8Array | string,
    orderSig: Uint8Array | string,
    multiSigKey: Uint8Array | string,
    nodePub: Uint8Array | string,
    nodeAddrList: Array<NodeAddress.AsObject>,
    channelType: OrderChannelTypeMap[keyof OrderChannelTypeMap],
    maxBatchFeeRateSatPerKw: string,
    allowedNodeIdsList: Array<Uint8Array | string>,
    notAllowedNodeIdsList: Array<Uint8Array | string>,
    auctionType: AuctionTypeMap[keyof AuctionTypeMap],
    isPublic: boolean,
  }
}

export class ServerBid extends jspb.Message {
  hasDetails(): boolean;
  clearDetails(): void;
  getDetails(): ServerOrder | undefined;
  setDetails(value?: ServerOrder): void;

  getLeaseDurationBlocks(): number;
  setLeaseDurationBlocks(value: number): void;

  getVersion(): number;
  setVersion(value: number): void;

  getMinNodeTier(): NodeTierMap[keyof NodeTierMap];
  setMinNodeTier(value: NodeTierMap[keyof NodeTierMap]): void;

  getSelfChanBalance(): string;
  setSelfChanBalance(value: string): void;

  getIsSidecarChannel(): boolean;
  setIsSidecarChannel(value: boolean): void;

  getUnannouncedChannel(): boolean;
  setUnannouncedChannel(value: boolean): void;

  getZeroConfChannel(): boolean;
  setZeroConfChannel(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerBid.AsObject;
  static toObject(includeInstance: boolean, msg: ServerBid): ServerBid.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerBid, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerBid;
  static deserializeBinaryFromReader(message: ServerBid, reader: jspb.BinaryReader): ServerBid;
}

export namespace ServerBid {
  export type AsObject = {
    details?: ServerOrder.AsObject,
    leaseDurationBlocks: number,
    version: number,
    minNodeTier: NodeTierMap[keyof NodeTierMap],
    selfChanBalance: string,
    isSidecarChannel: boolean,
    unannouncedChannel: boolean,
    zeroConfChannel: boolean,
  }
}

export class ServerAsk extends jspb.Message {
  hasDetails(): boolean;
  clearDetails(): void;
  getDetails(): ServerOrder | undefined;
  setDetails(value?: ServerOrder): void;

  getLeaseDurationBlocks(): number;
  setLeaseDurationBlocks(value: number): void;

  getVersion(): number;
  setVersion(value: number): void;

  getAnnouncementConstraints(): ChannelAnnouncementConstraintsMap[keyof ChannelAnnouncementConstraintsMap];
  setAnnouncementConstraints(value: ChannelAnnouncementConstraintsMap[keyof ChannelAnnouncementConstraintsMap]): void;

  getConfirmationConstraints(): ChannelConfirmationConstraintsMap[keyof ChannelConfirmationConstraintsMap];
  setConfirmationConstraints(value: ChannelConfirmationConstraintsMap[keyof ChannelConfirmationConstraintsMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerAsk.AsObject;
  static toObject(includeInstance: boolean, msg: ServerAsk): ServerAsk.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerAsk, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerAsk;
  static deserializeBinaryFromReader(message: ServerAsk, reader: jspb.BinaryReader): ServerAsk;
}

export namespace ServerAsk {
  export type AsObject = {
    details?: ServerOrder.AsObject,
    leaseDurationBlocks: number,
    version: number,
    announcementConstraints: ChannelAnnouncementConstraintsMap[keyof ChannelAnnouncementConstraintsMap],
    confirmationConstraints: ChannelConfirmationConstraintsMap[keyof ChannelConfirmationConstraintsMap],
  }
}

export class CancelOrder extends jspb.Message {
  getOrderNonce(): Uint8Array | string;
  getOrderNonce_asU8(): Uint8Array;
  getOrderNonce_asB64(): string;
  setOrderNonce(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CancelOrder.AsObject;
  static toObject(includeInstance: boolean, msg: CancelOrder): CancelOrder.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CancelOrder, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CancelOrder;
  static deserializeBinaryFromReader(message: CancelOrder, reader: jspb.BinaryReader): CancelOrder;
}

export namespace CancelOrder {
  export type AsObject = {
    orderNonce: Uint8Array | string,
  }
}

export class InvalidOrder extends jspb.Message {
  getOrderNonce(): Uint8Array | string;
  getOrderNonce_asU8(): Uint8Array;
  getOrderNonce_asB64(): string;
  setOrderNonce(value: Uint8Array | string): void;

  getFailReason(): InvalidOrder.FailReasonMap[keyof InvalidOrder.FailReasonMap];
  setFailReason(value: InvalidOrder.FailReasonMap[keyof InvalidOrder.FailReasonMap]): void;

  getFailString(): string;
  setFailString(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InvalidOrder.AsObject;
  static toObject(includeInstance: boolean, msg: InvalidOrder): InvalidOrder.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InvalidOrder, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InvalidOrder;
  static deserializeBinaryFromReader(message: InvalidOrder, reader: jspb.BinaryReader): InvalidOrder;
}

export namespace InvalidOrder {
  export type AsObject = {
    orderNonce: Uint8Array | string,
    failReason: InvalidOrder.FailReasonMap[keyof InvalidOrder.FailReasonMap],
    failString: string,
  }

  export interface FailReasonMap {
    INVALID_AMT: 0;
  }

  export const FailReason: FailReasonMap;
}

export class ServerInput extends jspb.Message {
  hasOutpoint(): boolean;
  clearOutpoint(): void;
  getOutpoint(): OutPoint | undefined;
  setOutpoint(value?: OutPoint): void;

  getSigScript(): Uint8Array | string;
  getSigScript_asU8(): Uint8Array;
  getSigScript_asB64(): string;
  setSigScript(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerInput.AsObject;
  static toObject(includeInstance: boolean, msg: ServerInput): ServerInput.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerInput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerInput;
  static deserializeBinaryFromReader(message: ServerInput, reader: jspb.BinaryReader): ServerInput;
}

export namespace ServerInput {
  export type AsObject = {
    outpoint?: OutPoint.AsObject,
    sigScript: Uint8Array | string,
  }
}

export class ServerOutput extends jspb.Message {
  getValue(): string;
  setValue(value: string): void;

  getScript(): Uint8Array | string;
  getScript_asU8(): Uint8Array;
  getScript_asB64(): string;
  setScript(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerOutput.AsObject;
  static toObject(includeInstance: boolean, msg: ServerOutput): ServerOutput.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerOutput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerOutput;
  static deserializeBinaryFromReader(message: ServerOutput, reader: jspb.BinaryReader): ServerOutput;
}

export namespace ServerOutput {
  export type AsObject = {
    value: string,
    script: Uint8Array | string,
  }
}

export class ServerModifyAccountRequest extends jspb.Message {
  getTraderKey(): Uint8Array | string;
  getTraderKey_asU8(): Uint8Array;
  getTraderKey_asB64(): string;
  setTraderKey(value: Uint8Array | string): void;

  clearNewInputsList(): void;
  getNewInputsList(): Array<ServerInput>;
  setNewInputsList(value: Array<ServerInput>): void;
  addNewInputs(value?: ServerInput, index?: number): ServerInput;

  clearNewOutputsList(): void;
  getNewOutputsList(): Array<ServerOutput>;
  setNewOutputsList(value: Array<ServerOutput>): void;
  addNewOutputs(value?: ServerOutput, index?: number): ServerOutput;

  hasNewParams(): boolean;
  clearNewParams(): void;
  getNewParams(): ServerModifyAccountRequest.NewAccountParameters | undefined;
  setNewParams(value?: ServerModifyAccountRequest.NewAccountParameters): void;

  getTraderNonces(): Uint8Array | string;
  getTraderNonces_asU8(): Uint8Array;
  getTraderNonces_asB64(): string;
  setTraderNonces(value: Uint8Array | string): void;

  clearPrevOutputsList(): void;
  getPrevOutputsList(): Array<TxOut>;
  setPrevOutputsList(value: Array<TxOut>): void;
  addPrevOutputs(value?: TxOut, index?: number): TxOut;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerModifyAccountRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ServerModifyAccountRequest): ServerModifyAccountRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerModifyAccountRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerModifyAccountRequest;
  static deserializeBinaryFromReader(message: ServerModifyAccountRequest, reader: jspb.BinaryReader): ServerModifyAccountRequest;
}

export namespace ServerModifyAccountRequest {
  export type AsObject = {
    traderKey: Uint8Array | string,
    newInputsList: Array<ServerInput.AsObject>,
    newOutputsList: Array<ServerOutput.AsObject>,
    newParams?: ServerModifyAccountRequest.NewAccountParameters.AsObject,
    traderNonces: Uint8Array | string,
    prevOutputsList: Array<TxOut.AsObject>,
  }

  export class NewAccountParameters extends jspb.Message {
    getValue(): string;
    setValue(value: string): void;

    getExpiry(): number;
    setExpiry(value: number): void;

    getVersion(): number;
    setVersion(value: number): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): NewAccountParameters.AsObject;
    static toObject(includeInstance: boolean, msg: NewAccountParameters): NewAccountParameters.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: NewAccountParameters, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): NewAccountParameters;
    static deserializeBinaryFromReader(message: NewAccountParameters, reader: jspb.BinaryReader): NewAccountParameters;
  }

  export namespace NewAccountParameters {
    export type AsObject = {
      value: string,
      expiry: number,
      version: number,
    }
  }
}

export class ServerModifyAccountResponse extends jspb.Message {
  getAccountSig(): Uint8Array | string;
  getAccountSig_asU8(): Uint8Array;
  getAccountSig_asB64(): string;
  setAccountSig(value: Uint8Array | string): void;

  getServerNonces(): Uint8Array | string;
  getServerNonces_asU8(): Uint8Array;
  getServerNonces_asB64(): string;
  setServerNonces(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerModifyAccountResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ServerModifyAccountResponse): ServerModifyAccountResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerModifyAccountResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerModifyAccountResponse;
  static deserializeBinaryFromReader(message: ServerModifyAccountResponse, reader: jspb.BinaryReader): ServerModifyAccountResponse;
}

export namespace ServerModifyAccountResponse {
  export type AsObject = {
    accountSig: Uint8Array | string,
    serverNonces: Uint8Array | string,
  }
}

export class ServerOrderStateRequest extends jspb.Message {
  getOrderNonce(): Uint8Array | string;
  getOrderNonce_asU8(): Uint8Array;
  getOrderNonce_asB64(): string;
  setOrderNonce(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerOrderStateRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ServerOrderStateRequest): ServerOrderStateRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerOrderStateRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerOrderStateRequest;
  static deserializeBinaryFromReader(message: ServerOrderStateRequest, reader: jspb.BinaryReader): ServerOrderStateRequest;
}

export namespace ServerOrderStateRequest {
  export type AsObject = {
    orderNonce: Uint8Array | string,
  }
}

export class ServerOrderStateResponse extends jspb.Message {
  getState(): OrderStateMap[keyof OrderStateMap];
  setState(value: OrderStateMap[keyof OrderStateMap]): void;

  getUnitsUnfulfilled(): number;
  setUnitsUnfulfilled(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerOrderStateResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ServerOrderStateResponse): ServerOrderStateResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerOrderStateResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerOrderStateResponse;
  static deserializeBinaryFromReader(message: ServerOrderStateResponse, reader: jspb.BinaryReader): ServerOrderStateResponse;
}

export namespace ServerOrderStateResponse {
  export type AsObject = {
    state: OrderStateMap[keyof OrderStateMap],
    unitsUnfulfilled: number,
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
  getMaxAccountValue(): string;
  setMaxAccountValue(value: string): void;

  getMaxOrderDurationBlocks(): number;
  setMaxOrderDurationBlocks(value: number): void;

  hasExecutionFee(): boolean;
  clearExecutionFee(): void;
  getExecutionFee(): ExecutionFee | undefined;
  setExecutionFee(value?: ExecutionFee): void;

  getLeaseDurationsMap(): jspb.Map<number, boolean>;
  clearLeaseDurationsMap(): void;
  getNextBatchConfTarget(): number;
  setNextBatchConfTarget(value: number): void;

  getNextBatchFeeRateSatPerKw(): string;
  setNextBatchFeeRateSatPerKw(value: string): void;

  getNextBatchClearTimestamp(): string;
  setNextBatchClearTimestamp(value: string): void;

  getLeaseDurationBucketsMap(): jspb.Map<number, DurationBucketStateMap[keyof DurationBucketStateMap]>;
  clearLeaseDurationBucketsMap(): void;
  getAutoRenewExtensionBlocks(): number;
  setAutoRenewExtensionBlocks(value: number): void;

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
    maxAccountValue: string,
    maxOrderDurationBlocks: number,
    executionFee?: ExecutionFee.AsObject,
    leaseDurationsMap: Array<[number, boolean]>,
    nextBatchConfTarget: number,
    nextBatchFeeRateSatPerKw: string,
    nextBatchClearTimestamp: string,
    leaseDurationBucketsMap: Array<[number, DurationBucketStateMap[keyof DurationBucketStateMap]]>,
    autoRenewExtensionBlocks: number,
  }
}

export class RelevantBatchRequest extends jspb.Message {
  getId(): Uint8Array | string;
  getId_asU8(): Uint8Array;
  getId_asB64(): string;
  setId(value: Uint8Array | string): void;

  clearAccountsList(): void;
  getAccountsList(): Array<Uint8Array | string>;
  getAccountsList_asU8(): Array<Uint8Array>;
  getAccountsList_asB64(): Array<string>;
  setAccountsList(value: Array<Uint8Array | string>): void;
  addAccounts(value: Uint8Array | string, index?: number): Uint8Array | string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RelevantBatchRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RelevantBatchRequest): RelevantBatchRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RelevantBatchRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RelevantBatchRequest;
  static deserializeBinaryFromReader(message: RelevantBatchRequest, reader: jspb.BinaryReader): RelevantBatchRequest;
}

export namespace RelevantBatchRequest {
  export type AsObject = {
    id: Uint8Array | string,
    accountsList: Array<Uint8Array | string>,
  }
}

export class RelevantBatch extends jspb.Message {
  getVersion(): number;
  setVersion(value: number): void;

  getId(): Uint8Array | string;
  getId_asU8(): Uint8Array;
  getId_asB64(): string;
  setId(value: Uint8Array | string): void;

  clearChargedAccountsList(): void;
  getChargedAccountsList(): Array<AccountDiff>;
  setChargedAccountsList(value: Array<AccountDiff>): void;
  addChargedAccounts(value?: AccountDiff, index?: number): AccountDiff;

  getMatchedOrdersMap(): jspb.Map<string, MatchedOrder>;
  clearMatchedOrdersMap(): void;
  getClearingPriceRate(): number;
  setClearingPriceRate(value: number): void;

  hasExecutionFee(): boolean;
  clearExecutionFee(): void;
  getExecutionFee(): ExecutionFee | undefined;
  setExecutionFee(value?: ExecutionFee): void;

  getTransaction(): Uint8Array | string;
  getTransaction_asU8(): Uint8Array;
  getTransaction_asB64(): string;
  setTransaction(value: Uint8Array | string): void;

  getFeeRateSatPerKw(): string;
  setFeeRateSatPerKw(value: string): void;

  getCreationTimestampNs(): string;
  setCreationTimestampNs(value: string): void;

  getMatchedMarketsMap(): jspb.Map<number, MatchedMarket>;
  clearMatchedMarketsMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RelevantBatch.AsObject;
  static toObject(includeInstance: boolean, msg: RelevantBatch): RelevantBatch.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RelevantBatch, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RelevantBatch;
  static deserializeBinaryFromReader(message: RelevantBatch, reader: jspb.BinaryReader): RelevantBatch;
}

export namespace RelevantBatch {
  export type AsObject = {
    version: number,
    id: Uint8Array | string,
    chargedAccountsList: Array<AccountDiff.AsObject>,
    matchedOrdersMap: Array<[string, MatchedOrder.AsObject]>,
    clearingPriceRate: number,
    executionFee?: ExecutionFee.AsObject,
    transaction: Uint8Array | string,
    feeRateSatPerKw: string,
    creationTimestampNs: string,
    matchedMarketsMap: Array<[number, MatchedMarket.AsObject]>,
  }
}

export class ExecutionFee extends jspb.Message {
  getBaseFee(): string;
  setBaseFee(value: string): void;

  getFeeRate(): string;
  setFeeRate(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExecutionFee.AsObject;
  static toObject(includeInstance: boolean, msg: ExecutionFee): ExecutionFee.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExecutionFee, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExecutionFee;
  static deserializeBinaryFromReader(message: ExecutionFee, reader: jspb.BinaryReader): ExecutionFee;
}

export namespace ExecutionFee {
  export type AsObject = {
    baseFee: string,
    feeRate: string,
  }
}

export class NodeAddress extends jspb.Message {
  getNetwork(): string;
  setNetwork(value: string): void;

  getAddr(): string;
  setAddr(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NodeAddress.AsObject;
  static toObject(includeInstance: boolean, msg: NodeAddress): NodeAddress.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NodeAddress, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NodeAddress;
  static deserializeBinaryFromReader(message: NodeAddress, reader: jspb.BinaryReader): NodeAddress;
}

export namespace NodeAddress {
  export type AsObject = {
    network: string,
    addr: string,
  }
}

export class OutPoint extends jspb.Message {
  getTxid(): Uint8Array | string;
  getTxid_asU8(): Uint8Array;
  getTxid_asB64(): string;
  setTxid(value: Uint8Array | string): void;

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
    txid: Uint8Array | string,
    outputIndex: number,
  }
}

export class AskSnapshot extends jspb.Message {
  getVersion(): number;
  setVersion(value: number): void;

  getLeaseDurationBlocks(): number;
  setLeaseDurationBlocks(value: number): void;

  getRateFixed(): number;
  setRateFixed(value: number): void;

  getChanType(): OrderChannelTypeMap[keyof OrderChannelTypeMap];
  setChanType(value: OrderChannelTypeMap[keyof OrderChannelTypeMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AskSnapshot.AsObject;
  static toObject(includeInstance: boolean, msg: AskSnapshot): AskSnapshot.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AskSnapshot, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AskSnapshot;
  static deserializeBinaryFromReader(message: AskSnapshot, reader: jspb.BinaryReader): AskSnapshot;
}

export namespace AskSnapshot {
  export type AsObject = {
    version: number,
    leaseDurationBlocks: number,
    rateFixed: number,
    chanType: OrderChannelTypeMap[keyof OrderChannelTypeMap],
  }
}

export class BidSnapshot extends jspb.Message {
  getVersion(): number;
  setVersion(value: number): void;

  getLeaseDurationBlocks(): number;
  setLeaseDurationBlocks(value: number): void;

  getRateFixed(): number;
  setRateFixed(value: number): void;

  getChanType(): OrderChannelTypeMap[keyof OrderChannelTypeMap];
  setChanType(value: OrderChannelTypeMap[keyof OrderChannelTypeMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BidSnapshot.AsObject;
  static toObject(includeInstance: boolean, msg: BidSnapshot): BidSnapshot.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BidSnapshot, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BidSnapshot;
  static deserializeBinaryFromReader(message: BidSnapshot, reader: jspb.BinaryReader): BidSnapshot;
}

export namespace BidSnapshot {
  export type AsObject = {
    version: number,
    leaseDurationBlocks: number,
    rateFixed: number,
    chanType: OrderChannelTypeMap[keyof OrderChannelTypeMap],
  }
}

export class MatchedOrderSnapshot extends jspb.Message {
  hasAsk(): boolean;
  clearAsk(): void;
  getAsk(): AskSnapshot | undefined;
  setAsk(value?: AskSnapshot): void;

  hasBid(): boolean;
  clearBid(): void;
  getBid(): BidSnapshot | undefined;
  setBid(value?: BidSnapshot): void;

  getMatchingRate(): number;
  setMatchingRate(value: number): void;

  getTotalSatsCleared(): string;
  setTotalSatsCleared(value: string): void;

  getUnitsMatched(): number;
  setUnitsMatched(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MatchedOrderSnapshot.AsObject;
  static toObject(includeInstance: boolean, msg: MatchedOrderSnapshot): MatchedOrderSnapshot.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MatchedOrderSnapshot, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MatchedOrderSnapshot;
  static deserializeBinaryFromReader(message: MatchedOrderSnapshot, reader: jspb.BinaryReader): MatchedOrderSnapshot;
}

export namespace MatchedOrderSnapshot {
  export type AsObject = {
    ask?: AskSnapshot.AsObject,
    bid?: BidSnapshot.AsObject,
    matchingRate: number,
    totalSatsCleared: string,
    unitsMatched: number,
  }
}

export class BatchSnapshotRequest extends jspb.Message {
  getBatchId(): Uint8Array | string;
  getBatchId_asU8(): Uint8Array;
  getBatchId_asB64(): string;
  setBatchId(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BatchSnapshotRequest.AsObject;
  static toObject(includeInstance: boolean, msg: BatchSnapshotRequest): BatchSnapshotRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BatchSnapshotRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BatchSnapshotRequest;
  static deserializeBinaryFromReader(message: BatchSnapshotRequest, reader: jspb.BinaryReader): BatchSnapshotRequest;
}

export namespace BatchSnapshotRequest {
  export type AsObject = {
    batchId: Uint8Array | string,
  }
}

export class MatchedMarketSnapshot extends jspb.Message {
  clearMatchedOrdersList(): void;
  getMatchedOrdersList(): Array<MatchedOrderSnapshot>;
  setMatchedOrdersList(value: Array<MatchedOrderSnapshot>): void;
  addMatchedOrders(value?: MatchedOrderSnapshot, index?: number): MatchedOrderSnapshot;

  getClearingPriceRate(): number;
  setClearingPriceRate(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MatchedMarketSnapshot.AsObject;
  static toObject(includeInstance: boolean, msg: MatchedMarketSnapshot): MatchedMarketSnapshot.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MatchedMarketSnapshot, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MatchedMarketSnapshot;
  static deserializeBinaryFromReader(message: MatchedMarketSnapshot, reader: jspb.BinaryReader): MatchedMarketSnapshot;
}

export namespace MatchedMarketSnapshot {
  export type AsObject = {
    matchedOrdersList: Array<MatchedOrderSnapshot.AsObject>,
    clearingPriceRate: number,
  }
}

export class BatchSnapshotResponse extends jspb.Message {
  getVersion(): number;
  setVersion(value: number): void;

  getBatchId(): Uint8Array | string;
  getBatchId_asU8(): Uint8Array;
  getBatchId_asB64(): string;
  setBatchId(value: Uint8Array | string): void;

  getPrevBatchId(): Uint8Array | string;
  getPrevBatchId_asU8(): Uint8Array;
  getPrevBatchId_asB64(): string;
  setPrevBatchId(value: Uint8Array | string): void;

  getClearingPriceRate(): number;
  setClearingPriceRate(value: number): void;

  clearMatchedOrdersList(): void;
  getMatchedOrdersList(): Array<MatchedOrderSnapshot>;
  setMatchedOrdersList(value: Array<MatchedOrderSnapshot>): void;
  addMatchedOrders(value?: MatchedOrderSnapshot, index?: number): MatchedOrderSnapshot;

  getBatchTxId(): string;
  setBatchTxId(value: string): void;

  getBatchTx(): Uint8Array | string;
  getBatchTx_asU8(): Uint8Array;
  getBatchTx_asB64(): string;
  setBatchTx(value: Uint8Array | string): void;

  getBatchTxFeeRateSatPerKw(): string;
  setBatchTxFeeRateSatPerKw(value: string): void;

  getCreationTimestampNs(): string;
  setCreationTimestampNs(value: string): void;

  getMatchedMarketsMap(): jspb.Map<number, MatchedMarketSnapshot>;
  clearMatchedMarketsMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BatchSnapshotResponse.AsObject;
  static toObject(includeInstance: boolean, msg: BatchSnapshotResponse): BatchSnapshotResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BatchSnapshotResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BatchSnapshotResponse;
  static deserializeBinaryFromReader(message: BatchSnapshotResponse, reader: jspb.BinaryReader): BatchSnapshotResponse;
}

export namespace BatchSnapshotResponse {
  export type AsObject = {
    version: number,
    batchId: Uint8Array | string,
    prevBatchId: Uint8Array | string,
    clearingPriceRate: number,
    matchedOrdersList: Array<MatchedOrderSnapshot.AsObject>,
    batchTxId: string,
    batchTx: Uint8Array | string,
    batchTxFeeRateSatPerKw: string,
    creationTimestampNs: string,
    matchedMarketsMap: Array<[number, MatchedMarketSnapshot.AsObject]>,
  }
}

export class ServerNodeRatingRequest extends jspb.Message {
  clearNodePubkeysList(): void;
  getNodePubkeysList(): Array<Uint8Array | string>;
  getNodePubkeysList_asU8(): Array<Uint8Array>;
  getNodePubkeysList_asB64(): Array<string>;
  setNodePubkeysList(value: Array<Uint8Array | string>): void;
  addNodePubkeys(value: Uint8Array | string, index?: number): Uint8Array | string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerNodeRatingRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ServerNodeRatingRequest): ServerNodeRatingRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerNodeRatingRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerNodeRatingRequest;
  static deserializeBinaryFromReader(message: ServerNodeRatingRequest, reader: jspb.BinaryReader): ServerNodeRatingRequest;
}

export namespace ServerNodeRatingRequest {
  export type AsObject = {
    nodePubkeysList: Array<Uint8Array | string>,
  }
}

export class NodeRating extends jspb.Message {
  getNodePubkey(): Uint8Array | string;
  getNodePubkey_asU8(): Uint8Array;
  getNodePubkey_asB64(): string;
  setNodePubkey(value: Uint8Array | string): void;

  getNodeTier(): NodeTierMap[keyof NodeTierMap];
  setNodeTier(value: NodeTierMap[keyof NodeTierMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NodeRating.AsObject;
  static toObject(includeInstance: boolean, msg: NodeRating): NodeRating.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NodeRating, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NodeRating;
  static deserializeBinaryFromReader(message: NodeRating, reader: jspb.BinaryReader): NodeRating;
}

export namespace NodeRating {
  export type AsObject = {
    nodePubkey: Uint8Array | string,
    nodeTier: NodeTierMap[keyof NodeTierMap],
  }
}

export class ServerNodeRatingResponse extends jspb.Message {
  clearNodeRatingsList(): void;
  getNodeRatingsList(): Array<NodeRating>;
  setNodeRatingsList(value: Array<NodeRating>): void;
  addNodeRatings(value?: NodeRating, index?: number): NodeRating;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerNodeRatingResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ServerNodeRatingResponse): ServerNodeRatingResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ServerNodeRatingResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerNodeRatingResponse;
  static deserializeBinaryFromReader(message: ServerNodeRatingResponse, reader: jspb.BinaryReader): ServerNodeRatingResponse;
}

export namespace ServerNodeRatingResponse {
  export type AsObject = {
    nodeRatingsList: Array<NodeRating.AsObject>,
  }
}

export class BatchSnapshotsRequest extends jspb.Message {
  getStartBatchId(): Uint8Array | string;
  getStartBatchId_asU8(): Uint8Array;
  getStartBatchId_asB64(): string;
  setStartBatchId(value: Uint8Array | string): void;

  getNumBatchesBack(): number;
  setNumBatchesBack(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BatchSnapshotsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: BatchSnapshotsRequest): BatchSnapshotsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BatchSnapshotsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BatchSnapshotsRequest;
  static deserializeBinaryFromReader(message: BatchSnapshotsRequest, reader: jspb.BinaryReader): BatchSnapshotsRequest;
}

export namespace BatchSnapshotsRequest {
  export type AsObject = {
    startBatchId: Uint8Array | string,
    numBatchesBack: number,
  }
}

export class BatchSnapshotsResponse extends jspb.Message {
  clearBatchesList(): void;
  getBatchesList(): Array<BatchSnapshotResponse>;
  setBatchesList(value: Array<BatchSnapshotResponse>): void;
  addBatches(value?: BatchSnapshotResponse, index?: number): BatchSnapshotResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BatchSnapshotsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: BatchSnapshotsResponse): BatchSnapshotsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BatchSnapshotsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BatchSnapshotsResponse;
  static deserializeBinaryFromReader(message: BatchSnapshotsResponse, reader: jspb.BinaryReader): BatchSnapshotsResponse;
}

export namespace BatchSnapshotsResponse {
  export type AsObject = {
    batchesList: Array<BatchSnapshotResponse.AsObject>,
  }
}

export class MarketInfoRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MarketInfoRequest.AsObject;
  static toObject(includeInstance: boolean, msg: MarketInfoRequest): MarketInfoRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MarketInfoRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MarketInfoRequest;
  static deserializeBinaryFromReader(message: MarketInfoRequest, reader: jspb.BinaryReader): MarketInfoRequest;
}

export namespace MarketInfoRequest {
  export type AsObject = {
  }
}

export class MarketInfo extends jspb.Message {
  clearNumAsksList(): void;
  getNumAsksList(): Array<MarketInfo.TierValue>;
  setNumAsksList(value: Array<MarketInfo.TierValue>): void;
  addNumAsks(value?: MarketInfo.TierValue, index?: number): MarketInfo.TierValue;

  clearNumBidsList(): void;
  getNumBidsList(): Array<MarketInfo.TierValue>;
  setNumBidsList(value: Array<MarketInfo.TierValue>): void;
  addNumBids(value?: MarketInfo.TierValue, index?: number): MarketInfo.TierValue;

  clearAskOpenInterestUnitsList(): void;
  getAskOpenInterestUnitsList(): Array<MarketInfo.TierValue>;
  setAskOpenInterestUnitsList(value: Array<MarketInfo.TierValue>): void;
  addAskOpenInterestUnits(value?: MarketInfo.TierValue, index?: number): MarketInfo.TierValue;

  clearBidOpenInterestUnitsList(): void;
  getBidOpenInterestUnitsList(): Array<MarketInfo.TierValue>;
  setBidOpenInterestUnitsList(value: Array<MarketInfo.TierValue>): void;
  addBidOpenInterestUnits(value?: MarketInfo.TierValue, index?: number): MarketInfo.TierValue;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MarketInfo.AsObject;
  static toObject(includeInstance: boolean, msg: MarketInfo): MarketInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MarketInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MarketInfo;
  static deserializeBinaryFromReader(message: MarketInfo, reader: jspb.BinaryReader): MarketInfo;
}

export namespace MarketInfo {
  export type AsObject = {
    numAsksList: Array<MarketInfo.TierValue.AsObject>,
    numBidsList: Array<MarketInfo.TierValue.AsObject>,
    askOpenInterestUnitsList: Array<MarketInfo.TierValue.AsObject>,
    bidOpenInterestUnitsList: Array<MarketInfo.TierValue.AsObject>,
  }

  export class TierValue extends jspb.Message {
    getTier(): NodeTierMap[keyof NodeTierMap];
    setTier(value: NodeTierMap[keyof NodeTierMap]): void;

    getValue(): number;
    setValue(value: number): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TierValue.AsObject;
    static toObject(includeInstance: boolean, msg: TierValue): TierValue.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TierValue, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TierValue;
    static deserializeBinaryFromReader(message: TierValue, reader: jspb.BinaryReader): TierValue;
  }

  export namespace TierValue {
    export type AsObject = {
      tier: NodeTierMap[keyof NodeTierMap],
      value: number,
    }
  }
}

export class MarketInfoResponse extends jspb.Message {
  getMarketsMap(): jspb.Map<number, MarketInfo>;
  clearMarketsMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MarketInfoResponse.AsObject;
  static toObject(includeInstance: boolean, msg: MarketInfoResponse): MarketInfoResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MarketInfoResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MarketInfoResponse;
  static deserializeBinaryFromReader(message: MarketInfoResponse, reader: jspb.BinaryReader): MarketInfoResponse;
}

export namespace MarketInfoResponse {
  export type AsObject = {
    marketsMap: Array<[number, MarketInfo.AsObject]>,
  }
}

export interface ChannelTypeMap {
  TWEAKLESS: 0;
  ANCHORS: 1;
  SCRIPT_ENFORCED_LEASE: 2;
}

export const ChannelType: ChannelTypeMap;

export interface AuctionAccountStateMap {
  STATE_PENDING_OPEN: 0;
  STATE_OPEN: 1;
  STATE_EXPIRED: 2;
  STATE_PENDING_UPDATE: 3;
  STATE_CLOSED: 4;
  STATE_PENDING_BATCH: 5;
  STATE_EXPIRED_PENDING_UPDATE: 6;
}

export const AuctionAccountState: AuctionAccountStateMap;

export interface OrderChannelTypeMap {
  ORDER_CHANNEL_TYPE_UNKNOWN: 0;
  ORDER_CHANNEL_TYPE_PEER_DEPENDENT: 1;
  ORDER_CHANNEL_TYPE_SCRIPT_ENFORCED: 2;
}

export const OrderChannelType: OrderChannelTypeMap;

export interface AuctionTypeMap {
  AUCTION_TYPE_BTC_INBOUND_LIQUIDITY: 0;
  AUCTION_TYPE_BTC_OUTBOUND_LIQUIDITY: 1;
}

export const AuctionType: AuctionTypeMap;

export interface NodeTierMap {
  TIER_DEFAULT: 0;
  TIER_0: 1;
  TIER_1: 2;
}

export const NodeTier: NodeTierMap;

export interface ChannelAnnouncementConstraintsMap {
  ANNOUNCEMENT_NO_PREFERENCE: 0;
  ONLY_ANNOUNCED: 1;
  ONLY_UNANNOUNCED: 2;
}

export const ChannelAnnouncementConstraints: ChannelAnnouncementConstraintsMap;

export interface ChannelConfirmationConstraintsMap {
  CONFIRMATION_NO_PREFERENCE: 0;
  ONLY_CONFIRMED: 1;
  ONLY_ZEROCONF: 2;
}

export const ChannelConfirmationConstraints: ChannelConfirmationConstraintsMap;

export interface OrderStateMap {
  ORDER_SUBMITTED: 0;
  ORDER_CLEARED: 1;
  ORDER_PARTIALLY_FILLED: 2;
  ORDER_EXECUTED: 3;
  ORDER_CANCELED: 4;
  ORDER_EXPIRED: 5;
  ORDER_FAILED: 6;
}

export const OrderState: OrderStateMap;

export interface DurationBucketStateMap {
  NO_MARKET: 0;
  MARKET_CLOSED: 1;
  ACCEPTING_ORDERS: 2;
  MARKET_OPEN: 3;
}

export const DurationBucketState: DurationBucketStateMap;

