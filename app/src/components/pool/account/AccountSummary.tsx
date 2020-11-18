import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Badge, Button, HeaderFour, SummaryItem } from 'components/base';
import Tip from 'components/common/Tip';
import Unit from 'components/common/Unit';
import { styled } from 'components/theme';

const Styled = {
  Expires: styled.span`
    float: right;
    text-transform: none;
  `,
  Summary: styled.div`
    margin: 20px 0 30px;
  `,
  StatusBadge: styled(Badge)<{ pending?: boolean }>`
    color: ${props =>
      props.pending ? props.theme.colors.gold : props.theme.colors.green};
    border-color: ${props =>
      props.pending ? props.theme.colors.gold : props.theme.colors.green};
    font-family: ${props => props.theme.fonts.open.regular};
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

  const { Expires, Summary, StatusBadge, CopyButton, Actions } = Styled;
  return (
    <>
      <HeaderFour>
        {l('account')}
        {accountStore.accountExpiresIn && (
          <Expires>
            <Tip
              overlay={l('expiresHeight', {
                height: accountStore.activeAccount.expirationHeight,
              })}
            >
              <span>
                {l('expiresIn')} {accountStore.accountExpiresIn}
              </span>
            </Tip>
          </Expires>
        )}
      </HeaderFour>
      <Summary>
        <SummaryItem strong>
          <span>{l('accountStatus')}</span>
          <StatusBadge pending={accountStore.activeAccount.isPending}>
            {accountStore.activeAccount.stateLabel}
          </StatusBadge>
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
          primary
          ghost
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
