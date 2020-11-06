import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Button, HeaderFour, SummaryItem } from 'components/base';
import Unit from 'components/common/Unit';
import { styled } from 'components/theme';

const Styled = {
  Summary: styled.div`
    margin: 20px 0 30px;
  `,
  CopyButton: styled(Button)`
    padding: 0;
  `,
  Actions: styled.div`
    margin: 30px auto;
    text-align: center;
  `,
};

const AccountSummary: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.account.AccountSummary');
  const { orderStore, accountStore, accountSectionView } = useStore();

  if (!accountStore.activeTraderKey) return null;

  const { Summary, CopyButton, Actions } = Styled;
  return (
    <>
      <HeaderFour>{l('account')}</HeaderFour>
      <Summary>
        <SummaryItem strong>
          <span>{l('accountStatus')}</span>
          <span>{accountStore.activeAccount.stateLabel}</span>
        </SummaryItem>
        <SummaryItem>
          <span>{l('fundingTxn')}</span>
          <CopyButton ghost borderless compact onClick={accountStore.copyTxnId}>
            {accountStore.activeAccount.fundingTxnIdEllipsed}
          </CopyButton>
        </SummaryItem>
        <SummaryItem>
          <span>{l('currentBalance')}</span>
          <Unit sats={accountStore.activeAccount.totalBalance} />
        </SummaryItem>
        <SummaryItem>
          <span>{l('openOrdersCount')}</span>
          <span>{orderStore.pendingOrdersCount}</span>
        </SummaryItem>
        <SummaryItem>
          <span>{l('pendingBalance')}</span>
          <Unit sats={accountStore.activeAccount.pendingBalance} />
        </SummaryItem>
        <SummaryItem strong>
          <span>{l('availableBalance')}</span>
          <span>
            <Unit sats={accountStore.activeAccount.availableBalance} />
          </span>
        </SummaryItem>
      </Summary>
      <Actions>
        <Button
          disabled={accountStore.activeAccount.stateLabel !== 'Open'}
          onClick={accountSectionView.showFundAccount}
        >
          {l('fundAccount')}
        </Button>
      </Actions>
    </>
  );
};

export default observer(AccountSummary);
