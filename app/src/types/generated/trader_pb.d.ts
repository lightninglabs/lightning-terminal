// package: poolrpc
// file: trader.proto

import * as jspb from "google-protobuf";
import * as auctioneerrpc_auctioneer_pb from "./auctioneerrpc/auctioneer_pb";

export class InitAccountRequest extends jspb.Message {
  getAccountValue(): string;
  setAccountValue(value: string): void;

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

  hasFeeRateSatPerKw(): boolean;
  clearFeeRateSatPerKw(): void;
  getFeeRateSatPerKw(): string;
  setFeeRateSatPerKw(value: string): void;

  getInitiator(): string;
  setInitiator(value: string): void;

  getVersion(): AccountVersionMap[keyof AccountVersionMap];
  setVersion(value: AccountVersionMap[keyof AccountVersionMap]): void;

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
    accountValue: string,
    absoluteHeight: number,
    relativeHeight: number,
    confTarget: number,
    feeRateSatPerKw: string,
    initiator: string,
    version: AccountVersionMap[keyof AccountVersionMap],
  }

  export enum AccountExpiryCase {
    ACCOUNT_EXPIRY_NOT_SET = 0,
    ABSOLUTE_HEIGHT = 2,
    RELATIVE_HEIGHT = 3,
  }

  export enum FeesCase {
    FEES_NOT_SET = 0,
    CONF_TARGET = 4,
    FEE_RATE_SAT_PER_KW = 6,
  }
}

export class QuoteAccountRequest extends jspb.Message {
  getAccountValue(): string;
  setAccountValue(value: string): void;

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
    accountValue: string,
    confTarget: number,
  }

  export enum FeesCase {
    FEES_NOT_SET = 0,
    CONF_TARGET = 2,
  }
}

export class QuoteAccountResponse extends jspb.Message {
  getMinerFeeRateSatPerKw(): string;
  setMinerFeeRateSatPerKw(value: string): void;

  getMinerFeeTotal(): string;
  setMinerFeeTotal(value: string): void;

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
    minerFeeRateSatPerKw: string,
    minerFeeTotal: string,
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
  getValueSat(): string;
  setValueSat(value: string): void;

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
    valueSat: string,
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
  getFeeRateSatPerKw(): string;
  setFeeRateSatPerKw(value: string): void;

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
    feeRateSatPerKw: string,
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

  getFeeRateSatPerKw(): string;
  setFeeRateSatPerKw(value: string): void;

  hasAbsoluteExpiry(): boolean;
  clearAbsoluteExpiry(): void;
  getAbsoluteExpiry(): number;
  setAbsoluteExpiry(value: number): void;

  hasRelativeExpiry(): boolean;
  clearRelativeExpiry(): void;
  getRelativeExpiry(): number;
  setRelativeExpiry(value: number): void;

  getNewVersion(): AccountVersionMap[keyof AccountVersionMap];
  setNewVersion(value: AccountVersionMap[keyof AccountVersionMap]): void;

  getAccountExpiryCase(): WithdrawAccountRequest.AccountExpiryCase;
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
    feeRateSatPerKw: string,
    absoluteExpiry: number,
    relativeExpiry: number,
    newVersion: AccountVersionMap[keyof AccountVersionMap],
  }

  export enum AccountExpiryCase {
    ACCOUNT_EXPIRY_NOT_SET = 0,
    ABSOLUTE_EXPIRY = 4,
    RELATIVE_EXPIRY = 5,
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

  getAmountSat(): string;
  setAmountSat(value: string): void;

  getFeeRateSatPerKw(): string;
  setFeeRateSatPerKw(value: string): void;

  hasAbsoluteExpiry(): boolean;
  clearAbsoluteExpiry(): void;
  getAbsoluteExpiry(): number;
  setAbsoluteExpiry(value: number): void;

  hasRelativeExpiry(): boolean;
  clearRelativeExpiry(): void;
  getRelativeExpiry(): number;
  setRelativeExpiry(value: number): void;

  getNewVersion(): AccountVersionMap[keyof AccountVersionMap];
  setNewVersion(value: AccountVersionMap[keyof AccountVersionMap]): void;

  getAccountExpiryCase(): DepositAccountRequest.AccountExpiryCase;
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
    amountSat: string,
    feeRateSatPerKw: string,
    absoluteExpiry: number,
    relativeExpiry: number,
    newVersion: AccountVersionMap[keyof AccountVersionMap],
  }

  export enum AccountExpiryCase {
    ACCOUNT_EXPIRY_NOT_SET = 0,
    ABSOLUTE_EXPIRY = 4,
    RELATIVE_EXPIRY = 5,
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

export class RenewAccountRequest extends jspb.Message {
  getAccountKey(): Uint8Array | string;
  getAccountKey_asU8(): Uint8Array;
  getAccountKey_asB64(): string;
  setAccountKey(value: Uint8Array | string): void;

  hasAbsoluteExpiry(): boolean;
  clearAbsoluteExpiry(): void;
  getAbsoluteExpiry(): number;
  setAbsoluteExpiry(value: number): void;

  hasRelativeExpiry(): boolean;
  clearRelativeExpiry(): void;
  getRelativeExpiry(): number;
  setRelativeExpiry(value: number): void;

  getFeeRateSatPerKw(): string;
  setFeeRateSatPerKw(value: string): void;

  getNewVersion(): AccountVersionMap[keyof AccountVersionMap];
  setNewVersion(value: AccountVersionMap[keyof AccountVersionMap]): void;

  getAccountExpiryCase(): RenewAccountRequest.AccountExpiryCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RenewAccountRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RenewAccountRequest): RenewAccountRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RenewAccountRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RenewAccountRequest;
  static deserializeBinaryFromReader(message: RenewAccountRequest, reader: jspb.BinaryReader): RenewAccountRequest;
}

export namespace RenewAccountRequest {
  export type AsObject = {
    accountKey: Uint8Array | string,
    absoluteExpiry: number,
    relativeExpiry: number,
    feeRateSatPerKw: string,
    newVersion: AccountVersionMap[keyof AccountVersionMap],
  }

  export enum AccountExpiryCase {
    ACCOUNT_EXPIRY_NOT_SET = 0,
    ABSOLUTE_EXPIRY = 2,
    RELATIVE_EXPIRY = 3,
  }
}

export class RenewAccountResponse extends jspb.Message {
  hasAccount(): boolean;
  clearAccount(): void;
  getAccount(): Account | undefined;
  setAccount(value?: Account): void;

  getRenewalTxid(): Uint8Array | string;
  getRenewalTxid_asU8(): Uint8Array;
  getRenewalTxid_asB64(): string;
  setRenewalTxid(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RenewAccountResponse.AsObject;
  static toObject(includeInstance: boolean, msg: RenewAccountResponse): RenewAccountResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RenewAccountResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RenewAccountResponse;
  static deserializeBinaryFromReader(message: RenewAccountResponse, reader: jspb.BinaryReader): RenewAccountResponse;
}

export namespace RenewAccountResponse {
  export type AsObject = {
    account?: Account.AsObject,
    renewalTxid: Uint8Array | string,
  }
}

export class BumpAccountFeeRequest extends jspb.Message {
  getTraderKey(): Uint8Array | string;
  getTraderKey_asU8(): Uint8Array;
  getTraderKey_asB64(): string;
  setTraderKey(value: Uint8Array | string): void;

  getFeeRateSatPerKw(): string;
  setFeeRateSatPerKw(value: string): void;

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
    feeRateSatPerKw: string,
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
  getOutpoint(): auctioneerrpc_auctioneer_pb.OutPoint | undefined;
  setOutpoint(value?: auctioneerrpc_auctioneer_pb.OutPoint): void;

  getValue(): string;
  setValue(value: string): void;

  getAvailableBalance(): string;
  setAvailableBalance(value: string): void;

  getExpirationHeight(): number;
  setExpirationHeight(value: number): void;

  getState(): AccountStateMap[keyof AccountStateMap];
  setState(value: AccountStateMap[keyof AccountStateMap]): void;

  getLatestTxid(): Uint8Array | string;
  getLatestTxid_asU8(): Uint8Array;
  getLatestTxid_asB64(): string;
  setLatestTxid(value: Uint8Array | string): void;

  getVersion(): AccountVersionMap[keyof AccountVersionMap];
  setVersion(value: AccountVersionMap[keyof AccountVersionMap]): void;

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
    outpoint?: auctioneerrpc_auctioneer_pb.OutPoint.AsObject,
    value: string,
    availableBalance: string,
    expirationHeight: number,
    state: AccountStateMap[keyof AccountStateMap],
    latestTxid: Uint8Array | string,
    version: AccountVersionMap[keyof AccountVersionMap],
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

  getInitiator(): string;
  setInitiator(value: string): void;

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
    initiator: string,
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
  getInvalidOrder(): auctioneerrpc_auctioneer_pb.InvalidOrder | undefined;
  setInvalidOrder(value?: auctioneerrpc_auctioneer_pb.InvalidOrder): void;

  hasAcceptedOrderNonce(): boolean;
  clearAcceptedOrderNonce(): void;
  getAcceptedOrderNonce(): Uint8Array | string;
  getAcceptedOrderNonce_asU8(): Uint8Array;
  getAcceptedOrderNonce_asB64(): string;
  setAcceptedOrderNonce(value: Uint8Array | string): void;

  getUpdatedSidecarTicket(): string;
  setUpdatedSidecarTicket(value: string): void;

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
    invalidOrder?: auctioneerrpc_auctioneer_pb.InvalidOrder.AsObject,
    acceptedOrderNonce: Uint8Array | string,
    updatedSidecarTicket: string,
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

  getAmt(): string;
  setAmt(value: string): void;

  getMaxBatchFeeRateSatPerKw(): string;
  setMaxBatchFeeRateSatPerKw(value: string): void;

  getOrderNonce(): Uint8Array | string;
  getOrderNonce_asU8(): Uint8Array;
  getOrderNonce_asB64(): string;
  setOrderNonce(value: Uint8Array | string): void;

  getState(): auctioneerrpc_auctioneer_pb.OrderStateMap[keyof auctioneerrpc_auctioneer_pb.OrderStateMap];
  setState(value: auctioneerrpc_auctioneer_pb.OrderStateMap[keyof auctioneerrpc_auctioneer_pb.OrderStateMap]): void;

  getUnits(): number;
  setUnits(value: number): void;

  getUnitsUnfulfilled(): number;
  setUnitsUnfulfilled(value: number): void;

  getReservedValueSat(): string;
  setReservedValueSat(value: string): void;

  getCreationTimestampNs(): string;
  setCreationTimestampNs(value: string): void;

  clearEventsList(): void;
  getEventsList(): Array<OrderEvent>;
  setEventsList(value: Array<OrderEvent>): void;
  addEvents(value?: OrderEvent, index?: number): OrderEvent;

  getMinUnitsMatch(): number;
  setMinUnitsMatch(value: number): void;

  getChannelType(): auctioneerrpc_auctioneer_pb.OrderChannelTypeMap[keyof auctioneerrpc_auctioneer_pb.OrderChannelTypeMap];
  setChannelType(value: auctioneerrpc_auctioneer_pb.OrderChannelTypeMap[keyof auctioneerrpc_auctioneer_pb.OrderChannelTypeMap]): void;

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

  getAuctionType(): auctioneerrpc_auctioneer_pb.AuctionTypeMap[keyof auctioneerrpc_auctioneer_pb.AuctionTypeMap];
  setAuctionType(value: auctioneerrpc_auctioneer_pb.AuctionTypeMap[keyof auctioneerrpc_auctioneer_pb.AuctionTypeMap]): void;

  getIsPublic(): boolean;
  setIsPublic(value: boolean): void;

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
    amt: string,
    maxBatchFeeRateSatPerKw: string,
    orderNonce: Uint8Array | string,
    state: auctioneerrpc_auctioneer_pb.OrderStateMap[keyof auctioneerrpc_auctioneer_pb.OrderStateMap],
    units: number,
    unitsUnfulfilled: number,
    reservedValueSat: string,
    creationTimestampNs: string,
    eventsList: Array<OrderEvent.AsObject>,
    minUnitsMatch: number,
    channelType: auctioneerrpc_auctioneer_pb.OrderChannelTypeMap[keyof auctioneerrpc_auctioneer_pb.OrderChannelTypeMap],
    allowedNodeIdsList: Array<Uint8Array | string>,
    notAllowedNodeIdsList: Array<Uint8Array | string>,
    auctionType: auctioneerrpc_auctioneer_pb.AuctionTypeMap[keyof auctioneerrpc_auctioneer_pb.AuctionTypeMap],
    isPublic: boolean,
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

  getMinNodeTier(): auctioneerrpc_auctioneer_pb.NodeTierMap[keyof auctioneerrpc_auctioneer_pb.NodeTierMap];
  setMinNodeTier(value: auctioneerrpc_auctioneer_pb.NodeTierMap[keyof auctioneerrpc_auctioneer_pb.NodeTierMap]): void;

  getSelfChanBalance(): string;
  setSelfChanBalance(value: string): void;

  getSidecarTicket(): string;
  setSidecarTicket(value: string): void;

  getUnannouncedChannel(): boolean;
  setUnannouncedChannel(value: boolean): void;

  getZeroConfChannel(): boolean;
  setZeroConfChannel(value: boolean): void;

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
    minNodeTier: auctioneerrpc_auctioneer_pb.NodeTierMap[keyof auctioneerrpc_auctioneer_pb.NodeTierMap],
    selfChanBalance: string,
    sidecarTicket: string,
    unannouncedChannel: boolean,
    zeroConfChannel: boolean,
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

  getAnnouncementConstraints(): auctioneerrpc_auctioneer_pb.ChannelAnnouncementConstraintsMap[keyof auctioneerrpc_auctioneer_pb.ChannelAnnouncementConstraintsMap];
  setAnnouncementConstraints(value: auctioneerrpc_auctioneer_pb.ChannelAnnouncementConstraintsMap[keyof auctioneerrpc_auctioneer_pb.ChannelAnnouncementConstraintsMap]): void;

  getConfirmationConstraints(): auctioneerrpc_auctioneer_pb.ChannelConfirmationConstraintsMap[keyof auctioneerrpc_auctioneer_pb.ChannelConfirmationConstraintsMap];
  setConfirmationConstraints(value: auctioneerrpc_auctioneer_pb.ChannelConfirmationConstraintsMap[keyof auctioneerrpc_auctioneer_pb.ChannelConfirmationConstraintsMap]): void;

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
    announcementConstraints: auctioneerrpc_auctioneer_pb.ChannelAnnouncementConstraintsMap[keyof auctioneerrpc_auctioneer_pb.ChannelAnnouncementConstraintsMap],
    confirmationConstraints: auctioneerrpc_auctioneer_pb.ChannelConfirmationConstraintsMap[keyof auctioneerrpc_auctioneer_pb.ChannelConfirmationConstraintsMap],
  }
}

export class QuoteOrderRequest extends jspb.Message {
  getAmt(): string;
  setAmt(value: string): void;

  getRateFixed(): number;
  setRateFixed(value: number): void;

  getLeaseDurationBlocks(): number;
  setLeaseDurationBlocks(value: number): void;

  getMaxBatchFeeRateSatPerKw(): string;
  setMaxBatchFeeRateSatPerKw(value: string): void;

  getMinUnitsMatch(): number;
  setMinUnitsMatch(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): QuoteOrderRequest.AsObject;
  static toObject(includeInstance: boolean, msg: QuoteOrderRequest): QuoteOrderRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: QuoteOrderRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): QuoteOrderRequest;
  static deserializeBinaryFromReader(message: QuoteOrderRequest, reader: jspb.BinaryReader): QuoteOrderRequest;
}

export namespace QuoteOrderRequest {
  export type AsObject = {
    amt: string,
    rateFixed: number,
    leaseDurationBlocks: number,
    maxBatchFeeRateSatPerKw: string,
    minUnitsMatch: number,
  }
}

export class QuoteOrderResponse extends jspb.Message {
  getTotalPremiumSat(): string;
  setTotalPremiumSat(value: string): void;

  getRatePerBlock(): number;
  setRatePerBlock(value: number): void;

  getRatePercent(): number;
  setRatePercent(value: number): void;

  getTotalExecutionFeeSat(): string;
  setTotalExecutionFeeSat(value: string): void;

  getWorstCaseChainFeeSat(): string;
  setWorstCaseChainFeeSat(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): QuoteOrderResponse.AsObject;
  static toObject(includeInstance: boolean, msg: QuoteOrderResponse): QuoteOrderResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: QuoteOrderResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): QuoteOrderResponse;
  static deserializeBinaryFromReader(message: QuoteOrderResponse, reader: jspb.BinaryReader): QuoteOrderResponse;
}

export namespace QuoteOrderResponse {
  export type AsObject = {
    totalPremiumSat: string,
    ratePerBlock: number,
    ratePercent: number,
    totalExecutionFeeSat: string,
    worstCaseChainFeeSat: string,
  }
}

export class OrderEvent extends jspb.Message {
  getTimestampNs(): string;
  setTimestampNs(value: string): void;

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
    timestampNs: string,
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
  getPreviousState(): auctioneerrpc_auctioneer_pb.OrderStateMap[keyof auctioneerrpc_auctioneer_pb.OrderStateMap];
  setPreviousState(value: auctioneerrpc_auctioneer_pb.OrderStateMap[keyof auctioneerrpc_auctioneer_pb.OrderStateMap]): void;

  getNewState(): auctioneerrpc_auctioneer_pb.OrderStateMap[keyof auctioneerrpc_auctioneer_pb.OrderStateMap];
  setNewState(value: auctioneerrpc_auctioneer_pb.OrderStateMap[keyof auctioneerrpc_auctioneer_pb.OrderStateMap]): void;

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
    previousState: auctioneerrpc_auctioneer_pb.OrderStateMap[keyof auctioneerrpc_auctioneer_pb.OrderStateMap],
    newState: auctioneerrpc_auctioneer_pb.OrderStateMap[keyof auctioneerrpc_auctioneer_pb.OrderStateMap],
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
  getFullClient(): boolean;
  setFullClient(value: boolean): void;

  getAccountTarget(): number;
  setAccountTarget(value: number): void;

  getAuctioneerKey(): string;
  setAuctioneerKey(value: string): void;

  getHeightHint(): number;
  setHeightHint(value: number): void;

  getBitcoinHost(): string;
  setBitcoinHost(value: string): void;

  getBitcoinUser(): string;
  setBitcoinUser(value: string): void;

  getBitcoinPassword(): string;
  setBitcoinPassword(value: string): void;

  getBitcoinHttppostmode(): boolean;
  setBitcoinHttppostmode(value: boolean): void;

  getBitcoinUsetls(): boolean;
  setBitcoinUsetls(value: boolean): void;

  getBitcoinTlspath(): string;
  setBitcoinTlspath(value: string): void;

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
    fullClient: boolean,
    accountTarget: number,
    auctioneerKey: string,
    heightHint: number,
    bitcoinHost: string,
    bitcoinUser: string,
    bitcoinPassword: string,
    bitcoinHttppostmode: boolean,
    bitcoinUsetls: boolean,
    bitcoinTlspath: string,
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

export class AccountModificationFeesRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountModificationFeesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AccountModificationFeesRequest): AccountModificationFeesRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountModificationFeesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountModificationFeesRequest;
  static deserializeBinaryFromReader(message: AccountModificationFeesRequest, reader: jspb.BinaryReader): AccountModificationFeesRequest;
}

export namespace AccountModificationFeesRequest {
  export type AsObject = {
  }
}

export class AccountModificationFee extends jspb.Message {
  getAction(): string;
  setAction(value: string): void;

  getTxid(): string;
  setTxid(value: string): void;

  getBlockHeight(): number;
  setBlockHeight(value: number): void;

  getTimestamp(): string;
  setTimestamp(value: string): void;

  getOutputAmount(): string;
  setOutputAmount(value: string): void;

  hasFeeNull(): boolean;
  clearFeeNull(): void;
  getFeeNull(): boolean;
  setFeeNull(value: boolean): void;

  hasFeeValue(): boolean;
  clearFeeValue(): void;
  getFeeValue(): string;
  setFeeValue(value: string): void;

  getFeeCase(): AccountModificationFee.FeeCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountModificationFee.AsObject;
  static toObject(includeInstance: boolean, msg: AccountModificationFee): AccountModificationFee.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountModificationFee, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountModificationFee;
  static deserializeBinaryFromReader(message: AccountModificationFee, reader: jspb.BinaryReader): AccountModificationFee;
}

export namespace AccountModificationFee {
  export type AsObject = {
    action: string,
    txid: string,
    blockHeight: number,
    timestamp: string,
    outputAmount: string,
    feeNull: boolean,
    feeValue: string,
  }

  export enum FeeCase {
    FEE_NOT_SET = 0,
    FEE_NULL = 6,
    FEE_VALUE = 7,
  }
}

export class ListOfAccountModificationFees extends jspb.Message {
  clearModificationFeesList(): void;
  getModificationFeesList(): Array<AccountModificationFee>;
  setModificationFeesList(value: Array<AccountModificationFee>): void;
  addModificationFees(value?: AccountModificationFee, index?: number): AccountModificationFee;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListOfAccountModificationFees.AsObject;
  static toObject(includeInstance: boolean, msg: ListOfAccountModificationFees): ListOfAccountModificationFees.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListOfAccountModificationFees, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListOfAccountModificationFees;
  static deserializeBinaryFromReader(message: ListOfAccountModificationFees, reader: jspb.BinaryReader): ListOfAccountModificationFees;
}

export namespace ListOfAccountModificationFees {
  export type AsObject = {
    modificationFeesList: Array<AccountModificationFee.AsObject>,
  }
}

export class AccountModificationFeesResponse extends jspb.Message {
  getAccountsMap(): jspb.Map<string, ListOfAccountModificationFees>;
  clearAccountsMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountModificationFeesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AccountModificationFeesResponse): AccountModificationFeesResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountModificationFeesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountModificationFeesResponse;
  static deserializeBinaryFromReader(message: AccountModificationFeesResponse, reader: jspb.BinaryReader): AccountModificationFeesResponse;
}

export namespace AccountModificationFeesResponse {
  export type AsObject = {
    accountsMap: Array<[string, ListOfAccountModificationFees.AsObject]>,
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
  getExecutionFee(): auctioneerrpc_auctioneer_pb.ExecutionFee | undefined;
  setExecutionFee(value?: auctioneerrpc_auctioneer_pb.ExecutionFee): void;

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
    executionFee?: auctioneerrpc_auctioneer_pb.ExecutionFee.AsObject,
  }
}

export class Lease extends jspb.Message {
  hasChannelPoint(): boolean;
  clearChannelPoint(): void;
  getChannelPoint(): auctioneerrpc_auctioneer_pb.OutPoint | undefined;
  setChannelPoint(value?: auctioneerrpc_auctioneer_pb.OutPoint): void;

  getChannelAmtSat(): string;
  setChannelAmtSat(value: string): void;

  getChannelDurationBlocks(): number;
  setChannelDurationBlocks(value: number): void;

  getChannelLeaseExpiry(): number;
  setChannelLeaseExpiry(value: number): void;

  getPremiumSat(): string;
  setPremiumSat(value: string): void;

  getExecutionFeeSat(): string;
  setExecutionFeeSat(value: string): void;

  getChainFeeSat(): string;
  setChainFeeSat(value: string): void;

  getClearingRatePrice(): string;
  setClearingRatePrice(value: string): void;

  getOrderFixedRate(): string;
  setOrderFixedRate(value: string): void;

  getOrderNonce(): Uint8Array | string;
  getOrderNonce_asU8(): Uint8Array;
  getOrderNonce_asB64(): string;
  setOrderNonce(value: Uint8Array | string): void;

  getMatchedOrderNonce(): Uint8Array | string;
  getMatchedOrderNonce_asU8(): Uint8Array;
  getMatchedOrderNonce_asB64(): string;
  setMatchedOrderNonce(value: Uint8Array | string): void;

  getPurchased(): boolean;
  setPurchased(value: boolean): void;

  getChannelRemoteNodeKey(): Uint8Array | string;
  getChannelRemoteNodeKey_asU8(): Uint8Array;
  getChannelRemoteNodeKey_asB64(): string;
  setChannelRemoteNodeKey(value: Uint8Array | string): void;

  getChannelNodeTier(): auctioneerrpc_auctioneer_pb.NodeTierMap[keyof auctioneerrpc_auctioneer_pb.NodeTierMap];
  setChannelNodeTier(value: auctioneerrpc_auctioneer_pb.NodeTierMap[keyof auctioneerrpc_auctioneer_pb.NodeTierMap]): void;

  getSelfChanBalance(): string;
  setSelfChanBalance(value: string): void;

  getSidecarChannel(): boolean;
  setSidecarChannel(value: boolean): void;

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
    channelPoint?: auctioneerrpc_auctioneer_pb.OutPoint.AsObject,
    channelAmtSat: string,
    channelDurationBlocks: number,
    channelLeaseExpiry: number,
    premiumSat: string,
    executionFeeSat: string,
    chainFeeSat: string,
    clearingRatePrice: string,
    orderFixedRate: string,
    orderNonce: Uint8Array | string,
    matchedOrderNonce: Uint8Array | string,
    purchased: boolean,
    channelRemoteNodeKey: Uint8Array | string,
    channelNodeTier: auctioneerrpc_auctioneer_pb.NodeTierMap[keyof auctioneerrpc_auctioneer_pb.NodeTierMap],
    selfChanBalance: string,
    sidecarChannel: boolean,
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

  getTotalAmtEarnedSat(): string;
  setTotalAmtEarnedSat(value: string): void;

  getTotalAmtPaidSat(): string;
  setTotalAmtPaidSat(value: string): void;

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
    totalAmtEarnedSat: string,
    totalAmtPaidSat: string,
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
  getLeaseDurationBucketsMap(): jspb.Map<number, auctioneerrpc_auctioneer_pb.DurationBucketState[keyof auctioneerrpc_auctioneer_pb.DurationBucketState]>;
  clearLeaseDurationBucketsMap(): void;
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
    leaseDurationBucketsMap: Array<[number, auctioneerrpc_auctioneer_pb.DurationBucketState[keyof auctioneerrpc_auctioneer_pb.DurationBucketState]]>,
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

  getFeeRateSatPerKw(): string;
  setFeeRateSatPerKw(value: string): void;

  getClearTimestamp(): string;
  setClearTimestamp(value: string): void;

  getAutoRenewExtensionBlocks(): number;
  setAutoRenewExtensionBlocks(value: number): void;

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
    feeRateSatPerKw: string,
    clearTimestamp: string,
    autoRenewExtensionBlocks: number,
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
  getNodeRatingsList(): Array<auctioneerrpc_auctioneer_pb.NodeRating>;
  setNodeRatingsList(value: Array<auctioneerrpc_auctioneer_pb.NodeRating>): void;
  addNodeRatings(value?: auctioneerrpc_auctioneer_pb.NodeRating, index?: number): auctioneerrpc_auctioneer_pb.NodeRating;

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
    nodeRatingsList: Array<auctioneerrpc_auctioneer_pb.NodeRating.AsObject>,
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

  getAccountsTotal(): number;
  setAccountsTotal(value: number): void;

  getAccountsActive(): number;
  setAccountsActive(value: number): void;

  getAccountsActiveExpired(): number;
  setAccountsActiveExpired(value: number): void;

  getAccountsArchived(): number;
  setAccountsArchived(value: number): void;

  getOrdersTotal(): number;
  setOrdersTotal(value: number): void;

  getOrdersActive(): number;
  setOrdersActive(value: number): void;

  getOrdersArchived(): number;
  setOrdersArchived(value: number): void;

  getCurrentBlockHeight(): number;
  setCurrentBlockHeight(value: number): void;

  getBatchesInvolved(): number;
  setBatchesInvolved(value: number): void;

  hasNodeRating(): boolean;
  clearNodeRating(): void;
  getNodeRating(): auctioneerrpc_auctioneer_pb.NodeRating | undefined;
  setNodeRating(value?: auctioneerrpc_auctioneer_pb.NodeRating): void;

  getLsatTokens(): number;
  setLsatTokens(value: number): void;

  getSubscribedToAuctioneer(): boolean;
  setSubscribedToAuctioneer(value: boolean): void;

  getNewNodesOnly(): boolean;
  setNewNodesOnly(value: boolean): void;

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
    accountsTotal: number,
    accountsActive: number,
    accountsActiveExpired: number,
    accountsArchived: number,
    ordersTotal: number,
    ordersActive: number,
    ordersArchived: number,
    currentBlockHeight: number,
    batchesInvolved: number,
    nodeRating?: auctioneerrpc_auctioneer_pb.NodeRating.AsObject,
    lsatTokens: number,
    subscribedToAuctioneer: boolean,
    newNodesOnly: boolean,
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

export class OfferSidecarRequest extends jspb.Message {
  getAutoNegotiate(): boolean;
  setAutoNegotiate(value: boolean): void;

  hasBid(): boolean;
  clearBid(): void;
  getBid(): Bid | undefined;
  setBid(value?: Bid): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OfferSidecarRequest.AsObject;
  static toObject(includeInstance: boolean, msg: OfferSidecarRequest): OfferSidecarRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OfferSidecarRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OfferSidecarRequest;
  static deserializeBinaryFromReader(message: OfferSidecarRequest, reader: jspb.BinaryReader): OfferSidecarRequest;
}

export namespace OfferSidecarRequest {
  export type AsObject = {
    autoNegotiate: boolean,
    bid?: Bid.AsObject,
  }
}

export class SidecarTicket extends jspb.Message {
  getTicket(): string;
  setTicket(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SidecarTicket.AsObject;
  static toObject(includeInstance: boolean, msg: SidecarTicket): SidecarTicket.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SidecarTicket, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SidecarTicket;
  static deserializeBinaryFromReader(message: SidecarTicket, reader: jspb.BinaryReader): SidecarTicket;
}

export namespace SidecarTicket {
  export type AsObject = {
    ticket: string,
  }
}

export class DecodedSidecarTicket extends jspb.Message {
  getId(): Uint8Array | string;
  getId_asU8(): Uint8Array;
  getId_asB64(): string;
  setId(value: Uint8Array | string): void;

  getVersion(): number;
  setVersion(value: number): void;

  getState(): string;
  setState(value: string): void;

  getOfferCapacity(): string;
  setOfferCapacity(value: string): void;

  getOfferPushAmount(): string;
  setOfferPushAmount(value: string): void;

  getOfferLeaseDurationBlocks(): number;
  setOfferLeaseDurationBlocks(value: number): void;

  getOfferSignPubkey(): Uint8Array | string;
  getOfferSignPubkey_asU8(): Uint8Array;
  getOfferSignPubkey_asB64(): string;
  setOfferSignPubkey(value: Uint8Array | string): void;

  getOfferSignature(): Uint8Array | string;
  getOfferSignature_asU8(): Uint8Array;
  getOfferSignature_asB64(): string;
  setOfferSignature(value: Uint8Array | string): void;

  getOfferAuto(): boolean;
  setOfferAuto(value: boolean): void;

  getRecipientNodePubkey(): Uint8Array | string;
  getRecipientNodePubkey_asU8(): Uint8Array;
  getRecipientNodePubkey_asB64(): string;
  setRecipientNodePubkey(value: Uint8Array | string): void;

  getRecipientMultisigPubkey(): Uint8Array | string;
  getRecipientMultisigPubkey_asU8(): Uint8Array;
  getRecipientMultisigPubkey_asB64(): string;
  setRecipientMultisigPubkey(value: Uint8Array | string): void;

  getRecipientMultisigPubkeyIndex(): number;
  setRecipientMultisigPubkeyIndex(value: number): void;

  getOrderBidNonce(): Uint8Array | string;
  getOrderBidNonce_asU8(): Uint8Array;
  getOrderBidNonce_asB64(): string;
  setOrderBidNonce(value: Uint8Array | string): void;

  getOrderSignature(): Uint8Array | string;
  getOrderSignature_asU8(): Uint8Array;
  getOrderSignature_asB64(): string;
  setOrderSignature(value: Uint8Array | string): void;

  getExecutionPendingChannelId(): Uint8Array | string;
  getExecutionPendingChannelId_asU8(): Uint8Array;
  getExecutionPendingChannelId_asB64(): string;
  setExecutionPendingChannelId(value: Uint8Array | string): void;

  getEncodedTicket(): string;
  setEncodedTicket(value: string): void;

  getOfferUnannouncedChannel(): boolean;
  setOfferUnannouncedChannel(value: boolean): void;

  getOfferZeroConfChannel(): boolean;
  setOfferZeroConfChannel(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DecodedSidecarTicket.AsObject;
  static toObject(includeInstance: boolean, msg: DecodedSidecarTicket): DecodedSidecarTicket.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DecodedSidecarTicket, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DecodedSidecarTicket;
  static deserializeBinaryFromReader(message: DecodedSidecarTicket, reader: jspb.BinaryReader): DecodedSidecarTicket;
}

export namespace DecodedSidecarTicket {
  export type AsObject = {
    id: Uint8Array | string,
    version: number,
    state: string,
    offerCapacity: string,
    offerPushAmount: string,
    offerLeaseDurationBlocks: number,
    offerSignPubkey: Uint8Array | string,
    offerSignature: Uint8Array | string,
    offerAuto: boolean,
    recipientNodePubkey: Uint8Array | string,
    recipientMultisigPubkey: Uint8Array | string,
    recipientMultisigPubkeyIndex: number,
    orderBidNonce: Uint8Array | string,
    orderSignature: Uint8Array | string,
    executionPendingChannelId: Uint8Array | string,
    encodedTicket: string,
    offerUnannouncedChannel: boolean,
    offerZeroConfChannel: boolean,
  }
}

export class RegisterSidecarRequest extends jspb.Message {
  getTicket(): string;
  setTicket(value: string): void;

  getAutoNegotiate(): boolean;
  setAutoNegotiate(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RegisterSidecarRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RegisterSidecarRequest): RegisterSidecarRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RegisterSidecarRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RegisterSidecarRequest;
  static deserializeBinaryFromReader(message: RegisterSidecarRequest, reader: jspb.BinaryReader): RegisterSidecarRequest;
}

export namespace RegisterSidecarRequest {
  export type AsObject = {
    ticket: string,
    autoNegotiate: boolean,
  }
}

export class ExpectSidecarChannelRequest extends jspb.Message {
  getTicket(): string;
  setTicket(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExpectSidecarChannelRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ExpectSidecarChannelRequest): ExpectSidecarChannelRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExpectSidecarChannelRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExpectSidecarChannelRequest;
  static deserializeBinaryFromReader(message: ExpectSidecarChannelRequest, reader: jspb.BinaryReader): ExpectSidecarChannelRequest;
}

export namespace ExpectSidecarChannelRequest {
  export type AsObject = {
    ticket: string,
  }
}

export class ExpectSidecarChannelResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExpectSidecarChannelResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ExpectSidecarChannelResponse): ExpectSidecarChannelResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExpectSidecarChannelResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExpectSidecarChannelResponse;
  static deserializeBinaryFromReader(message: ExpectSidecarChannelResponse, reader: jspb.BinaryReader): ExpectSidecarChannelResponse;
}

export namespace ExpectSidecarChannelResponse {
  export type AsObject = {
  }
}

export class ListSidecarsRequest extends jspb.Message {
  getSidecarId(): Uint8Array | string;
  getSidecarId_asU8(): Uint8Array;
  getSidecarId_asB64(): string;
  setSidecarId(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListSidecarsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListSidecarsRequest): ListSidecarsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListSidecarsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListSidecarsRequest;
  static deserializeBinaryFromReader(message: ListSidecarsRequest, reader: jspb.BinaryReader): ListSidecarsRequest;
}

export namespace ListSidecarsRequest {
  export type AsObject = {
    sidecarId: Uint8Array | string,
  }
}

export class ListSidecarsResponse extends jspb.Message {
  clearTicketsList(): void;
  getTicketsList(): Array<DecodedSidecarTicket>;
  setTicketsList(value: Array<DecodedSidecarTicket>): void;
  addTickets(value?: DecodedSidecarTicket, index?: number): DecodedSidecarTicket;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListSidecarsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListSidecarsResponse): ListSidecarsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListSidecarsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListSidecarsResponse;
  static deserializeBinaryFromReader(message: ListSidecarsResponse, reader: jspb.BinaryReader): ListSidecarsResponse;
}

export namespace ListSidecarsResponse {
  export type AsObject = {
    ticketsList: Array<DecodedSidecarTicket.AsObject>,
  }
}

export class CancelSidecarRequest extends jspb.Message {
  getSidecarId(): Uint8Array | string;
  getSidecarId_asU8(): Uint8Array;
  getSidecarId_asB64(): string;
  setSidecarId(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CancelSidecarRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CancelSidecarRequest): CancelSidecarRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CancelSidecarRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CancelSidecarRequest;
  static deserializeBinaryFromReader(message: CancelSidecarRequest, reader: jspb.BinaryReader): CancelSidecarRequest;
}

export namespace CancelSidecarRequest {
  export type AsObject = {
    sidecarId: Uint8Array | string,
  }
}

export class CancelSidecarResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CancelSidecarResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CancelSidecarResponse): CancelSidecarResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CancelSidecarResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CancelSidecarResponse;
  static deserializeBinaryFromReader(message: CancelSidecarResponse, reader: jspb.BinaryReader): CancelSidecarResponse;
}

export namespace CancelSidecarResponse {
  export type AsObject = {
  }
}

export interface AccountVersionMap {
  ACCOUNT_VERSION_LND_DEPENDENT: 0;
  ACCOUNT_VERSION_LEGACY: 1;
  ACCOUNT_VERSION_TAPROOT: 2;
  ACCOUNT_VERSION_TAPROOT_V2: 3;
}

export const AccountVersion: AccountVersionMap;

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

