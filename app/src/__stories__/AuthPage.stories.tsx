import React from 'react';
import AuthPage from 'components/auth/AuthPage';
import { Layout } from 'components/layout';

export default {
  title: 'Pages/Auth',
  component: AuthPage,
};

export const Default = () => {
  return (
    <Layout>
      <AuthPage />
    </Layout>
  );
};
