import React from 'react';
import { observer } from 'mobx-react-lite';
import { SwapDirection } from 'types/state';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
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

const SwapConfigStep: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.loop.swap.SwapConfigStep');
  const { buildSwapStore } = useStore();

  const { Wrapper, Summary, Config } = Styled;
  return (
    <Wrapper data-tour="loop-amount">
      <Summary>
        <StepSummary
          title={l('title')}
          heading={l('heading', { type: buildSwapStore.direction })}
          description={
            buildSwapStore.direction === SwapDirection.IN
              ? l('loopInDesc')
              : l('loopOutDesc')
          }
        />
      </Summary>
      <Config>
        <Range
          showRadios
          value={buildSwapStore.amountForSelected}
          min={buildSwapStore.termsForDirection.min}
          max={buildSwapStore.termsForDirection.max}
          step={buildSwapStore.AMOUNT_INCREMENT}
          onChange={buildSwapStore.setAmount}
        />
        <StepButtons
          onCancel={buildSwapStore.cancel}
          onNext={buildSwapStore.goToNextStep}
        />
      </Config>
    </Wrapper>
  );
};

export default observer(SwapConfigStep);
