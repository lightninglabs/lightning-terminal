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

var auctioneerrpc_auctioneer_pb = require('./auctioneerrpc/auctioneer_pb.js');
goog.exportSymbol('proto.poolrpc.Account', null, global);
goog.exportSymbol('proto.poolrpc.AccountModificationFee', null, global);
goog.exportSymbol('proto.poolrpc.AccountModificationFeesRequest', null, global);
goog.exportSymbol('proto.poolrpc.AccountModificationFeesResponse', null, global);
goog.exportSymbol('proto.poolrpc.AccountState', null, global);
goog.exportSymbol('proto.poolrpc.AccountVersion', null, global);
goog.exportSymbol('proto.poolrpc.Ask', null, global);
goog.exportSymbol('proto.poolrpc.AuctionFeeRequest', null, global);
goog.exportSymbol('proto.poolrpc.AuctionFeeResponse', null, global);
goog.exportSymbol('proto.poolrpc.Bid', null, global);
goog.exportSymbol('proto.poolrpc.BumpAccountFeeRequest', null, global);
goog.exportSymbol('proto.poolrpc.BumpAccountFeeResponse', null, global);
goog.exportSymbol('proto.poolrpc.CancelOrderRequest', null, global);
goog.exportSymbol('proto.poolrpc.CancelOrderResponse', null, global);
goog.exportSymbol('proto.poolrpc.CancelSidecarRequest', null, global);
goog.exportSymbol('proto.poolrpc.CancelSidecarResponse', null, global);
goog.exportSymbol('proto.poolrpc.CloseAccountRequest', null, global);
goog.exportSymbol('proto.poolrpc.CloseAccountResponse', null, global);
goog.exportSymbol('proto.poolrpc.DecodedSidecarTicket', null, global);
goog.exportSymbol('proto.poolrpc.DepositAccountRequest', null, global);
goog.exportSymbol('proto.poolrpc.DepositAccountResponse', null, global);
goog.exportSymbol('proto.poolrpc.ExpectSidecarChannelRequest', null, global);
goog.exportSymbol('proto.poolrpc.ExpectSidecarChannelResponse', null, global);
goog.exportSymbol('proto.poolrpc.GetInfoRequest', null, global);
goog.exportSymbol('proto.poolrpc.GetInfoResponse', null, global);
goog.exportSymbol('proto.poolrpc.InitAccountRequest', null, global);
goog.exportSymbol('proto.poolrpc.Lease', null, global);
goog.exportSymbol('proto.poolrpc.LeaseDurationRequest', null, global);
goog.exportSymbol('proto.poolrpc.LeaseDurationResponse', null, global);
goog.exportSymbol('proto.poolrpc.LeasesRequest', null, global);
goog.exportSymbol('proto.poolrpc.LeasesResponse', null, global);
goog.exportSymbol('proto.poolrpc.ListAccountsRequest', null, global);
goog.exportSymbol('proto.poolrpc.ListAccountsResponse', null, global);
goog.exportSymbol('proto.poolrpc.ListOfAccountModificationFees', null, global);
goog.exportSymbol('proto.poolrpc.ListOrdersRequest', null, global);
goog.exportSymbol('proto.poolrpc.ListOrdersResponse', null, global);
goog.exportSymbol('proto.poolrpc.ListSidecarsRequest', null, global);
goog.exportSymbol('proto.poolrpc.ListSidecarsResponse', null, global);
goog.exportSymbol('proto.poolrpc.LsatToken', null, global);
goog.exportSymbol('proto.poolrpc.MatchEvent', null, global);
goog.exportSymbol('proto.poolrpc.MatchRejectReason', null, global);
goog.exportSymbol('proto.poolrpc.MatchState', null, global);
goog.exportSymbol('proto.poolrpc.NextBatchInfoRequest', null, global);
goog.exportSymbol('proto.poolrpc.NextBatchInfoResponse', null, global);
goog.exportSymbol('proto.poolrpc.NodeRatingRequest', null, global);
goog.exportSymbol('proto.poolrpc.NodeRatingResponse', null, global);
goog.exportSymbol('proto.poolrpc.OfferSidecarRequest', null, global);
goog.exportSymbol('proto.poolrpc.Order', null, global);
goog.exportSymbol('proto.poolrpc.OrderEvent', null, global);
goog.exportSymbol('proto.poolrpc.Output', null, global);
goog.exportSymbol('proto.poolrpc.OutputWithFee', null, global);
goog.exportSymbol('proto.poolrpc.OutputsWithImplicitFee', null, global);
goog.exportSymbol('proto.poolrpc.QuoteAccountRequest', null, global);
goog.exportSymbol('proto.poolrpc.QuoteAccountResponse', null, global);
goog.exportSymbol('proto.poolrpc.QuoteOrderRequest', null, global);
goog.exportSymbol('proto.poolrpc.QuoteOrderResponse', null, global);
goog.exportSymbol('proto.poolrpc.RecoverAccountsRequest', null, global);
goog.exportSymbol('proto.poolrpc.RecoverAccountsResponse', null, global);
goog.exportSymbol('proto.poolrpc.RegisterSidecarRequest', null, global);
goog.exportSymbol('proto.poolrpc.RenewAccountRequest', null, global);
goog.exportSymbol('proto.poolrpc.RenewAccountResponse', null, global);
goog.exportSymbol('proto.poolrpc.SidecarTicket', null, global);
goog.exportSymbol('proto.poolrpc.StopDaemonRequest', null, global);
goog.exportSymbol('proto.poolrpc.StopDaemonResponse', null, global);
goog.exportSymbol('proto.poolrpc.SubmitOrderRequest', null, global);
goog.exportSymbol('proto.poolrpc.SubmitOrderResponse', null, global);
goog.exportSymbol('proto.poolrpc.TokensRequest', null, global);
goog.exportSymbol('proto.poolrpc.TokensResponse', null, global);
goog.exportSymbol('proto.poolrpc.UpdatedEvent', null, global);
goog.exportSymbol('proto.poolrpc.WithdrawAccountRequest', null, global);
goog.exportSymbol('proto.poolrpc.WithdrawAccountResponse', null, global);

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
proto.poolrpc.InitAccountRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.poolrpc.InitAccountRequest.oneofGroups_);
};
goog.inherits(proto.poolrpc.InitAccountRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.InitAccountRequest.displayName = 'proto.poolrpc.InitAccountRequest';
}
/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.poolrpc.InitAccountRequest.oneofGroups_ = [[2,3],[4,6]];

/**
 * @enum {number}
 */
proto.poolrpc.InitAccountRequest.AccountExpiryCase = {
  ACCOUNT_EXPIRY_NOT_SET: 0,
  ABSOLUTE_HEIGHT: 2,
  RELATIVE_HEIGHT: 3
};

/**
 * @return {proto.poolrpc.InitAccountRequest.AccountExpiryCase}
 */
proto.poolrpc.InitAccountRequest.prototype.getAccountExpiryCase = function() {
  return /** @type {proto.poolrpc.InitAccountRequest.AccountExpiryCase} */(jspb.Message.computeOneofCase(this, proto.poolrpc.InitAccountRequest.oneofGroups_[0]));
};

/**
 * @enum {number}
 */
proto.poolrpc.InitAccountRequest.FeesCase = {
  FEES_NOT_SET: 0,
  CONF_TARGET: 4,
  FEE_RATE_SAT_PER_KW: 6
};

/**
 * @return {proto.poolrpc.InitAccountRequest.FeesCase}
 */
proto.poolrpc.InitAccountRequest.prototype.getFeesCase = function() {
  return /** @type {proto.poolrpc.InitAccountRequest.FeesCase} */(jspb.Message.computeOneofCase(this, proto.poolrpc.InitAccountRequest.oneofGroups_[1]));
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
proto.poolrpc.InitAccountRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.InitAccountRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.InitAccountRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.InitAccountRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    accountValue: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    absoluteHeight: jspb.Message.getFieldWithDefault(msg, 2, 0),
    relativeHeight: jspb.Message.getFieldWithDefault(msg, 3, 0),
    confTarget: jspb.Message.getFieldWithDefault(msg, 4, 0),
    feeRateSatPerKw: jspb.Message.getFieldWithDefault(msg, 6, "0"),
    initiator: jspb.Message.getFieldWithDefault(msg, 5, ""),
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
 * @return {!proto.poolrpc.InitAccountRequest}
 */
proto.poolrpc.InitAccountRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.InitAccountRequest;
  return proto.poolrpc.InitAccountRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.InitAccountRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.InitAccountRequest}
 */
proto.poolrpc.InitAccountRequest.deserializeBinaryFromReader = function(msg, reader) {
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
      msg.setAbsoluteHeight(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setRelativeHeight(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setConfTarget(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setFeeRateSatPerKw(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setInitiator(value);
      break;
    case 7:
      var value = /** @type {!proto.poolrpc.AccountVersion} */ (reader.readEnum());
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
proto.poolrpc.InitAccountRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.InitAccountRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.InitAccountRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.InitAccountRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAccountValue();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      1,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 2));
  if (f != null) {
    writer.writeUint32(
      2,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeUint32(
      3,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 4));
  if (f != null) {
    writer.writeUint32(
      4,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 6));
  if (f != null) {
    writer.writeUint64String(
      6,
      f
    );
  }
  f = message.getInitiator();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getVersion();
  if (f !== 0.0) {
    writer.writeEnum(
      7,
      f
    );
  }
};


/**
 * optional uint64 account_value = 1;
 * @return {string}
 */
proto.poolrpc.InitAccountRequest.prototype.getAccountValue = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/** @param {string} value */
proto.poolrpc.InitAccountRequest.prototype.setAccountValue = function(value) {
  jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional uint32 absolute_height = 2;
 * @return {number}
 */
proto.poolrpc.InitAccountRequest.prototype.getAbsoluteHeight = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.InitAccountRequest.prototype.setAbsoluteHeight = function(value) {
  jspb.Message.setOneofField(this, 2, proto.poolrpc.InitAccountRequest.oneofGroups_[0], value);
};


proto.poolrpc.InitAccountRequest.prototype.clearAbsoluteHeight = function() {
  jspb.Message.setOneofField(this, 2, proto.poolrpc.InitAccountRequest.oneofGroups_[0], undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.InitAccountRequest.prototype.hasAbsoluteHeight = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional uint32 relative_height = 3;
 * @return {number}
 */
proto.poolrpc.InitAccountRequest.prototype.getRelativeHeight = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {number} value */
proto.poolrpc.InitAccountRequest.prototype.setRelativeHeight = function(value) {
  jspb.Message.setOneofField(this, 3, proto.poolrpc.InitAccountRequest.oneofGroups_[0], value);
};


proto.poolrpc.InitAccountRequest.prototype.clearRelativeHeight = function() {
  jspb.Message.setOneofField(this, 3, proto.poolrpc.InitAccountRequest.oneofGroups_[0], undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.InitAccountRequest.prototype.hasRelativeHeight = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional uint32 conf_target = 4;
 * @return {number}
 */
proto.poolrpc.InitAccountRequest.prototype.getConfTarget = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {number} value */
proto.poolrpc.InitAccountRequest.prototype.setConfTarget = function(value) {
  jspb.Message.setOneofField(this, 4, proto.poolrpc.InitAccountRequest.oneofGroups_[1], value);
};


proto.poolrpc.InitAccountRequest.prototype.clearConfTarget = function() {
  jspb.Message.setOneofField(this, 4, proto.poolrpc.InitAccountRequest.oneofGroups_[1], undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.InitAccountRequest.prototype.hasConfTarget = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional uint64 fee_rate_sat_per_kw = 6;
 * @return {string}
 */
proto.poolrpc.InitAccountRequest.prototype.getFeeRateSatPerKw = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, "0"));
};


/** @param {string} value */
proto.poolrpc.InitAccountRequest.prototype.setFeeRateSatPerKw = function(value) {
  jspb.Message.setOneofField(this, 6, proto.poolrpc.InitAccountRequest.oneofGroups_[1], value);
};


proto.poolrpc.InitAccountRequest.prototype.clearFeeRateSatPerKw = function() {
  jspb.Message.setOneofField(this, 6, proto.poolrpc.InitAccountRequest.oneofGroups_[1], undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.InitAccountRequest.prototype.hasFeeRateSatPerKw = function() {
  return jspb.Message.getField(this, 6) != null;
};


/**
 * optional string initiator = 5;
 * @return {string}
 */
proto.poolrpc.InitAccountRequest.prototype.getInitiator = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/** @param {string} value */
proto.poolrpc.InitAccountRequest.prototype.setInitiator = function(value) {
  jspb.Message.setProto3StringField(this, 5, value);
};


/**
 * optional AccountVersion version = 7;
 * @return {!proto.poolrpc.AccountVersion}
 */
proto.poolrpc.InitAccountRequest.prototype.getVersion = function() {
  return /** @type {!proto.poolrpc.AccountVersion} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/** @param {!proto.poolrpc.AccountVersion} value */
proto.poolrpc.InitAccountRequest.prototype.setVersion = function(value) {
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
proto.poolrpc.QuoteAccountRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.poolrpc.QuoteAccountRequest.oneofGroups_);
};
goog.inherits(proto.poolrpc.QuoteAccountRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.QuoteAccountRequest.displayName = 'proto.poolrpc.QuoteAccountRequest';
}
/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.poolrpc.QuoteAccountRequest.oneofGroups_ = [[2]];

/**
 * @enum {number}
 */
proto.poolrpc.QuoteAccountRequest.FeesCase = {
  FEES_NOT_SET: 0,
  CONF_TARGET: 2
};

/**
 * @return {proto.poolrpc.QuoteAccountRequest.FeesCase}
 */
proto.poolrpc.QuoteAccountRequest.prototype.getFeesCase = function() {
  return /** @type {proto.poolrpc.QuoteAccountRequest.FeesCase} */(jspb.Message.computeOneofCase(this, proto.poolrpc.QuoteAccountRequest.oneofGroups_[0]));
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
proto.poolrpc.QuoteAccountRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.QuoteAccountRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.QuoteAccountRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.QuoteAccountRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    accountValue: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    confTarget: jspb.Message.getFieldWithDefault(msg, 2, 0)
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
 * @return {!proto.poolrpc.QuoteAccountRequest}
 */
proto.poolrpc.QuoteAccountRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.QuoteAccountRequest;
  return proto.poolrpc.QuoteAccountRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.QuoteAccountRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.QuoteAccountRequest}
 */
proto.poolrpc.QuoteAccountRequest.deserializeBinaryFromReader = function(msg, reader) {
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
      msg.setConfTarget(value);
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
proto.poolrpc.QuoteAccountRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.QuoteAccountRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.QuoteAccountRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.QuoteAccountRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAccountValue();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      1,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 2));
  if (f != null) {
    writer.writeUint32(
      2,
      f
    );
  }
};


/**
 * optional uint64 account_value = 1;
 * @return {string}
 */
proto.poolrpc.QuoteAccountRequest.prototype.getAccountValue = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/** @param {string} value */
proto.poolrpc.QuoteAccountRequest.prototype.setAccountValue = function(value) {
  jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional uint32 conf_target = 2;
 * @return {number}
 */
proto.poolrpc.QuoteAccountRequest.prototype.getConfTarget = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.QuoteAccountRequest.prototype.setConfTarget = function(value) {
  jspb.Message.setOneofField(this, 2, proto.poolrpc.QuoteAccountRequest.oneofGroups_[0], value);
};


proto.poolrpc.QuoteAccountRequest.prototype.clearConfTarget = function() {
  jspb.Message.setOneofField(this, 2, proto.poolrpc.QuoteAccountRequest.oneofGroups_[0], undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.QuoteAccountRequest.prototype.hasConfTarget = function() {
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
proto.poolrpc.QuoteAccountResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.QuoteAccountResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.QuoteAccountResponse.displayName = 'proto.poolrpc.QuoteAccountResponse';
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
proto.poolrpc.QuoteAccountResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.QuoteAccountResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.QuoteAccountResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.QuoteAccountResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    minerFeeRateSatPerKw: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    minerFeeTotal: jspb.Message.getFieldWithDefault(msg, 2, "0")
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
 * @return {!proto.poolrpc.QuoteAccountResponse}
 */
proto.poolrpc.QuoteAccountResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.QuoteAccountResponse;
  return proto.poolrpc.QuoteAccountResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.QuoteAccountResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.QuoteAccountResponse}
 */
proto.poolrpc.QuoteAccountResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setMinerFeeRateSatPerKw(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setMinerFeeTotal(value);
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
proto.poolrpc.QuoteAccountResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.QuoteAccountResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.QuoteAccountResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.QuoteAccountResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getMinerFeeRateSatPerKw();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      1,
      f
    );
  }
  f = message.getMinerFeeTotal();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      2,
      f
    );
  }
};


/**
 * optional uint64 miner_fee_rate_sat_per_kw = 1;
 * @return {string}
 */
proto.poolrpc.QuoteAccountResponse.prototype.getMinerFeeRateSatPerKw = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/** @param {string} value */
proto.poolrpc.QuoteAccountResponse.prototype.setMinerFeeRateSatPerKw = function(value) {
  jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional uint64 miner_fee_total = 2;
 * @return {string}
 */
proto.poolrpc.QuoteAccountResponse.prototype.getMinerFeeTotal = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, "0"));
};


/** @param {string} value */
proto.poolrpc.QuoteAccountResponse.prototype.setMinerFeeTotal = function(value) {
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
proto.poolrpc.ListAccountsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.ListAccountsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ListAccountsRequest.displayName = 'proto.poolrpc.ListAccountsRequest';
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
proto.poolrpc.ListAccountsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ListAccountsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ListAccountsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ListAccountsRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    activeOnly: jspb.Message.getFieldWithDefault(msg, 1, false)
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
 * @return {!proto.poolrpc.ListAccountsRequest}
 */
proto.poolrpc.ListAccountsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ListAccountsRequest;
  return proto.poolrpc.ListAccountsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ListAccountsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ListAccountsRequest}
 */
proto.poolrpc.ListAccountsRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setActiveOnly(value);
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
proto.poolrpc.ListAccountsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ListAccountsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ListAccountsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ListAccountsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getActiveOnly();
  if (f) {
    writer.writeBool(
      1,
      f
    );
  }
};


/**
 * optional bool active_only = 1;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.poolrpc.ListAccountsRequest.prototype.getActiveOnly = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 1, false));
};


/** @param {boolean} value */
proto.poolrpc.ListAccountsRequest.prototype.setActiveOnly = function(value) {
  jspb.Message.setProto3BooleanField(this, 1, value);
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
proto.poolrpc.ListAccountsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.poolrpc.ListAccountsResponse.repeatedFields_, null);
};
goog.inherits(proto.poolrpc.ListAccountsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ListAccountsResponse.displayName = 'proto.poolrpc.ListAccountsResponse';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.poolrpc.ListAccountsResponse.repeatedFields_ = [1];



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
proto.poolrpc.ListAccountsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ListAccountsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ListAccountsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ListAccountsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    accountsList: jspb.Message.toObjectList(msg.getAccountsList(),
    proto.poolrpc.Account.toObject, includeInstance)
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
 * @return {!proto.poolrpc.ListAccountsResponse}
 */
proto.poolrpc.ListAccountsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ListAccountsResponse;
  return proto.poolrpc.ListAccountsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ListAccountsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ListAccountsResponse}
 */
proto.poolrpc.ListAccountsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.Account;
      reader.readMessage(value,proto.poolrpc.Account.deserializeBinaryFromReader);
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
proto.poolrpc.ListAccountsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ListAccountsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ListAccountsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ListAccountsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAccountsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.poolrpc.Account.serializeBinaryToWriter
    );
  }
};


/**
 * repeated Account accounts = 1;
 * @return {!Array<!proto.poolrpc.Account>}
 */
proto.poolrpc.ListAccountsResponse.prototype.getAccountsList = function() {
  return /** @type{!Array<!proto.poolrpc.Account>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.Account, 1));
};


/** @param {!Array<!proto.poolrpc.Account>} value */
proto.poolrpc.ListAccountsResponse.prototype.setAccountsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.poolrpc.Account=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.Account}
 */
proto.poolrpc.ListAccountsResponse.prototype.addAccounts = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.poolrpc.Account, opt_index);
};


proto.poolrpc.ListAccountsResponse.prototype.clearAccountsList = function() {
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
proto.poolrpc.Output = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.Output, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.Output.displayName = 'proto.poolrpc.Output';
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
proto.poolrpc.Output.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.Output.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.Output} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.Output.toObject = function(includeInstance, msg) {
  var f, obj = {
    valueSat: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    address: jspb.Message.getFieldWithDefault(msg, 2, "")
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
 * @return {!proto.poolrpc.Output}
 */
proto.poolrpc.Output.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.Output;
  return proto.poolrpc.Output.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.Output} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.Output}
 */
proto.poolrpc.Output.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setValueSat(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setAddress(value);
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
proto.poolrpc.Output.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.Output.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.Output} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.Output.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getValueSat();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      1,
      f
    );
  }
  f = message.getAddress();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional uint64 value_sat = 1;
 * @return {string}
 */
proto.poolrpc.Output.prototype.getValueSat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/** @param {string} value */
proto.poolrpc.Output.prototype.setValueSat = function(value) {
  jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional string address = 2;
 * @return {string}
 */
proto.poolrpc.Output.prototype.getAddress = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/** @param {string} value */
proto.poolrpc.Output.prototype.setAddress = function(value) {
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
proto.poolrpc.OutputWithFee = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.poolrpc.OutputWithFee.oneofGroups_);
};
goog.inherits(proto.poolrpc.OutputWithFee, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.OutputWithFee.displayName = 'proto.poolrpc.OutputWithFee';
}
/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.poolrpc.OutputWithFee.oneofGroups_ = [[2,3]];

/**
 * @enum {number}
 */
proto.poolrpc.OutputWithFee.FeesCase = {
  FEES_NOT_SET: 0,
  CONF_TARGET: 2,
  FEE_RATE_SAT_PER_KW: 3
};

/**
 * @return {proto.poolrpc.OutputWithFee.FeesCase}
 */
proto.poolrpc.OutputWithFee.prototype.getFeesCase = function() {
  return /** @type {proto.poolrpc.OutputWithFee.FeesCase} */(jspb.Message.computeOneofCase(this, proto.poolrpc.OutputWithFee.oneofGroups_[0]));
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
proto.poolrpc.OutputWithFee.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.OutputWithFee.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.OutputWithFee} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.OutputWithFee.toObject = function(includeInstance, msg) {
  var f, obj = {
    address: jspb.Message.getFieldWithDefault(msg, 1, ""),
    confTarget: jspb.Message.getFieldWithDefault(msg, 2, 0),
    feeRateSatPerKw: jspb.Message.getFieldWithDefault(msg, 3, "0")
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
 * @return {!proto.poolrpc.OutputWithFee}
 */
proto.poolrpc.OutputWithFee.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.OutputWithFee;
  return proto.poolrpc.OutputWithFee.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.OutputWithFee} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.OutputWithFee}
 */
proto.poolrpc.OutputWithFee.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setAddress(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setConfTarget(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setFeeRateSatPerKw(value);
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
proto.poolrpc.OutputWithFee.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.OutputWithFee.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.OutputWithFee} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.OutputWithFee.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAddress();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 2));
  if (f != null) {
    writer.writeUint32(
      2,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeUint64String(
      3,
      f
    );
  }
};


/**
 * optional string address = 1;
 * @return {string}
 */
proto.poolrpc.OutputWithFee.prototype.getAddress = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/** @param {string} value */
proto.poolrpc.OutputWithFee.prototype.setAddress = function(value) {
  jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional uint32 conf_target = 2;
 * @return {number}
 */
proto.poolrpc.OutputWithFee.prototype.getConfTarget = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.OutputWithFee.prototype.setConfTarget = function(value) {
  jspb.Message.setOneofField(this, 2, proto.poolrpc.OutputWithFee.oneofGroups_[0], value);
};


proto.poolrpc.OutputWithFee.prototype.clearConfTarget = function() {
  jspb.Message.setOneofField(this, 2, proto.poolrpc.OutputWithFee.oneofGroups_[0], undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.OutputWithFee.prototype.hasConfTarget = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional uint64 fee_rate_sat_per_kw = 3;
 * @return {string}
 */
proto.poolrpc.OutputWithFee.prototype.getFeeRateSatPerKw = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, "0"));
};


/** @param {string} value */
proto.poolrpc.OutputWithFee.prototype.setFeeRateSatPerKw = function(value) {
  jspb.Message.setOneofField(this, 3, proto.poolrpc.OutputWithFee.oneofGroups_[0], value);
};


proto.poolrpc.OutputWithFee.prototype.clearFeeRateSatPerKw = function() {
  jspb.Message.setOneofField(this, 3, proto.poolrpc.OutputWithFee.oneofGroups_[0], undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.OutputWithFee.prototype.hasFeeRateSatPerKw = function() {
  return jspb.Message.getField(this, 3) != null;
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
proto.poolrpc.OutputsWithImplicitFee = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.poolrpc.OutputsWithImplicitFee.repeatedFields_, null);
};
goog.inherits(proto.poolrpc.OutputsWithImplicitFee, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.OutputsWithImplicitFee.displayName = 'proto.poolrpc.OutputsWithImplicitFee';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.poolrpc.OutputsWithImplicitFee.repeatedFields_ = [1];



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
proto.poolrpc.OutputsWithImplicitFee.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.OutputsWithImplicitFee.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.OutputsWithImplicitFee} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.OutputsWithImplicitFee.toObject = function(includeInstance, msg) {
  var f, obj = {
    outputsList: jspb.Message.toObjectList(msg.getOutputsList(),
    proto.poolrpc.Output.toObject, includeInstance)
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
 * @return {!proto.poolrpc.OutputsWithImplicitFee}
 */
proto.poolrpc.OutputsWithImplicitFee.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.OutputsWithImplicitFee;
  return proto.poolrpc.OutputsWithImplicitFee.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.OutputsWithImplicitFee} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.OutputsWithImplicitFee}
 */
proto.poolrpc.OutputsWithImplicitFee.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.Output;
      reader.readMessage(value,proto.poolrpc.Output.deserializeBinaryFromReader);
      msg.addOutputs(value);
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
proto.poolrpc.OutputsWithImplicitFee.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.OutputsWithImplicitFee.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.OutputsWithImplicitFee} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.OutputsWithImplicitFee.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getOutputsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.poolrpc.Output.serializeBinaryToWriter
    );
  }
};


/**
 * repeated Output outputs = 1;
 * @return {!Array<!proto.poolrpc.Output>}
 */
proto.poolrpc.OutputsWithImplicitFee.prototype.getOutputsList = function() {
  return /** @type{!Array<!proto.poolrpc.Output>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.Output, 1));
};


/** @param {!Array<!proto.poolrpc.Output>} value */
proto.poolrpc.OutputsWithImplicitFee.prototype.setOutputsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.poolrpc.Output=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.Output}
 */
proto.poolrpc.OutputsWithImplicitFee.prototype.addOutputs = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.poolrpc.Output, opt_index);
};


proto.poolrpc.OutputsWithImplicitFee.prototype.clearOutputsList = function() {
  this.setOutputsList([]);
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
proto.poolrpc.CloseAccountRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.poolrpc.CloseAccountRequest.oneofGroups_);
};
goog.inherits(proto.poolrpc.CloseAccountRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.CloseAccountRequest.displayName = 'proto.poolrpc.CloseAccountRequest';
}
/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.poolrpc.CloseAccountRequest.oneofGroups_ = [[2,3]];

/**
 * @enum {number}
 */
proto.poolrpc.CloseAccountRequest.FundsDestinationCase = {
  FUNDS_DESTINATION_NOT_SET: 0,
  OUTPUT_WITH_FEE: 2,
  OUTPUTS: 3
};

/**
 * @return {proto.poolrpc.CloseAccountRequest.FundsDestinationCase}
 */
proto.poolrpc.CloseAccountRequest.prototype.getFundsDestinationCase = function() {
  return /** @type {proto.poolrpc.CloseAccountRequest.FundsDestinationCase} */(jspb.Message.computeOneofCase(this, proto.poolrpc.CloseAccountRequest.oneofGroups_[0]));
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
proto.poolrpc.CloseAccountRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.CloseAccountRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.CloseAccountRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.CloseAccountRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    traderKey: msg.getTraderKey_asB64(),
    outputWithFee: (f = msg.getOutputWithFee()) && proto.poolrpc.OutputWithFee.toObject(includeInstance, f),
    outputs: (f = msg.getOutputs()) && proto.poolrpc.OutputsWithImplicitFee.toObject(includeInstance, f)
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
 * @return {!proto.poolrpc.CloseAccountRequest}
 */
proto.poolrpc.CloseAccountRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.CloseAccountRequest;
  return proto.poolrpc.CloseAccountRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.CloseAccountRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.CloseAccountRequest}
 */
proto.poolrpc.CloseAccountRequest.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = new proto.poolrpc.OutputWithFee;
      reader.readMessage(value,proto.poolrpc.OutputWithFee.deserializeBinaryFromReader);
      msg.setOutputWithFee(value);
      break;
    case 3:
      var value = new proto.poolrpc.OutputsWithImplicitFee;
      reader.readMessage(value,proto.poolrpc.OutputsWithImplicitFee.deserializeBinaryFromReader);
      msg.setOutputs(value);
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
proto.poolrpc.CloseAccountRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.CloseAccountRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.CloseAccountRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.CloseAccountRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTraderKey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getOutputWithFee();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.poolrpc.OutputWithFee.serializeBinaryToWriter
    );
  }
  f = message.getOutputs();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.poolrpc.OutputsWithImplicitFee.serializeBinaryToWriter
    );
  }
};


/**
 * optional bytes trader_key = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.CloseAccountRequest.prototype.getTraderKey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes trader_key = 1;
 * This is a type-conversion wrapper around `getTraderKey()`
 * @return {string}
 */
proto.poolrpc.CloseAccountRequest.prototype.getTraderKey_asB64 = function() {
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
proto.poolrpc.CloseAccountRequest.prototype.getTraderKey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getTraderKey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.CloseAccountRequest.prototype.setTraderKey = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional OutputWithFee output_with_fee = 2;
 * @return {?proto.poolrpc.OutputWithFee}
 */
proto.poolrpc.CloseAccountRequest.prototype.getOutputWithFee = function() {
  return /** @type{?proto.poolrpc.OutputWithFee} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.OutputWithFee, 2));
};


/** @param {?proto.poolrpc.OutputWithFee|undefined} value */
proto.poolrpc.CloseAccountRequest.prototype.setOutputWithFee = function(value) {
  jspb.Message.setOneofWrapperField(this, 2, proto.poolrpc.CloseAccountRequest.oneofGroups_[0], value);
};


proto.poolrpc.CloseAccountRequest.prototype.clearOutputWithFee = function() {
  this.setOutputWithFee(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.CloseAccountRequest.prototype.hasOutputWithFee = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional OutputsWithImplicitFee outputs = 3;
 * @return {?proto.poolrpc.OutputsWithImplicitFee}
 */
proto.poolrpc.CloseAccountRequest.prototype.getOutputs = function() {
  return /** @type{?proto.poolrpc.OutputsWithImplicitFee} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.OutputsWithImplicitFee, 3));
};


/** @param {?proto.poolrpc.OutputsWithImplicitFee|undefined} value */
proto.poolrpc.CloseAccountRequest.prototype.setOutputs = function(value) {
  jspb.Message.setOneofWrapperField(this, 3, proto.poolrpc.CloseAccountRequest.oneofGroups_[0], value);
};


proto.poolrpc.CloseAccountRequest.prototype.clearOutputs = function() {
  this.setOutputs(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.CloseAccountRequest.prototype.hasOutputs = function() {
  return jspb.Message.getField(this, 3) != null;
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
proto.poolrpc.CloseAccountResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.CloseAccountResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.CloseAccountResponse.displayName = 'proto.poolrpc.CloseAccountResponse';
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
proto.poolrpc.CloseAccountResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.CloseAccountResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.CloseAccountResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.CloseAccountResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    closeTxid: msg.getCloseTxid_asB64()
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
 * @return {!proto.poolrpc.CloseAccountResponse}
 */
proto.poolrpc.CloseAccountResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.CloseAccountResponse;
  return proto.poolrpc.CloseAccountResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.CloseAccountResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.CloseAccountResponse}
 */
proto.poolrpc.CloseAccountResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setCloseTxid(value);
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
proto.poolrpc.CloseAccountResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.CloseAccountResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.CloseAccountResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.CloseAccountResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getCloseTxid_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
};


/**
 * optional bytes close_txid = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.CloseAccountResponse.prototype.getCloseTxid = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes close_txid = 1;
 * This is a type-conversion wrapper around `getCloseTxid()`
 * @return {string}
 */
proto.poolrpc.CloseAccountResponse.prototype.getCloseTxid_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getCloseTxid()));
};


/**
 * optional bytes close_txid = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getCloseTxid()`
 * @return {!Uint8Array}
 */
proto.poolrpc.CloseAccountResponse.prototype.getCloseTxid_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getCloseTxid()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.CloseAccountResponse.prototype.setCloseTxid = function(value) {
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
proto.poolrpc.WithdrawAccountRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.poolrpc.WithdrawAccountRequest.repeatedFields_, proto.poolrpc.WithdrawAccountRequest.oneofGroups_);
};
goog.inherits(proto.poolrpc.WithdrawAccountRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.WithdrawAccountRequest.displayName = 'proto.poolrpc.WithdrawAccountRequest';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.poolrpc.WithdrawAccountRequest.repeatedFields_ = [2];

/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.poolrpc.WithdrawAccountRequest.oneofGroups_ = [[4,5]];

/**
 * @enum {number}
 */
proto.poolrpc.WithdrawAccountRequest.AccountExpiryCase = {
  ACCOUNT_EXPIRY_NOT_SET: 0,
  ABSOLUTE_EXPIRY: 4,
  RELATIVE_EXPIRY: 5
};

/**
 * @return {proto.poolrpc.WithdrawAccountRequest.AccountExpiryCase}
 */
proto.poolrpc.WithdrawAccountRequest.prototype.getAccountExpiryCase = function() {
  return /** @type {proto.poolrpc.WithdrawAccountRequest.AccountExpiryCase} */(jspb.Message.computeOneofCase(this, proto.poolrpc.WithdrawAccountRequest.oneofGroups_[0]));
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
proto.poolrpc.WithdrawAccountRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.WithdrawAccountRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.WithdrawAccountRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.WithdrawAccountRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    traderKey: msg.getTraderKey_asB64(),
    outputsList: jspb.Message.toObjectList(msg.getOutputsList(),
    proto.poolrpc.Output.toObject, includeInstance),
    feeRateSatPerKw: jspb.Message.getFieldWithDefault(msg, 3, "0"),
    absoluteExpiry: jspb.Message.getFieldWithDefault(msg, 4, 0),
    relativeExpiry: jspb.Message.getFieldWithDefault(msg, 5, 0),
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
 * @return {!proto.poolrpc.WithdrawAccountRequest}
 */
proto.poolrpc.WithdrawAccountRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.WithdrawAccountRequest;
  return proto.poolrpc.WithdrawAccountRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.WithdrawAccountRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.WithdrawAccountRequest}
 */
proto.poolrpc.WithdrawAccountRequest.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = new proto.poolrpc.Output;
      reader.readMessage(value,proto.poolrpc.Output.deserializeBinaryFromReader);
      msg.addOutputs(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setFeeRateSatPerKw(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setAbsoluteExpiry(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setRelativeExpiry(value);
      break;
    case 6:
      var value = /** @type {!proto.poolrpc.AccountVersion} */ (reader.readEnum());
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
proto.poolrpc.WithdrawAccountRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.WithdrawAccountRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.WithdrawAccountRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.WithdrawAccountRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTraderKey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getOutputsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      proto.poolrpc.Output.serializeBinaryToWriter
    );
  }
  f = message.getFeeRateSatPerKw();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      3,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 4));
  if (f != null) {
    writer.writeUint32(
      4,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 5));
  if (f != null) {
    writer.writeUint32(
      5,
      f
    );
  }
  f = message.getNewVersion();
  if (f !== 0.0) {
    writer.writeEnum(
      6,
      f
    );
  }
};


/**
 * optional bytes trader_key = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.WithdrawAccountRequest.prototype.getTraderKey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes trader_key = 1;
 * This is a type-conversion wrapper around `getTraderKey()`
 * @return {string}
 */
proto.poolrpc.WithdrawAccountRequest.prototype.getTraderKey_asB64 = function() {
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
proto.poolrpc.WithdrawAccountRequest.prototype.getTraderKey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getTraderKey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.WithdrawAccountRequest.prototype.setTraderKey = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * repeated Output outputs = 2;
 * @return {!Array<!proto.poolrpc.Output>}
 */
proto.poolrpc.WithdrawAccountRequest.prototype.getOutputsList = function() {
  return /** @type{!Array<!proto.poolrpc.Output>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.Output, 2));
};


/** @param {!Array<!proto.poolrpc.Output>} value */
proto.poolrpc.WithdrawAccountRequest.prototype.setOutputsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.poolrpc.Output=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.Output}
 */
proto.poolrpc.WithdrawAccountRequest.prototype.addOutputs = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.poolrpc.Output, opt_index);
};


proto.poolrpc.WithdrawAccountRequest.prototype.clearOutputsList = function() {
  this.setOutputsList([]);
};


/**
 * optional uint64 fee_rate_sat_per_kw = 3;
 * @return {string}
 */
proto.poolrpc.WithdrawAccountRequest.prototype.getFeeRateSatPerKw = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, "0"));
};


/** @param {string} value */
proto.poolrpc.WithdrawAccountRequest.prototype.setFeeRateSatPerKw = function(value) {
  jspb.Message.setProto3StringIntField(this, 3, value);
};


/**
 * optional uint32 absolute_expiry = 4;
 * @return {number}
 */
proto.poolrpc.WithdrawAccountRequest.prototype.getAbsoluteExpiry = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {number} value */
proto.poolrpc.WithdrawAccountRequest.prototype.setAbsoluteExpiry = function(value) {
  jspb.Message.setOneofField(this, 4, proto.poolrpc.WithdrawAccountRequest.oneofGroups_[0], value);
};


proto.poolrpc.WithdrawAccountRequest.prototype.clearAbsoluteExpiry = function() {
  jspb.Message.setOneofField(this, 4, proto.poolrpc.WithdrawAccountRequest.oneofGroups_[0], undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.WithdrawAccountRequest.prototype.hasAbsoluteExpiry = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional uint32 relative_expiry = 5;
 * @return {number}
 */
proto.poolrpc.WithdrawAccountRequest.prototype.getRelativeExpiry = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/** @param {number} value */
proto.poolrpc.WithdrawAccountRequest.prototype.setRelativeExpiry = function(value) {
  jspb.Message.setOneofField(this, 5, proto.poolrpc.WithdrawAccountRequest.oneofGroups_[0], value);
};


proto.poolrpc.WithdrawAccountRequest.prototype.clearRelativeExpiry = function() {
  jspb.Message.setOneofField(this, 5, proto.poolrpc.WithdrawAccountRequest.oneofGroups_[0], undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.WithdrawAccountRequest.prototype.hasRelativeExpiry = function() {
  return jspb.Message.getField(this, 5) != null;
};


/**
 * optional AccountVersion new_version = 6;
 * @return {!proto.poolrpc.AccountVersion}
 */
proto.poolrpc.WithdrawAccountRequest.prototype.getNewVersion = function() {
  return /** @type {!proto.poolrpc.AccountVersion} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/** @param {!proto.poolrpc.AccountVersion} value */
proto.poolrpc.WithdrawAccountRequest.prototype.setNewVersion = function(value) {
  jspb.Message.setProto3EnumField(this, 6, value);
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
proto.poolrpc.WithdrawAccountResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.WithdrawAccountResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.WithdrawAccountResponse.displayName = 'proto.poolrpc.WithdrawAccountResponse';
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
proto.poolrpc.WithdrawAccountResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.WithdrawAccountResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.WithdrawAccountResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.WithdrawAccountResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    account: (f = msg.getAccount()) && proto.poolrpc.Account.toObject(includeInstance, f),
    withdrawTxid: msg.getWithdrawTxid_asB64()
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
 * @return {!proto.poolrpc.WithdrawAccountResponse}
 */
proto.poolrpc.WithdrawAccountResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.WithdrawAccountResponse;
  return proto.poolrpc.WithdrawAccountResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.WithdrawAccountResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.WithdrawAccountResponse}
 */
proto.poolrpc.WithdrawAccountResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.Account;
      reader.readMessage(value,proto.poolrpc.Account.deserializeBinaryFromReader);
      msg.setAccount(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setWithdrawTxid(value);
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
proto.poolrpc.WithdrawAccountResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.WithdrawAccountResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.WithdrawAccountResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.WithdrawAccountResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAccount();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.poolrpc.Account.serializeBinaryToWriter
    );
  }
  f = message.getWithdrawTxid_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
};


/**
 * optional Account account = 1;
 * @return {?proto.poolrpc.Account}
 */
proto.poolrpc.WithdrawAccountResponse.prototype.getAccount = function() {
  return /** @type{?proto.poolrpc.Account} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.Account, 1));
};


/** @param {?proto.poolrpc.Account|undefined} value */
proto.poolrpc.WithdrawAccountResponse.prototype.setAccount = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


proto.poolrpc.WithdrawAccountResponse.prototype.clearAccount = function() {
  this.setAccount(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.WithdrawAccountResponse.prototype.hasAccount = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional bytes withdraw_txid = 2;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.WithdrawAccountResponse.prototype.getWithdrawTxid = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes withdraw_txid = 2;
 * This is a type-conversion wrapper around `getWithdrawTxid()`
 * @return {string}
 */
proto.poolrpc.WithdrawAccountResponse.prototype.getWithdrawTxid_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getWithdrawTxid()));
};


/**
 * optional bytes withdraw_txid = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getWithdrawTxid()`
 * @return {!Uint8Array}
 */
proto.poolrpc.WithdrawAccountResponse.prototype.getWithdrawTxid_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getWithdrawTxid()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.WithdrawAccountResponse.prototype.setWithdrawTxid = function(value) {
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
proto.poolrpc.DepositAccountRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.poolrpc.DepositAccountRequest.oneofGroups_);
};
goog.inherits(proto.poolrpc.DepositAccountRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.DepositAccountRequest.displayName = 'proto.poolrpc.DepositAccountRequest';
}
/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.poolrpc.DepositAccountRequest.oneofGroups_ = [[4,5]];

/**
 * @enum {number}
 */
proto.poolrpc.DepositAccountRequest.AccountExpiryCase = {
  ACCOUNT_EXPIRY_NOT_SET: 0,
  ABSOLUTE_EXPIRY: 4,
  RELATIVE_EXPIRY: 5
};

/**
 * @return {proto.poolrpc.DepositAccountRequest.AccountExpiryCase}
 */
proto.poolrpc.DepositAccountRequest.prototype.getAccountExpiryCase = function() {
  return /** @type {proto.poolrpc.DepositAccountRequest.AccountExpiryCase} */(jspb.Message.computeOneofCase(this, proto.poolrpc.DepositAccountRequest.oneofGroups_[0]));
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
proto.poolrpc.DepositAccountRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.DepositAccountRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.DepositAccountRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.DepositAccountRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    traderKey: msg.getTraderKey_asB64(),
    amountSat: jspb.Message.getFieldWithDefault(msg, 2, "0"),
    feeRateSatPerKw: jspb.Message.getFieldWithDefault(msg, 3, "0"),
    absoluteExpiry: jspb.Message.getFieldWithDefault(msg, 4, 0),
    relativeExpiry: jspb.Message.getFieldWithDefault(msg, 5, 0),
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
 * @return {!proto.poolrpc.DepositAccountRequest}
 */
proto.poolrpc.DepositAccountRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.DepositAccountRequest;
  return proto.poolrpc.DepositAccountRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.DepositAccountRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.DepositAccountRequest}
 */
proto.poolrpc.DepositAccountRequest.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setAmountSat(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setFeeRateSatPerKw(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setAbsoluteExpiry(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setRelativeExpiry(value);
      break;
    case 6:
      var value = /** @type {!proto.poolrpc.AccountVersion} */ (reader.readEnum());
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
proto.poolrpc.DepositAccountRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.DepositAccountRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.DepositAccountRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.DepositAccountRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTraderKey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getAmountSat();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      2,
      f
    );
  }
  f = message.getFeeRateSatPerKw();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      3,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 4));
  if (f != null) {
    writer.writeUint32(
      4,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 5));
  if (f != null) {
    writer.writeUint32(
      5,
      f
    );
  }
  f = message.getNewVersion();
  if (f !== 0.0) {
    writer.writeEnum(
      6,
      f
    );
  }
};


/**
 * optional bytes trader_key = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.DepositAccountRequest.prototype.getTraderKey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes trader_key = 1;
 * This is a type-conversion wrapper around `getTraderKey()`
 * @return {string}
 */
proto.poolrpc.DepositAccountRequest.prototype.getTraderKey_asB64 = function() {
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
proto.poolrpc.DepositAccountRequest.prototype.getTraderKey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getTraderKey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.DepositAccountRequest.prototype.setTraderKey = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional uint64 amount_sat = 2;
 * @return {string}
 */
proto.poolrpc.DepositAccountRequest.prototype.getAmountSat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, "0"));
};


/** @param {string} value */
proto.poolrpc.DepositAccountRequest.prototype.setAmountSat = function(value) {
  jspb.Message.setProto3StringIntField(this, 2, value);
};


/**
 * optional uint64 fee_rate_sat_per_kw = 3;
 * @return {string}
 */
proto.poolrpc.DepositAccountRequest.prototype.getFeeRateSatPerKw = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, "0"));
};


/** @param {string} value */
proto.poolrpc.DepositAccountRequest.prototype.setFeeRateSatPerKw = function(value) {
  jspb.Message.setProto3StringIntField(this, 3, value);
};


/**
 * optional uint32 absolute_expiry = 4;
 * @return {number}
 */
proto.poolrpc.DepositAccountRequest.prototype.getAbsoluteExpiry = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {number} value */
proto.poolrpc.DepositAccountRequest.prototype.setAbsoluteExpiry = function(value) {
  jspb.Message.setOneofField(this, 4, proto.poolrpc.DepositAccountRequest.oneofGroups_[0], value);
};


proto.poolrpc.DepositAccountRequest.prototype.clearAbsoluteExpiry = function() {
  jspb.Message.setOneofField(this, 4, proto.poolrpc.DepositAccountRequest.oneofGroups_[0], undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.DepositAccountRequest.prototype.hasAbsoluteExpiry = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional uint32 relative_expiry = 5;
 * @return {number}
 */
proto.poolrpc.DepositAccountRequest.prototype.getRelativeExpiry = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/** @param {number} value */
proto.poolrpc.DepositAccountRequest.prototype.setRelativeExpiry = function(value) {
  jspb.Message.setOneofField(this, 5, proto.poolrpc.DepositAccountRequest.oneofGroups_[0], value);
};


proto.poolrpc.DepositAccountRequest.prototype.clearRelativeExpiry = function() {
  jspb.Message.setOneofField(this, 5, proto.poolrpc.DepositAccountRequest.oneofGroups_[0], undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.DepositAccountRequest.prototype.hasRelativeExpiry = function() {
  return jspb.Message.getField(this, 5) != null;
};


/**
 * optional AccountVersion new_version = 6;
 * @return {!proto.poolrpc.AccountVersion}
 */
proto.poolrpc.DepositAccountRequest.prototype.getNewVersion = function() {
  return /** @type {!proto.poolrpc.AccountVersion} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/** @param {!proto.poolrpc.AccountVersion} value */
proto.poolrpc.DepositAccountRequest.prototype.setNewVersion = function(value) {
  jspb.Message.setProto3EnumField(this, 6, value);
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
proto.poolrpc.DepositAccountResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.DepositAccountResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.DepositAccountResponse.displayName = 'proto.poolrpc.DepositAccountResponse';
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
proto.poolrpc.DepositAccountResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.DepositAccountResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.DepositAccountResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.DepositAccountResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    account: (f = msg.getAccount()) && proto.poolrpc.Account.toObject(includeInstance, f),
    depositTxid: msg.getDepositTxid_asB64()
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
 * @return {!proto.poolrpc.DepositAccountResponse}
 */
proto.poolrpc.DepositAccountResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.DepositAccountResponse;
  return proto.poolrpc.DepositAccountResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.DepositAccountResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.DepositAccountResponse}
 */
proto.poolrpc.DepositAccountResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.Account;
      reader.readMessage(value,proto.poolrpc.Account.deserializeBinaryFromReader);
      msg.setAccount(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setDepositTxid(value);
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
proto.poolrpc.DepositAccountResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.DepositAccountResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.DepositAccountResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.DepositAccountResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAccount();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.poolrpc.Account.serializeBinaryToWriter
    );
  }
  f = message.getDepositTxid_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
};


/**
 * optional Account account = 1;
 * @return {?proto.poolrpc.Account}
 */
proto.poolrpc.DepositAccountResponse.prototype.getAccount = function() {
  return /** @type{?proto.poolrpc.Account} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.Account, 1));
};


/** @param {?proto.poolrpc.Account|undefined} value */
proto.poolrpc.DepositAccountResponse.prototype.setAccount = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


proto.poolrpc.DepositAccountResponse.prototype.clearAccount = function() {
  this.setAccount(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.DepositAccountResponse.prototype.hasAccount = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional bytes deposit_txid = 2;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.DepositAccountResponse.prototype.getDepositTxid = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes deposit_txid = 2;
 * This is a type-conversion wrapper around `getDepositTxid()`
 * @return {string}
 */
proto.poolrpc.DepositAccountResponse.prototype.getDepositTxid_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getDepositTxid()));
};


/**
 * optional bytes deposit_txid = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getDepositTxid()`
 * @return {!Uint8Array}
 */
proto.poolrpc.DepositAccountResponse.prototype.getDepositTxid_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getDepositTxid()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.DepositAccountResponse.prototype.setDepositTxid = function(value) {
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
proto.poolrpc.RenewAccountRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.poolrpc.RenewAccountRequest.oneofGroups_);
};
goog.inherits(proto.poolrpc.RenewAccountRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.RenewAccountRequest.displayName = 'proto.poolrpc.RenewAccountRequest';
}
/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.poolrpc.RenewAccountRequest.oneofGroups_ = [[2,3]];

/**
 * @enum {number}
 */
proto.poolrpc.RenewAccountRequest.AccountExpiryCase = {
  ACCOUNT_EXPIRY_NOT_SET: 0,
  ABSOLUTE_EXPIRY: 2,
  RELATIVE_EXPIRY: 3
};

/**
 * @return {proto.poolrpc.RenewAccountRequest.AccountExpiryCase}
 */
proto.poolrpc.RenewAccountRequest.prototype.getAccountExpiryCase = function() {
  return /** @type {proto.poolrpc.RenewAccountRequest.AccountExpiryCase} */(jspb.Message.computeOneofCase(this, proto.poolrpc.RenewAccountRequest.oneofGroups_[0]));
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
proto.poolrpc.RenewAccountRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.RenewAccountRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.RenewAccountRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.RenewAccountRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    accountKey: msg.getAccountKey_asB64(),
    absoluteExpiry: jspb.Message.getFieldWithDefault(msg, 2, 0),
    relativeExpiry: jspb.Message.getFieldWithDefault(msg, 3, 0),
    feeRateSatPerKw: jspb.Message.getFieldWithDefault(msg, 4, "0"),
    newVersion: jspb.Message.getFieldWithDefault(msg, 5, 0)
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
 * @return {!proto.poolrpc.RenewAccountRequest}
 */
proto.poolrpc.RenewAccountRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.RenewAccountRequest;
  return proto.poolrpc.RenewAccountRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.RenewAccountRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.RenewAccountRequest}
 */
proto.poolrpc.RenewAccountRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setAccountKey(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setAbsoluteExpiry(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setRelativeExpiry(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setFeeRateSatPerKw(value);
      break;
    case 5:
      var value = /** @type {!proto.poolrpc.AccountVersion} */ (reader.readEnum());
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
proto.poolrpc.RenewAccountRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.RenewAccountRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.RenewAccountRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.RenewAccountRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAccountKey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 2));
  if (f != null) {
    writer.writeUint32(
      2,
      f
    );
  }
  f = /** @type {number} */ (jspb.Message.getField(message, 3));
  if (f != null) {
    writer.writeUint32(
      3,
      f
    );
  }
  f = message.getFeeRateSatPerKw();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      4,
      f
    );
  }
  f = message.getNewVersion();
  if (f !== 0.0) {
    writer.writeEnum(
      5,
      f
    );
  }
};


/**
 * optional bytes account_key = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.RenewAccountRequest.prototype.getAccountKey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes account_key = 1;
 * This is a type-conversion wrapper around `getAccountKey()`
 * @return {string}
 */
proto.poolrpc.RenewAccountRequest.prototype.getAccountKey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getAccountKey()));
};


/**
 * optional bytes account_key = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getAccountKey()`
 * @return {!Uint8Array}
 */
proto.poolrpc.RenewAccountRequest.prototype.getAccountKey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getAccountKey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.RenewAccountRequest.prototype.setAccountKey = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional uint32 absolute_expiry = 2;
 * @return {number}
 */
proto.poolrpc.RenewAccountRequest.prototype.getAbsoluteExpiry = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.RenewAccountRequest.prototype.setAbsoluteExpiry = function(value) {
  jspb.Message.setOneofField(this, 2, proto.poolrpc.RenewAccountRequest.oneofGroups_[0], value);
};


proto.poolrpc.RenewAccountRequest.prototype.clearAbsoluteExpiry = function() {
  jspb.Message.setOneofField(this, 2, proto.poolrpc.RenewAccountRequest.oneofGroups_[0], undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.RenewAccountRequest.prototype.hasAbsoluteExpiry = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional uint32 relative_expiry = 3;
 * @return {number}
 */
proto.poolrpc.RenewAccountRequest.prototype.getRelativeExpiry = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {number} value */
proto.poolrpc.RenewAccountRequest.prototype.setRelativeExpiry = function(value) {
  jspb.Message.setOneofField(this, 3, proto.poolrpc.RenewAccountRequest.oneofGroups_[0], value);
};


proto.poolrpc.RenewAccountRequest.prototype.clearRelativeExpiry = function() {
  jspb.Message.setOneofField(this, 3, proto.poolrpc.RenewAccountRequest.oneofGroups_[0], undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.RenewAccountRequest.prototype.hasRelativeExpiry = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional uint64 fee_rate_sat_per_kw = 4;
 * @return {string}
 */
proto.poolrpc.RenewAccountRequest.prototype.getFeeRateSatPerKw = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, "0"));
};


/** @param {string} value */
proto.poolrpc.RenewAccountRequest.prototype.setFeeRateSatPerKw = function(value) {
  jspb.Message.setProto3StringIntField(this, 4, value);
};


/**
 * optional AccountVersion new_version = 5;
 * @return {!proto.poolrpc.AccountVersion}
 */
proto.poolrpc.RenewAccountRequest.prototype.getNewVersion = function() {
  return /** @type {!proto.poolrpc.AccountVersion} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/** @param {!proto.poolrpc.AccountVersion} value */
proto.poolrpc.RenewAccountRequest.prototype.setNewVersion = function(value) {
  jspb.Message.setProto3EnumField(this, 5, value);
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
proto.poolrpc.RenewAccountResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.RenewAccountResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.RenewAccountResponse.displayName = 'proto.poolrpc.RenewAccountResponse';
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
proto.poolrpc.RenewAccountResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.RenewAccountResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.RenewAccountResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.RenewAccountResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    account: (f = msg.getAccount()) && proto.poolrpc.Account.toObject(includeInstance, f),
    renewalTxid: msg.getRenewalTxid_asB64()
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
 * @return {!proto.poolrpc.RenewAccountResponse}
 */
proto.poolrpc.RenewAccountResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.RenewAccountResponse;
  return proto.poolrpc.RenewAccountResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.RenewAccountResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.RenewAccountResponse}
 */
proto.poolrpc.RenewAccountResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.Account;
      reader.readMessage(value,proto.poolrpc.Account.deserializeBinaryFromReader);
      msg.setAccount(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setRenewalTxid(value);
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
proto.poolrpc.RenewAccountResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.RenewAccountResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.RenewAccountResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.RenewAccountResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAccount();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.poolrpc.Account.serializeBinaryToWriter
    );
  }
  f = message.getRenewalTxid_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
};


/**
 * optional Account account = 1;
 * @return {?proto.poolrpc.Account}
 */
proto.poolrpc.RenewAccountResponse.prototype.getAccount = function() {
  return /** @type{?proto.poolrpc.Account} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.Account, 1));
};


/** @param {?proto.poolrpc.Account|undefined} value */
proto.poolrpc.RenewAccountResponse.prototype.setAccount = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


proto.poolrpc.RenewAccountResponse.prototype.clearAccount = function() {
  this.setAccount(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.RenewAccountResponse.prototype.hasAccount = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional bytes renewal_txid = 2;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.RenewAccountResponse.prototype.getRenewalTxid = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes renewal_txid = 2;
 * This is a type-conversion wrapper around `getRenewalTxid()`
 * @return {string}
 */
proto.poolrpc.RenewAccountResponse.prototype.getRenewalTxid_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getRenewalTxid()));
};


/**
 * optional bytes renewal_txid = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getRenewalTxid()`
 * @return {!Uint8Array}
 */
proto.poolrpc.RenewAccountResponse.prototype.getRenewalTxid_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getRenewalTxid()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.RenewAccountResponse.prototype.setRenewalTxid = function(value) {
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
proto.poolrpc.BumpAccountFeeRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.BumpAccountFeeRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.BumpAccountFeeRequest.displayName = 'proto.poolrpc.BumpAccountFeeRequest';
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
proto.poolrpc.BumpAccountFeeRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.BumpAccountFeeRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.BumpAccountFeeRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.BumpAccountFeeRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    traderKey: msg.getTraderKey_asB64(),
    feeRateSatPerKw: jspb.Message.getFieldWithDefault(msg, 2, "0")
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
 * @return {!proto.poolrpc.BumpAccountFeeRequest}
 */
proto.poolrpc.BumpAccountFeeRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.BumpAccountFeeRequest;
  return proto.poolrpc.BumpAccountFeeRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.BumpAccountFeeRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.BumpAccountFeeRequest}
 */
proto.poolrpc.BumpAccountFeeRequest.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setFeeRateSatPerKw(value);
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
proto.poolrpc.BumpAccountFeeRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.BumpAccountFeeRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.BumpAccountFeeRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.BumpAccountFeeRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTraderKey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getFeeRateSatPerKw();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      2,
      f
    );
  }
};


/**
 * optional bytes trader_key = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.BumpAccountFeeRequest.prototype.getTraderKey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes trader_key = 1;
 * This is a type-conversion wrapper around `getTraderKey()`
 * @return {string}
 */
proto.poolrpc.BumpAccountFeeRequest.prototype.getTraderKey_asB64 = function() {
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
proto.poolrpc.BumpAccountFeeRequest.prototype.getTraderKey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getTraderKey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.BumpAccountFeeRequest.prototype.setTraderKey = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional uint64 fee_rate_sat_per_kw = 2;
 * @return {string}
 */
proto.poolrpc.BumpAccountFeeRequest.prototype.getFeeRateSatPerKw = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, "0"));
};


/** @param {string} value */
proto.poolrpc.BumpAccountFeeRequest.prototype.setFeeRateSatPerKw = function(value) {
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
proto.poolrpc.BumpAccountFeeResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.BumpAccountFeeResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.BumpAccountFeeResponse.displayName = 'proto.poolrpc.BumpAccountFeeResponse';
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
proto.poolrpc.BumpAccountFeeResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.BumpAccountFeeResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.BumpAccountFeeResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.BumpAccountFeeResponse.toObject = function(includeInstance, msg) {
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
 * @return {!proto.poolrpc.BumpAccountFeeResponse}
 */
proto.poolrpc.BumpAccountFeeResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.BumpAccountFeeResponse;
  return proto.poolrpc.BumpAccountFeeResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.BumpAccountFeeResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.BumpAccountFeeResponse}
 */
proto.poolrpc.BumpAccountFeeResponse.deserializeBinaryFromReader = function(msg, reader) {
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
proto.poolrpc.BumpAccountFeeResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.BumpAccountFeeResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.BumpAccountFeeResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.BumpAccountFeeResponse.serializeBinaryToWriter = function(message, writer) {
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
proto.poolrpc.Account = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.Account, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.Account.displayName = 'proto.poolrpc.Account';
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
proto.poolrpc.Account.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.Account.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.Account} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.Account.toObject = function(includeInstance, msg) {
  var f, obj = {
    traderKey: msg.getTraderKey_asB64(),
    outpoint: (f = msg.getOutpoint()) && auctioneerrpc_auctioneer_pb.OutPoint.toObject(includeInstance, f),
    value: jspb.Message.getFieldWithDefault(msg, 3, "0"),
    availableBalance: jspb.Message.getFieldWithDefault(msg, 4, "0"),
    expirationHeight: jspb.Message.getFieldWithDefault(msg, 5, 0),
    state: jspb.Message.getFieldWithDefault(msg, 6, 0),
    latestTxid: msg.getLatestTxid_asB64(),
    version: jspb.Message.getFieldWithDefault(msg, 8, 0)
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
 * @return {!proto.poolrpc.Account}
 */
proto.poolrpc.Account.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.Account;
  return proto.poolrpc.Account.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.Account} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.Account}
 */
proto.poolrpc.Account.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = new auctioneerrpc_auctioneer_pb.OutPoint;
      reader.readMessage(value,auctioneerrpc_auctioneer_pb.OutPoint.deserializeBinaryFromReader);
      msg.setOutpoint(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setValue(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setAvailableBalance(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setExpirationHeight(value);
      break;
    case 6:
      var value = /** @type {!proto.poolrpc.AccountState} */ (reader.readEnum());
      msg.setState(value);
      break;
    case 7:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setLatestTxid(value);
      break;
    case 8:
      var value = /** @type {!proto.poolrpc.AccountVersion} */ (reader.readEnum());
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
proto.poolrpc.Account.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.Account.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.Account} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.Account.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTraderKey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getOutpoint();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      auctioneerrpc_auctioneer_pb.OutPoint.serializeBinaryToWriter
    );
  }
  f = message.getValue();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      3,
      f
    );
  }
  f = message.getAvailableBalance();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      4,
      f
    );
  }
  f = message.getExpirationHeight();
  if (f !== 0) {
    writer.writeUint32(
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
  f = message.getLatestTxid_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      7,
      f
    );
  }
  f = message.getVersion();
  if (f !== 0.0) {
    writer.writeEnum(
      8,
      f
    );
  }
};


/**
 * optional bytes trader_key = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.Account.prototype.getTraderKey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes trader_key = 1;
 * This is a type-conversion wrapper around `getTraderKey()`
 * @return {string}
 */
proto.poolrpc.Account.prototype.getTraderKey_asB64 = function() {
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
proto.poolrpc.Account.prototype.getTraderKey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getTraderKey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.Account.prototype.setTraderKey = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional OutPoint outpoint = 2;
 * @return {?proto.poolrpc.OutPoint}
 */
proto.poolrpc.Account.prototype.getOutpoint = function() {
  return /** @type{?proto.poolrpc.OutPoint} */ (
    jspb.Message.getWrapperField(this, auctioneerrpc_auctioneer_pb.OutPoint, 2));
};


/** @param {?proto.poolrpc.OutPoint|undefined} value */
proto.poolrpc.Account.prototype.setOutpoint = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.poolrpc.Account.prototype.clearOutpoint = function() {
  this.setOutpoint(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.Account.prototype.hasOutpoint = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional uint64 value = 3;
 * @return {string}
 */
proto.poolrpc.Account.prototype.getValue = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, "0"));
};


/** @param {string} value */
proto.poolrpc.Account.prototype.setValue = function(value) {
  jspb.Message.setProto3StringIntField(this, 3, value);
};


/**
 * optional uint64 available_balance = 4;
 * @return {string}
 */
proto.poolrpc.Account.prototype.getAvailableBalance = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, "0"));
};


/** @param {string} value */
proto.poolrpc.Account.prototype.setAvailableBalance = function(value) {
  jspb.Message.setProto3StringIntField(this, 4, value);
};


/**
 * optional uint32 expiration_height = 5;
 * @return {number}
 */
proto.poolrpc.Account.prototype.getExpirationHeight = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/** @param {number} value */
proto.poolrpc.Account.prototype.setExpirationHeight = function(value) {
  jspb.Message.setProto3IntField(this, 5, value);
};


/**
 * optional AccountState state = 6;
 * @return {!proto.poolrpc.AccountState}
 */
proto.poolrpc.Account.prototype.getState = function() {
  return /** @type {!proto.poolrpc.AccountState} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/** @param {!proto.poolrpc.AccountState} value */
proto.poolrpc.Account.prototype.setState = function(value) {
  jspb.Message.setProto3EnumField(this, 6, value);
};


/**
 * optional bytes latest_txid = 7;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.Account.prototype.getLatestTxid = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 7, ""));
};


/**
 * optional bytes latest_txid = 7;
 * This is a type-conversion wrapper around `getLatestTxid()`
 * @return {string}
 */
proto.poolrpc.Account.prototype.getLatestTxid_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getLatestTxid()));
};


/**
 * optional bytes latest_txid = 7;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getLatestTxid()`
 * @return {!Uint8Array}
 */
proto.poolrpc.Account.prototype.getLatestTxid_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getLatestTxid()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.Account.prototype.setLatestTxid = function(value) {
  jspb.Message.setProto3BytesField(this, 7, value);
};


/**
 * optional AccountVersion version = 8;
 * @return {!proto.poolrpc.AccountVersion}
 */
proto.poolrpc.Account.prototype.getVersion = function() {
  return /** @type {!proto.poolrpc.AccountVersion} */ (jspb.Message.getFieldWithDefault(this, 8, 0));
};


/** @param {!proto.poolrpc.AccountVersion} value */
proto.poolrpc.Account.prototype.setVersion = function(value) {
  jspb.Message.setProto3EnumField(this, 8, value);
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
proto.poolrpc.SubmitOrderRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.poolrpc.SubmitOrderRequest.oneofGroups_);
};
goog.inherits(proto.poolrpc.SubmitOrderRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.SubmitOrderRequest.displayName = 'proto.poolrpc.SubmitOrderRequest';
}
/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.poolrpc.SubmitOrderRequest.oneofGroups_ = [[1,2]];

/**
 * @enum {number}
 */
proto.poolrpc.SubmitOrderRequest.DetailsCase = {
  DETAILS_NOT_SET: 0,
  ASK: 1,
  BID: 2
};

/**
 * @return {proto.poolrpc.SubmitOrderRequest.DetailsCase}
 */
proto.poolrpc.SubmitOrderRequest.prototype.getDetailsCase = function() {
  return /** @type {proto.poolrpc.SubmitOrderRequest.DetailsCase} */(jspb.Message.computeOneofCase(this, proto.poolrpc.SubmitOrderRequest.oneofGroups_[0]));
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
proto.poolrpc.SubmitOrderRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.SubmitOrderRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.SubmitOrderRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.SubmitOrderRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    ask: (f = msg.getAsk()) && proto.poolrpc.Ask.toObject(includeInstance, f),
    bid: (f = msg.getBid()) && proto.poolrpc.Bid.toObject(includeInstance, f),
    initiator: jspb.Message.getFieldWithDefault(msg, 3, "")
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
 * @return {!proto.poolrpc.SubmitOrderRequest}
 */
proto.poolrpc.SubmitOrderRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.SubmitOrderRequest;
  return proto.poolrpc.SubmitOrderRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.SubmitOrderRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.SubmitOrderRequest}
 */
proto.poolrpc.SubmitOrderRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.Ask;
      reader.readMessage(value,proto.poolrpc.Ask.deserializeBinaryFromReader);
      msg.setAsk(value);
      break;
    case 2:
      var value = new proto.poolrpc.Bid;
      reader.readMessage(value,proto.poolrpc.Bid.deserializeBinaryFromReader);
      msg.setBid(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setInitiator(value);
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
proto.poolrpc.SubmitOrderRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.SubmitOrderRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.SubmitOrderRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.SubmitOrderRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAsk();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.poolrpc.Ask.serializeBinaryToWriter
    );
  }
  f = message.getBid();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.poolrpc.Bid.serializeBinaryToWriter
    );
  }
  f = message.getInitiator();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
};


/**
 * optional Ask ask = 1;
 * @return {?proto.poolrpc.Ask}
 */
proto.poolrpc.SubmitOrderRequest.prototype.getAsk = function() {
  return /** @type{?proto.poolrpc.Ask} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.Ask, 1));
};


/** @param {?proto.poolrpc.Ask|undefined} value */
proto.poolrpc.SubmitOrderRequest.prototype.setAsk = function(value) {
  jspb.Message.setOneofWrapperField(this, 1, proto.poolrpc.SubmitOrderRequest.oneofGroups_[0], value);
};


proto.poolrpc.SubmitOrderRequest.prototype.clearAsk = function() {
  this.setAsk(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.SubmitOrderRequest.prototype.hasAsk = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional Bid bid = 2;
 * @return {?proto.poolrpc.Bid}
 */
proto.poolrpc.SubmitOrderRequest.prototype.getBid = function() {
  return /** @type{?proto.poolrpc.Bid} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.Bid, 2));
};


/** @param {?proto.poolrpc.Bid|undefined} value */
proto.poolrpc.SubmitOrderRequest.prototype.setBid = function(value) {
  jspb.Message.setOneofWrapperField(this, 2, proto.poolrpc.SubmitOrderRequest.oneofGroups_[0], value);
};


proto.poolrpc.SubmitOrderRequest.prototype.clearBid = function() {
  this.setBid(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.SubmitOrderRequest.prototype.hasBid = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional string initiator = 3;
 * @return {string}
 */
proto.poolrpc.SubmitOrderRequest.prototype.getInitiator = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/** @param {string} value */
proto.poolrpc.SubmitOrderRequest.prototype.setInitiator = function(value) {
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
proto.poolrpc.SubmitOrderResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.poolrpc.SubmitOrderResponse.oneofGroups_);
};
goog.inherits(proto.poolrpc.SubmitOrderResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.SubmitOrderResponse.displayName = 'proto.poolrpc.SubmitOrderResponse';
}
/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.poolrpc.SubmitOrderResponse.oneofGroups_ = [[1,2]];

/**
 * @enum {number}
 */
proto.poolrpc.SubmitOrderResponse.DetailsCase = {
  DETAILS_NOT_SET: 0,
  INVALID_ORDER: 1,
  ACCEPTED_ORDER_NONCE: 2
};

/**
 * @return {proto.poolrpc.SubmitOrderResponse.DetailsCase}
 */
proto.poolrpc.SubmitOrderResponse.prototype.getDetailsCase = function() {
  return /** @type {proto.poolrpc.SubmitOrderResponse.DetailsCase} */(jspb.Message.computeOneofCase(this, proto.poolrpc.SubmitOrderResponse.oneofGroups_[0]));
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
proto.poolrpc.SubmitOrderResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.SubmitOrderResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.SubmitOrderResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.SubmitOrderResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    invalidOrder: (f = msg.getInvalidOrder()) && auctioneerrpc_auctioneer_pb.InvalidOrder.toObject(includeInstance, f),
    acceptedOrderNonce: msg.getAcceptedOrderNonce_asB64(),
    updatedSidecarTicket: jspb.Message.getFieldWithDefault(msg, 3, "")
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
 * @return {!proto.poolrpc.SubmitOrderResponse}
 */
proto.poolrpc.SubmitOrderResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.SubmitOrderResponse;
  return proto.poolrpc.SubmitOrderResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.SubmitOrderResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.SubmitOrderResponse}
 */
proto.poolrpc.SubmitOrderResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new auctioneerrpc_auctioneer_pb.InvalidOrder;
      reader.readMessage(value,auctioneerrpc_auctioneer_pb.InvalidOrder.deserializeBinaryFromReader);
      msg.setInvalidOrder(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setAcceptedOrderNonce(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setUpdatedSidecarTicket(value);
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
proto.poolrpc.SubmitOrderResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.SubmitOrderResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.SubmitOrderResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.SubmitOrderResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getInvalidOrder();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      auctioneerrpc_auctioneer_pb.InvalidOrder.serializeBinaryToWriter
    );
  }
  f = /** @type {!(string|Uint8Array)} */ (jspb.Message.getField(message, 2));
  if (f != null) {
    writer.writeBytes(
      2,
      f
    );
  }
  f = message.getUpdatedSidecarTicket();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
};


/**
 * optional InvalidOrder invalid_order = 1;
 * @return {?proto.poolrpc.InvalidOrder}
 */
proto.poolrpc.SubmitOrderResponse.prototype.getInvalidOrder = function() {
  return /** @type{?proto.poolrpc.InvalidOrder} */ (
    jspb.Message.getWrapperField(this, auctioneerrpc_auctioneer_pb.InvalidOrder, 1));
};


/** @param {?proto.poolrpc.InvalidOrder|undefined} value */
proto.poolrpc.SubmitOrderResponse.prototype.setInvalidOrder = function(value) {
  jspb.Message.setOneofWrapperField(this, 1, proto.poolrpc.SubmitOrderResponse.oneofGroups_[0], value);
};


proto.poolrpc.SubmitOrderResponse.prototype.clearInvalidOrder = function() {
  this.setInvalidOrder(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.SubmitOrderResponse.prototype.hasInvalidOrder = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional bytes accepted_order_nonce = 2;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.SubmitOrderResponse.prototype.getAcceptedOrderNonce = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes accepted_order_nonce = 2;
 * This is a type-conversion wrapper around `getAcceptedOrderNonce()`
 * @return {string}
 */
proto.poolrpc.SubmitOrderResponse.prototype.getAcceptedOrderNonce_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getAcceptedOrderNonce()));
};


/**
 * optional bytes accepted_order_nonce = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getAcceptedOrderNonce()`
 * @return {!Uint8Array}
 */
proto.poolrpc.SubmitOrderResponse.prototype.getAcceptedOrderNonce_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getAcceptedOrderNonce()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.SubmitOrderResponse.prototype.setAcceptedOrderNonce = function(value) {
  jspb.Message.setOneofField(this, 2, proto.poolrpc.SubmitOrderResponse.oneofGroups_[0], value);
};


proto.poolrpc.SubmitOrderResponse.prototype.clearAcceptedOrderNonce = function() {
  jspb.Message.setOneofField(this, 2, proto.poolrpc.SubmitOrderResponse.oneofGroups_[0], undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.SubmitOrderResponse.prototype.hasAcceptedOrderNonce = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional string updated_sidecar_ticket = 3;
 * @return {string}
 */
proto.poolrpc.SubmitOrderResponse.prototype.getUpdatedSidecarTicket = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/** @param {string} value */
proto.poolrpc.SubmitOrderResponse.prototype.setUpdatedSidecarTicket = function(value) {
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
proto.poolrpc.ListOrdersRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.ListOrdersRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ListOrdersRequest.displayName = 'proto.poolrpc.ListOrdersRequest';
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
proto.poolrpc.ListOrdersRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ListOrdersRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ListOrdersRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ListOrdersRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    verbose: jspb.Message.getFieldWithDefault(msg, 1, false),
    activeOnly: jspb.Message.getFieldWithDefault(msg, 2, false)
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
 * @return {!proto.poolrpc.ListOrdersRequest}
 */
proto.poolrpc.ListOrdersRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ListOrdersRequest;
  return proto.poolrpc.ListOrdersRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ListOrdersRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ListOrdersRequest}
 */
proto.poolrpc.ListOrdersRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setVerbose(value);
      break;
    case 2:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setActiveOnly(value);
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
proto.poolrpc.ListOrdersRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ListOrdersRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ListOrdersRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ListOrdersRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getVerbose();
  if (f) {
    writer.writeBool(
      1,
      f
    );
  }
  f = message.getActiveOnly();
  if (f) {
    writer.writeBool(
      2,
      f
    );
  }
};


/**
 * optional bool verbose = 1;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.poolrpc.ListOrdersRequest.prototype.getVerbose = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 1, false));
};


/** @param {boolean} value */
proto.poolrpc.ListOrdersRequest.prototype.setVerbose = function(value) {
  jspb.Message.setProto3BooleanField(this, 1, value);
};


/**
 * optional bool active_only = 2;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.poolrpc.ListOrdersRequest.prototype.getActiveOnly = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 2, false));
};


/** @param {boolean} value */
proto.poolrpc.ListOrdersRequest.prototype.setActiveOnly = function(value) {
  jspb.Message.setProto3BooleanField(this, 2, value);
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
proto.poolrpc.ListOrdersResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.poolrpc.ListOrdersResponse.repeatedFields_, null);
};
goog.inherits(proto.poolrpc.ListOrdersResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ListOrdersResponse.displayName = 'proto.poolrpc.ListOrdersResponse';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.poolrpc.ListOrdersResponse.repeatedFields_ = [1,2];



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
proto.poolrpc.ListOrdersResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ListOrdersResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ListOrdersResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ListOrdersResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    asksList: jspb.Message.toObjectList(msg.getAsksList(),
    proto.poolrpc.Ask.toObject, includeInstance),
    bidsList: jspb.Message.toObjectList(msg.getBidsList(),
    proto.poolrpc.Bid.toObject, includeInstance)
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
 * @return {!proto.poolrpc.ListOrdersResponse}
 */
proto.poolrpc.ListOrdersResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ListOrdersResponse;
  return proto.poolrpc.ListOrdersResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ListOrdersResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ListOrdersResponse}
 */
proto.poolrpc.ListOrdersResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.Ask;
      reader.readMessage(value,proto.poolrpc.Ask.deserializeBinaryFromReader);
      msg.addAsks(value);
      break;
    case 2:
      var value = new proto.poolrpc.Bid;
      reader.readMessage(value,proto.poolrpc.Bid.deserializeBinaryFromReader);
      msg.addBids(value);
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
proto.poolrpc.ListOrdersResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ListOrdersResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ListOrdersResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ListOrdersResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAsksList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.poolrpc.Ask.serializeBinaryToWriter
    );
  }
  f = message.getBidsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      proto.poolrpc.Bid.serializeBinaryToWriter
    );
  }
};


/**
 * repeated Ask asks = 1;
 * @return {!Array<!proto.poolrpc.Ask>}
 */
proto.poolrpc.ListOrdersResponse.prototype.getAsksList = function() {
  return /** @type{!Array<!proto.poolrpc.Ask>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.Ask, 1));
};


/** @param {!Array<!proto.poolrpc.Ask>} value */
proto.poolrpc.ListOrdersResponse.prototype.setAsksList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.poolrpc.Ask=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.Ask}
 */
proto.poolrpc.ListOrdersResponse.prototype.addAsks = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.poolrpc.Ask, opt_index);
};


proto.poolrpc.ListOrdersResponse.prototype.clearAsksList = function() {
  this.setAsksList([]);
};


/**
 * repeated Bid bids = 2;
 * @return {!Array<!proto.poolrpc.Bid>}
 */
proto.poolrpc.ListOrdersResponse.prototype.getBidsList = function() {
  return /** @type{!Array<!proto.poolrpc.Bid>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.Bid, 2));
};


/** @param {!Array<!proto.poolrpc.Bid>} value */
proto.poolrpc.ListOrdersResponse.prototype.setBidsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.poolrpc.Bid=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.Bid}
 */
proto.poolrpc.ListOrdersResponse.prototype.addBids = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.poolrpc.Bid, opt_index);
};


proto.poolrpc.ListOrdersResponse.prototype.clearBidsList = function() {
  this.setBidsList([]);
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
proto.poolrpc.CancelOrderRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.CancelOrderRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.CancelOrderRequest.displayName = 'proto.poolrpc.CancelOrderRequest';
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
proto.poolrpc.CancelOrderRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.CancelOrderRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.CancelOrderRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.CancelOrderRequest.toObject = function(includeInstance, msg) {
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
 * @return {!proto.poolrpc.CancelOrderRequest}
 */
proto.poolrpc.CancelOrderRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.CancelOrderRequest;
  return proto.poolrpc.CancelOrderRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.CancelOrderRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.CancelOrderRequest}
 */
proto.poolrpc.CancelOrderRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.poolrpc.CancelOrderRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.CancelOrderRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.CancelOrderRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.CancelOrderRequest.serializeBinaryToWriter = function(message, writer) {
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
proto.poolrpc.CancelOrderRequest.prototype.getOrderNonce = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes order_nonce = 1;
 * This is a type-conversion wrapper around `getOrderNonce()`
 * @return {string}
 */
proto.poolrpc.CancelOrderRequest.prototype.getOrderNonce_asB64 = function() {
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
proto.poolrpc.CancelOrderRequest.prototype.getOrderNonce_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getOrderNonce()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.CancelOrderRequest.prototype.setOrderNonce = function(value) {
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
proto.poolrpc.CancelOrderResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.CancelOrderResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.CancelOrderResponse.displayName = 'proto.poolrpc.CancelOrderResponse';
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
proto.poolrpc.CancelOrderResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.CancelOrderResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.CancelOrderResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.CancelOrderResponse.toObject = function(includeInstance, msg) {
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
 * @return {!proto.poolrpc.CancelOrderResponse}
 */
proto.poolrpc.CancelOrderResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.CancelOrderResponse;
  return proto.poolrpc.CancelOrderResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.CancelOrderResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.CancelOrderResponse}
 */
proto.poolrpc.CancelOrderResponse.deserializeBinaryFromReader = function(msg, reader) {
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
proto.poolrpc.CancelOrderResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.CancelOrderResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.CancelOrderResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.CancelOrderResponse.serializeBinaryToWriter = function(message, writer) {
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
proto.poolrpc.Order = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.poolrpc.Order.repeatedFields_, null);
};
goog.inherits(proto.poolrpc.Order, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.Order.displayName = 'proto.poolrpc.Order';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.poolrpc.Order.repeatedFields_ = [11,14,15];



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
proto.poolrpc.Order.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.Order.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.Order} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.Order.toObject = function(includeInstance, msg) {
  var f, obj = {
    traderKey: msg.getTraderKey_asB64(),
    rateFixed: jspb.Message.getFieldWithDefault(msg, 2, 0),
    amt: jspb.Message.getFieldWithDefault(msg, 3, "0"),
    maxBatchFeeRateSatPerKw: jspb.Message.getFieldWithDefault(msg, 4, "0"),
    orderNonce: msg.getOrderNonce_asB64(),
    state: jspb.Message.getFieldWithDefault(msg, 6, 0),
    units: jspb.Message.getFieldWithDefault(msg, 7, 0),
    unitsUnfulfilled: jspb.Message.getFieldWithDefault(msg, 8, 0),
    reservedValueSat: jspb.Message.getFieldWithDefault(msg, 9, "0"),
    creationTimestampNs: jspb.Message.getFieldWithDefault(msg, 10, "0"),
    eventsList: jspb.Message.toObjectList(msg.getEventsList(),
    proto.poolrpc.OrderEvent.toObject, includeInstance),
    minUnitsMatch: jspb.Message.getFieldWithDefault(msg, 12, 0),
    channelType: jspb.Message.getFieldWithDefault(msg, 13, 0),
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
 * @return {!proto.poolrpc.Order}
 */
proto.poolrpc.Order.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.Order;
  return proto.poolrpc.Order.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.Order} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.Order}
 */
proto.poolrpc.Order.deserializeBinaryFromReader = function(msg, reader) {
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
      msg.setMaxBatchFeeRateSatPerKw(value);
      break;
    case 5:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setOrderNonce(value);
      break;
    case 6:
      var value = /** @type {!proto.poolrpc.OrderState} */ (reader.readEnum());
      msg.setState(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setUnits(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setUnitsUnfulfilled(value);
      break;
    case 9:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setReservedValueSat(value);
      break;
    case 10:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setCreationTimestampNs(value);
      break;
    case 11:
      var value = new proto.poolrpc.OrderEvent;
      reader.readMessage(value,proto.poolrpc.OrderEvent.deserializeBinaryFromReader);
      msg.addEvents(value);
      break;
    case 12:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setMinUnitsMatch(value);
      break;
    case 13:
      var value = /** @type {!proto.poolrpc.OrderChannelType} */ (reader.readEnum());
      msg.setChannelType(value);
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
proto.poolrpc.Order.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.Order.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.Order} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.Order.serializeBinaryToWriter = function(message, writer) {
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
  f = message.getMaxBatchFeeRateSatPerKw();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      4,
      f
    );
  }
  f = message.getOrderNonce_asU8();
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
  f = message.getUnits();
  if (f !== 0) {
    writer.writeUint32(
      7,
      f
    );
  }
  f = message.getUnitsUnfulfilled();
  if (f !== 0) {
    writer.writeUint32(
      8,
      f
    );
  }
  f = message.getReservedValueSat();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      9,
      f
    );
  }
  f = message.getCreationTimestampNs();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      10,
      f
    );
  }
  f = message.getEventsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      11,
      f,
      proto.poolrpc.OrderEvent.serializeBinaryToWriter
    );
  }
  f = message.getMinUnitsMatch();
  if (f !== 0) {
    writer.writeUint32(
      12,
      f
    );
  }
  f = message.getChannelType();
  if (f !== 0.0) {
    writer.writeEnum(
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
proto.poolrpc.Order.prototype.getTraderKey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes trader_key = 1;
 * This is a type-conversion wrapper around `getTraderKey()`
 * @return {string}
 */
proto.poolrpc.Order.prototype.getTraderKey_asB64 = function() {
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
proto.poolrpc.Order.prototype.getTraderKey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getTraderKey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.Order.prototype.setTraderKey = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional uint32 rate_fixed = 2;
 * @return {number}
 */
proto.poolrpc.Order.prototype.getRateFixed = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.Order.prototype.setRateFixed = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional uint64 amt = 3;
 * @return {string}
 */
proto.poolrpc.Order.prototype.getAmt = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, "0"));
};


/** @param {string} value */
proto.poolrpc.Order.prototype.setAmt = function(value) {
  jspb.Message.setProto3StringIntField(this, 3, value);
};


/**
 * optional uint64 max_batch_fee_rate_sat_per_kw = 4;
 * @return {string}
 */
proto.poolrpc.Order.prototype.getMaxBatchFeeRateSatPerKw = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, "0"));
};


/** @param {string} value */
proto.poolrpc.Order.prototype.setMaxBatchFeeRateSatPerKw = function(value) {
  jspb.Message.setProto3StringIntField(this, 4, value);
};


/**
 * optional bytes order_nonce = 5;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.Order.prototype.getOrderNonce = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * optional bytes order_nonce = 5;
 * This is a type-conversion wrapper around `getOrderNonce()`
 * @return {string}
 */
proto.poolrpc.Order.prototype.getOrderNonce_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getOrderNonce()));
};


/**
 * optional bytes order_nonce = 5;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getOrderNonce()`
 * @return {!Uint8Array}
 */
proto.poolrpc.Order.prototype.getOrderNonce_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getOrderNonce()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.Order.prototype.setOrderNonce = function(value) {
  jspb.Message.setProto3BytesField(this, 5, value);
};


/**
 * optional OrderState state = 6;
 * @return {!proto.poolrpc.OrderState}
 */
proto.poolrpc.Order.prototype.getState = function() {
  return /** @type {!proto.poolrpc.OrderState} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/** @param {!proto.poolrpc.OrderState} value */
proto.poolrpc.Order.prototype.setState = function(value) {
  jspb.Message.setProto3EnumField(this, 6, value);
};


/**
 * optional uint32 units = 7;
 * @return {number}
 */
proto.poolrpc.Order.prototype.getUnits = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/** @param {number} value */
proto.poolrpc.Order.prototype.setUnits = function(value) {
  jspb.Message.setProto3IntField(this, 7, value);
};


/**
 * optional uint32 units_unfulfilled = 8;
 * @return {number}
 */
proto.poolrpc.Order.prototype.getUnitsUnfulfilled = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 8, 0));
};


/** @param {number} value */
proto.poolrpc.Order.prototype.setUnitsUnfulfilled = function(value) {
  jspb.Message.setProto3IntField(this, 8, value);
};


/**
 * optional uint64 reserved_value_sat = 9;
 * @return {string}
 */
proto.poolrpc.Order.prototype.getReservedValueSat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 9, "0"));
};


/** @param {string} value */
proto.poolrpc.Order.prototype.setReservedValueSat = function(value) {
  jspb.Message.setProto3StringIntField(this, 9, value);
};


/**
 * optional uint64 creation_timestamp_ns = 10;
 * @return {string}
 */
proto.poolrpc.Order.prototype.getCreationTimestampNs = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 10, "0"));
};


/** @param {string} value */
proto.poolrpc.Order.prototype.setCreationTimestampNs = function(value) {
  jspb.Message.setProto3StringIntField(this, 10, value);
};


/**
 * repeated OrderEvent events = 11;
 * @return {!Array<!proto.poolrpc.OrderEvent>}
 */
proto.poolrpc.Order.prototype.getEventsList = function() {
  return /** @type{!Array<!proto.poolrpc.OrderEvent>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.OrderEvent, 11));
};


/** @param {!Array<!proto.poolrpc.OrderEvent>} value */
proto.poolrpc.Order.prototype.setEventsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 11, value);
};


/**
 * @param {!proto.poolrpc.OrderEvent=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.OrderEvent}
 */
proto.poolrpc.Order.prototype.addEvents = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 11, opt_value, proto.poolrpc.OrderEvent, opt_index);
};


proto.poolrpc.Order.prototype.clearEventsList = function() {
  this.setEventsList([]);
};


/**
 * optional uint32 min_units_match = 12;
 * @return {number}
 */
proto.poolrpc.Order.prototype.getMinUnitsMatch = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 12, 0));
};


/** @param {number} value */
proto.poolrpc.Order.prototype.setMinUnitsMatch = function(value) {
  jspb.Message.setProto3IntField(this, 12, value);
};


/**
 * optional OrderChannelType channel_type = 13;
 * @return {!proto.poolrpc.OrderChannelType}
 */
proto.poolrpc.Order.prototype.getChannelType = function() {
  return /** @type {!proto.poolrpc.OrderChannelType} */ (jspb.Message.getFieldWithDefault(this, 13, 0));
};


/** @param {!proto.poolrpc.OrderChannelType} value */
proto.poolrpc.Order.prototype.setChannelType = function(value) {
  jspb.Message.setProto3EnumField(this, 13, value);
};


/**
 * repeated bytes allowed_node_ids = 14;
 * @return {!(Array<!Uint8Array>|Array<string>)}
 */
proto.poolrpc.Order.prototype.getAllowedNodeIdsList = function() {
  return /** @type {!(Array<!Uint8Array>|Array<string>)} */ (jspb.Message.getRepeatedField(this, 14));
};


/**
 * repeated bytes allowed_node_ids = 14;
 * This is a type-conversion wrapper around `getAllowedNodeIdsList()`
 * @return {!Array<string>}
 */
proto.poolrpc.Order.prototype.getAllowedNodeIdsList_asB64 = function() {
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
proto.poolrpc.Order.prototype.getAllowedNodeIdsList_asU8 = function() {
  return /** @type {!Array<!Uint8Array>} */ (jspb.Message.bytesListAsU8(
      this.getAllowedNodeIdsList()));
};


/** @param {!(Array<!Uint8Array>|Array<string>)} value */
proto.poolrpc.Order.prototype.setAllowedNodeIdsList = function(value) {
  jspb.Message.setField(this, 14, value || []);
};


/**
 * @param {!(string|Uint8Array)} value
 * @param {number=} opt_index
 */
proto.poolrpc.Order.prototype.addAllowedNodeIds = function(value, opt_index) {
  jspb.Message.addToRepeatedField(this, 14, value, opt_index);
};


proto.poolrpc.Order.prototype.clearAllowedNodeIdsList = function() {
  this.setAllowedNodeIdsList([]);
};


/**
 * repeated bytes not_allowed_node_ids = 15;
 * @return {!(Array<!Uint8Array>|Array<string>)}
 */
proto.poolrpc.Order.prototype.getNotAllowedNodeIdsList = function() {
  return /** @type {!(Array<!Uint8Array>|Array<string>)} */ (jspb.Message.getRepeatedField(this, 15));
};


/**
 * repeated bytes not_allowed_node_ids = 15;
 * This is a type-conversion wrapper around `getNotAllowedNodeIdsList()`
 * @return {!Array<string>}
 */
proto.poolrpc.Order.prototype.getNotAllowedNodeIdsList_asB64 = function() {
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
proto.poolrpc.Order.prototype.getNotAllowedNodeIdsList_asU8 = function() {
  return /** @type {!Array<!Uint8Array>} */ (jspb.Message.bytesListAsU8(
      this.getNotAllowedNodeIdsList()));
};


/** @param {!(Array<!Uint8Array>|Array<string>)} value */
proto.poolrpc.Order.prototype.setNotAllowedNodeIdsList = function(value) {
  jspb.Message.setField(this, 15, value || []);
};


/**
 * @param {!(string|Uint8Array)} value
 * @param {number=} opt_index
 */
proto.poolrpc.Order.prototype.addNotAllowedNodeIds = function(value, opt_index) {
  jspb.Message.addToRepeatedField(this, 15, value, opt_index);
};


proto.poolrpc.Order.prototype.clearNotAllowedNodeIdsList = function() {
  this.setNotAllowedNodeIdsList([]);
};


/**
 * optional AuctionType auction_type = 16;
 * @return {!proto.poolrpc.AuctionType}
 */
proto.poolrpc.Order.prototype.getAuctionType = function() {
  return /** @type {!proto.poolrpc.AuctionType} */ (jspb.Message.getFieldWithDefault(this, 16, 0));
};


/** @param {!proto.poolrpc.AuctionType} value */
proto.poolrpc.Order.prototype.setAuctionType = function(value) {
  jspb.Message.setProto3EnumField(this, 16, value);
};


/**
 * optional bool is_public = 17;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.poolrpc.Order.prototype.getIsPublic = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 17, false));
};


/** @param {boolean} value */
proto.poolrpc.Order.prototype.setIsPublic = function(value) {
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
proto.poolrpc.Bid = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.Bid, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.Bid.displayName = 'proto.poolrpc.Bid';
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
proto.poolrpc.Bid.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.Bid.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.Bid} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.Bid.toObject = function(includeInstance, msg) {
  var f, obj = {
    details: (f = msg.getDetails()) && proto.poolrpc.Order.toObject(includeInstance, f),
    leaseDurationBlocks: jspb.Message.getFieldWithDefault(msg, 2, 0),
    version: jspb.Message.getFieldWithDefault(msg, 3, 0),
    minNodeTier: jspb.Message.getFieldWithDefault(msg, 4, 0),
    selfChanBalance: jspb.Message.getFieldWithDefault(msg, 5, "0"),
    sidecarTicket: jspb.Message.getFieldWithDefault(msg, 6, ""),
    unannouncedChannel: jspb.Message.getFieldWithDefault(msg, 7, false),
    zeroConfChannel: jspb.Message.getFieldWithDefault(msg, 8, false)
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
 * @return {!proto.poolrpc.Bid}
 */
proto.poolrpc.Bid.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.Bid;
  return proto.poolrpc.Bid.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.Bid} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.Bid}
 */
proto.poolrpc.Bid.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.Order;
      reader.readMessage(value,proto.poolrpc.Order.deserializeBinaryFromReader);
      msg.setDetails(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setLeaseDurationBlocks(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setVersion(value);
      break;
    case 4:
      var value = /** @type {!proto.poolrpc.NodeTier} */ (reader.readEnum());
      msg.setMinNodeTier(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setSelfChanBalance(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readString());
      msg.setSidecarTicket(value);
      break;
    case 7:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setUnannouncedChannel(value);
      break;
    case 8:
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
proto.poolrpc.Bid.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.Bid.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.Bid} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.Bid.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDetails();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.poolrpc.Order.serializeBinaryToWriter
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
      3,
      f
    );
  }
  f = message.getMinNodeTier();
  if (f !== 0.0) {
    writer.writeEnum(
      4,
      f
    );
  }
  f = message.getSelfChanBalance();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      5,
      f
    );
  }
  f = message.getSidecarTicket();
  if (f.length > 0) {
    writer.writeString(
      6,
      f
    );
  }
  f = message.getUnannouncedChannel();
  if (f) {
    writer.writeBool(
      7,
      f
    );
  }
  f = message.getZeroConfChannel();
  if (f) {
    writer.writeBool(
      8,
      f
    );
  }
};


/**
 * optional Order details = 1;
 * @return {?proto.poolrpc.Order}
 */
proto.poolrpc.Bid.prototype.getDetails = function() {
  return /** @type{?proto.poolrpc.Order} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.Order, 1));
};


/** @param {?proto.poolrpc.Order|undefined} value */
proto.poolrpc.Bid.prototype.setDetails = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


proto.poolrpc.Bid.prototype.clearDetails = function() {
  this.setDetails(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.Bid.prototype.hasDetails = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional uint32 lease_duration_blocks = 2;
 * @return {number}
 */
proto.poolrpc.Bid.prototype.getLeaseDurationBlocks = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.Bid.prototype.setLeaseDurationBlocks = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional uint32 version = 3;
 * @return {number}
 */
proto.poolrpc.Bid.prototype.getVersion = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {number} value */
proto.poolrpc.Bid.prototype.setVersion = function(value) {
  jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional NodeTier min_node_tier = 4;
 * @return {!proto.poolrpc.NodeTier}
 */
proto.poolrpc.Bid.prototype.getMinNodeTier = function() {
  return /** @type {!proto.poolrpc.NodeTier} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {!proto.poolrpc.NodeTier} value */
proto.poolrpc.Bid.prototype.setMinNodeTier = function(value) {
  jspb.Message.setProto3EnumField(this, 4, value);
};


/**
 * optional uint64 self_chan_balance = 5;
 * @return {string}
 */
proto.poolrpc.Bid.prototype.getSelfChanBalance = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, "0"));
};


/** @param {string} value */
proto.poolrpc.Bid.prototype.setSelfChanBalance = function(value) {
  jspb.Message.setProto3StringIntField(this, 5, value);
};


/**
 * optional string sidecar_ticket = 6;
 * @return {string}
 */
proto.poolrpc.Bid.prototype.getSidecarTicket = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
};


/** @param {string} value */
proto.poolrpc.Bid.prototype.setSidecarTicket = function(value) {
  jspb.Message.setProto3StringField(this, 6, value);
};


/**
 * optional bool unannounced_channel = 7;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.poolrpc.Bid.prototype.getUnannouncedChannel = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 7, false));
};


/** @param {boolean} value */
proto.poolrpc.Bid.prototype.setUnannouncedChannel = function(value) {
  jspb.Message.setProto3BooleanField(this, 7, value);
};


/**
 * optional bool zero_conf_channel = 8;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.poolrpc.Bid.prototype.getZeroConfChannel = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 8, false));
};


/** @param {boolean} value */
proto.poolrpc.Bid.prototype.setZeroConfChannel = function(value) {
  jspb.Message.setProto3BooleanField(this, 8, value);
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
proto.poolrpc.Ask = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.Ask, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.Ask.displayName = 'proto.poolrpc.Ask';
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
proto.poolrpc.Ask.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.Ask.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.Ask} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.Ask.toObject = function(includeInstance, msg) {
  var f, obj = {
    details: (f = msg.getDetails()) && proto.poolrpc.Order.toObject(includeInstance, f),
    leaseDurationBlocks: jspb.Message.getFieldWithDefault(msg, 2, 0),
    version: jspb.Message.getFieldWithDefault(msg, 3, 0),
    announcementConstraints: jspb.Message.getFieldWithDefault(msg, 4, 0),
    confirmationConstraints: jspb.Message.getFieldWithDefault(msg, 5, 0)
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
 * @return {!proto.poolrpc.Ask}
 */
proto.poolrpc.Ask.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.Ask;
  return proto.poolrpc.Ask.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.Ask} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.Ask}
 */
proto.poolrpc.Ask.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.Order;
      reader.readMessage(value,proto.poolrpc.Order.deserializeBinaryFromReader);
      msg.setDetails(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setLeaseDurationBlocks(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setVersion(value);
      break;
    case 4:
      var value = /** @type {!proto.poolrpc.ChannelAnnouncementConstraints} */ (reader.readEnum());
      msg.setAnnouncementConstraints(value);
      break;
    case 5:
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
proto.poolrpc.Ask.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.Ask.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.Ask} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.Ask.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDetails();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.poolrpc.Order.serializeBinaryToWriter
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
      3,
      f
    );
  }
  f = message.getAnnouncementConstraints();
  if (f !== 0.0) {
    writer.writeEnum(
      4,
      f
    );
  }
  f = message.getConfirmationConstraints();
  if (f !== 0.0) {
    writer.writeEnum(
      5,
      f
    );
  }
};


/**
 * optional Order details = 1;
 * @return {?proto.poolrpc.Order}
 */
proto.poolrpc.Ask.prototype.getDetails = function() {
  return /** @type{?proto.poolrpc.Order} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.Order, 1));
};


/** @param {?proto.poolrpc.Order|undefined} value */
proto.poolrpc.Ask.prototype.setDetails = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


proto.poolrpc.Ask.prototype.clearDetails = function() {
  this.setDetails(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.Ask.prototype.hasDetails = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional uint32 lease_duration_blocks = 2;
 * @return {number}
 */
proto.poolrpc.Ask.prototype.getLeaseDurationBlocks = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.Ask.prototype.setLeaseDurationBlocks = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional uint32 version = 3;
 * @return {number}
 */
proto.poolrpc.Ask.prototype.getVersion = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {number} value */
proto.poolrpc.Ask.prototype.setVersion = function(value) {
  jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional ChannelAnnouncementConstraints announcement_constraints = 4;
 * @return {!proto.poolrpc.ChannelAnnouncementConstraints}
 */
proto.poolrpc.Ask.prototype.getAnnouncementConstraints = function() {
  return /** @type {!proto.poolrpc.ChannelAnnouncementConstraints} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {!proto.poolrpc.ChannelAnnouncementConstraints} value */
proto.poolrpc.Ask.prototype.setAnnouncementConstraints = function(value) {
  jspb.Message.setProto3EnumField(this, 4, value);
};


/**
 * optional ChannelConfirmationConstraints confirmation_constraints = 5;
 * @return {!proto.poolrpc.ChannelConfirmationConstraints}
 */
proto.poolrpc.Ask.prototype.getConfirmationConstraints = function() {
  return /** @type {!proto.poolrpc.ChannelConfirmationConstraints} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/** @param {!proto.poolrpc.ChannelConfirmationConstraints} value */
proto.poolrpc.Ask.prototype.setConfirmationConstraints = function(value) {
  jspb.Message.setProto3EnumField(this, 5, value);
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
proto.poolrpc.QuoteOrderRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.QuoteOrderRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.QuoteOrderRequest.displayName = 'proto.poolrpc.QuoteOrderRequest';
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
proto.poolrpc.QuoteOrderRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.QuoteOrderRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.QuoteOrderRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.QuoteOrderRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    amt: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    rateFixed: jspb.Message.getFieldWithDefault(msg, 2, 0),
    leaseDurationBlocks: jspb.Message.getFieldWithDefault(msg, 3, 0),
    maxBatchFeeRateSatPerKw: jspb.Message.getFieldWithDefault(msg, 4, "0"),
    minUnitsMatch: jspb.Message.getFieldWithDefault(msg, 5, 0)
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
 * @return {!proto.poolrpc.QuoteOrderRequest}
 */
proto.poolrpc.QuoteOrderRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.QuoteOrderRequest;
  return proto.poolrpc.QuoteOrderRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.QuoteOrderRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.QuoteOrderRequest}
 */
proto.poolrpc.QuoteOrderRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setAmt(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setRateFixed(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setLeaseDurationBlocks(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setMaxBatchFeeRateSatPerKw(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setMinUnitsMatch(value);
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
proto.poolrpc.QuoteOrderRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.QuoteOrderRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.QuoteOrderRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.QuoteOrderRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAmt();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
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
  f = message.getLeaseDurationBlocks();
  if (f !== 0) {
    writer.writeUint32(
      3,
      f
    );
  }
  f = message.getMaxBatchFeeRateSatPerKw();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      4,
      f
    );
  }
  f = message.getMinUnitsMatch();
  if (f !== 0) {
    writer.writeUint32(
      5,
      f
    );
  }
};


/**
 * optional uint64 amt = 1;
 * @return {string}
 */
proto.poolrpc.QuoteOrderRequest.prototype.getAmt = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/** @param {string} value */
proto.poolrpc.QuoteOrderRequest.prototype.setAmt = function(value) {
  jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional uint32 rate_fixed = 2;
 * @return {number}
 */
proto.poolrpc.QuoteOrderRequest.prototype.getRateFixed = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.QuoteOrderRequest.prototype.setRateFixed = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional uint32 lease_duration_blocks = 3;
 * @return {number}
 */
proto.poolrpc.QuoteOrderRequest.prototype.getLeaseDurationBlocks = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {number} value */
proto.poolrpc.QuoteOrderRequest.prototype.setLeaseDurationBlocks = function(value) {
  jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional uint64 max_batch_fee_rate_sat_per_kw = 4;
 * @return {string}
 */
proto.poolrpc.QuoteOrderRequest.prototype.getMaxBatchFeeRateSatPerKw = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, "0"));
};


/** @param {string} value */
proto.poolrpc.QuoteOrderRequest.prototype.setMaxBatchFeeRateSatPerKw = function(value) {
  jspb.Message.setProto3StringIntField(this, 4, value);
};


/**
 * optional uint32 min_units_match = 5;
 * @return {number}
 */
proto.poolrpc.QuoteOrderRequest.prototype.getMinUnitsMatch = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/** @param {number} value */
proto.poolrpc.QuoteOrderRequest.prototype.setMinUnitsMatch = function(value) {
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
proto.poolrpc.QuoteOrderResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.QuoteOrderResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.QuoteOrderResponse.displayName = 'proto.poolrpc.QuoteOrderResponse';
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
proto.poolrpc.QuoteOrderResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.QuoteOrderResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.QuoteOrderResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.QuoteOrderResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    totalPremiumSat: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    ratePerBlock: +jspb.Message.getFieldWithDefault(msg, 2, 0.0),
    ratePercent: +jspb.Message.getFieldWithDefault(msg, 3, 0.0),
    totalExecutionFeeSat: jspb.Message.getFieldWithDefault(msg, 4, "0"),
    worstCaseChainFeeSat: jspb.Message.getFieldWithDefault(msg, 5, "0")
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
 * @return {!proto.poolrpc.QuoteOrderResponse}
 */
proto.poolrpc.QuoteOrderResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.QuoteOrderResponse;
  return proto.poolrpc.QuoteOrderResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.QuoteOrderResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.QuoteOrderResponse}
 */
proto.poolrpc.QuoteOrderResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setTotalPremiumSat(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setRatePerBlock(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setRatePercent(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setTotalExecutionFeeSat(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setWorstCaseChainFeeSat(value);
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
proto.poolrpc.QuoteOrderResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.QuoteOrderResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.QuoteOrderResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.QuoteOrderResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTotalPremiumSat();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      1,
      f
    );
  }
  f = message.getRatePerBlock();
  if (f !== 0.0) {
    writer.writeDouble(
      2,
      f
    );
  }
  f = message.getRatePercent();
  if (f !== 0.0) {
    writer.writeDouble(
      3,
      f
    );
  }
  f = message.getTotalExecutionFeeSat();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      4,
      f
    );
  }
  f = message.getWorstCaseChainFeeSat();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      5,
      f
    );
  }
};


/**
 * optional uint64 total_premium_sat = 1;
 * @return {string}
 */
proto.poolrpc.QuoteOrderResponse.prototype.getTotalPremiumSat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/** @param {string} value */
proto.poolrpc.QuoteOrderResponse.prototype.setTotalPremiumSat = function(value) {
  jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional double rate_per_block = 2;
 * @return {number}
 */
proto.poolrpc.QuoteOrderResponse.prototype.getRatePerBlock = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 2, 0.0));
};


/** @param {number} value */
proto.poolrpc.QuoteOrderResponse.prototype.setRatePerBlock = function(value) {
  jspb.Message.setProto3FloatField(this, 2, value);
};


/**
 * optional double rate_percent = 3;
 * @return {number}
 */
proto.poolrpc.QuoteOrderResponse.prototype.getRatePercent = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 3, 0.0));
};


/** @param {number} value */
proto.poolrpc.QuoteOrderResponse.prototype.setRatePercent = function(value) {
  jspb.Message.setProto3FloatField(this, 3, value);
};


/**
 * optional uint64 total_execution_fee_sat = 4;
 * @return {string}
 */
proto.poolrpc.QuoteOrderResponse.prototype.getTotalExecutionFeeSat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, "0"));
};


/** @param {string} value */
proto.poolrpc.QuoteOrderResponse.prototype.setTotalExecutionFeeSat = function(value) {
  jspb.Message.setProto3StringIntField(this, 4, value);
};


/**
 * optional uint64 worst_case_chain_fee_sat = 5;
 * @return {string}
 */
proto.poolrpc.QuoteOrderResponse.prototype.getWorstCaseChainFeeSat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, "0"));
};


/** @param {string} value */
proto.poolrpc.QuoteOrderResponse.prototype.setWorstCaseChainFeeSat = function(value) {
  jspb.Message.setProto3StringIntField(this, 5, value);
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
proto.poolrpc.OrderEvent = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.poolrpc.OrderEvent.oneofGroups_);
};
goog.inherits(proto.poolrpc.OrderEvent, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.OrderEvent.displayName = 'proto.poolrpc.OrderEvent';
}
/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.poolrpc.OrderEvent.oneofGroups_ = [[3,4]];

/**
 * @enum {number}
 */
proto.poolrpc.OrderEvent.EventCase = {
  EVENT_NOT_SET: 0,
  STATE_CHANGE: 3,
  MATCHED: 4
};

/**
 * @return {proto.poolrpc.OrderEvent.EventCase}
 */
proto.poolrpc.OrderEvent.prototype.getEventCase = function() {
  return /** @type {proto.poolrpc.OrderEvent.EventCase} */(jspb.Message.computeOneofCase(this, proto.poolrpc.OrderEvent.oneofGroups_[0]));
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
proto.poolrpc.OrderEvent.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.OrderEvent.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.OrderEvent} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.OrderEvent.toObject = function(includeInstance, msg) {
  var f, obj = {
    timestampNs: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    eventStr: jspb.Message.getFieldWithDefault(msg, 2, ""),
    stateChange: (f = msg.getStateChange()) && proto.poolrpc.UpdatedEvent.toObject(includeInstance, f),
    matched: (f = msg.getMatched()) && proto.poolrpc.MatchEvent.toObject(includeInstance, f)
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
 * @return {!proto.poolrpc.OrderEvent}
 */
proto.poolrpc.OrderEvent.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.OrderEvent;
  return proto.poolrpc.OrderEvent.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.OrderEvent} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.OrderEvent}
 */
proto.poolrpc.OrderEvent.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setTimestampNs(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setEventStr(value);
      break;
    case 3:
      var value = new proto.poolrpc.UpdatedEvent;
      reader.readMessage(value,proto.poolrpc.UpdatedEvent.deserializeBinaryFromReader);
      msg.setStateChange(value);
      break;
    case 4:
      var value = new proto.poolrpc.MatchEvent;
      reader.readMessage(value,proto.poolrpc.MatchEvent.deserializeBinaryFromReader);
      msg.setMatched(value);
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
proto.poolrpc.OrderEvent.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.OrderEvent.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.OrderEvent} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.OrderEvent.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTimestampNs();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      1,
      f
    );
  }
  f = message.getEventStr();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getStateChange();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.poolrpc.UpdatedEvent.serializeBinaryToWriter
    );
  }
  f = message.getMatched();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.poolrpc.MatchEvent.serializeBinaryToWriter
    );
  }
};


/**
 * optional int64 timestamp_ns = 1;
 * @return {string}
 */
proto.poolrpc.OrderEvent.prototype.getTimestampNs = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/** @param {string} value */
proto.poolrpc.OrderEvent.prototype.setTimestampNs = function(value) {
  jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional string event_str = 2;
 * @return {string}
 */
proto.poolrpc.OrderEvent.prototype.getEventStr = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/** @param {string} value */
proto.poolrpc.OrderEvent.prototype.setEventStr = function(value) {
  jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional UpdatedEvent state_change = 3;
 * @return {?proto.poolrpc.UpdatedEvent}
 */
proto.poolrpc.OrderEvent.prototype.getStateChange = function() {
  return /** @type{?proto.poolrpc.UpdatedEvent} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.UpdatedEvent, 3));
};


/** @param {?proto.poolrpc.UpdatedEvent|undefined} value */
proto.poolrpc.OrderEvent.prototype.setStateChange = function(value) {
  jspb.Message.setOneofWrapperField(this, 3, proto.poolrpc.OrderEvent.oneofGroups_[0], value);
};


proto.poolrpc.OrderEvent.prototype.clearStateChange = function() {
  this.setStateChange(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.OrderEvent.prototype.hasStateChange = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional MatchEvent matched = 4;
 * @return {?proto.poolrpc.MatchEvent}
 */
proto.poolrpc.OrderEvent.prototype.getMatched = function() {
  return /** @type{?proto.poolrpc.MatchEvent} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.MatchEvent, 4));
};


/** @param {?proto.poolrpc.MatchEvent|undefined} value */
proto.poolrpc.OrderEvent.prototype.setMatched = function(value) {
  jspb.Message.setOneofWrapperField(this, 4, proto.poolrpc.OrderEvent.oneofGroups_[0], value);
};


proto.poolrpc.OrderEvent.prototype.clearMatched = function() {
  this.setMatched(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.OrderEvent.prototype.hasMatched = function() {
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
proto.poolrpc.UpdatedEvent = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.UpdatedEvent, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.UpdatedEvent.displayName = 'proto.poolrpc.UpdatedEvent';
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
proto.poolrpc.UpdatedEvent.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.UpdatedEvent.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.UpdatedEvent} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.UpdatedEvent.toObject = function(includeInstance, msg) {
  var f, obj = {
    previousState: jspb.Message.getFieldWithDefault(msg, 1, 0),
    newState: jspb.Message.getFieldWithDefault(msg, 2, 0),
    unitsFilled: jspb.Message.getFieldWithDefault(msg, 3, 0)
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
 * @return {!proto.poolrpc.UpdatedEvent}
 */
proto.poolrpc.UpdatedEvent.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.UpdatedEvent;
  return proto.poolrpc.UpdatedEvent.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.UpdatedEvent} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.UpdatedEvent}
 */
proto.poolrpc.UpdatedEvent.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.poolrpc.OrderState} */ (reader.readEnum());
      msg.setPreviousState(value);
      break;
    case 2:
      var value = /** @type {!proto.poolrpc.OrderState} */ (reader.readEnum());
      msg.setNewState(value);
      break;
    case 3:
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
proto.poolrpc.UpdatedEvent.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.UpdatedEvent.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.UpdatedEvent} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.UpdatedEvent.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPreviousState();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getNewState();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = message.getUnitsFilled();
  if (f !== 0) {
    writer.writeUint32(
      3,
      f
    );
  }
};


/**
 * optional OrderState previous_state = 1;
 * @return {!proto.poolrpc.OrderState}
 */
proto.poolrpc.UpdatedEvent.prototype.getPreviousState = function() {
  return /** @type {!proto.poolrpc.OrderState} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/** @param {!proto.poolrpc.OrderState} value */
proto.poolrpc.UpdatedEvent.prototype.setPreviousState = function(value) {
  jspb.Message.setProto3EnumField(this, 1, value);
};


/**
 * optional OrderState new_state = 2;
 * @return {!proto.poolrpc.OrderState}
 */
proto.poolrpc.UpdatedEvent.prototype.getNewState = function() {
  return /** @type {!proto.poolrpc.OrderState} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {!proto.poolrpc.OrderState} value */
proto.poolrpc.UpdatedEvent.prototype.setNewState = function(value) {
  jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional uint32 units_filled = 3;
 * @return {number}
 */
proto.poolrpc.UpdatedEvent.prototype.getUnitsFilled = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {number} value */
proto.poolrpc.UpdatedEvent.prototype.setUnitsFilled = function(value) {
  jspb.Message.setProto3IntField(this, 3, value);
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
proto.poolrpc.MatchEvent = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.MatchEvent, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.MatchEvent.displayName = 'proto.poolrpc.MatchEvent';
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
proto.poolrpc.MatchEvent.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.MatchEvent.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.MatchEvent} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.MatchEvent.toObject = function(includeInstance, msg) {
  var f, obj = {
    matchState: jspb.Message.getFieldWithDefault(msg, 1, 0),
    unitsFilled: jspb.Message.getFieldWithDefault(msg, 2, 0),
    matchedOrder: msg.getMatchedOrder_asB64(),
    rejectReason: jspb.Message.getFieldWithDefault(msg, 4, 0)
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
 * @return {!proto.poolrpc.MatchEvent}
 */
proto.poolrpc.MatchEvent.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.MatchEvent;
  return proto.poolrpc.MatchEvent.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.MatchEvent} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.MatchEvent}
 */
proto.poolrpc.MatchEvent.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.poolrpc.MatchState} */ (reader.readEnum());
      msg.setMatchState(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setUnitsFilled(value);
      break;
    case 3:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setMatchedOrder(value);
      break;
    case 4:
      var value = /** @type {!proto.poolrpc.MatchRejectReason} */ (reader.readEnum());
      msg.setRejectReason(value);
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
proto.poolrpc.MatchEvent.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.MatchEvent.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.MatchEvent} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.MatchEvent.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getMatchState();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getUnitsFilled();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
  f = message.getMatchedOrder_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      3,
      f
    );
  }
  f = message.getRejectReason();
  if (f !== 0.0) {
    writer.writeEnum(
      4,
      f
    );
  }
};


/**
 * optional MatchState match_state = 1;
 * @return {!proto.poolrpc.MatchState}
 */
proto.poolrpc.MatchEvent.prototype.getMatchState = function() {
  return /** @type {!proto.poolrpc.MatchState} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/** @param {!proto.poolrpc.MatchState} value */
proto.poolrpc.MatchEvent.prototype.setMatchState = function(value) {
  jspb.Message.setProto3EnumField(this, 1, value);
};


/**
 * optional uint32 units_filled = 2;
 * @return {number}
 */
proto.poolrpc.MatchEvent.prototype.getUnitsFilled = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.MatchEvent.prototype.setUnitsFilled = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional bytes matched_order = 3;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.MatchEvent.prototype.getMatchedOrder = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * optional bytes matched_order = 3;
 * This is a type-conversion wrapper around `getMatchedOrder()`
 * @return {string}
 */
proto.poolrpc.MatchEvent.prototype.getMatchedOrder_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getMatchedOrder()));
};


/**
 * optional bytes matched_order = 3;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getMatchedOrder()`
 * @return {!Uint8Array}
 */
proto.poolrpc.MatchEvent.prototype.getMatchedOrder_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getMatchedOrder()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.MatchEvent.prototype.setMatchedOrder = function(value) {
  jspb.Message.setProto3BytesField(this, 3, value);
};


/**
 * optional MatchRejectReason reject_reason = 4;
 * @return {!proto.poolrpc.MatchRejectReason}
 */
proto.poolrpc.MatchEvent.prototype.getRejectReason = function() {
  return /** @type {!proto.poolrpc.MatchRejectReason} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {!proto.poolrpc.MatchRejectReason} value */
proto.poolrpc.MatchEvent.prototype.setRejectReason = function(value) {
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
proto.poolrpc.RecoverAccountsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.RecoverAccountsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.RecoverAccountsRequest.displayName = 'proto.poolrpc.RecoverAccountsRequest';
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
proto.poolrpc.RecoverAccountsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.RecoverAccountsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.RecoverAccountsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.RecoverAccountsRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    fullClient: jspb.Message.getFieldWithDefault(msg, 1, false),
    accountTarget: jspb.Message.getFieldWithDefault(msg, 2, 0),
    auctioneerKey: jspb.Message.getFieldWithDefault(msg, 3, ""),
    heightHint: jspb.Message.getFieldWithDefault(msg, 4, 0),
    bitcoinHost: jspb.Message.getFieldWithDefault(msg, 5, ""),
    bitcoinUser: jspb.Message.getFieldWithDefault(msg, 6, ""),
    bitcoinPassword: jspb.Message.getFieldWithDefault(msg, 7, ""),
    bitcoinHttppostmode: jspb.Message.getFieldWithDefault(msg, 8, false),
    bitcoinUsetls: jspb.Message.getFieldWithDefault(msg, 9, false),
    bitcoinTlspath: jspb.Message.getFieldWithDefault(msg, 10, "")
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
 * @return {!proto.poolrpc.RecoverAccountsRequest}
 */
proto.poolrpc.RecoverAccountsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.RecoverAccountsRequest;
  return proto.poolrpc.RecoverAccountsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.RecoverAccountsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.RecoverAccountsRequest}
 */
proto.poolrpc.RecoverAccountsRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setFullClient(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setAccountTarget(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setAuctioneerKey(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setHeightHint(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setBitcoinHost(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readString());
      msg.setBitcoinUser(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readString());
      msg.setBitcoinPassword(value);
      break;
    case 8:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setBitcoinHttppostmode(value);
      break;
    case 9:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setBitcoinUsetls(value);
      break;
    case 10:
      var value = /** @type {string} */ (reader.readString());
      msg.setBitcoinTlspath(value);
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
proto.poolrpc.RecoverAccountsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.RecoverAccountsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.RecoverAccountsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.RecoverAccountsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getFullClient();
  if (f) {
    writer.writeBool(
      1,
      f
    );
  }
  f = message.getAccountTarget();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
  f = message.getAuctioneerKey();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getHeightHint();
  if (f !== 0) {
    writer.writeUint32(
      4,
      f
    );
  }
  f = message.getBitcoinHost();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getBitcoinUser();
  if (f.length > 0) {
    writer.writeString(
      6,
      f
    );
  }
  f = message.getBitcoinPassword();
  if (f.length > 0) {
    writer.writeString(
      7,
      f
    );
  }
  f = message.getBitcoinHttppostmode();
  if (f) {
    writer.writeBool(
      8,
      f
    );
  }
  f = message.getBitcoinUsetls();
  if (f) {
    writer.writeBool(
      9,
      f
    );
  }
  f = message.getBitcoinTlspath();
  if (f.length > 0) {
    writer.writeString(
      10,
      f
    );
  }
};


/**
 * optional bool full_client = 1;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.poolrpc.RecoverAccountsRequest.prototype.getFullClient = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 1, false));
};


/** @param {boolean} value */
proto.poolrpc.RecoverAccountsRequest.prototype.setFullClient = function(value) {
  jspb.Message.setProto3BooleanField(this, 1, value);
};


/**
 * optional uint32 account_target = 2;
 * @return {number}
 */
proto.poolrpc.RecoverAccountsRequest.prototype.getAccountTarget = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.RecoverAccountsRequest.prototype.setAccountTarget = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional string auctioneer_key = 3;
 * @return {string}
 */
proto.poolrpc.RecoverAccountsRequest.prototype.getAuctioneerKey = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/** @param {string} value */
proto.poolrpc.RecoverAccountsRequest.prototype.setAuctioneerKey = function(value) {
  jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional uint32 height_hint = 4;
 * @return {number}
 */
proto.poolrpc.RecoverAccountsRequest.prototype.getHeightHint = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {number} value */
proto.poolrpc.RecoverAccountsRequest.prototype.setHeightHint = function(value) {
  jspb.Message.setProto3IntField(this, 4, value);
};


/**
 * optional string bitcoin_host = 5;
 * @return {string}
 */
proto.poolrpc.RecoverAccountsRequest.prototype.getBitcoinHost = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/** @param {string} value */
proto.poolrpc.RecoverAccountsRequest.prototype.setBitcoinHost = function(value) {
  jspb.Message.setProto3StringField(this, 5, value);
};


/**
 * optional string bitcoin_user = 6;
 * @return {string}
 */
proto.poolrpc.RecoverAccountsRequest.prototype.getBitcoinUser = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
};


/** @param {string} value */
proto.poolrpc.RecoverAccountsRequest.prototype.setBitcoinUser = function(value) {
  jspb.Message.setProto3StringField(this, 6, value);
};


/**
 * optional string bitcoin_password = 7;
 * @return {string}
 */
proto.poolrpc.RecoverAccountsRequest.prototype.getBitcoinPassword = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, ""));
};


/** @param {string} value */
proto.poolrpc.RecoverAccountsRequest.prototype.setBitcoinPassword = function(value) {
  jspb.Message.setProto3StringField(this, 7, value);
};


/**
 * optional bool bitcoin_httppostmode = 8;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.poolrpc.RecoverAccountsRequest.prototype.getBitcoinHttppostmode = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 8, false));
};


/** @param {boolean} value */
proto.poolrpc.RecoverAccountsRequest.prototype.setBitcoinHttppostmode = function(value) {
  jspb.Message.setProto3BooleanField(this, 8, value);
};


/**
 * optional bool bitcoin_usetls = 9;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.poolrpc.RecoverAccountsRequest.prototype.getBitcoinUsetls = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 9, false));
};


/** @param {boolean} value */
proto.poolrpc.RecoverAccountsRequest.prototype.setBitcoinUsetls = function(value) {
  jspb.Message.setProto3BooleanField(this, 9, value);
};


/**
 * optional string bitcoin_tlspath = 10;
 * @return {string}
 */
proto.poolrpc.RecoverAccountsRequest.prototype.getBitcoinTlspath = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 10, ""));
};


/** @param {string} value */
proto.poolrpc.RecoverAccountsRequest.prototype.setBitcoinTlspath = function(value) {
  jspb.Message.setProto3StringField(this, 10, value);
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
proto.poolrpc.RecoverAccountsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.RecoverAccountsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.RecoverAccountsResponse.displayName = 'proto.poolrpc.RecoverAccountsResponse';
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
proto.poolrpc.RecoverAccountsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.RecoverAccountsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.RecoverAccountsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.RecoverAccountsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    numRecoveredAccounts: jspb.Message.getFieldWithDefault(msg, 1, 0)
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
 * @return {!proto.poolrpc.RecoverAccountsResponse}
 */
proto.poolrpc.RecoverAccountsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.RecoverAccountsResponse;
  return proto.poolrpc.RecoverAccountsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.RecoverAccountsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.RecoverAccountsResponse}
 */
proto.poolrpc.RecoverAccountsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setNumRecoveredAccounts(value);
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
proto.poolrpc.RecoverAccountsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.RecoverAccountsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.RecoverAccountsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.RecoverAccountsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getNumRecoveredAccounts();
  if (f !== 0) {
    writer.writeUint32(
      1,
      f
    );
  }
};


/**
 * optional uint32 num_recovered_accounts = 1;
 * @return {number}
 */
proto.poolrpc.RecoverAccountsResponse.prototype.getNumRecoveredAccounts = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/** @param {number} value */
proto.poolrpc.RecoverAccountsResponse.prototype.setNumRecoveredAccounts = function(value) {
  jspb.Message.setProto3IntField(this, 1, value);
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
proto.poolrpc.AccountModificationFeesRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.AccountModificationFeesRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.AccountModificationFeesRequest.displayName = 'proto.poolrpc.AccountModificationFeesRequest';
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
proto.poolrpc.AccountModificationFeesRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.AccountModificationFeesRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.AccountModificationFeesRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.AccountModificationFeesRequest.toObject = function(includeInstance, msg) {
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
 * @return {!proto.poolrpc.AccountModificationFeesRequest}
 */
proto.poolrpc.AccountModificationFeesRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.AccountModificationFeesRequest;
  return proto.poolrpc.AccountModificationFeesRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.AccountModificationFeesRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.AccountModificationFeesRequest}
 */
proto.poolrpc.AccountModificationFeesRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.poolrpc.AccountModificationFeesRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.AccountModificationFeesRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.AccountModificationFeesRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.AccountModificationFeesRequest.serializeBinaryToWriter = function(message, writer) {
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
proto.poolrpc.AccountModificationFee = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.poolrpc.AccountModificationFee.oneofGroups_);
};
goog.inherits(proto.poolrpc.AccountModificationFee, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.AccountModificationFee.displayName = 'proto.poolrpc.AccountModificationFee';
}
/**
 * Oneof group definitions for this message. Each group defines the field
 * numbers belonging to that group. When of these fields' value is set, all
 * other fields in the group are cleared. During deserialization, if multiple
 * fields are encountered for a group, only the last value seen will be kept.
 * @private {!Array<!Array<number>>}
 * @const
 */
proto.poolrpc.AccountModificationFee.oneofGroups_ = [[6,7]];

/**
 * @enum {number}
 */
proto.poolrpc.AccountModificationFee.FeeCase = {
  FEE_NOT_SET: 0,
  FEE_NULL: 6,
  FEE_VALUE: 7
};

/**
 * @return {proto.poolrpc.AccountModificationFee.FeeCase}
 */
proto.poolrpc.AccountModificationFee.prototype.getFeeCase = function() {
  return /** @type {proto.poolrpc.AccountModificationFee.FeeCase} */(jspb.Message.computeOneofCase(this, proto.poolrpc.AccountModificationFee.oneofGroups_[0]));
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
proto.poolrpc.AccountModificationFee.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.AccountModificationFee.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.AccountModificationFee} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.AccountModificationFee.toObject = function(includeInstance, msg) {
  var f, obj = {
    action: jspb.Message.getFieldWithDefault(msg, 1, ""),
    txid: jspb.Message.getFieldWithDefault(msg, 2, ""),
    blockHeight: jspb.Message.getFieldWithDefault(msg, 3, 0),
    timestamp: jspb.Message.getFieldWithDefault(msg, 4, "0"),
    outputAmount: jspb.Message.getFieldWithDefault(msg, 5, "0"),
    feeNull: jspb.Message.getFieldWithDefault(msg, 6, false),
    feeValue: jspb.Message.getFieldWithDefault(msg, 7, "0")
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
 * @return {!proto.poolrpc.AccountModificationFee}
 */
proto.poolrpc.AccountModificationFee.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.AccountModificationFee;
  return proto.poolrpc.AccountModificationFee.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.AccountModificationFee} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.AccountModificationFee}
 */
proto.poolrpc.AccountModificationFee.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setAction(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setTxid(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setBlockHeight(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setTimestamp(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setOutputAmount(value);
      break;
    case 6:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setFeeNull(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setFeeValue(value);
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
proto.poolrpc.AccountModificationFee.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.AccountModificationFee.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.AccountModificationFee} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.AccountModificationFee.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAction();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getTxid();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getBlockHeight();
  if (f !== 0) {
    writer.writeInt32(
      3,
      f
    );
  }
  f = message.getTimestamp();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      4,
      f
    );
  }
  f = message.getOutputAmount();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      5,
      f
    );
  }
  f = /** @type {boolean} */ (jspb.Message.getField(message, 6));
  if (f != null) {
    writer.writeBool(
      6,
      f
    );
  }
  f = /** @type {string} */ (jspb.Message.getField(message, 7));
  if (f != null) {
    writer.writeInt64String(
      7,
      f
    );
  }
};


/**
 * optional string action = 1;
 * @return {string}
 */
proto.poolrpc.AccountModificationFee.prototype.getAction = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/** @param {string} value */
proto.poolrpc.AccountModificationFee.prototype.setAction = function(value) {
  jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string txid = 2;
 * @return {string}
 */
proto.poolrpc.AccountModificationFee.prototype.getTxid = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/** @param {string} value */
proto.poolrpc.AccountModificationFee.prototype.setTxid = function(value) {
  jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional int32 block_height = 3;
 * @return {number}
 */
proto.poolrpc.AccountModificationFee.prototype.getBlockHeight = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {number} value */
proto.poolrpc.AccountModificationFee.prototype.setBlockHeight = function(value) {
  jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional int64 timestamp = 4;
 * @return {string}
 */
proto.poolrpc.AccountModificationFee.prototype.getTimestamp = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, "0"));
};


/** @param {string} value */
proto.poolrpc.AccountModificationFee.prototype.setTimestamp = function(value) {
  jspb.Message.setProto3StringIntField(this, 4, value);
};


/**
 * optional int64 output_amount = 5;
 * @return {string}
 */
proto.poolrpc.AccountModificationFee.prototype.getOutputAmount = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, "0"));
};


/** @param {string} value */
proto.poolrpc.AccountModificationFee.prototype.setOutputAmount = function(value) {
  jspb.Message.setProto3StringIntField(this, 5, value);
};


/**
 * optional bool fee_null = 6;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.poolrpc.AccountModificationFee.prototype.getFeeNull = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 6, false));
};


/** @param {boolean} value */
proto.poolrpc.AccountModificationFee.prototype.setFeeNull = function(value) {
  jspb.Message.setOneofField(this, 6, proto.poolrpc.AccountModificationFee.oneofGroups_[0], value);
};


proto.poolrpc.AccountModificationFee.prototype.clearFeeNull = function() {
  jspb.Message.setOneofField(this, 6, proto.poolrpc.AccountModificationFee.oneofGroups_[0], undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.AccountModificationFee.prototype.hasFeeNull = function() {
  return jspb.Message.getField(this, 6) != null;
};


/**
 * optional int64 fee_value = 7;
 * @return {string}
 */
proto.poolrpc.AccountModificationFee.prototype.getFeeValue = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, "0"));
};


/** @param {string} value */
proto.poolrpc.AccountModificationFee.prototype.setFeeValue = function(value) {
  jspb.Message.setOneofField(this, 7, proto.poolrpc.AccountModificationFee.oneofGroups_[0], value);
};


proto.poolrpc.AccountModificationFee.prototype.clearFeeValue = function() {
  jspb.Message.setOneofField(this, 7, proto.poolrpc.AccountModificationFee.oneofGroups_[0], undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.AccountModificationFee.prototype.hasFeeValue = function() {
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
proto.poolrpc.ListOfAccountModificationFees = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.poolrpc.ListOfAccountModificationFees.repeatedFields_, null);
};
goog.inherits(proto.poolrpc.ListOfAccountModificationFees, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ListOfAccountModificationFees.displayName = 'proto.poolrpc.ListOfAccountModificationFees';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.poolrpc.ListOfAccountModificationFees.repeatedFields_ = [1];



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
proto.poolrpc.ListOfAccountModificationFees.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ListOfAccountModificationFees.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ListOfAccountModificationFees} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ListOfAccountModificationFees.toObject = function(includeInstance, msg) {
  var f, obj = {
    modificationFeesList: jspb.Message.toObjectList(msg.getModificationFeesList(),
    proto.poolrpc.AccountModificationFee.toObject, includeInstance)
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
 * @return {!proto.poolrpc.ListOfAccountModificationFees}
 */
proto.poolrpc.ListOfAccountModificationFees.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ListOfAccountModificationFees;
  return proto.poolrpc.ListOfAccountModificationFees.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ListOfAccountModificationFees} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ListOfAccountModificationFees}
 */
proto.poolrpc.ListOfAccountModificationFees.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.AccountModificationFee;
      reader.readMessage(value,proto.poolrpc.AccountModificationFee.deserializeBinaryFromReader);
      msg.addModificationFees(value);
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
proto.poolrpc.ListOfAccountModificationFees.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ListOfAccountModificationFees.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ListOfAccountModificationFees} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ListOfAccountModificationFees.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getModificationFeesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.poolrpc.AccountModificationFee.serializeBinaryToWriter
    );
  }
};


/**
 * repeated AccountModificationFee modification_fees = 1;
 * @return {!Array<!proto.poolrpc.AccountModificationFee>}
 */
proto.poolrpc.ListOfAccountModificationFees.prototype.getModificationFeesList = function() {
  return /** @type{!Array<!proto.poolrpc.AccountModificationFee>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.AccountModificationFee, 1));
};


/** @param {!Array<!proto.poolrpc.AccountModificationFee>} value */
proto.poolrpc.ListOfAccountModificationFees.prototype.setModificationFeesList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.poolrpc.AccountModificationFee=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.AccountModificationFee}
 */
proto.poolrpc.ListOfAccountModificationFees.prototype.addModificationFees = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.poolrpc.AccountModificationFee, opt_index);
};


proto.poolrpc.ListOfAccountModificationFees.prototype.clearModificationFeesList = function() {
  this.setModificationFeesList([]);
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
proto.poolrpc.AccountModificationFeesResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.AccountModificationFeesResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.AccountModificationFeesResponse.displayName = 'proto.poolrpc.AccountModificationFeesResponse';
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
proto.poolrpc.AccountModificationFeesResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.AccountModificationFeesResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.AccountModificationFeesResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.AccountModificationFeesResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    accountsMap: (f = msg.getAccountsMap()) ? f.toObject(includeInstance, proto.poolrpc.ListOfAccountModificationFees.toObject) : []
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
 * @return {!proto.poolrpc.AccountModificationFeesResponse}
 */
proto.poolrpc.AccountModificationFeesResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.AccountModificationFeesResponse;
  return proto.poolrpc.AccountModificationFeesResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.AccountModificationFeesResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.AccountModificationFeesResponse}
 */
proto.poolrpc.AccountModificationFeesResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = msg.getAccountsMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readString, jspb.BinaryReader.prototype.readMessage, proto.poolrpc.ListOfAccountModificationFees.deserializeBinaryFromReader, "");
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
proto.poolrpc.AccountModificationFeesResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.AccountModificationFeesResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.AccountModificationFeesResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.AccountModificationFeesResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAccountsMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(1, writer, jspb.BinaryWriter.prototype.writeString, jspb.BinaryWriter.prototype.writeMessage, proto.poolrpc.ListOfAccountModificationFees.serializeBinaryToWriter);
  }
};


/**
 * map<string, ListOfAccountModificationFees> accounts = 1;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<string,!proto.poolrpc.ListOfAccountModificationFees>}
 */
proto.poolrpc.AccountModificationFeesResponse.prototype.getAccountsMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<string,!proto.poolrpc.ListOfAccountModificationFees>} */ (
      jspb.Message.getMapField(this, 1, opt_noLazyCreate,
      proto.poolrpc.ListOfAccountModificationFees));
};


proto.poolrpc.AccountModificationFeesResponse.prototype.clearAccountsMap = function() {
  this.getAccountsMap().clear();
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
proto.poolrpc.AuctionFeeRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.AuctionFeeRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.AuctionFeeRequest.displayName = 'proto.poolrpc.AuctionFeeRequest';
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
proto.poolrpc.AuctionFeeRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.AuctionFeeRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.AuctionFeeRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.AuctionFeeRequest.toObject = function(includeInstance, msg) {
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
 * @return {!proto.poolrpc.AuctionFeeRequest}
 */
proto.poolrpc.AuctionFeeRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.AuctionFeeRequest;
  return proto.poolrpc.AuctionFeeRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.AuctionFeeRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.AuctionFeeRequest}
 */
proto.poolrpc.AuctionFeeRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.poolrpc.AuctionFeeRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.AuctionFeeRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.AuctionFeeRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.AuctionFeeRequest.serializeBinaryToWriter = function(message, writer) {
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
proto.poolrpc.AuctionFeeResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.AuctionFeeResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.AuctionFeeResponse.displayName = 'proto.poolrpc.AuctionFeeResponse';
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
proto.poolrpc.AuctionFeeResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.AuctionFeeResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.AuctionFeeResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.AuctionFeeResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    executionFee: (f = msg.getExecutionFee()) && auctioneerrpc_auctioneer_pb.ExecutionFee.toObject(includeInstance, f)
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
 * @return {!proto.poolrpc.AuctionFeeResponse}
 */
proto.poolrpc.AuctionFeeResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.AuctionFeeResponse;
  return proto.poolrpc.AuctionFeeResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.AuctionFeeResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.AuctionFeeResponse}
 */
proto.poolrpc.AuctionFeeResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new auctioneerrpc_auctioneer_pb.ExecutionFee;
      reader.readMessage(value,auctioneerrpc_auctioneer_pb.ExecutionFee.deserializeBinaryFromReader);
      msg.setExecutionFee(value);
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
proto.poolrpc.AuctionFeeResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.AuctionFeeResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.AuctionFeeResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.AuctionFeeResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getExecutionFee();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      auctioneerrpc_auctioneer_pb.ExecutionFee.serializeBinaryToWriter
    );
  }
};


/**
 * optional ExecutionFee execution_fee = 1;
 * @return {?proto.poolrpc.ExecutionFee}
 */
proto.poolrpc.AuctionFeeResponse.prototype.getExecutionFee = function() {
  return /** @type{?proto.poolrpc.ExecutionFee} */ (
    jspb.Message.getWrapperField(this, auctioneerrpc_auctioneer_pb.ExecutionFee, 1));
};


/** @param {?proto.poolrpc.ExecutionFee|undefined} value */
proto.poolrpc.AuctionFeeResponse.prototype.setExecutionFee = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


proto.poolrpc.AuctionFeeResponse.prototype.clearExecutionFee = function() {
  this.setExecutionFee(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.AuctionFeeResponse.prototype.hasExecutionFee = function() {
  return jspb.Message.getField(this, 1) != null;
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
proto.poolrpc.Lease = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.Lease, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.Lease.displayName = 'proto.poolrpc.Lease';
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
proto.poolrpc.Lease.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.Lease.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.Lease} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.Lease.toObject = function(includeInstance, msg) {
  var f, obj = {
    channelPoint: (f = msg.getChannelPoint()) && auctioneerrpc_auctioneer_pb.OutPoint.toObject(includeInstance, f),
    channelAmtSat: jspb.Message.getFieldWithDefault(msg, 2, "0"),
    channelDurationBlocks: jspb.Message.getFieldWithDefault(msg, 3, 0),
    channelLeaseExpiry: jspb.Message.getFieldWithDefault(msg, 4, 0),
    premiumSat: jspb.Message.getFieldWithDefault(msg, 5, "0"),
    executionFeeSat: jspb.Message.getFieldWithDefault(msg, 6, "0"),
    chainFeeSat: jspb.Message.getFieldWithDefault(msg, 7, "0"),
    clearingRatePrice: jspb.Message.getFieldWithDefault(msg, 8, "0"),
    orderFixedRate: jspb.Message.getFieldWithDefault(msg, 9, "0"),
    orderNonce: msg.getOrderNonce_asB64(),
    matchedOrderNonce: msg.getMatchedOrderNonce_asB64(),
    purchased: jspb.Message.getFieldWithDefault(msg, 11, false),
    channelRemoteNodeKey: msg.getChannelRemoteNodeKey_asB64(),
    channelNodeTier: jspb.Message.getFieldWithDefault(msg, 13, 0),
    selfChanBalance: jspb.Message.getFieldWithDefault(msg, 14, "0"),
    sidecarChannel: jspb.Message.getFieldWithDefault(msg, 15, false)
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
 * @return {!proto.poolrpc.Lease}
 */
proto.poolrpc.Lease.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.Lease;
  return proto.poolrpc.Lease.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.Lease} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.Lease}
 */
proto.poolrpc.Lease.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new auctioneerrpc_auctioneer_pb.OutPoint;
      reader.readMessage(value,auctioneerrpc_auctioneer_pb.OutPoint.deserializeBinaryFromReader);
      msg.setChannelPoint(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setChannelAmtSat(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setChannelDurationBlocks(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setChannelLeaseExpiry(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setPremiumSat(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setExecutionFeeSat(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setChainFeeSat(value);
      break;
    case 8:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setClearingRatePrice(value);
      break;
    case 9:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setOrderFixedRate(value);
      break;
    case 10:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setOrderNonce(value);
      break;
    case 16:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setMatchedOrderNonce(value);
      break;
    case 11:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setPurchased(value);
      break;
    case 12:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setChannelRemoteNodeKey(value);
      break;
    case 13:
      var value = /** @type {!proto.poolrpc.NodeTier} */ (reader.readEnum());
      msg.setChannelNodeTier(value);
      break;
    case 14:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setSelfChanBalance(value);
      break;
    case 15:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setSidecarChannel(value);
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
proto.poolrpc.Lease.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.Lease.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.Lease} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.Lease.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getChannelPoint();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      auctioneerrpc_auctioneer_pb.OutPoint.serializeBinaryToWriter
    );
  }
  f = message.getChannelAmtSat();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      2,
      f
    );
  }
  f = message.getChannelDurationBlocks();
  if (f !== 0) {
    writer.writeUint32(
      3,
      f
    );
  }
  f = message.getChannelLeaseExpiry();
  if (f !== 0) {
    writer.writeUint32(
      4,
      f
    );
  }
  f = message.getPremiumSat();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      5,
      f
    );
  }
  f = message.getExecutionFeeSat();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      6,
      f
    );
  }
  f = message.getChainFeeSat();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      7,
      f
    );
  }
  f = message.getClearingRatePrice();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      8,
      f
    );
  }
  f = message.getOrderFixedRate();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      9,
      f
    );
  }
  f = message.getOrderNonce_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      10,
      f
    );
  }
  f = message.getMatchedOrderNonce_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      16,
      f
    );
  }
  f = message.getPurchased();
  if (f) {
    writer.writeBool(
      11,
      f
    );
  }
  f = message.getChannelRemoteNodeKey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      12,
      f
    );
  }
  f = message.getChannelNodeTier();
  if (f !== 0.0) {
    writer.writeEnum(
      13,
      f
    );
  }
  f = message.getSelfChanBalance();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      14,
      f
    );
  }
  f = message.getSidecarChannel();
  if (f) {
    writer.writeBool(
      15,
      f
    );
  }
};


/**
 * optional OutPoint channel_point = 1;
 * @return {?proto.poolrpc.OutPoint}
 */
proto.poolrpc.Lease.prototype.getChannelPoint = function() {
  return /** @type{?proto.poolrpc.OutPoint} */ (
    jspb.Message.getWrapperField(this, auctioneerrpc_auctioneer_pb.OutPoint, 1));
};


/** @param {?proto.poolrpc.OutPoint|undefined} value */
proto.poolrpc.Lease.prototype.setChannelPoint = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


proto.poolrpc.Lease.prototype.clearChannelPoint = function() {
  this.setChannelPoint(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.Lease.prototype.hasChannelPoint = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional uint64 channel_amt_sat = 2;
 * @return {string}
 */
proto.poolrpc.Lease.prototype.getChannelAmtSat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, "0"));
};


/** @param {string} value */
proto.poolrpc.Lease.prototype.setChannelAmtSat = function(value) {
  jspb.Message.setProto3StringIntField(this, 2, value);
};


/**
 * optional uint32 channel_duration_blocks = 3;
 * @return {number}
 */
proto.poolrpc.Lease.prototype.getChannelDurationBlocks = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {number} value */
proto.poolrpc.Lease.prototype.setChannelDurationBlocks = function(value) {
  jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional uint32 channel_lease_expiry = 4;
 * @return {number}
 */
proto.poolrpc.Lease.prototype.getChannelLeaseExpiry = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {number} value */
proto.poolrpc.Lease.prototype.setChannelLeaseExpiry = function(value) {
  jspb.Message.setProto3IntField(this, 4, value);
};


/**
 * optional uint64 premium_sat = 5;
 * @return {string}
 */
proto.poolrpc.Lease.prototype.getPremiumSat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, "0"));
};


/** @param {string} value */
proto.poolrpc.Lease.prototype.setPremiumSat = function(value) {
  jspb.Message.setProto3StringIntField(this, 5, value);
};


/**
 * optional uint64 execution_fee_sat = 6;
 * @return {string}
 */
proto.poolrpc.Lease.prototype.getExecutionFeeSat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, "0"));
};


/** @param {string} value */
proto.poolrpc.Lease.prototype.setExecutionFeeSat = function(value) {
  jspb.Message.setProto3StringIntField(this, 6, value);
};


/**
 * optional uint64 chain_fee_sat = 7;
 * @return {string}
 */
proto.poolrpc.Lease.prototype.getChainFeeSat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, "0"));
};


/** @param {string} value */
proto.poolrpc.Lease.prototype.setChainFeeSat = function(value) {
  jspb.Message.setProto3StringIntField(this, 7, value);
};


/**
 * optional uint64 clearing_rate_price = 8;
 * @return {string}
 */
proto.poolrpc.Lease.prototype.getClearingRatePrice = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 8, "0"));
};


/** @param {string} value */
proto.poolrpc.Lease.prototype.setClearingRatePrice = function(value) {
  jspb.Message.setProto3StringIntField(this, 8, value);
};


/**
 * optional uint64 order_fixed_rate = 9;
 * @return {string}
 */
proto.poolrpc.Lease.prototype.getOrderFixedRate = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 9, "0"));
};


/** @param {string} value */
proto.poolrpc.Lease.prototype.setOrderFixedRate = function(value) {
  jspb.Message.setProto3StringIntField(this, 9, value);
};


/**
 * optional bytes order_nonce = 10;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.Lease.prototype.getOrderNonce = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 10, ""));
};


/**
 * optional bytes order_nonce = 10;
 * This is a type-conversion wrapper around `getOrderNonce()`
 * @return {string}
 */
proto.poolrpc.Lease.prototype.getOrderNonce_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getOrderNonce()));
};


/**
 * optional bytes order_nonce = 10;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getOrderNonce()`
 * @return {!Uint8Array}
 */
proto.poolrpc.Lease.prototype.getOrderNonce_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getOrderNonce()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.Lease.prototype.setOrderNonce = function(value) {
  jspb.Message.setProto3BytesField(this, 10, value);
};


/**
 * optional bytes matched_order_nonce = 16;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.Lease.prototype.getMatchedOrderNonce = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 16, ""));
};


/**
 * optional bytes matched_order_nonce = 16;
 * This is a type-conversion wrapper around `getMatchedOrderNonce()`
 * @return {string}
 */
proto.poolrpc.Lease.prototype.getMatchedOrderNonce_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getMatchedOrderNonce()));
};


/**
 * optional bytes matched_order_nonce = 16;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getMatchedOrderNonce()`
 * @return {!Uint8Array}
 */
proto.poolrpc.Lease.prototype.getMatchedOrderNonce_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getMatchedOrderNonce()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.Lease.prototype.setMatchedOrderNonce = function(value) {
  jspb.Message.setProto3BytesField(this, 16, value);
};


/**
 * optional bool purchased = 11;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.poolrpc.Lease.prototype.getPurchased = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 11, false));
};


/** @param {boolean} value */
proto.poolrpc.Lease.prototype.setPurchased = function(value) {
  jspb.Message.setProto3BooleanField(this, 11, value);
};


/**
 * optional bytes channel_remote_node_key = 12;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.Lease.prototype.getChannelRemoteNodeKey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 12, ""));
};


/**
 * optional bytes channel_remote_node_key = 12;
 * This is a type-conversion wrapper around `getChannelRemoteNodeKey()`
 * @return {string}
 */
proto.poolrpc.Lease.prototype.getChannelRemoteNodeKey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getChannelRemoteNodeKey()));
};


/**
 * optional bytes channel_remote_node_key = 12;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getChannelRemoteNodeKey()`
 * @return {!Uint8Array}
 */
proto.poolrpc.Lease.prototype.getChannelRemoteNodeKey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getChannelRemoteNodeKey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.Lease.prototype.setChannelRemoteNodeKey = function(value) {
  jspb.Message.setProto3BytesField(this, 12, value);
};


/**
 * optional NodeTier channel_node_tier = 13;
 * @return {!proto.poolrpc.NodeTier}
 */
proto.poolrpc.Lease.prototype.getChannelNodeTier = function() {
  return /** @type {!proto.poolrpc.NodeTier} */ (jspb.Message.getFieldWithDefault(this, 13, 0));
};


/** @param {!proto.poolrpc.NodeTier} value */
proto.poolrpc.Lease.prototype.setChannelNodeTier = function(value) {
  jspb.Message.setProto3EnumField(this, 13, value);
};


/**
 * optional uint64 self_chan_balance = 14;
 * @return {string}
 */
proto.poolrpc.Lease.prototype.getSelfChanBalance = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 14, "0"));
};


/** @param {string} value */
proto.poolrpc.Lease.prototype.setSelfChanBalance = function(value) {
  jspb.Message.setProto3StringIntField(this, 14, value);
};


/**
 * optional bool sidecar_channel = 15;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.poolrpc.Lease.prototype.getSidecarChannel = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 15, false));
};


/** @param {boolean} value */
proto.poolrpc.Lease.prototype.setSidecarChannel = function(value) {
  jspb.Message.setProto3BooleanField(this, 15, value);
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
proto.poolrpc.LeasesRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.poolrpc.LeasesRequest.repeatedFields_, null);
};
goog.inherits(proto.poolrpc.LeasesRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.LeasesRequest.displayName = 'proto.poolrpc.LeasesRequest';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.poolrpc.LeasesRequest.repeatedFields_ = [1,2];



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
proto.poolrpc.LeasesRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.LeasesRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.LeasesRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.LeasesRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    batchIdsList: msg.getBatchIdsList_asB64(),
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
 * @return {!proto.poolrpc.LeasesRequest}
 */
proto.poolrpc.LeasesRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.LeasesRequest;
  return proto.poolrpc.LeasesRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.LeasesRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.LeasesRequest}
 */
proto.poolrpc.LeasesRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.addBatchIds(value);
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
proto.poolrpc.LeasesRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.LeasesRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.LeasesRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.LeasesRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBatchIdsList_asU8();
  if (f.length > 0) {
    writer.writeRepeatedBytes(
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
 * repeated bytes batch_ids = 1;
 * @return {!(Array<!Uint8Array>|Array<string>)}
 */
proto.poolrpc.LeasesRequest.prototype.getBatchIdsList = function() {
  return /** @type {!(Array<!Uint8Array>|Array<string>)} */ (jspb.Message.getRepeatedField(this, 1));
};


/**
 * repeated bytes batch_ids = 1;
 * This is a type-conversion wrapper around `getBatchIdsList()`
 * @return {!Array<string>}
 */
proto.poolrpc.LeasesRequest.prototype.getBatchIdsList_asB64 = function() {
  return /** @type {!Array<string>} */ (jspb.Message.bytesListAsB64(
      this.getBatchIdsList()));
};


/**
 * repeated bytes batch_ids = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getBatchIdsList()`
 * @return {!Array<!Uint8Array>}
 */
proto.poolrpc.LeasesRequest.prototype.getBatchIdsList_asU8 = function() {
  return /** @type {!Array<!Uint8Array>} */ (jspb.Message.bytesListAsU8(
      this.getBatchIdsList()));
};


/** @param {!(Array<!Uint8Array>|Array<string>)} value */
proto.poolrpc.LeasesRequest.prototype.setBatchIdsList = function(value) {
  jspb.Message.setField(this, 1, value || []);
};


/**
 * @param {!(string|Uint8Array)} value
 * @param {number=} opt_index
 */
proto.poolrpc.LeasesRequest.prototype.addBatchIds = function(value, opt_index) {
  jspb.Message.addToRepeatedField(this, 1, value, opt_index);
};


proto.poolrpc.LeasesRequest.prototype.clearBatchIdsList = function() {
  this.setBatchIdsList([]);
};


/**
 * repeated bytes accounts = 2;
 * @return {!(Array<!Uint8Array>|Array<string>)}
 */
proto.poolrpc.LeasesRequest.prototype.getAccountsList = function() {
  return /** @type {!(Array<!Uint8Array>|Array<string>)} */ (jspb.Message.getRepeatedField(this, 2));
};


/**
 * repeated bytes accounts = 2;
 * This is a type-conversion wrapper around `getAccountsList()`
 * @return {!Array<string>}
 */
proto.poolrpc.LeasesRequest.prototype.getAccountsList_asB64 = function() {
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
proto.poolrpc.LeasesRequest.prototype.getAccountsList_asU8 = function() {
  return /** @type {!Array<!Uint8Array>} */ (jspb.Message.bytesListAsU8(
      this.getAccountsList()));
};


/** @param {!(Array<!Uint8Array>|Array<string>)} value */
proto.poolrpc.LeasesRequest.prototype.setAccountsList = function(value) {
  jspb.Message.setField(this, 2, value || []);
};


/**
 * @param {!(string|Uint8Array)} value
 * @param {number=} opt_index
 */
proto.poolrpc.LeasesRequest.prototype.addAccounts = function(value, opt_index) {
  jspb.Message.addToRepeatedField(this, 2, value, opt_index);
};


proto.poolrpc.LeasesRequest.prototype.clearAccountsList = function() {
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
proto.poolrpc.LeasesResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.poolrpc.LeasesResponse.repeatedFields_, null);
};
goog.inherits(proto.poolrpc.LeasesResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.LeasesResponse.displayName = 'proto.poolrpc.LeasesResponse';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.poolrpc.LeasesResponse.repeatedFields_ = [1];



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
proto.poolrpc.LeasesResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.LeasesResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.LeasesResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.LeasesResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    leasesList: jspb.Message.toObjectList(msg.getLeasesList(),
    proto.poolrpc.Lease.toObject, includeInstance),
    totalAmtEarnedSat: jspb.Message.getFieldWithDefault(msg, 2, "0"),
    totalAmtPaidSat: jspb.Message.getFieldWithDefault(msg, 3, "0")
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
 * @return {!proto.poolrpc.LeasesResponse}
 */
proto.poolrpc.LeasesResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.LeasesResponse;
  return proto.poolrpc.LeasesResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.LeasesResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.LeasesResponse}
 */
proto.poolrpc.LeasesResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.Lease;
      reader.readMessage(value,proto.poolrpc.Lease.deserializeBinaryFromReader);
      msg.addLeases(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setTotalAmtEarnedSat(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setTotalAmtPaidSat(value);
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
proto.poolrpc.LeasesResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.LeasesResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.LeasesResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.LeasesResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getLeasesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.poolrpc.Lease.serializeBinaryToWriter
    );
  }
  f = message.getTotalAmtEarnedSat();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      2,
      f
    );
  }
  f = message.getTotalAmtPaidSat();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      3,
      f
    );
  }
};


/**
 * repeated Lease leases = 1;
 * @return {!Array<!proto.poolrpc.Lease>}
 */
proto.poolrpc.LeasesResponse.prototype.getLeasesList = function() {
  return /** @type{!Array<!proto.poolrpc.Lease>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.Lease, 1));
};


/** @param {!Array<!proto.poolrpc.Lease>} value */
proto.poolrpc.LeasesResponse.prototype.setLeasesList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.poolrpc.Lease=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.Lease}
 */
proto.poolrpc.LeasesResponse.prototype.addLeases = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.poolrpc.Lease, opt_index);
};


proto.poolrpc.LeasesResponse.prototype.clearLeasesList = function() {
  this.setLeasesList([]);
};


/**
 * optional uint64 total_amt_earned_sat = 2;
 * @return {string}
 */
proto.poolrpc.LeasesResponse.prototype.getTotalAmtEarnedSat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, "0"));
};


/** @param {string} value */
proto.poolrpc.LeasesResponse.prototype.setTotalAmtEarnedSat = function(value) {
  jspb.Message.setProto3StringIntField(this, 2, value);
};


/**
 * optional uint64 total_amt_paid_sat = 3;
 * @return {string}
 */
proto.poolrpc.LeasesResponse.prototype.getTotalAmtPaidSat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, "0"));
};


/** @param {string} value */
proto.poolrpc.LeasesResponse.prototype.setTotalAmtPaidSat = function(value) {
  jspb.Message.setProto3StringIntField(this, 3, value);
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
proto.poolrpc.TokensRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.TokensRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.TokensRequest.displayName = 'proto.poolrpc.TokensRequest';
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
proto.poolrpc.TokensRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.TokensRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.TokensRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.TokensRequest.toObject = function(includeInstance, msg) {
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
 * @return {!proto.poolrpc.TokensRequest}
 */
proto.poolrpc.TokensRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.TokensRequest;
  return proto.poolrpc.TokensRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.TokensRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.TokensRequest}
 */
proto.poolrpc.TokensRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.poolrpc.TokensRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.TokensRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.TokensRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.TokensRequest.serializeBinaryToWriter = function(message, writer) {
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
proto.poolrpc.TokensResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.poolrpc.TokensResponse.repeatedFields_, null);
};
goog.inherits(proto.poolrpc.TokensResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.TokensResponse.displayName = 'proto.poolrpc.TokensResponse';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.poolrpc.TokensResponse.repeatedFields_ = [1];



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
proto.poolrpc.TokensResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.TokensResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.TokensResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.TokensResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    tokensList: jspb.Message.toObjectList(msg.getTokensList(),
    proto.poolrpc.LsatToken.toObject, includeInstance)
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
 * @return {!proto.poolrpc.TokensResponse}
 */
proto.poolrpc.TokensResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.TokensResponse;
  return proto.poolrpc.TokensResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.TokensResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.TokensResponse}
 */
proto.poolrpc.TokensResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.LsatToken;
      reader.readMessage(value,proto.poolrpc.LsatToken.deserializeBinaryFromReader);
      msg.addTokens(value);
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
proto.poolrpc.TokensResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.TokensResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.TokensResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.TokensResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTokensList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.poolrpc.LsatToken.serializeBinaryToWriter
    );
  }
};


/**
 * repeated LsatToken tokens = 1;
 * @return {!Array<!proto.poolrpc.LsatToken>}
 */
proto.poolrpc.TokensResponse.prototype.getTokensList = function() {
  return /** @type{!Array<!proto.poolrpc.LsatToken>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.LsatToken, 1));
};


/** @param {!Array<!proto.poolrpc.LsatToken>} value */
proto.poolrpc.TokensResponse.prototype.setTokensList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.poolrpc.LsatToken=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.LsatToken}
 */
proto.poolrpc.TokensResponse.prototype.addTokens = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.poolrpc.LsatToken, opt_index);
};


proto.poolrpc.TokensResponse.prototype.clearTokensList = function() {
  this.setTokensList([]);
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
proto.poolrpc.LsatToken = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.LsatToken, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.LsatToken.displayName = 'proto.poolrpc.LsatToken';
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
proto.poolrpc.LsatToken.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.LsatToken.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.LsatToken} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.LsatToken.toObject = function(includeInstance, msg) {
  var f, obj = {
    baseMacaroon: msg.getBaseMacaroon_asB64(),
    paymentHash: msg.getPaymentHash_asB64(),
    paymentPreimage: msg.getPaymentPreimage_asB64(),
    amountPaidMsat: jspb.Message.getFieldWithDefault(msg, 4, "0"),
    routingFeePaidMsat: jspb.Message.getFieldWithDefault(msg, 5, "0"),
    timeCreated: jspb.Message.getFieldWithDefault(msg, 6, "0"),
    expired: jspb.Message.getFieldWithDefault(msg, 7, false),
    storageName: jspb.Message.getFieldWithDefault(msg, 8, "")
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
 * @return {!proto.poolrpc.LsatToken}
 */
proto.poolrpc.LsatToken.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.LsatToken;
  return proto.poolrpc.LsatToken.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.LsatToken} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.LsatToken}
 */
proto.poolrpc.LsatToken.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setBaseMacaroon(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setPaymentHash(value);
      break;
    case 3:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setPaymentPreimage(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setAmountPaidMsat(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setRoutingFeePaidMsat(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setTimeCreated(value);
      break;
    case 7:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setExpired(value);
      break;
    case 8:
      var value = /** @type {string} */ (reader.readString());
      msg.setStorageName(value);
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
proto.poolrpc.LsatToken.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.LsatToken.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.LsatToken} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.LsatToken.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBaseMacaroon_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getPaymentHash_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
  f = message.getPaymentPreimage_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      3,
      f
    );
  }
  f = message.getAmountPaidMsat();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      4,
      f
    );
  }
  f = message.getRoutingFeePaidMsat();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      5,
      f
    );
  }
  f = message.getTimeCreated();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      6,
      f
    );
  }
  f = message.getExpired();
  if (f) {
    writer.writeBool(
      7,
      f
    );
  }
  f = message.getStorageName();
  if (f.length > 0) {
    writer.writeString(
      8,
      f
    );
  }
};


/**
 * optional bytes base_macaroon = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.LsatToken.prototype.getBaseMacaroon = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes base_macaroon = 1;
 * This is a type-conversion wrapper around `getBaseMacaroon()`
 * @return {string}
 */
proto.poolrpc.LsatToken.prototype.getBaseMacaroon_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getBaseMacaroon()));
};


/**
 * optional bytes base_macaroon = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getBaseMacaroon()`
 * @return {!Uint8Array}
 */
proto.poolrpc.LsatToken.prototype.getBaseMacaroon_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getBaseMacaroon()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.LsatToken.prototype.setBaseMacaroon = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional bytes payment_hash = 2;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.LsatToken.prototype.getPaymentHash = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes payment_hash = 2;
 * This is a type-conversion wrapper around `getPaymentHash()`
 * @return {string}
 */
proto.poolrpc.LsatToken.prototype.getPaymentHash_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getPaymentHash()));
};


/**
 * optional bytes payment_hash = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getPaymentHash()`
 * @return {!Uint8Array}
 */
proto.poolrpc.LsatToken.prototype.getPaymentHash_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getPaymentHash()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.LsatToken.prototype.setPaymentHash = function(value) {
  jspb.Message.setProto3BytesField(this, 2, value);
};


/**
 * optional bytes payment_preimage = 3;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.LsatToken.prototype.getPaymentPreimage = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * optional bytes payment_preimage = 3;
 * This is a type-conversion wrapper around `getPaymentPreimage()`
 * @return {string}
 */
proto.poolrpc.LsatToken.prototype.getPaymentPreimage_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getPaymentPreimage()));
};


/**
 * optional bytes payment_preimage = 3;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getPaymentPreimage()`
 * @return {!Uint8Array}
 */
proto.poolrpc.LsatToken.prototype.getPaymentPreimage_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getPaymentPreimage()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.LsatToken.prototype.setPaymentPreimage = function(value) {
  jspb.Message.setProto3BytesField(this, 3, value);
};


/**
 * optional int64 amount_paid_msat = 4;
 * @return {string}
 */
proto.poolrpc.LsatToken.prototype.getAmountPaidMsat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, "0"));
};


/** @param {string} value */
proto.poolrpc.LsatToken.prototype.setAmountPaidMsat = function(value) {
  jspb.Message.setProto3StringIntField(this, 4, value);
};


/**
 * optional int64 routing_fee_paid_msat = 5;
 * @return {string}
 */
proto.poolrpc.LsatToken.prototype.getRoutingFeePaidMsat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, "0"));
};


/** @param {string} value */
proto.poolrpc.LsatToken.prototype.setRoutingFeePaidMsat = function(value) {
  jspb.Message.setProto3StringIntField(this, 5, value);
};


/**
 * optional int64 time_created = 6;
 * @return {string}
 */
proto.poolrpc.LsatToken.prototype.getTimeCreated = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, "0"));
};


/** @param {string} value */
proto.poolrpc.LsatToken.prototype.setTimeCreated = function(value) {
  jspb.Message.setProto3StringIntField(this, 6, value);
};


/**
 * optional bool expired = 7;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.poolrpc.LsatToken.prototype.getExpired = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 7, false));
};


/** @param {boolean} value */
proto.poolrpc.LsatToken.prototype.setExpired = function(value) {
  jspb.Message.setProto3BooleanField(this, 7, value);
};


/**
 * optional string storage_name = 8;
 * @return {string}
 */
proto.poolrpc.LsatToken.prototype.getStorageName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 8, ""));
};


/** @param {string} value */
proto.poolrpc.LsatToken.prototype.setStorageName = function(value) {
  jspb.Message.setProto3StringField(this, 8, value);
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
proto.poolrpc.LeaseDurationRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.LeaseDurationRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.LeaseDurationRequest.displayName = 'proto.poolrpc.LeaseDurationRequest';
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
proto.poolrpc.LeaseDurationRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.LeaseDurationRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.LeaseDurationRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.LeaseDurationRequest.toObject = function(includeInstance, msg) {
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
 * @return {!proto.poolrpc.LeaseDurationRequest}
 */
proto.poolrpc.LeaseDurationRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.LeaseDurationRequest;
  return proto.poolrpc.LeaseDurationRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.LeaseDurationRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.LeaseDurationRequest}
 */
proto.poolrpc.LeaseDurationRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.poolrpc.LeaseDurationRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.LeaseDurationRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.LeaseDurationRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.LeaseDurationRequest.serializeBinaryToWriter = function(message, writer) {
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
proto.poolrpc.LeaseDurationResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.LeaseDurationResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.LeaseDurationResponse.displayName = 'proto.poolrpc.LeaseDurationResponse';
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
proto.poolrpc.LeaseDurationResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.LeaseDurationResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.LeaseDurationResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.LeaseDurationResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    leaseDurationsMap: (f = msg.getLeaseDurationsMap()) ? f.toObject(includeInstance, undefined) : [],
    leaseDurationBucketsMap: (f = msg.getLeaseDurationBucketsMap()) ? f.toObject(includeInstance, undefined) : []
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
 * @return {!proto.poolrpc.LeaseDurationResponse}
 */
proto.poolrpc.LeaseDurationResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.LeaseDurationResponse;
  return proto.poolrpc.LeaseDurationResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.LeaseDurationResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.LeaseDurationResponse}
 */
proto.poolrpc.LeaseDurationResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = msg.getLeaseDurationsMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readUint32, jspb.BinaryReader.prototype.readBool, null, 0);
         });
      break;
    case 2:
      var value = msg.getLeaseDurationBucketsMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readUint32, jspb.BinaryReader.prototype.readEnum, null, 0);
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
proto.poolrpc.LeaseDurationResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.LeaseDurationResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.LeaseDurationResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.LeaseDurationResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getLeaseDurationsMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(1, writer, jspb.BinaryWriter.prototype.writeUint32, jspb.BinaryWriter.prototype.writeBool);
  }
  f = message.getLeaseDurationBucketsMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(2, writer, jspb.BinaryWriter.prototype.writeUint32, jspb.BinaryWriter.prototype.writeEnum);
  }
};


/**
 * map<uint32, bool> lease_durations = 1;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<number,boolean>}
 */
proto.poolrpc.LeaseDurationResponse.prototype.getLeaseDurationsMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<number,boolean>} */ (
      jspb.Message.getMapField(this, 1, opt_noLazyCreate,
      null));
};


proto.poolrpc.LeaseDurationResponse.prototype.clearLeaseDurationsMap = function() {
  this.getLeaseDurationsMap().clear();
};


/**
 * map<uint32, DurationBucketState> lease_duration_buckets = 2;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<number,!proto.poolrpc.DurationBucketState>}
 */
proto.poolrpc.LeaseDurationResponse.prototype.getLeaseDurationBucketsMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<number,!proto.poolrpc.DurationBucketState>} */ (
      jspb.Message.getMapField(this, 2, opt_noLazyCreate,
      null));
};


proto.poolrpc.LeaseDurationResponse.prototype.clearLeaseDurationBucketsMap = function() {
  this.getLeaseDurationBucketsMap().clear();
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
proto.poolrpc.NextBatchInfoRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.NextBatchInfoRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.NextBatchInfoRequest.displayName = 'proto.poolrpc.NextBatchInfoRequest';
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
proto.poolrpc.NextBatchInfoRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.NextBatchInfoRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.NextBatchInfoRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.NextBatchInfoRequest.toObject = function(includeInstance, msg) {
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
 * @return {!proto.poolrpc.NextBatchInfoRequest}
 */
proto.poolrpc.NextBatchInfoRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.NextBatchInfoRequest;
  return proto.poolrpc.NextBatchInfoRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.NextBatchInfoRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.NextBatchInfoRequest}
 */
proto.poolrpc.NextBatchInfoRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.poolrpc.NextBatchInfoRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.NextBatchInfoRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.NextBatchInfoRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.NextBatchInfoRequest.serializeBinaryToWriter = function(message, writer) {
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
proto.poolrpc.NextBatchInfoResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.NextBatchInfoResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.NextBatchInfoResponse.displayName = 'proto.poolrpc.NextBatchInfoResponse';
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
proto.poolrpc.NextBatchInfoResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.NextBatchInfoResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.NextBatchInfoResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.NextBatchInfoResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    confTarget: jspb.Message.getFieldWithDefault(msg, 5, 0),
    feeRateSatPerKw: jspb.Message.getFieldWithDefault(msg, 6, "0"),
    clearTimestamp: jspb.Message.getFieldWithDefault(msg, 7, "0"),
    autoRenewExtensionBlocks: jspb.Message.getFieldWithDefault(msg, 8, 0)
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
 * @return {!proto.poolrpc.NextBatchInfoResponse}
 */
proto.poolrpc.NextBatchInfoResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.NextBatchInfoResponse;
  return proto.poolrpc.NextBatchInfoResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.NextBatchInfoResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.NextBatchInfoResponse}
 */
proto.poolrpc.NextBatchInfoResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 5:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setConfTarget(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setFeeRateSatPerKw(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setClearTimestamp(value);
      break;
    case 8:
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
proto.poolrpc.NextBatchInfoResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.NextBatchInfoResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.NextBatchInfoResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.NextBatchInfoResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getConfTarget();
  if (f !== 0) {
    writer.writeUint32(
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
  f = message.getClearTimestamp();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      7,
      f
    );
  }
  f = message.getAutoRenewExtensionBlocks();
  if (f !== 0) {
    writer.writeUint32(
      8,
      f
    );
  }
};


/**
 * optional uint32 conf_target = 5;
 * @return {number}
 */
proto.poolrpc.NextBatchInfoResponse.prototype.getConfTarget = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/** @param {number} value */
proto.poolrpc.NextBatchInfoResponse.prototype.setConfTarget = function(value) {
  jspb.Message.setProto3IntField(this, 5, value);
};


/**
 * optional uint64 fee_rate_sat_per_kw = 6;
 * @return {string}
 */
proto.poolrpc.NextBatchInfoResponse.prototype.getFeeRateSatPerKw = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, "0"));
};


/** @param {string} value */
proto.poolrpc.NextBatchInfoResponse.prototype.setFeeRateSatPerKw = function(value) {
  jspb.Message.setProto3StringIntField(this, 6, value);
};


/**
 * optional uint64 clear_timestamp = 7;
 * @return {string}
 */
proto.poolrpc.NextBatchInfoResponse.prototype.getClearTimestamp = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, "0"));
};


/** @param {string} value */
proto.poolrpc.NextBatchInfoResponse.prototype.setClearTimestamp = function(value) {
  jspb.Message.setProto3StringIntField(this, 7, value);
};


/**
 * optional uint32 auto_renew_extension_blocks = 8;
 * @return {number}
 */
proto.poolrpc.NextBatchInfoResponse.prototype.getAutoRenewExtensionBlocks = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 8, 0));
};


/** @param {number} value */
proto.poolrpc.NextBatchInfoResponse.prototype.setAutoRenewExtensionBlocks = function(value) {
  jspb.Message.setProto3IntField(this, 8, value);
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
proto.poolrpc.NodeRatingRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.poolrpc.NodeRatingRequest.repeatedFields_, null);
};
goog.inherits(proto.poolrpc.NodeRatingRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.NodeRatingRequest.displayName = 'proto.poolrpc.NodeRatingRequest';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.poolrpc.NodeRatingRequest.repeatedFields_ = [1];



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
proto.poolrpc.NodeRatingRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.NodeRatingRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.NodeRatingRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.NodeRatingRequest.toObject = function(includeInstance, msg) {
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
 * @return {!proto.poolrpc.NodeRatingRequest}
 */
proto.poolrpc.NodeRatingRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.NodeRatingRequest;
  return proto.poolrpc.NodeRatingRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.NodeRatingRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.NodeRatingRequest}
 */
proto.poolrpc.NodeRatingRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.poolrpc.NodeRatingRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.NodeRatingRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.NodeRatingRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.NodeRatingRequest.serializeBinaryToWriter = function(message, writer) {
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
proto.poolrpc.NodeRatingRequest.prototype.getNodePubkeysList = function() {
  return /** @type {!(Array<!Uint8Array>|Array<string>)} */ (jspb.Message.getRepeatedField(this, 1));
};


/**
 * repeated bytes node_pubkeys = 1;
 * This is a type-conversion wrapper around `getNodePubkeysList()`
 * @return {!Array<string>}
 */
proto.poolrpc.NodeRatingRequest.prototype.getNodePubkeysList_asB64 = function() {
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
proto.poolrpc.NodeRatingRequest.prototype.getNodePubkeysList_asU8 = function() {
  return /** @type {!Array<!Uint8Array>} */ (jspb.Message.bytesListAsU8(
      this.getNodePubkeysList()));
};


/** @param {!(Array<!Uint8Array>|Array<string>)} value */
proto.poolrpc.NodeRatingRequest.prototype.setNodePubkeysList = function(value) {
  jspb.Message.setField(this, 1, value || []);
};


/**
 * @param {!(string|Uint8Array)} value
 * @param {number=} opt_index
 */
proto.poolrpc.NodeRatingRequest.prototype.addNodePubkeys = function(value, opt_index) {
  jspb.Message.addToRepeatedField(this, 1, value, opt_index);
};


proto.poolrpc.NodeRatingRequest.prototype.clearNodePubkeysList = function() {
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
proto.poolrpc.NodeRatingResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.poolrpc.NodeRatingResponse.repeatedFields_, null);
};
goog.inherits(proto.poolrpc.NodeRatingResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.NodeRatingResponse.displayName = 'proto.poolrpc.NodeRatingResponse';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.poolrpc.NodeRatingResponse.repeatedFields_ = [1];



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
proto.poolrpc.NodeRatingResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.NodeRatingResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.NodeRatingResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.NodeRatingResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    nodeRatingsList: jspb.Message.toObjectList(msg.getNodeRatingsList(),
    auctioneerrpc_auctioneer_pb.NodeRating.toObject, includeInstance)
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
 * @return {!proto.poolrpc.NodeRatingResponse}
 */
proto.poolrpc.NodeRatingResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.NodeRatingResponse;
  return proto.poolrpc.NodeRatingResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.NodeRatingResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.NodeRatingResponse}
 */
proto.poolrpc.NodeRatingResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new auctioneerrpc_auctioneer_pb.NodeRating;
      reader.readMessage(value,auctioneerrpc_auctioneer_pb.NodeRating.deserializeBinaryFromReader);
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
proto.poolrpc.NodeRatingResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.NodeRatingResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.NodeRatingResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.NodeRatingResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getNodeRatingsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      auctioneerrpc_auctioneer_pb.NodeRating.serializeBinaryToWriter
    );
  }
};


/**
 * repeated NodeRating node_ratings = 1;
 * @return {!Array<!proto.poolrpc.NodeRating>}
 */
proto.poolrpc.NodeRatingResponse.prototype.getNodeRatingsList = function() {
  return /** @type{!Array<!proto.poolrpc.NodeRating>} */ (
    jspb.Message.getRepeatedWrapperField(this, auctioneerrpc_auctioneer_pb.NodeRating, 1));
};


/** @param {!Array<!proto.poolrpc.NodeRating>} value */
proto.poolrpc.NodeRatingResponse.prototype.setNodeRatingsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.poolrpc.NodeRating=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.NodeRating}
 */
proto.poolrpc.NodeRatingResponse.prototype.addNodeRatings = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.poolrpc.NodeRating, opt_index);
};


proto.poolrpc.NodeRatingResponse.prototype.clearNodeRatingsList = function() {
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
proto.poolrpc.GetInfoRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.GetInfoRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.GetInfoRequest.displayName = 'proto.poolrpc.GetInfoRequest';
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
proto.poolrpc.GetInfoRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.GetInfoRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.GetInfoRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.GetInfoRequest.toObject = function(includeInstance, msg) {
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
 * @return {!proto.poolrpc.GetInfoRequest}
 */
proto.poolrpc.GetInfoRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.GetInfoRequest;
  return proto.poolrpc.GetInfoRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.GetInfoRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.GetInfoRequest}
 */
proto.poolrpc.GetInfoRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.poolrpc.GetInfoRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.GetInfoRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.GetInfoRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.GetInfoRequest.serializeBinaryToWriter = function(message, writer) {
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
proto.poolrpc.GetInfoResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.GetInfoResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.GetInfoResponse.displayName = 'proto.poolrpc.GetInfoResponse';
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
proto.poolrpc.GetInfoResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.GetInfoResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.GetInfoResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.GetInfoResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    version: jspb.Message.getFieldWithDefault(msg, 1, ""),
    accountsTotal: jspb.Message.getFieldWithDefault(msg, 2, 0),
    accountsActive: jspb.Message.getFieldWithDefault(msg, 3, 0),
    accountsActiveExpired: jspb.Message.getFieldWithDefault(msg, 4, 0),
    accountsArchived: jspb.Message.getFieldWithDefault(msg, 5, 0),
    ordersTotal: jspb.Message.getFieldWithDefault(msg, 6, 0),
    ordersActive: jspb.Message.getFieldWithDefault(msg, 7, 0),
    ordersArchived: jspb.Message.getFieldWithDefault(msg, 8, 0),
    currentBlockHeight: jspb.Message.getFieldWithDefault(msg, 9, 0),
    batchesInvolved: jspb.Message.getFieldWithDefault(msg, 10, 0),
    nodeRating: (f = msg.getNodeRating()) && auctioneerrpc_auctioneer_pb.NodeRating.toObject(includeInstance, f),
    lsatTokens: jspb.Message.getFieldWithDefault(msg, 12, 0),
    subscribedToAuctioneer: jspb.Message.getFieldWithDefault(msg, 13, false),
    newNodesOnly: jspb.Message.getFieldWithDefault(msg, 14, false)
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
 * @return {!proto.poolrpc.GetInfoResponse}
 */
proto.poolrpc.GetInfoResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.GetInfoResponse;
  return proto.poolrpc.GetInfoResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.GetInfoResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.GetInfoResponse}
 */
proto.poolrpc.GetInfoResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setVersion(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setAccountsTotal(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setAccountsActive(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setAccountsActiveExpired(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setAccountsArchived(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setOrdersTotal(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setOrdersActive(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setOrdersArchived(value);
      break;
    case 9:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setCurrentBlockHeight(value);
      break;
    case 10:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setBatchesInvolved(value);
      break;
    case 11:
      var value = new auctioneerrpc_auctioneer_pb.NodeRating;
      reader.readMessage(value,auctioneerrpc_auctioneer_pb.NodeRating.deserializeBinaryFromReader);
      msg.setNodeRating(value);
      break;
    case 12:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setLsatTokens(value);
      break;
    case 13:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setSubscribedToAuctioneer(value);
      break;
    case 14:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setNewNodesOnly(value);
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
proto.poolrpc.GetInfoResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.GetInfoResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.GetInfoResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.GetInfoResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getVersion();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getAccountsTotal();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
  f = message.getAccountsActive();
  if (f !== 0) {
    writer.writeUint32(
      3,
      f
    );
  }
  f = message.getAccountsActiveExpired();
  if (f !== 0) {
    writer.writeUint32(
      4,
      f
    );
  }
  f = message.getAccountsArchived();
  if (f !== 0) {
    writer.writeUint32(
      5,
      f
    );
  }
  f = message.getOrdersTotal();
  if (f !== 0) {
    writer.writeUint32(
      6,
      f
    );
  }
  f = message.getOrdersActive();
  if (f !== 0) {
    writer.writeUint32(
      7,
      f
    );
  }
  f = message.getOrdersArchived();
  if (f !== 0) {
    writer.writeUint32(
      8,
      f
    );
  }
  f = message.getCurrentBlockHeight();
  if (f !== 0) {
    writer.writeUint32(
      9,
      f
    );
  }
  f = message.getBatchesInvolved();
  if (f !== 0) {
    writer.writeUint32(
      10,
      f
    );
  }
  f = message.getNodeRating();
  if (f != null) {
    writer.writeMessage(
      11,
      f,
      auctioneerrpc_auctioneer_pb.NodeRating.serializeBinaryToWriter
    );
  }
  f = message.getLsatTokens();
  if (f !== 0) {
    writer.writeUint32(
      12,
      f
    );
  }
  f = message.getSubscribedToAuctioneer();
  if (f) {
    writer.writeBool(
      13,
      f
    );
  }
  f = message.getNewNodesOnly();
  if (f) {
    writer.writeBool(
      14,
      f
    );
  }
};


/**
 * optional string version = 1;
 * @return {string}
 */
proto.poolrpc.GetInfoResponse.prototype.getVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/** @param {string} value */
proto.poolrpc.GetInfoResponse.prototype.setVersion = function(value) {
  jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional uint32 accounts_total = 2;
 * @return {number}
 */
proto.poolrpc.GetInfoResponse.prototype.getAccountsTotal = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.GetInfoResponse.prototype.setAccountsTotal = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional uint32 accounts_active = 3;
 * @return {number}
 */
proto.poolrpc.GetInfoResponse.prototype.getAccountsActive = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {number} value */
proto.poolrpc.GetInfoResponse.prototype.setAccountsActive = function(value) {
  jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional uint32 accounts_active_expired = 4;
 * @return {number}
 */
proto.poolrpc.GetInfoResponse.prototype.getAccountsActiveExpired = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {number} value */
proto.poolrpc.GetInfoResponse.prototype.setAccountsActiveExpired = function(value) {
  jspb.Message.setProto3IntField(this, 4, value);
};


/**
 * optional uint32 accounts_archived = 5;
 * @return {number}
 */
proto.poolrpc.GetInfoResponse.prototype.getAccountsArchived = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/** @param {number} value */
proto.poolrpc.GetInfoResponse.prototype.setAccountsArchived = function(value) {
  jspb.Message.setProto3IntField(this, 5, value);
};


/**
 * optional uint32 orders_total = 6;
 * @return {number}
 */
proto.poolrpc.GetInfoResponse.prototype.getOrdersTotal = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/** @param {number} value */
proto.poolrpc.GetInfoResponse.prototype.setOrdersTotal = function(value) {
  jspb.Message.setProto3IntField(this, 6, value);
};


/**
 * optional uint32 orders_active = 7;
 * @return {number}
 */
proto.poolrpc.GetInfoResponse.prototype.getOrdersActive = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/** @param {number} value */
proto.poolrpc.GetInfoResponse.prototype.setOrdersActive = function(value) {
  jspb.Message.setProto3IntField(this, 7, value);
};


/**
 * optional uint32 orders_archived = 8;
 * @return {number}
 */
proto.poolrpc.GetInfoResponse.prototype.getOrdersArchived = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 8, 0));
};


/** @param {number} value */
proto.poolrpc.GetInfoResponse.prototype.setOrdersArchived = function(value) {
  jspb.Message.setProto3IntField(this, 8, value);
};


/**
 * optional uint32 current_block_height = 9;
 * @return {number}
 */
proto.poolrpc.GetInfoResponse.prototype.getCurrentBlockHeight = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 9, 0));
};


/** @param {number} value */
proto.poolrpc.GetInfoResponse.prototype.setCurrentBlockHeight = function(value) {
  jspb.Message.setProto3IntField(this, 9, value);
};


/**
 * optional uint32 batches_involved = 10;
 * @return {number}
 */
proto.poolrpc.GetInfoResponse.prototype.getBatchesInvolved = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 10, 0));
};


/** @param {number} value */
proto.poolrpc.GetInfoResponse.prototype.setBatchesInvolved = function(value) {
  jspb.Message.setProto3IntField(this, 10, value);
};


/**
 * optional NodeRating node_rating = 11;
 * @return {?proto.poolrpc.NodeRating}
 */
proto.poolrpc.GetInfoResponse.prototype.getNodeRating = function() {
  return /** @type{?proto.poolrpc.NodeRating} */ (
    jspb.Message.getWrapperField(this, auctioneerrpc_auctioneer_pb.NodeRating, 11));
};


/** @param {?proto.poolrpc.NodeRating|undefined} value */
proto.poolrpc.GetInfoResponse.prototype.setNodeRating = function(value) {
  jspb.Message.setWrapperField(this, 11, value);
};


proto.poolrpc.GetInfoResponse.prototype.clearNodeRating = function() {
  this.setNodeRating(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.GetInfoResponse.prototype.hasNodeRating = function() {
  return jspb.Message.getField(this, 11) != null;
};


/**
 * optional uint32 lsat_tokens = 12;
 * @return {number}
 */
proto.poolrpc.GetInfoResponse.prototype.getLsatTokens = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 12, 0));
};


/** @param {number} value */
proto.poolrpc.GetInfoResponse.prototype.setLsatTokens = function(value) {
  jspb.Message.setProto3IntField(this, 12, value);
};


/**
 * optional bool subscribed_to_auctioneer = 13;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.poolrpc.GetInfoResponse.prototype.getSubscribedToAuctioneer = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 13, false));
};


/** @param {boolean} value */
proto.poolrpc.GetInfoResponse.prototype.setSubscribedToAuctioneer = function(value) {
  jspb.Message.setProto3BooleanField(this, 13, value);
};


/**
 * optional bool new_nodes_only = 14;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.poolrpc.GetInfoResponse.prototype.getNewNodesOnly = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 14, false));
};


/** @param {boolean} value */
proto.poolrpc.GetInfoResponse.prototype.setNewNodesOnly = function(value) {
  jspb.Message.setProto3BooleanField(this, 14, value);
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
proto.poolrpc.StopDaemonRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.StopDaemonRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.StopDaemonRequest.displayName = 'proto.poolrpc.StopDaemonRequest';
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
proto.poolrpc.StopDaemonRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.StopDaemonRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.StopDaemonRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.StopDaemonRequest.toObject = function(includeInstance, msg) {
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
 * @return {!proto.poolrpc.StopDaemonRequest}
 */
proto.poolrpc.StopDaemonRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.StopDaemonRequest;
  return proto.poolrpc.StopDaemonRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.StopDaemonRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.StopDaemonRequest}
 */
proto.poolrpc.StopDaemonRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.poolrpc.StopDaemonRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.StopDaemonRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.StopDaemonRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.StopDaemonRequest.serializeBinaryToWriter = function(message, writer) {
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
proto.poolrpc.StopDaemonResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.StopDaemonResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.StopDaemonResponse.displayName = 'proto.poolrpc.StopDaemonResponse';
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
proto.poolrpc.StopDaemonResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.StopDaemonResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.StopDaemonResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.StopDaemonResponse.toObject = function(includeInstance, msg) {
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
 * @return {!proto.poolrpc.StopDaemonResponse}
 */
proto.poolrpc.StopDaemonResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.StopDaemonResponse;
  return proto.poolrpc.StopDaemonResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.StopDaemonResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.StopDaemonResponse}
 */
proto.poolrpc.StopDaemonResponse.deserializeBinaryFromReader = function(msg, reader) {
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
proto.poolrpc.StopDaemonResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.StopDaemonResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.StopDaemonResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.StopDaemonResponse.serializeBinaryToWriter = function(message, writer) {
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
proto.poolrpc.OfferSidecarRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.OfferSidecarRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.OfferSidecarRequest.displayName = 'proto.poolrpc.OfferSidecarRequest';
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
proto.poolrpc.OfferSidecarRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.OfferSidecarRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.OfferSidecarRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.OfferSidecarRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    autoNegotiate: jspb.Message.getFieldWithDefault(msg, 1, false),
    bid: (f = msg.getBid()) && proto.poolrpc.Bid.toObject(includeInstance, f)
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
 * @return {!proto.poolrpc.OfferSidecarRequest}
 */
proto.poolrpc.OfferSidecarRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.OfferSidecarRequest;
  return proto.poolrpc.OfferSidecarRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.OfferSidecarRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.OfferSidecarRequest}
 */
proto.poolrpc.OfferSidecarRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setAutoNegotiate(value);
      break;
    case 2:
      var value = new proto.poolrpc.Bid;
      reader.readMessage(value,proto.poolrpc.Bid.deserializeBinaryFromReader);
      msg.setBid(value);
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
proto.poolrpc.OfferSidecarRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.OfferSidecarRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.OfferSidecarRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.OfferSidecarRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAutoNegotiate();
  if (f) {
    writer.writeBool(
      1,
      f
    );
  }
  f = message.getBid();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.poolrpc.Bid.serializeBinaryToWriter
    );
  }
};


/**
 * optional bool auto_negotiate = 1;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.poolrpc.OfferSidecarRequest.prototype.getAutoNegotiate = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 1, false));
};


/** @param {boolean} value */
proto.poolrpc.OfferSidecarRequest.prototype.setAutoNegotiate = function(value) {
  jspb.Message.setProto3BooleanField(this, 1, value);
};


/**
 * optional Bid bid = 2;
 * @return {?proto.poolrpc.Bid}
 */
proto.poolrpc.OfferSidecarRequest.prototype.getBid = function() {
  return /** @type{?proto.poolrpc.Bid} */ (
    jspb.Message.getWrapperField(this, proto.poolrpc.Bid, 2));
};


/** @param {?proto.poolrpc.Bid|undefined} value */
proto.poolrpc.OfferSidecarRequest.prototype.setBid = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.poolrpc.OfferSidecarRequest.prototype.clearBid = function() {
  this.setBid(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.poolrpc.OfferSidecarRequest.prototype.hasBid = function() {
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
proto.poolrpc.SidecarTicket = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.SidecarTicket, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.SidecarTicket.displayName = 'proto.poolrpc.SidecarTicket';
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
proto.poolrpc.SidecarTicket.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.SidecarTicket.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.SidecarTicket} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.SidecarTicket.toObject = function(includeInstance, msg) {
  var f, obj = {
    ticket: jspb.Message.getFieldWithDefault(msg, 1, "")
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
 * @return {!proto.poolrpc.SidecarTicket}
 */
proto.poolrpc.SidecarTicket.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.SidecarTicket;
  return proto.poolrpc.SidecarTicket.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.SidecarTicket} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.SidecarTicket}
 */
proto.poolrpc.SidecarTicket.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setTicket(value);
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
proto.poolrpc.SidecarTicket.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.SidecarTicket.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.SidecarTicket} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.SidecarTicket.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTicket();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string ticket = 1;
 * @return {string}
 */
proto.poolrpc.SidecarTicket.prototype.getTicket = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/** @param {string} value */
proto.poolrpc.SidecarTicket.prototype.setTicket = function(value) {
  jspb.Message.setProto3StringField(this, 1, value);
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
proto.poolrpc.DecodedSidecarTicket = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.DecodedSidecarTicket, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.DecodedSidecarTicket.displayName = 'proto.poolrpc.DecodedSidecarTicket';
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
proto.poolrpc.DecodedSidecarTicket.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.DecodedSidecarTicket.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.DecodedSidecarTicket} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.DecodedSidecarTicket.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: msg.getId_asB64(),
    version: jspb.Message.getFieldWithDefault(msg, 2, 0),
    state: jspb.Message.getFieldWithDefault(msg, 3, ""),
    offerCapacity: jspb.Message.getFieldWithDefault(msg, 4, "0"),
    offerPushAmount: jspb.Message.getFieldWithDefault(msg, 5, "0"),
    offerLeaseDurationBlocks: jspb.Message.getFieldWithDefault(msg, 6, 0),
    offerSignPubkey: msg.getOfferSignPubkey_asB64(),
    offerSignature: msg.getOfferSignature_asB64(),
    offerAuto: jspb.Message.getFieldWithDefault(msg, 9, false),
    recipientNodePubkey: msg.getRecipientNodePubkey_asB64(),
    recipientMultisigPubkey: msg.getRecipientMultisigPubkey_asB64(),
    recipientMultisigPubkeyIndex: jspb.Message.getFieldWithDefault(msg, 12, 0),
    orderBidNonce: msg.getOrderBidNonce_asB64(),
    orderSignature: msg.getOrderSignature_asB64(),
    executionPendingChannelId: msg.getExecutionPendingChannelId_asB64(),
    encodedTicket: jspb.Message.getFieldWithDefault(msg, 16, ""),
    offerUnannouncedChannel: jspb.Message.getFieldWithDefault(msg, 17, false),
    offerZeroConfChannel: jspb.Message.getFieldWithDefault(msg, 18, false)
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
 * @return {!proto.poolrpc.DecodedSidecarTicket}
 */
proto.poolrpc.DecodedSidecarTicket.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.DecodedSidecarTicket;
  return proto.poolrpc.DecodedSidecarTicket.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.DecodedSidecarTicket} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.DecodedSidecarTicket}
 */
proto.poolrpc.DecodedSidecarTicket.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {number} */ (reader.readUint32());
      msg.setVersion(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setState(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setOfferCapacity(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setOfferPushAmount(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setOfferLeaseDurationBlocks(value);
      break;
    case 7:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setOfferSignPubkey(value);
      break;
    case 8:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setOfferSignature(value);
      break;
    case 9:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setOfferAuto(value);
      break;
    case 10:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setRecipientNodePubkey(value);
      break;
    case 11:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setRecipientMultisigPubkey(value);
      break;
    case 12:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setRecipientMultisigPubkeyIndex(value);
      break;
    case 13:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setOrderBidNonce(value);
      break;
    case 14:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setOrderSignature(value);
      break;
    case 15:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setExecutionPendingChannelId(value);
      break;
    case 16:
      var value = /** @type {string} */ (reader.readString());
      msg.setEncodedTicket(value);
      break;
    case 17:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setOfferUnannouncedChannel(value);
      break;
    case 18:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setOfferZeroConfChannel(value);
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
proto.poolrpc.DecodedSidecarTicket.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.DecodedSidecarTicket.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.DecodedSidecarTicket} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.DecodedSidecarTicket.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getVersion();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
  f = message.getState();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getOfferCapacity();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      4,
      f
    );
  }
  f = message.getOfferPushAmount();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      5,
      f
    );
  }
  f = message.getOfferLeaseDurationBlocks();
  if (f !== 0) {
    writer.writeUint32(
      6,
      f
    );
  }
  f = message.getOfferSignPubkey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      7,
      f
    );
  }
  f = message.getOfferSignature_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      8,
      f
    );
  }
  f = message.getOfferAuto();
  if (f) {
    writer.writeBool(
      9,
      f
    );
  }
  f = message.getRecipientNodePubkey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      10,
      f
    );
  }
  f = message.getRecipientMultisigPubkey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      11,
      f
    );
  }
  f = message.getRecipientMultisigPubkeyIndex();
  if (f !== 0) {
    writer.writeUint32(
      12,
      f
    );
  }
  f = message.getOrderBidNonce_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      13,
      f
    );
  }
  f = message.getOrderSignature_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      14,
      f
    );
  }
  f = message.getExecutionPendingChannelId_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      15,
      f
    );
  }
  f = message.getEncodedTicket();
  if (f.length > 0) {
    writer.writeString(
      16,
      f
    );
  }
  f = message.getOfferUnannouncedChannel();
  if (f) {
    writer.writeBool(
      17,
      f
    );
  }
  f = message.getOfferZeroConfChannel();
  if (f) {
    writer.writeBool(
      18,
      f
    );
  }
};


/**
 * optional bytes id = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getId = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes id = 1;
 * This is a type-conversion wrapper around `getId()`
 * @return {string}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getId_asB64 = function() {
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
proto.poolrpc.DecodedSidecarTicket.prototype.getId_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getId()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.DecodedSidecarTicket.prototype.setId = function(value) {
  jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional uint32 version = 2;
 * @return {number}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getVersion = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.poolrpc.DecodedSidecarTicket.prototype.setVersion = function(value) {
  jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional string state = 3;
 * @return {string}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getState = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/** @param {string} value */
proto.poolrpc.DecodedSidecarTicket.prototype.setState = function(value) {
  jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional uint64 offer_capacity = 4;
 * @return {string}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getOfferCapacity = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, "0"));
};


/** @param {string} value */
proto.poolrpc.DecodedSidecarTicket.prototype.setOfferCapacity = function(value) {
  jspb.Message.setProto3StringIntField(this, 4, value);
};


/**
 * optional uint64 offer_push_amount = 5;
 * @return {string}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getOfferPushAmount = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, "0"));
};


/** @param {string} value */
proto.poolrpc.DecodedSidecarTicket.prototype.setOfferPushAmount = function(value) {
  jspb.Message.setProto3StringIntField(this, 5, value);
};


/**
 * optional uint32 offer_lease_duration_blocks = 6;
 * @return {number}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getOfferLeaseDurationBlocks = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/** @param {number} value */
proto.poolrpc.DecodedSidecarTicket.prototype.setOfferLeaseDurationBlocks = function(value) {
  jspb.Message.setProto3IntField(this, 6, value);
};


/**
 * optional bytes offer_sign_pubkey = 7;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getOfferSignPubkey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 7, ""));
};


/**
 * optional bytes offer_sign_pubkey = 7;
 * This is a type-conversion wrapper around `getOfferSignPubkey()`
 * @return {string}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getOfferSignPubkey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getOfferSignPubkey()));
};


/**
 * optional bytes offer_sign_pubkey = 7;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getOfferSignPubkey()`
 * @return {!Uint8Array}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getOfferSignPubkey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getOfferSignPubkey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.DecodedSidecarTicket.prototype.setOfferSignPubkey = function(value) {
  jspb.Message.setProto3BytesField(this, 7, value);
};


/**
 * optional bytes offer_signature = 8;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getOfferSignature = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 8, ""));
};


/**
 * optional bytes offer_signature = 8;
 * This is a type-conversion wrapper around `getOfferSignature()`
 * @return {string}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getOfferSignature_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getOfferSignature()));
};


/**
 * optional bytes offer_signature = 8;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getOfferSignature()`
 * @return {!Uint8Array}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getOfferSignature_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getOfferSignature()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.DecodedSidecarTicket.prototype.setOfferSignature = function(value) {
  jspb.Message.setProto3BytesField(this, 8, value);
};


/**
 * optional bool offer_auto = 9;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getOfferAuto = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 9, false));
};


/** @param {boolean} value */
proto.poolrpc.DecodedSidecarTicket.prototype.setOfferAuto = function(value) {
  jspb.Message.setProto3BooleanField(this, 9, value);
};


/**
 * optional bytes recipient_node_pubkey = 10;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getRecipientNodePubkey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 10, ""));
};


/**
 * optional bytes recipient_node_pubkey = 10;
 * This is a type-conversion wrapper around `getRecipientNodePubkey()`
 * @return {string}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getRecipientNodePubkey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getRecipientNodePubkey()));
};


/**
 * optional bytes recipient_node_pubkey = 10;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getRecipientNodePubkey()`
 * @return {!Uint8Array}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getRecipientNodePubkey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getRecipientNodePubkey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.DecodedSidecarTicket.prototype.setRecipientNodePubkey = function(value) {
  jspb.Message.setProto3BytesField(this, 10, value);
};


/**
 * optional bytes recipient_multisig_pubkey = 11;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getRecipientMultisigPubkey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 11, ""));
};


/**
 * optional bytes recipient_multisig_pubkey = 11;
 * This is a type-conversion wrapper around `getRecipientMultisigPubkey()`
 * @return {string}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getRecipientMultisigPubkey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getRecipientMultisigPubkey()));
};


/**
 * optional bytes recipient_multisig_pubkey = 11;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getRecipientMultisigPubkey()`
 * @return {!Uint8Array}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getRecipientMultisigPubkey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getRecipientMultisigPubkey()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.DecodedSidecarTicket.prototype.setRecipientMultisigPubkey = function(value) {
  jspb.Message.setProto3BytesField(this, 11, value);
};


/**
 * optional uint32 recipient_multisig_pubkey_index = 12;
 * @return {number}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getRecipientMultisigPubkeyIndex = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 12, 0));
};


/** @param {number} value */
proto.poolrpc.DecodedSidecarTicket.prototype.setRecipientMultisigPubkeyIndex = function(value) {
  jspb.Message.setProto3IntField(this, 12, value);
};


/**
 * optional bytes order_bid_nonce = 13;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getOrderBidNonce = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 13, ""));
};


/**
 * optional bytes order_bid_nonce = 13;
 * This is a type-conversion wrapper around `getOrderBidNonce()`
 * @return {string}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getOrderBidNonce_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getOrderBidNonce()));
};


/**
 * optional bytes order_bid_nonce = 13;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getOrderBidNonce()`
 * @return {!Uint8Array}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getOrderBidNonce_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getOrderBidNonce()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.DecodedSidecarTicket.prototype.setOrderBidNonce = function(value) {
  jspb.Message.setProto3BytesField(this, 13, value);
};


/**
 * optional bytes order_signature = 14;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getOrderSignature = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 14, ""));
};


/**
 * optional bytes order_signature = 14;
 * This is a type-conversion wrapper around `getOrderSignature()`
 * @return {string}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getOrderSignature_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getOrderSignature()));
};


/**
 * optional bytes order_signature = 14;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getOrderSignature()`
 * @return {!Uint8Array}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getOrderSignature_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getOrderSignature()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.DecodedSidecarTicket.prototype.setOrderSignature = function(value) {
  jspb.Message.setProto3BytesField(this, 14, value);
};


/**
 * optional bytes execution_pending_channel_id = 15;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getExecutionPendingChannelId = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 15, ""));
};


/**
 * optional bytes execution_pending_channel_id = 15;
 * This is a type-conversion wrapper around `getExecutionPendingChannelId()`
 * @return {string}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getExecutionPendingChannelId_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getExecutionPendingChannelId()));
};


/**
 * optional bytes execution_pending_channel_id = 15;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getExecutionPendingChannelId()`
 * @return {!Uint8Array}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getExecutionPendingChannelId_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getExecutionPendingChannelId()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.DecodedSidecarTicket.prototype.setExecutionPendingChannelId = function(value) {
  jspb.Message.setProto3BytesField(this, 15, value);
};


/**
 * optional string encoded_ticket = 16;
 * @return {string}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getEncodedTicket = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 16, ""));
};


/** @param {string} value */
proto.poolrpc.DecodedSidecarTicket.prototype.setEncodedTicket = function(value) {
  jspb.Message.setProto3StringField(this, 16, value);
};


/**
 * optional bool offer_unannounced_channel = 17;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getOfferUnannouncedChannel = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 17, false));
};


/** @param {boolean} value */
proto.poolrpc.DecodedSidecarTicket.prototype.setOfferUnannouncedChannel = function(value) {
  jspb.Message.setProto3BooleanField(this, 17, value);
};


/**
 * optional bool offer_zero_conf_channel = 18;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.poolrpc.DecodedSidecarTicket.prototype.getOfferZeroConfChannel = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 18, false));
};


/** @param {boolean} value */
proto.poolrpc.DecodedSidecarTicket.prototype.setOfferZeroConfChannel = function(value) {
  jspb.Message.setProto3BooleanField(this, 18, value);
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
proto.poolrpc.RegisterSidecarRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.RegisterSidecarRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.RegisterSidecarRequest.displayName = 'proto.poolrpc.RegisterSidecarRequest';
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
proto.poolrpc.RegisterSidecarRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.RegisterSidecarRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.RegisterSidecarRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.RegisterSidecarRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    ticket: jspb.Message.getFieldWithDefault(msg, 1, ""),
    autoNegotiate: jspb.Message.getFieldWithDefault(msg, 2, false)
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
 * @return {!proto.poolrpc.RegisterSidecarRequest}
 */
proto.poolrpc.RegisterSidecarRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.RegisterSidecarRequest;
  return proto.poolrpc.RegisterSidecarRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.RegisterSidecarRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.RegisterSidecarRequest}
 */
proto.poolrpc.RegisterSidecarRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setTicket(value);
      break;
    case 2:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setAutoNegotiate(value);
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
proto.poolrpc.RegisterSidecarRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.RegisterSidecarRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.RegisterSidecarRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.RegisterSidecarRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTicket();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getAutoNegotiate();
  if (f) {
    writer.writeBool(
      2,
      f
    );
  }
};


/**
 * optional string ticket = 1;
 * @return {string}
 */
proto.poolrpc.RegisterSidecarRequest.prototype.getTicket = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/** @param {string} value */
proto.poolrpc.RegisterSidecarRequest.prototype.setTicket = function(value) {
  jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional bool auto_negotiate = 2;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.poolrpc.RegisterSidecarRequest.prototype.getAutoNegotiate = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 2, false));
};


/** @param {boolean} value */
proto.poolrpc.RegisterSidecarRequest.prototype.setAutoNegotiate = function(value) {
  jspb.Message.setProto3BooleanField(this, 2, value);
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
proto.poolrpc.ExpectSidecarChannelRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.ExpectSidecarChannelRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ExpectSidecarChannelRequest.displayName = 'proto.poolrpc.ExpectSidecarChannelRequest';
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
proto.poolrpc.ExpectSidecarChannelRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ExpectSidecarChannelRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ExpectSidecarChannelRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ExpectSidecarChannelRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    ticket: jspb.Message.getFieldWithDefault(msg, 1, "")
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
 * @return {!proto.poolrpc.ExpectSidecarChannelRequest}
 */
proto.poolrpc.ExpectSidecarChannelRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ExpectSidecarChannelRequest;
  return proto.poolrpc.ExpectSidecarChannelRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ExpectSidecarChannelRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ExpectSidecarChannelRequest}
 */
proto.poolrpc.ExpectSidecarChannelRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setTicket(value);
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
proto.poolrpc.ExpectSidecarChannelRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ExpectSidecarChannelRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ExpectSidecarChannelRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ExpectSidecarChannelRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTicket();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string ticket = 1;
 * @return {string}
 */
proto.poolrpc.ExpectSidecarChannelRequest.prototype.getTicket = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/** @param {string} value */
proto.poolrpc.ExpectSidecarChannelRequest.prototype.setTicket = function(value) {
  jspb.Message.setProto3StringField(this, 1, value);
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
proto.poolrpc.ExpectSidecarChannelResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.ExpectSidecarChannelResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ExpectSidecarChannelResponse.displayName = 'proto.poolrpc.ExpectSidecarChannelResponse';
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
proto.poolrpc.ExpectSidecarChannelResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ExpectSidecarChannelResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ExpectSidecarChannelResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ExpectSidecarChannelResponse.toObject = function(includeInstance, msg) {
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
 * @return {!proto.poolrpc.ExpectSidecarChannelResponse}
 */
proto.poolrpc.ExpectSidecarChannelResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ExpectSidecarChannelResponse;
  return proto.poolrpc.ExpectSidecarChannelResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ExpectSidecarChannelResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ExpectSidecarChannelResponse}
 */
proto.poolrpc.ExpectSidecarChannelResponse.deserializeBinaryFromReader = function(msg, reader) {
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
proto.poolrpc.ExpectSidecarChannelResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ExpectSidecarChannelResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ExpectSidecarChannelResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ExpectSidecarChannelResponse.serializeBinaryToWriter = function(message, writer) {
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
proto.poolrpc.ListSidecarsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.ListSidecarsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ListSidecarsRequest.displayName = 'proto.poolrpc.ListSidecarsRequest';
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
proto.poolrpc.ListSidecarsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ListSidecarsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ListSidecarsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ListSidecarsRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    sidecarId: msg.getSidecarId_asB64()
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
 * @return {!proto.poolrpc.ListSidecarsRequest}
 */
proto.poolrpc.ListSidecarsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ListSidecarsRequest;
  return proto.poolrpc.ListSidecarsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ListSidecarsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ListSidecarsRequest}
 */
proto.poolrpc.ListSidecarsRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSidecarId(value);
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
proto.poolrpc.ListSidecarsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ListSidecarsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ListSidecarsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ListSidecarsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSidecarId_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
};


/**
 * optional bytes sidecar_id = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.ListSidecarsRequest.prototype.getSidecarId = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes sidecar_id = 1;
 * This is a type-conversion wrapper around `getSidecarId()`
 * @return {string}
 */
proto.poolrpc.ListSidecarsRequest.prototype.getSidecarId_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSidecarId()));
};


/**
 * optional bytes sidecar_id = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSidecarId()`
 * @return {!Uint8Array}
 */
proto.poolrpc.ListSidecarsRequest.prototype.getSidecarId_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSidecarId()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.ListSidecarsRequest.prototype.setSidecarId = function(value) {
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
proto.poolrpc.ListSidecarsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.poolrpc.ListSidecarsResponse.repeatedFields_, null);
};
goog.inherits(proto.poolrpc.ListSidecarsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.ListSidecarsResponse.displayName = 'proto.poolrpc.ListSidecarsResponse';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.poolrpc.ListSidecarsResponse.repeatedFields_ = [1];



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
proto.poolrpc.ListSidecarsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.ListSidecarsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.ListSidecarsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ListSidecarsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    ticketsList: jspb.Message.toObjectList(msg.getTicketsList(),
    proto.poolrpc.DecodedSidecarTicket.toObject, includeInstance)
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
 * @return {!proto.poolrpc.ListSidecarsResponse}
 */
proto.poolrpc.ListSidecarsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.ListSidecarsResponse;
  return proto.poolrpc.ListSidecarsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.ListSidecarsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.ListSidecarsResponse}
 */
proto.poolrpc.ListSidecarsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.poolrpc.DecodedSidecarTicket;
      reader.readMessage(value,proto.poolrpc.DecodedSidecarTicket.deserializeBinaryFromReader);
      msg.addTickets(value);
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
proto.poolrpc.ListSidecarsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.ListSidecarsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.ListSidecarsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.ListSidecarsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTicketsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.poolrpc.DecodedSidecarTicket.serializeBinaryToWriter
    );
  }
};


/**
 * repeated DecodedSidecarTicket tickets = 1;
 * @return {!Array<!proto.poolrpc.DecodedSidecarTicket>}
 */
proto.poolrpc.ListSidecarsResponse.prototype.getTicketsList = function() {
  return /** @type{!Array<!proto.poolrpc.DecodedSidecarTicket>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.poolrpc.DecodedSidecarTicket, 1));
};


/** @param {!Array<!proto.poolrpc.DecodedSidecarTicket>} value */
proto.poolrpc.ListSidecarsResponse.prototype.setTicketsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.poolrpc.DecodedSidecarTicket=} opt_value
 * @param {number=} opt_index
 * @return {!proto.poolrpc.DecodedSidecarTicket}
 */
proto.poolrpc.ListSidecarsResponse.prototype.addTickets = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.poolrpc.DecodedSidecarTicket, opt_index);
};


proto.poolrpc.ListSidecarsResponse.prototype.clearTicketsList = function() {
  this.setTicketsList([]);
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
proto.poolrpc.CancelSidecarRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.CancelSidecarRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.CancelSidecarRequest.displayName = 'proto.poolrpc.CancelSidecarRequest';
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
proto.poolrpc.CancelSidecarRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.CancelSidecarRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.CancelSidecarRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.CancelSidecarRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    sidecarId: msg.getSidecarId_asB64()
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
 * @return {!proto.poolrpc.CancelSidecarRequest}
 */
proto.poolrpc.CancelSidecarRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.CancelSidecarRequest;
  return proto.poolrpc.CancelSidecarRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.CancelSidecarRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.CancelSidecarRequest}
 */
proto.poolrpc.CancelSidecarRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSidecarId(value);
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
proto.poolrpc.CancelSidecarRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.CancelSidecarRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.CancelSidecarRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.CancelSidecarRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSidecarId_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
};


/**
 * optional bytes sidecar_id = 1;
 * @return {!(string|Uint8Array)}
 */
proto.poolrpc.CancelSidecarRequest.prototype.getSidecarId = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes sidecar_id = 1;
 * This is a type-conversion wrapper around `getSidecarId()`
 * @return {string}
 */
proto.poolrpc.CancelSidecarRequest.prototype.getSidecarId_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSidecarId()));
};


/**
 * optional bytes sidecar_id = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSidecarId()`
 * @return {!Uint8Array}
 */
proto.poolrpc.CancelSidecarRequest.prototype.getSidecarId_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSidecarId()));
};


/** @param {!(string|Uint8Array)} value */
proto.poolrpc.CancelSidecarRequest.prototype.setSidecarId = function(value) {
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
proto.poolrpc.CancelSidecarResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.poolrpc.CancelSidecarResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.poolrpc.CancelSidecarResponse.displayName = 'proto.poolrpc.CancelSidecarResponse';
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
proto.poolrpc.CancelSidecarResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.poolrpc.CancelSidecarResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.poolrpc.CancelSidecarResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.CancelSidecarResponse.toObject = function(includeInstance, msg) {
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
 * @return {!proto.poolrpc.CancelSidecarResponse}
 */
proto.poolrpc.CancelSidecarResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.poolrpc.CancelSidecarResponse;
  return proto.poolrpc.CancelSidecarResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.poolrpc.CancelSidecarResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.poolrpc.CancelSidecarResponse}
 */
proto.poolrpc.CancelSidecarResponse.deserializeBinaryFromReader = function(msg, reader) {
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
proto.poolrpc.CancelSidecarResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.poolrpc.CancelSidecarResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.poolrpc.CancelSidecarResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.poolrpc.CancelSidecarResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};


/**
 * @enum {number}
 */
proto.poolrpc.AccountVersion = {
  ACCOUNT_VERSION_LND_DEPENDENT: 0,
  ACCOUNT_VERSION_LEGACY: 1,
  ACCOUNT_VERSION_TAPROOT: 2,
  ACCOUNT_VERSION_TAPROOT_V2: 3
};

/**
 * @enum {number}
 */
proto.poolrpc.AccountState = {
  PENDING_OPEN: 0,
  PENDING_UPDATE: 1,
  OPEN: 2,
  EXPIRED: 3,
  PENDING_CLOSED: 4,
  CLOSED: 5,
  RECOVERY_FAILED: 6,
  PENDING_BATCH: 7
};

/**
 * @enum {number}
 */
proto.poolrpc.MatchState = {
  PREPARE: 0,
  ACCEPTED: 1,
  REJECTED: 2,
  SIGNED: 3,
  FINALIZED: 4
};

/**
 * @enum {number}
 */
proto.poolrpc.MatchRejectReason = {
  NONE: 0,
  SERVER_MISBEHAVIOR: 1,
  BATCH_VERSION_MISMATCH: 2,
  PARTIAL_REJECT_COLLATERAL: 3,
  PARTIAL_REJECT_DUPLICATE_PEER: 4,
  PARTIAL_REJECT_CHANNEL_FUNDING_FAILED: 5
};

goog.object.extend(exports, proto.poolrpc);
