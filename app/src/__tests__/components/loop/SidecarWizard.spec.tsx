import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, throwGrpcError } from 'util/tests';
import { createStore, Store } from 'store';
import SidecarWizard from 'components/loop/sidecar/SidecarWizard';

describe('SidecarWizard', () => {
  let store: Store;

  beforeEach(async () => {
    store = createStore();
    await store.fetchAllData();

    store.registerSidecarView.startRegister();
  });

  const render = () => {
    return renderWithProviders(<SidecarWizard />, store);
  };

  describe('General behavior', () => {
    it('should display the description labels', () => {
      const { getByText } = render();
      expect(getByText('Step 1 of 2')).toBeInTheDocument();
      expect(getByText('Sidecar Registration')).toBeInTheDocument();
    });

    it('should navigate forward and back through each step', () => {
      const { getByText } = render();
      expect(getByText('Step 1 of 2')).toBeInTheDocument();
      fireEvent.click(getByText('Next'));
      expect(getByText('Step 2 of 2')).toBeInTheDocument();
      fireEvent.click(getByText('Confirm'));
      expect(getByText('Registering Sidecar Ticket')).toBeInTheDocument();
      fireEvent.click(getByText('arrow-left.svg'));
      expect(getByText('Step 2 of 2')).toBeInTheDocument();
      fireEvent.click(getByText('arrow-left.svg'));
      expect(getByText('Step 1 of 2')).toBeInTheDocument();
    });
  });

  it('should register a ticket successfully', async () => {
    const { getByText, findByText, getByLabelText, changeInput } = render();
    expect(getByText('Sidecar Registration')).toBeInTheDocument();
    expect(getByLabelText('ticket-input')).toBeInTheDocument();
    changeInput('ticket-input', 'sidecar1e84d7ba');
    fireEvent.click(getByText('Next'));
    expect(getByText('sidecar1e84d7ba')).toBeInTheDocument();
    fireEvent.click(getByText('Confirm'));
    expect(getByText('Registering Sidecar Ticket')).toBeInTheDocument();
    expect(
      await findByText('Ticket Registered Successfully', {}, { timeout: 2000 }),
    ).toBeInTheDocument();
    fireEvent.click(getByText('arrow-left.svg'));
    expect(store.registerSidecarView.showWizard).toBeFalsy();
  });

  it('should handle errors when registering a ticket', async () => {
    const { getByText, changeInput } = render();

    changeInput('ticket-input', 'sidecar1e84d7ba');
    fireEvent.click(getByText('Next'));

    // throw a GRPC error when getting the account quote
    throwGrpcError('reg-err', 'RegisterSidecar');
    fireEvent.click(getByText('Confirm'));

    // should show error toast
    await waitFor(() => {
      expect(getByText('Unable to register ticket')).toBeInTheDocument();
      expect(getByText('reg-err')).toBeInTheDocument();
    });
  });
});
