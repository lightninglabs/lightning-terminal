import React from 'react';
import { runInAction } from 'mobx';
import Big from 'big.js';
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
    runInAction(() => {
      store.nodeStore.wallet = {
        channelBalance: Big(123),
        walletBalance: Big(0),
        confirmedBalance: Big(0),
      };
    });
    expect(getByText('123 sats')).toBeInTheDocument();
  });

  it('should display the bitcoin balance', () => {
    const { getByText, store } = render();
    runInAction(() => {
      store.nodeStore.wallet = {
        channelBalance: Big(0),
        walletBalance: Big(234),
        confirmedBalance: Big(0),
      };
    });
    expect(getByText('234')).toBeInTheDocument();
  });
});
