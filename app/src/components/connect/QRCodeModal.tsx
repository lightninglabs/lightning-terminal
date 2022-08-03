import React from 'react';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import QRCodeImg from 'qrcode.react';
import { Paragraph } from 'components/base';
import Modal from 'components/common/Modal';

const Styled = {
  QRWrap: styled.div`
    display: inline-block;
    padding: 8px 8px 0;
    background-color: ${props => props.theme.colors.white};
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
        <QRCodeImg value={url} size={500} />
      </QRWrap>
    </Modal>
  );
};

export default QRCodeModal;
