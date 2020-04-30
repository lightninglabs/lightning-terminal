import React from 'react';
import { usePrefixedTranslation } from 'hooks';
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
    flex-grow: 2;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  `,
  Invoice: styled.div`
    flex-grow: 3;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  `,
};

interface Props {
  channelCount: number;
  onNext: () => void;
  onCancel: () => void;
}

const SwapReviewStep: React.FC<Props> = ({ channelCount, onNext, onCancel }) => {
  const { l } = usePrefixedTranslation('cmps.loop.swaps.SwapReviewStep');

  const { Wrapper, Summary, Invoice } = Styled;
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
        <div>Invoice Details</div>
        <StepButtons onCancel={onCancel} onNext={onNext} />
      </Invoice>
    </Wrapper>
  );
};

export default SwapReviewStep;
