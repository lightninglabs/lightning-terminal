import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { Unit, Units } from 'util/constants';
import { useStore } from 'store';
import { Button, HeaderFour, SummaryItem } from 'components/base';
import FormField from 'components/common/FormField';
import FormInputNumber from 'components/common/FormInputNumber';
import UnitCmp from 'components/common/Unit';
import { styled } from 'components/theme';

const Styled = {
  Balances: styled.div`
    margin: 20px 0 30px;
  `,
  Actions: styled.div`
    margin: 30px auto;
    text-align: center;
  `,
};

const FundNewAccountForm: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.account.FundNewAccountForm');
  const { fundNewAccountView } = useStore();

  const { Balances, Actions } = Styled;
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
          placeholder={l('amountPlaceholder')}
          extra={
            <>
              <Button ghost borderless compact onClick={fundNewAccountView.setMaxAmount}>
                {l('max')}
              </Button>
              <span>{Units[Unit.sats].suffix}</span>
            </>
          }
          value={fundNewAccountView.amount}
          onChange={fundNewAccountView.setAmount}
        />
      </FormField>
      <FormField
        label={l(`expireBlocksLabel`)}
        error={fundNewAccountView.expireBlocksError}
      >
        <FormInputNumber
          placeholder={l('expireBlocksPlaceholder')}
          extra={l('common.blocks', { count: fundNewAccountView.expireBlocks })}
          value={fundNewAccountView.expireBlocks}
          onChange={fundNewAccountView.setExpireBlocks}
        />
      </FormField>
      <FormField label={l(`confTargetLabel`)} error={fundNewAccountView.confTargetError}>
        <FormInputNumber
          placeholder={l('confTargetPlaceholder')}
          extra={l('common.blocks', { count: fundNewAccountView.confTarget })}
          value={fundNewAccountView.confTarget}
          onChange={fundNewAccountView.setConfTarget}
        />
      </FormField>
      <Actions>
        <Button
          disabled={!fundNewAccountView.isValid}
          onClick={fundNewAccountView.confirm}
        >
          {l('fund')}
        </Button>
      </Actions>
    </>
  );
};

export default observer(FundNewAccountForm);
