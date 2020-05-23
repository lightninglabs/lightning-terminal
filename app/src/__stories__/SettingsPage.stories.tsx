import React from 'react';
import { Layout } from 'components/layout';
import SettingsPage from 'components/settings/SettingsPage';

export default {
  title: 'Pages/Settings',
  component: SettingsPage,
  parameters: { contained: true },
};

export const Default = () => {
  return <SettingsPage />;
};

export const InsideLayout = () => {
  return (
    <Layout>
      <SettingsPage />
    </Layout>
  );
};
