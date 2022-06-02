import React, { Suspense } from 'react';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import './App.scss';
import { createStore, StoreProvider } from 'store';
import AlertContainer from 'components/common/AlertContainer';
import FullHeight from 'components/common/FullHeight';
import { ThemeProvider } from 'components/theme';
import TourHost from 'components/tour/TourHost';
import AppRoutes from './AppRoutes';
import Loading from 'components/common/Loading';
import { PUBLIC_URL } from 'config';

const App = () => {
  const store = createStore();

  return (
    <FullHeight>
      <StoreProvider store={store}>
        <ThemeProvider>
          <Suspense fallback={<Loading delay={500} />}>
            <HistoryRouter basename={PUBLIC_URL} history={store.router.history}>
              <AppRoutes />
              <AlertContainer />
              <TourHost />
            </HistoryRouter>
          </Suspense>
        </ThemeProvider>
      </StoreProvider>
    </FullHeight>
  );
};

export default App;
