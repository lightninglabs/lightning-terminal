import * as LIT from 'types/generated/lit-sessions_pb';
import { hex } from 'util/strings';
import { litListSessions } from 'util/tests/sampleData';
import { createStore, SessionStore, Store } from 'store';

describe('SessionStore', () => {
  let rootStore: Store;
  let store: SessionStore;

  beforeEach(async () => {
    rootStore = createStore();
    store = rootStore.sessionStore;
    await store.fetchSessions();
  });

  it('should fetch the list of sessions', () => {
    expect(store.sessions.size).toBe(litListSessions.sessionsList.length);
  });

  it('should only include active sessions in the sorted list', () => {
    // the sample data contains one expired session which is not active
    expect(store.sortedSessions.length).toBeLessThan(store.sessions.size);
    store.sortedSessions.forEach(session => expect(session.isActive).toBe(true));
  });

  it('should add a new session', async () => {
    const count = store.sessions.size;
    const session = await store.addSession(
      'test session',
      LIT.SessionType.TYPE_MACAROON_ADMIN,
      new Date(),
    );
    expect(session).toBeDefined();
    expect(store.sessions.size).toBe(count + 1);
    expect(session?.label).toBe('test session');
  });

  it('should revoke a session', async () => {
    const session = store.sortedSessions[0];
    expect(session.isActive).toBe(true);
    await store.revokeSession(session);
    // revoked sessions are still returned by the API, but are no longer active
    // so they are not displayed in the list
    expect(store.sortedSessions).not.toContain(session);
    expect(store.sessions.get(session.localPublicKey)?.isActive).toBe(false);
  });

  it('should remove sessions which are no longer returned by the api', async () => {
    const count = store.sessions.size;
    expect(count).toBeGreaterThan(1);
    // simulate a session no longer existing in the backend
    const removed = litListSessions.sessionsList.pop() as LIT.Session.AsObject;
    try {
      await store.fetchSessions();
      expect(store.sessions.size).toBe(count - 1);
      expect(store.sessions.has(hex(removed.localPublicKey))).toBe(false);
    } finally {
      litListSessions.sessionsList.push(removed);
    }
  });
});
