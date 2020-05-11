import React from 'react';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import Range from 'components/common/Range';
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
  Config: styled.div`
    flex-grow: 3;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  `,
};

interface Props {
  amount: number;
  minAmount: number;
  maxAmount: number;
  onAmountChange: (amount: number) => void;
  channelCount: number;
  onNext: () => void;
  onCancel: () => void;
}

const SwapConfigStep: React.FC<Props> = ({
  amount,
  minAmount,
  maxAmount,
  onAmountChange,
  channelCount,
  onNext,
  onCancel,
}) => {
  const { l } = usePrefixedTranslation('cmps.loop.swap.SwapConfigStep');

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
        <Range
          showRadios
          value={amount}
          min={minAmount}
          max={maxAmount}
          step={10000}
          onChange={onAmountChange}
        />
        <StepButtons onCancel={onCancel} onNext={onNext} />
      </Config>
    </Wrapper>
  );
};

export default SwapConfigStep;
