import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from 'util/tests';
import Layout from 'components/layout/Layout';

describe('Layout component', () => {
  const render = () => {
    return renderWithProviders(<Layout />);
  };

  it('should display the hamburger menu', () => {
    const { getByTitle } = render();
    expect(getByTitle('menu')).toBeInTheDocument();
  });

  it('should toggle collapsed state', () => {
    const { getByTitle, store } = render();
    expect(store.settingsStore.sidebarVisible).toBe(true);
    fireEvent.click(getByTitle('menu'));
    expect(store.settingsStore.sidebarVisible).toBe(false);
    fireEvent.click(getByTitle('menu'));
    expect(store.settingsStore.sidebarVisible).toBe(true);
  });

  it('should navigate to the History page', () => {
    const { getByText, store } = render();
    expect(store.uiStore.page).toBe('loop');
    fireEvent.click(getByText('History'));
    expect(store.uiStore.page).toBe('history');
    expect(getByText('History').parentElement).toHaveClass('active');
  });

  it('should navigate back to the Loop page', () => {
    const { getByText, store } = render();
    expect(store.uiStore.page).toBe('loop');
    fireEvent.click(getByText('History'));
    expect(store.uiStore.page).toBe('history');
    expect(getByText('History').parentElement).toHaveClass('active');
    fireEvent.click(getByText('Lightning Loop'));
    expect(store.uiStore.page).toBe('loop');
    expect(getByText('Lightning Loop').parentElement).toHaveClass('active');
  });

  it('should navigate back to the Settings page', () => {
    const { getByText, store } = render();
    expect(store.uiStore.page).toBe('loop');
    fireEvent.click(getByText('Settings'));
    expect(store.uiStore.page).toBe('settings');
    expect(getByText('Settings').parentElement).toHaveClass('active');
    fireEvent.click(getByText('Lightning Loop'));
    expect(store.uiStore.page).toBe('loop');
    expect(getByText('Lightning Loop').parentElement).toHaveClass('active');
  });
});
