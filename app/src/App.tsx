import React from 'react';
import './App.scss';
import { Layout } from 'components/layout';
import SamplePage from 'components/pages/SamplePage';

const App = () => {
  return (
    <Layout>
      <SamplePage />
    </Layout>
  );
};

export default App;
