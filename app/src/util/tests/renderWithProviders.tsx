import React, { Suspense } from 'react';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { fireEvent, render } from '@testing-library/react';
import { createStore, Store, StoreProvider } from 'store';
import AlertContainer from 'components/common/AlertContainer';
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
        <Suspense fallback={<></>}>
          <HistoryRouter history={store.router.history}>{component}</HistoryRouter>
        </Suspense>
        <AlertContainer />
      </ThemeProvider>
    </StoreProvider>,
  );

  const changeInput = (label: string, value: string) => {
    fireEvent.change(result.getByLabelText(label), { target: { value } });
  };

  const changeSelect = async (label: string, value: string) => {
    // rc-select adds labels to multiple dom elements. we want the second one
    fireEvent.mouseDown(result.getAllByLabelText(label)[1]);
    fireEvent.click(await result.findByText(value));
  };

  return { ...result, store, changeInput, changeSelect };
};

export default renderWithProviders;
