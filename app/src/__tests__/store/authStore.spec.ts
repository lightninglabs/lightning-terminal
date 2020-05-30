import { grpc } from '@improbable-eng/grpc-web';
import AppStorage from 'util/appStorage';
import { AuthStore, createStore, Store } from 'store';
import { PersistentSettings } from 'store/stores/settingsStore';

const grpcMock = grpc as jest.Mocked<typeof grpc>;
const appStorageMock = AppStorage as jest.Mock<AppStorage<PersistentSettings>>;

describe('AuthStore', () => {
  let rootStore: Store;
  let store: AuthStore;

  beforeEach(() => {
    rootStore = createStore();
    store = rootStore.authStore;
  });

  it('should set credentials', () => {
    expect(store.credentials).toBe('');
    store.setCredentials('test');
    expect(store.credentials).toEqual('test');
    store.setCredentials('');
    expect(store.credentials).toEqual('');
  });

  it('should login successfully', async () => {
    await store.login('test-pw');
    expect(store.credentials).toBe('dGVzdC1wdzp0ZXN0LXB3');
  });

  it('should fail to login with a blank password', async () => {
    await expect(store.login('')).rejects.toThrow('oops, password is required');
    expect(store.credentials).toBe('');
  });

  it('should fail to login with an invalid password', async () => {
    grpcMock.unary.mockImplementationOnce(desc => {
      if (desc.methodName === 'GetInfo') throw new Error('test-err');
      return undefined as any;
    });
    await expect(store.login('test-pw')).rejects.toThrow(
      'oops, that password is incorrect',
    );
    expect(store.credentials).toBe('');
  });

  it('should load credentials from session storage', async () => {
    const getMock = appStorageMock.mock.instances[0].getSession as jest.Mock;
    getMock.mockReturnValue('test-creds');
    await store.init();
    expect(store.credentials).toBe('test-creds');
  });

  it('should not store invalid credentials from session storage', async () => {
    grpcMock.unary.mockImplementationOnce((desc, opts) => {
      if (desc.methodName === 'GetInfo') {
        opts.onEnd({
          status: grpc.Code.Unauthenticated,
        } as any);
      }
      return undefined as any;
    });
    const getMock = appStorageMock.mock.instances[0].getSession as jest.Mock;
    getMock.mockReturnValue('test-creds');
    await store.init();
    expect(store.credentials).toBe('');
  });
});
