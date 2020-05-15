import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from 'util/tests';
import Layout from 'components/layout/Layout';

describe('Layout component', () => {
  const render = () => {
    return renderWithProviders(<Layout />);
  };

  it('should display the hamburger menu', () => {
    const { getByTitle } = render();
    expect(getByTitle('menu')).toBeInTheDocument();
  });

  it('should toggle collapsed state', () => {
    const { getByTitle, store } = render();
    expect(store.settingsStore.sidebarVisible).toBe(true);
    fireEvent.click(getByTitle('menu'));
    expect(store.settingsStore.sidebarVisible).toBe(false);
    fireEvent.click(getByTitle('menu'));
    expect(store.settingsStore.sidebarVisible).toBe(true);
  });
});
