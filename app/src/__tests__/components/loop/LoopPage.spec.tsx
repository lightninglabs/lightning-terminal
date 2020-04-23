import React from 'react';
import { SwapStatus } from 'types/generated/loop_pb';
import { renderWithProviders } from 'util/tests';
import { loopListSwaps } from 'util/tests/sampleData';
import LoopPage from 'components/loop/LoopPage';

describe('LoopPage component', () => {
  const render = () => {
    return renderWithProviders(<LoopPage />);
  };

  it('should display the page title', () => {
    const { getByText } = render();
    expect(getByText('Lightning Loop')).toBeInTheDocument();
  });

  it('should display the three tiles', () => {
    const { getByText } = render();
    expect(getByText('Loop History')).toBeInTheDocument();
    expect(getByText('Total Inbound Liquidity')).toBeInTheDocument();
    expect(getByText('Total Outbound Liquidity')).toBeInTheDocument();
  });

  it('should display the liquidity numbers', async () => {
    const { findByText } = render();
    // these values are defined in sampleData.ts
    expect(await findByText('4,501,409 SAT')).toBeInTheDocument();
    expect(await findByText('9,988,660 SAT')).toBeInTheDocument();
  });

  it('should display the loop history records', async () => {
    const { findByText } = render();
    // convert from numeric timestamp to string (1586390353623905000 -> '4/15/2020')
    const formatDate = (s: SwapStatus.AsObject) =>
      new Date(s.initiationTime / 1000 / 1000).toLocaleDateString();
    const [swap1, swap2] = loopListSwaps.swapsList;

    expect(await findByText(formatDate(swap1))).toBeInTheDocument();
    expect(await findByText('530,000 SAT')).toBeInTheDocument();
    expect(await findByText(formatDate(swap2))).toBeInTheDocument();
    expect(await findByText('525,000 SAT')).toBeInTheDocument();
  });
});
