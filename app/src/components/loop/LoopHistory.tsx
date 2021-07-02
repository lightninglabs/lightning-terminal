import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Column, Row, Small } from 'components/base';
import Unit from 'components/common/Unit';
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
  const { l } = usePrefixedTranslation('cmps.loop.LoopHistory');
  const { swapStore } = useStore();

  const { RightColumn, SmallText } = Styled;
  return (
    <>
      {swapStore.lastTwoSwaps.length === 0 && <Small>{l('emptyMsg')}</Small>}
      {swapStore.lastTwoSwaps.map(swap => (
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
