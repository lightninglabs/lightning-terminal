// package: litrpc
// file: lit-accounts.proto

import * as jspb from "google-protobuf";

export class CreateAccountRequest extends jspb.Message {
  getAccountBalance(): string;
  setAccountBalance(value: string): void;

  getExpirationDate(): string;
  setExpirationDate(value: string): void;

  getLabel(): string;
  setLabel(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateAccountRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateAccountRequest): CreateAccountRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CreateAccountRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateAccountRequest;
  static deserializeBinaryFromReader(message: CreateAccountRequest, reader: jspb.BinaryReader): CreateAccountRequest;
}

export namespace CreateAccountRequest {
  export type AsObject = {
    accountBalance: string,
    expirationDate: string,
    label: string,
  }
}

export class CreateAccountResponse extends jspb.Message {
  hasAccount(): boolean;
  clearAccount(): void;
  getAccount(): Account | undefined;
  setAccount(value?: Account): void;

  getMacaroon(): Uint8Array | string;
  getMacaroon_asU8(): Uint8Array;
  getMacaroon_asB64(): string;
  setMacaroon(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateAccountResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CreateAccountResponse): CreateAccountResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CreateAccountResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateAccountResponse;
  static deserializeBinaryFromReader(message: CreateAccountResponse, reader: jspb.BinaryReader): CreateAccountResponse;
}

export namespace CreateAccountResponse {
  export type AsObject = {
    account?: Account.AsObject,
    macaroon: Uint8Array | string,
  }
}

export class Account extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getInitialBalance(): string;
  setInitialBalance(value: string): void;

  getCurrentBalance(): string;
  setCurrentBalance(value: string): void;

  getLastUpdate(): string;
  setLastUpdate(value: string): void;

  getExpirationDate(): string;
  setExpirationDate(value: string): void;

  clearInvoicesList(): void;
  getInvoicesList(): Array<AccountInvoice>;
  setInvoicesList(value: Array<AccountInvoice>): void;
  addInvoices(value?: AccountInvoice, index?: number): AccountInvoice;

  clearPaymentsList(): void;
  getPaymentsList(): Array<AccountPayment>;
  setPaymentsList(value: Array<AccountPayment>): void;
  addPayments(value?: AccountPayment, index?: number): AccountPayment;

  getLabel(): string;
  setLabel(value: string): void;

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
    id: string,
    initialBalance: string,
    currentBalance: string,
    lastUpdate: string,
    expirationDate: string,
    invoicesList: Array<AccountInvoice.AsObject>,
    paymentsList: Array<AccountPayment.AsObject>,
    label: string,
  }
}

export class AccountInvoice extends jspb.Message {
  getHash(): Uint8Array | string;
  getHash_asU8(): Uint8Array;
  getHash_asB64(): string;
  setHash(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountInvoice.AsObject;
  static toObject(includeInstance: boolean, msg: AccountInvoice): AccountInvoice.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountInvoice, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountInvoice;
  static deserializeBinaryFromReader(message: AccountInvoice, reader: jspb.BinaryReader): AccountInvoice;
}

export namespace AccountInvoice {
  export type AsObject = {
    hash: Uint8Array | string,
  }
}

export class AccountPayment extends jspb.Message {
  getHash(): Uint8Array | string;
  getHash_asU8(): Uint8Array;
  getHash_asB64(): string;
  setHash(value: Uint8Array | string): void;

  getState(): string;
  setState(value: string): void;

  getFullAmount(): string;
  setFullAmount(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountPayment.AsObject;
  static toObject(includeInstance: boolean, msg: AccountPayment): AccountPayment.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountPayment, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountPayment;
  static deserializeBinaryFromReader(message: AccountPayment, reader: jspb.BinaryReader): AccountPayment;
}

export namespace AccountPayment {
  export type AsObject = {
    hash: Uint8Array | string,
    state: string,
    fullAmount: string,
  }
}

export class UpdateAccountRequest extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getAccountBalance(): string;
  setAccountBalance(value: string): void;

  getExpirationDate(): string;
  setExpirationDate(value: string): void;

  getLabel(): string;
  setLabel(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateAccountRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateAccountRequest): UpdateAccountRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UpdateAccountRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateAccountRequest;
  static deserializeBinaryFromReader(message: UpdateAccountRequest, reader: jspb.BinaryReader): UpdateAccountRequest;
}

export namespace UpdateAccountRequest {
  export type AsObject = {
    id: string,
    accountBalance: string,
    expirationDate: string,
    label: string,
  }
}

export class ListAccountsRequest extends jspb.Message {
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

export class AccountInfoRequest extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getLabel(): string;
  setLabel(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountInfoRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AccountInfoRequest): AccountInfoRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountInfoRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountInfoRequest;
  static deserializeBinaryFromReader(message: AccountInfoRequest, reader: jspb.BinaryReader): AccountInfoRequest;
}

export namespace AccountInfoRequest {
  export type AsObject = {
    id: string,
    label: string,
  }
}

export class RemoveAccountRequest extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getLabel(): string;
  setLabel(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RemoveAccountRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RemoveAccountRequest): RemoveAccountRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RemoveAccountRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RemoveAccountRequest;
  static deserializeBinaryFromReader(message: RemoveAccountRequest, reader: jspb.BinaryReader): RemoveAccountRequest;
}

export namespace RemoveAccountRequest {
  export type AsObject = {
    id: string,
    label: string,
  }
}

export class RemoveAccountResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RemoveAccountResponse.AsObject;
  static toObject(includeInstance: boolean, msg: RemoveAccountResponse): RemoveAccountResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RemoveAccountResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RemoveAccountResponse;
  static deserializeBinaryFromReader(message: RemoveAccountResponse, reader: jspb.BinaryReader): RemoveAccountResponse;
}

export namespace RemoveAccountResponse {
  export type AsObject = {
  }
}

