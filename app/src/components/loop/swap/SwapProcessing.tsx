import React from 'react';
import { observer } from 'mobx-react-lite';
import loadingJson from 'assets/animations/loading.json';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import Animation from 'components/common/Animation';
import { HeaderFour } from 'components/common/text';
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

const SwapProcessingStep: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.loop.swap.SwapProcessingStep');
  const { buildSwapStore } = useStore();

  const { Wrapper, Loader, LoadingMessage, ErrorMessage } = Styled;
  return (
    <Wrapper>
      <Loader animationData={loadingJson} />
      <LoadingMessage>
        <HeaderFour>{l('loadingMsg')}</HeaderFour>
      </LoadingMessage>
      {buildSwapStore.swapError && (
        <ErrorMessage>{buildSwapStore.swapError.message}</ErrorMessage>
      )}
    </Wrapper>
  );
};

export default observer(SwapProcessingStep);
