/* eslint-disable */
var proto = { poolrpc: {} };

/**
 * @fileoverview
 * @enhanceable
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!

var jspb = require('google-protobuf');
var goog = jspb;
var global = Function('return this')();

goog.exportSymbol('proto.poolrpc.AccountCommitment', null, global);
goog.exportSymbol('proto.poolrpc.AccountDiff', null, global);
goog.exportSymbol('proto.poolrpc.AccountDiff.AccountState', null, global);
goog.exportSymbol('proto.poolrpc.AccountRecovery', null, global);
goog.exportSymbol('proto.poolrpc.AccountSubscription', null, global);
goog.exportSymbol('proto.poolrpc.AskSnapshot', null, global);
goog.exportSymbol('proto.poolrpc.AuctionAccount', null, global);
goog.exportSymbol('proto.poolrpc.AuctionAccountState', null, global);
goog.exportSymbol('proto.poolrpc.AuctionType', null, global);
goog.exportSymbol('proto.poolrpc.BatchSnapshotRequest', null, global);
goog.exportSymbol('proto.poolrpc.BatchSnapshotResponse', null, global);
goog.exportSymbol('proto.poolrpc.BatchSnapshotsRequest', null, global);
goog.exportSymbol('proto.poolrpc.BatchSnapshotsResponse', null, global);
goog.exportSymbol('proto.poolrpc.BidSnapshot', null, global);
goog.exportSymbol('proto.poolrpc.CancelOrder', null, global);
goog.exportSymbol('proto.poolrpc.ChannelAnnouncementConstraints', null, global);
goog.exportSymbol('proto.poolrpc.ChannelConfirmationConstraints', null, global);
goog.exportSymbol('proto.poolrpc.ChannelInfo', null, global);
goog.exportSymbol('proto.poolrpc.ChannelType', null, global);
goog.exportSymbol('proto.poolrpc.ClientAuctionMessage', null, global);
goog.exportSymbol('proto.poolrpc.DurationBucketState', null, global);
goog.exportSymbol('proto.poolrpc.ExecutionFee', null, global);
goog.exportSymbol('proto.poolrpc.InvalidOrder', null, global);
goog.exportSymbol('proto.poolrpc.InvalidOrder.FailReason', null, global);
goog.exportSymbol('proto.poolrpc.MarketInfo', null, global);
goog.exportSymbol('proto.poolrpc.MarketInfo.TierValue', null, global);
goog.exportSymbol('proto.poolrpc.MarketInfoRequest', null, global);
goog.exportSymbol('proto.poolrpc.MarketInfoResponse', null, global);
goog.exportSymbol('proto.poolrpc.MatchedAsk', null, global);
goog.exportSymbol('proto.poolrpc.MatchedBid', null, global);
goog.exportSymbol('proto.poolrpc.MatchedMarket', null, global);
goog.exportSymbol('proto.poolrpc.MatchedMarketSnapshot', null, global);
goog.exportSymbol('proto.poolrpc.MatchedOrder', null, global);
goog.exportSymbol('proto.poolrpc.MatchedOrderSnapshot', null, global);
goog.exportSymbol('proto.poolrpc.NodeAddress', null, global);
goog.exportSymbol('proto.poolrpc.NodeRating', null, global);
goog.exportSymbol('proto.poolrpc.NodeTier', null, global);
goog.exportSymbol('proto.poolrpc.OrderChannelType', null, global);
goog.exportSymbol('proto.poolrpc.OrderMatchAccept', null, global);
goog.exportSymbol('proto.poolrpc.OrderMatchFinalize', null, global);
goog.exportSymbol('proto.poolrpc.OrderMatchPrepare', null, global);
goog.exportSymbol('proto.poolrpc.OrderMatchReject', null, global);
goog.exportSymbol('proto.poolrpc.OrderMatchReject.RejectReason', null, global);
goog.exportSymbol('proto.poolrpc.OrderMatchSign', null, global);
goog.exportSymbol('proto.poolrpc.OrderMatchSignBegin', null, global);
goog.exportSymbol('proto.poolrpc.OrderReject', null, global);
goog.exportSymbol('proto.poolrpc.OrderReject.OrderRejectReason', null, global);
goog.exportSymbol('proto.poolrpc.OrderState', null, global);
goog.exportSymbol('proto.poolrpc.OutPoint', null, global);
goog.exportSymbol('proto.poolrpc.RelevantBatch', null, global);
goog.exportSymbol('proto.poolrpc.RelevantBatchRequest', null, global);
goog.exportSymbol('proto.poolrpc.ReserveAccountRequest', null, global);
goog.exportSymbol('proto.poolrpc.ReserveAccountResponse', null, global);
goog.exportSymbol('proto.poolrpc.ServerAsk', null, global);
goog.exportSymbol('proto.poolrpc.ServerAuctionMessage', null, global);
goog.exportSymbol('proto.poolrpc.ServerBid', null, global);
goog.exportSymbol('proto.poolrpc.ServerCancelOrderRequest', null, global);
goog.exportSymbol('proto.poolrpc.ServerCancelOrderResponse', null, global);
goog.exportSymbol('proto.poolrpc.ServerChallenge', null, global);
goog.exportSymbol('proto.poolrpc.ServerInitAccountRequest', null, global);
goog.exportSymbol('proto.poolrpc.ServerInitAccountResponse', null, global);
goog.exportSymbol('proto.poolrpc.ServerInput', null, global);
goog.exportSymbol('proto.poolrpc.ServerModifyAccountRequest', null, global);
goog.exportSymbol('proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters', null, global);
goog.exportSymbol('proto.poolrpc.ServerModifyAccountResponse', null, global);
goog.exportSymbol('proto.poolrpc.ServerNodeRatingRequest', null, global);
goog.exportSymbol('proto.poolrpc.ServerNodeRatingResponse', null, global);
goog.exportSymbol('proto.poolrpc.ServerOrder', null, global);
goog.exportSymbol('proto.poolrpc.ServerOrderStateRequest', null, global);
goog.exportSymbol('proto.poolrpc.ServerOrderStateResponse', null, global);
goog.exportSymbol('proto.poolrpc.ServerOutput', null, global);
goog.exportSymbol('proto.poolrpc.ServerSubmitOrderRequest', null, global);
goog.exportSymbol('proto.poolrpc.ServerSubmitOrderResponse', null, global);
goog.exportSymbol('proto.poolrpc.SubscribeError', null, global);
goog.exportSymbol('proto.poolrpc.SubscribeError.Error', null, global);
goog.exportSymbol('proto.poolrpc.SubscribeSuccess', null, global);
goog.exportSymbol('proto.poolrpc.TermsRequest', null, global);
goog.exportSymbol('proto.poolrpc.TermsResponse', null, global);
goog.exportSymbol('proto.poolrpc.TxOut', null, global);

/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.ReserveAccountRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.ReserveAccountRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ReserveAccountRequest.displayName = 'proto.poolrpc.ReserveAccountRequest';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.ReserveAccountRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ReserveAccountRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ReserveAccountRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ReserveAccountRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    accountValue: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    accountExpiry: jspb.Message.getFieldWithDefault(msg, 2, 0),
    traderKey: msg.getTraderKey_asB64(),
    version: jspb.Message.getFieldWithDefault(msg, 4, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.ReserveAccountRequest}
 */
proto.poolrpc.ReserveAccountRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ReserveAccountRequest;
  return proto.poolrpc.ReserveAccountRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ReserveAccountRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ReserveAccountRequest}
 */
proto.poolrpc.ReserveAccountRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setAccountValue(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setAccountExpiry(value);
      break;
    case 3:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setTraderKey(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setVersion(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.ReserveAccountRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ReserveAccountRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ReserveAccountRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ReserveAccountRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAccountValue();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      1,
      f
    );
  }
  f = message.getAccountExpiry();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
  f = message.getTraderKey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      3,
      f
    );
  }
  f = message.getVersion();
  if (f !== 0) {
    writer.writeUint32(
      4,
      f
    );
  }
};


/**
 * optional uint64 account_value = 1;
 * @return {string}
 */
proto.poolrpc.ReserveAccountRequest.prototype.getAccountValue = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/** @param {string} value */
proto.poolrpc.ReserveAccountRequest.prototype.setAccountValue = function(value) {
  jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional uint32 account_expiry = 2;
 * @return {number}
 */
proto.poolrpc.ReserveAccountRequest.prototype.getAccountExpiry = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.ReserveAccountRequest.prototype.setAccountExpiry = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional bytes trader_key = 3;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.ReserveAccountRequest.prototype.getTraderKey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * optional bytes trader_key = 3;
 * This is a type-conversion wrapper around `getTraderKey()`
 * @return {string}
 */
proto.poolrpc.ReserveAccountRequest.prototype.getTraderKey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getTraderKey()));
};


/**
 * optional bytes trader_key = 3;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getTraderKey()`
 * @return {!Uint8Array}
 */
proto.poolrpc.ReserveAccountRequest.prototype.getTraderKey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getTraderKey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.ReserveAccountRequest.prototype.setTraderKey = function(value) {
  jspb.Message.setProto3BytesField(this, 3, value);
};


/**
 * optional uint32 version = 4;
 * @return {number}
 */
proto.poolrpc.ReserveAccountRequest.prototype.getVersion = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {number} value */
proto.poolrpc.ReserveAccountRequest.prototype.setVersion = function(value) {
  jspb.Message.setProto3IntField(this, 4, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.ReserveAccountResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.ReserveAccountResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ReserveAccountResponse.displayName = 'proto.poolrpc.ReserveAccountResponse';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.ReserveAccountResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ReserveAccountResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ReserveAccountResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ReserveAccountResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    auctioneerKey: msg.getAuctioneerKey_asB64(),
    initialBatchKey: msg.getInitialBatchKey_asB64()
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.ReserveAccountResponse}
 */
proto.poolrpc.ReserveAccountResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ReserveAccountResponse;
  return proto.poolrpc.ReserveAccountResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ReserveAccountResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ReserveAccountResponse}
 */
proto.poolrpc.ReserveAccountResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setAuctioneerKey(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setInitialBatchKey(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.ReserveAccountResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ReserveAccountResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ReserveAccountResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ReserveAccountResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAuctioneerKey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getInitialBatchKey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
};


/**
 * optional bytes auctioneer_key = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.ReserveAccountResponse.prototype.getAuctioneerKey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes auctioneer_key = 1;
 * This is a type-conversion wrapper around `getAuctioneerKey()`
 * @return {string}
 */
proto.poolrpc.ReserveAccountResponse.prototype.getAuctioneerKey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getAuctioneerKey()));
};


/**
 * optional bytes auctioneer_key = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getAuctioneerKey()`
 * @return {!Uint8Array}
 */
proto.poolrpc.ReserveAccountResponse.prototype.getAuctioneerKey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getAuctioneerKey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.ReserveAccountResponse.prototype.setAuctioneerKey = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional bytes initial_batch_key = 2;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.ReserveAccountResponse.prototype.getInitialBatchKey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes initial_batch_key = 2;
 * This is a type-conversion wrapper around `getInitialBatchKey()`
 * @return {string}
 */
proto.poolrpc.ReserveAccountResponse.prototype.getInitialBatchKey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getInitialBatchKey()));
};


/**
 * optional bytes initial_batch_key = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getInitialBatchKey()`
 * @return {!Uint8Array}
 */
proto.poolrpc.ReserveAccountResponse.prototype.getInitialBatchKey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getInitialBatchKey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.ReserveAccountResponse.prototype.setInitialBatchKey = function(value) {
  jspb.Message.setProto3BytesField(this, 2, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.ServerInitAccountRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.ServerInitAccountRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ServerInitAccountRequest.displayName = 'proto.poolrpc.ServerInitAccountRequest';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.ServerInitAccountRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ServerInitAccountRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ServerInitAccountRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerInitAccountRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    accountPoint: (f = msg.getAccountPoint()) && proto.poolrpc.OutPoint.toObject(includeInstance, f),
    accountScript: msg.getAccountScript_asB64(),
    accountValue: jspb.Message.getFieldWithDefault(msg, 3, "0"),
    accountExpiry: jspb.Message.getFieldWithDefault(msg, 4, 0),
    traderKey: msg.getTraderKey_asB64(),
    userAgent: jspb.Message.getFieldWithDefault(msg, 6, ""),
    version: jspb.Message.getFieldWithDefault(msg, 7, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.ServerInitAccountRequest}
 */
proto.poolrpc.ServerInitAccountRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ServerInitAccountRequest;
  return proto.poolrpc.ServerInitAccountRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ServerInitAccountRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ServerInitAccountRequest}
 */
proto.poolrpc.ServerInitAccountRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.OutPoint;
      reader.readMessage(value,proto.poolrpc.OutPoint.deserializeBinaryFromReader);
      msg.setAccountPoint(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setAccountScript(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setAccountValue(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setAccountExpiry(value);
      break;
    case 5:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setTraderKey(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserAgent(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setVersion(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerInitAccountRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ServerInitAccountRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ServerInitAccountRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerInitAccountRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAccountPoint();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.poolrpc.OutPoint.serializeBinaryToWriter
    );
  }
  f = message.getAccountScript_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
  f = message.getAccountValue();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      3,
      f
    );
  }
  f = message.getAccountExpiry();
  if (f !== 0) {
    writer.writeUint32(
      4,
      f
    );
  }
  f = message.getTraderKey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      5,
      f
    );
  }
  f = message.getUserAgent();
  if (f.length > 0) {
    writer.writeString(
      6,
      f
    );
  }
  f = message.getVersion();
  if (f !== 0) {
    writer.writeUint32(
      7,
      f
    );
  }
};


/**
 * optional OutPoint account_point = 1;
 * @return {?proto.poolrpc.OutPoint}
 */
proto.poolrpc.ServerInitAccountRequest.prototype.getAccountPoint = function() {
  return /** @type{?proto.poolrpc.OutPoint} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.OutPoint, 1));
};


/** @param {?proto.poolrpc.OutPoint|undefined} value */
proto.poolrpc.ServerInitAccountRequest.prototype.setAccountPoint = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


proto.poolrpc.ServerInitAccountRequest.prototype.clearAccountPoint = function() {
  this.setAccountPoint(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.ServerInitAccountRequest.prototype.hasAccountPoint = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional bytes account_script = 2;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.ServerInitAccountRequest.prototype.getAccountScript = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes account_script = 2;
 * This is a type-conversion wrapper around `getAccountScript()`
 * @return {string}
 */
proto.poolrpc.ServerInitAccountRequest.prototype.getAccountScript_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getAccountScript()));
};


/**
 * optional bytes account_script = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getAccountScript()`
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerInitAccountRequest.prototype.getAccountScript_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getAccountScript()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.ServerInitAccountRequest.prototype.setAccountScript = function(value) {
  jspb.Message.setProto3BytesField(this, 2, value);
};


/**
 * optional uint64 account_value = 3;
 * @return {string}
 */
proto.poolrpc.ServerInitAccountRequest.prototype.getAccountValue = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, "0"));
};


/** @param {string} value */
proto.poolrpc.ServerInitAccountRequest.prototype.setAccountValue = function(value) {
  jspb.Message.setProto3StringIntField(this, 3, value);
};


/**
 * optional uint32 account_expiry = 4;
 * @return {number}
 */
proto.poolrpc.ServerInitAccountRequest.prototype.getAccountExpiry = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {number} value */
proto.poolrpc.ServerInitAccountRequest.prototype.setAccountExpiry = function(value) {
  jspb.Message.setProto3IntField(this, 4, value);
};


/**
 * optional bytes trader_key = 5;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.ServerInitAccountRequest.prototype.getTraderKey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * optional bytes trader_key = 5;
 * This is a type-conversion wrapper around `getTraderKey()`
 * @return {string}
 */
proto.poolrpc.ServerInitAccountRequest.prototype.getTraderKey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getTraderKey()));
};


/**
 * optional bytes trader_key = 5;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getTraderKey()`
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerInitAccountRequest.prototype.getTraderKey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getTraderKey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.ServerInitAccountRequest.prototype.setTraderKey = function(value) {
  jspb.Message.setProto3BytesField(this, 5, value);
};


/**
 * optional string user_agent = 6;
 * @return {string}
 */
proto.poolrpc.ServerInitAccountRequest.prototype.getUserAgent = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
};


/** @param {string} value */
proto.poolrpc.ServerInitAccountRequest.prototype.setUserAgent = function(value) {
  jspb.Message.setProto3StringField(this, 6, value);
};


/**
 * optional uint32 version = 7;
 * @return {number}
 */
proto.poolrpc.ServerInitAccountRequest.prototype.getVersion = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/** @param {number} value */
proto.poolrpc.ServerInitAccountRequest.prototype.setVersion = function(value) {
  jspb.Message.setProto3IntField(this, 7, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.ServerInitAccountResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.ServerInitAccountResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ServerInitAccountResponse.displayName = 'proto.poolrpc.ServerInitAccountResponse';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.ServerInitAccountResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ServerInitAccountResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ServerInitAccountResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerInitAccountResponse.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.ServerInitAccountResponse}
 */
proto.poolrpc.ServerInitAccountResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ServerInitAccountResponse;
  return proto.poolrpc.ServerInitAccountResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ServerInitAccountResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ServerInitAccountResponse}
 */
proto.poolrpc.ServerInitAccountResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerInitAccountResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ServerInitAccountResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ServerInitAccountResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerInitAccountResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.ServerSubmitOrderRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.poolrpc.ServerSubmitOrderRequest.oneofGroups_);
};
goog.inherits(proto.poolrpc.ServerSubmitOrderRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ServerSubmitOrderRequest.displayName = 'proto.poolrpc.ServerSubmitOrderRequest';
}
/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.poolrpc.ServerSubmitOrderRequest.oneofGroups_ = [[1,2]];

/**
 * @enum {number}
 */
proto.poolrpc.ServerSubmitOrderRequest.DetailsCase = {
  DETAILS_NOT_SET: 0,
  ASK: 1,
  BID: 2
};

/**
 * @return {proto.poolrpc.ServerSubmitOrderRequest.DetailsCase}
 */
proto.poolrpc.ServerSubmitOrderRequest.prototype.getDetailsCase = function() {
  return /** @type {proto.poolrpc.ServerSubmitOrderRequest.DetailsCase} */(jspb.Message.computeOneofCase(this, proto.poolrpc.ServerSubmitOrderRequest.oneofGroups_[0]));
};



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.ServerSubmitOrderRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ServerSubmitOrderRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ServerSubmitOrderRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerSubmitOrderRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    ask: (f = msg.getAsk()) && proto.poolrpc.ServerAsk.toObject(includeInstance, f),
    bid: (f = msg.getBid()) && proto.poolrpc.ServerBid.toObject(includeInstance, f),
    userAgent: jspb.Message.getFieldWithDefault(msg, 3, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.ServerSubmitOrderRequest}
 */
proto.poolrpc.ServerSubmitOrderRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ServerSubmitOrderRequest;
  return proto.poolrpc.ServerSubmitOrderRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ServerSubmitOrderRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ServerSubmitOrderRequest}
 */
proto.poolrpc.ServerSubmitOrderRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.ServerAsk;
      reader.readMessage(value,proto.poolrpc.ServerAsk.deserializeBinaryFromReader);
      msg.setAsk(value);
      break;
    case 2:
      var value = new proto.poolrpc.ServerBid;
      reader.readMessage(value,proto.poolrpc.ServerBid.deserializeBinaryFromReader);
      msg.setBid(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserAgent(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerSubmitOrderRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ServerSubmitOrderRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ServerSubmitOrderRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerSubmitOrderRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAsk();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.poolrpc.ServerAsk.serializeBinaryToWriter
    );
  }
  f = message.getBid();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.poolrpc.ServerBid.serializeBinaryToWriter
    );
  }
  f = message.getUserAgent();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
};


/**
 * optional ServerAsk ask = 1;
 * @return {?proto.poolrpc.ServerAsk}
 */
proto.poolrpc.ServerSubmitOrderRequest.prototype.getAsk = function() {
  return /** @type{?proto.poolrpc.ServerAsk} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.ServerAsk, 1));
};


/** @param {?proto.poolrpc.ServerAsk|undefined} value */
proto.poolrpc.ServerSubmitOrderRequest.prototype.setAsk = function(value) {
  jspb.Message.setOneofWrapperField(this, 1, proto.poolrpc.ServerSubmitOrderRequest.oneofGroups_[0], value);
};


proto.poolrpc.ServerSubmitOrderRequest.prototype.clearAsk = function() {
  this.setAsk(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.ServerSubmitOrderRequest.prototype.hasAsk = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional ServerBid bid = 2;
 * @return {?proto.poolrpc.ServerBid}
 */
proto.poolrpc.ServerSubmitOrderRequest.prototype.getBid = function() {
  return /** @type{?proto.poolrpc.ServerBid} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.ServerBid, 2));
};


/** @param {?proto.poolrpc.ServerBid|undefined} value */
proto.poolrpc.ServerSubmitOrderRequest.prototype.setBid = function(value) {
  jspb.Message.setOneofWrapperField(this, 2, proto.poolrpc.ServerSubmitOrderRequest.oneofGroups_[0], value);
};


proto.poolrpc.ServerSubmitOrderRequest.prototype.clearBid = function() {
  this.setBid(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.ServerSubmitOrderRequest.prototype.hasBid = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional string user_agent = 3;
 * @return {string}
 */
proto.poolrpc.ServerSubmitOrderRequest.prototype.getUserAgent = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/** @param {string} value */
proto.poolrpc.ServerSubmitOrderRequest.prototype.setUserAgent = function(value) {
  jspb.Message.setProto3StringField(this, 3, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.ServerSubmitOrderResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.poolrpc.ServerSubmitOrderResponse.oneofGroups_);
};
goog.inherits(proto.poolrpc.ServerSubmitOrderResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ServerSubmitOrderResponse.displayName = 'proto.poolrpc.ServerSubmitOrderResponse';
}
/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.poolrpc.ServerSubmitOrderResponse.oneofGroups_ = [[1,2]];

/**
 * @enum {number}
 */
proto.poolrpc.ServerSubmitOrderResponse.DetailsCase = {
  DETAILS_NOT_SET: 0,
  INVALID_ORDER: 1,
  ACCEPTED: 2
};

/**
 * @return {proto.poolrpc.ServerSubmitOrderResponse.DetailsCase}
 */
proto.poolrpc.ServerSubmitOrderResponse.prototype.getDetailsCase = function() {
  return /** @type {proto.poolrpc.ServerSubmitOrderResponse.DetailsCase} */(jspb.Message.computeOneofCase(this, proto.poolrpc.ServerSubmitOrderResponse.oneofGroups_[0]));
};



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.ServerSubmitOrderResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ServerSubmitOrderResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ServerSubmitOrderResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerSubmitOrderResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    invalidOrder: (f = msg.getInvalidOrder()) && proto.poolrpc.InvalidOrder.toObject(includeInstance, f),
    accepted: jspb.Message.getFieldWithDefault(msg, 2, false)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.ServerSubmitOrderResponse}
 */
proto.poolrpc.ServerSubmitOrderResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ServerSubmitOrderResponse;
  return proto.poolrpc.ServerSubmitOrderResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ServerSubmitOrderResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ServerSubmitOrderResponse}
 */
proto.poolrpc.ServerSubmitOrderResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.InvalidOrder;
      reader.readMessage(value,proto.poolrpc.InvalidOrder.deserializeBinaryFromReader);
      msg.setInvalidOrder(value);
      break;
    case 2:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setAccepted(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerSubmitOrderResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ServerSubmitOrderResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ServerSubmitOrderResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerSubmitOrderResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getInvalidOrder();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.poolrpc.InvalidOrder.serializeBinaryToWriter
    );
  }
  f = /** @type {boolean} */ (jspb.Message.getField(message, 2));
  if (f != null) {
    writer.writeBool(
      2,
      f
    );
  }
};


/**
 * optional InvalidOrder invalid_order = 1;
 * @return {?proto.poolrpc.InvalidOrder}
 */
proto.poolrpc.ServerSubmitOrderResponse.prototype.getInvalidOrder = function() {
  return /** @type{?proto.poolrpc.InvalidOrder} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.InvalidOrder, 1));
};


/** @param {?proto.poolrpc.InvalidOrder|undefined} value */
proto.poolrpc.ServerSubmitOrderResponse.prototype.setInvalidOrder = function(value) {
  jspb.Message.setOneofWrapperField(this, 1, proto.poolrpc.ServerSubmitOrderResponse.oneofGroups_[0], value);
};


proto.poolrpc.ServerSubmitOrderResponse.prototype.clearInvalidOrder = function() {
  this.setInvalidOrder(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.ServerSubmitOrderResponse.prototype.hasInvalidOrder = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional bool accepted = 2;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.poolrpc.ServerSubmitOrderResponse.prototype.getAccepted = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 2, false));
};


/** @param {boolean} value */
proto.poolrpc.ServerSubmitOrderResponse.prototype.setAccepted = function(value) {
  jspb.Message.setOneofField(this, 2, proto.poolrpc.ServerSubmitOrderResponse.oneofGroups_[0], value);
};


proto.poolrpc.ServerSubmitOrderResponse.prototype.clearAccepted = function() {
  jspb.Message.setOneofField(this, 2, proto.poolrpc.ServerSubmitOrderResponse.oneofGroups_[0], undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.ServerSubmitOrderResponse.prototype.hasAccepted = function() {
  return jspb.Message.getField(this, 2) != null;
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.ServerCancelOrderRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.ServerCancelOrderRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ServerCancelOrderRequest.displayName = 'proto.poolrpc.ServerCancelOrderRequest';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.ServerCancelOrderRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ServerCancelOrderRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ServerCancelOrderRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerCancelOrderRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    orderNoncePreimage: msg.getOrderNoncePreimage_asB64()
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.ServerCancelOrderRequest}
 */
proto.poolrpc.ServerCancelOrderRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ServerCancelOrderRequest;
  return proto.poolrpc.ServerCancelOrderRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ServerCancelOrderRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ServerCancelOrderRequest}
 */
proto.poolrpc.ServerCancelOrderRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setOrderNoncePreimage(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerCancelOrderRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ServerCancelOrderRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ServerCancelOrderRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerCancelOrderRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getOrderNoncePreimage_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
};


/**
 * optional bytes order_nonce_preimage = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.ServerCancelOrderRequest.prototype.getOrderNoncePreimage = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes order_nonce_preimage = 1;
 * This is a type-conversion wrapper around `getOrderNoncePreimage()`
 * @return {string}
 */
proto.poolrpc.ServerCancelOrderRequest.prototype.getOrderNoncePreimage_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getOrderNoncePreimage()));
};


/**
 * optional bytes order_nonce_preimage = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getOrderNoncePreimage()`
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerCancelOrderRequest.prototype.getOrderNoncePreimage_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getOrderNoncePreimage()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.ServerCancelOrderRequest.prototype.setOrderNoncePreimage = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.ServerCancelOrderResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.ServerCancelOrderResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ServerCancelOrderResponse.displayName = 'proto.poolrpc.ServerCancelOrderResponse';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.ServerCancelOrderResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ServerCancelOrderResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ServerCancelOrderResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerCancelOrderResponse.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.ServerCancelOrderResponse}
 */
proto.poolrpc.ServerCancelOrderResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ServerCancelOrderResponse;
  return proto.poolrpc.ServerCancelOrderResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ServerCancelOrderResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ServerCancelOrderResponse}
 */
proto.poolrpc.ServerCancelOrderResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerCancelOrderResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ServerCancelOrderResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ServerCancelOrderResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerCancelOrderResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.ClientAuctionMessage = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.poolrpc.ClientAuctionMessage.oneofGroups_);
};
goog.inherits(proto.poolrpc.ClientAuctionMessage, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ClientAuctionMessage.displayName = 'proto.poolrpc.ClientAuctionMessage';
}
/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.poolrpc.ClientAuctionMessage.oneofGroups_ = [[1,2,3,4,5,6]];

/**
 * @enum {number}
 */
proto.poolrpc.ClientAuctionMessage.MsgCase = {
  MSG_NOT_SET: 0,
  COMMIT: 1,
  SUBSCRIBE: 2,
  ACCEPT: 3,
  REJECT: 4,
  SIGN: 5,
  RECOVER: 6
};

/**
 * @return {proto.poolrpc.ClientAuctionMessage.MsgCase}
 */
proto.poolrpc.ClientAuctionMessage.prototype.getMsgCase = function() {
  return /** @type {proto.poolrpc.ClientAuctionMessage.MsgCase} */(jspb.Message.computeOneofCase(this, proto.poolrpc.ClientAuctionMessage.oneofGroups_[0]));
};



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.ClientAuctionMessage.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ClientAuctionMessage.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ClientAuctionMessage} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ClientAuctionMessage.toObject = function(includeInstance, msg) {
  var f, obj = {
    commit: (f = msg.getCommit()) && proto.poolrpc.AccountCommitment.toObject(includeInstance, f),
    subscribe: (f = msg.getSubscribe()) && proto.poolrpc.AccountSubscription.toObject(includeInstance, f),
    accept: (f = msg.getAccept()) && proto.poolrpc.OrderMatchAccept.toObject(includeInstance, f),
    reject: (f = msg.getReject()) && proto.poolrpc.OrderMatchReject.toObject(includeInstance, f),
    sign: (f = msg.getSign()) && proto.poolrpc.OrderMatchSign.toObject(includeInstance, f),
    recover: (f = msg.getRecover()) && proto.poolrpc.AccountRecovery.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.ClientAuctionMessage}
 */
proto.poolrpc.ClientAuctionMessage.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ClientAuctionMessage;
  return proto.poolrpc.ClientAuctionMessage.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ClientAuctionMessage} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ClientAuctionMessage}
 */
proto.poolrpc.ClientAuctionMessage.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.AccountCommitment;
      reader.readMessage(value,proto.poolrpc.AccountCommitment.deserializeBinaryFromReader);
      msg.setCommit(value);
      break;
    case 2:
      var value = new proto.poolrpc.AccountSubscription;
      reader.readMessage(value,proto.poolrpc.AccountSubscription.deserializeBinaryFromReader);
      msg.setSubscribe(value);
      break;
    case 3:
      var value = new proto.poolrpc.OrderMatchAccept;
      reader.readMessage(value,proto.poolrpc.OrderMatchAccept.deserializeBinaryFromReader);
      msg.setAccept(value);
      break;
    case 4:
      var value = new proto.poolrpc.OrderMatchReject;
      reader.readMessage(value,proto.poolrpc.OrderMatchReject.deserializeBinaryFromReader);
      msg.setReject(value);
      break;
    case 5:
      var value = new proto.poolrpc.OrderMatchSign;
      reader.readMessage(value,proto.poolrpc.OrderMatchSign.deserializeBinaryFromReader);
      msg.setSign(value);
      break;
    case 6:
      var value = new proto.poolrpc.AccountRecovery;
      reader.readMessage(value,proto.poolrpc.AccountRecovery.deserializeBinaryFromReader);
      msg.setRecover(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.ClientAuctionMessage.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ClientAuctionMessage.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ClientAuctionMessage} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ClientAuctionMessage.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getCommit();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.poolrpc.AccountCommitment.serializeBinaryToWriter
    );
  }
  f = message.getSubscribe();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.poolrpc.AccountSubscription.serializeBinaryToWriter
    );
  }
  f = message.getAccept();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.poolrpc.OrderMatchAccept.serializeBinaryToWriter
    );
  }
  f = message.getReject();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.poolrpc.OrderMatchReject.serializeBinaryToWriter
    );
  }
  f = message.getSign();
  if (f != null) {
    writer.writeMessage(
      5,
      f,
      proto.poolrpc.OrderMatchSign.serializeBinaryToWriter
    );
  }
  f = message.getRecover();
  if (f != null) {
    writer.writeMessage(
      6,
      f,
      proto.poolrpc.AccountRecovery.serializeBinaryToWriter
    );
  }
};


/**
 * optional AccountCommitment commit = 1;
 * @return {?proto.poolrpc.AccountCommitment}
 */
proto.poolrpc.ClientAuctionMessage.prototype.getCommit = function() {
  return /** @type{?proto.poolrpc.AccountCommitment} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.AccountCommitment, 1));
};


/** @param {?proto.poolrpc.AccountCommitment|undefined} value */
proto.poolrpc.ClientAuctionMessage.prototype.setCommit = function(value) {
  jspb.Message.setOneofWrapperField(this, 1, proto.poolrpc.ClientAuctionMessage.oneofGroups_[0], value);
};


proto.poolrpc.ClientAuctionMessage.prototype.clearCommit = function() {
  this.setCommit(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.ClientAuctionMessage.prototype.hasCommit = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional AccountSubscription subscribe = 2;
 * @return {?proto.poolrpc.AccountSubscription}
 */
proto.poolrpc.ClientAuctionMessage.prototype.getSubscribe = function() {
  return /** @type{?proto.poolrpc.AccountSubscription} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.AccountSubscription, 2));
};


/** @param {?proto.poolrpc.AccountSubscription|undefined} value */
proto.poolrpc.ClientAuctionMessage.prototype.setSubscribe = function(value) {
  jspb.Message.setOneofWrapperField(this, 2, proto.poolrpc.ClientAuctionMessage.oneofGroups_[0], value);
};


proto.poolrpc.ClientAuctionMessage.prototype.clearSubscribe = function() {
  this.setSubscribe(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.ClientAuctionMessage.prototype.hasSubscribe = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional OrderMatchAccept accept = 3;
 * @return {?proto.poolrpc.OrderMatchAccept}
 */
proto.poolrpc.ClientAuctionMessage.prototype.getAccept = function() {
  return /** @type{?proto.poolrpc.OrderMatchAccept} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.OrderMatchAccept, 3));
};


/** @param {?proto.poolrpc.OrderMatchAccept|undefined} value */
proto.poolrpc.ClientAuctionMessage.prototype.setAccept = function(value) {
  jspb.Message.setOneofWrapperField(this, 3, proto.poolrpc.ClientAuctionMessage.oneofGroups_[0], value);
};


proto.poolrpc.ClientAuctionMessage.prototype.clearAccept = function() {
  this.setAccept(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.ClientAuctionMessage.prototype.hasAccept = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional OrderMatchReject reject = 4;
 * @return {?proto.poolrpc.OrderMatchReject}
 */
proto.poolrpc.ClientAuctionMessage.prototype.getReject = function() {
  return /** @type{?proto.poolrpc.OrderMatchReject} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.OrderMatchReject, 4));
};


/** @param {?proto.poolrpc.OrderMatchReject|undefined} value */
proto.poolrpc.ClientAuctionMessage.prototype.setReject = function(value) {
  jspb.Message.setOneofWrapperField(this, 4, proto.poolrpc.ClientAuctionMessage.oneofGroups_[0], value);
};


proto.poolrpc.ClientAuctionMessage.prototype.clearReject = function() {
  this.setReject(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.ClientAuctionMessage.prototype.hasReject = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional OrderMatchSign sign = 5;
 * @return {?proto.poolrpc.OrderMatchSign}
 */
proto.poolrpc.ClientAuctionMessage.prototype.getSign = function() {
  return /** @type{?proto.poolrpc.OrderMatchSign} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.OrderMatchSign, 5));
};


/** @param {?proto.poolrpc.OrderMatchSign|undefined} value */
proto.poolrpc.ClientAuctionMessage.prototype.setSign = function(value) {
  jspb.Message.setOneofWrapperField(this, 5, proto.poolrpc.ClientAuctionMessage.oneofGroups_[0], value);
};


proto.poolrpc.ClientAuctionMessage.prototype.clearSign = function() {
  this.setSign(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.ClientAuctionMessage.prototype.hasSign = function() {
  return jspb.Message.getField(this, 5) != null;
};


/**
 * optional AccountRecovery recover = 6;
 * @return {?proto.poolrpc.AccountRecovery}
 */
proto.poolrpc.ClientAuctionMessage.prototype.getRecover = function() {
  return /** @type{?proto.poolrpc.AccountRecovery} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.AccountRecovery, 6));
};


/** @param {?proto.poolrpc.AccountRecovery|undefined} value */
proto.poolrpc.ClientAuctionMessage.prototype.setRecover = function(value) {
  jspb.Message.setOneofWrapperField(this, 6, proto.poolrpc.ClientAuctionMessage.oneofGroups_[0], value);
};


proto.poolrpc.ClientAuctionMessage.prototype.clearRecover = function() {
  this.setRecover(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.ClientAuctionMessage.prototype.hasRecover = function() {
  return jspb.Message.getField(this, 6) != null;
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.AccountCommitment = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.AccountCommitment, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.AccountCommitment.displayName = 'proto.poolrpc.AccountCommitment';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.AccountCommitment.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.AccountCommitment.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.AccountCommitment} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.AccountCommitment.toObject = function(includeInstance, msg) {
  var f, obj = {
    commitHash: msg.getCommitHash_asB64(),
    batchVersion: jspb.Message.getFieldWithDefault(msg, 2, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.AccountCommitment}
 */
proto.poolrpc.AccountCommitment.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.AccountCommitment;
  return proto.poolrpc.AccountCommitment.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.AccountCommitment} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.AccountCommitment}
 */
proto.poolrpc.AccountCommitment.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setCommitHash(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setBatchVersion(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.AccountCommitment.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.AccountCommitment.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.AccountCommitment} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.AccountCommitment.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getCommitHash_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getBatchVersion();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
};


/**
 * optional bytes commit_hash = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.AccountCommitment.prototype.getCommitHash = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes commit_hash = 1;
 * This is a type-conversion wrapper around `getCommitHash()`
 * @return {string}
 */
proto.poolrpc.AccountCommitment.prototype.getCommitHash_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getCommitHash()));
};


/**
 * optional bytes commit_hash = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getCommitHash()`
 * @return {!Uint8Array}
 */
proto.poolrpc.AccountCommitment.prototype.getCommitHash_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getCommitHash()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.AccountCommitment.prototype.setCommitHash = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional uint32 batch_version = 2;
 * @return {number}
 */
proto.poolrpc.AccountCommitment.prototype.getBatchVersion = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.AccountCommitment.prototype.setBatchVersion = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.AccountSubscription = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.AccountSubscription, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.AccountSubscription.displayName = 'proto.poolrpc.AccountSubscription';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.AccountSubscription.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.AccountSubscription.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.AccountSubscription} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.AccountSubscription.toObject = function(includeInstance, msg) {
  var f, obj = {
    traderKey: msg.getTraderKey_asB64(),
    commitNonce: msg.getCommitNonce_asB64(),
    authSig: msg.getAuthSig_asB64()
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.AccountSubscription}
 */
proto.poolrpc.AccountSubscription.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.AccountSubscription;
  return proto.poolrpc.AccountSubscription.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.AccountSubscription} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.AccountSubscription}
 */
proto.poolrpc.AccountSubscription.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setTraderKey(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setCommitNonce(value);
      break;
    case 3:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setAuthSig(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.AccountSubscription.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.AccountSubscription.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.AccountSubscription} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.AccountSubscription.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTraderKey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getCommitNonce_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
  f = message.getAuthSig_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      3,
      f
    );
  }
};


/**
 * optional bytes trader_key = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.AccountSubscription.prototype.getTraderKey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes trader_key = 1;
 * This is a type-conversion wrapper around `getTraderKey()`
 * @return {string}
 */
proto.poolrpc.AccountSubscription.prototype.getTraderKey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getTraderKey()));
};


/**
 * optional bytes trader_key = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getTraderKey()`
 * @return {!Uint8Array}
 */
proto.poolrpc.AccountSubscription.prototype.getTraderKey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getTraderKey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.AccountSubscription.prototype.setTraderKey = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional bytes commit_nonce = 2;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.AccountSubscription.prototype.getCommitNonce = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes commit_nonce = 2;
 * This is a type-conversion wrapper around `getCommitNonce()`
 * @return {string}
 */
proto.poolrpc.AccountSubscription.prototype.getCommitNonce_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getCommitNonce()));
};


/**
 * optional bytes commit_nonce = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getCommitNonce()`
 * @return {!Uint8Array}
 */
proto.poolrpc.AccountSubscription.prototype.getCommitNonce_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getCommitNonce()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.AccountSubscription.prototype.setCommitNonce = function(value) {
  jspb.Message.setProto3BytesField(this, 2, value);
};


/**
 * optional bytes auth_sig = 3;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.AccountSubscription.prototype.getAuthSig = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * optional bytes auth_sig = 3;
 * This is a type-conversion wrapper around `getAuthSig()`
 * @return {string}
 */
proto.poolrpc.AccountSubscription.prototype.getAuthSig_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getAuthSig()));
};


/**
 * optional bytes auth_sig = 3;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getAuthSig()`
 * @return {!Uint8Array}
 */
proto.poolrpc.AccountSubscription.prototype.getAuthSig_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getAuthSig()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.AccountSubscription.prototype.setAuthSig = function(value) {
  jspb.Message.setProto3BytesField(this, 3, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.OrderMatchAccept = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.OrderMatchAccept, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.OrderMatchAccept.displayName = 'proto.poolrpc.OrderMatchAccept';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.OrderMatchAccept.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.OrderMatchAccept.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.OrderMatchAccept} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.OrderMatchAccept.toObject = function(includeInstance, msg) {
  var f, obj = {
    batchId: msg.getBatchId_asB64()
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.OrderMatchAccept}
 */
proto.poolrpc.OrderMatchAccept.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.OrderMatchAccept;
  return proto.poolrpc.OrderMatchAccept.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.OrderMatchAccept} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.OrderMatchAccept}
 */
proto.poolrpc.OrderMatchAccept.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setBatchId(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.OrderMatchAccept.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.OrderMatchAccept.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.OrderMatchAccept} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.OrderMatchAccept.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBatchId_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
};


/**
 * optional bytes batch_id = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.OrderMatchAccept.prototype.getBatchId = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes batch_id = 1;
 * This is a type-conversion wrapper around `getBatchId()`
 * @return {string}
 */
proto.poolrpc.OrderMatchAccept.prototype.getBatchId_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getBatchId()));
};


/**
 * optional bytes batch_id = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getBatchId()`
 * @return {!Uint8Array}
 */
proto.poolrpc.OrderMatchAccept.prototype.getBatchId_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getBatchId()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.OrderMatchAccept.prototype.setBatchId = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.OrderMatchReject = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.OrderMatchReject, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.OrderMatchReject.displayName = 'proto.poolrpc.OrderMatchReject';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.OrderMatchReject.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.OrderMatchReject.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.OrderMatchReject} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.OrderMatchReject.toObject = function(includeInstance, msg) {
  var f, obj = {
    batchId: msg.getBatchId_asB64(),
    reason: jspb.Message.getFieldWithDefault(msg, 2, ""),
    reasonCode: jspb.Message.getFieldWithDefault(msg, 3, 0),
    rejectedOrdersMap: (f = msg.getRejectedOrdersMap()) ? f.toObject(includeInstance, proto.poolrpc.OrderReject.toObject) : []
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.OrderMatchReject}
 */
proto.poolrpc.OrderMatchReject.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.OrderMatchReject;
  return proto.poolrpc.OrderMatchReject.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.OrderMatchReject} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.OrderMatchReject}
 */
proto.poolrpc.OrderMatchReject.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setBatchId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setReason(value);
      break;
    case 3:
      var value = /** @type {!proto.poolrpc.OrderMatchReject.RejectReason} */ (reader.readEnum());
      msg.setReasonCode(value);
      break;
    case 4:
      var value = msg.getRejectedOrdersMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readString, jspb.BinaryReader.prototype.readMessage, proto.poolrpc.OrderReject.deserializeBinaryFromReader, "");
         });
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.OrderMatchReject.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.OrderMatchReject.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.OrderMatchReject} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.OrderMatchReject.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBatchId_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getReason();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getReasonCode();
  if (f !== 0.0) {
    writer.writeEnum(
      3,
      f
    );
  }
  f = message.getRejectedOrdersMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(4, writer, jspb.BinaryWriter.prototype.writeString, jspb.BinaryWriter.prototype.writeMessage, proto.poolrpc.OrderReject.serializeBinaryToWriter);
  }
};


/**
 * @enum {number}
 */
proto.poolrpc.OrderMatchReject.RejectReason = {
  UNKNOWN: 0,
  SERVER_MISBEHAVIOR: 1,
  BATCH_VERSION_MISMATCH: 2,
  PARTIAL_REJECT: 3
};

/**
 * optional bytes batch_id = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.OrderMatchReject.prototype.getBatchId = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes batch_id = 1;
 * This is a type-conversion wrapper around `getBatchId()`
 * @return {string}
 */
proto.poolrpc.OrderMatchReject.prototype.getBatchId_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getBatchId()));
};


/**
 * optional bytes batch_id = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getBatchId()`
 * @return {!Uint8Array}
 */
proto.poolrpc.OrderMatchReject.prototype.getBatchId_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getBatchId()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.OrderMatchReject.prototype.setBatchId = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional string reason = 2;
 * @return {string}
 */
proto.poolrpc.OrderMatchReject.prototype.getReason = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/** @param {string} value */
proto.poolrpc.OrderMatchReject.prototype.setReason = function(value) {
  jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional RejectReason reason_code = 3;
 * @return {!proto.poolrpc.OrderMatchReject.RejectReason}
 */
proto.poolrpc.OrderMatchReject.prototype.getReasonCode = function() {
  return /** @type {!proto.poolrpc.OrderMatchReject.RejectReason} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {!proto.poolrpc.OrderMatchReject.RejectReason} value */
proto.poolrpc.OrderMatchReject.prototype.setReasonCode = function(value) {
  jspb.Message.setProto3EnumField(this, 3, value);
};


/**
 * map<string, OrderReject> rejected_orders = 4;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<string,!proto.poolrpc.OrderReject>}
 */
proto.poolrpc.OrderMatchReject.prototype.getRejectedOrdersMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<string,!proto.poolrpc.OrderReject>} */ (
      jspb.Message.getMapField(this, 4, opt_noLazyCreate,
      proto.poolrpc.OrderReject));
};


proto.poolrpc.OrderMatchReject.prototype.clearRejectedOrdersMap = function() {
  this.getRejectedOrdersMap().clear();
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.OrderReject = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.OrderReject, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.OrderReject.displayName = 'proto.poolrpc.OrderReject';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.OrderReject.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.OrderReject.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.OrderReject} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.OrderReject.toObject = function(includeInstance, msg) {
  var f, obj = {
    reason: jspb.Message.getFieldWithDefault(msg, 1, ""),
    reasonCode: jspb.Message.getFieldWithDefault(msg, 2, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.OrderReject}
 */
proto.poolrpc.OrderReject.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.OrderReject;
  return proto.poolrpc.OrderReject.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.OrderReject} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.OrderReject}
 */
proto.poolrpc.OrderReject.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setReason(value);
      break;
    case 2:
      var value = /** @type {!proto.poolrpc.OrderReject.OrderRejectReason} */ (reader.readEnum());
      msg.setReasonCode(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.OrderReject.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.OrderReject.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.OrderReject} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.OrderReject.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getReason();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getReasonCode();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
};


/**
 * @enum {number}
 */
proto.poolrpc.OrderReject.OrderRejectReason = {
  DUPLICATE_PEER: 0,
  CHANNEL_FUNDING_FAILED: 1
};

/**
 * optional string reason = 1;
 * @return {string}
 */
proto.poolrpc.OrderReject.prototype.getReason = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/** @param {string} value */
proto.poolrpc.OrderReject.prototype.setReason = function(value) {
  jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional OrderRejectReason reason_code = 2;
 * @return {!proto.poolrpc.OrderReject.OrderRejectReason}
 */
proto.poolrpc.OrderReject.prototype.getReasonCode = function() {
  return /** @type {!proto.poolrpc.OrderReject.OrderRejectReason} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {!proto.poolrpc.OrderReject.OrderRejectReason} value */
proto.poolrpc.OrderReject.prototype.setReasonCode = function(value) {
  jspb.Message.setProto3EnumField(this, 2, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.ChannelInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.ChannelInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ChannelInfo.displayName = 'proto.poolrpc.ChannelInfo';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.ChannelInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ChannelInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ChannelInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ChannelInfo.toObject = function(includeInstance, msg) {
  var f, obj = {
    type: jspb.Message.getFieldWithDefault(msg, 1, 0),
    localNodeKey: msg.getLocalNodeKey_asB64(),
    remoteNodeKey: msg.getRemoteNodeKey_asB64(),
    localPaymentBasePoint: msg.getLocalPaymentBasePoint_asB64(),
    remotePaymentBasePoint: msg.getRemotePaymentBasePoint_asB64()
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.ChannelInfo}
 */
proto.poolrpc.ChannelInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ChannelInfo;
  return proto.poolrpc.ChannelInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ChannelInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ChannelInfo}
 */
proto.poolrpc.ChannelInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.poolrpc.ChannelType} */ (reader.readEnum());
      msg.setType(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setLocalNodeKey(value);
      break;
    case 3:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setRemoteNodeKey(value);
      break;
    case 4:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setLocalPaymentBasePoint(value);
      break;
    case 5:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setRemotePaymentBasePoint(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.ChannelInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ChannelInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ChannelInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ChannelInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getType();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getLocalNodeKey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
  f = message.getRemoteNodeKey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      3,
      f
    );
  }
  f = message.getLocalPaymentBasePoint_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      4,
      f
    );
  }
  f = message.getRemotePaymentBasePoint_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      5,
      f
    );
  }
};


/**
 * optional ChannelType type = 1;
 * @return {!proto.poolrpc.ChannelType}
 */
proto.poolrpc.ChannelInfo.prototype.getType = function() {
  return /** @type {!proto.poolrpc.ChannelType} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/** @param {!proto.poolrpc.ChannelType} value */
proto.poolrpc.ChannelInfo.prototype.setType = function(value) {
  jspb.Message.setProto3EnumField(this, 1, value);
};


/**
 * optional bytes local_node_key = 2;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.ChannelInfo.prototype.getLocalNodeKey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes local_node_key = 2;
 * This is a type-conversion wrapper around `getLocalNodeKey()`
 * @return {string}
 */
proto.poolrpc.ChannelInfo.prototype.getLocalNodeKey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getLocalNodeKey()));
};


/**
 * optional bytes local_node_key = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getLocalNodeKey()`
 * @return {!Uint8Array}
 */
proto.poolrpc.ChannelInfo.prototype.getLocalNodeKey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getLocalNodeKey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.ChannelInfo.prototype.setLocalNodeKey = function(value) {
  jspb.Message.setProto3BytesField(this, 2, value);
};


/**
 * optional bytes remote_node_key = 3;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.ChannelInfo.prototype.getRemoteNodeKey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * optional bytes remote_node_key = 3;
 * This is a type-conversion wrapper around `getRemoteNodeKey()`
 * @return {string}
 */
proto.poolrpc.ChannelInfo.prototype.getRemoteNodeKey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getRemoteNodeKey()));
};


/**
 * optional bytes remote_node_key = 3;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getRemoteNodeKey()`
 * @return {!Uint8Array}
 */
proto.poolrpc.ChannelInfo.prototype.getRemoteNodeKey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getRemoteNodeKey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.ChannelInfo.prototype.setRemoteNodeKey = function(value) {
  jspb.Message.setProto3BytesField(this, 3, value);
};


/**
 * optional bytes local_payment_base_point = 4;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.ChannelInfo.prototype.getLocalPaymentBasePoint = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * optional bytes local_payment_base_point = 4;
 * This is a type-conversion wrapper around `getLocalPaymentBasePoint()`
 * @return {string}
 */
proto.poolrpc.ChannelInfo.prototype.getLocalPaymentBasePoint_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getLocalPaymentBasePoint()));
};


/**
 * optional bytes local_payment_base_point = 4;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getLocalPaymentBasePoint()`
 * @return {!Uint8Array}
 */
proto.poolrpc.ChannelInfo.prototype.getLocalPaymentBasePoint_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getLocalPaymentBasePoint()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.ChannelInfo.prototype.setLocalPaymentBasePoint = function(value) {
  jspb.Message.setProto3BytesField(this, 4, value);
};


/**
 * optional bytes remote_payment_base_point = 5;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.ChannelInfo.prototype.getRemotePaymentBasePoint = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * optional bytes remote_payment_base_point = 5;
 * This is a type-conversion wrapper around `getRemotePaymentBasePoint()`
 * @return {string}
 */
proto.poolrpc.ChannelInfo.prototype.getRemotePaymentBasePoint_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getRemotePaymentBasePoint()));
};


/**
 * optional bytes remote_payment_base_point = 5;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getRemotePaymentBasePoint()`
 * @return {!Uint8Array}
 */
proto.poolrpc.ChannelInfo.prototype.getRemotePaymentBasePoint_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getRemotePaymentBasePoint()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.ChannelInfo.prototype.setRemotePaymentBasePoint = function(value) {
  jspb.Message.setProto3BytesField(this, 5, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.OrderMatchSign = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.OrderMatchSign, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.OrderMatchSign.displayName = 'proto.poolrpc.OrderMatchSign';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.OrderMatchSign.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.OrderMatchSign.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.OrderMatchSign} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.OrderMatchSign.toObject = function(includeInstance, msg) {
  var f, obj = {
    batchId: msg.getBatchId_asB64(),
    accountSigsMap: (f = msg.getAccountSigsMap()) ? f.toObject(includeInstance, undefined) : [],
    channelInfosMap: (f = msg.getChannelInfosMap()) ? f.toObject(includeInstance, proto.poolrpc.ChannelInfo.toObject) : [],
    traderNoncesMap: (f = msg.getTraderNoncesMap()) ? f.toObject(includeInstance, undefined) : []
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.OrderMatchSign}
 */
proto.poolrpc.OrderMatchSign.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.OrderMatchSign;
  return proto.poolrpc.OrderMatchSign.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.OrderMatchSign} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.OrderMatchSign}
 */
proto.poolrpc.OrderMatchSign.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setBatchId(value);
      break;
    case 2:
      var value = msg.getAccountSigsMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readString, jspb.BinaryReader.prototype.readBytes, null, "");
         });
      break;
    case 3:
      var value = msg.getChannelInfosMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readString, jspb.BinaryReader.prototype.readMessage, proto.poolrpc.ChannelInfo.deserializeBinaryFromReader, "");
         });
      break;
    case 4:
      var value = msg.getTraderNoncesMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readString, jspb.BinaryReader.prototype.readBytes, null, "");
         });
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.OrderMatchSign.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.OrderMatchSign.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.OrderMatchSign} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.OrderMatchSign.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBatchId_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getAccountSigsMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(2, writer, jspb.BinaryWriter.prototype.writeString, jspb.BinaryWriter.prototype.writeBytes);
  }
  f = message.getChannelInfosMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(3, writer, jspb.BinaryWriter.prototype.writeString, jspb.BinaryWriter.prototype.writeMessage, proto.poolrpc.ChannelInfo.serializeBinaryToWriter);
  }
  f = message.getTraderNoncesMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(4, writer, jspb.BinaryWriter.prototype.writeString, jspb.BinaryWriter.prototype.writeBytes);
  }
};


/**
 * optional bytes batch_id = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.OrderMatchSign.prototype.getBatchId = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes batch_id = 1;
 * This is a type-conversion wrapper around `getBatchId()`
 * @return {string}
 */
proto.poolrpc.OrderMatchSign.prototype.getBatchId_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getBatchId()));
};


/**
 * optional bytes batch_id = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getBatchId()`
 * @return {!Uint8Array}
 */
proto.poolrpc.OrderMatchSign.prototype.getBatchId_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getBatchId()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.OrderMatchSign.prototype.setBatchId = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * map<string, bytes> account_sigs = 2;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<string,!(string|Uint8Array)>}
 */
proto.poolrpc.OrderMatchSign.prototype.getAccountSigsMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<string,!(string|Uint8Array)>} */ (
      jspb.Message.getMapField(this, 2, opt_noLazyCreate,
      null));
};


proto.poolrpc.OrderMatchSign.prototype.clearAccountSigsMap = function() {
  this.getAccountSigsMap().clear();
};


/**
 * map<string, ChannelInfo> channel_infos = 3;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<string,!proto.poolrpc.ChannelInfo>}
 */
proto.poolrpc.OrderMatchSign.prototype.getChannelInfosMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<string,!proto.poolrpc.ChannelInfo>} */ (
      jspb.Message.getMapField(this, 3, opt_noLazyCreate,
      proto.poolrpc.ChannelInfo));
};


proto.poolrpc.OrderMatchSign.prototype.clearChannelInfosMap = function() {
  this.getChannelInfosMap().clear();
};


/**
 * map<string, bytes> trader_nonces = 4;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<string,!(string|Uint8Array)>}
 */
proto.poolrpc.OrderMatchSign.prototype.getTraderNoncesMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<string,!(string|Uint8Array)>} */ (
      jspb.Message.getMapField(this, 4, opt_noLazyCreate,
      null));
};


proto.poolrpc.OrderMatchSign.prototype.clearTraderNoncesMap = function() {
  this.getTraderNoncesMap().clear();
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.AccountRecovery = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.AccountRecovery, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.AccountRecovery.displayName = 'proto.poolrpc.AccountRecovery';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.AccountRecovery.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.AccountRecovery.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.AccountRecovery} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.AccountRecovery.toObject = function(includeInstance, msg) {
  var f, obj = {
    traderKey: msg.getTraderKey_asB64()
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.AccountRecovery}
 */
proto.poolrpc.AccountRecovery.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.AccountRecovery;
  return proto.poolrpc.AccountRecovery.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.AccountRecovery} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.AccountRecovery}
 */
proto.poolrpc.AccountRecovery.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setTraderKey(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.AccountRecovery.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.AccountRecovery.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.AccountRecovery} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.AccountRecovery.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTraderKey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
};


/**
 * optional bytes trader_key = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.AccountRecovery.prototype.getTraderKey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes trader_key = 1;
 * This is a type-conversion wrapper around `getTraderKey()`
 * @return {string}
 */
proto.poolrpc.AccountRecovery.prototype.getTraderKey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getTraderKey()));
};


/**
 * optional bytes trader_key = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getTraderKey()`
 * @return {!Uint8Array}
 */
proto.poolrpc.AccountRecovery.prototype.getTraderKey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getTraderKey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.AccountRecovery.prototype.setTraderKey = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.ServerAuctionMessage = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.poolrpc.ServerAuctionMessage.oneofGroups_);
};
goog.inherits(proto.poolrpc.ServerAuctionMessage, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ServerAuctionMessage.displayName = 'proto.poolrpc.ServerAuctionMessage';
}
/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.poolrpc.ServerAuctionMessage.oneofGroups_ = [[1,2,3,4,5,6,7]];

/**
 * @enum {number}
 */
proto.poolrpc.ServerAuctionMessage.MsgCase = {
  MSG_NOT_SET: 0,
  CHALLENGE: 1,
  SUCCESS: 2,
  ERROR: 3,
  PREPARE: 4,
  SIGN: 5,
  FINALIZE: 6,
  ACCOUNT: 7
};

/**
 * @return {proto.poolrpc.ServerAuctionMessage.MsgCase}
 */
proto.poolrpc.ServerAuctionMessage.prototype.getMsgCase = function() {
  return /** @type {proto.poolrpc.ServerAuctionMessage.MsgCase} */(jspb.Message.computeOneofCase(this, proto.poolrpc.ServerAuctionMessage.oneofGroups_[0]));
};



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.ServerAuctionMessage.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ServerAuctionMessage.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ServerAuctionMessage} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerAuctionMessage.toObject = function(includeInstance, msg) {
  var f, obj = {
    challenge: (f = msg.getChallenge()) && proto.poolrpc.ServerChallenge.toObject(includeInstance, f),
    success: (f = msg.getSuccess()) && proto.poolrpc.SubscribeSuccess.toObject(includeInstance, f),
    error: (f = msg.getError()) && proto.poolrpc.SubscribeError.toObject(includeInstance, f),
    prepare: (f = msg.getPrepare()) && proto.poolrpc.OrderMatchPrepare.toObject(includeInstance, f),
    sign: (f = msg.getSign()) && proto.poolrpc.OrderMatchSignBegin.toObject(includeInstance, f),
    finalize: (f = msg.getFinalize()) && proto.poolrpc.OrderMatchFinalize.toObject(includeInstance, f),
    account: (f = msg.getAccount()) && proto.poolrpc.AuctionAccount.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.ServerAuctionMessage}
 */
proto.poolrpc.ServerAuctionMessage.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ServerAuctionMessage;
  return proto.poolrpc.ServerAuctionMessage.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ServerAuctionMessage} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ServerAuctionMessage}
 */
proto.poolrpc.ServerAuctionMessage.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.ServerChallenge;
      reader.readMessage(value,proto.poolrpc.ServerChallenge.deserializeBinaryFromReader);
      msg.setChallenge(value);
      break;
    case 2:
      var value = new proto.poolrpc.SubscribeSuccess;
      reader.readMessage(value,proto.poolrpc.SubscribeSuccess.deserializeBinaryFromReader);
      msg.setSuccess(value);
      break;
    case 3:
      var value = new proto.poolrpc.SubscribeError;
      reader.readMessage(value,proto.poolrpc.SubscribeError.deserializeBinaryFromReader);
      msg.setError(value);
      break;
    case 4:
      var value = new proto.poolrpc.OrderMatchPrepare;
      reader.readMessage(value,proto.poolrpc.OrderMatchPrepare.deserializeBinaryFromReader);
      msg.setPrepare(value);
      break;
    case 5:
      var value = new proto.poolrpc.OrderMatchSignBegin;
      reader.readMessage(value,proto.poolrpc.OrderMatchSignBegin.deserializeBinaryFromReader);
      msg.setSign(value);
      break;
    case 6:
      var value = new proto.poolrpc.OrderMatchFinalize;
      reader.readMessage(value,proto.poolrpc.OrderMatchFinalize.deserializeBinaryFromReader);
      msg.setFinalize(value);
      break;
    case 7:
      var value = new proto.poolrpc.AuctionAccount;
      reader.readMessage(value,proto.poolrpc.AuctionAccount.deserializeBinaryFromReader);
      msg.setAccount(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerAuctionMessage.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ServerAuctionMessage.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ServerAuctionMessage} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerAuctionMessage.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getChallenge();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.poolrpc.ServerChallenge.serializeBinaryToWriter
    );
  }
  f = message.getSuccess();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.poolrpc.SubscribeSuccess.serializeBinaryToWriter
    );
  }
  f = message.getError();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.poolrpc.SubscribeError.serializeBinaryToWriter
    );
  }
  f = message.getPrepare();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.poolrpc.OrderMatchPrepare.serializeBinaryToWriter
    );
  }
  f = message.getSign();
  if (f != null) {
    writer.writeMessage(
      5,
      f,
      proto.poolrpc.OrderMatchSignBegin.serializeBinaryToWriter
    );
  }
  f = message.getFinalize();
  if (f != null) {
    writer.writeMessage(
      6,
      f,
      proto.poolrpc.OrderMatchFinalize.serializeBinaryToWriter
    );
  }
  f = message.getAccount();
  if (f != null) {
    writer.writeMessage(
      7,
      f,
      proto.poolrpc.AuctionAccount.serializeBinaryToWriter
    );
  }
};


/**
 * optional ServerChallenge challenge = 1;
 * @return {?proto.poolrpc.ServerChallenge}
 */
proto.poolrpc.ServerAuctionMessage.prototype.getChallenge = function() {
  return /** @type{?proto.poolrpc.ServerChallenge} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.ServerChallenge, 1));
};


/** @param {?proto.poolrpc.ServerChallenge|undefined} value */
proto.poolrpc.ServerAuctionMessage.prototype.setChallenge = function(value) {
  jspb.Message.setOneofWrapperField(this, 1, proto.poolrpc.ServerAuctionMessage.oneofGroups_[0], value);
};


proto.poolrpc.ServerAuctionMessage.prototype.clearChallenge = function() {
  this.setChallenge(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.ServerAuctionMessage.prototype.hasChallenge = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional SubscribeSuccess success = 2;
 * @return {?proto.poolrpc.SubscribeSuccess}
 */
proto.poolrpc.ServerAuctionMessage.prototype.getSuccess = function() {
  return /** @type{?proto.poolrpc.SubscribeSuccess} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.SubscribeSuccess, 2));
};


/** @param {?proto.poolrpc.SubscribeSuccess|undefined} value */
proto.poolrpc.ServerAuctionMessage.prototype.setSuccess = function(value) {
  jspb.Message.setOneofWrapperField(this, 2, proto.poolrpc.ServerAuctionMessage.oneofGroups_[0], value);
};


proto.poolrpc.ServerAuctionMessage.prototype.clearSuccess = function() {
  this.setSuccess(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.ServerAuctionMessage.prototype.hasSuccess = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional SubscribeError error = 3;
 * @return {?proto.poolrpc.SubscribeError}
 */
proto.poolrpc.ServerAuctionMessage.prototype.getError = function() {
  return /** @type{?proto.poolrpc.SubscribeError} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.SubscribeError, 3));
};


/** @param {?proto.poolrpc.SubscribeError|undefined} value */
proto.poolrpc.ServerAuctionMessage.prototype.setError = function(value) {
  jspb.Message.setOneofWrapperField(this, 3, proto.poolrpc.ServerAuctionMessage.oneofGroups_[0], value);
};


proto.poolrpc.ServerAuctionMessage.prototype.clearError = function() {
  this.setError(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.ServerAuctionMessage.prototype.hasError = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional OrderMatchPrepare prepare = 4;
 * @return {?proto.poolrpc.OrderMatchPrepare}
 */
proto.poolrpc.ServerAuctionMessage.prototype.getPrepare = function() {
  return /** @type{?proto.poolrpc.OrderMatchPrepare} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.OrderMatchPrepare, 4));
};


/** @param {?proto.poolrpc.OrderMatchPrepare|undefined} value */
proto.poolrpc.ServerAuctionMessage.prototype.setPrepare = function(value) {
  jspb.Message.setOneofWrapperField(this, 4, proto.poolrpc.ServerAuctionMessage.oneofGroups_[0], value);
};


proto.poolrpc.ServerAuctionMessage.prototype.clearPrepare = function() {
  this.setPrepare(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.ServerAuctionMessage.prototype.hasPrepare = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional OrderMatchSignBegin sign = 5;
 * @return {?proto.poolrpc.OrderMatchSignBegin}
 */
proto.poolrpc.ServerAuctionMessage.prototype.getSign = function() {
  return /** @type{?proto.poolrpc.OrderMatchSignBegin} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.OrderMatchSignBegin, 5));
};


/** @param {?proto.poolrpc.OrderMatchSignBegin|undefined} value */
proto.poolrpc.ServerAuctionMessage.prototype.setSign = function(value) {
  jspb.Message.setOneofWrapperField(this, 5, proto.poolrpc.ServerAuctionMessage.oneofGroups_[0], value);
};


proto.poolrpc.ServerAuctionMessage.prototype.clearSign = function() {
  this.setSign(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.ServerAuctionMessage.prototype.hasSign = function() {
  return jspb.Message.getField(this, 5) != null;
};


/**
 * optional OrderMatchFinalize finalize = 6;
 * @return {?proto.poolrpc.OrderMatchFinalize}
 */
proto.poolrpc.ServerAuctionMessage.prototype.getFinalize = function() {
  return /** @type{?proto.poolrpc.OrderMatchFinalize} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.OrderMatchFinalize, 6));
};


/** @param {?proto.poolrpc.OrderMatchFinalize|undefined} value */
proto.poolrpc.ServerAuctionMessage.prototype.setFinalize = function(value) {
  jspb.Message.setOneofWrapperField(this, 6, proto.poolrpc.ServerAuctionMessage.oneofGroups_[0], value);
};


proto.poolrpc.ServerAuctionMessage.prototype.clearFinalize = function() {
  this.setFinalize(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.ServerAuctionMessage.prototype.hasFinalize = function() {
  return jspb.Message.getField(this, 6) != null;
};


/**
 * optional AuctionAccount account = 7;
 * @return {?proto.poolrpc.AuctionAccount}
 */
proto.poolrpc.ServerAuctionMessage.prototype.getAccount = function() {
  return /** @type{?proto.poolrpc.AuctionAccount} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.AuctionAccount, 7));
};


/** @param {?proto.poolrpc.AuctionAccount|undefined} value */
proto.poolrpc.ServerAuctionMessage.prototype.setAccount = function(value) {
  jspb.Message.setOneofWrapperField(this, 7, proto.poolrpc.ServerAuctionMessage.oneofGroups_[0], value);
};


proto.poolrpc.ServerAuctionMessage.prototype.clearAccount = function() {
  this.setAccount(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.ServerAuctionMessage.prototype.hasAccount = function() {
  return jspb.Message.getField(this, 7) != null;
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.ServerChallenge = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.ServerChallenge, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ServerChallenge.displayName = 'proto.poolrpc.ServerChallenge';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.ServerChallenge.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ServerChallenge.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ServerChallenge} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerChallenge.toObject = function(includeInstance, msg) {
  var f, obj = {
    challenge: msg.getChallenge_asB64(),
    commitHash: msg.getCommitHash_asB64()
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.ServerChallenge}
 */
proto.poolrpc.ServerChallenge.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ServerChallenge;
  return proto.poolrpc.ServerChallenge.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ServerChallenge} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ServerChallenge}
 */
proto.poolrpc.ServerChallenge.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setChallenge(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setCommitHash(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerChallenge.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ServerChallenge.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ServerChallenge} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerChallenge.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getChallenge_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getCommitHash_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
};


/**
 * optional bytes challenge = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.ServerChallenge.prototype.getChallenge = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes challenge = 1;
 * This is a type-conversion wrapper around `getChallenge()`
 * @return {string}
 */
proto.poolrpc.ServerChallenge.prototype.getChallenge_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getChallenge()));
};


/**
 * optional bytes challenge = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getChallenge()`
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerChallenge.prototype.getChallenge_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getChallenge()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.ServerChallenge.prototype.setChallenge = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional bytes commit_hash = 2;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.ServerChallenge.prototype.getCommitHash = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes commit_hash = 2;
 * This is a type-conversion wrapper around `getCommitHash()`
 * @return {string}
 */
proto.poolrpc.ServerChallenge.prototype.getCommitHash_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getCommitHash()));
};


/**
 * optional bytes commit_hash = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getCommitHash()`
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerChallenge.prototype.getCommitHash_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getCommitHash()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.ServerChallenge.prototype.setCommitHash = function(value) {
  jspb.Message.setProto3BytesField(this, 2, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.SubscribeSuccess = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.SubscribeSuccess, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.SubscribeSuccess.displayName = 'proto.poolrpc.SubscribeSuccess';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.SubscribeSuccess.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.SubscribeSuccess.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.SubscribeSuccess} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.SubscribeSuccess.toObject = function(includeInstance, msg) {
  var f, obj = {
    traderKey: msg.getTraderKey_asB64()
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.SubscribeSuccess}
 */
proto.poolrpc.SubscribeSuccess.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.SubscribeSuccess;
  return proto.poolrpc.SubscribeSuccess.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.SubscribeSuccess} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.SubscribeSuccess}
 */
proto.poolrpc.SubscribeSuccess.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setTraderKey(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.SubscribeSuccess.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.SubscribeSuccess.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.SubscribeSuccess} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.SubscribeSuccess.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTraderKey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
};


/**
 * optional bytes trader_key = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.SubscribeSuccess.prototype.getTraderKey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes trader_key = 1;
 * This is a type-conversion wrapper around `getTraderKey()`
 * @return {string}
 */
proto.poolrpc.SubscribeSuccess.prototype.getTraderKey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getTraderKey()));
};


/**
 * optional bytes trader_key = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getTraderKey()`
 * @return {!Uint8Array}
 */
proto.poolrpc.SubscribeSuccess.prototype.getTraderKey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getTraderKey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.SubscribeSuccess.prototype.setTraderKey = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.MatchedMarket = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.MatchedMarket, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.MatchedMarket.displayName = 'proto.poolrpc.MatchedMarket';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.MatchedMarket.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.MatchedMarket.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.MatchedMarket} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.MatchedMarket.toObject = function(includeInstance, msg) {
  var f, obj = {
    matchedOrdersMap: (f = msg.getMatchedOrdersMap()) ? f.toObject(includeInstance, proto.poolrpc.MatchedOrder.toObject) : [],
    clearingPriceRate: jspb.Message.getFieldWithDefault(msg, 2, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.MatchedMarket}
 */
proto.poolrpc.MatchedMarket.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.MatchedMarket;
  return proto.poolrpc.MatchedMarket.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.MatchedMarket} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.MatchedMarket}
 */
proto.poolrpc.MatchedMarket.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = msg.getMatchedOrdersMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readString, jspb.BinaryReader.prototype.readMessage, proto.poolrpc.MatchedOrder.deserializeBinaryFromReader, "");
         });
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setClearingPriceRate(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.MatchedMarket.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.MatchedMarket.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.MatchedMarket} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.MatchedMarket.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getMatchedOrdersMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(1, writer, jspb.BinaryWriter.prototype.writeString, jspb.BinaryWriter.prototype.writeMessage, proto.poolrpc.MatchedOrder.serializeBinaryToWriter);
  }
  f = message.getClearingPriceRate();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
};


/**
 * map<string, MatchedOrder> matched_orders = 1;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<string,!proto.poolrpc.MatchedOrder>}
 */
proto.poolrpc.MatchedMarket.prototype.getMatchedOrdersMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<string,!proto.poolrpc.MatchedOrder>} */ (
      jspb.Message.getMapField(this, 1, opt_noLazyCreate,
      proto.poolrpc.MatchedOrder));
};


proto.poolrpc.MatchedMarket.prototype.clearMatchedOrdersMap = function() {
  this.getMatchedOrdersMap().clear();
};


/**
 * optional uint32 clearing_price_rate = 2;
 * @return {number}
 */
proto.poolrpc.MatchedMarket.prototype.getClearingPriceRate = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.MatchedMarket.prototype.setClearingPriceRate = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.OrderMatchPrepare = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.poolrpc.OrderMatchPrepare.repeatedFields_, null);
};
goog.inherits(proto.poolrpc.OrderMatchPrepare, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.OrderMatchPrepare.displayName = 'proto.poolrpc.OrderMatchPrepare';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.poolrpc.OrderMatchPrepare.repeatedFields_ = [3];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.OrderMatchPrepare.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.OrderMatchPrepare.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.OrderMatchPrepare} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.OrderMatchPrepare.toObject = function(includeInstance, msg) {
  var f, obj = {
    matchedOrdersMap: (f = msg.getMatchedOrdersMap()) ? f.toObject(includeInstance, proto.poolrpc.MatchedOrder.toObject) : [],
    clearingPriceRate: jspb.Message.getFieldWithDefault(msg, 2, 0),
    chargedAccountsList: jspb.Message.toObjectList(msg.getChargedAccountsList(),
    proto.poolrpc.AccountDiff.toObject, includeInstance),
    executionFee: (f = msg.getExecutionFee()) && proto.poolrpc.ExecutionFee.toObject(includeInstance, f),
    batchTransaction: msg.getBatchTransaction_asB64(),
    feeRateSatPerKw: jspb.Message.getFieldWithDefault(msg, 6, "0"),
    feeRebateSat: jspb.Message.getFieldWithDefault(msg, 7, "0"),
    batchId: msg.getBatchId_asB64(),
    batchVersion: jspb.Message.getFieldWithDefault(msg, 9, 0),
    matchedMarketsMap: (f = msg.getMatchedMarketsMap()) ? f.toObject(includeInstance, proto.poolrpc.MatchedMarket.toObject) : [],
    batchHeightHint: jspb.Message.getFieldWithDefault(msg, 11, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.OrderMatchPrepare}
 */
proto.poolrpc.OrderMatchPrepare.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.OrderMatchPrepare;
  return proto.poolrpc.OrderMatchPrepare.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.OrderMatchPrepare} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.OrderMatchPrepare}
 */
proto.poolrpc.OrderMatchPrepare.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = msg.getMatchedOrdersMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readString, jspb.BinaryReader.prototype.readMessage, proto.poolrpc.MatchedOrder.deserializeBinaryFromReader, "");
         });
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setClearingPriceRate(value);
      break;
    case 3:
      var value = new proto.poolrpc.AccountDiff;
      reader.readMessage(value,proto.poolrpc.AccountDiff.deserializeBinaryFromReader);
      msg.addChargedAccounts(value);
      break;
    case 4:
      var value = new proto.poolrpc.ExecutionFee;
      reader.readMessage(value,proto.poolrpc.ExecutionFee.deserializeBinaryFromReader);
      msg.setExecutionFee(value);
      break;
    case 5:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setBatchTransaction(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setFeeRateSatPerKw(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setFeeRebateSat(value);
      break;
    case 8:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setBatchId(value);
      break;
    case 9:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setBatchVersion(value);
      break;
    case 10:
      var value = msg.getMatchedMarketsMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readUint32, jspb.BinaryReader.prototype.readMessage, proto.poolrpc.MatchedMarket.deserializeBinaryFromReader, 0);
         });
      break;
    case 11:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setBatchHeightHint(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.OrderMatchPrepare.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.OrderMatchPrepare.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.OrderMatchPrepare} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.OrderMatchPrepare.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getMatchedOrdersMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(1, writer, jspb.BinaryWriter.prototype.writeString, jspb.BinaryWriter.prototype.writeMessage, proto.poolrpc.MatchedOrder.serializeBinaryToWriter);
  }
  f = message.getClearingPriceRate();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
  f = message.getChargedAccountsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.poolrpc.AccountDiff.serializeBinaryToWriter
    );
  }
  f = message.getExecutionFee();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.poolrpc.ExecutionFee.serializeBinaryToWriter
    );
  }
  f = message.getBatchTransaction_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      5,
      f
    );
  }
  f = message.getFeeRateSatPerKw();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      6,
      f
    );
  }
  f = message.getFeeRebateSat();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      7,
      f
    );
  }
  f = message.getBatchId_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      8,
      f
    );
  }
  f = message.getBatchVersion();
  if (f !== 0) {
    writer.writeUint32(
      9,
      f
    );
  }
  f = message.getMatchedMarketsMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(10, writer, jspb.BinaryWriter.prototype.writeUint32, jspb.BinaryWriter.prototype.writeMessage, proto.poolrpc.MatchedMarket.serializeBinaryToWriter);
  }
  f = message.getBatchHeightHint();
  if (f !== 0) {
    writer.writeUint32(
      11,
      f
    );
  }
};


/**
 * map<string, MatchedOrder> matched_orders = 1;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<string,!proto.poolrpc.MatchedOrder>}
 */
proto.poolrpc.OrderMatchPrepare.prototype.getMatchedOrdersMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<string,!proto.poolrpc.MatchedOrder>} */ (
      jspb.Message.getMapField(this, 1, opt_noLazyCreate,
      proto.poolrpc.MatchedOrder));
};


proto.poolrpc.OrderMatchPrepare.prototype.clearMatchedOrdersMap = function() {
  this.getMatchedOrdersMap().clear();
};


/**
 * optional uint32 clearing_price_rate = 2;
 * @return {number}
 */
proto.poolrpc.OrderMatchPrepare.prototype.getClearingPriceRate = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.OrderMatchPrepare.prototype.setClearingPriceRate = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * repeated AccountDiff charged_accounts = 3;
 * @return {!Array<!proto.poolrpc.AccountDiff>}
 */
proto.poolrpc.OrderMatchPrepare.prototype.getChargedAccountsList = function() {
  return /** @type{!Array<!proto.poolrpc.AccountDiff>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.AccountDiff, 3));
};


/** @param {!Array<!proto.poolrpc.AccountDiff>} value */
proto.poolrpc.OrderMatchPrepare.prototype.setChargedAccountsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.poolrpc.AccountDiff=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.AccountDiff}
 */
proto.poolrpc.OrderMatchPrepare.prototype.addChargedAccounts = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.poolrpc.AccountDiff, opt_index);
};


proto.poolrpc.OrderMatchPrepare.prototype.clearChargedAccountsList = function() {
  this.setChargedAccountsList([]);
};


/**
 * optional ExecutionFee execution_fee = 4;
 * @return {?proto.poolrpc.ExecutionFee}
 */
proto.poolrpc.OrderMatchPrepare.prototype.getExecutionFee = function() {
  return /** @type{?proto.poolrpc.ExecutionFee} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.ExecutionFee, 4));
};


/** @param {?proto.poolrpc.ExecutionFee|undefined} value */
proto.poolrpc.OrderMatchPrepare.prototype.setExecutionFee = function(value) {
  jspb.Message.setWrapperField(this, 4, value);
};


proto.poolrpc.OrderMatchPrepare.prototype.clearExecutionFee = function() {
  this.setExecutionFee(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.OrderMatchPrepare.prototype.hasExecutionFee = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional bytes batch_transaction = 5;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.OrderMatchPrepare.prototype.getBatchTransaction = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * optional bytes batch_transaction = 5;
 * This is a type-conversion wrapper around `getBatchTransaction()`
 * @return {string}
 */
proto.poolrpc.OrderMatchPrepare.prototype.getBatchTransaction_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getBatchTransaction()));
};


/**
 * optional bytes batch_transaction = 5;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getBatchTransaction()`
 * @return {!Uint8Array}
 */
proto.poolrpc.OrderMatchPrepare.prototype.getBatchTransaction_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getBatchTransaction()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.OrderMatchPrepare.prototype.setBatchTransaction = function(value) {
  jspb.Message.setProto3BytesField(this, 5, value);
};


/**
 * optional uint64 fee_rate_sat_per_kw = 6;
 * @return {string}
 */
proto.poolrpc.OrderMatchPrepare.prototype.getFeeRateSatPerKw = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, "0"));
};


/** @param {string} value */
proto.poolrpc.OrderMatchPrepare.prototype.setFeeRateSatPerKw = function(value) {
  jspb.Message.setProto3StringIntField(this, 6, value);
};


/**
 * optional uint64 fee_rebate_sat = 7;
 * @return {string}
 */
proto.poolrpc.OrderMatchPrepare.prototype.getFeeRebateSat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, "0"));
};


/** @param {string} value */
proto.poolrpc.OrderMatchPrepare.prototype.setFeeRebateSat = function(value) {
  jspb.Message.setProto3StringIntField(this, 7, value);
};


/**
 * optional bytes batch_id = 8;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.OrderMatchPrepare.prototype.getBatchId = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 8, ""));
};


/**
 * optional bytes batch_id = 8;
 * This is a type-conversion wrapper around `getBatchId()`
 * @return {string}
 */
proto.poolrpc.OrderMatchPrepare.prototype.getBatchId_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getBatchId()));
};


/**
 * optional bytes batch_id = 8;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getBatchId()`
 * @return {!Uint8Array}
 */
proto.poolrpc.OrderMatchPrepare.prototype.getBatchId_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getBatchId()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.OrderMatchPrepare.prototype.setBatchId = function(value) {
  jspb.Message.setProto3BytesField(this, 8, value);
};


/**
 * optional uint32 batch_version = 9;
 * @return {number}
 */
proto.poolrpc.OrderMatchPrepare.prototype.getBatchVersion = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 9, 0));
};


/** @param {number} value */
proto.poolrpc.OrderMatchPrepare.prototype.setBatchVersion = function(value) {
  jspb.Message.setProto3IntField(this, 9, value);
};


/**
 * map<uint32, MatchedMarket> matched_markets = 10;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<number,!proto.poolrpc.MatchedMarket>}
 */
proto.poolrpc.OrderMatchPrepare.prototype.getMatchedMarketsMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<number,!proto.poolrpc.MatchedMarket>} */ (
      jspb.Message.getMapField(this, 10, opt_noLazyCreate,
      proto.poolrpc.MatchedMarket));
};


proto.poolrpc.OrderMatchPrepare.prototype.clearMatchedMarketsMap = function() {
  this.getMatchedMarketsMap().clear();
};


/**
 * optional uint32 batch_height_hint = 11;
 * @return {number}
 */
proto.poolrpc.OrderMatchPrepare.prototype.getBatchHeightHint = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 11, 0));
};


/** @param {number} value */
proto.poolrpc.OrderMatchPrepare.prototype.setBatchHeightHint = function(value) {
  jspb.Message.setProto3IntField(this, 11, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.TxOut = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.TxOut, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.TxOut.displayName = 'proto.poolrpc.TxOut';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.TxOut.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.TxOut.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.TxOut} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.TxOut.toObject = function(includeInstance, msg) {
  var f, obj = {
    value: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    pkScript: msg.getPkScript_asB64()
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.TxOut}
 */
proto.poolrpc.TxOut.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.TxOut;
  return proto.poolrpc.TxOut.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.TxOut} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.TxOut}
 */
proto.poolrpc.TxOut.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setValue(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setPkScript(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.TxOut.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.TxOut.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.TxOut} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.TxOut.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getValue();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      1,
      f
    );
  }
  f = message.getPkScript_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
};


/**
 * optional uint64 value = 1;
 * @return {string}
 */
proto.poolrpc.TxOut.prototype.getValue = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/** @param {string} value */
proto.poolrpc.TxOut.prototype.setValue = function(value) {
  jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional bytes pk_script = 2;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.TxOut.prototype.getPkScript = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes pk_script = 2;
 * This is a type-conversion wrapper around `getPkScript()`
 * @return {string}
 */
proto.poolrpc.TxOut.prototype.getPkScript_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getPkScript()));
};


/**
 * optional bytes pk_script = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getPkScript()`
 * @return {!Uint8Array}
 */
proto.poolrpc.TxOut.prototype.getPkScript_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getPkScript()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.TxOut.prototype.setPkScript = function(value) {
  jspb.Message.setProto3BytesField(this, 2, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.OrderMatchSignBegin = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.poolrpc.OrderMatchSignBegin.repeatedFields_, null);
};
goog.inherits(proto.poolrpc.OrderMatchSignBegin, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.OrderMatchSignBegin.displayName = 'proto.poolrpc.OrderMatchSignBegin';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.poolrpc.OrderMatchSignBegin.repeatedFields_ = [3];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.OrderMatchSignBegin.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.OrderMatchSignBegin.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.OrderMatchSignBegin} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.OrderMatchSignBegin.toObject = function(includeInstance, msg) {
  var f, obj = {
    batchId: msg.getBatchId_asB64(),
    serverNoncesMap: (f = msg.getServerNoncesMap()) ? f.toObject(includeInstance, undefined) : [],
    prevOutputsList: jspb.Message.toObjectList(msg.getPrevOutputsList(),
    proto.poolrpc.TxOut.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.OrderMatchSignBegin}
 */
proto.poolrpc.OrderMatchSignBegin.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.OrderMatchSignBegin;
  return proto.poolrpc.OrderMatchSignBegin.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.OrderMatchSignBegin} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.OrderMatchSignBegin}
 */
proto.poolrpc.OrderMatchSignBegin.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setBatchId(value);
      break;
    case 2:
      var value = msg.getServerNoncesMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readString, jspb.BinaryReader.prototype.readBytes, null, "");
         });
      break;
    case 3:
      var value = new proto.poolrpc.TxOut;
      reader.readMessage(value,proto.poolrpc.TxOut.deserializeBinaryFromReader);
      msg.addPrevOutputs(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.OrderMatchSignBegin.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.OrderMatchSignBegin.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.OrderMatchSignBegin} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.OrderMatchSignBegin.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBatchId_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getServerNoncesMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(2, writer, jspb.BinaryWriter.prototype.writeString, jspb.BinaryWriter.prototype.writeBytes);
  }
  f = message.getPrevOutputsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.poolrpc.TxOut.serializeBinaryToWriter
    );
  }
};


/**
 * optional bytes batch_id = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.OrderMatchSignBegin.prototype.getBatchId = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes batch_id = 1;
 * This is a type-conversion wrapper around `getBatchId()`
 * @return {string}
 */
proto.poolrpc.OrderMatchSignBegin.prototype.getBatchId_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getBatchId()));
};


/**
 * optional bytes batch_id = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getBatchId()`
 * @return {!Uint8Array}
 */
proto.poolrpc.OrderMatchSignBegin.prototype.getBatchId_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getBatchId()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.OrderMatchSignBegin.prototype.setBatchId = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * map<string, bytes> server_nonces = 2;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<string,!(string|Uint8Array)>}
 */
proto.poolrpc.OrderMatchSignBegin.prototype.getServerNoncesMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<string,!(string|Uint8Array)>} */ (
      jspb.Message.getMapField(this, 2, opt_noLazyCreate,
      null));
};


proto.poolrpc.OrderMatchSignBegin.prototype.clearServerNoncesMap = function() {
  this.getServerNoncesMap().clear();
};


/**
 * repeated TxOut prev_outputs = 3;
 * @return {!Array<!proto.poolrpc.TxOut>}
 */
proto.poolrpc.OrderMatchSignBegin.prototype.getPrevOutputsList = function() {
  return /** @type{!Array<!proto.poolrpc.TxOut>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.TxOut, 3));
};


/** @param {!Array<!proto.poolrpc.TxOut>} value */
proto.poolrpc.OrderMatchSignBegin.prototype.setPrevOutputsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.poolrpc.TxOut=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.TxOut}
 */
proto.poolrpc.OrderMatchSignBegin.prototype.addPrevOutputs = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.poolrpc.TxOut, opt_index);
};


proto.poolrpc.OrderMatchSignBegin.prototype.clearPrevOutputsList = function() {
  this.setPrevOutputsList([]);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.OrderMatchFinalize = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.OrderMatchFinalize, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.OrderMatchFinalize.displayName = 'proto.poolrpc.OrderMatchFinalize';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.OrderMatchFinalize.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.OrderMatchFinalize.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.OrderMatchFinalize} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.OrderMatchFinalize.toObject = function(includeInstance, msg) {
  var f, obj = {
    batchId: msg.getBatchId_asB64(),
    batchTxid: msg.getBatchTxid_asB64()
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.OrderMatchFinalize}
 */
proto.poolrpc.OrderMatchFinalize.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.OrderMatchFinalize;
  return proto.poolrpc.OrderMatchFinalize.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.OrderMatchFinalize} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.OrderMatchFinalize}
 */
proto.poolrpc.OrderMatchFinalize.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setBatchId(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setBatchTxid(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.OrderMatchFinalize.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.OrderMatchFinalize.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.OrderMatchFinalize} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.OrderMatchFinalize.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBatchId_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getBatchTxid_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
};


/**
 * optional bytes batch_id = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.OrderMatchFinalize.prototype.getBatchId = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes batch_id = 1;
 * This is a type-conversion wrapper around `getBatchId()`
 * @return {string}
 */
proto.poolrpc.OrderMatchFinalize.prototype.getBatchId_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getBatchId()));
};


/**
 * optional bytes batch_id = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getBatchId()`
 * @return {!Uint8Array}
 */
proto.poolrpc.OrderMatchFinalize.prototype.getBatchId_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getBatchId()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.OrderMatchFinalize.prototype.setBatchId = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional bytes batch_txid = 2;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.OrderMatchFinalize.prototype.getBatchTxid = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes batch_txid = 2;
 * This is a type-conversion wrapper around `getBatchTxid()`
 * @return {string}
 */
proto.poolrpc.OrderMatchFinalize.prototype.getBatchTxid_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getBatchTxid()));
};


/**
 * optional bytes batch_txid = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getBatchTxid()`
 * @return {!Uint8Array}
 */
proto.poolrpc.OrderMatchFinalize.prototype.getBatchTxid_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getBatchTxid()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.OrderMatchFinalize.prototype.setBatchTxid = function(value) {
  jspb.Message.setProto3BytesField(this, 2, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.SubscribeError = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.SubscribeError, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.SubscribeError.displayName = 'proto.poolrpc.SubscribeError';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.SubscribeError.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.SubscribeError.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.SubscribeError} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.SubscribeError.toObject = function(includeInstance, msg) {
  var f, obj = {
    error: jspb.Message.getFieldWithDefault(msg, 1, ""),
    errorCode: jspb.Message.getFieldWithDefault(msg, 2, 0),
    traderKey: msg.getTraderKey_asB64(),
    accountReservation: (f = msg.getAccountReservation()) && proto.poolrpc.AuctionAccount.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.SubscribeError}
 */
proto.poolrpc.SubscribeError.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.SubscribeError;
  return proto.poolrpc.SubscribeError.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.SubscribeError} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.SubscribeError}
 */
proto.poolrpc.SubscribeError.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setError(value);
      break;
    case 2:
      var value = /** @type {!proto.poolrpc.SubscribeError.Error} */ (reader.readEnum());
      msg.setErrorCode(value);
      break;
    case 3:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setTraderKey(value);
      break;
    case 4:
      var value = new proto.poolrpc.AuctionAccount;
      reader.readMessage(value,proto.poolrpc.AuctionAccount.deserializeBinaryFromReader);
      msg.setAccountReservation(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.SubscribeError.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.SubscribeError.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.SubscribeError} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.SubscribeError.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getError();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getErrorCode();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = message.getTraderKey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      3,
      f
    );
  }
  f = message.getAccountReservation();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.poolrpc.AuctionAccount.serializeBinaryToWriter
    );
  }
};


/**
 * @enum {number}
 */
proto.poolrpc.SubscribeError.Error = {
  UNKNOWN: 0,
  SERVER_SHUTDOWN: 1,
  ACCOUNT_DOES_NOT_EXIST: 2,
  INCOMPLETE_ACCOUNT_RESERVATION: 3
};

/**
 * optional string error = 1;
 * @return {string}
 */
proto.poolrpc.SubscribeError.prototype.getError = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/** @param {string} value */
proto.poolrpc.SubscribeError.prototype.setError = function(value) {
  jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional Error error_code = 2;
 * @return {!proto.poolrpc.SubscribeError.Error}
 */
proto.poolrpc.SubscribeError.prototype.getErrorCode = function() {
  return /** @type {!proto.poolrpc.SubscribeError.Error} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {!proto.poolrpc.SubscribeError.Error} value */
proto.poolrpc.SubscribeError.prototype.setErrorCode = function(value) {
  jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional bytes trader_key = 3;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.SubscribeError.prototype.getTraderKey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * optional bytes trader_key = 3;
 * This is a type-conversion wrapper around `getTraderKey()`
 * @return {string}
 */
proto.poolrpc.SubscribeError.prototype.getTraderKey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getTraderKey()));
};


/**
 * optional bytes trader_key = 3;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getTraderKey()`
 * @return {!Uint8Array}
 */
proto.poolrpc.SubscribeError.prototype.getTraderKey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getTraderKey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.SubscribeError.prototype.setTraderKey = function(value) {
  jspb.Message.setProto3BytesField(this, 3, value);
};


/**
 * optional AuctionAccount account_reservation = 4;
 * @return {?proto.poolrpc.AuctionAccount}
 */
proto.poolrpc.SubscribeError.prototype.getAccountReservation = function() {
  return /** @type{?proto.poolrpc.AuctionAccount} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.AuctionAccount, 4));
};


/** @param {?proto.poolrpc.AuctionAccount|undefined} value */
proto.poolrpc.SubscribeError.prototype.setAccountReservation = function(value) {
  jspb.Message.setWrapperField(this, 4, value);
};


proto.poolrpc.SubscribeError.prototype.clearAccountReservation = function() {
  this.setAccountReservation(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.SubscribeError.prototype.hasAccountReservation = function() {
  return jspb.Message.getField(this, 4) != null;
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.AuctionAccount = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.AuctionAccount, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.AuctionAccount.displayName = 'proto.poolrpc.AuctionAccount';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.AuctionAccount.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.AuctionAccount.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.AuctionAccount} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.AuctionAccount.toObject = function(includeInstance, msg) {
  var f, obj = {
    value: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    expiry: jspb.Message.getFieldWithDefault(msg, 2, 0),
    traderKey: msg.getTraderKey_asB64(),
    auctioneerKey: msg.getAuctioneerKey_asB64(),
    batchKey: msg.getBatchKey_asB64(),
    state: jspb.Message.getFieldWithDefault(msg, 6, 0),
    heightHint: jspb.Message.getFieldWithDefault(msg, 7, 0),
    outpoint: (f = msg.getOutpoint()) && proto.poolrpc.OutPoint.toObject(includeInstance, f),
    latestTx: msg.getLatestTx_asB64(),
    version: jspb.Message.getFieldWithDefault(msg, 10, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.AuctionAccount}
 */
proto.poolrpc.AuctionAccount.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.AuctionAccount;
  return proto.poolrpc.AuctionAccount.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.AuctionAccount} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.AuctionAccount}
 */
proto.poolrpc.AuctionAccount.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setValue(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setExpiry(value);
      break;
    case 3:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setTraderKey(value);
      break;
    case 4:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setAuctioneerKey(value);
      break;
    case 5:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setBatchKey(value);
      break;
    case 6:
      var value = /** @type {!proto.poolrpc.AuctionAccountState} */ (reader.readEnum());
      msg.setState(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setHeightHint(value);
      break;
    case 8:
      var value = new proto.poolrpc.OutPoint;
      reader.readMessage(value,proto.poolrpc.OutPoint.deserializeBinaryFromReader);
      msg.setOutpoint(value);
      break;
    case 9:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setLatestTx(value);
      break;
    case 10:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setVersion(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.AuctionAccount.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.AuctionAccount.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.AuctionAccount} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.AuctionAccount.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getValue();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      1,
      f
    );
  }
  f = message.getExpiry();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
  f = message.getTraderKey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      3,
      f
    );
  }
  f = message.getAuctioneerKey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      4,
      f
    );
  }
  f = message.getBatchKey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      5,
      f
    );
  }
  f = message.getState();
  if (f !== 0.0) {
    writer.writeEnum(
      6,
      f
    );
  }
  f = message.getHeightHint();
  if (f !== 0) {
    writer.writeUint32(
      7,
      f
    );
  }
  f = message.getOutpoint();
  if (f != null) {
    writer.writeMessage(
      8,
      f,
      proto.poolrpc.OutPoint.serializeBinaryToWriter
    );
  }
  f = message.getLatestTx_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      9,
      f
    );
  }
  f = message.getVersion();
  if (f !== 0) {
    writer.writeUint32(
      10,
      f
    );
  }
};


/**
 * optional uint64 value = 1;
 * @return {string}
 */
proto.poolrpc.AuctionAccount.prototype.getValue = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/** @param {string} value */
proto.poolrpc.AuctionAccount.prototype.setValue = function(value) {
  jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional uint32 expiry = 2;
 * @return {number}
 */
proto.poolrpc.AuctionAccount.prototype.getExpiry = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.AuctionAccount.prototype.setExpiry = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional bytes trader_key = 3;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.AuctionAccount.prototype.getTraderKey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * optional bytes trader_key = 3;
 * This is a type-conversion wrapper around `getTraderKey()`
 * @return {string}
 */
proto.poolrpc.AuctionAccount.prototype.getTraderKey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getTraderKey()));
};


/**
 * optional bytes trader_key = 3;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getTraderKey()`
 * @return {!Uint8Array}
 */
proto.poolrpc.AuctionAccount.prototype.getTraderKey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getTraderKey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.AuctionAccount.prototype.setTraderKey = function(value) {
  jspb.Message.setProto3BytesField(this, 3, value);
};


/**
 * optional bytes auctioneer_key = 4;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.AuctionAccount.prototype.getAuctioneerKey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * optional bytes auctioneer_key = 4;
 * This is a type-conversion wrapper around `getAuctioneerKey()`
 * @return {string}
 */
proto.poolrpc.AuctionAccount.prototype.getAuctioneerKey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getAuctioneerKey()));
};


/**
 * optional bytes auctioneer_key = 4;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getAuctioneerKey()`
 * @return {!Uint8Array}
 */
proto.poolrpc.AuctionAccount.prototype.getAuctioneerKey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getAuctioneerKey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.AuctionAccount.prototype.setAuctioneerKey = function(value) {
  jspb.Message.setProto3BytesField(this, 4, value);
};


/**
 * optional bytes batch_key = 5;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.AuctionAccount.prototype.getBatchKey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * optional bytes batch_key = 5;
 * This is a type-conversion wrapper around `getBatchKey()`
 * @return {string}
 */
proto.poolrpc.AuctionAccount.prototype.getBatchKey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getBatchKey()));
};


/**
 * optional bytes batch_key = 5;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getBatchKey()`
 * @return {!Uint8Array}
 */
proto.poolrpc.AuctionAccount.prototype.getBatchKey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getBatchKey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.AuctionAccount.prototype.setBatchKey = function(value) {
  jspb.Message.setProto3BytesField(this, 5, value);
};


/**
 * optional AuctionAccountState state = 6;
 * @return {!proto.poolrpc.AuctionAccountState}
 */
proto.poolrpc.AuctionAccount.prototype.getState = function() {
  return /** @type {!proto.poolrpc.AuctionAccountState} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/** @param {!proto.poolrpc.AuctionAccountState} value */
proto.poolrpc.AuctionAccount.prototype.setState = function(value) {
  jspb.Message.setProto3EnumField(this, 6, value);
};


/**
 * optional uint32 height_hint = 7;
 * @return {number}
 */
proto.poolrpc.AuctionAccount.prototype.getHeightHint = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/** @param {number} value */
proto.poolrpc.AuctionAccount.prototype.setHeightHint = function(value) {
  jspb.Message.setProto3IntField(this, 7, value);
};


/**
 * optional OutPoint outpoint = 8;
 * @return {?proto.poolrpc.OutPoint}
 */
proto.poolrpc.AuctionAccount.prototype.getOutpoint = function() {
  return /** @type{?proto.poolrpc.OutPoint} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.OutPoint, 8));
};


/** @param {?proto.poolrpc.OutPoint|undefined} value */
proto.poolrpc.AuctionAccount.prototype.setOutpoint = function(value) {
  jspb.Message.setWrapperField(this, 8, value);
};


proto.poolrpc.AuctionAccount.prototype.clearOutpoint = function() {
  this.setOutpoint(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.AuctionAccount.prototype.hasOutpoint = function() {
  return jspb.Message.getField(this, 8) != null;
};


/**
 * optional bytes latest_tx = 9;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.AuctionAccount.prototype.getLatestTx = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 9, ""));
};


/**
 * optional bytes latest_tx = 9;
 * This is a type-conversion wrapper around `getLatestTx()`
 * @return {string}
 */
proto.poolrpc.AuctionAccount.prototype.getLatestTx_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getLatestTx()));
};


/**
 * optional bytes latest_tx = 9;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getLatestTx()`
 * @return {!Uint8Array}
 */
proto.poolrpc.AuctionAccount.prototype.getLatestTx_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getLatestTx()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.AuctionAccount.prototype.setLatestTx = function(value) {
  jspb.Message.setProto3BytesField(this, 9, value);
};


/**
 * optional uint32 version = 10;
 * @return {number}
 */
proto.poolrpc.AuctionAccount.prototype.getVersion = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 10, 0));
};


/** @param {number} value */
proto.poolrpc.AuctionAccount.prototype.setVersion = function(value) {
  jspb.Message.setProto3IntField(this, 10, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.MatchedOrder = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.poolrpc.MatchedOrder.repeatedFields_, null);
};
goog.inherits(proto.poolrpc.MatchedOrder, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.MatchedOrder.displayName = 'proto.poolrpc.MatchedOrder';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.poolrpc.MatchedOrder.repeatedFields_ = [1,2];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.MatchedOrder.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.MatchedOrder.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.MatchedOrder} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.MatchedOrder.toObject = function(includeInstance, msg) {
  var f, obj = {
    matchedBidsList: jspb.Message.toObjectList(msg.getMatchedBidsList(),
    proto.poolrpc.MatchedBid.toObject, includeInstance),
    matchedAsksList: jspb.Message.toObjectList(msg.getMatchedAsksList(),
    proto.poolrpc.MatchedAsk.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.MatchedOrder}
 */
proto.poolrpc.MatchedOrder.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.MatchedOrder;
  return proto.poolrpc.MatchedOrder.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.MatchedOrder} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.MatchedOrder}
 */
proto.poolrpc.MatchedOrder.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.MatchedBid;
      reader.readMessage(value,proto.poolrpc.MatchedBid.deserializeBinaryFromReader);
      msg.addMatchedBids(value);
      break;
    case 2:
      var value = new proto.poolrpc.MatchedAsk;
      reader.readMessage(value,proto.poolrpc.MatchedAsk.deserializeBinaryFromReader);
      msg.addMatchedAsks(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.MatchedOrder.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.MatchedOrder.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.MatchedOrder} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.MatchedOrder.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getMatchedBidsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.poolrpc.MatchedBid.serializeBinaryToWriter
    );
  }
  f = message.getMatchedAsksList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      proto.poolrpc.MatchedAsk.serializeBinaryToWriter
    );
  }
};


/**
 * repeated MatchedBid matched_bids = 1;
 * @return {!Array<!proto.poolrpc.MatchedBid>}
 */
proto.poolrpc.MatchedOrder.prototype.getMatchedBidsList = function() {
  return /** @type{!Array<!proto.poolrpc.MatchedBid>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.MatchedBid, 1));
};


/** @param {!Array<!proto.poolrpc.MatchedBid>} value */
proto.poolrpc.MatchedOrder.prototype.setMatchedBidsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.poolrpc.MatchedBid=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.MatchedBid}
 */
proto.poolrpc.MatchedOrder.prototype.addMatchedBids = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.poolrpc.MatchedBid, opt_index);
};


proto.poolrpc.MatchedOrder.prototype.clearMatchedBidsList = function() {
  this.setMatchedBidsList([]);
};


/**
 * repeated MatchedAsk matched_asks = 2;
 * @return {!Array<!proto.poolrpc.MatchedAsk>}
 */
proto.poolrpc.MatchedOrder.prototype.getMatchedAsksList = function() {
  return /** @type{!Array<!proto.poolrpc.MatchedAsk>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.MatchedAsk, 2));
};


/** @param {!Array<!proto.poolrpc.MatchedAsk>} value */
proto.poolrpc.MatchedOrder.prototype.setMatchedAsksList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.poolrpc.MatchedAsk=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.MatchedAsk}
 */
proto.poolrpc.MatchedOrder.prototype.addMatchedAsks = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.poolrpc.MatchedAsk, opt_index);
};


proto.poolrpc.MatchedOrder.prototype.clearMatchedAsksList = function() {
  this.setMatchedAsksList([]);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.MatchedAsk = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.MatchedAsk, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.MatchedAsk.displayName = 'proto.poolrpc.MatchedAsk';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.MatchedAsk.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.MatchedAsk.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.MatchedAsk} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.MatchedAsk.toObject = function(includeInstance, msg) {
  var f, obj = {
    ask: (f = msg.getAsk()) && proto.poolrpc.ServerAsk.toObject(includeInstance, f),
    unitsFilled: jspb.Message.getFieldWithDefault(msg, 2, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.MatchedAsk}
 */
proto.poolrpc.MatchedAsk.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.MatchedAsk;
  return proto.poolrpc.MatchedAsk.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.MatchedAsk} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.MatchedAsk}
 */
proto.poolrpc.MatchedAsk.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.ServerAsk;
      reader.readMessage(value,proto.poolrpc.ServerAsk.deserializeBinaryFromReader);
      msg.setAsk(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setUnitsFilled(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.MatchedAsk.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.MatchedAsk.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.MatchedAsk} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.MatchedAsk.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAsk();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.poolrpc.ServerAsk.serializeBinaryToWriter
    );
  }
  f = message.getUnitsFilled();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
};


/**
 * optional ServerAsk ask = 1;
 * @return {?proto.poolrpc.ServerAsk}
 */
proto.poolrpc.MatchedAsk.prototype.getAsk = function() {
  return /** @type{?proto.poolrpc.ServerAsk} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.ServerAsk, 1));
};


/** @param {?proto.poolrpc.ServerAsk|undefined} value */
proto.poolrpc.MatchedAsk.prototype.setAsk = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


proto.poolrpc.MatchedAsk.prototype.clearAsk = function() {
  this.setAsk(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.MatchedAsk.prototype.hasAsk = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional uint32 units_filled = 2;
 * @return {number}
 */
proto.poolrpc.MatchedAsk.prototype.getUnitsFilled = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.MatchedAsk.prototype.setUnitsFilled = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.MatchedBid = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.MatchedBid, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.MatchedBid.displayName = 'proto.poolrpc.MatchedBid';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.MatchedBid.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.MatchedBid.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.MatchedBid} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.MatchedBid.toObject = function(includeInstance, msg) {
  var f, obj = {
    bid: (f = msg.getBid()) && proto.poolrpc.ServerBid.toObject(includeInstance, f),
    unitsFilled: jspb.Message.getFieldWithDefault(msg, 2, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.MatchedBid}
 */
proto.poolrpc.MatchedBid.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.MatchedBid;
  return proto.poolrpc.MatchedBid.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.MatchedBid} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.MatchedBid}
 */
proto.poolrpc.MatchedBid.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.ServerBid;
      reader.readMessage(value,proto.poolrpc.ServerBid.deserializeBinaryFromReader);
      msg.setBid(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setUnitsFilled(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.MatchedBid.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.MatchedBid.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.MatchedBid} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.MatchedBid.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBid();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.poolrpc.ServerBid.serializeBinaryToWriter
    );
  }
  f = message.getUnitsFilled();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
};


/**
 * optional ServerBid bid = 1;
 * @return {?proto.poolrpc.ServerBid}
 */
proto.poolrpc.MatchedBid.prototype.getBid = function() {
  return /** @type{?proto.poolrpc.ServerBid} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.ServerBid, 1));
};


/** @param {?proto.poolrpc.ServerBid|undefined} value */
proto.poolrpc.MatchedBid.prototype.setBid = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


proto.poolrpc.MatchedBid.prototype.clearBid = function() {
  this.setBid(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.MatchedBid.prototype.hasBid = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional uint32 units_filled = 2;
 * @return {number}
 */
proto.poolrpc.MatchedBid.prototype.getUnitsFilled = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.MatchedBid.prototype.setUnitsFilled = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.AccountDiff = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.AccountDiff, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.AccountDiff.displayName = 'proto.poolrpc.AccountDiff';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.AccountDiff.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.AccountDiff.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.AccountDiff} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.AccountDiff.toObject = function(includeInstance, msg) {
  var f, obj = {
    endingBalance: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    endingState: jspb.Message.getFieldWithDefault(msg, 2, 0),
    outpointIndex: jspb.Message.getFieldWithDefault(msg, 3, 0),
    traderKey: msg.getTraderKey_asB64(),
    newExpiry: jspb.Message.getFieldWithDefault(msg, 5, 0),
    newVersion: jspb.Message.getFieldWithDefault(msg, 6, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.AccountDiff}
 */
proto.poolrpc.AccountDiff.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.AccountDiff;
  return proto.poolrpc.AccountDiff.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.AccountDiff} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.AccountDiff}
 */
proto.poolrpc.AccountDiff.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setEndingBalance(value);
      break;
    case 2:
      var value = /** @type {!proto.poolrpc.AccountDiff.AccountState} */ (reader.readEnum());
      msg.setEndingState(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setOutpointIndex(value);
      break;
    case 4:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setTraderKey(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setNewExpiry(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setNewVersion(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.AccountDiff.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.AccountDiff.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.AccountDiff} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.AccountDiff.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getEndingBalance();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      1,
      f
    );
  }
  f = message.getEndingState();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = message.getOutpointIndex();
  if (f !== 0) {
    writer.writeInt32(
      3,
      f
    );
  }
  f = message.getTraderKey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      4,
      f
    );
  }
  f = message.getNewExpiry();
  if (f !== 0) {
    writer.writeUint32(
      5,
      f
    );
  }
  f = message.getNewVersion();
  if (f !== 0) {
    writer.writeUint32(
      6,
      f
    );
  }
};


/**
 * @enum {number}
 */
proto.poolrpc.AccountDiff.AccountState = {
  OUTPUT_RECREATED: 0,
  OUTPUT_DUST_EXTENDED_OFFCHAIN: 1,
  OUTPUT_DUST_ADDED_TO_FEES: 2,
  OUTPUT_FULLY_SPENT: 3
};

/**
 * optional uint64 ending_balance = 1;
 * @return {string}
 */
proto.poolrpc.AccountDiff.prototype.getEndingBalance = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/** @param {string} value */
proto.poolrpc.AccountDiff.prototype.setEndingBalance = function(value) {
  jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional AccountState ending_state = 2;
 * @return {!proto.poolrpc.AccountDiff.AccountState}
 */
proto.poolrpc.AccountDiff.prototype.getEndingState = function() {
  return /** @type {!proto.poolrpc.AccountDiff.AccountState} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {!proto.poolrpc.AccountDiff.AccountState} value */
proto.poolrpc.AccountDiff.prototype.setEndingState = function(value) {
  jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional int32 outpoint_index = 3;
 * @return {number}
 */
proto.poolrpc.AccountDiff.prototype.getOutpointIndex = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {number} value */
proto.poolrpc.AccountDiff.prototype.setOutpointIndex = function(value) {
  jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional bytes trader_key = 4;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.AccountDiff.prototype.getTraderKey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * optional bytes trader_key = 4;
 * This is a type-conversion wrapper around `getTraderKey()`
 * @return {string}
 */
proto.poolrpc.AccountDiff.prototype.getTraderKey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getTraderKey()));
};


/**
 * optional bytes trader_key = 4;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getTraderKey()`
 * @return {!Uint8Array}
 */
proto.poolrpc.AccountDiff.prototype.getTraderKey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getTraderKey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.AccountDiff.prototype.setTraderKey = function(value) {
  jspb.Message.setProto3BytesField(this, 4, value);
};


/**
 * optional uint32 new_expiry = 5;
 * @return {number}
 */
proto.poolrpc.AccountDiff.prototype.getNewExpiry = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/** @param {number} value */
proto.poolrpc.AccountDiff.prototype.setNewExpiry = function(value) {
  jspb.Message.setProto3IntField(this, 5, value);
};


/**
 * optional uint32 new_version = 6;
 * @return {number}
 */
proto.poolrpc.AccountDiff.prototype.getNewVersion = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/** @param {number} value */
proto.poolrpc.AccountDiff.prototype.setNewVersion = function(value) {
  jspb.Message.setProto3IntField(this, 6, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.ServerOrder = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.poolrpc.ServerOrder.repeatedFields_, null);
};
goog.inherits(proto.poolrpc.ServerOrder, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ServerOrder.displayName = 'proto.poolrpc.ServerOrder';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.poolrpc.ServerOrder.repeatedFields_ = [10,14,15];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.ServerOrder.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ServerOrder.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ServerOrder} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerOrder.toObject = function(includeInstance, msg) {
  var f, obj = {
    traderKey: msg.getTraderKey_asB64(),
    rateFixed: jspb.Message.getFieldWithDefault(msg, 2, 0),
    amt: jspb.Message.getFieldWithDefault(msg, 3, "0"),
    minChanAmt: jspb.Message.getFieldWithDefault(msg, 4, "0"),
    orderNonce: msg.getOrderNonce_asB64(),
    orderSig: msg.getOrderSig_asB64(),
    multiSigKey: msg.getMultiSigKey_asB64(),
    nodePub: msg.getNodePub_asB64(),
    nodeAddrList: jspb.Message.toObjectList(msg.getNodeAddrList(),
    proto.poolrpc.NodeAddress.toObject, includeInstance),
    channelType: jspb.Message.getFieldWithDefault(msg, 12, 0),
    maxBatchFeeRateSatPerKw: jspb.Message.getFieldWithDefault(msg, 13, "0"),
    allowedNodeIdsList: msg.getAllowedNodeIdsList_asB64(),
    notAllowedNodeIdsList: msg.getNotAllowedNodeIdsList_asB64(),
    auctionType: jspb.Message.getFieldWithDefault(msg, 16, 0),
    isPublic: jspb.Message.getFieldWithDefault(msg, 17, false)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.ServerOrder}
 */
proto.poolrpc.ServerOrder.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ServerOrder;
  return proto.poolrpc.ServerOrder.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ServerOrder} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ServerOrder}
 */
proto.poolrpc.ServerOrder.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setTraderKey(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setRateFixed(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setAmt(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setMinChanAmt(value);
      break;
    case 6:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setOrderNonce(value);
      break;
    case 7:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setOrderSig(value);
      break;
    case 8:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setMultiSigKey(value);
      break;
    case 9:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setNodePub(value);
      break;
    case 10:
      var value = new proto.poolrpc.NodeAddress;
      reader.readMessage(value,proto.poolrpc.NodeAddress.deserializeBinaryFromReader);
      msg.addNodeAddr(value);
      break;
    case 12:
      var value = /** @type {!proto.poolrpc.OrderChannelType} */ (reader.readEnum());
      msg.setChannelType(value);
      break;
    case 13:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setMaxBatchFeeRateSatPerKw(value);
      break;
    case 14:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.addAllowedNodeIds(value);
      break;
    case 15:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.addNotAllowedNodeIds(value);
      break;
    case 16:
      var value = /** @type {!proto.poolrpc.AuctionType} */ (reader.readEnum());
      msg.setAuctionType(value);
      break;
    case 17:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIsPublic(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerOrder.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ServerOrder.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ServerOrder} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerOrder.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTraderKey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getRateFixed();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
  f = message.getAmt();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      3,
      f
    );
  }
  f = message.getMinChanAmt();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      4,
      f
    );
  }
  f = message.getOrderNonce_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      6,
      f
    );
  }
  f = message.getOrderSig_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      7,
      f
    );
  }
  f = message.getMultiSigKey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      8,
      f
    );
  }
  f = message.getNodePub_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      9,
      f
    );
  }
  f = message.getNodeAddrList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      10,
      f,
      proto.poolrpc.NodeAddress.serializeBinaryToWriter
    );
  }
  f = message.getChannelType();
  if (f !== 0.0) {
    writer.writeEnum(
      12,
      f
    );
  }
  f = message.getMaxBatchFeeRateSatPerKw();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      13,
      f
    );
  }
  f = message.getAllowedNodeIdsList_asU8();
  if (f.length > 0) {
    writer.writeRepeatedBytes(
      14,
      f
    );
  }
  f = message.getNotAllowedNodeIdsList_asU8();
  if (f.length > 0) {
    writer.writeRepeatedBytes(
      15,
      f
    );
  }
  f = message.getAuctionType();
  if (f !== 0.0) {
    writer.writeEnum(
      16,
      f
    );
  }
  f = message.getIsPublic();
  if (f) {
    writer.writeBool(
      17,
      f
    );
  }
};


/**
 * optional bytes trader_key = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.ServerOrder.prototype.getTraderKey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes trader_key = 1;
 * This is a type-conversion wrapper around `getTraderKey()`
 * @return {string}
 */
proto.poolrpc.ServerOrder.prototype.getTraderKey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getTraderKey()));
};


/**
 * optional bytes trader_key = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getTraderKey()`
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerOrder.prototype.getTraderKey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getTraderKey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.ServerOrder.prototype.setTraderKey = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional uint32 rate_fixed = 2;
 * @return {number}
 */
proto.poolrpc.ServerOrder.prototype.getRateFixed = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.ServerOrder.prototype.setRateFixed = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional uint64 amt = 3;
 * @return {string}
 */
proto.poolrpc.ServerOrder.prototype.getAmt = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, "0"));
};


/** @param {string} value */
proto.poolrpc.ServerOrder.prototype.setAmt = function(value) {
  jspb.Message.setProto3StringIntField(this, 3, value);
};


/**
 * optional uint64 min_chan_amt = 4;
 * @return {string}
 */
proto.poolrpc.ServerOrder.prototype.getMinChanAmt = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, "0"));
};


/** @param {string} value */
proto.poolrpc.ServerOrder.prototype.setMinChanAmt = function(value) {
  jspb.Message.setProto3StringIntField(this, 4, value);
};


/**
 * optional bytes order_nonce = 6;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.ServerOrder.prototype.getOrderNonce = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
};


/**
 * optional bytes order_nonce = 6;
 * This is a type-conversion wrapper around `getOrderNonce()`
 * @return {string}
 */
proto.poolrpc.ServerOrder.prototype.getOrderNonce_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getOrderNonce()));
};


/**
 * optional bytes order_nonce = 6;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getOrderNonce()`
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerOrder.prototype.getOrderNonce_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getOrderNonce()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.ServerOrder.prototype.setOrderNonce = function(value) {
  jspb.Message.setProto3BytesField(this, 6, value);
};


/**
 * optional bytes order_sig = 7;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.ServerOrder.prototype.getOrderSig = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 7, ""));
};


/**
 * optional bytes order_sig = 7;
 * This is a type-conversion wrapper around `getOrderSig()`
 * @return {string}
 */
proto.poolrpc.ServerOrder.prototype.getOrderSig_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getOrderSig()));
};


/**
 * optional bytes order_sig = 7;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getOrderSig()`
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerOrder.prototype.getOrderSig_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getOrderSig()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.ServerOrder.prototype.setOrderSig = function(value) {
  jspb.Message.setProto3BytesField(this, 7, value);
};


/**
 * optional bytes multi_sig_key = 8;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.ServerOrder.prototype.getMultiSigKey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 8, ""));
};


/**
 * optional bytes multi_sig_key = 8;
 * This is a type-conversion wrapper around `getMultiSigKey()`
 * @return {string}
 */
proto.poolrpc.ServerOrder.prototype.getMultiSigKey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getMultiSigKey()));
};


/**
 * optional bytes multi_sig_key = 8;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getMultiSigKey()`
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerOrder.prototype.getMultiSigKey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getMultiSigKey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.ServerOrder.prototype.setMultiSigKey = function(value) {
  jspb.Message.setProto3BytesField(this, 8, value);
};


/**
 * optional bytes node_pub = 9;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.ServerOrder.prototype.getNodePub = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 9, ""));
};


/**
 * optional bytes node_pub = 9;
 * This is a type-conversion wrapper around `getNodePub()`
 * @return {string}
 */
proto.poolrpc.ServerOrder.prototype.getNodePub_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getNodePub()));
};


/**
 * optional bytes node_pub = 9;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getNodePub()`
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerOrder.prototype.getNodePub_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getNodePub()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.ServerOrder.prototype.setNodePub = function(value) {
  jspb.Message.setProto3BytesField(this, 9, value);
};


/**
 * repeated NodeAddress node_addr = 10;
 * @return {!Array<!proto.poolrpc.NodeAddress>}
 */
proto.poolrpc.ServerOrder.prototype.getNodeAddrList = function() {
  return /** @type{!Array<!proto.poolrpc.NodeAddress>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.NodeAddress, 10));
};


/** @param {!Array<!proto.poolrpc.NodeAddress>} value */
proto.poolrpc.ServerOrder.prototype.setNodeAddrList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 10, value);
};


/**
 * @param {!proto.poolrpc.NodeAddress=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.NodeAddress}
 */
proto.poolrpc.ServerOrder.prototype.addNodeAddr = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 10, opt_value, proto.poolrpc.NodeAddress, opt_index);
};


proto.poolrpc.ServerOrder.prototype.clearNodeAddrList = function() {
  this.setNodeAddrList([]);
};


/**
 * optional OrderChannelType channel_type = 12;
 * @return {!proto.poolrpc.OrderChannelType}
 */
proto.poolrpc.ServerOrder.prototype.getChannelType = function() {
  return /** @type {!proto.poolrpc.OrderChannelType} */ (jspb.Message.getFieldWithDefault(this, 12, 0));
};


/** @param {!proto.poolrpc.OrderChannelType} value */
proto.poolrpc.ServerOrder.prototype.setChannelType = function(value) {
  jspb.Message.setProto3EnumField(this, 12, value);
};


/**
 * optional uint64 max_batch_fee_rate_sat_per_kw = 13;
 * @return {string}
 */
proto.poolrpc.ServerOrder.prototype.getMaxBatchFeeRateSatPerKw = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 13, "0"));
};


/** @param {string} value */
proto.poolrpc.ServerOrder.prototype.setMaxBatchFeeRateSatPerKw = function(value) {
  jspb.Message.setProto3StringIntField(this, 13, value);
};


/**
 * repeated bytes allowed_node_ids = 14;
 * @return {!(Array<!Uint8Array>|Array<string>)}
 */
proto.poolrpc.ServerOrder.prototype.getAllowedNodeIdsList = function() {
  return /** @type {!(Array<!Uint8Array>|Array<string>)} */ (jspb.Message.getRepeatedField(this, 14));
};


/**
 * repeated bytes allowed_node_ids = 14;
 * This is a type-conversion wrapper around `getAllowedNodeIdsList()`
 * @return {!Array<string>}
 */
proto.poolrpc.ServerOrder.prototype.getAllowedNodeIdsList_asB64 = function() {
  return /** @type {!Array<string>} */ (jspb.Message.bytesListAsB64(
      this.getAllowedNodeIdsList()));
};


/**
 * repeated bytes allowed_node_ids = 14;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getAllowedNodeIdsList()`
 * @return {!Array<!Uint8Array>}
 */
proto.poolrpc.ServerOrder.prototype.getAllowedNodeIdsList_asU8 = function() {
  return /** @type {!Array<!Uint8Array>} */ (jspb.Message.bytesListAsU8(
      this.getAllowedNodeIdsList()));
};


/** @param {!(Array<!Uint8Array>|Array<string>)} value */
proto.poolrpc.ServerOrder.prototype.setAllowedNodeIdsList = function(value) {
  jspb.Message.setField(this, 14, value || []);
};


/**
 * @param {!(string|Uint8Array)} value
 * @param {number=} opt_index
 */
proto.poolrpc.ServerOrder.prototype.addAllowedNodeIds = function(value, opt_index) {
  jspb.Message.addToRepeatedField(this, 14, value, opt_index);
};


proto.poolrpc.ServerOrder.prototype.clearAllowedNodeIdsList = function() {
  this.setAllowedNodeIdsList([]);
};


/**
 * repeated bytes not_allowed_node_ids = 15;
 * @return {!(Array<!Uint8Array>|Array<string>)}
 */
proto.poolrpc.ServerOrder.prototype.getNotAllowedNodeIdsList = function() {
  return /** @type {!(Array<!Uint8Array>|Array<string>)} */ (jspb.Message.getRepeatedField(this, 15));
};


/**
 * repeated bytes not_allowed_node_ids = 15;
 * This is a type-conversion wrapper around `getNotAllowedNodeIdsList()`
 * @return {!Array<string>}
 */
proto.poolrpc.ServerOrder.prototype.getNotAllowedNodeIdsList_asB64 = function() {
  return /** @type {!Array<string>} */ (jspb.Message.bytesListAsB64(
      this.getNotAllowedNodeIdsList()));
};


/**
 * repeated bytes not_allowed_node_ids = 15;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getNotAllowedNodeIdsList()`
 * @return {!Array<!Uint8Array>}
 */
proto.poolrpc.ServerOrder.prototype.getNotAllowedNodeIdsList_asU8 = function() {
  return /** @type {!Array<!Uint8Array>} */ (jspb.Message.bytesListAsU8(
      this.getNotAllowedNodeIdsList()));
};


/** @param {!(Array<!Uint8Array>|Array<string>)} value */
proto.poolrpc.ServerOrder.prototype.setNotAllowedNodeIdsList = function(value) {
  jspb.Message.setField(this, 15, value || []);
};


/**
 * @param {!(string|Uint8Array)} value
 * @param {number=} opt_index
 */
proto.poolrpc.ServerOrder.prototype.addNotAllowedNodeIds = function(value, opt_index) {
  jspb.Message.addToRepeatedField(this, 15, value, opt_index);
};


proto.poolrpc.ServerOrder.prototype.clearNotAllowedNodeIdsList = function() {
  this.setNotAllowedNodeIdsList([]);
};


/**
 * optional AuctionType auction_type = 16;
 * @return {!proto.poolrpc.AuctionType}
 */
proto.poolrpc.ServerOrder.prototype.getAuctionType = function() {
  return /** @type {!proto.poolrpc.AuctionType} */ (jspb.Message.getFieldWithDefault(this, 16, 0));
};


/** @param {!proto.poolrpc.AuctionType} value */
proto.poolrpc.ServerOrder.prototype.setAuctionType = function(value) {
  jspb.Message.setProto3EnumField(this, 16, value);
};


/**
 * optional bool is_public = 17;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.poolrpc.ServerOrder.prototype.getIsPublic = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 17, false));
};


/** @param {boolean} value */
proto.poolrpc.ServerOrder.prototype.setIsPublic = function(value) {
  jspb.Message.setProto3BooleanField(this, 17, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.ServerBid = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.ServerBid, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ServerBid.displayName = 'proto.poolrpc.ServerBid';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.ServerBid.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ServerBid.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ServerBid} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerBid.toObject = function(includeInstance, msg) {
  var f, obj = {
    details: (f = msg.getDetails()) && proto.poolrpc.ServerOrder.toObject(includeInstance, f),
    leaseDurationBlocks: jspb.Message.getFieldWithDefault(msg, 2, 0),
    version: jspb.Message.getFieldWithDefault(msg, 4, 0),
    minNodeTier: jspb.Message.getFieldWithDefault(msg, 5, 0),
    selfChanBalance: jspb.Message.getFieldWithDefault(msg, 6, "0"),
    isSidecarChannel: jspb.Message.getFieldWithDefault(msg, 7, false),
    unannouncedChannel: jspb.Message.getFieldWithDefault(msg, 8, false),
    zeroConfChannel: jspb.Message.getFieldWithDefault(msg, 9, false)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.ServerBid}
 */
proto.poolrpc.ServerBid.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ServerBid;
  return proto.poolrpc.ServerBid.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ServerBid} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ServerBid}
 */
proto.poolrpc.ServerBid.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.ServerOrder;
      reader.readMessage(value,proto.poolrpc.ServerOrder.deserializeBinaryFromReader);
      msg.setDetails(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setLeaseDurationBlocks(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setVersion(value);
      break;
    case 5:
      var value = /** @type {!proto.poolrpc.NodeTier} */ (reader.readEnum());
      msg.setMinNodeTier(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setSelfChanBalance(value);
      break;
    case 7:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIsSidecarChannel(value);
      break;
    case 8:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setUnannouncedChannel(value);
      break;
    case 9:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setZeroConfChannel(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerBid.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ServerBid.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ServerBid} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerBid.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDetails();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.poolrpc.ServerOrder.serializeBinaryToWriter
    );
  }
  f = message.getLeaseDurationBlocks();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
  f = message.getVersion();
  if (f !== 0) {
    writer.writeUint32(
      4,
      f
    );
  }
  f = message.getMinNodeTier();
  if (f !== 0.0) {
    writer.writeEnum(
      5,
      f
    );
  }
  f = message.getSelfChanBalance();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      6,
      f
    );
  }
  f = message.getIsSidecarChannel();
  if (f) {
    writer.writeBool(
      7,
      f
    );
  }
  f = message.getUnannouncedChannel();
  if (f) {
    writer.writeBool(
      8,
      f
    );
  }
  f = message.getZeroConfChannel();
  if (f) {
    writer.writeBool(
      9,
      f
    );
  }
};


/**
 * optional ServerOrder details = 1;
 * @return {?proto.poolrpc.ServerOrder}
 */
proto.poolrpc.ServerBid.prototype.getDetails = function() {
  return /** @type{?proto.poolrpc.ServerOrder} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.ServerOrder, 1));
};


/** @param {?proto.poolrpc.ServerOrder|undefined} value */
proto.poolrpc.ServerBid.prototype.setDetails = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


proto.poolrpc.ServerBid.prototype.clearDetails = function() {
  this.setDetails(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.ServerBid.prototype.hasDetails = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional uint32 lease_duration_blocks = 2;
 * @return {number}
 */
proto.poolrpc.ServerBid.prototype.getLeaseDurationBlocks = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.ServerBid.prototype.setLeaseDurationBlocks = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional uint32 version = 4;
 * @return {number}
 */
proto.poolrpc.ServerBid.prototype.getVersion = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {number} value */
proto.poolrpc.ServerBid.prototype.setVersion = function(value) {
  jspb.Message.setProto3IntField(this, 4, value);
};


/**
 * optional NodeTier min_node_tier = 5;
 * @return {!proto.poolrpc.NodeTier}
 */
proto.poolrpc.ServerBid.prototype.getMinNodeTier = function() {
  return /** @type {!proto.poolrpc.NodeTier} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/** @param {!proto.poolrpc.NodeTier} value */
proto.poolrpc.ServerBid.prototype.setMinNodeTier = function(value) {
  jspb.Message.setProto3EnumField(this, 5, value);
};


/**
 * optional uint64 self_chan_balance = 6;
 * @return {string}
 */
proto.poolrpc.ServerBid.prototype.getSelfChanBalance = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, "0"));
};


/** @param {string} value */
proto.poolrpc.ServerBid.prototype.setSelfChanBalance = function(value) {
  jspb.Message.setProto3StringIntField(this, 6, value);
};


/**
 * optional bool is_sidecar_channel = 7;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.poolrpc.ServerBid.prototype.getIsSidecarChannel = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 7, false));
};


/** @param {boolean} value */
proto.poolrpc.ServerBid.prototype.setIsSidecarChannel = function(value) {
  jspb.Message.setProto3BooleanField(this, 7, value);
};


/**
 * optional bool unannounced_channel = 8;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.poolrpc.ServerBid.prototype.getUnannouncedChannel = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 8, false));
};


/** @param {boolean} value */
proto.poolrpc.ServerBid.prototype.setUnannouncedChannel = function(value) {
  jspb.Message.setProto3BooleanField(this, 8, value);
};


/**
 * optional bool zero_conf_channel = 9;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.poolrpc.ServerBid.prototype.getZeroConfChannel = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 9, false));
};


/** @param {boolean} value */
proto.poolrpc.ServerBid.prototype.setZeroConfChannel = function(value) {
  jspb.Message.setProto3BooleanField(this, 9, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.ServerAsk = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.ServerAsk, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ServerAsk.displayName = 'proto.poolrpc.ServerAsk';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.ServerAsk.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ServerAsk.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ServerAsk} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerAsk.toObject = function(includeInstance, msg) {
  var f, obj = {
    details: (f = msg.getDetails()) && proto.poolrpc.ServerOrder.toObject(includeInstance, f),
    leaseDurationBlocks: jspb.Message.getFieldWithDefault(msg, 4, 0),
    version: jspb.Message.getFieldWithDefault(msg, 5, 0),
    announcementConstraints: jspb.Message.getFieldWithDefault(msg, 6, 0),
    confirmationConstraints: jspb.Message.getFieldWithDefault(msg, 7, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.ServerAsk}
 */
proto.poolrpc.ServerAsk.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ServerAsk;
  return proto.poolrpc.ServerAsk.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ServerAsk} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ServerAsk}
 */
proto.poolrpc.ServerAsk.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.ServerOrder;
      reader.readMessage(value,proto.poolrpc.ServerOrder.deserializeBinaryFromReader);
      msg.setDetails(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setLeaseDurationBlocks(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setVersion(value);
      break;
    case 6:
      var value = /** @type {!proto.poolrpc.ChannelAnnouncementConstraints} */ (reader.readEnum());
      msg.setAnnouncementConstraints(value);
      break;
    case 7:
      var value = /** @type {!proto.poolrpc.ChannelConfirmationConstraints} */ (reader.readEnum());
      msg.setConfirmationConstraints(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerAsk.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ServerAsk.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ServerAsk} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerAsk.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDetails();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.poolrpc.ServerOrder.serializeBinaryToWriter
    );
  }
  f = message.getLeaseDurationBlocks();
  if (f !== 0) {
    writer.writeUint32(
      4,
      f
    );
  }
  f = message.getVersion();
  if (f !== 0) {
    writer.writeUint32(
      5,
      f
    );
  }
  f = message.getAnnouncementConstraints();
  if (f !== 0.0) {
    writer.writeEnum(
      6,
      f
    );
  }
  f = message.getConfirmationConstraints();
  if (f !== 0.0) {
    writer.writeEnum(
      7,
      f
    );
  }
};


/**
 * optional ServerOrder details = 1;
 * @return {?proto.poolrpc.ServerOrder}
 */
proto.poolrpc.ServerAsk.prototype.getDetails = function() {
  return /** @type{?proto.poolrpc.ServerOrder} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.ServerOrder, 1));
};


/** @param {?proto.poolrpc.ServerOrder|undefined} value */
proto.poolrpc.ServerAsk.prototype.setDetails = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


proto.poolrpc.ServerAsk.prototype.clearDetails = function() {
  this.setDetails(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.ServerAsk.prototype.hasDetails = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional uint32 lease_duration_blocks = 4;
 * @return {number}
 */
proto.poolrpc.ServerAsk.prototype.getLeaseDurationBlocks = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {number} value */
proto.poolrpc.ServerAsk.prototype.setLeaseDurationBlocks = function(value) {
  jspb.Message.setProto3IntField(this, 4, value);
};


/**
 * optional uint32 version = 5;
 * @return {number}
 */
proto.poolrpc.ServerAsk.prototype.getVersion = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/** @param {number} value */
proto.poolrpc.ServerAsk.prototype.setVersion = function(value) {
  jspb.Message.setProto3IntField(this, 5, value);
};


/**
 * optional ChannelAnnouncementConstraints announcement_constraints = 6;
 * @return {!proto.poolrpc.ChannelAnnouncementConstraints}
 */
proto.poolrpc.ServerAsk.prototype.getAnnouncementConstraints = function() {
  return /** @type {!proto.poolrpc.ChannelAnnouncementConstraints} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/** @param {!proto.poolrpc.ChannelAnnouncementConstraints} value */
proto.poolrpc.ServerAsk.prototype.setAnnouncementConstraints = function(value) {
  jspb.Message.setProto3EnumField(this, 6, value);
};


/**
 * optional ChannelConfirmationConstraints confirmation_constraints = 7;
 * @return {!proto.poolrpc.ChannelConfirmationConstraints}
 */
proto.poolrpc.ServerAsk.prototype.getConfirmationConstraints = function() {
  return /** @type {!proto.poolrpc.ChannelConfirmationConstraints} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/** @param {!proto.poolrpc.ChannelConfirmationConstraints} value */
proto.poolrpc.ServerAsk.prototype.setConfirmationConstraints = function(value) {
  jspb.Message.setProto3EnumField(this, 7, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.CancelOrder = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.CancelOrder, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.CancelOrder.displayName = 'proto.poolrpc.CancelOrder';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.CancelOrder.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.CancelOrder.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.CancelOrder} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.CancelOrder.toObject = function(includeInstance, msg) {
  var f, obj = {
    orderNonce: msg.getOrderNonce_asB64()
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.CancelOrder}
 */
proto.poolrpc.CancelOrder.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.CancelOrder;
  return proto.poolrpc.CancelOrder.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.CancelOrder} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.CancelOrder}
 */
proto.poolrpc.CancelOrder.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setOrderNonce(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.CancelOrder.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.CancelOrder.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.CancelOrder} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.CancelOrder.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getOrderNonce_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
};


/**
 * optional bytes order_nonce = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.CancelOrder.prototype.getOrderNonce = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes order_nonce = 1;
 * This is a type-conversion wrapper around `getOrderNonce()`
 * @return {string}
 */
proto.poolrpc.CancelOrder.prototype.getOrderNonce_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getOrderNonce()));
};


/**
 * optional bytes order_nonce = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getOrderNonce()`
 * @return {!Uint8Array}
 */
proto.poolrpc.CancelOrder.prototype.getOrderNonce_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getOrderNonce()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.CancelOrder.prototype.setOrderNonce = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.InvalidOrder = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.InvalidOrder, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.InvalidOrder.displayName = 'proto.poolrpc.InvalidOrder';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.InvalidOrder.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.InvalidOrder.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.InvalidOrder} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.InvalidOrder.toObject = function(includeInstance, msg) {
  var f, obj = {
    orderNonce: msg.getOrderNonce_asB64(),
    failReason: jspb.Message.getFieldWithDefault(msg, 2, 0),
    failString: jspb.Message.getFieldWithDefault(msg, 3, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.InvalidOrder}
 */
proto.poolrpc.InvalidOrder.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.InvalidOrder;
  return proto.poolrpc.InvalidOrder.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.InvalidOrder} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.InvalidOrder}
 */
proto.poolrpc.InvalidOrder.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setOrderNonce(value);
      break;
    case 2:
      var value = /** @type {!proto.poolrpc.InvalidOrder.FailReason} */ (reader.readEnum());
      msg.setFailReason(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setFailString(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.InvalidOrder.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.InvalidOrder.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.InvalidOrder} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.InvalidOrder.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getOrderNonce_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getFailReason();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = message.getFailString();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
};


/**
 * @enum {number}
 */
proto.poolrpc.InvalidOrder.FailReason = {
  INVALID_AMT: 0
};

/**
 * optional bytes order_nonce = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.InvalidOrder.prototype.getOrderNonce = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes order_nonce = 1;
 * This is a type-conversion wrapper around `getOrderNonce()`
 * @return {string}
 */
proto.poolrpc.InvalidOrder.prototype.getOrderNonce_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getOrderNonce()));
};


/**
 * optional bytes order_nonce = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getOrderNonce()`
 * @return {!Uint8Array}
 */
proto.poolrpc.InvalidOrder.prototype.getOrderNonce_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getOrderNonce()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.InvalidOrder.prototype.setOrderNonce = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional FailReason fail_reason = 2;
 * @return {!proto.poolrpc.InvalidOrder.FailReason}
 */
proto.poolrpc.InvalidOrder.prototype.getFailReason = function() {
  return /** @type {!proto.poolrpc.InvalidOrder.FailReason} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {!proto.poolrpc.InvalidOrder.FailReason} value */
proto.poolrpc.InvalidOrder.prototype.setFailReason = function(value) {
  jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional string fail_string = 3;
 * @return {string}
 */
proto.poolrpc.InvalidOrder.prototype.getFailString = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/** @param {string} value */
proto.poolrpc.InvalidOrder.prototype.setFailString = function(value) {
  jspb.Message.setProto3StringField(this, 3, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.ServerInput = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.ServerInput, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ServerInput.displayName = 'proto.poolrpc.ServerInput';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.ServerInput.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ServerInput.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ServerInput} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerInput.toObject = function(includeInstance, msg) {
  var f, obj = {
    outpoint: (f = msg.getOutpoint()) && proto.poolrpc.OutPoint.toObject(includeInstance, f),
    sigScript: msg.getSigScript_asB64()
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.ServerInput}
 */
proto.poolrpc.ServerInput.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ServerInput;
  return proto.poolrpc.ServerInput.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ServerInput} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ServerInput}
 */
proto.poolrpc.ServerInput.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.OutPoint;
      reader.readMessage(value,proto.poolrpc.OutPoint.deserializeBinaryFromReader);
      msg.setOutpoint(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSigScript(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerInput.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ServerInput.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ServerInput} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerInput.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getOutpoint();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.poolrpc.OutPoint.serializeBinaryToWriter
    );
  }
  f = message.getSigScript_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
};


/**
 * optional OutPoint outpoint = 1;
 * @return {?proto.poolrpc.OutPoint}
 */
proto.poolrpc.ServerInput.prototype.getOutpoint = function() {
  return /** @type{?proto.poolrpc.OutPoint} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.OutPoint, 1));
};


/** @param {?proto.poolrpc.OutPoint|undefined} value */
proto.poolrpc.ServerInput.prototype.setOutpoint = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


proto.poolrpc.ServerInput.prototype.clearOutpoint = function() {
  this.setOutpoint(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.ServerInput.prototype.hasOutpoint = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional bytes sig_script = 2;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.ServerInput.prototype.getSigScript = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes sig_script = 2;
 * This is a type-conversion wrapper around `getSigScript()`
 * @return {string}
 */
proto.poolrpc.ServerInput.prototype.getSigScript_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSigScript()));
};


/**
 * optional bytes sig_script = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSigScript()`
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerInput.prototype.getSigScript_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSigScript()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.ServerInput.prototype.setSigScript = function(value) {
  jspb.Message.setProto3BytesField(this, 2, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.ServerOutput = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.ServerOutput, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ServerOutput.displayName = 'proto.poolrpc.ServerOutput';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.ServerOutput.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ServerOutput.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ServerOutput} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerOutput.toObject = function(includeInstance, msg) {
  var f, obj = {
    value: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    script: msg.getScript_asB64()
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.ServerOutput}
 */
proto.poolrpc.ServerOutput.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ServerOutput;
  return proto.poolrpc.ServerOutput.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ServerOutput} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ServerOutput}
 */
proto.poolrpc.ServerOutput.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setValue(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setScript(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerOutput.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ServerOutput.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ServerOutput} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerOutput.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getValue();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      1,
      f
    );
  }
  f = message.getScript_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
};


/**
 * optional uint64 value = 1;
 * @return {string}
 */
proto.poolrpc.ServerOutput.prototype.getValue = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/** @param {string} value */
proto.poolrpc.ServerOutput.prototype.setValue = function(value) {
  jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional bytes script = 2;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.ServerOutput.prototype.getScript = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes script = 2;
 * This is a type-conversion wrapper around `getScript()`
 * @return {string}
 */
proto.poolrpc.ServerOutput.prototype.getScript_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getScript()));
};


/**
 * optional bytes script = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getScript()`
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerOutput.prototype.getScript_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getScript()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.ServerOutput.prototype.setScript = function(value) {
  jspb.Message.setProto3BytesField(this, 2, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.ServerModifyAccountRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.poolrpc.ServerModifyAccountRequest.repeatedFields_, null);
};
goog.inherits(proto.poolrpc.ServerModifyAccountRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ServerModifyAccountRequest.displayName = 'proto.poolrpc.ServerModifyAccountRequest';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.poolrpc.ServerModifyAccountRequest.repeatedFields_ = [2,3,6];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.ServerModifyAccountRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ServerModifyAccountRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ServerModifyAccountRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerModifyAccountRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    traderKey: msg.getTraderKey_asB64(),
    newInputsList: jspb.Message.toObjectList(msg.getNewInputsList(),
    proto.poolrpc.ServerInput.toObject, includeInstance),
    newOutputsList: jspb.Message.toObjectList(msg.getNewOutputsList(),
    proto.poolrpc.ServerOutput.toObject, includeInstance),
    newParams: (f = msg.getNewParams()) && proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters.toObject(includeInstance, f),
    traderNonces: msg.getTraderNonces_asB64(),
    prevOutputsList: jspb.Message.toObjectList(msg.getPrevOutputsList(),
    proto.poolrpc.TxOut.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.ServerModifyAccountRequest}
 */
proto.poolrpc.ServerModifyAccountRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ServerModifyAccountRequest;
  return proto.poolrpc.ServerModifyAccountRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ServerModifyAccountRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ServerModifyAccountRequest}
 */
proto.poolrpc.ServerModifyAccountRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setTraderKey(value);
      break;
    case 2:
      var value = new proto.poolrpc.ServerInput;
      reader.readMessage(value,proto.poolrpc.ServerInput.deserializeBinaryFromReader);
      msg.addNewInputs(value);
      break;
    case 3:
      var value = new proto.poolrpc.ServerOutput;
      reader.readMessage(value,proto.poolrpc.ServerOutput.deserializeBinaryFromReader);
      msg.addNewOutputs(value);
      break;
    case 4:
      var value = new proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters;
      reader.readMessage(value,proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters.deserializeBinaryFromReader);
      msg.setNewParams(value);
      break;
    case 5:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setTraderNonces(value);
      break;
    case 6:
      var value = new proto.poolrpc.TxOut;
      reader.readMessage(value,proto.poolrpc.TxOut.deserializeBinaryFromReader);
      msg.addPrevOutputs(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerModifyAccountRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ServerModifyAccountRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ServerModifyAccountRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerModifyAccountRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTraderKey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getNewInputsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      proto.poolrpc.ServerInput.serializeBinaryToWriter
    );
  }
  f = message.getNewOutputsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.poolrpc.ServerOutput.serializeBinaryToWriter
    );
  }
  f = message.getNewParams();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters.serializeBinaryToWriter
    );
  }
  f = message.getTraderNonces_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      5,
      f
    );
  }
  f = message.getPrevOutputsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      6,
      f,
      proto.poolrpc.TxOut.serializeBinaryToWriter
    );
  }
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters.displayName = 'proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters.toObject = function(includeInstance, msg) {
  var f, obj = {
    value: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    expiry: jspb.Message.getFieldWithDefault(msg, 2, 0),
    version: jspb.Message.getFieldWithDefault(msg, 3, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters}
 */
proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters;
  return proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters}
 */
proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setValue(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setExpiry(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setVersion(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getValue();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      1,
      f
    );
  }
  f = message.getExpiry();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
  f = message.getVersion();
  if (f !== 0) {
    writer.writeUint32(
      3,
      f
    );
  }
};


/**
 * optional uint64 value = 1;
 * @return {string}
 */
proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters.prototype.getValue = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/** @param {string} value */
proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters.prototype.setValue = function(value) {
  jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional uint32 expiry = 2;
 * @return {number}
 */
proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters.prototype.getExpiry = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters.prototype.setExpiry = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional uint32 version = 3;
 * @return {number}
 */
proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters.prototype.getVersion = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {number} value */
proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters.prototype.setVersion = function(value) {
  jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional bytes trader_key = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.ServerModifyAccountRequest.prototype.getTraderKey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes trader_key = 1;
 * This is a type-conversion wrapper around `getTraderKey()`
 * @return {string}
 */
proto.poolrpc.ServerModifyAccountRequest.prototype.getTraderKey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getTraderKey()));
};


/**
 * optional bytes trader_key = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getTraderKey()`
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerModifyAccountRequest.prototype.getTraderKey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getTraderKey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.ServerModifyAccountRequest.prototype.setTraderKey = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * repeated ServerInput new_inputs = 2;
 * @return {!Array<!proto.poolrpc.ServerInput>}
 */
proto.poolrpc.ServerModifyAccountRequest.prototype.getNewInputsList = function() {
  return /** @type{!Array<!proto.poolrpc.ServerInput>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.ServerInput, 2));
};


/** @param {!Array<!proto.poolrpc.ServerInput>} value */
proto.poolrpc.ServerModifyAccountRequest.prototype.setNewInputsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.poolrpc.ServerInput=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.ServerInput}
 */
proto.poolrpc.ServerModifyAccountRequest.prototype.addNewInputs = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.poolrpc.ServerInput, opt_index);
};


proto.poolrpc.ServerModifyAccountRequest.prototype.clearNewInputsList = function() {
  this.setNewInputsList([]);
};


/**
 * repeated ServerOutput new_outputs = 3;
 * @return {!Array<!proto.poolrpc.ServerOutput>}
 */
proto.poolrpc.ServerModifyAccountRequest.prototype.getNewOutputsList = function() {
  return /** @type{!Array<!proto.poolrpc.ServerOutput>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.ServerOutput, 3));
};


/** @param {!Array<!proto.poolrpc.ServerOutput>} value */
proto.poolrpc.ServerModifyAccountRequest.prototype.setNewOutputsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.poolrpc.ServerOutput=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.ServerOutput}
 */
proto.poolrpc.ServerModifyAccountRequest.prototype.addNewOutputs = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.poolrpc.ServerOutput, opt_index);
};


proto.poolrpc.ServerModifyAccountRequest.prototype.clearNewOutputsList = function() {
  this.setNewOutputsList([]);
};


/**
 * optional NewAccountParameters new_params = 4;
 * @return {?proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters}
 */
proto.poolrpc.ServerModifyAccountRequest.prototype.getNewParams = function() {
  return /** @type{?proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters, 4));
};


/** @param {?proto.poolrpc.ServerModifyAccountRequest.NewAccountParameters|undefined} value */
proto.poolrpc.ServerModifyAccountRequest.prototype.setNewParams = function(value) {
  jspb.Message.setWrapperField(this, 4, value);
};


proto.poolrpc.ServerModifyAccountRequest.prototype.clearNewParams = function() {
  this.setNewParams(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.ServerModifyAccountRequest.prototype.hasNewParams = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional bytes trader_nonces = 5;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.ServerModifyAccountRequest.prototype.getTraderNonces = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * optional bytes trader_nonces = 5;
 * This is a type-conversion wrapper around `getTraderNonces()`
 * @return {string}
 */
proto.poolrpc.ServerModifyAccountRequest.prototype.getTraderNonces_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getTraderNonces()));
};


/**
 * optional bytes trader_nonces = 5;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getTraderNonces()`
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerModifyAccountRequest.prototype.getTraderNonces_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getTraderNonces()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.ServerModifyAccountRequest.prototype.setTraderNonces = function(value) {
  jspb.Message.setProto3BytesField(this, 5, value);
};


/**
 * repeated TxOut prev_outputs = 6;
 * @return {!Array<!proto.poolrpc.TxOut>}
 */
proto.poolrpc.ServerModifyAccountRequest.prototype.getPrevOutputsList = function() {
  return /** @type{!Array<!proto.poolrpc.TxOut>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.TxOut, 6));
};


/** @param {!Array<!proto.poolrpc.TxOut>} value */
proto.poolrpc.ServerModifyAccountRequest.prototype.setPrevOutputsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 6, value);
};


/**
 * @param {!proto.poolrpc.TxOut=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.TxOut}
 */
proto.poolrpc.ServerModifyAccountRequest.prototype.addPrevOutputs = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 6, opt_value, proto.poolrpc.TxOut, opt_index);
};


proto.poolrpc.ServerModifyAccountRequest.prototype.clearPrevOutputsList = function() {
  this.setPrevOutputsList([]);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.ServerModifyAccountResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.ServerModifyAccountResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ServerModifyAccountResponse.displayName = 'proto.poolrpc.ServerModifyAccountResponse';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.ServerModifyAccountResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ServerModifyAccountResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ServerModifyAccountResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerModifyAccountResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    accountSig: msg.getAccountSig_asB64(),
    serverNonces: msg.getServerNonces_asB64()
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.ServerModifyAccountResponse}
 */
proto.poolrpc.ServerModifyAccountResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ServerModifyAccountResponse;
  return proto.poolrpc.ServerModifyAccountResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ServerModifyAccountResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ServerModifyAccountResponse}
 */
proto.poolrpc.ServerModifyAccountResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setAccountSig(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setServerNonces(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerModifyAccountResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ServerModifyAccountResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ServerModifyAccountResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerModifyAccountResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAccountSig_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getServerNonces_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
};


/**
 * optional bytes account_sig = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.ServerModifyAccountResponse.prototype.getAccountSig = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes account_sig = 1;
 * This is a type-conversion wrapper around `getAccountSig()`
 * @return {string}
 */
proto.poolrpc.ServerModifyAccountResponse.prototype.getAccountSig_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getAccountSig()));
};


/**
 * optional bytes account_sig = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getAccountSig()`
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerModifyAccountResponse.prototype.getAccountSig_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getAccountSig()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.ServerModifyAccountResponse.prototype.setAccountSig = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional bytes server_nonces = 2;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.ServerModifyAccountResponse.prototype.getServerNonces = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes server_nonces = 2;
 * This is a type-conversion wrapper around `getServerNonces()`
 * @return {string}
 */
proto.poolrpc.ServerModifyAccountResponse.prototype.getServerNonces_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getServerNonces()));
};


/**
 * optional bytes server_nonces = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getServerNonces()`
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerModifyAccountResponse.prototype.getServerNonces_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getServerNonces()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.ServerModifyAccountResponse.prototype.setServerNonces = function(value) {
  jspb.Message.setProto3BytesField(this, 2, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.ServerOrderStateRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.ServerOrderStateRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ServerOrderStateRequest.displayName = 'proto.poolrpc.ServerOrderStateRequest';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.ServerOrderStateRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ServerOrderStateRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ServerOrderStateRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerOrderStateRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    orderNonce: msg.getOrderNonce_asB64()
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.ServerOrderStateRequest}
 */
proto.poolrpc.ServerOrderStateRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ServerOrderStateRequest;
  return proto.poolrpc.ServerOrderStateRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ServerOrderStateRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ServerOrderStateRequest}
 */
proto.poolrpc.ServerOrderStateRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setOrderNonce(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerOrderStateRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ServerOrderStateRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ServerOrderStateRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerOrderStateRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getOrderNonce_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
};


/**
 * optional bytes order_nonce = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.ServerOrderStateRequest.prototype.getOrderNonce = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes order_nonce = 1;
 * This is a type-conversion wrapper around `getOrderNonce()`
 * @return {string}
 */
proto.poolrpc.ServerOrderStateRequest.prototype.getOrderNonce_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getOrderNonce()));
};


/**
 * optional bytes order_nonce = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getOrderNonce()`
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerOrderStateRequest.prototype.getOrderNonce_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getOrderNonce()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.ServerOrderStateRequest.prototype.setOrderNonce = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.ServerOrderStateResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.ServerOrderStateResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ServerOrderStateResponse.displayName = 'proto.poolrpc.ServerOrderStateResponse';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.ServerOrderStateResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ServerOrderStateResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ServerOrderStateResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerOrderStateResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    state: jspb.Message.getFieldWithDefault(msg, 1, 0),
    unitsUnfulfilled: jspb.Message.getFieldWithDefault(msg, 2, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.ServerOrderStateResponse}
 */
proto.poolrpc.ServerOrderStateResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ServerOrderStateResponse;
  return proto.poolrpc.ServerOrderStateResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ServerOrderStateResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ServerOrderStateResponse}
 */
proto.poolrpc.ServerOrderStateResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.poolrpc.OrderState} */ (reader.readEnum());
      msg.setState(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setUnitsUnfulfilled(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerOrderStateResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ServerOrderStateResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ServerOrderStateResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerOrderStateResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getState();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getUnitsUnfulfilled();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
};


/**
 * optional OrderState state = 1;
 * @return {!proto.poolrpc.OrderState}
 */
proto.poolrpc.ServerOrderStateResponse.prototype.getState = function() {
  return /** @type {!proto.poolrpc.OrderState} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/** @param {!proto.poolrpc.OrderState} value */
proto.poolrpc.ServerOrderStateResponse.prototype.setState = function(value) {
  jspb.Message.setProto3EnumField(this, 1, value);
};


/**
 * optional uint32 units_unfulfilled = 2;
 * @return {number}
 */
proto.poolrpc.ServerOrderStateResponse.prototype.getUnitsUnfulfilled = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.ServerOrderStateResponse.prototype.setUnitsUnfulfilled = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.TermsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.TermsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.TermsRequest.displayName = 'proto.poolrpc.TermsRequest';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.TermsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.TermsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.TermsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.TermsRequest.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.TermsRequest}
 */
proto.poolrpc.TermsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.TermsRequest;
  return proto.poolrpc.TermsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.TermsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.TermsRequest}
 */
proto.poolrpc.TermsRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.TermsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.TermsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.TermsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.TermsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.TermsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.TermsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.TermsResponse.displayName = 'proto.poolrpc.TermsResponse';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.TermsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.TermsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.TermsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.TermsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    maxAccountValue: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    maxOrderDurationBlocks: jspb.Message.getFieldWithDefault(msg, 2, 0),
    executionFee: (f = msg.getExecutionFee()) && proto.poolrpc.ExecutionFee.toObject(includeInstance, f),
    leaseDurationsMap: (f = msg.getLeaseDurationsMap()) ? f.toObject(includeInstance, undefined) : [],
    nextBatchConfTarget: jspb.Message.getFieldWithDefault(msg, 5, 0),
    nextBatchFeeRateSatPerKw: jspb.Message.getFieldWithDefault(msg, 6, "0"),
    nextBatchClearTimestamp: jspb.Message.getFieldWithDefault(msg, 7, "0"),
    leaseDurationBucketsMap: (f = msg.getLeaseDurationBucketsMap()) ? f.toObject(includeInstance, undefined) : [],
    autoRenewExtensionBlocks: jspb.Message.getFieldWithDefault(msg, 9, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.TermsResponse}
 */
proto.poolrpc.TermsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.TermsResponse;
  return proto.poolrpc.TermsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.TermsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.TermsResponse}
 */
proto.poolrpc.TermsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setMaxAccountValue(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setMaxOrderDurationBlocks(value);
      break;
    case 3:
      var value = new proto.poolrpc.ExecutionFee;
      reader.readMessage(value,proto.poolrpc.ExecutionFee.deserializeBinaryFromReader);
      msg.setExecutionFee(value);
      break;
    case 4:
      var value = msg.getLeaseDurationsMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readUint32, jspb.BinaryReader.prototype.readBool, null, 0);
         });
      break;
    case 5:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setNextBatchConfTarget(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setNextBatchFeeRateSatPerKw(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setNextBatchClearTimestamp(value);
      break;
    case 8:
      var value = msg.getLeaseDurationBucketsMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readUint32, jspb.BinaryReader.prototype.readEnum, null, 0);
         });
      break;
    case 9:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setAutoRenewExtensionBlocks(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.TermsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.TermsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.TermsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.TermsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getMaxAccountValue();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      1,
      f
    );
  }
  f = message.getMaxOrderDurationBlocks();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
  f = message.getExecutionFee();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.poolrpc.ExecutionFee.serializeBinaryToWriter
    );
  }
  f = message.getLeaseDurationsMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(4, writer, jspb.BinaryWriter.prototype.writeUint32, jspb.BinaryWriter.prototype.writeBool);
  }
  f = message.getNextBatchConfTarget();
  if (f !== 0) {
    writer.writeUint32(
      5,
      f
    );
  }
  f = message.getNextBatchFeeRateSatPerKw();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      6,
      f
    );
  }
  f = message.getNextBatchClearTimestamp();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      7,
      f
    );
  }
  f = message.getLeaseDurationBucketsMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(8, writer, jspb.BinaryWriter.prototype.writeUint32, jspb.BinaryWriter.prototype.writeEnum);
  }
  f = message.getAutoRenewExtensionBlocks();
  if (f !== 0) {
    writer.writeUint32(
      9,
      f
    );
  }
};


/**
 * optional uint64 max_account_value = 1;
 * @return {string}
 */
proto.poolrpc.TermsResponse.prototype.getMaxAccountValue = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/** @param {string} value */
proto.poolrpc.TermsResponse.prototype.setMaxAccountValue = function(value) {
  jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional uint32 max_order_duration_blocks = 2;
 * @return {number}
 */
proto.poolrpc.TermsResponse.prototype.getMaxOrderDurationBlocks = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.TermsResponse.prototype.setMaxOrderDurationBlocks = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional ExecutionFee execution_fee = 3;
 * @return {?proto.poolrpc.ExecutionFee}
 */
proto.poolrpc.TermsResponse.prototype.getExecutionFee = function() {
  return /** @type{?proto.poolrpc.ExecutionFee} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.ExecutionFee, 3));
};


/** @param {?proto.poolrpc.ExecutionFee|undefined} value */
proto.poolrpc.TermsResponse.prototype.setExecutionFee = function(value) {
  jspb.Message.setWrapperField(this, 3, value);
};


proto.poolrpc.TermsResponse.prototype.clearExecutionFee = function() {
  this.setExecutionFee(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.TermsResponse.prototype.hasExecutionFee = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * map<uint32, bool> lease_durations = 4;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<number,boolean>}
 */
proto.poolrpc.TermsResponse.prototype.getLeaseDurationsMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<number,boolean>} */ (
      jspb.Message.getMapField(this, 4, opt_noLazyCreate,
      null));
};


proto.poolrpc.TermsResponse.prototype.clearLeaseDurationsMap = function() {
  this.getLeaseDurationsMap().clear();
};


/**
 * optional uint32 next_batch_conf_target = 5;
 * @return {number}
 */
proto.poolrpc.TermsResponse.prototype.getNextBatchConfTarget = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/** @param {number} value */
proto.poolrpc.TermsResponse.prototype.setNextBatchConfTarget = function(value) {
  jspb.Message.setProto3IntField(this, 5, value);
};


/**
 * optional uint64 next_batch_fee_rate_sat_per_kw = 6;
 * @return {string}
 */
proto.poolrpc.TermsResponse.prototype.getNextBatchFeeRateSatPerKw = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, "0"));
};


/** @param {string} value */
proto.poolrpc.TermsResponse.prototype.setNextBatchFeeRateSatPerKw = function(value) {
  jspb.Message.setProto3StringIntField(this, 6, value);
};


/**
 * optional uint64 next_batch_clear_timestamp = 7;
 * @return {string}
 */
proto.poolrpc.TermsResponse.prototype.getNextBatchClearTimestamp = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, "0"));
};


/** @param {string} value */
proto.poolrpc.TermsResponse.prototype.setNextBatchClearTimestamp = function(value) {
  jspb.Message.setProto3StringIntField(this, 7, value);
};


/**
 * map<uint32, DurationBucketState> lease_duration_buckets = 8;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<number,!proto.poolrpc.DurationBucketState>}
 */
proto.poolrpc.TermsResponse.prototype.getLeaseDurationBucketsMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<number,!proto.poolrpc.DurationBucketState>} */ (
      jspb.Message.getMapField(this, 8, opt_noLazyCreate,
      null));
};


proto.poolrpc.TermsResponse.prototype.clearLeaseDurationBucketsMap = function() {
  this.getLeaseDurationBucketsMap().clear();
};


/**
 * optional uint32 auto_renew_extension_blocks = 9;
 * @return {number}
 */
proto.poolrpc.TermsResponse.prototype.getAutoRenewExtensionBlocks = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 9, 0));
};


/** @param {number} value */
proto.poolrpc.TermsResponse.prototype.setAutoRenewExtensionBlocks = function(value) {
  jspb.Message.setProto3IntField(this, 9, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.RelevantBatchRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.poolrpc.RelevantBatchRequest.repeatedFields_, null);
};
goog.inherits(proto.poolrpc.RelevantBatchRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.RelevantBatchRequest.displayName = 'proto.poolrpc.RelevantBatchRequest';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.poolrpc.RelevantBatchRequest.repeatedFields_ = [2];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.RelevantBatchRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.RelevantBatchRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.RelevantBatchRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.RelevantBatchRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: msg.getId_asB64(),
    accountsList: msg.getAccountsList_asB64()
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.RelevantBatchRequest}
 */
proto.poolrpc.RelevantBatchRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.RelevantBatchRequest;
  return proto.poolrpc.RelevantBatchRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.RelevantBatchRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.RelevantBatchRequest}
 */
proto.poolrpc.RelevantBatchRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setId(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.addAccounts(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.RelevantBatchRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.RelevantBatchRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.RelevantBatchRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.RelevantBatchRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getAccountsList_asU8();
  if (f.length > 0) {
    writer.writeRepeatedBytes(
      2,
      f
    );
  }
};


/**
 * optional bytes id = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.RelevantBatchRequest.prototype.getId = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes id = 1;
 * This is a type-conversion wrapper around `getId()`
 * @return {string}
 */
proto.poolrpc.RelevantBatchRequest.prototype.getId_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getId()));
};


/**
 * optional bytes id = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getId()`
 * @return {!Uint8Array}
 */
proto.poolrpc.RelevantBatchRequest.prototype.getId_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getId()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.RelevantBatchRequest.prototype.setId = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * repeated bytes accounts = 2;
 * @return {!(Array<!Uint8Array>|Array<string>)}
 */
proto.poolrpc.RelevantBatchRequest.prototype.getAccountsList = function() {
  return /** @type {!(Array<!Uint8Array>|Array<string>)} */ (jspb.Message.getRepeatedField(this, 2));
};


/**
 * repeated bytes accounts = 2;
 * This is a type-conversion wrapper around `getAccountsList()`
 * @return {!Array<string>}
 */
proto.poolrpc.RelevantBatchRequest.prototype.getAccountsList_asB64 = function() {
  return /** @type {!Array<string>} */ (jspb.Message.bytesListAsB64(
      this.getAccountsList()));
};


/**
 * repeated bytes accounts = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getAccountsList()`
 * @return {!Array<!Uint8Array>}
 */
proto.poolrpc.RelevantBatchRequest.prototype.getAccountsList_asU8 = function() {
  return /** @type {!Array<!Uint8Array>} */ (jspb.Message.bytesListAsU8(
      this.getAccountsList()));
};


/** @param {!(Array<!Uint8Array>|Array<string>)} value */
proto.poolrpc.RelevantBatchRequest.prototype.setAccountsList = function(value) {
  jspb.Message.setField(this, 2, value || []);
};


/**
 * @param {!(string|Uint8Array)} value
 * @param {number=} opt_index
 */
proto.poolrpc.RelevantBatchRequest.prototype.addAccounts = function(value, opt_index) {
  jspb.Message.addToRepeatedField(this, 2, value, opt_index);
};


proto.poolrpc.RelevantBatchRequest.prototype.clearAccountsList = function() {
  this.setAccountsList([]);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.RelevantBatch = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.poolrpc.RelevantBatch.repeatedFields_, null);
};
goog.inherits(proto.poolrpc.RelevantBatch, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.RelevantBatch.displayName = 'proto.poolrpc.RelevantBatch';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.poolrpc.RelevantBatch.repeatedFields_ = [3];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.RelevantBatch.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.RelevantBatch.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.RelevantBatch} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.RelevantBatch.toObject = function(includeInstance, msg) {
  var f, obj = {
    version: jspb.Message.getFieldWithDefault(msg, 1, 0),
    id: msg.getId_asB64(),
    chargedAccountsList: jspb.Message.toObjectList(msg.getChargedAccountsList(),
    proto.poolrpc.AccountDiff.toObject, includeInstance),
    matchedOrdersMap: (f = msg.getMatchedOrdersMap()) ? f.toObject(includeInstance, proto.poolrpc.MatchedOrder.toObject) : [],
    clearingPriceRate: jspb.Message.getFieldWithDefault(msg, 5, 0),
    executionFee: (f = msg.getExecutionFee()) && proto.poolrpc.ExecutionFee.toObject(includeInstance, f),
    transaction: msg.getTransaction_asB64(),
    feeRateSatPerKw: jspb.Message.getFieldWithDefault(msg, 8, "0"),
    creationTimestampNs: jspb.Message.getFieldWithDefault(msg, 9, "0"),
    matchedMarketsMap: (f = msg.getMatchedMarketsMap()) ? f.toObject(includeInstance, proto.poolrpc.MatchedMarket.toObject) : []
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.RelevantBatch}
 */
proto.poolrpc.RelevantBatch.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.RelevantBatch;
  return proto.poolrpc.RelevantBatch.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.RelevantBatch} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.RelevantBatch}
 */
proto.poolrpc.RelevantBatch.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setVersion(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setId(value);
      break;
    case 3:
      var value = new proto.poolrpc.AccountDiff;
      reader.readMessage(value,proto.poolrpc.AccountDiff.deserializeBinaryFromReader);
      msg.addChargedAccounts(value);
      break;
    case 4:
      var value = msg.getMatchedOrdersMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readString, jspb.BinaryReader.prototype.readMessage, proto.poolrpc.MatchedOrder.deserializeBinaryFromReader, "");
         });
      break;
    case 5:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setClearingPriceRate(value);
      break;
    case 6:
      var value = new proto.poolrpc.ExecutionFee;
      reader.readMessage(value,proto.poolrpc.ExecutionFee.deserializeBinaryFromReader);
      msg.setExecutionFee(value);
      break;
    case 7:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setTransaction(value);
      break;
    case 8:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setFeeRateSatPerKw(value);
      break;
    case 9:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setCreationTimestampNs(value);
      break;
    case 10:
      var value = msg.getMatchedMarketsMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readUint32, jspb.BinaryReader.prototype.readMessage, proto.poolrpc.MatchedMarket.deserializeBinaryFromReader, 0);
         });
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.RelevantBatch.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.RelevantBatch.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.RelevantBatch} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.RelevantBatch.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getVersion();
  if (f !== 0) {
    writer.writeUint32(
      1,
      f
    );
  }
  f = message.getId_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
  f = message.getChargedAccountsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.poolrpc.AccountDiff.serializeBinaryToWriter
    );
  }
  f = message.getMatchedOrdersMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(4, writer, jspb.BinaryWriter.prototype.writeString, jspb.BinaryWriter.prototype.writeMessage, proto.poolrpc.MatchedOrder.serializeBinaryToWriter);
  }
  f = message.getClearingPriceRate();
  if (f !== 0) {
    writer.writeUint32(
      5,
      f
    );
  }
  f = message.getExecutionFee();
  if (f != null) {
    writer.writeMessage(
      6,
      f,
      proto.poolrpc.ExecutionFee.serializeBinaryToWriter
    );
  }
  f = message.getTransaction_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      7,
      f
    );
  }
  f = message.getFeeRateSatPerKw();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      8,
      f
    );
  }
  f = message.getCreationTimestampNs();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      9,
      f
    );
  }
  f = message.getMatchedMarketsMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(10, writer, jspb.BinaryWriter.prototype.writeUint32, jspb.BinaryWriter.prototype.writeMessage, proto.poolrpc.MatchedMarket.serializeBinaryToWriter);
  }
};


/**
 * optional uint32 version = 1;
 * @return {number}
 */
proto.poolrpc.RelevantBatch.prototype.getVersion = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/** @param {number} value */
proto.poolrpc.RelevantBatch.prototype.setVersion = function(value) {
  jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * optional bytes id = 2;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.RelevantBatch.prototype.getId = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes id = 2;
 * This is a type-conversion wrapper around `getId()`
 * @return {string}
 */
proto.poolrpc.RelevantBatch.prototype.getId_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getId()));
};


/**
 * optional bytes id = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getId()`
 * @return {!Uint8Array}
 */
proto.poolrpc.RelevantBatch.prototype.getId_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getId()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.RelevantBatch.prototype.setId = function(value) {
  jspb.Message.setProto3BytesField(this, 2, value);
};


/**
 * repeated AccountDiff charged_accounts = 3;
 * @return {!Array<!proto.poolrpc.AccountDiff>}
 */
proto.poolrpc.RelevantBatch.prototype.getChargedAccountsList = function() {
  return /** @type{!Array<!proto.poolrpc.AccountDiff>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.AccountDiff, 3));
};


/** @param {!Array<!proto.poolrpc.AccountDiff>} value */
proto.poolrpc.RelevantBatch.prototype.setChargedAccountsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.poolrpc.AccountDiff=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.AccountDiff}
 */
proto.poolrpc.RelevantBatch.prototype.addChargedAccounts = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.poolrpc.AccountDiff, opt_index);
};


proto.poolrpc.RelevantBatch.prototype.clearChargedAccountsList = function() {
  this.setChargedAccountsList([]);
};


/**
 * map<string, MatchedOrder> matched_orders = 4;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<string,!proto.poolrpc.MatchedOrder>}
 */
proto.poolrpc.RelevantBatch.prototype.getMatchedOrdersMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<string,!proto.poolrpc.MatchedOrder>} */ (
      jspb.Message.getMapField(this, 4, opt_noLazyCreate,
      proto.poolrpc.MatchedOrder));
};


proto.poolrpc.RelevantBatch.prototype.clearMatchedOrdersMap = function() {
  this.getMatchedOrdersMap().clear();
};


/**
 * optional uint32 clearing_price_rate = 5;
 * @return {number}
 */
proto.poolrpc.RelevantBatch.prototype.getClearingPriceRate = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/** @param {number} value */
proto.poolrpc.RelevantBatch.prototype.setClearingPriceRate = function(value) {
  jspb.Message.setProto3IntField(this, 5, value);
};


/**
 * optional ExecutionFee execution_fee = 6;
 * @return {?proto.poolrpc.ExecutionFee}
 */
proto.poolrpc.RelevantBatch.prototype.getExecutionFee = function() {
  return /** @type{?proto.poolrpc.ExecutionFee} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.ExecutionFee, 6));
};


/** @param {?proto.poolrpc.ExecutionFee|undefined} value */
proto.poolrpc.RelevantBatch.prototype.setExecutionFee = function(value) {
  jspb.Message.setWrapperField(this, 6, value);
};


proto.poolrpc.RelevantBatch.prototype.clearExecutionFee = function() {
  this.setExecutionFee(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.RelevantBatch.prototype.hasExecutionFee = function() {
  return jspb.Message.getField(this, 6) != null;
};


/**
 * optional bytes transaction = 7;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.RelevantBatch.prototype.getTransaction = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 7, ""));
};


/**
 * optional bytes transaction = 7;
 * This is a type-conversion wrapper around `getTransaction()`
 * @return {string}
 */
proto.poolrpc.RelevantBatch.prototype.getTransaction_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getTransaction()));
};


/**
 * optional bytes transaction = 7;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getTransaction()`
 * @return {!Uint8Array}
 */
proto.poolrpc.RelevantBatch.prototype.getTransaction_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getTransaction()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.RelevantBatch.prototype.setTransaction = function(value) {
  jspb.Message.setProto3BytesField(this, 7, value);
};


/**
 * optional uint64 fee_rate_sat_per_kw = 8;
 * @return {string}
 */
proto.poolrpc.RelevantBatch.prototype.getFeeRateSatPerKw = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 8, "0"));
};


/** @param {string} value */
proto.poolrpc.RelevantBatch.prototype.setFeeRateSatPerKw = function(value) {
  jspb.Message.setProto3StringIntField(this, 8, value);
};


/**
 * optional uint64 creation_timestamp_ns = 9;
 * @return {string}
 */
proto.poolrpc.RelevantBatch.prototype.getCreationTimestampNs = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 9, "0"));
};


/** @param {string} value */
proto.poolrpc.RelevantBatch.prototype.setCreationTimestampNs = function(value) {
  jspb.Message.setProto3StringIntField(this, 9, value);
};


/**
 * map<uint32, MatchedMarket> matched_markets = 10;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<number,!proto.poolrpc.MatchedMarket>}
 */
proto.poolrpc.RelevantBatch.prototype.getMatchedMarketsMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<number,!proto.poolrpc.MatchedMarket>} */ (
      jspb.Message.getMapField(this, 10, opt_noLazyCreate,
      proto.poolrpc.MatchedMarket));
};


proto.poolrpc.RelevantBatch.prototype.clearMatchedMarketsMap = function() {
  this.getMatchedMarketsMap().clear();
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.ExecutionFee = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.ExecutionFee, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ExecutionFee.displayName = 'proto.poolrpc.ExecutionFee';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.ExecutionFee.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ExecutionFee.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ExecutionFee} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ExecutionFee.toObject = function(includeInstance, msg) {
  var f, obj = {
    baseFee: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    feeRate: jspb.Message.getFieldWithDefault(msg, 2, "0")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.ExecutionFee}
 */
proto.poolrpc.ExecutionFee.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ExecutionFee;
  return proto.poolrpc.ExecutionFee.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ExecutionFee} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ExecutionFee}
 */
proto.poolrpc.ExecutionFee.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setBaseFee(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setFeeRate(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.ExecutionFee.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ExecutionFee.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ExecutionFee} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ExecutionFee.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBaseFee();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      1,
      f
    );
  }
  f = message.getFeeRate();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      2,
      f
    );
  }
};


/**
 * optional uint64 base_fee = 1;
 * @return {string}
 */
proto.poolrpc.ExecutionFee.prototype.getBaseFee = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/** @param {string} value */
proto.poolrpc.ExecutionFee.prototype.setBaseFee = function(value) {
  jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional uint64 fee_rate = 2;
 * @return {string}
 */
proto.poolrpc.ExecutionFee.prototype.getFeeRate = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, "0"));
};


/** @param {string} value */
proto.poolrpc.ExecutionFee.prototype.setFeeRate = function(value) {
  jspb.Message.setProto3StringIntField(this, 2, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.NodeAddress = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.NodeAddress, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.NodeAddress.displayName = 'proto.poolrpc.NodeAddress';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.NodeAddress.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.NodeAddress.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.NodeAddress} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.NodeAddress.toObject = function(includeInstance, msg) {
  var f, obj = {
    network: jspb.Message.getFieldWithDefault(msg, 1, ""),
    addr: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.NodeAddress}
 */
proto.poolrpc.NodeAddress.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.NodeAddress;
  return proto.poolrpc.NodeAddress.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.NodeAddress} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.NodeAddress}
 */
proto.poolrpc.NodeAddress.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setNetwork(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setAddr(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.NodeAddress.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.NodeAddress.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.NodeAddress} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.NodeAddress.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getNetwork();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getAddr();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional string network = 1;
 * @return {string}
 */
proto.poolrpc.NodeAddress.prototype.getNetwork = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/** @param {string} value */
proto.poolrpc.NodeAddress.prototype.setNetwork = function(value) {
  jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string addr = 2;
 * @return {string}
 */
proto.poolrpc.NodeAddress.prototype.getAddr = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/** @param {string} value */
proto.poolrpc.NodeAddress.prototype.setAddr = function(value) {
  jspb.Message.setProto3StringField(this, 2, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.OutPoint = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.OutPoint, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.OutPoint.displayName = 'proto.poolrpc.OutPoint';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.OutPoint.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.OutPoint.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.OutPoint} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.OutPoint.toObject = function(includeInstance, msg) {
  var f, obj = {
    txid: msg.getTxid_asB64(),
    outputIndex: jspb.Message.getFieldWithDefault(msg, 2, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.OutPoint}
 */
proto.poolrpc.OutPoint.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.OutPoint;
  return proto.poolrpc.OutPoint.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.OutPoint} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.OutPoint}
 */
proto.poolrpc.OutPoint.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setTxid(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setOutputIndex(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.OutPoint.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.OutPoint.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.OutPoint} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.OutPoint.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTxid_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getOutputIndex();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
};


/**
 * optional bytes txid = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.OutPoint.prototype.getTxid = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes txid = 1;
 * This is a type-conversion wrapper around `getTxid()`
 * @return {string}
 */
proto.poolrpc.OutPoint.prototype.getTxid_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getTxid()));
};


/**
 * optional bytes txid = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getTxid()`
 * @return {!Uint8Array}
 */
proto.poolrpc.OutPoint.prototype.getTxid_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getTxid()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.OutPoint.prototype.setTxid = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional uint32 output_index = 2;
 * @return {number}
 */
proto.poolrpc.OutPoint.prototype.getOutputIndex = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.OutPoint.prototype.setOutputIndex = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.AskSnapshot = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.AskSnapshot, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.AskSnapshot.displayName = 'proto.poolrpc.AskSnapshot';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.AskSnapshot.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.AskSnapshot.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.AskSnapshot} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.AskSnapshot.toObject = function(includeInstance, msg) {
  var f, obj = {
    version: jspb.Message.getFieldWithDefault(msg, 1, 0),
    leaseDurationBlocks: jspb.Message.getFieldWithDefault(msg, 2, 0),
    rateFixed: jspb.Message.getFieldWithDefault(msg, 3, 0),
    chanType: jspb.Message.getFieldWithDefault(msg, 4, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.AskSnapshot}
 */
proto.poolrpc.AskSnapshot.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.AskSnapshot;
  return proto.poolrpc.AskSnapshot.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.AskSnapshot} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.AskSnapshot}
 */
proto.poolrpc.AskSnapshot.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setVersion(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setLeaseDurationBlocks(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setRateFixed(value);
      break;
    case 4:
      var value = /** @type {!proto.poolrpc.OrderChannelType} */ (reader.readEnum());
      msg.setChanType(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.AskSnapshot.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.AskSnapshot.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.AskSnapshot} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.AskSnapshot.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getVersion();
  if (f !== 0) {
    writer.writeUint32(
      1,
      f
    );
  }
  f = message.getLeaseDurationBlocks();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
  f = message.getRateFixed();
  if (f !== 0) {
    writer.writeUint32(
      3,
      f
    );
  }
  f = message.getChanType();
  if (f !== 0.0) {
    writer.writeEnum(
      4,
      f
    );
  }
};


/**
 * optional uint32 version = 1;
 * @return {number}
 */
proto.poolrpc.AskSnapshot.prototype.getVersion = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/** @param {number} value */
proto.poolrpc.AskSnapshot.prototype.setVersion = function(value) {
  jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * optional uint32 lease_duration_blocks = 2;
 * @return {number}
 */
proto.poolrpc.AskSnapshot.prototype.getLeaseDurationBlocks = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.AskSnapshot.prototype.setLeaseDurationBlocks = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional uint32 rate_fixed = 3;
 * @return {number}
 */
proto.poolrpc.AskSnapshot.prototype.getRateFixed = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {number} value */
proto.poolrpc.AskSnapshot.prototype.setRateFixed = function(value) {
  jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional OrderChannelType chan_type = 4;
 * @return {!proto.poolrpc.OrderChannelType}
 */
proto.poolrpc.AskSnapshot.prototype.getChanType = function() {
  return /** @type {!proto.poolrpc.OrderChannelType} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {!proto.poolrpc.OrderChannelType} value */
proto.poolrpc.AskSnapshot.prototype.setChanType = function(value) {
  jspb.Message.setProto3EnumField(this, 4, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.BidSnapshot = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.BidSnapshot, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.BidSnapshot.displayName = 'proto.poolrpc.BidSnapshot';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.BidSnapshot.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.BidSnapshot.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.BidSnapshot} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.BidSnapshot.toObject = function(includeInstance, msg) {
  var f, obj = {
    version: jspb.Message.getFieldWithDefault(msg, 1, 0),
    leaseDurationBlocks: jspb.Message.getFieldWithDefault(msg, 2, 0),
    rateFixed: jspb.Message.getFieldWithDefault(msg, 3, 0),
    chanType: jspb.Message.getFieldWithDefault(msg, 4, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.BidSnapshot}
 */
proto.poolrpc.BidSnapshot.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.BidSnapshot;
  return proto.poolrpc.BidSnapshot.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.BidSnapshot} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.BidSnapshot}
 */
proto.poolrpc.BidSnapshot.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setVersion(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setLeaseDurationBlocks(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setRateFixed(value);
      break;
    case 4:
      var value = /** @type {!proto.poolrpc.OrderChannelType} */ (reader.readEnum());
      msg.setChanType(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.BidSnapshot.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.BidSnapshot.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.BidSnapshot} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.BidSnapshot.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getVersion();
  if (f !== 0) {
    writer.writeUint32(
      1,
      f
    );
  }
  f = message.getLeaseDurationBlocks();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
  f = message.getRateFixed();
  if (f !== 0) {
    writer.writeUint32(
      3,
      f
    );
  }
  f = message.getChanType();
  if (f !== 0.0) {
    writer.writeEnum(
      4,
      f
    );
  }
};


/**
 * optional uint32 version = 1;
 * @return {number}
 */
proto.poolrpc.BidSnapshot.prototype.getVersion = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/** @param {number} value */
proto.poolrpc.BidSnapshot.prototype.setVersion = function(value) {
  jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * optional uint32 lease_duration_blocks = 2;
 * @return {number}
 */
proto.poolrpc.BidSnapshot.prototype.getLeaseDurationBlocks = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.BidSnapshot.prototype.setLeaseDurationBlocks = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional uint32 rate_fixed = 3;
 * @return {number}
 */
proto.poolrpc.BidSnapshot.prototype.getRateFixed = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {number} value */
proto.poolrpc.BidSnapshot.prototype.setRateFixed = function(value) {
  jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional OrderChannelType chan_type = 4;
 * @return {!proto.poolrpc.OrderChannelType}
 */
proto.poolrpc.BidSnapshot.prototype.getChanType = function() {
  return /** @type {!proto.poolrpc.OrderChannelType} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {!proto.poolrpc.OrderChannelType} value */
proto.poolrpc.BidSnapshot.prototype.setChanType = function(value) {
  jspb.Message.setProto3EnumField(this, 4, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.MatchedOrderSnapshot = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.MatchedOrderSnapshot, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.MatchedOrderSnapshot.displayName = 'proto.poolrpc.MatchedOrderSnapshot';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.MatchedOrderSnapshot.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.MatchedOrderSnapshot.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.MatchedOrderSnapshot} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.MatchedOrderSnapshot.toObject = function(includeInstance, msg) {
  var f, obj = {
    ask: (f = msg.getAsk()) && proto.poolrpc.AskSnapshot.toObject(includeInstance, f),
    bid: (f = msg.getBid()) && proto.poolrpc.BidSnapshot.toObject(includeInstance, f),
    matchingRate: jspb.Message.getFieldWithDefault(msg, 3, 0),
    totalSatsCleared: jspb.Message.getFieldWithDefault(msg, 4, "0"),
    unitsMatched: jspb.Message.getFieldWithDefault(msg, 5, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.MatchedOrderSnapshot}
 */
proto.poolrpc.MatchedOrderSnapshot.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.MatchedOrderSnapshot;
  return proto.poolrpc.MatchedOrderSnapshot.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.MatchedOrderSnapshot} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.MatchedOrderSnapshot}
 */
proto.poolrpc.MatchedOrderSnapshot.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.AskSnapshot;
      reader.readMessage(value,proto.poolrpc.AskSnapshot.deserializeBinaryFromReader);
      msg.setAsk(value);
      break;
    case 2:
      var value = new proto.poolrpc.BidSnapshot;
      reader.readMessage(value,proto.poolrpc.BidSnapshot.deserializeBinaryFromReader);
      msg.setBid(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setMatchingRate(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setTotalSatsCleared(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setUnitsMatched(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.MatchedOrderSnapshot.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.MatchedOrderSnapshot.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.MatchedOrderSnapshot} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.MatchedOrderSnapshot.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAsk();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.poolrpc.AskSnapshot.serializeBinaryToWriter
    );
  }
  f = message.getBid();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.poolrpc.BidSnapshot.serializeBinaryToWriter
    );
  }
  f = message.getMatchingRate();
  if (f !== 0) {
    writer.writeUint32(
      3,
      f
    );
  }
  f = message.getTotalSatsCleared();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      4,
      f
    );
  }
  f = message.getUnitsMatched();
  if (f !== 0) {
    writer.writeUint32(
      5,
      f
    );
  }
};


/**
 * optional AskSnapshot ask = 1;
 * @return {?proto.poolrpc.AskSnapshot}
 */
proto.poolrpc.MatchedOrderSnapshot.prototype.getAsk = function() {
  return /** @type{?proto.poolrpc.AskSnapshot} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.AskSnapshot, 1));
};


/** @param {?proto.poolrpc.AskSnapshot|undefined} value */
proto.poolrpc.MatchedOrderSnapshot.prototype.setAsk = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


proto.poolrpc.MatchedOrderSnapshot.prototype.clearAsk = function() {
  this.setAsk(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.MatchedOrderSnapshot.prototype.hasAsk = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional BidSnapshot bid = 2;
 * @return {?proto.poolrpc.BidSnapshot}
 */
proto.poolrpc.MatchedOrderSnapshot.prototype.getBid = function() {
  return /** @type{?proto.poolrpc.BidSnapshot} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.BidSnapshot, 2));
};


/** @param {?proto.poolrpc.BidSnapshot|undefined} value */
proto.poolrpc.MatchedOrderSnapshot.prototype.setBid = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.poolrpc.MatchedOrderSnapshot.prototype.clearBid = function() {
  this.setBid(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.MatchedOrderSnapshot.prototype.hasBid = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional uint32 matching_rate = 3;
 * @return {number}
 */
proto.poolrpc.MatchedOrderSnapshot.prototype.getMatchingRate = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {number} value */
proto.poolrpc.MatchedOrderSnapshot.prototype.setMatchingRate = function(value) {
  jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional uint64 total_sats_cleared = 4;
 * @return {string}
 */
proto.poolrpc.MatchedOrderSnapshot.prototype.getTotalSatsCleared = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, "0"));
};


/** @param {string} value */
proto.poolrpc.MatchedOrderSnapshot.prototype.setTotalSatsCleared = function(value) {
  jspb.Message.setProto3StringIntField(this, 4, value);
};


/**
 * optional uint32 units_matched = 5;
 * @return {number}
 */
proto.poolrpc.MatchedOrderSnapshot.prototype.getUnitsMatched = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/** @param {number} value */
proto.poolrpc.MatchedOrderSnapshot.prototype.setUnitsMatched = function(value) {
  jspb.Message.setProto3IntField(this, 5, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.BatchSnapshotRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.BatchSnapshotRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.BatchSnapshotRequest.displayName = 'proto.poolrpc.BatchSnapshotRequest';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.BatchSnapshotRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.BatchSnapshotRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.BatchSnapshotRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.BatchSnapshotRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    batchId: msg.getBatchId_asB64()
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.BatchSnapshotRequest}
 */
proto.poolrpc.BatchSnapshotRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.BatchSnapshotRequest;
  return proto.poolrpc.BatchSnapshotRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.BatchSnapshotRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.BatchSnapshotRequest}
 */
proto.poolrpc.BatchSnapshotRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setBatchId(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.BatchSnapshotRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.BatchSnapshotRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.BatchSnapshotRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.BatchSnapshotRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBatchId_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
};


/**
 * optional bytes batch_id = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.BatchSnapshotRequest.prototype.getBatchId = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes batch_id = 1;
 * This is a type-conversion wrapper around `getBatchId()`
 * @return {string}
 */
proto.poolrpc.BatchSnapshotRequest.prototype.getBatchId_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getBatchId()));
};


/**
 * optional bytes batch_id = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getBatchId()`
 * @return {!Uint8Array}
 */
proto.poolrpc.BatchSnapshotRequest.prototype.getBatchId_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getBatchId()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.BatchSnapshotRequest.prototype.setBatchId = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.MatchedMarketSnapshot = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.poolrpc.MatchedMarketSnapshot.repeatedFields_, null);
};
goog.inherits(proto.poolrpc.MatchedMarketSnapshot, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.MatchedMarketSnapshot.displayName = 'proto.poolrpc.MatchedMarketSnapshot';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.poolrpc.MatchedMarketSnapshot.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.MatchedMarketSnapshot.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.MatchedMarketSnapshot.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.MatchedMarketSnapshot} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.MatchedMarketSnapshot.toObject = function(includeInstance, msg) {
  var f, obj = {
    matchedOrdersList: jspb.Message.toObjectList(msg.getMatchedOrdersList(),
    proto.poolrpc.MatchedOrderSnapshot.toObject, includeInstance),
    clearingPriceRate: jspb.Message.getFieldWithDefault(msg, 2, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.MatchedMarketSnapshot}
 */
proto.poolrpc.MatchedMarketSnapshot.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.MatchedMarketSnapshot;
  return proto.poolrpc.MatchedMarketSnapshot.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.MatchedMarketSnapshot} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.MatchedMarketSnapshot}
 */
proto.poolrpc.MatchedMarketSnapshot.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.MatchedOrderSnapshot;
      reader.readMessage(value,proto.poolrpc.MatchedOrderSnapshot.deserializeBinaryFromReader);
      msg.addMatchedOrders(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setClearingPriceRate(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.MatchedMarketSnapshot.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.MatchedMarketSnapshot.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.MatchedMarketSnapshot} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.MatchedMarketSnapshot.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getMatchedOrdersList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.poolrpc.MatchedOrderSnapshot.serializeBinaryToWriter
    );
  }
  f = message.getClearingPriceRate();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
};


/**
 * repeated MatchedOrderSnapshot matched_orders = 1;
 * @return {!Array<!proto.poolrpc.MatchedOrderSnapshot>}
 */
proto.poolrpc.MatchedMarketSnapshot.prototype.getMatchedOrdersList = function() {
  return /** @type{!Array<!proto.poolrpc.MatchedOrderSnapshot>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.MatchedOrderSnapshot, 1));
};


/** @param {!Array<!proto.poolrpc.MatchedOrderSnapshot>} value */
proto.poolrpc.MatchedMarketSnapshot.prototype.setMatchedOrdersList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.poolrpc.MatchedOrderSnapshot=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.MatchedOrderSnapshot}
 */
proto.poolrpc.MatchedMarketSnapshot.prototype.addMatchedOrders = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.poolrpc.MatchedOrderSnapshot, opt_index);
};


proto.poolrpc.MatchedMarketSnapshot.prototype.clearMatchedOrdersList = function() {
  this.setMatchedOrdersList([]);
};


/**
 * optional uint32 clearing_price_rate = 2;
 * @return {number}
 */
proto.poolrpc.MatchedMarketSnapshot.prototype.getClearingPriceRate = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.MatchedMarketSnapshot.prototype.setClearingPriceRate = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.BatchSnapshotResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.poolrpc.BatchSnapshotResponse.repeatedFields_, null);
};
goog.inherits(proto.poolrpc.BatchSnapshotResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.BatchSnapshotResponse.displayName = 'proto.poolrpc.BatchSnapshotResponse';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.poolrpc.BatchSnapshotResponse.repeatedFields_ = [5];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.BatchSnapshotResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.BatchSnapshotResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.BatchSnapshotResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.BatchSnapshotResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    version: jspb.Message.getFieldWithDefault(msg, 1, 0),
    batchId: msg.getBatchId_asB64(),
    prevBatchId: msg.getPrevBatchId_asB64(),
    clearingPriceRate: jspb.Message.getFieldWithDefault(msg, 4, 0),
    matchedOrdersList: jspb.Message.toObjectList(msg.getMatchedOrdersList(),
    proto.poolrpc.MatchedOrderSnapshot.toObject, includeInstance),
    batchTxId: jspb.Message.getFieldWithDefault(msg, 7, ""),
    batchTx: msg.getBatchTx_asB64(),
    batchTxFeeRateSatPerKw: jspb.Message.getFieldWithDefault(msg, 8, "0"),
    creationTimestampNs: jspb.Message.getFieldWithDefault(msg, 9, "0"),
    matchedMarketsMap: (f = msg.getMatchedMarketsMap()) ? f.toObject(includeInstance, proto.poolrpc.MatchedMarketSnapshot.toObject) : []
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.BatchSnapshotResponse}
 */
proto.poolrpc.BatchSnapshotResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.BatchSnapshotResponse;
  return proto.poolrpc.BatchSnapshotResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.BatchSnapshotResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.BatchSnapshotResponse}
 */
proto.poolrpc.BatchSnapshotResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setVersion(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setBatchId(value);
      break;
    case 3:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setPrevBatchId(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setClearingPriceRate(value);
      break;
    case 5:
      var value = new proto.poolrpc.MatchedOrderSnapshot;
      reader.readMessage(value,proto.poolrpc.MatchedOrderSnapshot.deserializeBinaryFromReader);
      msg.addMatchedOrders(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readString());
      msg.setBatchTxId(value);
      break;
    case 6:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setBatchTx(value);
      break;
    case 8:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setBatchTxFeeRateSatPerKw(value);
      break;
    case 9:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setCreationTimestampNs(value);
      break;
    case 10:
      var value = msg.getMatchedMarketsMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readUint32, jspb.BinaryReader.prototype.readMessage, proto.poolrpc.MatchedMarketSnapshot.deserializeBinaryFromReader, 0);
         });
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.BatchSnapshotResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.BatchSnapshotResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.BatchSnapshotResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.BatchSnapshotResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getVersion();
  if (f !== 0) {
    writer.writeUint32(
      1,
      f
    );
  }
  f = message.getBatchId_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
  f = message.getPrevBatchId_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      3,
      f
    );
  }
  f = message.getClearingPriceRate();
  if (f !== 0) {
    writer.writeUint32(
      4,
      f
    );
  }
  f = message.getMatchedOrdersList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      5,
      f,
      proto.poolrpc.MatchedOrderSnapshot.serializeBinaryToWriter
    );
  }
  f = message.getBatchTxId();
  if (f.length > 0) {
    writer.writeString(
      7,
      f
    );
  }
  f = message.getBatchTx_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      6,
      f
    );
  }
  f = message.getBatchTxFeeRateSatPerKw();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      8,
      f
    );
  }
  f = message.getCreationTimestampNs();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      9,
      f
    );
  }
  f = message.getMatchedMarketsMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(10, writer, jspb.BinaryWriter.prototype.writeUint32, jspb.BinaryWriter.prototype.writeMessage, proto.poolrpc.MatchedMarketSnapshot.serializeBinaryToWriter);
  }
};


/**
 * optional uint32 version = 1;
 * @return {number}
 */
proto.poolrpc.BatchSnapshotResponse.prototype.getVersion = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/** @param {number} value */
proto.poolrpc.BatchSnapshotResponse.prototype.setVersion = function(value) {
  jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * optional bytes batch_id = 2;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.BatchSnapshotResponse.prototype.getBatchId = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes batch_id = 2;
 * This is a type-conversion wrapper around `getBatchId()`
 * @return {string}
 */
proto.poolrpc.BatchSnapshotResponse.prototype.getBatchId_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getBatchId()));
};


/**
 * optional bytes batch_id = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getBatchId()`
 * @return {!Uint8Array}
 */
proto.poolrpc.BatchSnapshotResponse.prototype.getBatchId_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getBatchId()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.BatchSnapshotResponse.prototype.setBatchId = function(value) {
  jspb.Message.setProto3BytesField(this, 2, value);
};


/**
 * optional bytes prev_batch_id = 3;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.BatchSnapshotResponse.prototype.getPrevBatchId = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * optional bytes prev_batch_id = 3;
 * This is a type-conversion wrapper around `getPrevBatchId()`
 * @return {string}
 */
proto.poolrpc.BatchSnapshotResponse.prototype.getPrevBatchId_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getPrevBatchId()));
};


/**
 * optional bytes prev_batch_id = 3;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getPrevBatchId()`
 * @return {!Uint8Array}
 */
proto.poolrpc.BatchSnapshotResponse.prototype.getPrevBatchId_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getPrevBatchId()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.BatchSnapshotResponse.prototype.setPrevBatchId = function(value) {
  jspb.Message.setProto3BytesField(this, 3, value);
};


/**
 * optional uint32 clearing_price_rate = 4;
 * @return {number}
 */
proto.poolrpc.BatchSnapshotResponse.prototype.getClearingPriceRate = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {number} value */
proto.poolrpc.BatchSnapshotResponse.prototype.setClearingPriceRate = function(value) {
  jspb.Message.setProto3IntField(this, 4, value);
};


/**
 * repeated MatchedOrderSnapshot matched_orders = 5;
 * @return {!Array<!proto.poolrpc.MatchedOrderSnapshot>}
 */
proto.poolrpc.BatchSnapshotResponse.prototype.getMatchedOrdersList = function() {
  return /** @type{!Array<!proto.poolrpc.MatchedOrderSnapshot>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.MatchedOrderSnapshot, 5));
};


/** @param {!Array<!proto.poolrpc.MatchedOrderSnapshot>} value */
proto.poolrpc.BatchSnapshotResponse.prototype.setMatchedOrdersList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 5, value);
};


/**
 * @param {!proto.poolrpc.MatchedOrderSnapshot=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.MatchedOrderSnapshot}
 */
proto.poolrpc.BatchSnapshotResponse.prototype.addMatchedOrders = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 5, opt_value, proto.poolrpc.MatchedOrderSnapshot, opt_index);
};


proto.poolrpc.BatchSnapshotResponse.prototype.clearMatchedOrdersList = function() {
  this.setMatchedOrdersList([]);
};


/**
 * optional string batch_tx_id = 7;
 * @return {string}
 */
proto.poolrpc.BatchSnapshotResponse.prototype.getBatchTxId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, ""));
};


/** @param {string} value */
proto.poolrpc.BatchSnapshotResponse.prototype.setBatchTxId = function(value) {
  jspb.Message.setProto3StringField(this, 7, value);
};


/**
 * optional bytes batch_tx = 6;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.BatchSnapshotResponse.prototype.getBatchTx = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
};


/**
 * optional bytes batch_tx = 6;
 * This is a type-conversion wrapper around `getBatchTx()`
 * @return {string}
 */
proto.poolrpc.BatchSnapshotResponse.prototype.getBatchTx_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getBatchTx()));
};


/**
 * optional bytes batch_tx = 6;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getBatchTx()`
 * @return {!Uint8Array}
 */
proto.poolrpc.BatchSnapshotResponse.prototype.getBatchTx_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getBatchTx()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.BatchSnapshotResponse.prototype.setBatchTx = function(value) {
  jspb.Message.setProto3BytesField(this, 6, value);
};


/**
 * optional uint64 batch_tx_fee_rate_sat_per_kw = 8;
 * @return {string}
 */
proto.poolrpc.BatchSnapshotResponse.prototype.getBatchTxFeeRateSatPerKw = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 8, "0"));
};


/** @param {string} value */
proto.poolrpc.BatchSnapshotResponse.prototype.setBatchTxFeeRateSatPerKw = function(value) {
  jspb.Message.setProto3StringIntField(this, 8, value);
};


/**
 * optional uint64 creation_timestamp_ns = 9;
 * @return {string}
 */
proto.poolrpc.BatchSnapshotResponse.prototype.getCreationTimestampNs = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 9, "0"));
};


/** @param {string} value */
proto.poolrpc.BatchSnapshotResponse.prototype.setCreationTimestampNs = function(value) {
  jspb.Message.setProto3StringIntField(this, 9, value);
};


/**
 * map<uint32, MatchedMarketSnapshot> matched_markets = 10;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<number,!proto.poolrpc.MatchedMarketSnapshot>}
 */
proto.poolrpc.BatchSnapshotResponse.prototype.getMatchedMarketsMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<number,!proto.poolrpc.MatchedMarketSnapshot>} */ (
      jspb.Message.getMapField(this, 10, opt_noLazyCreate,
      proto.poolrpc.MatchedMarketSnapshot));
};


proto.poolrpc.BatchSnapshotResponse.prototype.clearMatchedMarketsMap = function() {
  this.getMatchedMarketsMap().clear();
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.ServerNodeRatingRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.poolrpc.ServerNodeRatingRequest.repeatedFields_, null);
};
goog.inherits(proto.poolrpc.ServerNodeRatingRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ServerNodeRatingRequest.displayName = 'proto.poolrpc.ServerNodeRatingRequest';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.poolrpc.ServerNodeRatingRequest.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.ServerNodeRatingRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ServerNodeRatingRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ServerNodeRatingRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerNodeRatingRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    nodePubkeysList: msg.getNodePubkeysList_asB64()
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.ServerNodeRatingRequest}
 */
proto.poolrpc.ServerNodeRatingRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ServerNodeRatingRequest;
  return proto.poolrpc.ServerNodeRatingRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ServerNodeRatingRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ServerNodeRatingRequest}
 */
proto.poolrpc.ServerNodeRatingRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.addNodePubkeys(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerNodeRatingRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ServerNodeRatingRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ServerNodeRatingRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerNodeRatingRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getNodePubkeysList_asU8();
  if (f.length > 0) {
    writer.writeRepeatedBytes(
      1,
      f
    );
  }
};


/**
 * repeated bytes node_pubkeys = 1;
 * @return {!(Array<!Uint8Array>|Array<string>)}
 */
proto.poolrpc.ServerNodeRatingRequest.prototype.getNodePubkeysList = function() {
  return /** @type {!(Array<!Uint8Array>|Array<string>)} */ (jspb.Message.getRepeatedField(this, 1));
};


/**
 * repeated bytes node_pubkeys = 1;
 * This is a type-conversion wrapper around `getNodePubkeysList()`
 * @return {!Array<string>}
 */
proto.poolrpc.ServerNodeRatingRequest.prototype.getNodePubkeysList_asB64 = function() {
  return /** @type {!Array<string>} */ (jspb.Message.bytesListAsB64(
      this.getNodePubkeysList()));
};


/**
 * repeated bytes node_pubkeys = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getNodePubkeysList()`
 * @return {!Array<!Uint8Array>}
 */
proto.poolrpc.ServerNodeRatingRequest.prototype.getNodePubkeysList_asU8 = function() {
  return /** @type {!Array<!Uint8Array>} */ (jspb.Message.bytesListAsU8(
      this.getNodePubkeysList()));
};


/** @param {!(Array<!Uint8Array>|Array<string>)} value */
proto.poolrpc.ServerNodeRatingRequest.prototype.setNodePubkeysList = function(value) {
  jspb.Message.setField(this, 1, value || []);
};


/**
 * @param {!(string|Uint8Array)} value
 * @param {number=} opt_index
 */
proto.poolrpc.ServerNodeRatingRequest.prototype.addNodePubkeys = function(value, opt_index) {
  jspb.Message.addToRepeatedField(this, 1, value, opt_index);
};


proto.poolrpc.ServerNodeRatingRequest.prototype.clearNodePubkeysList = function() {
  this.setNodePubkeysList([]);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.NodeRating = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.NodeRating, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.NodeRating.displayName = 'proto.poolrpc.NodeRating';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.NodeRating.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.NodeRating.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.NodeRating} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.NodeRating.toObject = function(includeInstance, msg) {
  var f, obj = {
    nodePubkey: msg.getNodePubkey_asB64(),
    nodeTier: jspb.Message.getFieldWithDefault(msg, 2, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.NodeRating}
 */
proto.poolrpc.NodeRating.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.NodeRating;
  return proto.poolrpc.NodeRating.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.NodeRating} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.NodeRating}
 */
proto.poolrpc.NodeRating.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setNodePubkey(value);
      break;
    case 2:
      var value = /** @type {!proto.poolrpc.NodeTier} */ (reader.readEnum());
      msg.setNodeTier(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.NodeRating.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.NodeRating.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.NodeRating} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.NodeRating.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getNodePubkey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getNodeTier();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
};


/**
 * optional bytes node_pubkey = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.NodeRating.prototype.getNodePubkey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes node_pubkey = 1;
 * This is a type-conversion wrapper around `getNodePubkey()`
 * @return {string}
 */
proto.poolrpc.NodeRating.prototype.getNodePubkey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getNodePubkey()));
};


/**
 * optional bytes node_pubkey = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getNodePubkey()`
 * @return {!Uint8Array}
 */
proto.poolrpc.NodeRating.prototype.getNodePubkey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getNodePubkey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.NodeRating.prototype.setNodePubkey = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional NodeTier node_tier = 2;
 * @return {!proto.poolrpc.NodeTier}
 */
proto.poolrpc.NodeRating.prototype.getNodeTier = function() {
  return /** @type {!proto.poolrpc.NodeTier} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {!proto.poolrpc.NodeTier} value */
proto.poolrpc.NodeRating.prototype.setNodeTier = function(value) {
  jspb.Message.setProto3EnumField(this, 2, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.ServerNodeRatingResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.poolrpc.ServerNodeRatingResponse.repeatedFields_, null);
};
goog.inherits(proto.poolrpc.ServerNodeRatingResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ServerNodeRatingResponse.displayName = 'proto.poolrpc.ServerNodeRatingResponse';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.poolrpc.ServerNodeRatingResponse.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.ServerNodeRatingResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ServerNodeRatingResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ServerNodeRatingResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerNodeRatingResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    nodeRatingsList: jspb.Message.toObjectList(msg.getNodeRatingsList(),
    proto.poolrpc.NodeRating.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.ServerNodeRatingResponse}
 */
proto.poolrpc.ServerNodeRatingResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ServerNodeRatingResponse;
  return proto.poolrpc.ServerNodeRatingResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ServerNodeRatingResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ServerNodeRatingResponse}
 */
proto.poolrpc.ServerNodeRatingResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.NodeRating;
      reader.readMessage(value,proto.poolrpc.NodeRating.deserializeBinaryFromReader);
      msg.addNodeRatings(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.ServerNodeRatingResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ServerNodeRatingResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ServerNodeRatingResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ServerNodeRatingResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getNodeRatingsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.poolrpc.NodeRating.serializeBinaryToWriter
    );
  }
};


/**
 * repeated NodeRating node_ratings = 1;
 * @return {!Array<!proto.poolrpc.NodeRating>}
 */
proto.poolrpc.ServerNodeRatingResponse.prototype.getNodeRatingsList = function() {
  return /** @type{!Array<!proto.poolrpc.NodeRating>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.NodeRating, 1));
};


/** @param {!Array<!proto.poolrpc.NodeRating>} value */
proto.poolrpc.ServerNodeRatingResponse.prototype.setNodeRatingsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.poolrpc.NodeRating=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.NodeRating}
 */
proto.poolrpc.ServerNodeRatingResponse.prototype.addNodeRatings = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.poolrpc.NodeRating, opt_index);
};


proto.poolrpc.ServerNodeRatingResponse.prototype.clearNodeRatingsList = function() {
  this.setNodeRatingsList([]);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.BatchSnapshotsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.BatchSnapshotsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.BatchSnapshotsRequest.displayName = 'proto.poolrpc.BatchSnapshotsRequest';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.BatchSnapshotsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.BatchSnapshotsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.BatchSnapshotsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.BatchSnapshotsRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    startBatchId: msg.getStartBatchId_asB64(),
    numBatchesBack: jspb.Message.getFieldWithDefault(msg, 2, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.BatchSnapshotsRequest}
 */
proto.poolrpc.BatchSnapshotsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.BatchSnapshotsRequest;
  return proto.poolrpc.BatchSnapshotsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.BatchSnapshotsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.BatchSnapshotsRequest}
 */
proto.poolrpc.BatchSnapshotsRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setStartBatchId(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setNumBatchesBack(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.BatchSnapshotsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.BatchSnapshotsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.BatchSnapshotsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.BatchSnapshotsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getStartBatchId_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getNumBatchesBack();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
};


/**
 * optional bytes start_batch_id = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.BatchSnapshotsRequest.prototype.getStartBatchId = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes start_batch_id = 1;
 * This is a type-conversion wrapper around `getStartBatchId()`
 * @return {string}
 */
proto.poolrpc.BatchSnapshotsRequest.prototype.getStartBatchId_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getStartBatchId()));
};


/**
 * optional bytes start_batch_id = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getStartBatchId()`
 * @return {!Uint8Array}
 */
proto.poolrpc.BatchSnapshotsRequest.prototype.getStartBatchId_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getStartBatchId()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.BatchSnapshotsRequest.prototype.setStartBatchId = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional uint32 num_batches_back = 2;
 * @return {number}
 */
proto.poolrpc.BatchSnapshotsRequest.prototype.getNumBatchesBack = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.BatchSnapshotsRequest.prototype.setNumBatchesBack = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.BatchSnapshotsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.poolrpc.BatchSnapshotsResponse.repeatedFields_, null);
};
goog.inherits(proto.poolrpc.BatchSnapshotsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.BatchSnapshotsResponse.displayName = 'proto.poolrpc.BatchSnapshotsResponse';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.poolrpc.BatchSnapshotsResponse.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.BatchSnapshotsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.BatchSnapshotsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.BatchSnapshotsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.BatchSnapshotsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    batchesList: jspb.Message.toObjectList(msg.getBatchesList(),
    proto.poolrpc.BatchSnapshotResponse.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.BatchSnapshotsResponse}
 */
proto.poolrpc.BatchSnapshotsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.BatchSnapshotsResponse;
  return proto.poolrpc.BatchSnapshotsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.BatchSnapshotsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.BatchSnapshotsResponse}
 */
proto.poolrpc.BatchSnapshotsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.BatchSnapshotResponse;
      reader.readMessage(value,proto.poolrpc.BatchSnapshotResponse.deserializeBinaryFromReader);
      msg.addBatches(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.BatchSnapshotsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.BatchSnapshotsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.BatchSnapshotsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.BatchSnapshotsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBatchesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.poolrpc.BatchSnapshotResponse.serializeBinaryToWriter
    );
  }
};


/**
 * repeated BatchSnapshotResponse batches = 1;
 * @return {!Array<!proto.poolrpc.BatchSnapshotResponse>}
 */
proto.poolrpc.BatchSnapshotsResponse.prototype.getBatchesList = function() {
  return /** @type{!Array<!proto.poolrpc.BatchSnapshotResponse>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.BatchSnapshotResponse, 1));
};


/** @param {!Array<!proto.poolrpc.BatchSnapshotResponse>} value */
proto.poolrpc.BatchSnapshotsResponse.prototype.setBatchesList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.poolrpc.BatchSnapshotResponse=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.BatchSnapshotResponse}
 */
proto.poolrpc.BatchSnapshotsResponse.prototype.addBatches = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.poolrpc.BatchSnapshotResponse, opt_index);
};


proto.poolrpc.BatchSnapshotsResponse.prototype.clearBatchesList = function() {
  this.setBatchesList([]);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.MarketInfoRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.MarketInfoRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.MarketInfoRequest.displayName = 'proto.poolrpc.MarketInfoRequest';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.MarketInfoRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.MarketInfoRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.MarketInfoRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.MarketInfoRequest.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.MarketInfoRequest}
 */
proto.poolrpc.MarketInfoRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.MarketInfoRequest;
  return proto.poolrpc.MarketInfoRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.MarketInfoRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.MarketInfoRequest}
 */
proto.poolrpc.MarketInfoRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.MarketInfoRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.MarketInfoRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.MarketInfoRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.MarketInfoRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.MarketInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.poolrpc.MarketInfo.repeatedFields_, null);
};
goog.inherits(proto.poolrpc.MarketInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.MarketInfo.displayName = 'proto.poolrpc.MarketInfo';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.poolrpc.MarketInfo.repeatedFields_ = [1,2,3,4];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.MarketInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.MarketInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.MarketInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.MarketInfo.toObject = function(includeInstance, msg) {
  var f, obj = {
    numAsksList: jspb.Message.toObjectList(msg.getNumAsksList(),
    proto.poolrpc.MarketInfo.TierValue.toObject, includeInstance),
    numBidsList: jspb.Message.toObjectList(msg.getNumBidsList(),
    proto.poolrpc.MarketInfo.TierValue.toObject, includeInstance),
    askOpenInterestUnitsList: jspb.Message.toObjectList(msg.getAskOpenInterestUnitsList(),
    proto.poolrpc.MarketInfo.TierValue.toObject, includeInstance),
    bidOpenInterestUnitsList: jspb.Message.toObjectList(msg.getBidOpenInterestUnitsList(),
    proto.poolrpc.MarketInfo.TierValue.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.MarketInfo}
 */
proto.poolrpc.MarketInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.MarketInfo;
  return proto.poolrpc.MarketInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.MarketInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.MarketInfo}
 */
proto.poolrpc.MarketInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.MarketInfo.TierValue;
      reader.readMessage(value,proto.poolrpc.MarketInfo.TierValue.deserializeBinaryFromReader);
      msg.addNumAsks(value);
      break;
    case 2:
      var value = new proto.poolrpc.MarketInfo.TierValue;
      reader.readMessage(value,proto.poolrpc.MarketInfo.TierValue.deserializeBinaryFromReader);
      msg.addNumBids(value);
      break;
    case 3:
      var value = new proto.poolrpc.MarketInfo.TierValue;
      reader.readMessage(value,proto.poolrpc.MarketInfo.TierValue.deserializeBinaryFromReader);
      msg.addAskOpenInterestUnits(value);
      break;
    case 4:
      var value = new proto.poolrpc.MarketInfo.TierValue;
      reader.readMessage(value,proto.poolrpc.MarketInfo.TierValue.deserializeBinaryFromReader);
      msg.addBidOpenInterestUnits(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.MarketInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.MarketInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.MarketInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.MarketInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getNumAsksList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.poolrpc.MarketInfo.TierValue.serializeBinaryToWriter
    );
  }
  f = message.getNumBidsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      proto.poolrpc.MarketInfo.TierValue.serializeBinaryToWriter
    );
  }
  f = message.getAskOpenInterestUnitsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.poolrpc.MarketInfo.TierValue.serializeBinaryToWriter
    );
  }
  f = message.getBidOpenInterestUnitsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      4,
      f,
      proto.poolrpc.MarketInfo.TierValue.serializeBinaryToWriter
    );
  }
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.MarketInfo.TierValue = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.MarketInfo.TierValue, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.MarketInfo.TierValue.displayName = 'proto.poolrpc.MarketInfo.TierValue';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.MarketInfo.TierValue.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.MarketInfo.TierValue.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.MarketInfo.TierValue} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.MarketInfo.TierValue.toObject = function(includeInstance, msg) {
  var f, obj = {
    tier: jspb.Message.getFieldWithDefault(msg, 1, 0),
    value: jspb.Message.getFieldWithDefault(msg, 2, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.MarketInfo.TierValue}
 */
proto.poolrpc.MarketInfo.TierValue.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.MarketInfo.TierValue;
  return proto.poolrpc.MarketInfo.TierValue.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.MarketInfo.TierValue} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.MarketInfo.TierValue}
 */
proto.poolrpc.MarketInfo.TierValue.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.poolrpc.NodeTier} */ (reader.readEnum());
      msg.setTier(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setValue(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.MarketInfo.TierValue.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.MarketInfo.TierValue.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.MarketInfo.TierValue} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.MarketInfo.TierValue.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTier();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getValue();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
};


/**
 * optional NodeTier tier = 1;
 * @return {!proto.poolrpc.NodeTier}
 */
proto.poolrpc.MarketInfo.TierValue.prototype.getTier = function() {
  return /** @type {!proto.poolrpc.NodeTier} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/** @param {!proto.poolrpc.NodeTier} value */
proto.poolrpc.MarketInfo.TierValue.prototype.setTier = function(value) {
  jspb.Message.setProto3EnumField(this, 1, value);
};


/**
 * optional uint32 value = 2;
 * @return {number}
 */
proto.poolrpc.MarketInfo.TierValue.prototype.getValue = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.MarketInfo.TierValue.prototype.setValue = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * repeated TierValue num_asks = 1;
 * @return {!Array<!proto.poolrpc.MarketInfo.TierValue>}
 */
proto.poolrpc.MarketInfo.prototype.getNumAsksList = function() {
  return /** @type{!Array<!proto.poolrpc.MarketInfo.TierValue>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.MarketInfo.TierValue, 1));
};


/** @param {!Array<!proto.poolrpc.MarketInfo.TierValue>} value */
proto.poolrpc.MarketInfo.prototype.setNumAsksList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.poolrpc.MarketInfo.TierValue=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.MarketInfo.TierValue}
 */
proto.poolrpc.MarketInfo.prototype.addNumAsks = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.poolrpc.MarketInfo.TierValue, opt_index);
};


proto.poolrpc.MarketInfo.prototype.clearNumAsksList = function() {
  this.setNumAsksList([]);
};


/**
 * repeated TierValue num_bids = 2;
 * @return {!Array<!proto.poolrpc.MarketInfo.TierValue>}
 */
proto.poolrpc.MarketInfo.prototype.getNumBidsList = function() {
  return /** @type{!Array<!proto.poolrpc.MarketInfo.TierValue>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.MarketInfo.TierValue, 2));
};


/** @param {!Array<!proto.poolrpc.MarketInfo.TierValue>} value */
proto.poolrpc.MarketInfo.prototype.setNumBidsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.poolrpc.MarketInfo.TierValue=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.MarketInfo.TierValue}
 */
proto.poolrpc.MarketInfo.prototype.addNumBids = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.poolrpc.MarketInfo.TierValue, opt_index);
};


proto.poolrpc.MarketInfo.prototype.clearNumBidsList = function() {
  this.setNumBidsList([]);
};


/**
 * repeated TierValue ask_open_interest_units = 3;
 * @return {!Array<!proto.poolrpc.MarketInfo.TierValue>}
 */
proto.poolrpc.MarketInfo.prototype.getAskOpenInterestUnitsList = function() {
  return /** @type{!Array<!proto.poolrpc.MarketInfo.TierValue>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.MarketInfo.TierValue, 3));
};


/** @param {!Array<!proto.poolrpc.MarketInfo.TierValue>} value */
proto.poolrpc.MarketInfo.prototype.setAskOpenInterestUnitsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.poolrpc.MarketInfo.TierValue=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.MarketInfo.TierValue}
 */
proto.poolrpc.MarketInfo.prototype.addAskOpenInterestUnits = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.poolrpc.MarketInfo.TierValue, opt_index);
};


proto.poolrpc.MarketInfo.prototype.clearAskOpenInterestUnitsList = function() {
  this.setAskOpenInterestUnitsList([]);
};


/**
 * repeated TierValue bid_open_interest_units = 4;
 * @return {!Array<!proto.poolrpc.MarketInfo.TierValue>}
 */
proto.poolrpc.MarketInfo.prototype.getBidOpenInterestUnitsList = function() {
  return /** @type{!Array<!proto.poolrpc.MarketInfo.TierValue>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.MarketInfo.TierValue, 4));
};


/** @param {!Array<!proto.poolrpc.MarketInfo.TierValue>} value */
proto.poolrpc.MarketInfo.prototype.setBidOpenInterestUnitsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 4, value);
};


/**
 * @param {!proto.poolrpc.MarketInfo.TierValue=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.MarketInfo.TierValue}
 */
proto.poolrpc.MarketInfo.prototype.addBidOpenInterestUnits = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 4, opt_value, proto.poolrpc.MarketInfo.TierValue, opt_index);
};


proto.poolrpc.MarketInfo.prototype.clearBidOpenInterestUnitsList = function() {
  this.setBidOpenInterestUnitsList([]);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.poolrpc.MarketInfoResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.MarketInfoResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.MarketInfoResponse.displayName = 'proto.poolrpc.MarketInfoResponse';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.poolrpc.MarketInfoResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.MarketInfoResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.MarketInfoResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.MarketInfoResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    marketsMap: (f = msg.getMarketsMap()) ? f.toObject(includeInstance, proto.poolrpc.MarketInfo.toObject) : []
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.poolrpc.MarketInfoResponse}
 */
proto.poolrpc.MarketInfoResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.MarketInfoResponse;
  return proto.poolrpc.MarketInfoResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.MarketInfoResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.MarketInfoResponse}
 */
proto.poolrpc.MarketInfoResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = msg.getMarketsMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readUint32, jspb.BinaryReader.prototype.readMessage, proto.poolrpc.MarketInfo.deserializeBinaryFromReader, 0);
         });
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.poolrpc.MarketInfoResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.MarketInfoResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.MarketInfoResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.MarketInfoResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getMarketsMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(1, writer, jspb.BinaryWriter.prototype.writeUint32, jspb.BinaryWriter.prototype.writeMessage, proto.poolrpc.MarketInfo.serializeBinaryToWriter);
  }
};


/**
 * map<uint32, MarketInfo> markets = 1;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<number,!proto.poolrpc.MarketInfo>}
 */
proto.poolrpc.MarketInfoResponse.prototype.getMarketsMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<number,!proto.poolrpc.MarketInfo>} */ (
      jspb.Message.getMapField(this, 1, opt_noLazyCreate,
      proto.poolrpc.MarketInfo));
};


proto.poolrpc.MarketInfoResponse.prototype.clearMarketsMap = function() {
  this.getMarketsMap().clear();
};


/**
 * @enum {number}
 */
proto.poolrpc.ChannelType = {
  TWEAKLESS: 0,
  ANCHORS: 1,
  SCRIPT_ENFORCED_LEASE: 2
};

/**
 * @enum {number}
 */
proto.poolrpc.AuctionAccountState = {
  STATE_PENDING_OPEN: 0,
  STATE_OPEN: 1,
  STATE_EXPIRED: 2,
  STATE_PENDING_UPDATE: 3,
  STATE_CLOSED: 4,
  STATE_PENDING_BATCH: 5,
  STATE_EXPIRED_PENDING_UPDATE: 6
};

/**
 * @enum {number}
 */
proto.poolrpc.OrderChannelType = {
  ORDER_CHANNEL_TYPE_UNKNOWN: 0,
  ORDER_CHANNEL_TYPE_PEER_DEPENDENT: 1,
  ORDER_CHANNEL_TYPE_SCRIPT_ENFORCED: 2
};

/**
 * @enum {number}
 */
proto.poolrpc.AuctionType = {
  AUCTION_TYPE_BTC_INBOUND_LIQUIDITY: 0,
  AUCTION_TYPE_BTC_OUTBOUND_LIQUIDITY: 1
};

/**
 * @enum {number}
 */
proto.poolrpc.NodeTier = {
  TIER_DEFAULT: 0,
  TIER_0: 1,
  TIER_1: 2
};

/**
 * @enum {number}
 */
proto.poolrpc.ChannelAnnouncementConstraints = {
  ANNOUNCEMENT_NO_PREFERENCE: 0,
  ONLY_ANNOUNCED: 1,
  ONLY_UNANNOUNCED: 2
};

/**
 * @enum {number}
 */
proto.poolrpc.ChannelConfirmationConstraints = {
  CONFIRMATION_NO_PREFERENCE: 0,
  ONLY_CONFIRMED: 1,
  ONLY_ZEROCONF: 2
};

/**
 * @enum {number}
 */
proto.poolrpc.OrderState = {
  ORDER_SUBMITTED: 0,
  ORDER_CLEARED: 1,
  ORDER_PARTIALLY_FILLED: 2,
  ORDER_EXECUTED: 3,
  ORDER_CANCELED: 4,
  ORDER_EXPIRED: 5,
  ORDER_FAILED: 6
};

/**
 * @enum {number}
 */
proto.poolrpc.DurationBucketState = {
  NO_MARKET: 0,
  MARKET_CLOSED: 1,
  ACCEPTING_ORDERS: 2,
  MARKET_OPEN: 3
};

goog.object.extend(exports, proto.poolrpc);
