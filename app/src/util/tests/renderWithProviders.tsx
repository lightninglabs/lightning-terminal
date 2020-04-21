import React from 'react';
import { render } from '@testing-library/react';
import { Store, StoreProvider } from 'store';
import { ThemeProvider } from 'components/theme';

/**
 * Renders a component inside of the theme and mobx store providers
 * to supply context items needed to render some child components
 * @param component the component under test to render
 */
const renderWithProviders = (component: React.ReactElement) => {
  const store = new Store();
  const result = render(
    <StoreProvider store={store}>
      <ThemeProvider>{component}</ThemeProvider>
    </StoreProvider>,
  );
  return { ...result, store };
};

export default renderWithProviders;
