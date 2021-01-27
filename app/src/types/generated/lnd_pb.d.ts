// package: lnrpc
// file: lnd.proto

import * as jspb from "google-protobuf";

export class Utxo extends jspb.Message {
  getAddressType(): AddressTypeMap[keyof AddressTypeMap];
  setAddressType(value: AddressTypeMap[keyof AddressTypeMap]): void;

  getAddress(): string;
  setAddress(value: string): void;

  getAmountSat(): number;
  setAmountSat(value: number): void;

  getPkScript(): string;
  setPkScript(value: string): void;

  hasOutpoint(): boolean;
  clearOutpoint(): void;
  getOutpoint(): OutPoint | undefined;
  setOutpoint(value?: OutPoint): void;

  getConfirmations(): number;
  setConfirmations(value: number): void;

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
    addressType: AddressTypeMap[keyof AddressTypeMap],
    address: string,
    amountSat: number,
    pkScript: string,
    outpoint?: OutPoint.AsObject,
    confirmations: number,
  }
}

export class Transaction extends jspb.Message {
  getTxHash(): string;
  setTxHash(value: string): void;

  getAmount(): number;
  setAmount(value: number): void;

  getNumConfirmations(): number;
  setNumConfirmations(value: number): void;

  getBlockHash(): string;
  setBlockHash(value: string): void;

  getBlockHeight(): number;
  setBlockHeight(value: number): void;

  getTimeStamp(): number;
  setTimeStamp(value: number): void;

  getTotalFees(): number;
  setTotalFees(value: number): void;

  clearDestAddressesList(): void;
  getDestAddressesList(): Array<string>;
  setDestAddressesList(value: Array<string>): void;
  addDestAddresses(value: string, index?: number): string;

  getRawTxHex(): string;
  setRawTxHex(value: string): void;

  getLabel(): string;
  setLabel(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Transaction.AsObject;
  static toObject(includeInstance: boolean, msg: Transaction): Transaction.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Transaction, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Transaction;
  static deserializeBinaryFromReader(message: Transaction, reader: jspb.BinaryReader): Transaction;
}

export namespace Transaction {
  export type AsObject = {
    txHash: string,
    amount: number,
    numConfirmations: number,
    blockHash: string,
    blockHeight: number,
    timeStamp: number,
    totalFees: number,
    destAddressesList: Array<string>,
    rawTxHex: string,
    label: string,
  }
}

export class GetTransactionsRequest extends jspb.Message {
  getStartHeight(): number;
  setStartHeight(value: number): void;

  getEndHeight(): number;
  setEndHeight(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetTransactionsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetTransactionsRequest): GetTransactionsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetTransactionsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetTransactionsRequest;
  static deserializeBinaryFromReader(message: GetTransactionsRequest, reader: jspb.BinaryReader): GetTransactionsRequest;
}

export namespace GetTransactionsRequest {
  export type AsObject = {
    startHeight: number,
    endHeight: number,
  }
}

export class TransactionDetails extends jspb.Message {
  clearTransactionsList(): void;
  getTransactionsList(): Array<Transaction>;
  setTransactionsList(value: Array<Transaction>): void;
  addTransactions(value?: Transaction, index?: number): Transaction;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TransactionDetails.AsObject;
  static toObject(includeInstance: boolean, msg: TransactionDetails): TransactionDetails.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TransactionDetails, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TransactionDetails;
  static deserializeBinaryFromReader(message: TransactionDetails, reader: jspb.BinaryReader): TransactionDetails;
}

export namespace TransactionDetails {
  export type AsObject = {
    transactionsList: Array<Transaction.AsObject>,
  }
}

export class FeeLimit extends jspb.Message {
  hasFixed(): boolean;
  clearFixed(): void;
  getFixed(): number;
  setFixed(value: number): void;

  hasFixedMsat(): boolean;
  clearFixedMsat(): void;
  getFixedMsat(): number;
  setFixedMsat(value: number): void;

  hasPercent(): boolean;
  clearPercent(): void;
  getPercent(): number;
  setPercent(value: number): void;

  getLimitCase(): FeeLimit.LimitCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FeeLimit.AsObject;
  static toObject(includeInstance: boolean, msg: FeeLimit): FeeLimit.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FeeLimit, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FeeLimit;
  static deserializeBinaryFromReader(message: FeeLimit, reader: jspb.BinaryReader): FeeLimit;
}

export namespace FeeLimit {
  export type AsObject = {
    fixed: number,
    fixedMsat: number,
    percent: number,
  }

  export enum LimitCase {
    LIMIT_NOT_SET = 0,
    FIXED = 1,
    FIXED_MSAT = 3,
    PERCENT = 2,
  }
}

export class SendRequest extends jspb.Message {
  getDest(): Uint8Array | string;
  getDest_asU8(): Uint8Array;
  getDest_asB64(): string;
  setDest(value: Uint8Array | string): void;

  getDestString(): string;
  setDestString(value: string): void;

  getAmt(): number;
  setAmt(value: number): void;

  getAmtMsat(): number;
  setAmtMsat(value: number): void;

  getPaymentHash(): Uint8Array | string;
  getPaymentHash_asU8(): Uint8Array;
  getPaymentHash_asB64(): string;
  setPaymentHash(value: Uint8Array | string): void;

  getPaymentHashString(): string;
  setPaymentHashString(value: string): void;

  getPaymentRequest(): string;
  setPaymentRequest(value: string): void;

  getFinalCltvDelta(): number;
  setFinalCltvDelta(value: number): void;

  hasFeeLimit(): boolean;
  clearFeeLimit(): void;
  getFeeLimit(): FeeLimit | undefined;
  setFeeLimit(value?: FeeLimit): void;

  getOutgoingChanId(): string;
  setOutgoingChanId(value: string): void;

  getLastHopPubkey(): Uint8Array | string;
  getLastHopPubkey_asU8(): Uint8Array;
  getLastHopPubkey_asB64(): string;
  setLastHopPubkey(value: Uint8Array | string): void;

  getCltvLimit(): number;
  setCltvLimit(value: number): void;

  getDestCustomRecordsMap(): jspb.Map<number, Uint8Array | string>;
  clearDestCustomRecordsMap(): void;
  getAllowSelfPayment(): boolean;
  setAllowSelfPayment(value: boolean): void;

  clearDestFeaturesList(): void;
  getDestFeaturesList(): Array<FeatureBitMap[keyof FeatureBitMap]>;
  setDestFeaturesList(value: Array<FeatureBitMap[keyof FeatureBitMap]>): void;
  addDestFeatures(value: FeatureBitMap[keyof FeatureBitMap], index?: number): FeatureBitMap[keyof FeatureBitMap];

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SendRequest): SendRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SendRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendRequest;
  static deserializeBinaryFromReader(message: SendRequest, reader: jspb.BinaryReader): SendRequest;
}

export namespace SendRequest {
  export type AsObject = {
    dest: Uint8Array | string,
    destString: string,
    amt: number,
    amtMsat: number,
    paymentHash: Uint8Array | string,
    paymentHashString: string,
    paymentRequest: string,
    finalCltvDelta: number,
    feeLimit?: FeeLimit.AsObject,
    outgoingChanId: string,
    lastHopPubkey: Uint8Array | string,
    cltvLimit: number,
    destCustomRecordsMap: Array<[number, Uint8Array | string]>,
    allowSelfPayment: boolean,
    destFeaturesList: Array<FeatureBitMap[keyof FeatureBitMap]>,
  }
}

export class SendResponse extends jspb.Message {
  getPaymentError(): string;
  setPaymentError(value: string): void;

  getPaymentPreimage(): Uint8Array | string;
  getPaymentPreimage_asU8(): Uint8Array;
  getPaymentPreimage_asB64(): string;
  setPaymentPreimage(value: Uint8Array | string): void;

  hasPaymentRoute(): boolean;
  clearPaymentRoute(): void;
  getPaymentRoute(): Route | undefined;
  setPaymentRoute(value?: Route): void;

  getPaymentHash(): Uint8Array | string;
  getPaymentHash_asU8(): Uint8Array;
  getPaymentHash_asB64(): string;
  setPaymentHash(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SendResponse): SendResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SendResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendResponse;
  static deserializeBinaryFromReader(message: SendResponse, reader: jspb.BinaryReader): SendResponse;
}

export namespace SendResponse {
  export type AsObject = {
    paymentError: string,
    paymentPreimage: Uint8Array | string,
    paymentRoute?: Route.AsObject,
    paymentHash: Uint8Array | string,
  }
}

export class SendToRouteRequest extends jspb.Message {
  getPaymentHash(): Uint8Array | string;
  getPaymentHash_asU8(): Uint8Array;
  getPaymentHash_asB64(): string;
  setPaymentHash(value: Uint8Array | string): void;

  getPaymentHashString(): string;
  setPaymentHashString(value: string): void;

  hasRoute(): boolean;
  clearRoute(): void;
  getRoute(): Route | undefined;
  setRoute(value?: Route): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendToRouteRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SendToRouteRequest): SendToRouteRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SendToRouteRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendToRouteRequest;
  static deserializeBinaryFromReader(message: SendToRouteRequest, reader: jspb.BinaryReader): SendToRouteRequest;
}

export namespace SendToRouteRequest {
  export type AsObject = {
    paymentHash: Uint8Array | string,
    paymentHashString: string,
    route?: Route.AsObject,
  }
}

export class ChannelAcceptRequest extends jspb.Message {
  getNodePubkey(): Uint8Array | string;
  getNodePubkey_asU8(): Uint8Array;
  getNodePubkey_asB64(): string;
  setNodePubkey(value: Uint8Array | string): void;

  getChainHash(): Uint8Array | string;
  getChainHash_asU8(): Uint8Array;
  getChainHash_asB64(): string;
  setChainHash(value: Uint8Array | string): void;

  getPendingChanId(): Uint8Array | string;
  getPendingChanId_asU8(): Uint8Array;
  getPendingChanId_asB64(): string;
  setPendingChanId(value: Uint8Array | string): void;

  getFundingAmt(): number;
  setFundingAmt(value: number): void;

  getPushAmt(): number;
  setPushAmt(value: number): void;

  getDustLimit(): number;
  setDustLimit(value: number): void;

  getMaxValueInFlight(): number;
  setMaxValueInFlight(value: number): void;

  getChannelReserve(): number;
  setChannelReserve(value: number): void;

  getMinHtlc(): number;
  setMinHtlc(value: number): void;

  getFeePerKw(): number;
  setFeePerKw(value: number): void;

  getCsvDelay(): number;
  setCsvDelay(value: number): void;

  getMaxAcceptedHtlcs(): number;
  setMaxAcceptedHtlcs(value: number): void;

  getChannelFlags(): number;
  setChannelFlags(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChannelAcceptRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ChannelAcceptRequest): ChannelAcceptRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChannelAcceptRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChannelAcceptRequest;
  static deserializeBinaryFromReader(message: ChannelAcceptRequest, reader: jspb.BinaryReader): ChannelAcceptRequest;
}

export namespace ChannelAcceptRequest {
  export type AsObject = {
    nodePubkey: Uint8Array | string,
    chainHash: Uint8Array | string,
    pendingChanId: Uint8Array | string,
    fundingAmt: number,
    pushAmt: number,
    dustLimit: number,
    maxValueInFlight: number,
    channelReserve: number,
    minHtlc: number,
    feePerKw: number,
    csvDelay: number,
    maxAcceptedHtlcs: number,
    channelFlags: number,
  }
}

export class ChannelAcceptResponse extends jspb.Message {
  getAccept(): boolean;
  setAccept(value: boolean): void;

  getPendingChanId(): Uint8Array | string;
  getPendingChanId_asU8(): Uint8Array;
  getPendingChanId_asB64(): string;
  setPendingChanId(value: Uint8Array | string): void;

  getError(): string;
  setError(value: string): void;

  getUpfrontShutdown(): string;
  setUpfrontShutdown(value: string): void;

  getCsvDelay(): number;
  setCsvDelay(value: number): void;

  getReserveSat(): number;
  setReserveSat(value: number): void;

  getInFlightMaxMsat(): number;
  setInFlightMaxMsat(value: number): void;

  getMaxHtlcCount(): number;
  setMaxHtlcCount(value: number): void;

  getMinHtlcIn(): number;
  setMinHtlcIn(value: number): void;

  getMinAcceptDepth(): number;
  setMinAcceptDepth(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChannelAcceptResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ChannelAcceptResponse): ChannelAcceptResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChannelAcceptResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChannelAcceptResponse;
  static deserializeBinaryFromReader(message: ChannelAcceptResponse, reader: jspb.BinaryReader): ChannelAcceptResponse;
}

export namespace ChannelAcceptResponse {
  export type AsObject = {
    accept: boolean,
    pendingChanId: Uint8Array | string,
    error: string,
    upfrontShutdown: string,
    csvDelay: number,
    reserveSat: number,
    inFlightMaxMsat: number,
    maxHtlcCount: number,
    minHtlcIn: number,
    minAcceptDepth: number,
  }
}

export class ChannelPoint extends jspb.Message {
  hasFundingTxidBytes(): boolean;
  clearFundingTxidBytes(): void;
  getFundingTxidBytes(): Uint8Array | string;
  getFundingTxidBytes_asU8(): Uint8Array;
  getFundingTxidBytes_asB64(): string;
  setFundingTxidBytes(value: Uint8Array | string): void;

  hasFundingTxidStr(): boolean;
  clearFundingTxidStr(): void;
  getFundingTxidStr(): string;
  setFundingTxidStr(value: string): void;

  getOutputIndex(): number;
  setOutputIndex(value: number): void;

  getFundingTxidCase(): ChannelPoint.FundingTxidCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChannelPoint.AsObject;
  static toObject(includeInstance: boolean, msg: ChannelPoint): ChannelPoint.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChannelPoint, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChannelPoint;
  static deserializeBinaryFromReader(message: ChannelPoint, reader: jspb.BinaryReader): ChannelPoint;
}

export namespace ChannelPoint {
  export type AsObject = {
    fundingTxidBytes: Uint8Array | string,
    fundingTxidStr: string,
    outputIndex: number,
  }

  export enum FundingTxidCase {
    FUNDING_TXID_NOT_SET = 0,
    FUNDING_TXID_BYTES = 1,
    FUNDING_TXID_STR = 2,
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

export class LightningAddress extends jspb.Message {
  getPubkey(): string;
  setPubkey(value: string): void;

  getHost(): string;
  setHost(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LightningAddress.AsObject;
  static toObject(includeInstance: boolean, msg: LightningAddress): LightningAddress.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LightningAddress, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LightningAddress;
  static deserializeBinaryFromReader(message: LightningAddress, reader: jspb.BinaryReader): LightningAddress;
}

export namespace LightningAddress {
  export type AsObject = {
    pubkey: string,
    host: string,
  }
}

export class EstimateFeeRequest extends jspb.Message {
  getAddrtoamountMap(): jspb.Map<string, number>;
  clearAddrtoamountMap(): void;
  getTargetConf(): number;
  setTargetConf(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EstimateFeeRequest.AsObject;
  static toObject(includeInstance: boolean, msg: EstimateFeeRequest): EstimateFeeRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: EstimateFeeRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EstimateFeeRequest;
  static deserializeBinaryFromReader(message: EstimateFeeRequest, reader: jspb.BinaryReader): EstimateFeeRequest;
}

export namespace EstimateFeeRequest {
  export type AsObject = {
    addrtoamountMap: Array<[string, number]>,
    targetConf: number,
  }
}

export class EstimateFeeResponse extends jspb.Message {
  getFeeSat(): number;
  setFeeSat(value: number): void;

  getFeerateSatPerByte(): number;
  setFeerateSatPerByte(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EstimateFeeResponse.AsObject;
  static toObject(includeInstance: boolean, msg: EstimateFeeResponse): EstimateFeeResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: EstimateFeeResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EstimateFeeResponse;
  static deserializeBinaryFromReader(message: EstimateFeeResponse, reader: jspb.BinaryReader): EstimateFeeResponse;
}

export namespace EstimateFeeResponse {
  export type AsObject = {
    feeSat: number,
    feerateSatPerByte: number,
  }
}

export class SendManyRequest extends jspb.Message {
  getAddrtoamountMap(): jspb.Map<string, number>;
  clearAddrtoamountMap(): void;
  getTargetConf(): number;
  setTargetConf(value: number): void;

  getSatPerByte(): number;
  setSatPerByte(value: number): void;

  getLabel(): string;
  setLabel(value: string): void;

  getMinConfs(): number;
  setMinConfs(value: number): void;

  getSpendUnconfirmed(): boolean;
  setSpendUnconfirmed(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendManyRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SendManyRequest): SendManyRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SendManyRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendManyRequest;
  static deserializeBinaryFromReader(message: SendManyRequest, reader: jspb.BinaryReader): SendManyRequest;
}

export namespace SendManyRequest {
  export type AsObject = {
    addrtoamountMap: Array<[string, number]>,
    targetConf: number,
    satPerByte: number,
    label: string,
    minConfs: number,
    spendUnconfirmed: boolean,
  }
}

export class SendManyResponse extends jspb.Message {
  getTxid(): string;
  setTxid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendManyResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SendManyResponse): SendManyResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SendManyResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendManyResponse;
  static deserializeBinaryFromReader(message: SendManyResponse, reader: jspb.BinaryReader): SendManyResponse;
}

export namespace SendManyResponse {
  export type AsObject = {
    txid: string,
  }
}

export class SendCoinsRequest extends jspb.Message {
  getAddr(): string;
  setAddr(value: string): void;

  getAmount(): number;
  setAmount(value: number): void;

  getTargetConf(): number;
  setTargetConf(value: number): void;

  getSatPerByte(): number;
  setSatPerByte(value: number): void;

  getSendAll(): boolean;
  setSendAll(value: boolean): void;

  getLabel(): string;
  setLabel(value: string): void;

  getMinConfs(): number;
  setMinConfs(value: number): void;

  getSpendUnconfirmed(): boolean;
  setSpendUnconfirmed(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendCoinsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SendCoinsRequest): SendCoinsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SendCoinsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendCoinsRequest;
  static deserializeBinaryFromReader(message: SendCoinsRequest, reader: jspb.BinaryReader): SendCoinsRequest;
}

export namespace SendCoinsRequest {
  export type AsObject = {
    addr: string,
    amount: number,
    targetConf: number,
    satPerByte: number,
    sendAll: boolean,
    label: string,
    minConfs: number,
    spendUnconfirmed: boolean,
  }
}

export class SendCoinsResponse extends jspb.Message {
  getTxid(): string;
  setTxid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendCoinsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SendCoinsResponse): SendCoinsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SendCoinsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendCoinsResponse;
  static deserializeBinaryFromReader(message: SendCoinsResponse, reader: jspb.BinaryReader): SendCoinsResponse;
}

export namespace SendCoinsResponse {
  export type AsObject = {
    txid: string,
  }
}

export class ListUnspentRequest extends jspb.Message {
  getMinConfs(): number;
  setMinConfs(value: number): void;

  getMaxConfs(): number;
  setMaxConfs(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListUnspentRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListUnspentRequest): ListUnspentRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListUnspentRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListUnspentRequest;
  static deserializeBinaryFromReader(message: ListUnspentRequest, reader: jspb.BinaryReader): ListUnspentRequest;
}

export namespace ListUnspentRequest {
  export type AsObject = {
    minConfs: number,
    maxConfs: number,
  }
}

export class ListUnspentResponse extends jspb.Message {
  clearUtxosList(): void;
  getUtxosList(): Array<Utxo>;
  setUtxosList(value: Array<Utxo>): void;
  addUtxos(value?: Utxo, index?: number): Utxo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListUnspentResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListUnspentResponse): ListUnspentResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListUnspentResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListUnspentResponse;
  static deserializeBinaryFromReader(message: ListUnspentResponse, reader: jspb.BinaryReader): ListUnspentResponse;
}

export namespace ListUnspentResponse {
  export type AsObject = {
    utxosList: Array<Utxo.AsObject>,
  }
}

export class NewAddressRequest extends jspb.Message {
  getType(): AddressTypeMap[keyof AddressTypeMap];
  setType(value: AddressTypeMap[keyof AddressTypeMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NewAddressRequest.AsObject;
  static toObject(includeInstance: boolean, msg: NewAddressRequest): NewAddressRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NewAddressRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NewAddressRequest;
  static deserializeBinaryFromReader(message: NewAddressRequest, reader: jspb.BinaryReader): NewAddressRequest;
}

export namespace NewAddressRequest {
  export type AsObject = {
    type: AddressTypeMap[keyof AddressTypeMap],
  }
}

export class NewAddressResponse extends jspb.Message {
  getAddress(): string;
  setAddress(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NewAddressResponse.AsObject;
  static toObject(includeInstance: boolean, msg: NewAddressResponse): NewAddressResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NewAddressResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NewAddressResponse;
  static deserializeBinaryFromReader(message: NewAddressResponse, reader: jspb.BinaryReader): NewAddressResponse;
}

export namespace NewAddressResponse {
  export type AsObject = {
    address: string,
  }
}

export class SignMessageRequest extends jspb.Message {
  getMsg(): Uint8Array | string;
  getMsg_asU8(): Uint8Array;
  getMsg_asB64(): string;
  setMsg(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SignMessageRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SignMessageRequest): SignMessageRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SignMessageRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SignMessageRequest;
  static deserializeBinaryFromReader(message: SignMessageRequest, reader: jspb.BinaryReader): SignMessageRequest;
}

export namespace SignMessageRequest {
  export type AsObject = {
    msg: Uint8Array | string,
  }
}

export class SignMessageResponse extends jspb.Message {
  getSignature(): string;
  setSignature(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SignMessageResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SignMessageResponse): SignMessageResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SignMessageResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SignMessageResponse;
  static deserializeBinaryFromReader(message: SignMessageResponse, reader: jspb.BinaryReader): SignMessageResponse;
}

export namespace SignMessageResponse {
  export type AsObject = {
    signature: string,
  }
}

export class VerifyMessageRequest extends jspb.Message {
  getMsg(): Uint8Array | string;
  getMsg_asU8(): Uint8Array;
  getMsg_asB64(): string;
  setMsg(value: Uint8Array | string): void;

  getSignature(): string;
  setSignature(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VerifyMessageRequest.AsObject;
  static toObject(includeInstance: boolean, msg: VerifyMessageRequest): VerifyMessageRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: VerifyMessageRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VerifyMessageRequest;
  static deserializeBinaryFromReader(message: VerifyMessageRequest, reader: jspb.BinaryReader): VerifyMessageRequest;
}

export namespace VerifyMessageRequest {
  export type AsObject = {
    msg: Uint8Array | string,
    signature: string,
  }
}

export class VerifyMessageResponse extends jspb.Message {
  getValid(): boolean;
  setValid(value: boolean): void;

  getPubkey(): string;
  setPubkey(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VerifyMessageResponse.AsObject;
  static toObject(includeInstance: boolean, msg: VerifyMessageResponse): VerifyMessageResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: VerifyMessageResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VerifyMessageResponse;
  static deserializeBinaryFromReader(message: VerifyMessageResponse, reader: jspb.BinaryReader): VerifyMessageResponse;
}

export namespace VerifyMessageResponse {
  export type AsObject = {
    valid: boolean,
    pubkey: string,
  }
}

export class ConnectPeerRequest extends jspb.Message {
  hasAddr(): boolean;
  clearAddr(): void;
  getAddr(): LightningAddress | undefined;
  setAddr(value?: LightningAddress): void;

  getPerm(): boolean;
  setPerm(value: boolean): void;

  getTimeout(): number;
  setTimeout(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConnectPeerRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ConnectPeerRequest): ConnectPeerRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ConnectPeerRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConnectPeerRequest;
  static deserializeBinaryFromReader(message: ConnectPeerRequest, reader: jspb.BinaryReader): ConnectPeerRequest;
}

export namespace ConnectPeerRequest {
  export type AsObject = {
    addr?: LightningAddress.AsObject,
    perm: boolean,
    timeout: number,
  }
}

export class ConnectPeerResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConnectPeerResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ConnectPeerResponse): ConnectPeerResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ConnectPeerResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConnectPeerResponse;
  static deserializeBinaryFromReader(message: ConnectPeerResponse, reader: jspb.BinaryReader): ConnectPeerResponse;
}

export namespace ConnectPeerResponse {
  export type AsObject = {
  }
}

export class DisconnectPeerRequest extends jspb.Message {
  getPubKey(): string;
  setPubKey(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DisconnectPeerRequest.AsObject;
  static toObject(includeInstance: boolean, msg: DisconnectPeerRequest): DisconnectPeerRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DisconnectPeerRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DisconnectPeerRequest;
  static deserializeBinaryFromReader(message: DisconnectPeerRequest, reader: jspb.BinaryReader): DisconnectPeerRequest;
}

export namespace DisconnectPeerRequest {
  export type AsObject = {
    pubKey: string,
  }
}

export class DisconnectPeerResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DisconnectPeerResponse.AsObject;
  static toObject(includeInstance: boolean, msg: DisconnectPeerResponse): DisconnectPeerResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DisconnectPeerResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DisconnectPeerResponse;
  static deserializeBinaryFromReader(message: DisconnectPeerResponse, reader: jspb.BinaryReader): DisconnectPeerResponse;
}

export namespace DisconnectPeerResponse {
  export type AsObject = {
  }
}

export class HTLC extends jspb.Message {
  getIncoming(): boolean;
  setIncoming(value: boolean): void;

  getAmount(): number;
  setAmount(value: number): void;

  getHashLock(): Uint8Array | string;
  getHashLock_asU8(): Uint8Array;
  getHashLock_asB64(): string;
  setHashLock(value: Uint8Array | string): void;

  getExpirationHeight(): number;
  setExpirationHeight(value: number): void;

  getHtlcIndex(): number;
  setHtlcIndex(value: number): void;

  getForwardingChannel(): number;
  setForwardingChannel(value: number): void;

  getForwardingHtlcIndex(): number;
  setForwardingHtlcIndex(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HTLC.AsObject;
  static toObject(includeInstance: boolean, msg: HTLC): HTLC.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: HTLC, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HTLC;
  static deserializeBinaryFromReader(message: HTLC, reader: jspb.BinaryReader): HTLC;
}

export namespace HTLC {
  export type AsObject = {
    incoming: boolean,
    amount: number,
    hashLock: Uint8Array | string,
    expirationHeight: number,
    htlcIndex: number,
    forwardingChannel: number,
    forwardingHtlcIndex: number,
  }
}

export class ChannelConstraints extends jspb.Message {
  getCsvDelay(): number;
  setCsvDelay(value: number): void;

  getChanReserveSat(): number;
  setChanReserveSat(value: number): void;

  getDustLimitSat(): number;
  setDustLimitSat(value: number): void;

  getMaxPendingAmtMsat(): number;
  setMaxPendingAmtMsat(value: number): void;

  getMinHtlcMsat(): number;
  setMinHtlcMsat(value: number): void;

  getMaxAcceptedHtlcs(): number;
  setMaxAcceptedHtlcs(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChannelConstraints.AsObject;
  static toObject(includeInstance: boolean, msg: ChannelConstraints): ChannelConstraints.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChannelConstraints, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChannelConstraints;
  static deserializeBinaryFromReader(message: ChannelConstraints, reader: jspb.BinaryReader): ChannelConstraints;
}

export namespace ChannelConstraints {
  export type AsObject = {
    csvDelay: number,
    chanReserveSat: number,
    dustLimitSat: number,
    maxPendingAmtMsat: number,
    minHtlcMsat: number,
    maxAcceptedHtlcs: number,
  }
}

export class Channel extends jspb.Message {
  getActive(): boolean;
  setActive(value: boolean): void;

  getRemotePubkey(): string;
  setRemotePubkey(value: string): void;

  getChannelPoint(): string;
  setChannelPoint(value: string): void;

  getChanId(): string;
  setChanId(value: string): void;

  getCapacity(): number;
  setCapacity(value: number): void;

  getLocalBalance(): number;
  setLocalBalance(value: number): void;

  getRemoteBalance(): number;
  setRemoteBalance(value: number): void;

  getCommitFee(): number;
  setCommitFee(value: number): void;

  getCommitWeight(): number;
  setCommitWeight(value: number): void;

  getFeePerKw(): number;
  setFeePerKw(value: number): void;

  getUnsettledBalance(): number;
  setUnsettledBalance(value: number): void;

  getTotalSatoshisSent(): number;
  setTotalSatoshisSent(value: number): void;

  getTotalSatoshisReceived(): number;
  setTotalSatoshisReceived(value: number): void;

  getNumUpdates(): number;
  setNumUpdates(value: number): void;

  clearPendingHtlcsList(): void;
  getPendingHtlcsList(): Array<HTLC>;
  setPendingHtlcsList(value: Array<HTLC>): void;
  addPendingHtlcs(value?: HTLC, index?: number): HTLC;

  getCsvDelay(): number;
  setCsvDelay(value: number): void;

  getPrivate(): boolean;
  setPrivate(value: boolean): void;

  getInitiator(): boolean;
  setInitiator(value: boolean): void;

  getChanStatusFlags(): string;
  setChanStatusFlags(value: string): void;

  getLocalChanReserveSat(): number;
  setLocalChanReserveSat(value: number): void;

  getRemoteChanReserveSat(): number;
  setRemoteChanReserveSat(value: number): void;

  getStaticRemoteKey(): boolean;
  setStaticRemoteKey(value: boolean): void;

  getCommitmentType(): CommitmentTypeMap[keyof CommitmentTypeMap];
  setCommitmentType(value: CommitmentTypeMap[keyof CommitmentTypeMap]): void;

  getLifetime(): number;
  setLifetime(value: number): void;

  getUptime(): number;
  setUptime(value: number): void;

  getCloseAddress(): string;
  setCloseAddress(value: string): void;

  getPushAmountSat(): number;
  setPushAmountSat(value: number): void;

  getThawHeight(): number;
  setThawHeight(value: number): void;

  hasLocalConstraints(): boolean;
  clearLocalConstraints(): void;
  getLocalConstraints(): ChannelConstraints | undefined;
  setLocalConstraints(value?: ChannelConstraints): void;

  hasRemoteConstraints(): boolean;
  clearRemoteConstraints(): void;
  getRemoteConstraints(): ChannelConstraints | undefined;
  setRemoteConstraints(value?: ChannelConstraints): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Channel.AsObject;
  static toObject(includeInstance: boolean, msg: Channel): Channel.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Channel, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Channel;
  static deserializeBinaryFromReader(message: Channel, reader: jspb.BinaryReader): Channel;
}

export namespace Channel {
  export type AsObject = {
    active: boolean,
    remotePubkey: string,
    channelPoint: string,
    chanId: string,
    capacity: number,
    localBalance: number,
    remoteBalance: number,
    commitFee: number,
    commitWeight: number,
    feePerKw: number,
    unsettledBalance: number,
    totalSatoshisSent: number,
    totalSatoshisReceived: number,
    numUpdates: number,
    pendingHtlcsList: Array<HTLC.AsObject>,
    csvDelay: number,
    pb_private: boolean,
    initiator: boolean,
    chanStatusFlags: string,
    localChanReserveSat: number,
    remoteChanReserveSat: number,
    staticRemoteKey: boolean,
    commitmentType: CommitmentTypeMap[keyof CommitmentTypeMap],
    lifetime: number,
    uptime: number,
    closeAddress: string,
    pushAmountSat: number,
    thawHeight: number,
    localConstraints?: ChannelConstraints.AsObject,
    remoteConstraints?: ChannelConstraints.AsObject,
  }
}

export class ListChannelsRequest extends jspb.Message {
  getActiveOnly(): boolean;
  setActiveOnly(value: boolean): void;

  getInactiveOnly(): boolean;
  setInactiveOnly(value: boolean): void;

  getPublicOnly(): boolean;
  setPublicOnly(value: boolean): void;

  getPrivateOnly(): boolean;
  setPrivateOnly(value: boolean): void;

  getPeer(): Uint8Array | string;
  getPeer_asU8(): Uint8Array;
  getPeer_asB64(): string;
  setPeer(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListChannelsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListChannelsRequest): ListChannelsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListChannelsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListChannelsRequest;
  static deserializeBinaryFromReader(message: ListChannelsRequest, reader: jspb.BinaryReader): ListChannelsRequest;
}

export namespace ListChannelsRequest {
  export type AsObject = {
    activeOnly: boolean,
    inactiveOnly: boolean,
    publicOnly: boolean,
    privateOnly: boolean,
    peer: Uint8Array | string,
  }
}

export class ListChannelsResponse extends jspb.Message {
  clearChannelsList(): void;
  getChannelsList(): Array<Channel>;
  setChannelsList(value: Array<Channel>): void;
  addChannels(value?: Channel, index?: number): Channel;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListChannelsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListChannelsResponse): ListChannelsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListChannelsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListChannelsResponse;
  static deserializeBinaryFromReader(message: ListChannelsResponse, reader: jspb.BinaryReader): ListChannelsResponse;
}

export namespace ListChannelsResponse {
  export type AsObject = {
    channelsList: Array<Channel.AsObject>,
  }
}

export class ChannelCloseSummary extends jspb.Message {
  getChannelPoint(): string;
  setChannelPoint(value: string): void;

  getChanId(): string;
  setChanId(value: string): void;

  getChainHash(): string;
  setChainHash(value: string): void;

  getClosingTxHash(): string;
  setClosingTxHash(value: string): void;

  getRemotePubkey(): string;
  setRemotePubkey(value: string): void;

  getCapacity(): number;
  setCapacity(value: number): void;

  getCloseHeight(): number;
  setCloseHeight(value: number): void;

  getSettledBalance(): number;
  setSettledBalance(value: number): void;

  getTimeLockedBalance(): number;
  setTimeLockedBalance(value: number): void;

  getCloseType(): ChannelCloseSummary.ClosureTypeMap[keyof ChannelCloseSummary.ClosureTypeMap];
  setCloseType(value: ChannelCloseSummary.ClosureTypeMap[keyof ChannelCloseSummary.ClosureTypeMap]): void;

  getOpenInitiator(): InitiatorMap[keyof InitiatorMap];
  setOpenInitiator(value: InitiatorMap[keyof InitiatorMap]): void;

  getCloseInitiator(): InitiatorMap[keyof InitiatorMap];
  setCloseInitiator(value: InitiatorMap[keyof InitiatorMap]): void;

  clearResolutionsList(): void;
  getResolutionsList(): Array<Resolution>;
  setResolutionsList(value: Array<Resolution>): void;
  addResolutions(value?: Resolution, index?: number): Resolution;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChannelCloseSummary.AsObject;
  static toObject(includeInstance: boolean, msg: ChannelCloseSummary): ChannelCloseSummary.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChannelCloseSummary, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChannelCloseSummary;
  static deserializeBinaryFromReader(message: ChannelCloseSummary, reader: jspb.BinaryReader): ChannelCloseSummary;
}

export namespace ChannelCloseSummary {
  export type AsObject = {
    channelPoint: string,
    chanId: string,
    chainHash: string,
    closingTxHash: string,
    remotePubkey: string,
    capacity: number,
    closeHeight: number,
    settledBalance: number,
    timeLockedBalance: number,
    closeType: ChannelCloseSummary.ClosureTypeMap[keyof ChannelCloseSummary.ClosureTypeMap],
    openInitiator: InitiatorMap[keyof InitiatorMap],
    closeInitiator: InitiatorMap[keyof InitiatorMap],
    resolutionsList: Array<Resolution.AsObject>,
  }

  export interface ClosureTypeMap {
    COOPERATIVE_CLOSE: 0;
    LOCAL_FORCE_CLOSE: 1;
    REMOTE_FORCE_CLOSE: 2;
    BREACH_CLOSE: 3;
    FUNDING_CANCELED: 4;
    ABANDONED: 5;
  }

  export const ClosureType: ClosureTypeMap;
}

export class Resolution extends jspb.Message {
  getResolutionType(): ResolutionTypeMap[keyof ResolutionTypeMap];
  setResolutionType(value: ResolutionTypeMap[keyof ResolutionTypeMap]): void;

  getOutcome(): ResolutionOutcomeMap[keyof ResolutionOutcomeMap];
  setOutcome(value: ResolutionOutcomeMap[keyof ResolutionOutcomeMap]): void;

  hasOutpoint(): boolean;
  clearOutpoint(): void;
  getOutpoint(): OutPoint | undefined;
  setOutpoint(value?: OutPoint): void;

  getAmountSat(): number;
  setAmountSat(value: number): void;

  getSweepTxid(): string;
  setSweepTxid(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Resolution.AsObject;
  static toObject(includeInstance: boolean, msg: Resolution): Resolution.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Resolution, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Resolution;
  static deserializeBinaryFromReader(message: Resolution, reader: jspb.BinaryReader): Resolution;
}

export namespace Resolution {
  export type AsObject = {
    resolutionType: ResolutionTypeMap[keyof ResolutionTypeMap],
    outcome: ResolutionOutcomeMap[keyof ResolutionOutcomeMap],
    outpoint?: OutPoint.AsObject,
    amountSat: number,
    sweepTxid: string,
  }
}

export class ClosedChannelsRequest extends jspb.Message {
  getCooperative(): boolean;
  setCooperative(value: boolean): void;

  getLocalForce(): boolean;
  setLocalForce(value: boolean): void;

  getRemoteForce(): boolean;
  setRemoteForce(value: boolean): void;

  getBreach(): boolean;
  setBreach(value: boolean): void;

  getFundingCanceled(): boolean;
  setFundingCanceled(value: boolean): void;

  getAbandoned(): boolean;
  setAbandoned(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ClosedChannelsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ClosedChannelsRequest): ClosedChannelsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ClosedChannelsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ClosedChannelsRequest;
  static deserializeBinaryFromReader(message: ClosedChannelsRequest, reader: jspb.BinaryReader): ClosedChannelsRequest;
}

export namespace ClosedChannelsRequest {
  export type AsObject = {
    cooperative: boolean,
    localForce: boolean,
    remoteForce: boolean,
    breach: boolean,
    fundingCanceled: boolean,
    abandoned: boolean,
  }
}

export class ClosedChannelsResponse extends jspb.Message {
  clearChannelsList(): void;
  getChannelsList(): Array<ChannelCloseSummary>;
  setChannelsList(value: Array<ChannelCloseSummary>): void;
  addChannels(value?: ChannelCloseSummary, index?: number): ChannelCloseSummary;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ClosedChannelsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ClosedChannelsResponse): ClosedChannelsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ClosedChannelsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ClosedChannelsResponse;
  static deserializeBinaryFromReader(message: ClosedChannelsResponse, reader: jspb.BinaryReader): ClosedChannelsResponse;
}

export namespace ClosedChannelsResponse {
  export type AsObject = {
    channelsList: Array<ChannelCloseSummary.AsObject>,
  }
}

export class Peer extends jspb.Message {
  getPubKey(): string;
  setPubKey(value: string): void;

  getAddress(): string;
  setAddress(value: string): void;

  getBytesSent(): number;
  setBytesSent(value: number): void;

  getBytesRecv(): number;
  setBytesRecv(value: number): void;

  getSatSent(): number;
  setSatSent(value: number): void;

  getSatRecv(): number;
  setSatRecv(value: number): void;

  getInbound(): boolean;
  setInbound(value: boolean): void;

  getPingTime(): number;
  setPingTime(value: number): void;

  getSyncType(): Peer.SyncTypeMap[keyof Peer.SyncTypeMap];
  setSyncType(value: Peer.SyncTypeMap[keyof Peer.SyncTypeMap]): void;

  getFeaturesMap(): jspb.Map<number, Feature>;
  clearFeaturesMap(): void;
  clearErrorsList(): void;
  getErrorsList(): Array<TimestampedError>;
  setErrorsList(value: Array<TimestampedError>): void;
  addErrors(value?: TimestampedError, index?: number): TimestampedError;

  getFlapCount(): number;
  setFlapCount(value: number): void;

  getLastFlapNs(): number;
  setLastFlapNs(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Peer.AsObject;
  static toObject(includeInstance: boolean, msg: Peer): Peer.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Peer, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Peer;
  static deserializeBinaryFromReader(message: Peer, reader: jspb.BinaryReader): Peer;
}

export namespace Peer {
  export type AsObject = {
    pubKey: string,
    address: string,
    bytesSent: number,
    bytesRecv: number,
    satSent: number,
    satRecv: number,
    inbound: boolean,
    pingTime: number,
    syncType: Peer.SyncTypeMap[keyof Peer.SyncTypeMap],
    featuresMap: Array<[number, Feature.AsObject]>,
    errorsList: Array<TimestampedError.AsObject>,
    flapCount: number,
    lastFlapNs: number,
  }

  export interface SyncTypeMap {
    UNKNOWN_SYNC: 0;
    ACTIVE_SYNC: 1;
    PASSIVE_SYNC: 2;
  }

  export const SyncType: SyncTypeMap;
}

export class TimestampedError extends jspb.Message {
  getTimestamp(): number;
  setTimestamp(value: number): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TimestampedError.AsObject;
  static toObject(includeInstance: boolean, msg: TimestampedError): TimestampedError.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TimestampedError, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TimestampedError;
  static deserializeBinaryFromReader(message: TimestampedError, reader: jspb.BinaryReader): TimestampedError;
}

export namespace TimestampedError {
  export type AsObject = {
    timestamp: number,
    error: string,
  }
}

export class ListPeersRequest extends jspb.Message {
  getLatestError(): boolean;
  setLatestError(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListPeersRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListPeersRequest): ListPeersRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListPeersRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListPeersRequest;
  static deserializeBinaryFromReader(message: ListPeersRequest, reader: jspb.BinaryReader): ListPeersRequest;
}

export namespace ListPeersRequest {
  export type AsObject = {
    latestError: boolean,
  }
}

export class ListPeersResponse extends jspb.Message {
  clearPeersList(): void;
  getPeersList(): Array<Peer>;
  setPeersList(value: Array<Peer>): void;
  addPeers(value?: Peer, index?: number): Peer;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListPeersResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListPeersResponse): ListPeersResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListPeersResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListPeersResponse;
  static deserializeBinaryFromReader(message: ListPeersResponse, reader: jspb.BinaryReader): ListPeersResponse;
}

export namespace ListPeersResponse {
  export type AsObject = {
    peersList: Array<Peer.AsObject>,
  }
}

export class PeerEventSubscription extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PeerEventSubscription.AsObject;
  static toObject(includeInstance: boolean, msg: PeerEventSubscription): PeerEventSubscription.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PeerEventSubscription, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PeerEventSubscription;
  static deserializeBinaryFromReader(message: PeerEventSubscription, reader: jspb.BinaryReader): PeerEventSubscription;
}

export namespace PeerEventSubscription {
  export type AsObject = {
  }
}

export class PeerEvent extends jspb.Message {
  getPubKey(): string;
  setPubKey(value: string): void;

  getType(): PeerEvent.EventTypeMap[keyof PeerEvent.EventTypeMap];
  setType(value: PeerEvent.EventTypeMap[keyof PeerEvent.EventTypeMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PeerEvent.AsObject;
  static toObject(includeInstance: boolean, msg: PeerEvent): PeerEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PeerEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PeerEvent;
  static deserializeBinaryFromReader(message: PeerEvent, reader: jspb.BinaryReader): PeerEvent;
}

export namespace PeerEvent {
  export type AsObject = {
    pubKey: string,
    type: PeerEvent.EventTypeMap[keyof PeerEvent.EventTypeMap],
  }

  export interface EventTypeMap {
    PEER_ONLINE: 0;
    PEER_OFFLINE: 1;
  }

  export const EventType: EventTypeMap;
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

  getCommitHash(): string;
  setCommitHash(value: string): void;

  getIdentityPubkey(): string;
  setIdentityPubkey(value: string): void;

  getAlias(): string;
  setAlias(value: string): void;

  getColor(): string;
  setColor(value: string): void;

  getNumPendingChannels(): number;
  setNumPendingChannels(value: number): void;

  getNumActiveChannels(): number;
  setNumActiveChannels(value: number): void;

  getNumInactiveChannels(): number;
  setNumInactiveChannels(value: number): void;

  getNumPeers(): number;
  setNumPeers(value: number): void;

  getBlockHeight(): number;
  setBlockHeight(value: number): void;

  getBlockHash(): string;
  setBlockHash(value: string): void;

  getBestHeaderTimestamp(): number;
  setBestHeaderTimestamp(value: number): void;

  getSyncedToChain(): boolean;
  setSyncedToChain(value: boolean): void;

  getSyncedToGraph(): boolean;
  setSyncedToGraph(value: boolean): void;

  getTestnet(): boolean;
  setTestnet(value: boolean): void;

  clearChainsList(): void;
  getChainsList(): Array<Chain>;
  setChainsList(value: Array<Chain>): void;
  addChains(value?: Chain, index?: number): Chain;

  clearUrisList(): void;
  getUrisList(): Array<string>;
  setUrisList(value: Array<string>): void;
  addUris(value: string, index?: number): string;

  getFeaturesMap(): jspb.Map<number, Feature>;
  clearFeaturesMap(): void;
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
    commitHash: string,
    identityPubkey: string,
    alias: string,
    color: string,
    numPendingChannels: number,
    numActiveChannels: number,
    numInactiveChannels: number,
    numPeers: number,
    blockHeight: number,
    blockHash: string,
    bestHeaderTimestamp: number,
    syncedToChain: boolean,
    syncedToGraph: boolean,
    testnet: boolean,
    chainsList: Array<Chain.AsObject>,
    urisList: Array<string>,
    featuresMap: Array<[number, Feature.AsObject]>,
  }
}

export class GetRecoveryInfoRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetRecoveryInfoRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetRecoveryInfoRequest): GetRecoveryInfoRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetRecoveryInfoRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetRecoveryInfoRequest;
  static deserializeBinaryFromReader(message: GetRecoveryInfoRequest, reader: jspb.BinaryReader): GetRecoveryInfoRequest;
}

export namespace GetRecoveryInfoRequest {
  export type AsObject = {
  }
}

export class GetRecoveryInfoResponse extends jspb.Message {
  getRecoveryMode(): boolean;
  setRecoveryMode(value: boolean): void;

  getRecoveryFinished(): boolean;
  setRecoveryFinished(value: boolean): void;

  getProgress(): number;
  setProgress(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetRecoveryInfoResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetRecoveryInfoResponse): GetRecoveryInfoResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetRecoveryInfoResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetRecoveryInfoResponse;
  static deserializeBinaryFromReader(message: GetRecoveryInfoResponse, reader: jspb.BinaryReader): GetRecoveryInfoResponse;
}

export namespace GetRecoveryInfoResponse {
  export type AsObject = {
    recoveryMode: boolean,
    recoveryFinished: boolean,
    progress: number,
  }
}

export class Chain extends jspb.Message {
  getChain(): string;
  setChain(value: string): void;

  getNetwork(): string;
  setNetwork(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Chain.AsObject;
  static toObject(includeInstance: boolean, msg: Chain): Chain.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Chain, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Chain;
  static deserializeBinaryFromReader(message: Chain, reader: jspb.BinaryReader): Chain;
}

export namespace Chain {
  export type AsObject = {
    chain: string,
    network: string,
  }
}

export class ConfirmationUpdate extends jspb.Message {
  getBlockSha(): Uint8Array | string;
  getBlockSha_asU8(): Uint8Array;
  getBlockSha_asB64(): string;
  setBlockSha(value: Uint8Array | string): void;

  getBlockHeight(): number;
  setBlockHeight(value: number): void;

  getNumConfsLeft(): number;
  setNumConfsLeft(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConfirmationUpdate.AsObject;
  static toObject(includeInstance: boolean, msg: ConfirmationUpdate): ConfirmationUpdate.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ConfirmationUpdate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConfirmationUpdate;
  static deserializeBinaryFromReader(message: ConfirmationUpdate, reader: jspb.BinaryReader): ConfirmationUpdate;
}

export namespace ConfirmationUpdate {
  export type AsObject = {
    blockSha: Uint8Array | string,
    blockHeight: number,
    numConfsLeft: number,
  }
}

export class ChannelOpenUpdate extends jspb.Message {
  hasChannelPoint(): boolean;
  clearChannelPoint(): void;
  getChannelPoint(): ChannelPoint | undefined;
  setChannelPoint(value?: ChannelPoint): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChannelOpenUpdate.AsObject;
  static toObject(includeInstance: boolean, msg: ChannelOpenUpdate): ChannelOpenUpdate.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChannelOpenUpdate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChannelOpenUpdate;
  static deserializeBinaryFromReader(message: ChannelOpenUpdate, reader: jspb.BinaryReader): ChannelOpenUpdate;
}

export namespace ChannelOpenUpdate {
  export type AsObject = {
    channelPoint?: ChannelPoint.AsObject,
  }
}

export class ChannelCloseUpdate extends jspb.Message {
  getClosingTxid(): Uint8Array | string;
  getClosingTxid_asU8(): Uint8Array;
  getClosingTxid_asB64(): string;
  setClosingTxid(value: Uint8Array | string): void;

  getSuccess(): boolean;
  setSuccess(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChannelCloseUpdate.AsObject;
  static toObject(includeInstance: boolean, msg: ChannelCloseUpdate): ChannelCloseUpdate.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChannelCloseUpdate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChannelCloseUpdate;
  static deserializeBinaryFromReader(message: ChannelCloseUpdate, reader: jspb.BinaryReader): ChannelCloseUpdate;
}

export namespace ChannelCloseUpdate {
  export type AsObject = {
    closingTxid: Uint8Array | string,
    success: boolean,
  }
}

export class CloseChannelRequest extends jspb.Message {
  hasChannelPoint(): boolean;
  clearChannelPoint(): void;
  getChannelPoint(): ChannelPoint | undefined;
  setChannelPoint(value?: ChannelPoint): void;

  getForce(): boolean;
  setForce(value: boolean): void;

  getTargetConf(): number;
  setTargetConf(value: number): void;

  getSatPerByte(): number;
  setSatPerByte(value: number): void;

  getDeliveryAddress(): string;
  setDeliveryAddress(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CloseChannelRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CloseChannelRequest): CloseChannelRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CloseChannelRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CloseChannelRequest;
  static deserializeBinaryFromReader(message: CloseChannelRequest, reader: jspb.BinaryReader): CloseChannelRequest;
}

export namespace CloseChannelRequest {
  export type AsObject = {
    channelPoint?: ChannelPoint.AsObject,
    force: boolean,
    targetConf: number,
    satPerByte: number,
    deliveryAddress: string,
  }
}

export class CloseStatusUpdate extends jspb.Message {
  hasClosePending(): boolean;
  clearClosePending(): void;
  getClosePending(): PendingUpdate | undefined;
  setClosePending(value?: PendingUpdate): void;

  hasChanClose(): boolean;
  clearChanClose(): void;
  getChanClose(): ChannelCloseUpdate | undefined;
  setChanClose(value?: ChannelCloseUpdate): void;

  getUpdateCase(): CloseStatusUpdate.UpdateCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CloseStatusUpdate.AsObject;
  static toObject(includeInstance: boolean, msg: CloseStatusUpdate): CloseStatusUpdate.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CloseStatusUpdate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CloseStatusUpdate;
  static deserializeBinaryFromReader(message: CloseStatusUpdate, reader: jspb.BinaryReader): CloseStatusUpdate;
}

export namespace CloseStatusUpdate {
  export type AsObject = {
    closePending?: PendingUpdate.AsObject,
    chanClose?: ChannelCloseUpdate.AsObject,
  }

  export enum UpdateCase {
    UPDATE_NOT_SET = 0,
    CLOSE_PENDING = 1,
    CHAN_CLOSE = 3,
  }
}

export class PendingUpdate extends jspb.Message {
  getTxid(): Uint8Array | string;
  getTxid_asU8(): Uint8Array;
  getTxid_asB64(): string;
  setTxid(value: Uint8Array | string): void;

  getOutputIndex(): number;
  setOutputIndex(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PendingUpdate.AsObject;
  static toObject(includeInstance: boolean, msg: PendingUpdate): PendingUpdate.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PendingUpdate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PendingUpdate;
  static deserializeBinaryFromReader(message: PendingUpdate, reader: jspb.BinaryReader): PendingUpdate;
}

export namespace PendingUpdate {
  export type AsObject = {
    txid: Uint8Array | string,
    outputIndex: number,
  }
}

export class ReadyForPsbtFunding extends jspb.Message {
  getFundingAddress(): string;
  setFundingAddress(value: string): void;

  getFundingAmount(): number;
  setFundingAmount(value: number): void;

  getPsbt(): Uint8Array | string;
  getPsbt_asU8(): Uint8Array;
  getPsbt_asB64(): string;
  setPsbt(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReadyForPsbtFunding.AsObject;
  static toObject(includeInstance: boolean, msg: ReadyForPsbtFunding): ReadyForPsbtFunding.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ReadyForPsbtFunding, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReadyForPsbtFunding;
  static deserializeBinaryFromReader(message: ReadyForPsbtFunding, reader: jspb.BinaryReader): ReadyForPsbtFunding;
}

export namespace ReadyForPsbtFunding {
  export type AsObject = {
    fundingAddress: string,
    fundingAmount: number,
    psbt: Uint8Array | string,
  }
}

export class OpenChannelRequest extends jspb.Message {
  getNodePubkey(): Uint8Array | string;
  getNodePubkey_asU8(): Uint8Array;
  getNodePubkey_asB64(): string;
  setNodePubkey(value: Uint8Array | string): void;

  getNodePubkeyString(): string;
  setNodePubkeyString(value: string): void;

  getLocalFundingAmount(): number;
  setLocalFundingAmount(value: number): void;

  getPushSat(): number;
  setPushSat(value: number): void;

  getTargetConf(): number;
  setTargetConf(value: number): void;

  getSatPerByte(): number;
  setSatPerByte(value: number): void;

  getPrivate(): boolean;
  setPrivate(value: boolean): void;

  getMinHtlcMsat(): number;
  setMinHtlcMsat(value: number): void;

  getRemoteCsvDelay(): number;
  setRemoteCsvDelay(value: number): void;

  getMinConfs(): number;
  setMinConfs(value: number): void;

  getSpendUnconfirmed(): boolean;
  setSpendUnconfirmed(value: boolean): void;

  getCloseAddress(): string;
  setCloseAddress(value: string): void;

  hasFundingShim(): boolean;
  clearFundingShim(): void;
  getFundingShim(): FundingShim | undefined;
  setFundingShim(value?: FundingShim): void;

  getRemoteMaxValueInFlightMsat(): number;
  setRemoteMaxValueInFlightMsat(value: number): void;

  getRemoteMaxHtlcs(): number;
  setRemoteMaxHtlcs(value: number): void;

  getMaxLocalCsv(): number;
  setMaxLocalCsv(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OpenChannelRequest.AsObject;
  static toObject(includeInstance: boolean, msg: OpenChannelRequest): OpenChannelRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OpenChannelRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OpenChannelRequest;
  static deserializeBinaryFromReader(message: OpenChannelRequest, reader: jspb.BinaryReader): OpenChannelRequest;
}

export namespace OpenChannelRequest {
  export type AsObject = {
    nodePubkey: Uint8Array | string,
    nodePubkeyString: string,
    localFundingAmount: number,
    pushSat: number,
    targetConf: number,
    satPerByte: number,
    pb_private: boolean,
    minHtlcMsat: number,
    remoteCsvDelay: number,
    minConfs: number,
    spendUnconfirmed: boolean,
    closeAddress: string,
    fundingShim?: FundingShim.AsObject,
    remoteMaxValueInFlightMsat: number,
    remoteMaxHtlcs: number,
    maxLocalCsv: number,
  }
}

export class OpenStatusUpdate extends jspb.Message {
  hasChanPending(): boolean;
  clearChanPending(): void;
  getChanPending(): PendingUpdate | undefined;
  setChanPending(value?: PendingUpdate): void;

  hasChanOpen(): boolean;
  clearChanOpen(): void;
  getChanOpen(): ChannelOpenUpdate | undefined;
  setChanOpen(value?: ChannelOpenUpdate): void;

  hasPsbtFund(): boolean;
  clearPsbtFund(): void;
  getPsbtFund(): ReadyForPsbtFunding | undefined;
  setPsbtFund(value?: ReadyForPsbtFunding): void;

  getPendingChanId(): Uint8Array | string;
  getPendingChanId_asU8(): Uint8Array;
  getPendingChanId_asB64(): string;
  setPendingChanId(value: Uint8Array | string): void;

  getUpdateCase(): OpenStatusUpdate.UpdateCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OpenStatusUpdate.AsObject;
  static toObject(includeInstance: boolean, msg: OpenStatusUpdate): OpenStatusUpdate.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OpenStatusUpdate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OpenStatusUpdate;
  static deserializeBinaryFromReader(message: OpenStatusUpdate, reader: jspb.BinaryReader): OpenStatusUpdate;
}

export namespace OpenStatusUpdate {
  export type AsObject = {
    chanPending?: PendingUpdate.AsObject,
    chanOpen?: ChannelOpenUpdate.AsObject,
    psbtFund?: ReadyForPsbtFunding.AsObject,
    pendingChanId: Uint8Array | string,
  }

  export enum UpdateCase {
    UPDATE_NOT_SET = 0,
    CHAN_PENDING = 1,
    CHAN_OPEN = 3,
    PSBT_FUND = 5,
  }
}

export class KeyLocator extends jspb.Message {
  getKeyFamily(): number;
  setKeyFamily(value: number): void;

  getKeyIndex(): number;
  setKeyIndex(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): KeyLocator.AsObject;
  static toObject(includeInstance: boolean, msg: KeyLocator): KeyLocator.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: KeyLocator, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): KeyLocator;
  static deserializeBinaryFromReader(message: KeyLocator, reader: jspb.BinaryReader): KeyLocator;
}

export namespace KeyLocator {
  export type AsObject = {
    keyFamily: number,
    keyIndex: number,
  }
}

export class KeyDescriptor extends jspb.Message {
  getRawKeyBytes(): Uint8Array | string;
  getRawKeyBytes_asU8(): Uint8Array;
  getRawKeyBytes_asB64(): string;
  setRawKeyBytes(value: Uint8Array | string): void;

  hasKeyLoc(): boolean;
  clearKeyLoc(): void;
  getKeyLoc(): KeyLocator | undefined;
  setKeyLoc(value?: KeyLocator): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): KeyDescriptor.AsObject;
  static toObject(includeInstance: boolean, msg: KeyDescriptor): KeyDescriptor.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: KeyDescriptor, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): KeyDescriptor;
  static deserializeBinaryFromReader(message: KeyDescriptor, reader: jspb.BinaryReader): KeyDescriptor;
}

export namespace KeyDescriptor {
  export type AsObject = {
    rawKeyBytes: Uint8Array | string,
    keyLoc?: KeyLocator.AsObject,
  }
}

export class ChanPointShim extends jspb.Message {
  getAmt(): number;
  setAmt(value: number): void;

  hasChanPoint(): boolean;
  clearChanPoint(): void;
  getChanPoint(): ChannelPoint | undefined;
  setChanPoint(value?: ChannelPoint): void;

  hasLocalKey(): boolean;
  clearLocalKey(): void;
  getLocalKey(): KeyDescriptor | undefined;
  setLocalKey(value?: KeyDescriptor): void;

  getRemoteKey(): Uint8Array | string;
  getRemoteKey_asU8(): Uint8Array;
  getRemoteKey_asB64(): string;
  setRemoteKey(value: Uint8Array | string): void;

  getPendingChanId(): Uint8Array | string;
  getPendingChanId_asU8(): Uint8Array;
  getPendingChanId_asB64(): string;
  setPendingChanId(value: Uint8Array | string): void;

  getThawHeight(): number;
  setThawHeight(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChanPointShim.AsObject;
  static toObject(includeInstance: boolean, msg: ChanPointShim): ChanPointShim.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChanPointShim, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChanPointShim;
  static deserializeBinaryFromReader(message: ChanPointShim, reader: jspb.BinaryReader): ChanPointShim;
}

export namespace ChanPointShim {
  export type AsObject = {
    amt: number,
    chanPoint?: ChannelPoint.AsObject,
    localKey?: KeyDescriptor.AsObject,
    remoteKey: Uint8Array | string,
    pendingChanId: Uint8Array | string,
    thawHeight: number,
  }
}

export class PsbtShim extends jspb.Message {
  getPendingChanId(): Uint8Array | string;
  getPendingChanId_asU8(): Uint8Array;
  getPendingChanId_asB64(): string;
  setPendingChanId(value: Uint8Array | string): void;

  getBasePsbt(): Uint8Array | string;
  getBasePsbt_asU8(): Uint8Array;
  getBasePsbt_asB64(): string;
  setBasePsbt(value: Uint8Array | string): void;

  getNoPublish(): boolean;
  setNoPublish(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PsbtShim.AsObject;
  static toObject(includeInstance: boolean, msg: PsbtShim): PsbtShim.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PsbtShim, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PsbtShim;
  static deserializeBinaryFromReader(message: PsbtShim, reader: jspb.BinaryReader): PsbtShim;
}

export namespace PsbtShim {
  export type AsObject = {
    pendingChanId: Uint8Array | string,
    basePsbt: Uint8Array | string,
    noPublish: boolean,
  }
}

export class FundingShim extends jspb.Message {
  hasChanPointShim(): boolean;
  clearChanPointShim(): void;
  getChanPointShim(): ChanPointShim | undefined;
  setChanPointShim(value?: ChanPointShim): void;

  hasPsbtShim(): boolean;
  clearPsbtShim(): void;
  getPsbtShim(): PsbtShim | undefined;
  setPsbtShim(value?: PsbtShim): void;

  getShimCase(): FundingShim.ShimCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FundingShim.AsObject;
  static toObject(includeInstance: boolean, msg: FundingShim): FundingShim.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FundingShim, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FundingShim;
  static deserializeBinaryFromReader(message: FundingShim, reader: jspb.BinaryReader): FundingShim;
}

export namespace FundingShim {
  export type AsObject = {
    chanPointShim?: ChanPointShim.AsObject,
    psbtShim?: PsbtShim.AsObject,
  }

  export enum ShimCase {
    SHIM_NOT_SET = 0,
    CHAN_POINT_SHIM = 1,
    PSBT_SHIM = 2,
  }
}

export class FundingShimCancel extends jspb.Message {
  getPendingChanId(): Uint8Array | string;
  getPendingChanId_asU8(): Uint8Array;
  getPendingChanId_asB64(): string;
  setPendingChanId(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FundingShimCancel.AsObject;
  static toObject(includeInstance: boolean, msg: FundingShimCancel): FundingShimCancel.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FundingShimCancel, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FundingShimCancel;
  static deserializeBinaryFromReader(message: FundingShimCancel, reader: jspb.BinaryReader): FundingShimCancel;
}

export namespace FundingShimCancel {
  export type AsObject = {
    pendingChanId: Uint8Array | string,
  }
}

export class FundingPsbtVerify extends jspb.Message {
  getFundedPsbt(): Uint8Array | string;
  getFundedPsbt_asU8(): Uint8Array;
  getFundedPsbt_asB64(): string;
  setFundedPsbt(value: Uint8Array | string): void;

  getPendingChanId(): Uint8Array | string;
  getPendingChanId_asU8(): Uint8Array;
  getPendingChanId_asB64(): string;
  setPendingChanId(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FundingPsbtVerify.AsObject;
  static toObject(includeInstance: boolean, msg: FundingPsbtVerify): FundingPsbtVerify.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FundingPsbtVerify, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FundingPsbtVerify;
  static deserializeBinaryFromReader(message: FundingPsbtVerify, reader: jspb.BinaryReader): FundingPsbtVerify;
}

export namespace FundingPsbtVerify {
  export type AsObject = {
    fundedPsbt: Uint8Array | string,
    pendingChanId: Uint8Array | string,
  }
}

export class FundingPsbtFinalize extends jspb.Message {
  getSignedPsbt(): Uint8Array | string;
  getSignedPsbt_asU8(): Uint8Array;
  getSignedPsbt_asB64(): string;
  setSignedPsbt(value: Uint8Array | string): void;

  getPendingChanId(): Uint8Array | string;
  getPendingChanId_asU8(): Uint8Array;
  getPendingChanId_asB64(): string;
  setPendingChanId(value: Uint8Array | string): void;

  getFinalRawTx(): Uint8Array | string;
  getFinalRawTx_asU8(): Uint8Array;
  getFinalRawTx_asB64(): string;
  setFinalRawTx(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FundingPsbtFinalize.AsObject;
  static toObject(includeInstance: boolean, msg: FundingPsbtFinalize): FundingPsbtFinalize.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FundingPsbtFinalize, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FundingPsbtFinalize;
  static deserializeBinaryFromReader(message: FundingPsbtFinalize, reader: jspb.BinaryReader): FundingPsbtFinalize;
}

export namespace FundingPsbtFinalize {
  export type AsObject = {
    signedPsbt: Uint8Array | string,
    pendingChanId: Uint8Array | string,
    finalRawTx: Uint8Array | string,
  }
}

export class FundingTransitionMsg extends jspb.Message {
  hasShimRegister(): boolean;
  clearShimRegister(): void;
  getShimRegister(): FundingShim | undefined;
  setShimRegister(value?: FundingShim): void;

  hasShimCancel(): boolean;
  clearShimCancel(): void;
  getShimCancel(): FundingShimCancel | undefined;
  setShimCancel(value?: FundingShimCancel): void;

  hasPsbtVerify(): boolean;
  clearPsbtVerify(): void;
  getPsbtVerify(): FundingPsbtVerify | undefined;
  setPsbtVerify(value?: FundingPsbtVerify): void;

  hasPsbtFinalize(): boolean;
  clearPsbtFinalize(): void;
  getPsbtFinalize(): FundingPsbtFinalize | undefined;
  setPsbtFinalize(value?: FundingPsbtFinalize): void;

  getTriggerCase(): FundingTransitionMsg.TriggerCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FundingTransitionMsg.AsObject;
  static toObject(includeInstance: boolean, msg: FundingTransitionMsg): FundingTransitionMsg.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FundingTransitionMsg, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FundingTransitionMsg;
  static deserializeBinaryFromReader(message: FundingTransitionMsg, reader: jspb.BinaryReader): FundingTransitionMsg;
}

export namespace FundingTransitionMsg {
  export type AsObject = {
    shimRegister?: FundingShim.AsObject,
    shimCancel?: FundingShimCancel.AsObject,
    psbtVerify?: FundingPsbtVerify.AsObject,
    psbtFinalize?: FundingPsbtFinalize.AsObject,
  }

  export enum TriggerCase {
    TRIGGER_NOT_SET = 0,
    SHIM_REGISTER = 1,
    SHIM_CANCEL = 2,
    PSBT_VERIFY = 3,
    PSBT_FINALIZE = 4,
  }
}

export class FundingStateStepResp extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FundingStateStepResp.AsObject;
  static toObject(includeInstance: boolean, msg: FundingStateStepResp): FundingStateStepResp.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FundingStateStepResp, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FundingStateStepResp;
  static deserializeBinaryFromReader(message: FundingStateStepResp, reader: jspb.BinaryReader): FundingStateStepResp;
}

export namespace FundingStateStepResp {
  export type AsObject = {
  }
}

export class PendingHTLC extends jspb.Message {
  getIncoming(): boolean;
  setIncoming(value: boolean): void;

  getAmount(): number;
  setAmount(value: number): void;

  getOutpoint(): string;
  setOutpoint(value: string): void;

  getMaturityHeight(): number;
  setMaturityHeight(value: number): void;

  getBlocksTilMaturity(): number;
  setBlocksTilMaturity(value: number): void;

  getStage(): number;
  setStage(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PendingHTLC.AsObject;
  static toObject(includeInstance: boolean, msg: PendingHTLC): PendingHTLC.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PendingHTLC, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PendingHTLC;
  static deserializeBinaryFromReader(message: PendingHTLC, reader: jspb.BinaryReader): PendingHTLC;
}

export namespace PendingHTLC {
  export type AsObject = {
    incoming: boolean,
    amount: number,
    outpoint: string,
    maturityHeight: number,
    blocksTilMaturity: number,
    stage: number,
  }
}

export class PendingChannelsRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PendingChannelsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: PendingChannelsRequest): PendingChannelsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PendingChannelsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PendingChannelsRequest;
  static deserializeBinaryFromReader(message: PendingChannelsRequest, reader: jspb.BinaryReader): PendingChannelsRequest;
}

export namespace PendingChannelsRequest {
  export type AsObject = {
  }
}

export class PendingChannelsResponse extends jspb.Message {
  getTotalLimboBalance(): number;
  setTotalLimboBalance(value: number): void;

  clearPendingOpenChannelsList(): void;
  getPendingOpenChannelsList(): Array<PendingChannelsResponse.PendingOpenChannel>;
  setPendingOpenChannelsList(value: Array<PendingChannelsResponse.PendingOpenChannel>): void;
  addPendingOpenChannels(value?: PendingChannelsResponse.PendingOpenChannel, index?: number): PendingChannelsResponse.PendingOpenChannel;

  clearPendingClosingChannelsList(): void;
  getPendingClosingChannelsList(): Array<PendingChannelsResponse.ClosedChannel>;
  setPendingClosingChannelsList(value: Array<PendingChannelsResponse.ClosedChannel>): void;
  addPendingClosingChannels(value?: PendingChannelsResponse.ClosedChannel, index?: number): PendingChannelsResponse.ClosedChannel;

  clearPendingForceClosingChannelsList(): void;
  getPendingForceClosingChannelsList(): Array<PendingChannelsResponse.ForceClosedChannel>;
  setPendingForceClosingChannelsList(value: Array<PendingChannelsResponse.ForceClosedChannel>): void;
  addPendingForceClosingChannels(value?: PendingChannelsResponse.ForceClosedChannel, index?: number): PendingChannelsResponse.ForceClosedChannel;

  clearWaitingCloseChannelsList(): void;
  getWaitingCloseChannelsList(): Array<PendingChannelsResponse.WaitingCloseChannel>;
  setWaitingCloseChannelsList(value: Array<PendingChannelsResponse.WaitingCloseChannel>): void;
  addWaitingCloseChannels(value?: PendingChannelsResponse.WaitingCloseChannel, index?: number): PendingChannelsResponse.WaitingCloseChannel;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PendingChannelsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: PendingChannelsResponse): PendingChannelsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PendingChannelsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PendingChannelsResponse;
  static deserializeBinaryFromReader(message: PendingChannelsResponse, reader: jspb.BinaryReader): PendingChannelsResponse;
}

export namespace PendingChannelsResponse {
  export type AsObject = {
    totalLimboBalance: number,
    pendingOpenChannelsList: Array<PendingChannelsResponse.PendingOpenChannel.AsObject>,
    pendingClosingChannelsList: Array<PendingChannelsResponse.ClosedChannel.AsObject>,
    pendingForceClosingChannelsList: Array<PendingChannelsResponse.ForceClosedChannel.AsObject>,
    waitingCloseChannelsList: Array<PendingChannelsResponse.WaitingCloseChannel.AsObject>,
  }

  export class PendingChannel extends jspb.Message {
    getRemoteNodePub(): string;
    setRemoteNodePub(value: string): void;

    getChannelPoint(): string;
    setChannelPoint(value: string): void;

    getCapacity(): number;
    setCapacity(value: number): void;

    getLocalBalance(): number;
    setLocalBalance(value: number): void;

    getRemoteBalance(): number;
    setRemoteBalance(value: number): void;

    getLocalChanReserveSat(): number;
    setLocalChanReserveSat(value: number): void;

    getRemoteChanReserveSat(): number;
    setRemoteChanReserveSat(value: number): void;

    getInitiator(): InitiatorMap[keyof InitiatorMap];
    setInitiator(value: InitiatorMap[keyof InitiatorMap]): void;

    getCommitmentType(): CommitmentTypeMap[keyof CommitmentTypeMap];
    setCommitmentType(value: CommitmentTypeMap[keyof CommitmentTypeMap]): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PendingChannel.AsObject;
    static toObject(includeInstance: boolean, msg: PendingChannel): PendingChannel.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PendingChannel, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PendingChannel;
    static deserializeBinaryFromReader(message: PendingChannel, reader: jspb.BinaryReader): PendingChannel;
  }

  export namespace PendingChannel {
    export type AsObject = {
      remoteNodePub: string,
      channelPoint: string,
      capacity: number,
      localBalance: number,
      remoteBalance: number,
      localChanReserveSat: number,
      remoteChanReserveSat: number,
      initiator: InitiatorMap[keyof InitiatorMap],
      commitmentType: CommitmentTypeMap[keyof CommitmentTypeMap],
    }
  }

  export class PendingOpenChannel extends jspb.Message {
    hasChannel(): boolean;
    clearChannel(): void;
    getChannel(): PendingChannelsResponse.PendingChannel | undefined;
    setChannel(value?: PendingChannelsResponse.PendingChannel): void;

    getConfirmationHeight(): number;
    setConfirmationHeight(value: number): void;

    getCommitFee(): number;
    setCommitFee(value: number): void;

    getCommitWeight(): number;
    setCommitWeight(value: number): void;

    getFeePerKw(): number;
    setFeePerKw(value: number): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PendingOpenChannel.AsObject;
    static toObject(includeInstance: boolean, msg: PendingOpenChannel): PendingOpenChannel.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PendingOpenChannel, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PendingOpenChannel;
    static deserializeBinaryFromReader(message: PendingOpenChannel, reader: jspb.BinaryReader): PendingOpenChannel;
  }

  export namespace PendingOpenChannel {
    export type AsObject = {
      channel?: PendingChannelsResponse.PendingChannel.AsObject,
      confirmationHeight: number,
      commitFee: number,
      commitWeight: number,
      feePerKw: number,
    }
  }

  export class WaitingCloseChannel extends jspb.Message {
    hasChannel(): boolean;
    clearChannel(): void;
    getChannel(): PendingChannelsResponse.PendingChannel | undefined;
    setChannel(value?: PendingChannelsResponse.PendingChannel): void;

    getLimboBalance(): number;
    setLimboBalance(value: number): void;

    hasCommitments(): boolean;
    clearCommitments(): void;
    getCommitments(): PendingChannelsResponse.Commitments | undefined;
    setCommitments(value?: PendingChannelsResponse.Commitments): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): WaitingCloseChannel.AsObject;
    static toObject(includeInstance: boolean, msg: WaitingCloseChannel): WaitingCloseChannel.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: WaitingCloseChannel, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): WaitingCloseChannel;
    static deserializeBinaryFromReader(message: WaitingCloseChannel, reader: jspb.BinaryReader): WaitingCloseChannel;
  }

  export namespace WaitingCloseChannel {
    export type AsObject = {
      channel?: PendingChannelsResponse.PendingChannel.AsObject,
      limboBalance: number,
      commitments?: PendingChannelsResponse.Commitments.AsObject,
    }
  }

  export class Commitments extends jspb.Message {
    getLocalTxid(): string;
    setLocalTxid(value: string): void;

    getRemoteTxid(): string;
    setRemoteTxid(value: string): void;

    getRemotePendingTxid(): string;
    setRemotePendingTxid(value: string): void;

    getLocalCommitFeeSat(): number;
    setLocalCommitFeeSat(value: number): void;

    getRemoteCommitFeeSat(): number;
    setRemoteCommitFeeSat(value: number): void;

    getRemotePendingCommitFeeSat(): number;
    setRemotePendingCommitFeeSat(value: number): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Commitments.AsObject;
    static toObject(includeInstance: boolean, msg: Commitments): Commitments.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Commitments, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Commitments;
    static deserializeBinaryFromReader(message: Commitments, reader: jspb.BinaryReader): Commitments;
  }

  export namespace Commitments {
    export type AsObject = {
      localTxid: string,
      remoteTxid: string,
      remotePendingTxid: string,
      localCommitFeeSat: number,
      remoteCommitFeeSat: number,
      remotePendingCommitFeeSat: number,
    }
  }

  export class ClosedChannel extends jspb.Message {
    hasChannel(): boolean;
    clearChannel(): void;
    getChannel(): PendingChannelsResponse.PendingChannel | undefined;
    setChannel(value?: PendingChannelsResponse.PendingChannel): void;

    getClosingTxid(): string;
    setClosingTxid(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ClosedChannel.AsObject;
    static toObject(includeInstance: boolean, msg: ClosedChannel): ClosedChannel.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ClosedChannel, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ClosedChannel;
    static deserializeBinaryFromReader(message: ClosedChannel, reader: jspb.BinaryReader): ClosedChannel;
  }

  export namespace ClosedChannel {
    export type AsObject = {
      channel?: PendingChannelsResponse.PendingChannel.AsObject,
      closingTxid: string,
    }
  }

  export class ForceClosedChannel extends jspb.Message {
    hasChannel(): boolean;
    clearChannel(): void;
    getChannel(): PendingChannelsResponse.PendingChannel | undefined;
    setChannel(value?: PendingChannelsResponse.PendingChannel): void;

    getClosingTxid(): string;
    setClosingTxid(value: string): void;

    getLimboBalance(): number;
    setLimboBalance(value: number): void;

    getMaturityHeight(): number;
    setMaturityHeight(value: number): void;

    getBlocksTilMaturity(): number;
    setBlocksTilMaturity(value: number): void;

    getRecoveredBalance(): number;
    setRecoveredBalance(value: number): void;

    clearPendingHtlcsList(): void;
    getPendingHtlcsList(): Array<PendingHTLC>;
    setPendingHtlcsList(value: Array<PendingHTLC>): void;
    addPendingHtlcs(value?: PendingHTLC, index?: number): PendingHTLC;

    getAnchor(): PendingChannelsResponse.ForceClosedChannel.AnchorStateMap[keyof PendingChannelsResponse.ForceClosedChannel.AnchorStateMap];
    setAnchor(value: PendingChannelsResponse.ForceClosedChannel.AnchorStateMap[keyof PendingChannelsResponse.ForceClosedChannel.AnchorStateMap]): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ForceClosedChannel.AsObject;
    static toObject(includeInstance: boolean, msg: ForceClosedChannel): ForceClosedChannel.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ForceClosedChannel, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ForceClosedChannel;
    static deserializeBinaryFromReader(message: ForceClosedChannel, reader: jspb.BinaryReader): ForceClosedChannel;
  }

  export namespace ForceClosedChannel {
    export type AsObject = {
      channel?: PendingChannelsResponse.PendingChannel.AsObject,
      closingTxid: string,
      limboBalance: number,
      maturityHeight: number,
      blocksTilMaturity: number,
      recoveredBalance: number,
      pendingHtlcsList: Array<PendingHTLC.AsObject>,
      anchor: PendingChannelsResponse.ForceClosedChannel.AnchorStateMap[keyof PendingChannelsResponse.ForceClosedChannel.AnchorStateMap],
    }

    export interface AnchorStateMap {
      LIMBO: 0;
      RECOVERED: 1;
      LOST: 2;
    }

    export const AnchorState: AnchorStateMap;
  }
}

export class ChannelEventSubscription extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChannelEventSubscription.AsObject;
  static toObject(includeInstance: boolean, msg: ChannelEventSubscription): ChannelEventSubscription.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChannelEventSubscription, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChannelEventSubscription;
  static deserializeBinaryFromReader(message: ChannelEventSubscription, reader: jspb.BinaryReader): ChannelEventSubscription;
}

export namespace ChannelEventSubscription {
  export type AsObject = {
  }
}

export class ChannelEventUpdate extends jspb.Message {
  hasOpenChannel(): boolean;
  clearOpenChannel(): void;
  getOpenChannel(): Channel | undefined;
  setOpenChannel(value?: Channel): void;

  hasClosedChannel(): boolean;
  clearClosedChannel(): void;
  getClosedChannel(): ChannelCloseSummary | undefined;
  setClosedChannel(value?: ChannelCloseSummary): void;

  hasActiveChannel(): boolean;
  clearActiveChannel(): void;
  getActiveChannel(): ChannelPoint | undefined;
  setActiveChannel(value?: ChannelPoint): void;

  hasInactiveChannel(): boolean;
  clearInactiveChannel(): void;
  getInactiveChannel(): ChannelPoint | undefined;
  setInactiveChannel(value?: ChannelPoint): void;

  hasPendingOpenChannel(): boolean;
  clearPendingOpenChannel(): void;
  getPendingOpenChannel(): PendingUpdate | undefined;
  setPendingOpenChannel(value?: PendingUpdate): void;

  getType(): ChannelEventUpdate.UpdateTypeMap[keyof ChannelEventUpdate.UpdateTypeMap];
  setType(value: ChannelEventUpdate.UpdateTypeMap[keyof ChannelEventUpdate.UpdateTypeMap]): void;

  getChannelCase(): ChannelEventUpdate.ChannelCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChannelEventUpdate.AsObject;
  static toObject(includeInstance: boolean, msg: ChannelEventUpdate): ChannelEventUpdate.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChannelEventUpdate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChannelEventUpdate;
  static deserializeBinaryFromReader(message: ChannelEventUpdate, reader: jspb.BinaryReader): ChannelEventUpdate;
}

export namespace ChannelEventUpdate {
  export type AsObject = {
    openChannel?: Channel.AsObject,
    closedChannel?: ChannelCloseSummary.AsObject,
    activeChannel?: ChannelPoint.AsObject,
    inactiveChannel?: ChannelPoint.AsObject,
    pendingOpenChannel?: PendingUpdate.AsObject,
    type: ChannelEventUpdate.UpdateTypeMap[keyof ChannelEventUpdate.UpdateTypeMap],
  }

  export interface UpdateTypeMap {
    OPEN_CHANNEL: 0;
    CLOSED_CHANNEL: 1;
    ACTIVE_CHANNEL: 2;
    INACTIVE_CHANNEL: 3;
    PENDING_OPEN_CHANNEL: 4;
  }

  export const UpdateType: UpdateTypeMap;

  export enum ChannelCase {
    CHANNEL_NOT_SET = 0,
    OPEN_CHANNEL = 1,
    CLOSED_CHANNEL = 2,
    ACTIVE_CHANNEL = 3,
    INACTIVE_CHANNEL = 4,
    PENDING_OPEN_CHANNEL = 6,
  }
}

export class WalletBalanceRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WalletBalanceRequest.AsObject;
  static toObject(includeInstance: boolean, msg: WalletBalanceRequest): WalletBalanceRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WalletBalanceRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WalletBalanceRequest;
  static deserializeBinaryFromReader(message: WalletBalanceRequest, reader: jspb.BinaryReader): WalletBalanceRequest;
}

export namespace WalletBalanceRequest {
  export type AsObject = {
  }
}

export class WalletBalanceResponse extends jspb.Message {
  getTotalBalance(): number;
  setTotalBalance(value: number): void;

  getConfirmedBalance(): number;
  setConfirmedBalance(value: number): void;

  getUnconfirmedBalance(): number;
  setUnconfirmedBalance(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WalletBalanceResponse.AsObject;
  static toObject(includeInstance: boolean, msg: WalletBalanceResponse): WalletBalanceResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WalletBalanceResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WalletBalanceResponse;
  static deserializeBinaryFromReader(message: WalletBalanceResponse, reader: jspb.BinaryReader): WalletBalanceResponse;
}

export namespace WalletBalanceResponse {
  export type AsObject = {
    totalBalance: number,
    confirmedBalance: number,
    unconfirmedBalance: number,
  }
}

export class Amount extends jspb.Message {
  getSat(): number;
  setSat(value: number): void;

  getMsat(): number;
  setMsat(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Amount.AsObject;
  static toObject(includeInstance: boolean, msg: Amount): Amount.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Amount, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Amount;
  static deserializeBinaryFromReader(message: Amount, reader: jspb.BinaryReader): Amount;
}

export namespace Amount {
  export type AsObject = {
    sat: number,
    msat: number,
  }
}

export class ChannelBalanceRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChannelBalanceRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ChannelBalanceRequest): ChannelBalanceRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChannelBalanceRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChannelBalanceRequest;
  static deserializeBinaryFromReader(message: ChannelBalanceRequest, reader: jspb.BinaryReader): ChannelBalanceRequest;
}

export namespace ChannelBalanceRequest {
  export type AsObject = {
  }
}

export class ChannelBalanceResponse extends jspb.Message {
  getBalance(): number;
  setBalance(value: number): void;

  getPendingOpenBalance(): number;
  setPendingOpenBalance(value: number): void;

  hasLocalBalance(): boolean;
  clearLocalBalance(): void;
  getLocalBalance(): Amount | undefined;
  setLocalBalance(value?: Amount): void;

  hasRemoteBalance(): boolean;
  clearRemoteBalance(): void;
  getRemoteBalance(): Amount | undefined;
  setRemoteBalance(value?: Amount): void;

  hasUnsettledLocalBalance(): boolean;
  clearUnsettledLocalBalance(): void;
  getUnsettledLocalBalance(): Amount | undefined;
  setUnsettledLocalBalance(value?: Amount): void;

  hasUnsettledRemoteBalance(): boolean;
  clearUnsettledRemoteBalance(): void;
  getUnsettledRemoteBalance(): Amount | undefined;
  setUnsettledRemoteBalance(value?: Amount): void;

  hasPendingOpenLocalBalance(): boolean;
  clearPendingOpenLocalBalance(): void;
  getPendingOpenLocalBalance(): Amount | undefined;
  setPendingOpenLocalBalance(value?: Amount): void;

  hasPendingOpenRemoteBalance(): boolean;
  clearPendingOpenRemoteBalance(): void;
  getPendingOpenRemoteBalance(): Amount | undefined;
  setPendingOpenRemoteBalance(value?: Amount): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChannelBalanceResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ChannelBalanceResponse): ChannelBalanceResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChannelBalanceResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChannelBalanceResponse;
  static deserializeBinaryFromReader(message: ChannelBalanceResponse, reader: jspb.BinaryReader): ChannelBalanceResponse;
}

export namespace ChannelBalanceResponse {
  export type AsObject = {
    balance: number,
    pendingOpenBalance: number,
    localBalance?: Amount.AsObject,
    remoteBalance?: Amount.AsObject,
    unsettledLocalBalance?: Amount.AsObject,
    unsettledRemoteBalance?: Amount.AsObject,
    pendingOpenLocalBalance?: Amount.AsObject,
    pendingOpenRemoteBalance?: Amount.AsObject,
  }
}

export class QueryRoutesRequest extends jspb.Message {
  getPubKey(): string;
  setPubKey(value: string): void;

  getAmt(): number;
  setAmt(value: number): void;

  getAmtMsat(): number;
  setAmtMsat(value: number): void;

  getFinalCltvDelta(): number;
  setFinalCltvDelta(value: number): void;

  hasFeeLimit(): boolean;
  clearFeeLimit(): void;
  getFeeLimit(): FeeLimit | undefined;
  setFeeLimit(value?: FeeLimit): void;

  clearIgnoredNodesList(): void;
  getIgnoredNodesList(): Array<Uint8Array | string>;
  getIgnoredNodesList_asU8(): Array<Uint8Array>;
  getIgnoredNodesList_asB64(): Array<string>;
  setIgnoredNodesList(value: Array<Uint8Array | string>): void;
  addIgnoredNodes(value: Uint8Array | string, index?: number): Uint8Array | string;

  clearIgnoredEdgesList(): void;
  getIgnoredEdgesList(): Array<EdgeLocator>;
  setIgnoredEdgesList(value: Array<EdgeLocator>): void;
  addIgnoredEdges(value?: EdgeLocator, index?: number): EdgeLocator;

  getSourcePubKey(): string;
  setSourcePubKey(value: string): void;

  getUseMissionControl(): boolean;
  setUseMissionControl(value: boolean): void;

  clearIgnoredPairsList(): void;
  getIgnoredPairsList(): Array<NodePair>;
  setIgnoredPairsList(value: Array<NodePair>): void;
  addIgnoredPairs(value?: NodePair, index?: number): NodePair;

  getCltvLimit(): number;
  setCltvLimit(value: number): void;

  getDestCustomRecordsMap(): jspb.Map<number, Uint8Array | string>;
  clearDestCustomRecordsMap(): void;
  getOutgoingChanId(): string;
  setOutgoingChanId(value: string): void;

  getLastHopPubkey(): Uint8Array | string;
  getLastHopPubkey_asU8(): Uint8Array;
  getLastHopPubkey_asB64(): string;
  setLastHopPubkey(value: Uint8Array | string): void;

  clearRouteHintsList(): void;
  getRouteHintsList(): Array<RouteHint>;
  setRouteHintsList(value: Array<RouteHint>): void;
  addRouteHints(value?: RouteHint, index?: number): RouteHint;

  clearDestFeaturesList(): void;
  getDestFeaturesList(): Array<FeatureBitMap[keyof FeatureBitMap]>;
  setDestFeaturesList(value: Array<FeatureBitMap[keyof FeatureBitMap]>): void;
  addDestFeatures(value: FeatureBitMap[keyof FeatureBitMap], index?: number): FeatureBitMap[keyof FeatureBitMap];

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): QueryRoutesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: QueryRoutesRequest): QueryRoutesRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: QueryRoutesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): QueryRoutesRequest;
  static deserializeBinaryFromReader(message: QueryRoutesRequest, reader: jspb.BinaryReader): QueryRoutesRequest;
}

export namespace QueryRoutesRequest {
  export type AsObject = {
    pubKey: string,
    amt: number,
    amtMsat: number,
    finalCltvDelta: number,
    feeLimit?: FeeLimit.AsObject,
    ignoredNodesList: Array<Uint8Array | string>,
    ignoredEdgesList: Array<EdgeLocator.AsObject>,
    sourcePubKey: string,
    useMissionControl: boolean,
    ignoredPairsList: Array<NodePair.AsObject>,
    cltvLimit: number,
    destCustomRecordsMap: Array<[number, Uint8Array | string]>,
    outgoingChanId: string,
    lastHopPubkey: Uint8Array | string,
    routeHintsList: Array<RouteHint.AsObject>,
    destFeaturesList: Array<FeatureBitMap[keyof FeatureBitMap]>,
  }
}

export class NodePair extends jspb.Message {
  getFrom(): Uint8Array | string;
  getFrom_asU8(): Uint8Array;
  getFrom_asB64(): string;
  setFrom(value: Uint8Array | string): void;

  getTo(): Uint8Array | string;
  getTo_asU8(): Uint8Array;
  getTo_asB64(): string;
  setTo(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NodePair.AsObject;
  static toObject(includeInstance: boolean, msg: NodePair): NodePair.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NodePair, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NodePair;
  static deserializeBinaryFromReader(message: NodePair, reader: jspb.BinaryReader): NodePair;
}

export namespace NodePair {
  export type AsObject = {
    from: Uint8Array | string,
    to: Uint8Array | string,
  }
}

export class EdgeLocator extends jspb.Message {
  getChannelId(): string;
  setChannelId(value: string): void;

  getDirectionReverse(): boolean;
  setDirectionReverse(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EdgeLocator.AsObject;
  static toObject(includeInstance: boolean, msg: EdgeLocator): EdgeLocator.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: EdgeLocator, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EdgeLocator;
  static deserializeBinaryFromReader(message: EdgeLocator, reader: jspb.BinaryReader): EdgeLocator;
}

export namespace EdgeLocator {
  export type AsObject = {
    channelId: string,
    directionReverse: boolean,
  }
}

export class QueryRoutesResponse extends jspb.Message {
  clearRoutesList(): void;
  getRoutesList(): Array<Route>;
  setRoutesList(value: Array<Route>): void;
  addRoutes(value?: Route, index?: number): Route;

  getSuccessProb(): number;
  setSuccessProb(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): QueryRoutesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: QueryRoutesResponse): QueryRoutesResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: QueryRoutesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): QueryRoutesResponse;
  static deserializeBinaryFromReader(message: QueryRoutesResponse, reader: jspb.BinaryReader): QueryRoutesResponse;
}

export namespace QueryRoutesResponse {
  export type AsObject = {
    routesList: Array<Route.AsObject>,
    successProb: number,
  }
}

export class Hop extends jspb.Message {
  getChanId(): string;
  setChanId(value: string): void;

  getChanCapacity(): number;
  setChanCapacity(value: number): void;

  getAmtToForward(): number;
  setAmtToForward(value: number): void;

  getFee(): number;
  setFee(value: number): void;

  getExpiry(): number;
  setExpiry(value: number): void;

  getAmtToForwardMsat(): number;
  setAmtToForwardMsat(value: number): void;

  getFeeMsat(): number;
  setFeeMsat(value: number): void;

  getPubKey(): string;
  setPubKey(value: string): void;

  getTlvPayload(): boolean;
  setTlvPayload(value: boolean): void;

  hasMppRecord(): boolean;
  clearMppRecord(): void;
  getMppRecord(): MPPRecord | undefined;
  setMppRecord(value?: MPPRecord): void;

  getCustomRecordsMap(): jspb.Map<number, Uint8Array | string>;
  clearCustomRecordsMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Hop.AsObject;
  static toObject(includeInstance: boolean, msg: Hop): Hop.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Hop, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Hop;
  static deserializeBinaryFromReader(message: Hop, reader: jspb.BinaryReader): Hop;
}

export namespace Hop {
  export type AsObject = {
    chanId: string,
    chanCapacity: number,
    amtToForward: number,
    fee: number,
    expiry: number,
    amtToForwardMsat: number,
    feeMsat: number,
    pubKey: string,
    tlvPayload: boolean,
    mppRecord?: MPPRecord.AsObject,
    customRecordsMap: Array<[number, Uint8Array | string]>,
  }
}

export class MPPRecord extends jspb.Message {
  getPaymentAddr(): Uint8Array | string;
  getPaymentAddr_asU8(): Uint8Array;
  getPaymentAddr_asB64(): string;
  setPaymentAddr(value: Uint8Array | string): void;

  getTotalAmtMsat(): number;
  setTotalAmtMsat(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MPPRecord.AsObject;
  static toObject(includeInstance: boolean, msg: MPPRecord): MPPRecord.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MPPRecord, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MPPRecord;
  static deserializeBinaryFromReader(message: MPPRecord, reader: jspb.BinaryReader): MPPRecord;
}

export namespace MPPRecord {
  export type AsObject = {
    paymentAddr: Uint8Array | string,
    totalAmtMsat: number,
  }
}

export class Route extends jspb.Message {
  getTotalTimeLock(): number;
  setTotalTimeLock(value: number): void;

  getTotalFees(): number;
  setTotalFees(value: number): void;

  getTotalAmt(): number;
  setTotalAmt(value: number): void;

  clearHopsList(): void;
  getHopsList(): Array<Hop>;
  setHopsList(value: Array<Hop>): void;
  addHops(value?: Hop, index?: number): Hop;

  getTotalFeesMsat(): number;
  setTotalFeesMsat(value: number): void;

  getTotalAmtMsat(): number;
  setTotalAmtMsat(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Route.AsObject;
  static toObject(includeInstance: boolean, msg: Route): Route.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Route, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Route;
  static deserializeBinaryFromReader(message: Route, reader: jspb.BinaryReader): Route;
}

export namespace Route {
  export type AsObject = {
    totalTimeLock: number,
    totalFees: number,
    totalAmt: number,
    hopsList: Array<Hop.AsObject>,
    totalFeesMsat: number,
    totalAmtMsat: number,
  }
}

export class NodeInfoRequest extends jspb.Message {
  getPubKey(): string;
  setPubKey(value: string): void;

  getIncludeChannels(): boolean;
  setIncludeChannels(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NodeInfoRequest.AsObject;
  static toObject(includeInstance: boolean, msg: NodeInfoRequest): NodeInfoRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NodeInfoRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NodeInfoRequest;
  static deserializeBinaryFromReader(message: NodeInfoRequest, reader: jspb.BinaryReader): NodeInfoRequest;
}

export namespace NodeInfoRequest {
  export type AsObject = {
    pubKey: string,
    includeChannels: boolean,
  }
}

export class NodeInfo extends jspb.Message {
  hasNode(): boolean;
  clearNode(): void;
  getNode(): LightningNode | undefined;
  setNode(value?: LightningNode): void;

  getNumChannels(): number;
  setNumChannels(value: number): void;

  getTotalCapacity(): number;
  setTotalCapacity(value: number): void;

  clearChannelsList(): void;
  getChannelsList(): Array<ChannelEdge>;
  setChannelsList(value: Array<ChannelEdge>): void;
  addChannels(value?: ChannelEdge, index?: number): ChannelEdge;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NodeInfo.AsObject;
  static toObject(includeInstance: boolean, msg: NodeInfo): NodeInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NodeInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NodeInfo;
  static deserializeBinaryFromReader(message: NodeInfo, reader: jspb.BinaryReader): NodeInfo;
}

export namespace NodeInfo {
  export type AsObject = {
    node?: LightningNode.AsObject,
    numChannels: number,
    totalCapacity: number,
    channelsList: Array<ChannelEdge.AsObject>,
  }
}

export class LightningNode extends jspb.Message {
  getLastUpdate(): number;
  setLastUpdate(value: number): void;

  getPubKey(): string;
  setPubKey(value: string): void;

  getAlias(): string;
  setAlias(value: string): void;

  clearAddressesList(): void;
  getAddressesList(): Array<NodeAddress>;
  setAddressesList(value: Array<NodeAddress>): void;
  addAddresses(value?: NodeAddress, index?: number): NodeAddress;

  getColor(): string;
  setColor(value: string): void;

  getFeaturesMap(): jspb.Map<number, Feature>;
  clearFeaturesMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LightningNode.AsObject;
  static toObject(includeInstance: boolean, msg: LightningNode): LightningNode.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LightningNode, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LightningNode;
  static deserializeBinaryFromReader(message: LightningNode, reader: jspb.BinaryReader): LightningNode;
}

export namespace LightningNode {
  export type AsObject = {
    lastUpdate: number,
    pubKey: string,
    alias: string,
    addressesList: Array<NodeAddress.AsObject>,
    color: string,
    featuresMap: Array<[number, Feature.AsObject]>,
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

export class RoutingPolicy extends jspb.Message {
  getTimeLockDelta(): number;
  setTimeLockDelta(value: number): void;

  getMinHtlc(): number;
  setMinHtlc(value: number): void;

  getFeeBaseMsat(): number;
  setFeeBaseMsat(value: number): void;

  getFeeRateMilliMsat(): number;
  setFeeRateMilliMsat(value: number): void;

  getDisabled(): boolean;
  setDisabled(value: boolean): void;

  getMaxHtlcMsat(): number;
  setMaxHtlcMsat(value: number): void;

  getLastUpdate(): number;
  setLastUpdate(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RoutingPolicy.AsObject;
  static toObject(includeInstance: boolean, msg: RoutingPolicy): RoutingPolicy.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RoutingPolicy, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RoutingPolicy;
  static deserializeBinaryFromReader(message: RoutingPolicy, reader: jspb.BinaryReader): RoutingPolicy;
}

export namespace RoutingPolicy {
  export type AsObject = {
    timeLockDelta: number,
    minHtlc: number,
    feeBaseMsat: number,
    feeRateMilliMsat: number,
    disabled: boolean,
    maxHtlcMsat: number,
    lastUpdate: number,
  }
}

export class ChannelEdge extends jspb.Message {
  getChannelId(): string;
  setChannelId(value: string): void;

  getChanPoint(): string;
  setChanPoint(value: string): void;

  getLastUpdate(): number;
  setLastUpdate(value: number): void;

  getNode1Pub(): string;
  setNode1Pub(value: string): void;

  getNode2Pub(): string;
  setNode2Pub(value: string): void;

  getCapacity(): number;
  setCapacity(value: number): void;

  hasNode1Policy(): boolean;
  clearNode1Policy(): void;
  getNode1Policy(): RoutingPolicy | undefined;
  setNode1Policy(value?: RoutingPolicy): void;

  hasNode2Policy(): boolean;
  clearNode2Policy(): void;
  getNode2Policy(): RoutingPolicy | undefined;
  setNode2Policy(value?: RoutingPolicy): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChannelEdge.AsObject;
  static toObject(includeInstance: boolean, msg: ChannelEdge): ChannelEdge.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChannelEdge, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChannelEdge;
  static deserializeBinaryFromReader(message: ChannelEdge, reader: jspb.BinaryReader): ChannelEdge;
}

export namespace ChannelEdge {
  export type AsObject = {
    channelId: string,
    chanPoint: string,
    lastUpdate: number,
    node1Pub: string,
    node2Pub: string,
    capacity: number,
    node1Policy?: RoutingPolicy.AsObject,
    node2Policy?: RoutingPolicy.AsObject,
  }
}

export class ChannelGraphRequest extends jspb.Message {
  getIncludeUnannounced(): boolean;
  setIncludeUnannounced(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChannelGraphRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ChannelGraphRequest): ChannelGraphRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChannelGraphRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChannelGraphRequest;
  static deserializeBinaryFromReader(message: ChannelGraphRequest, reader: jspb.BinaryReader): ChannelGraphRequest;
}

export namespace ChannelGraphRequest {
  export type AsObject = {
    includeUnannounced: boolean,
  }
}

export class ChannelGraph extends jspb.Message {
  clearNodesList(): void;
  getNodesList(): Array<LightningNode>;
  setNodesList(value: Array<LightningNode>): void;
  addNodes(value?: LightningNode, index?: number): LightningNode;

  clearEdgesList(): void;
  getEdgesList(): Array<ChannelEdge>;
  setEdgesList(value: Array<ChannelEdge>): void;
  addEdges(value?: ChannelEdge, index?: number): ChannelEdge;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChannelGraph.AsObject;
  static toObject(includeInstance: boolean, msg: ChannelGraph): ChannelGraph.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChannelGraph, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChannelGraph;
  static deserializeBinaryFromReader(message: ChannelGraph, reader: jspb.BinaryReader): ChannelGraph;
}

export namespace ChannelGraph {
  export type AsObject = {
    nodesList: Array<LightningNode.AsObject>,
    edgesList: Array<ChannelEdge.AsObject>,
  }
}

export class NodeMetricsRequest extends jspb.Message {
  clearTypesList(): void;
  getTypesList(): Array<NodeMetricTypeMap[keyof NodeMetricTypeMap]>;
  setTypesList(value: Array<NodeMetricTypeMap[keyof NodeMetricTypeMap]>): void;
  addTypes(value: NodeMetricTypeMap[keyof NodeMetricTypeMap], index?: number): NodeMetricTypeMap[keyof NodeMetricTypeMap];

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NodeMetricsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: NodeMetricsRequest): NodeMetricsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NodeMetricsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NodeMetricsRequest;
  static deserializeBinaryFromReader(message: NodeMetricsRequest, reader: jspb.BinaryReader): NodeMetricsRequest;
}

export namespace NodeMetricsRequest {
  export type AsObject = {
    typesList: Array<NodeMetricTypeMap[keyof NodeMetricTypeMap]>,
  }
}

export class NodeMetricsResponse extends jspb.Message {
  getBetweennessCentralityMap(): jspb.Map<string, FloatMetric>;
  clearBetweennessCentralityMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NodeMetricsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: NodeMetricsResponse): NodeMetricsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NodeMetricsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NodeMetricsResponse;
  static deserializeBinaryFromReader(message: NodeMetricsResponse, reader: jspb.BinaryReader): NodeMetricsResponse;
}

export namespace NodeMetricsResponse {
  export type AsObject = {
    betweennessCentralityMap: Array<[string, FloatMetric.AsObject]>,
  }
}

export class FloatMetric extends jspb.Message {
  getValue(): number;
  setValue(value: number): void;

  getNormalizedValue(): number;
  setNormalizedValue(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FloatMetric.AsObject;
  static toObject(includeInstance: boolean, msg: FloatMetric): FloatMetric.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FloatMetric, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FloatMetric;
  static deserializeBinaryFromReader(message: FloatMetric, reader: jspb.BinaryReader): FloatMetric;
}

export namespace FloatMetric {
  export type AsObject = {
    value: number,
    normalizedValue: number,
  }
}

export class ChanInfoRequest extends jspb.Message {
  getChanId(): string;
  setChanId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChanInfoRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ChanInfoRequest): ChanInfoRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChanInfoRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChanInfoRequest;
  static deserializeBinaryFromReader(message: ChanInfoRequest, reader: jspb.BinaryReader): ChanInfoRequest;
}

export namespace ChanInfoRequest {
  export type AsObject = {
    chanId: string,
  }
}

export class NetworkInfoRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NetworkInfoRequest.AsObject;
  static toObject(includeInstance: boolean, msg: NetworkInfoRequest): NetworkInfoRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NetworkInfoRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NetworkInfoRequest;
  static deserializeBinaryFromReader(message: NetworkInfoRequest, reader: jspb.BinaryReader): NetworkInfoRequest;
}

export namespace NetworkInfoRequest {
  export type AsObject = {
  }
}

export class NetworkInfo extends jspb.Message {
  getGraphDiameter(): number;
  setGraphDiameter(value: number): void;

  getAvgOutDegree(): number;
  setAvgOutDegree(value: number): void;

  getMaxOutDegree(): number;
  setMaxOutDegree(value: number): void;

  getNumNodes(): number;
  setNumNodes(value: number): void;

  getNumChannels(): number;
  setNumChannels(value: number): void;

  getTotalNetworkCapacity(): number;
  setTotalNetworkCapacity(value: number): void;

  getAvgChannelSize(): number;
  setAvgChannelSize(value: number): void;

  getMinChannelSize(): number;
  setMinChannelSize(value: number): void;

  getMaxChannelSize(): number;
  setMaxChannelSize(value: number): void;

  getMedianChannelSizeSat(): number;
  setMedianChannelSizeSat(value: number): void;

  getNumZombieChans(): number;
  setNumZombieChans(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NetworkInfo.AsObject;
  static toObject(includeInstance: boolean, msg: NetworkInfo): NetworkInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NetworkInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NetworkInfo;
  static deserializeBinaryFromReader(message: NetworkInfo, reader: jspb.BinaryReader): NetworkInfo;
}

export namespace NetworkInfo {
  export type AsObject = {
    graphDiameter: number,
    avgOutDegree: number,
    maxOutDegree: number,
    numNodes: number,
    numChannels: number,
    totalNetworkCapacity: number,
    avgChannelSize: number,
    minChannelSize: number,
    maxChannelSize: number,
    medianChannelSizeSat: number,
    numZombieChans: number,
  }
}

export class StopRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StopRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StopRequest): StopRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StopRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StopRequest;
  static deserializeBinaryFromReader(message: StopRequest, reader: jspb.BinaryReader): StopRequest;
}

export namespace StopRequest {
  export type AsObject = {
  }
}

export class StopResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StopResponse.AsObject;
  static toObject(includeInstance: boolean, msg: StopResponse): StopResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StopResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StopResponse;
  static deserializeBinaryFromReader(message: StopResponse, reader: jspb.BinaryReader): StopResponse;
}

export namespace StopResponse {
  export type AsObject = {
  }
}

export class GraphTopologySubscription extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GraphTopologySubscription.AsObject;
  static toObject(includeInstance: boolean, msg: GraphTopologySubscription): GraphTopologySubscription.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GraphTopologySubscription, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GraphTopologySubscription;
  static deserializeBinaryFromReader(message: GraphTopologySubscription, reader: jspb.BinaryReader): GraphTopologySubscription;
}

export namespace GraphTopologySubscription {
  export type AsObject = {
  }
}

export class GraphTopologyUpdate extends jspb.Message {
  clearNodeUpdatesList(): void;
  getNodeUpdatesList(): Array<NodeUpdate>;
  setNodeUpdatesList(value: Array<NodeUpdate>): void;
  addNodeUpdates(value?: NodeUpdate, index?: number): NodeUpdate;

  clearChannelUpdatesList(): void;
  getChannelUpdatesList(): Array<ChannelEdgeUpdate>;
  setChannelUpdatesList(value: Array<ChannelEdgeUpdate>): void;
  addChannelUpdates(value?: ChannelEdgeUpdate, index?: number): ChannelEdgeUpdate;

  clearClosedChansList(): void;
  getClosedChansList(): Array<ClosedChannelUpdate>;
  setClosedChansList(value: Array<ClosedChannelUpdate>): void;
  addClosedChans(value?: ClosedChannelUpdate, index?: number): ClosedChannelUpdate;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GraphTopologyUpdate.AsObject;
  static toObject(includeInstance: boolean, msg: GraphTopologyUpdate): GraphTopologyUpdate.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GraphTopologyUpdate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GraphTopologyUpdate;
  static deserializeBinaryFromReader(message: GraphTopologyUpdate, reader: jspb.BinaryReader): GraphTopologyUpdate;
}

export namespace GraphTopologyUpdate {
  export type AsObject = {
    nodeUpdatesList: Array<NodeUpdate.AsObject>,
    channelUpdatesList: Array<ChannelEdgeUpdate.AsObject>,
    closedChansList: Array<ClosedChannelUpdate.AsObject>,
  }
}

export class NodeUpdate extends jspb.Message {
  clearAddressesList(): void;
  getAddressesList(): Array<string>;
  setAddressesList(value: Array<string>): void;
  addAddresses(value: string, index?: number): string;

  getIdentityKey(): string;
  setIdentityKey(value: string): void;

  getGlobalFeatures(): Uint8Array | string;
  getGlobalFeatures_asU8(): Uint8Array;
  getGlobalFeatures_asB64(): string;
  setGlobalFeatures(value: Uint8Array | string): void;

  getAlias(): string;
  setAlias(value: string): void;

  getColor(): string;
  setColor(value: string): void;

  getFeaturesMap(): jspb.Map<number, Feature>;
  clearFeaturesMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NodeUpdate.AsObject;
  static toObject(includeInstance: boolean, msg: NodeUpdate): NodeUpdate.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: NodeUpdate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NodeUpdate;
  static deserializeBinaryFromReader(message: NodeUpdate, reader: jspb.BinaryReader): NodeUpdate;
}

export namespace NodeUpdate {
  export type AsObject = {
    addressesList: Array<string>,
    identityKey: string,
    globalFeatures: Uint8Array | string,
    alias: string,
    color: string,
    featuresMap: Array<[number, Feature.AsObject]>,
  }
}

export class ChannelEdgeUpdate extends jspb.Message {
  getChanId(): string;
  setChanId(value: string): void;

  hasChanPoint(): boolean;
  clearChanPoint(): void;
  getChanPoint(): ChannelPoint | undefined;
  setChanPoint(value?: ChannelPoint): void;

  getCapacity(): number;
  setCapacity(value: number): void;

  hasRoutingPolicy(): boolean;
  clearRoutingPolicy(): void;
  getRoutingPolicy(): RoutingPolicy | undefined;
  setRoutingPolicy(value?: RoutingPolicy): void;

  getAdvertisingNode(): string;
  setAdvertisingNode(value: string): void;

  getConnectingNode(): string;
  setConnectingNode(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChannelEdgeUpdate.AsObject;
  static toObject(includeInstance: boolean, msg: ChannelEdgeUpdate): ChannelEdgeUpdate.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChannelEdgeUpdate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChannelEdgeUpdate;
  static deserializeBinaryFromReader(message: ChannelEdgeUpdate, reader: jspb.BinaryReader): ChannelEdgeUpdate;
}

export namespace ChannelEdgeUpdate {
  export type AsObject = {
    chanId: string,
    chanPoint?: ChannelPoint.AsObject,
    capacity: number,
    routingPolicy?: RoutingPolicy.AsObject,
    advertisingNode: string,
    connectingNode: string,
  }
}

export class ClosedChannelUpdate extends jspb.Message {
  getChanId(): string;
  setChanId(value: string): void;

  getCapacity(): number;
  setCapacity(value: number): void;

  getClosedHeight(): number;
  setClosedHeight(value: number): void;

  hasChanPoint(): boolean;
  clearChanPoint(): void;
  getChanPoint(): ChannelPoint | undefined;
  setChanPoint(value?: ChannelPoint): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ClosedChannelUpdate.AsObject;
  static toObject(includeInstance: boolean, msg: ClosedChannelUpdate): ClosedChannelUpdate.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ClosedChannelUpdate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ClosedChannelUpdate;
  static deserializeBinaryFromReader(message: ClosedChannelUpdate, reader: jspb.BinaryReader): ClosedChannelUpdate;
}

export namespace ClosedChannelUpdate {
  export type AsObject = {
    chanId: string,
    capacity: number,
    closedHeight: number,
    chanPoint?: ChannelPoint.AsObject,
  }
}

export class HopHint extends jspb.Message {
  getNodeId(): string;
  setNodeId(value: string): void;

  getChanId(): string;
  setChanId(value: string): void;

  getFeeBaseMsat(): number;
  setFeeBaseMsat(value: number): void;

  getFeeProportionalMillionths(): number;
  setFeeProportionalMillionths(value: number): void;

  getCltvExpiryDelta(): number;
  setCltvExpiryDelta(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HopHint.AsObject;
  static toObject(includeInstance: boolean, msg: HopHint): HopHint.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: HopHint, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HopHint;
  static deserializeBinaryFromReader(message: HopHint, reader: jspb.BinaryReader): HopHint;
}

export namespace HopHint {
  export type AsObject = {
    nodeId: string,
    chanId: string,
    feeBaseMsat: number,
    feeProportionalMillionths: number,
    cltvExpiryDelta: number,
  }
}

export class RouteHint extends jspb.Message {
  clearHopHintsList(): void;
  getHopHintsList(): Array<HopHint>;
  setHopHintsList(value: Array<HopHint>): void;
  addHopHints(value?: HopHint, index?: number): HopHint;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RouteHint.AsObject;
  static toObject(includeInstance: boolean, msg: RouteHint): RouteHint.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RouteHint, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RouteHint;
  static deserializeBinaryFromReader(message: RouteHint, reader: jspb.BinaryReader): RouteHint;
}

export namespace RouteHint {
  export type AsObject = {
    hopHintsList: Array<HopHint.AsObject>,
  }
}

export class Invoice extends jspb.Message {
  getMemo(): string;
  setMemo(value: string): void;

  getRPreimage(): Uint8Array | string;
  getRPreimage_asU8(): Uint8Array;
  getRPreimage_asB64(): string;
  setRPreimage(value: Uint8Array | string): void;

  getRHash(): Uint8Array | string;
  getRHash_asU8(): Uint8Array;
  getRHash_asB64(): string;
  setRHash(value: Uint8Array | string): void;

  getValue(): number;
  setValue(value: number): void;

  getValueMsat(): number;
  setValueMsat(value: number): void;

  getSettled(): boolean;
  setSettled(value: boolean): void;

  getCreationDate(): number;
  setCreationDate(value: number): void;

  getSettleDate(): number;
  setSettleDate(value: number): void;

  getPaymentRequest(): string;
  setPaymentRequest(value: string): void;

  getDescriptionHash(): Uint8Array | string;
  getDescriptionHash_asU8(): Uint8Array;
  getDescriptionHash_asB64(): string;
  setDescriptionHash(value: Uint8Array | string): void;

  getExpiry(): number;
  setExpiry(value: number): void;

  getFallbackAddr(): string;
  setFallbackAddr(value: string): void;

  getCltvExpiry(): number;
  setCltvExpiry(value: number): void;

  clearRouteHintsList(): void;
  getRouteHintsList(): Array<RouteHint>;
  setRouteHintsList(value: Array<RouteHint>): void;
  addRouteHints(value?: RouteHint, index?: number): RouteHint;

  getPrivate(): boolean;
  setPrivate(value: boolean): void;

  getAddIndex(): number;
  setAddIndex(value: number): void;

  getSettleIndex(): number;
  setSettleIndex(value: number): void;

  getAmtPaid(): number;
  setAmtPaid(value: number): void;

  getAmtPaidSat(): number;
  setAmtPaidSat(value: number): void;

  getAmtPaidMsat(): number;
  setAmtPaidMsat(value: number): void;

  getState(): Invoice.InvoiceStateMap[keyof Invoice.InvoiceStateMap];
  setState(value: Invoice.InvoiceStateMap[keyof Invoice.InvoiceStateMap]): void;

  clearHtlcsList(): void;
  getHtlcsList(): Array<InvoiceHTLC>;
  setHtlcsList(value: Array<InvoiceHTLC>): void;
  addHtlcs(value?: InvoiceHTLC, index?: number): InvoiceHTLC;

  getFeaturesMap(): jspb.Map<number, Feature>;
  clearFeaturesMap(): void;
  getIsKeysend(): boolean;
  setIsKeysend(value: boolean): void;

  getPaymentAddr(): Uint8Array | string;
  getPaymentAddr_asU8(): Uint8Array;
  getPaymentAddr_asB64(): string;
  setPaymentAddr(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Invoice.AsObject;
  static toObject(includeInstance: boolean, msg: Invoice): Invoice.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Invoice, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Invoice;
  static deserializeBinaryFromReader(message: Invoice, reader: jspb.BinaryReader): Invoice;
}

export namespace Invoice {
  export type AsObject = {
    memo: string,
    rPreimage: Uint8Array | string,
    rHash: Uint8Array | string,
    value: number,
    valueMsat: number,
    settled: boolean,
    creationDate: number,
    settleDate: number,
    paymentRequest: string,
    descriptionHash: Uint8Array | string,
    expiry: number,
    fallbackAddr: string,
    cltvExpiry: number,
    routeHintsList: Array<RouteHint.AsObject>,
    pb_private: boolean,
    addIndex: number,
    settleIndex: number,
    amtPaid: number,
    amtPaidSat: number,
    amtPaidMsat: number,
    state: Invoice.InvoiceStateMap[keyof Invoice.InvoiceStateMap],
    htlcsList: Array<InvoiceHTLC.AsObject>,
    featuresMap: Array<[number, Feature.AsObject]>,
    isKeysend: boolean,
    paymentAddr: Uint8Array | string,
  }

  export interface InvoiceStateMap {
    OPEN: 0;
    SETTLED: 1;
    CANCELED: 2;
    ACCEPTED: 3;
  }

  export const InvoiceState: InvoiceStateMap;
}

export class InvoiceHTLC extends jspb.Message {
  getChanId(): string;
  setChanId(value: string): void;

  getHtlcIndex(): number;
  setHtlcIndex(value: number): void;

  getAmtMsat(): number;
  setAmtMsat(value: number): void;

  getAcceptHeight(): number;
  setAcceptHeight(value: number): void;

  getAcceptTime(): number;
  setAcceptTime(value: number): void;

  getResolveTime(): number;
  setResolveTime(value: number): void;

  getExpiryHeight(): number;
  setExpiryHeight(value: number): void;

  getState(): InvoiceHTLCStateMap[keyof InvoiceHTLCStateMap];
  setState(value: InvoiceHTLCStateMap[keyof InvoiceHTLCStateMap]): void;

  getCustomRecordsMap(): jspb.Map<number, Uint8Array | string>;
  clearCustomRecordsMap(): void;
  getMppTotalAmtMsat(): number;
  setMppTotalAmtMsat(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InvoiceHTLC.AsObject;
  static toObject(includeInstance: boolean, msg: InvoiceHTLC): InvoiceHTLC.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InvoiceHTLC, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InvoiceHTLC;
  static deserializeBinaryFromReader(message: InvoiceHTLC, reader: jspb.BinaryReader): InvoiceHTLC;
}

export namespace InvoiceHTLC {
  export type AsObject = {
    chanId: string,
    htlcIndex: number,
    amtMsat: number,
    acceptHeight: number,
    acceptTime: number,
    resolveTime: number,
    expiryHeight: number,
    state: InvoiceHTLCStateMap[keyof InvoiceHTLCStateMap],
    customRecordsMap: Array<[number, Uint8Array | string]>,
    mppTotalAmtMsat: number,
  }
}

export class AddInvoiceResponse extends jspb.Message {
  getRHash(): Uint8Array | string;
  getRHash_asU8(): Uint8Array;
  getRHash_asB64(): string;
  setRHash(value: Uint8Array | string): void;

  getPaymentRequest(): string;
  setPaymentRequest(value: string): void;

  getAddIndex(): number;
  setAddIndex(value: number): void;

  getPaymentAddr(): Uint8Array | string;
  getPaymentAddr_asU8(): Uint8Array;
  getPaymentAddr_asB64(): string;
  setPaymentAddr(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddInvoiceResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AddInvoiceResponse): AddInvoiceResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AddInvoiceResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddInvoiceResponse;
  static deserializeBinaryFromReader(message: AddInvoiceResponse, reader: jspb.BinaryReader): AddInvoiceResponse;
}

export namespace AddInvoiceResponse {
  export type AsObject = {
    rHash: Uint8Array | string,
    paymentRequest: string,
    addIndex: number,
    paymentAddr: Uint8Array | string,
  }
}

export class PaymentHash extends jspb.Message {
  getRHashStr(): string;
  setRHashStr(value: string): void;

  getRHash(): Uint8Array | string;
  getRHash_asU8(): Uint8Array;
  getRHash_asB64(): string;
  setRHash(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PaymentHash.AsObject;
  static toObject(includeInstance: boolean, msg: PaymentHash): PaymentHash.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PaymentHash, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PaymentHash;
  static deserializeBinaryFromReader(message: PaymentHash, reader: jspb.BinaryReader): PaymentHash;
}

export namespace PaymentHash {
  export type AsObject = {
    rHashStr: string,
    rHash: Uint8Array | string,
  }
}

export class ListInvoiceRequest extends jspb.Message {
  getPendingOnly(): boolean;
  setPendingOnly(value: boolean): void;

  getIndexOffset(): number;
  setIndexOffset(value: number): void;

  getNumMaxInvoices(): number;
  setNumMaxInvoices(value: number): void;

  getReversed(): boolean;
  setReversed(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListInvoiceRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListInvoiceRequest): ListInvoiceRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListInvoiceRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListInvoiceRequest;
  static deserializeBinaryFromReader(message: ListInvoiceRequest, reader: jspb.BinaryReader): ListInvoiceRequest;
}

export namespace ListInvoiceRequest {
  export type AsObject = {
    pendingOnly: boolean,
    indexOffset: number,
    numMaxInvoices: number,
    reversed: boolean,
  }
}

export class ListInvoiceResponse extends jspb.Message {
  clearInvoicesList(): void;
  getInvoicesList(): Array<Invoice>;
  setInvoicesList(value: Array<Invoice>): void;
  addInvoices(value?: Invoice, index?: number): Invoice;

  getLastIndexOffset(): number;
  setLastIndexOffset(value: number): void;

  getFirstIndexOffset(): number;
  setFirstIndexOffset(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListInvoiceResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListInvoiceResponse): ListInvoiceResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListInvoiceResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListInvoiceResponse;
  static deserializeBinaryFromReader(message: ListInvoiceResponse, reader: jspb.BinaryReader): ListInvoiceResponse;
}

export namespace ListInvoiceResponse {
  export type AsObject = {
    invoicesList: Array<Invoice.AsObject>,
    lastIndexOffset: number,
    firstIndexOffset: number,
  }
}

export class InvoiceSubscription extends jspb.Message {
  getAddIndex(): number;
  setAddIndex(value: number): void;

  getSettleIndex(): number;
  setSettleIndex(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InvoiceSubscription.AsObject;
  static toObject(includeInstance: boolean, msg: InvoiceSubscription): InvoiceSubscription.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InvoiceSubscription, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InvoiceSubscription;
  static deserializeBinaryFromReader(message: InvoiceSubscription, reader: jspb.BinaryReader): InvoiceSubscription;
}

export namespace InvoiceSubscription {
  export type AsObject = {
    addIndex: number,
    settleIndex: number,
  }
}

export class Payment extends jspb.Message {
  getPaymentHash(): string;
  setPaymentHash(value: string): void;

  getValue(): number;
  setValue(value: number): void;

  getCreationDate(): number;
  setCreationDate(value: number): void;

  getFee(): number;
  setFee(value: number): void;

  getPaymentPreimage(): string;
  setPaymentPreimage(value: string): void;

  getValueSat(): number;
  setValueSat(value: number): void;

  getValueMsat(): number;
  setValueMsat(value: number): void;

  getPaymentRequest(): string;
  setPaymentRequest(value: string): void;

  getStatus(): Payment.PaymentStatusMap[keyof Payment.PaymentStatusMap];
  setStatus(value: Payment.PaymentStatusMap[keyof Payment.PaymentStatusMap]): void;

  getFeeSat(): number;
  setFeeSat(value: number): void;

  getFeeMsat(): number;
  setFeeMsat(value: number): void;

  getCreationTimeNs(): number;
  setCreationTimeNs(value: number): void;

  clearHtlcsList(): void;
  getHtlcsList(): Array<HTLCAttempt>;
  setHtlcsList(value: Array<HTLCAttempt>): void;
  addHtlcs(value?: HTLCAttempt, index?: number): HTLCAttempt;

  getPaymentIndex(): number;
  setPaymentIndex(value: number): void;

  getFailureReason(): PaymentFailureReasonMap[keyof PaymentFailureReasonMap];
  setFailureReason(value: PaymentFailureReasonMap[keyof PaymentFailureReasonMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Payment.AsObject;
  static toObject(includeInstance: boolean, msg: Payment): Payment.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Payment, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Payment;
  static deserializeBinaryFromReader(message: Payment, reader: jspb.BinaryReader): Payment;
}

export namespace Payment {
  export type AsObject = {
    paymentHash: string,
    value: number,
    creationDate: number,
    fee: number,
    paymentPreimage: string,
    valueSat: number,
    valueMsat: number,
    paymentRequest: string,
    status: Payment.PaymentStatusMap[keyof Payment.PaymentStatusMap],
    feeSat: number,
    feeMsat: number,
    creationTimeNs: number,
    htlcsList: Array<HTLCAttempt.AsObject>,
    paymentIndex: number,
    failureReason: PaymentFailureReasonMap[keyof PaymentFailureReasonMap],
  }

  export interface PaymentStatusMap {
    UNKNOWN: 0;
    IN_FLIGHT: 1;
    SUCCEEDED: 2;
    FAILED: 3;
  }

  export const PaymentStatus: PaymentStatusMap;
}

export class HTLCAttempt extends jspb.Message {
  getStatus(): HTLCAttempt.HTLCStatusMap[keyof HTLCAttempt.HTLCStatusMap];
  setStatus(value: HTLCAttempt.HTLCStatusMap[keyof HTLCAttempt.HTLCStatusMap]): void;

  hasRoute(): boolean;
  clearRoute(): void;
  getRoute(): Route | undefined;
  setRoute(value?: Route): void;

  getAttemptTimeNs(): number;
  setAttemptTimeNs(value: number): void;

  getResolveTimeNs(): number;
  setResolveTimeNs(value: number): void;

  hasFailure(): boolean;
  clearFailure(): void;
  getFailure(): Failure | undefined;
  setFailure(value?: Failure): void;

  getPreimage(): Uint8Array | string;
  getPreimage_asU8(): Uint8Array;
  getPreimage_asB64(): string;
  setPreimage(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HTLCAttempt.AsObject;
  static toObject(includeInstance: boolean, msg: HTLCAttempt): HTLCAttempt.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: HTLCAttempt, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HTLCAttempt;
  static deserializeBinaryFromReader(message: HTLCAttempt, reader: jspb.BinaryReader): HTLCAttempt;
}

export namespace HTLCAttempt {
  export type AsObject = {
    status: HTLCAttempt.HTLCStatusMap[keyof HTLCAttempt.HTLCStatusMap],
    route?: Route.AsObject,
    attemptTimeNs: number,
    resolveTimeNs: number,
    failure?: Failure.AsObject,
    preimage: Uint8Array | string,
  }

  export interface HTLCStatusMap {
    IN_FLIGHT: 0;
    SUCCEEDED: 1;
    FAILED: 2;
  }

  export const HTLCStatus: HTLCStatusMap;
}

export class ListPaymentsRequest extends jspb.Message {
  getIncludeIncomplete(): boolean;
  setIncludeIncomplete(value: boolean): void;

  getIndexOffset(): number;
  setIndexOffset(value: number): void;

  getMaxPayments(): number;
  setMaxPayments(value: number): void;

  getReversed(): boolean;
  setReversed(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListPaymentsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListPaymentsRequest): ListPaymentsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListPaymentsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListPaymentsRequest;
  static deserializeBinaryFromReader(message: ListPaymentsRequest, reader: jspb.BinaryReader): ListPaymentsRequest;
}

export namespace ListPaymentsRequest {
  export type AsObject = {
    includeIncomplete: boolean,
    indexOffset: number,
    maxPayments: number,
    reversed: boolean,
  }
}

export class ListPaymentsResponse extends jspb.Message {
  clearPaymentsList(): void;
  getPaymentsList(): Array<Payment>;
  setPaymentsList(value: Array<Payment>): void;
  addPayments(value?: Payment, index?: number): Payment;

  getFirstIndexOffset(): number;
  setFirstIndexOffset(value: number): void;

  getLastIndexOffset(): number;
  setLastIndexOffset(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListPaymentsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListPaymentsResponse): ListPaymentsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListPaymentsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListPaymentsResponse;
  static deserializeBinaryFromReader(message: ListPaymentsResponse, reader: jspb.BinaryReader): ListPaymentsResponse;
}

export namespace ListPaymentsResponse {
  export type AsObject = {
    paymentsList: Array<Payment.AsObject>,
    firstIndexOffset: number,
    lastIndexOffset: number,
  }
}

export class DeleteAllPaymentsRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeleteAllPaymentsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: DeleteAllPaymentsRequest): DeleteAllPaymentsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DeleteAllPaymentsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeleteAllPaymentsRequest;
  static deserializeBinaryFromReader(message: DeleteAllPaymentsRequest, reader: jspb.BinaryReader): DeleteAllPaymentsRequest;
}

export namespace DeleteAllPaymentsRequest {
  export type AsObject = {
  }
}

export class DeleteAllPaymentsResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeleteAllPaymentsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: DeleteAllPaymentsResponse): DeleteAllPaymentsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DeleteAllPaymentsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeleteAllPaymentsResponse;
  static deserializeBinaryFromReader(message: DeleteAllPaymentsResponse, reader: jspb.BinaryReader): DeleteAllPaymentsResponse;
}

export namespace DeleteAllPaymentsResponse {
  export type AsObject = {
  }
}

export class AbandonChannelRequest extends jspb.Message {
  hasChannelPoint(): boolean;
  clearChannelPoint(): void;
  getChannelPoint(): ChannelPoint | undefined;
  setChannelPoint(value?: ChannelPoint): void;

  getPendingFundingShimOnly(): boolean;
  setPendingFundingShimOnly(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AbandonChannelRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AbandonChannelRequest): AbandonChannelRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AbandonChannelRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AbandonChannelRequest;
  static deserializeBinaryFromReader(message: AbandonChannelRequest, reader: jspb.BinaryReader): AbandonChannelRequest;
}

export namespace AbandonChannelRequest {
  export type AsObject = {
    channelPoint?: ChannelPoint.AsObject,
    pendingFundingShimOnly: boolean,
  }
}

export class AbandonChannelResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AbandonChannelResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AbandonChannelResponse): AbandonChannelResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AbandonChannelResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AbandonChannelResponse;
  static deserializeBinaryFromReader(message: AbandonChannelResponse, reader: jspb.BinaryReader): AbandonChannelResponse;
}

export namespace AbandonChannelResponse {
  export type AsObject = {
  }
}

export class DebugLevelRequest extends jspb.Message {
  getShow(): boolean;
  setShow(value: boolean): void;

  getLevelSpec(): string;
  setLevelSpec(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DebugLevelRequest.AsObject;
  static toObject(includeInstance: boolean, msg: DebugLevelRequest): DebugLevelRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DebugLevelRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DebugLevelRequest;
  static deserializeBinaryFromReader(message: DebugLevelRequest, reader: jspb.BinaryReader): DebugLevelRequest;
}

export namespace DebugLevelRequest {
  export type AsObject = {
    show: boolean,
    levelSpec: string,
  }
}

export class DebugLevelResponse extends jspb.Message {
  getSubSystems(): string;
  setSubSystems(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DebugLevelResponse.AsObject;
  static toObject(includeInstance: boolean, msg: DebugLevelResponse): DebugLevelResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DebugLevelResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DebugLevelResponse;
  static deserializeBinaryFromReader(message: DebugLevelResponse, reader: jspb.BinaryReader): DebugLevelResponse;
}

export namespace DebugLevelResponse {
  export type AsObject = {
    subSystems: string,
  }
}

export class PayReqString extends jspb.Message {
  getPayReq(): string;
  setPayReq(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PayReqString.AsObject;
  static toObject(includeInstance: boolean, msg: PayReqString): PayReqString.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PayReqString, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PayReqString;
  static deserializeBinaryFromReader(message: PayReqString, reader: jspb.BinaryReader): PayReqString;
}

export namespace PayReqString {
  export type AsObject = {
    payReq: string,
  }
}

export class PayReq extends jspb.Message {
  getDestination(): string;
  setDestination(value: string): void;

  getPaymentHash(): string;
  setPaymentHash(value: string): void;

  getNumSatoshis(): number;
  setNumSatoshis(value: number): void;

  getTimestamp(): number;
  setTimestamp(value: number): void;

  getExpiry(): number;
  setExpiry(value: number): void;

  getDescription(): string;
  setDescription(value: string): void;

  getDescriptionHash(): string;
  setDescriptionHash(value: string): void;

  getFallbackAddr(): string;
  setFallbackAddr(value: string): void;

  getCltvExpiry(): number;
  setCltvExpiry(value: number): void;

  clearRouteHintsList(): void;
  getRouteHintsList(): Array<RouteHint>;
  setRouteHintsList(value: Array<RouteHint>): void;
  addRouteHints(value?: RouteHint, index?: number): RouteHint;

  getPaymentAddr(): Uint8Array | string;
  getPaymentAddr_asU8(): Uint8Array;
  getPaymentAddr_asB64(): string;
  setPaymentAddr(value: Uint8Array | string): void;

  getNumMsat(): number;
  setNumMsat(value: number): void;

  getFeaturesMap(): jspb.Map<number, Feature>;
  clearFeaturesMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PayReq.AsObject;
  static toObject(includeInstance: boolean, msg: PayReq): PayReq.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PayReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PayReq;
  static deserializeBinaryFromReader(message: PayReq, reader: jspb.BinaryReader): PayReq;
}

export namespace PayReq {
  export type AsObject = {
    destination: string,
    paymentHash: string,
    numSatoshis: number,
    timestamp: number,
    expiry: number,
    description: string,
    descriptionHash: string,
    fallbackAddr: string,
    cltvExpiry: number,
    routeHintsList: Array<RouteHint.AsObject>,
    paymentAddr: Uint8Array | string,
    numMsat: number,
    featuresMap: Array<[number, Feature.AsObject]>,
  }
}

export class Feature extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getIsRequired(): boolean;
  setIsRequired(value: boolean): void;

  getIsKnown(): boolean;
  setIsKnown(value: boolean): void;

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
    isRequired: boolean,
    isKnown: boolean,
  }
}

export class FeeReportRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FeeReportRequest.AsObject;
  static toObject(includeInstance: boolean, msg: FeeReportRequest): FeeReportRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FeeReportRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FeeReportRequest;
  static deserializeBinaryFromReader(message: FeeReportRequest, reader: jspb.BinaryReader): FeeReportRequest;
}

export namespace FeeReportRequest {
  export type AsObject = {
  }
}

export class ChannelFeeReport extends jspb.Message {
  getChanId(): string;
  setChanId(value: string): void;

  getChannelPoint(): string;
  setChannelPoint(value: string): void;

  getBaseFeeMsat(): number;
  setBaseFeeMsat(value: number): void;

  getFeePerMil(): number;
  setFeePerMil(value: number): void;

  getFeeRate(): number;
  setFeeRate(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChannelFeeReport.AsObject;
  static toObject(includeInstance: boolean, msg: ChannelFeeReport): ChannelFeeReport.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChannelFeeReport, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChannelFeeReport;
  static deserializeBinaryFromReader(message: ChannelFeeReport, reader: jspb.BinaryReader): ChannelFeeReport;
}

export namespace ChannelFeeReport {
  export type AsObject = {
    chanId: string,
    channelPoint: string,
    baseFeeMsat: number,
    feePerMil: number,
    feeRate: number,
  }
}

export class FeeReportResponse extends jspb.Message {
  clearChannelFeesList(): void;
  getChannelFeesList(): Array<ChannelFeeReport>;
  setChannelFeesList(value: Array<ChannelFeeReport>): void;
  addChannelFees(value?: ChannelFeeReport, index?: number): ChannelFeeReport;

  getDayFeeSum(): number;
  setDayFeeSum(value: number): void;

  getWeekFeeSum(): number;
  setWeekFeeSum(value: number): void;

  getMonthFeeSum(): number;
  setMonthFeeSum(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FeeReportResponse.AsObject;
  static toObject(includeInstance: boolean, msg: FeeReportResponse): FeeReportResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FeeReportResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FeeReportResponse;
  static deserializeBinaryFromReader(message: FeeReportResponse, reader: jspb.BinaryReader): FeeReportResponse;
}

export namespace FeeReportResponse {
  export type AsObject = {
    channelFeesList: Array<ChannelFeeReport.AsObject>,
    dayFeeSum: number,
    weekFeeSum: number,
    monthFeeSum: number,
  }
}

export class PolicyUpdateRequest extends jspb.Message {
  hasGlobal(): boolean;
  clearGlobal(): void;
  getGlobal(): boolean;
  setGlobal(value: boolean): void;

  hasChanPoint(): boolean;
  clearChanPoint(): void;
  getChanPoint(): ChannelPoint | undefined;
  setChanPoint(value?: ChannelPoint): void;

  getBaseFeeMsat(): number;
  setBaseFeeMsat(value: number): void;

  getFeeRate(): number;
  setFeeRate(value: number): void;

  getTimeLockDelta(): number;
  setTimeLockDelta(value: number): void;

  getMaxHtlcMsat(): number;
  setMaxHtlcMsat(value: number): void;

  getMinHtlcMsat(): number;
  setMinHtlcMsat(value: number): void;

  getMinHtlcMsatSpecified(): boolean;
  setMinHtlcMsatSpecified(value: boolean): void;

  getScopeCase(): PolicyUpdateRequest.ScopeCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PolicyUpdateRequest.AsObject;
  static toObject(includeInstance: boolean, msg: PolicyUpdateRequest): PolicyUpdateRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PolicyUpdateRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PolicyUpdateRequest;
  static deserializeBinaryFromReader(message: PolicyUpdateRequest, reader: jspb.BinaryReader): PolicyUpdateRequest;
}

export namespace PolicyUpdateRequest {
  export type AsObject = {
    global: boolean,
    chanPoint?: ChannelPoint.AsObject,
    baseFeeMsat: number,
    feeRate: number,
    timeLockDelta: number,
    maxHtlcMsat: number,
    minHtlcMsat: number,
    minHtlcMsatSpecified: boolean,
  }

  export enum ScopeCase {
    SCOPE_NOT_SET = 0,
    GLOBAL = 1,
    CHAN_POINT = 2,
  }
}

export class PolicyUpdateResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PolicyUpdateResponse.AsObject;
  static toObject(includeInstance: boolean, msg: PolicyUpdateResponse): PolicyUpdateResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PolicyUpdateResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PolicyUpdateResponse;
  static deserializeBinaryFromReader(message: PolicyUpdateResponse, reader: jspb.BinaryReader): PolicyUpdateResponse;
}

export namespace PolicyUpdateResponse {
  export type AsObject = {
  }
}

export class ForwardingHistoryRequest extends jspb.Message {
  getStartTime(): number;
  setStartTime(value: number): void;

  getEndTime(): number;
  setEndTime(value: number): void;

  getIndexOffset(): number;
  setIndexOffset(value: number): void;

  getNumMaxEvents(): number;
  setNumMaxEvents(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ForwardingHistoryRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ForwardingHistoryRequest): ForwardingHistoryRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ForwardingHistoryRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ForwardingHistoryRequest;
  static deserializeBinaryFromReader(message: ForwardingHistoryRequest, reader: jspb.BinaryReader): ForwardingHistoryRequest;
}

export namespace ForwardingHistoryRequest {
  export type AsObject = {
    startTime: number,
    endTime: number,
    indexOffset: number,
    numMaxEvents: number,
  }
}

export class ForwardingEvent extends jspb.Message {
  getTimestamp(): number;
  setTimestamp(value: number): void;

  getChanIdIn(): string;
  setChanIdIn(value: string): void;

  getChanIdOut(): string;
  setChanIdOut(value: string): void;

  getAmtIn(): number;
  setAmtIn(value: number): void;

  getAmtOut(): number;
  setAmtOut(value: number): void;

  getFee(): number;
  setFee(value: number): void;

  getFeeMsat(): number;
  setFeeMsat(value: number): void;

  getAmtInMsat(): number;
  setAmtInMsat(value: number): void;

  getAmtOutMsat(): number;
  setAmtOutMsat(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ForwardingEvent.AsObject;
  static toObject(includeInstance: boolean, msg: ForwardingEvent): ForwardingEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ForwardingEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ForwardingEvent;
  static deserializeBinaryFromReader(message: ForwardingEvent, reader: jspb.BinaryReader): ForwardingEvent;
}

export namespace ForwardingEvent {
  export type AsObject = {
    timestamp: number,
    chanIdIn: string,
    chanIdOut: string,
    amtIn: number,
    amtOut: number,
    fee: number,
    feeMsat: number,
    amtInMsat: number,
    amtOutMsat: number,
  }
}

export class ForwardingHistoryResponse extends jspb.Message {
  clearForwardingEventsList(): void;
  getForwardingEventsList(): Array<ForwardingEvent>;
  setForwardingEventsList(value: Array<ForwardingEvent>): void;
  addForwardingEvents(value?: ForwardingEvent, index?: number): ForwardingEvent;

  getLastOffsetIndex(): number;
  setLastOffsetIndex(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ForwardingHistoryResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ForwardingHistoryResponse): ForwardingHistoryResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ForwardingHistoryResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ForwardingHistoryResponse;
  static deserializeBinaryFromReader(message: ForwardingHistoryResponse, reader: jspb.BinaryReader): ForwardingHistoryResponse;
}

export namespace ForwardingHistoryResponse {
  export type AsObject = {
    forwardingEventsList: Array<ForwardingEvent.AsObject>,
    lastOffsetIndex: number,
  }
}

export class ExportChannelBackupRequest extends jspb.Message {
  hasChanPoint(): boolean;
  clearChanPoint(): void;
  getChanPoint(): ChannelPoint | undefined;
  setChanPoint(value?: ChannelPoint): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExportChannelBackupRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ExportChannelBackupRequest): ExportChannelBackupRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExportChannelBackupRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExportChannelBackupRequest;
  static deserializeBinaryFromReader(message: ExportChannelBackupRequest, reader: jspb.BinaryReader): ExportChannelBackupRequest;
}

export namespace ExportChannelBackupRequest {
  export type AsObject = {
    chanPoint?: ChannelPoint.AsObject,
  }
}

export class ChannelBackup extends jspb.Message {
  hasChanPoint(): boolean;
  clearChanPoint(): void;
  getChanPoint(): ChannelPoint | undefined;
  setChanPoint(value?: ChannelPoint): void;

  getChanBackup(): Uint8Array | string;
  getChanBackup_asU8(): Uint8Array;
  getChanBackup_asB64(): string;
  setChanBackup(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChannelBackup.AsObject;
  static toObject(includeInstance: boolean, msg: ChannelBackup): ChannelBackup.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChannelBackup, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChannelBackup;
  static deserializeBinaryFromReader(message: ChannelBackup, reader: jspb.BinaryReader): ChannelBackup;
}

export namespace ChannelBackup {
  export type AsObject = {
    chanPoint?: ChannelPoint.AsObject,
    chanBackup: Uint8Array | string,
  }
}

export class MultiChanBackup extends jspb.Message {
  clearChanPointsList(): void;
  getChanPointsList(): Array<ChannelPoint>;
  setChanPointsList(value: Array<ChannelPoint>): void;
  addChanPoints(value?: ChannelPoint, index?: number): ChannelPoint;

  getMultiChanBackup(): Uint8Array | string;
  getMultiChanBackup_asU8(): Uint8Array;
  getMultiChanBackup_asB64(): string;
  setMultiChanBackup(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MultiChanBackup.AsObject;
  static toObject(includeInstance: boolean, msg: MultiChanBackup): MultiChanBackup.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MultiChanBackup, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MultiChanBackup;
  static deserializeBinaryFromReader(message: MultiChanBackup, reader: jspb.BinaryReader): MultiChanBackup;
}

export namespace MultiChanBackup {
  export type AsObject = {
    chanPointsList: Array<ChannelPoint.AsObject>,
    multiChanBackup: Uint8Array | string,
  }
}

export class ChanBackupExportRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChanBackupExportRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ChanBackupExportRequest): ChanBackupExportRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChanBackupExportRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChanBackupExportRequest;
  static deserializeBinaryFromReader(message: ChanBackupExportRequest, reader: jspb.BinaryReader): ChanBackupExportRequest;
}

export namespace ChanBackupExportRequest {
  export type AsObject = {
  }
}

export class ChanBackupSnapshot extends jspb.Message {
  hasSingleChanBackups(): boolean;
  clearSingleChanBackups(): void;
  getSingleChanBackups(): ChannelBackups | undefined;
  setSingleChanBackups(value?: ChannelBackups): void;

  hasMultiChanBackup(): boolean;
  clearMultiChanBackup(): void;
  getMultiChanBackup(): MultiChanBackup | undefined;
  setMultiChanBackup(value?: MultiChanBackup): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChanBackupSnapshot.AsObject;
  static toObject(includeInstance: boolean, msg: ChanBackupSnapshot): ChanBackupSnapshot.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChanBackupSnapshot, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChanBackupSnapshot;
  static deserializeBinaryFromReader(message: ChanBackupSnapshot, reader: jspb.BinaryReader): ChanBackupSnapshot;
}

export namespace ChanBackupSnapshot {
  export type AsObject = {
    singleChanBackups?: ChannelBackups.AsObject,
    multiChanBackup?: MultiChanBackup.AsObject,
  }
}

export class ChannelBackups extends jspb.Message {
  clearChanBackupsList(): void;
  getChanBackupsList(): Array<ChannelBackup>;
  setChanBackupsList(value: Array<ChannelBackup>): void;
  addChanBackups(value?: ChannelBackup, index?: number): ChannelBackup;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChannelBackups.AsObject;
  static toObject(includeInstance: boolean, msg: ChannelBackups): ChannelBackups.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChannelBackups, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChannelBackups;
  static deserializeBinaryFromReader(message: ChannelBackups, reader: jspb.BinaryReader): ChannelBackups;
}

export namespace ChannelBackups {
  export type AsObject = {
    chanBackupsList: Array<ChannelBackup.AsObject>,
  }
}

export class RestoreChanBackupRequest extends jspb.Message {
  hasChanBackups(): boolean;
  clearChanBackups(): void;
  getChanBackups(): ChannelBackups | undefined;
  setChanBackups(value?: ChannelBackups): void;

  hasMultiChanBackup(): boolean;
  clearMultiChanBackup(): void;
  getMultiChanBackup(): Uint8Array | string;
  getMultiChanBackup_asU8(): Uint8Array;
  getMultiChanBackup_asB64(): string;
  setMultiChanBackup(value: Uint8Array | string): void;

  getBackupCase(): RestoreChanBackupRequest.BackupCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RestoreChanBackupRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RestoreChanBackupRequest): RestoreChanBackupRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RestoreChanBackupRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RestoreChanBackupRequest;
  static deserializeBinaryFromReader(message: RestoreChanBackupRequest, reader: jspb.BinaryReader): RestoreChanBackupRequest;
}

export namespace RestoreChanBackupRequest {
  export type AsObject = {
    chanBackups?: ChannelBackups.AsObject,
    multiChanBackup: Uint8Array | string,
  }

  export enum BackupCase {
    BACKUP_NOT_SET = 0,
    CHAN_BACKUPS = 1,
    MULTI_CHAN_BACKUP = 2,
  }
}

export class RestoreBackupResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RestoreBackupResponse.AsObject;
  static toObject(includeInstance: boolean, msg: RestoreBackupResponse): RestoreBackupResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RestoreBackupResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RestoreBackupResponse;
  static deserializeBinaryFromReader(message: RestoreBackupResponse, reader: jspb.BinaryReader): RestoreBackupResponse;
}

export namespace RestoreBackupResponse {
  export type AsObject = {
  }
}

export class ChannelBackupSubscription extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChannelBackupSubscription.AsObject;
  static toObject(includeInstance: boolean, msg: ChannelBackupSubscription): ChannelBackupSubscription.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChannelBackupSubscription, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChannelBackupSubscription;
  static deserializeBinaryFromReader(message: ChannelBackupSubscription, reader: jspb.BinaryReader): ChannelBackupSubscription;
}

export namespace ChannelBackupSubscription {
  export type AsObject = {
  }
}

export class VerifyChanBackupResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VerifyChanBackupResponse.AsObject;
  static toObject(includeInstance: boolean, msg: VerifyChanBackupResponse): VerifyChanBackupResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: VerifyChanBackupResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VerifyChanBackupResponse;
  static deserializeBinaryFromReader(message: VerifyChanBackupResponse, reader: jspb.BinaryReader): VerifyChanBackupResponse;
}

export namespace VerifyChanBackupResponse {
  export type AsObject = {
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

export class BakeMacaroonRequest extends jspb.Message {
  clearPermissionsList(): void;
  getPermissionsList(): Array<MacaroonPermission>;
  setPermissionsList(value: Array<MacaroonPermission>): void;
  addPermissions(value?: MacaroonPermission, index?: number): MacaroonPermission;

  getRootKeyId(): number;
  setRootKeyId(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BakeMacaroonRequest.AsObject;
  static toObject(includeInstance: boolean, msg: BakeMacaroonRequest): BakeMacaroonRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BakeMacaroonRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BakeMacaroonRequest;
  static deserializeBinaryFromReader(message: BakeMacaroonRequest, reader: jspb.BinaryReader): BakeMacaroonRequest;
}

export namespace BakeMacaroonRequest {
  export type AsObject = {
    permissionsList: Array<MacaroonPermission.AsObject>,
    rootKeyId: number,
  }
}

export class BakeMacaroonResponse extends jspb.Message {
  getMacaroon(): string;
  setMacaroon(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BakeMacaroonResponse.AsObject;
  static toObject(includeInstance: boolean, msg: BakeMacaroonResponse): BakeMacaroonResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BakeMacaroonResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BakeMacaroonResponse;
  static deserializeBinaryFromReader(message: BakeMacaroonResponse, reader: jspb.BinaryReader): BakeMacaroonResponse;
}

export namespace BakeMacaroonResponse {
  export type AsObject = {
    macaroon: string,
  }
}

export class ListMacaroonIDsRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListMacaroonIDsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListMacaroonIDsRequest): ListMacaroonIDsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListMacaroonIDsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListMacaroonIDsRequest;
  static deserializeBinaryFromReader(message: ListMacaroonIDsRequest, reader: jspb.BinaryReader): ListMacaroonIDsRequest;
}

export namespace ListMacaroonIDsRequest {
  export type AsObject = {
  }
}

export class ListMacaroonIDsResponse extends jspb.Message {
  clearRootKeyIdsList(): void;
  getRootKeyIdsList(): Array<number>;
  setRootKeyIdsList(value: Array<number>): void;
  addRootKeyIds(value: number, index?: number): number;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListMacaroonIDsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListMacaroonIDsResponse): ListMacaroonIDsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListMacaroonIDsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListMacaroonIDsResponse;
  static deserializeBinaryFromReader(message: ListMacaroonIDsResponse, reader: jspb.BinaryReader): ListMacaroonIDsResponse;
}

export namespace ListMacaroonIDsResponse {
  export type AsObject = {
    rootKeyIdsList: Array<number>,
  }
}

export class DeleteMacaroonIDRequest extends jspb.Message {
  getRootKeyId(): number;
  setRootKeyId(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeleteMacaroonIDRequest.AsObject;
  static toObject(includeInstance: boolean, msg: DeleteMacaroonIDRequest): DeleteMacaroonIDRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DeleteMacaroonIDRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeleteMacaroonIDRequest;
  static deserializeBinaryFromReader(message: DeleteMacaroonIDRequest, reader: jspb.BinaryReader): DeleteMacaroonIDRequest;
}

export namespace DeleteMacaroonIDRequest {
  export type AsObject = {
    rootKeyId: number,
  }
}

export class DeleteMacaroonIDResponse extends jspb.Message {
  getDeleted(): boolean;
  setDeleted(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeleteMacaroonIDResponse.AsObject;
  static toObject(includeInstance: boolean, msg: DeleteMacaroonIDResponse): DeleteMacaroonIDResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DeleteMacaroonIDResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeleteMacaroonIDResponse;
  static deserializeBinaryFromReader(message: DeleteMacaroonIDResponse, reader: jspb.BinaryReader): DeleteMacaroonIDResponse;
}

export namespace DeleteMacaroonIDResponse {
  export type AsObject = {
    deleted: boolean,
  }
}

export class MacaroonPermissionList extends jspb.Message {
  clearPermissionsList(): void;
  getPermissionsList(): Array<MacaroonPermission>;
  setPermissionsList(value: Array<MacaroonPermission>): void;
  addPermissions(value?: MacaroonPermission, index?: number): MacaroonPermission;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MacaroonPermissionList.AsObject;
  static toObject(includeInstance: boolean, msg: MacaroonPermissionList): MacaroonPermissionList.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MacaroonPermissionList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MacaroonPermissionList;
  static deserializeBinaryFromReader(message: MacaroonPermissionList, reader: jspb.BinaryReader): MacaroonPermissionList;
}

export namespace MacaroonPermissionList {
  export type AsObject = {
    permissionsList: Array<MacaroonPermission.AsObject>,
  }
}

export class ListPermissionsRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListPermissionsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListPermissionsRequest): ListPermissionsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListPermissionsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListPermissionsRequest;
  static deserializeBinaryFromReader(message: ListPermissionsRequest, reader: jspb.BinaryReader): ListPermissionsRequest;
}

export namespace ListPermissionsRequest {
  export type AsObject = {
  }
}

export class ListPermissionsResponse extends jspb.Message {
  getMethodPermissionsMap(): jspb.Map<string, MacaroonPermissionList>;
  clearMethodPermissionsMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListPermissionsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListPermissionsResponse): ListPermissionsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListPermissionsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListPermissionsResponse;
  static deserializeBinaryFromReader(message: ListPermissionsResponse, reader: jspb.BinaryReader): ListPermissionsResponse;
}

export namespace ListPermissionsResponse {
  export type AsObject = {
    methodPermissionsMap: Array<[string, MacaroonPermissionList.AsObject]>,
  }
}

export class Failure extends jspb.Message {
  getCode(): Failure.FailureCodeMap[keyof Failure.FailureCodeMap];
  setCode(value: Failure.FailureCodeMap[keyof Failure.FailureCodeMap]): void;

  hasChannelUpdate(): boolean;
  clearChannelUpdate(): void;
  getChannelUpdate(): ChannelUpdate | undefined;
  setChannelUpdate(value?: ChannelUpdate): void;

  getHtlcMsat(): number;
  setHtlcMsat(value: number): void;

  getOnionSha256(): Uint8Array | string;
  getOnionSha256_asU8(): Uint8Array;
  getOnionSha256_asB64(): string;
  setOnionSha256(value: Uint8Array | string): void;

  getCltvExpiry(): number;
  setCltvExpiry(value: number): void;

  getFlags(): number;
  setFlags(value: number): void;

  getFailureSourceIndex(): number;
  setFailureSourceIndex(value: number): void;

  getHeight(): number;
  setHeight(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Failure.AsObject;
  static toObject(includeInstance: boolean, msg: Failure): Failure.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Failure, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Failure;
  static deserializeBinaryFromReader(message: Failure, reader: jspb.BinaryReader): Failure;
}

export namespace Failure {
  export type AsObject = {
    code: Failure.FailureCodeMap[keyof Failure.FailureCodeMap],
    channelUpdate?: ChannelUpdate.AsObject,
    htlcMsat: number,
    onionSha256: Uint8Array | string,
    cltvExpiry: number,
    flags: number,
    failureSourceIndex: number,
    height: number,
  }

  export interface FailureCodeMap {
    RESERVED: 0;
    INCORRECT_OR_UNKNOWN_PAYMENT_DETAILS: 1;
    INCORRECT_PAYMENT_AMOUNT: 2;
    FINAL_INCORRECT_CLTV_EXPIRY: 3;
    FINAL_INCORRECT_HTLC_AMOUNT: 4;
    FINAL_EXPIRY_TOO_SOON: 5;
    INVALID_REALM: 6;
    EXPIRY_TOO_SOON: 7;
    INVALID_ONION_VERSION: 8;
    INVALID_ONION_HMAC: 9;
    INVALID_ONION_KEY: 10;
    AMOUNT_BELOW_MINIMUM: 11;
    FEE_INSUFFICIENT: 12;
    INCORRECT_CLTV_EXPIRY: 13;
    CHANNEL_DISABLED: 14;
    TEMPORARY_CHANNEL_FAILURE: 15;
    REQUIRED_NODE_FEATURE_MISSING: 16;
    REQUIRED_CHANNEL_FEATURE_MISSING: 17;
    UNKNOWN_NEXT_PEER: 18;
    TEMPORARY_NODE_FAILURE: 19;
    PERMANENT_NODE_FAILURE: 20;
    PERMANENT_CHANNEL_FAILURE: 21;
    EXPIRY_TOO_FAR: 22;
    MPP_TIMEOUT: 23;
    INTERNAL_FAILURE: 997;
    UNKNOWN_FAILURE: 998;
    UNREADABLE_FAILURE: 999;
  }

  export const FailureCode: FailureCodeMap;
}

export class ChannelUpdate extends jspb.Message {
  getSignature(): Uint8Array | string;
  getSignature_asU8(): Uint8Array;
  getSignature_asB64(): string;
  setSignature(value: Uint8Array | string): void;

  getChainHash(): Uint8Array | string;
  getChainHash_asU8(): Uint8Array;
  getChainHash_asB64(): string;
  setChainHash(value: Uint8Array | string): void;

  getChanId(): string;
  setChanId(value: string): void;

  getTimestamp(): number;
  setTimestamp(value: number): void;

  getMessageFlags(): number;
  setMessageFlags(value: number): void;

  getChannelFlags(): number;
  setChannelFlags(value: number): void;

  getTimeLockDelta(): number;
  setTimeLockDelta(value: number): void;

  getHtlcMinimumMsat(): number;
  setHtlcMinimumMsat(value: number): void;

  getBaseFee(): number;
  setBaseFee(value: number): void;

  getFeeRate(): number;
  setFeeRate(value: number): void;

  getHtlcMaximumMsat(): number;
  setHtlcMaximumMsat(value: number): void;

  getExtraOpaqueData(): Uint8Array | string;
  getExtraOpaqueData_asU8(): Uint8Array;
  getExtraOpaqueData_asB64(): string;
  setExtraOpaqueData(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChannelUpdate.AsObject;
  static toObject(includeInstance: boolean, msg: ChannelUpdate): ChannelUpdate.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChannelUpdate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChannelUpdate;
  static deserializeBinaryFromReader(message: ChannelUpdate, reader: jspb.BinaryReader): ChannelUpdate;
}

export namespace ChannelUpdate {
  export type AsObject = {
    signature: Uint8Array | string,
    chainHash: Uint8Array | string,
    chanId: string,
    timestamp: number,
    messageFlags: number,
    channelFlags: number,
    timeLockDelta: number,
    htlcMinimumMsat: number,
    baseFee: number,
    feeRate: number,
    htlcMaximumMsat: number,
    extraOpaqueData: Uint8Array | string,
  }
}

export class MacaroonId extends jspb.Message {
  getNonce(): Uint8Array | string;
  getNonce_asU8(): Uint8Array;
  getNonce_asB64(): string;
  setNonce(value: Uint8Array | string): void;

  getStorageid(): Uint8Array | string;
  getStorageid_asU8(): Uint8Array;
  getStorageid_asB64(): string;
  setStorageid(value: Uint8Array | string): void;

  clearOpsList(): void;
  getOpsList(): Array<Op>;
  setOpsList(value: Array<Op>): void;
  addOps(value?: Op, index?: number): Op;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MacaroonId.AsObject;
  static toObject(includeInstance: boolean, msg: MacaroonId): MacaroonId.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MacaroonId, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MacaroonId;
  static deserializeBinaryFromReader(message: MacaroonId, reader: jspb.BinaryReader): MacaroonId;
}

export namespace MacaroonId {
  export type AsObject = {
    nonce: Uint8Array | string,
    storageid: Uint8Array | string,
    opsList: Array<Op.AsObject>,
  }
}

export class Op extends jspb.Message {
  getEntity(): string;
  setEntity(value: string): void;

  clearActionsList(): void;
  getActionsList(): Array<string>;
  setActionsList(value: Array<string>): void;
  addActions(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Op.AsObject;
  static toObject(includeInstance: boolean, msg: Op): Op.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Op, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Op;
  static deserializeBinaryFromReader(message: Op, reader: jspb.BinaryReader): Op;
}

export namespace Op {
  export type AsObject = {
    entity: string,
    actionsList: Array<string>,
  }
}

export interface AddressTypeMap {
  WITNESS_PUBKEY_HASH: 0;
  NESTED_PUBKEY_HASH: 1;
  UNUSED_WITNESS_PUBKEY_HASH: 2;
  UNUSED_NESTED_PUBKEY_HASH: 3;
}

export const AddressType: AddressTypeMap;

export interface CommitmentTypeMap {
  LEGACY: 0;
  STATIC_REMOTE_KEY: 1;
  ANCHORS: 2;
  UNKNOWN_COMMITMENT_TYPE: 999;
}

export const CommitmentType: CommitmentTypeMap;

export interface InitiatorMap {
  INITIATOR_UNKNOWN: 0;
  INITIATOR_LOCAL: 1;
  INITIATOR_REMOTE: 2;
  INITIATOR_BOTH: 3;
}

export const Initiator: InitiatorMap;

export interface ResolutionTypeMap {
  TYPE_UNKNOWN: 0;
  ANCHOR: 1;
  INCOMING_HTLC: 2;
  OUTGOING_HTLC: 3;
  COMMIT: 4;
}

export const ResolutionType: ResolutionTypeMap;

export interface ResolutionOutcomeMap {
  OUTCOME_UNKNOWN: 0;
  CLAIMED: 1;
  UNCLAIMED: 2;
  ABANDONED: 3;
  FIRST_STAGE: 4;
  TIMEOUT: 5;
}

export const ResolutionOutcome: ResolutionOutcomeMap;

export interface NodeMetricTypeMap {
  UNKNOWN: 0;
  BETWEENNESS_CENTRALITY: 1;
}

export const NodeMetricType: NodeMetricTypeMap;

export interface InvoiceHTLCStateMap {
  ACCEPTED: 0;
  SETTLED: 1;
  CANCELED: 2;
}

export const InvoiceHTLCState: InvoiceHTLCStateMap;

export interface PaymentFailureReasonMap {
  FAILURE_REASON_NONE: 0;
  FAILURE_REASON_TIMEOUT: 1;
  FAILURE_REASON_NO_ROUTE: 2;
  FAILURE_REASON_ERROR: 3;
  FAILURE_REASON_INCORRECT_PAYMENT_DETAILS: 4;
  FAILURE_REASON_INSUFFICIENT_BALANCE: 5;
}

export const PaymentFailureReason: PaymentFailureReasonMap;

export interface FeatureBitMap {
  DATALOSS_PROTECT_REQ: 0;
  DATALOSS_PROTECT_OPT: 1;
  INITIAL_ROUING_SYNC: 3;
  UPFRONT_SHUTDOWN_SCRIPT_REQ: 4;
  UPFRONT_SHUTDOWN_SCRIPT_OPT: 5;
  GOSSIP_QUERIES_REQ: 6;
  GOSSIP_QUERIES_OPT: 7;
  TLV_ONION_REQ: 8;
  TLV_ONION_OPT: 9;
  EXT_GOSSIP_QUERIES_REQ: 10;
  EXT_GOSSIP_QUERIES_OPT: 11;
  STATIC_REMOTE_KEY_REQ: 12;
  STATIC_REMOTE_KEY_OPT: 13;
  PAYMENT_ADDR_REQ: 14;
  PAYMENT_ADDR_OPT: 15;
  MPP_REQ: 16;
  MPP_OPT: 17;
  WUMBO_CHANNELS_REQ: 18;
  WUMBO_CHANNELS_OPT: 19;
  ANCHORS_REQ: 20;
  ANCHORS_OPT: 21;
  ANCHORS_ZERO_FEE_HTLC_REQ: 22;
  ANCHORS_ZERO_FEE_HTLC_OPT: 23;
}

export const FeatureBit: FeatureBitMap;

