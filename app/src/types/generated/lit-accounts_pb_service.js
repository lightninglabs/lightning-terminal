// package: litrpc
// file: lit-accounts.proto

var lit_accounts_pb = require("./lit-accounts_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var Accounts = (function () {
  function Accounts() {}
  Accounts.serviceName = "litrpc.Accounts";
  return Accounts;
}());

Accounts.CreateAccount = {
  methodName: "CreateAccount",
  service: Accounts,
  requestStream: false,
  responseStream: false,
  requestType: lit_accounts_pb.CreateAccountRequest,
  responseType: lit_accounts_pb.CreateAccountResponse
};

Accounts.UpdateAccount = {
  methodName: "UpdateAccount",
  service: Accounts,
  requestStream: false,
  responseStream: false,
  requestType: lit_accounts_pb.UpdateAccountRequest,
  responseType: lit_accounts_pb.Account
};

Accounts.ListAccounts = {
  methodName: "ListAccounts",
  service: Accounts,
  requestStream: false,
  responseStream: false,
  requestType: lit_accounts_pb.ListAccountsRequest,
  responseType: lit_accounts_pb.ListAccountsResponse
};

Accounts.AccountInfo = {
  methodName: "AccountInfo",
  service: Accounts,
  requestStream: false,
  responseStream: false,
  requestType: lit_accounts_pb.AccountInfoRequest,
  responseType: lit_accounts_pb.Account
};

Accounts.RemoveAccount = {
  methodName: "RemoveAccount",
  service: Accounts,
  requestStream: false,
  responseStream: false,
  requestType: lit_accounts_pb.RemoveAccountRequest,
  responseType: lit_accounts_pb.RemoveAccountResponse
};

exports.Accounts = Accounts;

function AccountsClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

AccountsClient.prototype.createAccount = function createAccount(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Accounts.CreateAccount, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

AccountsClient.prototype.updateAccount = function updateAccount(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Accounts.UpdateAccount, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

AccountsClient.prototype.listAccounts = function listAccounts(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Accounts.ListAccounts, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

AccountsClient.prototype.accountInfo = function accountInfo(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Accounts.AccountInfo, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

AccountsClient.prototype.removeAccount = function removeAccount(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Accounts.RemoveAccount, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

exports.AccountsClient = AccountsClient;

