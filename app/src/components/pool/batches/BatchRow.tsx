import React, { CSSProperties } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { Batch } from 'store/models';
import { Column, HeaderFour, Row } from 'components/base';
import ExternalLink from 'components/common/ExternalLink';
import Tip from 'components/common/Tip';
import Unit from 'components/common/Unit';
import BatchDeltaIcon from './BatchDeltaIcon';

/**
 * the virtualized list requires each row to have a specified
 * height. Defining a const here because it is used in multiple places
 */
export const ROW_HEIGHT = 60;

const Styled = {
  Row: styled(Row)`
    border-bottom: 0.5px solid rgba(107, 105, 105, 0.4);

    &:last-child {
      border-bottom-width: 0;
    }
    margin-left: 0;
    margin-right: 0;
  `,
  HeaderRow: styled(Row)`
    margin-left: 0;
    margin-right: 0;
  `,
  HeaderColumn: styled(Column)`
    white-space: nowrap;

    &:last-child {
    }
  `,
  Column: styled(Column)`
    line-height: ${ROW_HEIGHT}px;
  `,
  ActionColumn: styled(Column)`
    max-width: 75px;
    line-height: ${ROW_HEIGHT}px;
  `,
};

const RowHeader: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.pool.batches.BatchRowHeader');

  const { HeaderRow, ActionColumn, HeaderColumn } = Styled;
  return (
    <HeaderRow>
      <HeaderColumn>
        <HeaderFour>{l('batchId')}</HeaderFour>
      </HeaderColumn>
      <HeaderColumn>
        <HeaderFour>{l('txId')}</HeaderFour>
      </HeaderColumn>
      <HeaderColumn center>
        <HeaderFour>{l('txFee')}</HeaderFour>
      </HeaderColumn>
      <HeaderColumn center>
        <HeaderFour>{l('numOrders')}</HeaderFour>
      </HeaderColumn>
      <HeaderColumn right>
        <HeaderFour>{l('earned')}</HeaderFour>
      </HeaderColumn>
      <HeaderColumn right>
        <HeaderFour>{l('volume')}</HeaderFour>
      </HeaderColumn>
      <HeaderColumn right>
        <HeaderFour>{l('clearedRate')}</HeaderFour>
      </HeaderColumn>
      <ActionColumn />
    </HeaderRow>
  );
};

export const BatchRowHeader = observer(RowHeader);

interface Props {
  batch: Batch;
  style?: CSSProperties;
}

const BatchRow: React.FC<Props> = ({ batch, style }) => {
  const { Row, Column, ActionColumn } = Styled;
  return (
    <Row style={style}>
      <Column truncate>
        <Tip overlay={batch.batchId} capitalize={false}>
          <span>{batch.batchIdEllipsed}</span>
        </Tip>
      </Column>
      <Column truncate>
        <Tip overlay={batch.batchTxId} capitalize={false}>
          <span>
            <ExternalLink href={batch.batchTxUrl}>{batch.batchTxIdEllipsed}</ExternalLink>
          </span>
        </Tip>
      </Column>
      <Column center>
        <Tip overlay={batch.feeDescription} capitalize={false}>
          <span>{batch.feeLabel}</span>
        </Tip>
      </Column>
      <Column center>{batch.ordersCount}</Column>
      <Column right>
        <Unit sats={batch.earnedSats} suffix={false} />
      </Column>
      <Column right>
        <Unit sats={batch.volume} suffix={false} />
      </Column>
      <Column right>{batch.basisPoints} bps</Column>
      <ActionColumn>
        <BatchDeltaIcon delta={batch.delta} />
      </ActionColumn>
    </Row>
  );
};

export default observer(BatchRow);
