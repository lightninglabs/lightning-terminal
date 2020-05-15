import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from 'store';
import HistoryPage from './history/HistoryPage';
import LoopPage from './loop/LoopPage';

const Pages: React.FC = () => {
  const { uiStore } = useStore();

  switch (uiStore.page) {
    case 'history':
      return <HistoryPage />;
    default:
      return <LoopPage />;
  }
};

export default observer(Pages);
