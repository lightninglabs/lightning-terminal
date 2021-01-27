import { values } from 'mobx';
import { AuthenticationError } from 'util/errors';
import { createStore, Store } from 'store';
import { AppView } from 'store/views';

describe('AppView', () => {
  let rootStore: Store;
  let store: AppView;

  beforeEach(() => {
    rootStore = createStore();
    store = rootStore.appView;
  });

  it('should add an alert', async () => {
    expect(store.alerts.size).toBe(0);
    store.notify('test message', 'test title');
    expect(store.alerts.size).toBe(1);
    const alert = values(store.alerts)[0];
    expect(alert.message).toBe('test message');
    expect(alert.title).toBe('test title');
    expect(alert.type).toBe('error');
  });

  it('should clear an alert', () => {
    expect(store.alerts.size).toBe(0);
    store.notify('test message', 'test title');
    expect(store.alerts.size).toBe(1);
    const alert = values(store.alerts)[0];
    store.clearAlert(alert.id);
    expect(store.alerts.size).toBe(0);
  });

  it('should handle errors', () => {
    store.handleError(new Error('message'), 'title');
    expect(store.alerts.size).toBe(1);
  });

  it('should handle authentication errors', () => {
    rootStore.authStore.authenticated = true;
    expect(store.alerts.size).toBe(0);
    store.handleError(new AuthenticationError());
    expect(rootStore.authStore.authenticated).toBe(false);
    expect(store.alerts.size).toBe(1);
  });
});
