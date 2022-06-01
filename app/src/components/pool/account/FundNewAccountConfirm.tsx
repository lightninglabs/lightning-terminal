import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import Big from 'big.js';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Button, HeaderFour, SummaryItem } from 'components/base';
import Unit from 'components/common/Unit';

const Styled = {
  Summary: styled.div`
    margin: 20px 0 30px;
  `,
  SummaryActions: styled(SummaryItem)`
    margin: 30px auto;
  `,
};

const FundNewAccountConfirm: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.account.FundNewAccountForm');

  const { fundNewAccountView } = useStore();

  const { Summary, SummaryActions } = Styled;
  return (
    <>
      <HeaderFour>{l('fundAccount')}</HeaderFour>
      <Summary>
        <SummaryItem>
          <span>{l('currentBalance')}</span>
          <Unit sats={fundNewAccountView.accountBalance} />
        </SummaryItem>
        <SummaryItem>
          <span>{l('amountLabel')}</span>
          <Unit sats={Big(fundNewAccountView.amount)} />
        </SummaryItem>
        <SummaryItem>
          <span>{l('expireBlocksLabel')}</span>
          <span>
            {fundNewAccountView.expireBlocks}{' '}
            {l('common.blocks', { count: fundNewAccountView.expireBlocks })}
          </span>
        </SummaryItem>
        <SummaryItem>
          <span>{l('confTargetLabel')}</span>
          <span>
            {fundNewAccountView.confTarget}{' '}
            {l('common.blocks', { count: fundNewAccountView.confTarget })}
          </span>
        </SummaryItem>
        <SummaryItem>
          <span>{l('minerFeeLabel')}</span>
          <Unit sats={Big(fundNewAccountView.minerFee)} />
        </SummaryItem>
        <SummaryItem strong>
          <span>{l('newBalance')}</span>
          <Unit sats={fundNewAccountView.newBalance} />
        </SummaryItem>
        <SummaryActions>
          <Button ghost borderless onClick={fundNewAccountView.cancel}>
            {l('common.cancel')}
          </Button>
          <Button
            primary
            ghost
            disabled={!fundNewAccountView.isValid || fundNewAccountView.loading}
            onClick={fundNewAccountView.fundAccount}
          >
            {l('common.confirm')}
          </Button>
        </SummaryActions>
      </Summary>
    </>
  );
};

export default observer(FundNewAccountConfirm);
