import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from 'store';
import { Swap } from 'store/models';
import { Column, Row } from 'components/common/grid';
import StatusDot from 'components/common/StatusDot';
import { SmallText } from 'components/common/text';
import { styled } from 'components/theme';

const Styled = {
  RightColumn: styled(Column)`
    text-align: right;
  `,
  SmallText: styled(SmallText)`
    line-height: 1;
    margin-left: 10px;
  `,
};

const SwapDot: React.FC<{ swap: Swap }> = observer(({ swap }) => {
  switch (swap.stateLabel) {
    case 'Success':
      return <StatusDot status="success" />;
    case 'Failed':
      return <StatusDot status="error" />;
    default:
      return <StatusDot status="warn" />;
  }
});

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
