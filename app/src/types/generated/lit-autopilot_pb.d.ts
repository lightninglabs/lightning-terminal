// package: litrpc
// file: lit-autopilot.proto

import * as jspb from "google-protobuf";
import * as lit_sessions_pb from "./lit-sessions_pb";

export class AddAutopilotSessionRequest extends jspb.Message {
  getLabel(): string;
  setLabel(value: string): void;

  getExpiryTimestampSeconds(): string;
  setExpiryTimestampSeconds(value: string): void;

  getMailboxServerAddr(): string;
  setMailboxServerAddr(value: string): void;

  getDevServer(): boolean;
  setDevServer(value: boolean): void;

  getFeaturesMap(): jspb.Map<string, FeatureConfig>;
  clearFeaturesMap(): void;
  hasSessionRules(): boolean;
  clearSessionRules(): void;
  getSessionRules(): lit_sessions_pb.RulesMap | undefined;
  setSessionRules(value?: lit_sessions_pb.RulesMap): void;

  getNoPrivacyMapper(): boolean;
  setNoPrivacyMapper(value: boolean): void;

  getLinkedGroupId(): Uint8Array | string;
  getLinkedGroupId_asU8(): Uint8Array;
  getLinkedGroupId_asB64(): string;
  setLinkedGroupId(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddAutopilotSessionRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AddAutopilotSessionRequest): AddAutopilotSessionRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AddAutopilotSessionRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddAutopilotSessionRequest;
  static deserializeBinaryFromReader(message: AddAutopilotSessionRequest, reader: jspb.BinaryReader): AddAutopilotSessionRequest;
}

export namespace AddAutopilotSessionRequest {
  export type AsObject = {
    label: string,
    expiryTimestampSeconds: string,
    mailboxServerAddr: string,
    devServer: boolean,
    featuresMap: Array<[string, FeatureConfig.AsObject]>,
    sessionRules?: lit_sessions_pb.RulesMap.AsObject,
    noPrivacyMapper: boolean,
    linkedGroupId: Uint8Array | string,
  }
}

export class FeatureConfig extends jspb.Message {
  hasRules(): boolean;
  clearRules(): void;
  getRules(): lit_sessions_pb.RulesMap | undefined;
  setRules(value?: lit_sessions_pb.RulesMap): void;

  getConfig(): Uint8Array | string;
  getConfig_asU8(): Uint8Array;
  getConfig_asB64(): string;
  setConfig(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FeatureConfig.AsObject;
  static toObject(includeInstance: boolean, msg: FeatureConfig): FeatureConfig.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FeatureConfig, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FeatureConfig;
  static deserializeBinaryFromReader(message: FeatureConfig, reader: jspb.BinaryReader): FeatureConfig;
}

export namespace FeatureConfig {
  export type AsObject = {
    rules?: lit_sessions_pb.RulesMap.AsObject,
    config: Uint8Array | string,
  }
}

export class ListAutopilotSessionsRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListAutopilotSessionsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListAutopilotSessionsRequest): ListAutopilotSessionsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListAutopilotSessionsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListAutopilotSessionsRequest;
  static deserializeBinaryFromReader(message: ListAutopilotSessionsRequest, reader: jspb.BinaryReader): ListAutopilotSessionsRequest;
}

export namespace ListAutopilotSessionsRequest {
  export type AsObject = {
  }
}

export class ListAutopilotSessionsResponse extends jspb.Message {
  clearSessionsList(): void;
  getSessionsList(): Array<lit_sessions_pb.Session>;
  setSessionsList(value: Array<lit_sessions_pb.Session>): void;
  addSessions(value?: lit_sessions_pb.Session, index?: number): lit_sessions_pb.Session;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListAutopilotSessionsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListAutopilotSessionsResponse): ListAutopilotSessionsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListAutopilotSessionsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListAutopilotSessionsResponse;
  static deserializeBinaryFromReader(message: ListAutopilotSessionsResponse, reader: jspb.BinaryReader): ListAutopilotSessionsResponse;
}

export namespace ListAutopilotSessionsResponse {
  export type AsObject = {
    sessionsList: Array<lit_sessions_pb.Session.AsObject>,
  }
}

export class AddAutopilotSessionResponse extends jspb.Message {
  hasSession(): boolean;
  clearSession(): void;
  getSession(): lit_sessions_pb.Session | undefined;
  setSession(value?: lit_sessions_pb.Session): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddAutopilotSessionResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AddAutopilotSessionResponse): AddAutopilotSessionResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AddAutopilotSessionResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddAutopilotSessionResponse;
  static deserializeBinaryFromReader(message: AddAutopilotSessionResponse, reader: jspb.BinaryReader): AddAutopilotSessionResponse;
}

export namespace AddAutopilotSessionResponse {
  export type AsObject = {
    session?: lit_sessions_pb.Session.AsObject,
  }
}

export class ListAutopilotFeaturesRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListAutopilotFeaturesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListAutopilotFeaturesRequest): ListAutopilotFeaturesRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListAutopilotFeaturesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListAutopilotFeaturesRequest;
  static deserializeBinaryFromReader(message: ListAutopilotFeaturesRequest, reader: jspb.BinaryReader): ListAutopilotFeaturesRequest;
}

export namespace ListAutopilotFeaturesRequest {
  export type AsObject = {
  }
}

export class ListAutopilotFeaturesResponse extends jspb.Message {
  getFeaturesMap(): jspb.Map<string, Feature>;
  clearFeaturesMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListAutopilotFeaturesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListAutopilotFeaturesResponse): ListAutopilotFeaturesResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListAutopilotFeaturesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListAutopilotFeaturesResponse;
  static deserializeBinaryFromReader(message: ListAutopilotFeaturesResponse, reader: jspb.BinaryReader): ListAutopilotFeaturesResponse;
}

export namespace ListAutopilotFeaturesResponse {
  export type AsObject = {
    featuresMap: Array<[string, Feature.AsObject]>,
  }
}

export class RevokeAutopilotSessionRequest extends jspb.Message {
  getLocalPublicKey(): Uint8Array | string;
  getLocalPublicKey_asU8(): Uint8Array;
  getLocalPublicKey_asB64(): string;
  setLocalPublicKey(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RevokeAutopilotSessionRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RevokeAutopilotSessionRequest): RevokeAutopilotSessionRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RevokeAutopilotSessionRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RevokeAutopilotSessionRequest;
  static deserializeBinaryFromReader(message: RevokeAutopilotSessionRequest, reader: jspb.BinaryReader): RevokeAutopilotSessionRequest;
}

export namespace RevokeAutopilotSessionRequest {
  export type AsObject = {
    localPublicKey: Uint8Array | string,
  }
}

export class RevokeAutopilotSessionResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RevokeAutopilotSessionResponse.AsObject;
  static toObject(includeInstance: boolean, msg: RevokeAutopilotSessionResponse): RevokeAutopilotSessionResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RevokeAutopilotSessionResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RevokeAutopilotSessionResponse;
  static deserializeBinaryFromReader(message: RevokeAutopilotSessionResponse, reader: jspb.BinaryReader): RevokeAutopilotSessionResponse;
}

export namespace RevokeAutopilotSessionResponse {
  export type AsObject = {
  }
}

export class Feature extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getDescription(): string;
  setDescription(value: string): void;

  getRulesMap(): jspb.Map<string, RuleValues>;
  clearRulesMap(): void;
  clearPermissionsListList(): void;
  getPermissionsListList(): Array<Permissions>;
  setPermissionsListList(value: Array<Permissions>): void;
  addPermissionsList(value?: Permissions, index?: number): Permissions;

  getRequiresUpgrade(): boolean;
  setRequiresUpgrade(value: boolean): void;

  getDefaultConfig(): string;
  setDefaultConfig(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Feature.AsObject;
  static toObject(includeInstance: boolean, msg: Feature): Feature.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Feature, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Feature;
  static deserializeBinaryFromReader(message: Feature, reader: jspb.BinaryReader): Feature;
}

export namespace Feature {
  export type AsObject = {
    name: string,
    description: string,
    rulesMap: Array<[string, RuleValues.AsObject]>,
    permissionsListList: Array<Permissions.AsObject>,
    requiresUpgrade: boolean,
    defaultConfig: string,
  }
}

export class RuleValues extends jspb.Message {
  getKnown(): boolean;
  setKnown(value: boolean): void;

  hasDefaults(): boolean;
  clearDefaults(): void;
  getDefaults(): lit_sessions_pb.RuleValue | undefined;
  setDefaults(value?: lit_sessions_pb.RuleValue): void;

  hasMinValue(): boolean;
  clearMinValue(): void;
  getMinValue(): lit_sessions_pb.RuleValue | undefined;
  setMinValue(value?: lit_sessions_pb.RuleValue): void;

  hasMaxValue(): boolean;
  clearMaxValue(): void;
  getMaxValue(): lit_sessions_pb.RuleValue | undefined;
  setMaxValue(value?: lit_sessions_pb.RuleValue): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RuleValues.AsObject;
  static toObject(includeInstance: boolean, msg: RuleValues): RuleValues.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RuleValues, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RuleValues;
  static deserializeBinaryFromReader(message: RuleValues, reader: jspb.BinaryReader): RuleValues;
}

export namespace RuleValues {
  export type AsObject = {
    known: boolean,
    defaults?: lit_sessions_pb.RuleValue.AsObject,
    minValue?: lit_sessions_pb.RuleValue.AsObject,
    maxValue?: lit_sessions_pb.RuleValue.AsObject,
  }
}

export class Permissions extends jspb.Message {
  getMethod(): string;
  setMethod(value: string): void;

  clearOperationsList(): void;
  getOperationsList(): Array<lit_sessions_pb.MacaroonPermission>;
  setOperationsList(value: Array<lit_sessions_pb.MacaroonPermission>): void;
  addOperations(value?: lit_sessions_pb.MacaroonPermission, index?: number): lit_sessions_pb.MacaroonPermission;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Permissions.AsObject;
  static toObject(includeInstance: boolean, msg: Permissions): Permissions.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Permissions, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Permissions;
  static deserializeBinaryFromReader(message: Permissions, reader: jspb.BinaryReader): Permissions;
}

export namespace Permissions {
  export type AsObject = {
    method: string,
    operationsList: Array<lit_sessions_pb.MacaroonPermission.AsObject>,
  }
}

