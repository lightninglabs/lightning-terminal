import { BalanceMode, Unit } from 'util/constants';
import { PersistentSettings } from 'store/stores/settingsStore';

const storySettings: PersistentSettings = {
  sidebarVisible: true,
  unit: Unit.sats,
  balanceMode: BalanceMode.receive,
};

// mock the AppStorage dependency so that settings aren't shared across tests
export default class MockAppStorage {
  set() {
    return undefined;
  }
  get() {
    return storySettings as any;
  }
}
