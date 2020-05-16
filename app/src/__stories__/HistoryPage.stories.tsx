import React from 'react';
import { SwapState, SwapType } from 'types/generated/loop_pb';
import { useStore } from 'store';
import HistoryPage from 'components/history/HistoryPage';
import { Layout } from 'components/layout';

export default {
  title: 'Pages/History',
  component: HistoryPage,
  parameters: { contained: true },
};

export const Default = () => {
  const store = useStore();
  store.swapStore.stopAutoPolling();
  store.swapStore.sortedSwaps.forEach((s, i) => {
    if (s.typeName === 'Unknown') s.type = SwapType.LOOP_IN;
    if (i === 0) s.state = SwapState.INVOICE_SETTLED;
  });
  return <HistoryPage />;
};

export const InsideLayout = () => {
  const store = useStore();
  store.uiStore.page = 'history';
  store.swapStore.stopAutoPolling();
  store.swapStore.sortedSwaps.forEach((s, i) => {
    if (s.typeName === 'Unknown') s.type = SwapType.LOOP_IN;
    if (i === 0) s.state = SwapState.INVOICE_SETTLED;
  });
  return (
    <Layout>
      <HistoryPage />
    </Layout>
  );
};
