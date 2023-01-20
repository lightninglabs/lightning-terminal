import React, { CSSProperties, useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { Session } from 'store/models';
import { BoltOutlined, Close, Column, Copy, QRCode, Row } from 'components/base';
import SortableHeader from 'components/common/SortableHeader';
import Tip from 'components/common/Tip';
import * as LIT from 'types/generated/lit-sessions_pb';
import QRCodeModal from './QRCodeModal';

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
    line-height: ${ROW_HEIGHT}px;

    svg {
      border-radius: 0;
      margin-left: 10%;

      &:hover {
        border-radius: 10px;
      }
    }

    > a {
      color: ${props => props.theme.colors.offWhite};

      &:hover svg {
        color: ${props => props.theme.colors.blue};
        background-color: ${props => props.theme.colors.offWhite};
      }
    }
  `,
  CloseIcon: styled(Close)`
    color: ${props => props.theme.colors.lightningRed};
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
      <HeaderColumn>
        <SortableHeader<Session>
          field="state"
          sort={settingsStore.sessionSort}
          onSort={settingsStore.setSessionSort}
        >
          {l('state')}
        </SortableHeader>
      </HeaderColumn>
      <HeaderColumn>
        <SortableHeader<Session>
          field="expiry"
          sort={settingsStore.sessionSort}
          onSort={settingsStore.setSessionSort}
        >
          {l('expiry')}
        </SortableHeader>
      </HeaderColumn>
      <Column className="col-1" />
    </HeaderRow>
  );
};

export const SessionRowHeader = observer(RowHeader);

interface Props {
  session: Session;
  style?: CSSProperties;
}

const SessionRow: React.FC<Props> = ({ session, style }) => {
  const { l } = usePrefixedTranslation('cmps.connect.SessionRow');
  const [showQR, setShowQR] = useState(false);
  const { sessionStore } = useStore();

  const handleCopy = useCallback(() => {
    sessionStore.copyPhrase(session.label, session.pairingSecretMnemonic);
  }, [session.pairingSecretMnemonic]);

  const handleRevoke = useCallback(() => {
    sessionStore.revokeSession(session);
  }, [session]);

  const toggleQRModal = useCallback(() => setShowQR(v => !v), []);

  const { Row, Column, ActionColumn, CloseIcon } = Styled;
  return (
    <Row style={style}>
      <ActionColumn>
        {session.isPaired ? (
          <>
            <Tip overlay={l('paired')}>
              <BoltOutlined disabled />
            </Tip>
            <Tip overlay={l('paired')}>
              <Copy disabled />
            </Tip>
            <Tip overlay={l('paired')}>
              <QRCode disabled />
            </Tip>
          </>
        ) : session.type === LIT.SessionType.TYPE_MACAROON_ACCOUNT ? (
          <>
            <Tip overlay={l('pairCustodial')}>
              <BoltOutlined disabled />
            </Tip>
            <Tip overlay={l('copy')}>
              <Copy onClick={handleCopy} />
            </Tip>
            <Tip overlay={l('generateQR')}>
              <QRCode onClick={toggleQRModal} />
            </Tip>
          </>
        ) : (
          <>
            <Tip overlay={l('pairTerminal')}>
              <a href={session.terminalConnectUrl} target="_blank" rel="noreferrer">
                <BoltOutlined />
              </a>
            </Tip>
            <Tip overlay={l('copy')}>
              <Copy onClick={handleCopy} />
            </Tip>
            <Tip overlay={l('generateQR')}>
              <QRCode onClick={toggleQRModal} />
            </Tip>
          </>
        )}
        <QRCodeModal
          url={session.terminalConnectUrl}
          visible={showQR}
          onClose={toggleQRModal}
        />
      </ActionColumn>
      <Column cols={3}>{session.label}</Column>
      <Column>{session.typeLabel}</Column>
      <Column>{session.pairedLabel}</Column>
      <Column>{session.expiryLabel}</Column>
      <Column className="col-1" right>
        <Tip overlay={l('revoke')}>
          <CloseIcon size="large" onClick={handleRevoke} />
        </Tip>
      </Column>
    </Row>
  );
};

export default observer(SessionRow);
