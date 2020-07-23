import React from 'react';
import './App.scss';
import { createStore, StoreProvider } from 'store';
import AlertContainer from 'components/common/AlertContainer';
import { ThemeProvider } from 'components/theme';
import TourHost from 'components/tour/TourHost';
import Routes from './Routes';

const App = () => {
  const store = createStore();

  return (
    <StoreProvider store={store}>
      <ThemeProvider>
        <Routes />
        <AlertContainer />
        <TourHost />
      </ThemeProvider>
    </StoreProvider>
  );
};

export default App;
