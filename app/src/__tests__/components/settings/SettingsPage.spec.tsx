import React from 'react';
import { runInAction } from 'mobx';
import { fireEvent } from '@testing-library/react';
import copyToClipboard from 'copy-to-clipboard';
import { renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';
import SettingsPage from 'components/settings/SettingsPage';

jest.mock('copy-to-clipboard');

describe('SettingsPage', () => {
  let store: Store;

  beforeEach(async () => {
    store = createStore();
    await store.nodeStore.fetchInfo();
    store.uiStore.showSettings('');
  });

  const render = () => {
    return renderWithProviders(<SettingsPage />, store);
  };

  it('should display the title', () => {
    const { getByText } = render();
    expect(getByText('Settings')).toBeInTheDocument();
  });

  it('should display the general section', () => {
    const { getByText } = render();
    expect(getByText('General')).toBeInTheDocument();
  });

  it('should display the settings list', () => {
    const { getByText } = render();
    expect(getByText('Bitcoin Unit')).toBeInTheDocument();
    expect(getByText('Satoshis (0.00000001 BTC)')).toBeInTheDocument();
    expect(getByText('Channel Balance Mode')).toBeInTheDocument();
    expect(getByText('Optimize for Receiving')).toBeInTheDocument();
  });

  it('should navigate to the Bitcoin Unit screen', () => {
    const { getByText } = render();
    fireEvent.click(getByText('Bitcoin Unit'));
    expect(store.router.location.pathname).toEqual('/settings/unit');
  });

  it('should navigate to the Channel Balance Mode screen', () => {
    const { getByText } = render();
    fireEvent.click(getByText('Channel Balance Mode'));
    expect(store.router.location.pathname).toEqual('/settings/balance');
  });

  it('should display the My Node list', () => {
    const { getByText } = render();
    const { pubkeyLabel, alias, urlLabel } = store.nodeStore;
    expect(getByText('My Node')).toBeInTheDocument();
    expect(getByText('Pubkey')).toBeInTheDocument();
    expect(getByText(pubkeyLabel)).toBeInTheDocument();
    expect(getByText('Alias')).toBeInTheDocument();
    expect(getByText(alias)).toBeInTheDocument();
    expect(getByText('Url')).toBeInTheDocument();
    expect(getByText(urlLabel)).toBeInTheDocument();
  });

  it('should not display the url if it is not defined', () => {
    const { queryByText } = render();
    expect(queryByText('Url')).toBeInTheDocument();
    runInAction(() => {
      store.nodeStore.url = '';
    });
    expect(queryByText('Url')).not.toBeInTheDocument();
    runInAction(() => {
      // an invalid url
      store.nodeStore.url = 'url-without-at-sign';
    });
    expect(queryByText('Url')).not.toBeInTheDocument();
  });

  it('should copy the pubkey to the clipboard', async () => {
    const { getByText } = render();
    fireEvent.click(getByText('Pubkey'));
    expect(copyToClipboard).toBeCalledWith(store.nodeStore.pubkey);
  });

  it('should copy the alias to the clipboard', async () => {
    const { getByText } = render();
    fireEvent.click(getByText('Alias'));
    expect(copyToClipboard).toBeCalledWith(store.nodeStore.alias);
  });

  it('should copy the url to the clipboard', async () => {
    const { getByText } = render();
    fireEvent.click(getByText('Url'));
    expect(copyToClipboard).toBeCalledWith(store.nodeStore.url);
  });
});
