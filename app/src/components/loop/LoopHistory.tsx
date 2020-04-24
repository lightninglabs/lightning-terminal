import React from 'react';
import { Swap } from 'types/state';
import { Column, Row } from 'components/common/grid';
import { SmallText } from 'components/common/text';
import { styled } from 'components/theme';

const Styled = {
  RightColumn: styled(Column)`
    text-align: right;
  `,
  SmallText: styled(SmallText)`
    line-height: 1;
  `,
};

interface Props {
  swaps: Swap[];
}

const LoopHistory: React.FC<Props> = ({ swaps }) => {
  const recentSwaps = swaps.slice(0, 2);

  const { RightColumn, SmallText } = Styled;
  return (
    <>
      {recentSwaps.map(swap => (
        <Row key={swap.id}>
          <Column cols={6}>
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

export default LoopHistory;
