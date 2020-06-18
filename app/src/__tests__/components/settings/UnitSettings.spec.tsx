import React from 'react';
import { fireEvent } from '@testing-library/react';
import { Unit } from 'util/constants';
import { formatUnit } from 'util/formatters';
import { renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';
import UnitSettings from 'components/settings/UnitSettings';

describe('UnitSettings', () => {
  let store: Store;

  beforeEach(() => {
    store = createStore();
  });

  const render = () => {
    return renderWithProviders(<UnitSettings />, store);
  };

  it('should display the title', () => {
    const { getByText } = render();
    expect(getByText('Bitcoin Unit')).toBeInTheDocument();
  });

  it('should display the unit list', () => {
    const { getByText } = render();
    expect(getByText(formatUnit(Unit.sats))).toBeInTheDocument();
    expect(getByText(formatUnit(Unit.bits))).toBeInTheDocument();
    expect(getByText(formatUnit(Unit.btc))).toBeInTheDocument();
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

  it('should update the Bitcoin Unit to sats', () => {
    const { getByText, getAllByRole } = render();
    fireEvent.click(getByText(formatUnit(Unit.sats)));
    expect(getAllByRole('switch')[0]).toHaveAttribute('aria-checked', 'true');
    expect(store.settingsStore.unit).toEqual(Unit.sats);
  });

  it('should update the Bitcoin Unit to bits', () => {
    const { getByText, getAllByRole } = render();
    fireEvent.click(getByText(formatUnit(Unit.bits)));
    expect(getAllByRole('switch')[1]).toHaveAttribute('aria-checked', 'true');
    expect(store.settingsStore.unit).toEqual(Unit.bits);
  });

  it('should update the Bitcoin Unit to BTC', () => {
    const { getByText, getAllByRole } = render();
    fireEvent.click(getByText(formatUnit(Unit.btc)));
    expect(getAllByRole('switch')[2]).toHaveAttribute('aria-checked', 'true');
    expect(store.settingsStore.unit).toEqual(Unit.btc);
  });
});
