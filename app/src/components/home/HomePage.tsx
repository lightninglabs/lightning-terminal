import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { BoltOutlined, Button, Display, Paragraph, QRCode } from 'components/base';
import PurpleButton from 'components/connect/PurpleButton';
import QRCodeModal from 'components/connect/QRCodeModal';
import YoutubeModal from './YoutubeModal';

const Styled = {
  Wrapper: styled.div`
    padding: 72px 0;
  `,
  PurpleButton: styled(PurpleButton)`
    font-size: ${props => props.theme.sizes.s};
    line-height: 24px;
    padding: 8px 16px;
    margin-right: 24px;
  `,
  /* a text button which sits inline at the end of the description paragraph */
  LearnMoreButton: styled(Button)`
    font-family: ${props => props.theme.fonts.open.semiBold};
    line-height: inherit;
    vertical-align: baseline;
    padding: 0;
    margin-left: 8px;
  `,
};

const HomePage: React.FC = () => {
  const { l } = usePrefixedTranslation('cmps.home.HomePage');
  const [qrUrl, setQrUrl] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const { sessionStore } = useStore();

  const openQRModal = useCallback(
    async () => setQrUrl(await sessionStore.getNewSessionUrl()),
    [],
  );
  const closeQRModal = useCallback(() => setQrUrl(''), []);
  const toggleVideoModal = useCallback(() => setShowVideo(v => !v), []);

  const { Wrapper, PurpleButton, LearnMoreButton } = Styled;
  return (
    <Wrapper>
      <Display semiBold space={16}>
        {l('pageTitle')}
      </Display>
      <Paragraph space={32}>
        {l('connectDesc')}
        <LearnMoreButton ghost borderless compact onClick={toggleVideoModal}>
          {l('learnMore')}
        </LearnMoreButton>
      </Paragraph>
      <Paragraph space={40}>
        <PurpleButton onClick={sessionStore.connectToTerminalWeb}>
          <BoltOutlined />
          {l('connectTerminalBtn')}
        </PurpleButton>
        <PurpleButton secondary onClick={openQRModal}>
          <QRCode />
          {l('connectQrBtn')}
        </PurpleButton>
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
