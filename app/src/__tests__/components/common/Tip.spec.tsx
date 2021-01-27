import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from 'util/tests';
import { createStore, Store } from 'store';
import Tip from 'components/common/Tip';

describe('Tip component', () => {
  let store: Store;

  const render = (placement?: string) => {
    store = createStore();
    const cmp = (
      <Tip placement={placement} overlay="test tip">
        <span>test content</span>
      </Tip>
    );
    return renderWithProviders(cmp, store);
  };

  it('should display a tooltip on hover', async () => {
    const { getByText } = render();
    fireEvent.mouseEnter(getByText('test content'));
    await waitFor(() => {
      expect(getByText('test tip')).toBeInTheDocument();
    });
  });

  it('should display a tooltip on bottom', async () => {
    const { getByText } = render('bottom');
    fireEvent.mouseEnter(getByText('test content'));
    await waitFor(() => {
      expect(getByText('test tip')).toBeInTheDocument();
    });
  });

  it('should display a tooltip on left', async () => {
    const { getByText } = render('left');
    fireEvent.mouseEnter(getByText('test content'));
    await waitFor(() => {
      expect(getByText('test tip')).toBeInTheDocument();
    });
  });

  it('should display a tooltip on right', async () => {
    const { getByText } = render('right');
    fireEvent.mouseEnter(getByText('test content'));
    await waitFor(() => {
      expect(getByText('test tip')).toBeInTheDocument();
    });
  });
});
