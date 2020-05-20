import React from 'react';
import { fireEvent } from '@testing-library/react';
import { saveAs } from 'file-saver';
import { renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';
import HistoryPage from 'components/history/HistoryPage';

describe('HistoryPage', () => {
  let store: Store;

  beforeEach(() => {
    store = createStore();
    store.uiStore.goToHistory();
  });

  const render = () => {
    return renderWithProviders(<HistoryPage />, store);
  };

  it('should display the title', () => {
    const { getByText } = render();
    expect(getByText('Loop History')).toBeInTheDocument();
  });

  it('should display the back link', () => {
    const { getByText } = render();
    expect(getByText('Lightning Loop')).toBeInTheDocument();
  });

  it('should display the back icon', () => {
    const { getByText } = render();
    expect(getByText('arrow-left.svg')).toBeInTheDocument();
  });

  it('should display the export icon', () => {
    const { getByText } = render();
    expect(getByText('download.svg')).toBeInTheDocument();
  });

  it('should display the table headers', () => {
    const { getByText } = render();
    expect(getByText('Status')).toBeInTheDocument();
    expect(getByText('Loop Type')).toBeInTheDocument();
    expect(getByText('Amount (sats)')).toBeInTheDocument();
    expect(getByText('Created')).toBeInTheDocument();
    expect(getByText('Updated')).toBeInTheDocument();
  });

  it('should navigate back to the Loop Page', () => {
    const { getByText } = render();
    fireEvent.click(getByText('arrow-left.svg'));
    expect(store.uiStore.page).toEqual('loop');
  });

  it('should export channels', () => {
    const { getByText } = render();
    fireEvent.click(getByText('download.svg'));
    expect(saveAs).toBeCalledWith(expect.any(Blob), 'swaps.csv');
  });
});
