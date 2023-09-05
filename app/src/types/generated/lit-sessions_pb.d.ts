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
  getId(): Uint8Array | string;
  getId_asU8(): Uint8Array;
  getId_asB64(): string;
  setId(value: Uint8Array | string): void;

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

  getAutopilotFeatureInfoMap(): jspb.Map<string, RulesMap>;
  clearAutopilotFeatureInfoMap(): void;
  getRevokedAt(): string;
  setRevokedAt(value: string): void;

  getGroupId(): Uint8Array | string;
  getGroupId_asU8(): Uint8Array;
  getGroupId_asB64(): string;
  setGroupId(value: Uint8Array | string): void;

  getFeatureConfigsMap(): jspb.Map<string, string>;
  clearFeatureConfigsMap(): void;
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
    id: Uint8Array | string,
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
    autopilotFeatureInfoMap: Array<[string, RulesMap.AsObject]>,
    revokedAt: string,
    groupId: Uint8Array | string,
    featureConfigsMap: Array<[string, string]>,
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

export class RulesMap extends jspb.Message {
  getRulesMap(): jspb.Map<string, RuleValue>;
  clearRulesMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RulesMap.AsObject;
  static toObject(includeInstance: boolean, msg: RulesMap): RulesMap.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RulesMap, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RulesMap;
  static deserializeBinaryFromReader(message: RulesMap, reader: jspb.BinaryReader): RulesMap;
}

export namespace RulesMap {
  export type AsObject = {
    rulesMap: Array<[string, RuleValue.AsObject]>,
  }
}

export class RuleValue extends jspb.Message {
  hasRateLimit(): boolean;
  clearRateLimit(): void;
  getRateLimit(): RateLimit | undefined;
  setRateLimit(value?: RateLimit): void;

  hasChanPolicyBounds(): boolean;
  clearChanPolicyBounds(): void;
  getChanPolicyBounds(): ChannelPolicyBounds | undefined;
  setChanPolicyBounds(value?: ChannelPolicyBounds): void;

  hasHistoryLimit(): boolean;
  clearHistoryLimit(): void;
  getHistoryLimit(): HistoryLimit | undefined;
  setHistoryLimit(value?: HistoryLimit): void;

  hasOffChainBudget(): boolean;
  clearOffChainBudget(): void;
  getOffChainBudget(): OffChainBudget | undefined;
  setOffChainBudget(value?: OffChainBudget): void;

  hasOnChainBudget(): boolean;
  clearOnChainBudget(): void;
  getOnChainBudget(): OnChainBudget | undefined;
  setOnChainBudget(value?: OnChainBudget): void;

  hasSendToSelf(): boolean;
  clearSendToSelf(): void;
  getSendToSelf(): SendToSelf | undefined;
  setSendToSelf(value?: SendToSelf): void;

  hasChannelRestrict(): boolean;
  clearChannelRestrict(): void;
  getChannelRestrict(): ChannelRestrict | undefined;
  setChannelRestrict(value?: ChannelRestrict): void;

  hasPeerRestrict(): boolean;
  clearPeerRestrict(): void;
  getPeerRestrict(): PeerRestrict | undefined;
  setPeerRestrict(value?: PeerRestrict): void;

  getValueCase(): RuleValue.ValueCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RuleValue.AsObject;
  static toObject(includeInstance: boolean, msg: RuleValue): RuleValue.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RuleValue, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RuleValue;
  static deserializeBinaryFromReader(message: RuleValue, reader: jspb.BinaryReader): RuleValue;
}

export namespace RuleValue {
  export type AsObject = {
    rateLimit?: RateLimit.AsObject,
    chanPolicyBounds?: ChannelPolicyBounds.AsObject,
    historyLimit?: HistoryLimit.AsObject,
    offChainBudget?: OffChainBudget.AsObject,
    onChainBudget?: OnChainBudget.AsObject,
    sendToSelf?: SendToSelf.AsObject,
    channelRestrict?: ChannelRestrict.AsObject,
    peerRestrict?: PeerRestrict.AsObject,
  }

  export enum ValueCase {
    VALUE_NOT_SET = 0,
    RATE_LIMIT = 1,
    CHAN_POLICY_BOUNDS = 2,
    HISTORY_LIMIT = 3,
    OFF_CHAIN_BUDGET = 4,
    ON_CHAIN_BUDGET = 5,
    SEND_TO_SELF = 6,
    CHANNEL_RESTRICT = 7,
    PEER_RESTRICT = 8,
  }
}

export class RateLimit extends jspb.Message {
  hasReadLimit(): boolean;
  clearReadLimit(): void;
  getReadLimit(): Rate | undefined;
  setReadLimit(value?: Rate): void;

  hasWriteLimit(): boolean;
  clearWriteLimit(): void;
  getWriteLimit(): Rate | undefined;
  setWriteLimit(value?: Rate): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RateLimit.AsObject;
  static toObject(includeInstance: boolean, msg: RateLimit): RateLimit.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RateLimit, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RateLimit;
  static deserializeBinaryFromReader(message: RateLimit, reader: jspb.BinaryReader): RateLimit;
}

export namespace RateLimit {
  export type AsObject = {
    readLimit?: Rate.AsObject,
    writeLimit?: Rate.AsObject,
  }
}

export class Rate extends jspb.Message {
  getIterations(): number;
  setIterations(value: number): void;

  getNumHours(): number;
  setNumHours(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Rate.AsObject;
  static toObject(includeInstance: boolean, msg: Rate): Rate.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Rate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Rate;
  static deserializeBinaryFromReader(message: Rate, reader: jspb.BinaryReader): Rate;
}

export namespace Rate {
  export type AsObject = {
    iterations: number,
    numHours: number,
  }
}

export class HistoryLimit extends jspb.Message {
  getStartTime(): string;
  setStartTime(value: string): void;

  getDuration(): string;
  setDuration(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HistoryLimit.AsObject;
  static toObject(includeInstance: boolean, msg: HistoryLimit): HistoryLimit.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: HistoryLimit, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HistoryLimit;
  static deserializeBinaryFromReader(message: HistoryLimit, reader: jspb.BinaryReader): HistoryLimit;
}

export namespace HistoryLimit {
  export type AsObject = {
    startTime: string,
    duration: string,
  }
}

export class ChannelPolicyBounds extends jspb.Message {
  getMinBaseMsat(): string;
  setMinBaseMsat(value: string): void;

  getMaxBaseMsat(): string;
  setMaxBaseMsat(value: string): void;

  getMinRatePpm(): number;
  setMinRatePpm(value: number): void;

  getMaxRatePpm(): number;
  setMaxRatePpm(value: number): void;

  getMinCltvDelta(): number;
  setMinCltvDelta(value: number): void;

  getMaxCltvDelta(): number;
  setMaxCltvDelta(value: number): void;

  getMinHtlcMsat(): string;
  setMinHtlcMsat(value: string): void;

  getMaxHtlcMsat(): string;
  setMaxHtlcMsat(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChannelPolicyBounds.AsObject;
  static toObject(includeInstance: boolean, msg: ChannelPolicyBounds): ChannelPolicyBounds.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChannelPolicyBounds, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChannelPolicyBounds;
  static deserializeBinaryFromReader(message: ChannelPolicyBounds, reader: jspb.BinaryReader): ChannelPolicyBounds;
}

export namespace ChannelPolicyBounds {
  export type AsObject = {
    minBaseMsat: string,
    maxBaseMsat: string,
    minRatePpm: number,
    maxRatePpm: number,
    minCltvDelta: number,
    maxCltvDelta: number,
    minHtlcMsat: string,
    maxHtlcMsat: string,
  }
}

export class OffChainBudget extends jspb.Message {
  getMaxAmtMsat(): string;
  setMaxAmtMsat(value: string): void;

  getMaxFeesMsat(): string;
  setMaxFeesMsat(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OffChainBudget.AsObject;
  static toObject(includeInstance: boolean, msg: OffChainBudget): OffChainBudget.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OffChainBudget, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OffChainBudget;
  static deserializeBinaryFromReader(message: OffChainBudget, reader: jspb.BinaryReader): OffChainBudget;
}

export namespace OffChainBudget {
  export type AsObject = {
    maxAmtMsat: string,
    maxFeesMsat: string,
  }
}

export class OnChainBudget extends jspb.Message {
  getAbsoluteAmtSats(): string;
  setAbsoluteAmtSats(value: string): void;

  getMaxSatPerVByte(): string;
  setMaxSatPerVByte(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OnChainBudget.AsObject;
  static toObject(includeInstance: boolean, msg: OnChainBudget): OnChainBudget.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OnChainBudget, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OnChainBudget;
  static deserializeBinaryFromReader(message: OnChainBudget, reader: jspb.BinaryReader): OnChainBudget;
}

export namespace OnChainBudget {
  export type AsObject = {
    absoluteAmtSats: string,
    maxSatPerVByte: string,
  }
}

export class SendToSelf extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendToSelf.AsObject;
  static toObject(includeInstance: boolean, msg: SendToSelf): SendToSelf.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SendToSelf, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendToSelf;
  static deserializeBinaryFromReader(message: SendToSelf, reader: jspb.BinaryReader): SendToSelf;
}

export namespace SendToSelf {
  export type AsObject = {
  }
}

export class ChannelRestrict extends jspb.Message {
  clearChannelIdsList(): void;
  getChannelIdsList(): Array<string>;
  setChannelIdsList(value: Array<string>): void;
  addChannelIds(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChannelRestrict.AsObject;
  static toObject(includeInstance: boolean, msg: ChannelRestrict): ChannelRestrict.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChannelRestrict, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChannelRestrict;
  static deserializeBinaryFromReader(message: ChannelRestrict, reader: jspb.BinaryReader): ChannelRestrict;
}

export namespace ChannelRestrict {
  export type AsObject = {
    channelIdsList: Array<string>,
  }
}

export class PeerRestrict extends jspb.Message {
  clearPeerIdsList(): void;
  getPeerIdsList(): Array<string>;
  setPeerIdsList(value: Array<string>): void;
  addPeerIds(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PeerRestrict.AsObject;
  static toObject(includeInstance: boolean, msg: PeerRestrict): PeerRestrict.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PeerRestrict, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PeerRestrict;
  static deserializeBinaryFromReader(message: PeerRestrict, reader: jspb.BinaryReader): PeerRestrict;
}

export namespace PeerRestrict {
  export type AsObject = {
    peerIdsList: Array<string>,
  }
}

export interface SessionTypeMap {
  TYPE_MACAROON_READONLY: 0;
  TYPE_MACAROON_ADMIN: 1;
  TYPE_MACAROON_CUSTOM: 2;
  TYPE_UI_PASSWORD: 3;
  TYPE_AUTOPILOT: 4;
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

