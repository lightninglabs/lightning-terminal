import React from 'react';
import { renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';

describe('AlertContainer component', () => {
  let store: Store;

  const render = () => {
    store = createStore();
    // the AlertContainer is mounted in renderWithProviders()
    return renderWithProviders(<div />, store);
  };

  it('should display an alert when added to the store', async () => {
    const { findByText } = render();
    store.appView.notify('test error', 'test title');
    expect(await findByText('test error')).toBeInTheDocument();
    expect(await findByText('test title')).toBeInTheDocument();
  });
});
