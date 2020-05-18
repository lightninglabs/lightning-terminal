import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from 'store';
import HistoryPage from './history/HistoryPage';
import LoopPage from './loop/LoopPage';
import SettingsPage from './settings/SettingsPage';

const Pages: React.FC = () => {
  const { uiStore } = useStore();

  switch (uiStore.page) {
    case 'history':
      return <HistoryPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <LoopPage />;
  }
};

export default observer(Pages);
