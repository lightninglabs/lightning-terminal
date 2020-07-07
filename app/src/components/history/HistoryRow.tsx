import React, { CSSProperties } from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { Swap } from 'store/models';
import { Column, HeaderFour, Row } from 'components/base';
import Unit from 'components/common/Unit';
import SwapDot from 'components/loop/SwapDot';
import { styled } from 'components/theme';

/**
 * the virtualized list requires each row to have a specified
 * height. Defining a const here because it is used in multiple places
 */
export const ROW_HEIGHT = 60;

const Styled = {
  Row: styled(Row)`
    border-bottom: 0.5px solid ${props => props.theme.colors.darkGray};

    &:last-child {
      border-bottom-width: 0;
    }
  `,
  HeaderRow: styled(Row)`
    margin-right: 0;
  `,
  HeaderColumn: styled(Column)`
    white-space: nowrap;
    padding: 0 5px;

    &:last-child {
      padding-right: 0;
    }
  `,
  Column: styled(Column)`
    line-height: ${ROW_HEIGHT}px;
    padding: 0 5px;
  `,
  ActionColumn: styled(Column)`
    max-width: 50px;
    padding: 0 20px;
    line-height: ${ROW_HEIGHT}px;
  `,
};

export const HistoryRowHeader: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.history.HistoryRowHeader');
  const { HeaderRow, ActionColumn, HeaderColumn } = Styled;
  return (
    <HeaderRow>
      <ActionColumn />
      <HeaderColumn cols={3}>
        <HeaderFour>{l('status')}</HeaderFour>
      </HeaderColumn>
      <HeaderColumn>
        <HeaderFour>{l('type')}</HeaderFour>
      </HeaderColumn>
      <HeaderColumn right>
        <HeaderFour>{l('amount')}</HeaderFour>
      </HeaderColumn>
      <HeaderColumn right>
        <HeaderFour>{l('created')}</HeaderFour>
      </HeaderColumn>
      <HeaderColumn right>
        <HeaderFour>{l('updated')}</HeaderFour>
      </HeaderColumn>
    </HeaderRow>
  );
};

interface Props {
  swap: Swap;
  style?: CSSProperties;
}

const HistoryRow: React.FC<Props> = ({ swap, style }) => {
  const { Row, Column, ActionColumn } = Styled;
  return (
    <Row style={style}>
      <ActionColumn>
        <SwapDot swap={swap} />
      </ActionColumn>
      <Column cols={3}>{swap.stateLabel}</Column>
      <Column>{swap.typeName}</Column>
      <Column right>
        <Unit sats={swap.amount} suffix={false} />
      </Column>
      <Column right>{swap.createdOnLabel}</Column>
      <Column right>{swap.updatedOnLabel}</Column>
    </Row>
  );
};

export default observer(HistoryRow);
