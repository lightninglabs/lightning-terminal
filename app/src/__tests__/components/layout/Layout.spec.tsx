import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from 'util/tests';
import { createStore } from 'store';
import Layout from 'components/layout/Layout';

describe('Layout component', () => {
  const render = () => {
    const store = createStore();
    store.uiStore.page = 'loop';
    return renderWithProviders(<Layout />, store);
  };

  it('should display the hamburger menu', () => {
    const { getByText } = render();
    expect(getByText('menu.svg')).toBeInTheDocument();
  });

  it('should toggle collapsed state', () => {
    const { getByText, store } = render();
    expect(store.settingsStore.sidebarVisible).toBe(true);
    fireEvent.click(getByText('menu.svg'));
    expect(store.settingsStore.sidebarVisible).toBe(false);
    fireEvent.click(getByText('menu.svg'));
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

  it('should navigate to the Settings page', () => {
    const { getByText, store } = render();
    expect(store.uiStore.page).toBe('loop');
    fireEvent.click(getByText('Settings'));
    expect(store.uiStore.page).toBe('settings');
    expect(getByText('Settings').parentElement).toHaveClass('active');
    fireEvent.click(getByText('Lightning Loop'));
    expect(store.uiStore.page).toBe('loop');
    expect(getByText('Lightning Loop').parentElement).toHaveClass('active');
  });

  it('should not display the sidebar on the auth page', () => {
    const { getByText, queryByText, store } = render();
    expect(getByText('menu.svg')).toBeInTheDocument();
    store.uiStore.page = 'auth';
    expect(queryByText('menu.svg')).not.toBeInTheDocument();
  });
});
