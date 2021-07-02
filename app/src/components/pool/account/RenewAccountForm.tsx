import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Button, HeaderFour, Small, SummaryItem } from 'components/base';
import BlockTime from 'components/common/BlockTime';
import FormField from 'components/common/FormField';
import FormInputNumber from 'components/common/FormInputNumber';
import Unit from 'components/common/Unit';

const Styled = {
  Summary: styled.div`
    margin: 20px 0 30px;
  `,
  Small: styled(Small)`
    color: ${props => props.theme.colors.gray};
  `,
};

const RenewAccountForm: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.account.RenewAccountForm');
  const { renewAccountView } = useStore();

  const { Summary, Small } = Styled;
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
      </Summary>
      <FormField
        label={l('expiryBlocks')}
        info={<BlockTime blocks={renewAccountView.expiryBlocks} />}
      >
        <FormInputNumber
          label={l('expiryBlocks')}
          extra="blocks"
          value={renewAccountView.expiryBlocks}
          onChange={renewAccountView.setExpiryBlocks}
        />
      </FormField>
      <FormField label={l(`satsPerVbyteLabel`)}>
        <FormInputNumber
          label={l(`satsPerVbyteLabel`)}
          placeholder={l('satsPerVbytePlaceholder')}
          extra="sats/vByte"
          value={renewAccountView.satsPerVbyte}
          onChange={renewAccountView.setSatsPerVbyte}
        />
      </FormField>
      <SummaryItem>
        <Button ghost borderless onClick={renewAccountView.cancel}>
          {l('common.cancel')}
        </Button>
        <Button
          primary
          ghost
          disabled={!renewAccountView.isValid}
          onClick={renewAccountView.confirm}
        >
          {l('renew')}
        </Button>
      </SummaryItem>
    </>
  );
};

export default observer(RenewAccountForm);
