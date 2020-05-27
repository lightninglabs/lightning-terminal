import { values } from 'mobx';
import { createStore, UiStore } from 'store';

describe('UiStore', () => {
  let store: UiStore;

  beforeEach(() => {
    store = createStore().uiStore;
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
});
