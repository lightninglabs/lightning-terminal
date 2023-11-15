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

  it('should display the password field', () => {
    const { getByLabelText } = render();
    expect(getByLabelText('Enter your password in the field above')).toBeInTheDocument();
  });

  it('should display the submit button', () => {
    const { getByText } = render();
    expect(getByText('Submit')).toBeInTheDocument();
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
    fireEvent.click(getByText('Submit'));
    expect(await findByText('oops, password is required')).toBeInTheDocument();
  });

  it('should display an error when submitting an invalid password', async () => {
    grpcMock.unary.mockImplementationOnce(desc => {
      if (desc.methodName === 'GetInfo') throw new Error('test-err');
      return undefined as any;
    });

    const { getByText, getByLabelText, findByText } = render();
    const input = getByLabelText('Enter your password in the field above');
    fireEvent.change(input, { target: { value: 'test-pw' } });
    fireEvent.click(getByText('Submit'));
    expect(await findByText('failed to connect')).toBeInTheDocument();
  });
});
