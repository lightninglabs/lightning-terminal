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

  it('should expand the sidebar on desktop even if it was persisted collapsed', () => {
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValueOnce(
      // the sidebar was collapsed the last time the app was used on a small screen
      JSON.stringify({ sidebarVisible: false }),
    );

    runInWindowSize(1250, () => store.load());
    expect(store.sidebarVisible).toEqual(true);
  });

  it('should collapse the sidebar when the window is resized to a smaller width', () => {
    runInWindowSize(1250, () => store.load());
    expect(store.sidebarVisible).toEqual(true);
    expect(store.autoCollapse).toEqual(false);

    runInWindowSize(1100, () => store.syncAutoCollapse());
    expect(store.sidebarVisible).toEqual(false);
    expect(store.autoCollapse).toEqual(true);
  });

  it('should expand the sidebar when the window is resized to a larger width', () => {
    runInWindowSize(1100, () => store.load());
    expect(store.sidebarVisible).toEqual(false);
    expect(store.autoCollapse).toEqual(true);

    runInWindowSize(1250, () => store.syncAutoCollapse());
    expect(store.sidebarVisible).toEqual(true);
    expect(store.autoCollapse).toEqual(false);
  });

  it('should not collapse the sidebar when the breakpoint is not crossed', () => {
    runInWindowSize(1250, () => {
      store.load();
      // the sidebar is collapsed manually, so a resize which stays above the
      // breakpoint should leave it alone
      store.toggleSidebar();
      expect(store.sidebarVisible).toEqual(false);

      store.syncAutoCollapse();
      expect(store.sidebarVisible).toEqual(false);
      expect(store.autoCollapse).toEqual(false);
    });
  });
});
