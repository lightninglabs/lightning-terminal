// package: poolrpc
// file: trader.proto

import * as jspb from "google-protobuf";
import * as google_api_annotations_pb from "./google/api/annotations_pb";
import * as auctioneer_pb from "./auctioneer_pb";

export class InitAccountRequest extends jspb.Message {
  getAccountValue(): number;
  setAccountValue(value: number): void;

  hasAbsoluteHeight(): boolean;
  clearAbsoluteHeight(): void;
  getAbsoluteHeight(): number;
  setAbsoluteHeight(value: number): void;

  hasRelativeHeight(): boolean;
  clearRelativeHeight(): void;
  getRelativeHeight(): number;
  setRelativeHeight(value: number): void;

  hasConfTarget(): boolean;
  clearConfTarget(): void;
  getConfTarget(): number;
  setConfTarget(value: number): void;

  getAccountExpiryCase(): InitAccountRequest.AccountExpiryCase;
  getFeesCase(): InitAccountRequest.FeesCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InitAccountRequest.AsObject;
  static toObject(includeInstance: boolean, msg: InitAccountRequest): InitAccountRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InitAccountRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InitAccountRequest;
  static deserializeBinaryFromReader(message: InitAccountRequest, reader: jspb.BinaryReader): InitAccountRequest;
}

export namespace InitAccountRequest {
  export type AsObject = {
    accountValue: number,
    absoluteHeight: number,
    relativeHeight: number,
    confTarget: number,
  }

  export enum AccountExpiryCase {
    ACCOUNT_EXPIRY_NOT_SET = 0,
    ABSOLUTE_HEIGHT = 2,
    RELATIVE_HEIGHT = 3,
  }

  export enum FeesCase {
    FEES_NOT_SET = 0,
    CONF_TARGET = 4,
  }
}

export class QuoteAccountRequest extends jspb.Message {
  getAccountValue(): number;
  setAccountValue(value: number): void;

  hasConfTarget(): boolean;
  clearConfTarget(): void;
  getConfTarget(): number;
  setConfTarget(value: number): void;

  getFeesCase(): QuoteAccountRequest.FeesCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): QuoteAccountRequest.AsObject;
  static toObject(includeInstance: boolean, msg: QuoteAccountRequest): QuoteAccountRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: QuoteAccountRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): QuoteAccountRequest;
  static deserializeBinaryFromReader(message: QuoteAccountRequest, reader: jspb.BinaryReader): QuoteAccountRequest;
}

export namespace QuoteAccountRequest {
  export type AsObject = {
    accountValue: number,
    confTarget: number,
  }

  export enum FeesCase {
    FEES_NOT_SET = 0,
    CONF_TARGET = 2,
  }
}

export class QuoteAccountResponse extends jspb.Message {
  getMinerFeeRateSatPerKw(): number;
  setMinerFeeRateSatPerKw(value: number): void;

  getMinerFeeTotal(): number;
  setMinerFeeTotal(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): QuoteAccountResponse.AsObject;
  static toObject(includeInstance: boolean, msg: QuoteAccountResponse): QuoteAccountResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: QuoteAccountResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): QuoteAccountResponse;
  static deserializeBinaryFromReader(message: QuoteAccountResponse, reader: jspb.BinaryReader): QuoteAccountResponse;
}

export namespace QuoteAccountResponse {
  export type AsObject = {
    minerFeeRateSatPerKw: number,
    minerFeeTotal: number,
  }
}

export class ListAccountsRequest extends jspb.Message {
  getActiveOnly(): boolean;
  setActiveOnly(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListAccountsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListAccountsRequest): ListAccountsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListAccountsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListAccountsRequest;
  static deserializeBinaryFromReader(message: ListAccountsRequest, reader: jspb.BinaryReader): ListAccountsRequest;
}

export namespace ListAccountsRequest {
  export type AsObject = {
    activeOnly: boolean,
  }
}

export class ListAccountsResponse extends jspb.Message {
  clearAccountsList(): void;
  getAccountsList(): Array<Account>;
  setAccountsList(value: Array<Account>): void;
  addAccounts(value?: Account, index?: number): Account;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListAccountsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListAccountsResponse): ListAccountsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListAccountsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListAccountsResponse;
  static deserializeBinaryFromReader(message: ListAccountsResponse, reader: jspb.BinaryReader): ListAccountsResponse;
}

export namespace ListAccountsResponse {
  export type AsObject = {
    accountsList: Array<Account.AsObject>,
  }
}

export class Output extends jspb.Message {
  getValueSat(): number;
  setValueSat(value: number): void;

  getAddress(): string;
  setAddress(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Output.AsObject;
  static toObject(includeInstance: boolean, msg: Output): Output.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Output, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Output;
  static deserializeBinaryFromReader(message: Output, reader: jspb.BinaryReader): Output;
}

export namespace Output {
  export type AsObject = {
    valueSat: number,
    address: string,
  }
}

export class OutputWithFee extends jspb.Message {
  getAddress(): string;
  setAddress(value: string): void;

  hasConfTarget(): boolean;
  clearConfTarget(): void;
  getConfTarget(): number;
  setConfTarget(value: number): void;

  hasFeeRateSatPerKw(): boolean;
  clearFeeRateSatPerKw(): void;
  getFeeRateSatPerKw(): number;
  setFeeRateSatPerKw(value: number): void;

  getFeesCase(): OutputWithFee.FeesCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OutputWithFee.AsObject;
  static toObject(includeInstance: boolean, msg: OutputWithFee): OutputWithFee.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OutputWithFee, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OutputWithFee;
  static deserializeBinaryFromReader(message: OutputWithFee, reader: jspb.BinaryReader): OutputWithFee;
}

export namespace OutputWithFee {
  export type AsObject = {
    address: string,
    confTarget: number,
    feeRateSatPerKw: number,
  }

  export enum FeesCase {
    FEES_NOT_SET = 0,
    CONF_TARGET = 2,
    FEE_RATE_SAT_PER_KW = 3,
  }
}

export class OutputsWithImplicitFee extends jspb.Message {
  clearOutputsList(): void;
  getOutputsList(): Array<Output>;
  setOutputsList(value: Array<Output>): void;
  addOutputs(value?: Output, index?: number): Output;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OutputsWithImplicitFee.AsObject;
  static toObject(includeInstance: boolean, msg: OutputsWithImplicitFee): OutputsWithImplicitFee.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OutputsWithImplicitFee, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OutputsWithImplicitFee;
  static deserializeBinaryFromReader(message: OutputsWithImplicitFee, reader: jspb.BinaryReader): OutputsWithImplicitFee;
}

export namespace OutputsWithImplicitFee {
  export type AsObject = {
    outputsList: Array<Output.AsObject>,
  }
}

export class CloseAccountRequest extends jspb.Message {
  getTraderKey(): Uint8Array | string;
  getTraderKey_asU8(): Uint8Array;
  getTraderKey_asB64(): string;
  setTraderKey(value: Uint8Array | string): void;

  hasOutputWithFee(): boolean;
  clearOutputWithFee(): void;
  getOutputWithFee(): OutputWithFee | undefined;
  setOutputWithFee(value?: OutputWithFee): void;

  hasOutputs(): boolean;
  clearOutputs(): void;
  getOutputs(): OutputsWithImplicitFee | undefined;
  setOutputs(value?: OutputsWithImplicitFee): void;

  getFundsDestinationCase(): CloseAccountRequest.FundsDestinationCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CloseAccountRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CloseAccountRequest): CloseAccountRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CloseAccountRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CloseAccountRequest;
  static deserializeBinaryFromReader(message: CloseAccountRequest, reader: jspb.BinaryReader): CloseAccountRequest;
}

export namespace CloseAccountRequest {
  export type AsObject = {
    traderKey: Uint8Array | string,
    outputWithFee?: OutputWithFee.AsObject,
    outputs?: OutputsWithImplicitFee.AsObject,
  }

  export enum FundsDestinationCase {
    FUNDS_DESTINATION_NOT_SET = 0,
    OUTPUT_WITH_FEE = 2,
    OUTPUTS = 3,
  }
}

export class CloseAccountResponse extends jspb.Message {
  getCloseTxid(): Uint8Array | string;
  getCloseTxid_asU8(): Uint8Array;
  getCloseTxid_asB64(): string;
  setCloseTxid(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CloseAccountResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CloseAccountResponse): CloseAccountResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CloseAccountResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CloseAccountResponse;
  static deserializeBinaryFromReader(message: CloseAccountResponse, reader: jspb.BinaryReader): CloseAccountResponse;
}

export namespace CloseAccountResponse {
  export type AsObject = {
    closeTxid: Uint8Array | string,
  }
}

export class WithdrawAccountRequest extends jspb.Message {
  getTraderKey(): Uint8Array | string;
  getTraderKey_asU8(): Uint8Array;
  getTraderKey_asB64(): string;
  setTraderKey(value: Uint8Array | string): void;

  clearOutputsList(): void;
  getOutputsList(): Array<Output>;
  setOutputsList(value: Array<Output>): void;
  addOutputs(value?: Output, index?: number): Output;

  getFeeRateSatPerKw(): number;
  setFeeRateSatPerKw(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WithdrawAccountRequest.AsObject;
  static toObject(includeInstance: boolean, msg: WithdrawAccountRequest): WithdrawAccountRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WithdrawAccountRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WithdrawAccountRequest;
  static deserializeBinaryFromReader(message: WithdrawAccountRequest, reader: jspb.BinaryReader): WithdrawAccountRequest;
}

export namespace WithdrawAccountRequest {
  export type AsObject = {
    traderKey: Uint8Array | string,
    outputsList: Array<Output.AsObject>,
    feeRateSatPerKw: number,
  }
}

export class WithdrawAccountResponse extends jspb.Message {
  hasAccount(): boolean;
  clearAccount(): void;
  getAccount(): Account | undefined;
  setAccount(value?: Account): void;

  getWithdrawTxid(): Uint8Array | string;
  getWithdrawTxid_asU8(): Uint8Array;
  getWithdrawTxid_asB64(): string;
  setWithdrawTxid(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WithdrawAccountResponse.AsObject;
  static toObject(includeInstance: boolean, msg: WithdrawAccountResponse): WithdrawAccountResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WithdrawAccountResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WithdrawAccountResponse;
  static deserializeBinaryFromReader(message: WithdrawAccountResponse, reader: jspb.BinaryReader): WithdrawAccountResponse;
}

export namespace WithdrawAccountResponse {
  export type AsObject = {
    account?: Account.AsObject,
    withdrawTxid: Uint8Array | string,
  }
}

export class DepositAccountRequest extends jspb.Message {
  getTraderKey(): Uint8Array | string;
  getTraderKey_asU8(): Uint8Array;
  getTraderKey_asB64(): string;
  setTraderKey(value: Uint8Array | string): void;

  getAmountSat(): number;
  setAmountSat(value: number): void;

  getFeeRateSatPerKw(): number;
  setFeeRateSatPerKw(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DepositAccountRequest.AsObject;
  static toObject(includeInstance: boolean, msg: DepositAccountRequest): DepositAccountRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DepositAccountRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DepositAccountRequest;
  static deserializeBinaryFromReader(message: DepositAccountRequest, reader: jspb.BinaryReader): DepositAccountRequest;
}

export namespace DepositAccountRequest {
  export type AsObject = {
    traderKey: Uint8Array | string,
    amountSat: number,
    feeRateSatPerKw: number,
  }
}

export class DepositAccountResponse extends jspb.Message {
  hasAccount(): boolean;
  clearAccount(): void;
  getAccount(): Account | undefined;
  setAccount(value?: Account): void;

  getDepositTxid(): Uint8Array | string;
  getDepositTxid_asU8(): Uint8Array;
  getDepositTxid_asB64(): string;
  setDepositTxid(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DepositAccountResponse.AsObject;
  static toObject(includeInstance: boolean, msg: DepositAccountResponse): DepositAccountResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DepositAccountResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DepositAccountResponse;
  static deserializeBinaryFromReader(message: DepositAccountResponse, reader: jspb.BinaryReader): DepositAccountResponse;
}

export namespace DepositAccountResponse {
  export type AsObject = {
    account?: Account.AsObject,
    depositTxid: Uint8Array | string,
  }
}

export class BumpAccountFeeRequest extends jspb.Message {
  getTraderKey(): Uint8Array | string;
  getTraderKey_asU8(): Uint8Array;
  getTraderKey_asB64(): string;
  setTraderKey(value: Uint8Array | string): void;

  getFeeRateSatPerKw(): number;
  setFeeRateSatPerKw(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BumpAccountFeeRequest.AsObject;
  static toObject(includeInstance: boolean, msg: BumpAccountFeeRequest): BumpAccountFeeRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BumpAccountFeeRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BumpAccountFeeRequest;
  static deserializeBinaryFromReader(message: BumpAccountFeeRequest, reader: jspb.BinaryReader): BumpAccountFeeRequest;
}

export namespace BumpAccountFeeRequest {
  export type AsObject = {
    traderKey: Uint8Array | string,
    feeRateSatPerKw: number,
  }
}

export class BumpAccountFeeResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BumpAccountFeeResponse.AsObject;
  static toObject(includeInstance: boolean, msg: BumpAccountFeeResponse): BumpAccountFeeResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BumpAccountFeeResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BumpAccountFeeResponse;
  static deserializeBinaryFromReader(message: BumpAccountFeeResponse, reader: jspb.BinaryReader): BumpAccountFeeResponse;
}

export namespace BumpAccountFeeResponse {
  export type AsObject = {
  }
}

export class Account extends jspb.Message {
  getTraderKey(): Uint8Array | string;
  getTraderKey_asU8(): Uint8Array;
  getTraderKey_asB64(): string;
  setTraderKey(value: Uint8Array | string): void;

  hasOutpoint(): boolean;
  clearOutpoint(): void;
  getOutpoint(): auctioneer_pb.OutPoint | undefined;
  setOutpoint(value?: auctioneer_pb.OutPoint): void;

  getValue(): number;
  setValue(value: number): void;

  getAvailableBalance(): number;
  setAvailableBalance(value: number): void;

  getExpirationHeight(): number;
  setExpirationHeight(value: number): void;

  getState(): AccountStateMap[keyof AccountStateMap];
  setState(value: AccountStateMap[keyof AccountStateMap]): void;

  getLatestTxid(): Uint8Array | string;
  getLatestTxid_asU8(): Uint8Array;
  getLatestTxid_asB64(): string;
  setLatestTxid(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Account.AsObject;
  static toObject(includeInstance: boolean, msg: Account): Account.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Account, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Account;
  static deserializeBinaryFromReader(message: Account, reader: jspb.BinaryReader): Account;
}

export namespace Account {
  export type AsObject = {
    traderKey: Uint8Array | string,
    outpoint?: auctioneer_pb.OutPoint.AsObject,
    value: number,
    availableBalance: number,
    expirationHeight: number,
    state: AccountStateMap[keyof AccountStateMap],
    latestTxid: Uint8Array | string,
  }
}

export class SubmitOrderRequest extends jspb.Message {
  hasAsk(): boolean;
  clearAsk(): void;
  getAsk(): Ask | undefined;
  setAsk(value?: Ask): void;

  hasBid(): boolean;
  clearBid(): void;
  getBid(): Bid | undefined;
  setBid(value?: Bid): void;

  getDetailsCase(): SubmitOrderRequest.DetailsCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubmitOrderRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SubmitOrderRequest): SubmitOrderRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SubmitOrderRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubmitOrderRequest;
  static deserializeBinaryFromReader(message: SubmitOrderRequest, reader: jspb.BinaryReader): SubmitOrderRequest;
}

export namespace SubmitOrderRequest {
  export type AsObject = {
    ask?: Ask.AsObject,
    bid?: Bid.AsObject,
  }

  export enum DetailsCase {
    DETAILS_NOT_SET = 0,
    ASK = 1,
    BID = 2,
  }
}

export class SubmitOrderResponse extends jspb.Message {
  hasInvalidOrder(): boolean;
  clearInvalidOrder(): void;
  getInvalidOrder(): auctioneer_pb.InvalidOrder | undefined;
  setInvalidOrder(value?: auctioneer_pb.InvalidOrder): void;

  hasAcceptedOrderNonce(): boolean;
  clearAcceptedOrderNonce(): void;
  getAcceptedOrderNonce(): Uint8Array | string;
  getAcceptedOrderNonce_asU8(): Uint8Array;
  getAcceptedOrderNonce_asB64(): string;
  setAcceptedOrderNonce(value: Uint8Array | string): void;

  getDetailsCase(): SubmitOrderResponse.DetailsCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubmitOrderResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SubmitOrderResponse): SubmitOrderResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SubmitOrderResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubmitOrderResponse;
  static deserializeBinaryFromReader(message: SubmitOrderResponse, reader: jspb.BinaryReader): SubmitOrderResponse;
}

export namespace SubmitOrderResponse {
  export type AsObject = {
    invalidOrder?: auctioneer_pb.InvalidOrder.AsObject,
    acceptedOrderNonce: Uint8Array | string,
  }

  export enum DetailsCase {
    DETAILS_NOT_SET = 0,
    INVALID_ORDER = 1,
    ACCEPTED_ORDER_NONCE = 2,
  }
}

export class ListOrdersRequest extends jspb.Message {
  getVerbose(): boolean;
  setVerbose(value: boolean): void;

  getActiveOnly(): boolean;
  setActiveOnly(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListOrdersRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListOrdersRequest): ListOrdersRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListOrdersRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListOrdersRequest;
  static deserializeBinaryFromReader(message: ListOrdersRequest, reader: jspb.BinaryReader): ListOrdersRequest;
}

export namespace ListOrdersRequest {
  export type AsObject = {
    verbose: boolean,
    activeOnly: boolean,
  }
}

export class ListOrdersResponse extends jspb.Message {
  clearAsksList(): void;
  getAsksList(): Array<Ask>;
  setAsksList(value: Array<Ask>): void;
  addAsks(value?: Ask, index?: number): Ask;

  clearBidsList(): void;
  getBidsList(): Array<Bid>;
  setBidsList(value: Array<Bid>): void;
  addBids(value?: Bid, index?: number): Bid;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListOrdersResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListOrdersResponse): ListOrdersResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListOrdersResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListOrdersResponse;
  static deserializeBinaryFromReader(message: ListOrdersResponse, reader: jspb.BinaryReader): ListOrdersResponse;
}

export namespace ListOrdersResponse {
  export type AsObject = {
    asksList: Array<Ask.AsObject>,
    bidsList: Array<Bid.AsObject>,
  }
}

export class CancelOrderRequest extends jspb.Message {
  getOrderNonce(): Uint8Array | string;
  getOrderNonce_asU8(): Uint8Array;
  getOrderNonce_asB64(): string;
  setOrderNonce(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CancelOrderRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CancelOrderRequest): CancelOrderRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CancelOrderRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CancelOrderRequest;
  static deserializeBinaryFromReader(message: CancelOrderRequest, reader: jspb.BinaryReader): CancelOrderRequest;
}

export namespace CancelOrderRequest {
  export type AsObject = {
    orderNonce: Uint8Array | string,
  }
}

export class CancelOrderResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CancelOrderResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CancelOrderResponse): CancelOrderResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CancelOrderResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CancelOrderResponse;
  static deserializeBinaryFromReader(message: CancelOrderResponse, reader: jspb.BinaryReader): CancelOrderResponse;
}

export namespace CancelOrderResponse {
  export type AsObject = {
  }
}

export class Order extends jspb.Message {
  getTraderKey(): Uint8Array | string;
  getTraderKey_asU8(): Uint8Array;
  getTraderKey_asB64(): string;
  setTraderKey(value: Uint8Array | string): void;

  getRateFixed(): number;
  setRateFixed(value: number): void;

  getAmt(): number;
  setAmt(value: number): void;

  getMaxBatchFeeRateSatPerKw(): number;
  setMaxBatchFeeRateSatPerKw(value: number): void;

  getOrderNonce(): Uint8Array | string;
  getOrderNonce_asU8(): Uint8Array;
  getOrderNonce_asB64(): string;
  setOrderNonce(value: Uint8Array | string): void;

  getState(): auctioneer_pb.OrderStateMap[keyof auctioneer_pb.OrderStateMap];
  setState(value: auctioneer_pb.OrderStateMap[keyof auctioneer_pb.OrderStateMap]): void;

  getUnits(): number;
  setUnits(value: number): void;

  getUnitsUnfulfilled(): number;
  setUnitsUnfulfilled(value: number): void;

  getReservedValueSat(): number;
  setReservedValueSat(value: number): void;

  getCreationTimestampNs(): number;
  setCreationTimestampNs(value: number): void;

  clearEventsList(): void;
  getEventsList(): Array<OrderEvent>;
  setEventsList(value: Array<OrderEvent>): void;
  addEvents(value?: OrderEvent, index?: number): OrderEvent;

  getMinUnitsMatch(): number;
  setMinUnitsMatch(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Order.AsObject;
  static toObject(includeInstance: boolean, msg: Order): Order.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Order, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Order;
  static deserializeBinaryFromReader(message: Order, reader: jspb.BinaryReader): Order;
}

export namespace Order {
  export type AsObject = {
    traderKey: Uint8Array | string,
    rateFixed: number,
    amt: number,
    maxBatchFeeRateSatPerKw: number,
    orderNonce: Uint8Array | string,
    state: auctioneer_pb.OrderStateMap[keyof auctioneer_pb.OrderStateMap],
    units: number,
    unitsUnfulfilled: number,
    reservedValueSat: number,
    creationTimestampNs: number,
    eventsList: Array<OrderEvent.AsObject>,
    minUnitsMatch: number,
  }
}

export class Bid extends jspb.Message {
  hasDetails(): boolean;
  clearDetails(): void;
  getDetails(): Order | undefined;
  setDetails(value?: Order): void;

  getLeaseDurationBlocks(): number;
  setLeaseDurationBlocks(value: number): void;

  getVersion(): number;
  setVersion(value: number): void;

  getMinNodeTier(): auctioneer_pb.NodeTierMap[keyof auctioneer_pb.NodeTierMap];
  setMinNodeTier(value: auctioneer_pb.NodeTierMap[keyof auctioneer_pb.NodeTierMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Bid.AsObject;
  static toObject(includeInstance: boolean, msg: Bid): Bid.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Bid, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Bid;
  static deserializeBinaryFromReader(message: Bid, reader: jspb.BinaryReader): Bid;
}

export namespace Bid {
  export type AsObject = {
    details?: Order.AsObject,
    leaseDurationBlocks: number,
    version: number,
    minNodeTier: auctioneer_pb.NodeTierMap[keyof auctioneer_pb.NodeTierMap],
  }
}

export class Ask extends jspb.Message {
  hasDetails(): boolean;
  clearDetails(): void;
  getDetails(): Order | undefined;
  setDetails(value?: Order): void;

  getLeaseDurationBlocks(): number;
  setLeaseDurationBlocks(value: number): void;

  getVersion(): number;
  setVersion(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Ask.AsObject;
  static toObject(includeInstance: boolean, msg: Ask): Ask.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Ask, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Ask;
  static deserializeBinaryFromReader(message: Ask, reader: jspb.BinaryReader): Ask;
}

export namespace Ask {
  export type AsObject = {
    details?: Order.AsObject,
    leaseDurationBlocks: number,
    version: number,
  }
}

export class OrderEvent extends jspb.Message {
  getTimestampNs(): number;
  setTimestampNs(value: number): void;

  getEventStr(): string;
  setEventStr(value: string): void;

  hasStateChange(): boolean;
  clearStateChange(): void;
  getStateChange(): UpdatedEvent | undefined;
  setStateChange(value?: UpdatedEvent): void;

  hasMatched(): boolean;
  clearMatched(): void;
  getMatched(): MatchEvent | undefined;
  setMatched(value?: MatchEvent): void;

  getEventCase(): OrderEvent.EventCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OrderEvent.AsObject;
  static toObject(includeInstance: boolean, msg: OrderEvent): OrderEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OrderEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OrderEvent;
  static deserializeBinaryFromReader(message: OrderEvent, reader: jspb.BinaryReader): OrderEvent;
}

export namespace OrderEvent {
  export type AsObject = {
    timestampNs: number,
    eventStr: string,
    stateChange?: UpdatedEvent.AsObject,
    matched?: MatchEvent.AsObject,
  }

  export enum EventCase {
    EVENT_NOT_SET = 0,
    STATE_CHANGE = 3,
    MATCHED = 4,
  }
}

export class UpdatedEvent extends jspb.Message {
  getPreviousState(): auctioneer_pb.OrderStateMap[keyof auctioneer_pb.OrderStateMap];
  setPreviousState(value: auctioneer_pb.OrderStateMap[keyof auctioneer_pb.OrderStateMap]): void;

  getNewState(): auctioneer_pb.OrderStateMap[keyof auctioneer_pb.OrderStateMap];
  setNewState(value: auctioneer_pb.OrderStateMap[keyof auctioneer_pb.OrderStateMap]): void;

  getUnitsFilled(): number;
  setUnitsFilled(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdatedEvent.AsObject;
  static toObject(includeInstance: boolean, msg: UpdatedEvent): UpdatedEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdatedEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdatedEvent;
  static deserializeBinaryFromReader(message: UpdatedEvent, reader: jspb.BinaryReader): UpdatedEvent;
}

export namespace UpdatedEvent {
  export type AsObject = {
    previousState: auctioneer_pb.OrderStateMap[keyof auctioneer_pb.OrderStateMap],
    newState: auctioneer_pb.OrderStateMap[keyof auctioneer_pb.OrderStateMap],
    unitsFilled: number,
  }
}

export class MatchEvent extends jspb.Message {
  getMatchState(): MatchStateMap[keyof MatchStateMap];
  setMatchState(value: MatchStateMap[keyof MatchStateMap]): void;

  getUnitsFilled(): number;
  setUnitsFilled(value: number): void;

  getMatchedOrder(): Uint8Array | string;
  getMatchedOrder_asU8(): Uint8Array;
  getMatchedOrder_asB64(): string;
  setMatchedOrder(value: Uint8Array | string): void;

  getRejectReason(): MatchRejectReasonMap[keyof MatchRejectReasonMap];
  setRejectReason(value: MatchRejectReasonMap[keyof MatchRejectReasonMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MatchEvent.AsObject;
  static toObject(includeInstance: boolean, msg: MatchEvent): MatchEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MatchEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MatchEvent;
  static deserializeBinaryFromReader(message: MatchEvent, reader: jspb.BinaryReader): MatchEvent;
}

export namespace MatchEvent {
  export type AsObject = {
    matchState: MatchStateMap[keyof MatchStateMap],
    unitsFilled: number,
    matchedOrder: Uint8Array | string,
    rejectReason: MatchRejectReasonMap[keyof MatchRejectReasonMap],
  }
}

export class RecoverAccountsRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RecoverAccountsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RecoverAccountsRequest): RecoverAccountsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RecoverAccountsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RecoverAccountsRequest;
  static deserializeBinaryFromReader(message: RecoverAccountsRequest, reader: jspb.BinaryReader): RecoverAccountsRequest;
}

export namespace RecoverAccountsRequest {
  export type AsObject = {
  }
}

export class RecoverAccountsResponse extends jspb.Message {
  getNumRecoveredAccounts(): number;
  setNumRecoveredAccounts(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RecoverAccountsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: RecoverAccountsResponse): RecoverAccountsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RecoverAccountsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RecoverAccountsResponse;
  static deserializeBinaryFromReader(message: RecoverAccountsResponse, reader: jspb.BinaryReader): RecoverAccountsResponse;
}

export namespace RecoverAccountsResponse {
  export type AsObject = {
    numRecoveredAccounts: number,
  }
}

export class AuctionFeeRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AuctionFeeRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AuctionFeeRequest): AuctionFeeRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AuctionFeeRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AuctionFeeRequest;
  static deserializeBinaryFromReader(message: AuctionFeeRequest, reader: jspb.BinaryReader): AuctionFeeRequest;
}

export namespace AuctionFeeRequest {
  export type AsObject = {
  }
}

export class AuctionFeeResponse extends jspb.Message {
  hasExecutionFee(): boolean;
  clearExecutionFee(): void;
  getExecutionFee(): auctioneer_pb.ExecutionFee | undefined;
  setExecutionFee(value?: auctioneer_pb.ExecutionFee): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AuctionFeeResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AuctionFeeResponse): AuctionFeeResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AuctionFeeResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AuctionFeeResponse;
  static deserializeBinaryFromReader(message: AuctionFeeResponse, reader: jspb.BinaryReader): AuctionFeeResponse;
}

export namespace AuctionFeeResponse {
  export type AsObject = {
    executionFee?: auctioneer_pb.ExecutionFee.AsObject,
  }
}

export class Lease extends jspb.Message {
  hasChannelPoint(): boolean;
  clearChannelPoint(): void;
  getChannelPoint(): auctioneer_pb.OutPoint | undefined;
  setChannelPoint(value?: auctioneer_pb.OutPoint): void;

  getChannelAmtSat(): number;
  setChannelAmtSat(value: number): void;

  getChannelDurationBlocks(): number;
  setChannelDurationBlocks(value: number): void;

  getChannelLeaseExpiry(): number;
  setChannelLeaseExpiry(value: number): void;

  getPremiumSat(): number;
  setPremiumSat(value: number): void;

  getExecutionFeeSat(): number;
  setExecutionFeeSat(value: number): void;

  getChainFeeSat(): number;
  setChainFeeSat(value: number): void;

  getClearingRatePrice(): number;
  setClearingRatePrice(value: number): void;

  getOrderFixedRate(): number;
  setOrderFixedRate(value: number): void;

  getOrderNonce(): Uint8Array | string;
  getOrderNonce_asU8(): Uint8Array;
  getOrderNonce_asB64(): string;
  setOrderNonce(value: Uint8Array | string): void;

  getPurchased(): boolean;
  setPurchased(value: boolean): void;

  getChannelRemoteNodeKey(): Uint8Array | string;
  getChannelRemoteNodeKey_asU8(): Uint8Array;
  getChannelRemoteNodeKey_asB64(): string;
  setChannelRemoteNodeKey(value: Uint8Array | string): void;

  getChannelNodeTier(): auctioneer_pb.NodeTierMap[keyof auctioneer_pb.NodeTierMap];
  setChannelNodeTier(value: auctioneer_pb.NodeTierMap[keyof auctioneer_pb.NodeTierMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Lease.AsObject;
  static toObject(includeInstance: boolean, msg: Lease): Lease.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Lease, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Lease;
  static deserializeBinaryFromReader(message: Lease, reader: jspb.BinaryReader): Lease;
}

export namespace Lease {
  export type AsObject = {
    channelPoint?: auctioneer_pb.OutPoint.AsObject,
    channelAmtSat: number,
    channelDurationBlocks: number,
    channelLeaseExpiry: number,
    premiumSat: number,
    executionFeeSat: number,
    chainFeeSat: number,
    clearingRatePrice: number,
    orderFixedRate: number,
    orderNonce: Uint8Array | string,
    purchased: boolean,
    channelRemoteNodeKey: Uint8Array | string,
    channelNodeTier: auctioneer_pb.NodeTierMap[keyof auctioneer_pb.NodeTierMap],
  }
}

export class LeasesRequest extends jspb.Message {
  clearBatchIdsList(): void;
  getBatchIdsList(): Array<Uint8Array | string>;
  getBatchIdsList_asU8(): Array<Uint8Array>;
  getBatchIdsList_asB64(): Array<string>;
  setBatchIdsList(value: Array<Uint8Array | string>): void;
  addBatchIds(value: Uint8Array | string, index?: number): Uint8Array | string;

  clearAccountsList(): void;
  getAccountsList(): Array<Uint8Array | string>;
  getAccountsList_asU8(): Array<Uint8Array>;
  getAccountsList_asB64(): Array<string>;
  setAccountsList(value: Array<Uint8Array | string>): void;
  addAccounts(value: Uint8Array | string, index?: number): Uint8Array | string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LeasesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: LeasesRequest): LeasesRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LeasesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LeasesRequest;
  static deserializeBinaryFromReader(message: LeasesRequest, reader: jspb.BinaryReader): LeasesRequest;
}

export namespace LeasesRequest {
  export type AsObject = {
    batchIdsList: Array<Uint8Array | string>,
    accountsList: Array<Uint8Array | string>,
  }
}

export class LeasesResponse extends jspb.Message {
  clearLeasesList(): void;
  getLeasesList(): Array<Lease>;
  setLeasesList(value: Array<Lease>): void;
  addLeases(value?: Lease, index?: number): Lease;

  getTotalAmtEarnedSat(): number;
  setTotalAmtEarnedSat(value: number): void;

  getTotalAmtPaidSat(): number;
  setTotalAmtPaidSat(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LeasesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: LeasesResponse): LeasesResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LeasesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LeasesResponse;
  static deserializeBinaryFromReader(message: LeasesResponse, reader: jspb.BinaryReader): LeasesResponse;
}

export namespace LeasesResponse {
  export type AsObject = {
    leasesList: Array<Lease.AsObject>,
    totalAmtEarnedSat: number,
    totalAmtPaidSat: number,
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

export class LeaseDurationRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LeaseDurationRequest.AsObject;
  static toObject(includeInstance: boolean, msg: LeaseDurationRequest): LeaseDurationRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LeaseDurationRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LeaseDurationRequest;
  static deserializeBinaryFromReader(message: LeaseDurationRequest, reader: jspb.BinaryReader): LeaseDurationRequest;
}

export namespace LeaseDurationRequest {
  export type AsObject = {
  }
}

export class LeaseDurationResponse extends jspb.Message {
  getLeaseDurationsMap(): jspb.Map<number, boolean>;
  clearLeaseDurationsMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LeaseDurationResponse.AsObject;
  static toObject(includeInstance: boolean, msg: LeaseDurationResponse): LeaseDurationResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LeaseDurationResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LeaseDurationResponse;
  static deserializeBinaryFromReader(message: LeaseDurationResponse, reader: jspb.BinaryReader): LeaseDurationResponse;
}

export namespace LeaseDurationResponse {
  export type AsObject = {
    leaseDurationsMap: Array<[number, boolean]>,
  }
}

export class NextBatchInfoRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NextBatchInfoRequest.AsObject;
  static toObject(includeInstance: boolean, msg: NextBatchInfoRequest): NextBatchInfoRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NextBatchInfoRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NextBatchInfoRequest;
  static deserializeBinaryFromReader(message: NextBatchInfoRequest, reader: jspb.BinaryReader): NextBatchInfoRequest;
}

export namespace NextBatchInfoRequest {
  export type AsObject = {
  }
}

export class NextBatchInfoResponse extends jspb.Message {
  getConfTarget(): number;
  setConfTarget(value: number): void;

  getFeeRateSatPerKw(): number;
  setFeeRateSatPerKw(value: number): void;

  getClearTimestamp(): number;
  setClearTimestamp(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NextBatchInfoResponse.AsObject;
  static toObject(includeInstance: boolean, msg: NextBatchInfoResponse): NextBatchInfoResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NextBatchInfoResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NextBatchInfoResponse;
  static deserializeBinaryFromReader(message: NextBatchInfoResponse, reader: jspb.BinaryReader): NextBatchInfoResponse;
}

export namespace NextBatchInfoResponse {
  export type AsObject = {
    confTarget: number,
    feeRateSatPerKw: number,
    clearTimestamp: number,
  }
}

export class NodeRatingRequest extends jspb.Message {
  clearNodePubkeysList(): void;
  getNodePubkeysList(): Array<Uint8Array | string>;
  getNodePubkeysList_asU8(): Array<Uint8Array>;
  getNodePubkeysList_asB64(): Array<string>;
  setNodePubkeysList(value: Array<Uint8Array | string>): void;
  addNodePubkeys(value: Uint8Array | string, index?: number): Uint8Array | string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NodeRatingRequest.AsObject;
  static toObject(includeInstance: boolean, msg: NodeRatingRequest): NodeRatingRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NodeRatingRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NodeRatingRequest;
  static deserializeBinaryFromReader(message: NodeRatingRequest, reader: jspb.BinaryReader): NodeRatingRequest;
}

export namespace NodeRatingRequest {
  export type AsObject = {
    nodePubkeysList: Array<Uint8Array | string>,
  }
}

export class NodeRatingResponse extends jspb.Message {
  clearNodeRatingsList(): void;
  getNodeRatingsList(): Array<auctioneer_pb.NodeRating>;
  setNodeRatingsList(value: Array<auctioneer_pb.NodeRating>): void;
  addNodeRatings(value?: auctioneer_pb.NodeRating, index?: number): auctioneer_pb.NodeRating;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NodeRatingResponse.AsObject;
  static toObject(includeInstance: boolean, msg: NodeRatingResponse): NodeRatingResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NodeRatingResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NodeRatingResponse;
  static deserializeBinaryFromReader(message: NodeRatingResponse, reader: jspb.BinaryReader): NodeRatingResponse;
}

export namespace NodeRatingResponse {
  export type AsObject = {
    nodeRatingsList: Array<auctioneer_pb.NodeRating.AsObject>,
  }
}

export interface AccountStateMap {
  PENDING_OPEN: 0;
  PENDING_UPDATE: 1;
  OPEN: 2;
  EXPIRED: 3;
  PENDING_CLOSED: 4;
  CLOSED: 5;
  RECOVERY_FAILED: 6;
  PENDING_BATCH: 7;
}

export const AccountState: AccountStateMap;

export interface MatchStateMap {
  PREPARE: 0;
  ACCEPTED: 1;
  REJECTED: 2;
  SIGNED: 3;
  FINALIZED: 4;
}

export const MatchState: MatchStateMap;

export interface MatchRejectReasonMap {
  NONE: 0;
  SERVER_MISBEHAVIOR: 1;
  BATCH_VERSION_MISMATCH: 2;
  PARTIAL_REJECT_COLLATERAL: 3;
  PARTIAL_REJECT_DUPLICATE_PEER: 4;
  PARTIAL_REJECT_CHANNEL_FUNDING_FAILED: 5;
}

export const MatchRejectReason: MatchRejectReasonMap;

