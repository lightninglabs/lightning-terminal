import React from 'react';
import { renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';
import AlertContainer from 'components/common/AlertContainer';

describe('AlertContainer component', () => {
  let store: Store;

  const render = () => {
    store = createStore();
    return renderWithProviders(<AlertContainer />, store);
  };

  it('should display an alert when added to the store', async () => {
    const { findByText } = render();
    store.uiStore.notify('test error', 'test title');
    expect(await findByText('test error')).toBeInTheDocument();
    expect(await findByText('test title')).toBeInTheDocument();
  });
});
