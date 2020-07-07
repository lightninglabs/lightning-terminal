import React from 'react';
import Routes from 'Routes';
import { renderWithProviders } from 'util/tests';
import { createStore } from 'store';

describe('Routes Component', () => {
  const render = async () => {
    const store = createStore();
    await store.init();
    return renderWithProviders(<Routes />, store);
  };

  it('should display the Auth page by default', async () => {
    const { findByText, store } = await render();
    expect(await findByText('Shushtar')).toBeInTheDocument();
    expect(store.router.location.pathname).toBe('/');
  });

  it('should display the Loop page', async () => {
    const { findByText, store } = await render();
    store.uiStore.goToLoop();
    expect(await findByText('Total Outbound Liquidity')).toBeInTheDocument();
    expect(store.router.location.pathname).toBe('/loop');
  });

  it('should display the History page', async () => {
    const { findByText, store } = await render();
    store.uiStore.goToHistory();
    expect(await findByText('Loop History')).toBeInTheDocument();
    expect(store.router.location.pathname).toBe('/history');
  });

  it('should display the Settings page', async () => {
    const { findByText, store } = await render();
    store.uiStore.goToSettings();
    expect(await findByText('My Node')).toBeInTheDocument();
    expect(store.router.location.pathname).toBe('/settings');
  });
});
