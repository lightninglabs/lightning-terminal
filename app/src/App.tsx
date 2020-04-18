import React from 'react';
import './App.scss';
import { Layout } from 'components/layout';
import SamplePage from 'components/pages/SamplePage';
import { ThemeProvider } from 'components/theme';

const App = () => {
  return (
    <ThemeProvider>
      <Layout>
        <SamplePage />
      </Layout>
    </ThemeProvider>
  );
};

export default App;
