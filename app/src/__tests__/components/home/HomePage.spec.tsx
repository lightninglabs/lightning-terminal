import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import copyToClipboard from 'copy-to-clipboard';
import { renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';
import HomePage from 'components/home/HomePage';

jest.mock('copy-to-clipboard');

describe('HomePage', () => {
  let store: Store;

  beforeEach(async () => {
    store = createStore();
    await store.fetchAllData();
  });

  const render = () => {
    return renderWithProviders(<HomePage />, store);
  };

  it('should display the page title', () => {
    const { getByText } = render();
    expect(getByText('Home')).toBeInTheDocument();
  });

  it('should display the description', () => {
    const { getByText } = render();
    expect(
      getByText(
        'Securely and privately connect your node to Terminal on the web via the links below. For mobile, generate a QR code to connect.',
      ),
    ).toBeInTheDocument();
  });

  it('should display the three connect buttons on one line', () => {
    const { getByText } = render();
    const terminal = getByText('Connect to Terminal');
    const qr = getByText('Connect with QR');
    const create = getByText('Create a new session');
    expect(terminal).toBeInTheDocument();
    expect(qr).toBeInTheDocument();
    expect(create).toBeInTheDocument();
    // all three buttons are siblings in the same row
    expect(qr.parentElement).toBe(terminal.parentElement);
    expect(create.parentElement).toBe(terminal.parentElement);
  });

  it('should display the session list', async () => {
    const { getByText } = render();
    await waitFor(() => {
      expect(store.sessionStore.sortedSessions).not.toHaveLength(0);
    });
    expect(getByText('Label')).toBeInTheDocument();
    expect(getByText('Type')).toBeInTheDocument();
    expect(getByText('State')).toBeInTheDocument();
    expect(getByText('Expiry')).toBeInTheDocument();
  });

  it('should display the add session form', () => {
    const { getByText, getByPlaceholderText } = render();
    fireEvent.click(getByText('Create a new session'));
    expect(getByPlaceholderText('My First Session')).toBeInTheDocument();
    expect(getByText('Permissions')).toBeInTheDocument();
  });

  it('should create a new session and add it to the list', async () => {
    const { getByText, getByPlaceholderText, findByText, store } = render();
    const count = store.sessionStore.sortedSessions.length;

    fireEvent.click(getByText('Create a new session'));
    fireEvent.change(getByPlaceholderText('My First Session'), {
      target: { value: 'Home Page Session' },
    });
    fireEvent.click(getByText('Submit'));

    expect(await findByText('Session Created')).toBeInTheDocument();
    // the new session is added to the list. the rows themselves are virtualized, so
    // they are not rendered in the test environment where the list has no width
    await waitFor(() => {
      expect(store.sessionStore.sortedSessions).toHaveLength(count + 1);
    });
    const session = store.sessionStore.sortedSessions.find(
      s => s.label === 'Home Page Session',
    );
    expect(session).toBeDefined();
    expect(session?.pairingSecretMnemonic).not.toBe('');
    // its pairing phrase is copied to the clipboard
    expect(copyToClipboard).toBeCalledWith(session?.pairingSecretMnemonic);
    // the form is closed once the session is created
    expect(getByText('Create a new session')).toBeInTheDocument();
  });

  it('should display the QR code modal', async () => {
    const { getByText, findByText } = render();
    fireEvent.click(getByText('Connect with QR'));
    expect(await findByText('LNC QR')).toBeInTheDocument();
    expect(
      getByText('Scan to connect to Terminal from your mobile phone.'),
    ).toBeInTheDocument();
  });

  it('should open a new tab to connect to the web terminal', async () => {
    const location = { replace: jest.fn() };
    const open = jest
      .spyOn(window, 'open')
      .mockImplementation(() => ({ location } as any));

    const { getByText } = render();
    fireEvent.click(getByText('Connect to Terminal'));
    await waitFor(() => {
      expect(location.replace).toBeCalled();
    });

    open.mockRestore();
  });

  it('should display the learn more button', () => {
    const { getByText, queryByText } = render();
    expect(getByText('Learn More')).toBeInTheDocument();
    expect(
      queryByText(
        'The connection to your node occurs through the Lightning Node Connect protocol.',
      ),
    ).not.toBeInTheDocument();
  });

  it('should not display the removed sections', () => {
    const { queryByText } = render();
    expect(queryByText(`What's different?`)).not.toBeInTheDocument();
    expect(queryByText('Improved Lightning Loop UX')).not.toBeInTheDocument();
    expect(queryByText('Lightning Terminal Dashboard')).not.toBeInTheDocument();
    expect(
      queryByText(
        'Lightning Node Connect enables you to connect to this node from the web.',
      ),
    ).not.toBeInTheDocument();
  });

  it('should display the youtube modal', () => {
    const { getByText } = render();
    fireEvent.click(getByText('Learn More'));
    expect(getByText('Get Connected')).toBeInTheDocument();
  });
});
