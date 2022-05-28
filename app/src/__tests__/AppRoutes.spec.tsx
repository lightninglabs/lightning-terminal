import React from 'react';
import { act } from '@testing-library/react';
import AppRoutes from 'AppRoutes';
import { renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';

describe('Routes Component', () => {
  let store: Store;

  beforeEach(async () => {
    store = createStore();
    await store.init();
  });

  const render = () => {
    return renderWithProviders(<AppRoutes />, store);
  };

  it('should display the Auth page by default', async () => {
    const { findByText, store } = render();
    expect(await findByText('Lightning')).toBeInTheDocument();
    expect(await findByText('Terminal')).toBeInTheDocument();
    expect(store.router.location.pathname).toBe('/');
  });

  describe('Authenticated routes', () => {
    beforeEach(async () => {
      await store.authStore.login('pw');
    });

    it('should display the Loop page', async () => {
      const { findByText, store } = render();
      act(() => {
        store.appView.goToLoop();
      });
      expect(await findByText('Total Outbound Liquidity')).toBeInTheDocument();
      expect(store.router.location.pathname).toBe('/loop');
    });

    it('should display the History page', async () => {
      const { findByText, store } = render();
      act(() => {
        store.appView.goToHistory();
      });
      expect(await findByText('History')).toBeInTheDocument();
      expect(store.router.location.pathname).toBe('/history');
    });

    it('should display the Settings page', async () => {
      const { findByText, store } = render();
      act(() => {
        store.appView.goToSettings();
      });
      expect(await findByText('My Node')).toBeInTheDocument();
      expect(store.router.location.pathname).toBe('/settings');
    });
  });
});
