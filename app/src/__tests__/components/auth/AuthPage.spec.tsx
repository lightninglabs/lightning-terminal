import React from 'react';
import { runInAction } from 'mobx';
import { grpc } from '@improbable-eng/grpc-web';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';
import AuthPage from 'components/auth/AuthPage';

const grpcMock = grpc as jest.Mocked<typeof grpc>;

describe('AuthPage ', () => {
  let store: Store;

  beforeEach(async () => {
    store = createStore();
    await store.init();
  });

  const render = () => {
    return renderWithProviders(<AuthPage />, store);
  };

  it('should display the title', () => {
    const { getByText } = render();
    expect(getByText('Lightning')).toBeInTheDocument();
    expect(getByText('Terminal')).toBeInTheDocument();
  });

  it('should display the login button', () => {
    const { getByText } = render();
    expect(getByText('Login')).toBeInTheDocument();
  });

  it('should display nothing when the store is not initialized', () => {
    const { getByText, queryByText } = render();
    expect(getByText('Lightning')).toBeInTheDocument();
    expect(getByText('Terminal')).toBeInTheDocument();
    runInAction(() => {
      store.initialized = false;
    });
    expect(queryByText('Lightning')).not.toBeInTheDocument();
    expect(queryByText('Terminal')).not.toBeInTheDocument();
  });

  it('should display an error when submitting an empty password', async () => {
    const { getByText, findByText } = render();
    fireEvent.click(getByText('Login'));
    expect(await findByText('oops, password is required')).toBeInTheDocument();
  });

  it('should display an error when submitting an invalid password', async () => {
    grpcMock.unary.mockImplementationOnce(desc => {
      if (desc.methodName === 'GetInfo') throw new Error('test-err');
      return undefined as any;
    });

    const { getByText, findByText } = render();
    fireEvent.click(getByText('Login'));
    expect(await findByText('oops, that password is incorrect')).toBeInTheDocument();
  });
});
