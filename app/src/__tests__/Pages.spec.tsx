import React from 'react';
import { renderWithProviders } from 'util/tests';
import Pages from 'components/Pages';

describe('Pages Component', () => {
  const render = () => {
    return renderWithProviders(<Pages />);
  };

  it('should display the Loop page by default', () => {
    const { getByText, store } = render();
    expect(getByText('Lightning Loop')).toBeInTheDocument();
    expect(store.uiStore.page).toBe('loop');
  });

  it('should display the History page', () => {
    const { getByText, store } = render();
    store.uiStore.goToHistory();
    expect(getByText('Loop History')).toBeInTheDocument();
    expect(store.uiStore.page).toBe('history');
  });
});
