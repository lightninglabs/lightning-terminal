import React from 'react';
import { Router } from 'react-router';
import { render } from '@testing-library/react';
import { createStore, Store, StoreProvider } from 'store';
import { ThemeProvider } from 'components/theme';

/**
 * Renders a component inside of the theme and mobx store providers
 * to supply context items needed to render some child components
 * @param component the component under test to render
 * @param withStore the store to use in the provider
 */
const renderWithProviders = (component: React.ReactElement, withStore?: Store) => {
  const store = withStore || createStore();
  const result = render(
    <StoreProvider store={store}>
      <ThemeProvider>
        <Router history={store.router.history}>{component}</Router>
      </ThemeProvider>
    </StoreProvider>,
  );
  return { ...result, store };
};

export default renderWithProviders;
