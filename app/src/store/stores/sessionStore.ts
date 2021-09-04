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
import { hex } from 'util/strings';
import { Store } from 'store';
import { Session } from '../models';

export default class SessionStore {
  private _store: Store;

  proxyServer = IS_PROD ? 'mailbox.staging.lightningcluster.com:443' : 'aperture:11110';

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
      .sort((a, b) => Session.compare(a, b, field));

    return descending ? sessions.reverse() : sessions;
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
    } catch (error) {
      this._store.appView.handleError(error, 'Unable to fetch sessions');
    }
  }

  /**
   * Adds a new session
   * @param label the user defined label for this session
   * @param expiry how long the session should be valid for
   * @param mailboxServerAddr the address where the mailbox server is reachable
   * @param devServer whether the mailbox server is a dev server that has no valid TLS cert
   */
  async addSession(label: string, expiry: Date) {
    try {
      this._store.log.info(`submitting session with label ${label}`, {
        expiry,
        proxyServer: this.proxyServer,
        devServer: !IS_PROD,
      });

      const { session } = await this._store.api.lit.addSession(
        label,
        LIT.SessionType.TYPE_UI_PASSWORD,
        expiry,
        this.proxyServer,
        !IS_PROD,
        [],
      );

      // fetch all sessions to update the store's state
      await this.fetchSessions();

      if (session) {
        return this.sessions.get(hex(session.localPublicKey));
      }
    } catch (error) {
      this._store.appView.handleError(error, 'Unable to add session');
    }
  }
}