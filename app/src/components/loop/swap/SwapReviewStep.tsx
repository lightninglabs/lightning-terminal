import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Title, XLargeText } from 'components/common/text';
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
        <StepSummary
          title={l('title')}
          heading={l('heading')}
          description={l('description')}
        />
      </Summary>
      <Invoice>
        <div>
          <InvoiceRow>
            <Title>{l('amount', { type: buildSwapStore.direction })}</Title>
            <span>{buildSwapStore.amount.toLocaleString()} SAT</span>
          </InvoiceRow>
          <InvoiceRow>
            <Title>{l('fees')}</Title>
            <span>{buildSwapStore.feesLabel}</span>
          </InvoiceRow>
          <Divider />
          <InvoiceRow>
            <Title>{l('total')}</Title>
            <XLargeText>{buildSwapStore.invoiceTotal.toLocaleString()} SAT</XLargeText>
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
