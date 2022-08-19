import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import DashUX from 'assets/images/home_dash_ss.png';
import LoopUX from 'assets/images/home_loop_ss.png';
import { ReactComponent as Youtube } from 'assets/images/youtube.svg';
import { usePrefixedTranslation } from 'hooks';
import { useStore } from 'store';
import {
  BoltOutlined,
  Button,
  Column,
  Display,
  Paragraph,
  QRCode,
  Row,
} from 'components/base';
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
  YoutubeButton: styled(Button)`
    font-family: ${props => props.theme.fonts.open.semiBold};
    padding-left: 0;

    svg {
      margin-right: 16px;
    }
  `,
  Column: styled(Column)`
    max-width: 480px;
  `,
  Image: styled.img`
    width: 100%;
    margin-bottom: 24px;
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

  const { Wrapper, PurpleButton, YoutubeButton, Column, Image } = Styled;
  return (
    <Wrapper>
      <Display semiBold space={16}>
        {l('pageTitle')}
      </Display>
      <Paragraph space={32}>{l('connectDesc')}</Paragraph>
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
      <Paragraph space={32}>{l('learnDesc')}</Paragraph>
      <Paragraph space={40}>
        <YoutubeButton ghost borderless compact onClick={toggleVideoModal}>
          <Youtube />
          Learn More
        </YoutubeButton>
      </Paragraph>
      <Display semiBold space={16}>
        {l('whatsDiff')}
      </Display>
      <Paragraph space={24}>{l('diffDesc')}</Paragraph>
      <Row>
        <Column>
          <Image src={LoopUX} alt={l('loopTitle')} />
          <Paragraph semiBold space={8}>
            {l('loopTitle')}
          </Paragraph>
          <Paragraph muted>{l('loopDesc')}</Paragraph>
        </Column>
        <Column>
          <Image src={DashUX} alt={l('dashTitle')} />
          <Paragraph semiBold space={8}>
            {l('dashTitle')}
          </Paragraph>
          <Paragraph muted>{l('dashDesc')}</Paragraph>
        </Column>
      </Row>
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
