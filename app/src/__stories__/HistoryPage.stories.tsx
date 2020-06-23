import React from 'react';
import { SwapState, SwapType } from 'types/generated/loop_pb';
import { useStore } from 'store';
import { Swap } from 'store/models';
import HistoryPage from 'components/history/HistoryPage';
import { Layout } from 'components/layout';

export default {
  title: 'Pages/History',
  component: HistoryPage,
  parameters: { contained: true },
};

const updateSwapsStatus = (swaps: Swap[]) => {
  swaps.forEach((s, i) => {
    if (s.typeName === 'Unknown') s.type = SwapType.LOOP_IN;
    if (i === 0) s.state = SwapState.INITIATED;
    if (i === 1) s.state = SwapState.PREIMAGE_REVEALED;
    if (i === 2) s.state = SwapState.HTLC_PUBLISHED;
    if (i === 3) s.state = SwapState.INVOICE_SETTLED;
  });
};

export const Default = () => {
  const store = useStore();
  updateSwapsStatus(store.swapStore.sortedSwaps);
  return <HistoryPage />;
};

export const InsideLayout = () => {
  const store = useStore();
  updateSwapsStatus(store.swapStore.sortedSwaps);
  return (
    <Layout>
      <HistoryPage />
    </Layout>
  );
};
