import React from 'react';
import { renderWithProviders } from 'util/tests';
import { loopListSwaps } from 'util/tests/sampleData';
import { Swap } from 'store/models';
import HistoryRow from 'components/history/HistoryRow';

describe('HistoryRow component', () => {
  let swap: Swap;

  beforeEach(async () => {
    swap = new Swap(loopListSwaps.swapsList[0]);
  });

  const render = () => {
    return renderWithProviders(<HistoryRow swap={swap} />);
  };

  it('should display the status', () => {
    const { getByText } = render();
    expect(getByText(swap.stateLabel)).toBeInTheDocument();
  });

  it('should display the type', () => {
    const { getByText } = render();
    expect(getByText(swap.typeName)).toBeInTheDocument();
  });

  it('should display the created date', () => {
    const { getByText } = render();
    expect(getByText(swap.createdOnLabel)).toBeInTheDocument();
  });

  it('should display the updated date', () => {
    const { getByText } = render();
    expect(getByText(swap.updatedOnLabel)).toBeInTheDocument();
  });
});
