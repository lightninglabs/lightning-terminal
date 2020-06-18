import { BalanceMode, Unit } from 'util/constants';
import { createStore, SettingsStore } from 'store';

describe('SettingsStore', () => {
  let store: SettingsStore;

  const runInWindowSize = (width: number, func: () => void) => {
    const defaultWidth = window.innerWidth;
    (window as any).innerWidth = width;
    func();
    (window as any).innerWidth = defaultWidth;
  };

  beforeEach(() => {
    store = createStore().settingsStore;
  });

  it('should load settings', async () => {
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValueOnce(
      JSON.stringify({
        sidebarVisible: false,
        unit: Unit.bits,
        balanceMode: BalanceMode.routing,
      }),
    );

    store.load();

    expect(store.sidebarVisible).toEqual(false);
    expect(store.unit).toEqual(Unit.bits);
    expect(store.balanceMode).toEqual(BalanceMode.routing);
  });

  it('should use defaults if nothing is saved in storage', () => {
    runInWindowSize(1250, () => {
      store.load();

      expect(store.sidebarVisible).toEqual(true);
      expect(store.unit).toEqual(Unit.sats);
      expect(store.balanceMode).toEqual(BalanceMode.receive);
    });
  });

  it('should auto hide sidebar if width is less than 1200', () => {
    runInWindowSize(1100, () => {
      store.load();

      expect(store.sidebarVisible).toEqual(false);
      expect(store.unit).toEqual(Unit.sats);
      expect(store.balanceMode).toEqual(BalanceMode.receive);
    });
  });
});
