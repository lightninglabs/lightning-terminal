import React from 'react';
import './App.scss';
import { Store, StoreProvider } from 'store';
import { Layout } from 'components/layout';
import SamplePage from 'components/pages/SamplePage';
import { ThemeProvider } from 'components/theme';

const App = () => {
  const store = new Store();
  return (
    <StoreProvider store={store}>
      <ThemeProvider>
        <Layout>
          <SamplePage />
        </Layout>
      </ThemeProvider>
    </StoreProvider>
  );
};

export default App;
