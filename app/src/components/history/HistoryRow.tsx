import React, { CSSProperties } from 'react';
import { observer } from 'mobx-react-lite';
import { usePrefixedTranslation } from 'hooks';
import { Swap } from 'store/models';
import { Column, Row } from 'components/common/grid';
import { Title } from 'components/common/text';
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
  Column: styled(Column)`
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: ${ROW_HEIGHT}px;
  `,
  StatusTitle: styled(Title)`
    margin-left: 35px;
  `,
  StatusIcon: styled.span`
    display: inline-block;
    margin-right: 20px;
  `,
};

export const HistoryRowHeader: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.history.HistoryRowHeader');
  const { StatusTitle } = Styled;
  return (
    <Row>
      <Column>
        <StatusTitle>{l('status')}</StatusTitle>
      </Column>
      <Column>
        <Title>{l('type')}</Title>
      </Column>
      <Column>
        <Title>{l('amount')} (sats)</Title>
      </Column>
      <Column right>
        <Title>{l('created')}</Title>
      </Column>
      <Column right>
        <Title>{l('updated')}</Title>
      </Column>
    </Row>
  );
};

interface Props {
  swap: Swap;
  style?: CSSProperties;
}

const HistoryRow: React.FC<Props> = ({ swap, style }) => {
  const { Row, Column, StatusIcon } = Styled;
  return (
    <Row style={style}>
      <Column>
        <StatusIcon>
          <SwapDot swap={swap} />
        </StatusIcon>
        {swap.stateLabel}
      </Column>
      <Column>{swap.typeName}</Column>
      <Column>{swap.amount.toLocaleString()}</Column>
      <Column right>
        {swap.createdOn.toLocaleDateString()} {swap.createdOn.toLocaleTimeString()}
      </Column>
      <Column right>
        {swap.updatedOn.toLocaleDateString()} {swap.updatedOn.toLocaleTimeString()}
      </Column>
    </Row>
  );
};

export default observer(HistoryRow);
