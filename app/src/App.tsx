import React from 'react';
import './App.scss';
import { createStore, StoreProvider } from 'store';
import AlertContainer from 'components/common/AlertContainer';
import FullHeight from 'components/common/FullHeight';
import { ThemeProvider } from 'components/theme';
import TourHost from 'components/tour/TourHost';
import Routes from './Routes';

const App = () => {
  const store = createStore();

  return (
    <FullHeight>
      <StoreProvider store={store}>
        <ThemeProvider>
          <Routes />
          <AlertContainer />
          <TourHost />
        </ThemeProvider>
      </StoreProvider>
    </FullHeight>
  );
};

export default App;
