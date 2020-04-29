import React from 'react';
import { usePrefixedTranslation } from 'hooks';
import { styled } from 'components/theme';
import StepSummary from './StepSummary';

const Styled = {
  Wrapper: styled.div`
    flex-grow: 1;
    display: flex;
    justify-content: space-between;
  `,
  Summary: styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    max-width: 240px;
  `,
};

interface Props {
  channelCount: number;
  onNext: () => void;
}

const SwapReviewStep: React.FC<Props> = ({ channelCount, onNext }) => {
  const { l } = usePrefixedTranslation('cmps.loop.swaps.SwapReviewStep');

  const { Wrapper, Summary } = Styled;
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
      <div>
        Swap Review Step
        <button onClick={onNext}>next</button>
      </div>
    </Wrapper>
  );
};

export default SwapReviewStep;
