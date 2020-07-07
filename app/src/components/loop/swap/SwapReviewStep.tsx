import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { HeaderFour, Jumbo } from 'components/base';
import Unit from 'components/common/Unit';
import { styled } from 'components/theme';
import StepButtons from './StepButtons';
import StepSummary from './StepSummary';

const Styled = {
  Wrapper: styled.div`
    flex-grow: 1;
    display: flex;
    justify-content: space-between;
    padding-top: 5px;
  `,
  Summary: styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  `,
  Invoice: styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  `,
  InvoiceRow: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  `,
  Divider: styled.div`
    border-top: 1px solid ${props => props.theme.colors.darkGray};
    margin-bottom: 30px;
  `,
};

const SwapReviewStep: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.loop.swap.SwapReviewStep');
  const { buildSwapStore } = useStore();

  const { Wrapper, Summary, Invoice, InvoiceRow, Divider } = Styled;
  return (
    <Wrapper>
      <Summary>
        <StepSummary title={l('title')} heading={l('heading')} />
      </Summary>
      <Invoice>
        <div>
          <InvoiceRow>
            <HeaderFour marginless>
              {l('amount', { type: buildSwapStore.direction })}
            </HeaderFour>
            <span>
              <Unit sats={buildSwapStore.amount} />
            </span>
          </InvoiceRow>
          <InvoiceRow>
            <HeaderFour marginless>{l('fees')}</HeaderFour>
            <span>{buildSwapStore.feesLabel}</span>
          </InvoiceRow>
          <Divider />
          <InvoiceRow>
            <HeaderFour marginless>{l('total')}</HeaderFour>
            <Jumbo>
              <Unit sats={buildSwapStore.invoiceTotal} />
            </Jumbo>
          </InvoiceRow>
        </div>
        <StepButtons
          confirm
          onCancel={buildSwapStore.cancel}
          onNext={buildSwapStore.goToNextStep}
        />
      </Invoice>
    </Wrapper>
  );
};

export default observer(SwapReviewStep);
