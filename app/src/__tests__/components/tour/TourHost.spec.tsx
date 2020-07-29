import React, { Suspense } from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from 'util/tests';
import { prefixTranslation } from 'util/translate';
import { createStore, Store } from 'store';
import { Layout } from 'components/layout/Layout';
import LoopPage from 'components/loop/LoopPage';
import TourHost from 'components/tour/TourHost';

describe('TourHost component', () => {
  let store: Store;

  beforeEach(async () => {
    store = createStore();
    await store.fetchAllData();
  });

  const firstLine = (text: string) => text.split('\n')[0];

  const render = () => {
    const cmp = (
      <Suspense fallback={null}>
        <Layout>
          <LoopPage />
        </Layout>
        <TourHost />
      </Suspense>
    );
    return renderWithProviders(cmp, store);
  };

  it('should open and dismiss the tour', () => {
    const { getByText, queryByText } = render();
    fireEvent.click(getByText('help-circle.svg'));
    expect(getByText('Welcome to Lightning Terminal!')).toBeInTheDocument();
    fireEvent.click(getByText('No Thanks'));
    expect(queryByText('Welcome to Lightning Terminal!')).not.toBeInTheDocument();
  });

  it('should open the sidebar if it is collapsed', () => {
    const { getByText } = render();
    store.settingsStore.sidebarVisible = false;
    store.settingsStore.autoCollapse = true;

    fireEvent.click(getByText('help-circle.svg'));
    expect(getByText('Welcome to Lightning Terminal!')).toBeInTheDocument();

    fireEvent.click(getByText("Yes! Let's Go"));
    fireEvent.click(getByText('Next'));
    expect(store.settingsStore.sidebarVisible).toBe(true);

    fireEvent.click(getByText('Next'));
    expect(store.settingsStore.sidebarVisible).toBe(false);
  });

  it('should walk through the full tour', async () => {
    const { getByText } = render();
    const { l } = prefixTranslation('cmps.tour.TextStep');

    fireEvent.click(getByText('help-circle.svg'));
    expect(getByText('Welcome to Lightning Terminal!')).toBeInTheDocument();

    fireEvent.click(getByText("Yes! Let's Go"));
    expect(getByText('New to Loop?')).toBeInTheDocument();

    fireEvent.click(getByText('Next'));
    expect(getByText(l('nodeStatus'))).toBeInTheDocument();

    // sample data is fetch after step #1 and we need to wait for it
    await waitFor(() => expect(store.swapStore.sortedSwaps).toHaveLength(7));

    fireEvent.click(getByText('Next'));
    expect(getByText(firstLine(l('history')))).toBeInTheDocument();

    fireEvent.click(getByText('Next'));
    expect(getByText(l('inbound'))).toBeInTheDocument();

    fireEvent.click(getByText('Next'));
    expect(getByText(l('outbound'))).toBeInTheDocument();

    fireEvent.click(getByText('Next'));
    expect(getByText('channel needs your immediate attention')).toBeInTheDocument();

    fireEvent.click(getByText('Next'));
    expect(getByText(l('channelListReceive'))).toBeInTheDocument();

    fireEvent.click(getByText('Next'));
    expect(getByText(l('channelListSend'))).toBeInTheDocument();

    fireEvent.click(getByText('Next'));
    expect(getByText(firstLine(l('channelListFee')))).toBeInTheDocument();

    fireEvent.click(getByText('Next'));
    expect(getByText(l('channelListUptime'))).toBeInTheDocument();

    fireEvent.click(getByText('Next'));
    expect(getByText(firstLine(l('channelListPeer')))).toBeInTheDocument();

    fireEvent.click(getByText('Next'));
    expect(getByText(l('channelListCapacity'))).toBeInTheDocument();

    fireEvent.click(getByText('Next'));
    expect(getByText(l('export'))).toBeInTheDocument();

    fireEvent.click(getByText('Next'));
    expect(getByText("Let's perform a Loop!")).toBeInTheDocument();

    fireEvent.click(getByText('Loop', { selector: 'button' }));
    expect(getByText(firstLine(l('loopActions')))).toBeInTheDocument();

    fireEvent.click(getByText('Next'));
    expect(getByText(firstLine(l('channelListSelect')))).toBeInTheDocument();

    fireEvent.click(getByText('Next'));
    expect(getByText(firstLine(l('loopOut')))).toBeInTheDocument();

    fireEvent.click(getByText('Loop Out', { selector: 'button' }));
    expect(getByText(firstLine(l('loopAmount')))).toBeInTheDocument();

    fireEvent.click(getByText('Next', { selector: 'button' }));
    expect(getByText(firstLine(l('loopReview')))).toBeInTheDocument();

    fireEvent.click(getByText('Confirm', { selector: 'button' }));
    expect(getByText(firstLine(l('loopProgress')))).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText(firstLine(l('processingSwaps')))).toBeInTheDocument();
    });

    fireEvent.click(getByText('Next'));
    expect(getByText(l('swapProgress'))).toBeInTheDocument();

    fireEvent.click(getByText('close.svg'));
    expect(getByText('Congratulations!')).toBeInTheDocument();

    fireEvent.click(getByText('Close'));
    expect(() => getByText('Congratulations!')).toThrow();
  });
});
