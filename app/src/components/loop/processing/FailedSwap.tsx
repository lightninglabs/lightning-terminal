import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Swap } from 'store/models';
import { Close } from 'components/base';
import Tip from 'components/common/Tip';

const Styled = {
  Wrapper: styled.div`
    height: 100%;
    display: flex;
    align-items: center;
  `,
  CloseIcon: styled(Close)`
    background-color: ${props => props.theme.colors.gray};
    margin-right: 10px;
  `,
  ErrorMessage: styled.span`
    color: ${props => props.theme.colors.pink};
  `,
};

interface Props {
  swap: Swap;
}

const FailedSwap: React.FC<Props> = ({ swap }) => {
  const { l } = usePrefixedTranslation('cmps.loop.processing.FailedSwap');

  const { swapStore } = useStore();
  const handleCloseClick = useCallback(() => swapStore.dismissSwap(swap.id), [
    swapStore,
    swap,
  ]);

  const { Wrapper, CloseIcon, ErrorMessage } = Styled;
  return (
    <Wrapper>
      <Tip overlay={l('dismissTip')}>
        <CloseIcon onClick={handleCloseClick} />
      </Tip>
      <ErrorMessage>{swap.stateLabel}</ErrorMessage>
    </Wrapper>
  );
};

export default observer(FailedSwap);
