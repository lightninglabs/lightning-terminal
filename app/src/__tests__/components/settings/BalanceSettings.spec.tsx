import React from 'react';
import { fireEvent } from '@testing-library/react';
import { BalanceMode } from 'util/constants';
import { renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';
import BalanceSettings from 'components/settings/BalanceSettings';

describe('BalanceSettings', () => {
  let store: Store;

  beforeEach(() => {
    store = createStore();
  });

  const render = () => {
    return renderWithProviders(<BalanceSettings />, store);
  };

  it('should display the title', () => {
    const { getByText } = render();
    expect(getByText('Channel Balance Mode')).toBeInTheDocument();
  });

  it('should display the balance mode list', () => {
    const { getByText } = render();
    expect(getByText('Receiving')).toBeInTheDocument();
    expect(getByText('Sending')).toBeInTheDocument();
    expect(getByText('Routing')).toBeInTheDocument();
  });

  it('should display the back link', () => {
    const { getByText } = render();
    expect(getByText('Settings')).toBeInTheDocument();
  });

  it('should display the back icon', () => {
    const { getByText } = render();
    expect(getByText('arrow-left.svg')).toBeInTheDocument();
  });

  it('should navigate back to the Settings screen', () => {
    const { getByText } = render();
    fireEvent.click(getByText('Settings'));
    expect(store.router.location.pathname).toEqual('/settings');
  });

  it('should update the Balance Mode to receive', () => {
    const { getByText, getAllByRole } = render();
    fireEvent.click(getByText('Receiving'));
    expect(getAllByRole('switch')[0]).toHaveAttribute('aria-checked', 'true');
    expect(store.settingsStore.balanceMode).toEqual(BalanceMode.receive);
  });

  it('should update the Balance Mode to send', () => {
    const { getByText, getAllByRole } = render();
    fireEvent.click(getByText('Sending'));
    expect(getAllByRole('switch')[1]).toHaveAttribute('aria-checked', 'true');
    expect(store.settingsStore.balanceMode).toEqual(BalanceMode.send);
  });

  it('should update the Balance Mode to routing', () => {
    const { getByText, getAllByRole } = render();
    fireEvent.click(getByText('Routing'));
    expect(getAllByRole('switch')[2]).toHaveAttribute('aria-checked', 'true');
    expect(store.settingsStore.balanceMode).toEqual(BalanceMode.routing);
  });
});
