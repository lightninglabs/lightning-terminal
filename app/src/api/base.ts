import { EventMap } from 'types/emitter';
import BaseEmitter from 'util/BaseEmitter';

/**
 * A shared base class containing logic for storing the API credentials
 */
class BaseApi<T extends EventMap> extends BaseEmitter<T> {
  private _credentials = '';

  /**
   * Returns a metadata object containing authorization info that was
   * previous set if any
   */
  protected get _meta() {
    return this._credentials
      ? { authorization: `Basic ${this._credentials}` }
      : undefined;
  }

  /**
   * Sets the credentials to use for all API requests
   * @param credentials the base64 encoded password
   */
  setCredentials(credentials: string) {
    this._credentials = credentials;
  }
}

export default BaseApi;
