import React from 'react';
import './App.scss';
import { Store } from 'store';
import { StoreProvider } from 'store/provider';
import { Layout } from 'components/layout';
import SamplePage from 'components/pages/SamplePage';
import { ThemeProvider } from 'components/theme';

const App = () => {
  const store = new Store();
  return (
    <ThemeProvider>
      <StoreProvider store={store}>
        <Layout>
          <SamplePage />
        </Layout>
      </StoreProvider>
    </ThemeProvider>
  );
};

export default App;
