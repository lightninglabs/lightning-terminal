import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from 'store';
import { Swap } from 'store/models';
import { Close } from 'components/common/icons';
import { styled } from 'components/theme';

const Styled = {
  Wrapper: styled.div`
    height: 100%;
    display: flex;
    align-items: center;
  `,
  Circle: styled.span`
    display: inline-block;
    width: 34px;
    height: 34px;
    text-align: center;
    line-height: 30px;
    background-color: ${props => props.theme.colors.darkGray};
    border-radius: 34px;
    margin-right: 10px;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  `,
  ErrorMessage: styled.span`
    color: ${props => props.theme.colors.pink};
  `,
};

interface Props {
  swap: Swap;
}

const FailedSwap: React.FC<Props> = ({ swap }) => {
  const { swapStore } = useStore();
  const handleCloseClick = useCallback(() => swapStore.dismissSwap(swap.id), [
    swapStore,
    swap,
  ]);

  const { Wrapper, Circle, ErrorMessage } = Styled;
  return (
    <Wrapper>
      <Circle onClick={handleCloseClick}>
        <Close />
      </Circle>
      <ErrorMessage>{swap.stateLabel}</ErrorMessage>
    </Wrapper>
  );
};

export default observer(FailedSwap);
