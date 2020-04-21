import React from 'react';
import { renderWithProviders } from 'util/tests';
import LoopPage from 'components/loop/LoopPage';

describe('LoopPage component', () => {
  const render = () => {
    return renderWithProviders(<LoopPage />);
  };

  it('should display the page title', () => {
    const { getByText } = render();
    expect(getByText('Lightning Loop')).toBeInTheDocument();
  });
});
