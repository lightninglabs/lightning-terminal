import React from 'react';
import * as LOOP from 'types/generated/loop_pb';
import { renderWithProviders } from 'util/tests';
import { loopListSwaps } from 'util/tests/sampleData';
import { Swap } from 'store/models';
import HistoryRow from 'components/history/HistoryRow';

describe('HistoryRow component', () => {
  let swap: Swap;

  beforeEach(async () => {
    swap = new Swap(loopListSwaps.swapsList[1]);
  });

  const render = () => {
    return renderWithProviders(<HistoryRow swap={swap} />);
  };

  it('should display the status', () => {
    const { getByText } = render();
    expect(getByText(swap.stateLabel)).toBeInTheDocument();
  });

  it.each<[number, string]>([
    [LOOP.FailureReason.FAILURE_REASON_NONE, 'Failed'],
    [LOOP.FailureReason.FAILURE_REASON_OFFCHAIN, 'Off-chain Failure'],
    [LOOP.FailureReason.FAILURE_REASON_TIMEOUT, 'On-chain Timeout'],
    [LOOP.FailureReason.FAILURE_REASON_SWEEP_TIMEOUT, 'Sweep Timeout'],
    [LOOP.FailureReason.FAILURE_REASON_INSUFFICIENT_VALUE, 'Insufficient Value'],
    [LOOP.FailureReason.FAILURE_REASON_TEMPORARY, 'Temporary Failure'],
    [LOOP.FailureReason.FAILURE_REASON_INCORRECT_AMOUNT, 'Incorrect Amount'],
  ])('should display correct dot icon for a "(%s) %s"', (reason, label) => {
    swap.state = LOOP.SwapState.FAILED;
    swap.failureReason = reason;

    const { getByText } = render();
    expect(getByText(label)).toBeInTheDocument();
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
