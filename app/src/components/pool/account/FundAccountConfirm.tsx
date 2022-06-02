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

const FundAccountConfirm: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.account.FundAccountForm');

  const { fundAccountView } = useStore();

  const { Summary, SummaryActions } = Styled;
  return (
    <>
      <HeaderFour>{l('fundAccount')}</HeaderFour>
      <Summary>
        <SummaryItem>
          <span>{l('currentBalance')}</span>
          <Unit sats={fundAccountView.accountBalance} />
        </SummaryItem>
        <SummaryItem>
          <span>{l('amountLabel')}</span>
          <Unit sats={Big(fundAccountView.amount)} />
        </SummaryItem>
        <SummaryItem>
          <span>{l('satsPerVbyteLabel')}</span>
          <span>{fundAccountView.satsPerVbyte} sats/vByte</span>
        </SummaryItem>
        <SummaryItem strong>
          <span>{l('newBalance')}</span>
          <Unit sats={fundAccountView.newBalance} />
        </SummaryItem>
        <SummaryActions>
          <Button ghost borderless onClick={fundAccountView.cancel}>
            {l('common.cancel')}
          </Button>
          <Button
            primary
            ghost
            disabled={!fundAccountView.isValid || fundAccountView.loading}
            onClick={fundAccountView.fundAccount}
          >
            {l('common.confirm')}
          </Button>
        </SummaryActions>
      </Summary>
    </>
  );
};

export default observer(FundAccountConfirm);
