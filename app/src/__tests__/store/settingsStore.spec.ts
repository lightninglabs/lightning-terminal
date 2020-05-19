import { BalanceMode, Unit } from 'util/constants';
import { mockStorageGet } from 'util/tests/mockAppStorage';
import { createStore, SettingsStore } from 'store';

describe('SettingsStore', () => {
  let store: SettingsStore;

  beforeEach(() => {
    store = createStore().settingsStore;
  });

  it('should load settings', async () => {
    mockStorageGet.mockImplementation(() => ({
      sidebarVisible: false,
      unit: Unit.bits,
      balanceMode: BalanceMode.routing,
    }));

    store.load();

    expect(store.sidebarVisible).toEqual(false);
    expect(store.unit).toEqual(Unit.bits);
    expect(store.balanceMode).toEqual(BalanceMode.routing);
  });

  it('should do nothing if nothing is saved in storage', () => {
    mockStorageGet.mockReturnValue(undefined as any);

    store.load();

    expect(store.sidebarVisible).toEqual(true);
    expect(store.unit).toEqual(Unit.sats);
    expect(store.balanceMode).toEqual(BalanceMode.receive);
  });
});
