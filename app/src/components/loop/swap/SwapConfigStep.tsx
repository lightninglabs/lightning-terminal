import React from 'react';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import StepButtons from './StepButtons';
import StepSummary from './StepSummary';

const Styled = {
  Wrapper: styled.div`
    flex-grow: 1;
    display: flex;
    justify-content: space-between;
  `,
  Summary: styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  `,
  Config: styled.div`
    flex-grow: 2;
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

const SwapConfigStep: React.FC<Props> = ({ channelCount, onNext, onCancel }) => {
  const { l } = usePrefixedTranslation('cmps.loop.swaps.SwapConfigStep');

  const { Wrapper, Summary, Config } = Styled;
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
      <Config>
        <div>Slider</div>
        <StepButtons onCancel={onCancel} onNext={onNext} />
      </Config>
    </Wrapper>
  );
};

export default SwapConfigStep;
