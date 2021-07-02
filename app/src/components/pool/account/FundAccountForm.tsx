import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { Unit, Units } from 'util/constants';
import { useStore } from 'store';
import { Button, HeaderFour, SummaryItem } from 'components/base';
import FormField from 'components/common/FormField';
import FormInputNumber from 'components/common/FormInputNumber';
import UnitCmp from 'components/common/Unit';

const Styled = {
  Balances: styled.div`
    margin: 20px 0 30px;
  `,
};

const FundAccountForm: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.account.FundAccountForm');
  const { fundAccountView } = useStore();

  const { Balances } = Styled;
  return (
    <>
      <HeaderFour>{l('fundAccount')}</HeaderFour>
      <Balances>
        <SummaryItem>
          <span>{l('walletBalance')}</span>
          <UnitCmp sats={fundAccountView.walletBalance} />
        </SummaryItem>
        <SummaryItem>
          <span>{l('accountBalance')}</span>
          <UnitCmp sats={fundAccountView.accountBalance} />
        </SummaryItem>
      </Balances>
      <FormField label={l(`amountLabel`)} error={fundAccountView.amountError}>
        <FormInputNumber
          label={l(`amountLabel`)}
          placeholder={l('amountPlaceholder')}
          extra={Units[Unit.sats].suffix}
          value={fundAccountView.amount}
          onChange={fundAccountView.setAmount}
        />
      </FormField>
      <FormField label={l(`satsPerVbyteLabel`)}>
        <FormInputNumber
          label={l(`satsPerVbyteLabel`)}
          placeholder={l('satsPerVbytePlaceholder')}
          extra="sats/vByte"
          value={fundAccountView.satsPerVbyte}
          onChange={fundAccountView.setSatsPerVbyte}
        />
      </FormField>
      <SummaryItem>
        <Button ghost borderless onClick={fundAccountView.cancel}>
          {l('common.cancel')}
        </Button>
        <Button
          primary
          ghost
          disabled={!fundAccountView.isValid}
          onClick={fundAccountView.confirm}
        >
          {l('fund')}
        </Button>
      </SummaryItem>
    </>
  );
};

export default observer(FundAccountForm);
