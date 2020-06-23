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
    const { getByText, store } = await render();
    expect(getByText('Shushtar')).toBeInTheDocument();
    expect(store.router.location.pathname).toBe('/');
  });

  it('should display the Loop page', async () => {
    const { getAllByText, store } = await render();
    store.uiStore.goToLoop();
    expect(getAllByText('Lightning Loop')).toHaveLength(2);
    expect(store.router.location.pathname).toBe('/loop');
  });

  it('should display the History page', async () => {
    const { getByText, store } = await render();
    store.uiStore.goToHistory();
    expect(getByText('Loop History')).toBeInTheDocument();
    expect(store.router.location.pathname).toBe('/history');
  });

  it('should display the Settings page', async () => {
    const { getAllByText, store } = await render();
    store.uiStore.goToSettings();
    expect(getAllByText('Settings')).toHaveLength(2);
    expect(store.router.location.pathname).toBe('/settings');
  });
});
