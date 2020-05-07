import React from 'react';
import { render } from '@testing-library/react';
import { createActions } from 'action';
import { Store, StoreProvider } from 'store';
import { ThemeProvider } from 'components/theme';

/**
 * Renders a component inside of the theme and mobx store providers
 * to supply context items needed to render some child components
 * @param component the component under test to render
 * @param withStore the store to use in the provider
 */
const renderWithProviders = (component: React.ReactElement, withStore?: Store) => {
  const store = withStore || new Store();
  const actions = createActions(store);
  const result = render(
    <StoreProvider store={store} actions={actions}>
      <ThemeProvider>{component}</ThemeProvider>
    </StoreProvider>,
  );
  return { ...result, store, actions };
};

export default renderWithProviders;
