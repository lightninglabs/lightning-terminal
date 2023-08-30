// package: litrpc
// file: firewall.proto

import * as jspb from "google-protobuf";

export class PrivacyMapConversionRequest extends jspb.Message {
  getRealToPseudo(): boolean;
  setRealToPseudo(value: boolean): void;

  getSessionId(): Uint8Array | string;
  getSessionId_asU8(): Uint8Array;
  getSessionId_asB64(): string;
  setSessionId(value: Uint8Array | string): void;

  getInput(): string;
  setInput(value: string): void;

  getGroupId(): Uint8Array | string;
  getGroupId_asU8(): Uint8Array;
  getGroupId_asB64(): string;
  setGroupId(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PrivacyMapConversionRequest.AsObject;
  static toObject(includeInstance: boolean, msg: PrivacyMapConversionRequest): PrivacyMapConversionRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PrivacyMapConversionRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PrivacyMapConversionRequest;
  static deserializeBinaryFromReader(message: PrivacyMapConversionRequest, reader: jspb.BinaryReader): PrivacyMapConversionRequest;
}

export namespace PrivacyMapConversionRequest {
  export type AsObject = {
    realToPseudo: boolean,
    sessionId: Uint8Array | string,
    input: string,
    groupId: Uint8Array | string,
  }
}

export class PrivacyMapConversionResponse extends jspb.Message {
  getOutput(): string;
  setOutput(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PrivacyMapConversionResponse.AsObject;
  static toObject(includeInstance: boolean, msg: PrivacyMapConversionResponse): PrivacyMapConversionResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PrivacyMapConversionResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PrivacyMapConversionResponse;
  static deserializeBinaryFromReader(message: PrivacyMapConversionResponse, reader: jspb.BinaryReader): PrivacyMapConversionResponse;
}

export namespace PrivacyMapConversionResponse {
  export type AsObject = {
    output: string,
  }
}

export class ListActionsRequest extends jspb.Message {
  getFeatureName(): string;
  setFeatureName(value: string): void;

  getActorName(): string;
  setActorName(value: string): void;

  getMethodName(): string;
  setMethodName(value: string): void;

  getState(): ActionStateMap[keyof ActionStateMap];
  setState(value: ActionStateMap[keyof ActionStateMap]): void;

  getIndexOffset(): string;
  setIndexOffset(value: string): void;

  getMaxNumActions(): string;
  setMaxNumActions(value: string): void;

  getReversed(): boolean;
  setReversed(value: boolean): void;

  getCountTotal(): boolean;
  setCountTotal(value: boolean): void;

  getSessionId(): Uint8Array | string;
  getSessionId_asU8(): Uint8Array;
  getSessionId_asB64(): string;
  setSessionId(value: Uint8Array | string): void;

  getStartTimestamp(): string;
  setStartTimestamp(value: string): void;

  getEndTimestamp(): string;
  setEndTimestamp(value: string): void;

  getGroupId(): Uint8Array | string;
  getGroupId_asU8(): Uint8Array;
  getGroupId_asB64(): string;
  setGroupId(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListActionsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListActionsRequest): ListActionsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListActionsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListActionsRequest;
  static deserializeBinaryFromReader(message: ListActionsRequest, reader: jspb.BinaryReader): ListActionsRequest;
}

export namespace ListActionsRequest {
  export type AsObject = {
    featureName: string,
    actorName: string,
    methodName: string,
    state: ActionStateMap[keyof ActionStateMap],
    indexOffset: string,
    maxNumActions: string,
    reversed: boolean,
    countTotal: boolean,
    sessionId: Uint8Array | string,
    startTimestamp: string,
    endTimestamp: string,
    groupId: Uint8Array | string,
  }
}

export class ListActionsResponse extends jspb.Message {
  clearActionsList(): void;
  getActionsList(): Array<Action>;
  setActionsList(value: Array<Action>): void;
  addActions(value?: Action, index?: number): Action;

  getLastIndexOffset(): string;
  setLastIndexOffset(value: string): void;

  getTotalCount(): string;
  setTotalCount(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListActionsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListActionsResponse): ListActionsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListActionsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListActionsResponse;
  static deserializeBinaryFromReader(message: ListActionsResponse, reader: jspb.BinaryReader): ListActionsResponse;
}

export namespace ListActionsResponse {
  export type AsObject = {
    actionsList: Array<Action.AsObject>,
    lastIndexOffset: string,
    totalCount: string,
  }
}

export class Action extends jspb.Message {
  getActorName(): string;
  setActorName(value: string): void;

  getFeatureName(): string;
  setFeatureName(value: string): void;

  getTrigger(): string;
  setTrigger(value: string): void;

  getIntent(): string;
  setIntent(value: string): void;

  getStructuredJsonData(): string;
  setStructuredJsonData(value: string): void;

  getRpcMethod(): string;
  setRpcMethod(value: string): void;

  getRpcParamsJson(): string;
  setRpcParamsJson(value: string): void;

  getTimestamp(): string;
  setTimestamp(value: string): void;

  getState(): ActionStateMap[keyof ActionStateMap];
  setState(value: ActionStateMap[keyof ActionStateMap]): void;

  getErrorReason(): string;
  setErrorReason(value: string): void;

  getSessionId(): Uint8Array | string;
  getSessionId_asU8(): Uint8Array;
  getSessionId_asB64(): string;
  setSessionId(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Action.AsObject;
  static toObject(includeInstance: boolean, msg: Action): Action.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Action, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Action;
  static deserializeBinaryFromReader(message: Action, reader: jspb.BinaryReader): Action;
}

export namespace Action {
  export type AsObject = {
    actorName: string,
    featureName: string,
    trigger: string,
    intent: string,
    structuredJsonData: string,
    rpcMethod: string,
    rpcParamsJson: string,
    timestamp: string,
    state: ActionStateMap[keyof ActionStateMap],
    errorReason: string,
    sessionId: Uint8Array | string,
  }
}

export interface ActionStateMap {
  STATE_UNKNOWN: 0;
  STATE_PENDING: 1;
  STATE_DONE: 2;
  STATE_ERROR: 3;
}

export const ActionState: ActionStateMap;

