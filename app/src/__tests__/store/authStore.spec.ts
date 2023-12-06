import { grpc } from '@improbable-eng/grpc-web';
import { waitFor } from '@testing-library/react';
import { lndListChannels } from 'util/tests/sampleData';
import { AuthStore, createStore, Store } from 'store';

const grpcMock = grpc as jest.Mocked<typeof grpc>;

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
    await expect(store.login('test-pw')).rejects.toThrow('failed to connect');
    expect(store.credentials).toBe('');
  });

  it('should load credentials from session storage', async () => {
    jest
      .spyOn(window.sessionStorage.__proto__, 'getItem')
      .mockReturnValueOnce('test-creds');
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
    jest
      .spyOn(window.sessionStorage.__proto__, 'getItem')
      .mockReturnValueOnce('test-creds');
    await store.init();
    expect(store.credentials).toBe('');
  });

  it('should fetch data after authentication succeeds', async () => {
    await rootStore.init();
    expect(rootStore.channelStore.channels.size).toBe(0);
    await store.login('test-pw');
    expect(store.authenticated).toBe(true);
    await waitFor(() => {
      expect(rootStore.channelStore.channels.size).toBe(
        lndListChannels.channelsList.length,
      );
    });
  });
});
