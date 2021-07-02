import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { Swap } from 'store/models';
import { HeaderFour } from 'components/base';
import Tip from 'components/common/Tip';
import Unit from 'components/common/Unit';
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
        <HeaderFour marginless>
          <Tip overlay={swap.id}>
            <span>{swap.ellipsedId}</span>
          </Tip>
        </HeaderFour>
        <div>
          <Unit sats={swap.amount} />
        </div>
      </Details>
    </Wrapper>
  );
};

export default observer(SwapInfo);
