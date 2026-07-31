import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { ReactComponent as Youtube } from 'assets/images/youtube.svg';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { BoltOutlined, Button, Display, Paragraph, QRCode } from 'components/base';
import AddSession from 'components/connect/AddSession';
import PurpleButton from 'components/connect/PurpleButton';
import QRCodeModal from 'components/connect/QRCodeModal';
import SessionList from 'components/connect/SessionList';
import YoutubeModal from './YoutubeModal';

const Styled = {
  Wrapper: styled.div`
    padding: 72px 0;
  `,
  Actions: styled.div`
    display: flex;
    flex-wrap: wrap;
    /* stretch so the buttons are all the same height as the tallest one */
    align-items: stretch;
    margin-bottom: 40px;

    /* size the Create a new session button to match the two connect buttons */
    > button {
      font-size: ${props => props.theme.sizes.s};
      line-height: 24px;
      padding: 8px 16px;
      margin-right: 24px;
    }

    /* the add session form takes over the full row once it is opened */
    > div {
      flex: 1 1 100%;
      margin-top: 16px;
    }
  `,
  PurpleButton: styled(PurpleButton)`
    font-size: ${props => props.theme.sizes.s};
    line-height: 24px;
    padding: 8px 16px;
    margin-right: 24px;
  `,
  YoutubeButton: styled(Button)`
    font-family: ${props => props.theme.fonts.open.semiBold};
    padding-left: 0;

    svg {
      margin-right: 16px;
    }
  `,
};

const HomePage: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.home.HomePage');
  const [qrUrl, setQrUrl] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const { sessionStore } = useStore();

  useEffect(() => {
    sessionStore.fetchSessions();
  }, []);

  const openQRModal = useCallback(
    async () => setQrUrl(await sessionStore.getNewSessionUrl()),
    [],
  );
  const closeQRModal = useCallback(() => setQrUrl(''), []);
  const toggleVideoModal = useCallback(() => setShowVideo(v => !v), []);

  const { Wrapper, Actions, PurpleButton, YoutubeButton } = Styled;
  return (
    <Wrapper>
      <Display semiBold space={16}>
        {l('pageTitle')}
      </Display>
      <Paragraph space={32}>{l('connectDesc')}</Paragraph>
      <Actions>
        <PurpleButton onClick={sessionStore.connectToTerminalWeb}>
          <BoltOutlined />
          {l('connectTerminalBtn')}
        </PurpleButton>
        <PurpleButton secondary onClick={openQRModal}>
          <QRCode />
          {l('connectQrBtn')}
        </PurpleButton>
        <AddSession primary />
      </Actions>
      <SessionList />
      <Paragraph space={40}>
        <YoutubeButton ghost borderless compact onClick={toggleVideoModal}>
          <Youtube />
          Learn More
        </YoutubeButton>
      </Paragraph>
      <QRCodeModal url={qrUrl} visible={!!qrUrl} onClose={closeQRModal} />
      <YoutubeModal
        videoId="5kH1ByxjkTM"
        visible={showVideo}
        onClose={toggleVideoModal}
      />
    </Wrapper>
  );
};

export default observer(HomePage);
