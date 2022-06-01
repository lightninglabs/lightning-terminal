import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { runInAction } from 'mobx';
import { fireEvent } from '@testing-library/react';
import copyToClipboard from 'copy-to-clipboard';
import { BitcoinExplorerPresets } from 'util/constants';
import { extractDomain } from 'util/strings';
import { renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';
import SettingsPage from 'components/settings/SettingsPage';

jest.mock('copy-to-clipboard');

describe('SettingsPage', () => {
  let store: Store;

  beforeEach(async () => {
    store = createStore();
    await store.nodeStore.fetchInfo();
    store.appView.showSettings('');
  });

  const render = () => {
    return renderWithProviders(
      <Routes>
        <Route path="settings/*" element={<SettingsPage />} />
      </Routes>,
      store,
    );
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

  it('should navigate to the Network Explorers screen', () => {
    const { getByText } = render();
    fireEvent.click(getByText('Bitcoin Transaction Url'));
    expect(store.router.location.pathname).toEqual('/settings/explorers');
    fireEvent.click(getByText('Settings'));
    expect(store.router.location.pathname).toEqual('/settings');
    fireEvent.click(getByText('Lightning Node Url'));
    expect(store.router.location.pathname).toEqual('/settings/explorers');
  });

  it('should display the Network Explorers list', () => {
    const { getByText } = render();
    const { bitcoinTxUrl, lnNodeUrl } = store.settingsStore;
    expect(getByText('Bitcoin Transaction Url')).toBeInTheDocument();
    expect(getByText(extractDomain(bitcoinTxUrl))).toBeInTheDocument();
    expect(getByText('Lightning Node Url')).toBeInTheDocument();
    expect(getByText(extractDomain(lnNodeUrl))).toBeInTheDocument();
  });

  it('should display the Explorer form fields', () => {
    const { getByText, getByLabelText } = render();
    fireEvent.click(getByText('Bitcoin Transaction Url'));
    expect(getByLabelText('Bitcoin Transaction Url')).toBeInTheDocument();
    expect(getByLabelText('Lightning Node Url')).toBeInTheDocument();
    Object.keys(BitcoinExplorerPresets).forEach(domain => {
      expect(getByText(domain)).toBeInTheDocument();
    });
    Object.keys(BitcoinExplorerPresets).forEach(domain => {
      expect(getByText(domain)).toBeInTheDocument();
    });
  });

  it('should fill the field with a preset', () => {
    const { getByText, getByLabelText, changeInput } = render();
    fireEvent.click(getByText('Bitcoin Transaction Url'));
    changeInput('Bitcoin Transaction Url', 'http://test.com/{txid}');
    expect(getByLabelText('Bitcoin Transaction Url')).toHaveValue(
      'http://test.com/{txid}',
    );
    fireEvent.click(getByText('blockstream.info'));
    expect(getByLabelText('Bitcoin Transaction Url')).toHaveValue(
      BitcoinExplorerPresets['blockstream.info'],
    );
  });

  it('should display validation errors', () => {
    const { getByText, changeInput } = render();
    fireEvent.click(getByText('Bitcoin Transaction Url'));
    changeInput('Bitcoin Transaction Url', '');
    expect(getByText('a valid url is required')).toBeInTheDocument();
    changeInput('Bitcoin Transaction Url', 'asdf');
    expect(getByText("url must start with 'http'")).toBeInTheDocument();
    changeInput('Bitcoin Transaction Url', 'http://test.com/blah');
    expect(getByText('url must contain {txid}')).toBeInTheDocument();
  });

  it('should update the Network Explorers', () => {
    const { getByText, changeInput } = render();
    fireEvent.click(getByText('Bitcoin Transaction Url'));
    changeInput('Bitcoin Transaction Url', 'http://test.com/{txid}');
    expect(store.settingsStore.bitcoinTxUrl).toEqual(
      BitcoinExplorerPresets['mempool.space'],
    );
    fireEvent.click(getByText('Save Changes'));
    expect(store.settingsStore.bitcoinTxUrl).toEqual('http://test.com/{txid}');
  });
});
