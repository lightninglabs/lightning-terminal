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

  it('should only treat the Home page as responsive', () => {
    store.goToHome();
    expect(store.responsive).toBe(true);
    store.goToPool();
    expect(store.responsive).toBe(false);
    store.goToLoop();
    expect(store.responsive).toBe(false);
    store.goToSettings();
    expect(store.responsive).toBe(false);
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

  it('should handle values thrown that are not Errors', () => {
    // Nothing in the language guarantees a thrown value is an Error, and
    // showing the user an empty alert is worse than showing the raw value.
    store.handleError('something went wrong', 'title');
    expect(store.alerts.size).toBe(1);
    const alert = values(store.alerts)[0];
    expect(alert.message).toBe('something went wrong');
    expect(alert.title).toBe('title');
  });

  it('should handle authentication errors', () => {
    rootStore.authStore.authenticated = true;
    expect(store.alerts.size).toBe(0);
    store.handleError(new AuthenticationError());
    expect(rootStore.authStore.authenticated).toBe(false);
    expect(store.alerts.size).toBe(1);
  });
});
