import React from 'react';
import styled from '@emotion/styled';
import { usePrefixedTranslation } from 'hooks';
import Modal from 'components/common/Modal';

const Styled = {
  VideoModal: styled(Modal)`
    width: 800px;
    max-width: 90%;
    overflow: hidden;
  `,
  VideoWrap: styled.div`
    position: relative;
    padding-bottom: 56.25%; /* 16:9 */
    height: 0;

    > iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  `,
};

interface Props {
  videoId: string;
  visible: boolean;
  onClose: () => void;
}

const YoutubeModal: React.FC<Props> = ({ videoId, visible, onClose }) => {
  const { l } = usePrefixedTranslation('cmps.home.YoutubeModal');
  const { VideoModal, VideoWrap } = Styled;
  return (
    <VideoModal title={l('title')} visible={visible} onClose={onClose}>
      <VideoWrap>
        <iframe
          width="568"
          height="315"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </VideoWrap>
    </VideoModal>
  );
};

export default YoutubeModal;
