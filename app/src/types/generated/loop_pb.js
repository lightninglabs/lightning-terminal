/* eslint-disable */
var proto = { looprpc: {} };

// source: loop.proto
/**
 * @fileoverview
 * @enhanceable
 * @suppress {missingRequire} reports error on implicit type usages.
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!
/* eslint-disable */
// @ts-nocheck

var jspb = require('google-protobuf');
var goog = jspb;
var global =
    (typeof globalThis !== 'undefined' && globalThis) ||
    (typeof window !== 'undefined' && window) ||
    (typeof global !== 'undefined' && global) ||
    (typeof self !== 'undefined' && self) ||
    (function () { return this; }).call(null) ||
    Function('return this')();

var swapserverrpc_common_pb = require('./swapserverrpc/common_pb.js');
goog.object.extend(proto, swapserverrpc_common_pb);
goog.exportSymbol('proto.looprpc.AbandonSwapRequest', null, global);
goog.exportSymbol('proto.looprpc.AbandonSwapResponse', null, global);
goog.exportSymbol('proto.looprpc.AddressType', null, global);
goog.exportSymbol('proto.looprpc.AssetLoopOutInfo', null, global);
goog.exportSymbol('proto.looprpc.AssetLoopOutRequest', null, global);
goog.exportSymbol('proto.looprpc.AssetRfqInfo', null, global);
goog.exportSymbol('proto.looprpc.AutoReason', null, global);
goog.exportSymbol('proto.looprpc.ClientReservation', null, global);
goog.exportSymbol('proto.looprpc.Deposit', null, global);
goog.exportSymbol('proto.looprpc.DepositState', null, global);
goog.exportSymbol('proto.looprpc.Disqualified', null, global);
goog.exportSymbol('proto.looprpc.EasyAssetAutoloopParams', null, global);
goog.exportSymbol('proto.looprpc.FailureReason', null, global);
goog.exportSymbol('proto.looprpc.FetchL402TokenRequest', null, global);
goog.exportSymbol('proto.looprpc.FetchL402TokenResponse', null, global);
goog.exportSymbol('proto.looprpc.FixedPoint', null, global);
goog.exportSymbol('proto.looprpc.GetInfoRequest', null, global);
goog.exportSymbol('proto.looprpc.GetInfoResponse', null, global);
goog.exportSymbol('proto.looprpc.GetLiquidityParamsRequest', null, global);
goog.exportSymbol('proto.looprpc.InQuoteResponse', null, global);
goog.exportSymbol('proto.looprpc.InTermsResponse', null, global);
goog.exportSymbol('proto.looprpc.InstantOut', null, global);
goog.exportSymbol('proto.looprpc.InstantOutQuoteRequest', null, global);
goog.exportSymbol('proto.looprpc.InstantOutQuoteResponse', null, global);
goog.exportSymbol('proto.looprpc.InstantOutRequest', null, global);
goog.exportSymbol('proto.looprpc.InstantOutResponse', null, global);
goog.exportSymbol('proto.looprpc.L402Token', null, global);
goog.exportSymbol('proto.looprpc.LiquidityParameters', null, global);
goog.exportSymbol('proto.looprpc.LiquidityRule', null, global);
goog.exportSymbol('proto.looprpc.LiquidityRuleType', null, global);
goog.exportSymbol('proto.looprpc.ListInstantOutsRequest', null, global);
goog.exportSymbol('proto.looprpc.ListInstantOutsResponse', null, global);
goog.exportSymbol('proto.looprpc.ListReservationsRequest', null, global);
goog.exportSymbol('proto.looprpc.ListReservationsResponse', null, global);
goog.exportSymbol('proto.looprpc.ListStaticAddressDepositsRequest', null, global);
goog.exportSymbol('proto.looprpc.ListStaticAddressDepositsResponse', null, global);
goog.exportSymbol('proto.looprpc.ListStaticAddressSwapsRequest', null, global);
goog.exportSymbol('proto.looprpc.ListStaticAddressSwapsResponse', null, global);
goog.exportSymbol('proto.looprpc.ListStaticAddressWithdrawalRequest', null, global);
goog.exportSymbol('proto.looprpc.ListStaticAddressWithdrawalResponse', null, global);
goog.exportSymbol('proto.looprpc.ListSwapsFilter', null, global);
goog.exportSymbol('proto.looprpc.ListSwapsFilter.SwapTypeFilter', null, global);
goog.exportSymbol('proto.looprpc.ListSwapsRequest', null, global);
goog.exportSymbol('proto.looprpc.ListSwapsResponse', null, global);
goog.exportSymbol('proto.looprpc.ListUnspentDepositsRequest', null, global);
goog.exportSymbol('proto.looprpc.ListUnspentDepositsResponse', null, global);
goog.exportSymbol('proto.looprpc.LoopInRequest', null, global);
goog.exportSymbol('proto.looprpc.LoopOutRequest', null, global);
goog.exportSymbol('proto.looprpc.LoopStats', null, global);
goog.exportSymbol('proto.looprpc.MonitorRequest', null, global);
goog.exportSymbol('proto.looprpc.NewStaticAddressRequest', null, global);
goog.exportSymbol('proto.looprpc.NewStaticAddressResponse', null, global);
goog.exportSymbol('proto.looprpc.OutPoint', null, global);
goog.exportSymbol('proto.looprpc.OutQuoteResponse', null, global);
goog.exportSymbol('proto.looprpc.OutTermsResponse', null, global);
goog.exportSymbol('proto.looprpc.ProbeRequest', null, global);
goog.exportSymbol('proto.looprpc.ProbeResponse', null, global);
goog.exportSymbol('proto.looprpc.QuoteRequest', null, global);
goog.exportSymbol('proto.looprpc.SetLiquidityParamsRequest', null, global);
goog.exportSymbol('proto.looprpc.SetLiquidityParamsResponse', null, global);
goog.exportSymbol('proto.looprpc.StaticAddressLoopInRequest', null, global);
goog.exportSymbol('proto.looprpc.StaticAddressLoopInResponse', null, global);
goog.exportSymbol('proto.looprpc.StaticAddressLoopInSwap', null, global);
goog.exportSymbol('proto.looprpc.StaticAddressLoopInSwapState', null, global);
goog.exportSymbol('proto.looprpc.StaticAddressSummaryRequest', null, global);
goog.exportSymbol('proto.looprpc.StaticAddressSummaryResponse', null, global);
goog.exportSymbol('proto.looprpc.StaticAddressWithdrawal', null, global);
goog.exportSymbol('proto.looprpc.SuggestSwapsRequest', null, global);
goog.exportSymbol('proto.looprpc.SuggestSwapsResponse', null, global);
goog.exportSymbol('proto.looprpc.SwapInfoRequest', null, global);
goog.exportSymbol('proto.looprpc.SwapResponse', null, global);
goog.exportSymbol('proto.looprpc.SwapState', null, global);
goog.exportSymbol('proto.looprpc.SwapStatus', null, global);
goog.exportSymbol('proto.looprpc.SwapType', null, global);
goog.exportSymbol('proto.looprpc.TermsRequest', null, global);
goog.exportSymbol('proto.looprpc.TokensRequest', null, global);
goog.exportSymbol('proto.looprpc.TokensResponse', null, global);
goog.exportSymbol('proto.looprpc.Utxo', null, global);
goog.exportSymbol('proto.looprpc.WithdrawDepositsRequest', null, global);
goog.exportSymbol('proto.looprpc.WithdrawDepositsResponse', null, global);
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
proto.looprpc.LoopOutRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.looprpc.LoopOutRequest.repeatedFields_, null);
};
goog.inherits(proto.looprpc.LoopOutRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.LoopOutRequest.displayName = 'proto.looprpc.LoopOutRequest';
}
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
proto.looprpc.LoopInRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.looprpc.LoopInRequest.repeatedFields_, null);
};
goog.inherits(proto.looprpc.LoopInRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.LoopInRequest.displayName = 'proto.looprpc.LoopInRequest';
}
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
proto.looprpc.SwapResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.SwapResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.SwapResponse.displayName = 'proto.looprpc.SwapResponse';
}
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
proto.looprpc.MonitorRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.MonitorRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.MonitorRequest.displayName = 'proto.looprpc.MonitorRequest';
}
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
proto.looprpc.SwapStatus = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.looprpc.SwapStatus.repeatedFields_, null);
};
goog.inherits(proto.looprpc.SwapStatus, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.SwapStatus.displayName = 'proto.looprpc.SwapStatus';
}
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
proto.looprpc.ListSwapsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.ListSwapsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.ListSwapsRequest.displayName = 'proto.looprpc.ListSwapsRequest';
}
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
proto.looprpc.ListSwapsFilter = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.looprpc.ListSwapsFilter.repeatedFields_, null);
};
goog.inherits(proto.looprpc.ListSwapsFilter, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.ListSwapsFilter.displayName = 'proto.looprpc.ListSwapsFilter';
}
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
proto.looprpc.ListSwapsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.looprpc.ListSwapsResponse.repeatedFields_, null);
};
goog.inherits(proto.looprpc.ListSwapsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.ListSwapsResponse.displayName = 'proto.looprpc.ListSwapsResponse';
}
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
proto.looprpc.SwapInfoRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.SwapInfoRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.SwapInfoRequest.displayName = 'proto.looprpc.SwapInfoRequest';
}
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
proto.looprpc.TermsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.TermsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.TermsRequest.displayName = 'proto.looprpc.TermsRequest';
}
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
proto.looprpc.InTermsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.InTermsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.InTermsResponse.displayName = 'proto.looprpc.InTermsResponse';
}
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
proto.looprpc.OutTermsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.OutTermsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.OutTermsResponse.displayName = 'proto.looprpc.OutTermsResponse';
}
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
proto.looprpc.QuoteRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.looprpc.QuoteRequest.repeatedFields_, null);
};
goog.inherits(proto.looprpc.QuoteRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.QuoteRequest.displayName = 'proto.looprpc.QuoteRequest';
}
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
proto.looprpc.InQuoteResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.InQuoteResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.InQuoteResponse.displayName = 'proto.looprpc.InQuoteResponse';
}
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
proto.looprpc.OutQuoteResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.OutQuoteResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.OutQuoteResponse.displayName = 'proto.looprpc.OutQuoteResponse';
}
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
proto.looprpc.ProbeRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.looprpc.ProbeRequest.repeatedFields_, null);
};
goog.inherits(proto.looprpc.ProbeRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.ProbeRequest.displayName = 'proto.looprpc.ProbeRequest';
}
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
proto.looprpc.ProbeResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.ProbeResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.ProbeResponse.displayName = 'proto.looprpc.ProbeResponse';
}
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
proto.looprpc.TokensRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.TokensRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.TokensRequest.displayName = 'proto.looprpc.TokensRequest';
}
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
proto.looprpc.TokensResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.looprpc.TokensResponse.repeatedFields_, null);
};
goog.inherits(proto.looprpc.TokensResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.TokensResponse.displayName = 'proto.looprpc.TokensResponse';
}
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
proto.looprpc.FetchL402TokenRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.FetchL402TokenRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.FetchL402TokenRequest.displayName = 'proto.looprpc.FetchL402TokenRequest';
}
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
proto.looprpc.FetchL402TokenResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.FetchL402TokenResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.FetchL402TokenResponse.displayName = 'proto.looprpc.FetchL402TokenResponse';
}
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
proto.looprpc.L402Token = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.L402Token, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.L402Token.displayName = 'proto.looprpc.L402Token';
}
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
proto.looprpc.LoopStats = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.LoopStats, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.LoopStats.displayName = 'proto.looprpc.LoopStats';
}
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
proto.looprpc.GetInfoRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.GetInfoRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.GetInfoRequest.displayName = 'proto.looprpc.GetInfoRequest';
}
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
proto.looprpc.GetInfoResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.GetInfoResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.GetInfoResponse.displayName = 'proto.looprpc.GetInfoResponse';
}
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
proto.looprpc.GetLiquidityParamsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.GetLiquidityParamsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.GetLiquidityParamsRequest.displayName = 'proto.looprpc.GetLiquidityParamsRequest';
}
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
proto.looprpc.LiquidityParameters = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.looprpc.LiquidityParameters.repeatedFields_, null);
};
goog.inherits(proto.looprpc.LiquidityParameters, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.LiquidityParameters.displayName = 'proto.looprpc.LiquidityParameters';
}
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
proto.looprpc.EasyAssetAutoloopParams = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.EasyAssetAutoloopParams, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.EasyAssetAutoloopParams.displayName = 'proto.looprpc.EasyAssetAutoloopParams';
}
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
proto.looprpc.LiquidityRule = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.LiquidityRule, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.LiquidityRule.displayName = 'proto.looprpc.LiquidityRule';
}
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
proto.looprpc.SetLiquidityParamsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.SetLiquidityParamsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.SetLiquidityParamsRequest.displayName = 'proto.looprpc.SetLiquidityParamsRequest';
}
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
proto.looprpc.SetLiquidityParamsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.SetLiquidityParamsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.SetLiquidityParamsResponse.displayName = 'proto.looprpc.SetLiquidityParamsResponse';
}
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
proto.looprpc.SuggestSwapsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.SuggestSwapsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.SuggestSwapsRequest.displayName = 'proto.looprpc.SuggestSwapsRequest';
}
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
proto.looprpc.Disqualified = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.Disqualified, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.Disqualified.displayName = 'proto.looprpc.Disqualified';
}
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
proto.looprpc.SuggestSwapsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.looprpc.SuggestSwapsResponse.repeatedFields_, null);
};
goog.inherits(proto.looprpc.SuggestSwapsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.SuggestSwapsResponse.displayName = 'proto.looprpc.SuggestSwapsResponse';
}
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
proto.looprpc.AbandonSwapRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.AbandonSwapRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.AbandonSwapRequest.displayName = 'proto.looprpc.AbandonSwapRequest';
}
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
proto.looprpc.AbandonSwapResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.AbandonSwapResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.AbandonSwapResponse.displayName = 'proto.looprpc.AbandonSwapResponse';
}
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
proto.looprpc.ListReservationsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.ListReservationsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.ListReservationsRequest.displayName = 'proto.looprpc.ListReservationsRequest';
}
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
proto.looprpc.ListReservationsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.looprpc.ListReservationsResponse.repeatedFields_, null);
};
goog.inherits(proto.looprpc.ListReservationsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.ListReservationsResponse.displayName = 'proto.looprpc.ListReservationsResponse';
}
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
proto.looprpc.ClientReservation = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.ClientReservation, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.ClientReservation.displayName = 'proto.looprpc.ClientReservation';
}
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
proto.looprpc.InstantOutRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.looprpc.InstantOutRequest.repeatedFields_, null);
};
goog.inherits(proto.looprpc.InstantOutRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.InstantOutRequest.displayName = 'proto.looprpc.InstantOutRequest';
}
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
proto.looprpc.InstantOutResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.InstantOutResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.InstantOutResponse.displayName = 'proto.looprpc.InstantOutResponse';
}
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
proto.looprpc.InstantOutQuoteRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.looprpc.InstantOutQuoteRequest.repeatedFields_, null);
};
goog.inherits(proto.looprpc.InstantOutQuoteRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.InstantOutQuoteRequest.displayName = 'proto.looprpc.InstantOutQuoteRequest';
}
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
proto.looprpc.InstantOutQuoteResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.InstantOutQuoteResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.InstantOutQuoteResponse.displayName = 'proto.looprpc.InstantOutQuoteResponse';
}
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
proto.looprpc.ListInstantOutsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.ListInstantOutsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.ListInstantOutsRequest.displayName = 'proto.looprpc.ListInstantOutsRequest';
}
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
proto.looprpc.ListInstantOutsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.looprpc.ListInstantOutsResponse.repeatedFields_, null);
};
goog.inherits(proto.looprpc.ListInstantOutsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.ListInstantOutsResponse.displayName = 'proto.looprpc.ListInstantOutsResponse';
}
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
proto.looprpc.InstantOut = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.looprpc.InstantOut.repeatedFields_, null);
};
goog.inherits(proto.looprpc.InstantOut, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.InstantOut.displayName = 'proto.looprpc.InstantOut';
}
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
proto.looprpc.NewStaticAddressRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.NewStaticAddressRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.NewStaticAddressRequest.displayName = 'proto.looprpc.NewStaticAddressRequest';
}
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
proto.looprpc.NewStaticAddressResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.NewStaticAddressResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.NewStaticAddressResponse.displayName = 'proto.looprpc.NewStaticAddressResponse';
}
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
proto.looprpc.ListUnspentDepositsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.ListUnspentDepositsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.ListUnspentDepositsRequest.displayName = 'proto.looprpc.ListUnspentDepositsRequest';
}
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
proto.looprpc.ListUnspentDepositsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.looprpc.ListUnspentDepositsResponse.repeatedFields_, null);
};
goog.inherits(proto.looprpc.ListUnspentDepositsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.ListUnspentDepositsResponse.displayName = 'proto.looprpc.ListUnspentDepositsResponse';
}
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
proto.looprpc.Utxo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.Utxo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.Utxo.displayName = 'proto.looprpc.Utxo';
}
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
proto.looprpc.WithdrawDepositsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.looprpc.WithdrawDepositsRequest.repeatedFields_, null);
};
goog.inherits(proto.looprpc.WithdrawDepositsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.WithdrawDepositsRequest.displayName = 'proto.looprpc.WithdrawDepositsRequest';
}
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
proto.looprpc.WithdrawDepositsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.WithdrawDepositsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.WithdrawDepositsResponse.displayName = 'proto.looprpc.WithdrawDepositsResponse';
}
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
proto.looprpc.OutPoint = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.OutPoint, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.OutPoint.displayName = 'proto.looprpc.OutPoint';
}
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
proto.looprpc.ListStaticAddressDepositsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.looprpc.ListStaticAddressDepositsRequest.repeatedFields_, null);
};
goog.inherits(proto.looprpc.ListStaticAddressDepositsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.ListStaticAddressDepositsRequest.displayName = 'proto.looprpc.ListStaticAddressDepositsRequest';
}
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
proto.looprpc.ListStaticAddressDepositsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.looprpc.ListStaticAddressDepositsResponse.repeatedFields_, null);
};
goog.inherits(proto.looprpc.ListStaticAddressDepositsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.ListStaticAddressDepositsResponse.displayName = 'proto.looprpc.ListStaticAddressDepositsResponse';
}
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
proto.looprpc.ListStaticAddressWithdrawalRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.ListStaticAddressWithdrawalRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.ListStaticAddressWithdrawalRequest.displayName = 'proto.looprpc.ListStaticAddressWithdrawalRequest';
}
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
proto.looprpc.ListStaticAddressWithdrawalResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.looprpc.ListStaticAddressWithdrawalResponse.repeatedFields_, null);
};
goog.inherits(proto.looprpc.ListStaticAddressWithdrawalResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.ListStaticAddressWithdrawalResponse.displayName = 'proto.looprpc.ListStaticAddressWithdrawalResponse';
}
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
proto.looprpc.ListStaticAddressSwapsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.ListStaticAddressSwapsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.ListStaticAddressSwapsRequest.displayName = 'proto.looprpc.ListStaticAddressSwapsRequest';
}
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
proto.looprpc.ListStaticAddressSwapsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.looprpc.ListStaticAddressSwapsResponse.repeatedFields_, null);
};
goog.inherits(proto.looprpc.ListStaticAddressSwapsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.ListStaticAddressSwapsResponse.displayName = 'proto.looprpc.ListStaticAddressSwapsResponse';
}
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
proto.looprpc.StaticAddressSummaryRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.StaticAddressSummaryRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.StaticAddressSummaryRequest.displayName = 'proto.looprpc.StaticAddressSummaryRequest';
}
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
proto.looprpc.StaticAddressSummaryResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.StaticAddressSummaryResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.StaticAddressSummaryResponse.displayName = 'proto.looprpc.StaticAddressSummaryResponse';
}
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
proto.looprpc.Deposit = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.Deposit, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.Deposit.displayName = 'proto.looprpc.Deposit';
}
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
proto.looprpc.StaticAddressWithdrawal = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.looprpc.StaticAddressWithdrawal.repeatedFields_, null);
};
goog.inherits(proto.looprpc.StaticAddressWithdrawal, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.StaticAddressWithdrawal.displayName = 'proto.looprpc.StaticAddressWithdrawal';
}
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
proto.looprpc.StaticAddressLoopInSwap = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.looprpc.StaticAddressLoopInSwap.repeatedFields_, null);
};
goog.inherits(proto.looprpc.StaticAddressLoopInSwap, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.StaticAddressLoopInSwap.displayName = 'proto.looprpc.StaticAddressLoopInSwap';
}
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
proto.looprpc.StaticAddressLoopInRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.looprpc.StaticAddressLoopInRequest.repeatedFields_, null);
};
goog.inherits(proto.looprpc.StaticAddressLoopInRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.StaticAddressLoopInRequest.displayName = 'proto.looprpc.StaticAddressLoopInRequest';
}
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
proto.looprpc.StaticAddressLoopInResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.StaticAddressLoopInResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.StaticAddressLoopInResponse.displayName = 'proto.looprpc.StaticAddressLoopInResponse';
}
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
proto.looprpc.AssetLoopOutRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.AssetLoopOutRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.AssetLoopOutRequest.displayName = 'proto.looprpc.AssetLoopOutRequest';
}
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
proto.looprpc.AssetRfqInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.AssetRfqInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.AssetRfqInfo.displayName = 'proto.looprpc.AssetRfqInfo';
}
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
proto.looprpc.FixedPoint = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.FixedPoint, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.FixedPoint.displayName = 'proto.looprpc.FixedPoint';
}
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
proto.looprpc.AssetLoopOutInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.looprpc.AssetLoopOutInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.looprpc.AssetLoopOutInfo.displayName = 'proto.looprpc.AssetLoopOutInfo';
}

/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.looprpc.LoopOutRequest.repeatedFields_ = [11,18];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.LoopOutRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.LoopOutRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.LoopOutRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.LoopOutRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    amt: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    dest: jspb.Message.getFieldWithDefault(msg, 2, ""),
    maxSwapRoutingFee: jspb.Message.getFieldWithDefault(msg, 3, "0"),
    maxPrepayRoutingFee: jspb.Message.getFieldWithDefault(msg, 4, "0"),
    maxSwapFee: jspb.Message.getFieldWithDefault(msg, 5, "0"),
    maxPrepayAmt: jspb.Message.getFieldWithDefault(msg, 6, "0"),
    maxMinerFee: jspb.Message.getFieldWithDefault(msg, 7, "0"),
    loopOutChannel: jspb.Message.getFieldWithDefault(msg, 8, "0"),
    outgoingChanSetList: (f = jspb.Message.getRepeatedField(msg, 11)) == null ? undefined : f,
    sweepConfTarget: jspb.Message.getFieldWithDefault(msg, 9, 0),
    htlcConfirmations: jspb.Message.getFieldWithDefault(msg, 13, 0),
    swapPublicationDeadline: jspb.Message.getFieldWithDefault(msg, 10, "0"),
    label: jspb.Message.getFieldWithDefault(msg, 12, ""),
    initiator: jspb.Message.getFieldWithDefault(msg, 14, ""),
    account: jspb.Message.getFieldWithDefault(msg, 15, ""),
    accountAddrType: jspb.Message.getFieldWithDefault(msg, 16, 0),
    isExternalAddr: jspb.Message.getBooleanFieldWithDefault(msg, 17, false),
    reservationIdsList: msg.getReservationIdsList_asB64(),
    paymentTimeout: jspb.Message.getFieldWithDefault(msg, 19, 0),
    assetInfo: (f = msg.getAssetInfo()) && proto.looprpc.AssetLoopOutRequest.toObject(includeInstance, f),
    assetRfqInfo: (f = msg.getAssetRfqInfo()) && proto.looprpc.AssetRfqInfo.toObject(includeInstance, f)
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
 * @return {!proto.looprpc.LoopOutRequest}
 */
proto.looprpc.LoopOutRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.LoopOutRequest;
  return proto.looprpc.LoopOutRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.LoopOutRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.LoopOutRequest}
 */
proto.looprpc.LoopOutRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setAmt(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setDest(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setMaxSwapRoutingFee(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setMaxPrepayRoutingFee(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setMaxSwapFee(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setMaxPrepayAmt(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setMaxMinerFee(value);
      break;
    case 8:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setLoopOutChannel(value);
      break;
    case 11:
      var values = /** @type {!Array<string>} */ (reader.isDelimited() ? reader.readPackedUint64String() : [reader.readUint64String()]);
      for (var i = 0; i < values.length; i++) {
        msg.addOutgoingChanSet(values[i]);
      }
      break;
    case 9:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setSweepConfTarget(value);
      break;
    case 13:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setHtlcConfirmations(value);
      break;
    case 10:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setSwapPublicationDeadline(value);
      break;
    case 12:
      var value = /** @type {string} */ (reader.readString());
      msg.setLabel(value);
      break;
    case 14:
      var value = /** @type {string} */ (reader.readString());
      msg.setInitiator(value);
      break;
    case 15:
      var value = /** @type {string} */ (reader.readString());
      msg.setAccount(value);
      break;
    case 16:
      var value = /** @type {!proto.looprpc.AddressType} */ (reader.readEnum());
      msg.setAccountAddrType(value);
      break;
    case 17:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIsExternalAddr(value);
      break;
    case 18:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.addReservationIds(value);
      break;
    case 19:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setPaymentTimeout(value);
      break;
    case 20:
      var value = new proto.looprpc.AssetLoopOutRequest;
      reader.readMessage(value,proto.looprpc.AssetLoopOutRequest.deserializeBinaryFromReader);
      msg.setAssetInfo(value);
      break;
    case 21:
      var value = new proto.looprpc.AssetRfqInfo;
      reader.readMessage(value,proto.looprpc.AssetRfqInfo.deserializeBinaryFromReader);
      msg.setAssetRfqInfo(value);
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
proto.looprpc.LoopOutRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.LoopOutRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.LoopOutRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.LoopOutRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAmt();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      1,
      f
    );
  }
  f = message.getDest();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getMaxSwapRoutingFee();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      3,
      f
    );
  }
  f = message.getMaxPrepayRoutingFee();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      4,
      f
    );
  }
  f = message.getMaxSwapFee();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      5,
      f
    );
  }
  f = message.getMaxPrepayAmt();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      6,
      f
    );
  }
  f = message.getMaxMinerFee();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      7,
      f
    );
  }
  f = message.getLoopOutChannel();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      8,
      f
    );
  }
  f = message.getOutgoingChanSetList();
  if (f.length > 0) {
    writer.writePackedUint64String(
      11,
      f
    );
  }
  f = message.getSweepConfTarget();
  if (f !== 0) {
    writer.writeInt32(
      9,
      f
    );
  }
  f = message.getHtlcConfirmations();
  if (f !== 0) {
    writer.writeInt32(
      13,
      f
    );
  }
  f = message.getSwapPublicationDeadline();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      10,
      f
    );
  }
  f = message.getLabel();
  if (f.length > 0) {
    writer.writeString(
      12,
      f
    );
  }
  f = message.getInitiator();
  if (f.length > 0) {
    writer.writeString(
      14,
      f
    );
  }
  f = message.getAccount();
  if (f.length > 0) {
    writer.writeString(
      15,
      f
    );
  }
  f = message.getAccountAddrType();
  if (f !== 0.0) {
    writer.writeEnum(
      16,
      f
    );
  }
  f = message.getIsExternalAddr();
  if (f) {
    writer.writeBool(
      17,
      f
    );
  }
  f = message.getReservationIdsList_asU8();
  if (f.length > 0) {
    writer.writeRepeatedBytes(
      18,
      f
    );
  }
  f = message.getPaymentTimeout();
  if (f !== 0) {
    writer.writeUint32(
      19,
      f
    );
  }
  f = message.getAssetInfo();
  if (f != null) {
    writer.writeMessage(
      20,
      f,
      proto.looprpc.AssetLoopOutRequest.serializeBinaryToWriter
    );
  }
  f = message.getAssetRfqInfo();
  if (f != null) {
    writer.writeMessage(
      21,
      f,
      proto.looprpc.AssetRfqInfo.serializeBinaryToWriter
    );
  }
};


/**
 * optional int64 amt = 1;
 * @return {string}
 */
proto.looprpc.LoopOutRequest.prototype.getAmt = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LoopOutRequest} returns this
 */
proto.looprpc.LoopOutRequest.prototype.setAmt = function(value) {
  return jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional string dest = 2;
 * @return {string}
 */
proto.looprpc.LoopOutRequest.prototype.getDest = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LoopOutRequest} returns this
 */
proto.looprpc.LoopOutRequest.prototype.setDest = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional int64 max_swap_routing_fee = 3;
 * @return {string}
 */
proto.looprpc.LoopOutRequest.prototype.getMaxSwapRoutingFee = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LoopOutRequest} returns this
 */
proto.looprpc.LoopOutRequest.prototype.setMaxSwapRoutingFee = function(value) {
  return jspb.Message.setProto3StringIntField(this, 3, value);
};


/**
 * optional int64 max_prepay_routing_fee = 4;
 * @return {string}
 */
proto.looprpc.LoopOutRequest.prototype.getMaxPrepayRoutingFee = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LoopOutRequest} returns this
 */
proto.looprpc.LoopOutRequest.prototype.setMaxPrepayRoutingFee = function(value) {
  return jspb.Message.setProto3StringIntField(this, 4, value);
};


/**
 * optional int64 max_swap_fee = 5;
 * @return {string}
 */
proto.looprpc.LoopOutRequest.prototype.getMaxSwapFee = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LoopOutRequest} returns this
 */
proto.looprpc.LoopOutRequest.prototype.setMaxSwapFee = function(value) {
  return jspb.Message.setProto3StringIntField(this, 5, value);
};


/**
 * optional int64 max_prepay_amt = 6;
 * @return {string}
 */
proto.looprpc.LoopOutRequest.prototype.getMaxPrepayAmt = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LoopOutRequest} returns this
 */
proto.looprpc.LoopOutRequest.prototype.setMaxPrepayAmt = function(value) {
  return jspb.Message.setProto3StringIntField(this, 6, value);
};


/**
 * optional int64 max_miner_fee = 7;
 * @return {string}
 */
proto.looprpc.LoopOutRequest.prototype.getMaxMinerFee = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LoopOutRequest} returns this
 */
proto.looprpc.LoopOutRequest.prototype.setMaxMinerFee = function(value) {
  return jspb.Message.setProto3StringIntField(this, 7, value);
};


/**
 * optional uint64 loop_out_channel = 8;
 * @return {string}
 */
proto.looprpc.LoopOutRequest.prototype.getLoopOutChannel = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 8, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LoopOutRequest} returns this
 */
proto.looprpc.LoopOutRequest.prototype.setLoopOutChannel = function(value) {
  return jspb.Message.setProto3StringIntField(this, 8, value);
};


/**
 * repeated uint64 outgoing_chan_set = 11;
 * @return {!Array<string>}
 */
proto.looprpc.LoopOutRequest.prototype.getOutgoingChanSetList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 11));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.looprpc.LoopOutRequest} returns this
 */
proto.looprpc.LoopOutRequest.prototype.setOutgoingChanSetList = function(value) {
  return jspb.Message.setField(this, 11, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.looprpc.LoopOutRequest} returns this
 */
proto.looprpc.LoopOutRequest.prototype.addOutgoingChanSet = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 11, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.LoopOutRequest} returns this
 */
proto.looprpc.LoopOutRequest.prototype.clearOutgoingChanSetList = function() {
  return this.setOutgoingChanSetList([]);
};


/**
 * optional int32 sweep_conf_target = 9;
 * @return {number}
 */
proto.looprpc.LoopOutRequest.prototype.getSweepConfTarget = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 9, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.LoopOutRequest} returns this
 */
proto.looprpc.LoopOutRequest.prototype.setSweepConfTarget = function(value) {
  return jspb.Message.setProto3IntField(this, 9, value);
};


/**
 * optional int32 htlc_confirmations = 13;
 * @return {number}
 */
proto.looprpc.LoopOutRequest.prototype.getHtlcConfirmations = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 13, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.LoopOutRequest} returns this
 */
proto.looprpc.LoopOutRequest.prototype.setHtlcConfirmations = function(value) {
  return jspb.Message.setProto3IntField(this, 13, value);
};


/**
 * optional uint64 swap_publication_deadline = 10;
 * @return {string}
 */
proto.looprpc.LoopOutRequest.prototype.getSwapPublicationDeadline = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 10, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LoopOutRequest} returns this
 */
proto.looprpc.LoopOutRequest.prototype.setSwapPublicationDeadline = function(value) {
  return jspb.Message.setProto3StringIntField(this, 10, value);
};


/**
 * optional string label = 12;
 * @return {string}
 */
proto.looprpc.LoopOutRequest.prototype.getLabel = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 12, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LoopOutRequest} returns this
 */
proto.looprpc.LoopOutRequest.prototype.setLabel = function(value) {
  return jspb.Message.setProto3StringField(this, 12, value);
};


/**
 * optional string initiator = 14;
 * @return {string}
 */
proto.looprpc.LoopOutRequest.prototype.getInitiator = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 14, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LoopOutRequest} returns this
 */
proto.looprpc.LoopOutRequest.prototype.setInitiator = function(value) {
  return jspb.Message.setProto3StringField(this, 14, value);
};


/**
 * optional string account = 15;
 * @return {string}
 */
proto.looprpc.LoopOutRequest.prototype.getAccount = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 15, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LoopOutRequest} returns this
 */
proto.looprpc.LoopOutRequest.prototype.setAccount = function(value) {
  return jspb.Message.setProto3StringField(this, 15, value);
};


/**
 * optional AddressType account_addr_type = 16;
 * @return {!proto.looprpc.AddressType}
 */
proto.looprpc.LoopOutRequest.prototype.getAccountAddrType = function() {
  return /** @type {!proto.looprpc.AddressType} */ (jspb.Message.getFieldWithDefault(this, 16, 0));
};


/**
 * @param {!proto.looprpc.AddressType} value
 * @return {!proto.looprpc.LoopOutRequest} returns this
 */
proto.looprpc.LoopOutRequest.prototype.setAccountAddrType = function(value) {
  return jspb.Message.setProto3EnumField(this, 16, value);
};


/**
 * optional bool is_external_addr = 17;
 * @return {boolean}
 */
proto.looprpc.LoopOutRequest.prototype.getIsExternalAddr = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 17, false));
};


/**
 * @param {boolean} value
 * @return {!proto.looprpc.LoopOutRequest} returns this
 */
proto.looprpc.LoopOutRequest.prototype.setIsExternalAddr = function(value) {
  return jspb.Message.setProto3BooleanField(this, 17, value);
};


/**
 * repeated bytes reservation_ids = 18;
 * @return {!(Array<!Uint8Array>|Array<string>)}
 */
proto.looprpc.LoopOutRequest.prototype.getReservationIdsList = function() {
  return /** @type {!(Array<!Uint8Array>|Array<string>)} */ (jspb.Message.getRepeatedField(this, 18));
};


/**
 * repeated bytes reservation_ids = 18;
 * This is a type-conversion wrapper around `getReservationIdsList()`
 * @return {!Array<string>}
 */
proto.looprpc.LoopOutRequest.prototype.getReservationIdsList_asB64 = function() {
  return /** @type {!Array<string>} */ (jspb.Message.bytesListAsB64(
      this.getReservationIdsList()));
};


/**
 * repeated bytes reservation_ids = 18;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getReservationIdsList()`
 * @return {!Array<!Uint8Array>}
 */
proto.looprpc.LoopOutRequest.prototype.getReservationIdsList_asU8 = function() {
  return /** @type {!Array<!Uint8Array>} */ (jspb.Message.bytesListAsU8(
      this.getReservationIdsList()));
};


/**
 * @param {!(Array<!Uint8Array>|Array<string>)} value
 * @return {!proto.looprpc.LoopOutRequest} returns this
 */
proto.looprpc.LoopOutRequest.prototype.setReservationIdsList = function(value) {
  return jspb.Message.setField(this, 18, value || []);
};


/**
 * @param {!(string|Uint8Array)} value
 * @param {number=} opt_index
 * @return {!proto.looprpc.LoopOutRequest} returns this
 */
proto.looprpc.LoopOutRequest.prototype.addReservationIds = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 18, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.LoopOutRequest} returns this
 */
proto.looprpc.LoopOutRequest.prototype.clearReservationIdsList = function() {
  return this.setReservationIdsList([]);
};


/**
 * optional uint32 payment_timeout = 19;
 * @return {number}
 */
proto.looprpc.LoopOutRequest.prototype.getPaymentTimeout = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 19, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.LoopOutRequest} returns this
 */
proto.looprpc.LoopOutRequest.prototype.setPaymentTimeout = function(value) {
  return jspb.Message.setProto3IntField(this, 19, value);
};


/**
 * optional AssetLoopOutRequest asset_info = 20;
 * @return {?proto.looprpc.AssetLoopOutRequest}
 */
proto.looprpc.LoopOutRequest.prototype.getAssetInfo = function() {
  return /** @type{?proto.looprpc.AssetLoopOutRequest} */ (
    jspb.Message.getWrapperField(this, proto.looprpc.AssetLoopOutRequest, 20));
};


/**
 * @param {?proto.looprpc.AssetLoopOutRequest|undefined} value
 * @return {!proto.looprpc.LoopOutRequest} returns this
*/
proto.looprpc.LoopOutRequest.prototype.setAssetInfo = function(value) {
  return jspb.Message.setWrapperField(this, 20, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.looprpc.LoopOutRequest} returns this
 */
proto.looprpc.LoopOutRequest.prototype.clearAssetInfo = function() {
  return this.setAssetInfo(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.looprpc.LoopOutRequest.prototype.hasAssetInfo = function() {
  return jspb.Message.getField(this, 20) != null;
};


/**
 * optional AssetRfqInfo asset_rfq_info = 21;
 * @return {?proto.looprpc.AssetRfqInfo}
 */
proto.looprpc.LoopOutRequest.prototype.getAssetRfqInfo = function() {
  return /** @type{?proto.looprpc.AssetRfqInfo} */ (
    jspb.Message.getWrapperField(this, proto.looprpc.AssetRfqInfo, 21));
};


/**
 * @param {?proto.looprpc.AssetRfqInfo|undefined} value
 * @return {!proto.looprpc.LoopOutRequest} returns this
*/
proto.looprpc.LoopOutRequest.prototype.setAssetRfqInfo = function(value) {
  return jspb.Message.setWrapperField(this, 21, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.looprpc.LoopOutRequest} returns this
 */
proto.looprpc.LoopOutRequest.prototype.clearAssetRfqInfo = function() {
  return this.setAssetRfqInfo(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.looprpc.LoopOutRequest.prototype.hasAssetRfqInfo = function() {
  return jspb.Message.getField(this, 21) != null;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.looprpc.LoopInRequest.repeatedFields_ = [9];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.LoopInRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.LoopInRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.LoopInRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.LoopInRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    amt: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    maxSwapFee: jspb.Message.getFieldWithDefault(msg, 2, "0"),
    maxMinerFee: jspb.Message.getFieldWithDefault(msg, 3, "0"),
    lastHop: msg.getLastHop_asB64(),
    externalHtlc: jspb.Message.getBooleanFieldWithDefault(msg, 5, false),
    htlcConfTarget: jspb.Message.getFieldWithDefault(msg, 6, 0),
    label: jspb.Message.getFieldWithDefault(msg, 7, ""),
    initiator: jspb.Message.getFieldWithDefault(msg, 8, ""),
    routeHintsList: jspb.Message.toObjectList(msg.getRouteHintsList(),
    swapserverrpc_common_pb.RouteHint.toObject, includeInstance),
    pb_private: jspb.Message.getBooleanFieldWithDefault(msg, 10, false)
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
 * @return {!proto.looprpc.LoopInRequest}
 */
proto.looprpc.LoopInRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.LoopInRequest;
  return proto.looprpc.LoopInRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.LoopInRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.LoopInRequest}
 */
proto.looprpc.LoopInRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setAmt(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setMaxSwapFee(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setMaxMinerFee(value);
      break;
    case 4:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setLastHop(value);
      break;
    case 5:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setExternalHtlc(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setHtlcConfTarget(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readString());
      msg.setLabel(value);
      break;
    case 8:
      var value = /** @type {string} */ (reader.readString());
      msg.setInitiator(value);
      break;
    case 9:
      var value = new swapserverrpc_common_pb.RouteHint;
      reader.readMessage(value,swapserverrpc_common_pb.RouteHint.deserializeBinaryFromReader);
      msg.addRouteHints(value);
      break;
    case 10:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setPrivate(value);
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
proto.looprpc.LoopInRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.LoopInRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.LoopInRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.LoopInRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAmt();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      1,
      f
    );
  }
  f = message.getMaxSwapFee();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      2,
      f
    );
  }
  f = message.getMaxMinerFee();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      3,
      f
    );
  }
  f = message.getLastHop_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      4,
      f
    );
  }
  f = message.getExternalHtlc();
  if (f) {
    writer.writeBool(
      5,
      f
    );
  }
  f = message.getHtlcConfTarget();
  if (f !== 0) {
    writer.writeInt32(
      6,
      f
    );
  }
  f = message.getLabel();
  if (f.length > 0) {
    writer.writeString(
      7,
      f
    );
  }
  f = message.getInitiator();
  if (f.length > 0) {
    writer.writeString(
      8,
      f
    );
  }
  f = message.getRouteHintsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      9,
      f,
      swapserverrpc_common_pb.RouteHint.serializeBinaryToWriter
    );
  }
  f = message.getPrivate();
  if (f) {
    writer.writeBool(
      10,
      f
    );
  }
};


/**
 * optional int64 amt = 1;
 * @return {string}
 */
proto.looprpc.LoopInRequest.prototype.getAmt = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LoopInRequest} returns this
 */
proto.looprpc.LoopInRequest.prototype.setAmt = function(value) {
  return jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional int64 max_swap_fee = 2;
 * @return {string}
 */
proto.looprpc.LoopInRequest.prototype.getMaxSwapFee = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LoopInRequest} returns this
 */
proto.looprpc.LoopInRequest.prototype.setMaxSwapFee = function(value) {
  return jspb.Message.setProto3StringIntField(this, 2, value);
};


/**
 * optional int64 max_miner_fee = 3;
 * @return {string}
 */
proto.looprpc.LoopInRequest.prototype.getMaxMinerFee = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LoopInRequest} returns this
 */
proto.looprpc.LoopInRequest.prototype.setMaxMinerFee = function(value) {
  return jspb.Message.setProto3StringIntField(this, 3, value);
};


/**
 * optional bytes last_hop = 4;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.LoopInRequest.prototype.getLastHop = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * optional bytes last_hop = 4;
 * This is a type-conversion wrapper around `getLastHop()`
 * @return {string}
 */
proto.looprpc.LoopInRequest.prototype.getLastHop_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getLastHop()));
};


/**
 * optional bytes last_hop = 4;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getLastHop()`
 * @return {!Uint8Array}
 */
proto.looprpc.LoopInRequest.prototype.getLastHop_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getLastHop()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.LoopInRequest} returns this
 */
proto.looprpc.LoopInRequest.prototype.setLastHop = function(value) {
  return jspb.Message.setProto3BytesField(this, 4, value);
};


/**
 * optional bool external_htlc = 5;
 * @return {boolean}
 */
proto.looprpc.LoopInRequest.prototype.getExternalHtlc = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 5, false));
};


/**
 * @param {boolean} value
 * @return {!proto.looprpc.LoopInRequest} returns this
 */
proto.looprpc.LoopInRequest.prototype.setExternalHtlc = function(value) {
  return jspb.Message.setProto3BooleanField(this, 5, value);
};


/**
 * optional int32 htlc_conf_target = 6;
 * @return {number}
 */
proto.looprpc.LoopInRequest.prototype.getHtlcConfTarget = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.LoopInRequest} returns this
 */
proto.looprpc.LoopInRequest.prototype.setHtlcConfTarget = function(value) {
  return jspb.Message.setProto3IntField(this, 6, value);
};


/**
 * optional string label = 7;
 * @return {string}
 */
proto.looprpc.LoopInRequest.prototype.getLabel = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LoopInRequest} returns this
 */
proto.looprpc.LoopInRequest.prototype.setLabel = function(value) {
  return jspb.Message.setProto3StringField(this, 7, value);
};


/**
 * optional string initiator = 8;
 * @return {string}
 */
proto.looprpc.LoopInRequest.prototype.getInitiator = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 8, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LoopInRequest} returns this
 */
proto.looprpc.LoopInRequest.prototype.setInitiator = function(value) {
  return jspb.Message.setProto3StringField(this, 8, value);
};


/**
 * repeated RouteHint route_hints = 9;
 * @return {!Array<!proto.looprpc.RouteHint>}
 */
proto.looprpc.LoopInRequest.prototype.getRouteHintsList = function() {
  return /** @type{!Array<!proto.looprpc.RouteHint>} */ (
    jspb.Message.getRepeatedWrapperField(this, swapserverrpc_common_pb.RouteHint, 9));
};


/**
 * @param {!Array<!proto.looprpc.RouteHint>} value
 * @return {!proto.looprpc.LoopInRequest} returns this
*/
proto.looprpc.LoopInRequest.prototype.setRouteHintsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 9, value);
};


/**
 * @param {!proto.looprpc.RouteHint=} opt_value
 * @param {number=} opt_index
 * @return {!proto.looprpc.RouteHint}
 */
proto.looprpc.LoopInRequest.prototype.addRouteHints = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 9, opt_value, proto.looprpc.RouteHint, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.LoopInRequest} returns this
 */
proto.looprpc.LoopInRequest.prototype.clearRouteHintsList = function() {
  return this.setRouteHintsList([]);
};


/**
 * optional bool private = 10;
 * @return {boolean}
 */
proto.looprpc.LoopInRequest.prototype.getPrivate = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 10, false));
};


/**
 * @param {boolean} value
 * @return {!proto.looprpc.LoopInRequest} returns this
 */
proto.looprpc.LoopInRequest.prototype.setPrivate = function(value) {
  return jspb.Message.setProto3BooleanField(this, 10, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.SwapResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.SwapResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.SwapResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.SwapResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: jspb.Message.getFieldWithDefault(msg, 1, ""),
    idBytes: msg.getIdBytes_asB64(),
    htlcAddress: jspb.Message.getFieldWithDefault(msg, 2, ""),
    htlcAddressP2wsh: jspb.Message.getFieldWithDefault(msg, 5, ""),
    htlcAddressP2tr: jspb.Message.getFieldWithDefault(msg, 7, ""),
    serverMessage: jspb.Message.getFieldWithDefault(msg, 6, "")
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
 * @return {!proto.looprpc.SwapResponse}
 */
proto.looprpc.SwapResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.SwapResponse;
  return proto.looprpc.SwapResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.SwapResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.SwapResponse}
 */
proto.looprpc.SwapResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setId(value);
      break;
    case 3:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setIdBytes(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setHtlcAddress(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setHtlcAddressP2wsh(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readString());
      msg.setHtlcAddressP2tr(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readString());
      msg.setServerMessage(value);
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
proto.looprpc.SwapResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.SwapResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.SwapResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.SwapResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getIdBytes_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      3,
      f
    );
  }
  f = message.getHtlcAddress();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getHtlcAddressP2wsh();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getHtlcAddressP2tr();
  if (f.length > 0) {
    writer.writeString(
      7,
      f
    );
  }
  f = message.getServerMessage();
  if (f.length > 0) {
    writer.writeString(
      6,
      f
    );
  }
};


/**
 * optional string id = 1;
 * @return {string}
 */
proto.looprpc.SwapResponse.prototype.getId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.SwapResponse} returns this
 */
proto.looprpc.SwapResponse.prototype.setId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional bytes id_bytes = 3;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.SwapResponse.prototype.getIdBytes = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * optional bytes id_bytes = 3;
 * This is a type-conversion wrapper around `getIdBytes()`
 * @return {string}
 */
proto.looprpc.SwapResponse.prototype.getIdBytes_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getIdBytes()));
};


/**
 * optional bytes id_bytes = 3;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getIdBytes()`
 * @return {!Uint8Array}
 */
proto.looprpc.SwapResponse.prototype.getIdBytes_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getIdBytes()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.SwapResponse} returns this
 */
proto.looprpc.SwapResponse.prototype.setIdBytes = function(value) {
  return jspb.Message.setProto3BytesField(this, 3, value);
};


/**
 * optional string htlc_address = 2;
 * @return {string}
 */
proto.looprpc.SwapResponse.prototype.getHtlcAddress = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.SwapResponse} returns this
 */
proto.looprpc.SwapResponse.prototype.setHtlcAddress = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string htlc_address_p2wsh = 5;
 * @return {string}
 */
proto.looprpc.SwapResponse.prototype.getHtlcAddressP2wsh = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.SwapResponse} returns this
 */
proto.looprpc.SwapResponse.prototype.setHtlcAddressP2wsh = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};


/**
 * optional string htlc_address_p2tr = 7;
 * @return {string}
 */
proto.looprpc.SwapResponse.prototype.getHtlcAddressP2tr = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.SwapResponse} returns this
 */
proto.looprpc.SwapResponse.prototype.setHtlcAddressP2tr = function(value) {
  return jspb.Message.setProto3StringField(this, 7, value);
};


/**
 * optional string server_message = 6;
 * @return {string}
 */
proto.looprpc.SwapResponse.prototype.getServerMessage = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.SwapResponse} returns this
 */
proto.looprpc.SwapResponse.prototype.setServerMessage = function(value) {
  return jspb.Message.setProto3StringField(this, 6, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.MonitorRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.MonitorRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.MonitorRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.MonitorRequest.toObject = function(includeInstance, msg) {
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
 * @return {!proto.looprpc.MonitorRequest}
 */
proto.looprpc.MonitorRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.MonitorRequest;
  return proto.looprpc.MonitorRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.MonitorRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.MonitorRequest}
 */
proto.looprpc.MonitorRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.looprpc.MonitorRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.MonitorRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.MonitorRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.MonitorRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.looprpc.SwapStatus.repeatedFields_ = [17];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.SwapStatus.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.SwapStatus.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.SwapStatus} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.SwapStatus.toObject = function(includeInstance, msg) {
  var f, obj = {
    amt: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    id: jspb.Message.getFieldWithDefault(msg, 2, ""),
    idBytes: msg.getIdBytes_asB64(),
    type: jspb.Message.getFieldWithDefault(msg, 3, 0),
    state: jspb.Message.getFieldWithDefault(msg, 4, 0),
    failureReason: jspb.Message.getFieldWithDefault(msg, 14, 0),
    initiationTime: jspb.Message.getFieldWithDefault(msg, 5, "0"),
    lastUpdateTime: jspb.Message.getFieldWithDefault(msg, 6, "0"),
    htlcAddress: jspb.Message.getFieldWithDefault(msg, 7, ""),
    htlcAddressP2wsh: jspb.Message.getFieldWithDefault(msg, 12, ""),
    htlcAddressP2tr: jspb.Message.getFieldWithDefault(msg, 18, ""),
    costServer: jspb.Message.getFieldWithDefault(msg, 8, "0"),
    costOnchain: jspb.Message.getFieldWithDefault(msg, 9, "0"),
    costOffchain: jspb.Message.getFieldWithDefault(msg, 10, "0"),
    lastHop: msg.getLastHop_asB64(),
    outgoingChanSetList: (f = jspb.Message.getRepeatedField(msg, 17)) == null ? undefined : f,
    label: jspb.Message.getFieldWithDefault(msg, 15, ""),
    assetInfo: (f = msg.getAssetInfo()) && proto.looprpc.AssetLoopOutInfo.toObject(includeInstance, f)
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
 * @return {!proto.looprpc.SwapStatus}
 */
proto.looprpc.SwapStatus.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.SwapStatus;
  return proto.looprpc.SwapStatus.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.SwapStatus} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.SwapStatus}
 */
proto.looprpc.SwapStatus.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setAmt(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setId(value);
      break;
    case 11:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setIdBytes(value);
      break;
    case 3:
      var value = /** @type {!proto.looprpc.SwapType} */ (reader.readEnum());
      msg.setType(value);
      break;
    case 4:
      var value = /** @type {!proto.looprpc.SwapState} */ (reader.readEnum());
      msg.setState(value);
      break;
    case 14:
      var value = /** @type {!proto.looprpc.FailureReason} */ (reader.readEnum());
      msg.setFailureReason(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setInitiationTime(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setLastUpdateTime(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readString());
      msg.setHtlcAddress(value);
      break;
    case 12:
      var value = /** @type {string} */ (reader.readString());
      msg.setHtlcAddressP2wsh(value);
      break;
    case 18:
      var value = /** @type {string} */ (reader.readString());
      msg.setHtlcAddressP2tr(value);
      break;
    case 8:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setCostServer(value);
      break;
    case 9:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setCostOnchain(value);
      break;
    case 10:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setCostOffchain(value);
      break;
    case 16:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setLastHop(value);
      break;
    case 17:
      var values = /** @type {!Array<string>} */ (reader.isDelimited() ? reader.readPackedUint64String() : [reader.readUint64String()]);
      for (var i = 0; i < values.length; i++) {
        msg.addOutgoingChanSet(values[i]);
      }
      break;
    case 15:
      var value = /** @type {string} */ (reader.readString());
      msg.setLabel(value);
      break;
    case 19:
      var value = new proto.looprpc.AssetLoopOutInfo;
      reader.readMessage(value,proto.looprpc.AssetLoopOutInfo.deserializeBinaryFromReader);
      msg.setAssetInfo(value);
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
proto.looprpc.SwapStatus.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.SwapStatus.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.SwapStatus} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.SwapStatus.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAmt();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      1,
      f
    );
  }
  f = message.getId();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getIdBytes_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      11,
      f
    );
  }
  f = message.getType();
  if (f !== 0.0) {
    writer.writeEnum(
      3,
      f
    );
  }
  f = message.getState();
  if (f !== 0.0) {
    writer.writeEnum(
      4,
      f
    );
  }
  f = message.getFailureReason();
  if (f !== 0.0) {
    writer.writeEnum(
      14,
      f
    );
  }
  f = message.getInitiationTime();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      5,
      f
    );
  }
  f = message.getLastUpdateTime();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      6,
      f
    );
  }
  f = message.getHtlcAddress();
  if (f.length > 0) {
    writer.writeString(
      7,
      f
    );
  }
  f = message.getHtlcAddressP2wsh();
  if (f.length > 0) {
    writer.writeString(
      12,
      f
    );
  }
  f = message.getHtlcAddressP2tr();
  if (f.length > 0) {
    writer.writeString(
      18,
      f
    );
  }
  f = message.getCostServer();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      8,
      f
    );
  }
  f = message.getCostOnchain();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      9,
      f
    );
  }
  f = message.getCostOffchain();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      10,
      f
    );
  }
  f = message.getLastHop_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      16,
      f
    );
  }
  f = message.getOutgoingChanSetList();
  if (f.length > 0) {
    writer.writePackedUint64String(
      17,
      f
    );
  }
  f = message.getLabel();
  if (f.length > 0) {
    writer.writeString(
      15,
      f
    );
  }
  f = message.getAssetInfo();
  if (f != null) {
    writer.writeMessage(
      19,
      f,
      proto.looprpc.AssetLoopOutInfo.serializeBinaryToWriter
    );
  }
};


/**
 * optional int64 amt = 1;
 * @return {string}
 */
proto.looprpc.SwapStatus.prototype.getAmt = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.SwapStatus} returns this
 */
proto.looprpc.SwapStatus.prototype.setAmt = function(value) {
  return jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional string id = 2;
 * @return {string}
 */
proto.looprpc.SwapStatus.prototype.getId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.SwapStatus} returns this
 */
proto.looprpc.SwapStatus.prototype.setId = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional bytes id_bytes = 11;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.SwapStatus.prototype.getIdBytes = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 11, ""));
};


/**
 * optional bytes id_bytes = 11;
 * This is a type-conversion wrapper around `getIdBytes()`
 * @return {string}
 */
proto.looprpc.SwapStatus.prototype.getIdBytes_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getIdBytes()));
};


/**
 * optional bytes id_bytes = 11;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getIdBytes()`
 * @return {!Uint8Array}
 */
proto.looprpc.SwapStatus.prototype.getIdBytes_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getIdBytes()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.SwapStatus} returns this
 */
proto.looprpc.SwapStatus.prototype.setIdBytes = function(value) {
  return jspb.Message.setProto3BytesField(this, 11, value);
};


/**
 * optional SwapType type = 3;
 * @return {!proto.looprpc.SwapType}
 */
proto.looprpc.SwapStatus.prototype.getType = function() {
  return /** @type {!proto.looprpc.SwapType} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {!proto.looprpc.SwapType} value
 * @return {!proto.looprpc.SwapStatus} returns this
 */
proto.looprpc.SwapStatus.prototype.setType = function(value) {
  return jspb.Message.setProto3EnumField(this, 3, value);
};


/**
 * optional SwapState state = 4;
 * @return {!proto.looprpc.SwapState}
 */
proto.looprpc.SwapStatus.prototype.getState = function() {
  return /** @type {!proto.looprpc.SwapState} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {!proto.looprpc.SwapState} value
 * @return {!proto.looprpc.SwapStatus} returns this
 */
proto.looprpc.SwapStatus.prototype.setState = function(value) {
  return jspb.Message.setProto3EnumField(this, 4, value);
};


/**
 * optional FailureReason failure_reason = 14;
 * @return {!proto.looprpc.FailureReason}
 */
proto.looprpc.SwapStatus.prototype.getFailureReason = function() {
  return /** @type {!proto.looprpc.FailureReason} */ (jspb.Message.getFieldWithDefault(this, 14, 0));
};


/**
 * @param {!proto.looprpc.FailureReason} value
 * @return {!proto.looprpc.SwapStatus} returns this
 */
proto.looprpc.SwapStatus.prototype.setFailureReason = function(value) {
  return jspb.Message.setProto3EnumField(this, 14, value);
};


/**
 * optional int64 initiation_time = 5;
 * @return {string}
 */
proto.looprpc.SwapStatus.prototype.getInitiationTime = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.SwapStatus} returns this
 */
proto.looprpc.SwapStatus.prototype.setInitiationTime = function(value) {
  return jspb.Message.setProto3StringIntField(this, 5, value);
};


/**
 * optional int64 last_update_time = 6;
 * @return {string}
 */
proto.looprpc.SwapStatus.prototype.getLastUpdateTime = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.SwapStatus} returns this
 */
proto.looprpc.SwapStatus.prototype.setLastUpdateTime = function(value) {
  return jspb.Message.setProto3StringIntField(this, 6, value);
};


/**
 * optional string htlc_address = 7;
 * @return {string}
 */
proto.looprpc.SwapStatus.prototype.getHtlcAddress = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.SwapStatus} returns this
 */
proto.looprpc.SwapStatus.prototype.setHtlcAddress = function(value) {
  return jspb.Message.setProto3StringField(this, 7, value);
};


/**
 * optional string htlc_address_p2wsh = 12;
 * @return {string}
 */
proto.looprpc.SwapStatus.prototype.getHtlcAddressP2wsh = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 12, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.SwapStatus} returns this
 */
proto.looprpc.SwapStatus.prototype.setHtlcAddressP2wsh = function(value) {
  return jspb.Message.setProto3StringField(this, 12, value);
};


/**
 * optional string htlc_address_p2tr = 18;
 * @return {string}
 */
proto.looprpc.SwapStatus.prototype.getHtlcAddressP2tr = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 18, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.SwapStatus} returns this
 */
proto.looprpc.SwapStatus.prototype.setHtlcAddressP2tr = function(value) {
  return jspb.Message.setProto3StringField(this, 18, value);
};


/**
 * optional int64 cost_server = 8;
 * @return {string}
 */
proto.looprpc.SwapStatus.prototype.getCostServer = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 8, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.SwapStatus} returns this
 */
proto.looprpc.SwapStatus.prototype.setCostServer = function(value) {
  return jspb.Message.setProto3StringIntField(this, 8, value);
};


/**
 * optional int64 cost_onchain = 9;
 * @return {string}
 */
proto.looprpc.SwapStatus.prototype.getCostOnchain = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 9, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.SwapStatus} returns this
 */
proto.looprpc.SwapStatus.prototype.setCostOnchain = function(value) {
  return jspb.Message.setProto3StringIntField(this, 9, value);
};


/**
 * optional int64 cost_offchain = 10;
 * @return {string}
 */
proto.looprpc.SwapStatus.prototype.getCostOffchain = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 10, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.SwapStatus} returns this
 */
proto.looprpc.SwapStatus.prototype.setCostOffchain = function(value) {
  return jspb.Message.setProto3StringIntField(this, 10, value);
};


/**
 * optional bytes last_hop = 16;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.SwapStatus.prototype.getLastHop = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 16, ""));
};


/**
 * optional bytes last_hop = 16;
 * This is a type-conversion wrapper around `getLastHop()`
 * @return {string}
 */
proto.looprpc.SwapStatus.prototype.getLastHop_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getLastHop()));
};


/**
 * optional bytes last_hop = 16;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getLastHop()`
 * @return {!Uint8Array}
 */
proto.looprpc.SwapStatus.prototype.getLastHop_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getLastHop()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.SwapStatus} returns this
 */
proto.looprpc.SwapStatus.prototype.setLastHop = function(value) {
  return jspb.Message.setProto3BytesField(this, 16, value);
};


/**
 * repeated uint64 outgoing_chan_set = 17;
 * @return {!Array<string>}
 */
proto.looprpc.SwapStatus.prototype.getOutgoingChanSetList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 17));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.looprpc.SwapStatus} returns this
 */
proto.looprpc.SwapStatus.prototype.setOutgoingChanSetList = function(value) {
  return jspb.Message.setField(this, 17, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.looprpc.SwapStatus} returns this
 */
proto.looprpc.SwapStatus.prototype.addOutgoingChanSet = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 17, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.SwapStatus} returns this
 */
proto.looprpc.SwapStatus.prototype.clearOutgoingChanSetList = function() {
  return this.setOutgoingChanSetList([]);
};


/**
 * optional string label = 15;
 * @return {string}
 */
proto.looprpc.SwapStatus.prototype.getLabel = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 15, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.SwapStatus} returns this
 */
proto.looprpc.SwapStatus.prototype.setLabel = function(value) {
  return jspb.Message.setProto3StringField(this, 15, value);
};


/**
 * optional AssetLoopOutInfo asset_info = 19;
 * @return {?proto.looprpc.AssetLoopOutInfo}
 */
proto.looprpc.SwapStatus.prototype.getAssetInfo = function() {
  return /** @type{?proto.looprpc.AssetLoopOutInfo} */ (
    jspb.Message.getWrapperField(this, proto.looprpc.AssetLoopOutInfo, 19));
};


/**
 * @param {?proto.looprpc.AssetLoopOutInfo|undefined} value
 * @return {!proto.looprpc.SwapStatus} returns this
*/
proto.looprpc.SwapStatus.prototype.setAssetInfo = function(value) {
  return jspb.Message.setWrapperField(this, 19, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.looprpc.SwapStatus} returns this
 */
proto.looprpc.SwapStatus.prototype.clearAssetInfo = function() {
  return this.setAssetInfo(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.looprpc.SwapStatus.prototype.hasAssetInfo = function() {
  return jspb.Message.getField(this, 19) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.ListSwapsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.ListSwapsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.ListSwapsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListSwapsRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    listSwapFilter: (f = msg.getListSwapFilter()) && proto.looprpc.ListSwapsFilter.toObject(includeInstance, f),
    maxSwaps: jspb.Message.getFieldWithDefault(msg, 2, "0")
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
 * @return {!proto.looprpc.ListSwapsRequest}
 */
proto.looprpc.ListSwapsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.ListSwapsRequest;
  return proto.looprpc.ListSwapsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.ListSwapsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.ListSwapsRequest}
 */
proto.looprpc.ListSwapsRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.looprpc.ListSwapsFilter;
      reader.readMessage(value,proto.looprpc.ListSwapsFilter.deserializeBinaryFromReader);
      msg.setListSwapFilter(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setMaxSwaps(value);
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
proto.looprpc.ListSwapsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.ListSwapsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.ListSwapsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListSwapsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getListSwapFilter();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.looprpc.ListSwapsFilter.serializeBinaryToWriter
    );
  }
  f = message.getMaxSwaps();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      2,
      f
    );
  }
};


/**
 * optional ListSwapsFilter list_swap_filter = 1;
 * @return {?proto.looprpc.ListSwapsFilter}
 */
proto.looprpc.ListSwapsRequest.prototype.getListSwapFilter = function() {
  return /** @type{?proto.looprpc.ListSwapsFilter} */ (
    jspb.Message.getWrapperField(this, proto.looprpc.ListSwapsFilter, 1));
};


/**
 * @param {?proto.looprpc.ListSwapsFilter|undefined} value
 * @return {!proto.looprpc.ListSwapsRequest} returns this
*/
proto.looprpc.ListSwapsRequest.prototype.setListSwapFilter = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.looprpc.ListSwapsRequest} returns this
 */
proto.looprpc.ListSwapsRequest.prototype.clearListSwapFilter = function() {
  return this.setListSwapFilter(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.looprpc.ListSwapsRequest.prototype.hasListSwapFilter = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional uint64 max_swaps = 2;
 * @return {string}
 */
proto.looprpc.ListSwapsRequest.prototype.getMaxSwaps = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.ListSwapsRequest} returns this
 */
proto.looprpc.ListSwapsRequest.prototype.setMaxSwaps = function(value) {
  return jspb.Message.setProto3StringIntField(this, 2, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.looprpc.ListSwapsFilter.repeatedFields_ = [3];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.ListSwapsFilter.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.ListSwapsFilter.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.ListSwapsFilter} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListSwapsFilter.toObject = function(includeInstance, msg) {
  var f, obj = {
    swapType: jspb.Message.getFieldWithDefault(msg, 1, 0),
    pendingOnly: jspb.Message.getBooleanFieldWithDefault(msg, 2, false),
    outgoingChanSetList: (f = jspb.Message.getRepeatedField(msg, 3)) == null ? undefined : f,
    label: jspb.Message.getFieldWithDefault(msg, 4, ""),
    loopInLastHop: msg.getLoopInLastHop_asB64(),
    assetSwapOnly: jspb.Message.getBooleanFieldWithDefault(msg, 6, false),
    startTimestampNs: jspb.Message.getFieldWithDefault(msg, 7, "0")
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
 * @return {!proto.looprpc.ListSwapsFilter}
 */
proto.looprpc.ListSwapsFilter.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.ListSwapsFilter;
  return proto.looprpc.ListSwapsFilter.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.ListSwapsFilter} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.ListSwapsFilter}
 */
proto.looprpc.ListSwapsFilter.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.looprpc.ListSwapsFilter.SwapTypeFilter} */ (reader.readEnum());
      msg.setSwapType(value);
      break;
    case 2:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setPendingOnly(value);
      break;
    case 3:
      var values = /** @type {!Array<string>} */ (reader.isDelimited() ? reader.readPackedUint64String() : [reader.readUint64String()]);
      for (var i = 0; i < values.length; i++) {
        msg.addOutgoingChanSet(values[i]);
      }
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setLabel(value);
      break;
    case 5:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setLoopInLastHop(value);
      break;
    case 6:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setAssetSwapOnly(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setStartTimestampNs(value);
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
proto.looprpc.ListSwapsFilter.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.ListSwapsFilter.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.ListSwapsFilter} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListSwapsFilter.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSwapType();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getPendingOnly();
  if (f) {
    writer.writeBool(
      2,
      f
    );
  }
  f = message.getOutgoingChanSetList();
  if (f.length > 0) {
    writer.writePackedUint64String(
      3,
      f
    );
  }
  f = message.getLabel();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getLoopInLastHop_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      5,
      f
    );
  }
  f = message.getAssetSwapOnly();
  if (f) {
    writer.writeBool(
      6,
      f
    );
  }
  f = message.getStartTimestampNs();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      7,
      f
    );
  }
};


/**
 * @enum {number}
 */
proto.looprpc.ListSwapsFilter.SwapTypeFilter = {
  ANY: 0,
  LOOP_OUT: 1,
  LOOP_IN: 2
};

/**
 * optional SwapTypeFilter swap_type = 1;
 * @return {!proto.looprpc.ListSwapsFilter.SwapTypeFilter}
 */
proto.looprpc.ListSwapsFilter.prototype.getSwapType = function() {
  return /** @type {!proto.looprpc.ListSwapsFilter.SwapTypeFilter} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {!proto.looprpc.ListSwapsFilter.SwapTypeFilter} value
 * @return {!proto.looprpc.ListSwapsFilter} returns this
 */
proto.looprpc.ListSwapsFilter.prototype.setSwapType = function(value) {
  return jspb.Message.setProto3EnumField(this, 1, value);
};


/**
 * optional bool pending_only = 2;
 * @return {boolean}
 */
proto.looprpc.ListSwapsFilter.prototype.getPendingOnly = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 2, false));
};


/**
 * @param {boolean} value
 * @return {!proto.looprpc.ListSwapsFilter} returns this
 */
proto.looprpc.ListSwapsFilter.prototype.setPendingOnly = function(value) {
  return jspb.Message.setProto3BooleanField(this, 2, value);
};


/**
 * repeated uint64 outgoing_chan_set = 3;
 * @return {!Array<string>}
 */
proto.looprpc.ListSwapsFilter.prototype.getOutgoingChanSetList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 3));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.looprpc.ListSwapsFilter} returns this
 */
proto.looprpc.ListSwapsFilter.prototype.setOutgoingChanSetList = function(value) {
  return jspb.Message.setField(this, 3, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.looprpc.ListSwapsFilter} returns this
 */
proto.looprpc.ListSwapsFilter.prototype.addOutgoingChanSet = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 3, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.ListSwapsFilter} returns this
 */
proto.looprpc.ListSwapsFilter.prototype.clearOutgoingChanSetList = function() {
  return this.setOutgoingChanSetList([]);
};


/**
 * optional string label = 4;
 * @return {string}
 */
proto.looprpc.ListSwapsFilter.prototype.getLabel = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.ListSwapsFilter} returns this
 */
proto.looprpc.ListSwapsFilter.prototype.setLabel = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional bytes loop_in_last_hop = 5;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.ListSwapsFilter.prototype.getLoopInLastHop = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * optional bytes loop_in_last_hop = 5;
 * This is a type-conversion wrapper around `getLoopInLastHop()`
 * @return {string}
 */
proto.looprpc.ListSwapsFilter.prototype.getLoopInLastHop_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getLoopInLastHop()));
};


/**
 * optional bytes loop_in_last_hop = 5;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getLoopInLastHop()`
 * @return {!Uint8Array}
 */
proto.looprpc.ListSwapsFilter.prototype.getLoopInLastHop_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getLoopInLastHop()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.ListSwapsFilter} returns this
 */
proto.looprpc.ListSwapsFilter.prototype.setLoopInLastHop = function(value) {
  return jspb.Message.setProto3BytesField(this, 5, value);
};


/**
 * optional bool asset_swap_only = 6;
 * @return {boolean}
 */
proto.looprpc.ListSwapsFilter.prototype.getAssetSwapOnly = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 6, false));
};


/**
 * @param {boolean} value
 * @return {!proto.looprpc.ListSwapsFilter} returns this
 */
proto.looprpc.ListSwapsFilter.prototype.setAssetSwapOnly = function(value) {
  return jspb.Message.setProto3BooleanField(this, 6, value);
};


/**
 * optional int64 start_timestamp_ns = 7;
 * @return {string}
 */
proto.looprpc.ListSwapsFilter.prototype.getStartTimestampNs = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.ListSwapsFilter} returns this
 */
proto.looprpc.ListSwapsFilter.prototype.setStartTimestampNs = function(value) {
  return jspb.Message.setProto3StringIntField(this, 7, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.looprpc.ListSwapsResponse.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.ListSwapsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.ListSwapsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.ListSwapsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListSwapsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    swapsList: jspb.Message.toObjectList(msg.getSwapsList(),
    proto.looprpc.SwapStatus.toObject, includeInstance),
    nextStartTime: jspb.Message.getFieldWithDefault(msg, 2, "0")
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
 * @return {!proto.looprpc.ListSwapsResponse}
 */
proto.looprpc.ListSwapsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.ListSwapsResponse;
  return proto.looprpc.ListSwapsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.ListSwapsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.ListSwapsResponse}
 */
proto.looprpc.ListSwapsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.looprpc.SwapStatus;
      reader.readMessage(value,proto.looprpc.SwapStatus.deserializeBinaryFromReader);
      msg.addSwaps(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setNextStartTime(value);
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
proto.looprpc.ListSwapsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.ListSwapsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.ListSwapsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListSwapsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSwapsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.looprpc.SwapStatus.serializeBinaryToWriter
    );
  }
  f = message.getNextStartTime();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      2,
      f
    );
  }
};


/**
 * repeated SwapStatus swaps = 1;
 * @return {!Array<!proto.looprpc.SwapStatus>}
 */
proto.looprpc.ListSwapsResponse.prototype.getSwapsList = function() {
  return /** @type{!Array<!proto.looprpc.SwapStatus>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.looprpc.SwapStatus, 1));
};


/**
 * @param {!Array<!proto.looprpc.SwapStatus>} value
 * @return {!proto.looprpc.ListSwapsResponse} returns this
*/
proto.looprpc.ListSwapsResponse.prototype.setSwapsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.looprpc.SwapStatus=} opt_value
 * @param {number=} opt_index
 * @return {!proto.looprpc.SwapStatus}
 */
proto.looprpc.ListSwapsResponse.prototype.addSwaps = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.looprpc.SwapStatus, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.ListSwapsResponse} returns this
 */
proto.looprpc.ListSwapsResponse.prototype.clearSwapsList = function() {
  return this.setSwapsList([]);
};


/**
 * optional int64 next_start_time = 2;
 * @return {string}
 */
proto.looprpc.ListSwapsResponse.prototype.getNextStartTime = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.ListSwapsResponse} returns this
 */
proto.looprpc.ListSwapsResponse.prototype.setNextStartTime = function(value) {
  return jspb.Message.setProto3StringIntField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.SwapInfoRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.SwapInfoRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.SwapInfoRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.SwapInfoRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: msg.getId_asB64()
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
 * @return {!proto.looprpc.SwapInfoRequest}
 */
proto.looprpc.SwapInfoRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.SwapInfoRequest;
  return proto.looprpc.SwapInfoRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.SwapInfoRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.SwapInfoRequest}
 */
proto.looprpc.SwapInfoRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.looprpc.SwapInfoRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.SwapInfoRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.SwapInfoRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.SwapInfoRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
};


/**
 * optional bytes id = 1;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.SwapInfoRequest.prototype.getId = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes id = 1;
 * This is a type-conversion wrapper around `getId()`
 * @return {string}
 */
proto.looprpc.SwapInfoRequest.prototype.getId_asB64 = function() {
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
proto.looprpc.SwapInfoRequest.prototype.getId_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getId()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.SwapInfoRequest} returns this
 */
proto.looprpc.SwapInfoRequest.prototype.setId = function(value) {
  return jspb.Message.setProto3BytesField(this, 1, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.TermsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.TermsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.TermsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.TermsRequest.toObject = function(includeInstance, msg) {
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
 * @return {!proto.looprpc.TermsRequest}
 */
proto.looprpc.TermsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.TermsRequest;
  return proto.looprpc.TermsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.TermsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.TermsRequest}
 */
proto.looprpc.TermsRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.looprpc.TermsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.TermsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.TermsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.TermsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.InTermsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.InTermsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.InTermsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.InTermsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    minSwapAmount: jspb.Message.getFieldWithDefault(msg, 5, "0"),
    maxSwapAmount: jspb.Message.getFieldWithDefault(msg, 6, "0")
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
 * @return {!proto.looprpc.InTermsResponse}
 */
proto.looprpc.InTermsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.InTermsResponse;
  return proto.looprpc.InTermsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.InTermsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.InTermsResponse}
 */
proto.looprpc.InTermsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 5:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setMinSwapAmount(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setMaxSwapAmount(value);
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
proto.looprpc.InTermsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.InTermsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.InTermsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.InTermsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getMinSwapAmount();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      5,
      f
    );
  }
  f = message.getMaxSwapAmount();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      6,
      f
    );
  }
};


/**
 * optional int64 min_swap_amount = 5;
 * @return {string}
 */
proto.looprpc.InTermsResponse.prototype.getMinSwapAmount = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.InTermsResponse} returns this
 */
proto.looprpc.InTermsResponse.prototype.setMinSwapAmount = function(value) {
  return jspb.Message.setProto3StringIntField(this, 5, value);
};


/**
 * optional int64 max_swap_amount = 6;
 * @return {string}
 */
proto.looprpc.InTermsResponse.prototype.getMaxSwapAmount = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.InTermsResponse} returns this
 */
proto.looprpc.InTermsResponse.prototype.setMaxSwapAmount = function(value) {
  return jspb.Message.setProto3StringIntField(this, 6, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.OutTermsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.OutTermsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.OutTermsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.OutTermsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    minSwapAmount: jspb.Message.getFieldWithDefault(msg, 5, "0"),
    maxSwapAmount: jspb.Message.getFieldWithDefault(msg, 6, "0"),
    minCltvDelta: jspb.Message.getFieldWithDefault(msg, 8, 0),
    maxCltvDelta: jspb.Message.getFieldWithDefault(msg, 9, 0)
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
 * @return {!proto.looprpc.OutTermsResponse}
 */
proto.looprpc.OutTermsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.OutTermsResponse;
  return proto.looprpc.OutTermsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.OutTermsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.OutTermsResponse}
 */
proto.looprpc.OutTermsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 5:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setMinSwapAmount(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setMaxSwapAmount(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setMinCltvDelta(value);
      break;
    case 9:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setMaxCltvDelta(value);
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
proto.looprpc.OutTermsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.OutTermsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.OutTermsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.OutTermsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getMinSwapAmount();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      5,
      f
    );
  }
  f = message.getMaxSwapAmount();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      6,
      f
    );
  }
  f = message.getMinCltvDelta();
  if (f !== 0) {
    writer.writeInt32(
      8,
      f
    );
  }
  f = message.getMaxCltvDelta();
  if (f !== 0) {
    writer.writeInt32(
      9,
      f
    );
  }
};


/**
 * optional int64 min_swap_amount = 5;
 * @return {string}
 */
proto.looprpc.OutTermsResponse.prototype.getMinSwapAmount = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.OutTermsResponse} returns this
 */
proto.looprpc.OutTermsResponse.prototype.setMinSwapAmount = function(value) {
  return jspb.Message.setProto3StringIntField(this, 5, value);
};


/**
 * optional int64 max_swap_amount = 6;
 * @return {string}
 */
proto.looprpc.OutTermsResponse.prototype.getMaxSwapAmount = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.OutTermsResponse} returns this
 */
proto.looprpc.OutTermsResponse.prototype.setMaxSwapAmount = function(value) {
  return jspb.Message.setProto3StringIntField(this, 6, value);
};


/**
 * optional int32 min_cltv_delta = 8;
 * @return {number}
 */
proto.looprpc.OutTermsResponse.prototype.getMinCltvDelta = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 8, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.OutTermsResponse} returns this
 */
proto.looprpc.OutTermsResponse.prototype.setMinCltvDelta = function(value) {
  return jspb.Message.setProto3IntField(this, 8, value);
};


/**
 * optional int32 max_cltv_delta = 9;
 * @return {number}
 */
proto.looprpc.OutTermsResponse.prototype.getMaxCltvDelta = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 9, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.OutTermsResponse} returns this
 */
proto.looprpc.OutTermsResponse.prototype.setMaxCltvDelta = function(value) {
  return jspb.Message.setProto3IntField(this, 9, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.looprpc.QuoteRequest.repeatedFields_ = [6,8];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.QuoteRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.QuoteRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.QuoteRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.QuoteRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    amt: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    confTarget: jspb.Message.getFieldWithDefault(msg, 2, 0),
    externalHtlc: jspb.Message.getBooleanFieldWithDefault(msg, 3, false),
    swapPublicationDeadline: jspb.Message.getFieldWithDefault(msg, 4, "0"),
    loopInLastHop: msg.getLoopInLastHop_asB64(),
    loopInRouteHintsList: jspb.Message.toObjectList(msg.getLoopInRouteHintsList(),
    swapserverrpc_common_pb.RouteHint.toObject, includeInstance),
    pb_private: jspb.Message.getBooleanFieldWithDefault(msg, 7, false),
    depositOutpointsList: (f = jspb.Message.getRepeatedField(msg, 8)) == null ? undefined : f,
    assetInfo: (f = msg.getAssetInfo()) && proto.looprpc.AssetLoopOutRequest.toObject(includeInstance, f),
    autoSelectDeposits: jspb.Message.getBooleanFieldWithDefault(msg, 10, false)
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
 * @return {!proto.looprpc.QuoteRequest}
 */
proto.looprpc.QuoteRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.QuoteRequest;
  return proto.looprpc.QuoteRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.QuoteRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.QuoteRequest}
 */
proto.looprpc.QuoteRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setAmt(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setConfTarget(value);
      break;
    case 3:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setExternalHtlc(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setSwapPublicationDeadline(value);
      break;
    case 5:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setLoopInLastHop(value);
      break;
    case 6:
      var value = new swapserverrpc_common_pb.RouteHint;
      reader.readMessage(value,swapserverrpc_common_pb.RouteHint.deserializeBinaryFromReader);
      msg.addLoopInRouteHints(value);
      break;
    case 7:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setPrivate(value);
      break;
    case 8:
      var value = /** @type {string} */ (reader.readString());
      msg.addDepositOutpoints(value);
      break;
    case 9:
      var value = new proto.looprpc.AssetLoopOutRequest;
      reader.readMessage(value,proto.looprpc.AssetLoopOutRequest.deserializeBinaryFromReader);
      msg.setAssetInfo(value);
      break;
    case 10:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setAutoSelectDeposits(value);
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
proto.looprpc.QuoteRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.QuoteRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.QuoteRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.QuoteRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAmt();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      1,
      f
    );
  }
  f = message.getConfTarget();
  if (f !== 0) {
    writer.writeInt32(
      2,
      f
    );
  }
  f = message.getExternalHtlc();
  if (f) {
    writer.writeBool(
      3,
      f
    );
  }
  f = message.getSwapPublicationDeadline();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      4,
      f
    );
  }
  f = message.getLoopInLastHop_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      5,
      f
    );
  }
  f = message.getLoopInRouteHintsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      6,
      f,
      swapserverrpc_common_pb.RouteHint.serializeBinaryToWriter
    );
  }
  f = message.getPrivate();
  if (f) {
    writer.writeBool(
      7,
      f
    );
  }
  f = message.getDepositOutpointsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      8,
      f
    );
  }
  f = message.getAssetInfo();
  if (f != null) {
    writer.writeMessage(
      9,
      f,
      proto.looprpc.AssetLoopOutRequest.serializeBinaryToWriter
    );
  }
  f = message.getAutoSelectDeposits();
  if (f) {
    writer.writeBool(
      10,
      f
    );
  }
};


/**
 * optional int64 amt = 1;
 * @return {string}
 */
proto.looprpc.QuoteRequest.prototype.getAmt = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.QuoteRequest} returns this
 */
proto.looprpc.QuoteRequest.prototype.setAmt = function(value) {
  return jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional int32 conf_target = 2;
 * @return {number}
 */
proto.looprpc.QuoteRequest.prototype.getConfTarget = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.QuoteRequest} returns this
 */
proto.looprpc.QuoteRequest.prototype.setConfTarget = function(value) {
  return jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional bool external_htlc = 3;
 * @return {boolean}
 */
proto.looprpc.QuoteRequest.prototype.getExternalHtlc = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 3, false));
};


/**
 * @param {boolean} value
 * @return {!proto.looprpc.QuoteRequest} returns this
 */
proto.looprpc.QuoteRequest.prototype.setExternalHtlc = function(value) {
  return jspb.Message.setProto3BooleanField(this, 3, value);
};


/**
 * optional uint64 swap_publication_deadline = 4;
 * @return {string}
 */
proto.looprpc.QuoteRequest.prototype.getSwapPublicationDeadline = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.QuoteRequest} returns this
 */
proto.looprpc.QuoteRequest.prototype.setSwapPublicationDeadline = function(value) {
  return jspb.Message.setProto3StringIntField(this, 4, value);
};


/**
 * optional bytes loop_in_last_hop = 5;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.QuoteRequest.prototype.getLoopInLastHop = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * optional bytes loop_in_last_hop = 5;
 * This is a type-conversion wrapper around `getLoopInLastHop()`
 * @return {string}
 */
proto.looprpc.QuoteRequest.prototype.getLoopInLastHop_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getLoopInLastHop()));
};


/**
 * optional bytes loop_in_last_hop = 5;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getLoopInLastHop()`
 * @return {!Uint8Array}
 */
proto.looprpc.QuoteRequest.prototype.getLoopInLastHop_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getLoopInLastHop()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.QuoteRequest} returns this
 */
proto.looprpc.QuoteRequest.prototype.setLoopInLastHop = function(value) {
  return jspb.Message.setProto3BytesField(this, 5, value);
};


/**
 * repeated RouteHint loop_in_route_hints = 6;
 * @return {!Array<!proto.looprpc.RouteHint>}
 */
proto.looprpc.QuoteRequest.prototype.getLoopInRouteHintsList = function() {
  return /** @type{!Array<!proto.looprpc.RouteHint>} */ (
    jspb.Message.getRepeatedWrapperField(this, swapserverrpc_common_pb.RouteHint, 6));
};


/**
 * @param {!Array<!proto.looprpc.RouteHint>} value
 * @return {!proto.looprpc.QuoteRequest} returns this
*/
proto.looprpc.QuoteRequest.prototype.setLoopInRouteHintsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 6, value);
};


/**
 * @param {!proto.looprpc.RouteHint=} opt_value
 * @param {number=} opt_index
 * @return {!proto.looprpc.RouteHint}
 */
proto.looprpc.QuoteRequest.prototype.addLoopInRouteHints = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 6, opt_value, proto.looprpc.RouteHint, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.QuoteRequest} returns this
 */
proto.looprpc.QuoteRequest.prototype.clearLoopInRouteHintsList = function() {
  return this.setLoopInRouteHintsList([]);
};


/**
 * optional bool private = 7;
 * @return {boolean}
 */
proto.looprpc.QuoteRequest.prototype.getPrivate = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 7, false));
};


/**
 * @param {boolean} value
 * @return {!proto.looprpc.QuoteRequest} returns this
 */
proto.looprpc.QuoteRequest.prototype.setPrivate = function(value) {
  return jspb.Message.setProto3BooleanField(this, 7, value);
};


/**
 * repeated string deposit_outpoints = 8;
 * @return {!Array<string>}
 */
proto.looprpc.QuoteRequest.prototype.getDepositOutpointsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 8));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.looprpc.QuoteRequest} returns this
 */
proto.looprpc.QuoteRequest.prototype.setDepositOutpointsList = function(value) {
  return jspb.Message.setField(this, 8, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.looprpc.QuoteRequest} returns this
 */
proto.looprpc.QuoteRequest.prototype.addDepositOutpoints = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 8, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.QuoteRequest} returns this
 */
proto.looprpc.QuoteRequest.prototype.clearDepositOutpointsList = function() {
  return this.setDepositOutpointsList([]);
};


/**
 * optional AssetLoopOutRequest asset_info = 9;
 * @return {?proto.looprpc.AssetLoopOutRequest}
 */
proto.looprpc.QuoteRequest.prototype.getAssetInfo = function() {
  return /** @type{?proto.looprpc.AssetLoopOutRequest} */ (
    jspb.Message.getWrapperField(this, proto.looprpc.AssetLoopOutRequest, 9));
};


/**
 * @param {?proto.looprpc.AssetLoopOutRequest|undefined} value
 * @return {!proto.looprpc.QuoteRequest} returns this
*/
proto.looprpc.QuoteRequest.prototype.setAssetInfo = function(value) {
  return jspb.Message.setWrapperField(this, 9, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.looprpc.QuoteRequest} returns this
 */
proto.looprpc.QuoteRequest.prototype.clearAssetInfo = function() {
  return this.setAssetInfo(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.looprpc.QuoteRequest.prototype.hasAssetInfo = function() {
  return jspb.Message.getField(this, 9) != null;
};


/**
 * optional bool auto_select_deposits = 10;
 * @return {boolean}
 */
proto.looprpc.QuoteRequest.prototype.getAutoSelectDeposits = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 10, false));
};


/**
 * @param {boolean} value
 * @return {!proto.looprpc.QuoteRequest} returns this
 */
proto.looprpc.QuoteRequest.prototype.setAutoSelectDeposits = function(value) {
  return jspb.Message.setProto3BooleanField(this, 10, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.InQuoteResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.InQuoteResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.InQuoteResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.InQuoteResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    swapFeeSat: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    htlcPublishFeeSat: jspb.Message.getFieldWithDefault(msg, 3, "0"),
    cltvDelta: jspb.Message.getFieldWithDefault(msg, 5, 0),
    confTarget: jspb.Message.getFieldWithDefault(msg, 6, 0)
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
 * @return {!proto.looprpc.InQuoteResponse}
 */
proto.looprpc.InQuoteResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.InQuoteResponse;
  return proto.looprpc.InQuoteResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.InQuoteResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.InQuoteResponse}
 */
proto.looprpc.InQuoteResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setSwapFeeSat(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setHtlcPublishFeeSat(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setCltvDelta(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readInt32());
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
proto.looprpc.InQuoteResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.InQuoteResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.InQuoteResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.InQuoteResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSwapFeeSat();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      1,
      f
    );
  }
  f = message.getHtlcPublishFeeSat();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      3,
      f
    );
  }
  f = message.getCltvDelta();
  if (f !== 0) {
    writer.writeInt32(
      5,
      f
    );
  }
  f = message.getConfTarget();
  if (f !== 0) {
    writer.writeInt32(
      6,
      f
    );
  }
};


/**
 * optional int64 swap_fee_sat = 1;
 * @return {string}
 */
proto.looprpc.InQuoteResponse.prototype.getSwapFeeSat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.InQuoteResponse} returns this
 */
proto.looprpc.InQuoteResponse.prototype.setSwapFeeSat = function(value) {
  return jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional int64 htlc_publish_fee_sat = 3;
 * @return {string}
 */
proto.looprpc.InQuoteResponse.prototype.getHtlcPublishFeeSat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.InQuoteResponse} returns this
 */
proto.looprpc.InQuoteResponse.prototype.setHtlcPublishFeeSat = function(value) {
  return jspb.Message.setProto3StringIntField(this, 3, value);
};


/**
 * optional int32 cltv_delta = 5;
 * @return {number}
 */
proto.looprpc.InQuoteResponse.prototype.getCltvDelta = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.InQuoteResponse} returns this
 */
proto.looprpc.InQuoteResponse.prototype.setCltvDelta = function(value) {
  return jspb.Message.setProto3IntField(this, 5, value);
};


/**
 * optional int32 conf_target = 6;
 * @return {number}
 */
proto.looprpc.InQuoteResponse.prototype.getConfTarget = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.InQuoteResponse} returns this
 */
proto.looprpc.InQuoteResponse.prototype.setConfTarget = function(value) {
  return jspb.Message.setProto3IntField(this, 6, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.OutQuoteResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.OutQuoteResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.OutQuoteResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.OutQuoteResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    swapFeeSat: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    prepayAmtSat: jspb.Message.getFieldWithDefault(msg, 2, "0"),
    htlcSweepFeeSat: jspb.Message.getFieldWithDefault(msg, 3, "0"),
    swapPaymentDest: msg.getSwapPaymentDest_asB64(),
    cltvDelta: jspb.Message.getFieldWithDefault(msg, 5, 0),
    confTarget: jspb.Message.getFieldWithDefault(msg, 6, 0),
    assetRfqInfo: (f = msg.getAssetRfqInfo()) && proto.looprpc.AssetRfqInfo.toObject(includeInstance, f)
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
 * @return {!proto.looprpc.OutQuoteResponse}
 */
proto.looprpc.OutQuoteResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.OutQuoteResponse;
  return proto.looprpc.OutQuoteResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.OutQuoteResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.OutQuoteResponse}
 */
proto.looprpc.OutQuoteResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setSwapFeeSat(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setPrepayAmtSat(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setHtlcSweepFeeSat(value);
      break;
    case 4:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSwapPaymentDest(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setCltvDelta(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setConfTarget(value);
      break;
    case 7:
      var value = new proto.looprpc.AssetRfqInfo;
      reader.readMessage(value,proto.looprpc.AssetRfqInfo.deserializeBinaryFromReader);
      msg.setAssetRfqInfo(value);
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
proto.looprpc.OutQuoteResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.OutQuoteResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.OutQuoteResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.OutQuoteResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSwapFeeSat();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      1,
      f
    );
  }
  f = message.getPrepayAmtSat();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      2,
      f
    );
  }
  f = message.getHtlcSweepFeeSat();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      3,
      f
    );
  }
  f = message.getSwapPaymentDest_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      4,
      f
    );
  }
  f = message.getCltvDelta();
  if (f !== 0) {
    writer.writeInt32(
      5,
      f
    );
  }
  f = message.getConfTarget();
  if (f !== 0) {
    writer.writeInt32(
      6,
      f
    );
  }
  f = message.getAssetRfqInfo();
  if (f != null) {
    writer.writeMessage(
      7,
      f,
      proto.looprpc.AssetRfqInfo.serializeBinaryToWriter
    );
  }
};


/**
 * optional int64 swap_fee_sat = 1;
 * @return {string}
 */
proto.looprpc.OutQuoteResponse.prototype.getSwapFeeSat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.OutQuoteResponse} returns this
 */
proto.looprpc.OutQuoteResponse.prototype.setSwapFeeSat = function(value) {
  return jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional int64 prepay_amt_sat = 2;
 * @return {string}
 */
proto.looprpc.OutQuoteResponse.prototype.getPrepayAmtSat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.OutQuoteResponse} returns this
 */
proto.looprpc.OutQuoteResponse.prototype.setPrepayAmtSat = function(value) {
  return jspb.Message.setProto3StringIntField(this, 2, value);
};


/**
 * optional int64 htlc_sweep_fee_sat = 3;
 * @return {string}
 */
proto.looprpc.OutQuoteResponse.prototype.getHtlcSweepFeeSat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.OutQuoteResponse} returns this
 */
proto.looprpc.OutQuoteResponse.prototype.setHtlcSweepFeeSat = function(value) {
  return jspb.Message.setProto3StringIntField(this, 3, value);
};


/**
 * optional bytes swap_payment_dest = 4;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.OutQuoteResponse.prototype.getSwapPaymentDest = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * optional bytes swap_payment_dest = 4;
 * This is a type-conversion wrapper around `getSwapPaymentDest()`
 * @return {string}
 */
proto.looprpc.OutQuoteResponse.prototype.getSwapPaymentDest_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSwapPaymentDest()));
};


/**
 * optional bytes swap_payment_dest = 4;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSwapPaymentDest()`
 * @return {!Uint8Array}
 */
proto.looprpc.OutQuoteResponse.prototype.getSwapPaymentDest_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSwapPaymentDest()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.OutQuoteResponse} returns this
 */
proto.looprpc.OutQuoteResponse.prototype.setSwapPaymentDest = function(value) {
  return jspb.Message.setProto3BytesField(this, 4, value);
};


/**
 * optional int32 cltv_delta = 5;
 * @return {number}
 */
proto.looprpc.OutQuoteResponse.prototype.getCltvDelta = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.OutQuoteResponse} returns this
 */
proto.looprpc.OutQuoteResponse.prototype.setCltvDelta = function(value) {
  return jspb.Message.setProto3IntField(this, 5, value);
};


/**
 * optional int32 conf_target = 6;
 * @return {number}
 */
proto.looprpc.OutQuoteResponse.prototype.getConfTarget = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.OutQuoteResponse} returns this
 */
proto.looprpc.OutQuoteResponse.prototype.setConfTarget = function(value) {
  return jspb.Message.setProto3IntField(this, 6, value);
};


/**
 * optional AssetRfqInfo asset_rfq_info = 7;
 * @return {?proto.looprpc.AssetRfqInfo}
 */
proto.looprpc.OutQuoteResponse.prototype.getAssetRfqInfo = function() {
  return /** @type{?proto.looprpc.AssetRfqInfo} */ (
    jspb.Message.getWrapperField(this, proto.looprpc.AssetRfqInfo, 7));
};


/**
 * @param {?proto.looprpc.AssetRfqInfo|undefined} value
 * @return {!proto.looprpc.OutQuoteResponse} returns this
*/
proto.looprpc.OutQuoteResponse.prototype.setAssetRfqInfo = function(value) {
  return jspb.Message.setWrapperField(this, 7, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.looprpc.OutQuoteResponse} returns this
 */
proto.looprpc.OutQuoteResponse.prototype.clearAssetRfqInfo = function() {
  return this.setAssetRfqInfo(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.looprpc.OutQuoteResponse.prototype.hasAssetRfqInfo = function() {
  return jspb.Message.getField(this, 7) != null;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.looprpc.ProbeRequest.repeatedFields_ = [3];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.ProbeRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.ProbeRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.ProbeRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ProbeRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    amt: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    lastHop: msg.getLastHop_asB64(),
    routeHintsList: jspb.Message.toObjectList(msg.getRouteHintsList(),
    swapserverrpc_common_pb.RouteHint.toObject, includeInstance)
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
 * @return {!proto.looprpc.ProbeRequest}
 */
proto.looprpc.ProbeRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.ProbeRequest;
  return proto.looprpc.ProbeRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.ProbeRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.ProbeRequest}
 */
proto.looprpc.ProbeRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setAmt(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setLastHop(value);
      break;
    case 3:
      var value = new swapserverrpc_common_pb.RouteHint;
      reader.readMessage(value,swapserverrpc_common_pb.RouteHint.deserializeBinaryFromReader);
      msg.addRouteHints(value);
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
proto.looprpc.ProbeRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.ProbeRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.ProbeRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ProbeRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAmt();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      1,
      f
    );
  }
  f = message.getLastHop_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
  f = message.getRouteHintsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      swapserverrpc_common_pb.RouteHint.serializeBinaryToWriter
    );
  }
};


/**
 * optional int64 amt = 1;
 * @return {string}
 */
proto.looprpc.ProbeRequest.prototype.getAmt = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.ProbeRequest} returns this
 */
proto.looprpc.ProbeRequest.prototype.setAmt = function(value) {
  return jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional bytes last_hop = 2;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.ProbeRequest.prototype.getLastHop = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes last_hop = 2;
 * This is a type-conversion wrapper around `getLastHop()`
 * @return {string}
 */
proto.looprpc.ProbeRequest.prototype.getLastHop_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getLastHop()));
};


/**
 * optional bytes last_hop = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getLastHop()`
 * @return {!Uint8Array}
 */
proto.looprpc.ProbeRequest.prototype.getLastHop_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getLastHop()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.ProbeRequest} returns this
 */
proto.looprpc.ProbeRequest.prototype.setLastHop = function(value) {
  return jspb.Message.setProto3BytesField(this, 2, value);
};


/**
 * repeated RouteHint route_hints = 3;
 * @return {!Array<!proto.looprpc.RouteHint>}
 */
proto.looprpc.ProbeRequest.prototype.getRouteHintsList = function() {
  return /** @type{!Array<!proto.looprpc.RouteHint>} */ (
    jspb.Message.getRepeatedWrapperField(this, swapserverrpc_common_pb.RouteHint, 3));
};


/**
 * @param {!Array<!proto.looprpc.RouteHint>} value
 * @return {!proto.looprpc.ProbeRequest} returns this
*/
proto.looprpc.ProbeRequest.prototype.setRouteHintsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.looprpc.RouteHint=} opt_value
 * @param {number=} opt_index
 * @return {!proto.looprpc.RouteHint}
 */
proto.looprpc.ProbeRequest.prototype.addRouteHints = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.looprpc.RouteHint, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.ProbeRequest} returns this
 */
proto.looprpc.ProbeRequest.prototype.clearRouteHintsList = function() {
  return this.setRouteHintsList([]);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.ProbeResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.ProbeResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.ProbeResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ProbeResponse.toObject = function(includeInstance, msg) {
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
 * @return {!proto.looprpc.ProbeResponse}
 */
proto.looprpc.ProbeResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.ProbeResponse;
  return proto.looprpc.ProbeResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.ProbeResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.ProbeResponse}
 */
proto.looprpc.ProbeResponse.deserializeBinaryFromReader = function(msg, reader) {
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
proto.looprpc.ProbeResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.ProbeResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.ProbeResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ProbeResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.TokensRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.TokensRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.TokensRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.TokensRequest.toObject = function(includeInstance, msg) {
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
 * @return {!proto.looprpc.TokensRequest}
 */
proto.looprpc.TokensRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.TokensRequest;
  return proto.looprpc.TokensRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.TokensRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.TokensRequest}
 */
proto.looprpc.TokensRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.looprpc.TokensRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.TokensRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.TokensRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.TokensRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.looprpc.TokensResponse.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.TokensResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.TokensResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.TokensResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.TokensResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    tokensList: jspb.Message.toObjectList(msg.getTokensList(),
    proto.looprpc.L402Token.toObject, includeInstance)
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
 * @return {!proto.looprpc.TokensResponse}
 */
proto.looprpc.TokensResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.TokensResponse;
  return proto.looprpc.TokensResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.TokensResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.TokensResponse}
 */
proto.looprpc.TokensResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.looprpc.L402Token;
      reader.readMessage(value,proto.looprpc.L402Token.deserializeBinaryFromReader);
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
proto.looprpc.TokensResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.TokensResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.TokensResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.TokensResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTokensList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.looprpc.L402Token.serializeBinaryToWriter
    );
  }
};


/**
 * repeated L402Token tokens = 1;
 * @return {!Array<!proto.looprpc.L402Token>}
 */
proto.looprpc.TokensResponse.prototype.getTokensList = function() {
  return /** @type{!Array<!proto.looprpc.L402Token>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.looprpc.L402Token, 1));
};


/**
 * @param {!Array<!proto.looprpc.L402Token>} value
 * @return {!proto.looprpc.TokensResponse} returns this
*/
proto.looprpc.TokensResponse.prototype.setTokensList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.looprpc.L402Token=} opt_value
 * @param {number=} opt_index
 * @return {!proto.looprpc.L402Token}
 */
proto.looprpc.TokensResponse.prototype.addTokens = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.looprpc.L402Token, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.TokensResponse} returns this
 */
proto.looprpc.TokensResponse.prototype.clearTokensList = function() {
  return this.setTokensList([]);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.FetchL402TokenRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.FetchL402TokenRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.FetchL402TokenRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.FetchL402TokenRequest.toObject = function(includeInstance, msg) {
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
 * @return {!proto.looprpc.FetchL402TokenRequest}
 */
proto.looprpc.FetchL402TokenRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.FetchL402TokenRequest;
  return proto.looprpc.FetchL402TokenRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.FetchL402TokenRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.FetchL402TokenRequest}
 */
proto.looprpc.FetchL402TokenRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.looprpc.FetchL402TokenRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.FetchL402TokenRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.FetchL402TokenRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.FetchL402TokenRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.FetchL402TokenResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.FetchL402TokenResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.FetchL402TokenResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.FetchL402TokenResponse.toObject = function(includeInstance, msg) {
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
 * @return {!proto.looprpc.FetchL402TokenResponse}
 */
proto.looprpc.FetchL402TokenResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.FetchL402TokenResponse;
  return proto.looprpc.FetchL402TokenResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.FetchL402TokenResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.FetchL402TokenResponse}
 */
proto.looprpc.FetchL402TokenResponse.deserializeBinaryFromReader = function(msg, reader) {
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
proto.looprpc.FetchL402TokenResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.FetchL402TokenResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.FetchL402TokenResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.FetchL402TokenResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.L402Token.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.L402Token.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.L402Token} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.L402Token.toObject = function(includeInstance, msg) {
  var f, obj = {
    baseMacaroon: msg.getBaseMacaroon_asB64(),
    paymentHash: msg.getPaymentHash_asB64(),
    paymentPreimage: msg.getPaymentPreimage_asB64(),
    amountPaidMsat: jspb.Message.getFieldWithDefault(msg, 4, "0"),
    routingFeePaidMsat: jspb.Message.getFieldWithDefault(msg, 5, "0"),
    timeCreated: jspb.Message.getFieldWithDefault(msg, 6, "0"),
    expired: jspb.Message.getBooleanFieldWithDefault(msg, 7, false),
    storageName: jspb.Message.getFieldWithDefault(msg, 8, ""),
    id: jspb.Message.getFieldWithDefault(msg, 9, "")
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
 * @return {!proto.looprpc.L402Token}
 */
proto.looprpc.L402Token.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.L402Token;
  return proto.looprpc.L402Token.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.L402Token} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.L402Token}
 */
proto.looprpc.L402Token.deserializeBinaryFromReader = function(msg, reader) {
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
    case 9:
      var value = /** @type {string} */ (reader.readString());
      msg.setId(value);
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
proto.looprpc.L402Token.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.L402Token.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.L402Token} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.L402Token.serializeBinaryToWriter = function(message, writer) {
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
  f = message.getId();
  if (f.length > 0) {
    writer.writeString(
      9,
      f
    );
  }
};


/**
 * optional bytes base_macaroon = 1;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.L402Token.prototype.getBaseMacaroon = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes base_macaroon = 1;
 * This is a type-conversion wrapper around `getBaseMacaroon()`
 * @return {string}
 */
proto.looprpc.L402Token.prototype.getBaseMacaroon_asB64 = function() {
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
proto.looprpc.L402Token.prototype.getBaseMacaroon_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getBaseMacaroon()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.L402Token} returns this
 */
proto.looprpc.L402Token.prototype.setBaseMacaroon = function(value) {
  return jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional bytes payment_hash = 2;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.L402Token.prototype.getPaymentHash = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes payment_hash = 2;
 * This is a type-conversion wrapper around `getPaymentHash()`
 * @return {string}
 */
proto.looprpc.L402Token.prototype.getPaymentHash_asB64 = function() {
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
proto.looprpc.L402Token.prototype.getPaymentHash_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getPaymentHash()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.L402Token} returns this
 */
proto.looprpc.L402Token.prototype.setPaymentHash = function(value) {
  return jspb.Message.setProto3BytesField(this, 2, value);
};


/**
 * optional bytes payment_preimage = 3;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.L402Token.prototype.getPaymentPreimage = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * optional bytes payment_preimage = 3;
 * This is a type-conversion wrapper around `getPaymentPreimage()`
 * @return {string}
 */
proto.looprpc.L402Token.prototype.getPaymentPreimage_asB64 = function() {
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
proto.looprpc.L402Token.prototype.getPaymentPreimage_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getPaymentPreimage()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.L402Token} returns this
 */
proto.looprpc.L402Token.prototype.setPaymentPreimage = function(value) {
  return jspb.Message.setProto3BytesField(this, 3, value);
};


/**
 * optional int64 amount_paid_msat = 4;
 * @return {string}
 */
proto.looprpc.L402Token.prototype.getAmountPaidMsat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.L402Token} returns this
 */
proto.looprpc.L402Token.prototype.setAmountPaidMsat = function(value) {
  return jspb.Message.setProto3StringIntField(this, 4, value);
};


/**
 * optional int64 routing_fee_paid_msat = 5;
 * @return {string}
 */
proto.looprpc.L402Token.prototype.getRoutingFeePaidMsat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.L402Token} returns this
 */
proto.looprpc.L402Token.prototype.setRoutingFeePaidMsat = function(value) {
  return jspb.Message.setProto3StringIntField(this, 5, value);
};


/**
 * optional int64 time_created = 6;
 * @return {string}
 */
proto.looprpc.L402Token.prototype.getTimeCreated = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.L402Token} returns this
 */
proto.looprpc.L402Token.prototype.setTimeCreated = function(value) {
  return jspb.Message.setProto3StringIntField(this, 6, value);
};


/**
 * optional bool expired = 7;
 * @return {boolean}
 */
proto.looprpc.L402Token.prototype.getExpired = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 7, false));
};


/**
 * @param {boolean} value
 * @return {!proto.looprpc.L402Token} returns this
 */
proto.looprpc.L402Token.prototype.setExpired = function(value) {
  return jspb.Message.setProto3BooleanField(this, 7, value);
};


/**
 * optional string storage_name = 8;
 * @return {string}
 */
proto.looprpc.L402Token.prototype.getStorageName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 8, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.L402Token} returns this
 */
proto.looprpc.L402Token.prototype.setStorageName = function(value) {
  return jspb.Message.setProto3StringField(this, 8, value);
};


/**
 * optional string id = 9;
 * @return {string}
 */
proto.looprpc.L402Token.prototype.getId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 9, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.L402Token} returns this
 */
proto.looprpc.L402Token.prototype.setId = function(value) {
  return jspb.Message.setProto3StringField(this, 9, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.LoopStats.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.LoopStats.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.LoopStats} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.LoopStats.toObject = function(includeInstance, msg) {
  var f, obj = {
    pendingCount: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    successCount: jspb.Message.getFieldWithDefault(msg, 2, "0"),
    failCount: jspb.Message.getFieldWithDefault(msg, 3, "0"),
    sumPendingAmt: jspb.Message.getFieldWithDefault(msg, 4, "0"),
    sumSucceededAmt: jspb.Message.getFieldWithDefault(msg, 5, "0")
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
 * @return {!proto.looprpc.LoopStats}
 */
proto.looprpc.LoopStats.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.LoopStats;
  return proto.looprpc.LoopStats.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.LoopStats} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.LoopStats}
 */
proto.looprpc.LoopStats.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setPendingCount(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setSuccessCount(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setFailCount(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setSumPendingAmt(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setSumSucceededAmt(value);
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
proto.looprpc.LoopStats.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.LoopStats.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.LoopStats} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.LoopStats.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPendingCount();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      1,
      f
    );
  }
  f = message.getSuccessCount();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      2,
      f
    );
  }
  f = message.getFailCount();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      3,
      f
    );
  }
  f = message.getSumPendingAmt();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      4,
      f
    );
  }
  f = message.getSumSucceededAmt();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      5,
      f
    );
  }
};


/**
 * optional uint64 pending_count = 1;
 * @return {string}
 */
proto.looprpc.LoopStats.prototype.getPendingCount = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LoopStats} returns this
 */
proto.looprpc.LoopStats.prototype.setPendingCount = function(value) {
  return jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional uint64 success_count = 2;
 * @return {string}
 */
proto.looprpc.LoopStats.prototype.getSuccessCount = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LoopStats} returns this
 */
proto.looprpc.LoopStats.prototype.setSuccessCount = function(value) {
  return jspb.Message.setProto3StringIntField(this, 2, value);
};


/**
 * optional uint64 fail_count = 3;
 * @return {string}
 */
proto.looprpc.LoopStats.prototype.getFailCount = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LoopStats} returns this
 */
proto.looprpc.LoopStats.prototype.setFailCount = function(value) {
  return jspb.Message.setProto3StringIntField(this, 3, value);
};


/**
 * optional int64 sum_pending_amt = 4;
 * @return {string}
 */
proto.looprpc.LoopStats.prototype.getSumPendingAmt = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LoopStats} returns this
 */
proto.looprpc.LoopStats.prototype.setSumPendingAmt = function(value) {
  return jspb.Message.setProto3StringIntField(this, 4, value);
};


/**
 * optional int64 sum_succeeded_amt = 5;
 * @return {string}
 */
proto.looprpc.LoopStats.prototype.getSumSucceededAmt = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LoopStats} returns this
 */
proto.looprpc.LoopStats.prototype.setSumSucceededAmt = function(value) {
  return jspb.Message.setProto3StringIntField(this, 5, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.GetInfoRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.GetInfoRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.GetInfoRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.GetInfoRequest.toObject = function(includeInstance, msg) {
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
 * @return {!proto.looprpc.GetInfoRequest}
 */
proto.looprpc.GetInfoRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.GetInfoRequest;
  return proto.looprpc.GetInfoRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.GetInfoRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.GetInfoRequest}
 */
proto.looprpc.GetInfoRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.looprpc.GetInfoRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.GetInfoRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.GetInfoRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.GetInfoRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.GetInfoResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.GetInfoResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.GetInfoResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.GetInfoResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    version: jspb.Message.getFieldWithDefault(msg, 1, ""),
    network: jspb.Message.getFieldWithDefault(msg, 2, ""),
    rpcListen: jspb.Message.getFieldWithDefault(msg, 3, ""),
    restListen: jspb.Message.getFieldWithDefault(msg, 4, ""),
    macaroonPath: jspb.Message.getFieldWithDefault(msg, 5, ""),
    tlsCertPath: jspb.Message.getFieldWithDefault(msg, 6, ""),
    loopOutStats: (f = msg.getLoopOutStats()) && proto.looprpc.LoopStats.toObject(includeInstance, f),
    loopInStats: (f = msg.getLoopInStats()) && proto.looprpc.LoopStats.toObject(includeInstance, f),
    commitHash: jspb.Message.getFieldWithDefault(msg, 9, "")
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
 * @return {!proto.looprpc.GetInfoResponse}
 */
proto.looprpc.GetInfoResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.GetInfoResponse;
  return proto.looprpc.GetInfoResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.GetInfoResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.GetInfoResponse}
 */
proto.looprpc.GetInfoResponse.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {string} */ (reader.readString());
      msg.setNetwork(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setRpcListen(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setRestListen(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setMacaroonPath(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readString());
      msg.setTlsCertPath(value);
      break;
    case 7:
      var value = new proto.looprpc.LoopStats;
      reader.readMessage(value,proto.looprpc.LoopStats.deserializeBinaryFromReader);
      msg.setLoopOutStats(value);
      break;
    case 8:
      var value = new proto.looprpc.LoopStats;
      reader.readMessage(value,proto.looprpc.LoopStats.deserializeBinaryFromReader);
      msg.setLoopInStats(value);
      break;
    case 9:
      var value = /** @type {string} */ (reader.readString());
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
proto.looprpc.GetInfoResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.GetInfoResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.GetInfoResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.GetInfoResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getVersion();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getNetwork();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getRpcListen();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getRestListen();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getMacaroonPath();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getTlsCertPath();
  if (f.length > 0) {
    writer.writeString(
      6,
      f
    );
  }
  f = message.getLoopOutStats();
  if (f != null) {
    writer.writeMessage(
      7,
      f,
      proto.looprpc.LoopStats.serializeBinaryToWriter
    );
  }
  f = message.getLoopInStats();
  if (f != null) {
    writer.writeMessage(
      8,
      f,
      proto.looprpc.LoopStats.serializeBinaryToWriter
    );
  }
  f = message.getCommitHash();
  if (f.length > 0) {
    writer.writeString(
      9,
      f
    );
  }
};


/**
 * optional string version = 1;
 * @return {string}
 */
proto.looprpc.GetInfoResponse.prototype.getVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.GetInfoResponse} returns this
 */
proto.looprpc.GetInfoResponse.prototype.setVersion = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string network = 2;
 * @return {string}
 */
proto.looprpc.GetInfoResponse.prototype.getNetwork = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.GetInfoResponse} returns this
 */
proto.looprpc.GetInfoResponse.prototype.setNetwork = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string rpc_listen = 3;
 * @return {string}
 */
proto.looprpc.GetInfoResponse.prototype.getRpcListen = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.GetInfoResponse} returns this
 */
proto.looprpc.GetInfoResponse.prototype.setRpcListen = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string rest_listen = 4;
 * @return {string}
 */
proto.looprpc.GetInfoResponse.prototype.getRestListen = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.GetInfoResponse} returns this
 */
proto.looprpc.GetInfoResponse.prototype.setRestListen = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional string macaroon_path = 5;
 * @return {string}
 */
proto.looprpc.GetInfoResponse.prototype.getMacaroonPath = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.GetInfoResponse} returns this
 */
proto.looprpc.GetInfoResponse.prototype.setMacaroonPath = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};


/**
 * optional string tls_cert_path = 6;
 * @return {string}
 */
proto.looprpc.GetInfoResponse.prototype.getTlsCertPath = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.GetInfoResponse} returns this
 */
proto.looprpc.GetInfoResponse.prototype.setTlsCertPath = function(value) {
  return jspb.Message.setProto3StringField(this, 6, value);
};


/**
 * optional LoopStats loop_out_stats = 7;
 * @return {?proto.looprpc.LoopStats}
 */
proto.looprpc.GetInfoResponse.prototype.getLoopOutStats = function() {
  return /** @type{?proto.looprpc.LoopStats} */ (
    jspb.Message.getWrapperField(this, proto.looprpc.LoopStats, 7));
};


/**
 * @param {?proto.looprpc.LoopStats|undefined} value
 * @return {!proto.looprpc.GetInfoResponse} returns this
*/
proto.looprpc.GetInfoResponse.prototype.setLoopOutStats = function(value) {
  return jspb.Message.setWrapperField(this, 7, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.looprpc.GetInfoResponse} returns this
 */
proto.looprpc.GetInfoResponse.prototype.clearLoopOutStats = function() {
  return this.setLoopOutStats(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.looprpc.GetInfoResponse.prototype.hasLoopOutStats = function() {
  return jspb.Message.getField(this, 7) != null;
};


/**
 * optional LoopStats loop_in_stats = 8;
 * @return {?proto.looprpc.LoopStats}
 */
proto.looprpc.GetInfoResponse.prototype.getLoopInStats = function() {
  return /** @type{?proto.looprpc.LoopStats} */ (
    jspb.Message.getWrapperField(this, proto.looprpc.LoopStats, 8));
};


/**
 * @param {?proto.looprpc.LoopStats|undefined} value
 * @return {!proto.looprpc.GetInfoResponse} returns this
*/
proto.looprpc.GetInfoResponse.prototype.setLoopInStats = function(value) {
  return jspb.Message.setWrapperField(this, 8, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.looprpc.GetInfoResponse} returns this
 */
proto.looprpc.GetInfoResponse.prototype.clearLoopInStats = function() {
  return this.setLoopInStats(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.looprpc.GetInfoResponse.prototype.hasLoopInStats = function() {
  return jspb.Message.getField(this, 8) != null;
};


/**
 * optional string commit_hash = 9;
 * @return {string}
 */
proto.looprpc.GetInfoResponse.prototype.getCommitHash = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 9, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.GetInfoResponse} returns this
 */
proto.looprpc.GetInfoResponse.prototype.setCommitHash = function(value) {
  return jspb.Message.setProto3StringField(this, 9, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.GetLiquidityParamsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.GetLiquidityParamsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.GetLiquidityParamsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.GetLiquidityParamsRequest.toObject = function(includeInstance, msg) {
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
 * @return {!proto.looprpc.GetLiquidityParamsRequest}
 */
proto.looprpc.GetLiquidityParamsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.GetLiquidityParamsRequest;
  return proto.looprpc.GetLiquidityParamsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.GetLiquidityParamsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.GetLiquidityParamsRequest}
 */
proto.looprpc.GetLiquidityParamsRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.looprpc.GetLiquidityParamsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.GetLiquidityParamsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.GetLiquidityParamsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.GetLiquidityParamsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.looprpc.LiquidityParameters.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.LiquidityParameters.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.LiquidityParameters.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.LiquidityParameters} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.LiquidityParameters.toObject = function(includeInstance, msg) {
  var f, obj = {
    rulesList: jspb.Message.toObjectList(msg.getRulesList(),
    proto.looprpc.LiquidityRule.toObject, includeInstance),
    feePpm: jspb.Message.getFieldWithDefault(msg, 16, "0"),
    sweepFeeRateSatPerVbyte: jspb.Message.getFieldWithDefault(msg, 2, "0"),
    maxSwapFeePpm: jspb.Message.getFieldWithDefault(msg, 3, "0"),
    maxRoutingFeePpm: jspb.Message.getFieldWithDefault(msg, 4, "0"),
    maxPrepayRoutingFeePpm: jspb.Message.getFieldWithDefault(msg, 5, "0"),
    maxPrepaySat: jspb.Message.getFieldWithDefault(msg, 6, "0"),
    maxMinerFeeSat: jspb.Message.getFieldWithDefault(msg, 7, "0"),
    sweepConfTarget: jspb.Message.getFieldWithDefault(msg, 8, 0),
    failureBackoffSec: jspb.Message.getFieldWithDefault(msg, 9, "0"),
    autoloop: jspb.Message.getBooleanFieldWithDefault(msg, 10, false),
    autoloopBudgetSat: jspb.Message.getFieldWithDefault(msg, 11, "0"),
    autoloopBudgetStartSec: jspb.Message.getFieldWithDefault(msg, 12, "0"),
    autoMaxInFlight: jspb.Message.getFieldWithDefault(msg, 13, "0"),
    minSwapAmount: jspb.Message.getFieldWithDefault(msg, 14, "0"),
    maxSwapAmount: jspb.Message.getFieldWithDefault(msg, 15, "0"),
    htlcConfTarget: jspb.Message.getFieldWithDefault(msg, 17, 0),
    autoloopDestAddress: jspb.Message.getFieldWithDefault(msg, 18, ""),
    autoloopBudgetRefreshPeriodSec: jspb.Message.getFieldWithDefault(msg, 19, "0"),
    autoloopBudgetLastRefresh: jspb.Message.getFieldWithDefault(msg, 20, "0"),
    easyAutoloop: jspb.Message.getBooleanFieldWithDefault(msg, 21, false),
    easyAutoloopLocalTargetSat: jspb.Message.getFieldWithDefault(msg, 22, "0"),
    account: jspb.Message.getFieldWithDefault(msg, 23, ""),
    accountAddrType: jspb.Message.getFieldWithDefault(msg, 24, 0),
    easyAssetParamsMap: (f = msg.getEasyAssetParamsMap()) ? f.toObject(includeInstance, proto.looprpc.EasyAssetAutoloopParams.toObject) : [],
    fastSwapPublication: jspb.Message.getBooleanFieldWithDefault(msg, 26, false)
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
 * @return {!proto.looprpc.LiquidityParameters}
 */
proto.looprpc.LiquidityParameters.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.LiquidityParameters;
  return proto.looprpc.LiquidityParameters.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.LiquidityParameters} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.LiquidityParameters}
 */
proto.looprpc.LiquidityParameters.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.looprpc.LiquidityRule;
      reader.readMessage(value,proto.looprpc.LiquidityRule.deserializeBinaryFromReader);
      msg.addRules(value);
      break;
    case 16:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setFeePpm(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setSweepFeeRateSatPerVbyte(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setMaxSwapFeePpm(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setMaxRoutingFeePpm(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setMaxPrepayRoutingFeePpm(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setMaxPrepaySat(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setMaxMinerFeeSat(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setSweepConfTarget(value);
      break;
    case 9:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setFailureBackoffSec(value);
      break;
    case 10:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setAutoloop(value);
      break;
    case 11:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setAutoloopBudgetSat(value);
      break;
    case 12:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setAutoloopBudgetStartSec(value);
      break;
    case 13:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setAutoMaxInFlight(value);
      break;
    case 14:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setMinSwapAmount(value);
      break;
    case 15:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setMaxSwapAmount(value);
      break;
    case 17:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setHtlcConfTarget(value);
      break;
    case 18:
      var value = /** @type {string} */ (reader.readString());
      msg.setAutoloopDestAddress(value);
      break;
    case 19:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setAutoloopBudgetRefreshPeriodSec(value);
      break;
    case 20:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setAutoloopBudgetLastRefresh(value);
      break;
    case 21:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEasyAutoloop(value);
      break;
    case 22:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setEasyAutoloopLocalTargetSat(value);
      break;
    case 23:
      var value = /** @type {string} */ (reader.readString());
      msg.setAccount(value);
      break;
    case 24:
      var value = /** @type {!proto.looprpc.AddressType} */ (reader.readEnum());
      msg.setAccountAddrType(value);
      break;
    case 25:
      var value = msg.getEasyAssetParamsMap();
      reader.readMessage(value, function(message, reader) {
        jspb.Map.deserializeBinary(message, reader, jspb.BinaryReader.prototype.readString, jspb.BinaryReader.prototype.readMessage, proto.looprpc.EasyAssetAutoloopParams.deserializeBinaryFromReader, "", new proto.looprpc.EasyAssetAutoloopParams());
         });
      break;
    case 26:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setFastSwapPublication(value);
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
proto.looprpc.LiquidityParameters.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.LiquidityParameters.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.LiquidityParameters} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.LiquidityParameters.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getRulesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.looprpc.LiquidityRule.serializeBinaryToWriter
    );
  }
  f = message.getFeePpm();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      16,
      f
    );
  }
  f = message.getSweepFeeRateSatPerVbyte();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      2,
      f
    );
  }
  f = message.getMaxSwapFeePpm();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      3,
      f
    );
  }
  f = message.getMaxRoutingFeePpm();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      4,
      f
    );
  }
  f = message.getMaxPrepayRoutingFeePpm();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      5,
      f
    );
  }
  f = message.getMaxPrepaySat();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      6,
      f
    );
  }
  f = message.getMaxMinerFeeSat();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      7,
      f
    );
  }
  f = message.getSweepConfTarget();
  if (f !== 0) {
    writer.writeInt32(
      8,
      f
    );
  }
  f = message.getFailureBackoffSec();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      9,
      f
    );
  }
  f = message.getAutoloop();
  if (f) {
    writer.writeBool(
      10,
      f
    );
  }
  f = message.getAutoloopBudgetSat();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      11,
      f
    );
  }
  f = message.getAutoloopBudgetStartSec();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      12,
      f
    );
  }
  f = message.getAutoMaxInFlight();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      13,
      f
    );
  }
  f = message.getMinSwapAmount();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      14,
      f
    );
  }
  f = message.getMaxSwapAmount();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      15,
      f
    );
  }
  f = message.getHtlcConfTarget();
  if (f !== 0) {
    writer.writeInt32(
      17,
      f
    );
  }
  f = message.getAutoloopDestAddress();
  if (f.length > 0) {
    writer.writeString(
      18,
      f
    );
  }
  f = message.getAutoloopBudgetRefreshPeriodSec();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      19,
      f
    );
  }
  f = message.getAutoloopBudgetLastRefresh();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      20,
      f
    );
  }
  f = message.getEasyAutoloop();
  if (f) {
    writer.writeBool(
      21,
      f
    );
  }
  f = message.getEasyAutoloopLocalTargetSat();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      22,
      f
    );
  }
  f = message.getAccount();
  if (f.length > 0) {
    writer.writeString(
      23,
      f
    );
  }
  f = message.getAccountAddrType();
  if (f !== 0.0) {
    writer.writeEnum(
      24,
      f
    );
  }
  f = message.getEasyAssetParamsMap(true);
  if (f && f.getLength() > 0) {
    f.serializeBinary(25, writer, jspb.BinaryWriter.prototype.writeString, jspb.BinaryWriter.prototype.writeMessage, proto.looprpc.EasyAssetAutoloopParams.serializeBinaryToWriter);
  }
  f = message.getFastSwapPublication();
  if (f) {
    writer.writeBool(
      26,
      f
    );
  }
};


/**
 * repeated LiquidityRule rules = 1;
 * @return {!Array<!proto.looprpc.LiquidityRule>}
 */
proto.looprpc.LiquidityParameters.prototype.getRulesList = function() {
  return /** @type{!Array<!proto.looprpc.LiquidityRule>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.looprpc.LiquidityRule, 1));
};


/**
 * @param {!Array<!proto.looprpc.LiquidityRule>} value
 * @return {!proto.looprpc.LiquidityParameters} returns this
*/
proto.looprpc.LiquidityParameters.prototype.setRulesList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.looprpc.LiquidityRule=} opt_value
 * @param {number=} opt_index
 * @return {!proto.looprpc.LiquidityRule}
 */
proto.looprpc.LiquidityParameters.prototype.addRules = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.looprpc.LiquidityRule, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.LiquidityParameters} returns this
 */
proto.looprpc.LiquidityParameters.prototype.clearRulesList = function() {
  return this.setRulesList([]);
};


/**
 * optional uint64 fee_ppm = 16;
 * @return {string}
 */
proto.looprpc.LiquidityParameters.prototype.getFeePpm = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 16, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LiquidityParameters} returns this
 */
proto.looprpc.LiquidityParameters.prototype.setFeePpm = function(value) {
  return jspb.Message.setProto3StringIntField(this, 16, value);
};


/**
 * optional uint64 sweep_fee_rate_sat_per_vbyte = 2;
 * @return {string}
 */
proto.looprpc.LiquidityParameters.prototype.getSweepFeeRateSatPerVbyte = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LiquidityParameters} returns this
 */
proto.looprpc.LiquidityParameters.prototype.setSweepFeeRateSatPerVbyte = function(value) {
  return jspb.Message.setProto3StringIntField(this, 2, value);
};


/**
 * optional uint64 max_swap_fee_ppm = 3;
 * @return {string}
 */
proto.looprpc.LiquidityParameters.prototype.getMaxSwapFeePpm = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LiquidityParameters} returns this
 */
proto.looprpc.LiquidityParameters.prototype.setMaxSwapFeePpm = function(value) {
  return jspb.Message.setProto3StringIntField(this, 3, value);
};


/**
 * optional uint64 max_routing_fee_ppm = 4;
 * @return {string}
 */
proto.looprpc.LiquidityParameters.prototype.getMaxRoutingFeePpm = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LiquidityParameters} returns this
 */
proto.looprpc.LiquidityParameters.prototype.setMaxRoutingFeePpm = function(value) {
  return jspb.Message.setProto3StringIntField(this, 4, value);
};


/**
 * optional uint64 max_prepay_routing_fee_ppm = 5;
 * @return {string}
 */
proto.looprpc.LiquidityParameters.prototype.getMaxPrepayRoutingFeePpm = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LiquidityParameters} returns this
 */
proto.looprpc.LiquidityParameters.prototype.setMaxPrepayRoutingFeePpm = function(value) {
  return jspb.Message.setProto3StringIntField(this, 5, value);
};


/**
 * optional uint64 max_prepay_sat = 6;
 * @return {string}
 */
proto.looprpc.LiquidityParameters.prototype.getMaxPrepaySat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LiquidityParameters} returns this
 */
proto.looprpc.LiquidityParameters.prototype.setMaxPrepaySat = function(value) {
  return jspb.Message.setProto3StringIntField(this, 6, value);
};


/**
 * optional uint64 max_miner_fee_sat = 7;
 * @return {string}
 */
proto.looprpc.LiquidityParameters.prototype.getMaxMinerFeeSat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LiquidityParameters} returns this
 */
proto.looprpc.LiquidityParameters.prototype.setMaxMinerFeeSat = function(value) {
  return jspb.Message.setProto3StringIntField(this, 7, value);
};


/**
 * optional int32 sweep_conf_target = 8;
 * @return {number}
 */
proto.looprpc.LiquidityParameters.prototype.getSweepConfTarget = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 8, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.LiquidityParameters} returns this
 */
proto.looprpc.LiquidityParameters.prototype.setSweepConfTarget = function(value) {
  return jspb.Message.setProto3IntField(this, 8, value);
};


/**
 * optional uint64 failure_backoff_sec = 9;
 * @return {string}
 */
proto.looprpc.LiquidityParameters.prototype.getFailureBackoffSec = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 9, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LiquidityParameters} returns this
 */
proto.looprpc.LiquidityParameters.prototype.setFailureBackoffSec = function(value) {
  return jspb.Message.setProto3StringIntField(this, 9, value);
};


/**
 * optional bool autoloop = 10;
 * @return {boolean}
 */
proto.looprpc.LiquidityParameters.prototype.getAutoloop = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 10, false));
};


/**
 * @param {boolean} value
 * @return {!proto.looprpc.LiquidityParameters} returns this
 */
proto.looprpc.LiquidityParameters.prototype.setAutoloop = function(value) {
  return jspb.Message.setProto3BooleanField(this, 10, value);
};


/**
 * optional uint64 autoloop_budget_sat = 11;
 * @return {string}
 */
proto.looprpc.LiquidityParameters.prototype.getAutoloopBudgetSat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 11, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LiquidityParameters} returns this
 */
proto.looprpc.LiquidityParameters.prototype.setAutoloopBudgetSat = function(value) {
  return jspb.Message.setProto3StringIntField(this, 11, value);
};


/**
 * optional uint64 autoloop_budget_start_sec = 12;
 * @return {string}
 */
proto.looprpc.LiquidityParameters.prototype.getAutoloopBudgetStartSec = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 12, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LiquidityParameters} returns this
 */
proto.looprpc.LiquidityParameters.prototype.setAutoloopBudgetStartSec = function(value) {
  return jspb.Message.setProto3StringIntField(this, 12, value);
};


/**
 * optional uint64 auto_max_in_flight = 13;
 * @return {string}
 */
proto.looprpc.LiquidityParameters.prototype.getAutoMaxInFlight = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 13, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LiquidityParameters} returns this
 */
proto.looprpc.LiquidityParameters.prototype.setAutoMaxInFlight = function(value) {
  return jspb.Message.setProto3StringIntField(this, 13, value);
};


/**
 * optional uint64 min_swap_amount = 14;
 * @return {string}
 */
proto.looprpc.LiquidityParameters.prototype.getMinSwapAmount = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 14, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LiquidityParameters} returns this
 */
proto.looprpc.LiquidityParameters.prototype.setMinSwapAmount = function(value) {
  return jspb.Message.setProto3StringIntField(this, 14, value);
};


/**
 * optional uint64 max_swap_amount = 15;
 * @return {string}
 */
proto.looprpc.LiquidityParameters.prototype.getMaxSwapAmount = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 15, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LiquidityParameters} returns this
 */
proto.looprpc.LiquidityParameters.prototype.setMaxSwapAmount = function(value) {
  return jspb.Message.setProto3StringIntField(this, 15, value);
};


/**
 * optional int32 htlc_conf_target = 17;
 * @return {number}
 */
proto.looprpc.LiquidityParameters.prototype.getHtlcConfTarget = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 17, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.LiquidityParameters} returns this
 */
proto.looprpc.LiquidityParameters.prototype.setHtlcConfTarget = function(value) {
  return jspb.Message.setProto3IntField(this, 17, value);
};


/**
 * optional string autoloop_dest_address = 18;
 * @return {string}
 */
proto.looprpc.LiquidityParameters.prototype.getAutoloopDestAddress = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 18, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LiquidityParameters} returns this
 */
proto.looprpc.LiquidityParameters.prototype.setAutoloopDestAddress = function(value) {
  return jspb.Message.setProto3StringField(this, 18, value);
};


/**
 * optional uint64 autoloop_budget_refresh_period_sec = 19;
 * @return {string}
 */
proto.looprpc.LiquidityParameters.prototype.getAutoloopBudgetRefreshPeriodSec = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 19, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LiquidityParameters} returns this
 */
proto.looprpc.LiquidityParameters.prototype.setAutoloopBudgetRefreshPeriodSec = function(value) {
  return jspb.Message.setProto3StringIntField(this, 19, value);
};


/**
 * optional uint64 autoloop_budget_last_refresh = 20;
 * @return {string}
 */
proto.looprpc.LiquidityParameters.prototype.getAutoloopBudgetLastRefresh = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 20, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LiquidityParameters} returns this
 */
proto.looprpc.LiquidityParameters.prototype.setAutoloopBudgetLastRefresh = function(value) {
  return jspb.Message.setProto3StringIntField(this, 20, value);
};


/**
 * optional bool easy_autoloop = 21;
 * @return {boolean}
 */
proto.looprpc.LiquidityParameters.prototype.getEasyAutoloop = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 21, false));
};


/**
 * @param {boolean} value
 * @return {!proto.looprpc.LiquidityParameters} returns this
 */
proto.looprpc.LiquidityParameters.prototype.setEasyAutoloop = function(value) {
  return jspb.Message.setProto3BooleanField(this, 21, value);
};


/**
 * optional uint64 easy_autoloop_local_target_sat = 22;
 * @return {string}
 */
proto.looprpc.LiquidityParameters.prototype.getEasyAutoloopLocalTargetSat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 22, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LiquidityParameters} returns this
 */
proto.looprpc.LiquidityParameters.prototype.setEasyAutoloopLocalTargetSat = function(value) {
  return jspb.Message.setProto3StringIntField(this, 22, value);
};


/**
 * optional string account = 23;
 * @return {string}
 */
proto.looprpc.LiquidityParameters.prototype.getAccount = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 23, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LiquidityParameters} returns this
 */
proto.looprpc.LiquidityParameters.prototype.setAccount = function(value) {
  return jspb.Message.setProto3StringField(this, 23, value);
};


/**
 * optional AddressType account_addr_type = 24;
 * @return {!proto.looprpc.AddressType}
 */
proto.looprpc.LiquidityParameters.prototype.getAccountAddrType = function() {
  return /** @type {!proto.looprpc.AddressType} */ (jspb.Message.getFieldWithDefault(this, 24, 0));
};


/**
 * @param {!proto.looprpc.AddressType} value
 * @return {!proto.looprpc.LiquidityParameters} returns this
 */
proto.looprpc.LiquidityParameters.prototype.setAccountAddrType = function(value) {
  return jspb.Message.setProto3EnumField(this, 24, value);
};


/**
 * map<string, EasyAssetAutoloopParams> easy_asset_params = 25;
 * @param {boolean=} opt_noLazyCreate Do not create the map if
 * empty, instead returning `undefined`
 * @return {!jspb.Map<string,!proto.looprpc.EasyAssetAutoloopParams>}
 */
proto.looprpc.LiquidityParameters.prototype.getEasyAssetParamsMap = function(opt_noLazyCreate) {
  return /** @type {!jspb.Map<string,!proto.looprpc.EasyAssetAutoloopParams>} */ (
      jspb.Message.getMapField(this, 25, opt_noLazyCreate,
      proto.looprpc.EasyAssetAutoloopParams));
};


/**
 * Clears values from the map. The map will be non-null.
 * @return {!proto.looprpc.LiquidityParameters} returns this
 */
proto.looprpc.LiquidityParameters.prototype.clearEasyAssetParamsMap = function() {
  this.getEasyAssetParamsMap().clear();
  return this;
};


/**
 * optional bool fast_swap_publication = 26;
 * @return {boolean}
 */
proto.looprpc.LiquidityParameters.prototype.getFastSwapPublication = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 26, false));
};


/**
 * @param {boolean} value
 * @return {!proto.looprpc.LiquidityParameters} returns this
 */
proto.looprpc.LiquidityParameters.prototype.setFastSwapPublication = function(value) {
  return jspb.Message.setProto3BooleanField(this, 26, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.EasyAssetAutoloopParams.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.EasyAssetAutoloopParams.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.EasyAssetAutoloopParams} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.EasyAssetAutoloopParams.toObject = function(includeInstance, msg) {
  var f, obj = {
    enabled: jspb.Message.getBooleanFieldWithDefault(msg, 1, false),
    localTargetAssetAmt: jspb.Message.getFieldWithDefault(msg, 2, "0")
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
 * @return {!proto.looprpc.EasyAssetAutoloopParams}
 */
proto.looprpc.EasyAssetAutoloopParams.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.EasyAssetAutoloopParams;
  return proto.looprpc.EasyAssetAutoloopParams.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.EasyAssetAutoloopParams} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.EasyAssetAutoloopParams}
 */
proto.looprpc.EasyAssetAutoloopParams.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnabled(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setLocalTargetAssetAmt(value);
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
proto.looprpc.EasyAssetAutoloopParams.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.EasyAssetAutoloopParams.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.EasyAssetAutoloopParams} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.EasyAssetAutoloopParams.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getEnabled();
  if (f) {
    writer.writeBool(
      1,
      f
    );
  }
  f = message.getLocalTargetAssetAmt();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      2,
      f
    );
  }
};


/**
 * optional bool enabled = 1;
 * @return {boolean}
 */
proto.looprpc.EasyAssetAutoloopParams.prototype.getEnabled = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 1, false));
};


/**
 * @param {boolean} value
 * @return {!proto.looprpc.EasyAssetAutoloopParams} returns this
 */
proto.looprpc.EasyAssetAutoloopParams.prototype.setEnabled = function(value) {
  return jspb.Message.setProto3BooleanField(this, 1, value);
};


/**
 * optional uint64 local_target_asset_amt = 2;
 * @return {string}
 */
proto.looprpc.EasyAssetAutoloopParams.prototype.getLocalTargetAssetAmt = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.EasyAssetAutoloopParams} returns this
 */
proto.looprpc.EasyAssetAutoloopParams.prototype.setLocalTargetAssetAmt = function(value) {
  return jspb.Message.setProto3StringIntField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.LiquidityRule.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.LiquidityRule.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.LiquidityRule} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.LiquidityRule.toObject = function(includeInstance, msg) {
  var f, obj = {
    channelId: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    swapType: jspb.Message.getFieldWithDefault(msg, 6, 0),
    pubkey: msg.getPubkey_asB64(),
    type: jspb.Message.getFieldWithDefault(msg, 2, 0),
    incomingThreshold: jspb.Message.getFieldWithDefault(msg, 3, 0),
    outgoingThreshold: jspb.Message.getFieldWithDefault(msg, 4, 0)
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
 * @return {!proto.looprpc.LiquidityRule}
 */
proto.looprpc.LiquidityRule.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.LiquidityRule;
  return proto.looprpc.LiquidityRule.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.LiquidityRule} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.LiquidityRule}
 */
proto.looprpc.LiquidityRule.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setChannelId(value);
      break;
    case 6:
      var value = /** @type {!proto.looprpc.SwapType} */ (reader.readEnum());
      msg.setSwapType(value);
      break;
    case 5:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setPubkey(value);
      break;
    case 2:
      var value = /** @type {!proto.looprpc.LiquidityRuleType} */ (reader.readEnum());
      msg.setType(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setIncomingThreshold(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setOutgoingThreshold(value);
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
proto.looprpc.LiquidityRule.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.LiquidityRule.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.LiquidityRule} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.LiquidityRule.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getChannelId();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      1,
      f
    );
  }
  f = message.getSwapType();
  if (f !== 0.0) {
    writer.writeEnum(
      6,
      f
    );
  }
  f = message.getPubkey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      5,
      f
    );
  }
  f = message.getType();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = message.getIncomingThreshold();
  if (f !== 0) {
    writer.writeUint32(
      3,
      f
    );
  }
  f = message.getOutgoingThreshold();
  if (f !== 0) {
    writer.writeUint32(
      4,
      f
    );
  }
};


/**
 * optional uint64 channel_id = 1;
 * @return {string}
 */
proto.looprpc.LiquidityRule.prototype.getChannelId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.LiquidityRule} returns this
 */
proto.looprpc.LiquidityRule.prototype.setChannelId = function(value) {
  return jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional SwapType swap_type = 6;
 * @return {!proto.looprpc.SwapType}
 */
proto.looprpc.LiquidityRule.prototype.getSwapType = function() {
  return /** @type {!proto.looprpc.SwapType} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {!proto.looprpc.SwapType} value
 * @return {!proto.looprpc.LiquidityRule} returns this
 */
proto.looprpc.LiquidityRule.prototype.setSwapType = function(value) {
  return jspb.Message.setProto3EnumField(this, 6, value);
};


/**
 * optional bytes pubkey = 5;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.LiquidityRule.prototype.getPubkey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * optional bytes pubkey = 5;
 * This is a type-conversion wrapper around `getPubkey()`
 * @return {string}
 */
proto.looprpc.LiquidityRule.prototype.getPubkey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getPubkey()));
};


/**
 * optional bytes pubkey = 5;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getPubkey()`
 * @return {!Uint8Array}
 */
proto.looprpc.LiquidityRule.prototype.getPubkey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getPubkey()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.LiquidityRule} returns this
 */
proto.looprpc.LiquidityRule.prototype.setPubkey = function(value) {
  return jspb.Message.setProto3BytesField(this, 5, value);
};


/**
 * optional LiquidityRuleType type = 2;
 * @return {!proto.looprpc.LiquidityRuleType}
 */
proto.looprpc.LiquidityRule.prototype.getType = function() {
  return /** @type {!proto.looprpc.LiquidityRuleType} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.looprpc.LiquidityRuleType} value
 * @return {!proto.looprpc.LiquidityRule} returns this
 */
proto.looprpc.LiquidityRule.prototype.setType = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional uint32 incoming_threshold = 3;
 * @return {number}
 */
proto.looprpc.LiquidityRule.prototype.getIncomingThreshold = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.LiquidityRule} returns this
 */
proto.looprpc.LiquidityRule.prototype.setIncomingThreshold = function(value) {
  return jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional uint32 outgoing_threshold = 4;
 * @return {number}
 */
proto.looprpc.LiquidityRule.prototype.getOutgoingThreshold = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.LiquidityRule} returns this
 */
proto.looprpc.LiquidityRule.prototype.setOutgoingThreshold = function(value) {
  return jspb.Message.setProto3IntField(this, 4, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.SetLiquidityParamsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.SetLiquidityParamsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.SetLiquidityParamsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.SetLiquidityParamsRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    parameters: (f = msg.getParameters()) && proto.looprpc.LiquidityParameters.toObject(includeInstance, f)
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
 * @return {!proto.looprpc.SetLiquidityParamsRequest}
 */
proto.looprpc.SetLiquidityParamsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.SetLiquidityParamsRequest;
  return proto.looprpc.SetLiquidityParamsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.SetLiquidityParamsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.SetLiquidityParamsRequest}
 */
proto.looprpc.SetLiquidityParamsRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.looprpc.LiquidityParameters;
      reader.readMessage(value,proto.looprpc.LiquidityParameters.deserializeBinaryFromReader);
      msg.setParameters(value);
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
proto.looprpc.SetLiquidityParamsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.SetLiquidityParamsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.SetLiquidityParamsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.SetLiquidityParamsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getParameters();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.looprpc.LiquidityParameters.serializeBinaryToWriter
    );
  }
};


/**
 * optional LiquidityParameters parameters = 1;
 * @return {?proto.looprpc.LiquidityParameters}
 */
proto.looprpc.SetLiquidityParamsRequest.prototype.getParameters = function() {
  return /** @type{?proto.looprpc.LiquidityParameters} */ (
    jspb.Message.getWrapperField(this, proto.looprpc.LiquidityParameters, 1));
};


/**
 * @param {?proto.looprpc.LiquidityParameters|undefined} value
 * @return {!proto.looprpc.SetLiquidityParamsRequest} returns this
*/
proto.looprpc.SetLiquidityParamsRequest.prototype.setParameters = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.looprpc.SetLiquidityParamsRequest} returns this
 */
proto.looprpc.SetLiquidityParamsRequest.prototype.clearParameters = function() {
  return this.setParameters(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.looprpc.SetLiquidityParamsRequest.prototype.hasParameters = function() {
  return jspb.Message.getField(this, 1) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.SetLiquidityParamsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.SetLiquidityParamsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.SetLiquidityParamsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.SetLiquidityParamsResponse.toObject = function(includeInstance, msg) {
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
 * @return {!proto.looprpc.SetLiquidityParamsResponse}
 */
proto.looprpc.SetLiquidityParamsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.SetLiquidityParamsResponse;
  return proto.looprpc.SetLiquidityParamsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.SetLiquidityParamsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.SetLiquidityParamsResponse}
 */
proto.looprpc.SetLiquidityParamsResponse.deserializeBinaryFromReader = function(msg, reader) {
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
proto.looprpc.SetLiquidityParamsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.SetLiquidityParamsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.SetLiquidityParamsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.SetLiquidityParamsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.SuggestSwapsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.SuggestSwapsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.SuggestSwapsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.SuggestSwapsRequest.toObject = function(includeInstance, msg) {
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
 * @return {!proto.looprpc.SuggestSwapsRequest}
 */
proto.looprpc.SuggestSwapsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.SuggestSwapsRequest;
  return proto.looprpc.SuggestSwapsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.SuggestSwapsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.SuggestSwapsRequest}
 */
proto.looprpc.SuggestSwapsRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.looprpc.SuggestSwapsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.SuggestSwapsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.SuggestSwapsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.SuggestSwapsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.Disqualified.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.Disqualified.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.Disqualified} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.Disqualified.toObject = function(includeInstance, msg) {
  var f, obj = {
    channelId: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    pubkey: msg.getPubkey_asB64(),
    reason: jspb.Message.getFieldWithDefault(msg, 2, 0)
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
 * @return {!proto.looprpc.Disqualified}
 */
proto.looprpc.Disqualified.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.Disqualified;
  return proto.looprpc.Disqualified.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.Disqualified} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.Disqualified}
 */
proto.looprpc.Disqualified.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setChannelId(value);
      break;
    case 3:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setPubkey(value);
      break;
    case 2:
      var value = /** @type {!proto.looprpc.AutoReason} */ (reader.readEnum());
      msg.setReason(value);
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
proto.looprpc.Disqualified.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.Disqualified.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.Disqualified} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.Disqualified.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getChannelId();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      1,
      f
    );
  }
  f = message.getPubkey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      3,
      f
    );
  }
  f = message.getReason();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
};


/**
 * optional uint64 channel_id = 1;
 * @return {string}
 */
proto.looprpc.Disqualified.prototype.getChannelId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.Disqualified} returns this
 */
proto.looprpc.Disqualified.prototype.setChannelId = function(value) {
  return jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional bytes pubkey = 3;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.Disqualified.prototype.getPubkey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * optional bytes pubkey = 3;
 * This is a type-conversion wrapper around `getPubkey()`
 * @return {string}
 */
proto.looprpc.Disqualified.prototype.getPubkey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getPubkey()));
};


/**
 * optional bytes pubkey = 3;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getPubkey()`
 * @return {!Uint8Array}
 */
proto.looprpc.Disqualified.prototype.getPubkey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getPubkey()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.Disqualified} returns this
 */
proto.looprpc.Disqualified.prototype.setPubkey = function(value) {
  return jspb.Message.setProto3BytesField(this, 3, value);
};


/**
 * optional AutoReason reason = 2;
 * @return {!proto.looprpc.AutoReason}
 */
proto.looprpc.Disqualified.prototype.getReason = function() {
  return /** @type {!proto.looprpc.AutoReason} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.looprpc.AutoReason} value
 * @return {!proto.looprpc.Disqualified} returns this
 */
proto.looprpc.Disqualified.prototype.setReason = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.looprpc.SuggestSwapsResponse.repeatedFields_ = [1,3,2];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.SuggestSwapsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.SuggestSwapsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.SuggestSwapsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.SuggestSwapsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    loopOutList: jspb.Message.toObjectList(msg.getLoopOutList(),
    proto.looprpc.LoopOutRequest.toObject, includeInstance),
    loopInList: jspb.Message.toObjectList(msg.getLoopInList(),
    proto.looprpc.LoopInRequest.toObject, includeInstance),
    disqualifiedList: jspb.Message.toObjectList(msg.getDisqualifiedList(),
    proto.looprpc.Disqualified.toObject, includeInstance)
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
 * @return {!proto.looprpc.SuggestSwapsResponse}
 */
proto.looprpc.SuggestSwapsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.SuggestSwapsResponse;
  return proto.looprpc.SuggestSwapsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.SuggestSwapsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.SuggestSwapsResponse}
 */
proto.looprpc.SuggestSwapsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.looprpc.LoopOutRequest;
      reader.readMessage(value,proto.looprpc.LoopOutRequest.deserializeBinaryFromReader);
      msg.addLoopOut(value);
      break;
    case 3:
      var value = new proto.looprpc.LoopInRequest;
      reader.readMessage(value,proto.looprpc.LoopInRequest.deserializeBinaryFromReader);
      msg.addLoopIn(value);
      break;
    case 2:
      var value = new proto.looprpc.Disqualified;
      reader.readMessage(value,proto.looprpc.Disqualified.deserializeBinaryFromReader);
      msg.addDisqualified(value);
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
proto.looprpc.SuggestSwapsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.SuggestSwapsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.SuggestSwapsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.SuggestSwapsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getLoopOutList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.looprpc.LoopOutRequest.serializeBinaryToWriter
    );
  }
  f = message.getLoopInList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.looprpc.LoopInRequest.serializeBinaryToWriter
    );
  }
  f = message.getDisqualifiedList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      proto.looprpc.Disqualified.serializeBinaryToWriter
    );
  }
};


/**
 * repeated LoopOutRequest loop_out = 1;
 * @return {!Array<!proto.looprpc.LoopOutRequest>}
 */
proto.looprpc.SuggestSwapsResponse.prototype.getLoopOutList = function() {
  return /** @type{!Array<!proto.looprpc.LoopOutRequest>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.looprpc.LoopOutRequest, 1));
};


/**
 * @param {!Array<!proto.looprpc.LoopOutRequest>} value
 * @return {!proto.looprpc.SuggestSwapsResponse} returns this
*/
proto.looprpc.SuggestSwapsResponse.prototype.setLoopOutList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.looprpc.LoopOutRequest=} opt_value
 * @param {number=} opt_index
 * @return {!proto.looprpc.LoopOutRequest}
 */
proto.looprpc.SuggestSwapsResponse.prototype.addLoopOut = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.looprpc.LoopOutRequest, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.SuggestSwapsResponse} returns this
 */
proto.looprpc.SuggestSwapsResponse.prototype.clearLoopOutList = function() {
  return this.setLoopOutList([]);
};


/**
 * repeated LoopInRequest loop_in = 3;
 * @return {!Array<!proto.looprpc.LoopInRequest>}
 */
proto.looprpc.SuggestSwapsResponse.prototype.getLoopInList = function() {
  return /** @type{!Array<!proto.looprpc.LoopInRequest>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.looprpc.LoopInRequest, 3));
};


/**
 * @param {!Array<!proto.looprpc.LoopInRequest>} value
 * @return {!proto.looprpc.SuggestSwapsResponse} returns this
*/
proto.looprpc.SuggestSwapsResponse.prototype.setLoopInList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.looprpc.LoopInRequest=} opt_value
 * @param {number=} opt_index
 * @return {!proto.looprpc.LoopInRequest}
 */
proto.looprpc.SuggestSwapsResponse.prototype.addLoopIn = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.looprpc.LoopInRequest, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.SuggestSwapsResponse} returns this
 */
proto.looprpc.SuggestSwapsResponse.prototype.clearLoopInList = function() {
  return this.setLoopInList([]);
};


/**
 * repeated Disqualified disqualified = 2;
 * @return {!Array<!proto.looprpc.Disqualified>}
 */
proto.looprpc.SuggestSwapsResponse.prototype.getDisqualifiedList = function() {
  return /** @type{!Array<!proto.looprpc.Disqualified>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.looprpc.Disqualified, 2));
};


/**
 * @param {!Array<!proto.looprpc.Disqualified>} value
 * @return {!proto.looprpc.SuggestSwapsResponse} returns this
*/
proto.looprpc.SuggestSwapsResponse.prototype.setDisqualifiedList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.looprpc.Disqualified=} opt_value
 * @param {number=} opt_index
 * @return {!proto.looprpc.Disqualified}
 */
proto.looprpc.SuggestSwapsResponse.prototype.addDisqualified = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.looprpc.Disqualified, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.SuggestSwapsResponse} returns this
 */
proto.looprpc.SuggestSwapsResponse.prototype.clearDisqualifiedList = function() {
  return this.setDisqualifiedList([]);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.AbandonSwapRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.AbandonSwapRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.AbandonSwapRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.AbandonSwapRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: msg.getId_asB64(),
    iKnowWhatIAmDoing: jspb.Message.getBooleanFieldWithDefault(msg, 2, false)
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
 * @return {!proto.looprpc.AbandonSwapRequest}
 */
proto.looprpc.AbandonSwapRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.AbandonSwapRequest;
  return proto.looprpc.AbandonSwapRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.AbandonSwapRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.AbandonSwapRequest}
 */
proto.looprpc.AbandonSwapRequest.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIKnowWhatIAmDoing(value);
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
proto.looprpc.AbandonSwapRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.AbandonSwapRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.AbandonSwapRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.AbandonSwapRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getIKnowWhatIAmDoing();
  if (f) {
    writer.writeBool(
      2,
      f
    );
  }
};


/**
 * optional bytes id = 1;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.AbandonSwapRequest.prototype.getId = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes id = 1;
 * This is a type-conversion wrapper around `getId()`
 * @return {string}
 */
proto.looprpc.AbandonSwapRequest.prototype.getId_asB64 = function() {
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
proto.looprpc.AbandonSwapRequest.prototype.getId_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getId()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.AbandonSwapRequest} returns this
 */
proto.looprpc.AbandonSwapRequest.prototype.setId = function(value) {
  return jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional bool i_know_what_i_am_doing = 2;
 * @return {boolean}
 */
proto.looprpc.AbandonSwapRequest.prototype.getIKnowWhatIAmDoing = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 2, false));
};


/**
 * @param {boolean} value
 * @return {!proto.looprpc.AbandonSwapRequest} returns this
 */
proto.looprpc.AbandonSwapRequest.prototype.setIKnowWhatIAmDoing = function(value) {
  return jspb.Message.setProto3BooleanField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.AbandonSwapResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.AbandonSwapResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.AbandonSwapResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.AbandonSwapResponse.toObject = function(includeInstance, msg) {
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
 * @return {!proto.looprpc.AbandonSwapResponse}
 */
proto.looprpc.AbandonSwapResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.AbandonSwapResponse;
  return proto.looprpc.AbandonSwapResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.AbandonSwapResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.AbandonSwapResponse}
 */
proto.looprpc.AbandonSwapResponse.deserializeBinaryFromReader = function(msg, reader) {
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
proto.looprpc.AbandonSwapResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.AbandonSwapResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.AbandonSwapResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.AbandonSwapResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.ListReservationsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.ListReservationsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.ListReservationsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListReservationsRequest.toObject = function(includeInstance, msg) {
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
 * @return {!proto.looprpc.ListReservationsRequest}
 */
proto.looprpc.ListReservationsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.ListReservationsRequest;
  return proto.looprpc.ListReservationsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.ListReservationsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.ListReservationsRequest}
 */
proto.looprpc.ListReservationsRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.looprpc.ListReservationsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.ListReservationsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.ListReservationsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListReservationsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.looprpc.ListReservationsResponse.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.ListReservationsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.ListReservationsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.ListReservationsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListReservationsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    reservationsList: jspb.Message.toObjectList(msg.getReservationsList(),
    proto.looprpc.ClientReservation.toObject, includeInstance)
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
 * @return {!proto.looprpc.ListReservationsResponse}
 */
proto.looprpc.ListReservationsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.ListReservationsResponse;
  return proto.looprpc.ListReservationsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.ListReservationsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.ListReservationsResponse}
 */
proto.looprpc.ListReservationsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.looprpc.ClientReservation;
      reader.readMessage(value,proto.looprpc.ClientReservation.deserializeBinaryFromReader);
      msg.addReservations(value);
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
proto.looprpc.ListReservationsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.ListReservationsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.ListReservationsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListReservationsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getReservationsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.looprpc.ClientReservation.serializeBinaryToWriter
    );
  }
};


/**
 * repeated ClientReservation reservations = 1;
 * @return {!Array<!proto.looprpc.ClientReservation>}
 */
proto.looprpc.ListReservationsResponse.prototype.getReservationsList = function() {
  return /** @type{!Array<!proto.looprpc.ClientReservation>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.looprpc.ClientReservation, 1));
};


/**
 * @param {!Array<!proto.looprpc.ClientReservation>} value
 * @return {!proto.looprpc.ListReservationsResponse} returns this
*/
proto.looprpc.ListReservationsResponse.prototype.setReservationsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.looprpc.ClientReservation=} opt_value
 * @param {number=} opt_index
 * @return {!proto.looprpc.ClientReservation}
 */
proto.looprpc.ListReservationsResponse.prototype.addReservations = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.looprpc.ClientReservation, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.ListReservationsResponse} returns this
 */
proto.looprpc.ListReservationsResponse.prototype.clearReservationsList = function() {
  return this.setReservationsList([]);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.ClientReservation.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.ClientReservation.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.ClientReservation} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ClientReservation.toObject = function(includeInstance, msg) {
  var f, obj = {
    reservationId: msg.getReservationId_asB64(),
    state: jspb.Message.getFieldWithDefault(msg, 2, ""),
    amount: jspb.Message.getFieldWithDefault(msg, 3, "0"),
    txId: jspb.Message.getFieldWithDefault(msg, 4, ""),
    vout: jspb.Message.getFieldWithDefault(msg, 5, 0),
    expiry: jspb.Message.getFieldWithDefault(msg, 6, 0)
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
 * @return {!proto.looprpc.ClientReservation}
 */
proto.looprpc.ClientReservation.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.ClientReservation;
  return proto.looprpc.ClientReservation.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.ClientReservation} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.ClientReservation}
 */
proto.looprpc.ClientReservation.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setReservationId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setState(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setAmount(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setTxId(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setVout(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setExpiry(value);
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
proto.looprpc.ClientReservation.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.ClientReservation.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.ClientReservation} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ClientReservation.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getReservationId_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getState();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getAmount();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      3,
      f
    );
  }
  f = message.getTxId();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getVout();
  if (f !== 0) {
    writer.writeUint32(
      5,
      f
    );
  }
  f = message.getExpiry();
  if (f !== 0) {
    writer.writeUint32(
      6,
      f
    );
  }
};


/**
 * optional bytes reservation_id = 1;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.ClientReservation.prototype.getReservationId = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes reservation_id = 1;
 * This is a type-conversion wrapper around `getReservationId()`
 * @return {string}
 */
proto.looprpc.ClientReservation.prototype.getReservationId_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getReservationId()));
};


/**
 * optional bytes reservation_id = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getReservationId()`
 * @return {!Uint8Array}
 */
proto.looprpc.ClientReservation.prototype.getReservationId_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getReservationId()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.ClientReservation} returns this
 */
proto.looprpc.ClientReservation.prototype.setReservationId = function(value) {
  return jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional string state = 2;
 * @return {string}
 */
proto.looprpc.ClientReservation.prototype.getState = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.ClientReservation} returns this
 */
proto.looprpc.ClientReservation.prototype.setState = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional uint64 amount = 3;
 * @return {string}
 */
proto.looprpc.ClientReservation.prototype.getAmount = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.ClientReservation} returns this
 */
proto.looprpc.ClientReservation.prototype.setAmount = function(value) {
  return jspb.Message.setProto3StringIntField(this, 3, value);
};


/**
 * optional string tx_id = 4;
 * @return {string}
 */
proto.looprpc.ClientReservation.prototype.getTxId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.ClientReservation} returns this
 */
proto.looprpc.ClientReservation.prototype.setTxId = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional uint32 vout = 5;
 * @return {number}
 */
proto.looprpc.ClientReservation.prototype.getVout = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.ClientReservation} returns this
 */
proto.looprpc.ClientReservation.prototype.setVout = function(value) {
  return jspb.Message.setProto3IntField(this, 5, value);
};


/**
 * optional uint32 expiry = 6;
 * @return {number}
 */
proto.looprpc.ClientReservation.prototype.getExpiry = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.ClientReservation} returns this
 */
proto.looprpc.ClientReservation.prototype.setExpiry = function(value) {
  return jspb.Message.setProto3IntField(this, 6, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.looprpc.InstantOutRequest.repeatedFields_ = [1,2];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.InstantOutRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.InstantOutRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.InstantOutRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.InstantOutRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    reservationIdsList: msg.getReservationIdsList_asB64(),
    outgoingChanSetList: (f = jspb.Message.getRepeatedField(msg, 2)) == null ? undefined : f,
    destAddr: jspb.Message.getFieldWithDefault(msg, 3, "")
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
 * @return {!proto.looprpc.InstantOutRequest}
 */
proto.looprpc.InstantOutRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.InstantOutRequest;
  return proto.looprpc.InstantOutRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.InstantOutRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.InstantOutRequest}
 */
proto.looprpc.InstantOutRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.addReservationIds(value);
      break;
    case 2:
      var values = /** @type {!Array<string>} */ (reader.isDelimited() ? reader.readPackedUint64String() : [reader.readUint64String()]);
      for (var i = 0; i < values.length; i++) {
        msg.addOutgoingChanSet(values[i]);
      }
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setDestAddr(value);
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
proto.looprpc.InstantOutRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.InstantOutRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.InstantOutRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.InstantOutRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getReservationIdsList_asU8();
  if (f.length > 0) {
    writer.writeRepeatedBytes(
      1,
      f
    );
  }
  f = message.getOutgoingChanSetList();
  if (f.length > 0) {
    writer.writePackedUint64String(
      2,
      f
    );
  }
  f = message.getDestAddr();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
};


/**
 * repeated bytes reservation_ids = 1;
 * @return {!(Array<!Uint8Array>|Array<string>)}
 */
proto.looprpc.InstantOutRequest.prototype.getReservationIdsList = function() {
  return /** @type {!(Array<!Uint8Array>|Array<string>)} */ (jspb.Message.getRepeatedField(this, 1));
};


/**
 * repeated bytes reservation_ids = 1;
 * This is a type-conversion wrapper around `getReservationIdsList()`
 * @return {!Array<string>}
 */
proto.looprpc.InstantOutRequest.prototype.getReservationIdsList_asB64 = function() {
  return /** @type {!Array<string>} */ (jspb.Message.bytesListAsB64(
      this.getReservationIdsList()));
};


/**
 * repeated bytes reservation_ids = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getReservationIdsList()`
 * @return {!Array<!Uint8Array>}
 */
proto.looprpc.InstantOutRequest.prototype.getReservationIdsList_asU8 = function() {
  return /** @type {!Array<!Uint8Array>} */ (jspb.Message.bytesListAsU8(
      this.getReservationIdsList()));
};


/**
 * @param {!(Array<!Uint8Array>|Array<string>)} value
 * @return {!proto.looprpc.InstantOutRequest} returns this
 */
proto.looprpc.InstantOutRequest.prototype.setReservationIdsList = function(value) {
  return jspb.Message.setField(this, 1, value || []);
};


/**
 * @param {!(string|Uint8Array)} value
 * @param {number=} opt_index
 * @return {!proto.looprpc.InstantOutRequest} returns this
 */
proto.looprpc.InstantOutRequest.prototype.addReservationIds = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 1, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.InstantOutRequest} returns this
 */
proto.looprpc.InstantOutRequest.prototype.clearReservationIdsList = function() {
  return this.setReservationIdsList([]);
};


/**
 * repeated uint64 outgoing_chan_set = 2;
 * @return {!Array<string>}
 */
proto.looprpc.InstantOutRequest.prototype.getOutgoingChanSetList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 2));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.looprpc.InstantOutRequest} returns this
 */
proto.looprpc.InstantOutRequest.prototype.setOutgoingChanSetList = function(value) {
  return jspb.Message.setField(this, 2, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.looprpc.InstantOutRequest} returns this
 */
proto.looprpc.InstantOutRequest.prototype.addOutgoingChanSet = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 2, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.InstantOutRequest} returns this
 */
proto.looprpc.InstantOutRequest.prototype.clearOutgoingChanSetList = function() {
  return this.setOutgoingChanSetList([]);
};


/**
 * optional string dest_addr = 3;
 * @return {string}
 */
proto.looprpc.InstantOutRequest.prototype.getDestAddr = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.InstantOutRequest} returns this
 */
proto.looprpc.InstantOutRequest.prototype.setDestAddr = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.InstantOutResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.InstantOutResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.InstantOutResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.InstantOutResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    instantOutHash: msg.getInstantOutHash_asB64(),
    sweepTxId: jspb.Message.getFieldWithDefault(msg, 2, ""),
    state: jspb.Message.getFieldWithDefault(msg, 3, "")
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
 * @return {!proto.looprpc.InstantOutResponse}
 */
proto.looprpc.InstantOutResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.InstantOutResponse;
  return proto.looprpc.InstantOutResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.InstantOutResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.InstantOutResponse}
 */
proto.looprpc.InstantOutResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setInstantOutHash(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setSweepTxId(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setState(value);
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
proto.looprpc.InstantOutResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.InstantOutResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.InstantOutResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.InstantOutResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getInstantOutHash_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getSweepTxId();
  if (f.length > 0) {
    writer.writeString(
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
};


/**
 * optional bytes instant_out_hash = 1;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.InstantOutResponse.prototype.getInstantOutHash = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes instant_out_hash = 1;
 * This is a type-conversion wrapper around `getInstantOutHash()`
 * @return {string}
 */
proto.looprpc.InstantOutResponse.prototype.getInstantOutHash_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getInstantOutHash()));
};


/**
 * optional bytes instant_out_hash = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getInstantOutHash()`
 * @return {!Uint8Array}
 */
proto.looprpc.InstantOutResponse.prototype.getInstantOutHash_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getInstantOutHash()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.InstantOutResponse} returns this
 */
proto.looprpc.InstantOutResponse.prototype.setInstantOutHash = function(value) {
  return jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional string sweep_tx_id = 2;
 * @return {string}
 */
proto.looprpc.InstantOutResponse.prototype.getSweepTxId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.InstantOutResponse} returns this
 */
proto.looprpc.InstantOutResponse.prototype.setSweepTxId = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string state = 3;
 * @return {string}
 */
proto.looprpc.InstantOutResponse.prototype.getState = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.InstantOutResponse} returns this
 */
proto.looprpc.InstantOutResponse.prototype.setState = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.looprpc.InstantOutQuoteRequest.repeatedFields_ = [3];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.InstantOutQuoteRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.InstantOutQuoteRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.InstantOutQuoteRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.InstantOutQuoteRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    amt: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    numReservations: jspb.Message.getFieldWithDefault(msg, 2, 0),
    reservationIdsList: msg.getReservationIdsList_asB64()
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
 * @return {!proto.looprpc.InstantOutQuoteRequest}
 */
proto.looprpc.InstantOutQuoteRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.InstantOutQuoteRequest;
  return proto.looprpc.InstantOutQuoteRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.InstantOutQuoteRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.InstantOutQuoteRequest}
 */
proto.looprpc.InstantOutQuoteRequest.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {number} */ (reader.readInt32());
      msg.setNumReservations(value);
      break;
    case 3:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.addReservationIds(value);
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
proto.looprpc.InstantOutQuoteRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.InstantOutQuoteRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.InstantOutQuoteRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.InstantOutQuoteRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAmt();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      1,
      f
    );
  }
  f = message.getNumReservations();
  if (f !== 0) {
    writer.writeInt32(
      2,
      f
    );
  }
  f = message.getReservationIdsList_asU8();
  if (f.length > 0) {
    writer.writeRepeatedBytes(
      3,
      f
    );
  }
};


/**
 * optional uint64 amt = 1;
 * @return {string}
 */
proto.looprpc.InstantOutQuoteRequest.prototype.getAmt = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.InstantOutQuoteRequest} returns this
 */
proto.looprpc.InstantOutQuoteRequest.prototype.setAmt = function(value) {
  return jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional int32 num_reservations = 2;
 * @return {number}
 */
proto.looprpc.InstantOutQuoteRequest.prototype.getNumReservations = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.InstantOutQuoteRequest} returns this
 */
proto.looprpc.InstantOutQuoteRequest.prototype.setNumReservations = function(value) {
  return jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * repeated bytes reservation_ids = 3;
 * @return {!(Array<!Uint8Array>|Array<string>)}
 */
proto.looprpc.InstantOutQuoteRequest.prototype.getReservationIdsList = function() {
  return /** @type {!(Array<!Uint8Array>|Array<string>)} */ (jspb.Message.getRepeatedField(this, 3));
};


/**
 * repeated bytes reservation_ids = 3;
 * This is a type-conversion wrapper around `getReservationIdsList()`
 * @return {!Array<string>}
 */
proto.looprpc.InstantOutQuoteRequest.prototype.getReservationIdsList_asB64 = function() {
  return /** @type {!Array<string>} */ (jspb.Message.bytesListAsB64(
      this.getReservationIdsList()));
};


/**
 * repeated bytes reservation_ids = 3;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getReservationIdsList()`
 * @return {!Array<!Uint8Array>}
 */
proto.looprpc.InstantOutQuoteRequest.prototype.getReservationIdsList_asU8 = function() {
  return /** @type {!Array<!Uint8Array>} */ (jspb.Message.bytesListAsU8(
      this.getReservationIdsList()));
};


/**
 * @param {!(Array<!Uint8Array>|Array<string>)} value
 * @return {!proto.looprpc.InstantOutQuoteRequest} returns this
 */
proto.looprpc.InstantOutQuoteRequest.prototype.setReservationIdsList = function(value) {
  return jspb.Message.setField(this, 3, value || []);
};


/**
 * @param {!(string|Uint8Array)} value
 * @param {number=} opt_index
 * @return {!proto.looprpc.InstantOutQuoteRequest} returns this
 */
proto.looprpc.InstantOutQuoteRequest.prototype.addReservationIds = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 3, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.InstantOutQuoteRequest} returns this
 */
proto.looprpc.InstantOutQuoteRequest.prototype.clearReservationIdsList = function() {
  return this.setReservationIdsList([]);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.InstantOutQuoteResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.InstantOutQuoteResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.InstantOutQuoteResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.InstantOutQuoteResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    serviceFeeSat: jspb.Message.getFieldWithDefault(msg, 1, "0"),
    sweepFeeSat: jspb.Message.getFieldWithDefault(msg, 2, "0")
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
 * @return {!proto.looprpc.InstantOutQuoteResponse}
 */
proto.looprpc.InstantOutQuoteResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.InstantOutQuoteResponse;
  return proto.looprpc.InstantOutQuoteResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.InstantOutQuoteResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.InstantOutQuoteResponse}
 */
proto.looprpc.InstantOutQuoteResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setServiceFeeSat(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setSweepFeeSat(value);
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
proto.looprpc.InstantOutQuoteResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.InstantOutQuoteResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.InstantOutQuoteResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.InstantOutQuoteResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getServiceFeeSat();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      1,
      f
    );
  }
  f = message.getSweepFeeSat();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      2,
      f
    );
  }
};


/**
 * optional int64 service_fee_sat = 1;
 * @return {string}
 */
proto.looprpc.InstantOutQuoteResponse.prototype.getServiceFeeSat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.InstantOutQuoteResponse} returns this
 */
proto.looprpc.InstantOutQuoteResponse.prototype.setServiceFeeSat = function(value) {
  return jspb.Message.setProto3StringIntField(this, 1, value);
};


/**
 * optional int64 sweep_fee_sat = 2;
 * @return {string}
 */
proto.looprpc.InstantOutQuoteResponse.prototype.getSweepFeeSat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.InstantOutQuoteResponse} returns this
 */
proto.looprpc.InstantOutQuoteResponse.prototype.setSweepFeeSat = function(value) {
  return jspb.Message.setProto3StringIntField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.ListInstantOutsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.ListInstantOutsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.ListInstantOutsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListInstantOutsRequest.toObject = function(includeInstance, msg) {
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
 * @return {!proto.looprpc.ListInstantOutsRequest}
 */
proto.looprpc.ListInstantOutsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.ListInstantOutsRequest;
  return proto.looprpc.ListInstantOutsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.ListInstantOutsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.ListInstantOutsRequest}
 */
proto.looprpc.ListInstantOutsRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.looprpc.ListInstantOutsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.ListInstantOutsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.ListInstantOutsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListInstantOutsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.looprpc.ListInstantOutsResponse.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.ListInstantOutsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.ListInstantOutsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.ListInstantOutsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListInstantOutsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    swapsList: jspb.Message.toObjectList(msg.getSwapsList(),
    proto.looprpc.InstantOut.toObject, includeInstance)
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
 * @return {!proto.looprpc.ListInstantOutsResponse}
 */
proto.looprpc.ListInstantOutsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.ListInstantOutsResponse;
  return proto.looprpc.ListInstantOutsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.ListInstantOutsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.ListInstantOutsResponse}
 */
proto.looprpc.ListInstantOutsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.looprpc.InstantOut;
      reader.readMessage(value,proto.looprpc.InstantOut.deserializeBinaryFromReader);
      msg.addSwaps(value);
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
proto.looprpc.ListInstantOutsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.ListInstantOutsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.ListInstantOutsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListInstantOutsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSwapsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.looprpc.InstantOut.serializeBinaryToWriter
    );
  }
};


/**
 * repeated InstantOut swaps = 1;
 * @return {!Array<!proto.looprpc.InstantOut>}
 */
proto.looprpc.ListInstantOutsResponse.prototype.getSwapsList = function() {
  return /** @type{!Array<!proto.looprpc.InstantOut>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.looprpc.InstantOut, 1));
};


/**
 * @param {!Array<!proto.looprpc.InstantOut>} value
 * @return {!proto.looprpc.ListInstantOutsResponse} returns this
*/
proto.looprpc.ListInstantOutsResponse.prototype.setSwapsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.looprpc.InstantOut=} opt_value
 * @param {number=} opt_index
 * @return {!proto.looprpc.InstantOut}
 */
proto.looprpc.ListInstantOutsResponse.prototype.addSwaps = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.looprpc.InstantOut, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.ListInstantOutsResponse} returns this
 */
proto.looprpc.ListInstantOutsResponse.prototype.clearSwapsList = function() {
  return this.setSwapsList([]);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.looprpc.InstantOut.repeatedFields_ = [4];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.InstantOut.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.InstantOut.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.InstantOut} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.InstantOut.toObject = function(includeInstance, msg) {
  var f, obj = {
    swapHash: msg.getSwapHash_asB64(),
    state: jspb.Message.getFieldWithDefault(msg, 2, ""),
    amount: jspb.Message.getFieldWithDefault(msg, 3, "0"),
    reservationIdsList: msg.getReservationIdsList_asB64(),
    sweepTxId: jspb.Message.getFieldWithDefault(msg, 5, "")
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
 * @return {!proto.looprpc.InstantOut}
 */
proto.looprpc.InstantOut.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.InstantOut;
  return proto.looprpc.InstantOut.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.InstantOut} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.InstantOut}
 */
proto.looprpc.InstantOut.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSwapHash(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setState(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setAmount(value);
      break;
    case 4:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.addReservationIds(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setSweepTxId(value);
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
proto.looprpc.InstantOut.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.InstantOut.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.InstantOut} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.InstantOut.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSwapHash_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getState();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getAmount();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      3,
      f
    );
  }
  f = message.getReservationIdsList_asU8();
  if (f.length > 0) {
    writer.writeRepeatedBytes(
      4,
      f
    );
  }
  f = message.getSweepTxId();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
};


/**
 * optional bytes swap_hash = 1;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.InstantOut.prototype.getSwapHash = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes swap_hash = 1;
 * This is a type-conversion wrapper around `getSwapHash()`
 * @return {string}
 */
proto.looprpc.InstantOut.prototype.getSwapHash_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSwapHash()));
};


/**
 * optional bytes swap_hash = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSwapHash()`
 * @return {!Uint8Array}
 */
proto.looprpc.InstantOut.prototype.getSwapHash_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSwapHash()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.InstantOut} returns this
 */
proto.looprpc.InstantOut.prototype.setSwapHash = function(value) {
  return jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional string state = 2;
 * @return {string}
 */
proto.looprpc.InstantOut.prototype.getState = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.InstantOut} returns this
 */
proto.looprpc.InstantOut.prototype.setState = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional uint64 amount = 3;
 * @return {string}
 */
proto.looprpc.InstantOut.prototype.getAmount = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.InstantOut} returns this
 */
proto.looprpc.InstantOut.prototype.setAmount = function(value) {
  return jspb.Message.setProto3StringIntField(this, 3, value);
};


/**
 * repeated bytes reservation_ids = 4;
 * @return {!(Array<!Uint8Array>|Array<string>)}
 */
proto.looprpc.InstantOut.prototype.getReservationIdsList = function() {
  return /** @type {!(Array<!Uint8Array>|Array<string>)} */ (jspb.Message.getRepeatedField(this, 4));
};


/**
 * repeated bytes reservation_ids = 4;
 * This is a type-conversion wrapper around `getReservationIdsList()`
 * @return {!Array<string>}
 */
proto.looprpc.InstantOut.prototype.getReservationIdsList_asB64 = function() {
  return /** @type {!Array<string>} */ (jspb.Message.bytesListAsB64(
      this.getReservationIdsList()));
};


/**
 * repeated bytes reservation_ids = 4;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getReservationIdsList()`
 * @return {!Array<!Uint8Array>}
 */
proto.looprpc.InstantOut.prototype.getReservationIdsList_asU8 = function() {
  return /** @type {!Array<!Uint8Array>} */ (jspb.Message.bytesListAsU8(
      this.getReservationIdsList()));
};


/**
 * @param {!(Array<!Uint8Array>|Array<string>)} value
 * @return {!proto.looprpc.InstantOut} returns this
 */
proto.looprpc.InstantOut.prototype.setReservationIdsList = function(value) {
  return jspb.Message.setField(this, 4, value || []);
};


/**
 * @param {!(string|Uint8Array)} value
 * @param {number=} opt_index
 * @return {!proto.looprpc.InstantOut} returns this
 */
proto.looprpc.InstantOut.prototype.addReservationIds = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 4, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.InstantOut} returns this
 */
proto.looprpc.InstantOut.prototype.clearReservationIdsList = function() {
  return this.setReservationIdsList([]);
};


/**
 * optional string sweep_tx_id = 5;
 * @return {string}
 */
proto.looprpc.InstantOut.prototype.getSweepTxId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.InstantOut} returns this
 */
proto.looprpc.InstantOut.prototype.setSweepTxId = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.NewStaticAddressRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.NewStaticAddressRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.NewStaticAddressRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.NewStaticAddressRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    clientKey: msg.getClientKey_asB64()
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
 * @return {!proto.looprpc.NewStaticAddressRequest}
 */
proto.looprpc.NewStaticAddressRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.NewStaticAddressRequest;
  return proto.looprpc.NewStaticAddressRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.NewStaticAddressRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.NewStaticAddressRequest}
 */
proto.looprpc.NewStaticAddressRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setClientKey(value);
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
proto.looprpc.NewStaticAddressRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.NewStaticAddressRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.NewStaticAddressRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.NewStaticAddressRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getClientKey_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
};


/**
 * optional bytes client_key = 1;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.NewStaticAddressRequest.prototype.getClientKey = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes client_key = 1;
 * This is a type-conversion wrapper around `getClientKey()`
 * @return {string}
 */
proto.looprpc.NewStaticAddressRequest.prototype.getClientKey_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getClientKey()));
};


/**
 * optional bytes client_key = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getClientKey()`
 * @return {!Uint8Array}
 */
proto.looprpc.NewStaticAddressRequest.prototype.getClientKey_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getClientKey()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.NewStaticAddressRequest} returns this
 */
proto.looprpc.NewStaticAddressRequest.prototype.setClientKey = function(value) {
  return jspb.Message.setProto3BytesField(this, 1, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.NewStaticAddressResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.NewStaticAddressResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.NewStaticAddressResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.NewStaticAddressResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    address: jspb.Message.getFieldWithDefault(msg, 1, ""),
    expiry: jspb.Message.getFieldWithDefault(msg, 2, 0)
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
 * @return {!proto.looprpc.NewStaticAddressResponse}
 */
proto.looprpc.NewStaticAddressResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.NewStaticAddressResponse;
  return proto.looprpc.NewStaticAddressResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.NewStaticAddressResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.NewStaticAddressResponse}
 */
proto.looprpc.NewStaticAddressResponse.deserializeBinaryFromReader = function(msg, reader) {
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
      msg.setExpiry(value);
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
proto.looprpc.NewStaticAddressResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.NewStaticAddressResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.NewStaticAddressResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.NewStaticAddressResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAddress();
  if (f.length > 0) {
    writer.writeString(
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
};


/**
 * optional string address = 1;
 * @return {string}
 */
proto.looprpc.NewStaticAddressResponse.prototype.getAddress = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.NewStaticAddressResponse} returns this
 */
proto.looprpc.NewStaticAddressResponse.prototype.setAddress = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional uint32 expiry = 2;
 * @return {number}
 */
proto.looprpc.NewStaticAddressResponse.prototype.getExpiry = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.NewStaticAddressResponse} returns this
 */
proto.looprpc.NewStaticAddressResponse.prototype.setExpiry = function(value) {
  return jspb.Message.setProto3IntField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.ListUnspentDepositsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.ListUnspentDepositsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.ListUnspentDepositsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListUnspentDepositsRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    minConfs: jspb.Message.getFieldWithDefault(msg, 1, 0),
    maxConfs: jspb.Message.getFieldWithDefault(msg, 2, 0)
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
 * @return {!proto.looprpc.ListUnspentDepositsRequest}
 */
proto.looprpc.ListUnspentDepositsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.ListUnspentDepositsRequest;
  return proto.looprpc.ListUnspentDepositsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.ListUnspentDepositsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.ListUnspentDepositsRequest}
 */
proto.looprpc.ListUnspentDepositsRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setMinConfs(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setMaxConfs(value);
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
proto.looprpc.ListUnspentDepositsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.ListUnspentDepositsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.ListUnspentDepositsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListUnspentDepositsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getMinConfs();
  if (f !== 0) {
    writer.writeInt32(
      1,
      f
    );
  }
  f = message.getMaxConfs();
  if (f !== 0) {
    writer.writeInt32(
      2,
      f
    );
  }
};


/**
 * optional int32 min_confs = 1;
 * @return {number}
 */
proto.looprpc.ListUnspentDepositsRequest.prototype.getMinConfs = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.ListUnspentDepositsRequest} returns this
 */
proto.looprpc.ListUnspentDepositsRequest.prototype.setMinConfs = function(value) {
  return jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * optional int32 max_confs = 2;
 * @return {number}
 */
proto.looprpc.ListUnspentDepositsRequest.prototype.getMaxConfs = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.ListUnspentDepositsRequest} returns this
 */
proto.looprpc.ListUnspentDepositsRequest.prototype.setMaxConfs = function(value) {
  return jspb.Message.setProto3IntField(this, 2, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.looprpc.ListUnspentDepositsResponse.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.ListUnspentDepositsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.ListUnspentDepositsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.ListUnspentDepositsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListUnspentDepositsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    utxosList: jspb.Message.toObjectList(msg.getUtxosList(),
    proto.looprpc.Utxo.toObject, includeInstance)
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
 * @return {!proto.looprpc.ListUnspentDepositsResponse}
 */
proto.looprpc.ListUnspentDepositsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.ListUnspentDepositsResponse;
  return proto.looprpc.ListUnspentDepositsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.ListUnspentDepositsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.ListUnspentDepositsResponse}
 */
proto.looprpc.ListUnspentDepositsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.looprpc.Utxo;
      reader.readMessage(value,proto.looprpc.Utxo.deserializeBinaryFromReader);
      msg.addUtxos(value);
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
proto.looprpc.ListUnspentDepositsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.ListUnspentDepositsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.ListUnspentDepositsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListUnspentDepositsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUtxosList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.looprpc.Utxo.serializeBinaryToWriter
    );
  }
};


/**
 * repeated Utxo utxos = 1;
 * @return {!Array<!proto.looprpc.Utxo>}
 */
proto.looprpc.ListUnspentDepositsResponse.prototype.getUtxosList = function() {
  return /** @type{!Array<!proto.looprpc.Utxo>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.looprpc.Utxo, 1));
};


/**
 * @param {!Array<!proto.looprpc.Utxo>} value
 * @return {!proto.looprpc.ListUnspentDepositsResponse} returns this
*/
proto.looprpc.ListUnspentDepositsResponse.prototype.setUtxosList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.looprpc.Utxo=} opt_value
 * @param {number=} opt_index
 * @return {!proto.looprpc.Utxo}
 */
proto.looprpc.ListUnspentDepositsResponse.prototype.addUtxos = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.looprpc.Utxo, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.ListUnspentDepositsResponse} returns this
 */
proto.looprpc.ListUnspentDepositsResponse.prototype.clearUtxosList = function() {
  return this.setUtxosList([]);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.Utxo.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.Utxo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.Utxo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.Utxo.toObject = function(includeInstance, msg) {
  var f, obj = {
    staticAddress: jspb.Message.getFieldWithDefault(msg, 1, ""),
    amountSat: jspb.Message.getFieldWithDefault(msg, 2, "0"),
    outpoint: jspb.Message.getFieldWithDefault(msg, 3, ""),
    confirmations: jspb.Message.getFieldWithDefault(msg, 4, "0")
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
 * @return {!proto.looprpc.Utxo}
 */
proto.looprpc.Utxo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.Utxo;
  return proto.looprpc.Utxo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.Utxo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.Utxo}
 */
proto.looprpc.Utxo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setStaticAddress(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setAmountSat(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setOutpoint(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setConfirmations(value);
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
proto.looprpc.Utxo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.Utxo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.Utxo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.Utxo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getStaticAddress();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getAmountSat();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      2,
      f
    );
  }
  f = message.getOutpoint();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getConfirmations();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      4,
      f
    );
  }
};


/**
 * optional string static_address = 1;
 * @return {string}
 */
proto.looprpc.Utxo.prototype.getStaticAddress = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.Utxo} returns this
 */
proto.looprpc.Utxo.prototype.setStaticAddress = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional int64 amount_sat = 2;
 * @return {string}
 */
proto.looprpc.Utxo.prototype.getAmountSat = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.Utxo} returns this
 */
proto.looprpc.Utxo.prototype.setAmountSat = function(value) {
  return jspb.Message.setProto3StringIntField(this, 2, value);
};


/**
 * optional string outpoint = 3;
 * @return {string}
 */
proto.looprpc.Utxo.prototype.getOutpoint = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.Utxo} returns this
 */
proto.looprpc.Utxo.prototype.setOutpoint = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional int64 confirmations = 4;
 * @return {string}
 */
proto.looprpc.Utxo.prototype.getConfirmations = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.Utxo} returns this
 */
proto.looprpc.Utxo.prototype.setConfirmations = function(value) {
  return jspb.Message.setProto3StringIntField(this, 4, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.looprpc.WithdrawDepositsRequest.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.WithdrawDepositsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.WithdrawDepositsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.WithdrawDepositsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.WithdrawDepositsRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    outpointsList: jspb.Message.toObjectList(msg.getOutpointsList(),
    proto.looprpc.OutPoint.toObject, includeInstance),
    all: jspb.Message.getBooleanFieldWithDefault(msg, 2, false),
    destAddr: jspb.Message.getFieldWithDefault(msg, 3, ""),
    satPerVbyte: jspb.Message.getFieldWithDefault(msg, 4, "0"),
    amount: jspb.Message.getFieldWithDefault(msg, 5, "0")
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
 * @return {!proto.looprpc.WithdrawDepositsRequest}
 */
proto.looprpc.WithdrawDepositsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.WithdrawDepositsRequest;
  return proto.looprpc.WithdrawDepositsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.WithdrawDepositsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.WithdrawDepositsRequest}
 */
proto.looprpc.WithdrawDepositsRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.looprpc.OutPoint;
      reader.readMessage(value,proto.looprpc.OutPoint.deserializeBinaryFromReader);
      msg.addOutpoints(value);
      break;
    case 2:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setAll(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setDestAddr(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setSatPerVbyte(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setAmount(value);
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
proto.looprpc.WithdrawDepositsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.WithdrawDepositsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.WithdrawDepositsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.WithdrawDepositsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getOutpointsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.looprpc.OutPoint.serializeBinaryToWriter
    );
  }
  f = message.getAll();
  if (f) {
    writer.writeBool(
      2,
      f
    );
  }
  f = message.getDestAddr();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getSatPerVbyte();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      4,
      f
    );
  }
  f = message.getAmount();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      5,
      f
    );
  }
};


/**
 * repeated OutPoint outpoints = 1;
 * @return {!Array<!proto.looprpc.OutPoint>}
 */
proto.looprpc.WithdrawDepositsRequest.prototype.getOutpointsList = function() {
  return /** @type{!Array<!proto.looprpc.OutPoint>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.looprpc.OutPoint, 1));
};


/**
 * @param {!Array<!proto.looprpc.OutPoint>} value
 * @return {!proto.looprpc.WithdrawDepositsRequest} returns this
*/
proto.looprpc.WithdrawDepositsRequest.prototype.setOutpointsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.looprpc.OutPoint=} opt_value
 * @param {number=} opt_index
 * @return {!proto.looprpc.OutPoint}
 */
proto.looprpc.WithdrawDepositsRequest.prototype.addOutpoints = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.looprpc.OutPoint, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.WithdrawDepositsRequest} returns this
 */
proto.looprpc.WithdrawDepositsRequest.prototype.clearOutpointsList = function() {
  return this.setOutpointsList([]);
};


/**
 * optional bool all = 2;
 * @return {boolean}
 */
proto.looprpc.WithdrawDepositsRequest.prototype.getAll = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 2, false));
};


/**
 * @param {boolean} value
 * @return {!proto.looprpc.WithdrawDepositsRequest} returns this
 */
proto.looprpc.WithdrawDepositsRequest.prototype.setAll = function(value) {
  return jspb.Message.setProto3BooleanField(this, 2, value);
};


/**
 * optional string dest_addr = 3;
 * @return {string}
 */
proto.looprpc.WithdrawDepositsRequest.prototype.getDestAddr = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.WithdrawDepositsRequest} returns this
 */
proto.looprpc.WithdrawDepositsRequest.prototype.setDestAddr = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional int64 sat_per_vbyte = 4;
 * @return {string}
 */
proto.looprpc.WithdrawDepositsRequest.prototype.getSatPerVbyte = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.WithdrawDepositsRequest} returns this
 */
proto.looprpc.WithdrawDepositsRequest.prototype.setSatPerVbyte = function(value) {
  return jspb.Message.setProto3StringIntField(this, 4, value);
};


/**
 * optional int64 amount = 5;
 * @return {string}
 */
proto.looprpc.WithdrawDepositsRequest.prototype.getAmount = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.WithdrawDepositsRequest} returns this
 */
proto.looprpc.WithdrawDepositsRequest.prototype.setAmount = function(value) {
  return jspb.Message.setProto3StringIntField(this, 5, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.WithdrawDepositsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.WithdrawDepositsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.WithdrawDepositsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.WithdrawDepositsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    withdrawalTxHash: jspb.Message.getFieldWithDefault(msg, 1, ""),
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
 * @return {!proto.looprpc.WithdrawDepositsResponse}
 */
proto.looprpc.WithdrawDepositsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.WithdrawDepositsResponse;
  return proto.looprpc.WithdrawDepositsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.WithdrawDepositsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.WithdrawDepositsResponse}
 */
proto.looprpc.WithdrawDepositsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setWithdrawalTxHash(value);
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
proto.looprpc.WithdrawDepositsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.WithdrawDepositsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.WithdrawDepositsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.WithdrawDepositsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getWithdrawalTxHash();
  if (f.length > 0) {
    writer.writeString(
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
 * optional string withdrawal_tx_hash = 1;
 * @return {string}
 */
proto.looprpc.WithdrawDepositsResponse.prototype.getWithdrawalTxHash = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.WithdrawDepositsResponse} returns this
 */
proto.looprpc.WithdrawDepositsResponse.prototype.setWithdrawalTxHash = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string address = 2;
 * @return {string}
 */
proto.looprpc.WithdrawDepositsResponse.prototype.getAddress = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.WithdrawDepositsResponse} returns this
 */
proto.looprpc.WithdrawDepositsResponse.prototype.setAddress = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.OutPoint.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.OutPoint.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.OutPoint} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.OutPoint.toObject = function(includeInstance, msg) {
  var f, obj = {
    txidBytes: msg.getTxidBytes_asB64(),
    txidStr: jspb.Message.getFieldWithDefault(msg, 2, ""),
    outputIndex: jspb.Message.getFieldWithDefault(msg, 3, 0)
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
 * @return {!proto.looprpc.OutPoint}
 */
proto.looprpc.OutPoint.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.OutPoint;
  return proto.looprpc.OutPoint.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.OutPoint} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.OutPoint}
 */
proto.looprpc.OutPoint.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setTxidBytes(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setTxidStr(value);
      break;
    case 3:
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
proto.looprpc.OutPoint.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.OutPoint.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.OutPoint} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.OutPoint.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTxidBytes_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getTxidStr();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getOutputIndex();
  if (f !== 0) {
    writer.writeUint32(
      3,
      f
    );
  }
};


/**
 * optional bytes txid_bytes = 1;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.OutPoint.prototype.getTxidBytes = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes txid_bytes = 1;
 * This is a type-conversion wrapper around `getTxidBytes()`
 * @return {string}
 */
proto.looprpc.OutPoint.prototype.getTxidBytes_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getTxidBytes()));
};


/**
 * optional bytes txid_bytes = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getTxidBytes()`
 * @return {!Uint8Array}
 */
proto.looprpc.OutPoint.prototype.getTxidBytes_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getTxidBytes()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.OutPoint} returns this
 */
proto.looprpc.OutPoint.prototype.setTxidBytes = function(value) {
  return jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional string txid_str = 2;
 * @return {string}
 */
proto.looprpc.OutPoint.prototype.getTxidStr = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.OutPoint} returns this
 */
proto.looprpc.OutPoint.prototype.setTxidStr = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional uint32 output_index = 3;
 * @return {number}
 */
proto.looprpc.OutPoint.prototype.getOutputIndex = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.OutPoint} returns this
 */
proto.looprpc.OutPoint.prototype.setOutputIndex = function(value) {
  return jspb.Message.setProto3IntField(this, 3, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.looprpc.ListStaticAddressDepositsRequest.repeatedFields_ = [2];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.ListStaticAddressDepositsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.ListStaticAddressDepositsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.ListStaticAddressDepositsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListStaticAddressDepositsRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    stateFilter: jspb.Message.getFieldWithDefault(msg, 1, 0),
    outpointsList: (f = jspb.Message.getRepeatedField(msg, 2)) == null ? undefined : f
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
 * @return {!proto.looprpc.ListStaticAddressDepositsRequest}
 */
proto.looprpc.ListStaticAddressDepositsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.ListStaticAddressDepositsRequest;
  return proto.looprpc.ListStaticAddressDepositsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.ListStaticAddressDepositsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.ListStaticAddressDepositsRequest}
 */
proto.looprpc.ListStaticAddressDepositsRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.looprpc.DepositState} */ (reader.readEnum());
      msg.setStateFilter(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.addOutpoints(value);
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
proto.looprpc.ListStaticAddressDepositsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.ListStaticAddressDepositsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.ListStaticAddressDepositsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListStaticAddressDepositsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getStateFilter();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getOutpointsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      2,
      f
    );
  }
};


/**
 * optional DepositState state_filter = 1;
 * @return {!proto.looprpc.DepositState}
 */
proto.looprpc.ListStaticAddressDepositsRequest.prototype.getStateFilter = function() {
  return /** @type {!proto.looprpc.DepositState} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {!proto.looprpc.DepositState} value
 * @return {!proto.looprpc.ListStaticAddressDepositsRequest} returns this
 */
proto.looprpc.ListStaticAddressDepositsRequest.prototype.setStateFilter = function(value) {
  return jspb.Message.setProto3EnumField(this, 1, value);
};


/**
 * repeated string outpoints = 2;
 * @return {!Array<string>}
 */
proto.looprpc.ListStaticAddressDepositsRequest.prototype.getOutpointsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 2));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.looprpc.ListStaticAddressDepositsRequest} returns this
 */
proto.looprpc.ListStaticAddressDepositsRequest.prototype.setOutpointsList = function(value) {
  return jspb.Message.setField(this, 2, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.looprpc.ListStaticAddressDepositsRequest} returns this
 */
proto.looprpc.ListStaticAddressDepositsRequest.prototype.addOutpoints = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 2, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.ListStaticAddressDepositsRequest} returns this
 */
proto.looprpc.ListStaticAddressDepositsRequest.prototype.clearOutpointsList = function() {
  return this.setOutpointsList([]);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.looprpc.ListStaticAddressDepositsResponse.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.ListStaticAddressDepositsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.ListStaticAddressDepositsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.ListStaticAddressDepositsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListStaticAddressDepositsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    filteredDepositsList: jspb.Message.toObjectList(msg.getFilteredDepositsList(),
    proto.looprpc.Deposit.toObject, includeInstance)
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
 * @return {!proto.looprpc.ListStaticAddressDepositsResponse}
 */
proto.looprpc.ListStaticAddressDepositsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.ListStaticAddressDepositsResponse;
  return proto.looprpc.ListStaticAddressDepositsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.ListStaticAddressDepositsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.ListStaticAddressDepositsResponse}
 */
proto.looprpc.ListStaticAddressDepositsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.looprpc.Deposit;
      reader.readMessage(value,proto.looprpc.Deposit.deserializeBinaryFromReader);
      msg.addFilteredDeposits(value);
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
proto.looprpc.ListStaticAddressDepositsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.ListStaticAddressDepositsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.ListStaticAddressDepositsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListStaticAddressDepositsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getFilteredDepositsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.looprpc.Deposit.serializeBinaryToWriter
    );
  }
};


/**
 * repeated Deposit filtered_deposits = 1;
 * @return {!Array<!proto.looprpc.Deposit>}
 */
proto.looprpc.ListStaticAddressDepositsResponse.prototype.getFilteredDepositsList = function() {
  return /** @type{!Array<!proto.looprpc.Deposit>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.looprpc.Deposit, 1));
};


/**
 * @param {!Array<!proto.looprpc.Deposit>} value
 * @return {!proto.looprpc.ListStaticAddressDepositsResponse} returns this
*/
proto.looprpc.ListStaticAddressDepositsResponse.prototype.setFilteredDepositsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.looprpc.Deposit=} opt_value
 * @param {number=} opt_index
 * @return {!proto.looprpc.Deposit}
 */
proto.looprpc.ListStaticAddressDepositsResponse.prototype.addFilteredDeposits = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.looprpc.Deposit, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.ListStaticAddressDepositsResponse} returns this
 */
proto.looprpc.ListStaticAddressDepositsResponse.prototype.clearFilteredDepositsList = function() {
  return this.setFilteredDepositsList([]);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.ListStaticAddressWithdrawalRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.ListStaticAddressWithdrawalRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.ListStaticAddressWithdrawalRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListStaticAddressWithdrawalRequest.toObject = function(includeInstance, msg) {
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
 * @return {!proto.looprpc.ListStaticAddressWithdrawalRequest}
 */
proto.looprpc.ListStaticAddressWithdrawalRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.ListStaticAddressWithdrawalRequest;
  return proto.looprpc.ListStaticAddressWithdrawalRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.ListStaticAddressWithdrawalRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.ListStaticAddressWithdrawalRequest}
 */
proto.looprpc.ListStaticAddressWithdrawalRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.looprpc.ListStaticAddressWithdrawalRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.ListStaticAddressWithdrawalRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.ListStaticAddressWithdrawalRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListStaticAddressWithdrawalRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.looprpc.ListStaticAddressWithdrawalResponse.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.ListStaticAddressWithdrawalResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.ListStaticAddressWithdrawalResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.ListStaticAddressWithdrawalResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListStaticAddressWithdrawalResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    withdrawalsList: jspb.Message.toObjectList(msg.getWithdrawalsList(),
    proto.looprpc.StaticAddressWithdrawal.toObject, includeInstance)
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
 * @return {!proto.looprpc.ListStaticAddressWithdrawalResponse}
 */
proto.looprpc.ListStaticAddressWithdrawalResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.ListStaticAddressWithdrawalResponse;
  return proto.looprpc.ListStaticAddressWithdrawalResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.ListStaticAddressWithdrawalResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.ListStaticAddressWithdrawalResponse}
 */
proto.looprpc.ListStaticAddressWithdrawalResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.looprpc.StaticAddressWithdrawal;
      reader.readMessage(value,proto.looprpc.StaticAddressWithdrawal.deserializeBinaryFromReader);
      msg.addWithdrawals(value);
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
proto.looprpc.ListStaticAddressWithdrawalResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.ListStaticAddressWithdrawalResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.ListStaticAddressWithdrawalResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListStaticAddressWithdrawalResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getWithdrawalsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.looprpc.StaticAddressWithdrawal.serializeBinaryToWriter
    );
  }
};


/**
 * repeated StaticAddressWithdrawal withdrawals = 1;
 * @return {!Array<!proto.looprpc.StaticAddressWithdrawal>}
 */
proto.looprpc.ListStaticAddressWithdrawalResponse.prototype.getWithdrawalsList = function() {
  return /** @type{!Array<!proto.looprpc.StaticAddressWithdrawal>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.looprpc.StaticAddressWithdrawal, 1));
};


/**
 * @param {!Array<!proto.looprpc.StaticAddressWithdrawal>} value
 * @return {!proto.looprpc.ListStaticAddressWithdrawalResponse} returns this
*/
proto.looprpc.ListStaticAddressWithdrawalResponse.prototype.setWithdrawalsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.looprpc.StaticAddressWithdrawal=} opt_value
 * @param {number=} opt_index
 * @return {!proto.looprpc.StaticAddressWithdrawal}
 */
proto.looprpc.ListStaticAddressWithdrawalResponse.prototype.addWithdrawals = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.looprpc.StaticAddressWithdrawal, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.ListStaticAddressWithdrawalResponse} returns this
 */
proto.looprpc.ListStaticAddressWithdrawalResponse.prototype.clearWithdrawalsList = function() {
  return this.setWithdrawalsList([]);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.ListStaticAddressSwapsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.ListStaticAddressSwapsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.ListStaticAddressSwapsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListStaticAddressSwapsRequest.toObject = function(includeInstance, msg) {
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
 * @return {!proto.looprpc.ListStaticAddressSwapsRequest}
 */
proto.looprpc.ListStaticAddressSwapsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.ListStaticAddressSwapsRequest;
  return proto.looprpc.ListStaticAddressSwapsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.ListStaticAddressSwapsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.ListStaticAddressSwapsRequest}
 */
proto.looprpc.ListStaticAddressSwapsRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.looprpc.ListStaticAddressSwapsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.ListStaticAddressSwapsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.ListStaticAddressSwapsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListStaticAddressSwapsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.looprpc.ListStaticAddressSwapsResponse.repeatedFields_ = [1];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.ListStaticAddressSwapsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.ListStaticAddressSwapsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.ListStaticAddressSwapsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListStaticAddressSwapsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    swapsList: jspb.Message.toObjectList(msg.getSwapsList(),
    proto.looprpc.StaticAddressLoopInSwap.toObject, includeInstance)
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
 * @return {!proto.looprpc.ListStaticAddressSwapsResponse}
 */
proto.looprpc.ListStaticAddressSwapsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.ListStaticAddressSwapsResponse;
  return proto.looprpc.ListStaticAddressSwapsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.ListStaticAddressSwapsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.ListStaticAddressSwapsResponse}
 */
proto.looprpc.ListStaticAddressSwapsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.looprpc.StaticAddressLoopInSwap;
      reader.readMessage(value,proto.looprpc.StaticAddressLoopInSwap.deserializeBinaryFromReader);
      msg.addSwaps(value);
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
proto.looprpc.ListStaticAddressSwapsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.ListStaticAddressSwapsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.ListStaticAddressSwapsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.ListStaticAddressSwapsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSwapsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      1,
      f,
      proto.looprpc.StaticAddressLoopInSwap.serializeBinaryToWriter
    );
  }
};


/**
 * repeated StaticAddressLoopInSwap swaps = 1;
 * @return {!Array<!proto.looprpc.StaticAddressLoopInSwap>}
 */
proto.looprpc.ListStaticAddressSwapsResponse.prototype.getSwapsList = function() {
  return /** @type{!Array<!proto.looprpc.StaticAddressLoopInSwap>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.looprpc.StaticAddressLoopInSwap, 1));
};


/**
 * @param {!Array<!proto.looprpc.StaticAddressLoopInSwap>} value
 * @return {!proto.looprpc.ListStaticAddressSwapsResponse} returns this
*/
proto.looprpc.ListStaticAddressSwapsResponse.prototype.setSwapsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 1, value);
};


/**
 * @param {!proto.looprpc.StaticAddressLoopInSwap=} opt_value
 * @param {number=} opt_index
 * @return {!proto.looprpc.StaticAddressLoopInSwap}
 */
proto.looprpc.ListStaticAddressSwapsResponse.prototype.addSwaps = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.looprpc.StaticAddressLoopInSwap, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.ListStaticAddressSwapsResponse} returns this
 */
proto.looprpc.ListStaticAddressSwapsResponse.prototype.clearSwapsList = function() {
  return this.setSwapsList([]);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.StaticAddressSummaryRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.StaticAddressSummaryRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.StaticAddressSummaryRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.StaticAddressSummaryRequest.toObject = function(includeInstance, msg) {
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
 * @return {!proto.looprpc.StaticAddressSummaryRequest}
 */
proto.looprpc.StaticAddressSummaryRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.StaticAddressSummaryRequest;
  return proto.looprpc.StaticAddressSummaryRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.StaticAddressSummaryRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.StaticAddressSummaryRequest}
 */
proto.looprpc.StaticAddressSummaryRequest.deserializeBinaryFromReader = function(msg, reader) {
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
proto.looprpc.StaticAddressSummaryRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.StaticAddressSummaryRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.StaticAddressSummaryRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.StaticAddressSummaryRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.StaticAddressSummaryResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.StaticAddressSummaryResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.StaticAddressSummaryResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.StaticAddressSummaryResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    staticAddress: jspb.Message.getFieldWithDefault(msg, 1, ""),
    relativeExpiryBlocks: jspb.Message.getFieldWithDefault(msg, 2, "0"),
    totalNumDeposits: jspb.Message.getFieldWithDefault(msg, 3, 0),
    valueUnconfirmedSatoshis: jspb.Message.getFieldWithDefault(msg, 4, "0"),
    valueDepositedSatoshis: jspb.Message.getFieldWithDefault(msg, 5, "0"),
    valueExpiredSatoshis: jspb.Message.getFieldWithDefault(msg, 6, "0"),
    valueWithdrawnSatoshis: jspb.Message.getFieldWithDefault(msg, 7, "0"),
    valueLoopedInSatoshis: jspb.Message.getFieldWithDefault(msg, 8, "0"),
    valueHtlcTimeoutSweepsSatoshis: jspb.Message.getFieldWithDefault(msg, 9, "0")
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
 * @return {!proto.looprpc.StaticAddressSummaryResponse}
 */
proto.looprpc.StaticAddressSummaryResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.StaticAddressSummaryResponse;
  return proto.looprpc.StaticAddressSummaryResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.StaticAddressSummaryResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.StaticAddressSummaryResponse}
 */
proto.looprpc.StaticAddressSummaryResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setStaticAddress(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setRelativeExpiryBlocks(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setTotalNumDeposits(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setValueUnconfirmedSatoshis(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setValueDepositedSatoshis(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setValueExpiredSatoshis(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setValueWithdrawnSatoshis(value);
      break;
    case 8:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setValueLoopedInSatoshis(value);
      break;
    case 9:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setValueHtlcTimeoutSweepsSatoshis(value);
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
proto.looprpc.StaticAddressSummaryResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.StaticAddressSummaryResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.StaticAddressSummaryResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.StaticAddressSummaryResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getStaticAddress();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getRelativeExpiryBlocks();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      2,
      f
    );
  }
  f = message.getTotalNumDeposits();
  if (f !== 0) {
    writer.writeUint32(
      3,
      f
    );
  }
  f = message.getValueUnconfirmedSatoshis();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      4,
      f
    );
  }
  f = message.getValueDepositedSatoshis();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      5,
      f
    );
  }
  f = message.getValueExpiredSatoshis();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      6,
      f
    );
  }
  f = message.getValueWithdrawnSatoshis();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      7,
      f
    );
  }
  f = message.getValueLoopedInSatoshis();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      8,
      f
    );
  }
  f = message.getValueHtlcTimeoutSweepsSatoshis();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      9,
      f
    );
  }
};


/**
 * optional string static_address = 1;
 * @return {string}
 */
proto.looprpc.StaticAddressSummaryResponse.prototype.getStaticAddress = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.StaticAddressSummaryResponse} returns this
 */
proto.looprpc.StaticAddressSummaryResponse.prototype.setStaticAddress = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional uint64 relative_expiry_blocks = 2;
 * @return {string}
 */
proto.looprpc.StaticAddressSummaryResponse.prototype.getRelativeExpiryBlocks = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.StaticAddressSummaryResponse} returns this
 */
proto.looprpc.StaticAddressSummaryResponse.prototype.setRelativeExpiryBlocks = function(value) {
  return jspb.Message.setProto3StringIntField(this, 2, value);
};


/**
 * optional uint32 total_num_deposits = 3;
 * @return {number}
 */
proto.looprpc.StaticAddressSummaryResponse.prototype.getTotalNumDeposits = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.StaticAddressSummaryResponse} returns this
 */
proto.looprpc.StaticAddressSummaryResponse.prototype.setTotalNumDeposits = function(value) {
  return jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional int64 value_unconfirmed_satoshis = 4;
 * @return {string}
 */
proto.looprpc.StaticAddressSummaryResponse.prototype.getValueUnconfirmedSatoshis = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.StaticAddressSummaryResponse} returns this
 */
proto.looprpc.StaticAddressSummaryResponse.prototype.setValueUnconfirmedSatoshis = function(value) {
  return jspb.Message.setProto3StringIntField(this, 4, value);
};


/**
 * optional int64 value_deposited_satoshis = 5;
 * @return {string}
 */
proto.looprpc.StaticAddressSummaryResponse.prototype.getValueDepositedSatoshis = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.StaticAddressSummaryResponse} returns this
 */
proto.looprpc.StaticAddressSummaryResponse.prototype.setValueDepositedSatoshis = function(value) {
  return jspb.Message.setProto3StringIntField(this, 5, value);
};


/**
 * optional int64 value_expired_satoshis = 6;
 * @return {string}
 */
proto.looprpc.StaticAddressSummaryResponse.prototype.getValueExpiredSatoshis = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.StaticAddressSummaryResponse} returns this
 */
proto.looprpc.StaticAddressSummaryResponse.prototype.setValueExpiredSatoshis = function(value) {
  return jspb.Message.setProto3StringIntField(this, 6, value);
};


/**
 * optional int64 value_withdrawn_satoshis = 7;
 * @return {string}
 */
proto.looprpc.StaticAddressSummaryResponse.prototype.getValueWithdrawnSatoshis = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.StaticAddressSummaryResponse} returns this
 */
proto.looprpc.StaticAddressSummaryResponse.prototype.setValueWithdrawnSatoshis = function(value) {
  return jspb.Message.setProto3StringIntField(this, 7, value);
};


/**
 * optional int64 value_looped_in_satoshis = 8;
 * @return {string}
 */
proto.looprpc.StaticAddressSummaryResponse.prototype.getValueLoopedInSatoshis = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 8, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.StaticAddressSummaryResponse} returns this
 */
proto.looprpc.StaticAddressSummaryResponse.prototype.setValueLoopedInSatoshis = function(value) {
  return jspb.Message.setProto3StringIntField(this, 8, value);
};


/**
 * optional int64 value_htlc_timeout_sweeps_satoshis = 9;
 * @return {string}
 */
proto.looprpc.StaticAddressSummaryResponse.prototype.getValueHtlcTimeoutSweepsSatoshis = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 9, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.StaticAddressSummaryResponse} returns this
 */
proto.looprpc.StaticAddressSummaryResponse.prototype.setValueHtlcTimeoutSweepsSatoshis = function(value) {
  return jspb.Message.setProto3StringIntField(this, 9, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.Deposit.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.Deposit.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.Deposit} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.Deposit.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: msg.getId_asB64(),
    state: jspb.Message.getFieldWithDefault(msg, 2, 0),
    outpoint: jspb.Message.getFieldWithDefault(msg, 3, ""),
    value: jspb.Message.getFieldWithDefault(msg, 4, "0"),
    confirmationHeight: jspb.Message.getFieldWithDefault(msg, 5, "0"),
    blocksUntilExpiry: jspb.Message.getFieldWithDefault(msg, 6, "0"),
    swapHash: msg.getSwapHash_asB64()
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
 * @return {!proto.looprpc.Deposit}
 */
proto.looprpc.Deposit.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.Deposit;
  return proto.looprpc.Deposit.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.Deposit} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.Deposit}
 */
proto.looprpc.Deposit.deserializeBinaryFromReader = function(msg, reader) {
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
      var value = /** @type {!proto.looprpc.DepositState} */ (reader.readEnum());
      msg.setState(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setOutpoint(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setValue(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setConfirmationHeight(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setBlocksUntilExpiry(value);
      break;
    case 7:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSwapHash(value);
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
proto.looprpc.Deposit.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.Deposit.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.Deposit} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.Deposit.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getState();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = message.getOutpoint();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getValue();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      4,
      f
    );
  }
  f = message.getConfirmationHeight();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      5,
      f
    );
  }
  f = message.getBlocksUntilExpiry();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      6,
      f
    );
  }
  f = message.getSwapHash_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      7,
      f
    );
  }
};


/**
 * optional bytes id = 1;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.Deposit.prototype.getId = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes id = 1;
 * This is a type-conversion wrapper around `getId()`
 * @return {string}
 */
proto.looprpc.Deposit.prototype.getId_asB64 = function() {
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
proto.looprpc.Deposit.prototype.getId_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getId()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.Deposit} returns this
 */
proto.looprpc.Deposit.prototype.setId = function(value) {
  return jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional DepositState state = 2;
 * @return {!proto.looprpc.DepositState}
 */
proto.looprpc.Deposit.prototype.getState = function() {
  return /** @type {!proto.looprpc.DepositState} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.looprpc.DepositState} value
 * @return {!proto.looprpc.Deposit} returns this
 */
proto.looprpc.Deposit.prototype.setState = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional string outpoint = 3;
 * @return {string}
 */
proto.looprpc.Deposit.prototype.getOutpoint = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.Deposit} returns this
 */
proto.looprpc.Deposit.prototype.setOutpoint = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional int64 value = 4;
 * @return {string}
 */
proto.looprpc.Deposit.prototype.getValue = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.Deposit} returns this
 */
proto.looprpc.Deposit.prototype.setValue = function(value) {
  return jspb.Message.setProto3StringIntField(this, 4, value);
};


/**
 * optional int64 confirmation_height = 5;
 * @return {string}
 */
proto.looprpc.Deposit.prototype.getConfirmationHeight = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.Deposit} returns this
 */
proto.looprpc.Deposit.prototype.setConfirmationHeight = function(value) {
  return jspb.Message.setProto3StringIntField(this, 5, value);
};


/**
 * optional int64 blocks_until_expiry = 6;
 * @return {string}
 */
proto.looprpc.Deposit.prototype.getBlocksUntilExpiry = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.Deposit} returns this
 */
proto.looprpc.Deposit.prototype.setBlocksUntilExpiry = function(value) {
  return jspb.Message.setProto3StringIntField(this, 6, value);
};


/**
 * optional bytes swap_hash = 7;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.Deposit.prototype.getSwapHash = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 7, ""));
};


/**
 * optional bytes swap_hash = 7;
 * This is a type-conversion wrapper around `getSwapHash()`
 * @return {string}
 */
proto.looprpc.Deposit.prototype.getSwapHash_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSwapHash()));
};


/**
 * optional bytes swap_hash = 7;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSwapHash()`
 * @return {!Uint8Array}
 */
proto.looprpc.Deposit.prototype.getSwapHash_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSwapHash()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.Deposit} returns this
 */
proto.looprpc.Deposit.prototype.setSwapHash = function(value) {
  return jspb.Message.setProto3BytesField(this, 7, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.looprpc.StaticAddressWithdrawal.repeatedFields_ = [2];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.StaticAddressWithdrawal.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.StaticAddressWithdrawal.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.StaticAddressWithdrawal} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.StaticAddressWithdrawal.toObject = function(includeInstance, msg) {
  var f, obj = {
    txId: jspb.Message.getFieldWithDefault(msg, 1, ""),
    depositsList: jspb.Message.toObjectList(msg.getDepositsList(),
    proto.looprpc.Deposit.toObject, includeInstance),
    totalDepositAmountSatoshis: jspb.Message.getFieldWithDefault(msg, 3, "0"),
    withdrawnAmountSatoshis: jspb.Message.getFieldWithDefault(msg, 4, "0"),
    changeAmountSatoshis: jspb.Message.getFieldWithDefault(msg, 5, "0"),
    confirmationHeight: jspb.Message.getFieldWithDefault(msg, 6, 0)
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
 * @return {!proto.looprpc.StaticAddressWithdrawal}
 */
proto.looprpc.StaticAddressWithdrawal.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.StaticAddressWithdrawal;
  return proto.looprpc.StaticAddressWithdrawal.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.StaticAddressWithdrawal} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.StaticAddressWithdrawal}
 */
proto.looprpc.StaticAddressWithdrawal.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setTxId(value);
      break;
    case 2:
      var value = new proto.looprpc.Deposit;
      reader.readMessage(value,proto.looprpc.Deposit.deserializeBinaryFromReader);
      msg.addDeposits(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setTotalDepositAmountSatoshis(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setWithdrawnAmountSatoshis(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setChangeAmountSatoshis(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setConfirmationHeight(value);
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
proto.looprpc.StaticAddressWithdrawal.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.StaticAddressWithdrawal.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.StaticAddressWithdrawal} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.StaticAddressWithdrawal.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTxId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getDepositsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      proto.looprpc.Deposit.serializeBinaryToWriter
    );
  }
  f = message.getTotalDepositAmountSatoshis();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      3,
      f
    );
  }
  f = message.getWithdrawnAmountSatoshis();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      4,
      f
    );
  }
  f = message.getChangeAmountSatoshis();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      5,
      f
    );
  }
  f = message.getConfirmationHeight();
  if (f !== 0) {
    writer.writeUint32(
      6,
      f
    );
  }
};


/**
 * optional string tx_id = 1;
 * @return {string}
 */
proto.looprpc.StaticAddressWithdrawal.prototype.getTxId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.StaticAddressWithdrawal} returns this
 */
proto.looprpc.StaticAddressWithdrawal.prototype.setTxId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * repeated Deposit deposits = 2;
 * @return {!Array<!proto.looprpc.Deposit>}
 */
proto.looprpc.StaticAddressWithdrawal.prototype.getDepositsList = function() {
  return /** @type{!Array<!proto.looprpc.Deposit>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.looprpc.Deposit, 2));
};


/**
 * @param {!Array<!proto.looprpc.Deposit>} value
 * @return {!proto.looprpc.StaticAddressWithdrawal} returns this
*/
proto.looprpc.StaticAddressWithdrawal.prototype.setDepositsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.looprpc.Deposit=} opt_value
 * @param {number=} opt_index
 * @return {!proto.looprpc.Deposit}
 */
proto.looprpc.StaticAddressWithdrawal.prototype.addDeposits = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.looprpc.Deposit, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.StaticAddressWithdrawal} returns this
 */
proto.looprpc.StaticAddressWithdrawal.prototype.clearDepositsList = function() {
  return this.setDepositsList([]);
};


/**
 * optional int64 total_deposit_amount_satoshis = 3;
 * @return {string}
 */
proto.looprpc.StaticAddressWithdrawal.prototype.getTotalDepositAmountSatoshis = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.StaticAddressWithdrawal} returns this
 */
proto.looprpc.StaticAddressWithdrawal.prototype.setTotalDepositAmountSatoshis = function(value) {
  return jspb.Message.setProto3StringIntField(this, 3, value);
};


/**
 * optional int64 withdrawn_amount_satoshis = 4;
 * @return {string}
 */
proto.looprpc.StaticAddressWithdrawal.prototype.getWithdrawnAmountSatoshis = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.StaticAddressWithdrawal} returns this
 */
proto.looprpc.StaticAddressWithdrawal.prototype.setWithdrawnAmountSatoshis = function(value) {
  return jspb.Message.setProto3StringIntField(this, 4, value);
};


/**
 * optional int64 change_amount_satoshis = 5;
 * @return {string}
 */
proto.looprpc.StaticAddressWithdrawal.prototype.getChangeAmountSatoshis = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.StaticAddressWithdrawal} returns this
 */
proto.looprpc.StaticAddressWithdrawal.prototype.setChangeAmountSatoshis = function(value) {
  return jspb.Message.setProto3StringIntField(this, 5, value);
};


/**
 * optional uint32 confirmation_height = 6;
 * @return {number}
 */
proto.looprpc.StaticAddressWithdrawal.prototype.getConfirmationHeight = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.StaticAddressWithdrawal} returns this
 */
proto.looprpc.StaticAddressWithdrawal.prototype.setConfirmationHeight = function(value) {
  return jspb.Message.setProto3IntField(this, 6, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.looprpc.StaticAddressLoopInSwap.repeatedFields_ = [2,6];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.StaticAddressLoopInSwap.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.StaticAddressLoopInSwap.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.StaticAddressLoopInSwap} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.StaticAddressLoopInSwap.toObject = function(includeInstance, msg) {
  var f, obj = {
    swapHash: msg.getSwapHash_asB64(),
    depositOutpointsList: (f = jspb.Message.getRepeatedField(msg, 2)) == null ? undefined : f,
    state: jspb.Message.getFieldWithDefault(msg, 3, 0),
    swapAmountSatoshis: jspb.Message.getFieldWithDefault(msg, 4, "0"),
    paymentRequestAmountSatoshis: jspb.Message.getFieldWithDefault(msg, 5, "0"),
    depositsList: jspb.Message.toObjectList(msg.getDepositsList(),
    proto.looprpc.Deposit.toObject, includeInstance)
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
 * @return {!proto.looprpc.StaticAddressLoopInSwap}
 */
proto.looprpc.StaticAddressLoopInSwap.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.StaticAddressLoopInSwap;
  return proto.looprpc.StaticAddressLoopInSwap.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.StaticAddressLoopInSwap} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.StaticAddressLoopInSwap}
 */
proto.looprpc.StaticAddressLoopInSwap.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSwapHash(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.addDepositOutpoints(value);
      break;
    case 3:
      var value = /** @type {!proto.looprpc.StaticAddressLoopInSwapState} */ (reader.readEnum());
      msg.setState(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setSwapAmountSatoshis(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setPaymentRequestAmountSatoshis(value);
      break;
    case 6:
      var value = new proto.looprpc.Deposit;
      reader.readMessage(value,proto.looprpc.Deposit.deserializeBinaryFromReader);
      msg.addDeposits(value);
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
proto.looprpc.StaticAddressLoopInSwap.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.StaticAddressLoopInSwap.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.StaticAddressLoopInSwap} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.StaticAddressLoopInSwap.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSwapHash_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getDepositOutpointsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      2,
      f
    );
  }
  f = message.getState();
  if (f !== 0.0) {
    writer.writeEnum(
      3,
      f
    );
  }
  f = message.getSwapAmountSatoshis();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      4,
      f
    );
  }
  f = message.getPaymentRequestAmountSatoshis();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      5,
      f
    );
  }
  f = message.getDepositsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      6,
      f,
      proto.looprpc.Deposit.serializeBinaryToWriter
    );
  }
};


/**
 * optional bytes swap_hash = 1;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.StaticAddressLoopInSwap.prototype.getSwapHash = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes swap_hash = 1;
 * This is a type-conversion wrapper around `getSwapHash()`
 * @return {string}
 */
proto.looprpc.StaticAddressLoopInSwap.prototype.getSwapHash_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSwapHash()));
};


/**
 * optional bytes swap_hash = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSwapHash()`
 * @return {!Uint8Array}
 */
proto.looprpc.StaticAddressLoopInSwap.prototype.getSwapHash_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSwapHash()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.StaticAddressLoopInSwap} returns this
 */
proto.looprpc.StaticAddressLoopInSwap.prototype.setSwapHash = function(value) {
  return jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * repeated string deposit_outpoints = 2;
 * @return {!Array<string>}
 */
proto.looprpc.StaticAddressLoopInSwap.prototype.getDepositOutpointsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 2));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.looprpc.StaticAddressLoopInSwap} returns this
 */
proto.looprpc.StaticAddressLoopInSwap.prototype.setDepositOutpointsList = function(value) {
  return jspb.Message.setField(this, 2, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.looprpc.StaticAddressLoopInSwap} returns this
 */
proto.looprpc.StaticAddressLoopInSwap.prototype.addDepositOutpoints = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 2, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.StaticAddressLoopInSwap} returns this
 */
proto.looprpc.StaticAddressLoopInSwap.prototype.clearDepositOutpointsList = function() {
  return this.setDepositOutpointsList([]);
};


/**
 * optional StaticAddressLoopInSwapState state = 3;
 * @return {!proto.looprpc.StaticAddressLoopInSwapState}
 */
proto.looprpc.StaticAddressLoopInSwap.prototype.getState = function() {
  return /** @type {!proto.looprpc.StaticAddressLoopInSwapState} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {!proto.looprpc.StaticAddressLoopInSwapState} value
 * @return {!proto.looprpc.StaticAddressLoopInSwap} returns this
 */
proto.looprpc.StaticAddressLoopInSwap.prototype.setState = function(value) {
  return jspb.Message.setProto3EnumField(this, 3, value);
};


/**
 * optional int64 swap_amount_satoshis = 4;
 * @return {string}
 */
proto.looprpc.StaticAddressLoopInSwap.prototype.getSwapAmountSatoshis = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.StaticAddressLoopInSwap} returns this
 */
proto.looprpc.StaticAddressLoopInSwap.prototype.setSwapAmountSatoshis = function(value) {
  return jspb.Message.setProto3StringIntField(this, 4, value);
};


/**
 * optional int64 payment_request_amount_satoshis = 5;
 * @return {string}
 */
proto.looprpc.StaticAddressLoopInSwap.prototype.getPaymentRequestAmountSatoshis = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.StaticAddressLoopInSwap} returns this
 */
proto.looprpc.StaticAddressLoopInSwap.prototype.setPaymentRequestAmountSatoshis = function(value) {
  return jspb.Message.setProto3StringIntField(this, 5, value);
};


/**
 * repeated Deposit deposits = 6;
 * @return {!Array<!proto.looprpc.Deposit>}
 */
proto.looprpc.StaticAddressLoopInSwap.prototype.getDepositsList = function() {
  return /** @type{!Array<!proto.looprpc.Deposit>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.looprpc.Deposit, 6));
};


/**
 * @param {!Array<!proto.looprpc.Deposit>} value
 * @return {!proto.looprpc.StaticAddressLoopInSwap} returns this
*/
proto.looprpc.StaticAddressLoopInSwap.prototype.setDepositsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 6, value);
};


/**
 * @param {!proto.looprpc.Deposit=} opt_value
 * @param {number=} opt_index
 * @return {!proto.looprpc.Deposit}
 */
proto.looprpc.StaticAddressLoopInSwap.prototype.addDeposits = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 6, opt_value, proto.looprpc.Deposit, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.StaticAddressLoopInSwap} returns this
 */
proto.looprpc.StaticAddressLoopInSwap.prototype.clearDepositsList = function() {
  return this.setDepositsList([]);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.looprpc.StaticAddressLoopInRequest.repeatedFields_ = [1,6];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.StaticAddressLoopInRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.StaticAddressLoopInRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.StaticAddressLoopInRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.StaticAddressLoopInRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    outpointsList: (f = jspb.Message.getRepeatedField(msg, 1)) == null ? undefined : f,
    maxSwapFeeSatoshis: jspb.Message.getFieldWithDefault(msg, 2, "0"),
    lastHop: msg.getLastHop_asB64(),
    label: jspb.Message.getFieldWithDefault(msg, 4, ""),
    initiator: jspb.Message.getFieldWithDefault(msg, 5, ""),
    routeHintsList: jspb.Message.toObjectList(msg.getRouteHintsList(),
    swapserverrpc_common_pb.RouteHint.toObject, includeInstance),
    pb_private: jspb.Message.getBooleanFieldWithDefault(msg, 7, false),
    paymentTimeoutSeconds: jspb.Message.getFieldWithDefault(msg, 8, 0),
    amount: jspb.Message.getFieldWithDefault(msg, 9, "0")
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
 * @return {!proto.looprpc.StaticAddressLoopInRequest}
 */
proto.looprpc.StaticAddressLoopInRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.StaticAddressLoopInRequest;
  return proto.looprpc.StaticAddressLoopInRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.StaticAddressLoopInRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.StaticAddressLoopInRequest}
 */
proto.looprpc.StaticAddressLoopInRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.addOutpoints(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setMaxSwapFeeSatoshis(value);
      break;
    case 3:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setLastHop(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setLabel(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setInitiator(value);
      break;
    case 6:
      var value = new swapserverrpc_common_pb.RouteHint;
      reader.readMessage(value,swapserverrpc_common_pb.RouteHint.deserializeBinaryFromReader);
      msg.addRouteHints(value);
      break;
    case 7:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setPrivate(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setPaymentTimeoutSeconds(value);
      break;
    case 9:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setAmount(value);
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
proto.looprpc.StaticAddressLoopInRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.StaticAddressLoopInRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.StaticAddressLoopInRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.StaticAddressLoopInRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getOutpointsList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      1,
      f
    );
  }
  f = message.getMaxSwapFeeSatoshis();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      2,
      f
    );
  }
  f = message.getLastHop_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      3,
      f
    );
  }
  f = message.getLabel();
  if (f.length > 0) {
    writer.writeString(
      4,
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
  f = message.getRouteHintsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      6,
      f,
      swapserverrpc_common_pb.RouteHint.serializeBinaryToWriter
    );
  }
  f = message.getPrivate();
  if (f) {
    writer.writeBool(
      7,
      f
    );
  }
  f = message.getPaymentTimeoutSeconds();
  if (f !== 0) {
    writer.writeUint32(
      8,
      f
    );
  }
  f = message.getAmount();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      9,
      f
    );
  }
};


/**
 * repeated string outpoints = 1;
 * @return {!Array<string>}
 */
proto.looprpc.StaticAddressLoopInRequest.prototype.getOutpointsList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 1));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.looprpc.StaticAddressLoopInRequest} returns this
 */
proto.looprpc.StaticAddressLoopInRequest.prototype.setOutpointsList = function(value) {
  return jspb.Message.setField(this, 1, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.looprpc.StaticAddressLoopInRequest} returns this
 */
proto.looprpc.StaticAddressLoopInRequest.prototype.addOutpoints = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 1, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.StaticAddressLoopInRequest} returns this
 */
proto.looprpc.StaticAddressLoopInRequest.prototype.clearOutpointsList = function() {
  return this.setOutpointsList([]);
};


/**
 * optional int64 max_swap_fee_satoshis = 2;
 * @return {string}
 */
proto.looprpc.StaticAddressLoopInRequest.prototype.getMaxSwapFeeSatoshis = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.StaticAddressLoopInRequest} returns this
 */
proto.looprpc.StaticAddressLoopInRequest.prototype.setMaxSwapFeeSatoshis = function(value) {
  return jspb.Message.setProto3StringIntField(this, 2, value);
};


/**
 * optional bytes last_hop = 3;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.StaticAddressLoopInRequest.prototype.getLastHop = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * optional bytes last_hop = 3;
 * This is a type-conversion wrapper around `getLastHop()`
 * @return {string}
 */
proto.looprpc.StaticAddressLoopInRequest.prototype.getLastHop_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getLastHop()));
};


/**
 * optional bytes last_hop = 3;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getLastHop()`
 * @return {!Uint8Array}
 */
proto.looprpc.StaticAddressLoopInRequest.prototype.getLastHop_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getLastHop()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.StaticAddressLoopInRequest} returns this
 */
proto.looprpc.StaticAddressLoopInRequest.prototype.setLastHop = function(value) {
  return jspb.Message.setProto3BytesField(this, 3, value);
};


/**
 * optional string label = 4;
 * @return {string}
 */
proto.looprpc.StaticAddressLoopInRequest.prototype.getLabel = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.StaticAddressLoopInRequest} returns this
 */
proto.looprpc.StaticAddressLoopInRequest.prototype.setLabel = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional string initiator = 5;
 * @return {string}
 */
proto.looprpc.StaticAddressLoopInRequest.prototype.getInitiator = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.StaticAddressLoopInRequest} returns this
 */
proto.looprpc.StaticAddressLoopInRequest.prototype.setInitiator = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};


/**
 * repeated RouteHint route_hints = 6;
 * @return {!Array<!proto.looprpc.RouteHint>}
 */
proto.looprpc.StaticAddressLoopInRequest.prototype.getRouteHintsList = function() {
  return /** @type{!Array<!proto.looprpc.RouteHint>} */ (
    jspb.Message.getRepeatedWrapperField(this, swapserverrpc_common_pb.RouteHint, 6));
};


/**
 * @param {!Array<!proto.looprpc.RouteHint>} value
 * @return {!proto.looprpc.StaticAddressLoopInRequest} returns this
*/
proto.looprpc.StaticAddressLoopInRequest.prototype.setRouteHintsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 6, value);
};


/**
 * @param {!proto.looprpc.RouteHint=} opt_value
 * @param {number=} opt_index
 * @return {!proto.looprpc.RouteHint}
 */
proto.looprpc.StaticAddressLoopInRequest.prototype.addRouteHints = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 6, opt_value, proto.looprpc.RouteHint, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.looprpc.StaticAddressLoopInRequest} returns this
 */
proto.looprpc.StaticAddressLoopInRequest.prototype.clearRouteHintsList = function() {
  return this.setRouteHintsList([]);
};


/**
 * optional bool private = 7;
 * @return {boolean}
 */
proto.looprpc.StaticAddressLoopInRequest.prototype.getPrivate = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 7, false));
};


/**
 * @param {boolean} value
 * @return {!proto.looprpc.StaticAddressLoopInRequest} returns this
 */
proto.looprpc.StaticAddressLoopInRequest.prototype.setPrivate = function(value) {
  return jspb.Message.setProto3BooleanField(this, 7, value);
};


/**
 * optional uint32 payment_timeout_seconds = 8;
 * @return {number}
 */
proto.looprpc.StaticAddressLoopInRequest.prototype.getPaymentTimeoutSeconds = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 8, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.StaticAddressLoopInRequest} returns this
 */
proto.looprpc.StaticAddressLoopInRequest.prototype.setPaymentTimeoutSeconds = function(value) {
  return jspb.Message.setProto3IntField(this, 8, value);
};


/**
 * optional int64 amount = 9;
 * @return {string}
 */
proto.looprpc.StaticAddressLoopInRequest.prototype.getAmount = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 9, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.StaticAddressLoopInRequest} returns this
 */
proto.looprpc.StaticAddressLoopInRequest.prototype.setAmount = function(value) {
  return jspb.Message.setProto3StringIntField(this, 9, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.StaticAddressLoopInResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.StaticAddressLoopInResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.StaticAddressLoopInResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.StaticAddressLoopInResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
    swapHash: msg.getSwapHash_asB64(),
    state: jspb.Message.getFieldWithDefault(msg, 2, ""),
    amount: jspb.Message.getFieldWithDefault(msg, 3, "0"),
    htlcCltv: jspb.Message.getFieldWithDefault(msg, 4, 0),
    quotedSwapFeeSatoshis: jspb.Message.getFieldWithDefault(msg, 5, "0"),
    maxSwapFeeSatoshis: jspb.Message.getFieldWithDefault(msg, 6, "0"),
    initiationHeight: jspb.Message.getFieldWithDefault(msg, 7, 0),
    protocolVersion: jspb.Message.getFieldWithDefault(msg, 8, ""),
    label: jspb.Message.getFieldWithDefault(msg, 9, ""),
    initiator: jspb.Message.getFieldWithDefault(msg, 10, ""),
    paymentTimeoutSeconds: jspb.Message.getFieldWithDefault(msg, 11, 0)
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
 * @return {!proto.looprpc.StaticAddressLoopInResponse}
 */
proto.looprpc.StaticAddressLoopInResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.StaticAddressLoopInResponse;
  return proto.looprpc.StaticAddressLoopInResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.StaticAddressLoopInResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.StaticAddressLoopInResponse}
 */
proto.looprpc.StaticAddressLoopInResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSwapHash(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setState(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setAmount(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setHtlcCltv(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setQuotedSwapFeeSatoshis(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setMaxSwapFeeSatoshis(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setInitiationHeight(value);
      break;
    case 8:
      var value = /** @type {string} */ (reader.readString());
      msg.setProtocolVersion(value);
      break;
    case 9:
      var value = /** @type {string} */ (reader.readString());
      msg.setLabel(value);
      break;
    case 10:
      var value = /** @type {string} */ (reader.readString());
      msg.setInitiator(value);
      break;
    case 11:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setPaymentTimeoutSeconds(value);
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
proto.looprpc.StaticAddressLoopInResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.StaticAddressLoopInResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.StaticAddressLoopInResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.StaticAddressLoopInResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSwapHash_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getState();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getAmount();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      3,
      f
    );
  }
  f = message.getHtlcCltv();
  if (f !== 0) {
    writer.writeInt32(
      4,
      f
    );
  }
  f = message.getQuotedSwapFeeSatoshis();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      5,
      f
    );
  }
  f = message.getMaxSwapFeeSatoshis();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      6,
      f
    );
  }
  f = message.getInitiationHeight();
  if (f !== 0) {
    writer.writeUint32(
      7,
      f
    );
  }
  f = message.getProtocolVersion();
  if (f.length > 0) {
    writer.writeString(
      8,
      f
    );
  }
  f = message.getLabel();
  if (f.length > 0) {
    writer.writeString(
      9,
      f
    );
  }
  f = message.getInitiator();
  if (f.length > 0) {
    writer.writeString(
      10,
      f
    );
  }
  f = message.getPaymentTimeoutSeconds();
  if (f !== 0) {
    writer.writeUint32(
      11,
      f
    );
  }
};


/**
 * optional bytes swap_hash = 1;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.StaticAddressLoopInResponse.prototype.getSwapHash = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes swap_hash = 1;
 * This is a type-conversion wrapper around `getSwapHash()`
 * @return {string}
 */
proto.looprpc.StaticAddressLoopInResponse.prototype.getSwapHash_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSwapHash()));
};


/**
 * optional bytes swap_hash = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSwapHash()`
 * @return {!Uint8Array}
 */
proto.looprpc.StaticAddressLoopInResponse.prototype.getSwapHash_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSwapHash()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.StaticAddressLoopInResponse} returns this
 */
proto.looprpc.StaticAddressLoopInResponse.prototype.setSwapHash = function(value) {
  return jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional string state = 2;
 * @return {string}
 */
proto.looprpc.StaticAddressLoopInResponse.prototype.getState = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.StaticAddressLoopInResponse} returns this
 */
proto.looprpc.StaticAddressLoopInResponse.prototype.setState = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional uint64 amount = 3;
 * @return {string}
 */
proto.looprpc.StaticAddressLoopInResponse.prototype.getAmount = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.StaticAddressLoopInResponse} returns this
 */
proto.looprpc.StaticAddressLoopInResponse.prototype.setAmount = function(value) {
  return jspb.Message.setProto3StringIntField(this, 3, value);
};


/**
 * optional int32 htlc_cltv = 4;
 * @return {number}
 */
proto.looprpc.StaticAddressLoopInResponse.prototype.getHtlcCltv = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.StaticAddressLoopInResponse} returns this
 */
proto.looprpc.StaticAddressLoopInResponse.prototype.setHtlcCltv = function(value) {
  return jspb.Message.setProto3IntField(this, 4, value);
};


/**
 * optional int64 quoted_swap_fee_satoshis = 5;
 * @return {string}
 */
proto.looprpc.StaticAddressLoopInResponse.prototype.getQuotedSwapFeeSatoshis = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.StaticAddressLoopInResponse} returns this
 */
proto.looprpc.StaticAddressLoopInResponse.prototype.setQuotedSwapFeeSatoshis = function(value) {
  return jspb.Message.setProto3StringIntField(this, 5, value);
};


/**
 * optional int64 max_swap_fee_satoshis = 6;
 * @return {string}
 */
proto.looprpc.StaticAddressLoopInResponse.prototype.getMaxSwapFeeSatoshis = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.StaticAddressLoopInResponse} returns this
 */
proto.looprpc.StaticAddressLoopInResponse.prototype.setMaxSwapFeeSatoshis = function(value) {
  return jspb.Message.setProto3StringIntField(this, 6, value);
};


/**
 * optional uint32 initiation_height = 7;
 * @return {number}
 */
proto.looprpc.StaticAddressLoopInResponse.prototype.getInitiationHeight = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.StaticAddressLoopInResponse} returns this
 */
proto.looprpc.StaticAddressLoopInResponse.prototype.setInitiationHeight = function(value) {
  return jspb.Message.setProto3IntField(this, 7, value);
};


/**
 * optional string protocol_version = 8;
 * @return {string}
 */
proto.looprpc.StaticAddressLoopInResponse.prototype.getProtocolVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 8, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.StaticAddressLoopInResponse} returns this
 */
proto.looprpc.StaticAddressLoopInResponse.prototype.setProtocolVersion = function(value) {
  return jspb.Message.setProto3StringField(this, 8, value);
};


/**
 * optional string label = 9;
 * @return {string}
 */
proto.looprpc.StaticAddressLoopInResponse.prototype.getLabel = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 9, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.StaticAddressLoopInResponse} returns this
 */
proto.looprpc.StaticAddressLoopInResponse.prototype.setLabel = function(value) {
  return jspb.Message.setProto3StringField(this, 9, value);
};


/**
 * optional string initiator = 10;
 * @return {string}
 */
proto.looprpc.StaticAddressLoopInResponse.prototype.getInitiator = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 10, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.StaticAddressLoopInResponse} returns this
 */
proto.looprpc.StaticAddressLoopInResponse.prototype.setInitiator = function(value) {
  return jspb.Message.setProto3StringField(this, 10, value);
};


/**
 * optional uint32 payment_timeout_seconds = 11;
 * @return {number}
 */
proto.looprpc.StaticAddressLoopInResponse.prototype.getPaymentTimeoutSeconds = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 11, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.StaticAddressLoopInResponse} returns this
 */
proto.looprpc.StaticAddressLoopInResponse.prototype.setPaymentTimeoutSeconds = function(value) {
  return jspb.Message.setProto3IntField(this, 11, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.AssetLoopOutRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.AssetLoopOutRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.AssetLoopOutRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.AssetLoopOutRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    assetId: msg.getAssetId_asB64(),
    assetEdgeNode: msg.getAssetEdgeNode_asB64(),
    maxLimitMultiplier: jspb.Message.getFloatingPointFieldWithDefault(msg, 3, 0.0),
    expiry: jspb.Message.getFieldWithDefault(msg, 4, "0")
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
 * @return {!proto.looprpc.AssetLoopOutRequest}
 */
proto.looprpc.AssetLoopOutRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.AssetLoopOutRequest;
  return proto.looprpc.AssetLoopOutRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.AssetLoopOutRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.AssetLoopOutRequest}
 */
proto.looprpc.AssetLoopOutRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setAssetId(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setAssetEdgeNode(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setMaxLimitMultiplier(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readInt64String());
      msg.setExpiry(value);
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
proto.looprpc.AssetLoopOutRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.AssetLoopOutRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.AssetLoopOutRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.AssetLoopOutRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAssetId_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getAssetEdgeNode_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
  f = message.getMaxLimitMultiplier();
  if (f !== 0.0) {
    writer.writeDouble(
      3,
      f
    );
  }
  f = message.getExpiry();
  if (parseInt(f, 10) !== 0) {
    writer.writeInt64String(
      4,
      f
    );
  }
};


/**
 * optional bytes asset_id = 1;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.AssetLoopOutRequest.prototype.getAssetId = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes asset_id = 1;
 * This is a type-conversion wrapper around `getAssetId()`
 * @return {string}
 */
proto.looprpc.AssetLoopOutRequest.prototype.getAssetId_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getAssetId()));
};


/**
 * optional bytes asset_id = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getAssetId()`
 * @return {!Uint8Array}
 */
proto.looprpc.AssetLoopOutRequest.prototype.getAssetId_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getAssetId()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.AssetLoopOutRequest} returns this
 */
proto.looprpc.AssetLoopOutRequest.prototype.setAssetId = function(value) {
  return jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional bytes asset_edge_node = 2;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.AssetLoopOutRequest.prototype.getAssetEdgeNode = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes asset_edge_node = 2;
 * This is a type-conversion wrapper around `getAssetEdgeNode()`
 * @return {string}
 */
proto.looprpc.AssetLoopOutRequest.prototype.getAssetEdgeNode_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getAssetEdgeNode()));
};


/**
 * optional bytes asset_edge_node = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getAssetEdgeNode()`
 * @return {!Uint8Array}
 */
proto.looprpc.AssetLoopOutRequest.prototype.getAssetEdgeNode_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getAssetEdgeNode()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.AssetLoopOutRequest} returns this
 */
proto.looprpc.AssetLoopOutRequest.prototype.setAssetEdgeNode = function(value) {
  return jspb.Message.setProto3BytesField(this, 2, value);
};


/**
 * optional double max_limit_multiplier = 3;
 * @return {number}
 */
proto.looprpc.AssetLoopOutRequest.prototype.getMaxLimitMultiplier = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 3, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.AssetLoopOutRequest} returns this
 */
proto.looprpc.AssetLoopOutRequest.prototype.setMaxLimitMultiplier = function(value) {
  return jspb.Message.setProto3FloatField(this, 3, value);
};


/**
 * optional int64 expiry = 4;
 * @return {string}
 */
proto.looprpc.AssetLoopOutRequest.prototype.getExpiry = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.AssetLoopOutRequest} returns this
 */
proto.looprpc.AssetLoopOutRequest.prototype.setExpiry = function(value) {
  return jspb.Message.setProto3StringIntField(this, 4, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.AssetRfqInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.AssetRfqInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.AssetRfqInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.AssetRfqInfo.toObject = function(includeInstance, msg) {
  var f, obj = {
    prepayRfqId: msg.getPrepayRfqId_asB64(),
    maxPrepayAssetAmt: jspb.Message.getFieldWithDefault(msg, 2, "0"),
    prepayAssetRate: (f = msg.getPrepayAssetRate()) && proto.looprpc.FixedPoint.toObject(includeInstance, f),
    swapRfqId: msg.getSwapRfqId_asB64(),
    maxSwapAssetAmt: jspb.Message.getFieldWithDefault(msg, 4, "0"),
    swapAssetRate: (f = msg.getSwapAssetRate()) && proto.looprpc.FixedPoint.toObject(includeInstance, f),
    assetName: jspb.Message.getFieldWithDefault(msg, 5, "")
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
 * @return {!proto.looprpc.AssetRfqInfo}
 */
proto.looprpc.AssetRfqInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.AssetRfqInfo;
  return proto.looprpc.AssetRfqInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.AssetRfqInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.AssetRfqInfo}
 */
proto.looprpc.AssetRfqInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setPrepayRfqId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setMaxPrepayAssetAmt(value);
      break;
    case 6:
      var value = new proto.looprpc.FixedPoint;
      reader.readMessage(value,proto.looprpc.FixedPoint.deserializeBinaryFromReader);
      msg.setPrepayAssetRate(value);
      break;
    case 3:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSwapRfqId(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setMaxSwapAssetAmt(value);
      break;
    case 7:
      var value = new proto.looprpc.FixedPoint;
      reader.readMessage(value,proto.looprpc.FixedPoint.deserializeBinaryFromReader);
      msg.setSwapAssetRate(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setAssetName(value);
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
proto.looprpc.AssetRfqInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.AssetRfqInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.AssetRfqInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.AssetRfqInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPrepayRfqId_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getMaxPrepayAssetAmt();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      2,
      f
    );
  }
  f = message.getPrepayAssetRate();
  if (f != null) {
    writer.writeMessage(
      6,
      f,
      proto.looprpc.FixedPoint.serializeBinaryToWriter
    );
  }
  f = message.getSwapRfqId_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      3,
      f
    );
  }
  f = message.getMaxSwapAssetAmt();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      4,
      f
    );
  }
  f = message.getSwapAssetRate();
  if (f != null) {
    writer.writeMessage(
      7,
      f,
      proto.looprpc.FixedPoint.serializeBinaryToWriter
    );
  }
  f = message.getAssetName();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
};


/**
 * optional bytes prepay_rfq_id = 1;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.AssetRfqInfo.prototype.getPrepayRfqId = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes prepay_rfq_id = 1;
 * This is a type-conversion wrapper around `getPrepayRfqId()`
 * @return {string}
 */
proto.looprpc.AssetRfqInfo.prototype.getPrepayRfqId_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getPrepayRfqId()));
};


/**
 * optional bytes prepay_rfq_id = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getPrepayRfqId()`
 * @return {!Uint8Array}
 */
proto.looprpc.AssetRfqInfo.prototype.getPrepayRfqId_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getPrepayRfqId()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.AssetRfqInfo} returns this
 */
proto.looprpc.AssetRfqInfo.prototype.setPrepayRfqId = function(value) {
  return jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional uint64 max_prepay_asset_amt = 2;
 * @return {string}
 */
proto.looprpc.AssetRfqInfo.prototype.getMaxPrepayAssetAmt = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.AssetRfqInfo} returns this
 */
proto.looprpc.AssetRfqInfo.prototype.setMaxPrepayAssetAmt = function(value) {
  return jspb.Message.setProto3StringIntField(this, 2, value);
};


/**
 * optional FixedPoint prepay_asset_rate = 6;
 * @return {?proto.looprpc.FixedPoint}
 */
proto.looprpc.AssetRfqInfo.prototype.getPrepayAssetRate = function() {
  return /** @type{?proto.looprpc.FixedPoint} */ (
    jspb.Message.getWrapperField(this, proto.looprpc.FixedPoint, 6));
};


/**
 * @param {?proto.looprpc.FixedPoint|undefined} value
 * @return {!proto.looprpc.AssetRfqInfo} returns this
*/
proto.looprpc.AssetRfqInfo.prototype.setPrepayAssetRate = function(value) {
  return jspb.Message.setWrapperField(this, 6, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.looprpc.AssetRfqInfo} returns this
 */
proto.looprpc.AssetRfqInfo.prototype.clearPrepayAssetRate = function() {
  return this.setPrepayAssetRate(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.looprpc.AssetRfqInfo.prototype.hasPrepayAssetRate = function() {
  return jspb.Message.getField(this, 6) != null;
};


/**
 * optional bytes swap_rfq_id = 3;
 * @return {!(string|Uint8Array)}
 */
proto.looprpc.AssetRfqInfo.prototype.getSwapRfqId = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * optional bytes swap_rfq_id = 3;
 * This is a type-conversion wrapper around `getSwapRfqId()`
 * @return {string}
 */
proto.looprpc.AssetRfqInfo.prototype.getSwapRfqId_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSwapRfqId()));
};


/**
 * optional bytes swap_rfq_id = 3;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSwapRfqId()`
 * @return {!Uint8Array}
 */
proto.looprpc.AssetRfqInfo.prototype.getSwapRfqId_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSwapRfqId()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.looprpc.AssetRfqInfo} returns this
 */
proto.looprpc.AssetRfqInfo.prototype.setSwapRfqId = function(value) {
  return jspb.Message.setProto3BytesField(this, 3, value);
};


/**
 * optional uint64 max_swap_asset_amt = 4;
 * @return {string}
 */
proto.looprpc.AssetRfqInfo.prototype.getMaxSwapAssetAmt = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.AssetRfqInfo} returns this
 */
proto.looprpc.AssetRfqInfo.prototype.setMaxSwapAssetAmt = function(value) {
  return jspb.Message.setProto3StringIntField(this, 4, value);
};


/**
 * optional FixedPoint swap_asset_rate = 7;
 * @return {?proto.looprpc.FixedPoint}
 */
proto.looprpc.AssetRfqInfo.prototype.getSwapAssetRate = function() {
  return /** @type{?proto.looprpc.FixedPoint} */ (
    jspb.Message.getWrapperField(this, proto.looprpc.FixedPoint, 7));
};


/**
 * @param {?proto.looprpc.FixedPoint|undefined} value
 * @return {!proto.looprpc.AssetRfqInfo} returns this
*/
proto.looprpc.AssetRfqInfo.prototype.setSwapAssetRate = function(value) {
  return jspb.Message.setWrapperField(this, 7, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.looprpc.AssetRfqInfo} returns this
 */
proto.looprpc.AssetRfqInfo.prototype.clearSwapAssetRate = function() {
  return this.setSwapAssetRate(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.looprpc.AssetRfqInfo.prototype.hasSwapAssetRate = function() {
  return jspb.Message.getField(this, 7) != null;
};


/**
 * optional string asset_name = 5;
 * @return {string}
 */
proto.looprpc.AssetRfqInfo.prototype.getAssetName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.AssetRfqInfo} returns this
 */
proto.looprpc.AssetRfqInfo.prototype.setAssetName = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.FixedPoint.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.FixedPoint.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.FixedPoint} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.FixedPoint.toObject = function(includeInstance, msg) {
  var f, obj = {
    coefficient: jspb.Message.getFieldWithDefault(msg, 1, ""),
    scale: jspb.Message.getFieldWithDefault(msg, 2, 0)
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
 * @return {!proto.looprpc.FixedPoint}
 */
proto.looprpc.FixedPoint.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.FixedPoint;
  return proto.looprpc.FixedPoint.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.FixedPoint} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.FixedPoint}
 */
proto.looprpc.FixedPoint.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setCoefficient(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setScale(value);
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
proto.looprpc.FixedPoint.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.FixedPoint.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.FixedPoint} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.FixedPoint.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getCoefficient();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getScale();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
};


/**
 * optional string coefficient = 1;
 * @return {string}
 */
proto.looprpc.FixedPoint.prototype.getCoefficient = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.FixedPoint} returns this
 */
proto.looprpc.FixedPoint.prototype.setCoefficient = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional uint32 scale = 2;
 * @return {number}
 */
proto.looprpc.FixedPoint.prototype.getScale = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.looprpc.FixedPoint} returns this
 */
proto.looprpc.FixedPoint.prototype.setScale = function(value) {
  return jspb.Message.setProto3IntField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.looprpc.AssetLoopOutInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.looprpc.AssetLoopOutInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.looprpc.AssetLoopOutInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.AssetLoopOutInfo.toObject = function(includeInstance, msg) {
  var f, obj = {
    assetId: jspb.Message.getFieldWithDefault(msg, 1, ""),
    assetName: jspb.Message.getFieldWithDefault(msg, 2, ""),
    assetCostOffchain: jspb.Message.getFieldWithDefault(msg, 3, "0")
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
 * @return {!proto.looprpc.AssetLoopOutInfo}
 */
proto.looprpc.AssetLoopOutInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.looprpc.AssetLoopOutInfo;
  return proto.looprpc.AssetLoopOutInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.looprpc.AssetLoopOutInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.looprpc.AssetLoopOutInfo}
 */
proto.looprpc.AssetLoopOutInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setAssetId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setAssetName(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readUint64String());
      msg.setAssetCostOffchain(value);
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
proto.looprpc.AssetLoopOutInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.looprpc.AssetLoopOutInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.looprpc.AssetLoopOutInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.looprpc.AssetLoopOutInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAssetId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getAssetName();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getAssetCostOffchain();
  if (parseInt(f, 10) !== 0) {
    writer.writeUint64String(
      3,
      f
    );
  }
};


/**
 * optional string asset_id = 1;
 * @return {string}
 */
proto.looprpc.AssetLoopOutInfo.prototype.getAssetId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.AssetLoopOutInfo} returns this
 */
proto.looprpc.AssetLoopOutInfo.prototype.setAssetId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string asset_name = 2;
 * @return {string}
 */
proto.looprpc.AssetLoopOutInfo.prototype.getAssetName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.AssetLoopOutInfo} returns this
 */
proto.looprpc.AssetLoopOutInfo.prototype.setAssetName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional uint64 asset_cost_offchain = 3;
 * @return {string}
 */
proto.looprpc.AssetLoopOutInfo.prototype.getAssetCostOffchain = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, "0"));
};


/**
 * @param {string} value
 * @return {!proto.looprpc.AssetLoopOutInfo} returns this
 */
proto.looprpc.AssetLoopOutInfo.prototype.setAssetCostOffchain = function(value) {
  return jspb.Message.setProto3StringIntField(this, 3, value);
};


/**
 * @enum {number}
 */
proto.looprpc.AddressType = {
  ADDRESS_TYPE_UNKNOWN: 0,
  TAPROOT_PUBKEY: 1
};

/**
 * @enum {number}
 */
proto.looprpc.SwapType = {
  LOOP_OUT: 0,
  LOOP_IN: 1
};

/**
 * @enum {number}
 */
proto.looprpc.SwapState = {
  INITIATED: 0,
  PREIMAGE_REVEALED: 1,
  HTLC_PUBLISHED: 2,
  SUCCESS: 3,
  FAILED: 4,
  INVOICE_SETTLED: 5
};

/**
 * @enum {number}
 */
proto.looprpc.FailureReason = {
  FAILURE_REASON_NONE: 0,
  FAILURE_REASON_OFFCHAIN: 1,
  FAILURE_REASON_TIMEOUT: 2,
  FAILURE_REASON_SWEEP_TIMEOUT: 3,
  FAILURE_REASON_INSUFFICIENT_VALUE: 4,
  FAILURE_REASON_TEMPORARY: 5,
  FAILURE_REASON_INCORRECT_AMOUNT: 6,
  FAILURE_REASON_ABANDONED: 7,
  FAILURE_REASON_INSUFFICIENT_CONFIRMED_BALANCE: 8,
  FAILURE_REASON_INCORRECT_HTLC_AMT_SWEPT: 9
};

/**
 * @enum {number}
 */
proto.looprpc.LiquidityRuleType = {
  UNKNOWN: 0,
  THRESHOLD: 1
};

/**
 * @enum {number}
 */
proto.looprpc.AutoReason = {
  AUTO_REASON_UNKNOWN: 0,
  AUTO_REASON_BUDGET_NOT_STARTED: 1,
  AUTO_REASON_SWEEP_FEES: 2,
  AUTO_REASON_BUDGET_ELAPSED: 3,
  AUTO_REASON_IN_FLIGHT: 4,
  AUTO_REASON_SWAP_FEE: 5,
  AUTO_REASON_MINER_FEE: 6,
  AUTO_REASON_PREPAY: 7,
  AUTO_REASON_FAILURE_BACKOFF: 8,
  AUTO_REASON_LOOP_OUT: 9,
  AUTO_REASON_LOOP_IN: 10,
  AUTO_REASON_LIQUIDITY_OK: 11,
  AUTO_REASON_BUDGET_INSUFFICIENT: 12,
  AUTO_REASON_FEE_INSUFFICIENT: 13
};

/**
 * @enum {number}
 */
proto.looprpc.DepositState = {
  UNKNOWN_STATE: 0,
  DEPOSITED: 1,
  WITHDRAWING: 2,
  WITHDRAWN: 3,
  LOOPING_IN: 4,
  LOOPED_IN: 5,
  SWEEP_HTLC_TIMEOUT: 6,
  HTLC_TIMEOUT_SWEPT: 7,
  PUBLISH_EXPIRED: 8,
  WAIT_FOR_EXPIRY_SWEEP: 9,
  EXPIRED: 10
};

/**
 * @enum {number}
 */
proto.looprpc.StaticAddressLoopInSwapState = {
  UNKNOWN_STATIC_ADDRESS_SWAP_STATE: 0,
  INIT_HTLC: 1,
  SIGN_HTLC_TX: 2,
  MONITOR_INVOICE_HTLC_TX: 3,
  PAYMENT_RECEIVED: 4,
  SWEEP_STATIC_ADDRESS_HTLC_TIMEOUT: 5,
  MONITOR_HTLC_TIMEOUT_SWEEP: 6,
  HTLC_STATIC_ADDRESS_TIMEOUT_SWEPT: 7,
  SUCCEEDED: 8,
  SUCCEEDED_TRANSITIONING_FAILED: 9,
  UNLOCK_DEPOSITS: 10,
  FAILED_STATIC_ADDRESS_SWAP: 11
};

goog.object.extend(exports, proto.looprpc);
