import React from 'react';
import loadingJson from 'assets/animations/loading.json';
import { usePrefixedTranslation } from 'hooks';
import Animation from 'components/common/Animation';
import { Title } from 'components/common/text';
import { styled } from 'components/theme';

const Styled = {
  Wrapper: styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `,
  Loader: styled(Animation)`
    width: 150px;
    height: 150px;
  `,
  LoadingMessage: styled.div`
    text-align: center;
  `,
  ErrorMessage: styled.div`
    padding: 10px;
    color: red;
  `,
};

interface Props {
  swapError?: Error;
}

const SwapProcessingStep: React.FC<Props> = ({ swapError }) => {
  const { l } = usePrefixedTranslation('cmps.loop.swap.SwapProcessingStep');
  const { Wrapper, Loader, LoadingMessage, ErrorMessage } = Styled;
  return (
    <Wrapper>
      <Loader animationData={loadingJson} />
      <LoadingMessage>
        <Title>{l('loadingMsg')}</Title>
      </LoadingMessage>
      {swapError && <ErrorMessage>{swapError.message}</ErrorMessage>}
    </Wrapper>
  );
};

export default SwapProcessingStep;
