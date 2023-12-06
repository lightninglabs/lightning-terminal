import { makeAutoObservable, runInAction } from 'mobx';
import { Buffer } from 'buffer';
import { prefixTranslation } from 'util/translate';
import { Store } from 'store';

const { l } = prefixTranslation('stores.authStore');

class SubServerStatus {
  disabled: boolean;
  error: string;
  running: boolean;

  constructor() {
    this.disabled = false;
    this.error = '';
    this.running = false;
  }
}

export default class AuthStore {
  private _store: Store;

  /** true if the credentials have been validated by the backend */
  authenticated = false;

  /** the password encoded to base64 */
  credentials = '';

  errors = { mainErr: '', litDetail: '', lndDetail: '' };

  constructor(store: Store) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this._store = store;
  }

  /**
   * Updates the credentials in the store, session storage, and API wrappers
   * @param credentials the encoded password
   */
  setCredentials(credentials: string) {
    this.credentials = credentials;
    this._store.storage.setSession('credentials', this.credentials);
    // set the credentials in all API wrappers
    Object.values(this._store.api).forEach(api => api.setCredentials(credentials));
  }

  /**
   * Convert exception to error message
   */
  async getErrMsg(error: string) {
    // determine the main error message
    const invalidPassMsg = ['expected 1 macaroon, got 0'];
    for (const m in invalidPassMsg) {
      const errPos = error.lastIndexOf(invalidPassMsg[m]);
      if (error.length - invalidPassMsg[m].length == errPos) {
        this.errors.mainErr = l('invalidPassErr');
        break;
      }
    }

    let walletLocked = false;
    if (this.errors.mainErr.length == 0) {
      const walletLockedMsg = [
        'wallet locked, unlock it to enable full RPC access',
        'proxy error with context auth: unknown macaroon to use',
      ];
      for (const m in walletLockedMsg) {
        const errPos = error.lastIndexOf(walletLockedMsg[m]);
        if (error.length - walletLockedMsg[m].length == errPos) {
          walletLocked = true;
          this.errors.mainErr = l('walletLockedErr');
          break;
        }
      }
    }

    if (this.errors.mainErr.length == 0) this.errors.mainErr = l('noConnectionErr');

    // get the subserver status message
    try {
      const serverStatus = await this._store.api.lit.listSubServerStatus();
      // convert the response's nested arrays to an object mapping `subServerName` -> `{ disabled, running, error }`
      const status = serverStatus.subServersMap.reduce(
        (acc, [serverName, serverStatus]) => ({ ...acc, [serverName]: serverStatus }),
        {} as Record<string, SubServerStatus>,
      );

      // check status
      if (status.lit?.error) {
        this.errors.litDetail = status.lit.error;
      } else if (!status.lit?.running) {
        this.errors.litDetail = l('litNotRunning');
        if (walletLocked) this.errors.litDetail += l('suggestWalletUnlock');
      }

      if (status.lnd?.error) {
        this.errors.lndDetail = status.lnd.error;
      } else if (!status.lnd?.running) {
        this.errors.lndDetail = l('lndNotRunning');
      }
    } catch (e) {
      this.errors.litDetail = l('litNotConnected');
    }

    return this.errors.mainErr;
  }

  /**
   * Validate the supplied password and save for later if successful
   */
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
      this._store.log.error('connection failure');
      this.errors = { mainErr: '', litDetail: '', lndDetail: '' };
      throw new Error(await this.getErrMsg(error.message));
    }
  }

  async validate() {
    // test the credentials by making an API call to getInfo
    await this._store.api.lnd.getInfo();
    // if no error is thrown above then the credentials are valid
    this._store.log.info('authentication successful');
    runInAction(() => {
      // setting this to true will automatically show the Loop page
      this.authenticated = true;
    });
  }

  /**
   * load and validate credentials from the browser's session storage
   */
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
