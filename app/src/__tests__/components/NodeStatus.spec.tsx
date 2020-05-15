import React from 'react';
import { renderWithProviders } from 'util/tests';
import NodeStatus from 'components/NodeStatus';

describe('NodeStatus component', () => {
  const render = () => {
    return renderWithProviders(<NodeStatus />);
  };

  it('should display the Node Status label', () => {
    const { getByText } = render();
    expect(getByText('Node Status')).toBeInTheDocument();
  });

  it('should display the lightning balance', () => {
    const { getByText, store } = render();
    store.nodeStore.wallet = { channelBalance: 123, walletBalance: 0 };
    expect(getByText('123 SAT')).toBeInTheDocument();
  });

  it('should display the bitcoin balance', () => {
    const { getByText, store } = render();
    store.nodeStore.wallet = { channelBalance: 0, walletBalance: 234 };
    expect(getByText('234')).toBeInTheDocument();
  });
});
