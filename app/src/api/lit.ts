import * as LIT from 'types/generated/lit-sessions_pb';
import { Sessions } from 'types/generated/lit-sessions_pb_service';
import { b64 } from 'util/strings';
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
   * call the Lit `AddSession` RPC and return the response
   */
  async addSession(
    label: string,
    sessionType: LIT.SessionTypeMap[keyof LIT.SessionTypeMap],
    expiry: Date,
    mailboxServerAddr: string,
    devServer: boolean,
    macaroonCustomPermissions: Array<LIT.MacaroonPermission>,
  ): Promise<LIT.AddSessionResponse.AsObject> {
    const req = new LIT.AddSessionRequest();
    req.setLabel(label);
    req.setSessionType(sessionType);
    req.setExpiryTimestampSeconds(Math.floor(expiry.getTime() / 1000).toString());
    req.setMailboxServerAddr(mailboxServerAddr);
    req.setDevServer(devServer);
    req.setMacaroonCustomPermissionsList(macaroonCustomPermissions);

    const res = await this._grpc.request(Sessions.AddSession, req, this._meta);
    return res.toObject();
  }

  /**
   * call the Lit `ListSessions` RPC and return the response
   */
  async listSessions(): Promise<LIT.ListSessionsResponse.AsObject> {
    const req = new LIT.ListSessionsRequest();
    const res = await this._grpc.request(Sessions.ListSessions, req, this._meta);
    return res.toObject();
  }

  /**
   * call the Lit `RevokeSession` RPC and return the response
   */
  async revokeSession(
    localPublicKey: string,
  ): Promise<LIT.RevokeSessionResponse.AsObject> {
    const req = new LIT.RevokeSessionRequest();
    req.setLocalPublicKey(b64(localPublicKey));
    const res = await this._grpc.request(Sessions.RevokeSession, req, this._meta);
    return res.toObject();
  }
}

export default LitApi;
