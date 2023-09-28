import React from 'react';
import { fireEvent } from '@testing-library/react';
import { saveAs } from 'file-saver';
import { renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';
import { prefixTranslation } from 'util/translate';
import PoolPage from 'components/pool/PoolPage';

describe('PoolPage', () => {
  let store: Store;

  beforeEach(async () => {
    store = createStore();
    await store.fetchAllData();
  });

  const render = () => {
    return renderWithProviders(<PoolPage />, store);
  };

  it('should display the title', () => {
    const { getByText } = render();
    expect(getByText('Lightning Pool')).toBeInTheDocument();
  });

  it('should export leases', async () => {
    await store.orderStore.fetchLeases();
    const { getByText } = render();
    fireEvent.click(getByText('download.svg'));
    expect(saveAs).toBeCalledWith(expect.any(Blob), 'leases.csv');
  });

  it('should display subserver disabled message', () => {
    const { getByText, store } = render();
    const { l } = prefixTranslation('cmps.common.SubServerStatus');

    store.subServerStore.subServers.pool.disabled = true;
    render();

    expect(getByText(l('isDisabled'))).toBeInTheDocument();
  });
});
