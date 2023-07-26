// package: litrpc
// file: lit-accounts.proto

import * as lit_accounts_pb from "./lit-accounts_pb";
import {grpc} from "@improbable-eng/grpc-web";

type AccountsCreateAccount = {
  readonly methodName: string;
  readonly service: typeof Accounts;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lit_accounts_pb.CreateAccountRequest;
  readonly responseType: typeof lit_accounts_pb.CreateAccountResponse;
};

type AccountsUpdateAccount = {
  readonly methodName: string;
  readonly service: typeof Accounts;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lit_accounts_pb.UpdateAccountRequest;
  readonly responseType: typeof lit_accounts_pb.Account;
};

type AccountsListAccounts = {
  readonly methodName: string;
  readonly service: typeof Accounts;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lit_accounts_pb.ListAccountsRequest;
  readonly responseType: typeof lit_accounts_pb.ListAccountsResponse;
};

type AccountsAccountInfo = {
  readonly methodName: string;
  readonly service: typeof Accounts;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lit_accounts_pb.AccountInfoRequest;
  readonly responseType: typeof lit_accounts_pb.Account;
};

type AccountsRemoveAccount = {
  readonly methodName: string;
  readonly service: typeof Accounts;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof lit_accounts_pb.RemoveAccountRequest;
  readonly responseType: typeof lit_accounts_pb.RemoveAccountResponse;
};

export class Accounts {
  static readonly serviceName: string;
  static readonly CreateAccount: AccountsCreateAccount;
  static readonly UpdateAccount: AccountsUpdateAccount;
  static readonly ListAccounts: AccountsListAccounts;
  static readonly AccountInfo: AccountsAccountInfo;
  static readonly RemoveAccount: AccountsRemoveAccount;
}

export type ServiceError = { message: string, code: number; metadata: grpc.Metadata }
export type Status = { details: string, code: number; metadata: grpc.Metadata }

interface UnaryResponse {
  cancel(): void;
}
interface ResponseStream<T> {
  cancel(): void;
  on(type: 'data', handler: (message: T) => void): ResponseStream<T>;
  on(type: 'end', handler: (status?: Status) => void): ResponseStream<T>;
  on(type: 'status', handler: (status: Status) => void): ResponseStream<T>;
}
interface RequestStream<T> {
  write(message: T): RequestStream<T>;
  end(): void;
  cancel(): void;
  on(type: 'end', handler: (status?: Status) => void): RequestStream<T>;
  on(type: 'status', handler: (status: Status) => void): RequestStream<T>;
}
interface BidirectionalStream<ReqT, ResT> {
  write(message: ReqT): BidirectionalStream<ReqT, ResT>;
  end(): void;
  cancel(): void;
  on(type: 'data', handler: (message: ResT) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'end', handler: (status?: Status) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'status', handler: (status: Status) => void): BidirectionalStream<ReqT, ResT>;
}

export class AccountsClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  createAccount(
    requestMessage: lit_accounts_pb.CreateAccountRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lit_accounts_pb.CreateAccountResponse|null) => void
  ): UnaryResponse;
  createAccount(
    requestMessage: lit_accounts_pb.CreateAccountRequest,
    callback: (error: ServiceError|null, responseMessage: lit_accounts_pb.CreateAccountResponse|null) => void
  ): UnaryResponse;
  updateAccount(
    requestMessage: lit_accounts_pb.UpdateAccountRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lit_accounts_pb.Account|null) => void
  ): UnaryResponse;
  updateAccount(
    requestMessage: lit_accounts_pb.UpdateAccountRequest,
    callback: (error: ServiceError|null, responseMessage: lit_accounts_pb.Account|null) => void
  ): UnaryResponse;
  listAccounts(
    requestMessage: lit_accounts_pb.ListAccountsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lit_accounts_pb.ListAccountsResponse|null) => void
  ): UnaryResponse;
  listAccounts(
    requestMessage: lit_accounts_pb.ListAccountsRequest,
    callback: (error: ServiceError|null, responseMessage: lit_accounts_pb.ListAccountsResponse|null) => void
  ): UnaryResponse;
  accountInfo(
    requestMessage: lit_accounts_pb.AccountInfoRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lit_accounts_pb.Account|null) => void
  ): UnaryResponse;
  accountInfo(
    requestMessage: lit_accounts_pb.AccountInfoRequest,
    callback: (error: ServiceError|null, responseMessage: lit_accounts_pb.Account|null) => void
  ): UnaryResponse;
  removeAccount(
    requestMessage: lit_accounts_pb.RemoveAccountRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: lit_accounts_pb.RemoveAccountResponse|null) => void
  ): UnaryResponse;
  removeAccount(
    requestMessage: lit_accounts_pb.RemoveAccountRequest,
    callback: (error: ServiceError|null, responseMessage: lit_accounts_pb.RemoveAccountResponse|null) => void
  ): UnaryResponse;
}

