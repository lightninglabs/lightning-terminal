import * as LIT from 'types/generated/lit-sessions_pb';
import { createStore } from 'store';
import Session from 'store/models/session';

describe('Session.compare', () => {
  const store = createStore();

  const session = (values: Partial<Session>) => {
    const created = new Session(store);
    Object.assign(created, values);
    return created;
  };

  it('sorts the type column by the displayed label, not by expiry', () => {
    const admin = session({
      type: LIT.SessionType.TYPE_MACAROON_ADMIN,
      expiry: new Date('2030-01-01T00:00:00Z'),
    });
    const readOnly = session({
      type: LIT.SessionType.TYPE_MACAROON_READONLY,
      expiry: new Date('2020-01-01T00:00:00Z'),
    });

    // "Admin" comes before "Read-Only". The expiry order is the opposite.
    expect(Session.compare(admin, readOnly, 'type')).toBeLessThan(0);
    expect(Session.compare(readOnly, admin, 'expiry')).toBeLessThan(0);
  });

  it('sorts the state column by the paired label shown in the list', () => {
    const paired = session({
      remotePublicKey: 'aa',
      expiry: new Date('2020-01-01T00:00:00Z'),
    });
    const created = session({
      remotePublicKey: '',
      expiry: new Date('2030-01-01T00:00:00Z'),
    });

    // "Created" comes before "In Use". The expiry order is the opposite.
    expect(Session.compare(created, paired, 'state')).toBeLessThan(0);
    expect(Session.compare(paired, created, 'expiry')).toBeLessThan(0);
  });

  it('treats equal labels as a tie', () => {
    const first = session({
      label: 'Same',
      type: LIT.SessionType.TYPE_MACAROON_ADMIN,
      remotePublicKey: 'aa',
      expiry: new Date('2020-01-01T00:00:00Z'),
    });
    const second = session({
      label: 'same',
      type: LIT.SessionType.TYPE_MACAROON_ADMIN,
      remotePublicKey: 'bb',
      expiry: new Date('2030-01-01T00:00:00Z'),
    });

    expect(Session.compare(first, second, 'label')).toBe(0);
    expect(Session.compare(first, second, 'type')).toBe(0);
    expect(Session.compare(first, second, 'state')).toBe(0);
  });
});
