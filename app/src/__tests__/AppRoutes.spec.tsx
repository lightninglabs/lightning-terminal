import React from 'react';
import { act } from '@testing-library/react';
import AppRoutes from 'AppRoutes';
import { renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';

describe('Routes Component', () => {
  let store: Store;

  beforeEach(async () => {
    // jsdom does not implement scrollTo, which some pages call when mounted
    window.scrollTo = jest.fn();
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

    it('should display the Home page with the connect UI', async () => {
      const { findByText, store } = render();
      act(() => {
        store.appView.goToHome();
      });
      expect(await findByText('Connect to Terminal')).toBeInTheDocument();
      expect(await findByText('Connect with QR')).toBeInTheDocument();
      expect(await findByText('Create a new session')).toBeInTheDocument();
      expect(store.router.location.pathname).toBe('/home');
    });

    it('should redirect the old Connect route to the Home page', async () => {
      const { findByText, store } = render();
      act(() => {
        store.router.push('/connect');
      });
      expect(await findByText('Create a new session')).toBeInTheDocument();
      expect(store.router.location.pathname).toBe('/home');
    });

    it('should display the Custom Session page', async () => {
      const { findByText, store } = render();
      act(() => {
        store.appView.goToConnectCustom();
      });
      expect(await findByText('Custom Permissions')).toBeInTheDocument();
      expect(store.router.location.pathname).toBe('/connect/custom');
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
