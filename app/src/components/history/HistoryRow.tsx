import React, { CSSProperties } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Swap } from 'store/models';
import { Column, HelpCircle, Row } from 'components/base';
import SortableHeader from 'components/common/SortableHeader';
import Tip from 'components/common/Tip';
import Unit from 'components/common/Unit';
import SwapDot from 'components/loop/SwapDot';

/**
 * the virtualized list requires each row to have a specified
 * height. Defining a const here because it is used in multiple places
 */
export const ROW_HEIGHT = 60;

const Styled = {
  Row: styled(Row)`
    border-bottom: 0.5px solid ${props => props.theme.colors.lightBlue};

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

const RowHeader: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.history.HistoryRowHeader');
  const { settingsStore } = useStore();

  const { HeaderRow, ActionColumn, HeaderColumn } = Styled;
  return (
    <HeaderRow>
      <ActionColumn />
      <HeaderColumn cols={3}>
        <SortableHeader<Swap>
          field="stateLabel"
          sort={settingsStore.historySort}
          onSort={settingsStore.setHistorySort}
        >
          {l('status')}
        </SortableHeader>
      </HeaderColumn>
      <HeaderColumn>
        <SortableHeader<Swap>
          field="typeName"
          sort={settingsStore.historySort}
          onSort={settingsStore.setHistorySort}
        >
          {l('type')}
        </SortableHeader>
      </HeaderColumn>
      <HeaderColumn right>
        <SortableHeader<Swap>
          field="amount"
          sort={settingsStore.historySort}
          onSort={settingsStore.setHistorySort}
        >
          {l('amount')}
        </SortableHeader>
      </HeaderColumn>
      <HeaderColumn right>
        <SortableHeader<Swap>
          field="initiationTime"
          sort={settingsStore.historySort}
          onSort={settingsStore.setHistorySort}
        >
          {l('created')}
        </SortableHeader>
      </HeaderColumn>
      <HeaderColumn right>
        <SortableHeader<Swap>
          field="lastUpdateTime"
          sort={settingsStore.historySort}
          onSort={settingsStore.setHistorySort}
        >
          {l('updated')}
        </SortableHeader>
      </HeaderColumn>
    </HeaderRow>
  );
};

export const HistoryRowHeader = observer(RowHeader);

interface Props {
  swap: Swap;
  style?: CSSProperties;
}

const HistoryRow: React.FC<Props> = ({ swap, style }) => {
  const { l } = usePrefixedTranslation('cmps.history.HistoryRow');
  const { Row, Column, ActionColumn } = Styled;
  return (
    <Row style={style}>
      <ActionColumn>
        <SwapDot swap={swap} />
      </ActionColumn>
      <Column cols={3}>
        {swap.stateLabel !== 'Failed' ? (
          swap.stateLabel
        ) : (
          <>
            {swap.failureLabel}
            <Tip
              overlay={l(`failure-${swap.failureReason}`)}
              capitalize={false}
              maxWidth={300}
            >
              <span>
                <HelpCircle />
              </span>
            </Tip>
          </>
        )}
      </Column>
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
