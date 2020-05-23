import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from 'store';
import { Column, Row } from 'components/common/grid';
import { Small } from 'components/common/text';
import Unit from 'components/common/Unit';
import { styled } from 'components/theme';
import SwapDot from './SwapDot';

const Styled = {
  RightColumn: styled(Column)`
    text-align: right;
  `,
  SmallText: styled(Small)`
    display: inline-block;
    line-height: 1;
    margin-left: 10px;
    margin-bottom: 0;
  `,
};

const LoopHistory: React.FC = () => {
  const store = useStore();

  const { RightColumn, SmallText } = Styled;
  return (
    <>
      {store.swapStore.lastTwoSwaps.map(swap => (
        <Row key={swap.id}>
          <Column cols={6}>
            <SwapDot swap={swap} />
            <SmallText>{swap.createdOn.toLocaleDateString()}</SmallText>
          </Column>
          <RightColumn cols={6}>
            <SmallText>
              <Unit sats={swap.amount} />
            </SmallText>
          </RightColumn>
        </Row>
      ))}
    </>
  );
};

export default observer(LoopHistory);
