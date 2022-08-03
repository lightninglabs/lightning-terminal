import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import nodeConnectSvg from 'assets/images/lightning-node-connect.svg';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { BoltOutlined, Copy, DisplayLarge, QRCode } from 'components/base';
import AddSession from './AddSession';
import PurpleButton from './PurpleButton';
import QRCodeModal from './QRCodeModal';
import SessionList from './SessionList';

const Styled = {
  Wrapper: styled.section`
    padding-top: 80px;
  `,
  Description: styled.div`
    margin-bottom: 32px;
  `,
  Actions: styled.div`
    > a,
    > button {
      margin-right: 16px;
    }
  `,
  Divider: styled.div`
    max-width: 640px;
    border: 1px solid #384770;
    margin: 32px 0;
  `,
};

const ConnectPage: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.connect.ConnectPage');
  const [showQR, setShowQR] = useState(false);
  const { sessionStore } = useStore();

  const toggleQRModal = useCallback(() => setShowQR(v => !v), []);

  const { Wrapper, Description, Actions, Divider } = Styled;
  return !sessionStore.hasMultiple ? (
    <Wrapper>
      <img src={nodeConnectSvg} alt={l('pageTitle')} />
      <DisplayLarge space={16}>{l('pageTitle')}</DisplayLarge>
      <Description>
        {l('description1')}
        <br />
        {l('description2')}
      </Description>
      <Actions>
        <a href={sessionStore.firstSessionTerminalUrl} target="_blank" rel="noreferrer">
          <PurpleButton>
            <BoltOutlined />
            {l('connectTerminalBtn')}
          </PurpleButton>
        </a>
        <PurpleButton secondary onClick={sessionStore.copyFirstPhrase}>
          <Copy />
          {l('copyPhraseBtn')}
        </PurpleButton>
        <PurpleButton secondary onClick={toggleQRModal}>
          <QRCode />
          {l('generateQrBtn')}
        </PurpleButton>
        <QRCodeModal
          url={sessionStore.firstSessionTerminalUrl}
          visible={showQR}
          onClose={toggleQRModal}
        />
      </Actions>
      <Divider />
      <Description>{l('addlDesc')}</Description>
      <AddSession />
    </Wrapper>
  ) : (
    <Wrapper>
      <DisplayLarge space={16}>{l('pageTitle')}</DisplayLarge>
      <Description>{l('description1')}</Description>
      <AddSession primary />
      <SessionList />
    </Wrapper>
  );
};

export default observer(ConnectPage);
