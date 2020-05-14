import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from 'store';
import { Column, Row } from 'components/common/grid';
import { SmallText } from 'components/common/text';
import { styled } from 'components/theme';
import SwapDot from './SwapDot';

const Styled = {
  RightColumn: styled(Column)`
    text-align: right;
  `,
  SmallText: styled(SmallText)`
    line-height: 1;
    margin-left: 10px;
  `,
};

const LoopHistory: React.FC = () => {
  const store = useStore();

  const { RightColumn, SmallText } = Styled;
  return (
    <>
      {store.swapStore.recentSwaps.map(swap => (
        <Row key={swap.id}>
          <Column cols={6}>
            <SwapDot swap={swap} />
            <SmallText>{swap.createdOn.toLocaleDateString()}</SmallText>
          </Column>
          <RightColumn cols={6}>
            <SmallText>{`${swap.amount.toLocaleString()} SAT`}</SmallText>
          </RightColumn>
        </Row>
      ))}
    </>
  );
};

export default observer(LoopHistory);
