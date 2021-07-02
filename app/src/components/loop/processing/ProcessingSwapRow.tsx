import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { Swap } from 'store/models';
import { Column, Row } from 'components/base';
import FailedSwap from './FailedSwap';
import SwapInfo from './SwapInfo';
import SwapProgress from './SwapProgress';

const Styled = {
  Row: styled(Row)`
    margin-bottom: 10px;
  `,
  InfoCol: styled(Column)`
    min-width: 200px;
  `,
};

interface Props {
  swap: Swap;
}

const ProcessingSwapRow: React.FC<Props> = ({ swap }) => {
  const { Row, InfoCol } = Styled;
  return (
    <Row>
      <InfoCol cols={2}>
        <SwapInfo swap={swap} />
      </InfoCol>
      <Column>
        {swap.isFailed ? <FailedSwap swap={swap} /> : <SwapProgress swap={swap} />}
      </Column>
    </Row>
  );
};

export default observer(ProcessingSwapRow);
