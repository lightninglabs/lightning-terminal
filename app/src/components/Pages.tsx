import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from 'store';
import AuthPage from './auth/AuthPage';
import HistoryPage from './history/HistoryPage';
import LoopPage from './loop/LoopPage';
import SettingsPage from './settings/SettingsPage';

const Pages: React.FC = () => {
  const { uiStore } = useStore();

  switch (uiStore.page) {
    case 'loop':
      return <LoopPage />;
    case 'history':
      return <HistoryPage />;
    case 'settings':
      return <SettingsPage />;
    case 'auth':
    default:
      return <AuthPage />;
  }
};

export default observer(Pages);
