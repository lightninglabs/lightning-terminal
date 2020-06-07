import AppStorage from 'util/appStorage';
import { BalanceMode, Unit } from 'util/constants';
import { createStore, SettingsStore } from 'store';

const appStorageMock = AppStorage as jest.Mock<AppStorage>;

describe('SettingsStore', () => {
  let store: SettingsStore;

  beforeEach(() => {
    store = createStore().settingsStore;
  });

  it('should load settings', async () => {
    const getMock = appStorageMock.mock.instances[0].get as jest.Mock;
    getMock.mockImplementation(() => ({
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
    const getMock = appStorageMock.mock.instances[0].get as jest.Mock;
    getMock.mockReturnValue(undefined as any);

    store.load();

    expect(store.sidebarVisible).toEqual(true);
    expect(store.unit).toEqual(Unit.sats);
    expect(store.balanceMode).toEqual(BalanceMode.receive);
  });
});
