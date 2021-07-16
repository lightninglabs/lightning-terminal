/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';
import { runInAction } from 'mobx';
import * as POOL from 'types/generated/trader_pb';
import { grpc } from '@improbable-eng/grpc-web';
import { fireEvent, waitFor } from '@testing-library/react';
import Big from 'big.js';
import { formatSats } from 'util/formatters';
import { b64, hex } from 'util/strings';
import { renderWithProviders, throwGrpcError } from 'util/tests';
import {
  poolDepositAccount,
  poolInitAccount,
  poolQuoteAccount,
  sampleApiResponses,
} from 'util/tests/sampleData';
import { createStore, Store } from 'store';
import {
  DEFAULT_CONF_TARGET,
  DEFAULT_EXPIRE_BLOCKS,
} from 'store/views/fundNewAccountView';
import AccountSection from 'components/pool/AccountSection';

const grpcMock = grpc as jest.Mocked<typeof grpc>;

describe('AccountSection', () => {
  let store: Store;

  beforeEach(async () => {
    store = createStore();
    await store.channelStore.fetchChannels();
    await store.nodeStore.fetchBalances();
    await store.accountStore.fetchAccounts();
    await store.orderStore.fetchOrders();
  });

  const render = () => {
    return renderWithProviders(<AccountSection />, store);
  };

  it('should display channel notice', () => {
    // remove all accounts to display the FundNewAccountForm
    runInAction(() => {
      store.accountStore.accounts.clear();
      store.accountStore.activeTraderKey = '';
      store.channelStore.channels.clear();
    });
    const { getByText } = render();

    expect(getByText('Welcome to Pool')).toBeInTheDocument();
    expect(getByText(/Your node must already have open channels/)).toBeInTheDocument();
  });

  it('should validate fund new account form', () => {
    // remove all accounts to display the FundNewAccountForm
    runInAction(() => {
      store.accountStore.accounts.clear();
      store.accountStore.activeTraderKey = '';
    });

    const { getByText, changeInput } = render();

    expect(getByText('Welcome to Pool')).toBeInTheDocument();
    fireEvent.click(getByText('Open an Account'));
    expect(getByText('Fund Account')).toBeInTheDocument();
    // should show amount errors
    changeInput('Amount', '1');
    expect(getByText('must be greater than 100000 sats')).toBeInTheDocument();
    changeInput('Amount', '200000000');
    expect(getByText('must be less than wallet balance')).toBeInTheDocument();
    // should show expire blocks errors
    changeInput('Expires In', '10');
    expect(getByText('must be greater than 144 blocks')).toBeInTheDocument();
    changeInput('Expires In', '1000000');
    expect(getByText('must be less than 52560 blocks')).toBeInTheDocument();
    // should show conf target errors
    changeInput('Confirmation Target', '1');
    expect(getByText('must be greater than 1 block')).toBeInTheDocument();
  });

  it('should fund a new account', async () => {
    runInAction(() => {
      store.accountStore.accounts.clear();
      store.accountStore.activeTraderKey = '';
    });
    const { getByText, queryAllByText, changeInput } = render();

    expect(getByText('Welcome to Pool')).toBeInTheDocument();
    fireEvent.click(getByText('Open an Account'));
    expect(getByText('Fund Account')).toBeInTheDocument();

    changeInput('Amount', '25000000');
    changeInput('Expires In', '2016');
    changeInput('Confirmation Target', '3');
    fireEvent.click(getByText('Fund'));

    // wait until the confirm view is displayed
    await waitFor(() => {
      expect(getByText('Current Account Balance')).toBeInTheDocument();
    });

    // check confirmation values
    expect(getByText('0 sats')).toBeInTheDocument();
    expect(getByText('2016 blocks')).toBeInTheDocument();
    expect(getByText('3 blocks')).toBeInTheDocument();
    expect(
      getByText(formatSats(Big(poolQuoteAccount.minerFeeTotal))),
    ).toBeInTheDocument();
    expect(queryAllByText('25,000,000 sats')).toHaveLength(2);

    expect(store.accountStore.activeTraderKey).toBe('');
    fireEvent.click(getByText('Confirm'));

    // wait until the summary view is displayed
    await waitFor(() => {
      expect(getByText('Account')).toBeInTheDocument();
    });

    expect(store.accountStore.activeTraderKey).toBe(hex(poolInitAccount.traderKey));
    expect(+store.fundNewAccountView.amount).toBe(0);
    expect(store.fundNewAccountView.confTarget).toBe(DEFAULT_CONF_TARGET);
    expect(store.fundNewAccountView.expireBlocks).toBe(DEFAULT_EXPIRE_BLOCKS);
  });

  it('should handle errors funding a new account', async () => {
    runInAction(() => {
      store.accountStore.accounts.clear();
      store.accountStore.activeTraderKey = '';
    });
    const { getByText, changeInput } = render();

    expect(getByText('Welcome to Pool')).toBeInTheDocument();
    fireEvent.click(getByText('Open an Account'));
    expect(getByText('Fund Account')).toBeInTheDocument();

    changeInput('Amount', '25000000');
    changeInput('Expires In', '2016');
    changeInput('Confirmation Target', '3');

    // throw a GRPC error when getting the account quote
    throwGrpcError('quote-err', 'QuoteAccount');
    fireEvent.click(getByText('Fund'));

    // should show error toast
    await waitFor(() => {
      expect(getByText('Unable to estimate miner fee')).toBeInTheDocument();
      expect(getByText('quote-err')).toBeInTheDocument();
    });

    // the error won't be thrown this time
    fireEvent.click(getByText('Fund'));

    // wait until the confirm view is displayed
    await waitFor(() => {
      expect(getByText('Current Account Balance')).toBeInTheDocument();
    });

    throwGrpcError('init-err', 'InitAccount');
    fireEvent.click(getByText('Confirm'));

    // should show error toast
    await waitFor(() => {
      expect(getByText('Unable to create the account')).toBeInTheDocument();
      expect(getByText('init-err')).toBeInTheDocument();
    });
  });

  it('should validate fund existing account form', () => {
    const { getByText, changeInput } = render();

    expect(getByText('Fund Account')).toBeInTheDocument();
    fireEvent.click(getByText('Fund Account'));

    // should show amount errors
    changeInput('Amount', store.nodeStore.wallet.walletBalance.plus(100).toString());
    expect(getByText('must be less than wallet balance')).toBeInTheDocument();
  });

  it('should fund an existing account', async () => {
    const { getByText, changeInput } = render();

    expect(getByText('Fund Account')).toBeInTheDocument();
    fireEvent.click(getByText('Fund Account'));

    const amount = 25000000;
    changeInput('Amount', amount.toString());
    changeInput('Fee', '100');
    fireEvent.click(getByText('Fund'));

    // wait until the confirm view is displayed
    await waitFor(() => {
      expect(getByText('Current Account Balance')).toBeInTheDocument();
    });

    // check confirmation values
    const currentBalance = store.accountStore.activeAccount.availableBalance;
    expect(getByText(formatSats(currentBalance))).toBeInTheDocument();
    expect(getByText('25,000,000 sats')).toBeInTheDocument();
    expect(getByText('100 sats/vByte')).toBeInTheDocument();
    expect(getByText(formatSats(currentBalance.add(amount)))).toBeInTheDocument();

    fireEvent.click(getByText('Confirm'));

    // wait until the summary view is displayed
    await waitFor(() => {
      expect(getByText('Account')).toBeInTheDocument();
    });

    expect(store.accountStore.activeAccount.totalBalance.toString()).toBe(
      poolDepositAccount.account.value,
    );
    expect(store.fundAccountView.amount).toBe(0);
    expect(store.fundAccountView.satsPerVbyte).toBe(0);
  });

  it('should handle errors funding an existing account', async () => {
    const { getByText, changeInput } = render();

    expect(getByText('Fund Account')).toBeInTheDocument();
    fireEvent.click(getByText('Fund Account'));

    changeInput('Amount', '25000000');
    changeInput('Fee', '100');
    fireEvent.click(getByText('Fund'));

    throwGrpcError('test-err');
    fireEvent.click(getByText('Confirm'));

    // should show error toast
    await waitFor(() => {
      expect(getByText('Unable to deposit funds')).toBeInTheDocument();
      expect(getByText('test-err')).toBeInTheDocument();
    });

    // should remain on the same view
    expect(getByText('Confirm')).toBeInTheDocument();
  });

  it('should return account expiration estimates', async () => {
    const { getByText, queryByText } = render();

    const expectExpires = (blocksTilExpire: number, expected: string) => {
      runInAction(() => {
        const currHeight = store.nodeStore.blockHeight;
        store.accountStore.activeAccount.expirationHeight = currHeight + blocksTilExpire;
      });
      if (expected) {
        expect(getByText(`Expires in ${expected}`)).toBeInTheDocument();
      } else {
        expect(queryByText(/Expires in/)).not.toBeInTheDocument();
      }
    };
    expectExpires(0, '');
    expectExpires(100, '~16 hours');
    expectExpires(288, '~2 days');
    expectExpires(2016, '~2 weeks');
    expectExpires(4032, '~4 weeks');
    expectExpires(4320, '~30 days');
    expectExpires(8064, '~1.9 months');
    expectExpires(8640, '~60 days');

    runInAction(() => {
      store.accountStore.activeAccount.state = POOL.AccountState.EXPIRED;
    });
    expectExpires(100, '');
  });

  it('should display warning when account is near expiration', () => {
    runInAction(() => {
      const currHeight = store.nodeStore.blockHeight;
      store.accountStore.activeAccount.expirationHeight = currHeight + 144 * 2;
    });
    const { getByText } = render();

    expect(getByText('Expires in ~2 days')).toBeInTheDocument();
    expect(getByText(/Orders will no longer be matched/)).toBeInTheDocument();
    expect(getByText('Close')).toBeInTheDocument();
  });

  it('should close an expired account', async () => {
    // set the account as expired
    runInAction(() => {
      store.accountStore.activeAccount.state = POOL.AccountState.EXPIRED;
    });

    const { getByText, changeInput } = render();

    expect(getByText('Close')).toBeInTheDocument();
    fireEvent.click(getByText('Close'));

    changeInput('Destination Address', 'abc123');
    changeInput('Fee', '10');
    fireEvent.click(getByText('Close Account', { selector: 'button' }));

    // check confirmation values
    expect(getByText('abc123')).toBeInTheDocument();
    expect(getByText('10 sats/vByte')).toBeInTheDocument();

    // capture the request that is sent to the API
    let req: POOL.CloseAccountRequest.AsObject;
    grpcMock.unary.mockImplementation((desc, props) => {
      if (desc.methodName === 'CloseAccount') {
        req = props.request.toObject() as any;
      }
      const path = `${desc.service.serviceName}.${desc.methodName}`;
      const toObject = () => sampleApiResponses[path];
      // return a response by calling the onEnd function
      props.onEnd({
        status: grpc.Code.OK,
        // the message returned should have a toObject function
        message: { toObject } as any,
      } as any);
      return undefined as any;
    });

    fireEvent.click(getByText('Confirm'));

    // wait until the confirm view is displayed
    await waitFor(() => {
      expect(req).toBeDefined();
      expect(getByText('Account')).toBeInTheDocument();
    });

    expect(req!.traderKey).toBe(b64(store.accountStore.activeAccount.traderKey));
    expect(req!.outputWithFee?.feeRateSatPerKw).toBe('2500');
    expect(req!.outputWithFee?.address).toBe('abc123');
  });

  it('should renew an expired account', async () => {
    // set the account to expire in less than 3 days
    runInAction(() => {
      const currHeight = store.nodeStore.blockHeight;
      store.accountStore.activeAccount.expirationHeight = currHeight + 144 * 2;
    });

    const { getByText, changeInput } = render();

    expect(getByText('Renew Account')).toBeInTheDocument();
    fireEvent.click(getByText('Renew Account'));

    changeInput('New Expiration', '2016');
    changeInput('Fee Rate', '125');
    fireEvent.click(getByText('Renew'));

    // check confirmation values
    expect(getByText('288 blocks')).toBeInTheDocument();
    expect(getByText('~2 days')).toBeInTheDocument();
    expect(getByText('2016 blocks')).toBeInTheDocument();
    expect(getByText('~2 weeks')).toBeInTheDocument();
    expect(getByText('125 sats/vByte')).toBeInTheDocument();

    // capture the request that is sent to the API
    let req: POOL.RenewAccountRequest.AsObject;
    grpcMock.unary.mockImplementation((desc, props) => {
      if (desc.methodName === 'RenewAccount') {
        req = props.request.toObject() as any;
      }
      const path = `${desc.service.serviceName}.${desc.methodName}`;
      const toObject = () => sampleApiResponses[path];
      // return a response by calling the onEnd function
      props.onEnd({
        status: grpc.Code.OK,
        // the message returned should have a toObject function
        message: { toObject } as any,
      } as any);
      return undefined as any;
    });

    fireEvent.click(getByText('Confirm'));

    // wait until the account view is displayed
    await waitFor(() => {
      expect(req).toBeDefined();
      expect(getByText('Account')).toBeInTheDocument();
    });

    expect(req!.accountKey).toBe(b64(store.accountStore.activeAccount.traderKey));
    expect(req!.feeRateSatPerKw).toBe('31250');
    expect(req!.relativeExpiry).toBe(2016);
  });
});
