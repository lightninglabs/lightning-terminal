import React from 'react';
import { renderWithProviders } from 'util/tests';
import { createStore } from 'store';
import Pages from 'components/Pages';

describe('Pages Component', () => {
  const render = async () => {
    const store = createStore();
    await store.init();
    return renderWithProviders(<Pages />, store);
  };

  it('should display the Auth page by default', async () => {
    const { getByText, store } = await render();
    expect(getByText('Shushtar')).toBeInTheDocument();
    expect(store.uiStore.page).toBe('auth');
  });

  it('should display the Loop page', async () => {
    const { getByText, store } = await render();
    store.uiStore.goToLoop();
    expect(getByText('Lightning Loop')).toBeInTheDocument();
    expect(store.uiStore.page).toBe('loop');
  });

  it('should display the History page', async () => {
    const { getByText, store } = await render();
    store.uiStore.goToHistory();
    expect(getByText('Loop History')).toBeInTheDocument();
    expect(store.uiStore.page).toBe('history');
  });

  it('should display the Settings page', async () => {
    const { getByText, store } = await render();
    store.uiStore.goToSettings();
    expect(getByText('Settings')).toBeInTheDocument();
    expect(store.uiStore.page).toBe('settings');
  });
});
