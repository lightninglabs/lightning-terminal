import React, { CSSProperties, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Session } from 'store/models';
import { Column, Copy, Row } from 'components/base';
import SortableHeader from 'components/common/SortableHeader';
import Tip from 'components/common/Tip';

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
    max-width: 70px;
    padding: 0 20px;
    line-height: ${ROW_HEIGHT}px;

    & > svg {
      border-radius: 10px;
    }
  `,
};

const RowHeader: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.connect.SessionRowHeader');
  const { settingsStore } = useStore();

  const { HeaderRow, ActionColumn, HeaderColumn } = Styled;
  return (
    <HeaderRow>
      <ActionColumn />
      <HeaderColumn cols={3}>
        <SortableHeader<Session>
          field="label"
          sort={settingsStore.sessionSort}
          onSort={settingsStore.setSessionSort}
        >
          {l('label')}
        </SortableHeader>
      </HeaderColumn>
      <HeaderColumn>
        <SortableHeader<Session>
          field="type"
          sort={settingsStore.sessionSort}
          onSort={settingsStore.setSessionSort}
        >
          {l('type')}
        </SortableHeader>
      </HeaderColumn>
      <HeaderColumn right>
        <SortableHeader<Session>
          field="state"
          sort={settingsStore.sessionSort}
          onSort={settingsStore.setSessionSort}
        >
          {l('state')}
        </SortableHeader>
      </HeaderColumn>
      <HeaderColumn right>
        <SortableHeader<Session>
          field="expiry"
          sort={settingsStore.sessionSort}
          onSort={settingsStore.setSessionSort}
        >
          {l('expiry')}
        </SortableHeader>
      </HeaderColumn>
    </HeaderRow>
  );
};

export const SessionRowHeader = observer(RowHeader);

interface Props {
  session: Session;
  style?: CSSProperties;
}

const SessionRow: React.FC<Props> = ({ session, style }) => {
  const { sessionStore } = useStore();

  const handleCopy = useCallback(() => {
    sessionStore.copyPhrase(session.pairingSecretMnemonic);
  }, [session.pairingSecretMnemonic]);

  const { Row, Column, ActionColumn } = Styled;
  return (
    <Row style={style}>
      <ActionColumn>
        <Tip overlay="Copy Pairing Phrase">
          <Copy onClick={handleCopy} />
        </Tip>
      </ActionColumn>
      <Column cols={3}>{session.label}</Column>
      <Column>{session.typeLabel}</Column>
      <Column right>{session.stateLabel}</Column>
      <Column right>{session.expiryLabel}</Column>
    </Row>
  );
};

export default observer(SessionRow);
