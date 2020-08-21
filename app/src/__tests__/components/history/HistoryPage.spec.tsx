import React from 'react';
import { fireEvent } from '@testing-library/react';
import { saveAs } from 'file-saver';
import { renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';
import HistoryPage from 'components/history/HistoryPage';

describe('HistoryPage', () => {
  let store: Store;

  beforeEach(async () => {
    store = createStore();
    await store.swapStore.fetchSwaps();
  });

  const render = () => {
    return renderWithProviders(<HistoryPage />, store);
  };

  it('should display the title', () => {
    const { getByText } = render();
    expect(getByText('History')).toBeInTheDocument();
  });

  it('should display the export icon', () => {
    const { getByText } = render();
    expect(getByText('download.svg')).toBeInTheDocument();
  });

  it('should display the table headers', () => {
    const { getByText } = render();
    expect(getByText('Status')).toBeInTheDocument();
    expect(getByText('Type')).toBeInTheDocument();
    expect(getByText('Amount')).toBeInTheDocument();
    expect(getByText('Created')).toBeInTheDocument();
    expect(getByText('Updated')).toBeInTheDocument();
  });

  it('should export loop history', () => {
    const { getByText } = render();
    fireEvent.click(getByText('download.svg'));
    expect(saveAs).toBeCalledWith(expect.any(Blob), 'swaps.csv');
  });

  it('should sort the history list', () => {
    const { getByText, store } = render();
    expect(store.settingsStore.historySort.field).toBe('lastUpdateTime');
    expect(store.settingsStore.historySort.descending).toBe(true);

    fireEvent.click(getByText('Status'));
    expect(store.settingsStore.historySort.field).toBe('stateLabel');

    fireEvent.click(getByText('Type'));
    expect(store.settingsStore.historySort.field).toBe('typeName');

    fireEvent.click(getByText('Amount'));
    expect(store.settingsStore.historySort.field).toBe('amount');

    fireEvent.click(getByText('Created'));
    expect(store.settingsStore.historySort.field).toBe('initiationTime');

    fireEvent.click(getByText('Updated'));
    expect(store.settingsStore.historySort.field).toBe('lastUpdateTime');
    expect(store.settingsStore.historySort.descending).toBe(false);

    fireEvent.click(getByText('Updated'));
    expect(store.settingsStore.historySort.field).toBe('lastUpdateTime');
    expect(store.settingsStore.historySort.descending).toBe(true);
  });
});
