import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from 'util/tests';
import { createStore } from 'store';
import Layout from 'components/layout/Layout';

describe('Layout component', () => {
  const render = () => {
    const store = createStore();
    store.appView.goToLoop();
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
    expect(store.router.location.pathname).toBe('/loop');
    fireEvent.click(getByText('Loop History'));
    expect(store.router.location.pathname).toBe('/history');
    expect(getByText('Loop History').parentElement).toHaveClass('active');
  });

  it('should navigate back to the Loop page', () => {
    const { getByText, store } = render();
    expect(store.router.location.pathname).toBe('/loop');
    fireEvent.click(getByText('Loop History'));
    expect(store.router.location.pathname).toBe('/history');
    expect(getByText('Loop History').parentElement).toHaveClass('active');
    fireEvent.click(getByText('Loop'));
    expect(store.router.location.pathname).toBe('/loop');
    expect(getByText('Loop').parentElement).toHaveClass('active');
  });

  it('should navigate to the Pool page', () => {
    const { getByText, store } = render();
    expect(store.router.location.pathname).toBe('/loop');
    fireEvent.click(getByText('Pool'));
    expect(store.router.location.pathname).toBe('/pool');
    expect(getByText('Pool').parentElement).toHaveClass('active');
    fireEvent.click(getByText('Loop'));
    expect(store.router.location.pathname).toBe('/loop');
    expect(getByText('Loop').parentElement).toHaveClass('active');
  });

  it('should navigate to the Settings page', () => {
    const { getByText, store } = render();
    expect(store.router.location.pathname).toBe('/loop');
    fireEvent.click(getByText('Settings'));
    expect(store.router.location.pathname).toBe('/settings');
    expect(getByText('Settings').parentElement).toHaveClass('active');
    fireEvent.click(getByText('Loop'));
    expect(store.router.location.pathname).toBe('/loop');
    expect(getByText('Loop').parentElement).toHaveClass('active');
  });
});
