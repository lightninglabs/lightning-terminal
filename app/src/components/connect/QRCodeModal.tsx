import React from 'react';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import { QRCodeSVG } from 'qrcode.react';
import { Paragraph } from 'components/base';
import Modal from 'components/common/Modal';

const Styled = {
  QRWrap: styled.div`
    display: inline-block;
    max-width: 100%;
    padding: 8px 8px 0;
    background-color: ${props => props.theme.colors.white};

    /* the code is rendered as an svg so that it can scale down to fit inside of the
       modal on narrow screens, instead of being clipped by it */
    > svg {
      display: block;
      width: 500px;
      max-width: 100%;
      height: auto;
    }
  `,
};

interface Props {
  url: string;
  visible: boolean;
  onClose: () => void;
}

const QRCodeModal: React.FC<Props> = ({ url, visible, onClose }) => {
  const { l } = usePrefixedTranslation('cmps.connect.QRCodeModal');
  const { QRWrap } = Styled;
  return (
    <Modal title={l('title')} visible={visible} onClose={onClose}>
      <Paragraph space={32}>{l('desc')}</Paragraph>
      <QRWrap>
        <QRCodeSVG value={url} size={500} />
      </QRWrap>
    </Modal>
  );
};

export default QRCodeModal;
