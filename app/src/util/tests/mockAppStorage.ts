import { BalanceMode, Unit } from 'util/constants';
import { PersistentSettings } from 'store/stores/settingsStore';

const storySettings: PersistentSettings = {
  sidebarVisible: true,
  unit: Unit.sats,
  balanceMode: BalanceMode.receive,
};

// export mock functions to use in tests
export const mockStorageSet = jest.fn(() => storySettings);
export const mockStorageGet = jest.fn(() => storySettings);

// mock the AppStorage dependency so that settings aren't shared across tests
export default class MockAppStorage {
  set = mockStorageSet;
  get = mockStorageGet;
}
