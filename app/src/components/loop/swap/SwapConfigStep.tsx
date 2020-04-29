import React from 'react';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
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
  Config: styled.div``,
};

interface Props {
  channelCount: number;
  onNext: () => void;
}

const SwapConfigStep: React.FC<Props> = ({ channelCount, onNext }) => {
  const { l } = usePrefixedTranslation('cmps.loop.swaps.SwapConfigStep');

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
        Swap Config Step
        <button onClick={onNext}>next</button>
      </div>
    </Wrapper>
  );
};

export default SwapConfigStep;
