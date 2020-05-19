import React from 'react';
import { observer } from 'mobx-react-lite';
import { Swap } from 'store/models';
import { Title } from 'components/common/text';
import { styled } from 'components/theme';
import SwapDot from '../SwapDot';

const Styled = {
  Wrapper: styled.div`
    display: flex;
  `,
  Dot: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 20px;
  `,
  Details: styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  `,
};

interface Props {
  swap: Swap;
}

const SwapInfo: React.FC<Props> = ({ swap }) => {
  const { Wrapper, Dot, Details } = Styled;
  return (
    <Wrapper>
      <Dot>
        <SwapDot swap={swap} />
      </Dot>
      <Details>
        <Title>{swap.idEllipsed}</Title>
        <div>{swap.amount.toLocaleString()} SAT</div>
      </Details>
    </Wrapper>
  );
};

export default observer(SwapInfo);
