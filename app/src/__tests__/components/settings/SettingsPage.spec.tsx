import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';
import SettingsPage from 'components/settings/SettingsPage';

describe('SettingsPage', () => {
  let store: Store;

  beforeEach(() => {
    store = createStore();
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
    expect(store.uiStore.selectedSetting).toEqual('unit');
  });

  it('should navigate to the Channel Balance Mode screen', () => {
    const { getByText } = render();
    fireEvent.click(getByText('Channel Balance Mode'));
    expect(store.uiStore.selectedSetting).toEqual('balance');
  });
});
