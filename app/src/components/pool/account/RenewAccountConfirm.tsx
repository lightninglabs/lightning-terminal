import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Button, HeaderFour, Small, SummaryItem } from 'components/base';
import BlockTime from 'components/common/BlockTime';
import Unit from 'components/common/Unit';

const Styled = {
  Summary: styled.div`
    margin: 20px 0 30px;
  `,
  Small: styled(Small)`
    color: ${props => props.theme.colors.gray};
  `,
  SummaryActions: styled(SummaryItem)`
    margin: 30px auto;
  `,
};

const RenewAccountConfirm: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.account.RenewAccountForm');

  const { renewAccountView } = useStore();

  const { Summary, Small, SummaryActions } = Styled;
  return (
    <>
      <HeaderFour>{l('renewAccount')}</HeaderFour>
      <Summary>
        <SummaryItem>
          <span>{l('accountBalance')}</span>
          <Unit sats={renewAccountView.accountBalance} />
        </SummaryItem>
        <SummaryItem>
          <span>{l('currentExpiry')}</span>
          <span className="text-right">
            {renewAccountView.currentExpiry} blocks
            <br />
            <Small>
              <BlockTime blocks={renewAccountView.currentExpiry} />
            </Small>
          </span>
        </SummaryItem>
        <SummaryItem>
          <span>{l('expiryBlocks')}</span>
          <span className="text-right">
            {renewAccountView.expiryBlocks} blocks
            <br />
            <Small>
              <BlockTime blocks={renewAccountView.expiryBlocks} />
            </Small>
          </span>
        </SummaryItem>
        <SummaryItem>
          <span>{l('satsPerVbyteLabel')}</span>
          <span>{renewAccountView.satsPerVbyte} sats/vByte</span>
        </SummaryItem>
        <SummaryActions>
          <Button ghost borderless onClick={renewAccountView.cancel}>
            {l('common.cancel')}
          </Button>
          <Button
            primary
            ghost
            disabled={!renewAccountView.isValid || renewAccountView.loading}
            onClick={renewAccountView.renewAccount}
          >
            {l('common.confirm')}
          </Button>
        </SummaryActions>
      </Summary>
    </>
  );
};

export default observer(RenewAccountConfirm);
