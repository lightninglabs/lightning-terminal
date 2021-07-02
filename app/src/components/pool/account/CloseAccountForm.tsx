import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Button, HeaderFour, SummaryItem } from 'components/base';
import FormField from 'components/common/FormField';
import FormInput from 'components/common/FormInput';
import FormInputNumber from 'components/common/FormInputNumber';
import UnitCmp from 'components/common/Unit';

const Styled = {
  Balances: styled.div`
    margin: 20px 0 30px;
  `,
};

const CloseAccountForm: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.account.CloseAccountForm');
  const { closeAccountView } = useStore();

  const { Balances } = Styled;
  return (
    <>
      <HeaderFour>{l('closeAccount')}</HeaderFour>
      <Balances>
        <SummaryItem>
          <span>{l('walletBalance')}</span>
          <UnitCmp sats={closeAccountView.walletBalance} />
        </SummaryItem>
        <SummaryItem>
          <span>{l('accountBalance')}</span>
          <UnitCmp sats={closeAccountView.accountBalance} />
        </SummaryItem>
      </Balances>
      <FormField label={l('destination')} tip={l('destinationTip')}>
        <FormInput
          label={l('destination')}
          placeholder={l('destinationPlaceholder')}
          value={closeAccountView.destination}
          onChange={closeAccountView.setDestination}
        />
      </FormField>
      <FormField label={l(`satsPerVbyteLabel`)}>
        <FormInputNumber
          label={l(`satsPerVbyteLabel`)}
          placeholder={l('satsPerVbytePlaceholder')}
          extra="sats/vByte"
          value={closeAccountView.satsPerVbyte}
          onChange={closeAccountView.setSatsPerVbyte}
        />
      </FormField>
      <SummaryItem>
        <Button ghost borderless onClick={closeAccountView.cancel}>
          {l('common.cancel')}
        </Button>
        <Button
          primary
          ghost
          disabled={!closeAccountView.isValid}
          onClick={closeAccountView.confirm}
        >
          {l('close')}
        </Button>
      </SummaryItem>
    </>
  );
};

export default observer(CloseAccountForm);
