import React from 'react';
import { renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';
import PoolPage from 'components/pool/PoolPage';

describe('PoolPage', () => {
  let store: Store;

  beforeEach(async () => {
    store = createStore();
  });

  const render = () => {
    return renderWithProviders(<PoolPage />, store);
  };

  it('should display the title', () => {
    const { getByText } = render();
    expect(getByText('Lightning Pool')).toBeInTheDocument();
  });
});
