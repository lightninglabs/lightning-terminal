import * as ACCOUNT from 'types/generated/lit-accounts_pb';
import * as SESSION from 'types/generated/lit-sessions_pb';
import * as STATUS from 'types/generated/lit-status_pb';
import { Accounts } from 'types/generated/lit-accounts_pb_service';
import { Sessions } from 'types/generated/lit-sessions_pb_service';
import { Status } from 'types/generated/lit-status_pb_service';
import { b64 } from 'util/strings';
import { MAX_DATE } from 'util/constants';
import BaseApi from './base';
import GrpcClient from './grpc';

/** the names and argument types for the subscription events */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface LitEvents {}

class LitApi extends BaseApi<LitEvents> {
  _grpc: GrpcClient;

  constructor(grpc: GrpcClient) {
    super();
    this._grpc = grpc;
  }

  /**
   * call the Lit `CreateAccount` RPC and return the response
   */
  async createAccount(
    accountBalance: number,
    expirationDate: Date,
  ): Promise<ACCOUNT.CreateAccountResponse.AsObject> {
    const req = new ACCOUNT.CreateAccountRequest();
    req.setAccountBalance(accountBalance.toString());

    if (expirationDate === MAX_DATE) {
      req.setExpirationDate('0');
    } else {
      req.setExpirationDate(Math.floor(expirationDate.getTime() / 1000).toString());
    }

    const res = await this._grpc.request(Accounts.CreateAccount, req, this._meta);
    return res.toObject();
  }

  /**
   * call the Lit `AddSession` RPC and return the response
   */
  async addSession(
    label: string,
    sessionType: SESSION.SessionTypeMap[keyof SESSION.SessionTypeMap],
    expiry: Date,
    mailboxServerAddr: string,
    devServer: boolean,
    macaroonCustomPermissions: Array<SESSION.MacaroonPermission>,
    accountId: string,
  ): Promise<SESSION.AddSessionResponse.AsObject> {
    const req = new SESSION.AddSessionRequest();
    req.setLabel(label);
    req.setSessionType(sessionType);
    req.setExpiryTimestampSeconds(Math.floor(expiry.getTime() / 1000).toString());
    req.setMailboxServerAddr(mailboxServerAddr);
    req.setDevServer(devServer);
    req.setMacaroonCustomPermissionsList(macaroonCustomPermissions);
    req.setAccountId(accountId);

    const res = await this._grpc.request(Sessions.AddSession, req, this._meta);
    return res.toObject();
  }

  /**
   * call the Lit `ListSessions` RPC and return the response
   */
  async listSessions(): Promise<SESSION.ListSessionsResponse.AsObject> {
    const req = new SESSION.ListSessionsRequest();
    const res = await this._grpc.request(Sessions.ListSessions, req, this._meta);
    return res.toObject();
  }

  /**
   * call the Lit `RevokeSession` RPC and return the response
   */
  async revokeSession(
    localPublicKey: string,
  ): Promise<SESSION.RevokeSessionResponse.AsObject> {
    const req = new SESSION.RevokeSessionRequest();
    req.setLocalPublicKey(b64(localPublicKey));
    const res = await this._grpc.request(Sessions.RevokeSession, req, this._meta);
    return res.toObject();
  }

  async listSubServerStatus(): Promise<STATUS.SubServerStatusResp.AsObject> {
    const req = new STATUS.SubServerStatusReq();
    const res = await this._grpc.request(Status.SubServerStatus, req, this._meta);
    return res.toObject();
  }
}

export default LitApi;
