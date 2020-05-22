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
  return <SettingsPage />;
};

export const BitcoinUnit = () => {
  const { uiStore } = useStore();
  uiStore.selectedSetting = 'unit';
  return <SettingsPage />;
};

export const BalanceMode = () => {
  const { uiStore } = useStore();
  uiStore.selectedSetting = 'balance';
  return <SettingsPage />;
};

export const InsideLayout = () => {
  return (
    <Layout>
      <SettingsPage />
    </Layout>
  );
};
