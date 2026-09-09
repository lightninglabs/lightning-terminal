import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import { AUTO_COLLAPSE_MAX_WIDTH } from 'store/stores/settingsStore';
import { BoltOutlined, Button, QRCode } from 'components/base';
import { Display, Paragraph } from 'components/common/v2/Text';
import PurpleButton from 'components/connect/PurpleButton';
import QRCodeModal from 'components/connect/QRCodeModal';
import YoutubeModal from './YoutubeModal';

const Styled = {
  Wrapper: styled.div`
    /* while the sidebar is collapsed its toggle floats over the top of the page and
       the layout reserves space for it, so only a small amount of padding is added on
       top of that. the full padding is restored once the sidebar is displayed
       alongside the content again */
    padding: 16px 0 40px;

    @media (min-width: ${AUTO_COLLAPSE_MAX_WIDTH + 1}px) {
      padding: 72px 0;
    }
  `,
  /* the connect buttons wrap onto multiple lines when the page is too narrow to fit
     them all on one line */
  Buttons: styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 16px 24px;
  `,
  PurpleButton: styled(PurpleButton)`
    font-size: ${props => props.theme.sizes.s};
    line-height: 24px;
    padding: 8px 16px;
  `,
  /* a text button which sits inline at the end of the description paragraph */
  LearnMoreButton: styled(Button)`
    font-family: ${props => props.theme.fonts.open.semiBold};
    /* inherit the metrics of the paragraph, which change on smaller screens */
    font-size: inherit;
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

  const { Wrapper, Buttons, PurpleButton, LearnMoreButton } = Styled;
  return (
    <Wrapper>
      <Display semiBold space={16}>
        {l('pageTitle')}
      </Display>
      <Paragraph space={24} desktopSpace={32}>
        {l('connectDesc')}
        <LearnMoreButton ghost borderless compact onClick={toggleVideoModal}>
          {l('learnMore')}
        </LearnMoreButton>
      </Paragraph>
      <Buttons>
        <PurpleButton onClick={sessionStore.connectToTerminalWeb}>
          <BoltOutlined />
          {l('connectTerminalBtn')}
        </PurpleButton>
        <PurpleButton secondary onClick={openQRModal}>
          <QRCode />
          {l('connectQrBtn')}
        </PurpleButton>
      </Buttons>
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
