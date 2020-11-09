import React from 'react';
import { useStore } from 'store';
import { Layout } from 'components/layout';
import SettingsPage from 'components/settings/SettingsPage';

export default {
  title: 'Pages/Settings',
  component: SettingsPage,
  parameters: { contained: true },
};

export const Default = () => {
  const { appView } = useStore();
  appView.showSettings('');
  return <SettingsPage />;
};

export const BitcoinUnit = () => {
  const { appView } = useStore();
  appView.showSettings('unit');
  return <SettingsPage />;
};

export const BalanceMode = () => {
  const { appView } = useStore();
  appView.showSettings('balance');
  return <SettingsPage />;
};

export const InsideLayout = () => {
  const { appView } = useStore();
  appView.goToSettings();
  return (
    <Layout>
      <SettingsPage />
    </Layout>
  );
};
