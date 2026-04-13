import { makeAutoObservable, runInAction } from 'mobx';
import { Buffer } from 'buffer';
import LNC from '@lightninglabs/lnc-web';
import { prefixTranslation } from 'util/translate';
import { Store } from 'store';
import LncApi from 'api/lncApi';

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

  /** whether the current session is via LNC */
  isLnc = false;

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
    await this._store.api.lnd.getInfo();
    this._store.log.info('authentication successful');
    runInAction(() => {
      this.authenticated = true;
    });
  }

  private _withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`${label} timed out after ${ms / 1000}s`)),
        ms,
      );
      promise.then(
        v => {
          clearTimeout(timer);
          resolve(v);
        },
        e => {
          clearTimeout(timer);
          reject(e);
        },
      );
    });
  }

  /**
   * Connect via LNC pairing phrase (first time)
   */
  async loginWithLnc(pairingPhrase: string, password: string) {
    this._store.log.info('attempting LNC connection');
    if (!pairingPhrase.trim()) throw new Error('Pairing phrase is required');
    if (!password.trim()) throw new Error('Password is required');

    const lnc = new LNC({
      pairingPhrase: pairingPhrase.trim(),
      password,
    });

    try {
      await this._withTimeout(lnc.connect(), 30_000, 'Connection');
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('timed out')) {
        try {
          lnc.disconnect();
        } catch {
          /* best-effort cleanup */
        }
        throw new Error(
          'Connection timed out. Make sure litd is running on your node and try a fresh pairing phrase.',
        );
      }
      if (
        msg.includes('WASM') ||
        msg.includes('proxy') ||
        msg.includes('stream not found')
      ) {
        throw new Error(
          'Could not reach your node. Make sure litd is running and the pairing phrase hasn\u2019t already been used. Generate a new one with: litcli sessions add --label="web" --type admin',
        );
      }
      throw err;
    }
    if (!lnc.isConnected) {
      throw new Error(
        'Connection failed. Verify litd is running and reachable, then try a fresh pairing phrase.',
      );
    }

    const lncApi = new LncApi(lnc);
    runInAction(() => {
      this._store.api.lnd = lncApi as any;
      this.isLnc = true;
    });

    try {
      await this._withTimeout(this.validate(), 15_000, 'Validation');
      LncApi.markPaired();
    } catch (error: any) {
      lnc.disconnect();
      runInAction(() => {
        this.isLnc = false;
      });
      if (error?.message?.includes('timed out')) {
        throw new Error(
          'Connected to node but verification timed out. Your node may be slow to respond — try again.',
        );
      }
      throw new Error(
        'Connected but could not verify node access. Check your pairing phrase.',
      );
    }
  }

  /**
   * Reconnect via LNC using saved credentials + password
   */
  async reconnectLnc(password: string) {
    this._store.log.info('attempting LNC reconnection with saved credentials');
    if (!password.trim()) throw new Error('Password is required');

    const lnc = new LNC({ password });

    try {
      await this._withTimeout(lnc.connect(), 12_000, 'Reconnection');
    } catch (err: any) {
      try {
        lnc.disconnect();
      } catch {
        /* best-effort cleanup */
      }
      LncApi.clearPaired();
      const msg = err?.message || '';
      if (
        msg.includes('timed out') ||
        msg.includes('stream not found') ||
        msg.includes('WASM') ||
        msg.includes('proxy') ||
        msg.includes('closed network')
      ) {
        throw new Error(
          'Session expired. Please connect with a new pairing phrase.',
        );
      }
      throw err;
    }
    if (!lnc.isConnected) {
      LncApi.clearPaired();
      throw new Error(
        'Session expired. Please connect with a new pairing phrase.',
      );
    }

    const lncApi = new LncApi(lnc);
    runInAction(() => {
      this._store.api.lnd = lncApi as any;
      this.isLnc = true;
    });

    await this._withTimeout(this.validate(), 15_000, 'Validation');
  }

  /** Disconnect LNC and clear pairing data */
  disconnectLnc() {
    if (this.isLnc) {
      const api = this._store.api.lnd as any;
      if (api?.lnc?.disconnect) {
        api.lnc.disconnect();
      }
    }
    LncApi.clearPaired();
    runInAction(() => {
      this.isLnc = false;
      this.authenticated = false;
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
        await this.validate();
      } catch (error) {
        this.setCredentials('');
        this._store.log.error('cleared invalid credentials in sessionStorage');
      }
    }
  }
}
