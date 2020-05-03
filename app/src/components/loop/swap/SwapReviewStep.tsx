import React from 'react';
import { SwapDirection } from 'types/state';
import { usePrefixedTranslation } from 'hooks';
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

interface Props {
  amount: number;
  fee: number;
  direction: SwapDirection;
  channelCount: number;
  onNext: () => void;
  onCancel: () => void;
}

const SwapReviewStep: React.FC<Props> = ({
  amount,
  fee,
  direction,
  channelCount,
  onNext,
  onCancel,
}) => {
  const { l } = usePrefixedTranslation('cmps.loop.swaps.SwapReviewStep');

  const { Wrapper, Summary, Invoice, InvoiceRow, Divider } = Styled;
  return (
    <Wrapper>
      <Summary>
        <StepSummary
          title={l('title')}
          heading={l('heading')}
          description={l('description')}
          channelCount={channelCount}
        />
      </Summary>
      <Invoice>
        <div>
          <InvoiceRow>
            <Title>{l('amount', { type: direction })}</Title>
            <span>{amount.toLocaleString()} SAT</span>
          </InvoiceRow>
          <InvoiceRow>
            <Title>{l('fees')}</Title>
            <span>
              {fee.toLocaleString()} SAT ({((100 * fee) / amount).toFixed(2)}%)
            </span>
          </InvoiceRow>
          <Divider />
          <InvoiceRow>
            <Title>{l('fees')}</Title>
            <XLargeText>{(amount + fee).toLocaleString()} SAT</XLargeText>
          </InvoiceRow>
        </div>
        <StepButtons onCancel={onCancel} onNext={onNext} confirm />
      </Invoice>
    </Wrapper>
  );
};

export default SwapReviewStep;
