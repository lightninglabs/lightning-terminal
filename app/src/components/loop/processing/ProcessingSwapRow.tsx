import React from 'react';
import { observer } from 'mobx-react-lite';
import { Swap } from 'store/models';
import { Column, Row } from 'components/common/grid';
import { styled } from 'components/theme';
import FailedSwap from './FailedSwap';
import SwapInfo from './SwapInfo';
import SwapProgress from './SwapProgress';

const Styled = {
  Row: styled(Row)`
    margin-bottom: 10px;
  `,
};

interface Props {
  swap: Swap;
}

const ProcessingSwapRow: React.FC<Props> = ({ swap }) => {
  const { Row } = Styled;
  return (
    <Row>
      <Column cols={2}>
        <SwapInfo swap={swap} />
      </Column>
      <Column>
        {swap.isFailed ? <FailedSwap swap={swap} /> : <SwapProgress swap={swap} />}
      </Column>
    </Row>
  );
};

export default observer(ProcessingSwapRow);
