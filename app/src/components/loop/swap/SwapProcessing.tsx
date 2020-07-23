import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import Loading from 'components/common/Loading';
import { styled } from 'components/theme';

const Styled = {
  Wrapper: styled.div`
    flex-grow: 1;
    display: flex;
    justify-content: space-between;
    padding-top: 5px;
  `,
};

const SwapProcessingStep: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.loop.swap.SwapProcessingStep');

  const { Wrapper } = Styled;
  return (
    <Wrapper data-tour="loop-progress">
      <Loading message={l('loadingMsg')} />
    </Wrapper>
  );
};

export default observer(SwapProcessingStep);
