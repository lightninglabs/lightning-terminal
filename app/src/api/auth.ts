/**
 * A shared base class containing logic for storing the API credentials
 */
class AuthenticatedApi {
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

export default AuthenticatedApi;
