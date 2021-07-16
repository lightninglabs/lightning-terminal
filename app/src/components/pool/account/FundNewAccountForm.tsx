import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { Unit, Units } from 'util/constants';
import { useStore } from 'store';
import { Button, HeaderFour, SummaryItem } from 'components/base';
import BlockTime from 'components/common/BlockTime';
import FormField from 'components/common/FormField';
import FormInputNumber from 'components/common/FormInputNumber';
import UnitCmp from 'components/common/Unit';

const Styled = {
  Balances: styled.div`
    margin: 20px 0 30px;
  `,
};

const FundNewAccountForm: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.account.FundNewAccountForm');
  const { fundNewAccountView } = useStore();

  const { Balances } = Styled;
  return (
    <>
      <HeaderFour>{l('fundAccount')}</HeaderFour>
      <Balances>
        <SummaryItem>
          <span>{l('walletBalance')}</span>
          <UnitCmp sats={fundNewAccountView.walletBalance} />
        </SummaryItem>
      </Balances>
      <FormField label={l(`amountLabel`)} error={fundNewAccountView.amountError}>
        <FormInputNumber
          label={l(`amountLabel`)}
          placeholder={l('amountPlaceholder')}
          extra={Units[Unit.sats].suffix}
          value={fundNewAccountView.amount.toNumber()}
          onChange={fundNewAccountView.setAmount}
        />
      </FormField>
      <FormField
        label={l(`expireBlocksLabel`)}
        info={<BlockTime blocks={fundNewAccountView.expireBlocks} />}
        error={fundNewAccountView.expireBlocksError}
      >
        <FormInputNumber
          label={l(`expireBlocksLabel`)}
          placeholder={l('expireBlocksPlaceholder')}
          extra={l('common.blocks', { count: fundNewAccountView.expireBlocks })}
          value={fundNewAccountView.expireBlocks}
          onChange={fundNewAccountView.setExpireBlocks}
        />
      </FormField>
      <FormField label={l(`confTargetLabel`)} error={fundNewAccountView.confTargetError}>
        <FormInputNumber
          label={l(`confTargetLabel`)}
          placeholder={l('confTargetPlaceholder')}
          extra={l('common.blocks', { count: fundNewAccountView.confTarget })}
          value={fundNewAccountView.confTarget}
          onChange={fundNewAccountView.setConfTarget}
        />
      </FormField>
      <SummaryItem>
        <Button ghost borderless onClick={fundNewAccountView.cancel}>
          {l('common.cancel')}
        </Button>
        <Button
          primary
          ghost
          disabled={!fundNewAccountView.isValid}
          onClick={fundNewAccountView.confirm}
        >
          {l('fund')}
        </Button>
      </SummaryItem>
    </>
  );
};

export default observer(FundNewAccountForm);
