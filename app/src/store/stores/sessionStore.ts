import {
  makeAutoObservable,
  observable,
  ObservableMap,
  runInAction,
  toJS,
  values,
} from 'mobx';
import * as LIT from 'types/generated/lit-sessions_pb';
import { IS_PROD } from 'config';
import copyToClipboard from 'copy-to-clipboard';
import { MAX_DATE } from 'util/constants';
import { hex } from 'util/strings';
import { Store } from 'store';
import { Session } from '../models';

export default class SessionStore {
  private _store: Store;

  proxyServer = IS_PROD ? 'mailbox.terminal.lightning.today:443' : 'aperture:11110';

  /** the collection of sessions */
  sessions: ObservableMap<string, Session> = observable.map();

  constructor(store: Store) {
    makeAutoObservable(this, {}, { deep: false, autoBind: true });

    this._store = store;
  }

  /** all sessions sorted by label ascending */
  get sortedSessions() {
    const { field, descending } = this._store.settingsStore.sessionSort;
    const sessions = values(this.sessions)
      .slice()
      .filter(s => s.isActive)
      .sort((a, b) => Session.compare(a, b, field));

    return descending ? sessions.reverse() : sessions;
  }

  /** The list of sessions that have not been paired */
  get unpairedSessions() {
    return this.sortedSessions.filter(s => !s.isPaired);
  }

  /** The label to use for a new generated session */
  get nextSessionLabel() {
    const count = values(this.sessions).filter(s =>
      s.label.startsWith('Generated Session'),
    ).length;
    const countText = count === 0 ? '' : ` (${count})`;
    return `Generated Session${countText}`;
  }

  /**
   * queries the LIT api to fetch the list of sessions and stores them
   * in the state
   */
  async fetchSessions() {
    this._store.log.info('fetching sessions');

    try {
      const { sessionsList } = await this._store.api.lit.listSessions();
      runInAction(() => {
        const serverIds: string[] = [];

        sessionsList.forEach(rpcSession => {
          const litSession = rpcSession as LIT.Session.AsObject;
          // update existing orders or create new ones in state. using this
          // approach instead of overwriting the array will cause fewer state
          // mutations, resulting in better react rendering performance
          const pubKey = hex(litSession.localPublicKey);
          const session = this.sessions.get(pubKey) || new Session(this._store);
          session.update(litSession);
          this.sessions.set(pubKey, session);
          serverIds.push(pubKey);
        });

        // remove any sessions in state that are not in the API response
        const localIds = Object.keys(this.sessions);
        localIds
          .filter(id => !serverIds.includes(id))
          .forEach(id => this.sessions.delete(id));

        this._store.log.info('updated sessionStore.sessions', toJS(this.sessions));
      });
    } catch (error: any) {
      this._store.appView.handleError(error, 'Unable to fetch sessions');
    }
  }

  /**
   * Adds a new session
   * @param label the user defined label for this session
   * @param type the type of session being created (admin, read-only, etc)
   * @param expiry how long the session should be valid for
   * @param copy copy the session's phrase to the clipboard
   */
  async addSession(
    label: string,
    type: LIT.SessionTypeMap[keyof LIT.SessionTypeMap],
    expiry: Date,
    copy = false,
    proxy?: string,
    customPermissions?: LIT.MacaroonPermission[],
    accountId?: string,
  ) {
    try {
      this._store.log.info(`submitting session with label ${label}`, {
        expiry,
        proxyServer: this.proxyServer,
        devServer: !IS_PROD,
      });

      const { session } = await this._store.api.lit.addSession(
        label,
        type,
        expiry,
        proxy || this.proxyServer,
        !IS_PROD,
        customPermissions || [],
        accountId || '',
      );

      // fetch all sessions to update the store's state
      await this.fetchSessions();

      if (session) {
        if (copy) this.copyPhrase(session.label, session.pairingSecretMnemonic);
        const msg =
          'Please connect immediately. The pairing phrase will expire in 10 minutes.';
        this._store.appView.notify(msg, 'Session Created', 'warning');
        return this.sessions.get(hex(session.localPublicKey));
      }
    } catch (error: any) {
      this._store.appView.handleError(error, 'Unable to add session');
    }
  }

  /**
   * Creates a new session if necessary and returns the Terminal Web url
   */
  async getNewSessionUrl() {
    let session = this.unpairedSessions.length > 0 ? this.unpairedSessions[0] : undefined;
    if (!session) {
      session = await this.addSession(
        this.nextSessionLabel,
        LIT.SessionType.TYPE_MACAROON_ADMIN,
        MAX_DATE,
      );
    }
    return session ? session.terminalConnectUrl : '';
  }

  /**
   * Opens the Terminal Web connect page in a new tab
   */
  async connectToTerminalWeb() {
    // open the window first, then set the url when the async function returns. This is done
    // in this order because popup blockers will prevent the page from opening if the open()
    // function is not in the immediate callstack of a user initiated action, such as a
    // button click. If open() was called after the `await`, it would be blocked
    const tab = window.open();
    const url = await this.getNewSessionUrl();
    if (tab) tab.location.replace(url);
  }

  /**
   * Revokes a session
   * @param session the Terminal Connect session object
   */
  async revokeSession(session: Session) {
    const { label, localPublicKey } = session;
    try {
      this._store.log.info(`revoking session with label ${label}`, {
        localPublicKey,
      });

      await this._store.api.lit.revokeSession(localPublicKey);

      // fetch all sessions to update the store's state
      await this.fetchSessions();
    } catch (error: any) {
      this._store.appView.handleError(error, 'Unable to revoke the session');
    }
  }

  /**
   * Copies a pairing phrase to the clipboard
   * @param label the session label
   * @param phrase the pairing phrase
   */
  copyPhrase(label: string, phrase: string) {
    copyToClipboard(phrase);
    const msg = `Copied Pairing Phrase for '${label}' to clipboard`;
    this._store.appView.notify(msg, '', 'success');
  }

  /**
   * Copies a pairing phrase of the first session to the clipboard
   */
  copyFirstPhrase() {
    if (this.sortedSessions.length === 0) return;
    const { pairingSecretMnemonic, label } = this.sortedSessions[0];
    copyToClipboard(pairingSecretMnemonic);
    const msg = `Copied Pairing Phrase for '${label}' to clipboard`;
    this._store.appView.notify(msg, '', 'success');
  }
}
