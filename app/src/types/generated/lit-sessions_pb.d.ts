// package: litrpc
// file: lit-sessions.proto

import * as jspb from "google-protobuf";

export class AddSessionRequest extends jspb.Message {
  getLabel(): string;
  setLabel(value: string): void;

  getSessionType(): SessionTypeMap[keyof SessionTypeMap];
  setSessionType(value: SessionTypeMap[keyof SessionTypeMap]): void;

  getExpiryTimestampSeconds(): string;
  setExpiryTimestampSeconds(value: string): void;

  getMailboxServerAddr(): string;
  setMailboxServerAddr(value: string): void;

  getDevServer(): boolean;
  setDevServer(value: boolean): void;

  clearMacaroonCustomPermissionsList(): void;
  getMacaroonCustomPermissionsList(): Array<MacaroonPermission>;
  setMacaroonCustomPermissionsList(value: Array<MacaroonPermission>): void;
  addMacaroonCustomPermissions(value?: MacaroonPermission, index?: number): MacaroonPermission;

  getAccountId(): string;
  setAccountId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddSessionRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AddSessionRequest): AddSessionRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AddSessionRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddSessionRequest;
  static deserializeBinaryFromReader(message: AddSessionRequest, reader: jspb.BinaryReader): AddSessionRequest;
}

export namespace AddSessionRequest {
  export type AsObject = {
    label: string,
    sessionType: SessionTypeMap[keyof SessionTypeMap],
    expiryTimestampSeconds: string,
    mailboxServerAddr: string,
    devServer: boolean,
    macaroonCustomPermissionsList: Array<MacaroonPermission.AsObject>,
    accountId: string,
  }
}

export class MacaroonPermission extends jspb.Message {
  getEntity(): string;
  setEntity(value: string): void;

  getAction(): string;
  setAction(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MacaroonPermission.AsObject;
  static toObject(includeInstance: boolean, msg: MacaroonPermission): MacaroonPermission.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MacaroonPermission, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MacaroonPermission;
  static deserializeBinaryFromReader(message: MacaroonPermission, reader: jspb.BinaryReader): MacaroonPermission;
}

export namespace MacaroonPermission {
  export type AsObject = {
    entity: string,
    action: string,
  }
}

export class AddSessionResponse extends jspb.Message {
  hasSession(): boolean;
  clearSession(): void;
  getSession(): Session | undefined;
  setSession(value?: Session): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddSessionResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AddSessionResponse): AddSessionResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AddSessionResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddSessionResponse;
  static deserializeBinaryFromReader(message: AddSessionResponse, reader: jspb.BinaryReader): AddSessionResponse;
}

export namespace AddSessionResponse {
  export type AsObject = {
    session?: Session.AsObject,
  }
}

export class Session extends jspb.Message {
  getLabel(): string;
  setLabel(value: string): void;

  getSessionState(): SessionStateMap[keyof SessionStateMap];
  setSessionState(value: SessionStateMap[keyof SessionStateMap]): void;

  getSessionType(): SessionTypeMap[keyof SessionTypeMap];
  setSessionType(value: SessionTypeMap[keyof SessionTypeMap]): void;

  getExpiryTimestampSeconds(): string;
  setExpiryTimestampSeconds(value: string): void;

  getMailboxServerAddr(): string;
  setMailboxServerAddr(value: string): void;

  getDevServer(): boolean;
  setDevServer(value: boolean): void;

  getPairingSecret(): Uint8Array | string;
  getPairingSecret_asU8(): Uint8Array;
  getPairingSecret_asB64(): string;
  setPairingSecret(value: Uint8Array | string): void;

  getPairingSecretMnemonic(): string;
  setPairingSecretMnemonic(value: string): void;

  getLocalPublicKey(): Uint8Array | string;
  getLocalPublicKey_asU8(): Uint8Array;
  getLocalPublicKey_asB64(): string;
  setLocalPublicKey(value: Uint8Array | string): void;

  getRemotePublicKey(): Uint8Array | string;
  getRemotePublicKey_asU8(): Uint8Array;
  getRemotePublicKey_asB64(): string;
  setRemotePublicKey(value: Uint8Array | string): void;

  getCreatedAt(): string;
  setCreatedAt(value: string): void;

  hasMacaroonRecipe(): boolean;
  clearMacaroonRecipe(): void;
  getMacaroonRecipe(): MacaroonRecipe | undefined;
  setMacaroonRecipe(value?: MacaroonRecipe): void;

  getAccountId(): string;
  setAccountId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Session.AsObject;
  static toObject(includeInstance: boolean, msg: Session): Session.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Session, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Session;
  static deserializeBinaryFromReader(message: Session, reader: jspb.BinaryReader): Session;
}

export namespace Session {
  export type AsObject = {
    label: string,
    sessionState: SessionStateMap[keyof SessionStateMap],
    sessionType: SessionTypeMap[keyof SessionTypeMap],
    expiryTimestampSeconds: string,
    mailboxServerAddr: string,
    devServer: boolean,
    pairingSecret: Uint8Array | string,
    pairingSecretMnemonic: string,
    localPublicKey: Uint8Array | string,
    remotePublicKey: Uint8Array | string,
    createdAt: string,
    macaroonRecipe?: MacaroonRecipe.AsObject,
    accountId: string,
  }
}

export class MacaroonRecipe extends jspb.Message {
  clearPermissionsList(): void;
  getPermissionsList(): Array<MacaroonPermission>;
  setPermissionsList(value: Array<MacaroonPermission>): void;
  addPermissions(value?: MacaroonPermission, index?: number): MacaroonPermission;

  clearCaveatsList(): void;
  getCaveatsList(): Array<string>;
  setCaveatsList(value: Array<string>): void;
  addCaveats(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MacaroonRecipe.AsObject;
  static toObject(includeInstance: boolean, msg: MacaroonRecipe): MacaroonRecipe.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MacaroonRecipe, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MacaroonRecipe;
  static deserializeBinaryFromReader(message: MacaroonRecipe, reader: jspb.BinaryReader): MacaroonRecipe;
}

export namespace MacaroonRecipe {
  export type AsObject = {
    permissionsList: Array<MacaroonPermission.AsObject>,
    caveatsList: Array<string>,
  }
}

export class ListSessionsRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListSessionsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListSessionsRequest): ListSessionsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListSessionsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListSessionsRequest;
  static deserializeBinaryFromReader(message: ListSessionsRequest, reader: jspb.BinaryReader): ListSessionsRequest;
}

export namespace ListSessionsRequest {
  export type AsObject = {
  }
}

export class ListSessionsResponse extends jspb.Message {
  clearSessionsList(): void;
  getSessionsList(): Array<Session>;
  setSessionsList(value: Array<Session>): void;
  addSessions(value?: Session, index?: number): Session;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListSessionsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListSessionsResponse): ListSessionsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListSessionsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListSessionsResponse;
  static deserializeBinaryFromReader(message: ListSessionsResponse, reader: jspb.BinaryReader): ListSessionsResponse;
}

export namespace ListSessionsResponse {
  export type AsObject = {
    sessionsList: Array<Session.AsObject>,
  }
}

export class RevokeSessionRequest extends jspb.Message {
  getLocalPublicKey(): Uint8Array | string;
  getLocalPublicKey_asU8(): Uint8Array;
  getLocalPublicKey_asB64(): string;
  setLocalPublicKey(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RevokeSessionRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RevokeSessionRequest): RevokeSessionRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RevokeSessionRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RevokeSessionRequest;
  static deserializeBinaryFromReader(message: RevokeSessionRequest, reader: jspb.BinaryReader): RevokeSessionRequest;
}

export namespace RevokeSessionRequest {
  export type AsObject = {
    localPublicKey: Uint8Array | string,
  }
}

export class RevokeSessionResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RevokeSessionResponse.AsObject;
  static toObject(includeInstance: boolean, msg: RevokeSessionResponse): RevokeSessionResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RevokeSessionResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RevokeSessionResponse;
  static deserializeBinaryFromReader(message: RevokeSessionResponse, reader: jspb.BinaryReader): RevokeSessionResponse;
}

export namespace RevokeSessionResponse {
  export type AsObject = {
  }
}

export interface SessionTypeMap {
  TYPE_MACAROON_READONLY: 0;
  TYPE_MACAROON_ADMIN: 1;
  TYPE_MACAROON_CUSTOM: 2;
  TYPE_UI_PASSWORD: 3;
  TYPE_MACAROON_ACCOUNT: 5;
}

export const SessionType: SessionTypeMap;

export interface SessionStateMap {
  STATE_CREATED: 0;
  STATE_IN_USE: 1;
  STATE_REVOKED: 2;
  STATE_EXPIRED: 3;
}

export const SessionState: SessionStateMap;

