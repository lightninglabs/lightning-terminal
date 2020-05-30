import { action, observable } from 'mobx';
import { prefixTranslation } from 'util/translate';
import { Store } from 'store';

const { l } = prefixTranslation('stores.authStore');

export default class AuthStore {
  private _store: Store;

  /** true if the credentials have been validated by the backend */
  @observable authenticated = false;

  /** the password encoded to base64 */
  @observable credentials = '';

  constructor(store: Store) {
    this._store = store;
  }

  /**
   * Updates the credentials in the store, session storage, and API wrappers
   * @param credentials the encoded password
   */
  @action.bound
  setCredentials(credentials: string) {
    this.credentials = credentials;
    this._store.storage.setSession('credentials', this.credentials);
    this._store.api.lnd.setCredentials(credentials);
    this._store.api.loop.setCredentials(credentials);
  }

  /**
   * Validate the supplied password and save for later if successful
   */
  @action.bound
  async login(password: string) {
    this._store.log.info('attempting to login with password');
    if (!password) throw new Error(l('emptyPassErr'));

    // encode the password and update the store
    const encoded = Buffer.from(`${password}:${password}`).toString('base64');
    this.setCredentials(encoded);
    this._store.log.info('saved credentials to sessionStorage');

    try {
      // validate the the credentials are correct
      await this.validate();
    } catch (error) {
      // clear the credentials if incorrect
      this.setCredentials('');
      this._store.log.error('incorrect credentials');
      throw new Error(l('invalidPassErr'));
    }
  }

  @action.bound
  async validate() {
    // test the credentials by making an API call to getInfo
    await this._store.api.lnd.getInfo();
    // if no error is thrown above then the credentials are valid
    this._store.log.info('authentication successful');
    // setting this to true will automatically show the Loop page
    this.authenticated = true;
  }

  /**
   * load and validate credentials from the browser's session storage
   */
  @action.bound
  async init() {
    this._store.log.info('loading credentials from sessionStorage');
    const creds = this._store.storage.getSession('credentials');
    if (creds) {
      this.setCredentials(creds);
      this._store.log.info('found credentials. validating');
      try {
        // test the credentials by making an API call to getInfo
        await this.validate();
      } catch (error) {
        // clear the credentials and swallow the error
        this.setCredentials('');
        this._store.log.error('cleared invalid credentials in sessionStorage');
      }
    }
  }
}
