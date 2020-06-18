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
  const { uiStore } = useStore();
  uiStore.showSettings('');
  return <SettingsPage />;
};

export const BitcoinUnit = () => {
  const { uiStore } = useStore();
  uiStore.showSettings('unit');
  return <SettingsPage />;
};

export const BalanceMode = () => {
  const { uiStore } = useStore();
  uiStore.showSettings('balance');
  return <SettingsPage />;
};

export const InsideLayout = () => {
  const { uiStore } = useStore();
  uiStore.goToSettings();
  return (
    <Layout>
      <SettingsPage />
    </Layout>
  );
};
